import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const govRawDir = path.join(dataDir, 'gov-raw');
if (!fs.existsSync(govRawDir)) {
  fs.mkdirSync(govRawDir, { recursive: true });
}

const resourceId = '9ef84268-d588-465a-a308-a864a43d0070';
const apiKey = process.env.DATA_GOV_API_KEY || process.env.DATA_GOVIN_API_KEY || '579b464db66ec23bdd00000119f3f71a11ba4a67695e5b8a24f75b0a';

const ALL_INDIA_36_STATES_UTS = [
  // 28 States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Keralam", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // 8 Union Territories
  "Andaman and Nicobar", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Pondicherry"
];

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchPage(offset, limit) {
  const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=${limit}&offset=${offset}`;
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    https.get(url, { headers: { 'User-Agent': 'Farmezy/2.0 (All-India AGMARKNET Sync)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ json, duration: Date.now() - startTime, rawLength: data.length });
        } catch (e) {
          reject(new Error(`JSON Parse Error: ${e.message} (HTTP ${res.statusCode})`));
        }
      });
    }).on('error', reject);
  });
}

async function runNationalSync() {
  console.log('===============================================================');
  console.log('STARTING COMPLETE ALL-INDIA AGMARKNET GOVERNMENT SYNCHRONIZATION');
  console.log('Resource ID:', resourceId);
  console.log('API Target: api.data.gov.in');
  console.log('Scope: National (All 28 States & 8 Union Territories)');
  console.log('===============================================================\n');

  const startIso = new Date().toISOString();
  console.log(`[1] API Request Start Time: ${startIso}`);

  let offset = 0;
  const pageSize = 1000;
  let reportedTotal = null;
  const downloadedRecords = [];
  const pageLogs = [];
  let pageNumber = 1;

  while (true) {
    console.log(`Fetching Page ${pageNumber} (Offset: ${offset}, Limit: ${pageSize})...`);
    try {
      const { json, duration, rawLength } = await fetchPage(offset, pageSize);

      if (reportedTotal === null) {
        reportedTotal = Number(json.total);
        console.log(`Official Government Total Available Records: ${reportedTotal}`);
      }

      const records = Array.isArray(json.records) ? json.records : [];
      console.log(`✓ Page ${pageNumber} Downloaded: ${records.length} records in ${duration}ms (Payload: ${(rawLength / 1024).toFixed(1)} KB)`);

      // Save raw page payload to govRawDir
      const rawPageFile = path.join(govRawDir, `page-${pageNumber}-offset-${offset}.json`);
      fs.writeFileSync(rawPageFile, JSON.stringify(json, null, 2), 'utf8');

      pageLogs.push({
        page: pageNumber,
        offset,
        limit: pageSize,
        records_received: records.length,
        duration_ms: duration,
        status: 'SUCCESS'
      });

      downloadedRecords.push(...records);
      offset += records.length;

      if (records.length === 0 || offset >= reportedTotal || records.length < pageSize) {
        console.log(`Pagination successfully completed at Page ${pageNumber}.`);
        break;
      }

      pageNumber++;
    } catch (err) {
      console.error(`✗ Error on Page ${pageNumber}: ${err.message}`);
      pageLogs.push({
        page: pageNumber,
        offset,
        limit: pageSize,
        error: err.message,
        status: 'FAILED'
      });
      break;
    }
  }

  const completionIso = new Date().toISOString();
  console.log(`\n[2] API Request Completion Time: ${completionIso}`);

  const isPaginationComplete = downloadedRecords.length === reportedTotal;
  console.log(`[3] Pagination Verification:`);
  console.log(`    - Total Records Reported by Gov API: ${reportedTotal}`);
  console.log(`    - Total Records Downloaded: ${downloadedRecords.length}`);
  console.log(`    - Total Pages Requested & Completed: ${pageLogs.length}`);
  console.log(`    - Complete Match: ${isPaginationComplete ? 'YES (100% COMPLETE)' : 'NO'}`);

  // Analyze the downloaded live session
  const reportingStatesLive = new Set();
  const reportingDistrictsLive = new Set();
  const reportingMandisLive = new Set();
  const reportingCommoditiesLive = new Set();
  const reportingVarietiesLive = new Set();
  const arrivalDatesLive = new Set();

  downloadedRecords.forEach(r => {
    if (r.state) reportingStatesLive.add(r.state);
    if (r.state && r.district) reportingDistrictsLive.add(`${r.state}::${r.district}`);
    if (r.market) reportingMandisLive.add(r.market);
    if (r.commodity) reportingCommoditiesLive.add(r.commodity);
    if (r.commodity && r.variety) reportingVarietiesLive.add(`${r.commodity}::${r.variety}`);
    if (r.arrival_date) arrivalDatesLive.add(r.arrival_date);
  });

  const zeroReportingStatesLive = ALL_INDIA_36_STATES_UTS.filter(s => {
    const sNorm = norm(s);
    return !Array.from(reportingStatesLive).some(r => norm(r) === sNorm || norm(r).includes(sNorm) || sNorm.includes(norm(r)));
  });

  // Save the live government response to partial-mandi-sync.json
  const partialSyncPath = path.join(dataDir, 'partial-mandi-sync.json');
  const liveSyncReport = {
    request_start_time: startIso,
    request_completion_time: completionIso,
    resource_id: resourceId,
    api_source: 'Government of India (AGMARKNET / data.gov.in)',
    government_api_total_records: reportedTotal,
    downloaded_records_count: downloadedRecords.length,
    pages_downloaded: pageLogs.length,
    pagination_complete: isPaginationComplete,
    reporting_states_count: reportingStatesLive.size,
    reporting_states: Array.from(reportingStatesLive).sort(),
    zero_reporting_states_count: zeroReportingStatesLive.length,
    zero_reporting_states: zeroReportingStatesLive,
    reporting_districts_count: reportingDistrictsLive.size,
    unique_mandis_count: reportingMandisLive.size,
    commodities_with_current_prices_count: reportingCommoditiesLive.size,
    commodity_variety_combinations_count: reportingVarietiesLive.size,
    latest_arrival_dates: Array.from(arrivalDatesLive).sort().reverse(),
    pages_log: pageLogs,
    records: downloadedRecords
  };

  fs.writeFileSync(partialSyncPath, JSON.stringify(liveSyncReport, null, 2), 'utf8');
  console.log(`\n✓ Live government response saved to: ${partialSyncPath}`);

  // Now inspect the active national dataset (current-mandi-prices.json)
  const currentPricesPath = path.join(dataDir, 'current-mandi-prices.json');
  const activeDataset = JSON.parse(fs.readFileSync(currentPricesPath, 'utf8'));
  const activeRecords = Array.isArray(activeDataset) ? activeDataset : (activeDataset.records || []);

  const reportingStatesActive = new Set();
  const reportingDistrictsActive = new Set();
  const reportingMandisActive = new Set();
  const reportingCommoditiesActive = new Set();
  const reportingVarietiesActive = new Set();
  const arrivalDatesActive = new Set();

  activeRecords.forEach(r => {
    if (r.state) reportingStatesActive.add(r.state);
    if (r.state && r.district) reportingDistrictsActive.add(`${r.state}::${r.district}`);
    if (r.market) reportingMandisActive.add(r.market);
    if (r.commodity) reportingCommoditiesActive.add(r.commodity);
    if (r.commodity && r.variety) reportingVarietiesActive.add(`${r.commodity}::${r.variety}`);
    if (r.arrival_date) arrivalDatesActive.add(r.arrival_date);
  });

  const zeroReportingStatesActive = ALL_INDIA_36_STATES_UTS.filter(s => {
    const sNorm = norm(s);
    return !Array.from(reportingStatesActive).some(r => norm(r) === sNorm || norm(r).includes(sNorm) || sNorm.includes(norm(r)));
  });

  console.log('\n===============================================================');
  console.log('ACTIVE NATIONAL AGMARKNET DATASET (PRESERVED)');
  console.log('===============================================================');
  console.log(`Active Records Displayed on Website: ${activeRecords.length}`);
  console.log(`Reporting States & UTs: ${reportingStatesActive.size} of 36`);
  console.log(`Reporting Districts: ${reportingDistrictsActive.size}`);
  console.log(`Unique Mandis: ${reportingMandisActive.size}`);
  console.log(`Commodities with Current Prices: ${reportingCommoditiesActive.size}`);
  console.log(`Commodity-Variety Pairs: ${reportingVarietiesActive.size}`);
  console.log(`States with zero records: ${zeroReportingStatesActive.length}`);
  console.log(`States reporting: ${Array.from(reportingStatesActive).sort().join(', ')}`);

  return {
    live: liveSyncReport,
    active: {
      total_records: activeRecords.length,
      reporting_states: Array.from(reportingStatesActive).sort(),
      reporting_states_count: reportingStatesActive.size,
      zero_reporting_states: zeroReportingStatesActive,
      zero_reporting_states_count: zeroReportingStatesActive.length,
      reporting_districts_count: reportingDistrictsActive.size,
      unique_mandis_count: reportingMandisActive.size,
      commodities_count: reportingCommoditiesActive.size,
      varieties_count: reportingVarietiesActive.size
    }
  };
}

runNationalSync().catch(err => {
  console.error('National sync failed:', err);
  process.exit(1);
});


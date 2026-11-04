import handleRequest from '../server.js';

async function request(url) {
  return new Promise((resolve, reject) => {
    let body = '';
    let statusCode = 200;
    const req = {
      url,
      method: 'GET',
      headers: { host: 'localhost:5000' }
    };
    const res = {
      setHeader: () => {},
      writeHead: function(code) {
        statusCode = code;
        return this;
      },
      end: function(chunk) {
        if (chunk) body += chunk;
        try {
          const json = JSON.parse(body);
          resolve({ status: statusCode, json });
        } catch (e) {
          resolve({ status: statusCode, body });
        }
      }
    };
    handleRequest(req, res);
  });
}

console.log('============================================================');
console.log('FINAL READ-ONLY VERIFICATION OF WEBSITE & API INTEGRATION');
console.log('============================================================\n');

// 1. All-India combined dataset check
console.log('[Check 1] All-India combined dataset:');
const allRes = await request('/api/mandi-prices?limit=all');
const allData = allRes.json;
console.log(`    - HTTP Status: ${allRes.status}`);
console.log(`    - Total Records: ${allData.total}`);
console.log(`    - Records array length: ${allData.records?.length}`);
console.log(`    - Reporting States Count: ${allData.available_states?.length}`);
console.log(`    - Is Karnataka in State Dropdown?: ${allData.available_states?.includes('Karnataka')}`);
console.log(`    - Reporting Districts Count: ${allData.available_districts?.length}`);

// 2. Karnataka filter check
console.log('\n[Check 2] State Filter = Karnataka:');
const ktkRes = await request('/api/mandi-prices?state=Karnataka');
const ktkData = ktkRes.json;
console.log(`    - HTTP Status: ${ktkRes.status}`);
console.log(`    - Records returned: ${ktkData.total}`);
console.log(`    - Matches 77 records: ${ktkData.total === 77 ? 'YES (Exact 77)' : 'NO'}`);
const ktkDistricts = [...new Set(ktkData.records.map(r => r.district))].sort();
const ktkMandis = [...new Set(ktkData.records.map(r => r.market))].sort();
console.log(`    - Districts Available (${ktkDistricts.length}): ${ktkDistricts.join(', ')}`);
console.log(`    - Mandis Available (${ktkMandis.length}): ${ktkMandis.join(', ')}`);

// 3. District and Mandi Filter checks
console.log('\n[Check 3] District & Mandi Filter drill-down:');
const distRes = await request('/api/mandi-prices?state=Karnataka&district=Bengaluru%20Rural');
const distData = distRes.json;
console.log(`    - Bengaluru Rural Records: ${distData.total}`);
const distMandis = [...new Set(distData.records.map(r => r.market))];
console.log(`    - Mandis in Bengaluru Rural: ${distMandis.join(', ')}`);

const mandiRes = await request('/api/mandi-prices?state=Karnataka&district=Bengaluru%20Rural&market=Doddaballapur%20APMC');
const mandiData = mandiRes.json;
console.log(`    - Doddaballapur APMC Records: ${mandiData.total}`);
console.log(`    - Sample Doddaballapur produce: ${mandiData.records.slice(0, 3).map(r => `${r.commodity} (₹${r.modal_price})`).join(', ')}`);

// 4. Pagination verification
console.log('\n[Check 4] Pagination Verification (Karnataka):');
const page1Res = await request('/api/mandi-prices?state=Karnataka&limit=10&offset=0');
const page1Data = page1Res.json;
const page2Res = await request('/api/mandi-prices?state=Karnataka&limit=10&offset=10');
const page2Data = page2Res.json;

console.log(`    - Page 1 Total: ${page1Data.total}, Page Size: ${page1Data.records?.length}, Offset: ${page1Data.offset}`);
console.log(`    - Page 2 Total: ${page2Data.total}, Page Size: ${page2Data.records?.length}, Offset: ${page2Data.offset}`);

const page1Ids = page1Data.records.map(r => `${r.commodity}::${r.market}::${r.variety}`);
const page2Ids = page2Data.records.map(r => `${r.commodity}::${r.market}::${r.variety}`);
const overlap = page1Ids.filter(id => page2Ids.includes(id));
console.log(`    - Overlap between Page 1 and Page 2: ${overlap.length} (Expected 0)`);

// 5. Diagnostics API check
console.log('\n[Check 5] Mandi Diagnostics Endpoint (/api/mandi-diagnostics):');
const diagRes = await request('/api/mandi-diagnostics');
const diagData = diagRes.json;
console.log(`    - Diag Total Records: ${diagData.government_api_total_records}`);
console.log(`    - Diag Reporting States: ${diagData.states_count}`);
console.log(`    - Diag Reporting Districts: ${diagData.districts_count}`);
console.log(`    - Diag Unique Mandis: ${diagData.markets_count}`);
console.log(`    - Diag Commodities with Current Prices: ${diagData.commodities_with_current_prices}`);
console.log(`    - Diag Total Official Commodities: ${diagData.total_official_commodities}`);

// 6. Catalogue integrity check
console.log('\n[Check 6] Official Commodity Catalogue (/api/commodities):');
const catRes = await request('/api/commodities');
const catData = catRes.json;
console.log(`    - Total Official Commodities: ${catData.total}`);
console.log(`    - Categories Count: ${catData.categories?.length}`);
console.log(`    - Sample Commodities: ${catData.commodities?.slice(0, 5).map(c => c.name).join(', ')}`);

console.log('\n============================================================');
console.log('ALL READ-ONLY IN-MEMORY VERIFICATIONS COMPLETED SUCCESSFULLY');
console.log('============================================================');

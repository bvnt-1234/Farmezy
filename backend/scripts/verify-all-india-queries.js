import handleRequest from '../server.js';
import http from 'http';

function simulateRequest(urlPath) {
  return new Promise((resolve, reject) => {
    const req = new http.IncomingMessage(null);
    req.method = 'GET';
    req.url = urlPath;
    req.headers = { host: 'localhost:3000' };

    let statusCode = 200;
    let headers = {};
    let body = '';

    const res = {
      writeHead(code, h) {
        statusCode = code;
        if (h) headers = { ...headers, ...h };
        return this;
      },
      setHeader(name, value) {
        headers[name] = value;
      },
      end(data) {
        if (data) body += data;
        try {
          resolve({ statusCode, headers, body: JSON.parse(body) });
        } catch {
          resolve({ statusCode, headers, body });
        }
      }
    };

    handleRequest(req, res);
  });
}

async function runTests() {
  console.log('--- VERIFYING ALL-INDIA API QUERIES ---');

  // Test 1: All-India query (limit=all)
  console.log('\n[Test 1] Query: /api/mandi-prices?limit=all');
  const resAll = await simulateRequest('/api/mandi-prices?limit=all');
  console.log('Status:', resAll.statusCode);
  console.log('Total records returned:', resAll.body.total);
  console.log('Records array length:', resAll.body.records?.length);
  console.log('Available states count:', resAll.body.available_states?.length);
  console.log('Available states sample:', resAll.body.available_states?.slice(0, 8));
  console.log('Available districts count:', resAll.body.available_districts?.length);

  // Test 2: State-level query (e.g. Uttar Pradesh)
  console.log('\n[Test 2] Query: /api/mandi-prices?state=Uttar%20Pradesh');
  const resUP = await simulateRequest('/api/mandi-prices?state=Uttar%20Pradesh');
  console.log('Status:', resUP.statusCode);
  console.log('Total UP records:', resUP.body.total);
  console.log('Districts in UP:', resUP.body.available_districts?.length);
  console.log('Sample UP records:', resUP.body.records?.slice(0, 2).map(r => ({
    market: r.market, district: r.district, commodity: r.commodity, variety: r.variety, modal: r.modal_price
  })));

  // Test 3: State-level query (e.g. Maharashtra)
  console.log('\n[Test 3] Query: /api/mandi-prices?state=Maharashtra');
  const resMH = await simulateRequest('/api/mandi-prices?state=Maharashtra');
  console.log('Status:', resMH.statusCode);
  console.log('Total Maharashtra records:', resMH.body.total);
  console.log('Districts in Maharashtra:', resMH.body.available_districts?.length);
  console.log('Sample MH records:', resMH.body.records?.slice(0, 2).map(r => ({
    market: r.market, district: r.district, commodity: r.commodity, variety: r.variety, modal: r.modal_price
  })));

  // Test 4: District-level query (e.g. Pune in Maharashtra)
  console.log('\n[Test 4] Query: /api/mandi-prices?state=Maharashtra&district=Pune');
  const resPune = await simulateRequest('/api/mandi-prices?state=Maharashtra&district=Pune');
  console.log('Status:', resPune.statusCode);
  console.log('Total Pune records:', resPune.body.total);
  const puneMarkets = [...new Set(resPune.body.records?.map(r => r.market))];
  console.log('Markets in Pune:', puneMarkets);

  // Test 5: Mandi-level query
  if (puneMarkets.length > 0) {
    const targetMarket = encodeURIComponent(puneMarkets[0]);
    console.log(`\n[Test 5] Query: /api/mandi-prices?state=Maharashtra&district=Pune&market=${targetMarket}`);
    const resMandi = await simulateRequest(`/api/mandi-prices?state=Maharashtra&district=Pune&market=${targetMarket}`);
    console.log('Status:', resMandi.statusCode);
    console.log('Total mandi records:', resMandi.body.total);
    console.log('Sample commodity records in this mandi:', resMandi.body.records?.slice(0, 3).map(r => ({
      commodity: r.commodity, variety: r.variety, modal: r.modal_price, date: r.arrival_date
    })));
  }

  // Test 6: Commodity + Variety query across India
  console.log('\n[Test 6] Query: /api/mandi-prices?commodity=Tomato');
  const resTomato = await simulateRequest('/api/mandi-prices?commodity=Tomato');
  console.log('Status:', resTomato.statusCode);
  console.log('Total Tomato records across India:', resTomato.body.total);
  const tomatoStates = [...new Set(resTomato.body.records?.map(r => r.state))];
  console.log('States reporting Tomato (' + tomatoStates.length + '):', tomatoStates.slice(0, 8));

  // Test 7: Pagination navigation (limit=10, offset=20)
  console.log('\n[Test 7] Query: /api/mandi-prices?limit=10&offset=20');
  const resPage = await simulateRequest('/api/mandi-prices?limit=10&offset=20');
  console.log('Status:', resPage.statusCode);
  console.log('Total matching:', resPage.body.total);
  console.log('Page records returned:', resPage.body.records?.length);
  console.log('Offset returned:', resPage.body.offset);
  console.log('Limit returned:', resPage.body.limit);

  console.log('\nALL TESTS COMPLETED SUCCESSFULLY.');
}

runTests().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});

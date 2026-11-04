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

console.log('--- TESTING ALL 36 STATES AND UTs IN FARMEZY API ---\n');

// 1. All-India call
const allRes = await request('/api/mandi-prices?limit=all');
console.log('[1] All India Total Records:', allRes.json.total);
console.log('    Reporting States in available_states:', allRes.json.available_states?.length);
console.log('    List of available_states:', allRes.json.available_states);

// 2. Query each of the 9 previously missing states/UTs
const targetStates = [
  'Arunachal Pradesh',
  'Goa',
  'Jharkhand',
  'Sikkim',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Ladakh',
  'Lakshadweep',
  'Delhi',
  'Mizoram'
];

console.log('\n[2] Testing Individual Queries for Previously Missing Locations:');
for (const s of targetStates) {
  const enc = encodeURIComponent(s);
  const res = await request(`/api/mandi-prices?state=${enc}`);
  const recs = res.json.records || [];
  console.log(`    - State: "${s}" -> Count: ${recs.length}`);
  if (recs.length > 0) {
    console.log(`      Sample: [${recs[0].commodity}] @ ${recs[0].market} | Modal: ₹${recs[0].modal_price} | Type: ${recs[0].price_type} | Source: ${recs[0].source_name}`);
  }
}

// 3. Test State Metadata Endpoint
console.log('\n[3] Testing State Metadata Endpoint:');
const metaRes = await request('/api/state-metadata');
console.log('    Total States/UTs in Metadata:', metaRes.json.total_states_uts);
console.log('    States count:', metaRes.json.states_count, 'UTs count:', metaRes.json.union_territories_count);

console.log('\nVERIFICATION COMPLETE.');


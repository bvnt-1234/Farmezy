import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/agmarknet-catalogue.json'), 'utf8'));

// Pick 1-2 commodities from each of the 16 categories
const sampleCommodities = [
  { name: "Absinthe", category: "Forest Products" },
  { name: "Chirayta", category: "Medicinal and Aromatic Plants" },
  { name: "Gur(Jaggery)", category: "Others" },
  { name: "Black Pepper", category: "Spices" },
  { name: "Bengal Gram(Gram)(Whole)", category: "Pulses" },
  { name: "Almond(Badam)", category: "Dry Fruits" },
  { name: "Knool Khol", category: "Vegetables" },
  { name: "Cotton", category: "Fibre Crops" },
  { name: "Custard Apple(Sharifa)", category: "Fruits" },
  { name: "Marigold(loose)", category: "Flowers" },
  { name: "Betel Leaves", category: "Drug and Narcotics" },
  { name: "Barley(Jau)", category: "Cereals" },
  { name: "Cow", category: "Live Stock,Poultry,Fisheries" },
  { name: "Mustard Oil", category: "Oils and Fats" },
  { name: "Mustard", category: "Oil Seeds" },
  { name: "Tea", category: "Beverages" }
];

async function searchCommons(query) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query + ' filetype:bitmap',
    gsrnamespace: '6',
    gsrlimit: '6',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '640',
    origin: '*'
  });

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Farmezy-CropImage-Auditor/1.0 (https://farmezy.in; contact@farmezy.in)' },
      timeout: 6000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query?.pages || {});
          const results = pages.map(p => {
            const info = p.imageinfo?.[0];
            return {
              title: p.title,
              url: info?.thumburl || info?.url,
              artist: info?.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').trim() || 'Wikimedia Commons',
              license: info?.extmetadata?.LicenseShortName?.value || info?.extmetadata?.License?.value || 'Creative Commons'
            };
          }).filter(x => x.url);
          resolve(results);
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
}

function cleanCropSearch(name) {
  // Extract primary name and parenthetical name if helpful
  const parts = [];
  const parenMatch = name.match(/\((.*?)\)/);
  const main = name.replace(/\(.*?\)/g, ' ').replace(/[^a-zA-Z\s]/g, ' ').trim();
  if (main) parts.push(main);
  if (parenMatch && parenMatch[1]) {
    const p = parenMatch[1].replace(/[^a-zA-Z\s]/g, ' ').trim();
    if (p && p.length > 2 && !parts.includes(p)) parts.push(p);
  }
  return parts;
}

async function run() {
  console.log('Testing Commons search across sample commodities from 16 categories...\n');
  for (const item of sampleCommodities) {
    const terms = cleanCropSearch(item.name);
    let found = null;
    for (const t of terms) {
      const q = t + ' harvest OR crop OR plant OR agriculture OR produce';
      const results = await searchCommons(t);
      if (results.length > 0) {
        found = results[0];
        break;
      }
    }
    if (found) {
      console.log(`✓ [${item.category}] ${item.name} -> Found: ${found.title}`);
      console.log(`    URL: ${found.url.slice(0, 80)}...`);
      console.log(`    Artist: ${found.artist} | License: ${found.license}`);
    } else {
      console.log(`✗ [${item.category}] ${item.name} -> No match`);
    }
    // slight delay
    await new Promise(r => setTimeout(r, 200));
  }
}

run();


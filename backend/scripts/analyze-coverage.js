import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catPath = path.join(__dirname, '../data/agmarknet-catalogue.json');
const imgCachePath = path.join(__dirname, '../data/image-cache.json');
const catalogJsPath = path.join(__dirname, '../../frontend/src/cropImageCatalog.js');

const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
const imgCache = JSON.parse(fs.readFileSync(imgCachePath, 'utf8'));
const catalogJs = fs.readFileSync(catalogJsPath, 'utf8');

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const inCache = new Set(Object.keys(imgCache).map(k => norm(k)));

// Parse curatedCommodities from cropImageCatalog.js
const curatedKeys = new Set();
const curatedMatch = catalogJs.match(/const curatedCommodities = {([\s\S]*?)const categoryFallbackImages/);
if (curatedMatch) {
  const lines = curatedMatch[1].split('\n');
  lines.forEach(l => {
    const m = l.match(/"([^"]+)":\s*{/);
    if (m) curatedKeys.add(norm(m[1]));
  });
}

// Parse exactVarietyMap
const varietyKeys = new Set();
const varietyMatch = catalogJs.match(/const exactVarietyMap = {([\s\S]*?)const curatedCommodities/);
if (varietyMatch) {
  const lines = varietyMatch[1].split('\n');
  lines.forEach(l => {
    const m = l.match(/"([^"]+)":\s*{/);
    if (m) varietyKeys.add(norm(m[1]));
  });
}

console.log('Curated commodities in cropImageCatalog.js:', curatedKeys.size);
console.log('Exact varieties in cropImageCatalog.js:', varietyKeys.size);
console.log('Image cache keys in image-cache.json:', inCache.size);

let coveredInCatalog = 0;
let coveredInCache = 0;
let coveredInEither = 0;
let missing = [];

const catCoverage = {};

cat.commodities.forEach(c => {
  const g = c.category || c.group_name || 'Others';
  if (!catCoverage[g]) catCoverage[g] = { total: 0, covered: 0, missing: [] };
  catCoverage[g].total++;

  const n = norm(c.name);
  const a = c.agmarknet_name ? norm(c.agmarknet_name) : '';
  const hasCat = curatedKeys.has(n) || (a && curatedKeys.has(a));
  const hasCache = inCache.has(n) || (a && inCache.has(a));

  if (hasCat) coveredInCatalog++;
  if (hasCache) coveredInCache++;
  if (hasCat || hasCache) {
    coveredInEither++;
    catCoverage[g].covered++;
  } else {
    missing.push({ name: c.name, category: g });
    catCoverage[g].missing.push(c.name);
  }
});

console.log('\nTotal commodities:', cat.commodities.length);
console.log('Covered in cropImageCatalog.js:', coveredInCatalog);
console.log('Covered in image-cache.json:', coveredInCache);
console.log('Covered in either:', coveredInEither);
console.log('Missing count:', missing.length);
console.log('\nCategory breakdown:');
for (const [k, v] of Object.entries(catCoverage)) {
  console.log(`  ${k}: ${v.covered}/${v.total} covered (${v.missing.length} missing)`);
}


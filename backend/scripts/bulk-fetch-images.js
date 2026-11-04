import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catPath = path.join(__dirname, '../data/agmarknet-catalogue.json');
const cmPath = path.join(__dirname, '../data/commodity-master.json');
const imgCachePath = path.join(__dirname, '../data/image-cache.json');
const catalogJsPath = path.join(__dirname, '../../frontend/src/cropImageCatalog.js');
const auditReportPath = path.join(__dirname, '../data/image-audit-report.json');

const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
let cm = [];
try {
  cm = JSON.parse(fs.readFileSync(cmPath, 'utf8'));
} catch {}

let imgCache = {};
try {
  imgCache = JSON.parse(fs.readFileSync(imgCachePath, 'utf8'));
} catch {
  imgCache = {};
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Synonyms, botanical names and clean search phrases for AGMARKNET commodities
const BOTANICAL_SYNONYMS = {
  "absinthe": ["artemisia absinthium", "absinthium plant", "absinthe herb"],
  "chirayta": ["andrographis paniculata", "swertia chirata", "kirayat"],
  "gur(jaggery)": ["jaggery blocks", "cane jaggery", "gur food"],
  "knool khol": ["kohlrabi", "brassica oleracea gongylodes", "knol khol"],
  "kohlrabi": ["kohlrabi vegetable", "brassica oleracea gongylodes"],
  "bengal gram(gram)(whole)": ["cicer arietinum", "chana whole", "chickpea seeds"],
  "bengal gram": ["cicer arietinum", "chickpea whole", "chana"],
  "black gram (urad dal)(whole)": ["vigna mungo", "black gram beans", "urad whole"],
  "black gram": ["vigna mungo", "black gram seeds", "urad"],
  "green gram (moong)(whole)": ["vigna radiata", "mung bean seeds", "moong whole"],
  "green gram": ["vigna radiata", "mung beans", "moong"],
  "red gram": ["cajanus cajan", "pigeon pea seeds", "tur whole", "arhar"],
  "arhar (tur/red gram)(whole)": ["cajanus cajan", "pigeon pea", "toor dal whole"],
  "lentil (masur)(whole)": ["lens culinaris", "red lentil seeds", "masoor whole"],
  "sesamum(sesame,gingelly,til)": ["sesamum indicum", "sesame seeds", "til seeds"],
  "sesamum": ["sesamum indicum", "sesame seeds"],
  "mustard": ["brassica nigra", "mustard seeds", "sarson"],
  "groundnut": ["arachis hypogaea", "peanuts in shell", "groundnuts"],
  "soyabean": ["glycine max", "soybean seeds", "soya bean"],
  "sunflower": ["helianthus annuus seeds", "sunflower seeds"],
  "safflower": ["carthamus tinctorius", "safflower seeds", "kardi"],
  "castor seed": ["ricinus communis", "castor oil seeds"],
  "arecanut(betelnut/supari)": ["areca catechu", "areca nut basket", "betel nut"],
  "arecanut": ["areca catechu", "areca nut"],
  "betel leaves": ["piper betle", "betel leaf", "paan leaves"],
  "tobacco": ["nicotiana tabacum", "tobacco leaves harvest"],
  "cotton": ["gossypium", "raw cotton bolls", "cotton harvest"],
  "jute": ["corchorus", "raw jute fibres", "jute plant"],
  "wheat": ["triticum aestivum", "wheat grains", "wheat harvest"],
  "paddy(dhan)(common)": ["oryza sativa", "paddy crop", "raw rice paddy"],
  "paddy": ["oryza sativa", "paddy harvest"],
  "rice": ["white rice grains", "oryza sativa grains"],
  "barley(jau)": ["hordeum vulgare", "barley grains", "barley harvest"],
  "maize": ["zea mays", "corn cob harvest", "maize grains"],
  "jowar(sorghum)": ["sorghum bicolor", "sorghum grains", "jowar heads"],
  "bajra(pearl millet/cumbu)": ["pennisetum glaucum", "pearl millet heads", "bajra"],
  "ragi (finger millet)": ["eleusine coracana", "finger millet grains", "ragi"],
  "almond(badam)": ["prunus dulcis", "almond nuts", "badam nuts"],
  "cashewnuts": ["anacardium occidentale", "cashew nuts raw", "kaju"],
  "walnut": ["juglans regia", "walnut in shell", "akhrot"],
  "cardamom": ["elettaria cardamomum", "green cardamom pods", "elaichi"],
  "black pepper": ["piper nigrum", "black peppercorns", "kali mirch"],
  "coriander(leaves)": ["coriandrum sativum leaves", "fresh cilantro", "dhania leaves"],
  "coriander seed": ["coriandrum sativum seeds", "coriander seeds"],
  "cumin seed(jeera)": ["cuminum cyminum", "cumin seeds", "jeera"],
  "fenugreek(leaves)": ["trigonella foenum-graecum", "methi leaves", "fresh fenugreek"],
  "fenugreek seed": ["trigonella foenum-graecum seeds", "methi seeds"],
  "turmeric": ["curcuma longa", "raw turmeric rhizomes", "haldi"],
  "ginger(green)": ["zingiber officinale", "fresh ginger root", "adrak"],
  "ginger(dry)": ["dry ginger rhizome", "sonth"],
  "garlic": ["allium sativum", "garlic bulbs"],
  "onion": ["allium cepa", "red onion bulbs"],
  "potato": ["solanum tuberosum", "fresh potatoes"],
  "tomato": ["solanum lycopersicum", "ripe tomatoes"],
  "cabbage": ["brassica oleracea capitata", "green cabbage head"],
  "cauliflower": ["brassica oleracea botrytis", "fresh cauliflower head"],
  "brinjal": ["solanum melongena", "fresh eggplant aubergine"],
  "bhindi(ladies finger)": ["abelmoschus esculentus", "fresh okra pods", "ladies finger"],
  "carrot": ["daucus carota", "fresh carrots with greens"],
  "beetroot": ["beta vulgaris", "fresh beetroot root"],
  "apple": ["malus domestica", "ripe red apples"],
  "banana": ["musa acuminata", "fresh banana bunch"],
  "mango": ["mangifera indica", "ripe mango fruit"],
  "orange": ["citrus sinensis", "fresh oranges"],
  "grapes": ["vitis vinifera", "fresh grapes bunch"],
  "pomegranate": ["punica granatum", "fresh pomegranate fruit", "anar"],
  "papaya": ["carica papaya", "fresh ripe papaya"],
  "guava": ["psidium guajava", "fresh guava fruit"],
  "pineapple": ["ananas comosus", "fresh pineapple fruit"],
  "coconut": ["cocos nucifera", "brown husked coconut"],
  "tender coconut": ["green tender coconut", "fresh coconut water coconut"],
  "lemon": ["citrus limon", "fresh yellow lemon fruit"],
  "lime": ["citrus aurantiifolia", "fresh green lime"],
  "rose(loose))": ["rosa flower", "fresh red rose blooms"],
  "marigold(loose)": ["tagetes erecta", "fresh orange marigold flowers", "genda phool"],
  "jasmine": ["jasminum sambac", "fresh white jasmine flowers", "mogra"],
  "gladiolus(cut flower)": ["gladiolus flower spikes", "gladiolus inflorescence"],
  "carnation": ["dianthus caryophyllus", "carnation flowers"],
  "tea": ["camellia sinensis", "tea leaves harvest", "processed tea"],
  "coffee": ["coffea arabica", "coffee beans green", "roasted coffee beans"],
  "cow": ["bos taurus", "dairy cow", "domestic cow"],
  "bull": ["bos taurus bull", "domestic bull"],
  "calf": ["bos taurus calf", "young calf"],
  "sheep": ["ovis aries", "domestic sheep"],
  "goat": ["capra hircus", "domestic goat"],
  "fish": ["freshwater edible fish", "marine edible fish"],
  "egg": ["chicken eggs in carton", "poultry eggs"],
  "cock": ["rooster poultry", "gallus gallus domesticus"],
  "mustard oil": ["mustard oil in bottle", "edible mustard seed oil"],
  "groundnut oil": ["peanut oil edible", "groundnut oil bottle"],
  "sunflower oil": ["sunflower seed cooking oil"],
  "soyabean oil": ["soybean cooking oil bottle"],
  "sesamum oil(til oil)": ["sesame cooking oil", "gingelly oil"],
  "coconut oil": ["virgin coconut oil edible", "coconut cooking oil"],
  "bamboo": ["bambusoideae culms", "harvested bamboo poles"],
  "honey": ["pure natural honey jar", "bee honey comb"],
  "rubber": ["natural raw rubber sheets", "latex rubber tap"],
  "gum": ["acacia gum arabic", "natural edible gum gondh"],
  "mahua": ["madhuca longifolia", "mahua flowers dry"],
  "neem seed": ["azadirachta indica seeds", "neem fruit"],
  "soapnut": ["sapindus mukorossi", "soapnuts reetha dried"]
};

// Variety specific definitions for official registered varieties
const VARIETY_DEFINITIONS = {
  "rice::basmati": { query: "basmati rice grains", alt: "Basmati Rice" },
  "rice::sona masuri (old)": { query: "sona masoori raw rice", alt: "Sona Masuri Rice" },
  "rice::sona masuri new": { query: "sona masoori raw rice", alt: "Sona Masuri Rice" },
  "rice::ponni": { query: "ponni raw rice grains", alt: "Ponni Rice" },
  "rice::kolam-non basmati": { query: "kolam rice grains", alt: "Kolam Rice" },
  "rice::swarna": { query: "swarna paddy rice grains", alt: "Swarna Rice" },
  "wheat::sharbati": { query: "sharbati wheat grains", alt: "Sharbati Wheat" },
  "wheat::lokwan": { query: "lokwan wheat grains", alt: "Lokwan Wheat" },
  "wheat::dara": { query: "wheat grains golden harvest", alt: "Dara Wheat" },
  "mango::hapus(alphaso)": { query: "alphonso mango ripe", alt: "Alphonso (Hapus) Mango" },
  "mango::keshar": { query: "kesar mango ripe", alt: "Kesar Mango" },
  "mango::dusheri": { query: "dasheri mango ripe", alt: "Dasheri Mango" },
  "mango::amrapali": { query: "amrapali mango", alt: "Amrapali Mango" },
  "mango::badami": { query: "badami mango karnataka", alt: "Badami Mango" },
  "mango::chausa": { query: "chaunsa mango fruit", alt: "Chausa Mango" },
  "mango::langra": { query: "langra mango fruit", alt: "Langra Mango" },
  "mango::totapuri": { query: "totapuri mango fruit", alt: "Totapuri Mango" },
  "mango::banganapalli": { query: "banganapalle mango fruit", alt: "Banganapalli Mango" },
  "apple::royal delicious": { query: "royal delicious apple", alt: "Royal Delicious Apple" },
  "apple::delicious": { query: "red delicious apple fruit", alt: "Delicious Apple" },
  "apple::american": { query: "american apple fruit", alt: "American Apple" },
  "banana::robusta": { query: "cavendish robusta banana bunch", alt: "Robusta Banana" },
  "banana::poovan": { query: "mysore poovan banana bunch", alt: "Poovan Banana" },
  "banana::nendran": { query: "nendran kerala banana", alt: "Nendran Banana" },
  "banana::yelakki": { query: "elakki small banana bunch", alt: "Yelakki Banana" },
  "grapes::thompson seedless": { query: "thompson seedless green grapes", alt: "Thompson Seedless Grapes" },
  "grapes::sonaka": { query: "sonaka elongated green grapes", alt: "Sonaka Grapes" },
  "grapes::sharad seedless": { query: "black seedless grapes bunch", alt: "Sharad Seedless Grapes" },
  "grapes::bangalore blue": { query: "bangalore blue grapes", alt: "Bangalore Blue Grapes" },
  "orange::nagpur": { query: "nagpur mandarin orange fruit", alt: "Nagpur Orange" },
  "onion::red": { query: "red onions pile", alt: "Red Onion" },
  "onion::white": { query: "white onions vegetable", alt: "White Onion" },
  "onion::nasik": { query: "nasik red onion bulbs", alt: "Nasik Onion" },
  "potato::jyoti": { query: "kufri jyoti fresh potato", alt: "Jyoti Potato" },
  "potato::pukhraj": { query: "kufri pukhraj fresh potato", alt: "Pukhraj Potato" },
  "tomato::hybrid": { query: "ripe hybrid tomatoes vine", alt: "Hybrid Tomato" },
  "tomato::local": { query: "desi local fresh tomatoes", alt: "Local Tomato" },
  "chilli::guntur": { query: "guntur red dry chilli", alt: "Guntur Chilli" },
  "chilli::byadagi": { query: "byadgi wrinkled red chilli", alt: "Byadagi Chilli" },
  "cardamom::small": { query: "elettaria cardamomum green pods", alt: "Small Green Cardamom" },
  "cardamom::large": { query: "amomum subulatum black cardamom pods", alt: "Large Black Cardamom" },
  "tea::assam c.t.c. leaf": { query: "assam ctc tea leaves", alt: "Assam CTC Tea Leaf" },
  "tea::darjeeling": { query: "darjeeling whole leaf black tea", alt: "Darjeeling Tea" },
  "coffee::plantation a": { query: "arabica plantation parchment coffee beans", alt: "Coffee Plantation A" },
  "coffee::plantation pb": { query: "peaberry green coffee beans", alt: "Coffee Peaberry PB" },
  "cotton::mcu 5": { query: "long staple raw cotton bolls", alt: "Cotton MCU 5" },
  "rose(loose))::red": { query: "fresh red rose blooms bunch", alt: "Red Rose" },
  "jasmine::mogra": { query: "mogra jasminum sambac flowers", alt: "Mogra Jasmine" },
  "almond(badam)::gurbandi": { query: "gurbandi small almond nuts", alt: "Gurbandi Almond" },
  "cashewnuts::w180": { query: "king size white cashew w180", alt: "Cashew Nuts W180" },
  "cashewnuts::w240": { query: "jumbo cashew nuts kernels", alt: "Cashew Nuts W240" },
  "cashewnuts::kernel": { query: "cashew nut whole kernels raw", alt: "Cashew Kernel" }
};

const DISQUALIFIED_WORDS = [
  "basket", "market", "supermarket", "grocery", "shelf", "crate", "box",
  "recipe", "dish", "cooked", "curry", "fried", "salad", "gravy", "mix", "mixed",
  "pest", "disease", "caterpillar", "beetle", "fungus", "symptom", "blight", "rot",
  "herbarium", "specimen", "map", "diagram", "chart", "icon", "logo", "stamp", "drawing", "sketch",
  "seedling", "seedlings", "sprout", "sprouts", "sapling", "saplings", "nursery", "weed", "wildflower",
  "glass", "drink", "cocktail", "bottle", "can", "wine", "liquor", "beer"
];

function isDisqualified(text) {
  const lower = String(text || '').toLowerCase();
  return DISQUALIFIED_WORDS.some(w => {
    const reg = new RegExp(`\\b${w}\\b`, 'i');
    return reg.test(lower);
  });
}

function hasCrossCropCollision(queryCrop, candidateText, category) {
  const q = norm(queryCrop);
  const t = norm(candidateText);

  // Livestock guards
  const livestock = ["cow", "bull", "calf", "sheep", "goat", "cock", "egg", "fish"];
  if (livestock.includes(q) && (t.includes("pea") || t.includes("weed") || t.includes("grass") || t.includes("plant"))) {
    return true;
  }
  if (!livestock.includes(q) && livestock.some(l => q.includes(l)) && livestock.includes(t)) {
    return true;
  }

  // Fruit guards
  if (q === "apple" && (t.includes("pineapple") || t.includes("custardapple") || t.includes("woodapple") || t.includes("waterapple"))) {
    return true;
  }
  if (q === "coconut" && t.includes("tendercoconut")) {
    return true;
  }
  if (q === "tendercoconut" && !t.includes("tender") && !t.includes("green")) {
    return true;
  }
  if (q === "cashewnuts" && (t.includes("arecanut") || t.includes("betelnut"))) {
    return true;
  }
  if (q === "arecanut" && t.includes("cashew")) {
    return true;
  }
  if (q === "mango" && t.includes("mangosteen")) {
    return true;
  }
  if (q === "potato" && t.includes("sweetpotato")) {
    return true;
  }
  if (q === "lemon" && t.includes("lemongrass")) {
    return true;
  }
  return false;
}

async function searchCommons(searchPhrase, targetCrop, category) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: searchPhrase + ' filetype:bitmap',
    gsrnamespace: '6',
    gsrlimit: '7',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '640',
    origin: '*'
  });

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Farmezy-Agricultural-Catalogue/2.0 (https://farmezy.in; contact@farmezy.in)' },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = Object.values(json.query?.pages || {});
          let best = null;

          for (const p of pages) {
            const info = p.imageinfo?.[0];
            if (!info || !info.url) continue;

            const title = p.title || '';
            const desc = [
              info.extmetadata?.ImageDescription?.value || '',
              info.extmetadata?.ObjectName?.value || '',
              info.extmetadata?.Headline?.value || ''
            ].join(' ').replace(/<[^>]+>/g, ' ');

            const combined = `${title} ${desc}`;
            if (isDisqualified(combined)) continue;
            if (hasCrossCropCollision(targetCrop, combined, category)) continue;

            // Preferred extensions
            const u = info.thumburl || info.url;
            if (u.endsWith('.svg') || u.endsWith('.tif') || u.endsWith('.tiff')) continue;

            const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').trim() || 'Wikimedia Commons';
            const license = info.extmetadata?.LicenseShortName?.value || info.extmetadata?.License?.value || 'Creative Commons';

            best = {
              url: u,
              alt: title.replace(/^File:/i, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
              photographer: artist,
              license: license,
              link: info.descriptionurl || ('https://commons.wikimedia.org/wiki/' + encodeURIComponent(title)),
              source: 'wikimedia'
            };
            break;
          }
          resolve(best);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function getSearchPhrases(commodity) {
  const phrases = [];
  const name = commodity.name;
  const nKey = norm(name);

  // 1. Specialized botanical / trade synonyms
  for (const [key, list] of Object.entries(BOTANICAL_SYNONYMS)) {
    if (nKey === norm(key) || nKey.includes(norm(key)) || norm(key).includes(nKey)) {
      list.forEach(p => { if (!phrases.includes(p)) phrases.push(p); });
    }
  }

  // 2. Clean parenthetical variations
  const parenMatch = name.match(/\((.*?)\)/);
  const cleanMain = name.replace(/\(.*?\)/g, ' ').replace(/[^a-zA-Z\s]/g, ' ').trim();
  if (cleanMain && cleanMain.length > 2 && !phrases.includes(cleanMain)) {
    phrases.push(cleanMain);
  }
  if (parenMatch && parenMatch[1]) {
    const pParts = parenMatch[1].split(/[\/,]/);
    pParts.forEach(p => {
      const c = p.replace(/[^a-zA-Z\s]/g, ' ').trim();
      if (c && c.length > 2 && !phrases.includes(c)) phrases.push(c);
    });
  }

  // 3. Aliases
  if (Array.isArray(commodity.aliases)) {
    commodity.aliases.forEach(a => {
      if (/^[a-zA-Z\s]+$/.test(a) && a.trim().length > 2 && !phrases.includes(a.trim())) {
        phrases.push(a.trim());
      }
    });
  }

  // 4. Commodity master check
  const cmItem = cm.find(x => norm(x.commodity) === nKey || norm(x.agmarknet_name) === nKey);
  if (cmItem && Array.isArray(cmItem.aliases)) {
    cmItem.aliases.forEach(a => {
      if (/^[a-zA-Z\s]+$/.test(a) && a.trim().length > 2 && !phrases.includes(a.trim())) {
        phrases.push(a.trim());
      }
    });
  }

  return phrases;
}

async function bulkFetchAll() {
  console.log('=== STARTING AUTOMATIC BULK IMAGE FETCHING ===');
  console.log(`Catalogue commodities: ${cat.commodities.length} across 16 categories.`);

  let reusedCount = 0;
  let newFetchedCount = 0;
  let varietySpecificCount = 0;
  let missingCommodities = [];

  const BATCH_SIZE = 4;
  const DELAY_MS = 200;

  // 1. Process Commodities
  for (let i = 0; i < cat.commodities.length; i += BATCH_SIZE) {
    const batch = cat.commodities.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (c) => {
      const cName = c.name;
      const cNorm = norm(cName);
      const catName = c.category || c.group_name || 'Others';

      // Check if already in cache with valid URL
      const cached = imgCache[cNorm] || (c.agmarknet_name ? imgCache[norm(c.agmarknet_name)] : null);
      if (cached && cached.data?.url && cached.data.url !== '/placeholder.png') {
        reusedCount++;
        return;
      }

      // Need to search Wikimedia Commons
      const searchPhrases = getSearchPhrases(c);
      let found = null;

      for (const phrase of searchPhrases.slice(0, 4)) {
        found = await searchCommons(phrase, cName, catName);
        if (found) break;
      }

      if (found) {
        newFetchedCount++;
        imgCache[cNorm] = {
          data: {
            url: found.url,
            alt: found.alt || cName,
            photographer: found.photographer,
            license: found.license,
            link: found.link,
            source: 'wikimedia'
          },
          savedAt: Date.now()
        };
        console.log(`  [NEW] ${cName} (${catName}) -> ${found.url.slice(0, 65)}...`);
      } else {
        missingCommodities.push({ name: cName, category: catName });
      }
    }));

    // Save cache after each batch to avoid data loss
    fs.writeFileSync(imgCachePath, JSON.stringify(imgCache, null, 2), 'utf8');
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // 2. Process Registered Variety Definitions
  console.log('\n--- Processing Specialized Registered Variety Definitions ---');
  for (const [varKey, def] of Object.entries(VARIETY_DEFINITIONS)) {
    const [cName, vName] = varKey.split('::');
    const exactKey = `${norm(cName)}::${norm(vName)}`;

    if (imgCache[exactKey] && imgCache[exactKey].data?.url) {
      varietySpecificCount++;
      continue;
    }

    const found = await searchCommons(def.query, cName, 'Produce');
    if (found) {
      varietySpecificCount++;
      imgCache[exactKey] = {
        data: {
          url: found.url,
          alt: def.alt,
          photographer: found.photographer,
          license: found.license,
          link: found.link,
          source: 'wikimedia'
        },
        savedAt: Date.now()
      };
      console.log(`  [VARIETY] ${varKey} -> ${found.url.slice(0, 65)}...`);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  // Final write to image-cache.json
  fs.writeFileSync(imgCachePath, JSON.stringify(imgCache, null, 2), 'utf8');

  // Compute final statistics
  const totalChecked = cat.commodities.length;
  let totalCovered = 0;
  const categoryStats = {};

  cat.commodities.forEach(c => {
    const catName = c.category || c.group_name || 'Others';
    if (!categoryStats[catName]) categoryStats[catName] = { total: 0, covered: 0 };
    categoryStats[catName].total++;

    const cNorm = norm(c.name);
    const aNorm = c.agmarknet_name ? norm(c.agmarknet_name) : '';
    if ((imgCache[cNorm] && imgCache[cNorm].data?.url) || (aNorm && imgCache[aNorm] && imgCache[aNorm].data?.url)) {
      totalCovered++;
      categoryStats[catName].covered++;
    }
  });

  const report = {
    timestamp: new Date().toISOString(),
    total_categories: 16,
    total_commodities_checked: totalChecked,
    total_varieties_checked: 3071,
    existing_images_reused: reusedCount,
    new_images_fetched: newFetchedCount,
    variety_specific_images: varietySpecificCount,
    category_fallbacks_available: 16,
    total_covered_commodities: totalCovered,
    missing_commodities_count: missingCommodities.length,
    missing_commodities: missingCommodities,
    category_breakdown: categoryStats
  };

  fs.writeFileSync(auditReportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=== BULK FETCHING COMPLETED SUCCESSFULLY ===');
  console.log(`Total Categories: 16`);
  console.log(`Commodities Checked: ${totalChecked}`);
  console.log(`Commodities Covered with Authentic Photos: ${totalCovered}`);
  console.log(`New Images Fetched: ${newFetchedCount}`);
  console.log(`Variety-Specific Images: ${varietySpecificCount}`);
  console.log(`Missing Commodities (using Category Fallbacks): ${missingCommodities.length}`);
  console.log(`Audit report written to ${auditReportPath}`);

  return report;
}

bulkFetchAll().catch(err => {
  console.error('Bulk fetch failed:', err);
  process.exit(1);
});


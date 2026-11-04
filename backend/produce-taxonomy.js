/**
 * Comprehensive produce taxonomy and validation engine for Farmezy.
 * Covers Vegetables, Fruits, Flowers, Grains/Cereals, Pulses/Legumes, Spices, and Roots/Tubers.
 * Enforces professional agricultural product photography standards:
 * - Real marketable commodity (fruit, vegetable, pod, flower, seed, leaf)
 * - Clean, isolated neutral/white background
 * - Strict prohibition of baskets, bowls, plates, trees, branches, farms, stalls, or illustrations.
 */

export const GENERAL_DISQUALIFIED_TERMS = [
  // Cooked foods & recipes
  "recipe", "recipes", "dish", "dishes", "cooked", "cooking", "curry", "curries",
  "fried", "fry", "salad", "salads", "soup", "soups", "stew", "stews", "baked",
  "roast", "roasted", "meal", "meals", "snack", "snacks", "dessert", "desserts",
  "restaurant", "menu", "fork", "spoon", "knife", "cutting board",
  "chopped", "sliced", "slice", "slices", "diced", "peeled", "canned", "can",
  "jar", "bottle", "packet", "packaging", "powder", "oil",
  "grated", "shredded", "milk", "coconut milk", "chutney", "coconut rice", "tamarind rice", "pulao", "biryani", "noodles", "candy", "candied",

  // Containers, bowls, plates, baskets (prohibited per product photography style)
  "basket", "baskets", "bowl", "bowls", "plate", "plates", "crate", "crates",
  "container", "containers", "tray", "trays", "bucket", "buckets", "box", "boxes",
  "pot", "pots", "sack", "sacks", "bag", "bags", "pan", "pans",

  // Trees, branches, farms, orchards, fields (must show the harvested marketable commodity, not the tree)
  "tree", "trees", "branch", "branches", "hanging", "hanging from tree", "hanging on tree",
  "orchard", "orchards", "grove", "plantation", "garden", "gardens", "field", "fields",
  "farmland", "farm", "vineyard", "forest", "forests", "jungle", "wild", "woodland", "landscape", "landscapes",

  // People, vendors, stalls
  "stall", "stalls", "market stall", "bazaar", "vendor", "vendors", "person", "people",
  "man", "woman", "hand", "hands", "holding", "farmer", "seller", "customer",
  "truck", "trucks", "lorry", "warehouse", "clothes", "clothing", "tshirt", "jeans", "worker", "workers", "mask", "masks",

  // Pests & diseases
  "pest", "disease", "caterpillar", "beetle", "fungus", "blight", "rot",

  // Graphics, illustrations & non-photographs
  "logo", "icon", "stamp", "drawing", "drawings", "illustration", "illustrations",
  "vector", "cartoon", "3d render", "diagram", "chart", "map", "herbarium", "specimen",
  "sketch", "clipart", "artwork", "graphic"
]

export const PRODUCE_TAXONOMY = {
  // ==================== 1. VEGETABLES ====================
  tomato: {
    category: "vegetables",
    canonicalName: "Tomato",
    aliases: ["tomato", "tomatoes", "tamatar", "thakkali", "tamata", "kamata"],
    searchQuery: "fresh red tomatoes isolated on a clean background",
    requiredKeywords: ["tomato", "tomatoes", "lycopersicum", "tamatar"],
    forbiddenKeywords: ["sauce", "paste", "ketchup", "pizza", "pasta", "soup", "puree", "curry", "salad", "cherry tomato sauce", "tree", "plant only"]
  },
  onion: {
    category: "vegetables",
    canonicalName: "Onion",
    aliases: ["onion", "onions", "red onion", "pyaz", "eerulli", "vengayam", "ullipayalu", "kanda"],
    searchQuery: "fresh red onion bulbs isolated on a clean background",
    requiredKeywords: ["onion", "onions", "allium cepa", "red onion", "yellow onion", "white onion"],
    forbiddenKeywords: ["garlic", "shallot", "shallots", "leek", "leeks", "curry", "rings", "fried", "soup", "pickle", "powder"]
  },
  potato: {
    category: "vegetables",
    canonicalName: "Potato",
    aliases: ["potato", "potatoes", "aloo", "alu", "alugadde", "urulaikizhangu", "bangaladumpa", "batata"],
    searchQuery: "fresh raw potatoes isolated on a clean background",
    requiredKeywords: ["potato", "potatoes", "tuberosum", "spud", "spuds"],
    forbiddenKeywords: ["french fries", "fries", "chips", "crisps", "mashed", "curry", "cooked", "salad", "peeled"]
  },
  cabbage: {
    category: "vegetables",
    canonicalName: "Cabbage",
    aliases: ["cabbage", "patta gobhi", "bandha gobhi", "muttakose", "kosu", "cabbages"],
    searchQuery: "fresh green cabbage head isolated on a clean background",
    requiredKeywords: ["cabbage", "cabbages", "brassica oleracea"],
    forbiddenKeywords: ["cooked", "slaw", "coleslaw", "curry", "salad", "soup", "stew", "sauerkraut", "basket", "bowl"]
  },
  cauliflower: {
    category: "vegetables",
    canonicalName: "Cauliflower",
    aliases: ["cauliflower", "phool gobhi", "gobi", "hookosu", "cauliflowers"],
    searchQuery: "fresh white cauliflower head isolated on a clean background",
    requiredKeywords: ["cauliflower", "cauliflowers", "botrytis"],
    forbiddenKeywords: ["manchurian", "curry", "cooked", "fried", "battered", "soup"]
  },
  carrot: {
    category: "vegetables",
    canonicalName: "Carrot",
    aliases: ["carrot", "carrots", "gajar", "gajjari"],
    searchQuery: "fresh raw carrots isolated on a clean background",
    requiredKeywords: ["carrot", "carrots", "daucus carota"],
    forbiddenKeywords: ["halwa", "juice", "cooked", "cake", "soup", "curry", "baby carrot peeled"]
  },
  okra: {
    category: "vegetables",
    canonicalName: "Okra",
    aliases: ["okra", "ladies finger", "lady finger", "bhindi", "bhendi", "vendakkai", "bende", "bendakaya"],
    searchQuery: "fresh green okra ladies finger pods isolated on a clean background",
    requiredKeywords: ["okra", "ladies finger", "lady finger", "gumbo", "esculentus", "bhindi", "bhendi"],
    forbiddenKeywords: ["chili", "chilli", "pepper", "peppers", "fried", "curry", "dish", "cooked", "stew", "battered", "sliced", "bowl", "basket"]
  },
  brinjal: {
    category: "vegetables",
    canonicalName: "Brinjal / Eggplant",
    aliases: ["brinjal", "eggplant", "aubergine", "baingan", "badanekai", "kathirikai", "vankaya", "solanum melongena"],
    searchQuery: "fresh purple brinjal eggplant vegetable isolated on a clean background",
    requiredKeywords: ["brinjal", "eggplant", "aubergine", "melongena", "baingan", "badanekai", "kathirikai", "vankaya"],
    forbiddenKeywords: ["chili", "chilli", "pepper", "peppers", "curry", "dip", "cooked", "bharta", "fried", "parmigiana", "grilled", "plant only", "leaves only"]
  },
  capsicum: {
    category: "vegetables",
    canonicalName: "Capsicum",
    aliases: ["capsicum", "bell pepper", "shimla mirch", "doddamenasinakai", "kudaikaai"],
    searchQuery: "fresh green bell pepper capsicum isolated on a clean background",
    requiredKeywords: ["capsicum", "bell pepper", "peppers", "sweet pepper"],
    forbiddenKeywords: ["pizza", "cooked", "curry", "salad", "powder", "paprika"]
  },
  cucumber: {
    category: "vegetables",
    canonicalName: "Cucumber",
    aliases: ["cucumber", "cucumbers", "kheera", "kakdi", "southekayi", "vellarikkai", "dosakaya"],
    searchQuery: "fresh green cucumber vegetable isolated on a clean background",
    requiredKeywords: ["cucumber", "cucumbers", "sativus", "kheera"],
    forbiddenKeywords: ["salad", "pickled", "pickle", "sliced", "cucumber water", "cosmetic", "facial"]
  },
  drumstick: {
    category: "vegetables",
    canonicalName: "Drumstick",
    aliases: ["drumstick", "drumsticks", "moringa", "sahjan", "nuggekayi", "murungakkai", "munakkaya"],
    searchQuery: "fresh moringa pods isolated on a clean background",
    requiredKeywords: ["moringa", "drumstick", "drumsticks", "oleifera"],
    forbiddenKeywords: ["tree", "trees", "hanging on tree", "hanging from tree", "sambar", "curry", "powder", "tea", "supplement"]
  },
  "bitter gourd": {
    category: "vegetables",
    canonicalName: "Bitter Gourd / Bitter Melon",
    aliases: ["bitter gourd", "bitter melon", "karela", "hagalakayi", "pavakkai", "kakarakaya", "momordica charantia"],
    searchQuery: "fresh green bitter gourd vegetable isolated on a clean background",
    requiredKeywords: ["bitter gourd", "bitter melon", "karela", "hagalakayi", "pavakkai", "kakarakaya", "momordica", "charantia"],
    forbiddenKeywords: [
      "ash gourd", "winter melon", "bottle gourd", "lauki", "ridge gourd", "snake gourd",
      "pumpkin", "cucumber", "zucchini", "squash", "fried", "curry", "cooked", "juice"
    ]
  },
  "ridge gourd": {
    category: "vegetables",
    canonicalName: "Ridge Gourd / Luffa",
    aliases: ["ridge gourd", "ridgeguard", "tori", "turai", "beerakaya", "hirekayi", "peerkangai", "luffa acutangula"],
    searchQuery: "fresh green ridge gourd vegetable isolated on a clean background",
    requiredKeywords: ["ridge gourd", "luffa", "tori", "turai", "acutangula", "sponge gourd", "hirekayi", "beerakaya", "peerkangai"],
    forbiddenKeywords: [
      "ash gourd", "bitter gourd", "bottle gourd", "snake gourd", "cucumber", "zucchini",
      "pumpkin", "curry", "chutney", "cooked"
    ]
  },
  "bottle gourd": {
    category: "vegetables",
    canonicalName: "Bottle Gourd",
    aliases: ["bottle gourd", "lauki", "doodhi", "ghiya", "sorekayi", "surakkai", "sorakaya", "calabash", "lagenaria siceraria"],
    searchQuery: "fresh green bottle gourd vegetable isolated on a clean background",
    requiredKeywords: ["bottle gourd", "lauki", "calabash", "lagenaria", "siceraria", "sorekayi", "surakkai", "sorakaya"],
    forbiddenKeywords: [
      "ash gourd", "winter melon", "cucumber", "zucchini", "squash", "pumpkin", "bitter gourd",
      "ridge gourd", "snake gourd", "curry", "halwa", "juice", "cooked"
    ]
  },
  "ash gourd": {
    category: "vegetables",
    canonicalName: "Ash Gourd / Wax Gourd",
    aliases: [
      "ash gourd", "ashgourd", "winter melon", "wax gourd", "white gourd",
      "petha", "kumbalakai", "kumbalanga", "boodida gummadikaya", "neer poosanikai", "benincasa hispida"
    ],
    searchQuery: "fresh ash gourd winter melon vegetable isolated on a clean background",
    requiredKeywords: ["ash gourd", "winter melon", "wax gourd", "white gourd", "benincasa", "hispida", "petha", "kumbalakai", "kumbalanga"],
    forbiddenKeywords: [
      "bitter gourd", "bitter melon", "karela", "bottle gourd", "lauki", "calabash",
      "snake gourd", "ridge gourd", "sponge gourd", "pumpkin", "cucumber", "zucchini", "squash",
      "sweet", "candy", "candied", "curry", "cooked", "halwa"
    ]
  },
  "snake gourd": {
    category: "vegetables",
    canonicalName: "Snake Gourd",
    aliases: [
      "snake gourd", "snakegourd", "snakeguard", "snake guard", "chichinda",
      "padavalakai", "padavalkayi", "pudalangai", "potlakaya",
      "trichosanthes cucumerina", "trichosanthes"
    ],
    searchQuery: "fresh green snake gourd vegetable isolated on a clean background",
    requiredKeywords: ["snake gourd", "snakegourd", "snakeguard", "snake guard", "trichosanthes", "cucumerina", "chichinda", "padavalakai", "padavalkayi", "pudalangai", "potlakaya"],
    forbiddenKeywords: [
      "bitter gourd", "ash gourd", "bottle gourd", "ridge gourd", "cucumber", "zucchini",
      "pumpkin", "snake", "reptile", "curry", "cooked"
    ]
  },
  spinach: {
    category: "vegetables",
    canonicalName: "Spinach",
    aliases: ["spinach", "palak", "soppu", "keerai", "kura"],
    searchQuery: "fresh green spinach leaves isolated on a clean background",
    requiredKeywords: ["spinach", "palak", "oleracea", "leafy green"],
    forbiddenKeywords: ["cooked", "paneer", "soup", "curry", "smoothie", "dip"]
  },
  beans: {
    category: "vegetables",
    canonicalName: "Green Beans / French Beans",
    aliases: [
      "beans", "green beans", "french beans", "frasbean", "string beans", "snap beans",
      "hurulikayi", "pharas bi", "huralikayi", "phaseolus vulgaris"
    ],
    searchQuery: "fresh green beans pods vegetable isolated on a clean background",
    requiredKeywords: ["green beans", "french beans", "beans", "phaseolus", "string beans", "snap beans", "hurulikayi", "frasbean"],
    forbiddenKeywords: [
      "white round fruit", "citrus", "orange", "lemon", "apple", "grape", "tomato",
      "cooked", "canned", "baked beans", "coffee beans", "soybean", "kidney beans dried",
      "black beans dried", "pinto beans", "curry", "salad", "tree"
    ]
  },
  thogarikai: {
    category: "vegetables",
    canonicalName: "Cluster Beans (Thogarikai / Guar)",
    aliases: [
      "thogarikai", "thogrikai", "cluster beans", "cluster bean", "guar", "gawar", "gavar",
      "gorikayi", "gorikai", "kothavarangai", "kothavara", "cyamopsis tetragonoloba"
    ],
    searchQuery: "fresh cluster beans pods vegetable isolated on a clean background",
    requiredKeywords: ["cluster beans", "guar", "gavar", "gawar", "cyamopsis", "thogarikai", "gorikayi", "kothavarangai"],
    forbiddenKeywords: [
      "french beans", "kidney beans", "coffee", "cooked", "curry", "gum", "powder", "tree"
    ]
  },
  amaranthus: {
    category: "vegetables",
    canonicalName: "Amaranthus",
    aliases: [
      "amaranthus", "amaranth", "red amaranthus", "green amaranthus",
      "chaulai", "dantu", "thotakura", "keerai", "rajgira leaves",
      "amaranthus tricolor", "amaranthus viridis"
    ],
    searchQuery: "fresh green amaranthus leafy vegetable bunch isolated on a clean background",
    requiredKeywords: ["amaranthus", "amaranth", "chaulai", "dantu", "thotakura", "keerai"],
    forbiddenKeywords: [
      "flower", "flowers", "bloom", "blooms", "grain", "grains", "seed", "seeds",
      "inflorescence", "spikes", "cereal", "porridge", "tree", "cooked", "curry", "soup"
    ]
  },


  // ==================== 2. FRUITS ====================
  mango: {
    category: "fruits",
    canonicalName: "Mango",
    aliases: ["mango", "mangoes", "mangos", "aam", "mavinahannu", "maangai", "mamidi"],
    searchQuery: "fresh ripe mango fruit isolated on a clean background",
    requiredKeywords: ["mango", "mangoes", "mangos", "mangifera"],
    forbiddenKeywords: ["tree", "orchard", "branch", "smoothie", "shake", "juice", "slice", "pickle", "dessert", "chutney", "ice cream"]
  },
  banana: {
    category: "fruits",
    canonicalName: "Banana",
    aliases: ["banana", "bananas", "kela", "bale hannu", "vazhaipazham", "arati", "ripe banana", "yellow banana"],
    searchQuery: "fresh yellow banana bunch fruit isolated on a clean background",
    requiredKeywords: ["banana", "bananas", "musa"],
    forbiddenKeywords: ["tree", "plantation", "leaves only", "bread", "pancake", "pancakes", "peeled", "slice", "smoothie", "chips", "split"]
  },
  "green banana": {
    category: "fruits",
    canonicalName: "Green Banana / Plantain",
    aliases: [
      "green banana", "banana - green", "banana green", "banana raw", "raw banana", "plantain", "cooking banana",
      "baalekayi", "vazhaikkai", "kachha kela", "kachcha kela", "pachcha arati"
    ],
    searchQuery: "fresh unripe green banana fruit isolated on a clean background",
    requiredKeywords: ["banana", "plantain", "musa", "green banana"],
    forbiddenKeywords: ["yellow", "ripe", "tree", "plantation", "bread", "pancake", "peeled", "slice", "chips", "split", "cooked"]
  },
  apple: {
    category: "fruits",
    canonicalName: "Apple",
    aliases: ["apple", "apples", "seb", "sebu", "aappil"],
    searchQuery: "fresh red apples isolated on a clean background",
    requiredKeywords: ["apple", "apples", "malus"],
    forbiddenKeywords: ["tree", "orchard", "branch", "iphone", "ipad", "macbook", "laptop", "watch", "computer", "logo", "tech", "pie", "juice", "cider"]
  },
  pomegranate: {
    category: "fruits",
    canonicalName: "Pomegranate",
    aliases: ["pomegranate", "pomegranates", "anar", "dalimbe", "maadhulai", "danimma"],
    searchQuery: "fresh whole and cut pomegranate fruits isolated on a clean background",
    requiredKeywords: ["pomegranate", "pomegranates", "granatum", "anar"],
    forbiddenKeywords: ["tree", "trees", "branch", "flower only", "juice", "cocktail", "salad", "seeds scattered", "dessert"]
  },
  papaya: {
    category: "fruits",
    canonicalName: "Papaya",
    aliases: ["papaya", "papayas", "papita", "parangi", "pappali", "boppayi", "carica papaya"],
    searchQuery: "fresh ripe whole and cut papaya fruit with seeds isolated on a clean background",
    requiredKeywords: ["papaya", "papayas", "pawpaw", "carica"],
    forbiddenKeywords: ["tree", "trees", "orchard", "salad", "smoothie", "slice only yellow monochrome", "dessert", "facial", "leaves only", "seedling", "dish", "curry"]
  },
  guava: {
    category: "fruits",
    canonicalName: "Guava",
    aliases: ["guava", "guavas", "amrood", "seebekayi", "koyyapazham", "jama"],
    searchQuery: "fresh green guava fruit isolated on a clean background",
    requiredKeywords: ["guava", "guavas", "psidium"],
    forbiddenKeywords: ["leaf", "leaves", "leafbud", "bud", "foliage", "tree", "trees", "branch", "branches", "garden", "orchard", "plantation", "juice", "jam", "jelly", "smoothie"]
  },
  watermelon: {
    category: "fruits",
    canonicalName: "Watermelon",
    aliases: ["watermelon", "watermelons", "tarbooz", "kallangadi", "tharpoos", "puchakaya"],
    searchQuery: "fresh whole watermelon fruit isolated on a clean background",
    requiredKeywords: ["watermelon", "watermelons", "citrullus lanatus"],
    forbiddenKeywords: ["garden", "gardens", "farm", "farmland", "field", "fields", "patch", "tree", "plant", "foliage", "slice", "slices", "juice", "cocktail", "smoothie", "popsicle"]
  },
  grapes: {
    category: "fruits",
    canonicalName: "Grapes",
    aliases: ["grapes", "grape", "angoor", "drakshi", "thiratchai", "draksha"],
    searchQuery: "fresh ripe grapes bunch isolated on a clean background",
    requiredKeywords: ["grape", "grapes", "vitis"],
    forbiddenKeywords: ["vineyard", "wine", "winery", "glass", "bottle", "raisin", "raisins", "juice"]
  },
  mosambi: {
    category: "fruits",
    canonicalName: "Mosambi / Sweet Lime",
    aliases: ["mosambi", "sweet lime", "citrus limetta", "moushumi", "battayi", "sathukudi"],
    searchQuery: "fresh Indian sweet lime fruit isolated on a clean background",
    requiredKeywords: ["sweet lime", "limetta", "mosambi", "lime", "citrus"],
    forbiddenKeywords: ["tree", "lemon", "orange", "juice", "drink", "cocktail", "salad"]
  },
  coconut: {
    category: "fruits",
    canonicalName: "Coconut",
    aliases: ["coconut", "coconuts", "copra", "mature coconut", "nariyal", "tenginakayi", "thengai", "kobbari", "cocos nucifera"],
    searchQuery: "whole mature coconut fruit and cracked half white flesh isolated on a clean background",
    requiredKeywords: ["coconut", "coconuts", "copra", "nucifera"],
    forbiddenKeywords: [
      "tree", "trees", "palm", "seedling", "sprout", "oil", "drink", "cocktail",
      "milk", "coconut milk", "beach", "grated", "shredded", "chutney", "rice",
      "coconut rice", "curry", "cooked", "dish", "sweet", "barfi", "dessert"
    ]
  },
  "tender coconut": {
    category: "fruits",
    canonicalName: "Tender Coconut",
    aliases: [
      "tender coconut", "green coconut", "elnir", "elaneer", "daab",
      "tender coconut water", "green tender coconut", "tender coconuts"
    ],
    searchQuery: "fresh green tender coconut fruit isolated on a clean background",
    requiredKeywords: ["tender coconut", "green coconut", "coconut", "elnir", "elaneer", "daab"],
    forbiddenKeywords: [
      "brown", "mature", "copra", "grated", "shredded", "tree", "stall", "roadside",
      "bike", "motorcycle", "curry", "cooked", "dish", "milk"
    ]
  },
  tamarind: {
    category: "fruits",
    canonicalName: "Tamarind",
    aliases: ["tamarind", "tamarinds", "imli", "hunasehannu", "hunase", "puli", "chintapandu", "tamarindus indica"],
    searchQuery: "fresh tamarind pods and fruit pulp isolated on a clean background",
    requiredKeywords: ["tamarind", "tamarinds", "tamarindus", "imli", "hunasehannu", "puli", "chintapandu"],
    forbiddenKeywords: [
      "rice", "tamarind rice", "curry", "chutney", "sambar", "paste", "sauce",
      "candy", "dish", "cooked", "soup", "tree", "trees", "branch"
    ]
  },
  chikoo: {
    category: "fruits",
    canonicalName: "Chikoo / Sapodilla",
    aliases: ["chikoo", "chiku", "sapota", "sapodilla", "manilkara zapota"],
    searchQuery: "fresh sapodilla chikoo fruit isolated on a clean background",
    requiredKeywords: ["chikoo", "chiku", "sapota", "sapodilla", "zapota"],
    forbiddenKeywords: ["tree", "branch", "shake", "smoothie", "ice cream"]
  },
  amla: {
    category: "fruits",
    canonicalName: "Amla / Indian Gooseberry",
    aliases: ["amla", "indian gooseberry", "phyllanthus emblica", "nelli kai", "nellikai", "usirikaya", "amlakhi"],
    searchQuery: "fresh Indian gooseberry amla fruit isolated on a clean background",
    requiredKeywords: ["amla", "gooseberry", "emblica"],
    forbiddenKeywords: ["powder", "candy", "pickle", "oil", "tree", "branch", "juice"]
  },

  // ==================== 3. FLOWERS ====================
  jasmine: {
    category: "flowers",
    canonicalName: "Jasmine / Mogra",
    aliases: ["jasmine", "jasminum sambac", "mogra", "gundu malli", "malli", "mallepuvu", "chameli", "jasminum"],
    searchQuery: "fresh white jasmine flowers and buds isolated on a clean background",
    requiredKeywords: ["jasmine", "jasminum", "mogra", "malli", "chameli"],
    forbiddenKeywords: ["tea", "perfume", "oil", "bottle", "lotion", "plant only", "leaves only", "shrub", "tree", "garden only"]
  },
  marigold: {
    category: "flowers",
    canonicalName: "Marigold",
    aliases: ["marigold", "marigolds", "genda", "chendu hoovu", "samangi", "banthi puvvu", "tagetes", "tagetes erecta"],
    searchQuery: "fresh orange yellow marigold flowers isolated on a clean background",
    requiredKeywords: ["marigold", "marigolds", "tagetes", "genda"],
    forbiddenKeywords: ["tea", "oil", "field", "garden only", "seeds only", "plant only", "leaves only", "salad"]
  },
  rose: {
    category: "flowers",
    canonicalName: "Rose",
    aliases: ["rose", "roses", "gulab", "roja", "gulabi", "rosa"],
    searchQuery: "fresh red rose flowers isolated on a clean background",
    requiredKeywords: ["rose", "roses", "rosa", "gulab", "roja"],
    forbiddenKeywords: ["wine", "tea", "perfume", "water", "petal only scattered", "bush", "garden only", "plant only", "leaves only"]
  },
  chrysanthemum: {
    category: "flowers",
    canonicalName: "Chrysanthemum",
    aliases: ["chrysanthemum", "chrysanthemums", "shevanti", "sevanthi", "chamanti"],
    searchQuery: "fresh chrysanthemum flower blossoms isolated on a clean background",
    requiredKeywords: ["chrysanthemum", "chrysanthemums", "shevanti", "sevanthi", "chamanti"],
    forbiddenKeywords: ["tea", "drink", "garden only", "bush", "leaves only", "plant only"]
  },
  carnation: {
    category: "flowers",
    canonicalName: "Carnation",
    aliases: ["carnation", "carnations", "dianthus caryophyllus", "clove pink"],
    searchQuery: "fresh carnation flower blossoms isolated on a clean background",
    requiredKeywords: ["carnation", "carnations", "dianthus"],
    forbiddenKeywords: ["garden only", "bush", "leaves only", "plant only", "tea"]
  },
  gerbera: {
    category: "flowers",
    canonicalName: "Gerbera",
    aliases: ["gerbera", "gerberas", "transvaal daisy", "gerbera daisy", "barberton daisy"],
    searchQuery: "fresh colorful gerbera flower daisy isolated on a clean background",
    requiredKeywords: ["gerbera", "gerberas"],
    forbiddenKeywords: ["garden only", "bush", "leaves only", "plant only"]
  },
  gladiolus: {
    category: "flowers",
    canonicalName: "Gladiolus",
    aliases: ["gladiolus", "gladioli", "sword lily"],
    searchQuery: "fresh gladiolus flower spikes blossoms isolated on a clean background",
    requiredKeywords: ["gladiolus", "gladioli"],
    forbiddenKeywords: ["garden only", "bush", "leaves only", "plant only"]
  },
  lotus: {
    category: "flowers",
    canonicalName: "Lotus",
    aliases: ["lotus", "kamal", "tamara", "nelumbo nucifera", "water lily"],
    searchQuery: "fresh sacred pink lotus flower blossom isolated on a clean background",
    requiredKeywords: ["lotus", "nelumbo", "kamal"],
    forbiddenKeywords: ["root only", "stem only", "seeds only", "tea", "lake only", "pond only", "leaves only"]
  },
  orchid: {
    category: "flowers",
    canonicalName: "Orchid",
    aliases: ["orchid", "orchids", "orchidaceae"],
    searchQuery: "fresh exotic orchid flower blossom isolated on a clean background",
    requiredKeywords: ["orchid", "orchids", "orchidaceae"],
    forbiddenKeywords: ["jungle", "forest", "bark only", "pot only", "plant only without flower", "leaves only"]
  },
  tulip: {
    category: "flowers",
    canonicalName: "Tulip",
    aliases: ["tulip", "tulips", "tulipa"],
    searchQuery: "fresh tulip flower blossoms isolated on a clean background",
    requiredKeywords: ["tulip", "tulips", "tulipa"],
    forbiddenKeywords: ["field", "fields", "keukenhof", "bulb only", "leaves only", "plant only"]
  },
  tuberose: {
    category: "flowers",
    canonicalName: "Tuberose",
    aliases: ["tuberose", "rajanigandha", "sugandharaja", "polianthes tuberosa", "agave amica"],
    searchQuery: "fresh white tuberose flower spikes rajanigandha isolated on a clean background",
    requiredKeywords: ["tuberose", "rajanigandha", "polianthes"],
    forbiddenKeywords: ["perfume", "oil", "bulb only", "plant only", "leaves only"]
  },
  crossandra: {
    category: "flowers",
    canonicalName: "Crossandra",
    aliases: ["crossandra", "kanakambaram", "firecracker flower", "crossandra infundibuliformis"],
    searchQuery: "fresh orange crossandra flowers kanakambaram isolated on a clean background",
    requiredKeywords: ["crossandra", "kanakambaram"],
    forbiddenKeywords: ["bush", "garden only", "plant only", "leaves only"]
  },

  // ==================== 4. GRAINS & CEREALS ====================
  wheat: {
    category: "grains",
    canonicalName: "Wheat",
    aliases: ["wheat", "gehu", "godhi", "godhumai", "godhumalu"],
    searchQuery: "golden wheat crop ears grain isolated on a clean background",
    requiredKeywords: ["wheat", "triticum", "grain", "ears", "cereal"],
    forbiddenKeywords: ["bread", "flour", "pasta", "bakery", "noodle", "noodles", "cake", "cookie", "dough", "beer", "field"]
  },
  rice: {
    category: "grains",
    canonicalName: "Paddy / Rice",
    aliases: ["rice", "paddy", "dhan", "chawal", "bhatta", "arisi", "vari", "nellu"],
    searchQuery: "paddy rice harvest grains isolated on a clean background",
    requiredKeywords: ["paddy", "rice", "grain", "grains", "oryza"],
    forbiddenKeywords: ["cooked", "bowl", "fried rice", "biryani", "pulao", "curry", "sushi", "flour", "field"]
  },
  maize: {
    category: "grains",
    canonicalName: "Maize / Corn",
    aliases: ["maize", "corn", "bhutta", "makka", "makkajola", "makka cholam", "mokka jonna"],
    searchQuery: "fresh yellow maize corn cob isolated on a clean background",
    requiredKeywords: ["maize", "corn", "cob", "zea mays"],
    forbiddenKeywords: ["popcorn", "cornflakes", "chips", "canned", "syrup", "soup", "salad", "field"]
  },
  ragi: {
    category: "grains",
    canonicalName: "Finger Millet / Ragi",
    aliases: ["ragi", "finger millet", "mandua", "kezhvaragu", "ragulu", "eleusine coracana"],
    searchQuery: "finger millet ragi seeds grain heads isolated on a clean background",
    requiredKeywords: ["ragi", "finger millet", "eleusine", "coracana"],
    forbiddenKeywords: ["dosa", "mudde", "roti", "malt", "porridge", "powder", "flour", "field"]
  },
  jowar: {
    category: "grains",
    canonicalName: "Sorghum / Jowar",
    aliases: ["jowar", "sorghum", "jola", "cholam", "jonnalu", "sorghum bicolor"],
    searchQuery: "sorghum jowar grain head isolated on a clean background",
    requiredKeywords: ["sorghum", "jowar", "bicolor", "great millet"],
    forbiddenKeywords: ["roti", "flour", "syrup", "bread", "field"]
  },
  bajra: {
    category: "grains",
    canonicalName: "Pearl Millet / Bajra",
    aliases: ["bajra", "pearl millet", "sajje", "kambu", "sajjalu", "pennisetum glaucum"],
    searchQuery: "pearl millet bajra crop heads isolated on a clean background",
    requiredKeywords: ["bajra", "pearl millet", "pennisetum", "glaucum"],
    forbiddenKeywords: ["roti", "khichdi", "flour", "field"]
  },

  // ==================== 5. PULSES & LEGUMES ====================
  chickpea: {
    category: "pulses",
    canonicalName: "Chickpea / Bengal Gram",
    aliases: ["chickpea", "chickpeas", "chana", "bengal gram", "kadale", "kothukadala", "senagalu", "cicer arietinum"],
    searchQuery: "raw dried chickpeas bengal gram chana isolated on a clean background",
    requiredKeywords: ["chickpea", "chickpeas", "chana", "bengal gram", "cicer", "garbanzo"],
    forbiddenKeywords: ["hummus", "curry", "cooked", "flour", "besan", "fried", "bowl", "plate"]
  },
  moong: {
    category: "pulses",
    canonicalName: "Green Gram / Moong",
    aliases: ["moong", "green gram", "mung", "mung bean", "hesarukalu", "pasi payiru", "pesalu", "vigna radiata"],
    searchQuery: "dry whole green mung beans pulses grains isolated on a clean background",
    requiredKeywords: ["mung", "moong", "green gram", "radiata", "hesarukalu"],
    forbiddenKeywords: [
      "bengal gram", "chana", "chickpea", "sprouts salad", "cooked", "dal curry", "halwa",
      "pancake", "soup", "bowl"
    ]
  },
  avare: {
    category: "pulses",
    canonicalName: "Hyacinth Bean / Avare Dal",
    aliases: [
      "avare", "avare dal", "avarekalu", "avarekai", "hyacinth bean", "field bean",
      "mochai", "chikkudu", "lablab purpureus", "lablab"
    ],
    searchQuery: "fresh hyacinth bean pods isolated on a clean background",
    requiredKeywords: ["hyacinth bean", "lablab", "avare", "avarekalu", "field bean", "mochai"],
    forbiddenKeywords: ["cooked", "curry", "sambar", "dish", "bowl"]
  },
  urad: {
    category: "pulses",
    canonicalName: "Black Gram / Urad",
    aliases: ["urad", "black gram", "urad dal", "uddina bele", "ulunthu", "minamalu", "vigna mungo"],
    searchQuery: "raw whole black gram urad dal pulses isolated on a clean background",
    requiredKeywords: ["urad", "black gram", "mungo", "ulunthu"],
    forbiddenKeywords: ["vada", "dal makhani", "dosa", "idli", "cooked", "curry", "bowl"]
  },
  toor: {
    category: "pulses",
    canonicalName: "Pigeon Pea / Toor",
    aliases: ["toor", "arhar", "pigeon pea", "toor dal", "arhar dal", "togari bele", "tuvaram paruppu", "kandi pappu", "cajanus cajan"],
    searchQuery: "raw yellow pigeon pea toor dal grains isolated on a clean background",
    requiredKeywords: ["toor", "arhar", "pigeon pea", "cajan", "cajanus"],
    forbiddenKeywords: ["cooked", "sambar", "curry", "tadka", "soup", "bowl"]
  },

  // ==================== 6. SPICES ====================
  ginger: {
    category: "spices",
    canonicalName: "Ginger",
    aliases: [
      "ginger", "ginger green", "ginger dry", "adrak", "shunti", "inji", "allam",
      "zingiber officinale", "fresh ginger", "dry ginger"
    ],
    searchQuery: "fresh raw ginger rhizome root isolated on a clean background",
    requiredKeywords: ["ginger", "rhizome", "zingiber", "adrak", "shunti", "inji", "allam"],
    forbiddenKeywords: ["gingerbread", "cookie", "cookies", "ale", "tea", "candy", "snap", "powder", "capsule"]
  },
  ginger: {
    category: "spices",
    canonicalName: "Ginger / Green Ginger",
    aliases: ["ginger", "green ginger", "ginger green", "adrak", "shunti", "inji", "allam", "zingiber officinale"],
    searchQuery: "fresh raw ginger rhizome root isolated on a clean background",
    requiredKeywords: ["ginger", "rhizome", "zingiber", "adrak", "shunti"],
    forbiddenKeywords: [
      "forest", "tree", "plant only", "landscape", "wild", "foliage", "tea",
      "beer", "ale", "cookie", "bread", "candy", "powder", "oil", "dish", "curry"
    ]
  },

  garlic: {
    category: "spices",
    canonicalName: "Garlic",
    aliases: ["garlic", "lehsun", "bellulli", "poondu", "vellulli"],
    searchQuery: "fresh raw garlic bulbs cloves isolated on a clean background",
    requiredKeywords: ["garlic", "cloves", "allium sativum"],
    forbiddenKeywords: ["onion", "onions", "bread", "garlic bread", "powder", "oil", "sauce", "minced", "paste"]
  },
  "green chilli": {
    category: "spices",
    canonicalName: "Green Chilli",
    aliases: ["green chilli", "green chili", "green chilies", "hari mirch", "hasiru menasinakai", "pachai milagai", "pachi mirapa"],
    searchQuery: "fresh raw green chillies peppers isolated on a clean background",
    requiredKeywords: ["chilli", "chili", "chillies", "chilies", "pepper", "peppers"],
    forbiddenKeywords: ["powder", "sauce", "cooked", "dish", "curry", "red", "paste", "bottle"]
  },
  turmeric: {
    category: "spices",
    canonicalName: "Turmeric",
    aliases: ["turmeric", "haldi", "arishina", "manjal", "pasupu"],
    searchQuery: "fresh raw turmeric root rhizome isolated on a clean background",
    requiredKeywords: ["turmeric", "curcuma", "rhizome"],
    forbiddenKeywords: ["latte", "powder", "capsule", "supplement", "soap", "curry", "cosmetic"]
  },
  cardamom: {
    category: "spices",
    canonicalName: "Cardamom",
    aliases: ["cardamom", "cardamoms", "elaichi", "yelakki", "elakkai", "yelakulu"],
    searchQuery: "green cardamom pods spice isolated on a clean background",
    requiredKeywords: ["cardamom", "cardamoms", "elaichi", "elettaria"],
    forbiddenKeywords: ["tea", "chai", "curry", "powder", "coffee", "sweet", "dessert", "bean", "beans", "pea", "peas"]
  },
  sesame: {
    category: "spices",
    canonicalName: "Sesame / Til",
    aliases: [
      "sesame", "sesame seeds", "sesamum", "til", "gingelly", "ellu", "nuvvulu",
      "sesamum indicum", "white sesame", "black sesame"
    ],
    searchQuery: "raw sesame seeds produce isolated on a clean background",
    requiredKeywords: ["sesame", "sesamum", "indicum", "til", "gingelly", "ellu", "nuvvulu"],
    forbiddenKeywords: [
      "mustard", "flax", "chia", "sunflower", "pumpkin seed", "burger", "bun", "buns",
      "bread", "tahini", "oil", "bottle", "candy", "halwa", "snack", "flower", "blossom", "seedling"
    ]
  },
  mustard: {
    category: "spices",
    canonicalName: "Mustard Seeds",
    aliases: ["mustard", "mustard seeds", "sarson", "rai", "sasive", "kadugu", "aavalu", "brassica nigra", "brassica juncea"],
    searchQuery: "raw whole mustard seeds spice isolated on a clean background",
    requiredKeywords: ["mustard", "sarson", "rai", "kadugu", "sasive", "brassica", "aavalu"],
    forbiddenKeywords: ["sauce", "paste", "dijon", "hot dog", "bottle", "oil", "greens", "cooked", "leaves"]
  },

  // ==================== 7. ROOTS & TUBERS ====================
  "sweet potato": {
    category: "roots",
    canonicalName: "Sweet Potato",
    aliases: ["sweet potato", "sweet potatoes", "shakarkand", "sihigenasu", "sakkaravalli kizhangu", "chilagada dumpa"],
    searchQuery: "fresh raw sweet potato tubers isolated on a clean background",
    requiredKeywords: ["sweet potato", "sweet potatoes", "ipomoea batatas"],
    forbiddenKeywords: ["fries", "pie", "baked", "cooked", "casserole", "mashed", "soil"]
  },
  "elephant foot yam": {
    category: "roots",
    canonicalName: "Elephant Foot Yam",
    aliases: ["elephant foot yam", "elephant yam", "suran", "jimikand", "suvarnagadde", "senai kizhangu", "kanda gadda"],
    searchQuery: "elephant foot yam suran tuber isolated on a clean background",
    requiredKeywords: ["yam", "amorphophallus", "suran", "tuber"],
    forbiddenKeywords: ["curry", "cooked", "fried", "dish", "stew"]
  },
  radish: {
    category: "roots",
    canonicalName: "Radish",
    aliases: [
      "radish", "raddish", "mooli", "moolangi", "mullangi", "white radish",
      "daikon", "raphanus sativus"
    ],
    searchQuery: "fresh white daikon radish root isolated on a clean background",
    requiredKeywords: ["radish", "radishes", "mooli", "mullangi", "moolangi", "raphanus sativus", "daikon"],
    forbiddenKeywords: ["beetroot", "beet", "turnip", "garlic", "salad", "pickled", "pickle", "sliced", "curry", "paratha", "soil"]
  },
  beetroot: {
    category: "roots",
    canonicalName: "Beetroot",
    aliases: ["beetroot", "beet", "beets", "chukandar"],
    searchQuery: "fresh raw red beetroot root isolated on a clean background",
    requiredKeywords: ["beetroot", "beet", "beets", "beta vulgaris"],
    forbiddenKeywords: ["juice", "salad", "pickled", "pickle", "cooked", "soup", "sliced", "soil"]
  }
,
  // ==================== 8. FIBERS & CASH CROPS ====================
  cotton: {
    category: "fibers",
    canonicalName: "Cotton",
    aliases: ["cotton", "kappas", "kapas", "raw cotton", "cotton bolls", "gossypium"],
    searchQuery: "harvested white raw cotton bolls and fiber isolated on a clean background",
    requiredKeywords: ["cotton", "bolls", "fiber", "fibre", "gossypium", "kapas"],
    forbiddenKeywords: [
      "field", "fields", "plantation", "truck", "trucks", "lorry", "warehouse",
      "clothes", "clothing", "textile", "shirt", "dress", "worker", "workers", "flower only", "yellow flower"
    ]
  }
}

/**
 * Clean and normalize a crop name string for taxonomy lookup.
 */
export function cleanCropName(raw) {
  return String(raw || "")
    .replace(/[()[\]{}/\\,._-]/g, " ")
    .replace(/\b(fresh|common|local|hybrid|grade\s*[a-c]?|desi|dry|wholesale)\b/gi, " ")
    .replace(/(?<!banana\s+)\braw\b(?!\s+(?:banana|plantain))/gi, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

/**
 * Automatically infers commodity category and correct marketable product form.
 * Supports present and future agricultural commodities.
 * @param {string} cropName - Canonical or common commodity name
 * @param {string} [explicitCategory] - Optional explicit category if already known
 * @returns {{ category: string, productForm: string, positiveKeywords: string[], forbiddenKeywords: string[] }}
 */
export function inferProduceCategoryAndForm(cropName, explicitCategory = "") {
  const clean = cleanCropName(cropName)
  const norm = clean.toLowerCase()
  const expCat = String(explicitCategory || "").toLowerCase()

  // 1. Flowers
  if (
    expCat.includes("flower") ||
    /\b(flower|flowers|rose|roses|jasmine|mogra|marigold|genda|chrysanthemum|shevanti|sevanthi|carnation|gerbera|gladiolus|lotus|kamal|orchid|tulip|tuberose|rajanigandha|crossandra|kanakambaram|lily|lilies|bloom|blooms|blossom|inflorescence|hibiscus|dahlia|aster|daisy|anthurium)\b/i.test(norm)
  ) {
    return {
      category: "flowers",
      productForm: "fresh flower blossoms and buds",
      positiveKeywords: ["flower", "flowers", "blossom", "blossoms", "bloom", "petal", "buds"],
      forbiddenKeywords: ["leaves only", "plant only", "shrub only", "bush", "garden only", "tea", "perfume", "oil bottle", "seedling", "curry", "cooked"]
    }
  }

  // 2. Fibers (excluding seeds like flax seed / cotton seed)
  if (
    !norm.includes("seed") && (
      expCat.includes("fiber") || expCat.includes("fibre") ||
      /\b(cotton|kappas|kapas|jute|coir|hemp|flax|fiber|fibre|sisal|mesta)\b/i.test(norm)
    )
  ) {
    return {
      category: "fibers",
      productForm: "harvested raw bolls and natural fiber",
      positiveKeywords: ["bolls", "fiber", "fibre", "raw", "harvested"],
      forbiddenKeywords: ["field", "fields", "truck", "lorry", "warehouse", "clothes", "clothing", "tshirt", "jeans", "fabric", "textile", "worker", "flower only"]
    }
  }

  // 3. Leafy Vegetables
  if (
    /\b(amaranthus|amaranth|chaulai|spinach|palak|coriander leaves|cilantro|mint|pudina|methi|fenugreek leaves|curry leaves|keerai|soppu|lettuce|cabbage|kale|greens)\b/i.test(norm)
  ) {
    return {
      category: "vegetables",
      productForm: "fresh edible green leaves bunch",
      positiveKeywords: ["leaf", "leaves", "greens", "leafy vegetable", "bunch"],
      forbiddenKeywords: ["flower", "flowers", "bloom", "grain", "seed spikes", "cereal", "porridge", "tree", "cooked", "curry", "soup"]
    }
  }

  // 4. Rhizomes, Roots & Tubers
  if (
    /\b(ginger|green ginger|adrak|shunti|inji|allam|turmeric|haldi|potato|aloo|radish|mooli|carrot|gajar|beetroot|yam|suran|jimikand|sweet potato|tapioca|cassava|colocasia|arbi|knol khol|kohlrabi)\b/i.test(norm)
  ) {
    return {
      category: "roots",
      productForm: "fresh raw harvested rhizome root tuber",
      positiveKeywords: ["rhizome", "root", "tuber", "raw", "harvested"],
      forbiddenKeywords: ["forest", "tree", "plant only", "landscape", "wild", "foliage", "cooked", "curry", "fry", "dish", "tea", "powder", "soil"]
    }
  }

  // 5. Pods & Leguminous Vegetables
  if (
    /\b(beans|french beans|green beans|cluster beans|guar|thogarikai|okra|bhindi|ladies finger|drumstick|moringa|peas|green peas|broad bean|cowpea)\b/i.test(norm)
  ) {
    return {
      category: "vegetables",
      productForm: "fresh harvested green vegetable pods",
      positiveKeywords: ["pod", "pods", "fresh", "vegetable"],
      forbiddenKeywords: ["tree", "flower only", "cooked", "curry", "fried", "canned", "soup", "stew", "sauce"]
    }
  }

  // 6. Fruits
  if (
    expCat.includes("fruit") ||
    /\b(papaya|coconut|tender coconut|tamarind|mango|banana|apple|guava|watermelon|melon|pomegranate|grapes|mosambi|sweet lime|lime|lemon|chikoo|sapota|amla|orange|pineapple|custard apple|sitaphal|fig|jackfruit|pear|peach|plum|cherry|dragon fruit|passion fruit|kiwi|avocado|strawberry)\b/i.test(norm)
  ) {
    const isTenderCoconut = norm.includes("tender coconut") || norm.includes("elaneer") || norm.includes("elnir")
    const isMatureCoconut = !isTenderCoconut && (norm.includes("coconut") || norm.includes("nariyal") || norm.includes("copra"))
    const isTamarind = norm.includes("tamarind") || norm.includes("imli") || norm.includes("hunase")
    const isPapaya = norm.includes("papaya") || norm.includes("papita")

    let forbidden = ["tree", "trees", "orchard", "branch", "cooked", "curry", "dessert", "juice", "jam"]
    if (isMatureCoconut) {
      forbidden.push("grated", "shredded", "milk", "coconut milk", "chutney", "rice", "coconut rice", "sweet", "barfi", "palm", "seedling", "beach")
    }
    if (isTenderCoconut) {
      forbidden.push("brown", "mature", "copra", "grated", "stall", "roadside", "bike", "motorcycle")
    }
    if (isTamarind) {
      forbidden.push("tamarind rice", "rice", "chutney", "sambar", "paste", "candy", "soup")
    }
    if (isPapaya) {
      forbidden.push("salad", "smoothie", "facial", "leaves only")
    }

    return {
      category: "fruits",
      productForm: isTenderCoconut
        ? "fresh green tender coconut fruit"
        : (isMatureCoconut
          ? "whole mature coconut fruit and cracked half"
          : (isTamarind
            ? "fresh tamarind pods and edible fruit pulp"
            : (isPapaya
              ? "fresh ripe whole and cut papaya fruit with seeds"
              : "fresh ripe fruit"))),
      positiveKeywords: ["fruit", "fruits", "fresh", "ripe"],
      forbiddenKeywords: forbidden
    }
  }

  // 7. Grains & Cereals
  if (
    expCat.includes("grain") || expCat.includes("cereal") ||
    /\b(wheat|rice|paddy|maize|corn|jowar|sorghum|bajra|ragi|finger millet|barley|oats|millet)\b/i.test(norm)
  ) {
    return {
      category: "grains",
      productForm: "harvested raw grains and ears",
      positiveKeywords: ["grain", "grains", "harvest", "cereal", "ears"],
      forbiddenKeywords: ["cooked", "bread", "flour", "pasta", "noodle", "noodles", "bakery", "porridge", "field"]
    }
  }

  // 8. Pulses & Legumes
  if (
    expCat.includes("pulse") || expCat.includes("legume") ||
    /\b(dal|gram|pulse|pulses|chana|bengal gram|green gram|moong|black gram|urad|toor|arhar|pigeon pea|masoor|lentil|soybean|soyabean|horse gram)\b/i.test(norm)
  ) {
    return {
      category: "pulses",
      productForm: "raw whole dried pulses seeds",
      positiveKeywords: ["pulses", "gram", "dal", "seeds", "raw"],
      forbiddenKeywords: ["curry", "cooked", "sprout", "soup", "stew", "flour", "batter", "fried"]
    }
  }

  // 9. Spices, Oilseeds & Condiments
  if (
    expCat.includes("spice") || expCat.includes("oilseed") || expCat.includes("seed") || norm.includes("seed") ||
    /\b(seed|seeds|flax seed|flaxseed|linseed|pepper|black pepper|cardamom|elaichi|clove|cinnamon|cumin|jeera|coriander seed|dhania|mustard|sarson|sesame|til|fenugreek seed|methi seed|fennel|saunf|nutmeg|mace)\b/i.test(norm)
  ) {
    return {
      category: "spices",
      productForm: "raw whole dried spices and seeds",
      positiveKeywords: ["spice", "seeds", "pods", "raw", "dry"],
      forbiddenKeywords: ["powder", "oil", "curry", "tea", "candy", "sauce", "bottle", "cooked"]
    }
  }

  // 10. General Vegetable Fallback
  return {
    category: expCat || "vegetables",
    productForm: `fresh ${clean} vegetable produce`,
    positiveKeywords: [clean, "produce", "fresh"],
    forbiddenKeywords: ["tree", "cooked", "dish", "curry", "fried", "salad", "recipe"]
  }
}

/**
 * Generates an accurate, professional product photography search query for any commodity.
 * Specifies the exact commodity name, marketable plant part, and clean background framing.
 */
export function generateSpecificSearchQuery(cropName, explicitCategory = "") {
  const clean = cleanCropName(cropName)
  const norm = clean.toLowerCase()

  // High-priority exact overrides for specific commodities
  if (norm.includes("tender coconut") || norm.includes("green coconut") || norm.includes("elaneer") || norm.includes("elnir") || norm.includes("daab")) {
    return "fresh green tender coconut fruit isolated on a clean background"
  }
  if (norm.includes("coconut") || norm.includes("copra") || norm.includes("nariyal") || norm.includes("tenginakayi") || norm.includes("thengai") || norm.includes("kobbari")) {
    return "whole mature coconut fruit and cracked half white flesh isolated on a clean background"
  }
  if (norm.includes("tamarind") || norm.includes("imli") || norm.includes("hunasehannu") || norm.includes("puli") || norm.includes("chintapandu")) {
    return "fresh tamarind pods and fruit pulp isolated on a clean background"
  }
  if (norm.includes("papaya") || norm.includes("papita") || norm.includes("parangi") || norm.includes("boppayi")) {
    return "fresh ripe whole and cut papaya fruit with seeds isolated on a clean background"
  }
  if (norm.includes("amaranthus") || norm.includes("amaranth") || norm.includes("chaulai") || norm.includes("dantu") || norm.includes("thotakura")) {
    return "fresh green amaranthus leafy vegetable bunch isolated on a clean background"
  }
  if (norm.includes("cotton") || norm.includes("kappas") || norm.includes("kapas")) {
    return "harvested white raw cotton bolls and fiber isolated on a clean background"
  }
  if (norm.includes("ginger") || norm.includes("adrak") || norm.includes("shunti") || norm.includes("inji") || norm.includes("allam")) {
    return "fresh raw ginger rhizome root isolated on a clean background"
  }
  if (norm.includes("jasmine") || norm.includes("mogra") || norm.includes("malli") || norm.includes("chameli")) {
    return "fresh white jasmine flowers and buds isolated on a clean background"
  }
  if (norm.includes("marigold") || norm.includes("genda") || norm.includes("chendu hoovu") || norm.includes("banthi")) {
    return "fresh orange yellow marigold flowers isolated on a clean background"
  }
  if (norm.includes("rose") || norm.includes("gulab") || norm.includes("roja")) {
    return "fresh red rose flowers isolated on a clean background"
  }
  if (norm.includes("drumstick") || norm.includes("moringa") || norm.includes("sahjan") || norm.includes("murungakkai") || norm.includes("nuggekayi")) {
    return "fresh moringa pods isolated on a clean background"
  }
  if (norm.includes("green banana") || norm.includes("banana green") || norm.includes("raw banana") || norm.includes("plantain") || norm.includes("baalekayi") || norm.includes("vazhaikkai") || norm.includes("kachha kela")) {
    return "fresh unripe green banana fruit isolated on a clean background"
  }
  if (norm.includes("mosambi") || norm.includes("sweet lime") || norm.includes("citrus limetta") || norm.includes("moushumi") || norm.includes("battayi")) {
    return "fresh Indian sweet lime fruit isolated on a clean background"
  }
  if (norm.includes("chikoo") || norm.includes("chiku") || norm.includes("sapota") || norm.includes("sapodilla")) {
    return "fresh sapodilla chikoo fruit isolated on a clean background"
  }
  if (norm.includes("amla") || norm.includes("gooseberry") || norm.includes("nelli") || norm.includes("nellikai") || norm.includes("usirikaya")) {
    return "fresh Indian gooseberry amla fruit isolated on a clean background"
  }
  if (norm.includes("brinjal") || norm.includes("eggplant") || norm.includes("aubergine") || norm.includes("baingan") || norm.includes("badanekai") || norm.includes("vankaya")) {
    return "fresh purple brinjal eggplant vegetable isolated on a clean background"
  }
  if (norm.includes("pomegranate") || norm.includes("anar") || norm.includes("dalimbe") || norm.includes("danimma") || norm.includes("mathulai")) {
    return "fresh whole and cut pomegranate fruits isolated on a clean background"
  }

  // Automatic category and product form synthesis for all future/unmapped commodities
  const inferred = inferProduceCategoryAndForm(clean, explicitCategory)
  return `${inferred.productForm} ${clean} isolated on a clean background`
}

/**
 * Resolve any crop name to its produce definition in the taxonomy.
 */
export function findProduceDefinition(cropName, explicitCategory = "") {
  const clean = cleanCropName(cropName)
  if (!clean) return null

  // 1. Exact key match
  if (PRODUCE_TAXONOMY[clean]) return PRODUCE_TAXONOMY[clean]

  // 2. Exact alias match across all produce definitions
  for (const def of Object.values(PRODUCE_TAXONOMY)) {
    if (def.aliases.includes(clean)) {
      return def
    }
  }

  // 3. Whole-phrase word-boundary match, prioritizing longer aliases first
  const allEntries = []
  for (const def of Object.values(PRODUCE_TAXONOMY)) {
    for (const alias of def.aliases) {
      if (alias && alias.length > 1) {
        allEntries.push({ def, alias })
      }
    }
  }
  // Sort longest alias first so multi-word aliases match before short aliases
  allEntries.sort((a, b) => b.alias.length - a.alias.length)

  for (const { def, alias } of allEntries) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const rx = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i")
    if (rx.test(clean)) {
      return def
    }
  }

  // 4. Token-based exact token match (only for meaningful tokens > 3 chars)
  const tokens = clean.split(/\s+/).filter(tok => tok.length > 3)
  for (const { def, alias } of allEntries) {
    const aliasTokens = alias.split(/\s+/).filter(tok => tok.length > 3)
    if (tokens.some(tok => aliasTokens.includes(tok))) {
      return def
    }
  }

  // 5. Dynamic fallback definition for uncatalogued future crops with automatic category inference
  const inferred = inferProduceCategoryAndForm(clean, explicitCategory)
  return {
    category: inferred.category,
    canonicalName: clean,
    aliases: [clean],
    searchQuery: generateSpecificSearchQuery(clean, explicitCategory),
    requiredKeywords: [clean, ...inferred.positiveKeywords],
    forbiddenKeywords: inferred.forbiddenKeywords
  }
}

/**
 * Validate an Unsplash photo candidate against produce definition.
 * Enforces strict 2-phase validation:
 * Phase 1: Rejection of general disqualified terms & cross-crop forbidden terms.
 * Phase 2: Affirmation of required identity tokens in title/description/tags.
 */
export function validateImageCandidate(photo, produceDef) {
  if (!photo || (!photo.urls?.small && !photo.urls?.regular)) {
    return { valid: false, reason: "Missing image URLs" }
  }

  const title = (photo.alt_description || "").toLowerCase()
  const desc = (photo.description || "").toLowerCase()
  const tags = (photo.tags || []).map(t => (t.title || "").toLowerCase()).join(" ")
  const combined = `${title} ${desc} ${tags}`

  // Phase 1: General disqualified terms check
  for (const bad of GENERAL_DISQUALIFIED_TERMS) {
    const rx = new RegExp(`\\b${bad}\\b`, "i")
    if (rx.test(combined)) {
      return { valid: false, reason: `Matches general disqualified term: "${bad}"` }
    }
  }

  // Phase 1b: Specific produce cross-crop forbidden terms check
  if (Array.isArray(produceDef.forbiddenKeywords)) {
    for (const bad of produceDef.forbiddenKeywords) {
      const rx = new RegExp(`\\b${bad}\\b`, "i")
      if (rx.test(combined)) {
        return { valid: false, reason: `Matches cross-crop forbidden term: "${bad}"` }
      }
    }
  }

  // Phase 1c: Category-specific strict validations
  if (produceDef.category === "flowers") {
    if (/\b(leaves only|leaf only|foliage|shrub|bush|tree|seedling|garden only)\b/i.test(combined)) {
      return { valid: false, reason: "Flower image contains only foliage/tree/garden without prominent flowers" }
    }
  }
  if (produceDef.canonicalName === "Amaranthus") {
    if (/\b(flower|flowers|bloom|blooms|inflorescence|spikes|grain|seeds)\b/i.test(combined)) {
      return { valid: false, reason: "Amaranthus image shows flowers or grain spikes instead of edible leafy greens" }
    }
  }
  if (produceDef.canonicalName === "Cotton") {
    if (/\b(field|fields|truck|warehouse|clothes|clothing|tshirt|jeans)\b/i.test(combined)) {
      return { valid: false, reason: "Cotton image shows fields, trucks, or clothing instead of harvested bolls" }
    }
  }
  if (produceDef.canonicalName === "Coconut") {
    if (/\b(grated|shredded|milk|chutney|rice|curry|cooked|tree|palm)\b/i.test(combined)) {
      return { valid: false, reason: "Coconut image shows grated/cooked food or coconut tree" }
    }
  }
  if (produceDef.canonicalName === "Tender Coconut") {
    if (/\b(brown|mature|copra|grated|stall|roadside|motorcycle)\b/i.test(combined)) {
      return { valid: false, reason: "Tender Coconut image shows mature brown coconut or roadside stall" }
    }
  }
  if (produceDef.canonicalName === "Tamarind") {
    if (/\b(rice|curry|chutney|sambar|paste|cooked|dish)\b/i.test(combined)) {
      return { valid: false, reason: "Tamarind image shows cooked dishes or rice" }
    }
  }
  if (produceDef.canonicalName?.includes("Ginger")) {
    if (/\b(forest|tree|plant only|landscape|wild|foliage)\b/i.test(combined)) {
      return { valid: false, reason: "Ginger image shows forest or landscape instead of rhizomes" }
    }
  }

  // Phase 1d: Check if the photo's alt title explicitly names another prominent produce
  const prominentProduceWords = [
    "garlic", "onion", "apple", "banana", "tomato", "potato", "carrot", "corn",
    "beans", "bean", "peas", "pea", "grapes", "grape", "mango", "orange",
    "lemon", "lime", "cabbage", "cauliflower", "spinach", "wheat", "rice", "ginger",
    "coconut", "pomegranate", "brinjal", "eggplant", "drumstick", "amla"
  ]

  const titleWords = title.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean)
  const targetWords = (produceDef.requiredKeywords || []).flatMap(k => k.toLowerCase().split(/\s+/))
  const targetAliases = (produceDef.aliases || []).flatMap(a => a.toLowerCase().split(/\s+/))
  const allTargetTokens = new Set([...targetWords, ...targetAliases])

  for (const other of prominentProduceWords) {
    if (titleWords.includes(other) && !allTargetTokens.has(other)) {
      return { valid: false, reason: `Title explicitly refers to different produce: "${other}"` }
    }
  }

  // Phase 2: Required produce identity check
  const hasIdentity = (produceDef.requiredKeywords || []).some(keyword => {
    return combined.includes(keyword.toLowerCase())
  })

  if (!hasIdentity) {
    return { valid: false, reason: `Lacks required identity tokens: [${produceDef.requiredKeywords.join(", ")}]` }
  }

  return { valid: true, reason: "Passed negative and positive validation" }
}
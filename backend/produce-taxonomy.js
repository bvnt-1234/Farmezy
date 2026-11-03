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

  // Containers, bowls, plates, baskets (prohibited per product photography style)
  "basket", "baskets", "bowl", "bowls", "plate", "plates", "crate", "crates",
  "container", "containers", "tray", "trays", "bucket", "buckets", "box", "boxes",
  "pot", "pots", "sack", "sacks", "bag", "bags", "pan", "pans",

  // Trees, branches, farms, orchards, fields (must show the harvested marketable commodity, not the tree)
  "tree", "trees", "branch", "branches", "hanging", "hanging from tree", "hanging on tree",
  "orchard", "orchards", "grove", "plantation", "garden", "gardens", "field", "fields",
  "farmland", "farm", "vineyard",

  // People, vendors, stalls
  "stall", "stalls", "market stall", "bazaar", "vendor", "vendors", "person", "people",
  "man", "woman", "hand", "hands", "holding", "farmer", "seller", "customer",

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
    aliases: ["papaya", "papayas", "papita", "parangi", "pappali", "boppayi"],
    searchQuery: "fresh ripe papaya fruit isolated on a clean background",
    requiredKeywords: ["papaya", "papayas", "pawpaw", "carica"],
    forbiddenKeywords: ["tree", "orchard", "salad", "smoothie", "slice", "dessert", "facial"]
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
    searchQuery: "whole mature coconut fruit not coconut tree isolated on a clean background",
    requiredKeywords: ["coconut", "coconuts", "copra", "nucifera"],
    forbiddenKeywords: ["tree", "trees", "palm", "seedling", "sprout", "oil", "drink", "cocktail", "milk", "beach"]
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
    searchQuery: "fresh jasmine flowers isolated on a clean background",
    requiredKeywords: ["jasmine", "jasminum", "mogra", "malli"],
    forbiddenKeywords: ["tea", "perfume", "oil", "bottle", "lotion", "plant only", "leaves only", "shrub", "tree"]
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
 * Generates an accurate, professional product photography search query for any commodity.
 * Specifies the exact commodity name, marketable plant part, and clean background framing.
 */
export function generateSpecificSearchQuery(cropName) {
  const clean = cleanCropName(cropName)
  const norm = clean.toLowerCase()

  if (norm.includes("drumstick") || norm.includes("moringa") || norm.includes("sahjan") || norm.includes("murungakkai") || norm.includes("nuggekayi")) {
    return "fresh moringa pods isolated on a clean background"
  }
  if (norm.includes("green banana") || norm.includes("banana green") || norm.includes("raw banana") || norm.includes("plantain") || norm.includes("baalekayi") || norm.includes("vazhaikkai") || norm.includes("kachha kela")) {
    return "fresh unripe green banana fruit isolated on a clean background"
  }
  if (norm.includes("mosambi") || norm.includes("sweet lime") || norm.includes("citrus limetta") || norm.includes("moushumi") || norm.includes("battayi")) {
    return "fresh Indian sweet lime fruit isolated on a clean background"
  }
  if (norm.includes("coconut") || norm.includes("copra") || norm.includes("nariyal") || norm.includes("tenginakayi") || norm.includes("thengai")) {
    return "whole mature coconut fruit not coconut tree isolated on a clean background"
  }
  if (norm.includes("chikoo") || norm.includes("chiku") || norm.includes("sapota") || norm.includes("sapodilla")) {
    return "fresh sapodilla chikoo fruit isolated on a clean background"
  }
  if (norm.includes("amla") || norm.includes("gooseberry") || norm.includes("nelli") || norm.includes("nellikai") || norm.includes("usirikaya")) {
    return "fresh Indian gooseberry amla fruit isolated on a clean background"
  }
  if (norm.includes("jasmine") || norm.includes("mogra") || norm.includes("gundu malli") || norm.includes("malli") || norm.includes("chameli") || norm.includes("mallepuvu")) {
    return "fresh jasmine flowers isolated on a clean background"
  }
  if (norm.includes("brinjal") || norm.includes("eggplant") || norm.includes("aubergine") || norm.includes("baingan") || norm.includes("badanekai") || norm.includes("vankaya")) {
    return "fresh purple brinjal eggplant vegetable isolated on a clean background"
  }
  if (norm.includes("pomegranate") || norm.includes("anar") || norm.includes("dalimbe") || norm.includes("danimma") || norm.includes("mathulai")) {
    return "fresh whole and cut pomegranate fruits isolated on a clean background"
  }

  // Botanical / marketable category detection
  if (norm.includes("flower") || norm.includes("rose") || norm.includes("marigold") || norm.includes("chrysanthemum") || norm.includes("tuberose") || norm.includes("crossandra")) {
    return `fresh ${clean} flowers isolated on a clean background`
  }
  if (norm.includes("leaf") || norm.includes("leaves") || norm.includes("spinach") || norm.includes("coriander") || norm.includes("mint") || norm.includes("methi") || norm.includes("curry leaf")) {
    return `fresh ${clean} leaves isolated on a clean background`
  }
  if (norm.includes("seed") || norm.includes("seeds") || norm.includes("mustard") || norm.includes("sesame") || norm.includes("cumin") || norm.includes("fennel") || norm.includes("coriander seed")) {
    return `raw ${clean} seeds isolated on a clean background`
  }
  if (norm.includes("dal") || norm.includes("gram") || norm.includes("pulse") || norm.includes("lentil") || norm.includes("chana") || norm.includes("pea") || norm.includes("bean") || norm.includes("beans")) {
    return `raw whole ${clean} pulses grains isolated on a clean background`
  }
  if (norm.includes("fruit") || norm.includes("apple") || norm.includes("mango") || norm.includes("orange") || norm.includes("guava") || norm.includes("papaya") || norm.includes("watermelon") || norm.includes("melon") || norm.includes("grape") || norm.includes("grapes") || norm.includes("fig") || norm.includes("jackfruit")) {
    return `fresh whole ${clean} fruit isolated on a clean background`
  }
  if (norm.includes("root") || norm.includes("tuber") || norm.includes("yam") || norm.includes("potato") || norm.includes("radish") || norm.includes("carrot") || norm.includes("beetroot") || norm.includes("ginger") || norm.includes("turmeric") || norm.includes("garlic") || norm.includes("onion")) {
    return `fresh raw ${clean} isolated on a clean background`
  }

  return `fresh ${clean} isolated on a clean background`
}

/**
 * Resolve any crop name to its produce definition in the taxonomy.
 */
export function findProduceDefinition(cropName) {
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
  // Sort longest alias first so multi-word aliases (e.g. "avare dal", "green gram", "green banana") match before short aliases
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

  // 5. Dynamic fallback definition for uncatalogued crops with professional search query
  return {
    category: "general",
    canonicalName: clean,
    aliases: [clean],
    searchQuery: generateSpecificSearchQuery(clean),
    requiredKeywords: [clean],
    forbiddenKeywords: []
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

  // Phase 1c: Check if the photo's alt title explicitly names another prominent produce
  const prominentProduceWords = [
    "garlic", "onion", "apple", "banana", "tomato", "potato", "carrot", "corn",
    "beans", "bean", "peas", "pea", "grapes", "grape", "mango", "orange",
    "lemon", "lime", "cabbage", "cauliflower", "spinach", "wheat", "rice", "ginger",
    "coconut", "pomegranate", "brinjal", "eggplant", "drumstick", "amla"
  ]

  const titleWords = title.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean)
  const targetWords = produceDef.requiredKeywords.flatMap(k => k.toLowerCase().split(/\s+/))
  const targetAliases = produceDef.aliases.flatMap(a => a.toLowerCase().split(/\s+/))
  const allTargetTokens = new Set([...targetWords, ...targetAliases])

  for (const other of prominentProduceWords) {
    if (titleWords.includes(other) && !allTargetTokens.has(other)) {
      // The photo title explicitly names another produce item that is not this crop
      return { valid: false, reason: `Title explicitly refers to different produce: "${other}"` }
    }
  }

  // Phase 2: Required produce identity check
  const hasIdentity = produceDef.requiredKeywords.some(keyword => {
    return combined.includes(keyword.toLowerCase())
  })

  if (!hasIdentity) {
    return { valid: false, reason: `Lacks required identity tokens: [${produceDef.requiredKeywords.join(", ")}]` }
  }

  return { valid: true, reason: "Passed negative and positive validation" }
}

/**
 * Comprehensive produce taxonomy and validation engine for Farmezy.
 * Covers Vegetables, Fruits, Grains/Cereals, Pulses/Legumes, Spices, and Roots/Tubers.
 * Includes Indian multilingual synonyms (Hindi, Kannada, Tamil, Telugu) and cross-crop exclusions.
 */

export const GENERAL_DISQUALIFIED_TERMS = [
  "recipe", "recipes", "dish", "dishes", "cooked", "cooking", "curry", "curries",
  "fried", "fry", "salad", "salads", "soup", "soups", "stew", "stews", "baked",
  "roast", "roasted", "meal", "meals", "snack", "snacks", "dessert", "desserts",
  "restaurant", "menu", "plate", "fork", "spoon", "knife", "cutting board",
  "chopped", "sliced", "slice", "slices", "diced", "peeled", "canned", "can",
  "jar", "bottle", "packet", "box", "packaging", "powder", "oil",
  "pest", "disease", "caterpillar", "beetle", "fungus", "blight", "rot",
  "logo", "icon", "stamp", "drawing", "illustration", "vector", "cartoon",
  "3d render", "diagram", "chart", "map", "herbarium", "specimen"
]

export const PRODUCE_TAXONOMY = {
  // ==================== 1. VEGETABLES ====================
  tomato: {
    category: "vegetables",
    canonicalName: "Tomato",
    aliases: ["tomato", "tomatoes", "tamatar", "thakkali", "tamata", "kamata"],
    searchQuery: "fresh red tomatoes vine harvest agricultural produce",
    requiredKeywords: ["tomato", "tomatoes", "lycopersicum", "tamatar"],
    forbiddenKeywords: ["sauce", "paste", "ketchup", "pizza", "pasta", "soup", "puree", "curry", "salad", "cherry tomato sauce"]
  },
  onion: {
    category: "vegetables",
    canonicalName: "Onion",
    aliases: ["onion", "onions", "red onion", "pyaz", "eerulli", "vengayam", "ullipayalu", "kanda"],
    searchQuery: "red onion bulb fresh farm harvest raw",
    requiredKeywords: ["onion", "onions", "allium cepa", "red onion", "yellow onion", "white onion"],
    forbiddenKeywords: ["garlic", "shallot", "shallots", "leek", "leeks", "curry", "rings", "fried", "soup", "pickle", "powder"]
  },
  potato: {
    category: "vegetables",
    canonicalName: "Potato",
    aliases: ["potato", "potatoes", "aloo", "alu", "alugadde", "urulaikizhangu", "bangaladumpa", "batata"],
    searchQuery: "fresh raw potatoes harvest farm",
    requiredKeywords: ["potato", "potatoes", "tuberosum", "spud", "spuds"],
    forbiddenKeywords: ["french fries", "fries", "chips", "crisps", "mashed", "curry", "cooked", "salad", "peeled"]
  },
  cabbage: {
    category: "vegetables",
    canonicalName: "Cabbage",
    aliases: ["cabbage", "patta gobhi", "bandha gobhi", "muttakose", "kosu", "cabbages"],
    searchQuery: "fresh green cabbage raw harvest",
    requiredKeywords: ["cabbage", "cabbages", "brassica oleracea"],
    forbiddenKeywords: ["cooked", "slaw", "coleslaw", "curry", "salad", "soup", "stew", "sauerkraut"]
  },
  cauliflower: {
    category: "vegetables",
    canonicalName: "Cauliflower",
    aliases: ["cauliflower", "phool gobhi", "gobi", "hookosu", "cauliflowers"],
    searchQuery: "fresh white cauliflower head farm harvest",
    requiredKeywords: ["cauliflower", "cauliflowers", "botrytis"],
    forbiddenKeywords: ["manchurian", "curry", "cooked", "fried", "battered", "soup"]
  },
  carrot: {
    category: "vegetables",
    canonicalName: "Carrot",
    aliases: ["carrot", "carrots", "gajar", "gajjari"],
    searchQuery: "fresh raw carrots harvest farm",
    requiredKeywords: ["carrot", "carrots", "daucus carota"],
    forbiddenKeywords: ["halwa", "juice", "cooked", "cake", "soup", "curry", "baby carrot peeled"]
  },
  okra: {
    category: "vegetables",
    canonicalName: "Okra",
    aliases: ["okra", "ladies finger", "lady finger", "bhindi", "bhendi", "vendakkai", "bende", "bendakaya"],
    searchQuery: "fresh okra pods raw vegetable harvest",
    requiredKeywords: ["okra", "ladies finger", "lady finger", "gumbo", "esculentus", "bhindi", "bhendi"],
    forbiddenKeywords: ["chili", "chilli", "pepper", "peppers", "fried", "curry", "dish", "cooked", "stew", "battered", "sliced"]
  },
  brinjal: {
    category: "vegetables",
    canonicalName: "Brinjal / Eggplant",
    aliases: ["brinjal", "eggplant", "aubergine", "baingan", "badanekai", "kathirikai", "vankaya", "solanum melongena"],
    searchQuery: "fresh purple brinjal eggplant vegetable solanum melongena harvest",
    requiredKeywords: ["brinjal", "eggplant", "aubergine", "melongena", "baingan", "badanekai", "kathirikai", "vankaya"],
    forbiddenKeywords: ["chili", "chilli", "pepper", "peppers", "curry", "dip", "cooked", "bharta", "fried", "parmigiana", "grilled"]
  },
  capsicum: {
    category: "vegetables",
    canonicalName: "Capsicum",
    aliases: ["capsicum", "bell pepper", "shimla mirch", "doddamenasinakai", "kudaikaai"],
    searchQuery: "fresh green capsicum bell pepper harvest farm",
    requiredKeywords: ["capsicum", "bell pepper", "peppers", "sweet pepper"],
    forbiddenKeywords: ["pizza", "cooked", "curry", "salad", "powder", "paprika"]
  },
  cucumber: {
    category: "vegetables",
    canonicalName: "Cucumber",
    aliases: ["cucumber", "cucumbers", "kheera", "kakdi", "southekayi", "vellarikkai", "dosakaya"],
    searchQuery: "fresh green cucumber harvest vegetable farm",
    requiredKeywords: ["cucumber", "cucumbers", "sativus", "kheera"],
    forbiddenKeywords: ["salad", "pickled", "pickle", "sliced", "cucumber water", "cosmetic", "facial"]
  },
  drumstick: {
    category: "vegetables",
    canonicalName: "Drumstick",
    aliases: ["drumstick", "drumsticks", "moringa", "sahjan", "nuggekayi", "murungakkai", "munakkaya"],
    searchQuery: "fresh green moringa drumstick pods harvest",
    requiredKeywords: ["moringa", "drumstick", "drumsticks", "oleifera"],
    forbiddenKeywords: ["sambar", "curry", "powder", "tea", "supplement"]
  },
  "bitter gourd": {
    category: "vegetables",
    canonicalName: "Bitter Gourd / Bitter Melon",
    aliases: ["bitter gourd", "bitter melon", "karela", "hagalakayi", "pavakkai", "kakarakaya", "momordica charantia"],
    searchQuery: "fresh green bitter gourd karela farm harvest",
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
    searchQuery: "fresh green ridge gourd vegetable luffa raw",
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
    searchQuery: "fresh green bottle gourd lauki calabash lagenaria siceraria farm harvest",
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
    searchQuery: "ash gourd winter melon benincasa hispida vegetable",
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
      "snake gourd", "snakegourd", "chichinda", "padavalakai", "padavalkayi",
      "pudalangai", "potlakaya", "trichosanthes cucumerina"
    ],
    searchQuery: "snake gourd trichosanthes cucumerina vegetable raw",
    requiredKeywords: ["snake gourd", "trichosanthes", "cucumerina", "chichinda", "padavalakai", "pudalangai", "potlakaya"],
    forbiddenKeywords: [
      "bitter gourd", "ash gourd", "bottle gourd", "ridge gourd", "cucumber", "zucchini",
      "snake", "reptile", "curry", "cooked"
    ]
  },
  spinach: {
    category: "vegetables",
    canonicalName: "Spinach",
    aliases: ["spinach", "palak", "soppu", "keerai", "kura"],
    searchQuery: "fresh green spinach leaves harvest farm raw",
    requiredKeywords: ["spinach", "palak", "oleracea", "leafy green"],
    forbiddenKeywords: ["cooked", "paneer", "soup", "curry", "smoothie", "dip"]
  },

  // ==================== 2. FRUITS ====================
  mango: {
    category: "fruits",
    canonicalName: "Mango",
    aliases: ["mango", "mangoes", "mangos", "aam", "mavinahannu", "maangai", "mamidi"],
    searchQuery: "fresh ripe mango fruit tree harvest farm",
    requiredKeywords: ["mango", "mangoes", "mangos", "mangifera"],
    forbiddenKeywords: ["smoothie", "shake", "juice", "slice", "pickle", "dessert", "chutney", "ice cream"]
  },
  banana: {
    category: "fruits",
    canonicalName: "Banana",
    aliases: ["banana", "bananas", "kela", "bale hannu", "baalekayi", "vazhaipazham", "arati"],
    searchQuery: "fresh yellow banana bunch fruit harvest farm",
    requiredKeywords: ["banana", "bananas", "musa"],
    forbiddenKeywords: ["bread", "pancake", "pancakes", "peeled", "slice", "smoothie", "chips", "split"]
  },
  apple: {
    category: "fruits",
    canonicalName: "Apple",
    aliases: ["apple", "apples", "seb", "sebu", "aappil"],
    searchQuery: "fresh red apples orchard harvest branch fruit",
    requiredKeywords: ["apple", "apples", "orchard", "malus"],
    forbiddenKeywords: ["iphone", "ipad", "macbook", "laptop", "watch", "computer", "logo", "tech", "pie", "juice", "cider"]
  },
  pomegranate: {
    category: "fruits",
    canonicalName: "Pomegranate",
    aliases: ["pomegranate", "pomegranates", "anar", "dalimbe", "maadhulai", "danimma"],
    searchQuery: "fresh ripe pomegranate fruit tree harvest whole",
    requiredKeywords: ["pomegranate", "pomegranates", "granatum", "anar"],
    forbiddenKeywords: ["juice", "cocktail", "salad", "seeds scattered", "dessert"]
  },
  papaya: {
    category: "fruits",
    canonicalName: "Papaya",
    aliases: ["papaya", "papayas", "papita", "parangi", "pappali", "boppayi"],
    searchQuery: "fresh ripe papaya fruit harvest tree",
    requiredKeywords: ["papaya", "papayas", "pawpaw", "carica"],
    forbiddenKeywords: ["salad", "smoothie", "slice", "dessert", "facial"]
  },
  guava: {
    category: "fruits",
    canonicalName: "Guava",
    aliases: ["guava", "guavas", "amrood", "seebekayi", "koyyapazham", "jama"],
    searchQuery: "fresh green guava fruit tree branch harvest",
    requiredKeywords: ["guava", "guavas", "psidium"],
    forbiddenKeywords: ["juice", "jam", "jelly", "smoothie"]
  },
  watermelon: {
    category: "fruits",
    canonicalName: "Watermelon",
    aliases: ["watermelon", "watermelons", "tarbooz", "kallangadi", "tharpoos", "puchakaya"],
    searchQuery: "fresh whole watermelon fruit field harvest",
    requiredKeywords: ["watermelon", "watermelons", "citrullus lanatus"],
    forbiddenKeywords: ["slice", "slices", "juice", "cocktail", "smoothie", "popsicle"]
  },
  grapes: {
    category: "fruits",
    canonicalName: "Grapes",
    aliases: ["grapes", "grape", "angoor", "drakshi", "thiratchai", "draksha"],
    searchQuery: "fresh grapes bunch vineyard harvest fruit",
    requiredKeywords: ["grape", "grapes", "vineyard", "vitis"],
    forbiddenKeywords: ["wine", "winery", "glass", "bottle", "raisin", "raisins", "juice"]
  },

  // ==================== 3. GRAINS & CEREALS ====================
  wheat: {
    category: "grains",
    canonicalName: "Wheat",
    aliases: ["wheat", "gehu", "godhi", "godhumai", "godhumalu"],
    searchQuery: "golden ripe wheat crop ears field harvest farm",
    requiredKeywords: ["wheat", "triticum", "grain", "ears", "cereal"],
    forbiddenKeywords: ["bread", "flour", "pasta", "bakery", "noodle", "noodles", "cake", "cookie", "dough", "beer"]
  },
  rice: {
    category: "grains",
    canonicalName: "Paddy / Rice",
    aliases: ["rice", "paddy", "dhan", "chawal", "bhatta", "arisi", "vari", "nellu"],
    searchQuery: "ripe golden paddy rice harvest grains field farm",
    requiredKeywords: ["paddy", "rice", "grain", "grains", "oryza"],
    forbiddenKeywords: ["cooked", "bowl", "fried rice", "biryani", "pulao", "curry", "sushi", "flour"]
  },
  maize: {
    category: "grains",
    canonicalName: "Maize / Corn",
    aliases: ["maize", "corn", "makka", "makai", "jola", "cholam", "mokka jonna"],
    searchQuery: "fresh yellow maize corn cob ears farm harvest",
    requiredKeywords: ["maize", "corn", "cob", "cobs", "zea mays"],
    forbiddenKeywords: ["popcorn", "canned", "cooked", "grilled", "tortilla", "tacos", "syrup"]
  },
  ragi: {
    category: "grains",
    canonicalName: "Finger Millet / Ragi",
    aliases: ["ragi", "finger millet", "mandua", "kezhvaragu", "ragulu", "nachani", "ragi seeds", "finger millet grains", "eleusine coracana"],
    searchQuery: "eleusine coracana finger millet ragi seeds grain heads harvest farm",
    requiredKeywords: ["finger millet", "ragi", "eleusine", "coracana"],
    forbiddenKeywords: [
      "foxtail", "foxtail millet", "setaria", "pearl millet", "bajra", "sorghum", "jowar",
      "proso", "barnyard", "kodo", "little millet",
      "rice", "white rice", "wheat", "corn", "porridge", "mudde", "dosa", "roti", "flour", "cooked"
    ]
  },
  jowar: {
    category: "grains",
    canonicalName: "Sorghum / Jowar",
    aliases: ["jowar", "sorghum", "great millet", "jola", "cholam", "jonnalu"],
    searchQuery: "sorghum jowar grain head field harvest agriculture",
    requiredKeywords: ["sorghum", "jowar", "millet", "bicolor"],
    forbiddenKeywords: ["roti", "flour", "cooked", "bread", "syrup"]
  },
  bajra: {
    category: "grains",
    canonicalName: "Pearl Millet / Bajra",
    aliases: ["bajra", "pearl millet", "sajje", "kambu", "sajjalu"],
    searchQuery: "pearl millet bajra crop heads field harvest",
    requiredKeywords: ["pearl millet", "bajra", "millet", "pennisetum glaucum"],
    forbiddenKeywords: ["roti", "khichdi", "flour", "cooked"]
  },

  // ==================== 4. PULSES & LEGUMES ====================
  chickpea: {
    category: "pulses",
    canonicalName: "Chickpea / Bengal Gram",
    aliases: ["chickpea", "chickpeas", "bengal gram", "chana", "kala chana", "kabuli chana", "kadale", "kothukadalai", "senagalu"],
    searchQuery: "raw dried chickpeas bengal gram chana harvest",
    requiredKeywords: ["chickpea", "chickpeas", "garbanzo", "gram", "cicer arietinum"],
    forbiddenKeywords: ["hummus", "chole", "curry", "cooked", "canned", "can", "falafel", "salad", "roasted"]
  },
  moong: {
    category: "pulses",
    canonicalName: "Green Gram / Moong",
    aliases: ["moong", "green gram", "mung bean", "mung", "green gram dal", "moong dal", "green gram whole", "moong whole", "hesarukalu", "paasi payaru", "pesalu", "cherupayar"],
    searchQuery: "dry whole green mung beans raw pulses grains vigna radiata",
    requiredKeywords: ["mung bean", "mung beans", "green gram", "moong", "vigna radiata"],
    forbiddenKeywords: [
      "sprout", "sprouts", "sprouted", "sprouting", "microgreen", "microgreens", "shoot", "shoots", "seedling", "seedlings",
      "fruit", "fruits", "plum", "plums", "berry", "berries", "grape", "dal tadka", "curry", "soup", "cooked", "halwa", "salad"
    ]
  },
  avare: {
    category: "pulses",
    canonicalName: "Hyacinth Bean / Avare Dal",
    aliases: [
      "avare dal", "avare", "avarekalu", "avarekai", "hyacinth bean",
      "field bean", "lablab", "lablab purpureus", "indian bean", "sem",
      "mochai", "chikkudu", "chikkudukaya", "field pea"
    ],
    searchQuery: "hyacinth bean pods lablab purpureus farm harvest raw",
    requiredKeywords: ["hyacinth bean", "lablab", "purpureus", "field bean", "avare", "avarekalu", "avarekai", "mochai", "chikkudu"],
    forbiddenKeywords: ["flower", "flowers", "blossom", "blossoms", "curry", "cooked", "fried", "dish", "stew", "ornamental", "vinegar"]
  },
  urad: {
    category: "pulses",
    canonicalName: "Black Gram / Urad",
    aliases: ["urad", "black gram", "black lentil", "uddinabele", "ulundhu", "minumulu"],
    searchQuery: "raw black gram urad dal pulses harvest",
    requiredKeywords: ["urad", "black gram", "vigna mungo", "lentil"],
    forbiddenKeywords: ["dal makhani", "curry", "cooked", "vada", "dosa", "batter"]
  },
  toor: {
    category: "pulses",
    canonicalName: "Pigeon Pea / Toor",
    aliases: ["toor", "arhar", "pigeon pea", "red gram", "toor dal", "togari bele", "thuvaram paruppu", "kandi pappu"],
    searchQuery: "raw yellow pigeon pea toor dal grains harvest",
    requiredKeywords: ["pigeon pea", "toor", "arhar", "cajanus cajan", "split pea"],
    forbiddenKeywords: ["sambar", "dal tadka", "curry", "cooked", "soup"]
  },
  "green peas": {
    category: "pulses",
    canonicalName: "Green Peas",
    aliases: ["green peas", "peas", "matar", "batani", "pattani", "batanilu"],
    searchQuery: "fresh green peas pods farm harvest raw",
    requiredKeywords: ["pea", "peas", "pisum sativum"],
    forbiddenKeywords: ["soup", "curry", "cooked", "puree", "mashed", "can", "canned", "frozen"]
  },

  // ==================== 5. SPICES & CONDIMENTS ====================
  ginger: {
    category: "spices",
    canonicalName: "Ginger",
    aliases: ["ginger", "adrak", "shunti", "inji", "allam"],
    searchQuery: "fresh raw ginger rhizome root farm harvest",
    requiredKeywords: ["ginger", "rhizome", "zingiber"],
    forbiddenKeywords: ["gingerbread", "cookie", "cookies", "ale", "tea", "candy", "snap", "powder", "capsule"]
  },
  garlic: {
    category: "spices",
    canonicalName: "Garlic",
    aliases: ["garlic", "lehsun", "bellulli", "poondu", "vellulli"],
    searchQuery: "fresh raw garlic bulbs cloves harvest",
    requiredKeywords: ["garlic", "cloves", "allium sativum"],
    forbiddenKeywords: ["onion", "onions", "bread", "garlic bread", "powder", "oil", "sauce", "minced", "paste"]
  },
  "green chilli": {
    category: "spices",
    canonicalName: "Green Chilli",
    aliases: ["green chilli", "green chili", "green chilies", "hari mirch", "hasiru menasinakai", "pachai milagai", "pachi mirapa"],
    searchQuery: "fresh raw green chillies peppers harvest farm",
    requiredKeywords: ["chilli", "chili", "chillies", "chilies", "pepper", "peppers"],
    forbiddenKeywords: ["powder", "sauce", "cooked", "dish", "curry", "red", "paste", "bottle"]
  },
  turmeric: {
    category: "spices",
    canonicalName: "Turmeric",
    aliases: ["turmeric", "haldi", "arishina", "manjal", "pasupu"],
    searchQuery: "fresh raw turmeric root rhizome harvest",
    requiredKeywords: ["turmeric", "curcuma", "rhizome"],
    forbiddenKeywords: ["latte", "powder", "capsule", "supplement", "soap", "curry", "cosmetic"]
  },
  cardamom: {
    category: "spices",
    canonicalName: "Cardamom",
    aliases: ["cardamom", "cardamoms", "elaichi", "yelakki", "elakkai", "yelakulu"],
    searchQuery: "green cardamom pods spice agricultural harvest",
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
    searchQuery: "raw sesame seeds harvest agriculture produce sesamum indicum",
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
    searchQuery: "raw whole mustard seeds spice agriculture brassica",
    requiredKeywords: ["mustard", "sarson", "rai", "kadugu", "sasive", "brassica", "aavalu"],
    forbiddenKeywords: ["sauce", "paste", "dijon", "hot dog", "bottle", "oil", "greens", "cooked", "leaves"]
  },

  // ==================== 6. ROOTS & TUBERS ====================
  "sweet potato": {
    category: "roots",
    canonicalName: "Sweet Potato",
    aliases: ["sweet potato", "sweet potatoes", "shakarkand", "sihigenasu", "sakkaravalli kizhangu", "chilagada dumpa"],
    searchQuery: "fresh raw sweet potato tubers harvest soil",
    requiredKeywords: ["sweet potato", "sweet potatoes", "ipomoea batatas"],
    forbiddenKeywords: ["fries", "pie", "baked", "cooked", "casserole", "mashed"]
  },
  "elephant foot yam": {
    category: "roots",
    canonicalName: "Elephant Foot Yam",
    aliases: ["elephant foot yam", "elephant yam", "suran", "jimikand", "suvarnagadde", "senai kizhangu", "kanda gadda"],
    searchQuery: "elephant foot yam suran tuber harvest raw",
    requiredKeywords: ["yam", "amorphophallus", "suran", "tuber"],
    forbiddenKeywords: ["curry", "cooked", "fried", "dish", "stew"]
  },
  radish: {
    category: "roots",
    canonicalName: "Radish",
    aliases: ["radish", "mooli", "moolangi", "mullangi"],
    searchQuery: "fresh white radish root harvest farm soil",
    requiredKeywords: ["radish", "radishes", "raphanus sativus", "daikon"],
    forbiddenKeywords: ["salad", "pickled", "pickle", "sliced", "curry", "paratha"]
  },
  beetroot: {
    category: "roots",
    canonicalName: "Beetroot",
    aliases: ["beetroot", "beet", "beets", "chukandar"],
    searchQuery: "fresh raw red beetroot root harvest farm",
    requiredKeywords: ["beetroot", "beet", "beets", "beta vulgaris"],
    forbiddenKeywords: ["juice", "salad", "pickled", "pickle", "cooked", "soup", "sliced"]
  }
}

/**
 * Clean and normalize a crop name string for taxonomy lookup.
 */
export function cleanCropName(raw) {
  return String(raw || "")
    .replace(/[()[\]{}/\\,._-]/g, " ")
    .replace(/\b(fresh|common|local|hybrid|grade\s*[a-c]?|desi|dry|raw|wholesale)\b/gi, " ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
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
  // Sort longest alias first so multi-word aliases (e.g. "avare dal", "green gram") match before short aliases
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

  // 5. Dynamic fallback definition for uncatalogued crops
  return {
    category: "general",
    canonicalName: clean,
    aliases: [clean],
    searchQuery: `${clean} fresh agricultural produce farm harvest`,
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
    "lemon", "lime", "cabbage", "cauliflower", "spinach", "wheat", "rice", "ginger"
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

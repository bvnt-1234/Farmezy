// Comprehensive Multilingual Translation Engine & Dictionary for Farmezy
// Supports English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), Tamil (தமிழ்), and Marathi (मराठी)
import { useEffect } from "react";

export const SUPPORTED_LANGUAGES = [
  "English",
  "हिन्दी",
  "ಕನ್ನಡ",
  "తెలుగు",
  "தமிழ்",
  "मराठी"
];

export const translations = {
  English: {
    // Navigation & Workspace
    notifications: "Notifications",
    home: "Home",
    prices: "Market prices",
    outlook: "Price outlook",
    mandi: "Find a mandi",
    sell: "List your harvest",
    browse: "Browse produce",
    requests: "Requests",
    myRequests: "My requests",
    orders: "Orders",
    greeting: "Good Morning!",
    tagline: "A fairer market starts here.",
    farmerWorkspace: "FARMER WORKSPACE",
    customerWorkspace: "CUSTOMER MARKETPLACE",
    farmer: "Farmer",
    customer: "Customer",
    yourWorkspace: "YOUR WORKSPACE",
    menu: "MENU",
    needHelp: "Here to help",
    askFarmezy: "Ask Farmezy about crop prices or mandis.",
    chatWithUs: "Chat with us",
    signOut: "Sign out",
    logOut: "Log out",

    // Actions & Buttons
    buyRequest: "Buy / Request",
    buy: "Buy",
    request: "Request",
    call: "Call",
    whatsapp: "WhatsApp",
    bestRoute: "Best route",
    route: "Route",
    directions: "Directions",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    submit: "Submit",
    cancel: "Cancel",
    close: "Close",
    viewAll: "View all",
    viewDetails: "View details",
    back: "Back",
    apply: "Apply",
    clear: "Clear",
    clearAll: "Clear all",
    refresh: "Refresh",
    search: "Search",
    filter: "Filter",
    sortBy: "Sort by",
    takePhoto: "Take photo with camera",
    uploadPhoto: "Upload photo",
    chooseGallery: "Choose from gallery",
    publishListing: "Publish Listing",
    saving: "Saving...",
    loading: "Loading...",
    connecting: "Connecting to Farmezy...",

    // Produce & Listings
    crop: "CROP",
    available: "AVAILABLE",
    askingPrice: "ASKING PRICE",
    price: "Price",
    quantity: "Quantity",
    unit: "Unit",
    farmerPickup: "FARMER / PICKUP",
    nearby: "Nearby in your area (< 1 km)",
    kmAway: "km away",
    officialGovtPrices: "Official mandi prices",
    allVegetables: "All vegetables & crops",
    welcomeTitleFarmer: "Your harvest, your business.",
    welcomeTitleCustomer: "Find fresh crops from Indian mandis.",
    welcomeSubFarmer: "Add your crops with real camera photos and check live official market prices in your district.",
    welcomeSubCustomer: "Browse daily reported mandi prices from the Government of India.",
    authTitle: "FARMEZY AUTHORIZATION & LOGIN",
    authWelcome: "Welcome to Farmezy.",
    authSub: "Sign in or register your account to access real-time market prices, sell crops, or purchase directly.",
    signIn: "Sign In",
    signUp: "Create Account (Sign Up)",
    demoFarmer: "Sign In as Demo Farmer (Ramesh)",
    demoCustomer: "Sign In as Demo Customer (Priya)",

    // Filters & Sorting
    allCrops: "All crops",
    searchProduce: "Search produce...",
    nearestFirst: "Distance: Nearest first",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    noProduceFound: "No produce listings found matching your criteria.",

    // Orders & Requests
    allOrders: "All orders",
    pending: "Pending",
    accepted: "Accepted",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
    orderId: "Order ID",
    customerDetails: "Customer Details",
    farmerDetails: "Farmer Details",
    totalAmount: "Total Amount",
    subtotal: "Subtotal",
    deliveryFee: "Delivery Charges",
    freeDelivery: "Free",
    grandTotal: "Grand Total",
    status: "Status",
    paymentMethod: "Payment Method",
    paymentStatus: "Payment Status",
    acceptOrder: "Accept Order",
    startPreparing: "Start Preparation",
    markReady: "Mark Ready",
    completeOrder: "Complete Order",
    cancelOrder: "Cancel Order",

    // Invoices
    invoice: "Invoice",
    downloadInvoice: "Download Invoice PDF",
    printInvoice: "Print Invoice",
    invoicePreview: "Invoice Preview",
    invoiceNumber: "Invoice Number",
    invoiceDate: "Invoice Date",
    billedTo: "Billed To",
    soldBy: "Sold By",
    itemDescription: "Item Description",
    unitPrice: "Unit Price",
    electronicInvoice: "Computer generated electronic invoice from Farmezy.",

    // Ratings & Reviews
    rateAndReview: "Rate & Review",
    customerReviews: "Customer Reviews",
    rateProduce: "Rate Produce Quality",
    rateFarmer: "Rate Farmer Service",
    writeReview: "Write your review...",
    submitReview: "Submit Review",
    editReview: "Edit Review",
    deleteReview: "Delete Review",
    verifiedPurchase: "Verified Purchase",
    basedOnReviews: "based on reviews",
    starBreakdown: "Star Breakdown",
    noReviewsYet: "No customer reviews yet. Be the first to review!",

    // Notifications
    notificationHistory: "Notification History",
    unread: "Unread",
    read: "Read",
    all: "All",
    markAllRead: "Mark all as read",
    allCaughtUp: "All caught up!",
    noNotifications: "No notifications yet.",

    // Official Prices Table & Filters
    allCategories: "All categories",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    spices: "Spices",
    pulses: "Pulses",
    oilseeds: "Oilseeds",
    flowers: "Flowers",
    livestock: "Livestock",
    dairy: "Dairy",
    fiber: "Fiber",
    other: "Other",
    commodity: "Commodity",
    variety: "Variety",
    grade: "Grade",
    state: "State",
    district: "District",
    marketApmc: "Market / Mandi",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    modalPrice: "Modal Price",
    date: "Date",
    viewTable: "View Table",
    viewCards: "View Cards",
    sevenDayTrend: "7-Day Projected Trend",
    favorableSelling: "Favorable Selling Window",

    // Chatbot
    smartAssistant: "Farmezy Smart Assistant",
    whoAreYou: "Who are you?",
    howCanYouHelp: "How can you help?",
    gingerInMyArea: "Ginger in my area",
    tomatoInMyArea: "Tomato in my area",
    onionInMyArea: "Onion in my area",
    sevenDayWeather: "7-Day Weather",
    garlicInMandsaur: "Garlic in Mandsaur",
    pestControl: "Pest control",
    mandiTable: "Mandi table",
    typeQuestion: "Ask Farmezy about crop prices or mandis...",
    send: "Send"
  },

  "हिन्दी": {
    // Navigation & Workspace
    notifications: "सूचनाएं",
    home: "होम",
    prices: "मंडी भाव",
    outlook: "भाव का अनुमान",
    mandi: "मंडी खोजें",
    sell: "फसल बेचें",
    browse: "फसलें देखें",
    requests: "ऑर्डर अनुरोध",
    myRequests: "मेरे अनुरोध",
    orders: "ऑर्डर",
    greeting: "नमस्ते!",
    tagline: "बेहतर बाज़ार, बेहतर कमाई।",
    farmerWorkspace: "किसान कार्यक्षेत्र",
    customerWorkspace: "ग्राहक बाज़ार",
    farmer: "किसान",
    customer: "ग्राहक",
    yourWorkspace: "कार्यक्षेत्र",
    menu: "मेन्यू",
    needHelp: "सहायता केंद्र",
    askFarmezy: "मंडी भाव या फसल के बारे में पूछें।",
    chatWithUs: "बातचीत करें",
    signOut: "साइन आउट",
    logOut: "लॉग आउट",

    // Actions & Buttons
    buyRequest: "खरीदें / अनुरोध",
    buy: "खरीदें",
    request: "अनुरोध",
    call: "कॉल करें",
    whatsapp: "व्हाट्सएप",
    bestRoute: "रास्ता देखें",
    route: "रास्ता",
    directions: "दिशा-निर्देश",
    delete: "हटाएं",
    edit: "संपादित करें",
    save: "सहेजें",
    submit: "सबमिट करें",
    cancel: "रद्द करें",
    close: "बंद करें",
    viewAll: "सभी देखें",
    viewDetails: "विवरण देखें",
    back: "वापस",
    apply: "लागू करें",
    clear: "हटाएं",
    clearAll: "सभी साफ करें",
    refresh: "ताज़ा करें",
    search: "खोजें",
    filter: "फ़िल्टर",
    sortBy: "क्रमबद्ध करें",
    takePhoto: "कैमरा से फोटो लें",
    uploadPhoto: "फोटो अपलोड करें",
    chooseGallery: "गैलरी से चुनें",
    publishListing: "फसल प्रकाशित करें",
    saving: "सहेज रहे हैं...",
    loading: "लोड हो रहा है...",
    connecting: "फ़ार्मेज़ी से जुड़ रहे हैं...",

    // Produce & Listings
    crop: "फसल",
    available: "उपलब्ध मात्रा",
    askingPrice: "मांग मूल्य",
    price: "मूल्य",
    quantity: "मात्रा",
    unit: "इकाई",
    farmerPickup: "किसान / स्थान",
    nearby: "आपके नज़दीक (< 1 किमी)",
    kmAway: "किमी दूर",
    officialGovtPrices: "सरकारी मंडी भाव",
    allVegetables: "सभी सब्जियां व फसलें",
    welcomeTitleFarmer: "आपकी उपज, आपका अधिकार।",
    welcomeTitleCustomer: "सीधे किसानों व मंडियों से ताज़ा फसलें पाएं।",
    welcomeSubFarmer: "कैमरा से अपनी फसल की फोटो जोड़ें और अपने जिले के ताज़ा सरकारी भाव देखें।",
    welcomeSubCustomer: "भारत सरकार द्वारा प्रतिदिन जारी किए जाने वाले मंडी भाव देखें।",
    authTitle: "फ़ार्मेज़ी लॉगिन व प्रमाणीकरण",
    authWelcome: "फ़ार्मेज़ी में आपका स्वागत है।",
    authSub: "ताज़ा मंडी भाव देखने, फसल बेचने या खरीदने के लिए साइन इन करें।",
    signIn: "साइन इन करें",
    signUp: "नया खाता बनाएं",
    demoFarmer: "डेमो किसान लॉगिन (रमेश)",
    demoCustomer: "डेमो ग्राहक लॉगिन (प्रिया)",

    // Filters & Sorting
    allCrops: "सभी फसलें",
    searchProduce: "फसलें खोजें...",
    nearestFirst: "दूरी: नजदीकी पहले",
    priceLowHigh: "कीमत: कम से ज्यादा",
    priceHighLow: "कीमत: ज्यादा से कम",
    noProduceFound: "कोई उपज नहीं मिली।",

    // Orders & Requests
    allOrders: "सभी ऑर्डर",
    pending: "लंबित",
    accepted: "स्वीकृत",
    preparing: "तैयार किया जा रहा है",
    ready: "तैयार है",
    completed: "पूर्ण",
    cancelled: "रद्द",
    orderId: "ऑर्डर आईडी",
    customerDetails: "ग्राहक विवरण",
    farmerDetails: "किसान विवरण",
    totalAmount: "कुल राशि",
    subtotal: "उप-योग",
    deliveryFee: "डिलीवरी शुल्क",
    freeDelivery: "मुफ़्त",
    grandTotal: "कुल योग",
    status: "स्थिति",
    paymentMethod: "भुगतान विधि",
    paymentStatus: "भुगतान स्थिति",
    acceptOrder: "ऑर्डर स्वीकार करें",
    startPreparing: "तैयारी शुरू करें",
    markReady: "तैयार मार्क करें",
    completeOrder: "ऑर्डर पूरा करें",
    cancelOrder: "ऑर्डर रद्द करें",

    // Invoices
    invoice: "चालान (Invoice)",
    downloadInvoice: "चालान PDF डाउनलोड करें",
    printInvoice: "चालान प्रिंट करें",
    invoicePreview: "चालान पूर्वावलोकन",
    invoiceNumber: "चालान संख्या",
    invoiceDate: "चालान दिनांक",
    billedTo: "बिल प्राप्तकर्ता",
    soldBy: "विक्रेता किसान",
    itemDescription: "वस्तु विवरण",
    unitPrice: "इकाई दर",
    electronicInvoice: "फ़ार्मेज़ी द्वारा स्वचालित रूप से तैयार इलेक्ट्रॉनिक चालान।",

    // Ratings & Reviews
    rateAndReview: "रेटिंग और समीक्षा दें",
    customerReviews: "ग्राहक समीक्षाएं",
    rateProduce: "उपज की गुणवत्ता रेटिंग",
    rateFarmer: "किसान सेवा रेटिंग",
    writeReview: "अपनी समीक्षा लिखें...",
    submitReview: "समीक्षा सबमिट करें",
    editReview: "संपादित करें",
    deleteReview: "हटाएं",
    verifiedPurchase: "सत्यापित खरीद",
    basedOnReviews: "समीक्षाओं के आधार पर",
    starBreakdown: "स्टार विवरण",
    noReviewsYet: "अभी तक कोई समीक्षा नहीं है। पहले समीक्षक बनें!",

    // Notifications
    notificationHistory: "सूचना इतिहास",
    unread: "अपठित",
    read: "पढ़ी गई",
    all: "सभी",
    markAllRead: "सभी पढ़ी गईं मार्क करें",
    allCaughtUp: "सब कुछ पढ़ लिया गया है!",
    noNotifications: "कोई नई सूचना नहीं है।",

    // Official Prices Table & Filters
    allCategories: "सभी श्रेणियां",
    vegetables: "सब्जियां",
    fruits: "फल",
    grains: "अनाज",
    spices: "मसाले",
    pulses: "दालें",
    oilseeds: "तिलहन",
    flowers: "फूल",
    livestock: "पशुधन",
    dairy: "डेयरी",
    fiber: "रेशा/कपास",
    other: "अन्य",
    commodity: "जिंस (फसल)",
    variety: "किस्म",
    grade: "श्रेणी",
    state: "राज्य",
    district: "जिला",
    marketApmc: "मंडी / एपीएमसी",
    minPrice: "न्यूनतम भाव",
    maxPrice: "अधिकतम भाव",
    modalPrice: "मॉडल भाव",
    date: "दिनांक",
    viewTable: "तालिका देखें",
    viewCards: "कार्ड्स देखें",
    sevenDayTrend: "7-दिवसीय अनुमानित रुझान",
    favorableSelling: "बिक्री का अनुकूल समय",

    // Chatbot
    smartAssistant: "फ़ार्मेज़ी स्मार्ट सहायक",
    whoAreYou: "आप कौन हैं?",
    howCanYouHelp: "आप क्या मदद कर सकते हैं?",
    gingerInMyArea: "मेरे क्षेत्र में अदरक का भाव",
    tomatoInMyArea: "मेरे क्षेत्र में टमाटर का भाव",
    onionInMyArea: "मेरे क्षेत्र में प्याज का भाव",
    sevenDayWeather: "7-दिवसीय मौसम",
    garlicInMandsaur: "मंदसौर में लहसुन",
    pestControl: "कीट नियंत्रण",
    mandiTable: "मंडी तालिका",
    typeQuestion: "मंडी भाव, फसल या मौसम के बारे में पूछें...",
    send: "भेजें"
  },

  "ಕನ್ನಡ": {
    // Navigation & Workspace
    notifications: "ಅಧಿಸೂಚನೆಗಳು",
    home: "ಮುಖಪುಟ",
    prices: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",
    outlook: "ಬೆಲೆ ಮುನ್ಸೂಚನೆ",
    mandi: "ಮಂಡಿ ಹುಡುಕಿ",
    sell: "ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ",
    browse: "ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    requests: "ಆರ್ಡರ್ ವಿನಂತಿಗಳು",
    myRequests: "ನನ್ನ ವಿನಂತಿಗಳು",
    orders: "ಆರ್ಡರ್‌ಗಳು",
    greeting: "ನಮಸ್ಕಾರ!",
    tagline: "ನ್ಯಾಯಯುತ ಮಾರುಕಟ್ಟೆ, ಉತ್ತಮ ಆದಾಯ.",
    farmerWorkspace: "ರೈತ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    customerWorkspace: "ಗ್ರಾಹಕ ಮಾರುಕಟ್ಟೆ",
    farmer: "ರೈತ",
    customer: "ಗ್ರಾಹಕ",
    yourWorkspace: "ಕಾರ್ಯಕ್ಷೇತ್ರ",
    menu: "ಪಟ್ಟಿ",
    needHelp: "ಸಹಾಯ ಕೇಂದ್ರ",
    askFarmezy: "ಬೆಲೆ ಅಥವಾ ಮಂಡಿ ಬಗ್ಗೆ ವಿಚಾರಿಸಿ.",
    chatWithUs: "ಸಂಪರ್ಕಿಸಿ",
    signOut: "ಸೈನ್ ಔಟ್",
    logOut: "ಲಾಗ್ ಔಟ್",

    // Actions & Buttons
    buyRequest: "ಖರೀದಿಸಿ / ವಿನಂತಿಸಿ",
    buy: "ಖರೀದಿಸಿ",
    request: "ವಿನಂತಿ",
    call: "ಕರೆ ಮಾಡಿ",
    whatsapp: "ವಾಟ್ಸಾಪ್",
    bestRoute: "ದಾರಿ ನಕ್ಷೆ",
    route: "ದಾರಿ",
    directions: "ದಿಕ್ಕುಗಳು",
    delete: "ಅಳಿಸಿ",
    edit: "ತಿದ್ದುಪಡಿ",
    save: "ಉಳಿಸಿ",
    submit: "ಸಲ್ಲಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    close: "ಮುಚ್ಚಿ",
    viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    viewDetails: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    back: "ಹಿಂದೆ",
    apply: "ಅನ್ವಯಿಸು",
    clear: "ತೆರವುಗೊಳಿಸಿ",
    clearAll: "ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ",
    refresh: "ನವೀಕರಿಸಿ",
    search: "ಹುಡುಕಿ",
    filter: "ಫಿಲ್ಟರ್",
    sortBy: "ವಿಂಗಡಿಸಿ",
    takePhoto: "ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    uploadPhoto: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    chooseGallery: "ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ",
    publishListing: "ಬೆಳೆ ಪಟ್ಟಿ ಪ್ರಕಟಿಸಿ",
    saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    connecting: "ಫಾರ್ಮೆಜಿಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",

    // Produce & Listings
    crop: "ಬೆಳೆ",
    available: "ಲಭ್ಯತೆ",
    askingPrice: "ಕೇಳುವ ಬೆಲೆ",
    price: "ಬೆಲೆ",
    quantity: "ಪ್ರಮಾಣ",
    unit: "ಘಟಕ",
    farmerPickup: "ರೈತ / ಸ್ಥಳ",
    nearby: "ನಿಮ್ಮ ಸಮೀಪದಲ್ಲಿ (< 1 ಕಿ.ಮೀ)",
    kmAway: "ಕಿ.ಮೀ ದೂರ",
    officialGovtPrices: "ಸರ್ಕಾರಿ ಮಂಡಿ ಬೆಲೆಗಳು",
    allVegetables: "ಎಲ್ಲಾ ತರಕಾರಿಗಳು ಮತ್ತು ಬೆಳೆಗಳು",
    welcomeTitleFarmer: "ನಿಮ್ಮ ಬೆಳೆ, ನಿಮ್ಮ ವ್ಯಾಪಾರ.",
    welcomeTitleCustomer: "ಭಾರತದ ಮಂಡಿಗಳಿಂದ ತಾಜಾ ಬೆಳೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
    welcomeSubFarmer: "ಕ್ಯಾಮೆರಾದಿಂದ ಬೆಳೆಯ ನೈಜ ಫೋಟೋ ಸೇರಿಸಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    welcomeSubCustomer: "ಸರ್ಕಾರದ ಅಧಿಕೃತ ಮಂಡಿ ಬೆಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    authTitle: "ಫಾರ್ಮೆಜಿ ಲಾಗಿನ್ ಮತ್ತು ದೃಢೀಕರಣ",
    authWelcome: "ಫಾರ್ಮೆಜಿಗೆ ಸುಸ್ವಾಗತ.",
    authSub: "ಬೆಲೆಗಳನ್ನು ನೋಡಲು, ಬೆಳೆ ಮಾರಾಟ ಮಾಡಲು ಅಥವಾ ಖರೀದಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ.",
    signIn: "ಸೈನ್ ಇನ್",
    signUp: "ಖಾತೆ ರಚಿಸಿ",
    demoFarmer: "ಡೆಮೊ ರೈತ ಲಾಗಿನ್ (ರಮೇಶ್)",
    demoCustomer: "ಡೆಮೊ ಗ್ರಾಹಕ ಲಾಗಿನ್ (ಪ್ರಿಯಾ)",

    // Filters & Sorting
    allCrops: "ಎಲ್ಲಾ ಬೆಳೆಗಳು",
    searchProduce: "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...",
    nearestFirst: "ದೂರ: ಹತ್ತಿರದ ಮೊದಲಿಗೆ",
    priceLowHigh: "ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು",
    priceHighLow: "ಬೆಲೆ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ",
    noProduceFound: "ಯಾವುದೇ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",

    // Orders & Requests
    allOrders: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು",
    pending: "ಬಾಕಿ ಇದೆ",
    accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    preparing: "ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ",
    ready: "ಸಿದ್ಧವಾಗಿದೆ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    cancelled: "ರದ್ದುಗೊಂಡಿದೆ",
    orderId: "ಆರ್ಡರ್ ಐಡಿ",
    customerDetails: "ಗ್ರಾಹಕರ ವಿವರಗಳು",
    farmerDetails: "ರೈತರ ವಿವರಗಳು",
    totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
    subtotal: "ಉಪಮೊತ್ತ",
    deliveryFee: "ವಿತರಣಾ ಶುಲ್ಕ",
    freeDelivery: "ಉಚಿತ",
    grandTotal: "ಒಟ್ಟು ಮೊತ್ತ",
    status: "ಸ್ಥಿತಿ",
    paymentMethod: "ಪಾವತಿ ವಿಧಾನ",
    paymentStatus: "ಪಾವತಿ ಸ್ಥಿತಿ",
    acceptOrder: "ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಿ",
    startPreparing: "ಸಿದ್ಧತೆ ಪ್ರಾರಂಭಿಸಿ",
    markReady: "ಸಿದ್ಧವೆಂದು ಗುರುತಿಸಿ",
    completeOrder: "ಆರ್ಡರ್ ಪೂರ್ಣಗೊಳಿಸಿ",
    cancelOrder: "ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ",

    // Invoices
    invoice: "ಇನ್‌ವಾಯ್ಸ್ (ರಸೀದಿ)",
    downloadInvoice: "ಇನ್‌ವಾಯ್ಸ್ PDF ಡೌನ್‌ಲೋಡ್",
    printInvoice: "ಇನ್‌ವಾಯ್ಸ್ ಮುದ್ರಿಸಿ",
    invoicePreview: "ಇನ್‌ವಾಯ್ಸ್ ಮುನ್ನೋಟ",
    invoiceNumber: "ಇನ್‌ವಾಯ್ಸ್ ಸಂಖ್ಯೆ",
    invoiceDate: "ದಿನಾಂಕ",
    billedTo: "ಗ್ರಾಹಕರಿಗೆ ಬಿಲ್",
    soldBy: "ಮಾರಾಟಗಾರ ರೈತ",
    itemDescription: "ವಸ್ತು ವಿವರಣೆ",
    unitPrice: "ಘಟಕ ಬೆಲೆ",
    electronicInvoice: "ಫಾರ್ಮೆಜಿಯಿಂದ ಕಂಪ್ಯೂಟರ್ ರಚಿತ ಇ-ಇನ್‌ವಾಯ್ಸ್.",

    // Ratings & Reviews
    rateAndReview: "ರೇಟಿಂಗ್ ಮತ್ತು ವಿಮರ್ಶೆ ನೀಡಿ",
    customerReviews: "ಗ್ರಾಹಕರ ವಿಮರ್ಶೆಗಳು",
    rateProduce: "ಉತ್ಪನ್ನದ ಗುಣಮಟ್ಟ ರೇಟಿಂಗ್",
    rateFarmer: "ರೈತರ ಸೇವಾ ರೇಟಿಂಗ್",
    writeReview: "ನಿಮ್ಮ ವಿಮರ್ಶೆ ಬರೆಯಿರಿ...",
    submitReview: "ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಿ",
    editReview: "ತಿದ್ದುಪಡಿ",
    deleteReview: "ಅಳಿಸಿ",
    verifiedPurchase: "ಪರಿಶೀಲಿಸಿದ ಖರೀದಿ",
    basedOnReviews: "ವಿಮರ್ಶೆಗಳ ಆಧಾರದ ಮೇಲೆ",
    starBreakdown: "ಸ್ಟಾರ್ ವಿವರ",
    noReviewsYet: "ಯಾವುದೇ ವಿಮರ್ಶೆಗಳಿಲ್ಲ. ಮೊದಲಿಗರಾಗಿ ವಿಮರ್ಶಿಸಿ!",

    // Notifications
    notificationHistory: "ಅಧಿಸೂಚನೆ ಇತಿಹಾಸ",
    unread: "ಓದದಿರುವುದು",
    read: "ಓದಿದ್ದು",
    all: "ಎಲ್ಲಾ",
    markAllRead: "ಎಲ್ಲವನ್ನೂ ಓದಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    allCaughtUp: "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ!",
    noNotifications: "ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.",

    // Official Prices Table & Filters
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    vegetables: "ತರಕಾರಿಗಳು",
    fruits: "ಹಣ್ಣುಗಳು",
    grains: "ಧಾನ್ಯಗಳು",
    spices: "ಮಸಾಲೆ ಪದಾರ್ಥಗಳು",
    pulses: "ದ್ವಿದಳ ಧಾನ್ಯಗಳು",
    oilseeds: "ಎಣ್ಣೆಕಾಳುಗಳು",
    flowers: "ಹೂವುಗಳು",
    livestock: "ಜಾನುವಾರು",
    dairy: "ಡೈರಿ",
    fiber: "ಹತ್ತಿ/ನಾರು",
    other: "ಇತರ",
    commodity: "ಬೆಳೆ (ಸರಕು)",
    variety: "ತಳಿ",
    grade: "ದರ್ಜೆ",
    state: "ರಾಜ್ಯ",
    district: "ಜಿಲ್ಲೆ",
    marketApmc: "ಮಂಡಿ / ಎಪಿಎಂಸಿ",
    minPrice: "ಕನಿಷ್ಠ ಬೆಲೆ",
    maxPrice: "ಗರಿಷ್ಠ ಬೆಲೆ",
    modalPrice: "ಮಾದರಿ ಬೆಲೆ",
    date: "ದಿನಾಂಕ",
    viewTable: "ಕೋಷ್ಟಕ ವೀಕ್ಷಿಸಿ",
    viewCards: "ಕಾರ್ಡ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    sevenDayTrend: "7-ದಿನಗಳ ಅಂದಾಜು ಪ್ರವೃತ್ತಿ",
    favorableSelling: "ಮಾರಾಟಕ್ಕೆ ಸೂಕ್ತ ಸಮಯ",

    // Chatbot
    smartAssistant: "ಫಾರ್ಮೆಜಿ ಸ್ಮಾರ್ಟ್ ಸಹಾಯಕ",
    whoAreYou: "ನೀವು ಯಾರು?",
    howCanYouHelp: "ನೀವು ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತೀರಿ?",
    gingerInMyArea: "ನನ್ನ ಪ್ರದೇಶದಲ್ಲಿ ಶುಂಠಿ ಬೆಲೆ",
    tomatoInMyArea: "ನನ್ನ ಪ್ರದೇಶದಲ್ಲಿ ಟೊಮ್ಯಾಟೊ ಬೆಲೆ",
    onionInMyArea: "ನನ್ನ ಪ್ರದೇಶದಲ್ಲಿ ಈರುಳ್ಳಿ ಬೆಲೆ",
    sevenDayWeather: "7 ದಿನಗಳ ಹವಾಮಾನ",
    garlicInMandsaur: "ಮಂಡಸೌರ್‌ನಲ್ಲಿ ಬೆಳ್ಳುಳ್ಳಿ",
    pestControl: "ಕೀಟ ನಿಯಂತ್ರಣ",
    mandiTable: "ಮಂಡಿ ಕೋಷ್ಟಕ",
    typeQuestion: "ಬೆಲೆ ಅಥವಾ ಮಂಡಿ ಬಗ್ಗೆ ವಿಚಾರಿಸಿ...",
    send: "ಕಳುಹಿಸಿ"
  },

  "తెలుగు": {
    // Navigation & Workspace
    notifications: "నోటిఫికేషన్‌లు",
    home: "హోమ్",
    prices: "మార్కెట్ ధరలు",
    outlook: "ధర అంచనా",
    mandi: "మండి వెతకండి",
    sell: "పంట అమ్మండి",
    browse: "పంటలను చూడండి",
    requests: "ఆర్డర్ అభ్యర్థనలు",
    myRequests: "నా అభ్యర్థనలు",
    orders: "ఆర్డర్లు",
    greeting: "నమస్కారం!",
    tagline: "సరసమైన మార్కెట్, మెరుగైన ఆదాయం.",
    farmerWorkspace: "రైతు వర్క్‌స్పేస్",
    customerWorkspace: "వినియోగదారుల మార్కెట్",
    farmer: "రైతు",
    customer: "వినియోగదారుడు",
    yourWorkspace: "మీ వర్క్‌స్పేస్",
    menu: "మెనూ",
    needHelp: "సహాయం కావాలా",
    askFarmezy: "పంట ధరలు లేదా మండీల గురించి అడగండి.",
    chatWithUs: "మాట్లాడండి",
    signOut: "సైన్ అవుట్",
    logOut: "లాగ్ అవుట్",

    // Actions & Buttons
    buyRequest: "కొనండి / అభ్యర్థించండి",
    buy: "కొనండి",
    request: "అభ్యర్థన",
    call: "కాల్ చేయండి",
    whatsapp: "వాట్సాప్",
    bestRoute: "మార్గం చూడండి",
    route: "మార్గం",
    directions: "దిశలు",
    delete: "తొలగించు",
    edit: "సవరించు",
    save: "సేవ్ చేయండి",
    submit: "సమర్పించండి",
    cancel: "రద్దు చేయండి",
    close: "మూసివేయి",
    viewAll: "అన్నీ చూడండి",
    viewDetails: "వివరాలు చూడండి",
    back: "వెనుకకు",
    apply: "వర్తింపజేయి",
    clear: "క్లియర్",
    clearAll: "అన్నీ క్లియర్ చేయండి",
    refresh: "తాజాకరించు",
    search: "వెతకండి",
    filter: "ఫిల్టర్",
    sortBy: "క్రమబద్ధీకరించు",
    takePhoto: "కెమెరాతో ఫోటో తీయండి",
    uploadPhoto: "ఫోటో అప్‌లోడ్ చేయండి",
    chooseGallery: "గ్యాలరీ నుండి ఎంచుకోండి",
    publishListing: "పంటను ప్రచురించండి",
    saving: "సేవ్ అవుతోంది...",
    loading: "లోడ్ అవుతోంది...",
    connecting: "ఫార్మెజీకి కనెక్ట్ అవుతోంది...",

    // Produce & Listings
    crop: "పంట",
    available: "లభ్యత",
    askingPrice: "ధర",
    price: "ధర",
    quantity: "పరిమాణం",
    unit: "యూనిట్",
    farmerPickup: "రైతు / ప్రదేశం",
    nearby: "మీ సమీపంలో (< 1 కి.మీ)",
    kmAway: "కి.మీ దూరం",
    officialGovtPrices: "ప్రభుత్వ మండి ధరలు",
    allVegetables: "అన్ని కూరగాయలు & పంటలు",
    welcomeTitleFarmer: "మీ పంట, మీ వ్యాపారం.",
    welcomeTitleCustomer: "తాజా కూరగాయలు మరియు పంటలు పొందండి.",
    welcomeSubFarmer: "కెమెరాతో పంట ఫోటోలు జతచేయండి మరియు లైవ్ మార్కెట్ ధరలు చూడండి.",
    welcomeSubCustomer: "భారత ప్రభుత్వం ద్వారా నివేదించబడిన మండి ధరలను చూడండి.",
    authTitle: "ఫార్మెజీ ప్రామాణీకరణ & లాగిన్",
    authWelcome: "ఫార్మెజీకి స్వాగతం.",
    authSub: "మార్కెట్ ధరలు చూడటానికి, పంట అమ్మడానికి ఖాతాలోకి ప్రవేశించండి.",
    signIn: "సైన్ ఇన్",
    signUp: "కొత్త ఖాతా సృష్టించండి",
    demoFarmer: "డెమో రైతు లాగిన్ (రమేష్)",
    demoCustomer: "డెమో కస్టమర్ లాగిన్ (ప్రియ)",

    // Filters & Sorting
    allCrops: "అన్ని పంటలు",
    searchProduce: "పంటలను వెతకండి...",
    nearestFirst: "దూరం: సమీపంలో ఉన్నవి ముందు",
    priceLowHigh: "ధర: తక్కువ నుండి ఎక్కువ",
    priceHighLow: "ధర: ఎక్కువ నుండి తక్కువ",
    noProduceFound: "ఎలాంటి పంట వివరాలు కనుగొనబడలేదు.",

    // Orders & Requests
    allOrders: "అన్ని ఆర్డర్లు",
    pending: "పెండింగ్‌లో ఉంది",
    accepted: "అంగీకరించబడింది",
    preparing: "సిద్ధం చేయబడుతోంది",
    ready: "సిద్ధంగా ఉంది",
    completed: "పూర్తయింది",
    cancelled: "రద్దు చేయబడింది",
    orderId: "ఆర్డర్ ఐడి",
    customerDetails: "కస్టమర్ వివరాలు",
    farmerDetails: "రైతు వివరాలు",
    totalAmount: "మొత్తం సొమ్ము",
    subtotal: "ఉపమొత్తం",
    deliveryFee: "డెలివరీ ఛార్జీలు",
    freeDelivery: "ఉచితం",
    grandTotal: "మొత్తం మొత్తం",
    status: "స్థితి",
    paymentMethod: "చెల్లింపు విధానం",
    paymentStatus: "చెల్లింపు స్థితి",
    acceptOrder: "ఆర్డర్ అంగీకరించు",
    startPreparing: "తయారీ ప్రారంభించు",
    markReady: "సిద్ధంగా ఉన్నట్లు గుర్తించు",
    completeOrder: "ఆర్డర్ పూర్తి చేయండి",
    cancelOrder: "ఆర్డర్ రద్దు చేయండి",

    // Invoices
    invoice: "ఇన్వాయిస్ (రసీదు)",
    downloadInvoice: "ఇన్వాయిస్ PDF డౌన్‌లోడ్",
    printInvoice: "ఇన్వాయిస్ ప్రింట్ చేయండి",
    invoicePreview: "ఇన్వాయిస్ ప్రివ్యూ",
    invoiceNumber: "ఇన్వాయిస్ సంఖ్య",
    invoiceDate: "తేదీ",
    billedTo: "బిల్ గ్రహీత",
    soldBy: "విక్రేత రైతు",
    itemDescription: "వస్తువు వివరణ",
    unitPrice: "యూనిట్ ధర",
    electronicInvoice: "ఫార్మెజీ ద్వారా రూపొందించబడిన ఎలక్ట్రానిక్ ఇన్వాయిస్.",

    // Ratings & Reviews
    rateAndReview: "రేటింగ్ మరియు సమీక్ష ఇవ్వండి",
    customerReviews: "కస్టమర్ సమీక్షలు",
    rateProduce: "ఉత్పత్తి నాణ్యత రేటింగ్",
    rateFarmer: "రైతు సేవా రేటింగ్",
    writeReview: "మీ సమీక్షను ఇక్కడ రాయండి...",
    submitReview: "సమీక్షను సమర్పించండి",
    editReview: "సవరించు",
    deleteReview: "తొలగించు",
    verifiedPurchase: "ధృవీకరించబడిన కొనుగోలు",
    basedOnReviews: "సమీక్షల ఆధారంగా",
    starBreakdown: "స్టార్ వివరాలు",
    noReviewsYet: "ఇంకా సమీక్షలు లేవు. మొదట మీరే సమీక్షించండి!",

    // Notifications
    notificationHistory: "నోటిఫికేషన్ల చరిత్ర",
    unread: "చదవనివి",
    read: "చదివినవి",
    all: "అన్నీ",
    markAllRead: "అన్నీ చదివినట్లు గుర్తించు",
    allCaughtUp: "అన్నీ చదివారు!",
    noNotifications: "కొత్త నోటిఫికేషన్‌లు లేవు.",

    // Official Prices Table & Filters
    allCategories: "అన్ని వర్గాలు",
    vegetables: "కూరగాయలు",
    fruits: "పండ్లు",
    grains: "ధాన్యాలు",
    spices: "మసాలాలు",
    pulses: "పప్పుదినుసులు",
    oilseeds: "నూనెగింజలు",
    flowers: "పూలు",
    livestock: "పశుసంపద",
    dairy: "డైరీ",
    fiber: "పత్తి/పీచు",
    other: "ఇతర",
    commodity: "పంట (సరుకు)",
    variety: "రకం",
    grade: "గ్రేడ్",
    state: "రాష్ట్రం",
    district: "జిల్లా",
    marketApmc: "మండి / మార్కెట్",
    minPrice: "కనిష్ట ధర",
    maxPrice: "గరిష్ట ధర",
    modalPrice: "మోడల్ ధర",
    date: "తేదీ",
    viewTable: "పట్టిక చూడండి",
    viewCards: "కార్డులు చూడండి",
    sevenDayTrend: "7-రోజుల అంచనా ట్రెండ్",
    favorableSelling: "అమ్మకానికి అనుకూల సమయం",

    // Chatbot
    smartAssistant: "ఫార్మెజీ స్మార్ట్ అసిస్టెంట్",
    whoAreYou: "మీరు ఎవరు?",
    howCanYouHelp: "మీరు ఎలా సహాయపడగలరు?",
    gingerInMyArea: "నా ప్రాంతంలో అల్లం ధర",
    tomatoInMyArea: "నా ప్రాంతంలో టమోటా ధర",
    onionInMyArea: "నా ప్రాంతంలో ఉల్లిపాయ ధర",
    sevenDayWeather: "7 రోజుల వాతావరణం",
    garlicInMandsaur: "మందసౌర్‌లో వెల్లుల్లి",
    pestControl: "పురుగుల నివారణ",
    mandiTable: "మండి పట్టిక",
    typeQuestion: "పంట ధరలు లేదా మండీల గురించి అడగండి...",
    send: "పంపండి"
  },

  "தமிழ்": {
    // Navigation & Workspace
    notifications: "அறிவிப்புகள்",
    home: "முகப்பு",
    prices: "சந்தை விலை",
    outlook: "விலை கணிப்பு",
    mandi: "சந்தையை காண்க",
    sell: "பயிர் விற்கவும்",
    browse: "விளைபொருட்கள்",
    requests: "கோரிக்கைகள்",
    myRequests: "என் கோரிக்கைகள்",
    orders: "ஆர்டர்கள்",
    greeting: "வணக்கம்!",
    tagline: "நியாயமான சந்தை இங்கே தொடங்குகிறது.",
    farmerWorkspace: "விவசாயி பணியிடம்",
    customerWorkspace: "வாடிக்கையாளர் சந்தை",
    farmer: "விவசாயி",
    customer: "வாடிக்கையாளர்",
    yourWorkspace: "பணியிடம்",
    menu: "பட்டி",
    needHelp: "உதவி மையம்",
    askFarmezy: "சந்தை விலை பற்றி கேட்கவும்.",
    chatWithUs: "உரையாடுங்கள்",
    signOut: "வெளியேறு",
    logOut: "வெளியேறு",

    // Actions & Buttons
    buyRequest: "வாங்க / கோர",
    buy: "வாங்க",
    request: "கோரிக்கை",
    call: "அழைக்க",
    whatsapp: "வாட்ஸ்அப்",
    bestRoute: "வழித்தடம்",
    route: "வழித்தடம்",
    directions: "வழிகள்",
    delete: "நீக்கு",
    edit: "திருத்து",
    save: "சேமி",
    submit: "சமர்ப்பி",
    cancel: "ரத்து செய்",
    close: "மூடு",
    viewAll: "அனைத்தும் காண்க",
    viewDetails: "விவரங்களை காண்க",
    back: "பின்செல்",
    apply: "பயன்படுத்து",
    clear: "அழி",
    clearAll: "அனைத்தும் அழி",
    refresh: "புதுப்பி",
    search: "தேடு",
    filter: "வடிகட்டு",
    sortBy: "வரிசைப்படுத்து",
    takePhoto: "கேமராவில் படம் எடுக்கவும்",
    uploadPhoto: "படம் பதிவேற்று",
    chooseGallery: "கேலரியில் இருந்து தேர்வு செய்",
    publishListing: "பயிர் விபரத்தை வெளியிடு",
    saving: "சேமிக்கிறது...",
    loading: "ஏற்றப்படுகிறது...",
    connecting: "பார்மெசியுடன் இணைகிறது...",

    // Produce & Listings
    crop: "பயிர்",
    available: "கிடைப்பது",
    askingPrice: "விலை",
    price: "விலை",
    quantity: "அளவு",
    unit: "அலகு",
    farmerPickup: "விவசாயி / இடம்",
    nearby: "உங்கள் அருகில் (< 1 கி.மீ)",
    kmAway: "கி.மீ தூரம்",
    officialGovtPrices: "அரசு சந்தை விலைகள்",
    allVegetables: "அனைத்து காய்கறிகள்",
    welcomeTitleFarmer: "உங்கள் விளைபொருள், உங்கள் வணிகம்.",
    welcomeTitleCustomer: "இந்திய சந்தைகளில் இருந்து புதிய விளைபொருட்கள்.",
    welcomeSubFarmer: "கேமராவில் நேரடி படம் எடுத்து சந்தை விலைகளை அறியவும்.",
    welcomeSubCustomer: "இந்திய அரசின் தினசரி சந்தை விலைகளை அறியவும்.",
    authTitle: "பார்மெசி உள்நுழைவு",
    authWelcome: "பார்மெசிக்கு நல்வரவு.",
    authSub: "சந்தை விலைகள் அறிய, பயிர் விற்க அல்லது வாங்க உள்நுழையவும்.",
    signIn: "உள்நுழைவு",
    signUp: "புதிய கணக்கு",
    demoFarmer: "மாதிரி விவசாயி (ரமேஷ்)",
    demoCustomer: "மாதிரி வாடிக்கையாளர் (பிரியா)",

    // Filters & Sorting
    allCrops: "அனைத்து பயிர்கள்",
    searchProduce: "விளைபொருட்களை தேடுங்கள்...",
    nearestFirst: "தூரம்: அருகில் உள்ளவை முதலில்",
    priceLowHigh: "விலை: குறைவில் இருந்து அதிகம்",
    priceHighLow: "விலை: அதிகத்தில் இருந்து குறைவு",
    noProduceFound: "பொருட்கள் எதுவும் கிடைக்கவில்லை.",

    // Orders & Requests
    allOrders: "அனைத்து ஆர்டர்கள்",
    pending: "நிலுவையில்",
    accepted: "ஏற்கப்பட்டது",
    preparing: "தயாரிக்கப்படுகிறது",
    ready: "தயாராக உள்ளது",
    completed: "முடிந்தது",
    cancelled: "ரத்து செய்யப்பட்டது",
    orderId: "ஆர்டர் எண்",
    customerDetails: "வாடிக்கையாளர் விவரங்கள்",
    farmerDetails: "விவசாயி விவரங்கள்",
    totalAmount: "மொத்த தொகை",
    subtotal: "துணைத்தொகை",
    deliveryFee: "டெலிவரி கட்டணம்",
    freeDelivery: "இலவசம்",
    grandTotal: "பெரும் மொத்தம்",
    status: "நிலை",
    paymentMethod: "பணம் செலுத்தும் முறை",
    paymentStatus: "பணம் செலுத்தும் நிலை",
    acceptOrder: "ஆர்டரை ஏற்றுக்கொள்",
    startPreparing: "தயாரிப்பைத் தொடங்கு",
    markReady: "தயாராகக் குறிக்கவும்",
    completeOrder: "ஆர்டரை முடிக்கவும்",
    cancelOrder: "ஆர்டரை ரத்து செய்",

    // Invoices
    invoice: "விலைப்பட்டியல் (Invoice)",
    downloadInvoice: "விலைப்பட்டியல் PDF பதிவிறக்கு",
    printInvoice: "அச்சிடுக",
    invoicePreview: "முன்னோட்டம்",
    invoiceNumber: "விலைப்பட்டியல் எண்",
    invoiceDate: "தேதி",
    billedTo: "பெறுநர்",
    soldBy: "விற்பனையாளர் விவசாயி",
    itemDescription: "பொருள் விவரம்",
    unitPrice: "அலகு விலை",
    electronicInvoice: "பார்மெசியின் கணினி மின்னணு விலைப்பட்டியல்.",

    // Ratings & Reviews
    rateAndReview: "மதிப்பீடு மற்றும் மதிப்புரை",
    customerReviews: "வாடிக்கையாளர் மதிப்புரைகள்",
    rateProduce: "பொருள் தர மதிப்பீடு",
    rateFarmer: "விவசாயி சேவை மதிப்பீடு",
    writeReview: "உங்கள் மதிப்புரையை எழுதுங்கள்...",
    submitReview: "மதிப்புரையை சமர்ப்பிக்கவும்",
    editReview: "திருத்து",
    deleteReview: "நீக்கு",
    verifiedPurchase: "சரிபார்க்கப்பட்ட கொள்முதல்",
    basedOnReviews: "மதிப்புரைகளின் அடிப்படையில்",
    starBreakdown: "நட்சத்திர விவரம்",
    noReviewsYet: "மதிப்புரைகள் எதுவும் இல்லை. முதல் நபராக எழுதவும்!",

    // Notifications
    notificationHistory: "அறிவிப்பு வரலாறு",
    unread: "படிக்காதவை",
    read: "படித்தவை",
    all: "அனைத்தும்",
    markAllRead: "அனைத்தையும் படித்ததாகக் குறிக்கவும்",
    allCaughtUp: "அனைத்தும் பார்க்கப்பட்டது!",
    noNotifications: "புதிய அறிவிப்புகள் இல்லை.",

    // Official Prices Table & Filters
    allCategories: "அனைத்து வகைகள்",
    vegetables: "காய்கறிகள்",
    fruits: "பழங்கள்",
    grains: "தானியங்கள்",
    spices: "மசாலா பொருட்கள்",
    pulses: "பருப்பு வகைகள்",
    oilseeds: "எண்ணெய் வித்துக்கள்",
    flowers: "மலர்கள்",
    livestock: "கால்நடைகள்",
    dairy: "பால் பண்ணை",
    fiber: "பருத்தி/நார்",
    other: "மற்றவை",
    commodity: "பண்டம் (பயிர்)",
    variety: "ரகம்",
    grade: "தரம்",
    state: "மாநிலம்",
    district: "மாவட்டம்",
    marketApmc: "சந்தை / மண்டி",
    minPrice: "குறைந்தபட்ச விலை",
    maxPrice: "அதிகபட்ச விலை",
    modalPrice: "மாதிரி விலை",
    date: "தேதி",
    viewTable: "அட்டவணை காண்க",
    viewCards: "அட்டைகள் காண்க",
    sevenDayTrend: "7-நாள் கணிக்கப்பட்ட போக்கு",
    favorableSelling: "விற்பனைக்கு ஏற்ற நேரம்",

    // Chatbot
    smartAssistant: "பார்மெசி ஸ்மார்ட் உதவியாளர்",
    whoAreYou: "நீங்கள் யார்?",
    howCanYouHelp: "நீங்கள் எப்படி உதவ முடியும்?",
    gingerInMyArea: "என் பகுதியில் இஞ்சி விலை",
    tomatoInMyArea: "என் பகுதியில் தக்காளி விலை",
    onionInMyArea: "என் பகுதியில் வெங்காய விலை",
    sevenDayWeather: "7 நாள் வானிலை",
    garlicInMandsaur: "மண்ட்சூரில் பூண்டு",
    pestControl: "பூச்சி கட்டுப்பாடு",
    mandiTable: "சந்தை அட்டவணை",
    typeQuestion: "சந்தை விலை பற்றி கேட்கவும்...",
    send: "அனுப்பு"
  },

  "मराठी": {
    // Navigation & Workspace
    notifications: "सूचना",
    home: "मुख्यपृष्ठ",
    prices: "बाजार भाव",
    outlook: "भावाचा अंदाज",
    mandi: "मंडी शोधा",
    sell: "पीक विका",
    browse: "पीक पहा",
    requests: "मागण्या",
    myRequests: "माझ्या मागण्या",
    orders: "ऑर्डर्स",
    greeting: "नमस्कार!",
    tagline: "योग्य बाजार, उत्तम नफा.",
    farmerWorkspace: "शेतकरी कार्यक्षेत्र",
    customerWorkspace: "ग्राहक बाजार",
    farmer: "शेतकरी",
    customer: "ग्राहक",
    yourWorkspace: "कार्यक्षेत्र",
    menu: "मेनू",
    needHelp: "मदत केंद्र",
    askFarmezy: "मंडी भाव किंवा पिकांबद्दल विचारा.",
    chatWithUs: "संवाद साधा",
    signOut: "साइन आउट",
    logOut: "लॉग आउट",

    // Actions & Buttons
    buyRequest: "खरेदी करा / मागणी",
    buy: "खरेदी करा",
    request: "मागणी",
    call: "कॉल करा",
    whatsapp: "व्हॉट्सअ‍ॅप",
    bestRoute: "मार्ग पहा",
    route: "मार्ग",
    directions: "दिशा",
    delete: "हटवा",
    edit: "संपादित करा",
    save: "जतन करा",
    submit: "सबमिट करा",
    cancel: "रद्द करा",
    close: "बंद करा",
    viewAll: "सर्व पहा",
    viewDetails: "तपशील पहा",
    back: "मागे",
    apply: "लागू करा",
    clear: "साफ करा",
    clearAll: "सर्व साफ करा",
    refresh: "ताजे करा",
    search: "शोधा",
    filter: "फिल्टर",
    sortBy: "क्रमवारी",
    takePhoto: "कॅमेराने फोटो काढा",
    uploadPhoto: "फोटो अपलोड करा",
    chooseGallery: "गॅलरीतून निवडा",
    publishListing: "पीक नोंदणी प्रसिद्ध करा",
    saving: "जतन करत आहे...",
    loading: "लोड होत आहे...",
    connecting: "फार्मइझीशी कनेक्ट होत आहे...",

    // Produce & Listings
    crop: "पीक",
    available: "उपलब्ध",
    askingPrice: "मागणी किंमत",
    price: "किंमत",
    quantity: "प्रमाण",
    unit: "एकक",
    farmerPickup: "शेतकरी / ठिकाण",
    nearby: "तुमच्या जवळ (< १ किमी)",
    kmAway: "किमी अंतरावर",
    officialGovtPrices: "सरकारी बाजार भाव",
    allVegetables: "सर्व भाज्या व पिके",
    welcomeTitleFarmer: "तुमचे पीक, तुमचा व्यवसाय.",
    welcomeTitleCustomer: "ताजी पिके व बाजार भाव मिळवा.",
    welcomeSubFarmer: "कॅमेराने पिकाचा फोटो जोडा व जिल्ह्याचे थेट सरकारी भाव तपासा.",
    welcomeSubCustomer: "भारत सरकारच्या अधिकृत मंडीतील रोजचे भाव तपासा.",
    authTitle: "फार्मइझी प्रमाणीकरण व लॉगिन",
    authWelcome: "फार्मइझीमध्ये आपले स्वागत आहे.",
    authSub: "बाजार भाव पाहण्यासाठी, पीक विक्री किंवा खरेदीसाठी लॉगिन करा.",
    signIn: "साइन इन",
    signUp: "नवीन खाते तयार करा",
    demoFarmer: "डेमो शेतकरी लॉगिन (रमेश)",
    demoCustomer: "डेमो ग्राहक लॉगिन (प्रिया)",

    // Filters & Sorting
    allCrops: "सर्व पिके",
    searchProduce: "पिके शोधा...",
    nearestFirst: "अंतर: जवळचे आधी",
    priceLowHigh: "किंमत: कमी ते जास्त",
    priceHighLow: "किंमत: जास्त ते कमी",
    noProduceFound: "कोणतीही पिके आढळली नाहीत.",

    // Orders & Requests
    allOrders: "सर्व ऑर्डर्स",
    pending: "प्रलंबित",
    accepted: "स्वीकारले",
    preparing: "तयार करत आहे",
    ready: "तयार आहे",
    completed: "पूर्ण झाले",
    cancelled: "रद्द झाले",
    orderId: "ऑर्डर आयडी",
    customerDetails: "ग्राहक तपशील",
    farmerDetails: "शेतकरी तपशील",
    totalAmount: "एकूण रक्कम",
    subtotal: "उपएकूण",
    deliveryFee: "वितरण शुल्क",
    freeDelivery: "मोफत",
    grandTotal: "एकूण बेरीज",
    status: "स्थिती",
    paymentMethod: "पेमेंट पद्धत",
    paymentStatus: "पेमेंट स्थिती",
    acceptOrder: "ऑर्डर स्वीकारा",
    startPreparing: "तयारी सुरू करा",
    markReady: "तयार म्हणून चिन्हांकित करा",
    completeOrder: "ऑर्डर पूर्ण करा",
    cancelOrder: "ऑर्डर रद्द करा",

    // Invoices
    invoice: "बीजक (Invoice)",
    downloadInvoice: "बीजक PDF डाउनलोड",
    printInvoice: "बीजक प्रिंट करा",
    invoicePreview: "बीजक पूर्वावलोकन",
    invoiceNumber: "बीजक क्रमांक",
    invoiceDate: "दिनांक",
    billedTo: "बिल प्राप्तकर्ता",
    soldBy: "विक्रेता शेतकरी",
    itemDescription: "वस्तूचे वर्णन",
    unitPrice: "एकक दर",
    electronicInvoice: "फार्मइझीद्वारे संगणकीकृत इलेक्ट्रॉनिक बीजक.",

    // Ratings & Reviews
    rateAndReview: "रेटिंग व अभिप्राय द्या",
    customerReviews: "ग्राहक अभिप्राय",
    rateProduce: "मालाचा दर्जा रेटिंग",
    rateFarmer: "शेतकरी सेवा रेटिंग",
    writeReview: "आपला अभिप्राय लिहा...",
    submitReview: "अभिप्राय सबमिट करा",
    editReview: "संपादित करा",
    deleteReview: "हटवा",
    verifiedPurchase: "पडताळलेली खरेदी",
    basedOnReviews: "अभिप्रायांवर आधारित",
    starBreakdown: "स्टार तपशील",
    noReviewsYet: "अद्याप कोणताही अभिप्राय नाही. पहिले समीक्षक व्हा!",

    // Notifications
    notificationHistory: "सूचना इतिहास",
    unread: "न वाचलेले",
    read: "वाचलेले",
    all: "सर्व",
    markAllRead: "सर्व वाचले म्हणून चिन्हांकित करा",
    allCaughtUp: "सर्व सूचना वाचल्या आहेत!",
    noNotifications: "कोणतीही नवीन सूचना नाही.",

    // Official Prices Table & Filters
    allCategories: "सर्व वर्ग",
    vegetables: "भाज्या",
    fruits: "फळे",
    grains: "धान्य",
    spices: "मसाले",
    pulses: "डाळी",
    oilseeds: "गळीत धान्य (तेलबिया)",
    flowers: "फुले",
    livestock: "पशुधन",
    dairy: "दुग्धव्यवसाय",
    fiber: "कापूस/धागा",
    other: "इतर",
    commodity: "शेतमाल (पीक)",
    variety: "जात",
    grade: "प्रत",
    state: "राज्य",
    district: "जिल्हा",
    marketApmc: "मंडी / बाजार समिती",
    minPrice: "किमान भाव",
    maxPrice: "कमाल भाव",
    modalPrice: "सरासरी भाव",
    date: "दिनांक",
    viewTable: "तक्ता पहा",
    viewCards: "कार्ड्स पहा",
    sevenDayTrend: "७ दिवसांचा संभाव्य कल",
    favorableSelling: "विक्रीची योग्य वेळ",

    // Chatbot
    smartAssistant: "फार्मइझी स्मार्ट सहाय्यक",
    whoAreYou: "तुम्ही कोण आहात?",
    howCanYouHelp: "तुम्ही कशी मदत करू शकता?",
    gingerInMyArea: "माझ्या भागातील आल्याचा भाव",
    tomatoInMyArea: "माझ्या भागातील टोमॅटोचा भाव",
    onionInMyArea: "माझ्या भागातील कांद्याचा भाव",
    sevenDayWeather: "७ दिवसांचे हवामान",
    garlicInMandsaur: "मंदसौरमध्ये लसूण",
    pestControl: "कीड नियंत्रण",
    mandiTable: "मंडी तक्ता",
    typeQuestion: "मंडी भाव, पीक किंवा हवामानाबद्दल विचारा...",
    send: "पाठवा"
  }
};

// 40+ Agricultural Crops Translations across all 6 languages
export const CROP_TRANSLATIONS = {
  "Tomato": { "English": "Tomato", "हिन्दी": "टमाटर", "ಕನ್ನಡ": "ಟೊಮ್ಯಾಟೊ", "తెలుగు": "టమోటా", "தமிழ்": "தக்காளி", "मराठी": "टोमॅटो" },
  "Onion": { "English": "Onion", "हिन्दी": "प्याज", "ಕನ್ನಡ": "ಈರುಳ್ಳಿ", "తెలుగు": "ఉల్లిపాయ", "தமிழ்": "வெங்காயம்", "मराठी": "कांदा" },
  "Potato": { "English": "Potato", "हिन्दी": "आलू", "ಕನ್ನಡ": "ಆಲೂಗಡ್ಡೆ", "తెలుగు": "బంగాళాదుంప", "தமிழ்": "உருளைக்கிழங்கு", "मराठी": "बटाटा" },
  "Ginger": { "English": "Ginger", "हिन्दी": "अदरक", "ಕನ್ನಡ": "ಶುಂಠಿ", "తెలుగు": "అల్లం", "தமிழ்": "இஞ்சி", "मराठी": "आले" },
  "Garlic": { "English": "Garlic", "हिन्दी": "लहसुन", "ಕನ್ನಡ": "ಬೆಳ್ಳುಳ್ಳಿ", "తెలుగు": "వెల్లుల్లి", "தமிழ்": "பூண்டு", "मराठी": "लसूण" },
  "Green Chilli": { "English": "Green Chilli", "हिन्दी": "हरी मिर्च", "ಕನ್ನಡ": "ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ", "తెలుగు": "పచ్చి మిరపకాయ", "தமிழ்": "பச்சை மிளகாய்", "मराठी": "हिरवी मिरची" },
  "Chilli": { "English": "Chilli", "हिन्दी": "मिर्च", "ಕನ್ನಡ": "ಮೆಣಸಿನಕಾಯಿ", "తెలుగు": "మిరపకాయ", "தமிழ்": "மிளகாய்", "मराठी": "मिरची" },
  "Turmeric": { "English": "Turmeric", "हिन्दी": "हल्दी", "ಕನ್ನಡ": "ಅರಿಶಿನ", "తెలుగు": "పసుపు", "தமிழ்": "மஞ்சள்", "मराठी": "हळद" },
  "Cabbage": { "English": "Cabbage", "हिन्दी": "पत्तागोभी", "ಕನ್ನಡ": "ಎಲೆಕೋಸು", "తెలుగు": "క్యాబేజీ", "தமிழ்": "முட்டைக்கோஸ்", "मराठी": "कोबी" },
  "Cauliflower": { "English": "Cauliflower", "हिन्दी": "फूलगोभी", "ಕನ್ನಡ": "ಹೂಕೋಸು", "తెలుగు": "కాలీఫ్లవర్", "தமிழ்": "காலிஃபிளவர்", "मराठी": "फ्लॉवर" },
  "Carrot": { "English": "Carrot", "हिन्दी": "गाजर", "ಕನ್ನಡ": "ಗಜ್ಜರಿ (ಕ್ಯಾರೆಟ್)", "తెలుగు": "క్యారెట్", "தமிழ்": "கேரட்", "मराठी": "गाजर" },
  "Brinjal": { "English": "Brinjal", "हिन्दी": "बैंगन", "ಕನ್ನಡ": "ಬದನೆಕಾಯಿ", "తెలుగు": "వంకాయ", "தமிழ்": "கத்தரிக்காய்", "मराठी": "वांगी" },
  "Bhindi": { "English": "Bhindi", "हिन्दी": "भिंडी", "ಕನ್ನಡ": "ಬೆಂಡೆಕಾಯಿ", "తెలుగు": "బెండకాయ", "தமிழ்": "வெண்டைக்காய்", "मराठी": "भेंडी" },
  "Ladies Finger": { "English": "Ladies Finger", "हिन्दी": "भिंडी", "ಕನ್ನಡ": "ಬೆಂಡೆಕಾಯಿ", "తెలుగు": "బెండకాయ", "தமிழ்": "வெண்டைக்காய்", "मराठी": "भेंडी" },
  "Okra": { "English": "Okra", "हिन्दी": "भिंडी", "ಕನ್ನಡ": "ಬೆಂಡೆಕಾಯಿ", "తెలుగు": "బెండకాయ", "தமிழ்": "வெண்டைக்காய்", "मराठी": "भेंडी" },
  "Capsicum": { "English": "Capsicum", "हिन्दी": "शिमला मिर्च", "ಕನ್ನಡ": "ದಪ್ಪ ಮೆಣಸಿನಕಾಯಿ", "తెలుగు": "క్యాప్సికమ్", "தமிழ்": "குடைமிளகாய்", "मराठी": "ढोबळी मिरची" },
  "Cucumber": { "English": "Cucumber", "हिन्दी": "खीरा", "ಕನ್ನಡ": "ಸೌತೆಕಾಯಿ", "తెలుగు": "దోసకాయ", "தமிழ்": "வெள்ளரிக்காய்", "मराठी": "काकडी" },
  "Spinach": { "English": "Spinach", "हिन्दी": "पालक", "ಕನ್ನಡ": "ಪಾಲಕ್ ಸೊಪ್ಪು", "తెలుగు": "పాలకూర", "தமிழ்": "பசலைக் கீரை", "मराठी": "पालक" },
  "Coriander": { "English": "Coriander", "हिन्दी": "धनिया", "ಕನ್ನಡ": "ಕೊತ್ತಂಬರಿ", "తెలుగు": "కొత్తిమీర", "தமிழ்": "கொத்தமல்லி", "मराठी": "कोथिंबीर" },
  "Fenugreek": { "English": "Fenugreek", "हिन्दी": "मेथी", "ಕನ್ನಡ": "ಮೆಂತ್ಯ", "తెలుగు": "మెంతులు", "தமிழ்": "வெந்தயம்", "मराठी": "मेथी" },
  "Wheat": { "English": "Wheat", "हिन्दी": "गेहूं", "ಕನ್ನಡ": "ಗೋಧಿ", "తెలుగు": "గోధుమలు", "தமிழ்": "கோதுமை", "मराठी": "गहू" },
  "Rice": { "English": "Rice", "हिन्दी": "चावल", "ಕನ್ನಡ": "ಅಕ್ಕಿ", "తెలుగు": "బియ్యం", "தமிழ்": "அரிசி", "मराठी": "तांदूळ" },
  "Paddy": { "English": "Paddy", "हिन्दी": "धान", "ಕನ್ನಡ": "ಭತ್ತ", "తెలుగు": "వరి / ధాన్యం", "தமிழ்": "நெல்", "मराठी": "भात / धान" },
  "Maize": { "English": "Maize", "हिन्दी": "मक्का", "ಕನ್ನಡ": "ಮೆಕ್ಕೆಜೋಳ", "తెలుగు": "మొక్కజొన్న", "தமிழ்": "மக்காச்சோளம்", "मराठी": "मका" },
  "Cotton": { "English": "Cotton", "हिन्दी": "कपास", "ಕನ್ನಡ": "ಹತ್ತಿ", "తెలుగు": "పత్తి", "தமிழ்": "பருத்தி", "मराठी": "कापूस" },
  "Soybean": { "English": "Soybean", "हिन्दी": "सोयाबीन", "ಕನ್ನಡ": "ಸೋಯಾಬೀನ್", "తెలుగు": "సోయాబీన్", "தமிழ்": "சோயாபீன்", "मराठी": "सोयाबीन" },
  "Groundnut": { "English": "Groundnut", "हिन्दी": "मूंगफली", "ಕನ್ನಡ": "ಕಡಲೆಕಾಯಿ", "తెలుగు": "వేరుశెనగ", "தமிழ்": "வேர்க்கடலை", "मराठी": "भुईमूग" },
  "Mustard": { "English": "Mustard", "हिन्दी": "सरसों", "ಕನ್ನಡ": "ಸಾಸಿವೆ", "తెలుగు": "ఆవాలు", "தமிழ்": "கடுகு", "मराठी": "मोहरी" },
  "Apple": { "English": "Apple", "हिन्दी": "सेब", "ಕನ್ನಡ": "ಸೇಬು", "తెలుగు": "ఆపిల్", "தமிழ்": "ஆப்பிள்", "मराठी": "सफरचंद" },
  "Banana": { "English": "Banana", "हिन्दी": "केला", "ಕನ್ನಡ": "ಬಾಳೆಹಣ್ಣು", "తెలుగు": "అరటిపండు", "தமிழ்": "வாழைப்பழம்", "मराठी": "केळी" },
  "Mango": { "English": "Mango", "हिन्दी": "आम", "ಕನ್ನಡ": "ಮಾವಿನಹಣ್ಣು", "తెలుగు": "మామిడిపండు", "தமிழ்": "மாம்பழம்", "मराठी": "आंबा" },
  "Lemon": { "English": "Lemon", "हिन्दी": "नींबू", "ಕನ್ನಡ": "ನಿಂಬೆಹಣ್ಣು", "తెలుగు": "నిమ్మకాయ", "தமிழ்": "எலுமிச்சை", "मराठी": "लिंबू" },
  "Coconut": { "English": "Coconut", "हिन्दी": "नारियल", "ಕನ್ನಡ": "ತೆಂಗಿನಕಾಯಿ", "తెలుగు": "కొబ్బరికాయ", "தமிழ்": "தேங்காய்", "मराठी": "नारळ" },
  "Gram": { "English": "Gram", "हिन्दी": "चना", "ಕನ್ನಡ": "ಕಡಲೆ", "తెలుగు": "శనగలు", "தமிழ்": "கொண்டைக்கடலை", "मराठी": "हरभरा" },
  "Black Gram": { "English": "Black Gram", "हिन्दी": "उड़द", "ಕನ್ನಡ": "ಉದ್ದು", "తెలుగు": "మినుములు", "தமிழ்": "உளுந்து", "मराठी": "उडीद" },
  "Green Gram": { "English": "Green Gram", "हिन्दी": "मूंग", "ಕನ್ನಡ": "ಹೆಸರುಕಾಳು", "తెలుగు": "పెసలు", "தமிழ்": "பாசிப்பயறு", "मराठी": "मूग" },
  "Red Gram": { "English": "Red Gram", "हिन्दी": "अरहर / तुअर", "ಕನ್ನಡ": "ತೊಗರಿ", "తెలుగు": "కందులు", "தமிழ்": "துவரம்பருப்பு", "मराठी": "तूर" },
  "Arhar": { "English": "Arhar", "हिन्दी": "अरहर", "ಕನ್ನಡ": "ತೊಗರಿ", "తెలుగు": "కందులు", "தமிழ்": "துவரை", "मराठी": "तूर" }
};

// Categories
export const CATEGORY_TRANSLATIONS = {
  "All Categories": { "English": "All Categories", "हिन्दी": "सभी श्रेणियां", "ಕನ್ನಡ": "ಎಲ್ಲಾ ವರ್ಗಗಳು", "తెలుగు": "అన్ని వర్గాలు", "தமிழ்": "அனைத்து வகைகள்", "मराठी": "सर्व वर्ग" },
  "Vegetables": { "English": "Vegetables", "हिन्दी": "सब्जियां", "ಕನ್ನಡ": "ತರಕಾರಿಗಳು", "తెలుగు": "కూరగాయలు", "தமிழ்": "காய்கறிகள்", "मराठी": "भाज्या" },
  "Fruits": { "English": "Fruits", "हिन्दी": "फल", "ಕನ್ನಡ": "ಹಣ್ಣುಗಳು", "తెలుగు": "పండ్లు", "தமிழ்": "பழங்கள்", "मराठी": "फळे" },
  "Cereals": { "English": "Cereals", "हिन्दी": "अनाज", "ಕನ್ನಡ": "ಧಾನ್ಯಗಳು", "తెలుగు": "ధాన్యాలు", "தமிழ்": "தானியங்கள்", "मराठी": "धान्य" },
  "Grains": { "English": "Grains", "हिन्दी": "अनाज", "ಕನ್ನಡ": "ಧಾನ್ಯಗಳು", "తెలుగు": "ధాన్యాలు", "தமிழ்": "தானியங்கள்", "मराठी": "धान्य" },
  "Pulses": { "English": "Pulses", "हिन्दी": "दालें व दलहन", "ಕನ್ನಡ": "ದ್ವಿದಳ ಧಾನ್ಯಗಳು", "తెలుగు": "పప్పుదినుసులు", "தமிழ்": "பருப்பு வகைகள்", "मराठी": "डाळी" },
  "Oil Seeds": { "English": "Oil Seeds", "हिन्दी": "तिलहन", "ಕನ್ನಡ": "ಎಣ್ಣೆಕಾಳುಗಳು", "తెలుగు": "నూనెగింజలు", "தமிழ்": "எண்ணெய் வித்துக்கள்", "मराठी": "तेलबिया" },
  "Spices": { "English": "Spices", "हिन्दी": "मसाले", "ಕನ್ನಡ": "ಮಸಾಲೆ ಪದಾರ್ಥಗಳು", "తెలుగు": "మసాలాలు", "தமிழ்": "மசாலா பொருட்கள்", "मराठी": "मसाले" },
  "Flowers": { "English": "Flowers", "हिन्दी": "फूल", "ಕನ್ನಡ": "ಹೂವುಗಳು", "తెలుగు": "పూలు", "தமிழ்": "மலர்கள்", "मराठी": "फुले" },
  "Live Stock,Poultry,Fisheries": { "English": "Livestock & Poultry", "हिन्दी": "पशुधन व मुर्गीपालन", "ಕನ್ನಡ": "ಜಾನುವಾರು & ಕೋಳಿ ಸಾಕಣೆ", "తెలుగు": "పశుసంపద & పౌల్ట్రీ", "தமிழ்": "கால்நடை & கோழி", "मराठी": "पशुधन व कुक्कुटपालन" },
  "Fibre Crops": { "English": "Fibre Crops", "हिन्दी": "रेशा फसलें (कपास)", "ಕನ್ನಡ": "ನಾರು ಬೆಳೆಗಳು", "తెలుగు": "పీచు పంటలు", "தமிழ்": "நார்ப் பயிர்கள்", "मराठी": "कापूस व धागे" },
  "Others": { "English": "Others", "हिन्दी": "अन्य", "ಕನ್ನಡ": "ಇತರ", "తెలుగు": "ఇతర", "தமிழ்": "மற்றவை", "मराठी": "इतर" }
};

// Units
export const UNIT_TRANSLATIONS = {
  "kg": { "English": "kg", "हिन्दी": "किग्रा", "ಕನ್ನಡ": "ಕೆಜಿ", "తెలుగు": "కిలో", "தமிழ்": "கிலோ", "मराठी": "किलो" },
  "quintal": { "English": "quintal", "हिन्दी": "क्विंटल", "ಕನ್ನಡ": "ಕ್ವಿಂಟಾಲ್", "తెలుగు": "క్వింటాల్", "தமிழ்": "குவிண்டால்", "मराठी": "क्विंटल" },
  "ton": { "English": "ton", "हिन्दी": "टन", "ಕನ್ನಡ": "ಟನ್", "తెలుగు": "టన్ను", "தமிழ்": "டன்", "मराठी": "टन" },
  "bag": { "English": "bag", "हिन्दी": "बोरी", "ಕನ್ನಡ": "ಚೀಲ", "తెలుగు": "బస్తా", "தமிழ்": "பை/மூட்டை", "मराठी": "गोणी" },
  "crate": { "English": "crate", "हिन्दी": "क्रेट", "ಕನ್ನಡ": "ಕ್ರೇಟ್", "తెలుగు": "క్రేట్", "தமிழ்": "பெட்டி", "मराठी": "क्रेट" },
  "piece": { "English": "piece", "हिन्दी": "नग", "ಕನ್ನಡ": "ನಗ", "తెలుగు": "ముక్క", "தமிழ்": "துண்டு", "मराठी": "नग" },
  "bundle": { "English": "bundle", "हिन्दी": "गड्डी", "ಕನ್ನಡ": "ಕಟ್ಟು", "తెలుగు": "కట్ట", "தமிழ்": "கட்டு", "मराठी": "जुडी" }
};

// Statuses
export const STATUS_TRANSLATIONS = {
  "Pending": { "English": "Pending", "हिन्दी": "लंबित", "ಕನ್ನಡ": "ಬಾಕಿ ಇದೆ", "తెలుగు": "పెండింగ్‌లో ఉంది", "தமிழ்": "நிலுவையில்", "मराठी": "प्रलंबित" },
  "Accepted": { "English": "Accepted", "हिन्दी": "स्वीकृत", "ಕನ್ನಡ": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ", "తెలుగు": "అంగీకరించబడింది", "தமிழ்": "ஏற்கப்பட்டது", "मराठी": "स्वीकारले" },
  "Preparing": { "English": "Preparing", "हिन्दी": "तैयार किया जा रहा है", "ಕನ್ನಡ": "ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ", "తెలుగు": "సిద్ధం చేయబడుతోంది", "தமிழ்": "தயாரிக்கப்படுகிறது", "मराठी": "तयार करत आहे" },
  "Ready": { "English": "Ready", "हिन्दी": "तैयार है", "ಕನ್ನಡ": "ಸಿದ್ಧವಾಗಿದೆ", "తెలుగు": "సిద్ధంగా ఉంది", "தமிழ்": "தயாராக உள்ளது", "मराठी": "तयार आहे" },
  "Dispatched": { "English": "Dispatched", "हिन्दी": "रवाना हो चुका है", "ಕನ್ನಡ": "ರವಾನಿಸಲಾಗಿದೆ", "తెలుగు": "పంపబడింది", "தமிழ்": "அனுப்பப்பட்டது", "मराठी": "पाठवले आहे" },
  "Completed": { "English": "Completed", "हिन्दी": "पूर्ण हो गया", "ಕನ್ನಡ": "ಪೂರ್ಣಗೊಂಡಿದೆ", "తెలుగు": "పూర్తయింది", "தமிழ்": "முடிந்தது", "मराठी": "पूर्ण झाले" },
  "Cancelled": { "English": "Cancelled", "हिन्दी": "रद्द किया गया", "ಕನ್ನಡ": "ರದ್ದುಗೊಂಡಿದೆ", "తెలుగు": "రద్దు చేయబడింది", "தமிழ்": "ரத்து செய்யப்பட்டது", "मराठी": "रद्द झाले" }
};

// States
export const STATE_TRANSLATIONS = {
  "All India": { "English": "All India", "हिन्दी": "अखिल भारतीय (सभी राज्य)", "ಕನ್ನಡ": "ಸಮಗ್ರ ಭಾರತ (ಎಲ್ಲಾ ರಾಜ್ಯಗಳು)", "తెలుగు": "భారతదేశం మొత్తం", "தமிழ்": "அகில இந்தியா", "मराठी": "अखिल भारत (सर्व राज्ये)" },
  "Karnataka": { "English": "Karnataka", "हिन्दी": "कर्नाटक", "ಕನ್ನಡ": "ಕರ್ನಾಟಕ", "తెలుగు": "కర్ణాటక", "தமிழ்": "கர்நாடகா", "मराठी": "कर्नाटक" },
  "Maharashtra": { "English": "Maharashtra", "हिन्दी": "महाराष्ट्र", "ಕನ್ನಡ": "ಮಹಾರಾಷ್ಟ್ರ", "తెలుగు": "మహారాష్ట్ర", "தமிழ்": "மகாராஷ்டிரா", "मराठी": "महाराष्ट्र" },
  "Tamil Nadu": { "English": "Tamil Nadu", "हिन्दी": "तमिलनाडु", "ಕನ್ನಡ": "ತಮಿಳುನಾಡು", "తెలుగు": "తమిళనాడు", "தமிழ்": "தமிழ்நாடு", "मराठी": "तमिळनाडू" },
  "Andhra Pradesh": { "English": "Andhra Pradesh", "हिन्दी": "आंध्र प्रदेश", "ಕನ್ನಡ": "ಆಂಧ್ರಪ್ರದೇಶ", "తెలుగు": "ఆంధ్రప్రదేశ్", "தமிழ்": "ஆந்திரப் பிரதேசம்", "मराठी": "आंध्र प्रदेश" },
  "Telangana": { "English": "Telangana", "हिन्दी": "तेलंगाना", "ಕನ್ನಡ": "ತೆಲಂಗಾಣ", "తెలుగు": "తెలంగాణ", "தமிழ்": "தெலங்கானா", "मराठी": "तेलंगणा" },
  "Madhya Pradesh": { "English": "Madhya Pradesh", "हिन्दी": "मध्य प्रदेश", "ಕನ್ನಡ": "ಮಧ್ಯಪ್ರದೇಶ", "తెలుగు": "మధ్యప్రదేశ్", "தமிழ்": "மத்தியப் பிரதேசம்", "मराठी": "मध्य प्रदेश" },
  "Uttar Pradesh": { "English": "Uttar Pradesh", "हिन्दी": "उत्तर प्रदेश", "ಕನ್ನಡ": "ಉತ್ತರ ಪ್ರದೇಶ", "తెలుగు": "ఉత్తరప్రదేశ్", "தமிழ்": "உத்தரப் பிரதேசம்", "मराठी": "उत्तर प्रदेश" },
  "Punjab": { "English": "Punjab", "हिन्दी": "पंजाब", "ಕನ್ನಡ": "ಪಂಜಾಬ್", "తెలుగు": "పంజాబ్", "தமிழ்": "பஞ்சாப்", "मराठी": "पंजाब" },
  "Haryana": { "English": "Haryana", "हिन्दी": "हरियाणा", "ಕನ್ನಡ": "ಹರಿಯಾಣ", "తెలుగు": "హర్యానా", "தமிழ்": "ஹரியானா", "मराठी": "हरियाणा" },
  "Gujarat": { "English": "Gujarat", "हिन्दी": "गुजरात", "ಕನ್ನಡ": "ಗುಜರಾತ್", "తెలుగు": "గుజరాత్", "தமிழ்": "குஜராத்", "मराठी": "गुजरात" },
  "Rajasthan": { "English": "Rajasthan", "हिन्दी": "राजस्थान", "ಕನ್ನಡ": "ರಾಜಸ್ಥಾನ", "తెలుగు": "రాజస్థాన్", "தமிழ்": "ராஜஸ்தான்", "मराठी": "राजस्थान" },
  "Kerala": { "English": "Kerala", "हिन्दी": "केरल", "ಕನ್ನಡ": "ಕೇರಳ", "తెలుగు": "కేరళ", "தமிழ்": "கேரளா", "मराठी": "केरळ" },
  "West Bengal": { "English": "West Bengal", "हिन्दी": "पश्चिम बंगाल", "ಕನ್ನಡ": "ಪಶ್ಚಿಮ ಬಂಗಾಳ", "తెలుగు": "పశ్చిమ బెంగాల్", "தமிழ்": "மேற்கு வங்காளம்", "मराठी": "पश्चिम बंगाल" },
  "Bihar": { "English": "Bihar", "हिन्दी": "बिहार", "ಕನ್ನಡ": "ಬಿಹಾರ", "తెలుగు": "బీహార్", "தமிழ்": "பீகார்", "मराठी": "बिहार" },
  "Delhi": { "English": "Delhi", "हिन्दी": "दिल्ली", "ಕನ್ನಡ": "ದೆಹಲಿ", "తెలుగు": "ఢిల్లీ", "தமிழ்": "டெல்லி", "मराठी": "दिल्ली" },
  "Odisha": { "English": "Odisha", "हिन्दी": "ओडिशा", "ಕನ್ನಡ": "ಒಡಿಶಾ", "తెలుగు": "ఒడిశా", "தமிழ்": "ஒடிசா", "मराठी": "ओडिशा" }
};

// Common phrases and complete UI strings
export const PHRASE_TRANSLATIONS = {
  // Option & Role authorization modal
  "Option 1: Enable Farmer Role on this Account": {
    "हिन्दी": "विकल्प 1: इस खाते पर किसान भूमिका सक्षम करें",
    "ಕನ್ನಡ": "ಆಯ್ಕೆ 1: ಈ ಖಾತೆಯಲ್ಲಿ ರೈತ ಪಾತ್ರವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ",
    "తెలుగు": "ఎంపిక 1: ఈ ఖాతాలో రైతు పాత్రను ప్రారంభించండి",
    "தமிழ்": "விருப்பம் 1: இந்த கணக்கில் விவசாயி பொறுப்பை இயக்கவும்",
    "मराठी": "पर्याय 1: या खात्यावर शेतकरी भूमिका सक्षम करा"
  },
  "Option 2: Switch to Farmer Account": {
    "हिन्दी": "विकल्प 2: किसान खाते में बदलें",
    "ಕನ್ನಡ": "ಆಯ್ಕೆ 2: ರೈತ ಖಾತೆಗೆ ಬದಲಾಯಿಸಿ",
    "తెలుగు": "ఎంపిక 2: రైతు ఖాతాకు మారండి",
    "தமிழ்": "விருப்பம் 2: விவசாயி கணக்கிற்கு மாறவும்",
    "मराठी": "पर्याय 2: शेतकरी खात्यावर स्विच करा"
  },
  "Authorize & Switch to Farmer": {
    "हिन्दी": "अधिकृत करें और किसान में बदलें",
    "ಕನ್ನಡ": "ಅಧಿಕೃತಗೊಳಿಸಿ ಮತ್ತು ರೈತರಿಗೆ ಬದಲಾಯಿಸಿ",
    "తెలుగు": "ప్రామాణీకరించి రైతుగా మారండి",
    "தமிழ்": "அங்கீகரித்து விவசாயியாக மாறவும்",
    "मराठी": "अधिकृत करा आणि शेतकऱ्यामध्ये बदला"
  },
  "Authorizing…": {
    "हिन्दी": "अधिकृत किया जा रहा है…",
    "ಕನ್ನಡ": "ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ…",
    "తెలుగు": "ప్రామాణీకరించబడుతోంది…",
    "தமிழ்": "அங்கீகரிக்கிறது…",
    "मराठी": "अधिकृत करत आहे…"
  },
  "Quick Login: Demo Farmer (Ramesh)": {
    "हिन्दी": "त्वरित लॉगिन: डेमो किसान (रमेश)",
    "ಕನ್ನಡ": "ತ್ವರಿತ ಲಾಗಿನ್: ಡೆಮೊ ರೈತ (ರಮೇಶ್)",
    "తెలుగు": "శీఘ్ర లాగిన్: డెమో రైతు (రమేష్)",
    "தமிழ்": "விரைவு உள்நுழைவு: மாதிரி விவசாயಿ (ரமேஷ்)",
    "मराठी": "जलद लॉगिन: डेमो शेतकरी (रमेश)"
  },
  "Cancel and remain as Customer": {
    "हिन्दी": "रद्द करें और ग्राहक बने रहें",
    "ಕನ್ನಡ": "ರದ್ದುಮಾಡಿ ಮತ್ತು ಗ್ರಾಹಕರಾಗಿಯೇ ಮುಂದುವರಿಯಿರಿ",
    "తెలుగు": "రద్దు చేసి వినియోగదారుడిగా కొనసాగండి",
    "தமிழ்": "ரத்து செய்து வாடிக்கையாளராகத் தொடரவும்",
    "मराठी": "रद्द करा आणि ग्राहक म्हणून सुरू ठेवा"
  },
  "Farmer Authorization Required": {
    "हिन्दी": "किसान प्रमाणीकरण आवश्यक है",
    "ಕನ್ನಡ": "ರೈತ ದೃಢೀಕರಣದ ಅಗತ್ಯವಿದೆ",
    "తెలుగు": "రైతు ప్రామాణీకరణ అవసరం",
    "தமிழ்": "விவசாயி அங்கீகாரம் தேவை",
    "मराठी": "शेतकरी प्रमाणीकरण आवश्यक आहे"
  },

  // Home workspace heroes & cards
  "Ready to list a crop?": {
    "हिन्दी": "क्या आप फसल बेचने के लिए तैयार हैं?",
    "ಕನ್ನಡ": "ಬೆಳೆ ಪಟ್ಟಿ ಮಾಡಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    "తెలుగు": "పంటను విక్రయించడానికి సిద్ధంగా ఉన్నారా?",
    "தமிழ்": "பயிர் விபரத்தை வெளியிட தயாரா?",
    "मराठी": "पीक विक्रीसाठी नोंदवायचे आहे का?"
  },
  "Find the right market price.": {
    "हिन्दी": "मंडी का सही भाव जानें।",
    "ಕನ್ನಡ": "ಸರಿಯಾದ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ತಿಳಿಯಿರಿ.",
    "తెలుగు": "సరైన మార్కెట్ ధరను తెలుసుకోండి.",
    "தமிழ்": "சரியான சந்தை விலையை அறியவும்.",
    "मराठी": "योग्य बाजार भाव जाणून घ्या."
  },
  "Add crops for sale": {
    "हिन्दी": "बिक्री के लिए फसल जोड़ें",
    "ಕನ್ನಡ": "ಮಾರಾಟಕ್ಕಾಗಿ ಬೆಳೆ ಸೇರಿಸಿ",
    "తెలుగు": "అమ్మకానికి పంటను జోడించండి",
    "தமிழ்": "விற்பனைக்கு பயிர் சேர்க்கவும்",
    "मराठी": "विक्रीसाठी पीक जोडा"
  },
  "Browse farmer produce": {
    "हिन्दी": "किसानों की ताज़ा फसलें देखें",
    "ಕನ್ನಡ": "ರೈತರ ತಾಜಾ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "తెలుగు": "రైతుల తాజా పంటలను చూడండి",
    "தமிழ்": "விவசாயிகளின் விளைபொருட்களை காண்க",
    "मराठी": "शेतकऱ्यांची ताजी पिके पहा"
  },
  "My crop listings": {
    "हिन्दी": "मेरी सूचीबद्ध फसलें",
    "ಕನ್ನಡ": "ನನ್ನ ಬೆಳೆಗಳ ಪಟ್ಟಿ",
    "తెలుగు": "నా పంటల జాబితా",
    "தமிழ்": "என் பயிர் பட்டியல்",
    "मराठी": "माझी नोंदवलेली पिके"
  },
  "Manage & delete listings": {
    "हिन्दी": "लिस्टिंग प्रबंधित करें व हटाएं",
    "ಕನ್ನಡ": "ಪಟ್ಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಅಳಿಸಿ",
    "తెలుగు": "జాబితాలను నిర్వహించండి & తొలగించండి",
    "தமிழ்": "பட்டியலை நிர்வகிக்கவும் & நீக்கவும்",
    "मराठी": "यादी व्यवस्थापित करा व हटवा"
  },
  "Manage & delete listings →": {
    "हिन्दी": "लिस्टिंग प्रबंधित करें व हटाएं →",
    "ಕನ್ನಡ": "ಪಟ್ಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಅಳಿಸಿ →",
    "తెలుగు": "జాబితాలను నిర్వహించండి & తొలగించండి →",
    "தமிழ்": "பட்டியலை நிர்வகிக்கவும் & நீக்கவும் →",
    "मराठी": "यादी व्यवस्थापित करा व हटवा →"
  },
  "Search state, district & mandi →": {
    "हिन्दी": "राज्य, जिला व मंडी खोजें →",
    "ಕನ್ನಡ": "ರಾಜ್ಯ, ಜಿಲ್ಲೆ ಮತ್ತು ಮಂಡಿ ಹುಡುಕಿ →",
    "తెలుగు": "రాష్ట్రం, జిల్లా మరియు మండి వెతకండి →",
    "தமிழ்": "மாநிலம், மாவட்டம் & சந்தை தேடு →",
    "मराठी": "राज्य, जिल्हा व बाजार शोधा →"
  },
  "See reported min, modal, and max wholesale prices for all vegetables and crops.": {
    "हिन्दी": "सभी सब्जियों और फसलों के न्यूनतम, मॉडल और अधिकतम थोक भाव देखें।",
    "ಕನ್ನಡ": "ಎಲ್ಲಾ ತರಕಾರಿಗಳು ಮತ್ತು ಬೆಳೆಗಳ ಕನಿಷ್ಠ, ಮಾದರಿ ಮತ್ತು ಗರಿಷ್ಠ ಸಗಟು ಬೆಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
    "తెలుగు": "అన్ని కూరగాయలు మరియు పంటల కనిష్ట, మోడల్ మరియు గరిష్ట టోకు ధరలను చూడండి.",
    "தமிழ்": "அனைத்து காய்கறிகள் மற்றும் பயிர்களுக்கான குறைந்தபட்ச, மாதிரி மற்றும் அதிகபட்ச மொத்த விலைகளை காண்க.",
    "मराठी": "सर्व भाज्या व पिकांचे किमान, सरासरी आणि कमाल घाऊक भाव पहा."
  },
  "You have not added crops yet. Use Add crops for sale to create your first listing.": {
    "हिन्दी": "आपने अभी तक कोई फसल नहीं जोड़ी है। अपनी पहली फसल सूचीबद्ध करने के लिए 'बिक्री के लिए फसल जोड़ें' पर क्लिक करें।",
    "ಕನ್ನಡ": "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆಗಳನ್ನು ಸೇರಿಸಿಲ್ಲ. ನಿಮ್ಮ ಮೊದಲ ಬೆಳೆ ಸೇರಿಸಲು 'ಮಾರಾಟಕ್ಕಾಗಿ ಬೆಳೆ ಸೇರಿಸಿ' ಬಳಸಿ.",
    "తెలుగు": "మీరు ఇంకా ఎలాంటి పంటలను చేర్చలేదు. మీ మొదటి పంటను చేర్చడానికి 'అమ్మకానికి పంటను జోడించండి' ఉపయోగించండి.",
    "தமிழ்": "நீங்கள் இன்னும் பயிர்களைச் சேர்க்கவில்லை. உங்கள் முதல் பயிரைச் சேர்க்க 'விற்பனைக்கு பயிர் சேர்க்கவும்' பயன்படுத்தவும்.",
    "मराठी": "तुम्ही अद्याप कोणतेही पीक जोडलेले नाही. पहिले पीक नोंदवण्यासाठी 'विक्रीसाठी पीक जोडा' वापरा."
  },

  // Marketplace & Browse filters
  "FARMER MARKETPLACE": { "हिन्दी": "किसान बाज़ार", "ಕನ್ನಡ": "ರೈತ ಮಾರುಕಟ್ಟೆ", "తెలుగు": "రైతు మార్కెట్", "தமிழ்": "விவசாயி சந்தை", "मराठी": "शेतकरी बाजार" },
  "Browse fresh produce.": { "हिन्दी": "ताज़ा फसलें देखें।", "ಕನ್ನಡ": "ತಾಜಾ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.", "తెలుగు": "తాజా పంటలను చూడండి.", "தமிழ்": "புதிய விளைபொருட்களை காண்க.", "मराठी": "ताजी पिके पहा." },
  "See crops currently listed by farmers on Farmezy.": { "हिन्दी": "फ़ार्मेज़ी पर किसानों द्वारा सूचीबद्ध फसलें देखें।", "ಕನ್ನಡ": "ಫಾರ್ಮೆಜಿಯಲ್ಲಿ ರೈತರು ಪಟ್ಟಿ ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.", "తెలుగు": "ఫార్మెజీలో రైతులు నమోదు చేసిన పంటలను చూడండి.", "தமிழ்": "பார்மெசியில் விவசாயிகள் பட்டியலிட்டுள்ள பயிர்களைக் காண்க.", "मराठी": "फार्मइझीवर शेतकऱ्यांनी नोंदवलेली पिके पहा." },
  "📍 Delivery & route": { "हिन्दी": "📍 डिलीवरी व रास्ता", "ಕನ್ನಡ": "📍 ವಿತರಣೆ ಮತ್ತು ಮಾರ್ಗ", "తెలుగు": "📍 డెలివరీ & మార్గం", "தமிழ்": "📍 டெலிவரி & வழித்தடம்", "मराठी": "📍 वितरण व मार्ग" },
  "Delivery & route": { "हिन्दी": "डिलीवरी व रास्ता", "ಕನ್ನಡ": "ವಿತರಣೆ ಮತ್ತು ಮಾರ್ಗ", "తెలుగు": "డెలివరీ & మార్గం", "தமிழ்": "டெலிவரி & வழித்தடம்", "मराठी": "वितरण व मार्ग" },
  "Allow location to see how far each farmer is from you and open the best driving route.": {
    "हिन्दी": "किसान आपसे कितनी दूर हैं और सबसे अच्छा रास्ता देखने के लिए लोकेशन की अनुमति दें।",
    "ಕನ್ನಡ": "ಪ್ರತಿಯೊಬ್ಬ ರೈತರು ನಿಮ್ಮಿಂದ ಎಷ್ಟು ದೂರದಲ್ಲಿದ್ದಾರೆಂದು ತಿಳಿಯಲು ಮತ್ತು ದಾರಿ ನಕ್ಷೆ ತೆರೆಯಲು ಲೊಕೇಶನ್ ಅನುಮತಿಸಿ.",
    "తెలుగు": "రైతు మీ నుండి ఎంత దూరంలో ఉన్నారో మరియు ఉత్తమ మార్గాన్ని చూడటానికి లొకేషన్‌ను అనుమతించండి.",
    "தமிழ்": "ஒவ்வொரு விவசாயியும் உங்களிடமிருந்து எவ்வளவு தூரத்தில் உள்ளனர் என்பதை அறிய இருப்பிடத்தை அனுமதிக்கவும்.",
    "मराठी": "शेतकरी तुमच्यापासून किती अंतरावर आहेत व सर्वोत्तम रस्ता पाहण्यासाठी लोकेशन परवानगी द्या."
  },
  "Use my location": { "हिन्दी": "मेरी लोकेशन का उपयोग करें", "ಕನ್ನಡ": "ನನ್ನ ಸ್ಥಳ ಬಳಸಿ", "తెలుగు": "నా లొకేషన్‌ను ఉపయోగించండి", "தமிழ்": "என் இருப்பிடத்தைப் பயன்படுத்து", "मराठी": "माझे लोकेशन वापरा" },
  "Location enabled ✓": { "हिन्दी": "लोकेशन सक्षम है ✓", "ಕನ್ನಡ": "ಸ್ಥಳ ಸಕ್ರಿಯವಾಗಿದೆ ✓", "తెలుగు": "లొకేషన్ ప్రారంభించబడింది ✓", "தமிழ்": "இருப்பிடம் இயக்கப்பட்டது ✓", "मराठी": "लोकेशन सुरू आहे ✓" },
  "Your location is ready. Distances are calculated from your current position.": {
    "हिन्दी": "आपकी लोकेशन तैयार है। दूरी की गणना आपके वर्तमान स्थान से की जाती है।",
    "ಕನ್ನಡ": "ನಿಮ್ಮ ಸ್ಥಳ ಸಿದ್ಧವಾಗಿದೆ. ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳದಿಂದ ದೂರವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.",
    "తెలుగు": "మీ లొకేషన్ సిద్ధంగా ఉంది. మీ ప్రస్తుత స్థానం నుండి దూరం లెక్కించబడుతుంది.",
    "தமிழ்": "உங்கள் இருப்பிடம் தயார். தற்போதைய நிலையில் இருந்து தூரம் கணக்கிடப்படுகிறது.",
    "मराठी": "तुमचे लोकेशन तयार आहे. तुमच्या सध्याच्या ठिकाणावरून अंतर मोजले जाते."
  },
  "⚡ Filter Marketplace Produce": { "हिन्दी": "⚡ बाज़ार की उपज फ़िल्टर करें", "ಕನ್ನಡ": "⚡ ಮಾರುಕಟ್ಟೆ ಬೆಳೆಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ", "తెలుగు": "⚡ మార్కెట్ ఉత్పత్తులను ఫిల్టర్ చేయండి", "தமிழ்": "⚡ விளைபொருட்களை வடிகட்டவும்", "मराठी": "⚡ बाजार शेतमाल फिल्टर करा" },
  "Filter Marketplace Produce": { "हिन्दी": "बाज़ार की उपज फ़िल्टर करें", "ಕನ್ನಡ": "ಮಾರುಕಟ್ಟೆ ಬೆಳೆಗಳನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ", "తెలుగు": "మార్కెట్ ఉత్పత్తులను ఫిల్టర్ చేయండి", "தமிழ்": "விளைபொருட்களை வடிகட்டவும்", "मराठी": "बाजार शेतमाल फिल्टर करा" },
  "✕ Clear Filters": { "हिन्दी": "✕ फ़िल्टर साफ़ करें", "ಕನ್ನಡ": "✕ ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ", "తెలుగు": "✕ ఫిల్టర్లను తొలగించు", "தமிழ்": "✕ வடிகட்டிகளை அழி", "मराठी": "✕ फिल्टर्स साफ करा" },
  "Clear Filters": { "हिन्दी": "फ़िल्टर साफ़ करें", "ಕನ್ನಡ": "ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ", "తెలుగు": "ఫిల్టర్లను తొలగించు", "தமிழ்": "வடிகட்டிகளை அழி", "मराठी": "फिल्टर्स साफ करा" },
  "Search Produce": { "हिन्दी": "फसल / उपज खोजें", "ಕನ್ನಡ": "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ", "తెలుగు": "ఉత్పత్తులను వెతకండి", "தமிழ்": "விளைபொருட்களை தேடுங்கள்", "मराठी": "शेतमाल शोधा" },
  "Search by crop, variety, farmer, district, state...": {
    "हिन्दी": "फसल, किस्म, किसान, जिला या राज्य से खोजें...",
    "ಕನ್ನಡ": "ಬೆಳೆ, ತಳಿ, ರೈತ, ಜಿಲ್ಲೆ ಅಥವಾ ರಾಜ್ಯದಿಂದ ಹುಡುಕಿ...",
    "తెలుగు": "పంట, రకం, రైతు, జిల్లా లేదా రాష్ట్రం వారీగా వెతకండి...",
    "தமிழ்": "பயிர், ரகம், விவசாயி, மாவட்டம் அல்லது மாநிலம் மூலம் தேடுங்கள்...",
    "मराठी": "पीक, जात, शेतकरी, जिल्हा किंवा राज्यानुसार शोधा..."
  },
  "🌾 1. Crop & Produce Identity": { "हिन्दी": "🌾 1. फसल व उपज की पहचान", "ಕನ್ನಡ": "🌾 1. ಬೆಳೆ ಮತ್ತು ಉತ್ಪನ್ನದ ವಿವರ", "తెలుగు": "🌾 1. పంట & ఉత్పత్తి గుర్తింపు", "தமிழ்": "🌾 1. பயிர் & விளைபொருள் விபரம்", "मराठी": "🌾 १. पीक व मालाची ओळख" },
  "1. Category": { "हिन्दी": "1. श्रेणी", "ಕನ್ನಡ": "1. ವರ್ಗ", "తెలుగు": "1. వర్గం", "தமிழ்": "1. வகை", "मराठी": "१. वर्ग" },
  "2. Commodity / Crop": { "हिन्दी": "2. जिंस / फसल", "ಕನ್ನಡ": "2. ಬೆಳೆ (ಸರಕು)", "తెలుగు": "2. పంట / సరుకు", "தமிழ்": "2. பண்டம் / பயிர்", "मराठी": "२. शेतमाल / पीक" },
  "3. Variety": { "हिन्दी": "3. किस्म", "ಕನ್ನಡ": "3. ತಳಿ", "తెలుగు": "3. రకం", "தமிழ்": "3. ரகம்", "मराठी": "३. जात" },
  "📍 2. Location & Distance": { "हिन्दी": "📍 2. स्थान व दूरी", "ಕನ್ನಡ": "📍 2. ಸ್ಥಳ ಮತ್ತು ದೂರ", "తెలుగు": "📍 2. స్థానం & దూరం", "தமிழ்": "📍 2. இடம் & தூரம்", "मराठी": "📍 २. ठिकाण व अंतर" },
  "4. State": { "हिन्दी": "4. राज्य", "ಕನ್ನಡ": "4. ರಾಜ್ಯ", "తెలుగు": "4. రాష్ట్రం", "தமிழ்": "4. மாநிலம்", "मराठी": "४. राज्य" },
  "5. District": { "हिन्दी": "5. जिला", "ಕನ್ನಡ": "5. ಜಿಲ್ಲೆ", "తెలుగు": "5. జిల్లా", "தமிழ்": "5. மாவட்டம்", "मराठी": "५. जिल्हा" },
  "6. Max Distance (km)": { "हिन्दी": "6. अधिकतम दूरी (किमी)", "ಕನ್ನಡ": "6. ಗರಿಷ್ಠ ದೂರ (ಕಿ.ಮೀ)", "తెలుగు": "6. గరిష్ట దూరం (కి.మీ)", "தமிழ்": "6. அதிகபட்ச தூரம் (கி.மீ)", "मराठी": "६. कमाल अंतर (किमी)" },
  "💰 3. Price & Sorting": { "हिन्दी": "💰 3. मूल्य व क्रमबद्धता", "ಕನ್ನಡ": "💰 3. ಬೆಲೆ ಮತ್ತು ವಿಂಗಡಣೆ", "తెలుగు": "💰 3. ధర & క్రమబద్ధీకరణ", "தமிழ்": "💰 3. விலை & வரிசை", "मराठी": "💰 ३. किंमत व क्रमवारी" },
  "7. Sort By": { "हिन्दी": "7. क्रमबद्ध करें", "ಕನ್ನಡ": "7. ವಿಂಗಡಿಸಿ", "తెలుగు": "7. క్రమబద్ధీకరించు", "தமிழ்": "7. வரிசைப்படுத்து", "मराठी": "७. क्रमवारी" },
  "Distance: Nearest first": { "हिन्दी": "दूरी: नजदीकी पहले", "ಕನ್ನಡ": "ದೂರ: ಹತ್ತಿರದ ಮೊದಲಿಗೆ", "తెలుగు": "దూరం: సమీపంలో ఉన్నవి ముందు", "தமிழ்": "தூரம்: அருகில் உள்ளவை முதலில்", "मराठी": "अंतर: जवळचे आधी" },
  "Price: Low to High": { "हिन्दी": "कीमत: कम से ज्यादा", "ಕನ್ನಡ": "ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು", "తెలుగు": "ధర: తక్కువ నుండి ఎక్కువ", "தமிழ்": "விலை: குறைவில் இருந்து அதிகம்", "मराठी": "किंमत: कमी ते जास्त" },
  "Price: High to Low": { "हिन्दी": "कीमत: ज्यादा से कम", "ಕನ್ನಡ": "ಬೆಲೆ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ", "తెలుగు": "ధర: ఎక్కువ నుండి తక్కువ", "தமிழ்": "விலை: அதிகத்தில் இருந்து குறைவு", "मराठी": "किंमत: जास्त ते कमी" },
  "All Commodities": { "हिन्दी": "सभी फसलें / जिंस", "ಕನ್ನಡ": "ಎಲ್ಲಾ ಬೆಳೆಗಳು", "తెలుగు": "అన్ని పంటలు", "தமிழ்": "அனைத்து பயிர்கள்", "मराठी": "सर्व शेतमाल" },
  "All Varieties": { "हिन्दी": "सभी किस्में", "ಕನ್ನಡ": "ಎಲ್ಲಾ ತಳಿಗಳು", "తెలుగు": "అన్ని రకాలు", "தமிழ்": "அனைத்து ரகங்கள்", "मराठी": "सर्व जाती" },
  "All States": { "हिन्दी": "सभी राज्य", "ಕನ್ನಡ": "ಎಲ್ಲಾ ರಾಜ್ಯಗಳು", "తెలుగు": "అన్ని రాష్ట్రాలు", "தமிழ்": "அனைத்து மாநிலங்கள்", "मराठी": "सर्व राज्ये" },
  "All Districts": { "हिन्दी": "सभी जिले", "ಕನ್ನಡ": "ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು", "తెలుగు": "అన్ని జిల్లాలు", "தமிழ்": "அனைத்து மாவட்டங்கள்", "मराठी": "सर्व जिल्हे" },

  // Farmer Selling Form
  "FARMER SELLING SPACE": { "हिन्दी": "किसान बिक्री कक्ष", "ಕನ್ನಡ": "ರೈತ ಮಾರಾಟ ಕೇಂದ್ರ", "తెలుగు": "రైతు అమ్మకాల విభాగం", "தமிழ்": "விவசாயி விற்பனை பகுதி", "मराठी": "शेतकरी विक्री विभाग" },
  "Manage your crop listings.": { "हिन्दी": "अपनी फसल लिस्टिंग प्रबंधित करें।", "ಕನ್ನಡ": "ನಿಮ್ಮ ಬೆಳೆ ಪಟ್ಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ.", "తెలుగు": "మీ పంట జాబితాలను నిర్వహించండి.", "தமிழ்": "உங்கள் பயிர் பட்டியலை நிர்வகிக்கவும்.", "मराठी": "तुमची पीक यादी व्यवस्थापित करा." },
  "Add each crop separately with its own photo, quantity, price, harvest date, and pickup location.": {
    "हिन्दी": "प्रत्येक फसल को उसकी फोटो, मात्रा, मूल्य, कटाई तिथि और स्थान के साथ अलग से जोड़ें।",
    "ಕನ್ನಡ": "ಪ್ರತಿಯೊಂದು ಬೆಳೆಯನ್ನು ಫೋಟೋ, ಪ್ರಮಾಣ, ಬೆಲೆ ಮತ್ತು ಕೊಯ್ಲು ದಿನಾಂಕದೊಂದಿಗೆ ಪ್ರತ್ಯೇಕವಾಗಿ ಸೇರಿಸಿ.",
    "తెలుగు": "ప్రతి పంటను దాని స్వంత ఫోటో, పరిమాణం, ధర, కోత తేదీ మరియు లొకేషన్‌తో వేరుగా జోడించండి.",
    "தமிழ்": "ஒவ்வொரு பயிரையும் புகைப்படம், அளவு, விலை மற்றும் அறுவடை தேதியுடன் தனித்தனியாக சேர்க்கவும்.",
    "मराठी": "प्रत्येक पीक त्याच्या फोटो, प्रमाण, किंमत आणि काढणी तारखेसह स्वतंत्रपणे जोडा."
  },
  "Add New Crop Listing": { "हिन्दी": "नई फसल की लिस्टिंग जोड़ें", "ಕನ್ನಡ": "ಹೊಸ ಬೆಳೆ ಪಟ್ಟಿ ಸೇರಿಸಿ", "తెలుగు": "కొత్త పంట జాబితాను జోడించండి", "தமிழ்": "புதிய பயிர் பட்டியல் சேர்க்கவும்", "मराठी": "नवीन पीक नोंदणी जोडा" },
  "Category *": { "हिन्दी": "श्रेणी *", "ಕನ್ನಡ": "ವರ್ಗ *", "తెలుగు": "వర్గం *", "தமிழ்": "வகை *", "मराठी": "वर्ग *" },
  "Commodity / Crop *": { "हिन्दी": "जिंस / फसल *", "ಕನ್ನಡ": "ಬೆಳೆ (ಸರಕು) *", "తెలుగు": "పంట / సరుకు *", "தமிழ்": "பண்டம் / பயிர் *", "मराठी": "शेतमाल / पीक *" },
  "Variety": { "हिन्दी": "किस्म", "ಕನ್ನಡ": "ತಳಿ", "తెలుగు": "రకం", "தமிழ்": "ரகம்", "मराठी": "जात" },
  "Quantity Available *": { "हिन्दी": "उपलब्ध मात्रा *", "ಕನ್ನಡ": "ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ *", "తెలుగు": "అందుబాటులో ఉన్న పరిమాణం *", "தமிழ்": "கிடைக்கும் அளவு *", "मराठी": "उपलब्ध प्रमाण *" },
  "Unit *": { "हिन्दी": "इकाई *", "ಕನ್ನಡ": "ಘಟಕ *", "తెలుగు": "యూనిట్ *", "தமிழ்": "அலகு *", "मराठी": "एकक *" },
  "Asking Price (₹) *": { "हिन्दी": "मांग मूल्य (₹) *", "ಕನ್ನಡ": "ಕೇಳುವ ಬೆಲೆ (₹) *", "తెలుగు": "ధర (₹) *", "தமிழ்": "விற்பனை விலை (₹) *", "मराठी": "मागणी किंमत (₹) *" },
  "Harvest Date": { "हिन्दी": "कटाई की तारीख", "ಕನ್ನಡ": "ಕೊಯ್ಲು ದಿನಾಂಕ", "తెలుగు": "కోత తేదీ", "தமிழ்": "அறுவடை தேதி", "मराठी": "काढणीची तारीख" },
  "Pickup Location / Address *": { "हिन्दी": "उठाव स्थान / पता *", "ಕನ್ನಡ": "ಸಂಗ್ರಹ ಸ್ಥಳ / ವಿಳಾಸ *", "తెలుగు": "తీసుకునే ప్రదేశం / చిరునామా *", "தமிழ்": "எடுத்துக்கொள்ளும் இடம் / முகவரி *", "मराठी": "माल मिळण्याचे ठिकाण / पत्ता *" },
  "State *": { "हिन्दी": "राज्य *", "ಕನ್ನಡ": "ರಾಜ್ಯ *", "తెలుగు": "రాష్ట్రం *", "தமிழ்": "மாநிலம் *", "मराठी": "राज्य *" },
  "District *": { "हिन्दी": "जिला *", "ಕನ್ನಡ": "ಜಿಲ್ಲೆ *", "తెలుగు": "జిల్లా *", "தமிழ்": "மாவட்டம் *", "मराठी": "जिल्हा *" },
  "Contact Phone *": { "हिन्दी": "संपर्क फ़ोन नंबर *", "ಕನ್ನಡ": "ಸಂಪರ್ಕ ದೂರವಾಣಿ ಸಂಖ್ಯೆ *", "తెలుగు": "సంప్రదించవలసిన ఫోన్ *", "தமிழ்": "தொடர்பு தொலைபேசி *", "मराठी": "संपर्क फोन नंबर *" },
  "Take photo with camera": { "हिन्दी": "कैमरा से फोटो लें", "ಕನ್ನಡ": "ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ", "తెలుగు": "కెమెరాతో ఫోటో తీయండి", "தமிழ்": "கேமராவில் படம் எடுக்கவும்", "मराठी": "कॅमेराने फोटो काढा" },
  "Upload image": { "हिन्दी": "फोटो अपलोड करें", "ಕನ್ನಡ": "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", "తెలుగు": "ఫోటో అప్‌లోడ్ చేయండి", "தமிழ்": "படம் பதிவேற்று", "मराठी": "फोटो अपलोड करा" },
  "Save & Publish Listing": { "हिन्दी": "सहेजें और प्रकाशित करें", "ಕನ್ನಡ": "ಉಳಿಸಿ ಮತ್ತು ಪ್ರಕಟಿಸಿ", "తెలుగు": "సేవ్ చేసి ప్రచురించండి", "தமிழ்": "சேமித்து வெளியிடவும்", "मराठी": "जतन करा आणि प्रसिद्ध करा" },

  // Orders and Invoices
  "CUSTOMER PURCHASE REQUESTS": { "हिन्दी": "ग्राहकों के ऑर्डर अनुरोध", "ಕನ್ನಡ": "ಗ್ರಾಹಕರ ಖರೀದಿ ವಿನಂತಿಗಳು", "తెలుగు": "వినియోగదారుల కొనుగోలు అభ్యర్థనలు", "தமிழ்": "வாடிக்கையாளர் கொள்முதல் கோரிக்கைகள்", "मराठी": "ग्राहकांच्या खरेदी मागण्या" },
  "Manage orders received from customers.": { "हिन्दी": "ग्राहकों से प्राप्त ऑर्डरों का प्रबंधन करें।", "ಕನ್ನಡ": "ಗ್ರಾಹಕರಿಂದ ಬಂದ ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ.", "తెలుగు": "కస్టమర్ల నుండి వచ్చిన ఆర్డర్లను నిర్వహించండి.", "தமிழ்": "வாடிக்கையாளர்களிடமிருந்து வந்த ஆர்டர்களை நிர்வகிக்கவும்.", "मराठी": "ग्राहकांकडून आलेल्या ऑर्डर्सचे व्यवस्थापन करा." },
  "MY ORDERS & REQUESTS": { "हिन्दी": "मेरे ऑर्डर और अनुरोध", "ಕನ್ನಡ": "ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ವಿನಂತಿಗಳು", "తెలుగు": "నా ఆర్డర్లు మరియు అభ్యర్థనలు", "தமிழ்": "என் ஆர்டர்கள் & கோரிக்கைகள்", "मराठी": "माझ्या ऑर्डर्स आणि मागण्या" },
  "Track your placed orders and download official invoices.": {
    "हिन्दी": "अपने दिए गए ऑर्डर ट्रैक करें और आधिकारिक चालान डाउनलोड करें।",
    "ಕನ್ನಡ": "ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಅಧಿಕೃತ ಇನ್‌ವಾಯ್ಸ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    "తెలుగు": "మీ ఆర్డర్‌లను ట్రాక్ చేయండి మరియు అధికారిక ఇన్వాయిస్‌లను డౌన్‌లోడ్ చేయండి.",
    "தமிழ்": "உங்கள் ஆர்டர்களைக் கண்காணித்து விலைப்பட்டியலை பதிவிறக்கவும்.",
    "मराठी": "तुमच्या ऑर्डर्स ट्रॅक करा आणि अधिकृत बीजक डाउनलोड करा."
  },
  "View full notification history →": { "हिन्दी": "पूरा सूचना इतिहास देखें →", "ಕನ್ನಡ": "ಸಂಪೂರ್ಣ ಅಧಿಸೂಚನೆ ಇತಿಹಾಸ ವೀಕ್ಷಿಸಿ →", "తెలుగు": "పూర్తి నోటిఫికేషన్ల చరిత్రను చూడండి →", "தமிழ்": "முழு அறிவிப்பு வரலாறு காண்க →", "मराठी": "पूर्ण सूचना इतिहास पहा →" },
  "View in My Requests →": { "हिन्दी": "मेरे अनुरोध में देखें →", "ಕನ್ನಡ": "ನನ್ನ ವಿನಂತಿಗಳಲ್ಲಿ ವೀಕ್ಷಿಸಿ →", "తెలుగు": "నా అభ్యర్థనలలో చూడండి →", "தமிழ்": "என் கோரிக்கைகளில் காண்க →", "मराठी": "माझ्या मागण्यांमध्ये पहा →" },

  // Table & Mandi Headers
  "Market / APMC": { "हिन्दी": "मंडी / एपीएमसी", "ಕನ್ನಡ": "ಮಂಡಿ / ಎಪಿಎಂಸಿ", "తెలుగు": "మండి / మార్కెట్", "தமிழ்": "சந்தை / மண்டி", "मराठी": "मंडी / बाजार समिती" },
  "Price Type / Source": { "हिन्दी": "भाव प्रकार / स्रोत", "ಕನ್ನಡ": "ಬೆಲೆ ಪ್ರಕಾರ / ಮೂಲ", "తెలుగు": "ధర రకం / మూలం", "தமிழ்": "விலை வகை / ஆதாரம்", "मराठी": "भाव प्रकार / स्रोत" },
  "Modal Price / Unit": { "हिन्दी": "मॉडल भाव / इकाई", "ಕನ್ನಡ": "ಮಾದರಿ ಬೆಲೆ / ಘಟಕ", "తెలుగు": "మోడల్ ధర / యూనిట్", "தமிழ்": "மாதிரி விலை / அலகு", "मराठी": "सरासरी भाव / एकक" },
  "Market & Farmer Details": { "हिन्दी": "मंडी व किसान विवरण", "ಕನ್ನಡ": "ಮಾರುಕಟ್ಟೆ ಮತ್ತು ರೈತರ ವಿವರಗಳು", "తెలుగు": "మార్కెట్ & రైతు వివరాలు", "தமிழ்": "சந்தை & விவசாயி விபரம்", "मराठी": "बाजार व शेतकरी तपशील" },
  "Date unavailable": { "हिन्दी": "दिनांक अनुपलब्ध", "ಕನ್ನಡ": "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ", "తెలుగు": "తేదీ అందుబాటులో లేదు", "தமிழ்": "தேதி கிடைக்கவில்லை", "मराठी": "दिनांक उपलब्ध नाही" },
  "Official Wholesale Mandi Prices": { "हिन्दी": "सरकारी थोक मंडी भाव", "ಕನ್ನಡ": "ಸರ್ಕಾರಿ ಸಗಟು ಮಂಡಿ ಬೆಲೆಗಳು", "తెలుగు": "అధికారిక టోకు మండి ధరలు", "தமிழ்": "அரசு மொத்த சந்தை விலைகள்", "मराठी": "अधिकृत घाऊक बाजार भाव" },
  "Live Agmarknet mandi data across India": { "हिन्दी": "पूरे भारत का लाइव एगमार्कनेट मंडी डेटा", "ಕನ್ನಡ": "ಭಾರತದಾದ್ಯಂತ ಲೈವ್ ಆಗ್ಮಾರ್ಕ್‌ನೆಟ್ ಮಂಡಿ ಡೇಟಾ", "తెలుగు": "భారతదేశం అంతటా లైవ్ అగ్‌మార్క్‌నెట్ మండి డేటా", "தமிழ்": "இந்தியா முழுவதும் நேரலை அக்மார்க்நெட் சந்தை தரவு", "मराठी": "संपूर्ण भारतातील थेट अग्मार्कनेट बाजार माहिती" },
  "Search commodity or market...": { "हिन्दी": "फसल या मंडी खोजें...", "ಕನ್ನಡ": "ಬೆಳೆ ಅಥವಾ ಮಂಡಿ ಹುಡುಕಿ...", "తెలుగు": "పంట లేదా మండిని వెతకండి...", "தமிழ்": "பயிர் அல்லது சந்தையை தேடுங்கள்...", "मराठी": "पीक किंवा बाजार शोधा..." }
};

// General Vocabulary for fallback word-by-word replacement
export const VOCABULARY = {
  "Market": { "हिन्दी": "मंडी", "ಕನ್ನಡ": "ಮಾರುಕಟ್ಟೆ", "తెలుగు": "మార్కెట్", "தமிழ்": "சந்தை", "मराठी": "बाजार" },
  "Prices": { "हिन्दी": "भाव", "ಕನ್ನಡ": "ಬೆಲೆಗಳು", "తెలుగు": "ధరలు", "தமிழ்": "விலைகள்", "मराठी": "भाव" },
  "Price": { "हिन्दी": "भाव", "ಕನ್ನಡ": "ಬೆಲೆ", "తెలుగు": "ధర", "தமிழ்": "விலை", "मराठी": "भाव" },
  "Farmer": { "हिन्दी": "किसान", "ಕನ್ನಡ": "ರೈತ", "తెలుగు": "రైతు", "தமிழ்": "விவசாயி", "मराठी": "शेतकरी" },
  "Customer": { "हिन्दी": "ग्राहक", "ಕನ್ನಡ": "ಗ್ರಾಹಕ", "తెలుగు": "వినియోగదారుడు", "தமிழ்": "வாடிக்கையாளர்", "मराठी": "ग्राहक" },
  "Home": { "हिन्दी": "होम", "ಕನ್ನಡ": "ಮುಖಪುಟ", "తెలుగు": "హోమ్", "தமிழ்": "முகப்பு", "मराठी": "मुख्यपृष्ठ" },
  "Orders": { "हिन्दी": "ऑर्डर", "ಕನ್ನಡ": "ಆರ್ಡರ್‌ಗಳು", "తెలుగు": "ఆర్డర్లు", "தமிழ்": "ஆர்டர்கள்", "मराठी": "ऑर्डर्स" },
  "Order": { "हिन्दी": "ऑर्डर", "ಕನ್ನಡ": "ಆರ್ಡರ್", "తెలుగు": "ఆర్డర్", "தமிழ்": "ஆர்டர்", "मराठी": "ऑर्डर" },
  "Requests": { "हिन्दी": "अनुरोध", "ಕನ್ನಡ": "ವಿನಂತಿಗಳು", "తెలుగు": "అభ్యర్థనలు", "தமிழ்": "கோரிக்கைகள்", "मराठी": "मागण्या" },
  "Request": { "हिन्दी": "अनुरोध", "ಕನ್ನಡ": "ವಿನಂತಿ", "తెలుగు": "అభ్యర్థన", "தமிழ்": "கோரிக்கை", "मराठी": "मागणी" },
  "Sell": { "हिन्दी": "बेचें", "ಕನ್ನಡ": "ಮಾರಿ", "తెలుగు": "అమ్మండి", "தமிழ்": "விற்க", "मराठी": "विका" },
  "Browse": { "हिन्दी": "देखें", "ಕನ್ನಡ": "ವೀಕ್ಷಿಸಿ", "తెలుగు": "చూడండి", "தமிழ்": "உலாவுக", "मराठी": "पहा" },
  "Crop": { "हिन्दी": "फसल", "ಕನ್ನಡ": "ಬೆಳೆ", "తెలుగు": "పంట", "தமிழ்": "பயிர்", "मराठी": "पीक" },
  "Crops": { "हिन्दी": "फसलें", "ಕನ್ನಡ": "ಬೆಳೆಗಳು", "తెలుగు": "పంటలు", "தமிழ்": "பயிர்கள்", "मराठी": "पिके" },
  "Category": { "हिन्दी": "श्रेणी", "ಕನ್ನಡ": "ವರ್ಗ", "తెలుగు": "వర్గం", "தமிழ்": "வகை", "मराठी": "वर्ग" },
  "Commodity": { "हिन्दी": "जिंस", "ಕನ್ನಡ": "ಸರಕು", "తెలుగు": "సరుకు", "தமிழ்": "பண்டம்", "मराठी": "शेतमाल" },
  "Variety": { "हिन्दी": "किस्म", "ಕನ್ನಡ": "ತಳಿ", "తెలుగు": "రకం", "தமிழ்": "ரகம்", "मराठी": "जात" },
  "Grade": { "हिन्दी": "श्रेणी", "ಕನ್ನಡ": "ದರ್ಜೆ", "తెలుగు": "గ్రేడ్", "தமிழ்": "தரம்", "मराठी": "प्रत" },
  "State": { "हिन्दी": "राज्य", "ಕನ್ನಡ": "ರಾಜ್ಯ", "తెలుగు": "రాష్ట్రం", "தமிழ்": "மாநிலம்", "मराठी": "राज्य" },
  "District": { "हिन्दी": "जिला", "ಕನ್ನಡ": "ಜಿಲ್ಲೆ", "తెలుగు": "జిల్లా", "தமிழ்": "மாவட்டம்", "मराठी": "जिल्हा" },
  "Quantity": { "हिन्दी": "मात्रा", "ಕನ್ನಡ": "ಪ್ರಮಾಣ", "తెలుగు": "పరిమాణం", "தமிழ்": "அளவு", "मराठी": "प्रमाण" },
  "Available": { "हिन्दी": "उपलब्ध", "ಕನ್ನಡ": "ಲಭ್ಯ", "తెలుగు": "లభ్యత", "தமிழ்": "கிடைப்பது", "मराठी": "उपलब्ध" },
  "Unit": { "हिन्दी": "इकाई", "ಕನ್ನಡ": "ಘಟಕ", "తెలుగు": "యూనిట్", "தமிழ்": "அலகு", "मराठी": "एकक" },
  "Date": { "हिन्दी": "दिनांक", "ಕನ್ನಡ": "ದಿನಾಂಕ", "తెలుగు": "తేదీ", "தமிழ்": "தேதி", "मराठी": "दिनांक" },
  "Time": { "हिन्दी": "समय", "ಕನ್ನಡ": "ಸಮಯ", "తెలుగు": "సమయం", "தமிழ்": "நேரம்", "मराठी": "वेळ" },
  "Delete": { "हिन्दी": "हटाएं", "ಕನ್ನಡ": "ಅಳಿಸಿ", "తెలుగు": "తొలగించు", "தமிழ்": "நீக்கு", "मराठी": "हटवा" },
  "Edit": { "हिन्दी": "संपादित करें", "ಕನ್ನಡ": "ತಿದ್ದುಪಡಿ", "తెలుగు": "సవరించు", "தமிழ்": "திருத்து", "मराठी": "संपादित करा" },
  "Save": { "हिन्दी": "सहेजें", "ಕನ್ನಡ": "ಉಳಿಸಿ", "తెలుగు": "సేవ్ చేయండి", "தமிழ்": "சேமி", "मराठी": "जतन करा" },
  "Cancel": { "हिन्दी": "रद्द करें", "ಕನ್ನಡ": "ರದ್ದುಮಾಡಿ", "తెలుగు": "రద్దు చేయండి", "தமிழ்": "ரத்து", "मराठी": "रद्द करा" },
  "Close": { "हिन्दी": "बंद करें", "ಕನ್ನಡ": "ಮುಚ್ಚಿ", "తెలుగు": "మూసివేయి", "தமிழ்": "மூடு", "मराठी": "बंद करा" },
  "Search": { "हिन्दी": "खोजें", "ಕನ್ನಡ": "ಹುಡುಕಿ", "తెలుగు": "వెతకండి", "தமிழ்": "தேடு", "मराठी": "शोधा" },
  "Filter": { "हिन्दी": "फ़िल्टर", "ಕನ್ನಡ": "ಫಿಲ್ಟರ್", "తెలుగు": "ఫిల్టర్", "தமிழ்": "வடிகட்டு", "मराठी": "फिल्टर" },
  "Filters": { "हिन्दी": "फ़िल्टर", "ಕನ್ನಡ": "ಫಿಲ್ಟರ್‌ಗಳು", "తెలుగు": "ఫిల్టర్లు", "தமிழ்": "வடிகட்டிகள்", "मराठी": "फिल्टर्स" },
  "Clear": { "हिन्दी": "साफ़ करें", "ಕನ್ನಡ": "ತೆರವುಗೊಳಿಸಿ", "తెలుగు": "క్లియర్", "தமிழ்": "அழி", "मराठी": "साफ करा" },
  "Download": { "हिन्दी": "डाउनलोड", "ಕನ್ನಡ": "ಡೌನ್‌ಲೋಡ್", "తెలుగు": "డౌన్‌లోడ్", "தமிழ்": "பதிவிறக்கு", "मराठी": "डाउनलोड" },
  "Print": { "हिन्दी": "प्रिंट करें", "ಕನ್ನಡ": "ಮುದ್ರಿಸಿ", "తెలుగు": "ప్రింట్", "தமிழ்": "அச்சிடு", "मराठी": "प्रिंट करा" },
  "Invoice": { "हिन्दी": "चालान", "ಕನ್ನಡ": "ಇನ್‌ವಾಯ್ಸ್", "తెలుగు": "ఇన్వాయిస్", "தமிழ்": "விலைப்பட்டியல்", "मराठी": "बीजक" },
  "Reviews": { "हिन्दी": "समीक्षाएं", "ಕನ್ನಡ": "ವಿಮರ್ಶೆಗಳು", "తెలుగు": "సమీక్షలు", "தமிழ்": "மதிப்புரைகள்", "मराठी": "अभिप्राय" },
  "Review": { "हिन्दी": "समीक्षा", "ಕನ್ನಡ": "ವಿಮರ್ಶೆ", "తెలుగు": "సమీక్ష", "தமிழ்": "மதிப்புரை", "मराठी": "अभिप्राय" },
  "Rating": { "हिन्दी": "रेटिंग", "ಕನ್ನಡ": "ರೇಟಿಂಗ್", "తెలుగు": "రేటింగ్", "தமிழ்": "மதிப்பீடு", "मराठी": "रेटिंग" },
  "Notifications": { "हिन्दी": "सूचनाएं", "ಕನ್ನಡ": "ಅಧಿಸೂಚನೆಗಳು", "తెలుగు": "నోటిఫికేషన్‌లు", "தமிழ்": "அறிவிப்புகள்", "मराठी": "सूचना" },
  "Notification": { "हिन्दी": "सूचना", "ಕನ್ನಡ": "ಅಧಿಸೂಚನೆ", "తెలుగు": "నోటిఫికేషన్", "தமிழ்": "அறிவிப்பு", "मराठी": "सूचना" },
  "Help": { "हिन्दी": "सहायता", "ಕನ್ನಡ": "ಸಹಾಯ", "తెలుగు": "సహాయం", "தமிழ்": "உதவி", "मराठी": "मदत" },
  "Weather": { "हिन्दी": "मौसम", "ಕನ್ನಡ": "ಹವಾಮಾನ", "తెలుగు": "వాతావరణం", "தமிழ்": "வானிலை", "मराठी": "हवामान" },
  "Assistant": { "हिन्दी": "सहायक", "ಕನ್ನಡ": "ಸಹಾಯಕ", "తెలుగు": "సహాయకుడు", "தமிழ்": "உதவியாளர்", "मराठी": "सहाय्यक" },
  "Chat": { "हिन्दी": "बातचीत", "ಕನ್ನಡ": "ಸಂಪರ್ಕಿಸಿ", "తెలుగు": "మాట్లాడండి", "தமிழ்": "உரையாடுங்கள்", "मराठी": "संवाद" },
  "History": { "हिन्दी": "इतिहास", "ಕನ್ನಡ": "ಇತಿಹಾಸ", "తెలుగు": "చరిత్ర", "தமிழ்": "வரலாறு", "मराठी": "इतिहास" },
  "Unread": { "हिन्दी": "अपठित", "ಕನ್ನಡ": "ಓದದಿರುವುದು", "తెలుగు": "చదవనివి", "தமிழ்": "படிக்காதவை", "मराठी": "न वाचलेले" },
  "Read": { "हिन्दी": "पढ़ी गई", "ಕನ್ನಡ": "ಓದಿದ್ದು", "తెలుగు": "చదివినవి", "தமிழ்": "படித்தவை", "मराठी": "वाचलेले" },
  "All": { "हिन्दी": "सभी", "ಕನ್ನಡ": "ಎಲ್ಲಾ", "తెలుగు": "అన్నీ", "தமிழ்": "அனைத்தும்", "मराठी": "सर्व" },
  "Route": { "हिन्दी": "रास्ता", "ಕನ್ನಡ": "ಮಾರ್ಗ", "తెలుగు": "మార్గం", "தமிழ்": "வழித்தடம்", "मराठी": "मार्ग" },
  "Delivery": { "हिन्दी": "डिलीवरी", "ಕನ್ನಡ": "ವಿತರಣೆ", "తెలుగు": "డెలివరీ", "தமிழ்": "டெலிவரி", "मराठी": "वितरण" },
  "Address": { "हिन्दी": "पता", "ಕನ್ನಡ": "ವಿಳಾಸ", "తెలుగు": "చిరునామా", "தமிழ்": "முகவரி", "मराठी": "पत्ता" },
  "Phone": { "हिन्दी": "फ़ोन", "ಕನ್ನಡ": "ದೂರವಾಣಿ", "తెలుగు": "ఫోన్", "தமிழ்": "தொலைபேசி", "मराठी": "फोन" },
  "Total": { "हिन्दी": "कुल", "ಕನ್ನಡ": "ಒಟ್ಟು", "తెలుగు": "మొత్తం", "தமிழ்": "மொத்தம்", "मराठी": "एकूण" },
  "Subtotal": { "हिन्दी": "उप-योग", "ಕನ್ನಡ": "ಉಪಮೊತ್ತ", "తెలుగు": "ఉపమొత్తం", "தமிழ்": "துணைத்தொகை", "मराठी": "उपएकूण" },
  "Free": { "हिन्दी": "मुफ़्त", "ಕನ್ನಡ": "ಉಚಿತ", "తెలుగు": "ఉచితం", "தமிழ்": "இலவசம்", "मराठी": "मोफत" },
  "Payment": { "हिन्दी": "भुगतान", "ಕನ್ನಡ": "ಪಾವತಿ", "తెలుగు": "చెల్లింపు", "தமிழ்": "கட்டணம்", "मराठी": "पेमेंट" },
  "Min": { "हिन्दी": "न्यूनतम", "ಕನ್ನಡ": "ಕನಿಷ್ಠ", "తెలుగు": "కనిష్ట", "தமிழ்": "குறைந்தபட்ச", "मराठी": "किमान" },
  "Max": { "हिन्दी": "अधिकतम", "ಕನ್ನಡ": "ಗರಿಷ್ಠ", "తెలుగు": "గరిష్ట", "தமிழ்": "அதிகபட்ச", "मराठी": "कमाल" },
  "Modal": { "हिन्दी": "मॉडल", "ಕನ್ನಡ": "ಮಾದರಿ", "తెలుగు": "మోడల్", "தமிழ்": "மாதிரி", "मराठी": "सरासरी" },
  "Wholesale": { "हिन्दी": "थोक", "ಕನ್ನಡ": "ಸಗಟು", "తెలుగు": "టోకు", "தமிழ்": "மொத்த", "मराठी": "घाऊक" },
  "Official": { "हिन्दी": "सरकारी", "ಕನ್ನಡ": "ಸರ್ಕಾರಿ", "తెలుగు": "అధికారిక", "தமிழ்": "அரசு", "मराठी": "अधिकृत" },
  "Live": { "हिन्दी": "लाइव", "ಕನ್ನಡ": "ಲೈವ್", "తెలుగు": "లైవ్", "தமிழ்": "நேரலை", "मराठी": "थेट" },
  "Table": { "हिन्दी": "तालिका", "ಕನ್ನಡ": "ಕೋಷ್ಟಕ", "తెలుగు": "పట్టిక", "தமிழ்": "அட்டவணை", "मराठी": "तक्ता" },
  "Cards": { "हिन्दी": "कार्ड्स", "ಕನ್ನಡ": "ಕಾರ್ಡ್‌ಗಳು", "తెలుగు": "కార్డులు", "தமிழ்": "அட்டைகள்", "मराठी": "कार्ड्स" },
  "Outlook": { "हिन्दी": "अनुमान", "ಕನ್ನಡ": "ಮುನ್ನೋಟ", "తెలుగు": "అంచనా", "தமிழ்": "கணிப்பு", "मराठी": "अंदाज" },
  "Forecast": { "हिन्दी": "पूर्वानुमान", "ಕನ್ನಡ": "ಮುನ್ಸೂಚನೆ", "తెలుగు": "అంచనా", "தமிழ்": "முன்னறிவிப்பு", "मराठी": "अंदाज" },
  "Sign": { "हिन्दी": "साइन", "ಕನ್ನಡ": "ಸೈನ್", "తెలుగు": "సైన్", "தமிழ்": "உள்நுழை", "मराठी": "साइन" },
  "In": { "हिन्दी": "इन", "ಕನ್ನಡ": "ಇನ್", "తెలుగు": "ఇన్", "தமிழ்": "உள்", "मराठी": "इन" },
  "Out": { "हिन्दी": "आउट", "ಕನ್ನಡ": "ಔಟ್", "తెలుగు": "అవుట్", "தமிழ்": "வெளியே", "मराठी": "आउट" },
  "Up": { "हिन्दी": "अप", "ಕನ್ನಡ": "ಅಪ್", "తెలుగు": "అప్", "தமிழ்": "பதிவு", "मराठी": "अप" },
  "Account": { "हिन्दी": "खाता", "ಕನ್ನಡ": "ಖಾತೆ", "తెలుగు": "ఖాతా", "தமிழ்": "கணக்கு", "मराठी": "खाते" },
  "Profile": { "हिन्दी": "प्रोफ़ाइल", "ಕನ್ನಡ": "ಪ್ರೊಫೈಲ್", "తెలుగు": "ప్రొఫైల్", "தமிழ்": "சுயவிவரம்", "मराठी": "प्रोफाइल" },
  "Verified": { "हिन्दी": "सत्यापित", "ಕನ್ನಡ": "ಪರಿಶೀಲಿಸಿದ", "తెలుగు": "ధృవీకరించబడింది", "தமிழ்": "சரிபார்க்கப்பட்டது", "मराठी": "पडताळलेले" },
  "Purchase": { "हिन्दी": "खरीद", "ಕನ್ನಡ": "ಖರೀದಿ", "తెలుగు": "కొనుగోలు", "தமிழ்": "கொள்முதல்", "मराठी": "खरेदी" },
  "Distance": { "हिन्दी": "दूरी", "ಕನ್ನಡ": "ದೂರ", "తెలుగు": "దూరం", "தமிழ்": "தூரம்", "मराठी": "अंतर" },
  "Nearby": { "हिन्दी": "नजदीकी", "ಕನ್ನಡ": "ಸಮೀಪದ", "తెలుగు": "సమీపంలోని", "தமிழ்": "அருகில்", "मराठी": "जवळचे" },
  "Quality": { "हिन्दी": "गुणवत्ता", "ಕನ್ನಡ": "ಗುಣಮಟ್ಟ", "తెలుగు": "నాణ్యత", "தமிழ்": "தரம்", "मराठी": "दर्जा" },
  "Service": { "हिन्दी": "सेवा", "ಕನ್ನಡ": "ಸೇವೆ", "తెలుగు": "సేవ", "தமிழ்": "சேவை", "मराठी": "सेवा" },
  "Produce": { "हिन्दी": "उपज", "ಕನ್ನಡ": "ಉತ್ಪನ್ನ", "తెలుగు": "ఉత్పత్తులు", "தமிழ்": "விளைபொருள்", "मराठी": "शेतमाल" },
  "Harvest": { "हिन्दी": "फसल", "ಕನ್ನಡ": "ಬೆಳೆ", "తెలుగు": "కోత", "தமிழ்": "அறுவடை", "मराठी": "काढणी" },
  "Workspace": { "हिन्दी": "कार्यक्षेत्र", "ಕನ್ನಡ": "ಕಾರ್ಯಕ್ಷೇತ್ರ", "తెలుగు": "వర్క్‌స్పేస్", "தமிழ்": "பணியிடம்", "मराठी": "कार्यक्षेत्र" },
  "Option": { "हिन्दी": "विकल्प", "ಕನ್ನಡ": "ಆಯ್ಕೆ", "తెలుగు": "ఎంపిక", "தமிழ்": "விருப்பம்", "मराठी": "पर्याय" },
  "Switch": { "हिन्दी": "बदलें", "ಕನ್ನಡ": "ಬದಲಾಯಿಸಿ", "తెలుగు": "మార్చండి", "தமிழ்": "மாற்றவும்", "मराठी": "बदला" },
  "Enable": { "हिन्दी": "सक्षम करें", "ಕನ್ನಡ": "ಸಕ್ರಿಯಗೊಳಿಸಿ", "తెలుగు": "ప్రారంభించండి", "தமிழ்": "இயக்கு", "मराठी": "सक्षम करा" },
  "Required": { "हिन्दी": "आवश्यक", "ಕನ್ನಡ": "ಅಗತ್ಯವಿದೆ", "తెలుగు": "అవసరం", "தமிழ்": "தேவை", "मराठी": "आवश्यक" },
  "Demo": { "हिन्दी": "डेमो", "ಕನ್ನಡ": "ಡೆಮೊ", "తెలుగు": "డెమో", "தமிழ்": "மாதிரி", "मराठी": "डेमो" },
  "Quick": { "हिन्दी": "त्वरित", "ಕನ್ನಡ": "ತ್ವರಿತ", "తెలుగు": "శీఘ్ర", "தமிழ்": "விரைவு", "मराठी": "जलद" },
  "Login": { "हिन्दी": "लॉगिन", "ಕನ್ನಡ": "ಲಾಗಿನ್", "తెలుగు": "లాగిన్", "தமிழ்": "உள்நுழைவு", "मराठी": "लॉगिन" }
};

// Universal Text Translation Function
export function translateText(rawText, lang = "English") {
  if (!rawText || typeof rawText !== "string" || lang === "English") {
    return rawText;
  }

  const str = rawText.trim();
  if (!str) return rawText;

  // 1. Direct match in translations dictionary
  if (translations[lang] && translations[lang][str]) {
    return rawText.replace(str, translations[lang][str]);
  }
  for (const [k, v] of Object.entries(translations.English || {})) {
    if (v.toLowerCase() === str.toLowerCase() && translations[lang]?.[k]) {
      return rawText.replace(str, translations[lang][k]);
    }
  }

  // 2. Direct match in Phrase dictionary
  if (PHRASE_TRANSLATIONS[str] && PHRASE_TRANSLATIONS[str][lang]) {
    return rawText.replace(str, PHRASE_TRANSLATIONS[str][lang]);
  }
  for (const [enPhrase, map] of Object.entries(PHRASE_TRANSLATIONS)) {
    if (enPhrase.toLowerCase() === str.toLowerCase() && map[lang]) {
      return rawText.replace(str, map[lang]);
    }
  }

  // 3. Match Crop
  if (CROP_TRANSLATIONS[str] && CROP_TRANSLATIONS[str][lang]) {
    return rawText.replace(str, CROP_TRANSLATIONS[str][lang]);
  }
  for (const [cropEn, map] of Object.entries(CROP_TRANSLATIONS)) {
    if (cropEn.toLowerCase() === str.toLowerCase() && map[lang]) {
      return rawText.replace(str, map[lang]);
    }
  }

  // 4. Match Category
  if (CATEGORY_TRANSLATIONS[str] && CATEGORY_TRANSLATIONS[str][lang]) {
    return rawText.replace(str, CATEGORY_TRANSLATIONS[str][lang]);
  }
  for (const [catEn, map] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (catEn.toLowerCase() === str.toLowerCase() && map[lang]) {
      return rawText.replace(str, map[lang]);
    }
  }

  // 5. Match Status
  if (STATUS_TRANSLATIONS[str] && STATUS_TRANSLATIONS[str][lang]) {
    return rawText.replace(str, STATUS_TRANSLATIONS[str][lang]);
  }
  for (const [statEn, map] of Object.entries(STATUS_TRANSLATIONS)) {
    if (statEn.toLowerCase() === str.toLowerCase() && map[lang]) {
      return rawText.replace(str, map[lang]);
    }
  }

  // 6. Match Unit
  if (UNIT_TRANSLATIONS[str] && UNIT_TRANSLATIONS[str][lang]) {
    return rawText.replace(str, UNIT_TRANSLATIONS[str][lang]);
  }

  // 7. Match State
  if (STATE_TRANSLATIONS[str] && STATE_TRANSLATIONS[str][lang]) {
    return rawText.replace(str, STATE_TRANSLATIONS[str][lang]);
  }

  // 8. Template & Pattern Matching
  // "X crops on your account"
  const cropsAccountMatch = str.match(/^(\d+)\s+crops?\s+on your account$/i);
  if (cropsAccountMatch) {
    const num = cropsAccountMatch[1];
    const map = {
      "हिन्दी": `${num} फसलें आपके खाते में`,
      "ಕನ್ನಡ": `${num} ಬೆಳೆಗಳು ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ`,
      "తెలుగు": `${num} పంటలు మీ ఖాతాలో`,
      "தமிழ்": `${num} பயிர்கள் உங்கள் கணக்கில்`,
      "मराठी": `${num} पिके तुमच्या खात्यात`
    };
    if (map[lang]) return rawText.replace(str, map[lang]);
  }

  // "Official market data for X"
  const officialDataMatch = str.match(/^Official market data for (.*)$/i);
  if (officialDataMatch) {
    const loc = officialDataMatch[1];
    const map = {
      "हिन्दी": `${loc} के लिए सरकारी मंडी भाव`,
      "ಕನ್ನಡ": `${loc} ಗಾಗಿ ಅಧಿಕೃತ ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ`,
      "తెలుగు": `${loc} కోసం అధికారిక మార్కెట్ సమాచారం`,
      "தமிழ்": `${loc} க்கான அதிகாரப்பூர்வ சந்தை விவரங்கள்`,
      "मराठी": `${loc} साठी अधिकृत बाजार भाव माहिती`
    };
    if (map[lang]) return rawText.replace(str, map[lang]);
  }

  // "X km away"
  const kmAwayMatch = str.match(/^(\d+(\.\d+)?)\s*km\s*away$/i);
  if (kmAwayMatch) {
    const dist = kmAwayMatch[1];
    const map = {
      "हिन्दी": `${dist} किमी दूर`,
      "ಕನ್ನಡ": `${dist} ಕಿ.ಮೀ ದೂರ`,
      "తెలుగు": `${dist} కి.మీ దూరం`,
      "தமிழ்": `${dist} கி.மீ தூரம்`,
      "मराठी": `${dist} किमी अंतरावर`
    };
    if (map[lang]) return rawText.replace(str, map[lang]);
  }

  // "₹X/unit"
  const priceUnitMatch = str.match(/^₹?(\d+(\.\d+)?)\s*\/\s*([a-zA-Z]+)$/);
  if (priceUnitMatch) {
    const amt = priceUnitMatch[1];
    const u = priceUnitMatch[3];
    const transUnit = UNIT_TRANSLATIONS[u.toLowerCase()]?.[lang] || u;
    return `₹${amt}/${transUnit}`;
  }

  // 9. Handle Emoji / Symbol prefix / suffix stripping
  const symbolPrefixMatch = str.match(/^([\p{Emoji}\p{Symbol}\p{Punctuation}\d\s\.✓✕⚡📍🌾🧺💰🗑️✳→←↑↓#]+)(.*)$/u);
  if (symbolPrefixMatch) {
    const prefix = symbolPrefixMatch[1];
    const core = symbolPrefixMatch[2].trim();
    if (core && core !== str) {
      const translatedCore = translateText(core, lang);
      if (translatedCore !== core) {
        return rawText.replace(str, prefix + translatedCore);
      }
    }
  }

  // 10. Vocabulary Word-by-Word Replacement for compound titles/labels
  let translatedWords = str;
  let wordReplaced = false;
  // Sort vocabulary keys by length descending to replace longest phrases first
  const sortedVocab = Object.keys(VOCABULARY).sort((a, b) => b.length - a.length);
  for (const word of sortedVocab) {
    const reg = new RegExp(`\\b${word}\\b`, "gi");
    if (reg.test(translatedWords) && VOCABULARY[word][lang]) {
      translatedWords = translatedWords.replace(reg, VOCABULARY[word][lang]);
      wordReplaced = true;
    }
  }
  if (wordReplaced) {
    return rawText.replace(str, translatedWords);
  }

  return rawText;
}

// Hook to automatically translate live DOM text nodes and input placeholders
export function useLanguageTranslator(lang) {
  useEffect(() => {
    if (!lang || typeof document === "undefined") return;

    if (lang === "English") {
      // Restore canonical English text
      document.querySelectorAll("[data-orig-text]").forEach(el => {
        el.textContent = el.getAttribute("data-orig-text");
        el.removeAttribute("data-orig-text");
      });
      document.querySelectorAll("[data-orig-ph]").forEach(el => {
        el.placeholder = el.getAttribute("data-orig-ph");
        el.removeAttribute("data-orig-ph");
      });
      return;
    }

    let isTranslating = false;

    const translateDom = () => {
      if (isTranslating) return;
      isTranslating = true;

      try {
        const root = document.getElementById("root") || document.body;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        let node;
        const nodesToTranslate = [];

        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!parent) continue;
          const tagName = parent.tagName;
          if (["SCRIPT", "STYLE", "CODE", "PRE"].includes(tagName)) continue;
          // Skip if parent is inside an active user text input
          if (tagName === "TEXTAREA" || (tagName === "INPUT" && parent.type !== "button" && parent.type !== "submit")) continue;

          const text = node.nodeValue;
          if (text && text.trim().length > 0 && /[a-zA-Z]/.test(text)) {
            nodesToTranslate.push({ node, parent });
          }
        }

        nodesToTranslate.forEach(({ node, parent }) => {
          if (!parent.hasAttribute("data-orig-text")) {
            parent.setAttribute("data-orig-text", node.nodeValue);
          }
          const original = parent.getAttribute("data-orig-text");
          const translated = translateText(original, lang);
          if (translated && translated !== node.nodeValue) {
            node.nodeValue = translated;
          }
        });

        // Translate placeholders
        root.querySelectorAll("input[placeholder]").forEach(inp => {
          if (!inp.hasAttribute("data-orig-ph")) {
            inp.setAttribute("data-orig-ph", inp.placeholder);
          }
          const origPh = inp.getAttribute("data-orig-ph");
          const transPh = translateText(origPh, lang);
          if (transPh && transPh !== inp.placeholder) {
            inp.placeholder = transPh;
          }
        });

        // Translate select options
        root.querySelectorAll("option").forEach(opt => {
          if (!opt.hasAttribute("data-orig-text")) {
            opt.setAttribute("data-orig-text", opt.textContent);
          }
          const orig = opt.getAttribute("data-orig-text");
          const trans = translateText(orig, lang);
          if (trans && trans !== opt.textContent) {
            opt.textContent = trans;
          }
        });
      } finally {
        isTranslating = false;
      }
    };

    translateDom();

    // Debounced mutation observer for dynamic React state updates
    let debounceTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        translateDom();
      }, 60);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [lang]);
}

// React translation helper function
export function t(key, lang = "English") {
  if (!key) return "";
  if (lang === "English") {
    return translations.English[key] || key;
  }
  return translateText(key, lang);
}

export function translateCrop(crop, lang) {
  if (!crop || lang === "English") return crop;
  return CROP_TRANSLATIONS[crop]?.[lang] || translateText(crop, lang);
}

export function translateCategory(cat, lang) {
  if (!cat || lang === "English") return cat;
  return CATEGORY_TRANSLATIONS[cat]?.[lang] || translateText(cat, lang);
}

export function translateStatus(status, lang) {
  if (!status || lang === "English") return status;
  return STATUS_TRANSLATIONS[status]?.[lang] || translateText(status, lang);
}

export function translateUnit(unit, lang) {
  if (!unit || lang === "English") return unit;
  return UNIT_TRANSLATIONS[unit]?.[lang] || translateText(unit, lang);
}

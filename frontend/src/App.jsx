import { useEffect, useState, useRef } from "react"
import OfficialPrices from "./OfficialPrices.jsx"
import { supabase, isSupabaseConfigured } from "./supabase.js"
import commodityMaster from "../../backend/data/commodity-master.json"
import agmarknetCatalogue from "../../backend/data/agmarknet-catalogue.json"
import "./App.css"

export const translations = {
  English: {
    home: "Home",
    prices: "Market prices",
    outlook: "Price outlook",
    mandi: "Find a mandi",
    sell: "List your harvest",
    browse: "Browse produce",
    requests: "Requests",
    myRequests: "My requests",
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
    buyRequest: "Buy / Request",
    call: "Call",
    whatsapp: "WhatsApp",
    bestRoute: "Best route",
    delete: "Delete",
    crop: "CROP",
    available: "AVAILABLE",
    askingPrice: "ASKING PRICE",
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
    demoCustomer: "Sign In as Demo Customer (Priya)"
  },
  "हिन्दी": {
    home: "होम",
    prices: "मंडी भाव",
    outlook: "भाव का अनुमान",
    mandi: "मंडी खोजें",
    sell: "फसल बेचें",
    browse: "फसलें देखें",
    requests: "ऑर्डर अनुरोध",
    myRequests: "मेरे अनुरोध",
    greeting: "नमस्ते",
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
    buyRequest: "खरीदें / अनुरोध",
    call: "कॉल करें",
    whatsapp: "व्हाट्सएप",
    bestRoute: "रास्ता देखें",
    delete: "हटाएं",
    crop: "फसल",
    available: "उपलब्ध मात्रा",
    askingPrice: "मांग मूल्य",
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
    demoCustomer: "डेमो ग्राहक लॉगिन (प्रिया)"
  },
  "ಕನ್ನಡ": {
    home: "ಮುಖಪುಟ",
    prices: "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು",
    outlook: "ಬೆಲೆ ಮುನ್ಸೂಚನೆ",
    mandi: "ಮಂಡಿ ಹುಡುಕಿ",
    sell: "ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ",
    browse: "ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    requests: "ವಿನಂತಿಗಳು",
    myRequests: "ನನ್ನ ವಿನಂತಿಗಳು",
    greeting: "ನಮಸ್ಕಾರ",
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
    buyRequest: "ಖರೀದಿಸಿ / ವಿನಂತಿಸಿ",
    call: "ಕರೆ ಮಾಡಿ",
    whatsapp: "ವಾಟ್ಸಾಪ್",
    bestRoute: "ದಾರಿ ನಕ್ಷೆ",
    delete: "ಅಳಿಸಿ",
    crop: "ಬೆಳೆ",
    available: "ಲಭ್ಯತೆ",
    askingPrice: "ಬೆಲೆ",
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
    demoCustomer: "ಡೆಮೊ ಗ್ರಾಹಕ ಲಾಗಿನ್ (ಪ್ರಿಯಾ)"
  },
  "తెలుగు": {
    home: "హోమ్",
    prices: "మార్కెట్ ధరలు",
    outlook: "ధర అంచనా",
    mandi: "మండి వెతకండి",
    sell: "పంట అమ్మండి",
    browse: "పంటలను చూడండి",
    requests: "ఆర్డర్ అభ్యర్థనలు",
    myRequests: "నా అభ్యర్థనలు",
    greeting: "నమస్కారం",
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
    buyRequest: "కొనండి / అభ్యర్థించండి",
    call: "కాల్ చేయండి",
    whatsapp: "వాట్సాప్",
    bestRoute: "మార్గం చూడండి",
    delete: "తొలగించు",
    crop: "పంట",
    available: "లభ్యత",
    askingPrice: "ధర",
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
    demoCustomer: "డెమో కస్టమర్ లాగిన్ (ప్రియ)"
  },
  "தமிழ்": {
    home: "முகப்பு",
    prices: "சந்தை விலை",
    outlook: "விலை கணிப்பு",
    mandi: "சந்தையை காண்க",
    sell: "பயிர் விற்கவும்",
    browse: "விளைபொருட்கள்",
    requests: "கோரிக்கைகள்",
    myRequests: "என் கோரிக்கைகள்",
    greeting: "வணக்கம்",
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
    buyRequest: "வாங்க / கோர",
    call: "அழைக்க",
    whatsapp: "வாட்ஸ்அப்",
    bestRoute: "வழித்தடம்",
    delete: "நீக்கு",
    crop: "பயிர்",
    available: "கிடைப்பது",
    askingPrice: "விலை",
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
    demoCustomer: "மாதிரி வாடிக்கையாளர் (பிரியா)"
  },
  "मराठी": {
    home: "मुख्यपृष्ठ",
    prices: "बाजार भाव",
    outlook: "भावाचा अंदाज",
    mandi: "मंडी शोधा",
    sell: "पीक विका",
    browse: "पीक पहा",
    requests: "मागण्या",
    myRequests: "माझ्या मागण्या",
    greeting: "नमस्कार",
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
    buyRequest: "खरेदी करा / मागणी",
    call: "कॉल करा",
    whatsapp: "व्हॉट्सअ‍ॅप",
    bestRoute: "मार्ग पहा",
    delete: "हटवा",
    crop: "पीक",
    available: "उपलब्ध",
    askingPrice: "मागणी किंमत",
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
    demoCustomer: "डेमो ग्राहक लॉगिन (प्रिया)"
  }
}

export function getGreeting(timeInput = new Date(), language = "English") {
  let hour
  let minute = 0
  if (typeof timeInput === "string") {
    const trimmed = timeInput.trim()
    if (["English", "हिन्दी", "ಕನ್ನಡ", "తెలుగు", "தமிழ்", "मराठी"].includes(trimmed)) {
      language = trimmed
      const now = new Date()
      hour = now.getHours()
      minute = now.getMinutes()
    } else if (/am|pm/i.test(trimmed)) {
      const match = trimmed.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i) || trimmed.match(/(\d{1,2})\s*(am|pm)/i)
      if (match) {
        let h = parseInt(match[1], 10)
        const m = match[2] && !/am|pm/i.test(match[2]) ? parseInt(match[2], 10) : 0
        const ampm = (match[3] || match[2] || "").toLowerCase()
        if (ampm === "pm" && h < 12) h += 12
        if (ampm === "am" && h === 12) h = 0
        hour = h
        minute = m
      }
    } else if (trimmed.includes(":")) {
      const parts = trimmed.split(":")
      hour = parseInt(parts[0], 10)
      minute = parseInt(parts[1], 10) || 0
    } else {
      const parsed = parseInt(trimmed, 10)
      if (!isNaN(parsed)) hour = parsed
      else {
        const now = new Date()
        hour = now.getHours()
        minute = now.getMinutes()
      }
    }
  } else if (typeof timeInput === "number") {
    hour = timeInput
  } else if (timeInput instanceof Date) {
    hour = timeInput.getHours()
    minute = timeInput.getMinutes()
  } else {
    const now = new Date()
    hour = now.getHours()
    minute = now.getMinutes()
  }

  hour = Number.isFinite(hour) ? hour : new Date().getHours()

  const totalMinutes = hour * 60 + minute
  let period = "night"
  if (totalMinutes >= 5 * 60 && totalMinutes < 12 * 60) period = "morning"
  else if (totalMinutes >= 12 * 60 && totalMinutes < 17 * 60) period = "afternoon"
  else if (totalMinutes >= 17 * 60 && totalMinutes < 21 * 60) period = "evening"
  else period = "night"

  switch (language) {
    case "हिन्दी":
      return period === "morning" ? "शुभ प्रभात!" : period === "afternoon" ? "शुभ दोपहर!" : period === "evening" ? "शुभ संध्या!" : "शुभ रात्रि!"
    case "ಕನ್ನಡ":
      return period === "morning" ? "ಶುಭೋದಯ!" : period === "afternoon" ? "ಶುಭ ಮಧ್ಯಾಹ್ನ!" : period === "evening" ? "ಶುಭ ಸಂಜೆ!" : "ಶುಭ ರಾತ್ರಿ!"
    case "తెలుగు":
      return period === "morning" ? "శుభోదయం!" : period === "afternoon" ? "శుభ మధ్యాహ్నం!" : period === "evening" ? "శుభ సాయంత్రం!" : "శుభ రాత్రి!"
    case "தமிழ்":
      return period === "morning" ? "காலை வணக்கம்!" : period === "afternoon" ? "மதிய வணக்கம்!" : period === "evening" ? "மாலை வணக்கம்!" : "இனிய இரவு!"
    case "मराठी":
      return period === "morning" ? "शुभ प्रभात!" : period === "afternoon" ? "शुभ दुपार!" : period === "evening" ? "शुभ संध्याकाळ!" : "शुभ रात्री!"
    case "English":
    default:
      return period === "morning" ? "Good Morning!" : period === "afternoon" ? "Good Afternoon!" : period === "evening" ? "Good Evening!" : "Good Night!"
  }
}

export function getTimeGreeting(param1 = "English", param2 = null) {
  if (typeof param1 === "string" && ["English", "हिन्दी", "ಕನ್ನಡ", "తెలుగు", "தமிழ்", "मराठी"].includes(param1)) {
    return getGreeting(param2 || new Date(), param1)
  }
  return getGreeting(param1, param2 || "English")
}

export const MARKETPLACE_CATEGORIES = [
  "All Categories",
  "Vegetables",
  "Fruits",
  "Cereals",
  "Pulses",
  "Oil Seeds",
  "Spices",
  "Dry Fruits",
  "Flowers",
  "Beverages",
  "Fibre Crops",
  "Drug and Narcotics",
  "Forest Products",
  "Medicinal and Aromatic Plants",
  "Live Stock,Poultry,Fisheries",
  "Oils and Fats",
  "Others"
]

export const INDIAN_STATES = [
  "All States",
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir",
  "Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal"
]

const CROP_CATEGORIES = [
  ["Vegetables", /vegetable|onion|potato|tomato|brinjal|cabbage|cauliflower|carrot|radish|okra|bhindi|beetroot|gourd|cucumber|spinach|beans|peas|capsicum|chilli\s*green|garlic/i],
  ["Fruits", /fruit|apple|banana|mango|orange|grape|papaya|guava|pomegranate|watermelon|muskmelon|lemon|lime|pineapple|sweet\s*orange|mosambi|chikoo|sapota/i],
  ["Cereals", /paddy|rice|wheat|maize|corn|barley|jowar|sorghum|bajra|pearl\s*millet|ragi|finger\s*millet|oats|cereal/i],
  ["Pulses", /gram|chana|arhar|tur|moong|urad|masoor|lentil|pulse|pea|cowpea|rajma/i],
  ["Oil Seeds", /groundnut|mustard|soyabean|soybean|sunflower|sesamum|til|castor|linseed|safflower|oilseed/i],
  ["Spices", /turmeric|chilli|chili|ginger|garlic|coriander|cumin|pepper|cardamom|clove|cinnamon|fennel|fenugreek|ajwain|spice/i],
  ["Dry Fruits", /almond|cashew|walnut|raisin|date|pistachio|anjeer|fig/i],
  ["Fibre Crops", /cotton|jute|hemp/i],
  ["Drug and Narcotics", /sugarcane|tobacco|arecanut/i],
  ["Beverages", /coffee|tea|cocoa/i],
  ["Flowers", /marigold|rose|jasmine|chrysanthemum|tuberose|gladiolus/i]
]

export function getCategoryForCrop(crop) {
  if (!crop) return "Others"
  const clean = String(crop).trim()
  if (Array.isArray(agmarknetCatalogue?.commodities)) {
    const norm = clean.toLowerCase().replace(/[^a-z0-9]/g, "")
    const found = agmarknetCatalogue.commodities.find(c => {
      if (String(c.name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) return true
      if (c.agmarknet_name && String(c.agmarknet_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) return true
      if (c.display_name && String(c.display_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) return true
      return false
    })
    if (found && (found.category || found.group_name)) {
      return found.category || found.group_name
    }
  }
  const match = CROP_CATEGORIES.find(([, regex]) => regex.test(clean))
  return match ? match[0] : "Others"
}

export function isListingExpired(dateStr) {
  if (!dateStr) return false
  const parts = String(dateStr).split("-").map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) {
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    parsed.setHours(0, 0, 0, 0)
    return parsed < today
  }
  const [year, month, day] = parts
  const itemDate = new Date(year, month - 1, day, 0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return itemDate < today
}

export function isExpiringToday(dateStr) {
  if (!dateStr) return false
  const parts = String(dateStr).split("-").map(Number)
  const itemDate = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0) : new Date(dateStr)
  if (isNaN(itemDate.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return itemDate.getTime() === today.getTime()
}

export function isExpiringWithinDays(dateStr, days) {
  if (!dateStr) return false
  const parts = String(dateStr).split("-").map(Number)
  const itemDate = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0) : new Date(dateStr)
  if (isNaN(itemDate.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const limit = new Date(today)
  limit.setDate(limit.getDate() + days)
  limit.setHours(23, 59, 59, 999)
  return itemDate >= today && itemDate <= limit
}

export function isBeforeCustomDate(dateStr, customDateStr) {
  if (!dateStr || !customDateStr) return false
  const parts = String(dateStr).split("-").map(Number)
  const itemDate = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0) : new Date(dateStr)
  if (isNaN(itemDate.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const customParts = String(customDateStr).split("-").map(Number)
  const customLimit = customParts.length === 3
    ? new Date(customParts[0], customParts[1] - 1, customParts[2], 23, 59, 59, 999)
    : new Date(customDateStr)
  if (isNaN(customLimit.getTime())) return false
  return itemDate >= today && itemDate <= customLimit
}

function CropCameraCapture({ image, onCapture, onClear }) {
  const [isOpen, setIsOpen] = useState(false)
  const [facingMode, setFacingMode] = useState("environment")
  const [cameraError, setCameraError] = useState("")
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      return
    }

    let active = true
    setCameraError("")

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API is not supported by your browser.")
        }
        let stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          })
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        }
        if (!active) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => { })
        }
      } catch (err) {
        if (active) {
          setCameraError(err.message || "Unable to access camera. Please allow camera permissions or upload a photo.")
        }
      }
    }

    initCamera()

    return () => {
      active = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }
  }, [isOpen, facingMode])

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setIsOpen(false)
    setCameraError("")
  }

  const snapPhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const maxDim = 800
    let w = video.videoWidth || 640
    let h = video.videoHeight || 480
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w)
        w = maxDim
      } else {
        w = Math.round((w * maxDim) / h)
        h = maxDim
      }
    }
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
    onCapture(dataUrl)
    closeCamera()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const maxDim = 800
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        onCapture(dataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div className="crop-photo-section">
      <label className="crop-photo-label">Harvest photo (optional)</label>
      {image ? (
        <div className="crop-photo-preview-card">
          <img src={image} alt="Crop preview" className="crop-preview-img" />
          <div className="crop-preview-info">
            <span className="crop-photo-badge">✓ Photo attached</span>
            <p>Customers will see this real photo of your harvest when browsing.</p>
            <div className="crop-preview-btns">
              <button type="button" className="btn-secondary-sm" onClick={() => setIsOpen(true)}>
                📸 Retake camera photo
              </button>
              <button type="button" className="btn-secondary-sm" onClick={() => fileInputRef.current?.click()}>
                📁 Choose from files
              </button>
              <button type="button" className="btn-danger-sm" onClick={onClear}>
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      ) : isOpen ? (
        <div className="camera-viewfinder-box">
          <div className="camera-viewfinder-header">
            <span>📸 Live Camera Viewfinder</span>
            <button type="button" className="camera-close-x" onClick={closeCamera} aria-label="Close camera">×</button>
          </div>
          {cameraError ? (
            <div className="camera-error-msg">
              <p>{cameraError}</p>
              <button type="button" className="btn-secondary-sm" onClick={() => fileInputRef.current?.click()}>
                📁 Choose image file instead
              </button>
            </div>
          ) : (
            <>
              <div className="camera-video-container">
                <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
                <div className="camera-reticle" />
              </div>
              <div className="camera-controls">
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={() => setFacingMode(prev => (prev === "environment" ? "user" : "environment"))}
                >
                  🔄 Switch Camera
                </button>
                <button type="button" className="camera-shutter-btn" onClick={snapPhoto}>
                  📸 Snap Crop Photo
                </button>
                <button type="button" className="btn-secondary-sm" onClick={closeCamera}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="camera-prompt-box">
          <div className="camera-prompt-content">
            <span className="camera-icon-badge">📷</span>
            <div>
              <b>Add a crop photo with Camera</b>
              <p>Take a live picture of your crops or upload an existing image from your device.</p>
            </div>
          </div>
          <div className="camera-prompt-buttons">
            <button type="button" className="btn-camera-primary" onClick={() => setIsOpen(true)}>
              📸 Open Camera
            </button>
            <button type="button" className="btn-camera-secondary" onClick={() => fileInputRef.current?.click()}>
              📁 Upload file
            </button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  )
}

function App() {
  const [role, setRole] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [listing, setListing] = useState(null)
  const [listings, setListings] = useState([])
  const [listingLoading, setListingLoading] = useState(false)
  const [listingError, setListingError] = useState("")
  const [deleteNotice, setDeleteNotice] = useState("")
  const [listingScope, setListingScope] = useState("my")
  const [cropImage, setCropImage] = useState(null)
  const [customerLocation, setCustomerLocation] = useState(null)
  const [orders, setOrders] = useState([])
  const [buyItem, setBuyItem] = useState(null)
  const [buyQuantity, setBuyQuantity] = useState("")
  const [orderLoading, setOrderLoading] = useState(false)
  const [editingListingId, setEditingListingId] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState(null)

  // Farmer Listing Form States
  const [formCategory, setFormCategory] = useState("Vegetables")
  const [formCrop, setFormCrop] = useState("Tomato")
  const [formVariety, setFormVariety] = useState("")
  const [formCustomVariety, setFormCustomVariety] = useState("")
  const [formGrade, setFormGrade] = useState("FAQ")
  const [formOrganic, setFormOrganic] = useState("Conventional")
  const [formProductionMethod, setFormProductionMethod] = useState("Open Field")
  const [formPackaging, setFormPackaging] = useState("Plastic Crates")
  const [formMinOrder, setFormMinOrder] = useState("")
  const [formQuantity, setFormQuantity] = useState("")
  const [formUnit, setFormUnit] = useState("kg")
  const [formPrice, setFormPrice] = useState("")
  const [formHarvestDate, setFormHarvestDate] = useState("")
  const [formAvailableFrom, setFormAvailableFrom] = useState("")
  const [formExpiryDate, setFormExpiryDate] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formPickup, setFormPickup] = useState(true)
  const [formDelivery, setFormDelivery] = useState(false)
  const [formDeliveryRadius, setFormDeliveryRadius] = useState("")
  const [formLocation, setFormLocation] = useState({
    address: "",
    village: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: ""
  })
  const [addressSearchQuery, setAddressSearchQuery] = useState("")
  const [addressSearchResults, setAddressSearchResults] = useState([])
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [page, setPage] = useState("Home")
  const [lang, setLang] = useState("English")
  const [listed, setListed] = useState(false)
  const [chat, setChat] = useState(false)
  const [msg, setMsg] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [messages, setMessages] = useState(["Namaste 👋 I can help you check official mandi prices, find a mandi, or understand how Farmezy works."])
  const [showRoleAuthModal, setShowRoleAuthModal] = useState(false)
  const [roleAuthError, setRoleAuthError] = useState("")
  const [roleAuthLoading, setRoleAuthLoading] = useState(false)

  // Customer / Buyer Marketplace Filter States
  const [browseSearch, setBrowseSearch] = useState("")
  const [browseCategory, setBrowseCategory] = useState("All Categories")
  const [browseCommodity, setBrowseCommodity] = useState("All Commodities")
  const [browseVariety, setBrowseVariety] = useState("All Varieties")
  const [browseMinPrice, setBrowseMinPrice] = useState("")
  const [browseMaxPrice, setBrowseMaxPrice] = useState("")
  const [browseUnit, setBrowseUnit] = useState("All Units")
  const [browseMinQuantity, setBrowseMinQuantity] = useState("")
  const [browseHarvestFrom, setBrowseHarvestFrom] = useState("")
  const [browseAvailableFrom, setBrowseAvailableFrom] = useState("")
  const [browseExpiry, setBrowseExpiry] = useState("all") // "all", "today", "3days", "7days", "custom"
  const [browseCustomDate, setBrowseCustomDate] = useState("")
  const [browseDistance, setBrowseDistance] = useState("all") // "all", "near_me", "5", "10", "25", "50", "100"
  const [browseDelivery, setBrowseDelivery] = useState("All Options") // "All Options", "Delivery Available", "Delivery Not Available"
  const [browsePickup, setBrowsePickup] = useState("All Options") // "All Options", "Pickup Available", "Pickup Not Available"
  const [browseState, setBrowseState] = useState("All States")
  const [browseDistrict, setBrowseDistrict] = useState("All Districts")
  const [browseCity, setBrowseCity] = useState("All Cities")
  const [browsePincode, setBrowsePincode] = useState("")
  const [browseGrade, setBrowseGrade] = useState("All Grades")
  const [browseOrganic, setBrowseOrganic] = useState("All")
  const [browseProductionMethod, setBrowseProductionMethod] = useState("All Methods")
  const [browsePackaging, setBrowsePackaging] = useState("All Packaging")
  const [browseSort, setBrowseSort] = useState("newest")

  const [greeting, setGreeting] = useState(() => getTimeGreeting(lang))

  useEffect(() => {
    setGreeting(getTimeGreeting(lang))
    const timer = setInterval(() => {
      setGreeting(getTimeGreeting(lang))
    }, 60000)
    return () => clearInterval(timer)
  }, [lang])

  const t = (key) => {
    if (key === "greeting") return greeting || getTimeGreeting(lang)
    return translations[lang]?.[key] || translations.English[key] || key
  }

  // Supabase Authentication & Session Management
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) {
        const meta = session.user.user_metadata || {}
        const userRole = meta.role || "Farmer"
        setRole(userRole)
        setProfile({
          id: session.user.id,
          email: session.user.email,
          farmerId: meta.farmerId || (userRole === "Farmer" ? "farmer-" + session.user.id.slice(0, 8) : undefined),
          customerId: meta.customerId || (userRole === "Customer" ? "customer-" + session.user.id.slice(0, 8) : undefined),
          ...meta
        })
      }
      setAuthLoading(false)
    }).catch(() => {
      if (mounted) setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {}
        const userRole = meta.role || "Farmer"
        setRole(userRole)
        setProfile({
          id: session.user.id,
          email: session.user.email,
          farmerId: meta.farmerId || (userRole === "Farmer" ? "farmer-" + session.user.id.slice(0, 8) : undefined),
          customerId: meta.customerId || (userRole === "Customer" ? "customer-" + session.user.id.slice(0, 8) : undefined),
          ...meta
        })
      } else {
        setRole(null)
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setRole(null)
    setProfile(null)
    setPage("Home")
  }

  useEffect(() => {
    if (!role) return
    setListingLoading(true)
    fetch("/api/listings")
      .then(response => response.json().then(data => {
        if (!response.ok) throw new Error(data.error || "Could not load listings.")
        setListings(Array.isArray(data.listings) ? data.listings : [])
      }))
      .catch(error => setListingError(error.message))
      .finally(() => setListingLoading(false))
  }, [role])

  const farmerId = profile?.farmerId || profile?.phone?.replace(/\D/g, "") || profile?.name || "farmer"
  const customerId = profile?.customerId || profile?.phone?.replace(/\D/g, "") || profile?.name || "customer"

  const loadOrders = async () => {
    try {
      const params = role === "Farmer" ? "farmerId=" + encodeURIComponent(farmerId) : "customerId=" + encodeURIComponent(customerId)
      const response = await fetch("/api/orders?" + params)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load orders.")
      setOrders(Array.isArray(data.orders) ? data.orders.map(order => ({ ...order, status: order.status === "new" ? "Requested" : order.status })) : [])
    } catch (error) {
      setListingError(error.message)
    }
  }

  useEffect(() => {
    if (role) {
      loadOrders()
    }
  }, [role])

  const deleteListing = async (id, cropName) => {
    if (!window.confirm(`Are you sure you want to delete the listing for "${cropName}"? This action cannot be undone.`)) {
      return
    }
    setListingLoading(true)
    setListingError("")
    try {
      const response = await fetch("/api/listings/" + id, { method: "DELETE" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not delete listing.")
      setListings(prev => prev.filter(item => String(item.id) !== String(id)))
      if (listing?.id === id) {
        setListing(null)
        setListed(false)
      }
      setDeleteNotice(`Listing for "${cropName}" was deleted successfully.`)
      setTimeout(() => setDeleteNotice(""), 4500)
    } catch (error) {
      setListingError(error.message)
    } finally {
      setListingLoading(false)
    }
  }

  const locateCustomer = () => {
    if (!navigator.geolocation) {
      setListingError("Location is not supported by this browser.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        setListingError("")
        setCustomerLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
      },
      () => setListingError("Location access was blocked. You can still browse and contact farmers.")
    )
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: "warning",
        message: "Geolocation is not supported by your browser. Please enter your address manually."
      })
      return
    }

    setLocating(true)
    setLocationStatus({
      type: "info",
      message: "Getting your location..."
    })

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setLocationStatus({
          type: "info",
          message: "Finding your address..."
        })

        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`)
          const data = res.ok ? await res.json() : null
          if (data && data.success) {
            const resolvedVillage = (data.village || data.locality || "").trim()
            const resolvedCity = (data.city || data.town || "").trim()
            const resolvedDistrict = (data.district || "").trim()
            const resolvedState = (data.state || "").trim()
            const resolvedPincode = (data.pincode || "").trim()

            const parts = [
              resolvedVillage,
              resolvedCity && resolvedCity !== resolvedVillage ? resolvedCity : null,
              resolvedDistrict,
              resolvedState,
              resolvedPincode
            ].filter(Boolean)

            const resolvedAddress = (data.address && data.address.trim())
              ? data.address.trim()
              : parts.join(", ")

            const hasPopulatedData = Boolean(resolvedAddress || resolvedState || resolvedDistrict || resolvedCity || resolvedVillage || resolvedPincode)

            if (hasPopulatedData) {
              setFormLocation({
                address: resolvedAddress,
                village: resolvedVillage || resolvedCity,
                city: resolvedCity || resolvedVillage,
                district: resolvedDistrict,
                state: resolvedState,
                pincode: resolvedPincode,
                latitude: String(lat),
                longitude: String(lng)
              })
              setAddressSearchResults([])
              setAddressSearchQuery("")
              setLocationStatus({
                type: "success",
                message: "✓ Address filled successfully! Please review and confirm your details below."
              })
            } else {
              setFormLocation(prev => ({
                ...prev,
                latitude: String(lat),
                longitude: String(lng)
              }))
              setLocationStatus({
                type: "warning",
                message: "Coordinates detected, but address lookup could not resolve fields. Please enter your address manually."
              })
            }
          } else {
            setFormLocation(prev => ({
              ...prev,
              latitude: String(lat),
              longitude: String(lng)
            }))
            setLocationStatus({
              type: "warning",
              message: "Coordinates detected, but address lookup could not resolve all fields. Please enter your address details manually."
            })
          }
        } catch (err) {
          setFormLocation(prev => ({
            ...prev,
            latitude: String(lat),
            longitude: String(lng)
          }))
          setLocationStatus({
            type: "warning",
            message: "Coordinates detected, but address lookup could not resolve all fields. Please enter your address details manually."
          })
        } finally {
          setLocating(false)
        }
      },
      error => {
        setLocating(false)
        let msg = "Could not retrieve location. Please check browser permissions or enter address manually."
        if (error.code === 1) msg = "Location permission denied. Please allow location access in your browser or type your address manually."
        else if (error.code === 2) msg = "Location unavailable. Please enter your address manually."
        else if (error.code === 3) msg = "Location request timed out. Please try again or enter your address manually."
        setLocationStatus({ type: "warning", message: msg })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSearchAddress = async query => {
    const q = (query || "").trim()
    if (!q || q.length < 2) {
      setAddressSearchResults([])
      return
    }
    setSearchingAddress(true)
    try {
      const res = await fetch(`/api/address-search?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setAddressSearchResults(data.results || [])
      }
    } catch (e) {
      // ignore network errors for typeahead
    } finally {
      setSearchingAddress(false)
    }
  }

  const applySelectedAddress = item => {
    if (!item) return
    const lat = item.latitude ? String(item.latitude) : ""
    const lng = item.longitude ? String(item.longitude) : ""
    const village = (item.village || item.city || "").trim()
    const city = (item.city || item.village || "").trim()
    const district = (item.district || "").trim()
    const state = (item.state || "").trim()
    const pincode = (item.pincode || "").trim()
    const fullAddress = (item.address || [village, city !== village ? city : null, district, state, pincode].filter(Boolean).join(", ")).trim()

    setFormLocation({
      address: fullAddress,
      village,
      city,
      district,
      state,
      pincode,
      latitude: lat,
      longitude: lng
    })

    setLocationStatus({
      type: "success",
      message: `✓ Address auto-populated from ${city || district || "selected location"}! Please review and confirm your details below.`
    })
  }

  const startEditListing = item => {
    setEditingListingId(item.id)
    setCropImage(item.image || null)
    setFormCategory(item.category || getCategoryForCrop(item.crop) || "Vegetables")
    setFormCrop(item.crop || "")
    setFormVariety(item.variety || "")
    setFormCustomVariety("")
    setFormGrade(item.grade || "FAQ")
    setFormOrganic(item.organic || "Conventional")
    setFormProductionMethod(item.productionMethod || "Open Field")
    setFormPackaging(item.packaging || "Plastic Crates")
    setFormMinOrder(item.minOrder || "")
    setFormQuantity(item.quantity || "")
    setFormUnit(item.unit || "kg")
    setFormPrice(item.price || "")
    setFormHarvestDate(item.harvestDate || "")
    setFormAvailableFrom(item.availableFrom || "")
    setFormExpiryDate(item.expiryDate || item.date || "")
    setFormNotes(item.notes || item.description || "")
    setFormPickup(item.pickupAvailable !== undefined ? Boolean(item.pickupAvailable) : true)
    setFormDelivery(Boolean(item.deliveryAvailable))
    setFormDeliveryRadius(item.deliveryRadius || "")
    setFormLocation({
      address: item.address || "",
      village: item.village || item.locality || "",
      city: item.city || "",
      district: item.district || item.farmerDistrict || "",
      state: item.state || item.farmerState || "",
      pincode: item.pincode || "",
      latitude: item.latitude || item.farmerLat || "",
      longitude: item.longitude || item.farmerLng || ""
    })
    setLocationStatus(
      (item.latitude || item.farmerLat) && (item.longitude || item.farmerLng)
        ? {
            type: "info",
            message: `Existing coordinates on file (${Number(item.latitude || item.farmerLat).toFixed(4)}, ${Number(item.longitude || item.farmerLng).toFixed(4)}). Click "📍 Use My Current Location" to re-detect.`
          }
        : null
    )
    setListed(false)
    const formEl = document.querySelector(".form-panel")
    if (formEl) formEl.scrollIntoView({ behavior: "smooth" })
  }

  const cancelEditListing = () => {
    setEditingListingId(null)
    setCropImage(null)
    setFormCategory("Vegetables")
    setFormCrop("Tomato")
    setFormVariety("")
    setFormCustomVariety("")
    setFormGrade("FAQ")
    setFormOrganic("Conventional")
    setFormProductionMethod("Open Field")
    setFormPackaging("Plastic Crates")
    setFormMinOrder("")
    setFormQuantity("")
    setFormUnit("kg")
    setFormPrice("")
    setFormHarvestDate("")
    setFormAvailableFrom("")
    setFormExpiryDate("")
    setFormNotes("")
    setFormPickup(true)
    setFormDelivery(false)
    setFormDeliveryRadius("")
    setFormLocation({
      address: "",
      village: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: ""
    })
    setLocationStatus(null)
  }

  const distanceKm = (lat1, lng1, lat2, lng2) => {
    if ([lat1, lng1, lat2, lng2].some(value => value === undefined || value === null || value === "")) return null
    const R = 6371
    const toRad = value => value * Math.PI / 180
    const dLat = toRad(Number(lat2) - Number(lat1))
    const dLng = toRad(Number(lng2) - Number(lng1))
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const formatDistance = (km) => {
    if (km === null || km === undefined || Number.isNaN(km)) return null
    if (km < 0.3) return `📍 At pickup location (< 300m)`
    if (km < 1.0) return `📍 ${t("nearby")}`
    return `📍 ${km.toFixed(1)} ${t("kmAway")}`
  }

  const availableStates = Array.from(new Set([
    "All States",
    ...listings.map(l => l.state || l.farmerState).filter(Boolean),
    ...INDIAN_STATES.slice(1)
  ]))

  const availableDistricts = Array.from(new Set([
    "All Districts",
    ...listings
      .filter(l => browseState === "All States" || [l.state, l.farmerState, l.address].some(s => s && String(s).toLowerCase().includes(browseState.toLowerCase())))
      .flatMap(l => [
        l.district,
        l.farmerDistrict,
        l.address && l.address.toLowerCase().includes("chittoor") ? "Chittoor" : null
      ])
      .filter(Boolean)
  ])).sort()

  const availableCities = Array.from(new Set([
    "All Cities",
    ...listings
      .filter(l => {
        if (browseState !== "All States" && ![l.state, l.farmerState, l.address].some(s => s && String(s).toLowerCase().includes(browseState.toLowerCase()))) return false
        if (browseDistrict !== "All Districts" && ![l.district, l.farmerDistrict, l.address].some(d => d && String(d).toLowerCase().includes(browseDistrict.toLowerCase()))) return false
        return true
      })
      .map(l => l.city)
      .filter(Boolean)
  ])).sort()

  const availableGrades = Array.from(new Set([
    "All Grades",
    ...listings.map(l => l.grade).filter(Boolean),
    "FAQ", "Grade A", "Grade B", "Grade C", "Premium", "Export Quality", "Local"
  ]))

  const availableUnits = Array.from(new Set([
    "All Units",
    ...listings.map(l => l.unit).filter(Boolean),
    "kg", "quintal", "tonne", "crate", "bag", "box"
  ]))

  const availableOrganic = Array.from(new Set([
    "All",
    "Organic Only",
    "Conventional Only",
    ...listings.map(l => l.organic).filter(Boolean)
  ]))

  const availableProductionMethods = Array.from(new Set([
    "All Methods",
    ...listings.map(l => l.productionMethod).filter(Boolean),
    "Open Field", "Greenhouse / Polyhouse", "Hydroponic", "Shade Net", "Traditional / Natural"
  ]))

  const availablePackaging = Array.from(new Set([
    "All Packaging",
    ...listings.map(l => l.packaging).filter(Boolean),
    "Plastic Crates", "Gunny Bags", "Boxes", "Mesh Bags", "Loose", "Vacuum Pack"
  ]))

  // Official commodities from AGMARKNET catalogue
  const allOfficialCommodities = agmarknetCatalogue?.commodities || []

  // Commodity options for Marketplace Filter (existing listed crops + official commodities)
  const marketplaceCommodities = Array.from(new Set([
    "All Commodities",
    ...listings.map(l => l.crop).filter(Boolean),
    ...(browseCategory && browseCategory !== "All Categories"
      ? allOfficialCommodities.filter(c => (c.category || c.group_name || "").toLowerCase() === browseCategory.toLowerCase()).map(c => c.name)
      : allOfficialCommodities.map(c => c.name))
  ])).sort((a, b) => (a === "All Commodities" ? -1 : b === "All Commodities" ? 1 : a.localeCompare(b)))

  // Variety options for Marketplace Filter
  const selectedMarketplaceCommodityObj = allOfficialCommodities.find(c =>
    (c.name || "").toLowerCase() === browseCommodity.toLowerCase() ||
    (c.display_name && c.display_name.toLowerCase() === browseCommodity.toLowerCase())
  )
  const officialVarietiesForMarketplace = selectedMarketplaceCommodityObj
    ? (selectedMarketplaceCommodityObj.varieties || []).map(v => typeof v === "string" ? v : v.name).filter(Boolean)
    : []
  const listedVarietiesForMarketplace = listings
    .filter(l => browseCommodity === "All Commodities" || (l.crop || "").toLowerCase() === browseCommodity.toLowerCase())
    .map(l => l.variety)
    .filter(Boolean)

  const marketplaceVarieties = Array.from(new Set([
    "All Varieties",
    ...officialVarietiesForMarketplace,
    ...listedVarietiesForMarketplace
  ])).sort((a, b) => (a === "All Varieties" ? -1 : b === "All Varieties" ? 1 : a.localeCompare(b)))

  // Matched commodity object in official catalogue for the farmer form
  const selectedFormCommodityObj = allOfficialCommodities.find(c =>
    (c.name || "").toLowerCase() === (formCrop || "").trim().toLowerCase() ||
    (c.display_name && c.display_name.toLowerCase() === (formCrop || "").trim().toLowerCase()) ||
    (c.agmarknet_name && c.agmarknet_name.toLowerCase() === (formCrop || "").trim().toLowerCase())
  )

  const registeredFormVarieties = selectedFormCommodityObj
    ? (selectedFormCommodityObj.variety_names || (selectedFormCommodityObj.varieties || []).map(v => typeof v === "string" ? v : v.name)).filter(Boolean)
    : []

  const registeredFormGrades = selectedFormCommodityObj?.grades?.length
    ? selectedFormCommodityObj.grades
    : ["FAQ", "Grade A", "Grade B", "Grade C", "Local", "Export Quality", "Premium"]

  const clearFilters = () => {
    setBrowseSearch("")
    setBrowseCategory("All Categories")
    setBrowseCommodity("All Commodities")
    setBrowseVariety("All Varieties")
    setBrowseGrade("All Grades")
    setBrowseMinQuantity("")
    setBrowseMinPrice("")
    setBrowseMaxPrice("")
    setBrowseUnit("All Units")
    setBrowseHarvestFrom("")
    setBrowseAvailableFrom("")
    setBrowseExpiry("all")
    setBrowseCustomDate("")
    setBrowseOrganic("All")
    setBrowseProductionMethod("All Methods")
    setBrowsePackaging("All Packaging")
    setBrowseDelivery("All Options")
    setBrowsePickup("All Options")
    setBrowseState("All States")
    setBrowseDistrict("All Districts")
    setBrowseCity("All Cities")
    setBrowsePincode("")
    setBrowseDistance("all")
    setBrowseSort("newest")
  }

  const hasActiveFilters = Boolean(
    browseSearch.trim() ||
    (browseCategory && browseCategory !== "All Categories") ||
    (browseCommodity && browseCommodity !== "All Commodities") ||
    (browseVariety && browseVariety !== "All Varieties") ||
    (browseGrade && browseGrade !== "All Grades") ||
    browseMinQuantity !== "" ||
    browseMinPrice !== "" ||
    browseMaxPrice !== "" ||
    (browseUnit && browseUnit !== "All Units") ||
    browseHarvestFrom !== "" ||
    browseAvailableFrom !== "" ||
    browseExpiry !== "all" ||
    browseCustomDate ||
    (browseOrganic && browseOrganic !== "All") ||
    (browseProductionMethod && browseProductionMethod !== "All Methods") ||
    (browsePackaging && browsePackaging !== "All Packaging") ||
    (browseDelivery && browseDelivery !== "All Options") ||
    (browsePickup && browsePickup !== "All Options") ||
    (browseState && browseState !== "All States") ||
    (browseDistrict && browseDistrict !== "All Districts" && browseDistrict.trim() !== "") ||
    (browseCity && browseCity !== "All Cities" && browseCity.trim() !== "") ||
    browsePincode.trim() !== "" ||
    browseDistance !== "all"
  )

  const filteredMarketplaceListings = listings.filter(item => {
    // 0. Expired listings must not appear as active listings
    const itemExpiry = item.expiryDate || item.date
    if (isListingExpired(itemExpiry)) return false

    // Search query (crop name, variety, notes, description, farmer name, address, village, city, district, state)
    if (browseSearch.trim()) {
      const q = browseSearch.toLowerCase().trim()
      const match = [
        item.crop,
        item.variety,
        item.grade,
        item.organic,
        item.productionMethod,
        item.packaging,
        item.farmerName,
        item.address,
        item.village,
        item.city,
        item.district,
        item.farmerDistrict,
        item.state,
        item.farmerState,
        item.pincode,
        item.notes,
        item.description
      ].some(val => val && String(val).toLowerCase().includes(q))
      if (!match) return false
    }

    // 1. Crop category
    if (browseCategory && browseCategory !== "All Categories") {
      const cat = item.category || getCategoryForCrop(item.crop)
      if (!cat || cat.toLowerCase() !== browseCategory.toLowerCase()) return false
    }

    // 2. Commodity / Crop
    if (browseCommodity && browseCommodity !== "All Commodities") {
      if ((item.crop || "").toLowerCase() !== browseCommodity.toLowerCase()) return false
    }

    // 3. Variety
    if (browseVariety && browseVariety !== "All Varieties") {
      if (!item.variety || !item.variety.toLowerCase().includes(browseVariety.toLowerCase())) return false
    }

    // 4. Grade / Quality (Empty Data Rule: missing grade must NOT match)
    if (browseGrade && browseGrade !== "All Grades") {
      if (!item.grade || !item.grade.toLowerCase().includes(browseGrade.toLowerCase())) return false
    }

    // 5. Available quantity (Min available qty - Empty Data Rule)
    if (browseMinQuantity !== "") {
      const minQty = Number(browseMinQuantity)
      if (Number.isFinite(minQty)) {
        if (item.quantity === undefined || item.quantity === null || item.quantity === "") return false
        if (Number(item.quantity) < minQty) return false
      }
    }

    // 6. Price range
    if (browseMinPrice !== "" && Number.isFinite(Number(browseMinPrice))) {
      if (item.price === undefined || item.price === null || item.price === "") return false
      if (Number(item.price) < Number(browseMinPrice)) return false
    }
    if (browseMaxPrice !== "" && Number.isFinite(Number(browseMaxPrice))) {
      if (item.price === undefined || item.price === null || item.price === "") return false
      if (Number(item.price) > Number(browseMaxPrice)) return false
    }

    // 7. Unit of measurement
    if (browseUnit && browseUnit !== "All Units") {
      if (String(item.unit || "").toLowerCase() !== browseUnit.toLowerCase()) return false
    }

    // 8. Harvest date (Harvested on or after - Empty Data Rule)
    if (browseHarvestFrom) {
      if (!item.harvestDate || item.harvestDate < browseHarvestFrom) return false
    }

    // 9. Available-from date (Available on or before - Empty Data Rule)
    if (browseAvailableFrom) {
      if (!item.availableFrom || item.availableFrom > browseAvailableFrom) return false
    }

    // 10. Expiry filter
    if (browseExpiry && browseExpiry !== "all") {
      if (!itemExpiry) return false
      if (browseExpiry === "today") {
        if (!isExpiringToday(itemExpiry)) return false
      } else if (browseExpiry === "3days") {
        if (!isExpiringWithinDays(itemExpiry, 3)) return false
      } else if (browseExpiry === "7days") {
        if (!isExpiringWithinDays(itemExpiry, 7)) return false
      } else if (browseExpiry === "custom" && browseCustomDate) {
        if (!isBeforeCustomDate(itemExpiry, browseCustomDate)) return false
      }
    }

    // 11. Organic / Conventional (Empty Data Rule: missing organic must NOT match)
    if (browseOrganic && browseOrganic !== "All") {
      if (!item.organic) return false
      if (browseOrganic === "Organic Only") {
        if (!/organic|natural|jaivik/i.test(item.organic)) return false
      } else if (browseOrganic === "Conventional Only") {
        if (!/conventional/i.test(item.organic)) return false
      } else {
        if (item.organic.toLowerCase() !== browseOrganic.toLowerCase()) return false
      }
    }

    // 12. Production Method (Empty Data Rule: missing method must NOT match)
    if (browseProductionMethod && browseProductionMethod !== "All Methods") {
      if (!item.productionMethod || item.productionMethod.toLowerCase() !== browseProductionMethod.toLowerCase()) return false
    }

    // 13. Packaging Type (Empty Data Rule: missing packaging must NOT match)
    if (browsePackaging && browsePackaging !== "All Packaging") {
      if (!item.packaging || !item.packaging.toLowerCase().includes(browsePackaging.toLowerCase())) return false
    }

    // 14. Delivery Availability
    if (browseDelivery && browseDelivery !== "All Options") {
      if (browseDelivery === "Delivery Available") {
        if (!item.deliveryAvailable) return false
      } else if (browseDelivery === "Delivery Not Available") {
        if (item.deliveryAvailable) return false
      }
    }

    // 15. Pickup Availability
    if (browsePickup && browsePickup !== "All Options") {
      if (browsePickup === "Pickup Available") {
        if (item.pickupAvailable === false) return false
      } else if (browsePickup === "Pickup Not Available") {
        if (item.pickupAvailable !== false) return false
      }
    }

    // 16. State
    if (browseState && browseState !== "All States") {
      const qState = browseState.toLowerCase()
      const stateMatch = [item.state, item.farmerState, item.address].some(val => val && String(val).toLowerCase().includes(qState))
      if (!stateMatch) return false
    }

    // 17. District
    if (browseDistrict && browseDistrict !== "All Districts" && browseDistrict.trim() !== "") {
      const qDist = browseDistrict.toLowerCase().trim()
      const districtMatch = [item.district, item.farmerDistrict, item.city, item.village, item.address].some(val => val && String(val).toLowerCase().includes(qDist))
      if (!districtMatch) return false
    }

    // 18. City (Empty Data Rule)
    if (browseCity && browseCity !== "All Cities" && browseCity.trim() !== "") {
      const qCity = browseCity.toLowerCase().trim()
      const cityMatch = [item.city, item.village, item.locality, item.address].some(val => val && String(val).toLowerCase().includes(qCity))
      if (!cityMatch) return false
    }

    // 19. PIN Code (Empty Data Rule)
    if (browsePincode.trim() !== "") {
      const qPin = browsePincode.trim()
      const pinMatch = [item.pincode, item.address].some(val => val && String(val).includes(qPin))
      if (!pinMatch) return false
    }

    // 20. Distance / Delivery Radius
    if (browseDistance && browseDistance !== "all") {
      const itemLat = item.latitude || item.farmerLat
      const itemLng = item.longitude || item.farmerLng
      if (!itemLat || !itemLng) return false
      if (customerLocation && customerLocation.lat && customerLocation.lng) {
        const km = distanceKm(customerLocation.lat, customerLocation.lng, itemLat, itemLng)
        if (km === null) return false
        const maxKm = browseDistance === "near_me" ? 15 : Number(browseDistance)
        if (Number.isFinite(maxKm) && km > maxKm) return false
      }
    }

    return true
  }).sort((a, b) => {
    if (browseSort === "price_asc") {
      return Number(a.price || 0) - Number(b.price || 0)
    }
    if (browseSort === "price_desc") {
      return Number(b.price || 0) - Number(a.price || 0)
    }
    if (browseSort === "expiry_asc") {
      const timeA = a.date ? new Date(a.date).getTime() : Infinity
      const timeB = b.date ? new Date(b.date).getTime() : Infinity
      return timeA - timeB
    }
    // default: "newest"
    const timeA = new Date(a.createdAt || Number(a.id) || 0).getTime()
    const timeB = new Date(b.createdAt || Number(b.id) || 0).getTime()
    return timeB - timeA
  })

  const contactPhone = item => item?.farmerPhone || item?.contact?.phone || item?.contact?.whatsapp || item?.phone || ""
  const whatsappNumber = phone => {
    let digits = String(phone || "").replace(/\D/g, "")
    if (!digits) return ""
    if (digits.startsWith("00")) digits = digits.slice(2)
    if (digits.startsWith("91") && digits.length === 12) return digits
    if (digits.length === 10) return "91" + digits
    return digits
  }
  const whatsappUrl = (phone, text = "") => {
    const number = whatsappNumber(phone)
    return number ? "https://wa.me/" + number + (text ? "?text=" + encodeURIComponent(text) : "") : ""
  }
  const phoneUrl = phone => {
    const digits = String(phone || "").replace(/\D/g, "")
    if (!digits) return ""
    return digits.length === 10 ? "tel:+91" + digits : digits.startsWith("91") ? "tel:+" + digits : "tel:+" + digits
  }
  const routeUrl = item => {
    const lat = item.latitude || item.farmerLat
    const lng = item.longitude || item.farmerLng
    const hasCoords = lat !== undefined && lat !== "" && lng !== undefined && lng !== ""
    const destination = hasCoords ? encodeURIComponent(String(lat) + "," + String(lng)) : encodeURIComponent(String(item.address || ""))
    if (!destination) return ""
    const origin = customerLocation ? encodeURIComponent(customerLocation.lat + "," + customerLocation.lng) : "Current+Location"
    return "https://www.google.com/maps/dir/?api=1&origin=" + origin + "&destination=" + destination + "&travelmode=driving"
  }

  // Show Supabase Auth Screen if not logged in
  if (authLoading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#36794c" }}>Connecting to Farmezy…</div>
  }

  if (!role || !profile) {
    return (
      <SupabaseAuthScreen
        lang={lang}
        setLang={setLang}
        t={t}
        onAuthorized={(userRole, userProfile) => {
          setRole(userRole)
          setProfile(userProfile)
        }}
      />
    )
  }

  const myListings = listings.filter(item =>
    item.farmerId === farmerId ||
    (profile?.phone && item.farmerPhone && String(item.farmerPhone).replace(/\D/g, "") === String(profile.phone).replace(/\D/g, "")) ||
    (profile?.name && item.farmerName && item.farmerName.trim().toLowerCase() === profile.name.trim().toLowerCase())
  )

  const displayedFarmerListings = listingScope === "all" ? listings : myListings

  const nav = [
    [t("home"), "Home", "⌂"],
    [t("prices"), "Prices", "↗"],
    ...(role === "Farmer" ? [[t("outlook"), "Forecast", "◷"]] : []),
    [t("mandi"), "Mandi", "⌖"],
    ...(role === "Farmer" ? [[t("sell"), "Sell", "+"]] : [[t("browse"), "Browse", "🧺"]]),
    ...(role === "Farmer" ? [[t("requests"), "Requests", "✓"]] : [[t("myRequests"), "Orders", "▣"]])
  ]

  const askPrice = async question => {
    const text = question.trim()
    if (!text) return
    setMessages(current => [...current, text])
    setChatLoading(true)
    const reply = await getOfficialPriceAnswer(text, profile)
    setMessages(current => [...current, reply])
    setChatLoading(false)
  }

  const updateOrder = async (id, status) => {
    try {
      const response = await fetch("/api/orders/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not update order.")
      setOrders(current => current.map(order => order.id === id ? data.order : order))
    } catch (error) {
      setListingError(error.message)
    }
  }

  const send = e => {
    e.preventDefault()
    const question = msg.trim()
    if (!question) return
    setMsg("")
    askPrice(question)
  }

  const handleFarmerRoleClick = () => {
    if (role === "Farmer") {
      setPage("Home")
      return
    }
    // Authorization check: User signed in as Customer trying to switch to Farmer
    if (profile?.role === "Farmer") {
      setRole("Farmer")
      setPage("Home")
    } else {
      setShowRoleAuthModal(true)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={e => { e.preventDefault(); setPage("Home") }}>
          <span className="brand-mark">f</span>farmezy<span className="brand-dot">.</span>
        </a>

        <div className="side-label">{t("yourWorkspace")}</div>
        <div className="role-switch">
          <button
            className={role === "Farmer" ? "active" : ""}
            onClick={handleFarmerRoleClick}
            title={role === "Farmer" ? "Currently in Farmer workspace" : "Switch to Farmer workspace (requires authorization)"}
          >
            🌾 <span className="role-text">{t("farmer")}</span>
          </button>
          <button
            className={role === "Customer" ? "active" : ""}
            onClick={() => { setRole("Customer"); setPage("Home") }}
            title="Switch to Customer workspace"
          >
            🧺 <span className="role-text">{t("customer")}</span>
          </button>
        </div>

        <div className="side-label menu-label">{t("menu")}</div>
        <nav>
          {nav.map(([label, id, icon]) => (
            <button key={id} className={page === id ? "selected" : ""} onClick={() => setPage(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <b>✳ &nbsp; {t("needHelp")}</b>
            <p>{t("askFarmezy")}</p>
            <button onClick={() => setChat(true)}>{t("chatWithUs")} ↗</button>
          </div>
          <div className="profile" style={{ flexWrap: "wrap", gap: 8 }}>
            <span className="avatar">{role === "Farmer" ? "🌾" : "🧺"}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.name || role}
              </b>
              <small>{profile?.district ? profile.district + ", " + profile.state : "India"}</small>
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-danger-sm"
              style={{ fontSize: 9, padding: "3px 6px", alignSelf: "center" }}
              title="Sign out of Supabase"
            >
              {t("logOut")}
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>Workspace <span>/</span> <b>{page === "Home" ? t("home") : nav.find(n => n[1] === page)?.[0]}</b></div>
          <div className="top-tools">
            <span className="supabase-pill" title="Supabase User Authorization Active">
              ⚡ {role}: {profile?.email || profile?.name}
            </span>
            <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language">
              {Object.keys(translations).map(x => <option key={x} value={x}>{x}</option>)}
            </select>
            <button className="link" onClick={handleSignOut} style={{ fontSize: 11 }}>{t("signOut")}</button>
            <span className="avatar">{role === "Farmer" ? "🌾" : "AS"}</span>
          </div>
        </header>

        {showRoleAuthModal && (
          <div className="auth-modal-overlay">
            <div className="auth-modal-card">
              <div className="auth-modal-header">
                <div>
                  <h3>🌾 Farmer Authorization Required</h3>
                  <p>You are signed in as a Customer: <b>{profile?.name || profile?.email}</b></p>
                </div>
                <button
                  type="button"
                  className="auth-modal-close"
                  onClick={() => { setShowRoleAuthModal(false); setRoleAuthError("") }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="auth-modal-body">
                <p>
                  Access to the <b>Farmer Workspace</b> allows listing harvests with real camera photos, setting wholesale prices, and managing buyer orders. Please authenticate as a Farmer to proceed.
                </p>

                {roleAuthError && <div className="auth-error-banner" style={{ marginBottom: 12 }}>⚠ {roleAuthError}</div>}

                <div className="auth-modal-options">
                  <div className="auth-modal-option">
                    <b>Option 1: Enable Farmer Role on this Account</b>
                    <p>Upgrade your current profile ({profile?.email}) to have Farmer listing privileges.</p>
                    <button
                      type="button"
                      className="btn-action-buy"
                      style={{ width: "100%", justifyContent: "center", padding: "10px" }}
                      disabled={roleAuthLoading}
                      onClick={async () => {
                        setRoleAuthLoading(true)
                        setRoleAuthError("")
                        try {
                          const farmerId = "farmer-" + (profile.id ? profile.id.slice(0, 8) : Date.now())
                          await supabase.auth.updateUser({ data: { role: "Farmer", farmerId } })
                          setRole("Farmer")
                          setProfile(prev => ({ ...prev, role: "Farmer", farmerId }))
                          setShowRoleAuthModal(false)
                          setPage("Home")
                        } catch (err) {
                          setRoleAuthError(err.message || "Failed to update role.")
                        } finally {
                          setRoleAuthLoading(false)
                        }
                      }}
                    >
                      {roleAuthLoading ? "Authorizing…" : "🌾 Authorize & Switch to Farmer"}
                    </button>
                  </div>

                  <div className="auth-modal-divider"><span>OR</span></div>

                  <div className="auth-modal-option">
                    <b>Option 2: Switch to Farmer Account</b>
                    <p>Log in with the verified Demo Farmer credentials (Ramesh Farmer).</p>
                    <button
                      type="button"
                      className="btn-secondary-sm"
                      style={{ width: "100%", padding: "10px", justifyContent: "center" }}
                      disabled={roleAuthLoading}
                      onClick={async () => {
                        setRoleAuthLoading(true)
                        setRoleAuthError("")
                        try {
                          const { data, error } = await supabase.auth.signInWithPassword({
                            email: "farmer@farmezy.in",
                            password: "farmer123"
                          })
                          if (error) throw error
                          if (data?.user) {
                            const meta = data.user.user_metadata || {}
                            setRole("Farmer")
                            setProfile({
                              id: data.user.id,
                              email: data.user.email,
                              farmerId: meta.farmerId || "farmer-" + data.user.id.slice(0, 8),
                              ...meta
                            })
                            setShowRoleAuthModal(false)
                            setPage("Home")
                          }
                        } catch (err) {
                          setRoleAuthError(err.message || "Could not sign in with farmer account.")
                        } finally {
                          setRoleAuthLoading(false)
                        }
                      }}
                    >
                      ⚡ Quick Login: Demo Farmer (Ramesh)
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 14, textAlign: "right" }}>
                  <button
                    type="button"
                    className="link"
                    style={{ fontSize: 12 }}
                    onClick={() => { setShowRoleAuthModal(false); setRoleAuthError("") }}
                  >
                    Cancel and remain as Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="page">
          {page === "Home" && (
            <>
              <div className="welcome">
                <div>
                  <div className="eyebrow">{t("greeting")}, {profile?.name || (role === "Farmer" ? "Farmer" : "Customer")} *</div>
                  <h1>{role === "Farmer" ? t("welcomeTitleFarmer") : t("welcomeTitleCustomer")}</h1>
                  <p>
                    {role === "Farmer" ? t("welcomeSubFarmer") : t("welcomeSubCustomer")}
                  </p>
                </div>
              </div>

              {deleteNotice && <div className="delete-notification">✓ {deleteNotice}</div>}

              <section className="workspace-hero">
                <div>
                  <span className="hero-tag">{role === "Farmer" ? "FARMER WORKSPACE" : "CUSTOMER MARKETPLACE"}</span>
                  <h2>{role === "Farmer" ? "Ready to list a crop?" : "Find the right market price."}</h2>
                  <p>
                    {role === "Farmer"
                      ? "Add crop, photo from your camera, variety, quantity, price, harvest date, and pickup location. Your listings are saved to the Farmezy server so customers can browse them."
                      : "Search reported commodity prices by state, district, and mandi. Rates are shown as reported by AGMARKNET."}
                  </p>
                  <button onClick={() => setPage(role === "Farmer" ? "Sell" : "Browse")}>
                    {role === "Farmer" ? "Add crops for sale" : "Browse farmer produce"} →
                  </button>
                </div>
                <span className="workspace-art">{role === "Farmer" ? "🌾" : "🧺"}</span>
              </section>

              {role === "Farmer" ? (
                <section className="panel inventory-preview">
                  <div className="panel-head">
                    <div>
                      <h3>My crop listings</h3>
                      <p>{myListings.length} crop{myListings.length === 1 ? "" : "s"} on your account</p>
                    </div>
                    <button className="link" onClick={() => setPage("Sell")}>Manage & delete listings →</button>
                  </div>
                  {myListings.length ? (
                    myListings.slice(0, 4).map(item => (
                      <div className="saved-row-with-action" key={item.id}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {item.image ? (
                            <img src={item.image} alt={item.crop} style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover" }} />
                          ) : (
                            <span>🌾</span>
                          )}
                          <b>{item.crop}</b>
                        </span>
                        <span>{item.variety || "—"}</span>
                        <span>{item.quantity} {item.unit}</span>
                        <strong>₹{item.price}/{item.unit}</strong>
                        <span>{item.address}</span>
                        <button
                          type="button"
                          className="btn-delete-sm"
                          title="Delete this listing"
                          onClick={() => deleteListing(item.id, item.crop)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="empty-list">You have not added crops yet. Use Add crops for sale to create your first listing.</p>
                  )}
                </section>
              ) : (
                <section className="panel customer-prompt">
                  <h3>Official market data for {profile?.district ? profile.district + ", " : ""}{profile?.state || "India"}</h3>
                  <p>See reported min, modal, and max wholesale prices for all vegetables and crops.</p>
                  <button className="link" onClick={() => setPage("Prices")}>Search state, district & mandi →</button>
                </section>
              )}

              {/* Show prices for all vegetables of user's district and state */}
              <OfficialPrices location={profile} preview onViewAll={() => setPage("Prices")} />
            </>
          )}

          {page === "Prices" && <OfficialPrices location={profile} />}

          {page === "Browse" && (
            <>
              <Title eyebrow="FARMER MARKETPLACE" title="Browse fresh produce." sub="See crops currently listed by farmers on Farmezy." />
              {deleteNotice && <div className="delete-notification">✓ {deleteNotice}</div>}
              <section className="panel location-panel">
                <div className="panel-head">
                  <div>
                    <h3>📍 Delivery & route</h3>
                    <p>Allow location to see how far each farmer is from you and open the best driving route.</p>
                  </div>
                  <button className="link" onClick={locateCustomer}>{customerLocation ? "Location enabled ✓" : "Use my location"}</button>
                </div>
                {customerLocation && <p className="note">Your location is ready. Distances are calculated from your current position.</p>}
              </section>
              {listingError && (
                <section className="official-error">
                  <b>Could not load farmer listings.</b>
                  <p>{listingError}</p>
                </section>
              )}
              {/* Customer Marketplace Filters */}
              <section className="marketplace-filters">
                <div className="filters-top">
                  <div className="filters-top-title">
                    <span>⚡ Filter Marketplace Produce</span>
                  </div>
                  {hasActiveFilters && (
                    <button type="button" className="btn-clear-filters" onClick={clearFilters}>
                      ✕ Clear Filters
                    </button>
                  )}
                </div>

                <div className="filters-grid">
                  {/* Search query across produce */}
                  <div className="filter-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Search Produce</label>
                    <input
                      type="text"
                      value={browseSearch}
                      onChange={e => setBrowseSearch(e.target.value)}
                      placeholder="Search by crop, variety, farmer, district, state..."
                    />
                  </div>

                  {/* SUBGROUP 1: Crop & Produce Identity */}
                  <div className="filters-subgroup-title">
                    <span>🌾 1. Crop & Produce Identity</span>
                  </div>

                  {/* 1. Category */}
                  <div className="filter-field">
                    <label>1. Category</label>
                    <select
                      value={browseCategory}
                      onChange={e => {
                        setBrowseCategory(e.target.value)
                        setBrowseCommodity("All Commodities")
                        setBrowseVariety("All Varieties")
                      }}
                    >
                      {MARKETPLACE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Commodity / Crop */}
                  <div className="filter-field">
                    <label>2. Commodity / Crop</label>
                    <select
                      value={browseCommodity}
                      onChange={e => {
                        setBrowseCommodity(e.target.value)
                        setBrowseVariety("All Varieties")
                      }}
                    >
                      {marketplaceCommodities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Variety */}
                  <div className="filter-field">
                    <label>3. Variety</label>
                    <select
                      value={browseVariety}
                      onChange={e => setBrowseVariety(e.target.value)}
                    >
                      {marketplaceVarieties.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Quality / Grade */}
                  <div className="filter-field">
                    <label>4. Quality / Grade</label>
                    <select
                      value={browseGrade}
                      onChange={e => setBrowseGrade(e.target.value)}
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* SUBGROUP 2: Pricing & Quantity */}
                  <div className="filters-subgroup-title">
                    <span>⚖️ 2. Pricing & Quantity</span>
                  </div>

                  {/* 5. Available Quantity */}
                  <div className="filter-field">
                    <label>5. Min Available Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 50"
                      value={browseMinQuantity}
                      onChange={e => setBrowseMinQuantity(e.target.value)}
                    />
                  </div>

                  {/* 6. Price Range (Min & Max Price) */}
                  <div className="filter-field">
                    <label>6. Price Range (₹)</label>
                    <div className="price-inputs-group" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Min ₹"
                        value={browseMinPrice}
                        onChange={e => setBrowseMinPrice(e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Max ₹"
                        value={browseMaxPrice}
                        onChange={e => setBrowseMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 7. Unit of Measurement */}
                  <div className="filter-field">
                    <label>7. Unit</label>
                    <select
                      value={browseUnit}
                      onChange={e => setBrowseUnit(e.target.value)}
                    >
                      {availableUnits.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* SUBGROUP 3: Dates & Shelf Life */}
                  <div className="filters-subgroup-title">
                    <span>📅 3. Dates & Shelf Life</span>
                  </div>

                  {/* 8. Harvest Date */}
                  <div className="filter-field">
                    <label>8. Harvested On / After</label>
                    <input
                      type="date"
                      value={browseHarvestFrom}
                      onChange={e => setBrowseHarvestFrom(e.target.value)}
                    />
                  </div>

                  {/* 9. Available-From Date */}
                  <div className="filter-field">
                    <label>9. Available By / On</label>
                    <input
                      type="date"
                      value={browseAvailableFrom}
                      onChange={e => setBrowseAvailableFrom(e.target.value)}
                    />
                  </div>

                  {/* 10. Expiry Date */}
                  <div className="filter-field">
                    <label>10. Expiry Date</label>
                    <select
                      value={browseExpiry}
                      onChange={e => setBrowseExpiry(e.target.value)}
                    >
                      <option value="all">All active produce</option>
                      <option value="today">Expiring today</option>
                      <option value="3days">Within 3 days</option>
                      <option value="7days">Within 7 days</option>
                      <option value="custom">Before custom date...</option>
                    </select>
                    {browseExpiry === "custom" && (
                      <input
                        type="date"
                        value={browseCustomDate}
                        onChange={e => setBrowseCustomDate(e.target.value)}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </div>

                  {/* SUBGROUP 4: Cultivation & Packaging */}
                  <div className="filters-subgroup-title">
                    <span>🌱 4. Cultivation & Packaging</span>
                  </div>

                  {/* 11. Organic Status */}
                  <div className="filter-field">
                    <label>11. Organic Status</label>
                    <select
                      value={browseOrganic}
                      onChange={e => setBrowseOrganic(e.target.value)}
                    >
                      {availableOrganic.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {/* 12. Production Method */}
                  <div className="filter-field">
                    <label>12. Production Method</label>
                    <select
                      value={browseProductionMethod}
                      onChange={e => setBrowseProductionMethod(e.target.value)}
                    >
                      {availableProductionMethods.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* 13. Packaging Type */}
                  <div className="filter-field">
                    <label>13. Packaging Type</label>
                    <select
                      value={browsePackaging}
                      onChange={e => setBrowsePackaging(e.target.value)}
                    >
                      {availablePackaging.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* SUBGROUP 5: Delivery & Logistics */}
                  <div className="filters-subgroup-title">
                    <span>🚚 5. Delivery & Logistics</span>
                  </div>

                  {/* 14. Delivery Availability */}
                  <div className="filter-field">
                    <label>14. Delivery Availability</label>
                    <select
                      value={browseDelivery}
                      onChange={e => setBrowseDelivery(e.target.value)}
                    >
                      <option value="All Options">All Options</option>
                      <option value="Delivery Available">Delivery to Buyer Available</option>
                      <option value="Delivery Not Available">No Delivery (Pickup Only)</option>
                    </select>
                  </div>

                  {/* 15. Pickup Availability */}
                  <div className="filter-field">
                    <label>15. Pickup Availability</label>
                    <select
                      value={browsePickup}
                      onChange={e => setBrowsePickup(e.target.value)}
                    >
                      <option value="All Options">All Options</option>
                      <option value="Pickup Available">Farm Pickup Available</option>
                      <option value="Pickup Not Available">No Farm Pickup</option>
                    </select>
                  </div>

                  {/* 20. Delivery Radius / Max Distance */}
                  <div className="filter-field">
                    <label>20. Distance / Radius</label>
                    <select
                      value={browseDistance}
                      onChange={e => {
                        const val = e.target.value
                        setBrowseDistance(val)
                        if (val !== "all" && !customerLocation) {
                          locateCustomer()
                        }
                      }}
                    >
                      <option value="all">All Distances</option>
                      <option value="near_me">Near Me (&lt; 15 km)</option>
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                    </select>
                    {browseDistance !== "all" && !customerLocation && (
                      <small style={{ color: "#b45309", fontSize: 10, marginTop: 2 }}>
                        📍 Enable location above to filter by distance
                      </small>
                    )}
                  </div>

                  {/* SUBGROUP 6: Location & Region */}
                  <div className="filters-subgroup-title">
                    <span>📍 6. Location & Region</span>
                  </div>

                  {/* 16. State */}
                  <div className="filter-field">
                    <label>16. State</label>
                    <select
                      value={browseState}
                      onChange={e => {
                        setBrowseState(e.target.value)
                        setBrowseDistrict("All Districts")
                        setBrowseCity("All Cities")
                      }}
                    >
                      {availableStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* 17. District */}
                  <div className="filter-field">
                    <label>17. District</label>
                    <select
                      value={browseDistrict}
                      onChange={e => {
                        setBrowseDistrict(e.target.value)
                        setBrowseCity("All Cities")
                      }}
                    >
                      {availableDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* 18. City */}
                  <div className="filter-field">
                    <label>18. City / Town</label>
                    <select
                      value={browseCity}
                      onChange={e => setBrowseCity(e.target.value)}
                    >
                      {availableCities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* 19. PIN Code */}
                  <div className="filter-field">
                    <label>19. PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 517247"
                      value={browsePincode}
                      onChange={e => setBrowsePincode(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Result Count Bar & Clear Filters */}
              <div className="marketplace-result-bar">
                <div>
                  <b>{filteredMarketplaceListings.length}</b> listing{filteredMarketplaceListings.length === 1 ? "" : "s"} found
                  {hasActiveFilters && (
                    <span className="active-filters-tag">Filters active</span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button type="button" className="btn-clear-filters" onClick={clearFilters}>
                    ✕ Clear Filters
                  </button>
                )}
              </div>

              {listingLoading ? (
                <section className="panel no-demo"><p>Loading farmer listings…</p></section>
              ) : listings.length === 0 ? (
                <section className="panel no-demo">
                  <h3>No farmer listings yet</h3>
                  <p>Once a farmer adds a crop, it will appear here for customers.</p>
                </section>
              ) : filteredMarketplaceListings.length === 0 ? (
                <section className="marketplace-empty-state">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <h3>No listings match your selected filters.</h3>
                  <p>Try clearing some filters or widening your price/expiry parameters to find fresh farm produce.</p>
                  <button type="button" className="btn-action-buy" onClick={clearFilters} style={{ margin: "14px auto 0" }}>
                    Clear Filters
                  </button>
                </section>
              ) : (
                <section className="panel farmer-listings">
                  {filteredMarketplaceListings.map(item => {
                    const km = distanceKm(customerLocation?.lat, customerLocation?.lng, item.latitude || item.farmerLat, item.longitude || item.farmerLng)
                    const isOwner = item.farmerId === farmerId || (profile?.phone && item.farmerPhone && String(item.farmerPhone).replace(/\D/g, "") === String(profile.phone).replace(/\D/g, ""))
                    return (
                      <article className="listing-card" key={item.id}>
                        {item.image && (
                          <div
                            className="listing-photo-thumb"
                            onClick={() => { setBuyItem(item); setBuyQuantity("") }}
                            style={{ cursor: "pointer" }}
                            title={`Click to view/request ${item.crop}`}
                          >
                            <img src={item.image} alt={item.crop} />
                          </div>
                        )}
                        <div
                          onClick={() => { setBuyItem(item); setBuyQuantity("") }}
                          style={{ cursor: "pointer" }}
                          title={`Click to view/request ${item.crop}`}
                        >
                          <small>{t("crop")}</small>
                          <b>{item.crop}</b>
                          <span>{item.variety || "Variety not specified"}</span>
                          {(item.category || getCategoryForCrop(item.crop)) && (
                            <span style={{ fontSize: "0.82em", color: "#326c42", fontWeight: 600 }}>
                              🏷️ {item.category || getCategoryForCrop(item.crop)}
                            </span>
                          )}
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                            {item.grade && <span className="badge-grade">Grade: {item.grade}</span>}
                            {item.organic && <span className="badge-organic">{item.organic}</span>}
                            {item.productionMethod && <span className="badge-packaging">🌱 {item.productionMethod}</span>}
                            {item.packaging && <span className="badge-packaging">📦 {item.packaging}</span>}
                          </div>
                        </div>
                        <div>
                          <small>{t("available")}</small>
                          <b>{item.quantity} {item.unit}</b>
                          {item.minOrder && (
                            <span style={{ fontSize: "0.8em", color: "#617163" }}>
                              Min Order: {item.minOrder} {item.unit}
                            </span>
                          )}
                          {item.harvestDate && (
                            <span style={{ fontSize: "0.8em", color: "#556b5b" }}>
                              Harvested: {item.harvestDate}
                            </span>
                          )}
                          {item.availableFrom && (
                            <span style={{ fontSize: "0.8em", color: "#556b5b" }}>
                              Ready: {item.availableFrom}
                            </span>
                          )}
                          <span style={{ fontSize: "0.82em", fontWeight: 500 }}>
                            {item.expiryDate || item.date ? `Until: ${item.expiryDate || item.date}` : "Date not specified"}
                          </span>
                        </div>
                        <div>
                          <small>{t("askingPrice")}</small>
                          <b>₹{item.price} / {item.unit}</b>
                          <span>Listed by {item.farmerName}</span>
                          <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {item.deliveryAvailable && (
                              <span className="badge-delivery">
                                🚚 Delivery {item.deliveryRadius ? `(${item.deliveryRadius} km)` : "available"}
                              </span>
                            )}
                            {item.pickupAvailable && (
                              <span className="badge-delivery" style={{ background: "#e8f0fe", color: "#1967d2" }}>
                                📍 Farm pickup
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <small>{t("farmerPickup")}</small>
                          <b>{item.address}</b>
                          {(item.village || item.city || item.district || item.state) && (
                            <span style={{ display: "block", fontSize: "0.85em", color: "#556b5b", marginTop: 2 }}>
                              {[item.village, item.city, item.district, item.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                          <span>{contactPhone(item) ? "📞 " + contactPhone(item) : "Contact details unavailable"}</span>
                          {km !== null && <span>{formatDistance(km)}</span>}
                          <div className="listing-actions">
                            <button className="btn-action-buy" onClick={() => { setBuyItem(item); setBuyQuantity("") }}>
                              🧺 {t("buyRequest")}
                            </button>
                            {contactPhone(item) && phoneUrl(contactPhone(item)) && (
                              <a href={phoneUrl(contactPhone(item))} className="btn-action-link">📞 {t("call")}</a>
                            )}
                            {contactPhone(item) && whatsappUrl(contactPhone(item)) && (
                              <a href={whatsappUrl(contactPhone(item))} target="_blank" rel="noopener noreferrer" className="btn-action-link">💬 {t("whatsapp")}</a>
                            )}
                            {routeUrl(item) && (
                              <a href={routeUrl(item)} target="_blank" rel="noopener noreferrer" className="btn-action-link">🗺️ {t("bestRoute")} ↗</a>
                            )}
                            {(role === "Farmer" || isOwner) && (
                              <>
                                <button
                                  type="button"
                                  className="btn-action-edit"
                                  title="Edit this listing"
                                  onClick={() => {
                                    setPage("Sell")
                                    startEditListing(item)
                                  }}
                                >
                                  ✏️ {t("edit") || "Edit"}
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-delete"
                                  title="Delete this listing"
                                  onClick={() => deleteListing(item.id, item.crop)}
                                >
                                  🗑️ {t("delete")}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </section>
              )}
              {buyItem && (
                <section className="panel form-panel request-panel">
                  <h3>Request {buyItem.crop}</h3>
                  <p>Farmer: <b>{buyItem.farmerName}</b> · ₹{buyItem.price}/{buyItem.unit}</p>
                  <label>
                    How much do you want?
                    <input
                      type="number"
                      min="1"
                      max={buyItem.quantity}
                      value={buyQuantity}
                      onChange={e => setBuyQuantity(e.target.value)}
                      placeholder={"Quantity in " + buyItem.unit}
                    />
                  </label>
                  <div className="form-foot">
                    <small>Farmezy currently connects you directly with the farmer; payment can be added next.</small>
                    <button
                      disabled={!buyQuantity || orderLoading}
                      onClick={async () => {
                        setOrderLoading(true)
                        try {
                          const response = await fetch("/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              listingId: buyItem.id,
                              crop: buyItem.crop,
                              unit: buyItem.unit,
                              price: buyItem.price,
                              quantity: buyQuantity,
                              availableQuantity: buyItem.quantity,
                              farmerId: buyItem.farmerId,
                              farmerName: buyItem.farmerName,
                              farmerPhone: buyItem.farmerPhone,
                              customerId,
                              customerName: profile?.name || "Customer",
                              customerPhone: profile?.phone || "",
                              customerLocation: profile?.location || ""
                            })
                          })
                          const data = await response.json()
                          if (!response.ok) throw new Error(data.error || "Could not create request.")
                          await loadOrders()
                          const text = "Hi " + buyItem.farmerName + ", I requested " + buyQuantity + " " + buyItem.unit + " of your " + buyItem.crop + " on Farmezy. Request ID: " + data.order.id
                          const url = whatsappUrl(buyItem.farmerPhone, text)
                          if (!url) {
                            alert("Request saved, but this farmer has not added a valid WhatsApp number yet.")
                          } else {
                            window.location.href = url
                          }
                          setBuyItem(null)
                          setBuyQuantity("")
                        } catch (error) {
                          setListingError(error.message)
                        } finally {
                          setOrderLoading(false)
                        }
                      }}
                    >
                      Send request on WhatsApp →
                    </button>
                    <button className="link" onClick={() => setBuyItem(null)}>Cancel</button>
                  </div>
                </section>
              )}
            </>
          )}

          {page === "Requests" && (
            <>
              <Title eyebrow="FARMER ORDERS" title="Customer requests." sub="Manage requests from customers who want to buy your crops." />
              <section className="panel farmer-listings">
                {orders.length ? (
                  orders.map(order => (
                    <article className="listing-card" key={order.id}>
                      <div>
                        <small>CROP</small>
                        <b>{order.crop}</b>
                        <span>{order.quantity} {order.unit} · ₹{order.price}/{order.unit}</span>
                      </div>
                      <div>
                        <small>CUSTOMER</small>
                        <b>{order.customerName}</b>
                        <span>{order.customerPhone || "Phone not provided"}</span>
                      </div>
                      <div>
                        <small>STATUS</small>
                        <b>{order.status}</b>
                        <span>{formatIndiaTime(order.createdAt)}</span>
                      </div>
                      <div>
                        <small>ACTIONS</small>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {order.status === "Requested" && (
                            <>
                              <button onClick={() => updateOrder(order.id, "Accepted")}>Accept</button>
                              <button onClick={() => updateOrder(order.id, "Rejected")}>Reject</button>
                            </>
                          )}
                          {order.status === "Accepted" && <button onClick={() => updateOrder(order.id, "Ready")}>Mark ready</button>}
                          {order.status === "Ready" && <button onClick={() => updateOrder(order.id, "Completed")}>Complete</button>}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-list">No customer requests yet.</p>
                )}
              </section>
            </>
          )}

          {page === "Orders" && (
            <>
              <Title eyebrow="MY REQUESTS" title="Track your purchases." sub="See requests you have sent to farmers." />
              <section className="panel farmer-listings">
                {orders.length ? (
                  orders.map(order => (
                    <article className="listing-card" key={order.id}>
                      <div>
                        <small>CROP</small>
                        <b>{order.crop}</b>
                        <span>{order.quantity} {order.unit} · ₹{order.price}/{order.unit}</span>
                      </div>
                      <div>
                        <small>FARMER</small>
                        <b>{order.farmerName}</b>
                        <span>{order.farmerPhone || "Phone not provided"}</span>
                      </div>
                      <div>
                        <small>STATUS</small>
                        <b>{order.status}</b>
                        <span>Request #{order.id}</span>
                      </div>
                      <div>
                        <small>CONTACT</small>
                        {order.farmerPhone && (
                          <a href={whatsappUrl(order.farmerPhone)} target="_blank" rel="noreferrer" className="link">WhatsApp farmer ↗</a>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="empty-list">You have not requested any crops yet. Browse farmer produce to start.</p>
                )}
              </section>
            </>
          )}

          {page === "Forecast" && (
            <>
              <Title eyebrow="PRICE FORECAST" title="Predict the next mandi price." sub="Farmezy trains on official AGMARKNET observations collected from the Government of India feed. No sample prices are used." />
              <PriceForecast location={profile} onPrices={() => setPage("Prices")} />
            </>
          )}

          {page === "Mandi" && (
            <>
              <Title eyebrow="INDIA-WIDE MARKET DATA" title="Explore reported mandis." sub="Filter the Government of India daily market-price feed by commodity, state, district, and mandi." />
              <section className="panel no-demo">
                <h3>Official mandi reports</h3>
                <p>Compare wholesale prices reported by AGMARKNET for all mandis in your district and state.</p>
                <button className="link" onClick={() => setPage("Prices")}>Browse official prices →</button>
              </section>
            </>
          )}

          {page === "Sell" && (
            <>
              <Title eyebrow="FARMER SELLING SPACE" title="Manage your crop listings." sub="Add each crop separately with its own photo, quantity, price, harvest date, and pickup location." />
              {listingError && (
                <section className="official-error">
                  <b>Action failed.</b>
                  <p>{listingError}</p>
                </section>
              )}
              {deleteNotice && <div className="delete-notification">✓ {deleteNotice}</div>}

              {listed && (
                <section className="success">
                  <h2>✓ &nbsp; Crop saved in your listings</h2>
                  {listing?.image && (
                    <div style={{ margin: "14px 0" }}>
                      <img src={listing.image} alt={listing.crop} style={{ width: 120, height: 120, borderRadius: 8, objectFit: "cover" }} />
                    </div>
                  )}
                  <p>{listing?.crop} · {listing?.quantity} {listing?.unit} · ₹{listing?.price}/{listing?.unit}</p>
                  <button onClick={() => { setListed(false); setCropImage(null) }}>Add another crop</button>
                </section>
              )}

              {!listed && (
                <section className="panel form-panel">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h3>{editingListingId ? "Edit crop listing" : "Add a crop for sale"}</h3>
                      <p>
                        {editingListingId
                          ? "Update your produce details, quantity, price, or pickup location."
                          : "Enter the details buyers need to understand what is available, and take a real photo using your camera."}
                      </p>
                    </div>
                    {editingListingId && (
                      <button
                        type="button"
                        className="btn-cancel-edit"
                        onClick={cancelEditListing}
                      >
                        ✕ Cancel edit
                      </button>
                    )}
                  </div>

                  <form
                    key={editingListingId || "new"}
                    onSubmit={async e => {
                      e.preventDefault()
                      setListingError("")

                      const finalCrop = formCrop.trim()
                      if (!finalCrop) {
                        setListingError("Please specify the crop / commodity name.")
                        return
                      }

                      const numQuantity = Number(formQuantity)
                      if (!Number.isFinite(numQuantity) || numQuantity <= 0) {
                        setListingError("Available quantity must be a positive number greater than 0.")
                        return
                      }

                      const numPrice = Number(formPrice)
                      if (!Number.isFinite(numPrice) || numPrice <= 0) {
                        setListingError("Asking price must be a positive number greater than 0.")
                        return
                      }

                      if (formMinOrder !== "" && (Number(formMinOrder) < 0 || isNaN(Number(formMinOrder)))) {
                        setListingError("Minimum order quantity must be a valid non-negative number.")
                        return
                      }

                      // Date validations
                      if (formHarvestDate && formExpiryDate && formExpiryDate < formHarvestDate) {
                        setListingError("Expiry / available-until date cannot be earlier than the harvest date.")
                        return
                      }
                      if (formAvailableFrom && formExpiryDate && formExpiryDate < formAvailableFrom) {
                        setListingError("Expiry / available-until date cannot be earlier than the ready / available-from date.")
                        return
                      }

                      const finalAddress = (formLocation.address || "").trim()
                      if (!finalAddress) {
                        setListingError("Please provide a pickup address for your listing.")
                        return
                      }

                      setListingLoading(true)

                      const finalVariety = formVariety === "__custom__"
                        ? formCustomVariety.trim()
                        : (formVariety.trim() || formCustomVariety.trim() || "")

                      const finalVillage = (formLocation.village || "").trim()
                      const finalCity = (formLocation.city || "").trim()
                      const finalDistrict = (formLocation.district || profile?.district || "").trim()
                      const finalState = (formLocation.state || profile?.state || "").trim()
                      const finalPincode = (formLocation.pincode || "").trim()
                      const finalLat = String(formLocation.latitude || "").trim()
                      const finalLng = String(formLocation.longitude || "").trim()

                      const payload = {
                        crop: finalCrop,
                        category: formCategory.trim() || getCategoryForCrop(finalCrop),
                        variety: finalVariety,
                        grade: formGrade.trim(),
                        organic: formOrganic.trim(),
                        productionMethod: formProductionMethod.trim(),
                        packaging: formPackaging.trim(),
                        minOrder: formMinOrder.trim(),
                        quantity: String(numQuantity),
                        unit: formUnit.trim(),
                        price: String(numPrice),
                        priceUnit: formUnit.trim(),
                        harvestDate: formHarvestDate.trim(),
                        availableFrom: formAvailableFrom.trim(),
                        expiryDate: formExpiryDate.trim(),
                        date: formExpiryDate.trim() || formAvailableFrom.trim() || formHarvestDate.trim(),
                        notes: formNotes.trim(),
                        description: formNotes.trim(),
                        pickupAvailable: formPickup,
                        deliveryAvailable: formDelivery,
                        deliveryRadius: formDelivery ? String(formDeliveryRadius).trim() : "",
                        address: finalAddress,
                        village: finalVillage,
                        locality: finalVillage,
                        city: finalCity,
                        district: finalDistrict,
                        state: finalState,
                        pincode: finalPincode,
                        latitude: finalLat,
                        longitude: finalLng,
                        farmerLat: finalLat,
                        farmerLng: finalLng,
                        farmerDistrict: finalDistrict,
                        farmerState: finalState,
                        farmerLocation: finalAddress,
                        image: cropImage || (editingListingId ? (listings.find(l => l.id === editingListingId)?.image || "") : ""),
                        farmerId,
                        farmerName: profile?.name || "Farmer",
                        farmerPhone: profile?.phone || ""
                      }

                      try {
                        if (editingListingId) {
                          const response = await fetch(`/api/listings/${editingListingId}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                          })
                          const result = await response.json()
                          if (!response.ok) throw new Error(result.error || "Could not update listing.")
                          setListings(prev => prev.map(item => item.id === editingListingId ? result.listing : item))
                          setListing(result.listing)
                          setDeleteNotice(`Listing for "${result.listing.crop}" updated successfully.`)
                          setTimeout(() => setDeleteNotice(""), 4500)
                          setEditingListingId(null)
                        } else {
                          const response = await fetch("/api/listings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                          })
                          const result = await response.json()
                          if (!response.ok) throw new Error(result.error || "Could not save listing.")
                          setListing(result.listing)
                          setListings(prev => [result.listing, ...prev])
                          setListed(true)
                        }
                        cancelEditListing()
                      } catch (error) {
                        setListingError(error.message)
                      } finally {
                        setListingLoading(false)
                      }
                    }}
                  >
                    {/* SECTION 1: PRODUCT IDENTITY */}
                    <div className="form-section-banner">
                      <b>🌾 1. Product Identity (AGMARKNET Official Catalogue)</b>
                      <small>Select from 609 official Government commodities and their registered varieties</small>
                    </div>
                    <div className="form-grid">
                      <label>
                        Category *
                        <select
                          value={formCategory}
                          onChange={e => setFormCategory(e.target.value)}
                        >
                          {MARKETPLACE_CATEGORIES.filter(c => c !== "All Categories").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Commodity / Crop *
                        <input
                          list="official-form-commodities-list"
                          required
                          value={formCrop}
                          onChange={e => {
                            const val = e.target.value
                            setFormCrop(val)
                            const match = allOfficialCommodities.find(c =>
                              (c.name || "").toLowerCase() === val.trim().toLowerCase() ||
                              (c.display_name && c.display_name.toLowerCase() === val.trim().toLowerCase()) ||
                              (c.agmarknet_name && c.agmarknet_name.toLowerCase() === val.trim().toLowerCase())
                            )
                            if (match) {
                              if (match.category || match.group_name) {
                                setFormCategory(match.category || match.group_name)
                              }
                              setFormVariety("")
                              setFormCustomVariety("")
                              if (match.grades && match.grades.length > 0) {
                                setFormGrade(match.grades[0])
                              }
                            }
                          }}
                          placeholder="Type or select commodity (e.g. Rice, Tomato, Cashewnuts)..."
                        />
                        <datalist id="official-form-commodities-list">
                          {allOfficialCommodities
                            .filter(c => !formCategory || formCategory === "All Categories" || (c.category || c.group_name || "").toLowerCase() === formCategory.toLowerCase())
                            .map(c => (
                              <option key={c.id || c.name} value={c.name}>
                                {c.display_name && c.display_name !== c.name ? `${c.display_name} (${c.category || c.group_name})` : (c.category || c.group_name)}
                              </option>
                            ))}
                        </datalist>
                      </label>

                      <label className="wide">
                        Variety
                        {registeredFormVarieties.length > 0 ? (
                          <div className="variety-selection-group">
                            <select
                              value={formVariety}
                              onChange={e => {
                                setFormVariety(e.target.value)
                                if (e.target.value !== "__custom__") {
                                  setFormCustomVariety("")
                                }
                              }}
                            >
                              <option value="">-- Select official registered variety ({registeredFormVarieties.length} available) --</option>
                              {registeredFormVarieties.map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                              <option value="__custom__">➕ Other / Custom variety...</option>
                            </select>

                            {(formVariety === "__custom__" || (formVariety && !registeredFormVarieties.includes(formVariety))) && (
                              <input
                                type="text"
                                placeholder="Enter custom variety name..."
                                value={formCustomVariety || (formVariety !== "__custom__" ? formVariety : "")}
                                onChange={e => setFormCustomVariety(e.target.value)}
                                style={{ marginTop: 6 }}
                              />
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Local, Hybrid, Desi..."
                            value={formVariety}
                            onChange={e => setFormVariety(e.target.value)}
                          />
                        )}
                      </label>

                      <label>
                        Quality / Grade
                        <select
                          value={formGrade}
                          onChange={e => setFormGrade(e.target.value)}
                        >
                          <option value="FAQ">FAQ (Fair Average Quality)</option>
                          <option value="Grade A">Grade A (Superior)</option>
                          <option value="Grade B">Grade B (Standard)</option>
                          <option value="Grade C">Grade C (Commercial)</option>
                          <option value="Premium">Premium</option>
                          <option value="Export Quality">Export Quality</option>
                          <option value="Local">Local</option>
                          {selectedFormCommodityObj?.grades &&
                            selectedFormCommodityObj.grades
                              .filter(g => !["FAQ", "Grade A", "Grade B", "Grade C", "Premium", "Export Quality", "Local"].includes(g))
                              .map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                        </select>
                      </label>
                    </div>

                    {/* SECTION 2: QUANTITY & PRICING */}
                    <div className="form-section-banner">
                      <b>⚖️ 2. Quantity & Pricing</b>
                      <small>Specify quantity, unit of measurement, and wholesale asking price</small>
                    </div>
                    <div className="form-grid">
                      <label>
                        Available Quantity *
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          required
                          value={formQuantity}
                          onChange={e => setFormQuantity(e.target.value)}
                          placeholder="e.g. 500"
                        />
                      </label>

                      <label>
                        Unit of Measurement *
                        <select
                          value={formUnit}
                          onChange={e => setFormUnit(e.target.value)}
                        >
                          <option value="kg">kg (Kilogram)</option>
                          <option value="quintal">quintal (100 kg)</option>
                          <option value="tonne">tonne (1,000 kg)</option>
                          <option value="crate">crate</option>
                          <option value="bag">bag</option>
                          <option value="box">box</option>
                        </select>
                      </label>

                      <label>
                        Asking Price (₹ / {formUnit}) *
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          required
                          value={formPrice}
                          onChange={e => setFormPrice(e.target.value)}
                          placeholder="e.g. 35"
                        />
                      </label>

                      <label>
                        Minimum Order Quantity (Optional)
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formMinOrder}
                          onChange={e => setFormMinOrder(e.target.value)}
                          placeholder={`e.g. 50 ${formUnit}`}
                        />
                      </label>
                    </div>

                    {/* SECTION 3: HARVEST & AVAILABILITY DATES */}
                    <div className="form-section-banner">
                      <b>📅 3. Harvest & Availability Dates</b>
                      <small>Separate harvest date from shelf-life / expiry to help buyers gauge freshness</small>
                    </div>
                    <div className="form-grid">
                      <label>
                        Harvest Date (optional)
                        <input
                          type="date"
                          value={formHarvestDate}
                          onChange={e => setFormHarvestDate(e.target.value)}
                        />
                        <small style={{ color: "#667868", marginTop: 3 }}>When crop was harvested from field</small>
                      </label>

                      <label>
                        Ready / Available-From Date (optional)
                        <input
                          type="date"
                          value={formAvailableFrom}
                          onChange={e => setFormAvailableFrom(e.target.value)}
                        />
                        <small style={{ color: "#667868", marginTop: 3 }}>Date produce is ready for pickup or dispatch</small>
                      </label>

                      <label>
                        Expiry / Available-Until Date *
                        <input
                          type="date"
                          required
                          value={formExpiryDate}
                          onChange={e => setFormExpiryDate(e.target.value)}
                        />
                        <small style={{ color: "#667868", marginTop: 3 }}>Shelf-life or last day available for sale</small>
                      </label>
                    </div>

                    {/* SECTION 4: QUALITY, ORGANIC & PACKAGING DETAILS */}
                    <div className="form-section-banner">
                      <b>🌱 4. Quality, Organic & Packaging Details (Optional)</b>
                      <small>Highlight your farming practices and packaging</small>
                    </div>
                    <div className="form-grid">
                      <label>
                        Organic Status
                        <select
                          value={formOrganic}
                          onChange={e => setFormOrganic(e.target.value)}
                        >
                          <option value="Conventional">Conventional</option>
                          <option value="Organic">Organic (No chemicals)</option>
                          <option value="Certified Organic">Certified Organic</option>
                          <option value="Natural / Desi">Natural / Desi / Jaivik</option>
                        </select>
                      </label>

                      <label>
                        Production Method
                        <select
                          value={formProductionMethod}
                          onChange={e => setFormProductionMethod(e.target.value)}
                        >
                          <option value="Open Field">Open Field</option>
                          <option value="Greenhouse / Polyhouse">Greenhouse / Polyhouse</option>
                          <option value="Hydroponic">Hydroponic</option>
                          <option value="Shade Net">Shade Net</option>
                          <option value="Traditional / Natural">Traditional / Natural</option>
                        </select>
                      </label>

                      <label>
                        Packaging Type
                        <select
                          value={formPackaging}
                          onChange={e => setFormPackaging(e.target.value)}
                        >
                          <option value="Plastic Crates">Plastic Crates</option>
                          <option value="Gunny Bags">Gunny Bags / Jute</option>
                          <option value="Boxes / Cartons">Boxes / Cartons</option>
                          <option value="Mesh Bags">Mesh Bags</option>
                          <option value="Loose / Bulk">Loose / Bulk</option>
                          <option value="Vacuum Pack">Vacuum Pack</option>
                        </select>
                      </label>
                    </div>

                    {/* SECTION 5: DELIVERY & LOGISTICS */}
                    <div className="form-section-banner">
                      <b>🚚 5. Delivery & Logistics Options</b>
                      <small>Indicate whether buyers can pick up or if you offer delivery</small>
                    </div>
                    <div className="delivery-options-card wide">
                      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
                        <label className="checkbox-field">
                          <input
                            type="checkbox"
                            checked={formPickup}
                            onChange={e => setFormPickup(e.target.checked)}
                          />
                          <span>📍 Farm Pickup Available</span>
                        </label>
                        <label className="checkbox-field">
                          <input
                            type="checkbox"
                            checked={formDelivery}
                            onChange={e => setFormDelivery(e.target.checked)}
                          />
                          <span>🚚 Delivery to Buyer Available</span>
                        </label>
                      </div>
                      {formDelivery && (
                        <div style={{ marginTop: 12, maxWidth: 300 }}>
                          <label>
                            Delivery Radius (km)
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 25"
                              value={formDeliveryRadius}
                              onChange={e => setFormDeliveryRadius(e.target.value)}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* SECTION 6: PICKUP LOCATION & ADDRESS */}
                    <div className="form-section-banner">
                      <b>📍 6. Pickup Location & Address</b>
                      <small>Auto-detect via GPS or select your town/district below to automatically fill all fields</small>
                    </div>
                    <div className="location-section wide">
                      <div className="location-header">
                        <div>
                          <h4>📍 Farmer Pickup Address</h4>
                          <p>Provide your pickup address so buyers know where to collect produce.</p>
                        </div>
                        <button
                          type="button"
                          className="btn-locate"
                          disabled={locating}
                          onClick={handleGetCurrentLocation}
                        >
                          {locating ? "⏳ Detecting location…" : "📍 Use My Current Location"}
                        </button>
                      </div>

                      {locationStatus && (
                        <div className={`location-status ${locationStatus.type}`}>
                          {locationStatus.message}
                        </div>
                      )}

                      {/* Quick address selection / search */}
                      <div className="address-search-bar">
                        <label style={{ fontSize: 10, color: "#637066", display: "grid", gap: 6, fontWeight: 400 }}>
                          Or search & select town / district manually (if GPS is unavailable):
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="text"
                              value={addressSearchQuery}
                              onChange={e => {
                                const val = e.target.value
                                setAddressSearchQuery(val)
                                handleSearchAddress(val)
                              }}
                              placeholder="🔍 Type city, town, district, or PIN (e.g. Madanapalle, Chittoor, Karnal)..."
                            />
                            {addressSearchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddressSearchQuery("")
                                  setAddressSearchResults([])
                                }}
                                style={{
                                  border: "1px solid #dce4da",
                                  background: "#fff",
                                  borderRadius: 5,
                                  padding: "0 10px",
                                  fontSize: 11,
                                  color: "#728075",
                                  cursor: "pointer"
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </label>

                        {searchingAddress && (
                          <small style={{ display: "block", color: "#687a6c", fontSize: 10, marginTop: 4 }}>
                            Searching locations…
                          </small>
                        )}

                        {addressSearchResults.length > 0 && (
                          <div style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            background: "white",
                            border: "1px solid #d8e3d6",
                            borderRadius: 6,
                            boxShadow: "0 8px 22px rgba(36, 52, 43, 0.14)",
                            zIndex: 30,
                            maxHeight: 220,
                            overflowY: "auto",
                            marginTop: 4
                          }}>
                            {addressSearchResults.map((item, idx) => (
                              <div
                                key={idx}
                                className="address-search-item"
                                onClick={() => {
                                  applySelectedAddress(item)
                                  setAddressSearchQuery(`${item.city}, ${item.district}, ${item.state}`)
                                  setAddressSearchResults([])
                                }}
                                style={{
                                  padding: "9px 12px",
                                  cursor: "pointer",
                                  borderBottom: idx === addressSearchResults.length - 1 ? "none" : "1px solid #f0f4ee",
                                  fontSize: 11,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <div>
                                  <b style={{ color: "#2d6f43", fontSize: 11, fontWeight: 600 }}>{item.city}</b>
                                  <span style={{ color: "#687a6c", fontSize: 10, marginLeft: 6 }}>
                                    {item.district ? `${item.district}, ` : ""}{item.state} {item.pincode ? `(${item.pincode})` : ""}
                                  </span>
                                </div>
                                <span style={{ fontSize: 10, color: "#2d6f43", fontWeight: 600 }}>Select ➔</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="location-grid">
                        <label className="wide">
                          Full Address *
                          <input
                            required
                            value={formLocation.address}
                            onChange={e => setFormLocation(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Farm / Village name, Street / Landmark, District, State"
                          />
                        </label>

                        <label>
                          Village / Locality
                          <input
                            value={formLocation.village}
                            onChange={e => setFormLocation(prev => ({ ...prev, village: e.target.value }))}
                            placeholder="e.g. Venkatapuram"
                          />
                        </label>

                        <label>
                          City / Town
                          <input
                            value={formLocation.city}
                            onChange={e => setFormLocation(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="e.g. Madanapalle"
                          />
                        </label>

                        <label>
                          District
                          <input
                            value={formLocation.district}
                            onChange={e => setFormLocation(prev => ({ ...prev, district: e.target.value }))}
                            placeholder="e.g. Chittoor"
                          />
                        </label>

                        <label>
                          State
                          <input
                            value={formLocation.state}
                            onChange={e => setFormLocation(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="e.g. Andhra Pradesh"
                          />
                        </label>

                        <label>
                          PIN Code
                          <input
                            value={formLocation.pincode}
                            onChange={e => setFormLocation(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="e.g. 517247"
                          />
                        </label>

                        <label>
                          Latitude
                          <input
                            value={formLocation.latitude}
                            onChange={e => setFormLocation(prev => ({ ...prev, latitude: e.target.value }))}
                            placeholder="e.g. 13.5560"
                          />
                        </label>

                        <label>
                          Longitude
                          <input
                            value={formLocation.longitude}
                            onChange={e => setFormLocation(prev => ({ ...prev, longitude: e.target.value }))}
                            placeholder="e.g. 78.5010"
                          />
                        </label>
                      </div>

                      {formLocation.latitude && formLocation.longitude && (
                        <small style={{ display: "block", color: "#6e7e71", marginTop: 8, fontSize: 10 }}>
                          📍 Coordinates recorded: {Number(formLocation.latitude).toFixed(4)}, {Number(formLocation.longitude).toFixed(4)}
                        </small>
                      )}
                    </div>

                    {/* SECTION 7: PHOTOS & BUYER NOTES */}
                    <div className="form-section-banner">
                      <b>📷 7. Harvest Photo & Buyer Notes</b>
                      <small>Add real photo of harvest and extra notes for buyers</small>
                    </div>
                    <CropCameraCapture
                      image={cropImage}
                      onCapture={dataUrl => setCropImage(dataUrl)}
                      onClear={() => setCropImage(null)}
                    />

                    <div className="buyer-notes-wrap">
                      <label>
                        Notes for buyers (Optional)
                        <textarea
                          value={formNotes}
                          onChange={e => setFormNotes(e.target.value)}
                          placeholder="Add extra details about crop quality, harvest freshness, packaging specifics, or pickup instructions..."
                          rows={3}
                        />
                      </label>
                    </div>

                    <div className="form-foot">
                      <small>Listing with all attributes will be saved to Farmezy backend and immediately searchable by buyers.</small>
                      <button disabled={listingLoading}>
                        {listingLoading ? "Saving…" : (editingListingId ? "Update crop listing →" : "Save crop listing →")}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {listings.length > 0 && (
                <section className="panel farmer-listings">
                  <div className="panel-head">
                    <div>
                      <h3>Manage crop listings</h3>
                      <p>{displayedFarmerListings.length} listing{displayedFarmerListings.length === 1 ? "" : "s"} shown</p>
                    </div>
                    <div className="listing-tabs">
                      <button
                        type="button"
                        className={listingScope === "my" ? "active" : ""}
                        onClick={() => setListingScope("my")}
                      >
                        My crops ({myListings.length})
                      </button>
                      <button
                        type="button"
                        className={listingScope === "all" ? "active" : ""}
                        onClick={() => setListingScope("all")}
                      >
                        All farmer listings ({listings.length})
                      </button>
                    </div>
                  </div>

                  {displayedFarmerListings.length === 0 ? (
                    <p className="empty-list">No crops found in this view.</p>
                  ) : (
                    displayedFarmerListings.map(item => (
                      <article className="listing-card" key={item.id}>
                        {item.image && (
                          <div className="listing-photo-thumb">
                            <img src={item.image} alt={item.crop} />
                          </div>
                        )}
                        <div>
                          <small>CROP</small>
                          <b>{item.crop}</b>
                          <span>{item.variety || "Variety not specified"}</span>
                          {(item.category || getCategoryForCrop(item.crop)) && (
                            <span style={{ fontSize: "0.82em", color: "#326c42", fontWeight: 600 }}>
                              🏷️ {item.category || getCategoryForCrop(item.crop)}
                            </span>
                          )}
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                            {item.grade && <span className="badge-grade">Grade: {item.grade}</span>}
                            {item.organic && <span className="badge-organic">{item.organic}</span>}
                            {item.productionMethod && <span className="badge-packaging">🌱 {item.productionMethod}</span>}
                            {item.packaging && <span className="badge-packaging">📦 {item.packaging}</span>}
                          </div>
                        </div>
                        <div>
                          <small>AVAILABLE</small>
                          <b>{item.quantity} {item.unit}</b>
                          {item.minOrder && (
                            <span style={{ fontSize: "0.8em", color: "#617163" }}>
                              Min Order: {item.minOrder} {item.unit}
                            </span>
                          )}
                          {item.harvestDate && (
                            <span style={{ fontSize: "0.8em", color: "#556b5b" }}>
                              Harvested: {item.harvestDate}
                            </span>
                          )}
                          {item.availableFrom && (
                            <span style={{ fontSize: "0.8em", color: "#556b5b" }}>
                              Ready: {item.availableFrom}
                            </span>
                          )}
                          <span style={{ fontSize: "0.82em", fontWeight: 500 }}>
                            {item.expiryDate || item.date ? `Until: ${item.expiryDate || item.date}` : "Date not specified"}
                            {isListingExpired(item.expiryDate || item.date) && <span className="expired-badge">Expired</span>}
                          </span>
                        </div>
                        <div>
                          <small>ASKING PRICE</small>
                          <b>₹{item.price} / {item.unit}</b>
                          <span>{item.farmerName ? "Farmer: " + item.farmerName : "Farmer set price"}</span>
                          <div style={{ marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {item.deliveryAvailable && (
                              <span className="badge-delivery">
                                🚚 Delivery {item.deliveryRadius ? `(${item.deliveryRadius} km)` : "available"}
                              </span>
                            )}
                            {item.pickupAvailable && (
                              <span className="badge-delivery" style={{ background: "#e8f0fe", color: "#1967d2" }}>
                                📍 Farm pickup
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <small>PICKUP</small>
                          <b>{item.address}</b>
                          {(item.village || item.city || item.district || item.state) && (
                            <span style={{ display: "block", fontSize: "0.85em", color: "#556b5b", marginTop: 2 }}>
                              {[item.village, item.city, item.district, item.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                          <span>{item.notes || "No additional notes"}</span>
                          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                            <button
                              type="button"
                              className="btn-edit-listing"
                              onClick={() => startEditListing(item)}
                            >
                              ✏️ Edit listing
                            </button>
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => deleteListing(item.id, item.crop)}
                            >
                              🗑️ Delete listing
                            </button>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </section>
              )}
            </>
          )}

          <footer className="footer">
            <span>© 2026 Farmezy · Secured with Supabase Authorization</span>
            <span>Grown with care, shared with trust ✳</span>
            <button onClick={() => setChat(true)}>Need a hand? <b>Chat with us ↗</b></button>
          </footer>
        </div>
      </main>

      <button className="chat-launch" aria-label="Open Farmezy assistant" onClick={() => setChat(!chat)}>
        {chat ? "×" : "✳"}
      </button>

      {chat && (
        <div className="chat-box">
          <header>
            <div>
              <b>✳ &nbsp; Farmezy assistant</b>
              <small>Official prices + marketplace help</small>
            </div>
            <button onClick={() => setChat(false)}>×</button>
          </header>
          <div className="chat-messages">
            <div className="chat-intro">
              <b>Hi {profile?.name || "there"} 👋</b>
              <span>Ask me about mandi prices, crops, or finding a market.</span>
            </div>
            {messages.map((m, i) => (
              <p className={i % 2 ? "user-message" : "assistant-message"} key={i}>{m}</p>
            ))}
            {chatLoading && <p className="assistant-message typing">Checking official data…</p>}
            <div className="chat-actions">
              <button onClick={() => askPrice("What is today's ginger price?")}>🫚 Ginger price</button>
              <button onClick={() => askPrice("What is today's tomato price?")}>🍅 Tomato price</button>
              <button onClick={() => askPrice("What is today's onion price?")}>🧅 Onion price</button>
              <button onClick={() => setPage("Prices")}>📊 All vegetable prices</button>
            </div>
          </div>
          <form onSubmit={send}>
            <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Try: ginger price in Karnataka…" />
            <button disabled={chatLoading} aria-label="Send">{chatLoading ? "…" : "↑"}</button>
          </form>
        </div>
      )}
    </div>
  )
}

// Supabase Authentication & Authorization Screen
function SupabaseAuthScreen({ lang, setLang, t, onAuthorized }) {
  const [mode, setMode] = useState("signin") // "signin" or "signup"
  const [selectedRole, setSelectedRole] = useState("Farmer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [district, setDistrict] = useState("Bengaluru Rural")
  const [state, setState] = useState("Karnataka")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const tSafe = (k) => (t ? t(k) : translations[lang]?.[k] || translations.English[k] || k)

  const quickDemoLogin = async (demoEmail, demoPassword, demoRole) => {
    setError("")
    setLoading(true)
    setEmail(demoEmail)
    setPassword(demoPassword)
    setSelectedRole(demoRole)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      })
      if (signInError) throw signInError
      if (data?.user) {
        const userMeta = data.user.user_metadata || {}
        onAuthorized(userMeta.role || demoRole, {
          id: data.user.id,
          email: data.user.email,
          ...userMeta
        })
      }
    } catch (err) {
      setError(err.message || "Demo login failed.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your full name.")
        if (phone.replace(/\D/g, "").length < 10) throw new Error("Please enter a valid 10-digit phone number.")
        if (cleanPassword.length < 6) throw new Error("Password must be at least 6 characters.")
        if (!state) throw new Error("Please choose your state.")

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              role: selectedRole,
              name: name.trim(),
              phone: phone.trim(),
              location: location.trim(),
              district: district.trim(),
              state: state.trim(),
              farmerId: selectedRole === "Farmer" ? "farmer-" + Date.now() : undefined,
              customerId: selectedRole === "Customer" ? "customer-" + Date.now() : undefined
            }
          }
        })

        if (signUpError) throw signUpError
        if (data?.user) {
          const userMeta = data.user.user_metadata || {}
          onAuthorized(selectedRole, {
            id: data.user.id,
            email: data.user.email,
            ...userMeta
          })
        }
      } else {
        // Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        })

        if (signInError) throw signInError
        if (data?.user) {
          const userMeta = data.user.user_metadata || {}
          const userRole = userMeta.role || selectedRole
          onAuthorized(userRole, {
            id: data.user.id,
            email: data.user.email,
            ...userMeta
          })
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="role-entry">
      <header>
        <a className="brand" href="#">
          <span className="brand-mark">f</span>farmezy<span className="brand-dot">.</span>
        </a>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span className="supabase-badge">
            {isSupabaseConfigured ? "⚡ Supabase Cloud Connected" : "⚡ Supabase Auth Active"}
          </span>
          <label>
            Language{" "}
            <select value={lang} onChange={e => setLang(e.target.value)}>
              {Object.keys(translations).map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
        </div>
      </header>

      <section className="profile-entry" style={{ maxWidth: 760, margin: "auto" }}>
        <div className="eyebrow">{tSafe("authTitle")}</div>
        <h1>{tSafe("authWelcome")}</h1>
        <p>{tSafe("authSub")}</p>

        {/* 1-Click Quick Demo Access Banner */}
        <div className="demo-accounts-bar">
          <small>⚡ <b>1-Click Demo Accounts:</b></small>
          <button
            type="button"
            className="btn-demo-pill"
            onClick={() => quickDemoLogin("farmer@farmezy.in", "farmer123", "Farmer")}
            disabled={loading}
          >
            🌾 {tSafe("demoFarmer")}
          </button>
          <button
            type="button"
            className="btn-demo-pill"
            onClick={() => quickDemoLogin("customer@farmezy.in", "customer123", "Customer")}
            disabled={loading}
          >
            🧺 {tSafe("demoCustomer")}
          </button>
        </div>

        <div className="auth-card">
          <div className="auth-role-tabs">
            <button
              type="button"
              className={selectedRole === "Farmer" ? "active" : ""}
              onClick={() => setSelectedRole("Farmer")}
            >
              🌾 {tSafe("farmer")} (Sell crops)
            </button>
            <button
              type="button"
              className={selectedRole === "Customer" ? "active" : ""}
              onClick={() => setSelectedRole("Customer")}
            >
              🧺 {tSafe("customer")} (Buy produce)
            </button>
          </div>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={mode === "signin" ? "selected" : ""}
              onClick={() => { setMode("signin"); setError("") }}
            >
              {tSafe("signIn")}
            </button>
            <button
              type="button"
              className={mode === "signup" ? "selected" : ""}
              onClick={() => { setMode("signup"); setError("") }}
            >
              {tSafe("signUp")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-body">
            {error && (
              <div className="auth-error-banner">
                <span>⚠ {error}</span>
                {mode === "signin" && error.toLowerCase().includes("not found") && (
                  <button
                    type="button"
                    className="link"
                    style={{ display: "block", marginTop: 6, color: "#9c27b0", textDecoration: "underline" }}
                    onClick={() => { setMode("signup"); setError("") }}
                  >
                    Click here to create a new account with this email →
                  </button>
                )}
                {mode === "signup" && error.toLowerCase().includes("already exists") && (
                  <button
                    type="button"
                    className="link"
                    style={{ display: "block", marginTop: 6, color: "#388e3c", textDecoration: "underline" }}
                    onClick={() => { setMode("signin"); setError("") }}
                  >
                    Click here to Sign In with your existing password →
                  </button>
                )}
              </div>
            )}

            {mode === "signup" && (
              <>
                <label>
                  Full name
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </label>
                <label>
                  Mobile phone number
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                  />
                </label>
              </>
            )}

            <label>
              Email address
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com (or farmer@farmezy.in)"
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </label>

            {mode === "signup" && (
              <>
                <label>
                  Village / Town or PIN code
                  <input
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Channasandra or 560067"
                  />
                </label>
                <label>
                  District
                  <input
                    required
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g. Bengaluru Rural, Chittoor"
                  />
                </label>
                <label className="wide">
                  State / Union Territory
                  <select required value={state} onChange={e => setState(e.target.value)}>
                    <option value="">Select your state</option>
                    {profileStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? "Authorizing with Supabase…"
                : mode === "signup"
                  ? `${tSafe("signUp")} & Continue as ${selectedRole} →`
                  : `${tSafe("signIn")} as ${selectedRole} →`}
            </button>
          </form>

          <div className="auth-footer-help">
            <small>
              {mode === "signin" ? (
                <>New to Farmezy? <a href="#" onClick={e => { e.preventDefault(); setMode("signup") }}>Create a new account</a></>
              ) : (
                <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode("signin") }}>Sign in here</a></>
              )}
            </small>
          </div>
        </div>
      </section>

      <footer>Grown with care, shared with trust ✳ · Secured with Supabase Authorization</footer>
    </main>
  )
}

const profileStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

function formatIndiaTime(value) {
  if (!value) return "Time unavailable"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Time unavailable"
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(date)
}

function Title({ eyebrow, title, sub }) {
  return (
    <div className="page-title">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  )
}

// Build comprehensive chatbot commodity matcher from the complete 609 AGMARKNET catalogue:
// 1. All 609 official AGMARKNET catalogue commodities, display names and trade aliases
// 2. Secondary layer: Multilingual & regional aliases from commodity-master.json
const commodityAliases = (() => {
  const map = new Map()

  // First add all 609 AGMARKNET commodities and their official aliases
  for (const item of agmarknetCatalogue?.commodities || []) {
    const canonicalName = item.name
    const key = canonicalName.toLowerCase()
    const aliasSet = new Set([key])
    if (item.agmarknet_name) aliasSet.add(item.agmarknet_name.toLowerCase())
    if (item.display_name) aliasSet.add(item.display_name.toLowerCase())
    if (Array.isArray(item.aliases)) {
      for (const a of item.aliases) aliasSet.add(String(a).toLowerCase())
    }
    map.set(key, {
      name: canonicalName,
      aliases: Array.from(aliasSet)
    })
  }

  // Secondary layer: augment with multilingual & trade aliases from commodity-master.json
  for (const item of commodityMaster || []) {
    const target = (agmarknetCatalogue?.commodities || []).find(
      c => c.name.toLowerCase() === item.commodity.toLowerCase() ||
           c.name.toLowerCase().replace(/[^a-z0-9]/g, "") === item.commodity.toLowerCase().replace(/[^a-z0-9]/g, "") ||
           (item.agmarknet_name && c.name.toLowerCase() === item.agmarknet_name.toLowerCase())
    )
    const targetName = target ? target.name : item.commodity
    const key = targetName.toLowerCase()
    const existing = map.get(key) || { name: targetName, aliases: [key] }
    const combinedAliases = new Set(existing.aliases)
    combinedAliases.add(item.commodity.toLowerCase())
    if (item.agmarknet_name) combinedAliases.add(item.agmarknet_name.toLowerCase())
    if (Array.isArray(item.aliases)) {
      for (const a of item.aliases) combinedAliases.add(String(a).toLowerCase())
    }
    existing.aliases = Array.from(combinedAliases)
    map.set(key, existing)
  }

  return Array.from(map.values()).sort((a, b) => {
    const maxA = Math.max(...a.aliases.map(x => x.length))
    const maxB = Math.max(...b.aliases.map(x => x.length))
    return maxB - maxA
  })
})()

const stateAliases = [
  { name: "Andhra Pradesh", aliases: ["andhra pradesh", "andhrapradesh", "andhra", "ap"] },
  { name: "Karnataka", aliases: ["karnataka", "ka", "kar"] },
  { name: "Tamil Nadu", aliases: ["tamil nadu", "tamilnadu", "tn"] },
  { name: "Telangana", aliases: ["telangana", "ts", "tg"] },
  { name: "Maharashtra", aliases: ["maharashtra", "mh", "maha"] },
  { name: "Uttar Pradesh", aliases: ["uttar pradesh", "up"] },
  { name: "Madhya Pradesh", aliases: ["madhya pradesh", "mp"] },
  { name: "Delhi", aliases: ["delhi", "new delhi", "nct"] },
  { name: "Punjab", aliases: ["punjab", "pb"] },
  { name: "Haryana", aliases: ["haryana", "hr"] },
  { name: "Rajasthan", aliases: ["rajasthan", "raj"] },
  { name: "Gujarat", aliases: ["gujarat", "guj"] },
  { name: "West Bengal", aliases: ["west bengal", "bengal", "wb"] },
  { name: "Kerala", aliases: ["kerala", "kl"] },
  { name: "Bihar", aliases: ["bihar"] },
  { name: "Odisha", aliases: ["odisha", "orissa"] }
]

function findCommodity(message) {
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ") + " "
  for (const item of commodityAliases) {
    for (const alias of item.aliases) {
      if (clean.includes(" " + alias + " ")) return item.name
    }
  }
  return null
}

function findVariety(message, commodityName) {
  if (!commodityName) return null
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ") + " "
  const cmdt = (agmarknetCatalogue?.commodities || []).find(
    c => c.name.toLowerCase() === commodityName.toLowerCase() ||
         (c.agmarknet_name && c.agmarknet_name.toLowerCase() === commodityName.toLowerCase())
  )
  if (!cmdt || !Array.isArray(cmdt.varieties)) return null
  for (const v of cmdt.varieties) {
    const vName = typeof v === "string" ? v : v.name
    if (!vName || vName.length < 3 || /^(other|general|local|faq|standard|normal)$/i.test(vName)) continue
    const vClean = vName.toLowerCase().replace(/[^a-z0-9]/g, " ")
    if (clean.includes(" " + vClean + " ")) {
      return vName
    }
  }
  return null
}

function findState(message) {
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ") + " "
  for (const item of stateAliases) {
    for (const alias of item.aliases) {
      if (clean.includes(" " + alias + " ")) return item.name
    }
  }
  return null
}

function findDistrict(message) {
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ") + " "
  const commonDistricts = [
    "bengaluru", "bangalore", "chittoor", "kolar", "ramanagara", "mysuru", "mysore",
    "belagavi", "hubli", "dharwad", "mumbai", "pune", "nashik", "aurangabad",
    "nagpur", "chennai", "coimbatore", "madurai", "hyderabad", "warangal", "guntur",
    "krishna", "visakhapatnam", "vijayawada", "agra", "lucknow", "kanpur", "varanasi",
    "jaipur", "jodhpur", "ahmedabad", "surat", "patna", "kolkata"
  ]
  for (const d of commonDistricts) {
    if (clean.includes(" " + d + " ")) {
      if (d === "bangalore") return "Bengaluru"
      if (d === "mysore") return "Mysuru"
      return d.charAt(0).toUpperCase() + d.slice(1)
    }
  }
  return null
}

async function getOfficialPriceAnswer(question, profile) {
  const q = question.toLowerCase().trim()
  if (/^(hi|hello|hey|namaste|vanakkam|namaskara)\b/.test(q)) {
    return "Namaste! 🙏 I can give you real-time official Government APMC wholesale prices for any vegetable, fruit, or grain across any Indian state or district. Ask me e.g. 'today tomato price in andhra' or 'ginger in bengaluru'."
  }
  if (/how.*(sell|list)|list.*crop|sell.*crop/.test(q)) {
    return "To sell on Farmezy: open List your harvest → take a live photo of your crop with camera → add variety, quantity, price, and pickup location → save it. Your crop will be listed instantly so buyers can request it."
  }
  if (/how.*(buy|request)|request.*crop|buy.*crop/.test(q)) {
    return "To buy on Farmezy: open Browse produce → browse available crops with photos & distances → click Buy / Request or contact the farmer directly via Phone or WhatsApp."
  }

  const commodity = findCommodity(question)
  const variety = findVariety(question, commodity)
  const queryState = findState(question)
  const queryDistrict = findDistrict(question)

  const state = queryState || profile?.state || "All India"
  const district = queryDistrict || (queryState ? "" : (profile?.district || ""))

  const params = new URLSearchParams({ limit: "50" })
  if (state && state !== "All India") params.set("state", state)
  if (commodity) params.set("commodity", commodity)
  if (variety) params.set("variety", variety)
  if (district) params.set("district", district)

  try {
    const response = await fetch("/api/mandi-prices?" + params)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Official prices service is unavailable.")
    const rows = Array.isArray(data.records) ? data.records : []
    if (!rows.length) {
      return `No current AGMARKNET price available for ${variety ? variety + " " : ""}${commodity || "this commodity"}${district ? " in " + district : ""}${state && state !== "All India" ? ", " + state : ""}. This crop/variety is officially recognized in the Government AGMARKNET catalogue, but no APMC market reported active trading arrivals today.`
    }
    const record = rows[0]
    return `Latest reported ${record.commodity}${record.variety ? " (" + record.variety + ")" : ""} wholesale price: ₹${Number(record.modal_price).toLocaleString("en-IN")} per quintal (₹${(Number(record.modal_price) / 100).toFixed(1)}/kg) at ${record.market} APMC, ${record.district}, ${record.state} (Arrival date: ${record.arrival_date || "today"}).`
  } catch (error) {
    return "I couldn't retrieve the official price right now. " + error.message
  }
}

function PriceForecast({ location, onPrices }) {
  const [commodity, setCommodity] = useState("Tomato")
  const [state, setState] = useState(location?.state || "Karnataka")
  const [district, setDistrict] = useState(location?.district || "")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const run = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const params = new URLSearchParams({ commodity, state, district, days: "7" })
      const response = await fetch("/api/price-forecast?" + params.toString())
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Forecast is not ready.")
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="official-filters">
        <label>
          Crop / commodity
          <input value={commodity} onChange={e => setCommodity(e.target.value)} placeholder="Tomato" />
        </label>
        <label>
          State
          <input value={state} onChange={e => setState(e.target.value)} placeholder="Karnataka" />
        </label>
        <label>
          District
          <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Optional" />
        </label>
        <button onClick={run} disabled={loading || !commodity || !state}>
          {loading ? "Preparing…" : "Predict price"}
        </button>
      </div>
      {error && (
        <div className="official-error">
          <b>Forecast not ready yet.</b>
          <p>{error}</p>
          <span>Farmezy trains price models on official historical mandi data.</span>
        </div>
      )}
      {result && (
        <div className="forecast-result">
          <h3>{result.commodity} · {result.state}</h3>
          <p>Last observed: <b>₹{Number(result.lastObserved.price).toLocaleString("en-IN")}/quintal</b> on {result.lastObserved.date}</p>
          <div className="forecast-cards">
            {result.predictions.map(item => (
              <article key={item.day}>
                <small>Day {item.day}</small>
                <b>₹{item.price.toLocaleString("en-IN")}</b>
                <span>Range ₹{item.lower.toLocaleString("en-IN")}–₹{item.upper.toLocaleString("en-IN")}</span>
              </article>
            ))}
          </div>
        </div>
      )}
      <button className="link" onClick={onPrices}>Check official observed prices →</button>
    </section>
  )
}

export default App

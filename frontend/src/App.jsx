import { useEffect, useState, useRef, useMemo } from "react"
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
  "Live Stock,Poultry,Fisheries",
  "Oils and Fats"
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
  ["Beverages", /coffee|tea|cocoa|chicory/i],
  ["Flowers", /marigold|rose|jasmine|chrysanthemum|shevanti|tuberose|gladiolus|carnation|gerbera/i],
  ["Forest Products", /honey|shahad|bamboo|gond|gum|lac|tamarind|chironji|behada|harrah|wood|timber/i],
  ["Live Stock,Poultry,Fisheries", /cow|cattle|bull|calf|buffalo|goat|sheep|chicken|cock|hen|duck|fish|prawn|crab|livestock/i],
  ["Oils and Fats", /oil|ghee|butter|fat|dalda|palmolein/i]
]

export function getCategoryForCrop(crop) {
  if (!crop) return ""
  const clean = String(crop).trim()
  if (Array.isArray(agmarknetCatalogue?.commodities)) {
    const norm = clean.toLowerCase().replace(/[^a-z0-9]/g, "")
    const found = agmarknetCatalogue.commodities.find(c => {
      if (String(c.name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) return true
      if (c.agmarknet_name && String(c.agmarknet_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) return true
      if (c.display_name && String(c.display_name).toLowerCase().replace(/[^a-z0-9]/g, "") === norm) return true
      if (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, "") === norm)) return true
      return false
    })
    if (found && (found.category || found.group_name)) {
      return found.category || found.group_name
    }
  }
  const match = CROP_CATEGORIES.find(([, regex]) => regex.test(clean))
  return match ? match[0] : ""
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
  const [formVarietySearch, setFormVarietySearch] = useState("")
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
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Namaste! 🙏 I am your **Farmezy Smart Assistant**.\n\nHere is how I can help you:\n• **Mandi Prices**: Ask for any crop price in your area or across India (e.g. *Tomato price*, *Onion in Nashik*, *Garlic in Mandsaur*)\n• **7-Day Weather**: Ask for upcoming rainfall and temperatures (e.g. *Weather forecast*, *Weather in Shimla*, *Will it rain in Pune?*)\n• **Farming Q&A**: Ask about fertilizers, pest management, storage, or how to sell on Farmezy.",
      time: "Just now"
    }
  ])
  const chatMessagesEndRef = useRef(null)

  useEffect(() => {
    if (chat) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, chat, chatLoading])
  const [showRoleAuthModal, setShowRoleAuthModal] = useState(false)
  const [roleAuthError, setRoleAuthError] = useState("")
  const [roleAuthLoading, setRoleAuthLoading] = useState(false)
  const [customerNotifications, setCustomerNotifications] = useState([])
  const orderStatusesRef = useRef(new Map())
  const initialOrdersLoadedRef = useRef(false)
  const notifiedKeysRef = useRef(new Set())

  // Customer / Buyer Marketplace Filter States
  const [browseSearch, setBrowseSearch] = useState("")
  const [browseCategory, setBrowseCategory] = useState("All Categories")
  const [browseCommodity, setBrowseCommodity] = useState("All Commodities")
  const [browseVariety, setBrowseVariety] = useState("All Varieties")
  const [browseVarietySearch, setBrowseVarietySearch] = useState("")
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
        setCustomerNotifications([])
        orderStatusesRef.current = new Map()
        initialOrdersLoadedRef.current = false
        notifiedKeysRef.current = new Set()
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
    setCustomerNotifications([])
    orderStatusesRef.current = new Map()
    initialOrdersLoadedRef.current = false
    notifiedKeysRef.current = new Set()
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
      const freshOrders = Array.isArray(data.orders) ? data.orders.map(order => ({ ...order, status: order.status === "new" ? "Requested" : order.status })) : []
      setOrders(freshOrders)
      if (role === "Customer") {
        freshOrders.forEach(o => {
          if (!orderStatusesRef.current.has(o.id)) {
            orderStatusesRef.current.set(o.id, o.status)
          }
        })
      }
    } catch (error) {
      setListingError(error.message)
    }
  }

  useEffect(() => {
    if (role) {
      loadOrders()
    }
  }, [role])

  const dismissNotification = id => {
    setCustomerNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Auto-dismiss oldest notification after 15 seconds
  useEffect(() => {
    if (customerNotifications.length === 0) return
    const timer = setTimeout(() => {
      setCustomerNotifications(prev => prev.slice(1))
    }, 15000)
    return () => clearTimeout(timer)
  }, [customerNotifications])

  // Lightweight polling of customer orders every 20s while customer is active
  useEffect(() => {
    if (role !== "Customer" || !customerId) return

    let isMounted = true

    const pollCustomerOrders = async () => {
      if (typeof document !== "undefined" && document.hidden) return
      try {
        const response = await fetch("/api/orders?customerId=" + encodeURIComponent(customerId))
        if (!response.ok) return
        const data = await response.json()
        if (!isMounted || !Array.isArray(data.orders)) return

        const freshOrders = data.orders.map(order => ({
          ...order,
          status: order.status === "new" ? "Requested" : order.status
        }))

        if (initialOrdersLoadedRef.current) {
          const prevStatuses = orderStatusesRef.current
          const newNotifications = []

          for (const order of freshOrders) {
            const prevStatus = prevStatuses.get(order.id)
            const newStatus = order.status
            const notifyKey = `${order.id}:${newStatus}`

            if (
              prevStatus === "Requested" &&
              (newStatus === "Accepted" || newStatus === "Rejected") &&
              !notifiedKeysRef.current.has(notifyKey)
            ) {
              notifiedKeysRef.current.add(notifyKey)
              newNotifications.push({
                id: `${order.id}-${newStatus}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                orderId: order.id,
                farmerName: order.farmerName || "Farmer",
                crop: order.crop,
                quantity: order.quantity,
                unit: order.unit,
                status: newStatus,
                timestamp: Date.now()
              })
            }
          }

          if (newNotifications.length > 0) {
            setCustomerNotifications(prev => [...prev, ...newNotifications])
          }
        } else {
          // Initial baseline: mark existing accepted/rejected orders as already handled
          freshOrders.forEach(o => {
            if (o.status === "Accepted" || o.status === "Rejected") {
              notifiedKeysRef.current.add(`${o.id}:${o.status}`)
            }
          })
          initialOrdersLoadedRef.current = true
        }

        const updatedMap = new Map()
        freshOrders.forEach(o => updatedMap.set(o.id, o.status))
        orderStatusesRef.current = updatedMap

        setOrders(freshOrders)
      } catch {
        // Silent catch for background polling
      }
    }

    pollCustomerOrders()

    const intervalId = setInterval(pollCustomerOrders, 20000)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        pollCustomerOrders()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      isMounted = false
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [role, customerId])

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
    (c.display_name && c.display_name.toLowerCase() === browseCommodity.toLowerCase()) ||
    (c.agmarknet_name && c.agmarknet_name.toLowerCase() === browseCommodity.toLowerCase()) ||
    (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase() === browseCommodity.toLowerCase()))
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
    (c.agmarknet_name && c.agmarknet_name.toLowerCase() === (formCrop || "").trim().toLowerCase()) ||
    (Array.isArray(c.aliases) && c.aliases.some(a => String(a).toLowerCase() === (formCrop || "").trim().toLowerCase()))
  )

  const registeredFormVarieties = selectedFormCommodityObj
    ? (selectedFormCommodityObj.variety_names || (selectedFormCommodityObj.varieties || []).map(v => typeof v === "string" ? v : v.name)).filter(Boolean)
    : []

  const registeredFormGrades = selectedFormCommodityObj?.grades?.length
    ? selectedFormCommodityObj.grades
    : ["FAQ", "Grade A", "Grade B", "Grade C", "Local", "Export Quality", "Premium"]

  const displayedFormVarieties = registeredFormVarieties.filter(v => {
    if (!formVarietySearch.trim()) return true
    const q = formVarietySearch.toLowerCase().replace(/[^a-z0-9]/g, "")
    return v.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)
  })

  const displayedMarketplaceVarieties = marketplaceVarieties.filter(v => {
    if (v === "All Varieties") return true
    if (!browseVarietySearch.trim()) return true
    const q = browseVarietySearch.toLowerCase().replace(/[^a-z0-9]/g, "")
    return v.toLowerCase().replace(/[^a-z0-9]/g, "").includes(q)
  })
  const clearFilters = () => {
    setBrowseSearch("")
    setBrowseCategory("All Categories")
    setBrowseCommodity("All Commodities")
    setBrowseVariety("All Varieties")
    setBrowseVarietySearch("")
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
    ...(role === "Farmer" ? [[t("sell"), "Sell", "+"]] : [[t("browse"), "Browse", "🧺"]]),
    ...(role === "Farmer" ? [[t("requests"), "Requests", "✓"]] : [[t("myRequests"), "Orders", "▣"]])
  ]

  const askPrice = async question => {
    const text = question.trim()
    if (!text) return
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg = {
      id: "u_" + Date.now(),
      sender: "user",
      text,
      time: nowTime
    }
    setMessages(current => [...current, userMsg])
    setChatLoading(true)

    try {
      const reply = await getAssistantAnswer(text, profile, formLocation)
      const botMsg = {
        id: "b_" + (Date.now() + 1),
        sender: "bot",
        text: reply.text || "",
        weatherData: reply.weatherData || null,
        priceData: reply.priceData || null,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages(current => [...current, botMsg])
    } catch (err) {
      setMessages(current => [
        ...current,
        {
          id: "b_" + (Date.now() + 1),
          sender: "bot",
          text: "I ran into a temporary issue retrieving data: " + (err.message || "Please try again."),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ])
    } finally {
      setChatLoading(false)
    }
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
          {role === "Customer" && customerNotifications.length > 0 && (
            <div className="customer-notifications-container">
              {customerNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`customer-status-banner ${notification.status === "Accepted" ? "accepted" : "rejected"}`}
                >
                  <div className="banner-content">
                    <span className="banner-icon">{notification.status === "Accepted" ? "✓" : "✕"}</span>
                    <span>
                      <b>{notification.farmerName}</b> has{" "}
                      <b>{notification.status}</b> your request for <b>{notification.crop}</b>
                      {notification.quantity ? ` (${notification.quantity} ${notification.unit || "kg"})` : ""}.
                    </span>
                  </div>
                  <div className="banner-actions">
                    <button
                      type="button"
                      className="banner-link"
                      onClick={() => {
                        setPage("Orders")
                        dismissNotification(notification.id)
                      }}
                    >
                      View in My Requests →
                    </button>
                    <button
                      type="button"
                      className="banner-close"
                      onClick={() => dismissNotification(notification.id)}
                      aria-label="Dismiss notification"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                            <img
                              src={item.image}
                              alt={item.crop}
                              style={{ width: 28, height: 28, borderRadius: 5, objectFit: "cover" }}
                              onError={e => {
                                if (e.currentTarget.src !== "/placeholder.png") {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = "/placeholder.png"
                                }
                              }}
                            />
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
                        setBrowseVarietySearch("")
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>3. Variety {marketplaceVarieties.length > 1 ? `(${marketplaceVarieties.length - 1})` : ""}</label>
                      {browseVariety !== "All Varieties" && (
                        <button
                          type="button"
                          onClick={() => setBrowseVariety("All Varieties")}
                          style={{ border: 0, background: "none", color: "#34794b", cursor: "pointer", fontSize: 9, padding: 0, textDecoration: "underline" }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {marketplaceVarieties.length > 15 && (
                      <input
                        type="text"
                        placeholder="Search variety..."
                        value={browseVarietySearch}
                        onChange={e => setBrowseVarietySearch(e.target.value)}
                        style={{ marginBottom: 4 }}
                      />
                    )}
                    <select
                      value={browseVariety}
                      onChange={e => setBrowseVariety(e.target.value)}
                    >
                      {displayedMarketplaceVarieties.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                      {browseVariety !== "All Varieties" && !displayedMarketplaceVarieties.includes(browseVariety) && (
                        <option value={browseVariety}>{browseVariety} (selected)</option>
                      )}
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
                          <div className="listing-photo-thumb-container">
                            <div
                              className="listing-photo-thumb"
                              onClick={() => { setBuyItem(item); setBuyQuantity("") }}
                              style={{ cursor: "pointer" }}
                              title={`Click to view/request ${item.crop}`}
                            >
                              <img
                                src={item.image}
                                alt={item.crop}
                                onError={e => {
                                  if (e.currentTarget.src !== "/placeholder.png") {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = "/placeholder.png"
                                  }
                                }}
                              />
                              {item.imageSource === "farmer" && (
                                <span className="listing-photo-badge" title="Harvest photo uploaded by farmer">📸 Farmer</span>
                              )}
                            </div>
                            {item.imagePhotographer && item.imageLink && (
                              <a
                                href={item.imageLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="listing-photo-credit"
                                onClick={e => e.stopPropagation()}
                                title={`Photo by ${item.imagePhotographer} on Unsplash`}
                              >
                                Photo: {item.imagePhotographer.replace(/\s*\(Unsplash\)/i, "")}
                              </a>
                            )}
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
                            <button
                              type="button"
                              className="btn-action-buy"
                              onClick={() => {
                                setBuyItem(item)
                                setBuyQuantity("")
                                setTimeout(() => {
                                  document.getElementById("produce-request-panel")?.scrollIntoView({ behavior: "smooth" })
                                }, 50)
                              }}
                            >
                              🧺 {t("buyRequest")}
                            </button>
                            {contactPhone(item) && phoneUrl(contactPhone(item)) && (
                              <a href={phoneUrl(contactPhone(item))} className="btn-action-link">📞 {t("call")}</a>
                            )}
                            {contactPhone(item) && whatsappUrl(contactPhone(item)) && (
                              <button
                                type="button"
                                className="btn-action-link"
                                onClick={() => {
                                  setBuyItem(item)
                                  setBuyQuantity("")
                                  setTimeout(() => {
                                    document.getElementById("produce-request-panel")?.scrollIntoView({ behavior: "smooth" })
                                  }, 50)
                                }}
                              >
                                💬 {t("whatsapp")}
                              </button>
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
                <section id="produce-request-panel" className="panel form-panel request-panel">
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
                          const phone = contactPhone(buyItem) || buyItem.farmerPhone || ""
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
                              farmerPhone: phone,
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
                          const url = whatsappUrl(phone, text)
                          if (!url) {
                            alert("Request saved, but this farmer has not added a valid WhatsApp number yet.")
                          } else {
                            try {
                              const win = window.open(url, "_blank", "noopener,noreferrer")
                              if (!win || win.closed || typeof win.closed === "undefined") {
                                window.location.href = url
                              }
                            } catch {
                              window.location.href = url
                            }
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
              <Title eyebrow="MARKET OUTLOOK" title="Predict upcoming mandi prices." sub="Analyze short-term price momentum and 7-day upcoming daily forecasts for major crops and APMC mandis across India." />
              <PriceForecast location={profile} onPrices={() => setPage("Prices")} />
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
                      <img
                        src={listing.image}
                        alt={listing.crop}
                        style={{ width: 120, height: 120, borderRadius: 8, objectFit: "cover" }}
                        onError={e => {
                          if (e.currentTarget.src !== "/placeholder.png") {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = "/placeholder.png"
                          }
                        }}
                      />
                      {listing.imageSource === "farmer" ? (
                        <div style={{ marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: "#2d6e42", fontWeight: 600 }}>📸 Your harvest photo</span>
                        </div>
                      ) : listing.imagePhotographer && listing.imageLink ? (
                        <div style={{ marginTop: 4 }}>
                          <a
                            href={listing.imageLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="listing-photo-credit"
                            style={{ display: "inline-block", fontSize: 10, maxWidth: "none" }}
                          >
                            Photo by {listing.imagePhotographer} on Unsplash
                          </a>
                        </div>
                      ) : null}
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
                              setFormVarietySearch("")
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>Variety</span>
                          {formVariety && (
                            <button
                              type="button"
                              onClick={() => { setFormVariety(""); setFormCustomVariety(""); setFormVarietySearch("") }}
                              style={{ border: 0, background: "none", color: "#34794b", cursor: "pointer", fontSize: 9, padding: 0, textDecoration: "underline" }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {registeredFormVarieties.length > 0 ? (
                          <div className="variety-selection-group">
                            {registeredFormVarieties.length > 10 && (
                              <input
                                type="text"
                                placeholder={`Search among ${registeredFormVarieties.length} official varieties...`}
                                value={formVarietySearch}
                                onChange={e => setFormVarietySearch(e.target.value)}
                                style={{ marginBottom: 6 }}
                              />
                            )}
                            <select
                              value={formVariety}
                              onChange={e => {
                                setFormVariety(e.target.value)
                                if (e.target.value !== "__custom__") {
                                  setFormCustomVariety("")
                                }
                              }}
                            >
                              <option value="">
                                {displayedFormVarieties.length > 0
                                  ? (formVarietySearch
                                      ? `-- ${displayedFormVarieties.length} matching varieties --`
                                      : `-- Select official registered variety (${registeredFormVarieties.length} available) --`)
                                  : `-- No varieties match "${formVarietySearch}" --`}
                              </option>
                              {displayedFormVarieties.map(v => {
                                const varObj = selectedFormCommodityObj?.varieties?.find(item => (typeof item === 'string' ? item : item.name) === v)
                                const typeTag = varObj?.variety_type === 'breed' ? ' (Breed)' : (varObj?.variety_type === 'species' ? ' (Species)' : (varObj?.variety_type === 'product_type' ? ' (Product Type)' : (varObj?.variety_type === 'grade' ? ' (Grade)' : '')))
                                return (
                                  <option key={v} value={v}>{v}{typeTag}</option>
                                )
                              })}
                              {formVariety && formVariety !== "__custom__" && !displayedFormVarieties.includes(formVariety) && (
                                <option value={formVariety}>{formVariety} (selected)</option>
                              )}
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
                          <div className="variety-manual-entry">
                            {formCrop && (
                              <small style={{ display: "block", color: "#64748b", fontSize: "11px", marginBottom: "4px" }}>
                                ℹ️ No verified variety information available. Please describe your harvest variety or type below:
                              </small>
                            )}
                            <input
                              type="text"
                              placeholder="e.g. Local, Hybrid, Desi..."
                              value={formVariety}
                              onChange={e => setFormVariety(e.target.value)}
                            />
                          </div>
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
                          <div className="listing-photo-thumb-container">
                            <div className="listing-photo-thumb">
                              <img
                                src={item.image}
                                alt={item.crop}
                                onError={e => {
                                  if (e.currentTarget.src !== "/placeholder.png") {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = "/placeholder.png"
                                  }
                                }}
                              />
                              {item.imageSource === "farmer" && (
                                <span className="listing-photo-badge" title="Harvest photo uploaded by farmer">📸 Farmer</span>
                              )}
                            </div>
                            {item.imagePhotographer && item.imageLink && (
                              <a
                                href={item.imageLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="listing-photo-credit"
                                onClick={e => e.stopPropagation()}
                                title={`Photo by ${item.imagePhotographer} on Unsplash`}
                              >
                                Photo: {item.imagePhotographer.replace(/\s*\(Unsplash\)/i, "")}
                              </a>
                            )}
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
          <header style={{ padding: "14px 16px", background: "linear-gradient(135deg, #eef7ec 0%, #f6faf4 100%)", borderBottom: "1px solid #e2ebe0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🌾</span>
              <div>
                <b style={{ fontSize: "13px", color: "#1e3822", display: "block" }}>Farmezy Smart Assistant</b>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "#45724b" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                  Online • Mandi Rates, 7-Day Weather & Advice
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                title="Clear chat"
                onClick={() => setMessages([
                  {
                    id: 1,
                    sender: "bot",
                    text: "Namaste! 🙏 Chat history cleared. How can I assist you with mandi prices, weather forecasts, or crop advice today?",
                    time: "Just now"
                  }
                ])}
                style={{ border: 0, background: "none", fontSize: "13px", cursor: "pointer", color: "#687a6c", padding: "4px" }}
              >
                🗑️
              </button>
              <button
                type="button"
                onClick={() => setChat(false)}
                aria-label="Close chat"
                style={{ border: 0, background: "none", fontSize: "18px", cursor: "pointer", color: "#4f6353", padding: "2px 6px" }}
              >
                ×
              </button>
            </div>
          </header>

          <div className="chat-messages" style={{ padding: "14px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "#fcfdfc" }}>
            <div className="chat-intro" style={{ background: "#f1f7ef", border: "1px solid #e1ebe0", borderRadius: "12px", padding: "11px 13px", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px" }}>
              <b style={{ fontSize: "12px", color: "#26432b" }}>Hi {profile?.name || "Farmer / Partner"} 👋</b>
              <span style={{ fontSize: "10px", color: "#637765", lineHeight: "1.5" }}>
                Ask me about today's prices in your area (e.g. <i>"Tomato price"</i>), 7-day weather (<i>"Weather forecast"</i>), or prices anywhere in India (<i>"Onion in Nashik"</i>).
              </span>
            </div>

            {messages.map((m) => {
              const isUser = m.sender === "user"
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    gap: "8px",
                    width: "100%",
                    margin: "4px 0"
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#e8f4e6",
                      color: "#2b703e",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "14px",
                      flexShrink: 0,
                      border: "1px solid #d3e7d0",
                      marginTop: "2px"
                    }}>
                      🌾
                    </div>
                  )}

                  <div style={{
                    background: isUser ? "linear-gradient(135deg, #2e7d32 0%, #1e5e23 100%)" : "#ffffff",
                    color: isUser ? "#ffffff" : "#1f2937",
                    border: isUser ? "none" : "1px solid #e1e8dd",
                    borderRadius: isUser ? "16px 16px 3px 16px" : "16px 16px 16px 3px",
                    padding: "10px 13px",
                    maxWidth: isUser ? "78%" : "84%",
                    boxShadow: isUser ? "0 2px 6px rgba(46,125,50,0.22)" : "0 2px 7px rgba(0,0,0,0.04)",
                    fontSize: "11.5px",
                    lineHeight: "1.5",
                    wordBreak: "break-word"
                  }}>
                    {isUser ? (
                      <div>{m.text}</div>
                    ) : (
                      <>
                        {formatBotMessage(m.text)}
                        {m.weatherData && renderWeatherPreview(m.weatherData)}
                      </>
                    )}
                    <div style={{
                      fontSize: "8.5px",
                      color: isUser ? "#bbf7d0" : "#9ca3af",
                      textAlign: isUser ? "right" : "left",
                      marginTop: "4px"
                    }}>
                      {m.time}
                    </div>
                  </div>
                </div>
              )
            })}

            {chatLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#e8f4e6",
                  color: "#2b703e",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "14px",
                  flexShrink: 0
                }}>
                  🌾
                </div>
                <div style={{
                  background: "#ffffff",
                  border: "1px solid #e1e8dd",
                  borderRadius: "16px 16px 16px 3px",
                  padding: "8px 12px",
                  fontSize: "11px",
                  color: "#5f7263",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  <span>Fetching live data…</span>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="chat-actions" style={{ display: "flex", gap: "6px", flexWrap: "wrap", overflowX: "auto", padding: "6px 10px 4px", background: "#f8faf7", borderTop: "1px solid #edf2eb" }}>
            <button type="button" onClick={() => askPrice("What is today's tomato price in my area?")}>🍅 Tomato in my area</button>
            <button type="button" onClick={() => askPrice("What is today's onion price in my area?")}>🧅 Onion in my area</button>
            <button type="button" onClick={() => askPrice("What is the 7-day weather forecast?")}>⛅ 7-Day Weather</button>
            <button type="button" onClick={() => askPrice("What is today's garlic price in Mandsaur?")}>🧄 Garlic in Mandsaur</button>
            <button type="button" onClick={() => askPrice("How to control tomato blight pest?")}>🌱 Pest control</button>
            <button type="button" onClick={() => setPage("Prices")}>📊 Mandi table</button>
          </div>

          <form onSubmit={send} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ffffff", padding: "10px 12px", borderTop: "1px solid #ebeee9" }}>
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="Ask: crop price, 7-day weather, or farming advice..."
              style={{ flex: 1, border: "1px solid #dce5da", borderRadius: "20px", padding: "9px 14px", fontSize: "11.5px", outline: "none", background: "#f9fbf9" }}
            />
            <button disabled={chatLoading} aria-label="Send message" style={{ width: "34px", height: "34px", borderRadius: "50%", border: 0, background: "#2e7d32", color: "#ffffff", fontSize: "14px", fontWeight: 700, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {chatLoading ? "…" : "↑"}
            </button>
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

// =========================================================================
// STATE TO DISTRICT MAPPING FOR DYNAMIC DROPDOWNS & LOCALIZED CHAT INTELLIGENCE
// =========================================================================
const STATE_DISTRICTS_MAP = {
  "Karnataka": [
    "Bengaluru Urban", "Bengaluru Rural", "Kolar", "Chikkaballapura", "Ramanagara", 
    "Belagavi", "Mysuru", "Mandya", "Tumakuru", "Hassan", "Shivamogga", "Davanagere", 
    "Ballari", "Haveri", "Dharwad", "Kalaburagi", "Vijayapura", "Raichur", "Udupi", 
    "Dakshina Kannada", "Bagalkote", "Chitradurga", "Gadag", "Koppal", "Yadgir", 
    "Kodagu", "Chamarajanagar", "Chikkamagaluru", "Uttara Kannada"
  ],
  "Maharashtra": [
    "Pune", "Nashik", "Ahmednagar", "Nagpur", "Solapur", "Kolhapur", "Chhatrapati Sambhajinagar", 
    "Jalgaon", "Satara", "Sangli", "Amravati", "Nanded", "Latur", "Dhule", "Buldhana", 
    "Akola", "Yavatmal", "Dharashiv", "Thane", "Palghar", "Raigad", "Ratnagiri", 
    "Sindhudurg", "Jalna", "Parbhani", "Beed", "Wardha", "Chandrapur"
  ],
  "Andhra Pradesh": [
    "Chittoor", "Anantapur", "Kurnool", "Guntur", "Krishna", "East Godavari", "West Godavari", 
    "Visakhapatnam", "Prakasam", "Nellore", "YSR Kadapa", "Srikakulam", "Vizianagaram"
  ],
  "Telangana": [
    "Hyderabad", "Ranga Reddy", "Medchal", "Warangal", "Nizamabad", "Karimnagar", 
    "Khammam", "Mahabubnagar", "Medak", "Nalgonda", "Adilabad", "Suryapet"
  ],
  "Tamil Nadu": [
    "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Erode", "Tirunelveli", "Thanjavur", 
    "Dindigul", "Vellore", "Dharmapuri", "Krishnagiri", "Theni", "Cuddalore", "Villupuram", 
    "Kanchipuram", "Tiruvallur", "Tiruppur", "Namakkal"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur Nagar", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly", 
    "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Mathura", "Muzaffarnagar", 
    "Ayodhya", "Barabanki", "Sitapur", "Hardoi"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "SAS Nagar (Mohali)", 
    "Firozpur", "Sangrur", "Fazilka", "Mansa", "Gurdaspur", "Moga", "Kapurthala", "Fatehgarh Sahib"
  ],
  "Haryana": [
    "Karnal", "Ambala", "Hisar", "Rohtak", "Panipat", "Sonipat", "Sirsa", "Kurukshetra", 
    "Jind", "Yamunanagar", "Faridabad", "Gurugram", "Bhiwani", "Fatehabad", "Kaithal"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", 
    "Ratlam", "Rewa", "Khargone", "Mandsaur", "Neemuch", "Chhindwara", "Sehore", "Narmadapuram"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", 
    "Gandhinagar", "Anand", "Mehsana", "Sabarkantha", "Banaskantha", "Kutch", "Amreli", "Bharuch"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", 
    "Sri Ganganagar", "Bharatpur", "Sikar", "Pali", "Nagaur", "Hanumangarh", "Chittorgarh"
  ],
  "Kerala": [
    "Ernakulam", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam", "Palakkad", 
    "Alappuzha", "Kannur", "Kottayam", "Malappuram", "Idukki", "Wayanad", "Kasaragod", "Pathanamthitta"
  ],
  "Bihar": [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Purnia", "Darbhanga", "Bihar Sharif", 
    "Arrah", "Begusarai", "Katihar", "Samastipur", "Vaishali", "Siwan", "Saran"
  ],
  "West Bengal": [
    "Kolkata", "North 24 Parganas", "South 24 Parganas", "Howrah", "Hooghly", "Purba Medinipur", 
    "Paschim Medinipur", "Burdwan", "Nadia", "Murshidabad", "Malda", "Darjeeling", "Jalpaiguri"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kullu", "Mandi", "Kangra", "Solan", "Sirmaur", "Chamba", "Hamirpur", "Una", "Bilaspur"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Pauri Garhwal", "Tehri Garhwal", "Almora"
  ],
  "Odisha": [
    "Khurda", "Cuttack", "Ganjam", "Balasore", "Bhadrak", "Puri", "Sambalpur", "Bargarh", "Angul", "Mayurbhanj"
  ],
  "Assam": [
    "Kamrup", "Kamrup Metropolitan", "Nagaon", "Sonitpur", "Dibrugarh", "Cachar", "Barpeta", "Dhubri"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Korba", "Raigarh", "Janjgir-Champa", "Bastar"
  ],
  "Jharkhand": [
    "Ranchi", "East Singhbhum", "Dhanbad", "Bokaro", "Hazaribagh", "Palamu", "Deoghar", "Giridih"
  ]
};

// Flattened lookup array of all Indian districts sorted longest-first
const ALL_DISTRICTS_LOOKUP = (() => {
  const list = [];
  for (const [st, dists] of Object.entries(STATE_DISTRICTS_MAP)) {
    for (const d of dists) {
      list.push({ district: d, state: st, lower: d.toLowerCase() });
    }
  }
  return list.sort((a, b) => b.lower.length - a.lower.length);
})();

// Primary Indian Agricultural Commodity & Multilingual Synonym Master
const CANONICAL_COMMODITIES = [
  // Spices & Condiments
  { name: "Ginger", aliases: ["ginger", "fresh ginger", "dry ginger", "green ginger", "adrak", "inji", "shunti", "allam", "aale", "ginger green"] },
  { name: "Garlic", aliases: ["garlic", "lehsun", "lahsun", "bellulli", "poondu", "vellulli", "lasun"] },
  { name: "Turmeric", aliases: ["turmeric", "haldi", "arishina", "manjal", "pasupu", "hardi"] },
  { name: "Chilli", aliases: ["chilli", "chili", "green chilli", "dry chilli", "red chilli", "mirchi", "hari mirchi", "lal mirchi", "milagai", "menasinakai", "mirapakaya", "marcha", "chillies"] },
  { name: "Black Pepper", aliases: ["black pepper", "pepper", "kali mirch", "kare menasu", "kurumulaku", "milagu", "miri"] },
  { name: "Cardamom", aliases: ["cardamom", "elaichi", "elakki", "elakkai", "yelakulu"] },
  { name: "Cumin", aliases: ["cumin", "jeera", "jeerige", "seeragam", "jeelakarra"] },
  { name: "Coriander", aliases: ["coriander", "dhaniya", "kothambari", "kothamalli", "kothimira"] },
  { name: "Fenugreek", aliases: ["fenugreek", "methi", "menthya", "vendhayam", "menthulu"] },

  // Vegetables
  { name: "Tomato", aliases: ["tomato", "tomatoes", "tamatar", "thakkali", "tamata", "tamate"] },
  { name: "Onion", aliases: ["onion", "onions", "pyaz", "kanda", "vengayam", "eerulli", "ullipaya", "dungri"] },
  { name: "Potato", aliases: ["potato", "potatoes", "aloo", "alu", "batata", "urulaikizhangu", "alugadde", "bangaladumpa"] },
  { name: "Brinjal", aliases: ["brinjal", "eggplant", "aubergine", "baingan", "kathirikai", "badanekai", "vankaya", "vangi"] },
  { name: "Bhindi", aliases: ["bhindi", "okra", "ladies finger", "lady finger", "ladiesfinger", "bhendi", "vendakkai", "bendakaya"] },
  { name: "Cabbage", aliases: ["cabbage", "patta gobhi", "bandha gobhi", "muttakose", "kobi"] },
  { name: "Cauliflower", aliases: ["cauliflower", "phool gobhi", "gobi", "gobhi", "cauli", "hoo kosu"] },
  { name: "Carrot", aliases: ["carrot", "gajar", "gajjari"] },
  { name: "Capsicum", aliases: ["capsicum", "bell pepper", "shimla mirch", "doddamenasinakayi", "kuda milagai"] },
  { name: "Beetroot", aliases: ["beetroot", "beet"] },
  { name: "Radish", aliases: ["radish", "mooli", "mullangi"] },
  { name: "Cucumber", aliases: ["cucumber", "kheera", "kakdi", "southekayi", "vellarikka", "dosakaya"] },
  { name: "Bottle Gourd", aliases: ["bottle gourd", "lauki", "ghiya", "doodhi", "sorekayi", "sorakaya", "suraikkai"] },
  { name: "Bitter Gourd", aliases: ["bitter gourd", "karela", "hagalakayi", "pavakkai", "kakarakaya", "karle"] },
  { name: "Ridge Gourd", aliases: ["ridge gourd", "tori", "turai", "hirekayi", "peerkangai", "beerakaya"] },
  { name: "Snake Gourd", aliases: ["snake gourd", "chichinda", "padavalakai", "pudalangai", "potlakaya"] },
  { name: "Drumstick", aliases: ["drumstick", "moringa", "sahjan", "murungakkai", "nuggekayi", "munagakaya", "shevaga"] },
  { name: "French Beans", aliases: ["beans", "french beans", "green beans", "frasbean", "huralikayi"] },
  { name: "Cluster Beans", aliases: ["cluster beans", "guar", "gawar", "gorikayi", "kothavara", "goruchikkudu"] },
  { name: "Green Peas", aliases: ["peas", "green peas", "matar", "batani", "pattani"] },
  { name: "Spinach", aliases: ["spinach", "palak", "pasalai", "palakura"] },
  { name: "Elephant Yam", aliases: ["yam", "elephant yam", "suran", "jimikand", "suvarna gedde", "chenai"] },

  // Fruits
  { name: "Apple", aliases: ["apple", "apples", "seb", "sebu", "aapple"] },
  { name: "Banana", aliases: ["banana", "bananas", "kela", "baale", "vazhaipazham", "arati pandu", "green banana", "plantain", "raw banana", "kachha kela", "vazhaikkai", "baalekayi"] },
  { name: "Mango", aliases: ["mango", "mangoes", "aam", "mavu", "manga", "mamidikaya", "kairi"] },
  { name: "Pomegranate", aliases: ["pomegranate", "anar", "dalimbe", "danimma", "mathulai", "dalimb"] },
  { name: "Watermelon", aliases: ["watermelon", "water melon", "tarbooz", "tarbuj", "kallangadi", "darboos"] },
  { name: "Muskmelon", aliases: ["muskmelon", "musk melon", "kharbooza", "kharbuja", "chibuda"] },
  { name: "Papaya", aliases: ["papaya", "papita", "pappali", "boppayi", "parangi"] },
  { name: "Guava", aliases: ["guava", "amrood", "perakka", "koyyapazham", "sebe", "jamakaya"] },
  { name: "Orange", aliases: ["orange", "santra", "kithale", "kamala orange"] },
  { name: "Mosambi", aliases: ["mosambi", "sweet lime", "moushumi", "battayi"] },
  { name: "Chikoo", aliases: ["chikoo", "chiku", "sapota", "sapodilla"] },
  { name: "Grapes", aliases: ["grapes", "angoor", "drakshi", "thiratchai", "draksha"] },
  { name: "Pineapple", aliases: ["pineapple", "ananas", "anasa pandu"] },
  { name: "Amla", aliases: ["amla", "gooseberry", "nelli kai", "nellikai", "usirikaya"] },
  { name: "Coconut", aliases: ["coconut", "nariyal", "thengai", "tenginakayi", "kobbari", "copra"] },

  // Grains & Cereals
  { name: "Wheat", aliases: ["wheat", "gehun", "gehu", "godhi", "godhumai", "godhumalu"] },
  { name: "Paddy (Rice)", aliases: ["rice", "paddy", "chawal", "dhan", "bhatta", "arisi", "akki", "vari", "nellu"] },
  { name: "Maize", aliases: ["maize", "corn", "makka", "bhutta", "musukina jola", "cholam", "mokka jonna"] },
  { name: "Bajra", aliases: ["bajra", "pearl millet", "sajje", "kambu", "sajjalu"] },
  { name: "Jowar", aliases: ["jowar", "sorghum", "jola", "cholam", "jonnalu"] },
  { name: "Ragi", aliases: ["ragi", "finger millet", "mandua", "kezhvaragu"] },
  { name: "Barley", aliases: ["barley", "jau"] },

  // Pulses & Legumes
  { name: "Bengal Gram (Gram)", aliases: ["chana", "channa", "bengal gram", "gram", "chickpea", "chickpeas", "kadale", "konda kadalai", "senagalu", "chana dal", "kabuli chana"] },
  { name: "Tur (Arhar) Dal", aliases: ["tur", "tur dal", "toor", "toor dal", "arhar", "arhar dal", "red gram", "pigeon pea", "thogari", "thuvaram paruppu", "kandi pappu"] },
  { name: "Green Gram (Moong)", aliases: ["moong", "mung", "green gram", "hesaru", "pasi payaru", "pesalu", "moong dal"] },
  { name: "Black Gram (Urad)", aliases: ["urad", "black gram", "uddu", "ulunthu", "minumulu", "urad dal"] },
  { name: "Soyabean", aliases: ["soyabean", "soybean", "soya"] },
  { name: "Groundnut", aliases: ["groundnut", "peanut", "peanuts", "moongfali", "shenga", "kadale kayi", "verkkadalai", "verusenaga"] },
  { name: "Mustard", aliases: ["mustard", "sarson", "rai", "sasive", "kadugu", "aavalu", "mustard oil"] },

  // Commercial / Cash Crops
  { name: "Cotton", aliases: ["cotton", "kapas", "hathi", "paruthi", "paththi"] },
  { name: "Sugarcane", aliases: ["sugarcane", "ganna", "kabbu", "karumbu", "cheruku"] },
  { name: "Jaggery", aliases: ["jaggery", "gur", "bella", "vellam", "bellam", "gud"] },
  { name: "Arecanut", aliases: ["arecanut", "supari", "adike", "paakku", "vakka"] }
];

// Build comprehensive chatbot commodity matcher from AGMARKNET catalogue
const commodityAliases = (() => {
  const map = new Map();

  for (const item of agmarknetCatalogue?.commodities || []) {
    const canonicalName = item.name;
    const cleanKey = canonicalName.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    const aliasSet = new Set([cleanKey]);
    if (item.agmarknet_name) aliasSet.add(item.agmarknet_name.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim());
    if (item.display_name) aliasSet.add(item.display_name.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim());
    if (Array.isArray(item.aliases)) {
      for (const a of item.aliases) {
        const cleanA = String(a).toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
        if (cleanA) aliasSet.add(cleanA);
      }
    }
    map.set(canonicalName.toLowerCase(), {
      name: canonicalName,
      aliases: Array.from(aliasSet).filter(Boolean)
    });
  }

  for (const item of commodityMaster || []) {
    const target = (agmarknetCatalogue?.commodities || []).find(
      c => c.name.toLowerCase() === item.commodity.toLowerCase() ||
           c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === item.commodity.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    const targetName = target ? target.name : item.commodity;
    const key = targetName.toLowerCase();
    const existing = map.get(key) || { name: targetName, aliases: [] };
    const combined = new Set(existing.aliases);
    combined.add(item.commodity.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim());
    if (Array.isArray(item.aliases)) {
      for (const a of item.aliases) {
        const cleanA = String(a).toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
        if (cleanA) combined.add(cleanA);
      }
    }
    existing.aliases = Array.from(combined).filter(Boolean);
    map.set(key, existing);
  }

  return Array.from(map.values()).sort((a, b) => {
    const maxA = Math.max(...a.aliases.map(x => x.length));
    const maxB = Math.max(...b.aliases.map(x => x.length));
    return maxB - maxA;
  });
})();

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
  { name: "Odisha", aliases: ["odisha", "orissa"] },
  { name: "Himachal Pradesh", aliases: ["himachal pradesh", "himachal", "hp"] },
  { name: "Uttarakhand", aliases: ["uttarakhand", "uk"] },
  { name: "Assam", aliases: ["assam"] },
  { name: "Chhattisgarh", aliases: ["chhattisgarh", "cg"] },
  { name: "Jharkhand", aliases: ["jharkhand", "jh"] }
];

function findCommodity(message) {
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ") + " ";

  // 1. Primary check against canonical agricultural commodities and synonyms
  for (const item of CANONICAL_COMMODITIES) {
    for (const alias of item.aliases) {
      if (clean.includes(" " + alias + " ")) return item.name;
    }
  }

  // 2. Secondary check against all 600+ AGMARKNET catalogue commodities
  for (const item of commodityAliases) {
    for (const alias of item.aliases) {
      if (alias && alias.length >= 3 && clean.includes(" " + alias + " ")) return item.name;
    }
  }

  // 3. Heuristic Extraction: e.g. "todays ginger price", "rate of apple", "garlic rate"
  const cropHeuristics = [
    /(?:todays?|today|current|live|wholesale|market)\s+([a-z]{3,15})\s+(?:price|rate|bhav|cost|mandi)/i,
    /(?:price|rate|bhav|cost)\s+of\s+([a-z]{3,15})/i,
    /([a-z]{3,15})\s+(?:price|rate|bhav|cost)\s+(?:in|at|for|today|near)/i,
    /([a-z]{3,15})\s+(?:price|rate|bhav|cost)$/i
  ];
  for (const regex of cropHeuristics) {
    const match = message.match(regex);
    if (match && match[1]) {
      const word = match[1].toLowerCase().trim();
      const stopWords = ["what", "show", "tell", "give", "check", "find", "need", "best", "good", "some", "this", "that", "area", "place", "mandi", "market", "weather", "today"];
      if (!stopWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
    }
  }

  return null;
}

function findVariety(message, commodityName) {
  if (!commodityName) return null;
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ") + " ";
  const cmdt = (agmarknetCatalogue?.commodities || []).find(
    c => c.name.toLowerCase() === commodityName.toLowerCase() ||
         (c.agmarknet_name && c.agmarknet_name.toLowerCase() === commodityName.toLowerCase())
  );
  if (!cmdt || !Array.isArray(cmdt.varieties)) return null;
  for (const v of cmdt.varieties) {
    const vName = typeof v === "string" ? v : v.name;
    if (!vName || vName.length < 3 || /^(other|general|local|faq|standard|normal)$/i.test(vName)) continue;
    const vClean = vName.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    if (clean.includes(" " + vClean + " ")) {
      return vName;
    }
  }
  return null;
}

function findState(message) {
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ") + " ";
  for (const item of stateAliases) {
    for (const alias of item.aliases) {
      if (clean.includes(" " + alias + " ")) return item.name;
    }
  }
  return null;
}

function findDistrict(message) {
  const clean = " " + message.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ") + " ";

  // Special colloquial aliases with exact spatial mapping
  if (clean.includes(" bangalore rural ") || clean.includes(" bengaluru rural ")) return { district: "Bengaluru Rural", state: "Karnataka" };
  if (clean.includes(" doddaballapur ") || clean.includes(" hoskote ") || clean.includes(" devanahalli ") || clean.includes(" nelamangala ")) return { district: "Bengaluru Rural", state: "Karnataka" };
  if (clean.includes(" bangalore urban ") || clean.includes(" bengaluru urban ")) return { district: "Bengaluru Urban", state: "Karnataka" };
  if (clean.includes(" bangalore ") || clean.includes(" bengaluru ")) return { district: "Bengaluru", state: "Karnataka" };
  if (clean.includes(" mysore ")) return { district: "Mysuru", state: "Karnataka" };
  if (clean.includes(" belgaum ")) return { district: "Belagavi", state: "Karnataka" };
  if (clean.includes(" hubli ") || clean.includes(" hubballi ")) return { district: "Hubballi", state: "Karnataka" };

  for (const item of ALL_DISTRICTS_LOOKUP) {
    if (clean.includes(" " + item.lower + " ")) {
      return { district: item.district, state: item.state };
    }
  }
  return null;
}

// =========================================================================
// SMART ASSISTANT CORE ENGINE (PRICES, WEATHER, AGRONOMIC Q&A)
// =========================================================================
async function getAssistantAnswer(question, profile, formLocation) {
  const q = String(question || "").trim();
  const qLower = q.toLowerCase();

  // User's default detected / registered location
  const userDistrict = (profile?.district || formLocation?.district || "").trim();
  const userState = (profile?.state || formLocation?.state || "Karnataka").trim();
  const userCity = (profile?.city || formLocation?.city || userDistrict || "Bengaluru").trim();
  const userPlaceLabel = userDistrict ? userDistrict + ", " + userState : (userCity ? userCity + ", " + userState : userState);

  // -------------------------------------------------------------
  // 1. WEATHER & CLIMATE INTENT
  // -------------------------------------------------------------
  const isWeatherQuery = /\b(weather|forecast|rain|rainfall|temperature|temp|mausam|climate|monsoon|humidity|wind)\b/i.test(qLower) &&
    !/\b(price|rate|cost|bhav|market price|mandi|wholesale)\b/i.test(qLower);

  if (isWeatherQuery) {
    let queryPlace = "";
    const distInfo = findDistrict(q);
    const detectedDist = distInfo?.district || "";
    const detectedState = distInfo?.state || findState(q) || "";

    const prepMatch = q.match(/\b(?:in|at|for|of|near)\s+([a-zA-Z\s]{3,30})/i);
    if (prepMatch && prepMatch[1]) {
      const candidate = prepMatch[1].replace(/\b(for|next|the|coming|days|day|week|today|tomorrow|weather|climate|forecast|rain|temperature)\b/gi, "").trim();
      if (candidate.length >= 3) {
        queryPlace = candidate;
      }
    }

    if (!queryPlace) {
      if (detectedDist) queryPlace = detectedDist;
      else if (detectedState) queryPlace = detectedState;
    }

    const isSpecificPlace = Boolean(queryPlace);
    const targetPlace = isSpecificPlace ? queryPlace : (userDistrict || userCity || userState || "Bengaluru");
    const latParam = (!isSpecificPlace && profile?.latitude && profile?.longitude) ? "&lat=" + profile.latitude + "&lng=" + profile.longitude : "";

    try {
      const res = await fetch("/api/weather?place=" + encodeURIComponent(targetPlace) + latParam);
      const wData = await res.json();
      if (!res.ok) throw new Error(wData.error || "Weather data unavailable.");

      const daily = Array.isArray(wData.daily) ? wData.daily : [];
      if (!daily.length) {
        return { text: "Unable to retrieve 7-day weather for " + targetPlace + ". Please try again." };
      }

      const highRainDay = daily.find(d => d.rainProb >= 60);
      const hotDay = daily.find(d => d.maxTemp >= 35);
      const coolDay = daily.find(d => d.minTemp <= 14);

      let advisory = "🌱 **Agronomic Advisory**: Favorable weather projected for standard intercultural operations, weeding, and farm maintenance.";
      if (highRainDay) {
        advisory = "⚠️ **Farming Advisory**: High chance of rain on **" + highRainDay.dayName + " (" + highRainDay.rainProb + "%)**. Avoid spraying foliar pesticides or fertilizers, and ensure field drainage channels are cleared.";
      } else if (hotDay) {
        advisory = "☀️ **Farming Advisory**: Peak temperatures reaching **" + hotDay.maxTemp + "°C**. Schedule drip or basin irrigation in the early morning or evening to reduce soil moisture evaporation.";
      } else if (coolDay) {
        advisory = "❄️ **Farming Advisory**: Night temperatures dipping to **" + coolDay.minTemp + "°C**. Light evening irrigation recommended to protect sensitive vegetable blossoms from cold shock.";
      }

      let summaryText = isSpecificPlace
        ? "⛅ **Next 7-Day Weather Forecast — " + wData.place + "**\n\n"
        : "📍 Showing 7-day weather for your location: **" + (wData.place || userPlaceLabel) + "**\n\n";

      for (const d of daily) {
        const rainBadge = d.rainProb > 0 ? " | 🌧️ " + d.rainProb + "% rain" : " | 💧 Dry";
        summaryText += "• **" + d.dayName + " (" + d.dateStr + ")**: " + d.icon + " " + d.condition + " — High " + d.maxTemp + "°C / Low " + d.minTemp + "°C" + rainBadge + "\n";
      }

      summaryText += "\n" + advisory;
      if (!isSpecificPlace) {
        summaryText += "\n\n💡 *Tip: Ask 'Weather in Shimla' or 'Rain in Pune' to check other areas.*";
      }

      return {
        text: summaryText,
        weatherData: daily,
        place: wData.place
      };
    } catch (err) {
      return { text: "Could not fetch weather report for " + targetPlace + ": " + err.message };
    }
  }

  // -------------------------------------------------------------
  // 2. COMMODITY PRICE INTENT
  // -------------------------------------------------------------
  const detectedCommodity = findCommodity(q);
  const isExplicitPriceQuery = /\b(price|prices|rate|rates|cost|bhav|market price|mandi rate|wholesale|today price|todays price)\b/i.test(qLower);

  if (detectedCommodity || isExplicitPriceQuery) {
    // If user explicitly asked for price but NO crop could be identified
    if (!detectedCommodity) {
      return {
        text: "Which crop's price would you like to check? 🌾\n\n" +
          "You can ask for live mandi rates of any crop across India, for example:\n" +
          "• **'Ginger price in Bengaluru Rural'**\n" +
          "• **'Tomato rate today'**\n" +
          "• **'Onion price in Nashik'**\n" +
          "• **'Garlic in Mandsaur'**\n" +
          "• **'Green Chilli rate in Pune'**\n\n" +
          "💡 *Farmezy provides real-time mandi prices for over 180+ commodities including Ginger, Garlic, Tomato, Onion, Potato, Chilli, Apple, Banana, Mango, Wheat, Rice, and Pulses.*"
      };
    }

    const targetCrop = detectedCommodity;
    const distInfo = findDistrict(q);
    const detectedDist = distInfo?.district || "";
    const detectedState = distInfo?.state || findState(q) || "";

    let queryPlace = "";
    const prepMatch = q.match(/\b(?:in|at|for|of|near)\s+([a-zA-Z\s]{3,30})/i);
    if (prepMatch && prepMatch[1]) {
      const candidate = prepMatch[1].replace(/\b(for|next|the|coming|days|day|week|today|tomorrow|price|prices|rate|rates|bhav|wholesale|mandi)\b/gi, "").trim();
      if (candidate.length >= 3) {
        queryPlace = candidate;
      }
    }

    const isSpecificPlace = Boolean(detectedDist || detectedState || queryPlace);
    const targetState = detectedState || (isSpecificPlace ? queryPlace : userState);
    const targetDistrict = detectedDist || (isSpecificPlace ? (detectedDist || "") : userDistrict);

    try {
      const params = new URLSearchParams({
        commodity: targetCrop,
        state: targetState || "Karnataka",
        district: targetDistrict || "",
        days: "7"
      });

      const res = await fetch("/api/price-forecast?" + params.toString());
      const data = await res.json();
      if (!res.ok) {
        return {
          text: "We couldn't retrieve active mandi rates for **" + targetCrop + "** in " + (targetDistrict ? targetDistrict + ", " : "") + targetState + ".\n\n" +
            "💡 *Tip: Try asking for popular commodities like Ginger, Garlic, Tomato, Onion, Potato, Green Chilli, Banana, Apple, Wheat, or Chana.*"
        };
      }

      const currentPrice = data.currentPrice;
      const pricePerKg = data.currentPricePerKg;
      const unit = data.unit || "Quintal (100 KG)";
      const mandiLabel = data.lastObserved?.label || (data.state + " APMC Mandi");
      const arrivalDate = data.lastObserved?.date || "04/11/2026";
      const trend = data.weeklySummary?.trend || "Stable";
      const recommendation = data.weeklySummary?.recommendedAction || "";

      let priceText = "";
      if (!isSpecificPlace && userPlaceLabel) {
        priceText += "📍 **Prices for your location: " + userPlaceLabel + "**\n\n";
      } else {
        priceText += "📍 **" + data.commodity + " Wholesale Price in " + (data.district ? data.district + ", " : "") + data.state + "**\n\n";
      }

      priceText += "• **Current Wholesale Rate**: **₹" + Number(currentPrice).toLocaleString("en-IN") + "/" + unit + "** (approx. **₹" + pricePerKg + "/kg**)\n";
      priceText += "• **Reporting Market**: " + mandiLabel + " (" + arrivalDate + ")\n";
      priceText += "• **7-Day Trend Outlook**: " + trend + "\n";
      if (recommendation) {
        priceText += "• **Selling Strategy**: " + recommendation + "\n";
      }

      if (!isSpecificPlace) {
        priceText += "\n💡 *Tip: You can also ask for prices in any other place (e.g. 'Ginger in Bengaluru Rural', 'Tomato in Pune', or 'Garlic in Mandsaur').*";
      }

      return {
        text: priceText,
        priceData: data
      };
    } catch (err) {
      return { text: "Unable to retrieve official rates for " + targetCrop + ": " + err.message };
    }
  }

  // -------------------------------------------------------------
  // 3. CROP CULTIVATION & GROWING GUIDANCE
  // -------------------------------------------------------------
  if (/\b(how.*grow|grow.*crop|cultivation|package of practices|farming of|plantation)\b/i.test(qLower) ||
      (/\b(grow|cultivate|plant)\b/i.test(qLower) && /\b(ginger|tomato|onion|garlic|chilli|potato|banana)\b/i.test(qLower))) {
    if (qLower.includes("ginger") || qLower.includes("adrak")) {
      return {
        text: "🌱 **Ginger (Adrak) Cultivation Guide**\n\n" +
          "• **Soil & Climate**: Well-drained sandy loam or clay loam with pH 6.0–6.5. Requires warm, humid climate and partial shade.\n" +
          "• **Seed Rhizome Selection**: Use disease-free rhizomes (25–30g each with 2–3 viable buds). Seed rate: 600–800 kg/acre.\n" +
          "• **Seed Treatment**: Treat rhizomes with Trichoderma viride (10g/kg) or Mancozeb (2g/L) for 30 mins to prevent rhizome rot.\n" +
          "• **Planting Method**: Plant on raised beds (1m wide, 15cm high) at 20–25 cm spacing. Cover with soil and mulch heavily with green leaves.\n" +
          "• **Harvesting**: Matures in 8–9 months when leaves turn yellow and dry. Average yield: 6–10 tonnes/acre."
      };
    }
    if (qLower.includes("tomato") || qLower.includes("tamatar")) {
      return {
        text: "🍅 **Tomato Cultivation Guide**\n\n" +
          "• **Nursery & Seed Rate**: 60–80g/acre for hybrids. Raise seedlings in pro-trays with coco-peat for 25–28 days.\n" +
          "• **Transplanting**: Spacing 90cm x 60cm on raised beds with silver-black plastic mulch and drip lines.\n" +
          "• **Staking**: Stake indeterminate varieties with bamboo poles and trellis twine at 30 days to avoid fruit ground contact and soil-borne blights.\n" +
          "• **Harvesting**: Pick at 'breaker' (pinkish) stage for distant markets; fully red for local retail."
      };
    }
    if (qLower.includes("onion") || qLower.includes("pyaz")) {
      return {
        text: "🧅 **Onion Cultivation Guide**\n\n" +
          "• **Seasons**: Kharif (May–June nursery), Late Kharif (Aug–Sept), Rabi (Oct–Nov nursery).\n" +
          "• **Nursery**: 4–5 kg seeds/acre. Transplant sturdy 40–45 day old seedlings at 15cm x 10cm spacing.\n" +
          "• **Fertilizer**: 100:50:50 kg NPK/ha. Apply sulphur (20 kg/ha) to enhance bulb pungency and storage shelf life.\n" +
          "• **Harvesting & Curing**: Stop irrigation 10–12 days before harvest. Field-cure bulbs in shade for 7–10 days until tops dry out."
      };
    }
    if (qLower.includes("garlic") || qLower.includes("lehsun")) {
      return {
        text: "🧄 **Garlic Cultivation Guide**\n\n" +
          "• **Season**: October–November (Rabi). Thrives in cool growing seasons with bright sunshine during bulb development.\n" +
          "• **Clove Selection**: Use large outer cloves (200–250 kg/acre). Treat with Carbendazim (2g/kg).\n" +
          "• **Spacing**: Plant cloves upright 5cm deep at 15cm x 10cm spacing on flat or raised beds.\n" +
          "• **Maturity**: Ready in 120–140 days when 70% leaves turn yellow and collapse."
      };
    }
    if (qLower.includes("chilli") || qLower.includes("mirchi")) {
      return {
        text: "🌶️ **Chilli (Mirchi) Cultivation Guide**\n\n" +
          "• **Nursery**: 150–200g seeds/acre. Transplant 30–35 day old seedlings on raised beds with drip irrigation.\n" +
          "• **Spacing**: 60cm x 45cm spacing.\n" +
          "• **Leaf Curl Prevention**: Control thrips and whiteflies early using yellow/blue sticky traps and Neem oil (5ml/L).\n" +
          "• **Harvesting**: First green harvest at 65–70 days. Continue picking every 10–12 days."
      };
    }
  }

  // -------------------------------------------------------------
  // 4. PEST & DISEASE MANAGEMENT
  // -------------------------------------------------------------
  if (/\b(pest|disease|blight|borer|aphid|thrip|fungus|spray|insect|worm|leaf curl|wilt|mildew|rot)\b/i.test(qLower)) {
    return {
      text: "🛡️ **Integrated Pest & Disease Management Guidance**\n\n" +
        "• **Sucking Pests (Thrips, Aphids, Whiteflies, Mites)**:\n" +
        "  Spray 5% Neem Seed Kernel Extract (NSKE) or Cold-Pressed Neem Oil (5ml/L + 1ml liquid soap).\n" +
        "  Install yellow & blue sticky traps (15–20 per acre) at crop canopy level.\n" +
        "  For severe whitefly infestation, spray Diafenthiuron 50% WP (1g/L) or Acetamiprid 20% SP (0.3g/L).\n\n" +
        "• **Fungal Blights (Early Blight, Late Blight, Leaf Spots)**:\n" +
        "  Preventive: Spray Mancozeb 75% WP (2g/L) or Copper Oxychloride 50% WP (2.5g/L).\n" +
        "  Curative: Azoxystrobin + Difenoconazole (1ml/L) or Metalaxyl + Mancozeb (2g/L).\n" +
        "  Maintain proper plant spacing and clear drainage to reduce humidity in the foliage.\n\n" +
        "• **Fruit & Shoot Borers (Tomato, Brinjal, Okra)**:\n" +
        "  Install pheromone traps (5 traps/acre) for population monitoring.\n" +
        "  Spray Bacillus thuringiensis (Bt) @ 2g/L or Emamectin Benzoate 5% SG @ 0.4g/L.\n\n" +
        "• **Rhizome & Root Rot (Ginger, Turmeric, Papaya)**:\n" +
        "  Soil drench with Trichoderma viride (10g/L) or Copper Oxychloride (3g/L). Avoid waterlogging at all costs.\n\n" +
        "💡 *Always observe the 7-day withholding period between pesticide application and harvest.*"
    };
  }

  // -------------------------------------------------------------
  // 5. FERTILIZER & SOIL HEALTH MANAGEMENT
  // -------------------------------------------------------------
  if (/\b(fertilizer|urea|dap|npk|manure|compost|nutrient|potash|zinc|nitrogen|soil|micronutrient)\b/i.test(qLower)) {
    return {
      text: "🌱 **Recommended Fertilizer & Nutrient Management**\n\n" +
        "• **Basal Soil Enrichment**:\n" +
        "  Incorporate 8–10 tonnes/acre of well-decomposed Farm Yard Manure (FYM) or 2 tonnes of vermicompost during final field ploughing.\n\n" +
        "• **Balanced N:P:K Dosing**:\n" +
        "  Vegetables (Tomato, Onion, Brinjal): 120:60:60 kg NPK/ha.\n" +
        "  Apply 100% of Phosphorus (DAP) and Potash (MOP) as basal at planting.\n" +
        "  Split Nitrogen (Urea) into 3 equal top-dressings at 25, 45, and 65 days after transplanting.\n\n" +
        "• **Micronutrient Boost**:\n" +
        "  Foliar spray Zinc Sulphate (0.5%) + Boric Acid (0.2%) during early flowering to prevent flower drop and improve fruit size.\n\n" +
        "• **Soil pH Correction**:\n" +
        "  Acidic soil (pH < 6.0): Apply agricultural lime (dolomite) 2–3 quintals/acre.\n" +
        "  Alkaline/saline soil (pH > 8.0): Apply gypsum 2–4 quintals/acre with green manuring (dhaincha).\n\n" +
        "💡 *Get a Soil Health Card test every 2 years to optimize fertilizer spending.*"
    };
  }

  // -------------------------------------------------------------
  // 6. ORGANIC FARMING & NATURAL REMEDIES
  // -------------------------------------------------------------
  if (/\b(organic|natural|jeevamrutha|vermicompost|bio.*fertilizer|panchagavya|cow dung|neem cake)\b/i.test(qLower)) {
    return {
      text: "🌿 **Natural & Organic Farming Practices**\n\n" +
        "• **Jeevamrutha Preparation (for 1 acre)**:\n" +
        "  Mix 10kg desi cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour (besan) + handful of virgin forest soil in 200L water.\n" +
        "  Ferment for 48–72 hours in shade, stirring twice daily. Apply via drip or irrigation water every 15 days.\n\n" +
        "• **Neem Cake Application**:\n" +
        "  Apply 100–150 kg/acre neem cake during bed preparation to suppress root-knot nematodes and soil insects.\n\n" +
        "• **Bio-fungicides**:\n" +
        "  Use Trichoderma viride and Pseudomonas fluorescens (2.5 kg/acre mixed with 100kg FYM) to naturally control fungal wilts and rot."
    };
  }

  // -------------------------------------------------------------
  // 7. IRRIGATION & WATER MANAGEMENT
  // -------------------------------------------------------------
  if (/\b(irrigation|water|drip|sprinkler|watering|moisture|mulch)\b/i.test(qLower)) {
    return {
      text: "💧 **Smart Irrigation Practices**\n\n" +
        "• **Drip Irrigation**: Saves 40–60% water, prevents weed growth between rows, and allows precise fertigation directly to crop root zones.\n" +
        "• **Optimal Timing**: Always irrigate early in the morning (6:00–9:00 AM) or late afternoon. Avoid noon watering which causes root heat stress and high evaporation.\n" +
        "• **Plastic Mulching**: Silver-black reflective mulch (25–30 micron) conserves 50% soil moisture, deters aphids/whiteflies, and stops weeds completely.\n" +
        "• **Critical Stages**: Keep soil consistently moist during flowering and fruit/pod development to prevent fruit drop and cracking."
    };
  }

  // -------------------------------------------------------------
  // 8. STORAGE & POST-HARVEST
  // -------------------------------------------------------------
  if (/\b(store|storage|shelf|cure|curing|rot|preserve|shelf life)\b/i.test(qLower)) {
    return {
      text: "🏠 **Post-Harvest Crop Storage Guidelines**\n\n" +
        "• **Ginger & Turmeric**: Cure freshly harvested rhizomes in shaded, aerated pits covered with dry sand. Ideal temperature: 12–14°C, 85% RH.\n" +
        "• **Onions & Garlic**: Field-cure for 7–10 days in the shade until necks are completely dry and papery. Store in well-ventilated slatted bamboo racks. Never store in plastic bags.\n" +
        "• **Potatoes**: Store in a cool, dark, ventilated store (10–12°C). Never expose to direct sunlight to prevent solanine greening.\n" +
        "• **Grains & Pulses**: Dry thoroughly in sun to below 12% moisture content before bagging. Add dried neem leaves to storage bins to repel grain weevils."
    };
  }

  // -------------------------------------------------------------
  // 9. GOVERNMENT SCHEMES & SUBSIDIES
  // -------------------------------------------------------------
  if (/\b(scheme|subsidy|pm kisan|pmfby|kcc|loan|insurance|government)\b/i.test(qLower)) {
    return {
      text: "🏛️ **Major Government Agriculture Schemes & Subsidies**\n\n" +
        "• **PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**:\n" +
        "  Direct income support of ₹6,000 per year in 3 equal installments of ₹2,000 directly into farmer bank accounts.\n\n" +
        "• **PMFBY (Pradhan Mantri Fasal Bima Yojana)**:\n" +
        "  Crop insurance against drought, flood, pests, and unseasonal rains. Premium: 2% for Kharif crops, 1.5% for Rabi, and 5% for commercial/horticultural crops.\n\n" +
        "• **Kisan Credit Card (KCC)**:\n" +
        "  Provides affordable crop production loans up to ₹3 Lakh at an effective subsidized interest rate of 4% per annum (with prompt repayment).\n\n" +
        "• **PM-KUSUM Scheme**:\n" +
        "  Up to 60% government subsidy for installing solar-powered irrigation water pumps."
    };
  }

  // -------------------------------------------------------------
  // 10. SOWING SEASONS & SEED CALENDAR
  // -------------------------------------------------------------
  if (/\b(season|sowing|calendar|when to sow|kharif|rabi|zaid|month)\b/i.test(qLower)) {
    return {
      text: "📅 **Indian Agricultural Crop Seasons**\n\n" +
        "• **Kharif Season (Monsoon, June–October)**:\n" +
        "  Sown with arrival of southwest monsoon. Ideal crops: Paddy, Maize, Cotton, Soybean, Groundnut, Tur Dal, Moong, Tomato, Chilli.\n\n" +
        "• **Rabi Season (Winter, October–March)**:\n" +
        "  Sown as monsoon retreats in autumn. Ideal crops: Wheat, Mustard, Bengal Gram (Chana), Garlic, Onion, Potato, Peas, Cabbage, Carrot.\n\n" +
        "• **Zaid Season (Summer, March–June)**:\n" +
        "  Short summer season with irrigation. Ideal crops: Watermelon, Muskmelon, Cucumber, Bitter Gourd, Okra (Bhindi), Green Gram."
    };
  }

  // -------------------------------------------------------------
  // 11. FARMEZY PLATFORM GUIDES
  // -------------------------------------------------------------
  if (/\b(how.*sell|sell.*harvest|list.*crop|add.*crop|seller|selling)\b/i.test(qLower)) {
    return {
      text: "📦 **How to Sell Produce on Farmezy (Farmer Marketplace)**\n\n" +
        "1. Open **List your harvest** in the left sidebar.\n" +
        "2. Snap a clear, live camera photo of your harvest directly in the field (or select from gallery).\n" +
        "3. Select the crop name, variety, grade, available quantity, and your asking price (₹/kg or ₹/quintal).\n" +
        "4. Set harvest date and pickup location.\n" +
        "5. Tap **Publish Listing**!\n\n" +
        "✅ Your harvest is instantly broadcast to verified buyers, traders, and local consumers within < 1 km with 0% middleman commission!"
    };
  }

  if (/\b(how.*buy|buy.*produce|purchase|customer|order|contact farmer)\b/i.test(qLower)) {
    return {
      text: "🛒 **How to Purchase Fresh Produce on Farmezy**\n\n" +
        "1. Click **Browse produce** in the navigation.\n" +
        "2. Filter by crop name or view nearby farms sorted by real GPS distance.\n" +
        "3. Review transparent farmgate prices, harvest dates, and real field photos.\n" +
        "4. Tap **Buy / Connect** to directly chat on **WhatsApp** or initiate a **Direct Call** with the farmer."
    };
  }

  if (/^(hi|hello|hey|namaste|vanakkam|namaskara|good\s*(morning|afternoon|evening))\b/i.test(qLower)) {
    return {
      text: "Namaste! 🙏 Welcome to Farmezy.\n\n" +
        "I am your 24/7 agriculture and market intelligence assistant. You can ask me:\n" +
        "• **'Ginger price in Bengaluru Rural'** — Live mandi rates for any crop\n" +
        "• **'7-day weather forecast'** — Next week's rain, temperature & farm advisory\n" +
        "• **'Garlic price in Mandsaur'** — Mandi rates across 180+ Indian crops\n" +
        "• **'How to grow Ginger?'** — Complete crop cultivation practices\n" +
        "• **'How to control tomato blight?'** — Integrated pest & disease guidance"
    };
  }

  // -------------------------------------------------------------
  // 12. CATCH-ALL INTELLIGENT HELPER
  // -------------------------------------------------------------
  return {
    text: "I'm here to assist with all your farming, crop pricing, and weather needs! 🌾\n\n" +
      "Here are popular questions you can ask me:\n" +
      "1. **Crop Mandi Prices**: E.g. *'Ginger price in Bengaluru Rural'*, *'Tomato price in my area'*, *'Garlic in Mandsaur'*, *'Onion in Nashik'*\n" +
      "2. **7-Day Weather Forecasts**: E.g. *'Weather forecast for Bengaluru Rural'*, *'Will it rain in Shimla?'*\n" +
      "3. **Crop Growing Guides**: E.g. *'How to grow ginger'*, *'Best spacing for tomatoes'*, *'Garlic sowing tips'*\n" +
      "4. **Pest & Disease Control**: E.g. *'How to treat tomato leaf curl'*, *'Rhizome rot in ginger'*, *'Organic aphid spray'*\n" +
      "5. **Marketplace Guidance**: E.g. *'How to sell my harvest'*, *'How to buy directly from farmers'*"
  };
}


// Indian States list for dropdown selection
const FORECAST_STATES = [
  "Karnataka", "Maharashtra", "Andhra Pradesh", "Telangana", "Tamil Nadu", "Uttar Pradesh",
  "Punjab", "Haryana", "Madhya Pradesh", "Gujarat", "Rajasthan", "Bihar", "West Bengal",
  "Kerala", "Odisha", "Assam", "Chhattisgarh", "Jharkhand", "Himachal Pradesh", "Uttarakhand",
  "Delhi", "Goa", "Jammu and Kashmir", "Tripura", "Meghalaya", "Manipur", "Nagaland",
  "Mizoram", "Arunachal Pradesh", "Sikkim", "Chandigarh", "Puducherry", "Ladakh"
]

// Structured catalogue of crops for dropdown
const FORECAST_CROPS = [
  { group: "Popular Crops", name: "Tomato", icon: "🍅" },
  { group: "Popular Crops", name: "Potato", icon: "🥔" },
  { group: "Popular Crops", name: "Onion", icon: "🧅" },
  { group: "Popular Crops", name: "Wheat", icon: "🌾" },
  { group: "Popular Crops", name: "Paddy (Rice)", icon: "🌾" },
  { group: "Popular Crops", name: "Tur (Arhar) Dal", icon: "🥣" },
  { group: "Popular Crops", name: "Mustard Oil", icon: "🫒" },
  { group: "Popular Crops", name: "Sugarcane", icon: "🎋" },

  { group: "Vegetables", name: "Garlic", icon: "🧄" },
  { group: "Vegetables", name: "Ginger", icon: "🫚" },
  { group: "Vegetables", name: "Brinjal", icon: "🍆" },
  { group: "Vegetables", name: "Cabbage", icon: "🥬" },
  { group: "Vegetables", name: "Cauliflower", icon: "🥦" },
  { group: "Vegetables", name: "Carrot", icon: "🥕" },
  { group: "Vegetables", name: "Capsicum", icon: "🫑" },
  { group: "Vegetables", name: "Green Chilli", icon: "🌶️" },
  { group: "Vegetables", name: "Cucumber", icon: "🥒" },
  { group: "Vegetables", name: "Green Peas", icon: "🫛" },
  { group: "Vegetables", name: "Beans", icon: "🫛" },
  { group: "Vegetables", name: "Beetroot", icon: "🔴" },
  { group: "Vegetables", name: "Bottle Gourd", icon: "🎃" },
  { group: "Vegetables", name: "Bitter Gourd", icon: "🍈" },
  { group: "Vegetables", name: "Bhindi (Ladies Finger)", icon: "🌱" },

  { group: "Fruits", name: "Apple", icon: "🍎" },
  { group: "Fruits", name: "Banana", icon: "🍌" },
  { group: "Fruits", name: "Mango", icon: "🥭" },
  { group: "Fruits", name: "Lemon", icon: "🍋" },
  { group: "Fruits", name: "Grapes", icon: "🍇" },
  { group: "Fruits", name: "Guava", icon: "🍐" },
  { group: "Fruits", name: "Pomegranate", icon: "🍷" },
  { group: "Fruits", name: "Coconut", icon: "🥥" },

  { group: "Commercial & Spices", name: "Turmeric", icon: "🌿" },
  { group: "Commercial & Spices", name: "Black Pepper", icon: "🧂" },
  { group: "Commercial & Spices", name: "Cotton", icon: "☁️" },
  { group: "Commercial & Spices", name: "Groundnut", icon: "🥜" },
  { group: "Commercial & Spices", name: "Maize", icon: "🌽" }
]

function PriceForecast({ location, onPrices }) {
  const [commodity, setCommodity] = useState("Tomato")
  const [state, setState] = useState(location?.state || "Karnataka")
  const [district, setDistrict] = useState("All Districts (State Average)")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const availableDistricts = ["All Districts (State Average)", ...(STATE_DISTRICTS_MAP[state] || [])]

  const handleStateChange = (newState) => {
    setState(newState)
    setDistrict("All Districts (State Average)")
    run(commodity, newState, "All Districts (State Average)")
  }

  const run = async (cropParam, stateParam, distParam) => {
    const c = cropParam ?? commodity
    const s = stateParam ?? state
    const d = distParam ?? district
    const queryDistrict = (!d || d.startsWith("All Districts")) ? "" : d

    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        commodity: c,
        state: s,
        district: queryDistrict,
        days: "7"
      })
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

  // Run automatically on first mount
  useEffect(() => {
    run(commodity, state, district)
  }, [])

  return (
    <section className="panel" style={{ background: "#fbfcfb", border: "1px solid #e5ebe2", borderRadius: "12px", padding: "20px 24px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#377d4c", letterSpacing: "1px", textTransform: "uppercase" }}>
            🌾 Intelligent Market Forecasting
          </span>
          <h2 style={{ margin: "4px 0 2px", font: "700 22px/1.2 Manrope, sans-serif", color: "#1e3023" }}>
            Next 7-Day Mandi Price Predictions
          </h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#6e7c70" }}>
            Real-time projection model tracking short-term price momentum and weekly mandi trading volumes.
          </p>
        </div>
        <div style={{ background: "#eef6ee", border: "1px solid #c9e4cb", color: "#256337", borderRadius: "20px", padding: "6px 14px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2e7d32", display: "inline-block" }}></span>
          Live Trend Engine Active
        </div>
      </div>

      {/* Selectors Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) auto",
        gap: "14px",
        alignItems: "flex-end",
        background: "#ffffff",
        border: "1px solid #e1e8dd",
        borderRadius: "10px",
        padding: "16px 18px",
        marginBottom: "20px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
      }}>
        {/* Crop Dropdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#47574a" }}>
            Select Crop / Commodity
          </label>
          <select
            value={commodity}
            onChange={e => {
              setCommodity(e.target.value)
              run(e.target.value, state, district)
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d4dfd1",
              borderRadius: "7px",
              background: "#fff",
              color: "#223326",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              outline: "none"
            }}
          >
            {["Popular Crops", "Vegetables", "Fruits", "Commercial & Spices"].map(group => (
              <optgroup key={group} label={`── ${group} ──`}>
                {FORECAST_CROPS.filter(c => c.group === group).map(c => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* State Dropdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#47574a" }}>
            State / Region
          </label>
          <select
            value={state}
            onChange={e => handleStateChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d4dfd1",
              borderRadius: "7px",
              background: "#fff",
              color: "#223326",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              outline: "none"
            }}
          >
            {FORECAST_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "700", color: "#47574a" }}>
            District / Mandi Zone
          </label>
          <select
            value={district}
            onChange={e => {
              setDistrict(e.target.value)
              run(commodity, state, e.target.value)
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d4dfd1",
              borderRadius: "7px",
              background: "#fff",
              color: "#223326",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              outline: "none"
            }}
          >
            {availableDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Predict Price Button */}
        <div>
          <button
            onClick={() => run()}
            disabled={loading}
            style={{
              background: loading ? "#749b7e" : "#2b7040",
              color: "#fff",
              border: 0,
              borderRadius: "7px",
              padding: "11px 20px",
              fontSize: "12px",
              fontWeight: "700",
              cursor: loading ? "default" : "pointer",
              whiteSpace: "nowrap",
              height: "40px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 6px rgba(43, 112, 64, 0.25)"
            }}
          >
            {loading ? "Forecasting…" : "⚡ Predict Price"}
          </button>
        </div>
      </div>

      {error && (
        <div className="official-error" style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "16px", marginBottom: "16px", color: "#9b2c2c" }}>
          <b style={{ fontSize: "13px" }}>Forecast Not Available</b>
          <p style={{ margin: "6px 0", fontSize: "12px" }}>{error}</p>
          <span style={{ fontSize: "11px", color: "#c53030" }}>Try choosing another crop or selecting state-wide average.</span>
        </div>
      )}

      {result && (
        <div className="forecast-result" style={{ background: "#ffffff", border: "1px solid #e3eae0", borderRadius: "10px", padding: "20px 22px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
          {/* Top Info Banner */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #eef2eb" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, font: "700 20px Manrope, sans-serif", color: "#1a2c1f" }}>
                  {result.commodity}
                </h3>
                <span style={{ background: "#f0f4ee", color: "#376d47", border: "1px solid #d8e5d5", padding: "3px 10px", borderRadius: "14px", fontSize: "11px", fontWeight: "700" }}>
                  📍 {result.state} {result.district && !result.district.startsWith("All Districts") ? `· ${result.district}` : ""}
                </span>
              </div>
              <small style={{ display: "block", color: "#748376", marginTop: "4px", fontSize: "11px" }}>
                🤖 {result.model}
              </small>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#7e8d81", letterSpacing: "0.5px", display: "block" }}>
                Current Spot Benchmark
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", justifyContent: "flex-end" }}>
                <b style={{ fontSize: "20px", color: "#1e3825" }}>
                  ₹{Number(result.lastObserved?.price || result.currentPrice || 0).toLocaleString("en-IN")}
                </b>
                <span style={{ fontSize: "12px", color: "#647567" }}>
                  /{result.unit || "Quintal (100 KG)"}
                </span>
                {result.currentPricePerKg ? (
                  <span style={{ background: "#edf7ee", color: "#256337", fontWeight: "700", fontSize: "11px", padding: "2px 7px", borderRadius: "4px", border: "1px solid #c8e3cc" }}>
                    ₹{result.currentPricePerKg}/kg
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Weekly Summary Banner */}
          {result.weeklySummary && (
            <div style={{
              background: result.weeklySummary.weeklyChangePercent >= 0 ? "linear-gradient(135deg, #f2f9f3 0%, #e6f4e8 100%)" : "linear-gradient(135deg, #fdf4f4 0%, #fae8e8 100%)",
              border: `1px solid ${result.weeklySummary.weeklyChangePercent >= 0 ? "#bde3c3" : "#f5c6cb"}`,
              borderRadius: "9px",
              padding: "14px 18px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>
                    {result.weeklySummary.weeklyChangePercent >= 0 ? "📈" : "📉"}
                  </span>
                  <b style={{ fontSize: "14px", color: result.weeklySummary.weeklyChangePercent >= 0 ? "#1b5e20" : "#842029" }}>
                    7-Day Market Outlook: {result.weeklySummary.trend} ({result.weeklySummary.weeklyChangePercent >= 0 ? "+" : ""}{result.weeklySummary.weeklyChangePercent}%)
                  </b>
                </div>
                <div style={{ fontSize: "12px", color: "#37473b", background: "rgba(255,255,255,0.7)", padding: "4px 10px", borderRadius: "6px" }}>
                  <b>Projected Spread:</b> ₹{Number(result.weeklySummary.minProjected).toLocaleString("en-IN")} – ₹{Number(result.weeklySummary.maxProjected).toLocaleString("en-IN")}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#223326", lineHeight: 1.5 }}>
                💡 <b>Farmer Selling Recommendation:</b> {result.weeklySummary.recommendedAction}
              </p>
            </div>
          )}

          {/* Daily 7-Day Forecast Grid */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#283b2d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📅 Upcoming 7 Days Day-by-Day Forecast ({result.unit || "Quintal (100 KG)"})
              </span>
              <span style={{ fontSize: "11px", color: "#748477" }}>
                Unit price & ₹/kg range
              </span>
            </div>

            <div className="forecast-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
              {result.predictions?.map((item, idx) => {
                const isUp = item.trend === "up"
                const isDown = item.trend === "down"
                return (
                  <article key={item.day || idx} style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8df",
                    borderRadius: "9px",
                    padding: "14px 12px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ color: "#2b3d30", fontSize: "12px", fontWeight: "700" }}>
                          {item.dayName}
                        </span>
                        <span style={{ color: "#7a8a7d", fontSize: "10px", fontWeight: "500" }}>
                          {item.date}
                        </span>
                      </div>

                      <div style={{ marginBottom: "6px" }}>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: isUp ? "#236336" : (isDown ? "#b3261e" : "#556457"),
                          background: isUp ? "#eaf5ec" : (isDown ? "#fceeee" : "#f1f4f0"),
                          padding: "2px 6px",
                          borderRadius: "4px",
                          display: "inline-block"
                        }}>
                          {item.trendLabel || (isUp ? "↗ Up" : isDown ? "↘ Down" : "→ Flat")} {item.changePercent ? `(${item.changePercent})` : ""}
                        </span>
                      </div>

                      <b style={{ display: "block", fontSize: "17px", margin: "4px 0 2px", color: "#192c1e" }}>
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </b>
                      <div style={{ fontSize: "11px", color: "#4d6050", fontWeight: "600", marginBottom: "8px" }}>
                        ₹{item.pricePerKg}/kg
                      </div>
                    </div>

                    <div style={{ borderTop: "1px dashed #e8eee6", paddingTop: "6px", marginTop: "4px" }}>
                      <span style={{ fontSize: "10px", color: "#79877b", display: "block" }}>
                        Range: ₹{Number(item.lower).toLocaleString("en-IN")} – ₹{Number(item.upper).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "16px", textAlign: "right" }}>
        <button className="link" onClick={onPrices} style={{ fontSize: "12px", color: "#2b7040", fontWeight: "600" }}>
          📊 View official AGMARKNET spot prices →
        </button>
      </div>
    </section>
  )
}

export default App

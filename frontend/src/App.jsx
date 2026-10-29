import { useEffect, useState, useRef } from "react"
import OfficialPrices from "./OfficialPrices.jsx"
import { supabase, isSupabaseConfigured } from "./supabase.js"
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
    greeting: "Good morning",
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

export function getTimeGreeting(language = "English") {
  const hour = new Date().getHours()
  const isMorning = hour >= 4 && hour < 12
  const isAfternoon = hour >= 12 && hour < 17

  switch (language) {
    case "हिन्दी":
      return isMorning ? "शुभ प्रभात" : isAfternoon ? "शुभ दोपहर" : "शुभ संध्या"
    case "ಕನ್ನಡ":
      return isMorning ? "ಶುಭೋದಯ" : isAfternoon ? "ಶುಭ ಮಧ್ಯಾಹ್ನ" : "ಶುಭ ಸಂಜೆ"
    case "తెలుగు":
      return isMorning ? "శుభోదయం" : isAfternoon ? "శుభ మధ్యాహ్నం" : "శుభ సాయంత్రం"
    case "தமிழ்":
      return isMorning ? "காலை வணக்கம்" : isAfternoon ? "மதிய வணக்கம்" : "மாலை வணக்கம்"
    case "मराठी":
      return isMorning ? "शुभ प्रभात" : isAfternoon ? "शुभ दुपार" : "शुभ संध्याकाळ"
    case "English":
    default:
      return isMorning ? "Good morning" : isAfternoon ? "Good afternoon" : "Good evening"
  }
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
          videoRef.current.play().catch(() => {})
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

  const t = (key) => {
    if (key === "greeting") return getTimeGreeting(lang)
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
    const hasCoords = item.farmerLat !== undefined && item.farmerLat !== "" && item.farmerLng !== undefined && item.farmerLng !== ""
    const destination = hasCoords ? encodeURIComponent(String(item.farmerLat) + "," + String(item.farmerLng)) : encodeURIComponent(String(item.address || ""))
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
              {listingLoading ? (
                <section className="panel no-demo"><p>Loading farmer listings…</p></section>
              ) : listings.length ? (
                <section className="panel farmer-listings">
                  <div className="panel-head">
                    <div>
                      <h3>Available from farmers</h3>
                      <p>{listings.length} listing{listings.length === 1 ? "" : "s"} available</p>
                    </div>
                  </div>
                  {listings.map(item => {
                    const km = distanceKm(customerLocation?.lat, customerLocation?.lng, item.farmerLat, item.farmerLng)
                    const isOwner = item.farmerId === farmerId || (profile?.phone && item.farmerPhone && String(item.farmerPhone).replace(/\D/g, "") === String(profile.phone).replace(/\D/g, ""))
                    return (
                      <article className="listing-card" key={item.id}>
                        {item.image && (
                          <div className="listing-photo-thumb">
                            <img src={item.image} alt={item.crop} />
                          </div>
                        )}
                        <div>
                          <small>{t("crop")}</small>
                          <b>{item.crop}</b>
                          <span>{item.variety || "Variety not specified"}</span>
                        </div>
                        <div>
                          <small>{t("available")}</small>
                          <b>{item.quantity} {item.unit}</b>
                          <span>{item.date || "Ready date not specified"}</span>
                        </div>
                        <div>
                          <small>{t("askingPrice")}</small>
                          <b>₹{item.price} / {item.unit}</b>
                          <span>Listed by {item.farmerName}</span>
                        </div>
                        <div>
                          <small>{t("farmerPickup")}</small>
                          <b>{item.address}</b>
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
                              <button
                                type="button"
                                className="btn-action-delete"
                                title="Delete this listing"
                                onClick={() => deleteListing(item.id, item.crop)}
                              >
                                🗑️ {t("delete")}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </section>
              ) : (
                <section className="panel no-demo">
                  <h3>No farmer listings yet</h3>
                  <p>Once a farmer adds a crop, it will appear here for customers.</p>
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
                  <h3>Add a crop for sale</h3>
                  <p>Enter the details buyers need to understand what is available, and take a real photo using your camera.</p>
                  <form
                    onSubmit={async e => {
                      e.preventDefault()
                      setListingError("")
                      setListingLoading(true)
                      const form = e.currentTarget
                      const data = Object.fromEntries(new FormData(form))
                      const saveListing = async coords => {
                        const item = {
                          ...data,
                          image: cropImage || "",
                          farmerId,
                          farmerName: profile?.name || "Farmer",
                          farmerPhone: profile?.phone || "",
                          farmerLocation: profile?.location || "",
                          farmerDistrict: profile?.district || "",
                          farmerState: profile?.state || "",
                          farmerLat: coords?.lat || "",
                          farmerLng: coords?.lng || ""
                        }
                        try {
                          const response = await fetch("/api/listings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(item)
                          })
                          const result = await response.json()
                          if (!response.ok) throw new Error(result.error || "Could not save listing.")
                          setListing(result.listing)
                          setListings(prev => [result.listing, ...prev])
                          setListed(true)
                          setCropImage(null)
                          form.reset()
                        } catch (error) {
                          setListingError(error.message)
                        } finally {
                          setListingLoading(false)
                        }
                      }
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          position => saveListing({ lat: position.coords.latitude, lng: position.coords.longitude }),
                          () => saveListing(null)
                        )
                      } else {
                        saveListing(null)
                      }
                    }}
                  >
                    <div className="form-grid">
                      <label>
                        Crop name
                        <input name="crop" required placeholder="e.g. Ginger, Tomato" />
                      </label>
                      <label>
                        Variety / grade
                        <input name="variety" placeholder="e.g. Local · Grade A" />
                      </label>
                      <label>
                        Available quantity
                        <input name="quantity" type="number" min="1" required placeholder="250" />
                      </label>
                      <label>
                        Unit
                        <select name="unit">
                          <option>kg</option>
                          <option>quintal</option>
                          <option>tonne</option>
                          <option>crate</option>
                        </select>
                      </label>
                      <label>
                        Your asking price (₹ / selected unit)
                        <input name="price" min="1" step="0.01" required type="number" placeholder="32" />
                      </label>
                      <label>
                        Harvest / ready date
                        <input name="date" type="date" />
                      </label>

                      {/* Camera Photo Component */}
                      <CropCameraCapture
                        image={cropImage}
                        onCapture={dataUrl => setCropImage(dataUrl)}
                        onClear={() => setCropImage(null)}
                      />

                      <label className="wide">
                        Pickup address
                        <input name="address" required placeholder="Village, district, state" />
                      </label>
                      <label className="wide">
                        Notes for buyers
                        <textarea name="notes" placeholder="Freshness, delivery, minimum order…" />
                      </label>
                    </div>
                    <div className="form-foot">
                      <small>Listing with your photo will be saved to the Farmezy backend and visible to customers.</small>
                      <button disabled={listingLoading}>{listingLoading ? "Saving…" : "Save crop listing →"}</button>
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
                        </div>
                        <div>
                          <small>AVAILABLE</small>
                          <b>{item.quantity} {item.unit}</b>
                          <span>{item.date || "Ready date not specified"}</span>
                        </div>
                        <div>
                          <small>ASKING PRICE</small>
                          <b>₹{item.price} / {item.unit}</b>
                          <span>{item.farmerName ? "Farmer: " + item.farmerName : "Farmer set price"}</span>
                        </div>
                        <div>
                          <small>PICKUP</small>
                          <b>{item.address}</b>
                          <span>{item.notes || "No additional notes"}</span>
                          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
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

const commodityAliases = [
  { name: "Tomato", aliases: ["tomato", "tomatoes", "tamatar", "thakkali", "tamata"] },
  { name: "Onion", aliases: ["onion", "onions", "pyaz", "vengayam", "ullipayalu", "eerulli"] },
  { name: "Potato", aliases: ["potato", "potatoes", "aloo", "urulakizhangu", "aaloo", "batata"] },
  { name: "Ginger", aliases: ["ginger", "adrak", "inji", "allam", "shunti"] },
  { name: "Ladies Finger", aliases: ["ladies finger", "lady finger", "lady s finger", "bhindi", "okra", "bhendi", "vendakkai"] },
  { name: "Garlic", aliases: ["garlic", "lehsun", "poondu", "vellulli", "bellulli"] },
  { name: "Green Chilli", aliases: ["green chilli", "green chili", "chilli", "chili", "mirchi", "milagai", "pachi mirapa"] },
  { name: "Drumstick", aliases: ["drumstick", "moringa", "sahjan", "murungakkai", "munakkaya"] },
  { name: "Brinjal", aliases: ["brinjal", "eggplant", "baingan", "kathirikai", "vankaya", "badane"] },
  { name: "Cabbage", aliases: ["cabbage", "patta gobhi", "gobhi", "muttaikose", "kose"] },
  { name: "Cauliflower", aliases: ["cauliflower", "phool gobhi", "gobi", "knool"] },
  { name: "Carrot", aliases: ["carrot", "gajar"] },
  { name: "Cucumber", aliases: ["cucumber", "kheera", "kakdi"] },
  { name: "Capsicum", aliases: ["capsicum", "shimla mirch", "bell pepper"] },
  { name: "Spinach", aliases: ["spinach", "palak", "pasalai keerai"] },
  { name: "Lemon", aliases: ["lemon", "lime", "nimbu", "elumichai", "nimmakaya"] },
  { name: "Beetroot", aliases: ["beetroot", "chukandar"] },
  { name: "Radish", aliases: ["radish", "mooli", "mullangi"] },
  { name: "Coriander", aliases: ["coriander", "dhania", "kothamalli", "kothimeera"] },
  { name: "Coconut", aliases: ["coconut", "nariyal", "thengai", "kobbari"] },
  { name: "Apple", aliases: ["apple", "seb"] },
  { name: "Banana", aliases: ["banana", "kela", "vazhaipazham", "arati pandu"] },
  { name: "Mango", aliases: ["mango", "aam", "mambazham", "mamidi"] },
  { name: "Wheat", aliases: ["wheat", "gehun", "godhumai", "godhumalu"] },
  { name: "Rice", aliases: ["rice", "chawal", "arisi", "biyyam", "akki", "paddy"] },
  { name: "Ridgeguard(Tori)", aliases: ["ridge gourd", "ridgeguard", "ridgegourd", "tori", "beerakaya", "hirekayi"] },
  { name: "Knool Khol", aliases: ["knool khol", "kohlrabi", "nolkol", "navalkol"] },
  { name: "Bengal Gram(Gram)(Whole)", aliases: ["bengal gram", "chana", "gram", "kadale"] },
  { name: "Gur(Jaggery)", aliases: ["jaggery", "gur", "bella", "bellam"] },
  { name: "Arecanut(Betelnut/Supari)", aliases: ["arecanut", "supari", "adike", "betelnut"] },
  { name: "Elephant Yam (Suran)", aliases: ["elephant yam", "suran", "yam", "suvarna gedde", "kanda"] }
]

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
  const queryState = findState(question)
  const queryDistrict = findDistrict(question)

  const state = queryState || profile?.state || "Karnataka"
  const district = queryDistrict || (queryState ? "" : (profile?.district || ""))

  const params = new URLSearchParams({ limit: "50", state })
  if (commodity) params.set("commodity", commodity)
  if (district) params.set("district", district)

  try {
    const response = await fetch("/api/mandi-prices?" + params)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Official prices service is unavailable.")
    const rows = Array.isArray(data.records) ? data.records : []
    if (!rows.length) {
      return `AGMARKNET has no reported ${commodity || "vegetable"} records for ${district ? district + ", " : ""}${state} today. Try checking another state or district.`
    }
    const record = rows[0]
    return `Latest reported ${record.commodity} wholesale price: ₹${Number(record.modal_price).toLocaleString("en-IN")} per quintal (₹${(Number(record.modal_price) / 100).toFixed(1)}/kg) at ${record.market} APMC, ${record.district}, ${record.state} (Arrival date: ${record.arrival_date || "today"}).`
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

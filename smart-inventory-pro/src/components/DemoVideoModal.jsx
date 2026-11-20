import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlay, 
  FiPause, 
  FiX, 
  FiCheckCircle, 
  FiTrendingUp, 
  FiLayers, 
  FiShoppingCart, 
  FiRefreshCw,
  FiVolume2,
  FiVolumeX,
  FiActivity,
  FiRewind,
  FiFastForward,
  FiGlobe,
  FiPackage,
  FiFileText,
  FiClock,
  FiShield
} from 'react-icons/fi';

export default function DemoVideoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const synthRef = useRef(window.speechSynthesis || null);

  // Chapters configuration (~165 seconds total = 2 mins 45 secs)
  const chapters = [
    {
      id: 0,
      titleEn: "1. System Overview",
      titleHi: "1. सिस्टम ओवरव्यू",
      moduleCode: "DASHBOARD_CORE",
      duration: 18,
      badgeEn: "EXECUTIVE TELEMETRY",
      badgeHi: "एग्जीक्यूटिव टेलीमेट्री",
      narrationEn: "Hey everyone, welcome to StockPulse Checker! Right here on the Executive Dashboard, you get an instant live pulse of your entire retail business. Track your total inventory valuation in rupees, check active SKUs, and spot critical low-stock alerts before your shelves ever go empty.",
      narrationHi: "नमस्ते दोस्तों, स्टॉकपल्स चेकर में आपका स्वागत है! यहाँ डैशबोर्ड पर आपको अपनी दुकान का बिल्कुल लाइव हिसाब मिलता है—कुल इन्वेंटरी की वैल्यू, सभी एक्टिव प्रोडक्ट्स, और कौन सा माल खत्म होने की कगार पर है, उसके तुरंत अलर्ट्स।",
      segments: [
        {
          startSec: 0,
          en: "Hey everyone, welcome to StockPulse Checker!",
          hi: "नमस्ते दोस्तों, स्टॉकपल्स चेकर में आपका स्वागत है!"
        },
        {
          startSec: 6,
          en: "Right here on the Executive Dashboard, you get an instant live pulse of your entire retail business.",
          hi: "यहाँ डैशबोर्ड पर आपको अपनी दुकान का बिल्कुल लाइव हिसाब मिलता है—कुल इन्वेंटरी की वैल्यू और सभी एक्टिव प्रोडक्ट्स।"
        },
        {
          startSec: 15,
          en: "Track your total inventory valuation in rupees, check active SKUs, and spot critical low-stock alerts before your shelves ever go empty.",
          hi: "और कौन सा माल खत्म होने की कगार पर है, उसके तुरंत अलर्ट्स आपको स्क्रीन पर दिखते हैं।"
        }
      ],
      subEn: "Live tracking of active warehouse SKUs with automated stock valuation and instant low-stock flags.",
      subHi: "दुकान की लाइव इन्वेंटरी, ऑटोमैटिक वैल्यूएशन और तुरंत लो-स्टॉक अलर्ट्स।",
      renderVisual: () => (
        <div className="demo-visual-screen-content">
          <div className="demo-kpi-row">
            <div className="demo-kpi-card green-kpi">
              <span className="demo-kpi-label">Total Inventory Value</span>
              <strong className="demo-kpi-num">₹34,500</strong>
              <span className="demo-kpi-sub">Across 4 Categories</span>
            </div>
            <div className="demo-kpi-card blue-kpi">
              <span className="demo-kpi-label">Catalog Products</span>
              <strong className="demo-kpi-num">18 Active SKUs</strong>
              <span className="demo-kpi-sub">Java JDBC Synced</span>
            </div>
            <div className="demo-kpi-card red-kpi">
              <span className="demo-kpi-label">Critical Alerts</span>
              <strong className="demo-kpi-num">4 Products</strong>
              <span className="demo-kpi-sub">Immediate Refill</span>
            </div>
          </div>
          <div className="demo-pulse-live-banner">
            <span className="live-dot-pulse"></span>
            <span>MySQL 8.0 & Java Server Connected • Engine v2.4 Active</span>
          </div>
        </div>
      )
    },
    {
      id: 1,
      titleEn: "2. Product Catalog",
      titleHi: "2. प्रोडक्ट कैटलॉग",
      moduleCode: "CATALOG_BUFFERS",
      duration: 28,
      badgeEn: "SAFETY BUFFERS & LEAD TIMES",
      badgeHi: "सेफ्टी बफर और लीड टाइम",
      narrationEn: "Next up is your Product Catalog. Here, you configure your items with real-world supplier lead times and safety cushions. If a distributor takes four days to ship, your safety buffer keeps you fully protected so you never miss a sale during sudden surges.",
      narrationHi: "अब आते हैं प्रोडक्ट कैटलॉग पर। यहाँ आप हर आइटम का सप्लायर डिलीवरी टाइम और सेफ्टी बफर सेट करते हैं। मान लीजिए डिस्ट्रीब्यूटर को नया माल पहुँचाने में चार दिन लगते हैं, तो आपका सेफ्टी बफर दुकान को हमेशा सुरक्षित रखता है।",
      segments: [
        {
          startSec: 0,
          en: "Next up is your Product Catalog.",
          hi: "अब आते हैं प्रोडक्ट कैटलॉग पर।"
        },
        {
          startSec: 6,
          en: "Here, you configure your items with real-world supplier lead times and safety cushions.",
          hi: "यहाँ आप हर आइटम का सप्लायर डिलीवरी टाइम और सेफ्टी बफर सेट करते हैं।"
        },
        {
          startSec: 16,
          en: "If a distributor takes four days to ship, your safety buffer keeps you fully protected so you never miss a sale during sudden surges.",
          hi: "मान लीजिए डिस्ट्रीब्यूटर को नया माल पहुँचाने में चार दिन लगते हैं, तो आपका सेफ्टी बफर दुकान को हमेशा सुरक्षित रखता है।"
        }
      ],
      subEn: "Set lead times and safety cushion units so you never miss a customer sale.",
      subHi: "सप्लायर का डिलीवरी टाइम और सेफ्टी स्टॉक सेट करें ताकि कभी भी माल कम न पड़े।",
      renderVisual: () => (
        <div className="demo-visual-screen-content">
          <div className="demo-catalog-table">
            <div className="catalog-head-row">
              <span>SKU</span>
              <span>NAME</span>
              <span>PRICE</span>
              <span>LEAD TIME</span>
              <span>SAFETY</span>
              <span>STOCK</span>
            </div>
            <div className="catalog-item-row danger-row">
              <span className="mono">LOG-MOU-01</span>
              <span>Logitech Wireless Mouse</span>
              <span>₹899</span>
              <span>4 Days</span>
              <span className="highlight-pill red">7 Units</span>
              <strong className="text-danger">8 (Critical)</strong>
            </div>
            <div className="catalog-item-row">
              <span className="mono">SAM-SSD-02</span>
              <span>Samsung 1TB SSD</span>
              <span>₹6,499</span>
              <span>6 Days</span>
              <span className="highlight-pill green">10 Units</span>
              <strong className="text-emerald">45 (Optimal)</strong>
            </div>
            <div className="catalog-item-row warning-row">
              <span className="mono">BOY-MIC-03</span>
              <span>Boya Lavalier Mic</span>
              <span>₹1,499</span>
              <span>3 Days</span>
              <span className="highlight-pill yellow">5 Units</span>
              <strong className="text-warning">14 (Warning)</strong>
            </div>
          </div>
          <div className="demo-tip-footer">
            <FiShield className="text-emerald" /> Lead time & safety stock form the backbone of the ROP algorithm.
          </div>
        </div>
      )
    },
    {
      id: 2,
      titleEn: "3. Stock In / Out",
      titleHi: "3. स्टॉक इन / आउट",
      moduleCode: "INVENTORY_MOVEMENTS",
      duration: 26,
      badgeEn: "AUDIT LOGGED MOVEMENTS",
      badgeHi: "ऑडिट लॉग्ड मूवमेंट्स",
      narrationEn: "Managing warehouse movements is super straightforward. When a fresh batch arrives from your distributor, log a Stock Inward with the invoice note. Handled customer returns or damaged goods? Record a Stock Outward—every single movement is fully audited.",
      narrationHi: "दुकान में माल की एंट्री करना अब बहुत आसान है। डिस्ट्रीब्यूटर से नया माल आए तो इनवर्ड में क्वांटिटी और इनवॉइस नंबर डाल दें। और अगर कोई डैमेज या वापसी हो, तो आउटवर्ड में कारण लिखकर सेव कर लें। सारा हिसाब सुरक्षित रहेगा।",
      segments: [
        {
          startSec: 0,
          en: "Managing warehouse movements is super straightforward.",
          hi: "दुकान में माल की एंट्री करना अब बहुत आसान है।"
        },
        {
          startSec: 6,
          en: "When a fresh batch arrives from your distributor, log a Stock Inward with the invoice note.",
          hi: "डिस्ट्रीब्यूटर से नया माल आए तो इनवर्ड में क्वांटिटी और इनवॉइस नंबर डाल दें।"
        },
        {
          startSec: 15,
          en: "Handled customer returns or damaged goods? Record a Stock Outward—every single movement is fully audited.",
          hi: "और अगर कोई डैमेज या वापसी हो, तो आउटवर्ड में कारण लिखकर सेव कर लें। सारा हिसाब सुरक्षित रहेगा।"
        }
      ],
      subEn: "Record inward purchase shipments and outward write-offs with automatic timestamped logs.",
      subHi: "नया माल आने पर इनवर्ड और डैमेज के लिए आउटवर्ड एंट्री करें, तारीख और वजह के साथ।",
      renderVisual: () => (
        <div className="demo-visual-screen-content">
          <div className="demo-stock-movement-grid">
            <div className="movement-card inward">
              <div className="movement-header">
                <span className="badge-inward">INWARD +50</span>
                <span className="time-tag">Today, 10:30 AM</span>
              </div>
              <p>Supplier Shipment Received: Logitech Mouse</p>
              <div className="movement-footer">New Shelf Balance: 58 Units</div>
            </div>
            <div className="movement-card outward">
              <div className="movement-header">
                <span className="badge-outward">OUTWARD -2</span>
                <span className="time-tag">Yesterday, 04:15 PM</span>
              </div>
              <p>Damage Write-off: Box crushed during transit</p>
              <div className="movement-footer">Approved by Inventory Manager</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      titleEn: "4. Point of Sale",
      titleHi: "4. पॉइंट ऑफ़ सेल (POS)",
      moduleCode: "POS_BILLING_ACID",
      duration: 28,
      badgeEn: "ATOMIC TRANSACTIONS",
      badgeHi: "एटॉमिक ट्रांजैक्शन",
      narrationEn: "Here is your fast cashier POS counter. Simply pick products from the catalog, enter the customer's phone or UPI, and complete checkout. The backend instantly deducts stock with zero negative inventory risk and generates a clean, printable tax invoice.",
      narrationHi: "यह है आपका सुपर-फास्ट बिलिंग काउंटर। बस प्रोडक्ट्स चुनिए, कस्टमर का नंबर या पेमेंट मोड सिलेक्ट करिए और चेकआउट दबाइए। सिस्टम तुरंत स्टॉक घटा देता है ताकि कोई गड़बड़ी न हो, और पक्का टैक्स बिल तैयार हो जाता है।",
      segments: [
        {
          startSec: 0,
          en: "Here is your fast cashier POS counter.",
          hi: "यह है आपका सुपर-फास्ट बिलिंग काउंटर।"
        },
        {
          startSec: 6,
          en: "Simply pick products from the catalog, enter the customer's phone or UPI, and complete checkout.",
          hi: "बस प्रोडक्ट्स चुनिए, कस्टमर का नंबर या पेमेंट मोड सिलेक्ट करिए और चेकआउट दबाइए।"
        },
        {
          startSec: 16,
          en: "The backend instantly deducts stock with zero negative inventory risk and generates a clean, printable tax invoice.",
          hi: "सिस्टम तुरंत स्टॉक घटा देता है ताकि कोई गड़बड़ी न हो, और पक्का टैक्स बिल तैयार हो जाता है।"
        }
      ],
      subEn: "Fast counter billing with instant stock deduction and direct PDF tax receipt download.",
      subHi: "तेज़ काउंटर बिलिंग, ऑटोमैटिक स्टॉक डिडक्शन और डायरेक्ट पीडीएफ टैक्स बिल डाउनलोड।",
      renderVisual: () => (
        <div className="demo-visual-screen-content">
          <div className="demo-pos-split">
            <div className="pos-cart-box">
              <div className="cart-title">ACTIVE POS CART</div>
              <div className="cart-item">
                <span>Logitech Wireless Mouse (x2)</span>
                <strong>₹1,798</strong>
              </div>
              <div className="cart-item">
                <span>Boya Lavalier Mic (x1)</span>
                <strong>₹1,499</strong>
              </div>
              <div className="cart-total-bar">
                <span>Total Amount:</span>
                <span className="text-emerald font-bold">₹3,297</span>
              </div>
            </div>
            <div className="pos-invoice-slip">
              <div className="slip-top">STOCKPULSE TAX INVOICE</div>
              <div className="slip-no">#INV-2026-9042 • Cashier 01</div>
              <div className="slip-stamp">
                <FiCheckCircle /> ATOMIC COMMIT SUCCESS
              </div>
              <div className="slip-note">Shelf Stock Deducted via JDBC</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      titleEn: "5. Demand Predictor",
      titleHi: "5. डिमांड प्रिडिक्टर",
      moduleCode: "ROP_ALGORITHM_MATH",
      duration: 32,
      badgeEn: "REORDER POINT (ROP) MATH",
      badgeHi: "रीऑर्डर पॉइंट गणित",
      narrationEn: "This is the core brain of the platform: our Demand Predictor Engine. It analyzes your thirty-day sales velocity and calculates the exact Reorder Point using Daily Sales times Lead Time plus Safety Stock. The second an SKU hits critical, it flags an urgent refill so you never stock out.",
      narrationHi: "और यह है सिस्टम का सबसे ताकतवर दिमाग—हमारा डिमांड प्रिडिक्टर! यह आपकी 30 दिनों की बिक्री देखकर खुद हिसाब लगाता है कि कब और कितना नया माल मंगाना है। जैसे ही कोई प्रोडक्ट खतरे के निशान तक पहुँचता है, यह तुरंत रीस्टॉक का अलर्ट दे देता है।",
      segments: [
        {
          startSec: 0,
          en: "This is the core brain of the platform: our Demand Predictor Engine.",
          hi: "और यह है सिस्टम का सबसे ताकतवर दिमाग—हमारा डिमांड प्रिडिक्टर!"
        },
        {
          startSec: 7,
          en: "It analyzes your thirty-day sales velocity and calculates the exact Reorder Point using Daily Sales times Lead Time plus Safety Stock.",
          hi: "यह आपकी 30 दिनों की बिक्री देखकर खुद हिसाब लगाता है कि कब और कितना नया माल मंगाना है।"
        },
        {
          startSec: 18,
          en: "The second an SKU hits critical, it flags an urgent refill so you never stock out.",
          hi: "जैसे ही कोई प्रोडक्ट खतरे के निशान तक पहुँचता है, यह तुरंत रीस्टॉक का अलर्ट दे देता है।"
        }
      ],
      subEn: "ROP Formula: (Average Daily Sales × Lead Time) + Safety Stock. Prevents shelf stockouts before they occur.",
      subHi: "फार्मूला: ROP = (डेली सेल्स × लीड टाइम) + सेफ्टी स्टॉक। माल शून्य होने से पहले अलर्ट मिलता है।",
      renderVisual: () => (
        <div className="demo-visual-screen-content">
          <div className="demo-rop-formula-box">
            <div className="rop-banner">
              <code>ROP = (Average Daily Sales × Lead Time) + Safety Stock</code>
            </div>
            <div className="rop-breakdown-grid">
              <div className="rop-param">
                <span className="param-label">Daily Sales (ADS)</span>
                <span className="param-val">2.8 Units / day</span>
              </div>
              <div className="rop-param">
                <span className="param-label">Lead Time (LT)</span>
                <span className="param-val">4 Days</span>
              </div>
              <div className="rop-param">
                <span className="param-label">Safety Buffer (SS)</span>
                <span className="param-val">7 Units</span>
              </div>
              <div className="rop-param highlight-green">
                <span className="param-label">Calculated ROP</span>
                <span className="param-val text-emerald">18.2 Units</span>
              </div>
            </div>
            <div className="rop-alert-strip">
              <span className="badge-critical-pulse">CRITICAL</span>
              <span>Shelf Stock (8) &le; ROP (18) &bull; Suggested Refill: +82 Units for 30-Day Target</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      titleEn: "6. Purchase Restock",
      titleHi: "6. परचेज रीस्टॉक",
      moduleCode: "PURCHASE_RESTOCK_LOOP",
      duration: 26,
      badgeEn: "AUTO PURCHASE ORDER",
      badgeHi: "ऑटो परचेज आर्डर",
      narrationEn: "Finally, with one click on Suggested Restock, the system generates a purchase order that refills your shelves back to an optimal thirty-day target. You can also download your full sales ledgers and invoices as clean PDFs with a single tap. Complete peace of mind!",
      narrationHi: "आखिर में, सिर्फ एक क्लिक में सजेस्टेड रीस्टॉक दबाइए, और 30 दिनों का नया परचेज ऑर्डर तैयार! साथ ही आप जब चाहें अपने सभी पिछले बिलों और बहीखातों की पीडीएफ भी डाउनलोड कर सकते हैं। दुकान चलाना अब हुआ बिल्कुल आसान और चिंता-मुक्त!",
      segments: [
        {
          startSec: 0,
          en: "Finally, with one click on Suggested Restock, the system generates a purchase order that refills your shelves back to an optimal thirty-day target.",
          hi: "आखिर में, सिर्फ एक क्लिक में सजेस्टेड रीस्टॉक दबाइए, और 30 दिनों का नया परचेज ऑर्डर तैयार!"
        },
        {
          startSec: 10,
          en: "You can also download your full sales ledgers and invoices as clean PDFs with a single tap.",
          hi: "साथ ही आप जब चाहें अपने सभी पिछले बिलों और बहीखातों की पीडीएफ भी डाउनलोड कर सकते हैं।"
        },
        {
          startSec: 17,
          en: "Complete peace of mind for your retail business!",
          hi: "दुकान चलाना अब हुआ बिल्कुल आसान और चिंता-मुक्त!"
        }
      ],
      subEn: "1-Click automated PO generation restores inventory health with instant PDF downloads.",
      subHi: "एक क्लिक में परचेज ऑर्डर बनाकर स्टॉक सुरक्षित करें, साथ ही सभी बिलों की पीडीएफ डाउनलोड करें।",
      renderVisual: () => (
        <div className="demo-visual-screen-content">
          <div className="demo-po-final-card">
            <div className="po-header">
              <span className="po-title">PURCHASE ORDER #PO-2026-882</span>
              <span className="po-status-ok">100% HEALTH RESTORED</span>
            </div>
            <div className="po-content-row">
              <div className="po-col">
                <span className="po-label">Supplier Order:</span>
                <strong>Logitech Wireless Mouse</strong>
              </div>
              <div className="po-col">
                <span className="po-label">Quantity Refilled:</span>
                <strong className="text-emerald">+82 Units</strong>
              </div>
              <div className="po-col">
                <span className="po-label">Target Buffer:</span>
                <strong>30 Days Coverage</strong>
              </div>
            </div>
            <div className="po-ledger-btn-preview">
              <FiCheckCircle className="text-emerald" /> Stockout Risk Eliminated &bull; Single & Ledger Invoices Ready to Print
            </div>
          </div>
        </div>
      )
    }
  ];

  // State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.75 | 1 | 1.25

  // Total duration in seconds
  const totalDuration = chapters.reduce((acc, ch) => acc + ch.duration, 0);

  // Calculate cumulative chapter start times
  const chapterStarts = chapters.reduce((acc, ch, idx) => {
    if (idx === 0) return [0];
    return [...acc, acc[idx - 1] + chapters[idx - 1].duration];
  }, []);

  const lastSpokenChapterRef = useRef(-1);
  const activeUtteranceTextRef = useRef('');
  const currentCharIndexRef = useRef(0);
  const isSpeakingRef = useRef(false);
  const overviewAudioRef = useRef(null);

  // Helper to determine chapter for any given second
  const getChapterForSec = (sec) => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (sec >= chapterStarts[i]) return i;
    }
    return 0;
  };

  // Speed to utterance speech rate helper
  const calculateRate = (speed, lang) => {
    if (lang === 'hi') {
      return Math.min(1.8, Math.max(0.55, 0.88 * speed));
    }
    return Math.min(2.0, Math.max(0.6, 0.92 * speed));
  };

  // Find best available human voice
  const getBestVoice = (lang) => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'hi') {
      const hindi = voices.find(v => 
        (v.lang && (v.lang.toLowerCase() === 'hi-in' || v.lang.toLowerCase().startsWith('hi'))) ||
        (v.name && (v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('hemant')))
      ) || voices.find(v => 
        (v.lang && v.lang.toLowerCase() === 'en-in') ||
        (v.name && (v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('ravi')))
      );
      if (hindi) return hindi;
    } else {
      const english = voices.find(v => 
        (v.name && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online') || v.name.toLowerCase().includes('aria') || v.name.toLowerCase().includes('jenny')))
      ) || voices.find(v => 
        (v.lang && (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en-gb'))
      ) || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      if (english) return english;
    }
    return voices[0] || null;
  };

  // Timeline-synchronized speech executor: speaks strictly from the current chapter second offset
  const speakFromOffset = (chIdx, offsetSec = 0, lang = language, speed = playbackSpeed) => {
    // CHAPTER 0 (System Overview): Use user's real voiceover for Hindi; keep speech synthesis for English!
    if (chIdx === 0 && lang === 'hi') {
      if (synthRef.current) synthRef.current.cancel();
      isSpeakingRef.current = false;
      if (overviewAudioRef.current) {
        overviewAudioRef.current.playbackRate = speed;
        overviewAudioRef.current.muted = isMuted;
        overviewAudioRef.current.currentTime = Math.min(17.28, Math.max(0, offsetSec));
        if (isPlaying && !isMuted) {
          overviewAudioRef.current.play().catch(e => console.warn('Audio play error:', e));
        }
      }
      lastSpokenChapterRef.current = 0;
      return;
    }

    // For English or other chapters (1-5), pause overview audio and speak via natural voice synthesis
    if (overviewAudioRef.current) {
      overviewAudioRef.current.pause();
    }

    if (!synthRef.current || isMuted) return;
    synthRef.current.cancel();

    const targetCh = chapters[chIdx];
    if (!targetCh) return;

    // Determine which segment matches this timeline offset
    let segIdx = 0;
    if (targetCh.segments && targetCh.segments.length > 0) {
      targetCh.segments.forEach((seg, idx) => {
        if (offsetSec >= seg.startSec) {
          segIdx = idx;
        }
      });
    }

    // Compose narration from this segment onwards (never restarting earlier already-passed sentences!)
    let textToSpeak = '';
    if (targetCh.segments && targetCh.segments.length > 0) {
      textToSpeak = targetCh.segments.slice(segIdx).map(s => lang === 'hi' ? s.hi : s.en).join(' ');
    } else {
      textToSpeak = lang === 'hi' ? targetCh.narrationHi : targetCh.narrationEn;
    }

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = calculateRate(speed, lang);
    utterance.pitch = lang === 'hi' ? 1.0 : 1.02;

    const voice = getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    }

    activeUtteranceTextRef.current = textToSpeak;
    currentCharIndexRef.current = 0;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        currentCharIndexRef.current = e.charIndex;
      }
    };

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
    };

    lastSpokenChapterRef.current = chIdx;
    synthRef.current.speak(utterance);
  };

  // Master Seek & Jump Function - perfectly synchronizes audio and video to the exact timeline
  const seekTo = (targetSec, startNarration = isPlaying) => {
    const clamped = Math.max(0, Math.min(totalDuration, targetSec));
    setElapsedSeconds(clamped);

    const targetCh = getChapterForSec(clamped);
    setCurrentChapterIdx(targetCh);
    const offsetInCh = clamped - chapterStarts[targetCh];

    if (startNarration && !isMuted) {
      speakFromOffset(targetCh, offsetInCh, language, playbackSpeed);
    } else {
      if (synthRef.current) {
        synthRef.current.cancel();
        isSpeakingRef.current = false;
        lastSpokenChapterRef.current = -1;
      }
      if (overviewAudioRef.current) {
        overviewAudioRef.current.pause();
      }
    }
  };

  // Main playback timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      const intervalMs = Math.round(1000 / playbackSpeed);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            if (synthRef.current) synthRef.current.cancel();
            isSpeakingRef.current = false;
            return totalDuration;
          }
          const nextSec = prev + 1;
          const newChIdx = getChapterForSec(nextSec);
          if (newChIdx !== currentChapterIdx) {
            setCurrentChapterIdx(newChIdx);
            if (!isMuted) {
              speakFromOffset(newChIdx, 0, language, playbackSpeed);
            }
          }
          return nextSec;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalDuration, isMuted, language, currentChapterIdx]);

  // Initial autoplay speech trigger on modal mount
  useEffect(() => {
    if (isPlaying && !isMuted) {
      const t = setTimeout(() => {
        speakFromOffset(currentChapterIdx, 0, language, playbackSpeed);
      }, 250);
      return () => clearTimeout(t);
    }
  }, []);

  // Cleanup speech on modal close or unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (overviewAudioRef.current) overviewAudioRef.current.pause();
      isSpeakingRef.current = false;
    };
  }, []);

  // Controls
  const togglePlay = () => {
    if (elapsedSeconds >= totalDuration) {
      seekTo(0, true);
      setIsPlaying(true);
    } else {
      const nextPlay = !isPlaying;
      setIsPlaying(nextPlay);
      if (nextPlay) {
        const offsetInCh = elapsedSeconds - chapterStarts[currentChapterIdx];
        speakFromOffset(currentChapterIdx, offsetInCh, language, playbackSpeed);
      } else {
        if (synthRef.current) {
          synthRef.current.cancel();
          isSpeakingRef.current = false;
        }
        if (overviewAudioRef.current) {
          overviewAudioRef.current.pause();
        }
      }
    }
  };

  const rewind10 = () => {
    seekTo(elapsedSeconds - 10, isPlaying);
  };

  const forward10 = () => {
    seekTo(elapsedSeconds + 10, isPlaying);
  };

  const jumpToChapter = (idx) => {
    setIsPlaying(true);
    seekTo(chapterStarts[idx], true);
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newSeconds = Math.round(ratio * totalDuration);
    seekTo(newSeconds, isPlaying);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (overviewAudioRef.current) {
      overviewAudioRef.current.muted = nextMuted;
    }
    if (nextMuted) {
      if (synthRef.current) {
        synthRef.current.cancel();
        isSpeakingRef.current = false;
      }
      if (overviewAudioRef.current) {
        overviewAudioRef.current.pause();
      }
    } else if (isPlaying) {
      const offsetInCh = elapsedSeconds - chapterStarts[currentChapterIdx];
      speakFromOffset(currentChapterIdx, offsetInCh, language, playbackSpeed);
    }
  };

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    if (synthRef.current) {
      synthRef.current.cancel();
      isSpeakingRef.current = false;
    }
    if (overviewAudioRef.current) {
      overviewAudioRef.current.pause();
    }
    if (isPlaying && !isMuted) {
      const offsetInCh = elapsedSeconds - chapterStarts[currentChapterIdx];
      speakFromOffset(currentChapterIdx, offsetInCh, lang, playbackSpeed);
    }
  };

  const speedsList = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Dynamic Speed Controller: changes voice speed on the fly WITHOUT resetting back to word 1!
  const setSpeed = (spd) => {
    setPlaybackSpeed(spd);
    if (overviewAudioRef.current) {
      overviewAudioRef.current.playbackRate = spd;
    }

    // If speech is currently playing, seamlessly transition speed without resetting!
    if (synthRef.current && isSpeakingRef.current && !isMuted) {
      const fullText = activeUtteranceTextRef.current || '';
      const charIdx = currentCharIndexRef.current || 0;
      const remainingText = fullText.slice(charIdx).trim();

      if (remainingText.length > 2) {
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(remainingText);
        utterance.rate = calculateRate(spd, language);
        utterance.pitch = language === 'hi' ? 1.0 : 1.02;

        const voice = getBestVoice(language);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }

        utterance.onstart = () => {
          isSpeakingRef.current = true;
        };

        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            currentCharIndexRef.current = charIdx + e.charIndex;
          }
        };

        utterance.onend = () => {
          isSpeakingRef.current = false;
        };

        utterance.onerror = () => {
          isSpeakingRef.current = false;
        };

        activeUtteranceTextRef.current = fullText;
        synthRef.current.speak(utterance);
      }
    }
  };

  // Time formatter mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const active = chapters[currentChapterIdx];
  const progressPercent = Math.min(100, (elapsedSeconds / totalDuration) * 100);

  // Dynamic timeline-synchronized active subtitle segment
  const offsetInActiveChapter = Math.max(0, elapsedSeconds - (chapterStarts[currentChapterIdx] || 0));
  const activeSegment = active?.segments?.reduce((prev, curr) => {
    return offsetInActiveChapter >= curr.startSec ? curr : prev;
  }, active.segments[0]) || null;

  const currentSegmentSubtitle = activeSegment 
    ? (language === 'hi' ? activeSegment.hi : activeSegment.en)
    : (language === 'hi' ? active.narrationHi : active.narrationEn);

  return (
    <div className="modal-backdrop demo-modal-backdrop">
      <audio 
        ref={overviewAudioRef} 
        src="/audio/system_overview_voiceover.mp4" 
        preload="auto" 
      />
      <div className="modal-card demo-video-card">
        {/* Modal Top Header */}
        <div className="demo-header">
          <div className="demo-title-group">
            <span className="demo-badge">
              <FiActivity /> 2.5-MIN ENTERPRISE TUTORIAL
            </span>
            <h3>StockPulse Checker - Complete Application Guide</h3>
          </div>

          <div className="demo-header-actions">
            {/* Bilingual Language Switcher */}
            <div className="language-toggle-pill">
              <FiGlobe className="lang-icon" />
              <button 
                type="button"
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => toggleLanguage('en')}
                title="Switch voice & subtitles to English"
              >
                English
              </button>
              <button 
                type="button"
                className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                onClick={() => toggleLanguage('hi')}
                title="आवाज और सबटाइटल्स हिंदी में बदलें"
              >
                हिंदी
              </button>
            </div>

            <button 
              type="button"
              className="btn-close" 
              onClick={() => {
                if (synthRef.current) synthRef.current.cancel();
                if (overviewAudioRef.current) overviewAudioRef.current.pause();
                onClose();
              }}
              title="Close Tutorial"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Video Player Display Screen (Mini Player) */}
        <div className="video-player-screen">
          {/* Top Video Overlay Bar */}
          <div className="video-step-overlay">
            <span className="step-indicator-pill">
              <FiLayers /> CHAPTER {currentChapterIdx + 1} OF 6: {language === 'hi' ? active.titleHi : active.titleEn}
            </span>

            <div className="overlay-right-badges">
              <span className="voiceover-tag">
                {language === 'hi' ? active.badgeHi : active.badgeEn}
              </span>
              <button 
                type="button"
                className="btn-audio-toggle" 
                onClick={toggleMute}
                title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
              >
                {isMuted ? <FiVolumeX className="text-muted" /> : <FiVolume2 className="text-emerald" />}
              </button>
            </div>
          </div>

          {/* Interactive Screen Mockup Canvas */}
          <div className="video-animated-content">
            <div className="video-screen-mockup">
              <div className="mockup-header-bar">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="mockup-url">stockpulse.internal/{active.moduleCode.toLowerCase()}</span>
                <span className="mockup-speed-tag">{playbackSpeed}x SPEED</span>
              </div>
              <div className="mockup-screen-body">
                {active.renderVisual()}
              </div>
            </div>
          </div>

          {/* Subtitles Bar (Bilingual with Dual Representation) */}
          <div className="video-subtitles-bar">
            <div className="subtitle-speaker-tag">
              {language === 'hi' ? 'AI गाइड (हिंदी):' : 'AI TUTOR (EN):'}
            </div>
            <div className="subtitle-text-wrap">
              <p className="primary-sub">
                {currentSegmentSubtitle}
              </p>
              <p className="secondary-sub-hint">
                {language === 'hi' ? active.subHi : active.subEn}
              </p>
            </div>
          </div>

          {/* Interactive Clickable Seekable Scrub Bar */}
          <div 
            className="video-progress-track seekable" 
            onClick={handleScrub}
            title="Click anywhere to scrub playback"
          >
            <div 
              className="video-progress-fill" 
              style={{ width: `${progressPercent}%` }}
            >
              <span className="scrubber-thumb-head"></span>
            </div>
          </div>

          {/* Time & Duration Row */}
          <div className="video-time-row">
            <span className="current-time-tag">
              <FiClock /> {formatTime(elapsedSeconds)}
            </span>
            <span className="total-time-tag">
              {formatTime(totalDuration)} Total Guide
            </span>
          </div>
        </div>

        {/* Video Playback Controls Bar */}
        <div className="video-playback-controls-container">
          <div className="playback-top-row">
            <div className="playback-buttons-group">
              {/* Play/Pause Button */}
              <button 
                type="button"
                className={`demo-play-btn ${isPlaying ? 'state-playing' : 'state-paused'}`}
                onClick={togglePlay}
                title={isPlaying ? "Pause Tutorial" : "Play Tutorial"}
              >
                {isPlaying ? <FiPause className="demo-btn-icon" /> : <FiPlay className="demo-btn-icon" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              {/* Rewind 10s */}
              <button 
                type="button"
                className="btn-playback-tool" 
                onClick={rewind10}
                title="Rewind 10 seconds"
              >
                <FiRewind />
                <span>-10s</span>
              </button>

              {/* Fast Forward 10s */}
              <button 
                type="button"
                className="btn-playback-tool" 
                onClick={forward10}
                title="Forward 10 seconds"
              >
                <FiFastForward />
                <span>+10s</span>
              </button>
            </div>

            {/* Dynamic Speed Selector Pills: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x */}
            <div className="speed-pills-selector">
              <span className="speed-title-label">Speed:</span>
              {speedsList.map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className={`speed-pill-btn ${playbackSpeed === spd ? 'active' : ''}`}
                  onClick={() => setSpeed(spd)}
                  title={`Set speed to ${spd}x`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Selector Tabs (2 Rows of 3 Cards - No Overflows) */}
          <div className="video-chapters-grid">
            {chapters.map((ch, i) => (
              <button
                key={i}
                type="button"
                className={`chapter-tab-pill ${currentChapterIdx === i ? 'active' : ''}`}
                onClick={() => jumpToChapter(i)}
                title={language === 'hi' ? ch.titleHi : ch.titleEn}
              >
                <span className="pill-num">{i + 1}</span>
                <div className="pill-text-col">
                  <span className="pill-name">{language === 'hi' ? ch.titleHi.replace(/^\d+\.\s*/, '') : ch.titleEn.replace(/^\d+\.\s*/, '')}</span>
                  <span className="pill-duration-hint">{ch.duration}s</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="demo-footer-actions">
          <button 
            type="button"
            className="demo-btn-close-action" 
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              if (overviewAudioRef.current) overviewAudioRef.current.pause();
              onClose();
            }}
          >
            <FiX /> Close Demo
          </button>
          <button 
            type="button"
            className="demo-btn-cta" 
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              if (overviewAudioRef.current) overviewAudioRef.current.pause();
              onClose();
              navigate('/demand-predictor');
            }}
          >
            <FiTrendingUp className="cta-icon-pulse" /> Try Live Demand Predictor Now &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

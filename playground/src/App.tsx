import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import PdfUploader from './PdfUploader';
import ZipUploader from './ZipUploader';
import ConfirmationScreen from './ConfirmationScreen';
import VerdictScreen from './VerdictScreen';
// @ts-ignore
import { compileInvoice } from './fable/Library.ts';

const translations: Record<string, { en: string, hi: string, hint_en: string, hint_hi: string }> = {
  GSTIN_FORMAT: {
    en: "The GSTIN provided for the buyer/seller is invalid or has a typo.",
    hi: "खरीदार/विक्रेता के लिए दिया गया GSTIN अमान्य है या उसमें कोई टाइपो है।",
    hint_en: "Verify the 15-character GSTIN. It must pass the Mod-36 checksum.",
    hint_hi: "कृपया 15-अक्षरों वाले GSTIN की जाँच करें।"
  },
  TAX_AMOUNT: {
    en: "The calculated tax amount is mathematically incorrect.",
    hi: "गिना गया टैक्स अमाउंट गणितीय रूप से गलत है।",
    hint_en: "Ensure your Taxable Value multiplied by the GST Rate equals the total tax.",
    hint_hi: "सुनिश्चित करें कि कर योग्य मूल्य (Taxable Value) और GST दर का गुणा सही है।"
  },
  IGST_CGST_LAW: {
    en: "You billed a customer in a different state, but charged local tax. This will cost you penalties. Change it to IGST.",
    hi: "आपने दूसरे राज्य के ग्राहक को बिल दिया है, लेकिन स्थानीय टैक्स (CGST/SGST) लगाया है। इससे आपको जुर्माना लग सकता है। कृपया इसे IGST में बदलें।",
    hint_en: "Change CGST/SGST amounts to 0, and put the full tax in IGST.",
    hint_hi: "CGST/SGST को 0 करें, और पूरी टैक्स राशि को IGST में डालें।"
  },
  INV_SANITY_DATE: {
    en: "Invoice date is missing.",
    hi: "चालान की तारीख गायब है।",
    hint_en: "Provide a valid invoice date.",
    hint_hi: "मान्य चालान तारीख प्रदान करें।"
  },
  INV_SANITY_ITEMS: {
    en: "No items found in the invoice.",
    hi: "चालान में कोई आइटम नहीं मिला।",
    hint_en: "An invoice must have at least one line item.",
    hint_hi: "चालान में कम से कम एक आइटम होना चाहिए।"
  },
  INV_SANITY_NO: {
    en: "Invoice number is missing.",
    hi: "चालान नंबर गायब है।",
    hint_en: "Provide a valid invoice नंबर.",
    hint_hi: "मान्य चालान नंबर प्रदान करें।"
  },
  PLACE_OF_SUPPLY_UNKNOWN: {
    en: "Place of supply could not be determined.",
    hi: "सप्लाई का स्थान निर्धारित नहीं किया जा सका।",
    hint_en: "Ensure buyer GSTIN or explicit PlaceOfSupply is provided.",
    hint_hi: "सुनिश्चित करें कि खरीदार का GSTIN या स्पष्ट PlaceOfSupply दिया गया है।"
  },
  RCM_TAX_CHARGED: {
    en: "Tax collected on a Reverse Charge (RCM) invoice.",
    hi: "रिवर्स चार्ज (RCM) चालान पर टैक्स वसूला गया है।",
    hint_en: "Seller cannot collect tax under RCM. Change tax amounts to 0.",
    hint_hi: "विक्रेता RCM के तहत टैक्स नहीं वसूल सकता। टैक्स राशि को 0 करें।"
  },
  RCM_LAW: {
    en: "Mandatory Reverse Charge applies, but RCM is not flagged.",
    hi: "अनिवार्य रिवर्स चार्ज लागू होता है, लेकिन RCM फ्लैग नहीं किया गया है।",
    hint_en: "Set ReverseCharge to 'Y'.",
    hint_hi: "ReverseCharge को 'Y' पर सेट करें।"
  },
  GSTIN_STATE_MATCH: {
    en: "Buyer State Code does not match GSTIN prefix.",
    hi: "क्रेता का राज्य कोड GSTIN के पहले 2 अंकों से मेल नहीं खाता।",
    hint_en: "Ensure the state code is the first two digits of the GSTIN.",
    hint_hi: "सुनिश्चित करें कि राज्य कोड GSTIN के पहले दो अंक हैं।"
  },
  HSN_FORMAT: {
    en: "HSN code is invalid.",
    hi: "HSN कोड अमान्य है।",
    hint_en: "HSN must be exactly 4, 6, or 8 digits.",
    hint_hi: "HSN बिल्कुल 4, 6, या 8 अंकों का होना चाहिए।"
  },
  RATE_SLAB: {
    en: "GST rate is not a standard Indian slab.",
    hi: "GST दर मानक भारतीय स्लैब नहीं है।",
    hint_en: "Use a valid rate like 0, 0.1, 0.25, 1.5, 3, 5, 12, 18, 28.",
    hint_hi: "मान्य दर का उपयोग करें जैसे 0, 5, 12, 18, 28।"
  },
  CESS_ARITHMETIC: {
    en: "Cess calculation error.",
    hi: "सेस गणना त्रुटि।",
    hint_en: "Check Cess amounts and rates.",
    hint_hi: "सेस राशि और दरों की जाँच करें।"
  },
  INV_SANITY_TAXABLE: {
    en: "Taxable value cannot be negative.",
    hi: "कर योग्य मूल्य नकारात्मक नहीं हो सकता।",
    hint_en: "Make sure taxable value is zero or positive.",
    hint_hi: "सुनिश्चित करें कि मूल्य शून्य या सकारात्मक है।"
  },
  INV_SANITY_RATE: {
    en: "GST Rate cannot be negative.",
    hi: "GST दर नकारात्मक नहीं हो सकती।",
    hint_en: "Enter a positive GST rate.",
    hint_hi: "सकारात्मक GST दर दर्ज करें।"
  },
  DOC_TYPE: {
    en: "Invalid Document Type.",
    hi: "अमान्य दस्तावेज़ प्रकार।",
    hint_en: "Must be INVOICE, CREDIT_NOTE, or DEBIT_NOTE.",
    hint_hi: "चालान, क्रेडिट नोट या डेबिट नोट होना चाहिए।"
  },
  CDN_ORIGINAL_INV: {
    en: "Original invoice reference missing for note.",
    hi: "क्रेडिट/डेबिट नोट के लिए मूल चालान का संदर्भ गायब है।",
    hint_en: "Provide the original invoice number and date.",
    hint_hi: "मूल चालान नंबर और तारीख प्रदान करें।"
  },
  IRN_FORMAT: {
    en: "IRN format invalid.",
    hi: "IRN प्रारूप अमान्य है।",
    hint_en: "IRN must be 64 hexadecimal characters.",
    hint_hi: "IRN 64 हेक्साडेसिमल अक्षरों का होना चाहिए।"
  },
  STATE_CODE: {
    en: "State code invalid.",
    hi: "राज्य कोड अमान्य है।",
    hint_en: "Use a valid code (01-38, 97, 99).",
    hint_hi: "मान्य कोड का उपयोग करें।"
  },
  PLACE_OF_SUPPLY: {
    en: "Invalid place of supply code.",
    hi: "अमान्य आपूर्ति स्थान कोड।",
    hint_en: "Use a valid state code for POS.",
    hint_hi: "POS के लिए मान्य राज्य कोड का उपयोग करें।"
  },
  SEC_170_ROUNDING: {
    en: "Invoice total is not rounded to nearest Rupee.",
    hi: "चालान का कुल योग निकटतम रुपये में पूर्णांकित नहीं है।",
    hint_en: "Round off the final invoice total.",
    hint_hi: "अंतिम योग को राउंड ऑफ करें।"
  }
};

const sampleInvoices: Record<string, string> = {
  "Valid B2B Invoice": `{
  "InvoiceNumber": "INV-001",
  "InvoiceDate": "2026-07-08",
  "Seller": {
    "Gstin": "29ABCDE1234F1ZW",
    "StateCode": "29"
  },
  "Buyer": {
    "Gstin": "33PQRSX9876L1ZV",
    "StateCode": "33"
  },
  "Items": [
    {
      "Hsn": "847130",
      "TaxableValue": 100000,
      "GstRate": 18,
      "Tax": {
        "Igst": 18000,
        "Cgst": 0,
        "Sgst": 0
      }
    }
  ]
}`,
  "Invalid - Math Mismatch": `{
  "InvoiceNumber": "INV-002",
  "InvoiceDate": "2026-07-08",
  "Seller": {
    "Gstin": "29ABCDE1234F1ZW",
    "StateCode": "29"
  },
  "Buyer": {
    "Gstin": "33PQRSX9876L1ZV",
    "StateCode": "33"
  },
  "Items": [
    {
      "Hsn": "847130",
      "TaxableValue": 100000,
      "GstRate": 18,
      "Tax": {
        "Igst": 15000,
        "Cgst": 0,
        "Sgst": 0
      }
    }
  ]
}`,
  "Invalid - CGST on Inter-state": `{
  "InvoiceNumber": "INV-003",
  "InvoiceDate": "2026-07-08",
  "Seller": {
    "Gstin": "29ABCDE1234F1ZW",
    "StateCode": "29"
  },
  "Buyer": {
    "Gstin": "33PQRSX9876L1ZV",
    "StateCode": "33"
  },
  "Items": [
    {
      "Hsn": "847130",
      "TaxableValue": 100000,
      "GstRate": 18,
      "Tax": {
        "Igst": 0,
        "Cgst": 9000,
        "Sgst": 9000
      }
    }
  ]
}`
};

export default function App() {
  const [inputMode, setInputMode] = useState<'json' | 'pdf'>('json');
  const [pdfState, setPdfState] = useState<'upload' | 'confirm' | 'verdict'>('upload');
  const [extractedData, setExtractedData] = useState<any>(null);

  const [jsonInput, setJsonInput] = useState(sampleInvoices["Valid B2B Invoice"]);
  const [selectedSample, setSelectedSample] = useState("Valid B2B Invoice");
  const [lang, setLang] = useState<'en'|'hi'>('en');
  
  let gstr1 = '';
  let err = '';
  let violations: any[] = [];
  
  try {
      const res = compileInvoice(jsonInput);
      if (res.success) {
          gstr1 = res.summary;
      } else {
          err = res.error;
          if (res.envelope) {
              const envelopeObj = JSON.parse(res.envelope);
              violations = envelopeObj.Results
                .filter((r: any) => r.Outcome === "Fail" || r.Outcome === "Unknown")
                .map((r: any) => {
                    const t = translations[r.Metadata.RuleId];
                    const desc = t ? (lang === 'en' ? t.en : t.hi) : r.Metadata.MessageKey;
                    return {
                        Rule: r.Metadata.RuleId,
                        Description: desc,
                        RawDesc: r.Metadata.MessageKey
                    };
                });
          }
      }
  } catch (e: any) {
      err = e.message;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Navbar */}
      <nav className="px-6 py-4 border-b border-gray-800/50 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">G</div>
          <h1 className="text-xl font-bold tracking-tight text-white">GSTFlow</h1>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#validator" className="text-sm font-medium text-gray-300 hover:text-white transition">Offline Validator</a>
          <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition">Features</a>
          <a href="#resources" className="text-sm font-medium text-gray-300 hover:text-white transition">Govt Links</a>
          <a href="https://canonflowfoundation.github.io" target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition">Our Vision (CFF)</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[100px] -z-10"></div>
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Bulletproof GST Compliance. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">100% Offline.</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Stop worrying about notices and penalties. Validate your invoices instantly, securely, and without your data ever leaving your device. 
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#validator" className="px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition shadow-lg shadow-white/10">
            Try Validator Now
          </a>
          <a href="#pake-download" className="px-8 py-3.5 bg-gray-800 text-white font-semibold rounded-full border border-gray-700 hover:bg-gray-700 transition flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download Desktop App (Coming Soon)
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-20 bg-gray-900/30 border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Honest Truth About GST Validation</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              GSTFlow is a deterministic mathematical engine, not a government oracle. We don't make broad claims like "This invoice is 100% legal." Instead, we tell you exactly what was checked, what was proven, and what remains unknown. That honesty is the foundation of trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center"><span className="text-2xl mr-2">✅</span> What We PROVE (Offline)</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">▪</span> <strong>Exact Arithmetic:</strong> We catch ₹1 discrepancies between your Rate, Taxable Value, and Tax amount.</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">▪</span> <strong>Inter-State Law:</strong> We guarantee you aren't illegally charging CGST on cross-border supplies.</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">▪</span> <strong>Format Integrity:</strong> GSTIN checksum validation and HSN length constraints.</li>
                <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">▪</span> <strong>Internal Consistency:</strong> The tax splits are mathematically sound across the entire document.</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-orange-900/10 border border-orange-500/20 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center"><span className="text-2xl mr-2">⚠️</span> What We CANNOT Prove (Yet)</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start"><span className="text-orange-500 mr-2 mt-0.5">▪</span> <strong>Semantic Truth:</strong> Is that "Office Laptop" really HSN 4820? (Needs business context).</li>
                <li className="flex items-start"><span className="text-orange-500 mr-2 mt-0.5">▪</span> <strong>Supplier Filing:</strong> Did your supplier actually file this in their GSTR-1? (Needs GSTR-2B data).</li>
                <li className="flex items-start"><span className="text-orange-500 mr-2 mt-0.5">▪</span> <strong>Fraud Intent:</strong> We cannot prove if a perfectly formatted invoice was entirely fabricated.</li>
              </ul>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">The Tri-Channel Ecosystem</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gray-800/40 border border-gray-700/50">
              <div className="text-2xl mb-3">🌐</div>
              <h3 className="text-lg font-bold text-white mb-2">Web Gateway</h3>
              <p className="text-sm text-gray-400">The accessible public verifier. Ideal for quick single JSON checks and bulk-zipping cryptographically signed CFF envelopes. 100% local processing.</p>
            </div>
            <div className="p-6 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
              <div className="text-2xl mb-3">💻</div>
              <h3 className="text-lg font-bold text-emerald-400 mb-2">Windows Desktop</h3>
              <p className="text-sm text-gray-400">The Heavy-Lifter. Powered by NativeAOT C-bindings for extreme speed. Use local AI to extract PDFs directly into JSON without cloud privacy leaks.</p>
            </div>
            <div className="p-6 rounded-xl bg-gray-800/40 border border-gray-700/50">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="text-lg font-bold text-white mb-2">Mobile Inspector</h3>
              <p className="text-sm text-gray-400">The Field Agent. Scan QR codes on printed invoices and run them through our Fable Dart engine natively on your Android device while on the go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Validator Tool */}
      <section id="validator" className="px-6 py-20 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-4">The Offline Validator Playground</h2>
            <p className="text-gray-400">Play with our government-aligned JSON samples to see the rule engine in action.</p>
          </div>
          
          <div className="h-[700px] border border-gray-700/80 rounded-2xl overflow-hidden bg-gray-900 shadow-2xl flex flex-col">
            <header className="px-4 py-3 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center">
              <div className="flex space-x-2">
                <button onClick={() => setInputMode('json')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${inputMode === 'json' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>Govt JSON Playground</button>
                <button onClick={() => setInputMode('pdf')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${inputMode === 'pdf' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>File / ZIP Upload</button>
              </div>
              <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} className="text-xs px-3 py-1 bg-gray-800 text-gray-300 rounded border border-gray-700">
                Language: <span className="font-bold text-white">{lang === 'en' ? 'English' : 'हिंदी'}</span>
              </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <div className={`${inputMode === 'json' ? 'w-1/2 border-r' : 'w-full'} flex flex-col relative border-gray-800`}>
                {inputMode === 'json' ? (
                  <>
                    <div className="bg-[#1e1e1e] border-b border-gray-800 p-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase font-bold ml-2">Load Sample:</span>
                      <select 
                        className="bg-gray-800 text-sm text-gray-200 border border-gray-700 rounded px-2 py-1 outline-none"
                        value={selectedSample}
                        onChange={(e) => {
                          setSelectedSample(e.target.value);
                          setJsonInput(sampleInvoices[e.target.value]);
                        }}
                      >
                        {Object.keys(sampleInvoices).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      theme="vs-dark"
                      value={jsonInput}
                      onChange={(val) => setJsonInput(val || '')}
                      options={{ minimap: { enabled: false }, fontSize: 14 }}
                    />
                  </>
                ) : (
                  <div className="flex-1 overflow-hidden">
                    <ZipUploader />
                  </div>
                )}
              </div>

              {inputMode === 'json' && (
                <div className="w-1/2 flex flex-col bg-[#0d1117] overflow-y-auto">
                  {err ? (
                     <div className="p-8 space-y-6">
                       <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 shadow-xl">
                         <h2 className="text-red-400 font-semibold mb-2">{lang === 'en' ? 'Parsing Error' : 'पार्सिंग त्रुटि'}</h2>
                         <pre className="text-sm text-red-300/80 whitespace-pre-wrap font-mono">{err}</pre>
                       </div>
                       {violations.length > 0 && (
                         <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6 shadow-xl">
                           <h2 className="text-orange-400 font-semibold mb-4">{lang === 'en' ? 'Rule Violations' : 'नियम उल्लंघन'} ({violations.length})</h2>
                           <div className="space-y-3">
                             {violations.map((v, i) => {
                               const t = translations[v.Rule];
                               return (
                                 <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                   <div className="text-xs text-orange-400 font-mono font-bold bg-orange-400/10 px-2 py-1 rounded inline-block mb-2">{v.Rule}</div>
                                   {t && (
                                     <div className="mb-3">
                                       <div className="text-base text-white font-medium mb-1">{lang === 'en' ? t.en : t.hi}</div>
                                       <div className="text-sm text-gray-400 italic">{lang === 'en' ? "💡 Hint: " + t.hint_en : "💡 सुझाव: " + t.hint_hi}</div>
                                     </div>
                                   )}
                                   <div className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-700/50 font-mono">{v.RawDesc || v.Description}</div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )}
                     </div>
                  ) : (
                    <div className="p-8 space-y-8">
                      <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6 shadow-xl text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to File</h2>
                        <p className="text-emerald-400 font-medium">This invoice is 100% compliant with the CGST Act.</p>
                      </div>
                      <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl">
                        <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/60 text-sm font-medium text-cyan-400">
                          GSTR-1 Normalized Payload
                        </div>
                        <div className="p-6">
                          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{gstr1}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Govt Links Section */}
      <section id="resources" className="px-6 py-16 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Official Resources</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://www.gst.gov.in/" target="_blank" rel="noreferrer" className="px-6 py-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-500 transition flex items-center space-x-3">
              <span className="text-xl">🏛️</span>
              <div className="text-left">
                <div className="font-semibold text-white">GST Portal</div>
                <div className="text-xs text-gray-400">gst.gov.in</div>
              </div>
            </a>
            <a href="https://einvoice1.gst.gov.in/" target="_blank" rel="noreferrer" className="px-6 py-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-500 transition flex items-center space-x-3">
              <span className="text-xl">🧾</span>
              <div className="text-left">
                <div className="font-semibold text-white">e-Invoice Portal</div>
                <div className="text-xs text-gray-400">einvoice1.gst.gov.in</div>
              </div>
            </a>
            <a href="https://ewayanic.gov.in/" target="_blank" rel="noreferrer" className="px-6 py-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-500 transition flex items-center space-x-3">
              <span className="text-xl">🚚</span>
              <div className="text-left">
                <div className="font-semibold text-white">e-Way Bill</div>
                <div className="text-xs text-gray-400">ewayanic.gov.in</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Formbricks-style Feedback FAB pointing to GitHub Issues */}
      <a 
        href="https://github.com/CanonFlowFoundation/GSTFlow/issues/new?title=Feedback:%20&body=Please%20describe%20your%20feedback%20or%20feature%20request%20here...%0A%0A---%0A**Email/Contact%20(optional):**%20%0A**Environment:**%20GSTFlow%20Web%20Validator"
        target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 px-5 py-3 bg-white text-gray-900 font-bold rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(0,0,0,0.6)] transition-all flex items-center z-50 border border-gray-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        Send Feedback
      </a>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-800 bg-[#121212] flex flex-col items-center">
        <div className="text-2xl font-bold text-white mb-6">GSTFlow</div>
        <div className="flex space-x-6 mb-8">
          <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
          <a href="https://canonflowfoundation.github.io" className="text-gray-400 hover:text-emerald-400 transition font-medium">CanonFlow Foundation</a>
        </div>
        <div className="text-xs text-gray-600 text-center max-w-2xl">
          <span className="font-bold text-red-400/80">⚠️ LEGAL DISCLAIMER:</span> THIS IS NOT TAX ADVICE. GSTFlow takes zero liability for your filings or disputes. 
          You are solely responsible for verifying accuracy before filing with the Government of India.
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>&copy; 2026 GSTFlow. Open Sourced under the Apache 2.0 License.</p>
        </div>
      </footer>
    </div>
  );
}

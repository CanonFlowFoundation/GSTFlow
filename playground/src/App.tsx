import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import PdfUploader from './PdfUploader';
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
    hint_en: "Provide a valid invoice number.",
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

const defaultInvoice = `{
  "InvoiceNumber": "INV-001",
  "InvoiceDate": "2026-07-08",
  "Seller": {
    "Gstin": "29ABCDE1234F1Z5",
    "StateCode": "29"
  },
  "Buyer": {
    "Gstin": "33PQRSX9876L1Z2",
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
}`;

export default function App() {
  const [inputMode, setInputMode] = useState<'json' | 'pdf'>('pdf');
  const [pdfState, setPdfState] = useState<'upload' | 'confirm' | 'verdict'>('upload');
  const [extractedData, setExtractedData] = useState<any>(null);

  const [jsonInput, setJsonInput] = useState(defaultInvoice);
  const [lang, setLang] = useState<'en'|'hi'>('en');
  
  let gstr1 = '';
  let proof = '';
  let err = '';
  
  let violations: any[] = [];
  let envelopeObj: any = null;
  
  try {
      const res = compileInvoice(jsonInput);
      if (res.success) {
          gstr1 = res.summary;
          proof = res.proof;
          if (res.envelope) envelopeObj = JSON.parse(res.envelope);
      } else {
          err = res.error;
          if (res.envelope) {
              envelopeObj = JSON.parse(res.envelope);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-gray-900">G</div>
          <h1 className="text-xl font-semibold tracking-tight text-white">GSTFlow Semantic Compiler</h1>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md border border-gray-700 transition-colors flex items-center space-x-2"
          >
            <span>Language: </span>
            <span className="font-bold text-white">{lang === 'en' ? 'English' : 'हिंदी'}</span>
          </button>
          <div className="text-sm font-medium px-3 py-1 bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <svg className="w-4 h-4 mr-1.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
            Working Offline
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left/Main Panel: Input Area */}
        <div className={`${inputMode === 'json' ? 'w-1/2 border-r' : 'w-full'} flex flex-col relative group border-gray-800 bg-gray-900`}>
          
          {/* Mode Switcher */}
          <div className="absolute top-4 left-4 z-20 bg-gray-800/80 rounded-lg p-1 flex items-center shadow-lg border border-gray-700">
            <button 
              onClick={() => setInputMode('json')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${inputMode === 'json' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Raw JSON
            </button>
            <button 
              onClick={() => setInputMode('pdf')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${inputMode === 'pdf' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
              PDF Intake
            </button>
          </div>

          {inputMode === 'json' ? (
            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={jsonInput}
              onChange={(val) => setJsonInput(val || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 64 }, scrollBeyondLastLine: false }}
            />
          ) : (
            pdfState === 'upload' ? (
              <PdfUploader onExtract={(data) => {
                setExtractedData(data);
                setPdfState('confirm');
              }} />
            ) : pdfState === 'confirm' ? (
              <ConfirmationScreen 
                extractedData={extractedData} 
                onConfirm={(validJson) => {
                  setJsonInput(validJson);
                  setPdfState('verdict');
                }} 
                onCancel={() => setPdfState('upload')}
              />
            ) : (
              <VerdictScreen 
                isSuccess={!err && violations.length === 0}
                violations={violations}
                invoiceData={jsonInput}
                onReset={() => {
                  setJsonInput(defaultInvoice);
                  setPdfState('upload');
                }}
              />
            )
          )}
        </div>

        {/* Right Panel: Output (Only in JSON Mode) */}
        {inputMode === 'json' && (
          <div className="w-1/2 flex flex-col bg-[#0d1117] overflow-y-auto">
            {err ? (
               <div className="p-8 space-y-6">
                 <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 shadow-xl">
                   <h2 className="text-red-400 font-semibold mb-2 flex items-center">
                     <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Semantic Parsing Error
                   </h2>
                   <pre className="text-sm text-red-300/80 whitespace-pre-wrap font-mono">{err}</pre>
                 </div>
                 {violations.length > 0 && (
                   <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-6 shadow-xl">
                     <h2 className="text-orange-400 font-semibold mb-4 flex items-center">
                       <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                       Rule Violations ({violations.length})
                     </h2>
                     <div className="space-y-3">
                       {violations.map((v, i) => {
                         const t = translations[v.Rule];
                         return (
                           <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                             <div className="flex justify-between items-start mb-2">
                               <div className="text-xs text-orange-400 font-mono font-bold bg-orange-400/10 px-2 py-1 rounded">{v.Rule}</div>
                             </div>
                             
                             {t ? (
                               <div className="mb-3">
                                 <div className="text-base text-white font-medium mb-1">
                                   {lang === 'en' ? t.en : t.hi}
                                 </div>
                                 <div className="text-sm text-gray-400 italic">
                                   {lang === 'en' ? "💡 Hint: " + t.hint_en : "💡 सुझाव: " + t.hint_hi}
                                 </div>
                               </div>
                             ) : null}
  
                             <div className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded border border-gray-700/50 font-mono">
                               {v.RawDesc || v.Description}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 )}
               </div>
            ) : (
              <div className="p-8 space-y-8">
                {/* Proof Report */}
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur-sm transition-all hover:border-gray-600/50">
                  <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/60 text-sm font-medium text-emerald-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Cryptographic Proof Report (PROOF.md)
                  </div>
                  <div className="p-6">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{proof}</pre>
                  </div>
                </div>
  
                {/* GSTR-1 Payload */}
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur-sm transition-all hover:border-gray-600/50">
                  <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/60 text-sm font-medium text-cyan-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
      </main>

      {/* Trust Triad & Legal Footer */}
      <footer className="px-6 py-4 border-t border-gray-800 bg-gray-900 flex flex-col items-center flex-shrink-0 z-20">
        <div className="flex space-x-8 mb-4 text-sm font-medium">
          <span className="text-gray-300 flex items-center">
             <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             Free forever
          </span>
          <span className="text-gray-300 flex items-center">
             <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             Works offline
          </span>
          <span className="text-gray-300 flex items-center">
             <svg className="w-4 h-4 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             Your data never leaves this device
          </span>
        </div>
        <div className="text-xs text-gray-500 mb-2 font-mono bg-black/30 px-3 py-1 rounded border border-gray-800">
          Network log: <span className="text-emerald-500 font-bold">0 bytes</span> left this device
        </div>
        <div className="text-xs text-gray-600 text-center max-w-2xl">
          <span className="font-bold text-red-400/80">⚠️ LEGAL DISCLAIMER:</span> THIS IS NOT TAX ADVICE. GSTFlow takes zero liability for your GSTR-1 filings, penalties, or disputes. 
          You are solely responsible for verifying accuracy before filing with the Government of India portal.
        </div>
      </footer>
    </div>
  );
}

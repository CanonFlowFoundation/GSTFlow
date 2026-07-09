import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
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
  const [jsonInput, setJsonInput] = useState(defaultInvoice);
  const [lang, setLang] = useState<'en'|'hi'>('en');
  
  let gstr1 = '';
  let proof = '';
  let err = '';
  
  let violations: any[] = [];
  
  try {
      const res = compileInvoice(jsonInput);
      if (res.success) {
          gstr1 = res.gstr1;
          proof = res.proof;
      } else {
          err = res.error;
          violations = res.violations || [];
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
          <div className="text-sm text-gray-400">Powered by Fable Wasm Engine</div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Raw Input */}
        <div className="w-1/2 border-r border-gray-800 flex flex-col relative group">
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gray-800/80 rounded-full text-xs font-medium text-gray-300 backdrop-blur-sm border border-gray-700 pointer-events-none">
            Raw ERP Invoice (JSON)
          </div>
          <Editor
            height="100%"
            defaultLanguage="json"
            theme="vs-dark"
            value={jsonInput}
            onChange={(val) => setJsonInput(val || '')}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 48 }, scrollBeyondLastLine: false }}
          />
        </div>

        {/* Right Panel: Output */}
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
                             {v.Description}
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
      </main>
    </div>
  );
}

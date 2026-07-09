import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
// @ts-ignore
import { compileInvoice } from './fable/Library.ts';

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
        <div className="text-sm text-gray-400">Powered by Fable Wasm Engine</div>
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
                     {violations.map((v, i) => (
                       <div key={i} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                         <div className="text-xs text-orange-300 font-mono mb-1">{v.Rule}</div>
                         <div className="text-sm text-gray-300">{v.Description}</div>
                       </div>
                     ))}
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

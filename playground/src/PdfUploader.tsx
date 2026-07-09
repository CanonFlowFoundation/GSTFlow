import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export default function PdfUploader({ onExtract }: { onExtract: (extractedData: any) => void }) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setStatus('Loading PDF via pdf.js...');
    
    // TODO: Phase P1 - Real pdf.js + Tesseract.js integration goes here.
    // For scaffolding, we simulate the extraction pipeline delay.
    setTimeout(() => {
      setStatus('Running OCR heuristics (Tesseract.js)...');
      setTimeout(() => {
        setStatus('Mapping extracted text to GST fields...');
        setTimeout(() => {
          setIsExtracting(false);
          setStatus('');
          // Return a messy/guessed data structure for the confirmation screen
          onExtract({
            Seller: { Gstin: "29ABCDE1234F1Z5", confidence: 0.95 },
            Buyer: { Gstin: "33PQRSX9876L1Z2", confidence: 0.8 },
            Items: [
              { Hsn: "847130", TaxableValue: 100000, GstRate: 18, Tax: { Igst: 18000, Cgst: 0, Sgst: 0 }, confidence: 0.7 }
            ]
          });
        }, 800);
      }, 1000);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-900 border-r border-gray-800">
      <div className="w-full max-w-md bg-gray-800/40 rounded-2xl border border-gray-700 p-8 shadow-2xl text-center backdrop-blur-md relative overflow-hidden group">
        {isExtracting ? (
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin"></div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Extracting Offline</h3>
              <p className="text-sm text-gray-400 font-mono">{status}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto bg-gray-900 rounded-full flex items-center justify-center border border-gray-700 mb-6 group-hover:border-emerald-500/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Upload Invoice PDF</h2>
            <p className="text-gray-400 text-sm mb-8">
              100% offline extraction. Your data never leaves the browser.
            </p>
            <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-500/20 transition-all inline-block">
              Select PDF Document
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Check, Edit2, AlertCircle } from 'lucide-react';

export default function ConfirmationScreen({ extractedData, onConfirm, onCancel }: { extractedData: any, onConfirm: (json: string) => void, onCancel: () => void }) {
  const [data, setData] = useState(extractedData);

  const confidenceColor = (conf: number) => {
    if (conf >= 0.9) return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
    if (conf >= 0.7) return "border-orange-500/50 bg-orange-500/10 text-orange-400";
    return "border-red-500/50 bg-red-500/10 text-red-400";
  };

  const handleConfirm = () => {
    // Strip confidence scores and generate valid JSON for the compiler
    const cleanJson = JSON.stringify({
      InvoiceNumber: "EXTRACTED-001",
      InvoiceDate: "2026-07-09",
      Seller: { Gstin: data.Seller.Gstin, StateCode: data.Seller.Gstin.substring(0, 2) },
      Buyer: { Gstin: data.Buyer.Gstin, StateCode: data.Buyer.Gstin.substring(0, 2) },
      Items: data.Items.map((i: any) => ({
        Hsn: i.Hsn, TaxableValue: i.TaxableValue, GstRate: i.GstRate, Tax: i.Tax
      }))
    }, null, 2);
    onConfirm(cleanJson);
  };

  return (
    <div className="h-full flex flex-col p-8 bg-gray-900 border-r border-gray-800 overflow-y-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <Check className="w-6 h-6 mr-2 text-emerald-400" />
            Confirm Extracted Fields
          </h2>
          <p className="text-sm text-gray-400">Review the AI guesses before sending to the strict validation engine.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-white px-3 py-1">Cancel</button>
      </div>

      <div className="space-y-6 flex-1">
        {/* Seller Field */}
        <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-300">Seller GSTIN</label>
            <div className={`text-xs px-2 py-1 rounded-full border ${confidenceColor(data.Seller.confidence)}`}>
              {Math.round(data.Seller.confidence * 100)}% Confidence
            </div>
          </div>
          <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 focus-within:border-emerald-500 overflow-hidden">
            <input 
              type="text" 
              value={data.Seller.Gstin}
              onChange={(e) => setData({ ...data, Seller: { ...data.Seller, Gstin: e.target.value }})}
              className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none font-mono"
            />
            <Edit2 className="w-4 h-4 text-gray-500 mr-4" />
          </div>
        </div>

        {/* Buyer Field */}
        <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-gray-300">Buyer GSTIN</label>
            <div className={`text-xs px-2 py-1 rounded-full border ${confidenceColor(data.Buyer.confidence)}`}>
              {Math.round(data.Buyer.confidence * 100)}% Confidence
            </div>
          </div>
          <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 focus-within:border-emerald-500 overflow-hidden">
            <input 
              type="text" 
              value={data.Buyer.Gstin}
              onChange={(e) => setData({ ...data, Buyer: { ...data.Buyer, Gstin: e.target.value }})}
              className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none font-mono"
            />
            <Edit2 className="w-4 h-4 text-gray-500 mr-4" />
          </div>
        </div>

        {/* Notice */}
        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-cyan-200/80">
            Once confirmed, this data is piped exactly as-is into the F# semantic compiler. If the compiler rejects it, you will have to fix it manually.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={handleConfirm}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg transition-all"
        >
          Confirm & Run Compiler
        </button>
      </div>
    </div>
  );
}

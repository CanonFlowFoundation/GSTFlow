import React, { useState } from 'react';
import JSZip from 'jszip';
// @ts-ignore
import { compileInvoice } from './fable/Library.ts';

export default function ZipUploader() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const generateHash = async (content: string) => {
    const msgBuffer = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateCFF = async (content: string) => {
    // Generate a deterministic payload representation
    const payloadStr = JSON.stringify(JSON.parse(content));
    const hashHex = await generateHash(payloadStr);

    return JSON.stringify({
      cff_version: "1.0",
      verified_at: new Date().toISOString(),
      payload_digest: `sha256:${hashHex}`,
      status: "VERIFIED",
      payload: JSON.parse(content)
    }, null, 2);
  };

  const verifyCFF = async (cffContent: string) => {
    try {
      const parsed = JSON.parse(cffContent);
      if (!parsed.cff_version || !parsed.payload_digest || !parsed.payload) return { valid: false, error: "Invalid CFF structure" };
      
      const payloadStr = JSON.stringify(parsed.payload);
      const expectedHash = `sha256:${await generateHash(payloadStr)}`;
      
      if (expectedHash !== parsed.payload_digest) {
        return { valid: false, error: "Digest mismatch! Payload was tampered with." };
      }
      return { valid: true, payloadStr };
    } catch (e: any) {
      return { valid: false, error: "Failed to parse CFF" };
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setLogs([`Processing ${file.name}...`]);

    try {
      setDownloadUrl(null);
      const outZip = new JSZip();
      let cffCount = 0;
      let passCount = 0;
      let failCount = 0;
      let reportCsv = "FileName,Status,Violations\n";

      const processSingleContent = async (fileName: string, rawContent: string) => {
        let contentToVerify = rawContent;
        if (fileName.endsWith('.cff.json')) {
          const cffRes = await verifyCFF(rawContent);
          if (!cffRes.valid) {
            failCount++;
            reportCsv += `"${fileName}","FAILED","${cffRes.error}"\n`;
            setLogs(prev => [...prev.slice(-20), `❌ [FAIL] ${fileName}: ${cffRes.error}`]);
            return;
          }
          contentToVerify = cffRes.payloadStr!;
          setLogs(prev => [...prev.slice(-20), `🔐 [CFF VERIFIED] ${fileName} digest is intact.`]);
        }

        const res = compileInvoice(contentToVerify);
        if (res.success) {
          passCount++;
          reportCsv += `"${fileName}","PASSED","None"\n`;
          setLogs(prev => [...prev.slice(-20), `✅ [PASS] ${fileName} -> Generating CFF...`]);
          const cffContent = await generateCFF(contentToVerify);
          outZip.file(fileName.replace('.json', '.cff.json'), cffContent);
          cffCount++;
        } else {
          failCount++;
          const errorEscaped = res.error ? res.error.replace(/"/g, '""') : "Unknown Error";
          reportCsv += `"${fileName}","FAILED","${errorEscaped}"\n`;
          setLogs(prev => [...prev.slice(-20), `❌ [FAIL] ${fileName}: ${res.error}`]);
        }
      };

      if (file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        const files = Object.keys(zip.files).filter(f => f.endsWith('.json') || f.endsWith('.cff.json'));
        setLogs(prev => [...prev, `Found ${files.length} JSON/CFF files in ZIP. Processing in batches...`]);
        
        const BATCH_SIZE = 25;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          for (const fileName of batch) {
            const content = await zip.files[fileName].async('string');
            await processSingleContent(fileName, content);
          }
          // Yield to UI thread to keep progress bar and UI smooth
          await new Promise(r => setTimeout(r, 10));
        }
        
        setLogs(prev => [...prev, `Done. Passed: ${passCount}, Failed: ${failCount}`]);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        await processSingleContent(file.name, text);
      } else {
        setLogs(prev => [...prev, `❌ Unsupported file type. Please upload a .json, .cff.json, or .zip file.`]);
      }

      if (cffCount > 0 || failCount > 0) {
        outZip.file("Verification_Report.csv", reportCsv);
        setLogs(prev => [...prev, `📦 Packaging ${cffCount} verified CFF files and Verification_Report.csv into a new ZIP...`]);
        const blob = await outZip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setLogs(prev => [...prev, `🎉 Ready for download!`]);
      }

    } catch (e: any) {
      setLogs(prev => [...prev, `❌ Error processing file: ${e.message}`]);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col w-full h-full p-8 text-gray-200">
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-2xl bg-gray-900/50 p-10 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all cursor-pointer relative"
           onDragOver={(e) => e.preventDefault()}
           onDrop={(e) => {
             e.preventDefault();
             if (e.dataTransfer.files && e.dataTransfer.files[0]) {
               processFile(e.dataTransfer.files[0]);
             }
           }}
      >
        <input 
          type="file" 
          accept=".json,.zip" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Drop JSON or ZIP File Here</h3>
        <p className="text-gray-500 max-w-md text-center">
          Upload raw JSONs, ZIP archives, or existing `.cff.json` files. Valid invoices will be mathematically verified, converted to CFF format with a payload digest, and packaged into a secure ZIP along with a CSV Verification Report.
        </p>
      </div>

      {downloadUrl && (
        <div className="mt-4 flex justify-center">
          <a href={downloadUrl} download="verified_cff_invoices.zip" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold rounded-full shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 animate-bounce">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Verified CFF Archive</span>
          </a>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6 h-48 bg-black rounded-xl p-4 font-mono text-sm overflow-y-auto border border-gray-800 shadow-inner">
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.includes('✅') ? 'text-emerald-400' : log.includes('❌') ? 'text-red-400' : 'text-gray-400'}`}>
              {log}
            </div>
          ))}
          {isProcessing && <div className="text-gray-500 animate-pulse mt-2">Processing...</div>}
        </div>
      )}
    </div>
  );
}

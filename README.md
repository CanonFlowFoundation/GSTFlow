# GSTFlow

**The Semantic GST Validation Engine.**  
GSTFlow deterministically evaluates the GST rules it currently supports and reports unsupported or uncertain areas explicitly.

## ⚠️ LEGAL DISCLAIMER

**THIS IS NOT TAX ADVICE.**  
GSTFlow (and CanonFlow) takes **zero liability** for your GSTR-1 filings, financial penalties, or tax disputes. This tool is an open-source structural validation engine provided "AS IS". The user assumes all responsibility for verifying the accuracy of the tax amounts, Place of Supply rules, and HSN classifications before filing with the Government of India portal. By using this software, you agree that you are solely responsible for your own compliance.

---

## 🏛️ The One-Engine Principle (D0)

GSTFlow is built in strict **F#**. The semantic rules are written once. 
1. It compiles to a **Native AOT CLI** for CI/CD and backend infrastructure.
2. It transpiles (via Fable) to pure **WebAssembly/JavaScript** to run 100% offline in the browser.

Our CI pipeline verifies that both environments yield byte-identical validation reports. **The laws do not drift.** ([Demonstration of Agreement Test Catching Drift](https://github.com/ArunNotFound/GSTFlow/actions/runs/29142690319))

## 🚀 Modes of Operation

### 1. The Native CLI (Infrastructure)
Run validations natively in your terminal.
```bash
# Generate a Canonical Validation Report
gstflow --emit-envelope invoice.json
```

### 2. The Wasm Playground (Browser)
A fully offline React application that runs the strict F# core entirely in your browser. 
- **PDF Intake Engine:** Drop a raw PDF invoice. We use `pdf.js` to extract text locally and map heuristics, generating a confidence-scored confirmation screen.
- **Vernacular Verdicts:** If an invoice fails the law, the raw technical jargon (e.g. `IGST_CGST_LAW`) is mapped to plain-language, actionable hints in both **English and Hindi** for MSME owners.

## 🧪 Capability Matrix

To provide clarity for accountants and auditors, here is the exact execution boundary of the GSTFlow engine:

### ✅ Fully Supported (Mathematically Enforced)
* **B2B & B2C Flow:** Normal Tax Invoices, Interstate/Intrastate deduction, B2C Small/Large, Place of Supply checks.
* **Tax Mechanics:** IGST vs CGST+SGST splitting, Compensation Cess, Zero Tax, Mixed Tax Rates, Section 170 Rounding limits.
* **Item Validation:** Reverse Charge (RCM) applicability, Nil-rated/Exempt items, Taxable value limits (no negatives).
* **Sanity Checks:** GSTIN Mod-36 checksum, HSN/SAC format, State Code vocabularies, Missing mandatory fields.

### ⚠️ Limited (Format & Structural Only)
* **Credit / Debit Notes:** Validates `DOC_TYPE` and enforces `OriginalInvoiceNumber` presence, but does not adjudicate partial tax reduction math across documents.
* **E-Invoice (IRN):** Validates the 64-character hex format but does not verify cryptographic signatures.

### ❌ Unsupported (Safely Returns `Unknown` or `NotSupported`)
* **Special Supplies:** SEZ (with/without LUT), Exports, Imports, Deemed Exports, Job Work, Branch Transfers, High Sea Sales.
* **Complex Scenarios:** Composite/Mixed Supply, Foreign Currency, Non-GST Items, advanced Digital Goods POS logic.
* **Filing & Lifecycle:** Revisions, Cancellations, Government Portal Submission (Constitutional non-goal).

## 🏆 Recent Combat Results (July 2026)

All core perimeter systems and test defenses have been fully activated. The engine is stable and **all functionality works end-to-end**.

- **Playwright & Vitest Integration:** The WebAssembly Playground is protected by robust E2E browser tests and unit tests.
- **Mock PDF Pipeline:** The `sampleinvoices/mock_invoice_pdfs` directory has been successfully parsed, semantically renamed (via `pdf.js` heuristics), and grouped (e.g. `B2C/INV-GSTI.pdf`).
- **Heavy Machinery Pipeline:** The CLI `--validate-batch` successfully shreds massive batches of invoices, categorizing exceptions cleanly into `exceptions.csv` while utilizing Native AOT compilation.

*GSTFlow is structurally complete and ready to serve as the architecture blueprint for global EDI standards (EDIFlow).*
## 📝 Tech Debt & TODOs

* **Serialization Drift:** Replace manual JSON generation and `#if FABLE_COMPILER` branching in `CanonicalJson.fs` with **Thoth.Json**. This is required to guarantee the "One-Engine Law" between .NET Native AOT and Fable WASM without manual synchronization.

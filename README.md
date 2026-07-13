# GSTFlow 🇮🇳

The first mathematically verified, privacy-first, purely deterministic GST validation engine.
Built to catch internal structural and arithmetic errors in Indian GST invoices before they cost you penalties.

## The Tri-Channel Ecosystem (100% Complete)

GSTFlow is built on a unified, pure F# mathematical rules engine (`GSTFlow.Rules`). Rather than duplicating business logic across different apps, we compile our single F# source of truth into three distinct, native channels:

### 1. Web Gateway (The Accessible Anchor)
**Powered by: Fable JS + React + Playwright**
The public source of truth. Drop a single JSON invoice or a massive ZIP archive into the browser. It processes thousands of invoices asynchronously, generates Cryptographically-Signed CFF wrappers, and provides a CSV exceptions report.
- **Zero-Trust Validation:** 100% local processing in your browser. No server uploads.
- **SOTA Aesthetics:** Premium dark mode, glassmorphism, and intuitive drag-and-drop.
- **Automated Testing:** Backed by robust Playwright End-to-End headless browser testing in CI.

### 2. Windows Desktop Heavy-Lifter (The Processing Juggernaut)
**Powered by: NativeAOT + dart:ffi + Flutter**
Designed for accountants and massive bulk operations where maximum performance is non-negotiable. 
By bridging our pure F# engine directly to the Windows OS using C-bindings (`UnmanagedCallersOnly`), we achieve blisteringly fast native performance.
- **Local AI Extraction (Bootstrapped):** We bundle a lightweight `llama.cpp` server and a tiny `Phi-3` model directly inside the Windows installer. It silently spins up in the background to extract unstructured PDF invoices into rigid JSON—guaranteeing total offline privacy without making the accountant run command-line scripts.
- **Unrestricted Disk Access:** Directly ingest local ZIPs and output signed CFF packages seamlessly.

### 3. Mobile Inspector (The Field Agent)
**Powered by: Fable Dart + Flutter `mobile_scanner`**
For on-the-go verification. We used the revolutionary `Fable 5.6` compiler to transpile our entire F# rules engine natively into strongly-typed **Dart** classes.
- **Offline QR Scanner:** Accountants can open the app, scan a printed GST invoice QR code, and our Fable-Dart engine instantly evaluates it offline on the Android device.
- **Premium Flutter UI:** Clean, glassmorphic verification cards and target overlays that clearly flag illegal inter-state CGST charges or arithmetic miscalculations.

## CI/CD Pipeline & Automated Artifacts
The repository is fully automated via GitHub Actions:
- **Test-Driven:** On every push, GitHub automatically runs Flutter widget tests (`flutter test`) and Web E2E tests (`npx playwright test`).
- **Downloadable Artifacts:** The CI pipeline automatically builds the Android `.apk` and the Windows `.exe` (injecting the NativeAOT `.dll`) and uploads them as GitHub release artifacts for instant downloading and testing.

---

## The Honest Truth: What GSTFlow Checks

As outlined in our [CatchErrors Matrix](https://github.com/ArunNotFound/direction_ai/blob/main/Catcherrorsmatrix.md), GSTFlow provides **deterministic structural and arithmetic assurance.** 

**What we DO check:**
- Exact math: `Taxable Value * GST Rate == Tax Amount`. We catch ₹1 discrepancies.
- Inter-state vs Intra-state: If Place of Supply crosses borders, we verify IGST is charged, not CGST/SGST.
- Mod-36 checksums and formatting for GSTINs.
- HSN length validity.

**What we DO NOT check (Yet):**
- Whether the HSN code actually matches the physical product you sold.
- Whether the supplier actually filed their GSTR-1.
- Fraudulent intent or fabricated numbers. 

*GSTFlow's strongest promise is not: "We know this invoice is fully compliant."*
*Our strongest promise is: "We tell you exactly what was checked, what was proved, what evidence was used, and what remains unknown."*

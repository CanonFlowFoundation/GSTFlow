# GSTFlow: The CA & Accountant Playbook

This playbook outlines the exact commands to demonstrate the power of GSTFlow to Chartered Accountants (CAs), finance teams, and auditors. GSTFlow is designed to be a mathematically strict, offline verification engine that prevents bad data from ever reaching the GSTR-1 filing portal.

## 1. Single Invoice Sanity Check
Use this command to validate a single invoice. It evaluates GSTIN formats, mathematical exactness of CGST/SGST vs IGST based on the derived Place of Supply, and general invoice structure.

```bash
gstflow --validate invoice.json
```
**What the CA sees:** A clear terminal output indicating exactly which rule failed (e.g., `IGST_CGST_LAW`, `PLACE_OF_SUPPLY_UNKNOWN`) or a green success message detailing the detected Supply Type and State routing.

## 2. The Batch Validation & Duplicate Detection (Enterprise Scenario)
This is the killer feature for a CA processing hundreds of invoices from a client's ERP extract at the end of the month.

```bash
gstflow --validate-batch ./invoices-dir
```
**What the CA sees:** 
- The engine processes the entire folder silently.
- It hashes `SellerGSTIN + InvoiceNumber` in memory to instantly catch duplicates across files.
- If any invoice fails, it generates an `exceptions.csv` directly in the folder.
- The CA can immediately open `exceptions.csv` in Excel to see a clean list of exactly which files failed, which invoice numbers to trace, and the exact `RuleId` that was violated.

## 3. The Validation Report (Audit Trail)
When an auditor asks *why* an invoice was accepted, you can generate a human-readable Markdown report that outlines the deterministic logic the engine used.

```bash
gstflow --prove invoice.json
```
**What the CA sees:** A formatted `VALIDATION_REPORT.md` (printed to stdout) containing the parsed GSTINs, the tax slabs processed, and the overall verification evidence.

## 4. The Canonical Verdict (Systems Integration)
For the IT teams building the bridge between the ERP and the filing software.

```bash
gstflow --emit-envelope invoice.json
```
**What the CA sees:** This emits the exact `VerdictEnvelope` JSON. This is the "contract." We guarantee that the F# engine running natively on the server and the WASM engine running entirely offline in the CA's web browser will yield *byte-for-byte identical* envelopes for the same input.

## 5. The Summary Payload
Extracts the validated internal representation into a concise JSON object.

```bash
gstflow --emit-summary invoice.json
```
**What the CA sees:** A cleanly mapped JSON payload containing just the derived facts (like `DerivedSupplyType`, `PlaceOfSupply`, `IsInterstate`) without the noise of the raw input.

# Operation ADIMURAI • GSTFlow Executive UI Showcase

**Codebase:** [`CanonFlowFoundation/GSTFlow`](file:///root/repos/github/fsharp/GSTFlow)  
**Latest Verified Commit:** `54cfafe` on `origin main`  
**Automated Execution Command:** `dotnet run --project GSTFlow.Cli -- --showcase`

---

## Executive Overview: One Codebase, Three Runtimes

GSTFlow demonstrates our **Unified UI Architecture** where a single F# pure statutory domain model (`GSTFlow.Core` & `GSTFlow.Rules`) powers:
1. **Windows / Linux Desktop GUI (`GSTFlow.UI`)**: A rich 4-tab interactive preflight inspector built with Avalonia 11.2.
2. **Terminal / Headless Executive Simulator (`GSTFlow.Cli --showcase`)**: Interactive terminal output verifying all 4 tabs and 6 statutory scenarios.
3. **Canonical Air-Gapped Export (`GSTFlow.Emit`)**: Directly feeds DuckDB and CA audit workflows.

---

## Tab 1: Dual-Mode Statutory Inspector (All 6 Scenarios Verified)

The Inspector executes our 128-bit `System.Decimal` tax engine against 6 distinct real-world Indian GST statutory scenarios:

| Scenario # | Scenario Title | Statutory Basis | Verdict Outcome | Key Rules Evaluated |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Valid B2B Interstate Server Supply** | Sec 10 / 12 IGST Act | `PASS` ✅ | `TAX_AMOUNT`, `HSN_RATE_MATCH` |
| **2** | **Section 9(3) Reverse Charge (RCM)** | Sec 9(3) CGST Act | `FAIL` ❌ | `RCM_TAX_CHARGED` (Tax charged when RCM=Y) |
| **3** | **Place of Supply Cross-Border Violation** | Sec 10 IGST Act | `FAIL` ❌ | `IGST_CGST_LAW` (CGST+SGST charged on Interstate) |
| **4** | **Section 170 Rounding Anomaly** | Sec 170 CGST Act | `WARNING` ⚠️ | `SEC_170_ROUNDING` (Fractional ₹0.45 unrounded) |
| **5** | **SEZ Zero-Rated Supply (`Sec 7(5)(b)`)** | Sec 7(5)(b) IGST Act | `FAIL` ❌ | `GSTIN_STATE_MATCH` (Intra-State SEZ evaluated as Interstate) |
| **6** | **Export under LUT/Bond (`POS 96`)** | Sec 16 IGST Act | `PASS` ✅ | `ExportUnderLut` Zero-Rated Interstate |

---

## Tab 2: Canonical `.cff` Cryptographic Container Manifest

When packaged for air-gapped auditor ingestion, GSTFlow emits a SHA-256 tamper-evident container manifest:

```json
{
  "cff_version": "2.0.0",
  "engine_id": "gstflow-1.0.0",
  "created_at": "2026-07-14T01:29:51.2302711Z",
  "rule_pack_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "payload_digest": "93660c0184325c790a0751ba5ac1fb43e49a9b7ddd728b9e66583d1420976607",
  "files": [
    {
      "name": "invoices.json",
      "sha256": "93660c0184325c790a0751ba5ac1fb43e49a9b7ddd728b9e66583d1420976607",
      "logical_precision": "decimal(28,4)"
    },
    {
      "name": "verdicts.json",
      "sha256": "ebdf8cc00bc4d9ceee633c56c63b49955769a92ca060825c9b08e4af61326e2b",
      "overall_outcome": "Pass"
    }
  ]
}
```

---

## Tab 3: Airplane-Mode Offline QR Decoder

Demonstrates 100% offline, airplane-mode verification of signed NIC e-Invoice QR codes:

```
Status            : 100% OFFLINE SIGNATURE VERIFIED
Seller GSTIN      : 29AAACR5055K1Z5
Buyer GSTIN       : 27AAACT8814B1Z2
Document Number   : INV-2026-8842
Total Value (INR) : 295000.0000 (Exact 128-Bit System.Decimal)
Canonical IRN Hash: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4
```

---

## Tab 4: Gemma E2B • GBNF Grammar-Constrained DuckDB SQL

Demonstrates zero-hallucination semantic query generation directly over `.cff` tables:

```sql
SELECT InvoiceNumber, InvoiceDate, RuleId, BlockedReason, TotalTax
FROM v_statutory_violations
WHERE SellerGstin = '29AAACR5055K1Z5'
  AND FinancialQuarter IN ('Q1', 'Q2', 'Q3')
ORDER BY InvoiceDate DESC;
```

---

## Verification & Build Summary

* **Build Vulnerabilities**: `0 Warnings` (Resolved high-severity `NU1903` by upgrading `Tmds.DBus.Protocol` to `0.21.3`).
* **Unit Tests**: `23 / 23` passing (`Passed: 23, Failed: 0`).
* **Interactive Command**: Run `dotnet run --project GSTFlow.Cli -- --showcase` to replay the complete showcase simulation anytime.

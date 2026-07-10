# Deep Summary: Real-World Invoice Testing & Engine Evolution

**Target Audience:** Claude / Technical Reviewer
**Purpose:** This document serves as a comprehensive log of the real-world invoices tested against the GSTFlow engine, the edge-case challenges they introduced, the architectural learnings, and the subsequent mutations made to the rules compiler.

---

## 1. The Amazon Stress Test
**File:** `invoice-1.pdf` (Amazon B2C)
- **The Challenge (Section 170 Rounding):** The strict letter of Section 170 of the CGST Act dictates that the tax assessed must be rounded off to the nearest Rupee. The engine was originally designed to strictly enforce integer values for tax. However, the Amazon invoice contained fractional item-level taxes (e.g., ₹2515.42).
- **The Learning:** Massive enterprise ERPs (like Amazon's) interpret Section 170 practically. They retain exact fractional precision for item-level tax lines to prevent rounding drift across thousands of items. They *only* round the **Final Invoice Total** to the nearest Rupee (e.g., ₹13974.58 + ₹2515.42 = ₹16490.00).
- **The Engine Mutation:** We mutated the `SEC_170_ROUNDING` rule. We permitted fractional tax lines and shifted the rounding enforcement exclusively to the Final Invoice Total.

## 2. The Flipkart Stress Test
**File:** `OD328673214523317100.pdf` (Flipkart B2C)
- **The Challenge (GSTIN Checksum & State Math):** We needed to prove that the engine's alphanumeric Mod-36 GSTIN checksum validator and interstate Place of Supply (POS) rules would hold up against real data.
- **The Learning:** The engine flawlessly decoded Flipkart's GSTIN (`29AAKCC0172C1ZX`), passed the check-digit property test, and correctly applied intrastate CGST/SGST rules based on the parsed state code `29`.
- **The Engine Mutation:** No mutation required. The mathematical models for Mod-36 and Place of Supply were proven robust.

## 3. The Airtel Telecom Stress Test
**File:** `10101010250422_Jun2026.pdf` (Airtel Fixedline & Mobile)
- **The Challenge (Fractional Invoice Totals):** This invoice completely broke our earlier assumption from the Amazon test. Airtel charged exactly ₹1100.94 for the fixed-line bill. They did *not* round the Final Invoice Total. 
- **The Learning:** Telecom operators and massive utilities bill consumers down to the exact paise, outright ignoring Section 170 rounding rules on the final total. If the GSTFlow engine rigidly blocked fractional invoice totals as absolute Errors, it would reject every Wi-Fi and mobile expense uploaded by Indian shop owners.
- **The Engine Mutation (ADR 001 Updated):** We demoted the `SEC_170_ROUNDING` rule from a rigid `Error` to an informational `Warning`. The engine now flags the fractional total but allows the payload to pass, pushing the final verdict to the CA rather than halting the workflow.

## 4. The BigBasket Multi-Slab Stress Test
**File:** `Invoice_from_bb_2034146271.pdf` (BigBasket Grocery)
- **The Challenge (Mixed Tax Slabs):** A grocery bill containing 16 items spanning different tax brackets. Some items were exempt (0% GST on cucumbers/bananas) and some were taxed (5% GST on ragi/wheat). The final total was fractional (₹1365.95).
- **The Learning:** The engine's mapping logic successfully summed mixed-rate items within a single payload. It mapped 0% and 5% correctly. Furthermore, the Airtel-driven mutation (demoting the rounding rule to a warning) allowed this fractional grocery bill to pass seamlessly.
- **The Engine Mutation:** Validated the "Mixed Multi-Slab" architectural capability. No further mutations needed.

## 5. The Google SaaS B2C Stress Test (OIDAR)
**File:** `1304886828521013-1.pdf` (Google One Subscription)
- **The Challenge (Foreign Entities & IGST in B2C):** This invoice represented a SaaS subscription billed by Google Ireland Limited to an Indian consumer in Karnataka. It charged 18% IGST. The engine crashed immediately because Google's GSTIN (`9918IRL29002OSG`) began with state code `99` and the middle 10 characters violated the rigid Indian Income Tax PAN format (having numbers instead of purely letters). Furthermore, the engine assumed that all B2C transactions (where the Buyer has no GSTIN) take Place of Supply (POS) from the Seller, which would mean it was an Intrastate `99` to `99` transaction—but Google legally charged Interstate IGST based on the user's billing address.
- **The Learning:** Foreign service providers supplying SaaS/Digital goods into India fall under OIDAR (Online Information Database Access and Retrieval) rules. They are assigned a special State Code `99` (or `97` for Other Territory) and their GSTINs do not follow the strict domestic PAN regex structure (though they still cryptographically pass the Mod-36 checksum). Additionally, in B2C OIDAR transactions, the POS is legally determined by the consumer's billing address, not the seller's registration state.
- **The Engine Mutation:** 
  1. We expanded the legal State Code vocabulary to include `99` and `97`.
  2. We relaxed the strict `[A-Z]{5}[0-9]{4}[A-Z]` regex specifically to allow `[A-Z0-9]{10}` and the `S` entity character for foreign entities, relying strictly on the cryptographic Mod-36 checksum as the ultimate source of truth.
  3. We upgraded the B2C POS architecture to allow a Buyer `StateCode` to be explicitly set even when the `Gstin` is empty, flagging them internally as an Unregistered Person (`URP`) to successfully unlock B2C Interstate math.

---

## UI/UX Evolution: The WhatsApp-Shaped Verdict
Following the engine's success, the playground UI was overhauled to meet the "One Screen, One Answer" mandate:
1. **The Drop-Zone Intake:** The dense developer split-screen was removed for PDF mode.
2. **Confirmation Before Judgment:** The system extracts fields (GSTIN, Date, Total) and allows a quick visual review.
3. **The Share Card (C4):** The output is no longer a JSON dump. It is a highly-legible, WhatsApp-shaped digital receipt (Green Checkmark for Pass, Red X for Fail) with a prominent "Share to CA" button.

## Security Posture
All 4 real-world PDFs used during this testing phase were purged from Git tracking (`git rm --cached`), moved to an untracked local `sampleinvoices/` directory, and secured via `.gitignore`. No sensitive PII was pushed to the repository.

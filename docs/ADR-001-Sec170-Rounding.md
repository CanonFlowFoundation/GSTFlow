# ADR 001: Section 170 Rounding Interpretation

## Context
During the G4 Launch Gate (Validating a Real Invoice), we passed `invoice-1.pdf` (a real B2C Amazon retail invoice) through the native `GSTFlow.Cli` rules engine.

The invoice had the following math:
- Taxable Value: ₹13,974.58
- CGST (9%): ₹1,257.71
- SGST (9%): ₹1,257.71
- Total Tax: ₹2,515.42
- Final Total: ₹16,490.00

Our original implementation of the Section 170 CGST Act rule (`SEC_170_ROUNDING`) strictly enforced that the **tax amounts** themselves must be rounded off to the nearest Rupee. Because Amazon emitted fractional taxes (1257.71), the engine blocked the invoice.

## Learning
While the strict letter of Section 170 ("The tax assessed... shall be rounded off to the nearest rupee") implies that tax components should be integers, massive enterprise ERPs like Amazon interpret this practically: they retain fractional precision for item-level tax lines and only round the **Final Invoice Total** to the nearest Rupee (13974.58 + 2515.42 = 16490.00 perfectly). 

Furthermore, we initially observed that major utilities (like Airtel) do not round their Final Invoice Totals. However, our rationale for allowing this is not merely "Airtel does it, so it's legal," which relies on inference from authority rather than statute.

Legally, Section 170's rounding mandate is generally interpreted against amounts *payable under the Act* (i.e., tax returns, challans, and final payments to the government), not strictly every commercial invoice total between two private parties. 

If we strictly block fractional tax fields or fractional invoice totals at the invoice level, GSTFlow will yield false-positive rejections.

## Decision
We demoted the strict tax-field rounding check from an absolute Error (`IsError = true`) to a Warning (`IsError = false`). The `SEC_170_ROUNDING` rule now only fires as an informational warning if the **Final Invoice Total** (TaxableValue + Total Tax) is not an integer. We accept fractional tax fields and fractional invoice totals, pushing the verdict to the CA rather than halting the workflow. We explicitly flag this rule for CA review as it touches statutory interpretation.

## Status
Accepted and Implemented.

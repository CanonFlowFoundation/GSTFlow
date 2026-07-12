
import { int32 } from "../fable_modules/fable-library-ts.5.6.0/Int32.ts";
import { exists, length } from "../fable_modules/fable-library-ts.5.6.0/List.ts";
import { InvoiceItem, GSTCanonicalIR } from "../GSTFlow.Core/Library.ts";
import { fromParts, compare } from "../fable_modules/fable-library-ts.5.6.0/Decimal.ts";

export function emitSummaryJson(ir: GSTCanonicalIR): string {
    return `{
  "invoiceNumber": "${ir.Invoice.InvoiceNumber}",
  "type": "${((ir.DerivedSupplyType.tag as int32) === /* B2C */ 1) ? "B2C" : "B2B"}",
  "placeOfSupply": "${ir.PlaceOfSupply}",
  "taxClassification": "${ir.IsInterstate ? "IGST" : "CGST_SGST"}",
  "itemsCount": ${length(ir.Invoice.Items)}
}`;
}

export function emitValidationReport(ir: GSTCanonicalIR): string {
    const expectedTax: string = ir.IsInterstate ? "IGST" : "CGST+SGST";
    const hasIgst: boolean = exists<InvoiceItem>((i: InvoiceItem): boolean => (compare(i.Tax.Igst, fromParts(0, 0, 0, false, 0)) > 0), ir.Invoice.Items);
    const hasCgst: boolean = exists<InvoiceItem>((i_1: InvoiceItem): boolean => (compare(i_1.Tax.Cgst, fromParts(0, 0, 0, false, 0)) > 0), ir.Invoice.Items);
    const hasSgst: boolean = exists<InvoiceItem>((i_2: InvoiceItem): boolean => (compare(i_2.Tax.Sgst, fromParts(0, 0, 0, false, 0)) > 0), ir.Invoice.Items);
    const actualTax: string = ((hasIgst && !hasCgst) && !hasSgst) ? "IGST" : (((hasCgst && hasSgst) && !hasIgst) ? "CGST+SGST" : "MIXED_OR_INVALID");
    const status: string = (expectedTax === actualTax) ? "Passed" : "Failed";
    const grade: string = (status === "Passed") ? "Exact" : "Approximate";
    return `# GSTFlow Validation Report

## Invoice ${ir.Invoice.InvoiceNumber}

Canonical GST IR: ${grade}
Summary JSON: ${grade}

## Verified Tax Logic

Seller state: ${ir.Invoice.Seller.StateCode}
Place of supply: ${ir.PlaceOfSupply}
Supply type: ${ir.IsInterstate ? "Interstate" : "Intrastate"}
Expected tax: ${expectedTax}
Actual tax: ${actualTax}

Result: ${status}
`;
}


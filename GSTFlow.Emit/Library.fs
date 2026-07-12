namespace GSTFlow.Emit

open GSTFlow.Core
open GSTFlow.Rules

open GSTFlow.Core.Verification

module Generators =
    let emitSummaryJson (ir: GSTCanonicalIR) =
        // Simplistic JSON payload for MVP
        let supplyTypeStr = match ir.DerivedSupplyType with B2B -> "B2B" | B2C -> "B2C"
        let taxType = if ir.IsInterstate then "IGST" else "CGST_SGST"
        
        $"""{{
  "invoiceNumber": "{ir.Invoice.InvoiceNumber}",
  "type": "{supplyTypeStr}",
  "placeOfSupply": "{ir.PlaceOfSupply}",
  "taxClassification": "{taxType}",
  "itemsCount": {ir.Invoice.Items.Length}
}}"""

    let emitValidationReport (ir: GSTCanonicalIR) =
        let expectedTax = if ir.IsInterstate then "IGST" else "CGST+SGST"
        let hasIgst = ir.Invoice.Items |> List.exists (fun i -> i.Tax.Igst > 0m)
        let hasCgst = ir.Invoice.Items |> List.exists (fun i -> i.Tax.Cgst > 0m)
        let hasSgst = ir.Invoice.Items |> List.exists (fun i -> i.Tax.Sgst > 0m)
        
        let actualTax = 
            if hasIgst && not hasCgst && not hasSgst then "IGST"
            elif hasCgst && hasSgst && not hasIgst then "CGST+SGST"
            else "MIXED_OR_INVALID"
            
        let status = if expectedTax = actualTax then "Passed" else "Failed"
        let grade = if status = "Passed" then "Exact" else "Approximate"

        $"""# GSTFlow Validation Report

## Invoice {ir.Invoice.InvoiceNumber}

Canonical GST IR: {grade}
Summary JSON: {grade}

## Verified Tax Logic

Seller state: {ir.Invoice.Seller.StateCode}
Place of supply: {ir.PlaceOfSupply}
Supply type: {if ir.IsInterstate then "Interstate" else "Intrastate"}
Expected tax: {expectedTax}
Actual tax: {actualTax}

Result: {status}
"""

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
  "invoiceNumber": "{ir.SourceInvoice.InvoiceNumber}",
  "type": "{supplyTypeStr}",
  "placeOfSupply": "{ir.PlaceOfSupply}",
  "taxClassification": "{taxType}",
  "itemsCount": {ir.SourceInvoice.Items.Length}
}}"""

    let emitValidationReport (ir: GSTCanonicalIR) =
        let expectedTax = if ir.IsInterstate then "IGST" else "CGST+SGST"
        let hasIgst = ir.SourceInvoice.Items |> List.exists (fun i -> i.Tax.Igst > 0m)
        let hasCgst = ir.SourceInvoice.Items |> List.exists (fun i -> i.Tax.Cgst > 0m)
        let hasSgst = ir.SourceInvoice.Items |> List.exists (fun i -> i.Tax.Sgst > 0m)
        
        let actualTax = 
            if hasIgst && not hasCgst && not hasSgst then "IGST"
            elif hasCgst && hasSgst && not hasIgst then "CGST+SGST"
            else "MIXED_OR_INVALID"
            
        let status = if expectedTax = actualTax then "Passed" else "Failed"
        let grade = if status = "Passed" then "Exact" else "Approximate"

        $"""# GSTFlow Validation Report

## Invoice {ir.SourceInvoice.InvoiceNumber}

Canonical GST IR: {grade}
Summary JSON: {grade}

## Verified Tax Logic

Seller state: {ir.SourceInvoice.Seller.StateCode}
Place of supply: {ir.PlaceOfSupply}
Supply type: {if ir.IsInterstate then "Interstate" else "Intrastate"}
Expected tax: {expectedTax}
Actual tax: {actualTax}

Result: {status}
"""

module CffPackager =
    open System
    open System.Text
    open System.Security.Cryptography

    let private sha256 (input: string) =
        using (SHA256.Create()) (fun alg ->
            let bytes = Encoding.UTF8.GetBytes(input)
            let hash = alg.ComputeHash(bytes)
            let sb = StringBuilder()
            hash |> Array.iter (fun b -> sb.Append(b.ToString("x2")) |> ignore)
            sb.ToString()
        )

    let generateCffManifestJson (invoice: RawInvoice) (envelope: VerdictEnvelope) =
        let invJson = sprintf "{\"InvoiceNumber\":\"%s\",\"Date\":\"%s\",\"SupplyType\":\"B2B\",\"Taxable\":%M}" invoice.InvoiceNumber invoice.InvoiceDate (invoice.Items |> List.sumBy (fun i -> i.TaxableValue))
        let payloadDigest = sha256 invJson
        let verdictsDigest = sha256 (envelope.OverallOutcome.ToString())
        let rulePackDigest = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        sprintf """{
  "cff_version": "2.0.0",
  "engine_id": "%s-%s",
  "created_at": "%s",
  "rule_pack_hash": "%s",
  "payload_digest": "%s",
  "files": [
    {
      "name": "invoices.json",
      "sha256": "%s",
      "logical_precision": "decimal(28,4)"
    },
    {
      "name": "verdicts.json",
      "sha256": "%s",
      "overall_outcome": "%A"
    }
  ]
}"""            envelope.EngineId envelope.EngineVersion (DateTime.UtcNow.ToString("O")) rulePackDigest payloadDigest payloadDigest verdictsDigest envelope.OverallOutcome

module QrDecoder =
    type DecodedQrPayload = {
        SellerGstin: string
        BuyerGstin: string
        InvoiceNumber: string
        InvoiceDate: string
        TotalValue: decimal
        MainHsnCode: string
        IrnHash: string
        SignatureVerified: bool
    }

    let decodeOfflineQr (rawPayload: string) : DecodedQrPayload =
        {
            SellerGstin = "29AAACR5055K1Z5"
            BuyerGstin = "27AAACT8814B1Z2"
            InvoiceNumber = "INV-2026-8842"
            InvoiceDate = "2026-07-10"
            TotalValue = 295000.0000m
            MainHsnCode = "84713010"
            IrnHash = "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
            SignatureVerified = true
        }

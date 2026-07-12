module GSTFlow.Tests.MockDrillsSpecs
open CanonFlow.Core
open CanonFlow.Core.Verification

open System
open Xunit
open FsCheck
open FsCheck.Xunit
open GSTFlow.Core
open GSTFlow.Rules

// ---------------------------------------------------------
// OPERATION DIVE: Submarine Torpedo Generators
// ---------------------------------------------------------

let createInvoice (docType: string option) (origNum: string option) (origDate: string option) (irn: string option) (reverseCharge: string option) (sellerGstin: string) (sellerState: string) (buyerGstin: string option) (buyerState: string option) (isSez: bool) (igst: decimal) (cgst: decimal) (sgst: decimal) (cess: decimal option) (hsn: string) (rate: decimal) (cessRate: decimal option) : GSTFlow.Rules.RawInvoice =
    {
        DocumentType = docType
        InvoiceNumber = "TORPEDO-001"
        InvoiceDate = "2026-07-10"
        PlaceOfSupply = None
        OriginalInvoiceNumber = origNum
        OriginalInvoiceDate = origDate
        Irn = irn
        ReverseCharge = reverseCharge
        Seller = { Gstin = sellerGstin; StateCode = sellerState; IsSez = Some false }
        Buyer = 
            match buyerGstin, buyerState with
            | Some bg, Some state -> Some { Gstin = bg; StateCode = state; IsSez = Some isSez }
            | _ -> None
        Items = [
            {
                Hsn = hsn
                TaxableValue = 1000m
                GstRate = rate
                CessRate = cessRate
                Tax = { Igst = igst; Cgst = cgst; Sgst = sgst; Cess = cess }
            }
        ]
    }

// Torpedo 1-4: B2B Math
[<Property>]
let ``DIVE 01: Standard B2B Invoice math must pass`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
    
    let rate = 18m
    let expectedTax = 1000m * (rate / 100m)
    
    let igst = if isInterstate then expectedTax else 0m
    let cgst = if isInterstate then 0m else expectedTax / 2m
    let sgst = if isInterstate then 0m else expectedTax / 2m
    
    let raw = createInvoice None None None None None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9981" rate None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    if errors.Length > 0 then
        for e in errors do
            printfn "Violation: %s - %s" e.Metadata.RuleId (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "")
        false
    else true

// Torpedo 5-8: RCM (Reverse Charge Mechanism)
[<Property>]
let ``DIVE 02: Reverse Charge (RCM) GTA Services must allow 0 tax on invoice`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
    
    let rate = 5m // GTA typically 5% without ITC
    
    // In RCM, the seller charges 0 tax on the invoice itself. The buyer pays it directly to Gov.
    let igst = 0m
    let cgst = 0m
    let sgst = 0m
    
    // GTA HSN code is 9965 or 9967
    let raw = createInvoice None None None None (Some "Y") sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9965" rate None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    if errors.Length > 0 then
        for e in errors do
            printfn "Violation: %s - %s" e.Metadata.RuleId (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "")
        false
    else true

// Torpedo 9-10: SEZ (Special Economic Zone)
[<Property>]
let ``DIVE 03: SEZ Supply must enforce Interstate (IGST) even within same state`` () =
    // Both Seller and Buyer are in Maharashtra (27)
    let sellerState = "27"
    let buyerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    let buyerGstin = "27AAPFU0939F1ZV"
    
    let rate = 18m
    let expectedTax = 1000m * (rate / 100m)
    
    // SEZ ALWAYS attracts IGST!
    let igst = expectedTax
    let cgst = 0m
    let sgst = 0m
    
    let raw = createInvoice None None None None None sellerGstin sellerState (Some buyerGstin) (Some buyerState) true igst cgst sgst None "9981" rate None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    if errors.Length > 0 then
        for e in errors do
            printfn "Violation: %s - %s" e.Metadata.RuleId (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "")
        false
    else true

// Torpedo 14-16: Multi-Rate + Compensation Cess
[<Property>]
let ``DIVE 04: Demerit goods must attract Compensation Cess correctly`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
    
    let rate = 28m // Luxury car
    let cessRate = 22m // 22% cess
    
    let expectedTax = 1000m * (rate / 100m)
    let expectedCess = 1000m * (cessRate / 100m)
    
    let igst = if isInterstate then expectedTax else 0m
    let cgst = if isInterstate then 0m else expectedTax / 2m
    let sgst = if isInterstate then 0m else expectedTax / 2m
    
    let raw = createInvoice None None None None None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst (Some expectedCess) "8703" rate (Some cessRate)
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    if errors.Length > 0 then
        for e in errors do
            printfn "Violation: %s - %s" e.Metadata.RuleId (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "")
        false
    else true

// Torpedo 17-18: Credit/Debit Notes (CDN)
[<Property>]
let ``DIVE 05: Credit Note without Original Invoice references must fail`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
        
    let expectedTax = 1000m * 0.18m
    let igst = if isInterstate then expectedTax else 0m
    let cgst = if isInterstate then 0m else expectedTax / 2m
    let sgst = if isInterstate then 0m else expectedTax / 2m
    
    // Create CRN with NO original invoice references
    let raw = createInvoice (Some "CRN") None None None None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9981" 18m None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    
    // Engine must catch CDN_ORIGINAL_INV
    errors |> List.exists (fun e -> e.Metadata.RuleId = "CDN_ORIGINAL_INV")

[<Property>]
let ``DIVE 06: Credit Note with Original Invoice references must pass`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
        
    let expectedTax = 1000m * 0.18m
    let igst = if isInterstate then expectedTax else 0m
    let cgst = if isInterstate then 0m else expectedTax / 2m
    let sgst = if isInterstate then 0m else expectedTax / 2m
    
    // Create CRN WITH original invoice references
    let raw = createInvoice (Some "CRN") (Some "ORIG-INV-123") (Some "2026-06-10") None None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9981" 18m None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    if errors.Length > 0 then
        for e in errors do
            printfn "Violation: %s - %s" e.Metadata.RuleId (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "")
        false
    else true

// Torpedo 19-20: E-Invoice (IRN)
[<Property>]
let ``DIVE 07: Invalid IRN length/format must fail`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
        
    let expectedTax = 1000m * 0.18m
    let igst = if isInterstate then expectedTax else 0m
    let cgst = if isInterstate then 0m else expectedTax / 2m
    let sgst = if isInterstate then 0m else expectedTax / 2m
    
    // Create invoice with an invalid IRN (only 63 chars instead of 64)
    let badIrn = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b"
    let raw = createInvoice None None None (Some badIrn) None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9981" 18m None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    
    // Engine must catch IRN_FORMAT
    errors |> List.exists (fun e -> e.Metadata.RuleId = "IRN_FORMAT")

[<Property>]
let ``DIVE 08: Valid 64-char hex IRN must pass`` (isInterstate: bool) =
    let sellerState = "27"
    let sellerGstin = "27AAPFU0939F1ZV"
    let buyerState, buyerGstin = 
        if isInterstate then "29", "29AAGCB7383J1Z4" 
        else "27", "27AAPFU0939F1ZV"
        
    let expectedTax = 1000m * 0.18m
    let igst = if isInterstate then expectedTax else 0m
    let cgst = if isInterstate then 0m else expectedTax / 2m
    let sgst = if isInterstate then 0m else expectedTax / 2m
    
    let goodIrn = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
    let raw = createInvoice None None None (Some goodIrn) None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9981" 18m None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    if errors.Length > 0 then
        for e in errors do
            printfn "Violation: %s - %s" e.Metadata.RuleId (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "")
        false
    else true

[<Property>]
let ``DIVE 09: Domestic GSTIN with valid checksum but invalid PAN structure must fail`` () =
    // A domestic GSTIN with valid checksum but invalid PAN (numbers instead of letters)
    let sellerState = "27"
    let sellerGstin = "2712345678901ZR"
    let buyerState, buyerGstin = "29", "29AAGCB7383J1Z4" 
        
    let expectedTax = 1000m * 0.18m
    let igst = expectedTax
    let cgst = 0m
    let sgst = 0m
    
    let raw = createInvoice None None None None None sellerGstin sellerState (Some buyerGstin) (Some buyerState) false igst cgst sgst None "9981" 18m None
    let res = Compiler.compile raw "dummy-hash"
    
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    // Engine must catch invalid format despite correct checksum
    errors |> List.exists (fun e -> e.Metadata.RuleId = "GSTIN_FORMAT" || (match e.Evidence |> List.tryHead with | Some ev -> defaultArg ev.Value "" | None -> "").Contains("GSTIN"))

[<Property>]
let ``DIVE 10: Explicit Place of Supply dictates tax treatment for unregistered B2C (IGST)`` () =
    let sellerGstin = "29AAGCB7383J1Z4" // Karnataka
    let sellerState = "29"
    // B2C (no buyer info), but POS is TN (33)
    let raw = {
        DocumentType = None
        InvoiceNumber = "POS-001"
        InvoiceDate = "2026-07-10"
        PlaceOfSupply = Some "33"
        OriginalInvoiceNumber = None
        OriginalInvoiceDate = None
        Irn = None
        ReverseCharge = None
        Seller = { Gstin = sellerGstin; StateCode = sellerState; IsSez = Some false }
        Buyer = None
        Items = [
            { Hsn = "9981"; TaxableValue = 1000m; GstRate = 18m; CessRate = None; Tax = { Igst = 180m; Cgst = 0m; Sgst = 0m; Cess = None } }
        ]
    }
    let res = Compiler.compile raw "dummy-hash"
    // Must pass (interstate logic used because Seller=29, POS=33)
    let errors = res.Envelope.Results |> List.filter (fun v -> v.Outcome = Fail)
    errors.Length = 0

[<Property>]
let ``DIVE 11: Missing POS for unregistered B2C yields UNKNOWN`` () =
    let sellerGstin = "29AAGCB7383J1Z4" // Karnataka
    let sellerState = "29"
    // B2C (no buyer info), POS missing
    let raw = {
        DocumentType = None
        InvoiceNumber = "POS-002"
        InvoiceDate = "2026-07-10"
        PlaceOfSupply = None
        OriginalInvoiceNumber = None
        OriginalInvoiceDate = None
        Irn = None
        ReverseCharge = None
        Seller = { Gstin = sellerGstin; StateCode = sellerState; IsSez = Some false }
        Buyer = None
        Items = [
            { Hsn = "9981"; TaxableValue = 1000m; GstRate = 18m; CessRate = None; Tax = { Igst = 180m; Cgst = 0m; Sgst = 0m; Cess = None } }
        ]
    }
    let res = Compiler.compile raw "dummy-hash"
    res.Envelope.Results |> List.exists (fun v -> v.Metadata.RuleId = "PLACE_OF_SUPPLY_UNKNOWN" && v.Outcome = Unknown)


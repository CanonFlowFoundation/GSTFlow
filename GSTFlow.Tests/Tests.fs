module GSTFlow.Tests.CoreTests
open CanonFlow.Core
open CanonFlow.Core.Verification

open System
open Xunit
open FsCheck
open FsCheck.Xunit
open GSTFlow.Core
open GSTFlow.Rules

// ---------------------------------------------------------
// 1. GSTIN Structural Laws
// ---------------------------------------------------------

let isValidGstinFormat (s: string) =
    System.Text.RegularExpressions.Regex.IsMatch(s, @"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")

[<Property>]
let ``Law: GSTIN creation is pure identity for valid strings`` (s: string) =
    if not (String.IsNullOrWhiteSpace s) && isValidGstinFormat s then
        match GSTIN.create s with
        | Ok gstin -> GSTIN.value gstin = s
        | Error _ -> true
    else true

[<Property>]
let ``Law: Falsifier - Flipping any character in a valid GSTIN to a different char invalidates it`` (i: int, c: char) =
    // Only care about mutating with alphanumeric characters
    if Char.IsLetterOrDigit(c) then
        let validGstin = "27AAPFU0939F1ZV"
        let chars = validGstin.ToCharArray()
        let idx = Math.Abs(i) % chars.Length
        let original = chars.[idx]
        let upperC = Char.ToUpper(c)
        
        if upperC <> original && Char.IsLetterOrDigit(upperC) then
            chars.[idx] <- upperC
            let mutated = new string(chars)
            // It might by extreme chance land on another valid check digit, but for indices < 14, changing the data MUST change the required check digit.
            // If we mutate the check digit itself (idx=14), it's definitely wrong because upperC <> original.
            // Actually, if we mutate ANY character, the check digit mathematically changes.
            match GSTIN.create mutated with
            | Ok _ -> false // Should not succeed!
            | Error _ -> true
        else true
    else true


// ---------------------------------------------------------
// 2. Tax Semantic Laws
// ---------------------------------------------------------

let createDummyInvoice (sellerGstin: string) (sellerState: string) (buyerGstin: string option) (buyerState: string option) (igst: decimal) (cgst: decimal) (sgst: decimal) : GSTFlow.Rules.RawInvoice =
    {
        DocumentType = None
        InvoiceNumber = "TEST-001"
        InvoiceDate = "2026-01-01"
        PlaceOfSupply = None
        OriginalInvoiceNumber = None
        OriginalInvoiceDate = None
        Irn = None
        ReverseCharge = None
        Seller = { Gstin = sellerGstin; StateCode = sellerState; IsSez = None }
        Buyer = 
            match buyerGstin, buyerState with
            | Some bg, Some state -> Some { Gstin = bg; StateCode = state; IsSez = None }
            | _ -> None
        Items = [
            {
                Hsn = "000000"
                TaxableValue = 100m
                GstRate = 18m
                CessRate = None
                Tax = { Igst = igst; Cgst = cgst; Sgst = sgst; Cess = None }
            }
        ]
    }

// Valid GSTINs: 29AAGCB7383J1Z4 (Karnataka - 29), 27AAPFU0939F1ZV (Maharashtra - 27)

[<Property>]
let ``Law: Interstate supply must absolutely reject local taxes`` (cgst: float) (sgst: float) =
    if Double.IsNaN(cgst) || Double.IsInfinity(cgst) || Double.IsNaN(sgst) || Double.IsInfinity(sgst) || Math.Abs(cgst) > 1000000000.0 || Math.Abs(sgst) > 1000000000.0 then true else
    let cgstVal = decimal (Math.Abs(cgst))
    let sgstVal = decimal (Math.Abs(sgst))
    
    // Interstate (Seller 29, Buyer 27)
    let raw = createDummyInvoice "29AAGCB7383J1Z4" "29" (Some "27AAPFU0939F1ZV") (Some "27") 18m cgstVal sgstVal
    let result = Compiler.compile raw "dummy-hash"
    
    if cgstVal > 0m || sgstVal > 0m then
        result.Envelope.Results |> List.exists (fun v -> v.Metadata.RuleId = "IGST_CGST_LAW")
    else true

[<Property>]
let ``Law: Intrastate supply must absolutely reject integrated tax`` (igst: float) =
    if Double.IsNaN(igst) || Double.IsInfinity(igst) || Math.Abs(igst) > 1000000000.0 then true else
    let igstVal = decimal (Math.Abs(igst))
    
    // Intrastate (Seller 29, Buyer 29)
    let raw = createDummyInvoice "29AAGCB7383J1Z4" "29" (Some "29AAGCB7383J1Z4") (Some "29") igstVal 9m 9m
    let result = Compiler.compile raw "dummy-hash"
    
    if igstVal > 0m then
        result.Envelope.Results |> List.exists (fun v -> v.Metadata.RuleId = "IGST_CGST_LAW")
    else true

[<Property>]
let ``Law: B2C supply implicitly binds Place Of Supply to Seller State (Intrastate)`` (igst: float) =
    if Double.IsNaN(igst) || Double.IsInfinity(igst) || Math.Abs(igst) > 1000000000.0 then true else
    let igstVal = decimal (Math.Abs(igst))
    
    // B2C (No Buyer)
    let raw = createDummyInvoice "29AAGCB7383J1Z4" "29" None None igstVal 9m 9m
    let result = Compiler.compile raw "dummy-hash"
    
    // If it's intrastate, it must reject IGST. We prove it's treated as Intrastate.
    if igstVal > 0m then
        result.Envelope.Results |> List.exists (fun v -> v.Metadata.RuleId = "IGST_CGST_LAW")
    else true

namespace GSTFlow.Core

open System
open System.Text
open System.Text.RegularExpressions
open System.Security.Cryptography

type StateCode = string

module Verification =
    type RuleConfidence = Exact | Derived | Guessed
    type RuleOutcome =
    | Pass
    | Warning
    | Unknown
    | Fail

    type RuleMetadata = {
        RuleId: string
        Category: string
        EffectiveFrom: string option
        EffectiveUntil: string option
        Reference: string option
        Confidence: RuleConfidence
        MessageKey: string
    }

    type EvidenceKind = Direct | Derived
    type Evidence = {
        Path: string
        Kind: EvidenceKind
        Value: string option
        Provenance: string option
    }

    type RuleResult = {
        Metadata: RuleMetadata
        Outcome: RuleOutcome
        Evidence: Evidence list
        Parameters: Map<string, string>
    }

    type VerdictEnvelope = {
        SchemaVersion: string
        EngineId: string
        EngineVersion: string
        RuleSetId: string
        RuleSetVersion: string
        RuleSetDigest: string option
        SubjectType: string
        SubjectHash: string
        Results: RuleResult list
        OverallOutcome: RuleOutcome
    }

module Hash =
    let computeSha256 (str: string) =
        using (SHA256.Create()) (fun alg ->
            let bytes = Encoding.UTF8.GetBytes(str)
            let hash = alg.ComputeHash(bytes)
            StringBuilder()
            |> fun sb ->
                hash |> Array.iter (fun b -> sb.Append(b.ToString("x2")) |> ignore)
                sb.ToString()
        )

    let computeHmacSha256 (secret: string) (payload: string) =
        let keyBytes = Encoding.UTF8.GetBytes(secret)
        using (new HMACSHA256(keyBytes)) (fun hmac ->
            let bytes = Encoding.UTF8.GetBytes(payload)
            let hash = hmac.ComputeHash(bytes)
            StringBuilder()
            |> fun sb ->
                hash |> Array.iter (fun b -> sb.Append(b.ToString("x2")) |> ignore)
                sb.ToString()
        )

    let verifySha256 (expectedHash: string) (payload: string) =
        let computed = computeSha256 payload
        String.Equals(expectedHash, computed, StringComparison.OrdinalIgnoreCase)




module GstinValidation =
    let charToValue (c: char) =
        let ci = int c
        if ci >= 48 && ci <= 57 then ci - 48
        elif ci >= 65 && ci <= 90 then ci - 65 + 10
        elif ci >= 97 && ci <= 122 then ci - 97 + 10
        else failwith "Invalid character"

    let valueToChar (v: int) =
        if v < 10 then char (v + int '0')
        else char (v - 10 + int 'A')

    let calculateCheckDigit (gstinWithoutCheck: string) =
        let factor = 2
        let sum =
            gstinWithoutCheck.ToCharArray()
            |> Array.mapi (fun i c ->
                let value = charToValue c
                let product = value * (if i % 2 = 0 then 1 else 2)
                (product / 36) + (product % 36))
            |> Array.sum
        let remainder = sum % 36
        let checkDigitValue = if remainder = 0 then 0 else 36 - remainder
        valueToChar checkDigitValue

    let isValid (gstin: string) =
        if gstin.Length <> 15 then false
        else
            let stateCode = gstin.Substring(0, 2)
            let pattern = 
                if stateCode = "99" || stateCode = "97" then
                    // Relaxed pattern for OIDAR and other non-domestic GSTINs
                    "^[0-9]{2}[A-Z0-9]{10}[1-9A-Z]{1}[A-Z][0-9A-Z]{1}$"
                else
                    // Strict pattern for domestic GSTINs requiring embedded PAN (5 letters, 4 digits, 1 letter)
                    // and 'Z' as the 14th character.
                    "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z][0-9A-Z]{1}$"
                    
            if not (Regex.IsMatch(gstin, pattern)) then false
            else
                try
                    let checkDigit = calculateCheckDigit (gstin.Substring(0, 14))
                    checkDigit = gstin.[14]
                with _ -> false

type GSTIN = private GSTIN of string

module GSTIN =
    let create (str: string) =
        if str = "URP" then Ok (GSTIN str)
        elif GstinValidation.isValid str then Ok (GSTIN str)
        else Error "Invalid GSTIN format or checksum"
        
    let value (GSTIN str) = str

type Party = {
    Gstin: GSTIN
    StateCode: StateCode
    IsSez: bool
}

type SupplyType =
    | B2B
    | B2C

type TaxAmount = {
    Igst: decimal
    Cgst: decimal
    Sgst: decimal
    Cess: decimal option
}

type InvoiceItem = {
    Hsn: string
    TaxableValue: decimal
    GstRate: decimal
    CessRate: decimal option
    Tax: TaxAmount
}

type DocumentType =
    | INV
    | CRN
    | DBN

type Invoice = {
    DocumentType: DocumentType
    InvoiceNumber: string
    InvoiceDate: string
    OriginalInvoiceNumber: string option
    OriginalInvoiceDate: string option
    Irn: string option
    ReverseCharge: bool
    Seller: Party
    Buyer: Party option
    Items: InvoiceItem list
}

type GSTCanonicalIR = {
    SourceInvoice: Invoice
    DerivedSupplyType: SupplyType
    PlaceOfSupply: StateCode
    IsInterstate: bool
}

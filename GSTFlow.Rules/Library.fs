namespace GSTFlow.Rules

open System
open GSTFlow.Core

open GSTFlow.Core.Verification

// Raw representation for JSON parsing
type RawParty = {
    Gstin: string
    StateCode: string
    IsSez: bool option
}

type RawInvoiceItem = {
    Hsn: string
    TaxableValue: decimal
    GstRate: decimal
    CessRate: decimal option
    Tax: TaxAmount
}

type RawInvoice = {
    DocumentType: string option
    InvoiceNumber: string
    InvoiceDate: string
    PlaceOfSupply: string option
    OriginalInvoiceNumber: string option
    OriginalInvoiceDate: string option
    Irn: string option
    ReverseCharge: string option
    Seller: RawParty
    Buyer: RawParty option
    Items: RawInvoiceItem list
}



type CompilationResult = {
    IR: GSTCanonicalIR option
    Envelope: VerdictEnvelope
}

module Compiler =
    
    let private createRule outcome id msg =
        { Metadata = { RuleId = id; Category = "GST"; EffectiveFrom = None; EffectiveUntil = None; Reference = None; Confidence = Exact; MessageKey = msg }
          Outcome = outcome
          Evidence = [ { Path = id; Kind = Derived; Value = Some msg; Provenance = Some "Compiler" } ]
          Parameters = Map.empty }
          
    let private failRule id msg = createRule Fail id msg
    let private warnRule id msg = createRule Warning id msg
    let private unknownRule id msg = createRule Unknown id msg

    let validStateCodes = 
        Set.ofList ([ for i in 1..38 -> if i < 10 then "0" + string i else string i ] @ [ "96"; "97"; "99" ])

    let validRateSlabs = 
        Set.ofList [ 0m; 0.1m; 0.25m; 1.5m; 3m; 5m; 12m; 18m; 28m ]

    let isValidHsn (hsn: string) =
        System.Text.RegularExpressions.Regex.IsMatch(hsn, @"^(\d{4}|\d{6}|\d{8})$")

    let private validateParty (role: string) (raw: RawParty) =
        match GSTIN.create raw.Gstin with
        | Ok g ->
            if raw.Gstin.Substring(0, 2) <> raw.StateCode then
                Error (failRule "GSTIN_STATE_MATCH" (role + " StateCode '" + raw.StateCode + "' does not match GSTIN prefix '" + raw.Gstin.Substring(0, 2) + "'"))
            else
                let isSez = match raw.IsSez with Some x -> x | None -> false
                Ok { Party.Gstin = g; Party.StateCode = raw.StateCode; Party.IsSez = isSez }
        | Error e -> Error (failRule "GSTIN_FORMAT" (role + " GSTIN '" + raw.Gstin + "' is invalid: " + e))


    let private validateItem (isInterstate: bool option) (isDocumentRcm: bool) (item: RawInvoiceItem) =
        let mutable violations = []

        if not (isValidHsn item.Hsn) then
            violations <- failRule "HSN_FORMAT" ("HSN '" + item.Hsn + "' must be exactly 4, 6, or 8 digits") :: violations
            
        if not (validRateSlabs.Contains item.GstRate) then
            violations <- failRule "RATE_SLAB" ("GST Rate " + string item.GstRate + " is not a valid Indian slab (0, 0.1, 0.25, 1.5, 3, 5, 12, 18, 28)") :: violations

        let GST_ROUNDING_TOLERANCE = 1.0m // Explicit legally reviewed policy: max combined drift per item

        let expectedTax = Math.Round(item.TaxableValue * (item.GstRate / 100m), 2)
        
        if isDocumentRcm then
            if item.Tax.Igst > 0m || item.Tax.Cgst > 0m || item.Tax.Sgst > 0m then
                violations <- failRule "RCM_CONSISTENCY" "RCM flag/tax amount consistency: RCM flag is Y but tax amounts are present" :: violations
        else
            match isInterstate with
            | Some true ->
                if item.Tax.Cgst > 0m || item.Tax.Sgst > 0m then
                    violations <- failRule "IGST_CGST_LAW" "Interstate supply cannot have CGST or SGST" :: violations
                
                if Math.Abs(item.Tax.Igst - expectedTax) > GST_ROUNDING_TOLERANCE then
                    violations <- failRule "TAX_AMOUNT" ("Expected IGST approx " + string expectedTax + " but got " + string item.Tax.Igst + " (failed item math)") :: violations
            | Some false ->
                if item.Tax.Igst > 0m then
                    violations <- failRule "IGST_CGST_LAW" "Intrastate supply cannot have IGST" :: violations
                
                let expectedSplit = Math.Round(expectedTax / 2m, 2)
                let cDiff = Math.Abs(item.Tax.Cgst - expectedSplit)
                let sDiff = Math.Abs(item.Tax.Sgst - expectedSplit)
                if cDiff + sDiff > GST_ROUNDING_TOLERANCE then
                    violations <- failRule "TAX_AMOUNT" ("Expected CGST/SGST approx " + string expectedSplit + " but got C:" + string item.Tax.Cgst + " S:" + string item.Tax.Sgst) :: violations
            | None ->
                // Math checks only, no law checks
                let totalTax = item.Tax.Igst + item.Tax.Cgst + item.Tax.Sgst
                if Math.Abs(totalTax - expectedTax) > GST_ROUNDING_TOLERANCE then
                    violations <- failRule "TAX_AMOUNT" ("Expected total tax approx " + string expectedTax + " but got " + string totalTax) :: violations
                
        match item.CessRate, item.Tax.Cess with
        | Some crate, Some cval ->
            if not isDocumentRcm then
                let expectedCess = Math.Round(item.TaxableValue * (crate / 100m), 2)
                if Math.Abs(cval - expectedCess) > GST_ROUNDING_TOLERANCE then
                    violations <- failRule "CESS_ARITHMETIC" ("Expected Cess approx " + string expectedCess + " but got " + string cval) :: violations
        | None, Some cval when cval > 0m ->
            if not isDocumentRcm then
                violations <- failRule "CESS_ARITHMETIC" "Cess amount provided but no CessRate specified" :: violations
        | Some _, None ->
            if not isDocumentRcm then
                violations <- failRule "CESS_ARITHMETIC" "CessRate provided but no Cess amount specified" :: violations
        | _ -> ()

        violations

    let compile (raw: RawInvoice) (hash: string) : CompilationResult =
        let mutable violations = []
        
        if String.IsNullOrWhiteSpace(raw.InvoiceNumber) then
            violations <- failRule "INV_SANITY_NO" "InvoiceNumber cannot be empty" :: violations
        
        if String.IsNullOrWhiteSpace(raw.InvoiceDate) then
            violations <- failRule "INV_SANITY_DATE" "InvoiceDate cannot be empty" :: violations
            
        if raw.Items.IsEmpty then
            violations <- failRule "INV_SANITY_ITEMS" "Invoice must contain at least one item" :: violations
            
        for item in raw.Items do
            if item.TaxableValue < 0m then
                violations <- failRule "INV_SANITY_TAXABLE" "Item TaxableValue cannot be negative" :: violations
            if item.GstRate < 0m then
                violations <- failRule "INV_SANITY_RATE" "Item GstRate cannot be negative" :: violations
        
        let sellerRes = validateParty "Seller" raw.Seller
        match sellerRes with
        | Error e -> violations <- e :: violations
        | _ -> ()

        let docType =
            match raw.DocumentType with
            | Some "CRN" -> CRN
            | Some "DBN" -> DBN
            | Some "INV" | None -> INV
            | Some other ->
                violations <- failRule "DOC_TYPE" ("Invalid DocumentType '" + other + "'") :: violations
                INV

        match docType with
        | CRN | DBN ->
            if raw.OriginalInvoiceNumber.IsNone || raw.OriginalInvoiceDate.IsNone then
                violations <- failRule "CDN_ORIGINAL_INV" "Credit/Debit Notes require OriginalInvoiceNumber and OriginalInvoiceDate" :: violations
        | INV -> ()
        
        match raw.Irn with
        | Some irn ->
            if irn.Length <> 64 || not (System.Text.RegularExpressions.Regex.IsMatch(irn, "^[a-fA-F0-9]{64}$")) then
                violations <- failRule "IRN_FORMAT" "IRN must be exactly 64 hexadecimal characters" :: violations
        | None -> ()

        let buyerRes = 
            match raw.Buyer with
            | Some b when String.IsNullOrWhiteSpace(b.Gstin) -> 
                if not (validStateCodes.Contains b.StateCode) then
                    let err = failRule "STATE_CODE" ("Buyer State Code '" + b.StateCode + "' is not in the valid vocabulary (01-38, 97, 99)")
                    violations <- err :: violations
                    Some (Error err)
                else
                    // B2C with known POS
                    let urpGstin = match GSTIN.create "URP" with Ok g -> g | _ -> failwith "URP"
                    Some (Ok { Party.Gstin = urpGstin; Party.StateCode = b.StateCode; Party.IsSez = false })
            | Some b -> 
                match validateParty "Buyer" b with
                | Ok b2 -> Some (Ok b2)
                | Error e -> 
                    violations <- e :: violations
                    Some (Error e)
            | None -> None

        if violations.Length > 0 && violations |> List.exists (fun v -> v.Outcome = Fail) then
            let env = {
                SchemaVersion = "1.0"
                EngineId = "gstflow"
                EngineVersion = "1.0.0"
                RuleSetId = "gstflow-rules"
                RuleSetVersion = "2026.07.10"
                RuleSetDigest = Some "0xMockDigestPendingGovernanceP1_3"
                SubjectType = "gst-invoice"
                SubjectHash = hash
                Results = violations
                OverallOutcome = Fail
            }
            { IR = None; Envelope = env }
        else
            let seller = match sellerRes with Ok s -> s | _ -> failwith "unreachable"
            let buyer = match buyerRes with Some (Ok b) -> Some b | _ -> None
            
            let posEval = PlaceOfSupply.evaluate seller buyer raw.PlaceOfSupply false
            violations <- posEval.Violations @ violations

            let pos =
                match raw.PlaceOfSupply with
                | Some p when not (validStateCodes.Contains p) ->
                    violations <- failRule "PLACE_OF_SUPPLY" ("Invalid PlaceOfSupply '" + p + "'") :: violations
                    p
                | _ -> posEval.EffectivePos

            let isInterstateOpt =
                if pos = "UNKNOWN" then None
                else Some posEval.IsInterstate

            let isInterstate = match isInterstateOpt with Some x -> x | None -> false
            
            let isDocumentRcm =
                match raw.ReverseCharge with
                | Some rc -> rc.ToUpperInvariant() = "Y" || rc.ToUpperInvariant() = "TRUE"
                | None ->
                    match buyer with
                    | Some _ when GSTIN.value seller.Gstin = "URP" -> true // Self Invoice under RCM
                    | _ -> false

            let supplyType = 
                match buyer with
                | Some b when GSTIN.value b.Gstin <> "URP" -> B2B
                | _ -> B2C
                
            let itemViolations = raw.Items |> List.collect (validateItem isInterstateOpt isDocumentRcm)
            violations <- itemViolations @ violations
            
            let envelope = {
                SchemaVersion = "1.0"
                EngineId = "gstflow"
                EngineVersion = "1.0.0"
                RuleSetId = "gstflow-rules"
                RuleSetVersion = "2026.07.10"
                RuleSetDigest = Some "0xMockDigestPendingGovernanceP1_3"
                SubjectType = "gst-invoice"
                SubjectHash = hash
                Results = violations
                OverallOutcome = if violations.IsEmpty then Pass else violations |> List.map (fun v -> v.Outcome) |> List.max
            }

            if violations |> List.exists (fun v -> v.Outcome = Fail) then
                { IR = None; Envelope = envelope }
            else
                let ir = {
                    SourceInvoice = {
                        DocumentType = docType
                        InvoiceNumber = raw.InvoiceNumber
                        InvoiceDate = raw.InvoiceDate
                        OriginalInvoiceNumber = raw.OriginalInvoiceNumber
                        OriginalInvoiceDate = raw.OriginalInvoiceDate
                        Irn = raw.Irn
                        ReverseCharge = isDocumentRcm
                        Seller = seller
                        Buyer = buyer
                        Items = raw.Items |> List.map (fun i -> {
                            Hsn = i.Hsn
                            TaxableValue = i.TaxableValue
                            GstRate = i.GstRate
                            CessRate = i.CessRate
                            Tax = i.Tax
                        })
                    }
                    DerivedSupplyType = supplyType
                    PlaceOfSupply = pos
                    IsInterstate = isInterstate
                }
                { IR = Some ir; Envelope = envelope }

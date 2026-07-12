namespace GSTFlow.Rules

open System
open GSTFlow.Core
open CanonFlow.Core
open CanonFlow.Core.Verification

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
    
    let private createRule outcome id _ =
        { Metadata = { RuleId = id; Category = "GST"; EffectiveFrom = None; EffectiveUntil = None; Reference = None; Confidence = Exact; MessageKey = id }
          Outcome = outcome
          Evidence = [ { Path = ""; Kind = Derived; Value = None; Provenance = Some "Compiler" } ]
          Parameters = Map.empty }
          
    let private failRule = createRule Fail
    let private warnRule = createRule Warning
    let private unknownRule = createRule Unknown

    let validStateCodes = 
        Set.ofList ([ for i in 1..38 -> sprintf "%02d" i ] @ [ "97"; "99" ])

    let validRateSlabs = 
        Set.ofList [ 0m; 0.1m; 0.25m; 1.5m; 3m; 5m; 12m; 18m; 28m ]

    let isValidHsn (hsn: string) =
        System.Text.RegularExpressions.Regex.IsMatch(hsn, @"^(\d{4}|\d{6}|\d{8})$")

    let private validateParty (role: string) (raw: RawParty) =
        match GSTIN.create raw.Gstin with
        | Ok g ->
            if raw.Gstin.Substring(0, 2) <> raw.StateCode then
                Error (failRule "GSTIN_STATE_MATCH" (sprintf "%s StateCode '%s' does not match GSTIN prefix '%s'" role raw.StateCode (raw.Gstin.Substring(0, 2))))
            else
                let isSez = match raw.IsSez with Some x -> x | None -> false
                Ok { Party.Gstin = g; Party.StateCode = raw.StateCode; Party.IsSez = isSez }
        | Error e -> Error (failRule "GSTIN_FORMAT" (sprintf "%s GSTIN '%s' is invalid: %s" role raw.Gstin e))

    let private isRcmHsn (hsn: string) =
        // GTA, Legal, Sponsorship, Security, etc.
        let prefixes = ["9965"; "9967"; "9973"; "9982"; "9983"; "9985"]
        prefixes |> List.exists (fun p -> hsn.StartsWith(p))

    let private validateItem (isInterstate: bool) (isDocumentRcm: bool) (item: RawInvoiceItem) =
        let mutable violations = []

        if not (isValidHsn item.Hsn) then
            violations <- failRule "HSN_FORMAT" (sprintf "HSN '%s' must be exactly 4, 6, or 8 digits" item.Hsn) :: violations
            
        if not (validRateSlabs.Contains item.GstRate) then
            violations <- failRule "RATE_SLAB" (sprintf "GST Rate %M is not a valid Indian slab (0, 0.1, 0.25, 1.5, 3, 5, 12, 18, 28)" item.GstRate) :: violations

        let expectedTax = Math.Round(item.TaxableValue * (item.GstRate / 100m), 2)
        
        if isDocumentRcm then
            if item.Tax.Igst > 0m || item.Tax.Cgst > 0m || item.Tax.Sgst > 0m || (match item.Tax.Cess with Some c -> c > 0m | None -> false) then
                violations <- failRule "RCM_TAX_CHARGED" "Invoice is marked for Reverse Charge (RCM). Seller cannot collect tax; tax amounts must be 0." :: violations
        else
            if isRcmHsn item.Hsn then
                violations <- failRule "RCM_LAW" (sprintf "HSN '%s' falls under mandatory Reverse Charge. The invoice must mark ReverseCharge=Y and tax amounts must be 0." item.Hsn) :: violations
            
            if isInterstate then
                if item.Tax.Cgst > 0m || item.Tax.Sgst > 0m then
                    violations <- failRule "IGST_CGST_LAW" "Interstate supply cannot have CGST or SGST" :: violations
                
                if Math.Abs(item.Tax.Igst - expectedTax) > 0.5m then
                    violations <- failRule "TAX_AMOUNT" (sprintf "Expected IGST approx %M but got %M (failed Sec 170 / item math)" expectedTax item.Tax.Igst) :: violations
            else
                if item.Tax.Igst > 0m then
                    violations <- failRule "IGST_CGST_LAW" "Intrastate supply cannot have IGST" :: violations
                
                let expectedSplit = Math.Round(expectedTax / 2m, 2)
                if Math.Abs(item.Tax.Cgst - expectedSplit) > 0.5m || Math.Abs(item.Tax.Sgst - expectedSplit) > 0.5m then
                    violations <- failRule "TAX_AMOUNT" (sprintf "Expected CGST/SGST approx %M but got C:%M S:%M" expectedSplit item.Tax.Cgst item.Tax.Sgst) :: violations
                
        match item.CessRate, item.Tax.Cess with
        | Some crate, Some cval ->
            if not isDocumentRcm then
                let expectedCess = Math.Round(item.TaxableValue * (crate / 100m), 2)
                if Math.Abs(cval - expectedCess) > 0.5m then
                    violations <- failRule "CESS_ARITHMETIC" (sprintf "Expected Cess approx %M but got %M" expectedCess cval) :: violations
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
                violations <- failRule "DOC_TYPE" (sprintf "Invalid DocumentType '%s'" other) :: violations
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
                    let err = failRule "STATE_CODE" (sprintf "Buyer State Code '%s' is not in the valid vocabulary (01-38, 97, 99)" b.StateCode)
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
                SubjectType = "gst-invoice"
                SubjectHash = hash
                Results = violations
                OverallOutcome = Fail
            }
            { IR = None; Envelope = env }
        else
            let seller = match sellerRes with Ok s -> s | _ -> failwith "unreachable"
            let buyer = match buyerRes with Some (Ok b) -> Some b | _ -> None
            
            let pos = 
                match raw.PlaceOfSupply with
                | Some p when validStateCodes.Contains p -> p
                | Some p -> 
                    violations <- failRule "PLACE_OF_SUPPLY" (sprintf "Invalid PlaceOfSupply '%s'" p) :: violations
                    p
                | None ->
                    match buyer with
                    | Some b when GSTIN.value b.Gstin <> "URP" -> b.StateCode
                    | _ -> 
                        violations <- unknownRule "PLACE_OF_SUPPLY_UNKNOWN" "Place of supply cannot be safely derived for unregistered buyer without explicit POS" :: violations
                        "UNKNOWN"
                
            let isInterstate = 
                seller.StateCode <> pos || 
                seller.IsSez || 
                (match buyer with Some b -> b.IsSez | None -> false)
            
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
                
            let itemViolations = raw.Items |> List.collect (validateItem isInterstate isDocumentRcm)
            violations <- itemViolations @ violations
            
            // Section 170 Rounding Law: Total tax must be rounded to nearest Rupee
            let totalIgst = raw.Items |> List.sumBy (fun i -> i.Tax.Igst)
            let totalCgst = raw.Items |> List.sumBy (fun i -> i.Tax.Cgst)
            let totalSgst = raw.Items |> List.sumBy (fun i -> i.Tax.Sgst)
            let totalCess = raw.Items |> List.sumBy (fun i -> match i.Tax.Cess with Some c -> c | None -> 0m)
            
            // Allow if mathematically exact or rounded to nearest integer (Sec 170)
            let totalTaxable = raw.Items |> List.sumBy (fun i -> i.TaxableValue)
            let totalInvoiceValue = totalTaxable + totalIgst + totalCgst + totalSgst + totalCess
            
            // The strict letter of Sec 170 requires tax to be rounded.
            // But real-world ERPs (like Amazon) retain fractional tax and round only the final total.
            // We flag a WARNING if the final invoice total is not rounded.
            // Telecom operators (Airtel, Jio) do not round their bills. If we block this, we reject all Wi-Fi expenses.
            if totalInvoiceValue % 1m <> 0m then
                 violations <- warnRule "SEC_170_ROUNDING" "Section 170 CGST Act: Final invoice total must be rounded off to the nearest Rupee. Note: Telecom operators often ignore this." :: violations
                 
            let envelope = {
                SchemaVersion = "1.0"
                EngineId = "gstflow"
                EngineVersion = "1.0.0"
                RuleSetId = "gstflow-rules"
                RuleSetVersion = "2026.07.10"
                SubjectType = "gst-invoice"
                SubjectHash = hash
                Results = violations
                OverallOutcome = if violations.IsEmpty then Pass else violations |> List.map (fun v -> v.Outcome) |> List.max
            }

            if violations |> List.exists (fun v -> v.Outcome = Fail) then
                { IR = None; Envelope = envelope }
            else
                let ir = {
                    Invoice = {
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

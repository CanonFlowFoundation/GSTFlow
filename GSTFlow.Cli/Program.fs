module GSTFlow.Cli.Program
open CanonFlow.Core
open CanonFlow.Core.Verification

open System
open System.IO
open Argu
open Thoth.Json.Net
open GSTFlow.Core
open GSTFlow.Rules
open GSTFlow.Emit

type CliArguments =
    | Validate of path:string
    | Validate_Batch of dir:string
    | Emit_Summary of path:string
    | Emit_Envelope of path:string
    | Prove of path:string
    interface IArgParserTemplate with
        member s.Usage =
            match s with
            | Validate _ -> "Validate an invoice JSON file against GST rules."
            | Validate_Batch _ -> "Batch validate a directory of invoice JSON files, detecting duplicates and emitting exceptions.csv."
            | Emit_Summary _ -> "Emit the Summary JSON payload for the given invoice JSON file."
            | Emit_Envelope _ -> "Emit the Canonical VerdictEnvelope JSON for the given invoice JSON file."
            | Prove _ -> "Emit the VALIDATION_REPORT.md for the given invoice JSON file."

let tryReadInvoice path =
    try
        let jsonString = File.ReadAllText path
        let extra = Extra.empty |> Extra.withDecimal
        match Decode.Auto.fromString<RawInvoice>(jsonString, extra = extra) with
        | Ok invoice -> Ok (invoice, Hash.computeSha256 jsonString)
        | Error msg -> Error msg
    with e ->
        Error e.Message

let readInvoice path =
    match tryReadInvoice path with
    | Ok res -> res
    | Error msg ->
        printfn "Error reading or parsing file %s: %s" path msg
        Environment.Exit(1)
        failwith "unreachable"

[<EntryPoint>]
let main argv =
    let parser = ArgumentParser.Create<CliArguments>(programName = "gstflow")
    
    try
        let results = parser.ParseCommandLine(inputs = argv, raiseOnUsage = true)
        
        if results.Contains(Validate) then
            let path = results.GetResult(Validate)
            let (rawInvoice, hash) = readInvoice path
            let res = Compiler.compile rawInvoice hash
            
            match res.IR with
            | Some ir ->
                printfn "✅ Invoice %s validates successfully!" ir.Invoice.InvoiceNumber
                printfn "Supply Type: %A" ir.DerivedSupplyType
                printfn "Place of Supply: %s" ir.PlaceOfSupply
                printfn "Interstate: %b" ir.IsInterstate
                0
            | None ->
                printfn "❌ Validation Failed:"
                for v in res.Envelope.Results do
                    printfn "  [%s] %s" v.Metadata.RuleId v.Metadata.MessageKey
                1

        elif results.Contains(Validate_Batch) then
            let dir = results.GetResult(Validate_Batch)
            if not (Directory.Exists dir) then
                printfn "Error: Directory not found at %s" dir
                1
            else
                let files = Directory.GetFiles(dir, "*.json")
                let seenInvoices = System.Collections.Generic.HashSet<string>()
                let mutable exceptions = []
                
                for file in files do
                    match tryReadInvoice file with
                    | Ok (rawInvoice, hash) ->
                        let gstin = if isNull rawInvoice.Seller.Gstin then "" else rawInvoice.Seller.Gstin
                        let key = sprintf "%s|%s" gstin rawInvoice.InvoiceNumber
                        
                        if seenInvoices.Contains(key) then
                            let csvLine = sprintf "\"%s\",\"%s\",\"%s\",\"DUPLICATE_INVOICE\",\"Duplicate invoice detected\"" (Path.GetFileName file) rawInvoice.InvoiceNumber gstin
                            exceptions <- csvLine :: exceptions
                        else
                            seenInvoices.Add(key) |> ignore
                            let res = Compiler.compile rawInvoice hash
                            match res.IR with
                            | Some _ -> ()
                            | None ->
                                for v in res.Envelope.Results do
                                    if v.Outcome = Fail || v.Outcome = Unknown then
                                        let csvLine = sprintf "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"" (Path.GetFileName file) rawInvoice.InvoiceNumber gstin v.Metadata.RuleId v.Metadata.MessageKey
                                        exceptions <- csvLine :: exceptions
                    | Error msg ->
                        let escapedMsg = msg.Replace("\"", "\"\"")
                        let csvLine = sprintf "\"%s\",\"\",\"\",\"PARSE_ERROR\",\"%s\"" (Path.GetFileName file) escapedMsg
                        exceptions <- csvLine :: exceptions
                
                if exceptions.IsEmpty then
                    printfn "✅ Batch validation successful! All %d files passed." files.Length
                    0
                else
                    let csvPath = Path.Combine(dir, "exceptions.csv")
                    let header = "File,InvoiceNumber,SellerGSTIN,RuleId,MessageKey"
                    File.WriteAllLines(csvPath, header :: (List.rev exceptions))
                    printfn "❌ Batch validation failed with %d exceptions. See %s" exceptions.Length csvPath
                    1

        elif results.Contains(Emit_Summary) then
            let path = results.GetResult(Emit_Summary)
            let (rawInvoice, hash) = readInvoice path
            let res = Compiler.compile rawInvoice hash
            
            match res.IR with
            | Some ir ->
                let summary = Generators.emitSummaryJson ir
                printfn "%s" summary
                0
            | None ->
                printfn "Error: Cannot emit Summary for invalid invoice."
                for v in res.Envelope.Results do
                    printfn "  [%s] %s" v.Metadata.RuleId v.Metadata.MessageKey
                1

        elif results.Contains(Emit_Envelope) then
            let path = results.GetResult(Emit_Envelope)
            let (rawInvoice, hash) = readInvoice path
            let res = Compiler.compile rawInvoice hash
            let envelopeJson = CanonicalJson.serializeEnvelope res.Envelope
            printfn "%s" envelopeJson
            if res.Envelope.OverallOutcome = Fail then 1 else 0

        elif results.Contains(Prove) then
            let path = results.GetResult(Prove)
            let (rawInvoice, hash) = readInvoice path
            let res = Compiler.compile rawInvoice hash
            
            match res.IR with
            | Some ir ->
                let proof = Generators.emitValidationReport ir
                printfn "%s" proof
                0
            | None ->
                printfn "Error: Cannot emit VALIDATION REPORT for invalid invoice."
                for v in res.Envelope.Results do
                    printfn "  [%s] %s" v.Metadata.RuleId v.Metadata.MessageKey
                1
        else
            printfn "%s" (parser.PrintUsage())
            1
            
    with e ->
        printfn "%s" e.Message
        1


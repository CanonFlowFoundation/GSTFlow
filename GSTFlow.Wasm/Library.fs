module GSTFlow.Wasm.API
open CanonFlow.Core
open CanonFlow.Core.Verification

open Fable.Core
open Fable.Core.JsInterop
open Thoth.Json
open GSTFlow.Core
open GSTFlow.Rules
open GSTFlow.Emit

let compileInvoice (jsonString: string) : obj =
    let extra = Extra.empty |> Extra.withDecimal
    let decodeInvoice = Decode.Auto.fromString<RawInvoice>(jsonString, extra = extra)
    match decodeInvoice with
    | Ok rawInvoice ->
        let hash = Hash.computeSha256 jsonString
        let result = Compiler.compile rawInvoice hash
        match result.IR with
        | Some ir ->
            let summary = Generators.emitSummaryJson ir
            let proof = Generators.emitValidationReport ir
            {|
                success = true
                summary = summary
                proof = proof
                envelope = CanonicalJson.serializeEnvelope result.Envelope
                error = null
            |} |> box
        | None ->
            {|
                success = false
                summary = null
                proof = null
                envelope = CanonicalJson.serializeEnvelope result.Envelope
                error = "Validation failed"
            |} |> box
    | Error err ->
        {|
            success = false
            summary = null
            proof = null
            envelope = null
            error = err
        |} |> box

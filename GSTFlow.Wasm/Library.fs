module GSTFlow.Wasm.API

open GSTFlow.Core.Verification

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
        let hash = "hash_not_computed_in_wasm"
        let result = Compiler.compile rawInvoice hash
        
        let serializeEnv (env: VerdictEnvelope) = Encode.Auto.toString(0, env, extra = extra)
        
        match result.IR with
        | Some ir ->
            let summary = Generators.emitSummaryJson ir
            let proof = Generators.emitValidationReport ir
            {|
                success = true
                summary = summary
                proof = proof
                envelope = serializeEnv result.Envelope
                error = null
            |} |> box
        | None ->
            {|
                success = false
                summary = null
                proof = null
                envelope = serializeEnv result.Envelope
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

module GSTFlow.Wasm.API

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
        let result = Compiler.compile rawInvoice
        match result.IR with
        | Some ir ->
            let gstr1 = Generators.emitGstr1Json ir
            let proof = Generators.emitProofReport ir
            {|
                success = true
                gstr1 = gstr1
                proof = proof
                violations = result.Violations |> Array.ofList
                error = null
            |} |> box
        | None ->
            {|
                success = false
                gstr1 = null
                proof = null
                violations = result.Violations |> Array.ofList
                error = "Validation failed"
            |} |> box
    | Error err ->
        {|
            success = false
            gstr1 = null
            proof = null
            violations = [||]
            error = err
        |} |> box

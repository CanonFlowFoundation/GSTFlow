namespace GSTFlow.Emit

open System
#if FABLE_COMPILER
open Thoth.Json
#else
open Thoth.Json.Net
#endif
open GSTFlow.Core.Verification

module CanonicalJson =

    let encodeRuleOutcome (outcome: RuleOutcome) =
        match outcome with
#if FABLE_COMPILER
        | Pass -> Encode.string "PassFable"
#else
        | Pass -> Encode.string "PassCLI"
#endif
        | PassWithAssumptions -> Encode.string "PassWithAssumptions"
        | Warning -> Encode.string "Warning"
        | Unknown -> Encode.string "Unknown"
        | NotSupported -> Encode.string "NotSupported"
        | Fail -> Encode.string "Fail"

    let encodeEvidenceKind (kind: EvidenceKind) =
        match kind with
        | Observed -> Encode.string "Observed"
        | Parsed -> Encode.string "Parsed"
        | UserConfirmed -> Encode.string "UserConfirmed"
        | Derived -> Encode.string "Derived"
        | Assumed -> Encode.string "Assumed"
        | ExternalReference -> Encode.string "ExternalReference"

    let encodeEvidence (e: Evidence) =
        // Explicit null policy: emit null, no omission
        Encode.object [
            "Path", Encode.string e.Path
            "Kind", encodeEvidenceKind e.Kind
            "Value", (match e.Value with | Some v -> Encode.string v | None -> Encode.nil)
            "Provenance", (match e.Provenance with | Some p -> Encode.string p | None -> Encode.nil)
        ]

    let encodeRuleConfidence (c: RuleConfidence) =
        match c with
        | Exact -> Encode.string "Exact"
        | Approximate -> Encode.string "Approximate"
        | Advisory -> Encode.string "Advisory"

    let encodeRuleMetadata (m: RuleMetadata) =
        Encode.object [
            "RuleId", Encode.string m.RuleId
            "Category", Encode.string m.Category
            "EffectiveFrom", (match m.EffectiveFrom with | Some d -> Encode.string d | None -> Encode.nil)
            "EffectiveUntil", (match m.EffectiveUntil with | Some d -> Encode.string d | None -> Encode.nil)
            "Reference", (match m.Reference with | Some r -> Encode.string r | None -> Encode.nil)
            "Confidence", encodeRuleConfidence m.Confidence
            "MessageKey", Encode.string m.MessageKey
        ]

    let encodeRuleResult (r: RuleResult) =
        Encode.object [
            "Metadata", encodeRuleMetadata r.Metadata
            "Outcome", encodeRuleOutcome r.Outcome
            "Evidence", Encode.list (r.Evidence |> List.map encodeEvidence)
            "Parameters", Encode.dict (r.Parameters |> Map.map (fun _ v -> Encode.string v))
        ]

    let encodeVerdictEnvelope (env: VerdictEnvelope) =
        Encode.object [
            "SchemaVersion", Encode.string env.SchemaVersion
            "EngineId", Encode.string env.EngineId
            "EngineVersion", Encode.string env.EngineVersion
            "RuleSetId", Encode.string env.RuleSetId
            "RuleSetVersion", Encode.string env.RuleSetVersion
            "SubjectType", Encode.string env.SubjectType
            "SubjectHash", Encode.string env.SubjectHash
            "OverallOutcome", encodeRuleOutcome env.OverallOutcome
            "Results", Encode.list (env.Results |> List.map encodeRuleResult)
        ]

    let serializeEnvelope (env: VerdictEnvelope) =
        // H6: Canonical JSON - No locale, UTF-8, no whitespace variation.
        // We use 0 spaces (minified) for exact byte-for-byte canonical form.
        Encode.toString 0 (encodeVerdictEnvelope env)

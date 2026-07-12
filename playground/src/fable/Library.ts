
import { newGuid } from "./fable_modules/fable-library-ts.5.6.0/Guid.ts";
import { add } from "./fable_modules/fable-library-ts.5.6.0/Map.ts";
import { Auto_generateBoxedEncoder_437914C6, toString, decimal } from "./fable_modules/Thoth.Json.10.5.1/Encode.fs.js";
import { decimal as decimal_1 } from "./fable_modules/fable-library-ts.5.6.0/Decimal.ts";
import { Auto_generateBoxedDecoder_Z6670B51, fromString, decimal as decimal_2 } from "./fable_modules/Thoth.Json.10.5.1/Decode.fs.js";
import { FSharpResult$2_$union } from "./fable_modules/fable-library-ts.5.6.0/Result.ts";
import { ExtraCoders, ErrorReason_$union } from "./fable_modules/Thoth.Json.10.5.1/Types.fs.js";
import { empty } from "./fable_modules/Thoth.Json.10.5.1/Extra.fs.js";
import { defaultOf, uncurry2 } from "./fable_modules/fable-library-ts.5.6.0/Util.ts";
import { CompilationResult, Compiler_compile, RawInvoice, RawInvoice_$reflection } from "./GSTFlow.Rules/Library.ts";
import { int32 } from "./fable_modules/fable-library-ts.5.6.0/Int32.ts";
import { GSTCanonicalIR, Verification_VerdictEnvelope, Verification_VerdictEnvelope_$reflection } from "./GSTFlow.Core/Library.ts";
import { value as value_7, Option } from "./fable_modules/fable-library-ts.5.6.0/Option.ts";
import { emitValidationReport, emitSummaryJson } from "./GSTFlow.Emit/Library.ts";

export function compileInvoice(jsonString: string): any {
    let copyOfStruct: string = (undefined as any), summary_2: any = (undefined as any), proof_2: any = (undefined as any), summary_1: any = (undefined as any), proof_1: any = (undefined as any);
    const extra_3: ExtraCoders = new ExtraCoders((copyOfStruct = newGuid(), copyOfStruct), add<string, [((arg0: any) => any), ((arg0: string) => ((arg0: any) => FSharpResult$2_$union<any, [string, ErrorReason_$union]>))]>("System.Decimal", [decimal, (path: string): ((arg0: any) => FSharpResult$2_$union<decimal_1, [string, ErrorReason_$union]>) => ((value_1: any): FSharpResult$2_$union<decimal_1, [string, ErrorReason_$union]> => decimal_2(path, value_1))] as [((arg0: any) => any), ((arg0: string) => ((arg0: any) => FSharpResult$2_$union<any, [string, ErrorReason_$union]>))], empty.Coders));
    const decodeInvoice: FSharpResult$2_$union<RawInvoice, string> = fromString<RawInvoice>(uncurry2(Auto_generateBoxedDecoder_Z6670B51(RawInvoice_$reflection(), undefined, extra_3)), jsonString);
    if ((decodeInvoice.tag as int32) === /* Error */ 1) {
        const err = decodeInvoice.fields[0] as string;
        return (summary_2 = defaultOf(), (proof_2 = defaultOf(), {
            envelope: defaultOf(),
            error: err,
            proof: proof_2,
            success: false,
            summary: summary_2,
        }));
    }
    else {
        const result: CompilationResult = Compiler_compile(decodeInvoice.fields[0] as RawInvoice, "hash_not_computed_in_wasm");
        const serializeEnv = (env: Verification_VerdictEnvelope): string => toString(0, Auto_generateBoxedEncoder_437914C6(Verification_VerdictEnvelope_$reflection(), undefined, extra_3, undefined)(env));
        const matchValue: Option<GSTCanonicalIR> = result.IR;
        if (matchValue == null) {
            return (summary_1 = defaultOf(), (proof_1 = defaultOf(), {
                envelope: serializeEnv(result.Envelope),
                error: "Validation failed",
                proof: proof_1,
                success: false,
                summary: summary_1,
            }));
        }
        else {
            const ir: GSTCanonicalIR = value_7(matchValue);
            const summary: string = emitSummaryJson(ir);
            const proof: string = emitValidationReport(ir);
            return {
                envelope: serializeEnv(result.Envelope),
                error: defaultOf(),
                proof: proof,
                success: true,
                summary: summary,
            };
        }
    }
}


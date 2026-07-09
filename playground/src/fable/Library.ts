
import { decimal as decimal_2, Auto_generateBoxedDecoder_Z6670B51, fromString } from "./fable_modules/Thoth.Json.10.5.1/Decode.fs.js";
import { MutableArray, defaultOf, uncurry2 } from "./fable_modules/fable-library-ts.5.6.0/Util.ts";
import { RuleViolation, CompilationResult, Compiler_compile, RawInvoice, RawInvoice_$reflection } from "./GSTFlow.Rules/Library.ts";
import { newGuid } from "./fable_modules/fable-library-ts.5.6.0/Guid.ts";
import { add } from "./fable_modules/fable-library-ts.5.6.0/Map.ts";
import { decimal } from "./fable_modules/Thoth.Json.10.5.1/Encode.fs.js";
import { decimal as decimal_1 } from "./fable_modules/fable-library-ts.5.6.0/Decimal.ts";
import { FSharpResult$2_$union } from "./fable_modules/fable-library-ts.5.6.0/Result.ts";
import { ExtraCoders, ErrorReason_$union } from "./fable_modules/Thoth.Json.10.5.1/Types.fs.js";
import { empty } from "./fable_modules/Thoth.Json.10.5.1/Extra.fs.js";
import { int32 } from "./fable_modules/fable-library-ts.5.6.0/Int32.ts";
import { value as value_6, Option } from "./fable_modules/fable-library-ts.5.6.0/Option.ts";
import { GSTCanonicalIR } from "./GSTFlow.Core/Library.ts";
import { toArray } from "./fable_modules/fable-library-ts.5.6.0/List.ts";
import { emitProofReport, emitGstr1Json } from "./GSTFlow.Emit/Library.ts";

export function compileInvoice(jsonString: string): any {
    let copyOfStruct: string = (undefined as any), violations: MutableArray<RuleViolation> = (undefined as any);
    const decodeInvoice: FSharpResult$2_$union<RawInvoice, string> = fromString<RawInvoice>(uncurry2(Auto_generateBoxedDecoder_Z6670B51(RawInvoice_$reflection(), undefined, new ExtraCoders((copyOfStruct = newGuid(), copyOfStruct), add<string, [((arg0: any) => any), ((arg0: string) => ((arg0: any) => FSharpResult$2_$union<any, [string, ErrorReason_$union]>))]>("System.Decimal", [decimal, (path: string): ((arg0: any) => FSharpResult$2_$union<decimal_1, [string, ErrorReason_$union]>) => ((value_1: any): FSharpResult$2_$union<decimal_1, [string, ErrorReason_$union]> => decimal_2(path, value_1))] as [((arg0: any) => any), ((arg0: string) => ((arg0: any) => FSharpResult$2_$union<any, [string, ErrorReason_$union]>))], empty.Coders)))), jsonString);
    if ((decodeInvoice.tag as int32) === /* Error */ 1) {
        return {
            error: decodeInvoice.fields[0] as string,
            gstr1: defaultOf(),
            proof: defaultOf(),
            success: false,
            violations: [],
        };
    }
    else {
        const result: CompilationResult = Compiler_compile(decodeInvoice.fields[0] as RawInvoice);
        const matchValue: Option<GSTCanonicalIR> = result.IR;
        if (matchValue == null) {
            return {
                error: "Validation failed",
                gstr1: defaultOf(),
                proof: defaultOf(),
                success: false,
                violations: toArray<RuleViolation>(result.Violations),
            };
        }
        else {
            const ir: GSTCanonicalIR = value_6(matchValue);
            const gstr1: string = emitGstr1Json(ir);
            const proof: string = emitProofReport(ir);
            return (violations = toArray<RuleViolation>(result.Violations), {
                error: defaultOf(),
                gstr1: gstr1,
                proof: proof,
                success: true,
                violations: violations,
            });
        }
    }
}


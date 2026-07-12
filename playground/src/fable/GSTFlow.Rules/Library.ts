
import { Record } from "../fable_modules/fable-library-ts.5.6.0/Types.ts";
import { value, Option } from "../fable_modules/fable-library-ts.5.6.0/Option.ts";
import { compare as compare_1, equals, Exception, IDisposable, disposeSafe, IEnumerator, getEnumerator, comparePrimitives, IComparable, IEquatable } from "../fable_modules/fable-library-ts.5.6.0/Util.ts";
import { list_type, decimal_type, record_type, option_type, bool_type, string_type, TypeInfo } from "../fable_modules/fable-library-ts.5.6.0/Reflection.ts";
import { op_Modulus, equals as equals_1, op_Addition, op_Subtraction, abs, op_Division, op_Multiply, round, compare, fromParts, decimal } from "../fable_modules/fable-library-ts.5.6.0/Decimal.ts";
import Decimal from "../fable_modules/fable-library-ts.5.6.0/Decimal.ts";
import { Invoice, InvoiceItem, Verification_RuleOutcome_Pass, SupplyType_$union, SupplyType_B2C, SupplyType_B2B, GSTINModule_value, DocumentType$_INV, DocumentType$_DBN, DocumentType$_CRN, DocumentType$_$union, Party, GSTIN, GSTINModule_create, Verification_RuleOutcome_Unknown, Verification_RuleOutcome_Warning, Verification_RuleOutcome_Fail, Verification_RuleOutcome_$union, Verification_RuleResult, Verification_Evidence, Verification_EvidenceKind_Derived, Verification_RuleMetadata, Verification_RuleConfidence_Exact, Verification_VerdictEnvelope_$reflection, GSTCanonicalIR_$reflection, Verification_VerdictEnvelope, GSTCanonicalIR, TaxAmount_$reflection, TaxAmount } from "../GSTFlow.Core/Library.ts";
import { map as map_1, max, sumBy, collect, length, isEmpty, cons, empty as empty_1, exists, ofArray, append, singleton, FSharpList } from "../fable_modules/fable-library-ts.5.6.0/List.ts";
import { empty } from "../fable_modules/fable-library-ts.5.6.0/Map.ts";
import { int32 } from "../fable_modules/fable-library-ts.5.6.0/Int32.ts";
import { FSharpSet__Contains, FSharpSet, ofList } from "../fable_modules/fable-library-ts.5.6.0/Set.ts";
import { map, delay, toList } from "../fable_modules/fable-library-ts.5.6.0/Seq.ts";
import { isNullOrWhiteSpace, substring, printf, toText } from "../fable_modules/fable-library-ts.5.6.0/String.ts";
import { rangeDouble } from "../fable_modules/fable-library-ts.5.6.0/Range.ts";
import { isMatch } from "../fable_modules/fable-library-ts.5.6.0/RegExp.ts";
import { FSharpResult$2_Ok, FSharpResult$2_Error$, FSharpResult$2_$union } from "../fable_modules/fable-library-ts.5.6.0/Result.ts";

export class RawParty extends Record implements IEquatable<RawParty>, IComparable<RawParty> {
    readonly Gstin: string;
    readonly StateCode: string;
    readonly IsSez: Option<boolean>;
    constructor(Gstin: string, StateCode: string, IsSez: Option<boolean>) {
        super();
        this.Gstin = Gstin;
        this.StateCode = StateCode;
        this.IsSez = IsSez;
    }
}

export function RawParty_$reflection(): TypeInfo {
    return record_type("GSTFlow.Rules.RawParty", [], RawParty, () => [["Gstin", string_type], ["StateCode", string_type], ["IsSez", option_type(bool_type)]]);
}

export class RawInvoiceItem extends Record implements IEquatable<RawInvoiceItem>, IComparable<RawInvoiceItem> {
    readonly Hsn: string;
    readonly TaxableValue: decimal;
    readonly GstRate: decimal;
    readonly CessRate: Option<decimal>;
    readonly Tax: TaxAmount;
    constructor(Hsn: string, TaxableValue: decimal, GstRate: decimal, CessRate: Option<decimal>, Tax: TaxAmount) {
        super();
        this.Hsn = Hsn;
        this.TaxableValue = TaxableValue;
        this.GstRate = GstRate;
        this.CessRate = CessRate;
        this.Tax = Tax;
    }
}

export function RawInvoiceItem_$reflection(): TypeInfo {
    return record_type("GSTFlow.Rules.RawInvoiceItem", [], RawInvoiceItem, () => [["Hsn", string_type], ["TaxableValue", decimal_type], ["GstRate", decimal_type], ["CessRate", option_type(decimal_type)], ["Tax", TaxAmount_$reflection()]]);
}

export class RawInvoice extends Record implements IEquatable<RawInvoice>, IComparable<RawInvoice> {
    readonly DocumentType: Option<string>;
    readonly InvoiceNumber: string;
    readonly InvoiceDate: string;
    readonly PlaceOfSupply: Option<string>;
    readonly OriginalInvoiceNumber: Option<string>;
    readonly OriginalInvoiceDate: Option<string>;
    readonly Irn: Option<string>;
    readonly ReverseCharge: Option<string>;
    readonly Seller: RawParty;
    readonly Buyer: Option<RawParty>;
    readonly Items: FSharpList<RawInvoiceItem>;
    constructor(DocumentType$: Option<string>, InvoiceNumber: string, InvoiceDate: string, PlaceOfSupply: Option<string>, OriginalInvoiceNumber: Option<string>, OriginalInvoiceDate: Option<string>, Irn: Option<string>, ReverseCharge: Option<string>, Seller: RawParty, Buyer: Option<RawParty>, Items: FSharpList<RawInvoiceItem>) {
        super();
        this.DocumentType = DocumentType$;
        this.InvoiceNumber = InvoiceNumber;
        this.InvoiceDate = InvoiceDate;
        this.PlaceOfSupply = PlaceOfSupply;
        this.OriginalInvoiceNumber = OriginalInvoiceNumber;
        this.OriginalInvoiceDate = OriginalInvoiceDate;
        this.Irn = Irn;
        this.ReverseCharge = ReverseCharge;
        this.Seller = Seller;
        this.Buyer = Buyer;
        this.Items = Items;
    }
}

export function RawInvoice_$reflection(): TypeInfo {
    return record_type("GSTFlow.Rules.RawInvoice", [], RawInvoice, () => [["DocumentType", option_type(string_type)], ["InvoiceNumber", string_type], ["InvoiceDate", string_type], ["PlaceOfSupply", option_type(string_type)], ["OriginalInvoiceNumber", option_type(string_type)], ["OriginalInvoiceDate", option_type(string_type)], ["Irn", option_type(string_type)], ["ReverseCharge", option_type(string_type)], ["Seller", RawParty_$reflection()], ["Buyer", option_type(RawParty_$reflection())], ["Items", list_type(RawInvoiceItem_$reflection())]]);
}

export class CompilationResult extends Record implements IEquatable<CompilationResult>, IComparable<CompilationResult> {
    readonly IR: Option<GSTCanonicalIR>;
    readonly Envelope: Verification_VerdictEnvelope;
    constructor(IR: Option<GSTCanonicalIR>, Envelope: Verification_VerdictEnvelope) {
        super();
        this.IR = IR;
        this.Envelope = Envelope;
    }
}

export function CompilationResult_$reflection(): TypeInfo {
    return record_type("GSTFlow.Rules.CompilationResult", [], CompilationResult, () => [["IR", option_type(GSTCanonicalIR_$reflection())], ["Envelope", Verification_VerdictEnvelope_$reflection()]]);
}

function Compiler_createRule<$a>(outcome: Verification_RuleOutcome_$union, id: string, _arg: $a): Verification_RuleResult {
    return new Verification_RuleResult(new Verification_RuleMetadata(id, "GST", undefined, undefined, undefined, Verification_RuleConfidence_Exact(), id), outcome, singleton(new Verification_Evidence("", Verification_EvidenceKind_Derived(), undefined, "Compiler")), empty<string, string>({
        Compare: (x: string, y: string): int32 => (comparePrimitives(x, y) | 0),
    }));
}

const Compiler_failRule = (id: string): ((arg0: string) => Verification_RuleResult) => ((arg20$0040: string): Verification_RuleResult => Compiler_createRule<string>(Verification_RuleOutcome_Fail(), id, arg20$0040));

const Compiler_warnRule = (id: string): ((arg0: string) => Verification_RuleResult) => ((arg20$0040: string): Verification_RuleResult => Compiler_createRule<string>(Verification_RuleOutcome_Warning(), id, arg20$0040));

const Compiler_unknownRule = (id: string): ((arg0: string) => Verification_RuleResult) => ((arg20$0040: string): Verification_RuleResult => Compiler_createRule<string>(Verification_RuleOutcome_Unknown(), id, arg20$0040));

export const Compiler_validStateCodes: FSharpSet<string> = ofList<string>(append(toList<string>(delay<string>((): Iterable<string> => map<int32, string>((i: int32): string => toText(printf("%02d"))(i), rangeDouble(1, 1, 38)))), ofArray(["97", "99"])), {
    Compare: (x: string, y: string): int32 => (comparePrimitives(x, y) | 0),
});

export const Compiler_validRateSlabs: FSharpSet<decimal> = ofList<decimal>(ofArray([fromParts(0, 0, 0, false, 0), fromParts(1, 0, 0, false, 1), fromParts(25, 0, 0, false, 2), fromParts(15, 0, 0, false, 1), fromParts(3, 0, 0, false, 0), fromParts(5, 0, 0, false, 0), fromParts(12, 0, 0, false, 0), fromParts(18, 0, 0, false, 0), fromParts(28, 0, 0, false, 0)]), {
    Compare: (x: decimal, y: decimal): int32 => (compare(x, y) | 0),
});

export function Compiler_isValidHsn(hsn: string): boolean {
    return isMatch(/^(\d{4}|\d{6}|\d{8})$/gu, hsn);
}

function Compiler_validateParty(role: string, raw: RawParty): FSharpResult$2_$union<Party, Verification_RuleResult> {
    let arg_2: string = (undefined as any), matchValue_1: Option<boolean> = (undefined as any);
    const matchValue: FSharpResult$2_$union<GSTIN, string> = GSTINModule_create(raw.Gstin);
    if ((matchValue.tag as int32) === /* Error */ 1) {
        const e = matchValue.fields[0] as string;
        return FSharpResult$2_Error$<Party, Verification_RuleResult>(Compiler_failRule("GSTIN_FORMAT")(toText(printf("%s GSTIN \'%s\' is invalid: %s"))(role)(raw.Gstin)(e)));
    }
    else {
        const g = matchValue.fields[0] as GSTIN;
        if (substring(raw.Gstin, 0, 2) !== raw.StateCode) {
            return FSharpResult$2_Error$<Party, Verification_RuleResult>(Compiler_failRule("GSTIN_STATE_MATCH")((arg_2 = substring(raw.Gstin, 0, 2), toText(printf("%s StateCode \'%s\' does not match GSTIN prefix \'%s\'"))(role)(raw.StateCode)(arg_2))));
        }
        else {
            return FSharpResult$2_Ok<Party, Verification_RuleResult>(new Party(g, raw.StateCode, (matchValue_1 = raw.IsSez, (matchValue_1 == null) ? false : value(matchValue_1))));
        }
    }
}

function Compiler_isRcmHsn(hsn: string): boolean {
    return exists<string>((p: string): boolean => hsn.startsWith(p), ofArray(["9965", "9967", "9973", "9982", "9983", "9985"]));
}

function Compiler_validateItem(isInterstate: boolean, isDocumentRcm: boolean, item: RawInvoiceItem): FSharpList<Verification_RuleResult> {
    let matchValue: Option<decimal> = undefined as any;
    let violations: FSharpList<Verification_RuleResult> = empty_1<Verification_RuleResult>();
    if (!Compiler_isValidHsn(item.Hsn)) {
        violations = cons(Compiler_failRule("HSN_FORMAT")(toText(printf("HSN \'%s\' must be exactly 4, 6, or 8 digits"))(item.Hsn)), violations);
    }
    if (!FSharpSet__Contains(Compiler_validRateSlabs, item.GstRate)) {
        violations = cons(Compiler_failRule("RATE_SLAB")(toText(printf("GST Rate %M is not a valid Indian slab (0, 0.1, 0.25, 1.5, 3, 5, 12, 18, 28)"))(item.GstRate)), violations);
    }
    const expectedTax: decimal = round(op_Multiply(item.TaxableValue, op_Division(item.GstRate, fromParts(100, 0, 0, false, 0))), 2);
    if (isDocumentRcm) {
        if ((((compare(item.Tax.Igst, fromParts(0, 0, 0, false, 0)) > 0) ? true : (compare(item.Tax.Cgst, fromParts(0, 0, 0, false, 0)) > 0)) ? true : (compare(item.Tax.Sgst, fromParts(0, 0, 0, false, 0)) > 0)) ? true : ((matchValue = item.Tax.Cess, (matchValue == null) ? false : (compare(value(matchValue), fromParts(0, 0, 0, false, 0)) > 0)))) {
            violations = cons(Compiler_failRule("RCM_TAX_CHARGED")("Invoice is marked for Reverse Charge (RCM). Seller cannot collect tax; tax amounts must be 0."), violations);
        }
    }
    else {
        if (Compiler_isRcmHsn(item.Hsn)) {
            violations = cons(Compiler_failRule("RCM_LAW")(toText(printf("HSN \'%s\' falls under mandatory Reverse Charge. The invoice must mark ReverseCharge=Y and tax amounts must be 0."))(item.Hsn)), violations);
        }
        if (isInterstate) {
            if ((compare(item.Tax.Cgst, fromParts(0, 0, 0, false, 0)) > 0) ? true : (compare(item.Tax.Sgst, fromParts(0, 0, 0, false, 0)) > 0)) {
                violations = cons(Compiler_failRule("IGST_CGST_LAW")("Interstate supply cannot have CGST or SGST"), violations);
            }
            if (compare(abs(op_Subtraction(item.Tax.Igst, expectedTax)), fromParts(5, 0, 0, false, 1)) > 0) {
                violations = cons(Compiler_failRule("TAX_AMOUNT")(toText(printf("Expected IGST approx %M but got %M (failed Sec 170 / item math)"))(expectedTax)(item.Tax.Igst)), violations);
            }
        }
        else {
            if (compare(item.Tax.Igst, fromParts(0, 0, 0, false, 0)) > 0) {
                violations = cons(Compiler_failRule("IGST_CGST_LAW")("Intrastate supply cannot have IGST"), violations);
            }
            const expectedSplit: decimal = round(op_Division(expectedTax, fromParts(2, 0, 0, false, 0)), 2);
            if ((compare(abs(op_Subtraction(item.Tax.Cgst, expectedSplit)), fromParts(5, 0, 0, false, 1)) > 0) ? true : (compare(abs(op_Subtraction(item.Tax.Sgst, expectedSplit)), fromParts(5, 0, 0, false, 1)) > 0)) {
                violations = cons(Compiler_failRule("TAX_AMOUNT")(toText(printf("Expected CGST/SGST approx %M but got C:%M S:%M"))(expectedSplit)(item.Tax.Cgst)(item.Tax.Sgst)), violations);
            }
        }
    }
    const matchValue_1: Option<decimal> = item.CessRate;
    const matchValue_2: Option<decimal> = item.Tax.Cess;
    let matchResult: int32 = (undefined as any), crate: decimal = (undefined as any), cval_1: decimal = (undefined as any), cval_2: decimal = (undefined as any);
    if (matchValue_1 == null) {
        if (matchValue_2 != null) {
            if (compare(value(matchValue_2), fromParts(0, 0, 0, false, 0)) > 0) {
                matchResult = 1;
                cval_2 = value(matchValue_2);
            }
            else {
                matchResult = 3;
            }
        }
        else {
            matchResult = 3;
        }
    }
    else if (matchValue_2 == null) {
        matchResult = 2;
    }
    else {
        matchResult = 0;
        crate = value(matchValue_1);
        cval_1 = value(matchValue_2);
    }
    switch (matchResult) {
        case 0: {
            if (!isDocumentRcm) {
                const expectedCess: decimal = round(op_Multiply(item.TaxableValue, op_Division(crate!, fromParts(100, 0, 0, false, 0))), 2);
                if (compare(abs(op_Subtraction(cval_1!, expectedCess)), fromParts(5, 0, 0, false, 1)) > 0) {
                    violations = cons(Compiler_failRule("CESS_ARITHMETIC")(toText(printf("Expected Cess approx %M but got %M"))(expectedCess)(cval_1!)), violations);
                }
            }
            break;
        }
        case 1: {
            if (!isDocumentRcm) {
                violations = cons(Compiler_failRule("CESS_ARITHMETIC")("Cess amount provided but no CessRate specified"), violations);
            }
            break;
        }
        case 2: {
            if (!isDocumentRcm) {
                violations = cons(Compiler_failRule("CESS_ARITHMETIC")("CessRate provided but no Cess amount specified"), violations);
            }
            break;
        }
    }
    return violations;
}

export function Compiler_compile(raw: RawInvoice, hash: string): CompilationResult {
    let matchValue_3: FSharpResult$2_$union<GSTIN, string> = (undefined as any), copyOfStruct: FSharpResult$2_$union<Party, Verification_RuleResult> = (undefined as any), b_3: Party = (undefined as any), b_8: Party = (undefined as any);
    let violations: FSharpList<Verification_RuleResult> = empty_1<Verification_RuleResult>();
    if (isNullOrWhiteSpace(raw.InvoiceNumber)) {
        violations = cons(Compiler_failRule("INV_SANITY_NO")("InvoiceNumber cannot be empty"), violations);
    }
    if (isNullOrWhiteSpace(raw.InvoiceDate)) {
        violations = cons(Compiler_failRule("INV_SANITY_DATE")("InvoiceDate cannot be empty"), violations);
    }
    if (isEmpty(raw.Items)) {
        violations = cons(Compiler_failRule("INV_SANITY_ITEMS")("Invoice must contain at least one item"), violations);
    }
    const enumerator: IEnumerator<RawInvoiceItem> = getEnumerator(raw.Items);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const item: RawInvoiceItem = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            if (compare(item.TaxableValue, fromParts(0, 0, 0, false, 0)) < 0) {
                violations = cons(Compiler_failRule("INV_SANITY_TAXABLE")("Item TaxableValue cannot be negative"), violations);
            }
            if (compare(item.GstRate, fromParts(0, 0, 0, false, 0)) < 0) {
                violations = cons(Compiler_failRule("INV_SANITY_RATE")("Item GstRate cannot be negative"), violations);
            }
        }
    }
    finally {
        disposeSafe(enumerator as IDisposable);
    }
    const sellerRes: FSharpResult$2_$union<Party, Verification_RuleResult> = Compiler_validateParty("Seller", raw.Seller);
    if ((sellerRes.tag as int32) === /* Error */ 1) {
        const e = sellerRes.fields[0] as Verification_RuleResult;
        violations = cons(e, violations);
    }
    let docType: DocumentType$_$union;
    const matchValue: Option<string> = raw.DocumentType;
    let matchResult: int32 = (undefined as any), other: string = (undefined as any);
    if (matchValue == null) {
        matchResult = 2;
    }
    else {
        switch (value(matchValue)) {
            case "CRN": {
                matchResult = 0;
                break;
            }
            case "DBN": {
                matchResult = 1;
                break;
            }
            case "INV": {
                matchResult = 2;
                break;
            }
            default: {
                matchResult = 3;
                other = value(matchValue);
            }
        }
    }
    switch (matchResult) {
        case 0: {
            docType = DocumentType$_CRN();
            break;
        }
        case 1: {
            docType = DocumentType$_DBN();
            break;
        }
        case 2: {
            docType = DocumentType$_INV();
            break;
        }
        default: {
            violations = cons(Compiler_failRule("DOC_TYPE")(toText(printf("Invalid DocumentType \'%s\'"))(other!)), violations);
            docType = DocumentType$_INV();
        }
    }
    switch (docType.tag) {
        case /* INV */ 0: {
            break;
        }
        default:
            if ((raw.OriginalInvoiceNumber == null) ? true : (raw.OriginalInvoiceDate == null)) {
                violations = cons(Compiler_failRule("CDN_ORIGINAL_INV")("Credit/Debit Notes require OriginalInvoiceNumber and OriginalInvoiceDate"), violations);
            }
    }
    const matchValue_1: Option<string> = raw.Irn;
    if (matchValue_1 == null) {
    }
    else {
        const irn: string = value(matchValue_1);
        if ((irn.length !== 64) ? true : !isMatch(/^[a-fA-F0-9]{64}$/gu, irn)) {
            violations = cons(Compiler_failRule("IRN_FORMAT")("IRN must be exactly 64 hexadecimal characters"), violations);
        }
    }
    let buyerRes: Option<FSharpResult$2_$union<Party, Verification_RuleResult>>;
    const matchValue_2: Option<RawParty> = raw.Buyer;
    if (matchValue_2 == null) {
        buyerRes = undefined;
    }
    else if (isNullOrWhiteSpace(value(matchValue_2).Gstin)) {
        const b_1: RawParty = value(matchValue_2);
        if (!FSharpSet__Contains(Compiler_validStateCodes, b_1.StateCode)) {
            const err: Verification_RuleResult = Compiler_failRule("STATE_CODE")(toText(printf("Buyer State Code \'%s\' is not in the valid vocabulary (01-38, 97, 99)"))(b_1.StateCode));
            violations = cons(err, violations);
            buyerRes = FSharpResult$2_Error$<Party, Verification_RuleResult>(err);
        }
        else {
            buyerRes = FSharpResult$2_Ok<Party, Verification_RuleResult>(new Party((matchValue_3 = GSTINModule_create("URP"), ((matchValue_3.tag as int32) === /* Ok */ 0) ? (matchValue_3.fields[0] as GSTIN) : (() => {
                throw new Exception("URP");
            })()), b_1.StateCode, false));
        }
    }
    else {
        const b_2: RawParty = value(matchValue_2);
        const matchValue_4: FSharpResult$2_$union<Party, Verification_RuleResult> = Compiler_validateParty("Buyer", b_2);
        if ((matchValue_4.tag as int32) === /* Error */ 1) {
            const e_1 = matchValue_4.fields[0] as Verification_RuleResult;
            violations = cons(e_1, violations);
            buyerRes = FSharpResult$2_Error$<Party, Verification_RuleResult>(e_1);
        }
        else {
            buyerRes = FSharpResult$2_Ok<Party, Verification_RuleResult>(matchValue_4.fields[0] as Party);
        }
    }
    if ((length(violations) > 0) && exists<Verification_RuleResult>((v: Verification_RuleResult): boolean => equals(v.Outcome, Verification_RuleOutcome_Fail()), violations)) {
        return new CompilationResult(undefined, new Verification_VerdictEnvelope("1.0", "gstflow", "1.0.0", "gstflow-rules", "2026.07.10", "gst-invoice", hash, violations, Verification_RuleOutcome_Fail()));
    }
    else {
        let seller: Party;
        if ((sellerRes.tag as int32) === /* Ok */ 0) {
            seller = (sellerRes.fields[0] as Party);
        }
        else {
            throw new Exception("unreachable");
        }
        const buyer: Option<Party> = (buyerRes != null) ? ((copyOfStruct = value(buyerRes), ((copyOfStruct.tag as int32) === /* Ok */ 0) ? ((b_3 = (copyOfStruct.fields[0] as Party), b_3)) : undefined)) : undefined;
        let pos: string;
        const matchValue_5: Option<string> = raw.PlaceOfSupply;
        if (matchValue_5 == null) {
            let matchResult_1: int32 = (undefined as any), b_5: Party = (undefined as any);
            if (buyer != null) {
                if (GSTINModule_value(value(buyer).Gstin) !== "URP") {
                    matchResult_1 = 0;
                    b_5 = value(buyer);
                }
                else {
                    matchResult_1 = 1;
                }
            }
            else {
                matchResult_1 = 1;
            }
            switch (matchResult_1) {
                case 0: {
                    pos = b_5!.StateCode;
                    break;
                }
                default: {
                    violations = cons(Compiler_unknownRule("PLACE_OF_SUPPLY_UNKNOWN")("Place of supply cannot be safely derived for unregistered buyer without explicit POS"), violations);
                    pos = "UNKNOWN";
                }
            }
        }
        else if (FSharpSet__Contains(Compiler_validStateCodes, value(matchValue_5))) {
            const p_1: string = value(matchValue_5);
            pos = p_1;
        }
        else {
            const p_2: string = value(matchValue_5);
            violations = cons(Compiler_failRule("PLACE_OF_SUPPLY")(toText(printf("Invalid PlaceOfSupply \'%s\'"))(p_2)), violations);
            pos = p_2;
        }
        const isInterstate: boolean = ((seller.StateCode !== pos) ? true : seller.IsSez) ? true : ((buyer == null) ? false : value(buyer).IsSez);
        let isDocumentRcm: boolean;
        const matchValue_6: Option<string> = raw.ReverseCharge;
        if (matchValue_6 == null) {
            let matchResult_2: int32 = undefined as any;
            if (buyer != null) {
                if (GSTINModule_value(seller.Gstin) === "URP") {
                    matchResult_2 = 0;
                }
                else {
                    matchResult_2 = 1;
                }
            }
            else {
                matchResult_2 = 1;
            }
            switch (matchResult_2) {
                case 0: {
                    isDocumentRcm = true;
                    break;
                }
                default:
                    isDocumentRcm = false;
            }
        }
        else {
            const rc: string = value(matchValue_6);
            isDocumentRcm = ((rc.toUpperCase() === "Y") ? true : (rc.toUpperCase() === "TRUE"));
        }
        const supplyType: SupplyType_$union = (buyer != null) ? ((GSTINModule_value(value(buyer).Gstin) !== "URP") ? ((b_8 = value(buyer), SupplyType_B2B())) : SupplyType_B2C()) : SupplyType_B2C();
        const itemViolations: FSharpList<Verification_RuleResult> = collect<RawInvoiceItem, Verification_RuleResult>((item_1: RawInvoiceItem): FSharpList<Verification_RuleResult> => Compiler_validateItem(isInterstate, isDocumentRcm, item_1), raw.Items);
        violations = append(itemViolations, violations);
        const totalIgst: decimal = sumBy<RawInvoiceItem, decimal>((i: RawInvoiceItem): decimal => i.Tax.Igst, raw.Items, {
            GetZero: (): decimal => (new Decimal("0")),
            Add: op_Addition,
        });
        const totalCgst: decimal = sumBy<RawInvoiceItem, decimal>((i_1: RawInvoiceItem): decimal => i_1.Tax.Cgst, raw.Items, {
            GetZero: (): decimal => (new Decimal("0")),
            Add: op_Addition,
        });
        const totalSgst: decimal = sumBy<RawInvoiceItem, decimal>((i_2: RawInvoiceItem): decimal => i_2.Tax.Sgst, raw.Items, {
            GetZero: (): decimal => (new Decimal("0")),
            Add: op_Addition,
        });
        const totalCess: decimal = sumBy<RawInvoiceItem, decimal>((i_3: RawInvoiceItem): decimal => {
            const matchValue_7: Option<decimal> = i_3.Tax.Cess;
            if (matchValue_7 == null) {
                return fromParts(0, 0, 0, false, 0);
            }
            else {
                return value(matchValue_7);
            }
        }, raw.Items, {
            GetZero: (): decimal => (new Decimal("0")),
            Add: op_Addition,
        });
        if (!equals_1(op_Modulus(op_Addition(op_Addition(op_Addition(op_Addition(sumBy<RawInvoiceItem, decimal>((i_4: RawInvoiceItem): decimal => i_4.TaxableValue, raw.Items, {
            GetZero: (): decimal => (new Decimal("0")),
            Add: op_Addition,
        }), totalIgst), totalCgst), totalSgst), totalCess), fromParts(1, 0, 0, false, 0)), fromParts(0, 0, 0, false, 0))) {
            violations = cons(Compiler_warnRule("SEC_170_ROUNDING")("Section 170 CGST Act: Final invoice total must be rounded off to the nearest Rupee. Note: Telecom operators often ignore this."), violations);
        }
        const envelope: Verification_VerdictEnvelope = new Verification_VerdictEnvelope("1.0", "gstflow", "1.0.0", "gstflow-rules", "2026.07.10", "gst-invoice", hash, violations, isEmpty(violations) ? Verification_RuleOutcome_Pass() : max<Verification_RuleOutcome_$union>(map_1<Verification_RuleResult, Verification_RuleOutcome_$union>((v_1: Verification_RuleResult): Verification_RuleOutcome_$union => v_1.Outcome, violations), {
            Compare: (x_5: Verification_RuleOutcome_$union, y_5: Verification_RuleOutcome_$union): int32 => (compare_1(x_5, y_5) | 0),
        }));
        if (exists<Verification_RuleResult>((v_2: Verification_RuleResult): boolean => equals(v_2.Outcome, Verification_RuleOutcome_Fail()), violations)) {
            return new CompilationResult(undefined, envelope);
        }
        else {
            return new CompilationResult(new GSTCanonicalIR(new Invoice(docType, raw.InvoiceNumber, raw.InvoiceDate, raw.OriginalInvoiceNumber, raw.OriginalInvoiceDate, raw.Irn, isDocumentRcm, seller, buyer, map_1<RawInvoiceItem, InvoiceItem>((i_5: RawInvoiceItem): InvoiceItem => (new InvoiceItem(i_5.Hsn, i_5.TaxableValue, i_5.GstRate, i_5.CessRate, i_5.Tax)), raw.Items)), supplyType, pos, isInterstate), envelope);
        }
    }
}


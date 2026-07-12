
import { Record, Union } from "../fable_modules/fable-library-ts.5.6.0/Types.ts";
import { decimal_type, bool_type, class_type, list_type, record_type, option_type, string_type, union_type, TypeInfo } from "../fable_modules/fable-library-ts.5.6.0/Reflection.ts";
import { Option } from "../fable_modules/fable-library-ts.5.6.0/Option.ts";
import { Exception, IComparable, IEquatable } from "../fable_modules/fable-library-ts.5.6.0/Util.ts";
import { FSharpList } from "../fable_modules/fable-library-ts.5.6.0/List.ts";
import { FSharpMap } from "../fable_modules/fable-library-ts.5.6.0/Map.ts";
import { isLetter, isDigit } from "../fable_modules/fable-library-ts.5.6.0/Char.ts";
import { int32 } from "../fable_modules/fable-library-ts.5.6.0/Int32.ts";
import { mapIndexed, sum as sum_1 } from "../fable_modules/fable-library-ts.5.6.0/Array.ts";
import { substring } from "../fable_modules/fable-library-ts.5.6.0/String.ts";
import { create, isMatch } from "../fable_modules/fable-library-ts.5.6.0/RegExp.ts";
import { FSharpResult$2_$union, FSharpResult$2_Error$, FSharpResult$2_Ok } from "../fable_modules/fable-library-ts.5.6.0/Result.ts";
import { decimal } from "../fable_modules/fable-library-ts.5.6.0/Decimal.ts";

export type Verification_RuleConfidence_$union = 
    | Verification_RuleConfidence<0>
    | Verification_RuleConfidence<1>
    | Verification_RuleConfidence<2>

export type Verification_RuleConfidence_$cases = {
    0: ["Exact", []],
    1: ["Derived", []],
    2: ["Guessed", []]
}

export function Verification_RuleConfidence_Exact() {
    return new Verification_RuleConfidence<0>(0, []);
}

export function Verification_RuleConfidence_Derived() {
    return new Verification_RuleConfidence<1>(1, []);
}

export function Verification_RuleConfidence_Guessed() {
    return new Verification_RuleConfidence<2>(2, []);
}

export class Verification_RuleConfidence<Tag extends keyof Verification_RuleConfidence_$cases> extends Union<Tag, Verification_RuleConfidence_$cases[Tag][0]> {
    constructor(tag: Tag, fields: Verification_RuleConfidence_$cases[Tag][1]) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    readonly tag: Tag;
    readonly fields: Verification_RuleConfidence_$cases[Tag][1];
    cases() {
        return ["Exact", "Derived", "Guessed"];
    }
}

export function Verification_RuleConfidence_$reflection(): TypeInfo {
    return union_type("GSTFlow.Core.Verification.RuleConfidence", [], Verification_RuleConfidence, () => [[], [], []]);
}

export type Verification_RuleOutcome_$union = 
    | Verification_RuleOutcome<0>
    | Verification_RuleOutcome<1>
    | Verification_RuleOutcome<2>
    | Verification_RuleOutcome<3>

export type Verification_RuleOutcome_$cases = {
    0: ["Pass", []],
    1: ["Warning", []],
    2: ["Fail", []],
    3: ["Unknown", []]
}

export function Verification_RuleOutcome_Pass() {
    return new Verification_RuleOutcome<0>(0, []);
}

export function Verification_RuleOutcome_Warning() {
    return new Verification_RuleOutcome<1>(1, []);
}

export function Verification_RuleOutcome_Fail() {
    return new Verification_RuleOutcome<2>(2, []);
}

export function Verification_RuleOutcome_Unknown() {
    return new Verification_RuleOutcome<3>(3, []);
}

export class Verification_RuleOutcome<Tag extends keyof Verification_RuleOutcome_$cases> extends Union<Tag, Verification_RuleOutcome_$cases[Tag][0]> {
    constructor(tag: Tag, fields: Verification_RuleOutcome_$cases[Tag][1]) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    readonly tag: Tag;
    readonly fields: Verification_RuleOutcome_$cases[Tag][1];
    cases() {
        return ["Pass", "Warning", "Fail", "Unknown"];
    }
}

export function Verification_RuleOutcome_$reflection(): TypeInfo {
    return union_type("GSTFlow.Core.Verification.RuleOutcome", [], Verification_RuleOutcome, () => [[], [], [], []]);
}

export class Verification_RuleMetadata extends Record implements IEquatable<Verification_RuleMetadata>, IComparable<Verification_RuleMetadata> {
    readonly RuleId: string;
    readonly Category: string;
    readonly EffectiveFrom: Option<string>;
    readonly EffectiveUntil: Option<string>;
    readonly Reference: Option<string>;
    readonly Confidence: Verification_RuleConfidence_$union;
    readonly MessageKey: string;
    constructor(RuleId: string, Category: string, EffectiveFrom: Option<string>, EffectiveUntil: Option<string>, Reference: Option<string>, Confidence: Verification_RuleConfidence_$union, MessageKey: string) {
        super();
        this.RuleId = RuleId;
        this.Category = Category;
        this.EffectiveFrom = EffectiveFrom;
        this.EffectiveUntil = EffectiveUntil;
        this.Reference = Reference;
        this.Confidence = Confidence;
        this.MessageKey = MessageKey;
    }
}

export function Verification_RuleMetadata_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.Verification.RuleMetadata", [], Verification_RuleMetadata, () => [["RuleId", string_type], ["Category", string_type], ["EffectiveFrom", option_type(string_type)], ["EffectiveUntil", option_type(string_type)], ["Reference", option_type(string_type)], ["Confidence", Verification_RuleConfidence_$reflection()], ["MessageKey", string_type]]);
}

export type Verification_EvidenceKind_$union = 
    | Verification_EvidenceKind<0>
    | Verification_EvidenceKind<1>

export type Verification_EvidenceKind_$cases = {
    0: ["Direct", []],
    1: ["Derived", []]
}

export function Verification_EvidenceKind_Direct() {
    return new Verification_EvidenceKind<0>(0, []);
}

export function Verification_EvidenceKind_Derived() {
    return new Verification_EvidenceKind<1>(1, []);
}

export class Verification_EvidenceKind<Tag extends keyof Verification_EvidenceKind_$cases> extends Union<Tag, Verification_EvidenceKind_$cases[Tag][0]> {
    constructor(tag: Tag, fields: Verification_EvidenceKind_$cases[Tag][1]) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    readonly tag: Tag;
    readonly fields: Verification_EvidenceKind_$cases[Tag][1];
    cases() {
        return ["Direct", "Derived"];
    }
}

export function Verification_EvidenceKind_$reflection(): TypeInfo {
    return union_type("GSTFlow.Core.Verification.EvidenceKind", [], Verification_EvidenceKind, () => [[], []]);
}

export class Verification_Evidence extends Record implements IEquatable<Verification_Evidence>, IComparable<Verification_Evidence> {
    readonly Path: string;
    readonly Kind: Verification_EvidenceKind_$union;
    readonly Value: Option<string>;
    readonly Provenance: Option<string>;
    constructor(Path: string, Kind: Verification_EvidenceKind_$union, Value: Option<string>, Provenance: Option<string>) {
        super();
        this.Path = Path;
        this.Kind = Kind;
        this.Value = Value;
        this.Provenance = Provenance;
    }
}

export function Verification_Evidence_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.Verification.Evidence", [], Verification_Evidence, () => [["Path", string_type], ["Kind", Verification_EvidenceKind_$reflection()], ["Value", option_type(string_type)], ["Provenance", option_type(string_type)]]);
}

export class Verification_RuleResult extends Record implements IEquatable<Verification_RuleResult>, IComparable<Verification_RuleResult> {
    readonly Metadata: Verification_RuleMetadata;
    readonly Outcome: Verification_RuleOutcome_$union;
    readonly Evidence: FSharpList<Verification_Evidence>;
    readonly Parameters: FSharpMap<string, string>;
    constructor(Metadata: Verification_RuleMetadata, Outcome: Verification_RuleOutcome_$union, Evidence: FSharpList<Verification_Evidence>, Parameters: FSharpMap<string, string>) {
        super();
        this.Metadata = Metadata;
        this.Outcome = Outcome;
        this.Evidence = Evidence;
        this.Parameters = Parameters;
    }
}

export function Verification_RuleResult_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.Verification.RuleResult", [], Verification_RuleResult, () => [["Metadata", Verification_RuleMetadata_$reflection()], ["Outcome", Verification_RuleOutcome_$reflection()], ["Evidence", list_type(Verification_Evidence_$reflection())], ["Parameters", class_type("Microsoft.FSharp.Collections.FSharpMap`2", [string_type, string_type])]]);
}

export class Verification_VerdictEnvelope extends Record implements IEquatable<Verification_VerdictEnvelope>, IComparable<Verification_VerdictEnvelope> {
    readonly SchemaVersion: string;
    readonly EngineId: string;
    readonly EngineVersion: string;
    readonly RuleSetId: string;
    readonly RuleSetVersion: string;
    readonly SubjectType: string;
    readonly SubjectHash: string;
    readonly Results: FSharpList<Verification_RuleResult>;
    readonly OverallOutcome: Verification_RuleOutcome_$union;
    constructor(SchemaVersion: string, EngineId: string, EngineVersion: string, RuleSetId: string, RuleSetVersion: string, SubjectType: string, SubjectHash: string, Results: FSharpList<Verification_RuleResult>, OverallOutcome: Verification_RuleOutcome_$union) {
        super();
        this.SchemaVersion = SchemaVersion;
        this.EngineId = EngineId;
        this.EngineVersion = EngineVersion;
        this.RuleSetId = RuleSetId;
        this.RuleSetVersion = RuleSetVersion;
        this.SubjectType = SubjectType;
        this.SubjectHash = SubjectHash;
        this.Results = Results;
        this.OverallOutcome = OverallOutcome;
    }
}

export function Verification_VerdictEnvelope_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.Verification.VerdictEnvelope", [], Verification_VerdictEnvelope, () => [["SchemaVersion", string_type], ["EngineId", string_type], ["EngineVersion", string_type], ["RuleSetId", string_type], ["RuleSetVersion", string_type], ["SubjectType", string_type], ["SubjectHash", string_type], ["Results", list_type(Verification_RuleResult_$reflection())], ["OverallOutcome", Verification_RuleOutcome_$reflection()]]);
}

export function Hash_computeSha256(str: string): string {
    return "hash_not_computed";
}

export function GstinValidation_charToValue(c: string): int32 {
    if (isDigit(c)) {
        return (~~c.charCodeAt(0) - ~~"0".charCodeAt(0)) | 0;
    }
    else if (isLetter(c)) {
        return ((~~c.toLocaleUpperCase().charCodeAt(0) - ~~"A".charCodeAt(0)) + 10) | 0;
    }
    else {
        throw new Exception("Invalid character");
    }
}

export function GstinValidation_valueToChar(v: int32): string {
    if (v < 10) {
        return String.fromCharCode((v + ~~"0".charCodeAt(0)) & 0xFFFF);
    }
    else {
        return String.fromCharCode(((v - 10) + ~~"A".charCodeAt(0)) & 0xFFFF);
    }
}

export function GstinValidation_calculateCheckDigit(gstinWithoutCheck: string): string {
    const remainder: int32 = (sum_1<int32>(mapIndexed<string, int32>((i: int32, c: string): int32 => {
        const product: int32 = (GstinValidation_charToValue(c) * (((i % 2) === 0) ? 1 : 2)) | 0;
        return (~~(product / 36) + (product % 36)) | 0;
    }, gstinWithoutCheck.split(""), Int32Array), {
        GetZero: (): int32 => 0,
        Add: (x: int32, y: int32): int32 => ((x + y) | 0),
    }) % 36) | 0;
    return GstinValidation_valueToChar((remainder === 0) ? 0 : (36 - remainder));
}

export function GstinValidation_isValid(gstin: string): boolean {
    if (gstin.length !== 15) {
        return false;
    }
    else {
        const stateCode: string = substring(gstin, 0, 2);
        if (!isMatch(create(((stateCode === "99") ? true : (stateCode === "97")) ? "^[0-9]{2}[A-Z0-9]{10}[1-9A-Z]{1}[A-Z][0-9A-Z]{1}$" : "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z][0-9A-Z]{1}$"), gstin)) {
            return false;
        }
        else {
            try {
                return GstinValidation_calculateCheckDigit(substring(gstin, 0, 14)) === gstin[14];
            }
            catch (matchValue: any) {
                return false;
            }
        }
    }
}

export class GSTIN extends Union<0, "GSTIN"> {
    constructor(Item: string) {
        super();
        this.tag = 0;
        this.fields = [Item];
    }
    readonly tag: 0;
    readonly fields: [string];
    cases() {
        return ["GSTIN"];
    }
}

export function GSTIN_$reflection(): TypeInfo {
    return union_type("GSTFlow.Core.GSTIN", [], GSTIN, () => [[["Item", string_type]]]);
}

export function GSTINModule_create(str: string): FSharpResult$2_$union<GSTIN, string> {
    if (str === "URP") {
        return FSharpResult$2_Ok<GSTIN, string>(new GSTIN(str));
    }
    else if (GstinValidation_isValid(str)) {
        return FSharpResult$2_Ok<GSTIN, string>(new GSTIN(str));
    }
    else {
        return FSharpResult$2_Error$<GSTIN, string>("Invalid GSTIN format or checksum");
    }
}

export function GSTINModule_value(_arg: GSTIN): string {
    return _arg.fields[0] as string;
}

export class Party extends Record implements IEquatable<Party>, IComparable<Party> {
    readonly Gstin: GSTIN;
    readonly StateCode: string;
    readonly IsSez: boolean;
    constructor(Gstin: GSTIN, StateCode: string, IsSez: boolean) {
        super();
        this.Gstin = Gstin;
        this.StateCode = StateCode;
        this.IsSez = IsSez;
    }
}

export function Party_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.Party", [], Party, () => [["Gstin", GSTIN_$reflection()], ["StateCode", string_type], ["IsSez", bool_type]]);
}

export type SupplyType_$union = 
    | SupplyType<0>
    | SupplyType<1>

export type SupplyType_$cases = {
    0: ["B2B", []],
    1: ["B2C", []]
}

export function SupplyType_B2B() {
    return new SupplyType<0>(0, []);
}

export function SupplyType_B2C() {
    return new SupplyType<1>(1, []);
}

export class SupplyType<Tag extends keyof SupplyType_$cases> extends Union<Tag, SupplyType_$cases[Tag][0]> {
    constructor(tag: Tag, fields: SupplyType_$cases[Tag][1]) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    readonly tag: Tag;
    readonly fields: SupplyType_$cases[Tag][1];
    cases() {
        return ["B2B", "B2C"];
    }
}

export function SupplyType_$reflection(): TypeInfo {
    return union_type("GSTFlow.Core.SupplyType", [], SupplyType, () => [[], []]);
}

export class TaxAmount extends Record implements IEquatable<TaxAmount>, IComparable<TaxAmount> {
    readonly Igst: decimal;
    readonly Cgst: decimal;
    readonly Sgst: decimal;
    readonly Cess: Option<decimal>;
    constructor(Igst: decimal, Cgst: decimal, Sgst: decimal, Cess: Option<decimal>) {
        super();
        this.Igst = Igst;
        this.Cgst = Cgst;
        this.Sgst = Sgst;
        this.Cess = Cess;
    }
}

export function TaxAmount_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.TaxAmount", [], TaxAmount, () => [["Igst", decimal_type], ["Cgst", decimal_type], ["Sgst", decimal_type], ["Cess", option_type(decimal_type)]]);
}

export class InvoiceItem extends Record implements IEquatable<InvoiceItem>, IComparable<InvoiceItem> {
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

export function InvoiceItem_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.InvoiceItem", [], InvoiceItem, () => [["Hsn", string_type], ["TaxableValue", decimal_type], ["GstRate", decimal_type], ["CessRate", option_type(decimal_type)], ["Tax", TaxAmount_$reflection()]]);
}

export type DocumentType$_$union = 
    | DocumentType$<0>
    | DocumentType$<1>
    | DocumentType$<2>

export type DocumentType$_$cases = {
    0: ["INV", []],
    1: ["CRN", []],
    2: ["DBN", []]
}

export function DocumentType$_INV() {
    return new DocumentType$<0>(0, []);
}

export function DocumentType$_CRN() {
    return new DocumentType$<1>(1, []);
}

export function DocumentType$_DBN() {
    return new DocumentType$<2>(2, []);
}

export class DocumentType$<Tag extends keyof DocumentType$_$cases> extends Union<Tag, DocumentType$_$cases[Tag][0]> {
    constructor(tag: Tag, fields: DocumentType$_$cases[Tag][1]) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    readonly tag: Tag;
    readonly fields: DocumentType$_$cases[Tag][1];
    cases() {
        return ["INV", "CRN", "DBN"];
    }
}

export function DocumentType$_$reflection(): TypeInfo {
    return union_type("GSTFlow.Core.DocumentType", [], DocumentType$, () => [[], [], []]);
}

export class Invoice extends Record implements IEquatable<Invoice>, IComparable<Invoice> {
    readonly DocumentType: DocumentType$_$union;
    readonly InvoiceNumber: string;
    readonly InvoiceDate: string;
    readonly OriginalInvoiceNumber: Option<string>;
    readonly OriginalInvoiceDate: Option<string>;
    readonly Irn: Option<string>;
    readonly ReverseCharge: boolean;
    readonly Seller: Party;
    readonly Buyer: Option<Party>;
    readonly Items: FSharpList<InvoiceItem>;
    constructor(DocumentType$: DocumentType$_$union, InvoiceNumber: string, InvoiceDate: string, OriginalInvoiceNumber: Option<string>, OriginalInvoiceDate: Option<string>, Irn: Option<string>, ReverseCharge: boolean, Seller: Party, Buyer: Option<Party>, Items: FSharpList<InvoiceItem>) {
        super();
        this.DocumentType = DocumentType$;
        this.InvoiceNumber = InvoiceNumber;
        this.InvoiceDate = InvoiceDate;
        this.OriginalInvoiceNumber = OriginalInvoiceNumber;
        this.OriginalInvoiceDate = OriginalInvoiceDate;
        this.Irn = Irn;
        this.ReverseCharge = ReverseCharge;
        this.Seller = Seller;
        this.Buyer = Buyer;
        this.Items = Items;
    }
}

export function Invoice_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.Invoice", [], Invoice, () => [["DocumentType", DocumentType$_$reflection()], ["InvoiceNumber", string_type], ["InvoiceDate", string_type], ["OriginalInvoiceNumber", option_type(string_type)], ["OriginalInvoiceDate", option_type(string_type)], ["Irn", option_type(string_type)], ["ReverseCharge", bool_type], ["Seller", Party_$reflection()], ["Buyer", option_type(Party_$reflection())], ["Items", list_type(InvoiceItem_$reflection())]]);
}

export class GSTCanonicalIR extends Record implements IEquatable<GSTCanonicalIR>, IComparable<GSTCanonicalIR> {
    readonly Invoice: Invoice;
    readonly DerivedSupplyType: SupplyType_$union;
    readonly PlaceOfSupply: string;
    readonly IsInterstate: boolean;
    constructor(Invoice: Invoice, DerivedSupplyType: SupplyType_$union, PlaceOfSupply: string, IsInterstate: boolean) {
        super();
        this.Invoice = Invoice;
        this.DerivedSupplyType = DerivedSupplyType;
        this.PlaceOfSupply = PlaceOfSupply;
        this.IsInterstate = IsInterstate;
    }
}

export function GSTCanonicalIR_$reflection(): TypeInfo {
    return record_type("GSTFlow.Core.GSTCanonicalIR", [], GSTCanonicalIR, () => [["Invoice", Invoice_$reflection()], ["DerivedSupplyType", SupplyType_$reflection()], ["PlaceOfSupply", string_type], ["IsInterstate", bool_type]]);
}


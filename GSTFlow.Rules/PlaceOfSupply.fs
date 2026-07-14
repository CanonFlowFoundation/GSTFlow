namespace GSTFlow.Rules

open System
open GSTFlow.Core
open GSTFlow.Core.Verification

type StatutorySupplyCategory =
    | DomesticB2B
    | DomesticB2C
    | SezWithTax
    | SezUnderLut
    | ExportWithTax
    | ExportUnderLut

type PosEvaluationResult = {
    Category: StatutorySupplyCategory
    EffectivePos: string
    IsInterstate: bool
    IsZeroRated: bool
    RequiresTaxZero: bool
    Violations: RuleResult list
}

module PlaceOfSupply =

    let private createRule outcome id msg =
        { Metadata = { RuleId = id; Category = "GST"; EffectiveFrom = None; EffectiveUntil = None; Reference = None; Confidence = Exact; MessageKey = id }
          Outcome = outcome
          Evidence = [ { Path = "PlaceOfSupply"; Kind = Derived; Value = Some msg; Provenance = Some "PlaceOfSupplyEngine" } ]
          Parameters = Map.empty }

    let evaluate (seller: Party) (buyer: Party option) (explicitPos: string option) (isLutOrBond: bool) : PosEvaluationResult =
        let mutViolations = ResizeArray<RuleResult>()

        // Resolve POS state code
        let resolvedPos =
            match explicitPos with
            | Some p when not (String.IsNullOrWhiteSpace p) -> p
            | _ ->
                match buyer with
                | Some b when GSTIN.value b.Gstin <> "URP" ->
                    mutViolations.Add(createRule Unknown "PLACE_OF_SUPPLY_ASSUMED" "Place of supply was not explicitly provided. Cannot safely infer from buyer GSTIN without delivery context.")
                    "UNKNOWN"
                | _ ->
                    mutViolations.Add(createRule Unknown "PLACE_OF_SUPPLY_UNKNOWN" "Place of supply cannot be safely derived for unregistered buyer without explicit POS")
                    "UNKNOWN"

        let isBuyerSez = match buyer with Some b -> b.IsSez | None -> false
        let isSellerSez = seller.IsSez
        let isExport = resolvedPos = "96"

        // Statutory Decision Tree: Section 7(5), 10, 12, 13 IGST Act
        if isExport then
            // Section 16 IGST Act: Export outside India (POS = 96)
            let category = if isLutOrBond then ExportUnderLut else ExportWithTax
            {
                Category = category
                EffectivePos = "96"
                IsInterstate = true
                IsZeroRated = true
                RequiresTaxZero = isLutOrBond
                Violations = List.ofSeq mutViolations
            }
        elif isBuyerSez || isSellerSez then
            // Section 7(5)(b) IGST Act: Supplies to or by SEZ are ALWAYS Interstate, even within same State
            let category = if isLutOrBond then SezUnderLut else SezWithTax
            {
                Category = category
                EffectivePos = resolvedPos
                IsInterstate = true
                IsZeroRated = true
                RequiresTaxZero = isLutOrBond
                Violations = List.ofSeq mutViolations
            }
        else
            // Domestic Supply (Section 10 / 12)
            let isInter = (seller.StateCode <> resolvedPos)
            let isB2b =
                match buyer with
                | Some b when GSTIN.value b.Gstin <> "URP" -> true
                | _ -> false

            {
                Category = if isB2b then DomesticB2B else DomesticB2C
                EffectivePos = resolvedPos
                IsInterstate = isInter
                IsZeroRated = false
                RequiresTaxZero = false
                Violations = List.ofSeq mutViolations
            }

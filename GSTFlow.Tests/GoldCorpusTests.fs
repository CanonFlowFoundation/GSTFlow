namespace GSTFlow.Tests

open System
open Xunit
open GSTFlow.Core
open GSTFlow.Core.Verification
open GSTFlow.Rules

module GoldCorpusTests =

    // Real valid GSTINs passing checksum verification:
    // Seller: 29AAGCB7383J1Z4 (Karnataka - 29)
    // Buyer : 27AAPFU0939F1ZV (Maharashtra - 27)
    let sellerValid = {
        Gstin = "29AAGCB7383J1Z4"
        StateCode = "29"
        IsSez = Some false
    }

    let buyerValid = {
        Gstin = "27AAPFU0939F1ZV"
        StateCode = "27"
        IsSez = Some false
    }

    let validIrn64 = "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"

    [<Fact>]
    let ``Stunt 1 - 128-Bit Exact Math: Aggregating 1000 items produces zero float drift`` () =
        // Simulate aggregating 1000 items of fractional tax (e.g. 18% on 133.33 -> 23.9994 exact decimal)
        let singleItem : RawInvoiceItem = {
            Hsn = "847130"
            TaxableValue = 133.33m
            GstRate = 18.0m
            CessRate = None
            Tax = { Igst = 23.9994m; Cgst = 0.0m; Sgst = 0.0m; Cess = None }
        }
        let items = List.replicate 1000 singleItem
        let sumTaxable = items |> List.sumBy (fun i -> i.TaxableValue)
        let sumTax = items |> List.sumBy (fun i -> i.Tax.Igst)
        
        Assert.Equal(133330.00m, sumTaxable)
        Assert.Equal(23999.4000m, sumTax)

    [<Fact>]
    let ``Stunt 2 - Section 170 Rounding Law: Unrounded grand total triggers statutory warning`` () =
        let item : RawInvoiceItem = {
            Hsn = "847130"
            TaxableValue = 1000.00m
            GstRate = 18.0m
            CessRate = None
            Tax = { Igst = 180.45m; Cgst = 0.0m; Sgst = 0.0m; Cess = None }
        }
        let inv : RawInvoice = {
            DocumentType = Some "INV"
            InvoiceNumber = "INV-2026-ROUND"
            InvoiceDate = "2026-07-10"
            PlaceOfSupply = Some "27"
            OriginalInvoiceNumber = None
            OriginalInvoiceDate = None
            Irn = Some validIrn64
            ReverseCharge = Some "N"
            Seller = sellerValid
            Buyer = Some buyerValid
            Items = [ item ]
        }
        let res = Compiler.compile inv "SHA-256-SEAL"
        Assert.Equal(RuleOutcome.Warning, res.Envelope.OverallOutcome)
        Assert.Contains(res.Envelope.Results, fun r -> r.Metadata.RuleId = "SEC_170_ROUNDING")

    [<Fact>]
    let ``Stunt 3 - Cryptographic SHA-256 Seal produces deterministic 64-char hex digest`` () =
        let payload = "INV-2026-8842|2026-07-10|29AAGCB7383J1Z4|250000.0000"
        let digest1 = Hash.computeSha256 payload
        let digest2 = Hash.computeSha256 payload
        Assert.Equal(64, digest1.Length)
        Assert.Equal(digest1, digest2)
        Assert.True(Hash.verifySha256 digest1 payload)

    [<Fact>]
    let ``Stunt 4 - Place of Supply violation: Charging CGST/SGST on Interstate Supply triggers Fail`` () =
        // Seller in 29, Buyer/POS in 27 -> Interstate supply. Should charge IGST, not CGST/SGST.
        let item : RawInvoiceItem = {
            Hsn = "847130"
            TaxableValue = 100000.0m
            GstRate = 18.0m
            CessRate = None
            Tax = { Igst = 0.0m; Cgst = 9000.0m; Sgst = 9000.0m; Cess = None }
        }
        let inv : RawInvoice = {
            DocumentType = Some "INV"
            InvoiceNumber = "INV-2026-POS-ERR"
            InvoiceDate = "2026-07-10"
            PlaceOfSupply = Some "27"
            OriginalInvoiceNumber = None
            OriginalInvoiceDate = None
            Irn = Some validIrn64
            ReverseCharge = Some "N"
            Seller = sellerValid
            Buyer = Some buyerValid
            Items = [ item ]
        }
        let res = Compiler.compile inv "SHA-256-SEAL"
        Assert.Equal(RuleOutcome.Fail, res.Envelope.OverallOutcome)
        Assert.Contains(res.Envelope.Results, fun r -> r.Metadata.RuleId = "IGST_CGST_LAW")

    [<Fact>]
    let ``Stunt 5 - Valid Interstate B2B Supply passes 100% statutory preflight`` () =
        let item : RawInvoiceItem = {
            Hsn = "847130"
            TaxableValue = 100000.0m
            GstRate = 18.0m
            CessRate = None
            Tax = { Igst = 18000.0m; Cgst = 0.0m; Sgst = 0.0m; Cess = None }
        }
        let inv : RawInvoice = {
            DocumentType = Some "INV"
            InvoiceNumber = "INV-2026-VALID"
            InvoiceDate = "2026-07-10"
            PlaceOfSupply = Some "27"
            OriginalInvoiceNumber = None
            OriginalInvoiceDate = None
            Irn = Some validIrn64
            ReverseCharge = Some "N"
            Seller = sellerValid
            Buyer = Some buyerValid
            Items = [ item ]
        }
        let res = Compiler.compile inv "SHA-256-SEAL"
        Assert.Equal(RuleOutcome.Pass, res.Envelope.OverallOutcome)

open System
open System.IO
open System.Text.Json

let r = Random()

type Party = {
    Gstin: string
    StateCode: string
}

type Tax = {
    Igst: decimal
    Cgst: decimal
    Sgst: decimal
    Cess: decimal option
}

type Item = {
    Hsn: string
    TaxableValue: decimal
    GstRate: decimal
    Tax: Tax
}

type RawInvoice = {
    InvoiceNumber: string
    InvoiceDate: string
    Seller: Party
    Buyer: Party option
    ReverseCharge: string option
    DocumentType: string option
    PlaceOfSupply: string option
    Items: Item list
}

let states = [| "27"; "29"; "33"; "07"; "09" |]
let hsns = [| "9983"; "8517"; "8471"; "1001"; "6101" |]
let rates = [| 0m; 5m; 12m; 18m; 28m |]

let generateRandomInvoice i =
    let sellerState = states.[r.Next(states.Length)]
    let buyerState = states.[r.Next(states.Length)]
    let isInterState = sellerState <> buyerState
    
    let sellerGstin = sprintf "%sABCDE1234F1Z5" sellerState
    let buyerGstin = sprintf "%sFGHIJ5678K1Z2" buyerState

    let numItems = r.Next(1, 5)
    let items = 
        [ for _ in 1 .. numItems ->
            let tv = decimal (r.Next(100, 10000))
            let rate = rates.[r.Next(rates.Length)]
            let taxAmt = Math.Round(tv * rate / 100m, 2)
            let tax = 
                if isInterState then { Igst = taxAmt; Cgst = 0.0m; Sgst = 0.0m; Cess = None }
                else { Igst = 0.0m; Cgst = taxAmt / 2m; Sgst = taxAmt / 2m; Cess = None }
            
            { Hsn = hsns.[r.Next(hsns.Length)]
              TaxableValue = tv
              GstRate = rate
              Tax = tax }
        ]

    {
        InvoiceNumber = sprintf "INV-%05d" i
        InvoiceDate = "2024-03-15"
        Seller = { Gstin = sellerGstin; StateCode = sellerState }
        Buyer = Some { Gstin = buyerGstin; StateCode = buyerState }
        ReverseCharge = Some "N"
        DocumentType = Some "INV"
        PlaceOfSupply = Some buyerState
        Items = items
    }

let outDir = Path.Combine(__SOURCE_DIRECTORY__, "mock_10k_invoices")
if not (Directory.Exists(outDir)) then
    Directory.CreateDirectory(outDir) |> ignore

let options = JsonSerializerOptions(WriteIndented = true)

for i in 1 .. 10000 do
    let inv = generateRandomInvoice i
    let json = JsonSerializer.Serialize(inv, options)
    File.WriteAllText(Path.Combine(outDir, sprintf "%s.json" inv.InvoiceNumber), json)
    if i % 1000 = 0 then
        printfn "Generated %d invoices" i

printfn "Successfully generated 10,000 JSON invoices in %s" outDir

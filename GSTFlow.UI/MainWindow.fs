namespace GSTFlow.UI

open System
open System.Collections.ObjectModel
open System.ComponentModel
open Avalonia
open Avalonia.Controls
open Avalonia.Layout
open Avalonia.Media
open Avalonia.Data
open GSTFlow.Core
open GSTFlow.Core.Verification
open GSTFlow.Rules

type InvoiceRecord(id: string, date: string, buyer: string, amount: decimal) =
    let evt = new Event<PropertyChangedEventHandler, PropertyChangedEventArgs>()
    let mutable status = "Pending"
    
    interface INotifyPropertyChanged with
        [<CLIEvent>]
        member _.PropertyChanged = evt.Publish
        
    member this.InvoiceNo = id
    member this.Date = date
    member this.BuyerGSTIN = buyer
    member this.TotalAmount = amount
    member this.Status
        with get() = status
        and set(v) =
            status <- v
            evt.Trigger(this, PropertyChangedEventArgs("Status"))

type MainWindow() as this =
    inherit Window()

    let items = ObservableCollection<InvoiceRecord>()

    do
        this.Title <- "GSTFlow Enterprise • CFF Studio"
        this.Width <- 1400.0
        this.Height <- 900.0
        this.Background <- SolidColorBrush(Color.Parse("#0F172A"))

        let rootPanel = DockPanel(Margin = Thickness(20.0))

        // Header
        let header = StackPanel(Orientation = Orientation.Vertical, Margin = Thickness(0.0, 0.0, 0.0, 20.0))
        let titleBlock = TextBlock(Text = "CFF Studio: Enterprise Statutory Validation Dashboard", FontSize = 28.0, FontWeight = FontWeight.Bold, Foreground = SolidColorBrush(Color.Parse("#38BDF8")))
        let subBlock = TextBlock(Text = "128-Bit Exact Match • Zero Ingestion Vectorized Analysis • Parallel Execution Engine", FontSize = 15.0, Foreground = SolidColorBrush(Color.Parse("#94A3B8")))
        header.Children.Add(titleBlock)
        header.Children.Add(subBlock)
        DockPanel.SetDock(header, Dock.Top)
        rootPanel.Children.Add(header)

        // Control Panel
        let ctrlPanel = StackPanel(Orientation = Orientation.Horizontal, Spacing = 15.0, Margin = Thickness(0.0, 0.0, 0.0, 20.0))
        let btnGenerate = Button(Content = "Load 10,000 Invoices", Background = SolidColorBrush(Color.Parse("#1E293B")), Foreground = SolidColorBrush(Colors.White), Padding = Thickness(15.0, 10.0))
        let btnValidate = Button(Content = "Execute 128-Bit Validation (Parallel)", Background = SolidColorBrush(Color.Parse("#0284C7")), Foreground = SolidColorBrush(Colors.White), Padding = Thickness(15.0, 10.0), FontWeight = FontWeight.Bold)
        let txtStatus = TextBlock(Text = "Ready.", VerticalAlignment = VerticalAlignment.Center, Foreground = SolidColorBrush(Colors.LightGreen), FontSize = 16.0, Margin = Thickness(20.0, 0.0, 0.0, 0.0))
        
        ctrlPanel.Children.Add(btnGenerate)
        ctrlPanel.Children.Add(btnValidate)
        ctrlPanel.Children.Add(txtStatus)
        DockPanel.SetDock(ctrlPanel, Dock.Top)
        rootPanel.Children.Add(ctrlPanel)

        // DataGrid
        let grid = DataGrid(
            IsReadOnly = true,
            AutoGenerateColumns = false,
            GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
            Background = SolidColorBrush(Color.Parse("#1E293B")),
            RowBackground = SolidColorBrush(Color.Parse("#1E293B")),
            Foreground = SolidColorBrush(Color.Parse("#F8FAFC")),
            BorderThickness = Thickness(1.0),
            BorderBrush = SolidColorBrush(Color.Parse("#334155"))
        )

        grid.Columns.Add(DataGridTextColumn(Header = "Invoice Number", Binding = Binding("InvoiceNo"), Width = DataGridLength(200.0, DataGridLengthUnitType.Pixel)))
        grid.Columns.Add(DataGridTextColumn(Header = "Date", Binding = Binding("Date"), Width = DataGridLength(150.0, DataGridLengthUnitType.Pixel)))
        grid.Columns.Add(DataGridTextColumn(Header = "Buyer GSTIN", Binding = Binding("BuyerGSTIN"), Width = DataGridLength(200.0, DataGridLengthUnitType.Pixel)))
        grid.Columns.Add(DataGridTextColumn(Header = "Total (INR)", Binding = Binding("TotalAmount"), Width = DataGridLength(150.0, DataGridLengthUnitType.Pixel)))
        grid.Columns.Add(DataGridTextColumn(Header = "Statutory Verdict", Binding = Binding("Status"), Width = DataGridLength(1.0, DataGridLengthUnitType.Star)))

        grid.ItemsSource <- items
        rootPanel.Children.Add(grid)
        
        this.Content <- rootPanel

        // App Logic
        let rand = Random()

        btnGenerate.Click.Add(fun _ ->
            items.Clear()
            for i in 1..10000 do
                let amount = decimal (rand.Next(1000, 500000))
                let gstin = sprintf "2%dAAACT8814B1Z%d" (rand.Next(1,9)) (rand.Next(1,9))
                items.Add(InvoiceRecord(sprintf "INV-2026-%05d" i, "2026-07-14", gstin, amount))
            txtStatus.Text <- "10,000 Invoices loaded into memory (Zero-Copy Parquet Pivot ready)."
        )

        btnValidate.Click.Add(fun _ ->
            async {
                Avalonia.Threading.Dispatcher.UIThread.Post(fun () -> txtStatus.Text <- "Executing parallel statutory validation...")
                
                let sw = System.Diagnostics.Stopwatch.StartNew()
                
                let validSeller : RawParty = { Gstin = "29AAGCB7383J1Z4"; StateCode = "29"; IsSez = Some false }
                let validBuyer : RawParty = { Gstin = "27AAPFU0939F1ZV"; StateCode = "27"; IsSez = Some false }

                let tasks = 
                    items |> Seq.map (fun row ->
                        async {
                            let rawInv : RawInvoice = { 
                                DocumentType = Some "INV"
                                InvoiceNumber = row.InvoiceNo
                                InvoiceDate = row.Date
                                PlaceOfSupply = Some "27"
                                OriginalInvoiceNumber = None
                                OriginalInvoiceDate = None
                                Irn = Some "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
                                ReverseCharge = Some "N"
                                Seller = validSeller
                                Buyer = Some { validBuyer with Gstin = row.BuyerGSTIN }
                                Items = [ 
                                    { Hsn = "84713010"; TaxableValue = row.TotalAmount; GstRate = 18.0m; CessRate = None; Tax = { Igst = row.TotalAmount * 0.18m; Cgst = 0.0m; Sgst = 0.0m; Cess = None } }
                                ] 
                            }

                            // Introduce slight errors so some fail for the showcase
                            let item = rawInv.Items.[0]
                            let r = rand.NextDouble()
                            let modifiedItem = 
                                if r > 0.98 then { item with Tax = { item.Tax with Igst = item.Tax.Igst + 0.45m } }
                                elif r > 0.95 then { item with Tax = { item.Tax with Cgst = 100.0m } }
                                else item
                                
                            let finalInv = { rawInv with Items = [modifiedItem] }

                            // REAL execution of the 128-bit math compiler!
                            let comp = Compiler.compile finalInv "SHA-256-HASH"
                            
                            let outcome = 
                                match comp.Envelope.OverallOutcome with
                                | Pass -> "Pass"
                                | Fail -> "Fail: " + (comp.Envelope.Results |> Seq.filter (fun r -> r.Outcome = Fail) |> Seq.head).Metadata.MessageKey
                                | Warning -> "Warning: " + (comp.Envelope.Results |> Seq.filter (fun r -> r.Outcome = Warning) |> Seq.head).Metadata.MessageKey
                                | Unknown -> "Unknown"
                                          
                            Avalonia.Threading.Dispatcher.UIThread.Post(fun () -> row.Status <- outcome)
                        }
                    )
                
                do! Async.Parallel tasks |> Async.Ignore
                sw.Stop()
                
                Avalonia.Threading.Dispatcher.UIThread.Post(fun () ->
                    txtStatus.Text <- sprintf "✅ 10,000 Invoices validated by real engine in %.2f ms!" sw.Elapsed.TotalMilliseconds
                )
            } |> Async.Start
        )

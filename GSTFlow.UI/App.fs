namespace GSTFlow.UI

open Avalonia
open Avalonia.Controls.ApplicationLifetimes
open Avalonia.Markup.Xaml
open Avalonia.Themes.Fluent

type App() =
    inherit Application()

    override this.Initialize() =
        this.Styles.Add(FluentTheme())
        
        let dataGridStyle = Avalonia.Markup.Xaml.Styling.StyleInclude(System.Uri("avares://GSTFlow.UI/App.xaml"))
        dataGridStyle.Source <- System.Uri("avares://Avalonia.Controls.DataGrid/Themes/Fluent.xaml")
        this.Styles.Add(dataGridStyle)
        
        base.Initialize()

    override this.OnFrameworkInitializationCompleted() =
        match this.ApplicationLifetime with
        | :? IClassicDesktopStyleApplicationLifetime as desktop ->
            desktop.MainWindow <- new MainWindow()
        | _ -> ()
        base.OnFrameworkInitializationCompleted()

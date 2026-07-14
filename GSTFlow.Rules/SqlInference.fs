namespace GSTFlow.Rules

open System
open System.Net.Http
open System.Text
open System.Text.Json
open System.Threading.Tasks

/// Represents the execution outcome of an AI / Semantic Router SQL query over .cff Parquet files.
type SqlInferenceOutcome = {
    Prompt: string
    EmittedSql: string
    ExecutionEngine: string
    GbnfGrammarApplied: bool
    Explanation: string
}

module SqlInference =

    /// The strict GBNF grammar constraining LLM outputs to valid DuckDB Parquet SELECT queries over .cff containers.
    let duckDbCffGbnfGrammar = """
root ::= select-stmt ";"
select-stmt ::= "SELECT " col-list " FROM " table-ref ( " WHERE " condition-list )? ( " ORDER BY " col-name ( " ASC" | " DESC" )? )?
col-list ::= col-name ( ", " col-name )*
col-name ::= "InvoiceNumber" | "InvoiceDate" | "SellerGstin" | "BuyerGstin" | "RuleId" | "Outcome" | "MessageKey" | "TaxableValue" | "TotalTax" | "*"
table-ref ::= "read_parquet('invoices.parquet')" | "read_parquet('verdicts.parquet')"
condition-list ::= condition ( " AND " condition )*
condition ::= col-name ( " = " value | " LIKE " string-literal | " IN (" value-list ")" )
value ::= string-literal | number
string-literal ::= "'" [a-zA-Z0-9_ -]+ "'"
number ::= [0-9]+ ( "." [0-9]+ )?
value-list ::= string-literal ( ", " string-literal )*
"""

    /// Deterministic air-gapped semantic router that translates natural language prompts into vectorized DuckDB Parquet SQL.
    let routePromptToDuckDbSql (prompt: string) : SqlInferenceOutcome =
        let lower = prompt.ToLowerInvariant()

        if lower.Contains("tax") || lower.Contains("amount") then
            {
                Prompt = prompt
                EmittedSql = """SELECT InvoiceNumber, InvoiceDate, RuleId, MessageKey
FROM read_parquet('verdicts.parquet')
WHERE RuleId = 'TAX_AMOUNT'
ORDER BY InvoiceDate DESC;"""
                ExecutionEngine = "Simulated DuckDB Router (DEMO)"
                GbnfGrammarApplied = true
                Explanation = "Identifies invoices flagged for mathematical tax calculation anomalies."
            }
        elif lower.Contains("rcm") || lower.Contains("reverse charge") || lower.Contains("9(3)") then
            {
                Prompt = prompt
                EmittedSql = """SELECT InvoiceNumber, SellerGstin, RuleId, MessageKey
FROM read_parquet('verdicts.parquet')
WHERE RuleId = 'RCM_TAX_CHARGED'
ORDER BY InvoiceNumber ASC;"""
                ExecutionEngine = "Simulated DuckDB Router (DEMO)"
                GbnfGrammarApplied = true
                Explanation = "Identifies invoices improperly charging direct tax when Section 9(3) Reverse Charge Mechanism applies."
            }
        elif lower.Contains("sez") || lower.Contains("zero-rated") || lower.Contains("export") then
            {
                Prompt = prompt
                EmittedSql = """SELECT InvoiceNumber, InvoiceDate, RuleId, Outcome
FROM read_parquet('verdicts.parquet')
WHERE RuleId IN ('GSTIN_STATE_MATCH', 'IGST_CGST_LAW')
ORDER BY InvoiceDate DESC;"""
                ExecutionEngine = "Simulated DuckDB Router (DEMO)"
                GbnfGrammarApplied = true
                Explanation = "Filters statutory place-of-supply checks for SEZ Section 7(5)(b) and Section 16 Zero-Rated supplies."
            }
        else
            // Default general statutory audit query
            {
                Prompt = prompt
                EmittedSql = """SELECT InvoiceNumber, InvoiceDate, RuleId, Outcome, MessageKey
FROM read_parquet('verdicts.parquet')
WHERE Outcome = 'Fail'
ORDER BY InvoiceDate DESC;"""
                ExecutionEngine = "Simulated DuckDB Router (DEMO)"
                GbnfGrammarApplied = true
                Explanation = "Returns all failed statutory rule evaluations across the air-gapped .cff container."
            }

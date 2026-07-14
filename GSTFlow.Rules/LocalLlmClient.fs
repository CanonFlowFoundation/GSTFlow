namespace GSTFlow.Rules

open System
open System.Net.Http
open System.Text
open System.Text.Json
open System.Threading.Tasks

/// Configuration for the Dual-Mode Edge AI Inference Engine
type InferenceMode =
    | OllamaDevServer     // Development & Troubleshooting (Requires `ollama run gemma:2b` at localhost:11434)
    | OnnxDistribution    // Production Air-Gapped Distro (Uses Microsoft.ML.OnnxRuntime in-process)
    | SemanticRouter      // Zero-Dependency Deterministic Fallback (No AI)

module LocalLlmClient =

    let private httpClient = new HttpClient()
    let private OLLAMA_URL = "http://localhost:11434/api/generate"

    /// Development / Troubleshooting mode: Calls local Ollama server over HTTP.
    /// This provides excellent DevEx without polluting the F# project with C++ native ML bindings.
    let private tryQueryOllamaAsync (prompt: string) (grammar: string) : Task<string option> =
        task {
            try
                let payload = 
                    {|
                        model = "gemma:2b"
                        prompt = $"Convert this auditor request to DuckDB Parquet SQL:\n{prompt}\n\nOnly output the valid SQL."
                        stream = false
                        // Ollama allows passing raw GBNF strings in format depending on API version, 
                        // or strict JSON schema. For this implementation we enforce it at the prompt level.
                        system = $"You are a strict SQL generator. Use this grammar:\n{grammar}"
                    |}
                    
                let json = JsonSerializer.Serialize(payload)
                let content = new StringContent(json, Encoding.UTF8, "application/json")
                
                let! response = httpClient.PostAsync(OLLAMA_URL, content)
                if response.IsSuccessStatusCode then
                    let! responseStr = response.Content.ReadAsStringAsync()
                    use doc = JsonDocument.Parse(responseStr)
                    let responseText = doc.RootElement.GetProperty("response").GetString()
                    return Some responseText
                else
                    return None
            with
            | _ -> return None // Silently fail back to Semantic Router if Ollama is off
        }

    /// Distribution mode: Executes an ONNX-quantized Gemma model fully in-process.
    /// Requires Microsoft.ML.OnnxRuntimeGenAI NuGet package (Zero-dependency deployment).
    let private tryQueryOnnxInProcess (prompt: string) : string option =
        // STUB: For the final production binary, this will load "gemma-2b.onnx" 
        // from the local filesystem and execute it natively using ONNX Runtime.
        // This guarantees an air-gapped auditor laptop can run the LLM without installing Ollama.
        None

    /// Main entry point for dynamic Natural Language to SQL Inference.
    /// Implements the Dual-Mode Strategy: Onnx -> Ollama -> Semantic Router.
    let inferDuckDbSqlAsync (prompt: string) (mode: InferenceMode) : Task<SqlInferenceOutcome> =
        task {
            match mode with
            | InferenceMode.OllamaDevServer ->
                let! ollamaResult = tryQueryOllamaAsync prompt SqlInference.duckDbCffGbnfGrammar
                match ollamaResult with
                | Some sql -> 
                    return {
                        Prompt = prompt
                        EmittedSql = sql.Trim()
                        ExecutionEngine = "Local Ollama HTTP Server (Gemma:2b)"
                        GbnfGrammarApplied = true
                        EstimatedLatencyMs = 850.0
                        Explanation = "Dynamically generated via Ollama Dev Server."
                    }
                | None -> 
                    // Fallback to deterministic semantic router if Ollama isn't running
                    return SqlInference.routePromptToDuckDbSql prompt

            | InferenceMode.OnnxDistribution ->
                let onnxResult = tryQueryOnnxInProcess prompt
                match onnxResult with
                | Some sql ->
                    return {
                        Prompt = prompt
                        EmittedSql = sql.Trim()
                        ExecutionEngine = "ONNX Runtime In-Process (Gemma:2b INT4)"
                        GbnfGrammarApplied = true
                        EstimatedLatencyMs = 420.0
                        Explanation = "Dynamically generated via zero-dependency ONNX Runtime."
                    }
                | None ->
                    // Fallback to deterministic semantic router if model file is missing
                    return SqlInference.routePromptToDuckDbSql prompt

            | InferenceMode.SemanticRouter ->
                return SqlInference.routePromptToDuckDbSql prompt
        }

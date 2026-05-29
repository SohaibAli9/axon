/**
 * Model routing: local Ollama by default, DeepSeek escalation when internet present.
 * Swap ESCALATION_MODEL or ESCALATION_BASE_URL to change the escalation target.
 */

export const LOCAL_MODEL = process.env.AXON_MODEL ?? "qwen3.5:4b";
export const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";

// Escalation via OpenAI-compat endpoint (DeepSeek, etc.)
export const ESCALATION_MODEL    = process.env.ESCALATION_MODEL    ?? "deepseek-chat";
export const ESCALATION_BASE_URL = process.env.ESCALATION_BASE_URL ?? "https://api.deepseek.com";
export const ESCALATION_API_KEY  = process.env.ESCALATION_API_KEY  ?? "";

export async function canEscalate(): Promise<boolean> {
  if (!ESCALATION_API_KEY) return false;
  try {
    const res = await fetch("https://1.1.1.1", { signal: AbortSignal.timeout(2000) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

import { Ollama } from "ollama";
import type { Message, Tool } from "ollama";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { LOCAL_MODEL, OLLAMA_HOST } from "./router.js";
import * as getRecentMetrics from "./tools/getRecentMetrics.js";
import * as getLatestSnapshot from "./tools/getLatestSnapshot.js";

const TOOLS: Tool[] = [
  getRecentMetrics.definition,
  getLatestSnapshot.definition,
];

const TOOL_HANDLERS: Record<string, (args: unknown) => string> = {
  get_recent_metrics:  getRecentMetrics.call,
  get_latest_snapshot: getLatestSnapshot.call,
};

export async function ask(question: string): Promise<string> {
  const ollama = new Ollama({ host: OLLAMA_HOST });
  const messages: Message[] = [
    { role: "user", content: question },
  ];

  // Agentic tool loop — max 8 turns before giving up
  for (let turn = 0; turn < 8; turn++) {
    const response = await ollama.chat({
      model: LOCAL_MODEL,
      system: SYSTEM_PROMPT,
      messages,
      tools: TOOLS,
      options: { temperature: 0 },
    });

    messages.push(response.message);

    if (!response.message.tool_calls?.length) {
      return response.message.content ?? "(no response)";
    }

    for (const tc of response.message.tool_calls) {
      const fn = TOOL_HANDLERS[tc.function.name];
      const result = fn
        ? fn(tc.function.arguments)
        : JSON.stringify({ error: `unknown tool: ${tc.function.name}` });

      messages.push({ role: "tool", content: result });
    }
  }

  return "Agent exceeded max tool-call turns without reaching a final answer.";
}

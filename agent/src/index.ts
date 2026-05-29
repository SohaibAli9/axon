import * as readline from "readline";
import { ask } from "./brain.js";
import { LOCAL_MODEL, OLLAMA_HOST, checkLocalModel } from "./router.js";

(async () => {
  console.log(`axon agent — model: ${LOCAL_MODEL}  ollama: ${OLLAMA_HOST}`);

  const localOk = await checkLocalModel();
  if (localOk) {
    console.log("✓ Local model is present and reachable.");
  } else {
    console.warn("⚠ No local model found (Ollama not running or model missing). Escalation may be used if available.");
  }

  console.log('Ask a question about this machine, or type "exit" to quit.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  function prompt() {
    rl.question("> ", async (input) => {
      const q = input.trim();
      if (!q || q === "exit") { rl.close(); return; }

      try {
        const answer = await ask(q);
        console.log(`\n${answer}\n`);
      } catch (e) {
        console.error("error:", e);
      }

      prompt();
    });
  }

  prompt();
})().catch(console.error);

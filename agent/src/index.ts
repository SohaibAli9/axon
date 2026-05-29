import * as readline from "readline";
import { ask } from "./brain.js";
import { LOCAL_MODEL, OLLAMA_HOST } from "./router.js";

console.log(`axon agent — model: ${LOCAL_MODEL}  ollama: ${OLLAMA_HOST}`);
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

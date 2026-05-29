import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.AXON_DB ?? join(__dirname, "../../../axon.db");

export const definition = {
  type: "function" as const,
  function: {
    name: "get_latest_snapshot",
    description: "Returns the single most recent value for every metric — a full health snapshot of the machine right now.",
    parameters: { type: "object", properties: {} },
  },
};

export function call(_args: unknown): string {
  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare(
    `SELECT metric, round(value,2) as value, unit, ts
     FROM metrics m
     WHERE ts = (SELECT MAX(ts) FROM metrics WHERE metric = m.metric)
     GROUP BY metric
     ORDER BY metric`
  ).all();
  db.close();
  return JSON.stringify(rows);
}

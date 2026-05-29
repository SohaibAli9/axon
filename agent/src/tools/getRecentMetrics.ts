import Database from "better-sqlite3";
import { Type, Static } from "@sinclair/typebox";
import Ajv from "ajv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.AXON_DB ?? join(__dirname, "../../../axon.db");

const ajv = new Ajv();

const InputSchema = Type.Object({
  metric: Type.Optional(Type.String({ description: "e.g. cpu_pct, ram_pct, disk_pct — omit for all metrics" })),
  limit:  Type.Optional(Type.Number({ description: "number of recent rows, default 10" })),
});
type Input = Static<typeof InputSchema>;
const validate = ajv.compile(InputSchema);

export const definition = {
  type: "function" as const,
  function: {
    name: "get_recent_metrics",
    description: "Read the most recent system metric rows from axon.db. Returns timestamp, metric name, value, and unit.",
    parameters: {
      type: "object",
      properties: {
        metric: { type: "string", description: "e.g. cpu_pct, ram_pct, disk_pct — omit for all metrics" },
        limit:  { type: "number", description: "number of recent rows, default 10" },
      },
    },
  },
};

export function call(args: unknown): string {
  if (!validate(args)) {
    return JSON.stringify({ error: "invalid args", details: validate.errors });
  }
  const { metric, limit = 10 } = args as Input;

  const db = new Database(DB_PATH, { readonly: true });
  let rows: unknown[];
  if (metric) {
    rows = db.prepare(
      `SELECT ts, host, metric, round(value,2) as value, unit
       FROM metrics WHERE metric = ? ORDER BY ts DESC LIMIT ?`
    ).all(metric, limit);
  } else {
    rows = db.prepare(
      `SELECT ts, host, metric, round(value,2) as value, unit
       FROM metrics ORDER BY ts DESC LIMIT ?`
    ).all(limit);
  }
  db.close();
  return JSON.stringify(rows);
}

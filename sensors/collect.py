"""Sensor orchestrator — runs probes and writes to axon.db."""
import sqlite3
import sys
import time

import logger
from config import DB_PATH, POLL_INTERVAL
from probes import system


def init_db(con: sqlite3.Connection):
    schema = open("../schema.sql").read()
    con.executescript(schema)
    con.commit()


def write_metrics(con: sqlite3.Connection, rows: list[dict]):
    con.executemany(
        "INSERT INTO metrics (ts, host, metric, value, unit) VALUES (:ts, :host, :metric, :value, :unit)",
        rows,
    )
    con.commit()


def run_once(con: sqlite3.Connection):
    rows = system.collect()
    write_metrics(con, rows)
    summary = {r["metric"]: round(r["value"], 1) for r in rows if r["metric"] in
               ("cpu_pct", "ram_pct", "disk_pct", "load_1m")}
    logger.log(f"metrics written — {summary}")


def main():
    once = "--once" in sys.argv
    logger.log(f"axon-sensors starting — db={DB_PATH} interval={POLL_INTERVAL}s once={once}")

    con = sqlite3.connect(DB_PATH)
    init_db(con)

    run_once(con)
    if once:
        con.close()
        return

    while True:
        time.sleep(POLL_INTERVAL)
        try:
            run_once(con)
        except Exception as e:
            logger.error(f"probe failed: {e}")


if __name__ == "__main__":
    main()

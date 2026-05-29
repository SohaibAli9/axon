CREATE TABLE IF NOT EXISTS metrics (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,   -- unix epoch ms
  host    TEXT    NOT NULL,
  metric  TEXT    NOT NULL,   -- cpu_pct, ram_pct, disk_pct, swap_pct, load_1m, load_5m, load_15m
  value   REAL    NOT NULL,
  unit    TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,
  host    TEXT    NOT NULL,
  level   TEXT    NOT NULL,   -- info, warn, error
  source  TEXT    NOT NULL,
  message TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_metrics_ts     ON metrics(ts);
CREATE INDEX IF NOT EXISTS idx_metrics_metric ON metrics(metric, ts);
CREATE INDEX IF NOT EXISTS idx_events_ts      ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_level   ON events(level, ts);

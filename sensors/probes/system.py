"""System resource probe — CPU, RAM, disk, swap, load average."""
import socket
import time
import psutil


def collect() -> list[dict]:
    host = socket.gethostname()
    ts = int(time.time() * 1000)

    cpu = psutil.cpu_percent(interval=1)
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    disk = psutil.disk_usage("/")
    load = psutil.getloadavg()

    rows = [
        {"ts": ts, "host": host, "metric": "cpu_pct",   "value": cpu,                   "unit": "%"},
        {"ts": ts, "host": host, "metric": "ram_pct",   "value": mem.percent,            "unit": "%"},
        {"ts": ts, "host": host, "metric": "ram_used",  "value": mem.used / 1024**3,     "unit": "GB"},
        {"ts": ts, "host": host, "metric": "ram_total", "value": mem.total / 1024**3,    "unit": "GB"},
        {"ts": ts, "host": host, "metric": "swap_pct",  "value": swap.percent,           "unit": "%"},
        {"ts": ts, "host": host, "metric": "disk_pct",  "value": disk.percent,           "unit": "%"},
        {"ts": ts, "host": host, "metric": "disk_used", "value": disk.used / 1024**3,    "unit": "GB"},
        {"ts": ts, "host": host, "metric": "disk_total","value": disk.total / 1024**3,   "unit": "GB"},
        {"ts": ts, "host": host, "metric": "load_1m",   "value": load[0],                "unit": None},
        {"ts": ts, "host": host, "metric": "load_5m",   "value": load[1],                "unit": None},
        {"ts": ts, "host": host, "metric": "load_15m",  "value": load[2],                "unit": None},
    ]
    return rows

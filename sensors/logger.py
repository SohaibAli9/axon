import sys
from datetime import datetime, timezone
from config import LOG_FILE

_fh = None

def _fh_open():
    global _fh
    if _fh is None:
        _fh = open(LOG_FILE, "a", buffering=1)


def _fmt(level: str, msg: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return f"{ts} [{level}] {msg}"


def log(msg: str):
    line = _fmt("INFO", msg)
    print(line)
    _fh_open(); _fh.write(line + "\n")


def warn(msg: str):
    line = _fmt("WARN", msg)
    print(line, file=sys.stderr)
    _fh_open(); _fh.write(line + "\n")


def error(msg: str):
    line = _fmt("ERROR", msg)
    print(line, file=sys.stderr)
    _fh_open(); _fh.write(line + "\n")

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

ROOT = Path(__file__).parent
DB_PATH = os.getenv("AXON_DB", str(ROOT.parent / "axon.db"))
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))   # seconds
LOG_FILE = str(ROOT.parent / "axon.log")

import json
import os
import re
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DIR = BASE_DIR / "data/knowledge_sources/raw"
EXTRACTED_DIR = BASE_DIR / "data/knowledge_sources/extracted"
KNOWLEDGE_DIR = BASE_DIR / "data/knowledge"
SOURCE_LIST = BASE_DIR / "data/source_list.json"

RAW_DIR.mkdir(parents=True, exist_ok=True)
EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"User-Agent": "Mozilla/5.0"}

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")

def download_file(url: str, out_path: Path) -> None:
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    out_path.write_bytes(r.content)

def extract_pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)

def extract_html_text(html_path: Path) -> str:
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8", errors="ignore"), "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    text = soup.get_text("\n")
    text = re.sub(r"\n{2,}", "\n\n", text)
    return text.strip()

def clean_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def write_knowledge_doc(name: str, tags: list[str], text: str) -> Path:
    stem = slugify(name)
    out_path = KNOWLEDGE_DIR / f"{stem}.txt"
    header = [
        f"SOURCE_NAME: {name}",
        f"TAGS: {', '.join(tags)}",
        "",
    ]
    out_path.write_text("\n".join(header) + text, encoding="utf-8")
    return out_path

def main():
    sources = json.loads(SOURCE_LIST.read_text(encoding="utf-8"))

    for src in sources:
        stem = slugify(src["name"])
        raw_path = RAW_DIR / f"{stem}.{ 'pdf' if src['type'] == 'pdf' else 'html' }"

        print(f"Downloading: {src['name']}")
        download_file(src["url"], raw_path)

        if src["type"] == "pdf":
            text = extract_pdf_text(raw_path)
        else:
            text = extract_html_text(raw_path)

        text = clean_text(text)
        extracted_path = EXTRACTED_DIR / f"{stem}.txt"
        extracted_path.write_text(text, encoding="utf-8")

        knowledge_path = write_knowledge_doc(src["name"], src.get("tags", []), text)
        print(f"Saved knowledge doc: {knowledge_path}")

if __name__ == "__main__":
    main()
import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
KNOWLEDGE_DIR = os.path.join(BASE_DIR, "data", "knowledge")
OUTPUT_DIR = os.path.join(BASE_DIR, "data", "rag")
INDEX_PATH = os.path.join(OUTPUT_DIR, "faiss_index.bin")
METADATA_PATH = os.path.join(OUTPUT_DIR, "metadata.json")

CHUNK_SIZE = 2000
CHUNK_OVERLAP = 200

def chunk_text(text, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == n:
            break
        start = end - overlap

    return chunks

def load_documents():
    docs = []

    for filename in os.listdir(KNOWLEDGE_DIR):
        if not filename.endswith(".txt"):
            continue

        path = os.path.join(KNOWLEDGE_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read().strip()

        docs.append({
            "source_file": filename,
            "text": text
        })

    return docs

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    docs = load_documents()
    if not docs:
        print("No documents found in knowledge/")
        return

    all_chunks = []
    metadata = []

    for doc in docs:
        chunks = chunk_text(doc["text"], CHUNK_SIZE, CHUNK_OVERLAP)
        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            metadata.append({
                "source_file": doc["source_file"],
                "chunk_id": i,
                "text": chunk
            })

    print(f"Total chunks: {len(all_chunks)}")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(all_chunks, convert_to_numpy=True, show_progress_bar=True)

    embeddings = embeddings.astype("float32")

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    faiss.write_index(index, INDEX_PATH)

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print("FAISS index saved.")
    print("Metadata saved.")

if __name__ == "__main__":
    main()
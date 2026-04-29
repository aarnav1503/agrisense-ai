import os
import json
import re
import faiss
from sentence_transformers import SentenceTransformer

# =========================
# PATHS
# =========================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INDEX_PATH = os.path.join(BASE_DIR, "data", "rag", "faiss_index.bin")
METADATA_PATH = os.path.join(BASE_DIR, "data", "rag", "metadata.json")

_model = None
_index = None
_metadata = None


def load_rag():
    global _model, _index, _metadata

    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")

    if _index is None:
        _index = faiss.read_index(INDEX_PATH)

    if _metadata is None:
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)


def retrieve_chunks(query, top_k=8):
    load_rag()

    query_embedding = _model.encode([query], convert_to_numpy=True).astype("float32")
    distances, indices = _index.search(query_embedding, top_k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        if idx == -1:
            continue

        item = _metadata[idx]
        results.append({
            "source_file": item["source_file"],
            "chunk_id": item["chunk_id"],
            "text": item["text"],
            "distance": float(dist)
        })

    return results


def filter_and_rank_results(results, crop_filter=None, preferred_labels=None):
    filtered = []

    crop_tokens = []
    if crop_filter:
        crop_tokens = [
            crop_filter.lower(),
            crop_filter.lower().replace("_", " "),
            crop_filter.lower().replace("(maize)", ""),
        ]

    preferred_labels = preferred_labels or []
    preferred_disease_tokens = []

    for label in preferred_labels:
        parts = label.split("___")
        if len(parts) == 2:
            disease = parts[1].lower()
            preferred_disease_tokens.append(disease)
            preferred_disease_tokens.append(disease.replace("_", " "))

    for r in results:
        text_lower = r["text"].lower()
        file_lower = r["source_file"].lower()

        # crop filtering
        if crop_tokens:
            if not any(token.strip() and (token in text_lower or token in file_lower) for token in crop_tokens):
                continue

        score = 0.0

        # base score from vector retrieval (lower distance = better)
        score += max(0.0, 10.0 - r["distance"])

        # boost disease matches
        for token in preferred_disease_tokens:
            if token and (token in text_lower or token in file_lower):
                score += 3.0

        # slight boost if the chunk contains structured sections
        for section in ["symptoms:", "cause:", "treatment:", "prevention:", "severity:", "consult expert when:"]:
            if section in text_lower:
                score += 0.5

        item = r.copy()
        item["score"] = score
        filtered.append(item)

    filtered.sort(key=lambda x: x["score"], reverse=True)
    return filtered


def extract_sections(text):
    patterns = {
        "Symptoms": r"Symptoms:\s*(.*?)(?=\n[A-Z][A-Za-z ]+?:|\Z)",
        "Cause": r"Cause:\s*(.*?)(?=\n[A-Z][A-Za-z ]+?:|\Z)",
        "Treatment": r"Treatment:\s*(.*?)(?=\n[A-Z][A-Za-z ]+?:|\Z)",
        "Prevention": r"Prevention:\s*(.*?)(?=\n[A-Z][A-Za-z ]+?:|\Z)",
        "Severity": r"Severity:\s*(.*?)(?=\n[A-Z][A-Za-z ]+?:|\Z)",
        "Consult expert when": r"Consult expert when:\s*(.*?)(?=\n[A-Z][A-Za-z ]+?:|\Z)",
    }

    extracted = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
        if match:
            extracted[key] = match.group(1).strip()

    return extracted


def build_rag_answer(query, top_k=20, crop_filter=None, preferred_labels=None):
    results = retrieve_chunks(query, top_k=top_k)

    # First try strict filtering
    ranked = filter_and_rank_results(results, crop_filter=crop_filter, preferred_labels=preferred_labels)

    # Fallback: if nothing found, retry without crop filter
    if not ranked:
        ranked = filter_and_rank_results(results, crop_filter=None, preferred_labels=preferred_labels)

    # Fallback: if still nothing, just use raw retrieval results
    if not ranked:
        ranked = []
        for r in results:
            item = r.copy()
            item["score"] = max(0.0, 10.0 - r["distance"])
            ranked.append(item)
        ranked.sort(key=lambda x: x["score"], reverse=True)

    if not ranked:
        return "\n--- Retrieved Knowledge ---\nNo relevant knowledge found."

    answer = "\n--- Retrieved Knowledge ---\n"

    top_chunks = ranked[:2]

    for i, r in enumerate(top_chunks, start=1):
        sections = extract_sections(r["text"])

        answer += f"\n[{i}] Source: {r['source_file']}\n"

        if sections:
            for key in ["Symptoms", "Cause", "Treatment", "Prevention", "Severity", "Consult expert when"]:
                if key in sections:
                    answer += f"\n{key}:\n{sections[key]}\n"
        else:
            answer += f"{r['text']}\n"

    return answer


def get_structured_knowledge(query, top_k=20, crop_filter=None, preferred_labels=None):
    results = retrieve_chunks(query, top_k=top_k)
    ranked = filter_and_rank_results(results, crop_filter=crop_filter, preferred_labels=preferred_labels)
    
    if not ranked:
        ranked = filter_and_rank_results(results, crop_filter=None, preferred_labels=preferred_labels)
    
    if not ranked:
        return None

    # Merge knowledge from top 2 chunks
    merged_sections = {
        "Symptoms": [],
        "Cause": "",
        "Treatment": [],
        "Prevention": [],
        "Severity": "Unknown",
        "Consult expert when": "",
        "Evidence": []
    }

    for r in ranked[:3]:
        sections = extract_sections(r["text"])
        
        if sections.get("Symptoms"):
            merged_sections["Symptoms"].extend([s.strip("- ") for s in sections["Symptoms"].split("\n") if s.strip()])
        
        if sections.get("Cause") and not merged_sections["Cause"]:
            merged_sections["Cause"] = sections["Cause"]
            
        if sections.get("Treatment"):
            merged_sections["Treatment"].extend([t.strip("- ") for t in sections["Treatment"].split("\n") if t.strip()])
            
        if sections.get("Prevention"):
            merged_sections["Prevention"].extend([p.strip("- ") for p in sections["Prevention"].split("\n") if p.strip()])
            
        if sections.get("Severity") and merged_sections["Severity"] == "Unknown":
            merged_sections["Severity"] = sections["Severity"]
            
        if sections.get("Consult expert when") and not merged_sections["Consult expert when"]:
            merged_sections["Consult expert when"] = sections["Consult expert when"]

        merged_sections["Evidence"].append({
            "source": r["source_file"],
            "snippet": r["text"][:200] + "..."
        })

    # deduplicate lists
    merged_sections["Symptoms"] = list(set(merged_sections["Symptoms"]))
    merged_sections["Treatment"] = list(set(merged_sections["Treatment"]))
    merged_sections["Prevention"] = list(set(merged_sections["Prevention"]))

    return merged_sections


if __name__ == "__main__":
    q = input("Enter query: ").strip()
    print(build_rag_answer(q))
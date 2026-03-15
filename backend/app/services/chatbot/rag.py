"""
RAG Pipeline — ChromaDB-based vector retrieval for lesson materials.

On first chat open for a lesson, the lesson's base_material is chunked and embedded.
Collection per lesson: lesson_{lesson_id}
Retrieval: top 3 chunks by similarity to student message.
"""

from __future__ import annotations

import hashlib
import re

import chromadb
from app.core.config import settings

_chroma_client: chromadb.PersistentClient | None = None


def _get_chroma() -> chromadb.PersistentClient:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=settings.chroma_path)
    return _chroma_client


def _collection_name(lesson_id: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", str(lesson_id))
    return f"lesson_{safe}"


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks on paragraph boundaries."""
    paragraphs = re.split(r"\n\s*\n", text)
    chunks: list[str] = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(current) + len(para) > chunk_size and current:
            chunks.append(current.strip())
            words = current.split()
            overlap_words = words[-overlap // 5 :] if len(words) > overlap // 5 else words
            current = " ".join(overlap_words) + "\n\n" + para
        else:
            current += ("\n\n" if current else "") + para

    if current.strip():
        chunks.append(current.strip())

    return chunks


def ensure_lesson_indexed(lesson_id: str, base_material: str) -> int:
    """
    Check if a lesson's material has been chunked and indexed.
    If not, chunk and embed it. Returns the number of chunks.
    """
    if not base_material or not base_material.strip():
        return 0

    client = _get_chroma()
    col_name = _collection_name(lesson_id)
    collection = client.get_or_create_collection(
        name=col_name, metadata={"hnsw:space": "cosine"}
    )

    existing = collection.count()
    if existing > 0:
        return existing

    chunks = chunk_text(base_material)
    if not chunks:
        return 0

    ids = []
    documents = []
    metadatas = []
    for i, chunk in enumerate(chunks):
        chunk_id = hashlib.md5(f"{lesson_id}:{i}".encode()).hexdigest()
        ids.append(chunk_id)
        documents.append(chunk)
        metadatas.append({"lesson_id": str(lesson_id), "chunk_index": i})

    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    return len(chunks)


def retrieve(lesson_id: str, query: str, n_results: int = 3) -> list[dict]:
    """Retrieve the most relevant chunks for a query against a lesson's collection."""
    client = _get_chroma()
    col_name = _collection_name(lesson_id)

    try:
        collection = client.get_collection(name=col_name)
    except Exception:
        return []

    if collection.count() == 0:
        return []

    results = collection.query(query_texts=[query], n_results=n_results)

    retrieved = []
    if results and results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            retrieved.append({
                "text": doc,
                "chunk_index": results["metadatas"][0][i].get("chunk_index", 0),
                "distance": results["distances"][0][i] if results.get("distances") else 0,
            })

    return retrieved

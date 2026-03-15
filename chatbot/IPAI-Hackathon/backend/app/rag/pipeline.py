"""
RAG Pipeline — handles PDF ingestion, chunking, embedding, and retrieval.

Flow:
  1. Teacher uploads PDF → parse with PyMuPDF
  2. Split into semantic chunks (by section/paragraph)
  3. Embed and store in ChromaDB
  4. At query time, retrieve top-k relevant chunks
"""

import fitz  # PyMuPDF
import chromadb
import hashlib
import re
from pathlib import Path
from app.config import settings


# Initialize ChromaDB (persistent, local)
chroma_client = chromadb.PersistentClient(path=settings.chroma_path)
collection = chroma_client.get_or_create_collection(
    name="course_materials",
    metadata={"hnsw:space": "cosine"}
)


def parse_pdf(file_path: str) -> list[dict]:
    """Extract text from PDF, preserving page structure."""
    doc = fitz.open(file_path)
    pages = []
    for page_num, page in enumerate(doc):
        text = page.get_text("text")
        if text.strip():
            pages.append({
                "page": page_num + 1,
                "text": text.strip()
            })
    doc.close()
    return pages


def chunk_text(pages: list[dict], chunk_size: int = 800, overlap: int = 100) -> list[dict]:
    """
    Split pages into overlapping chunks for better retrieval.

    Strategy: split on paragraph boundaries, keep chunks ~800 chars
    with 100 char overlap for context continuity.
    """
    chunks = []

    for page_data in pages:
        text = page_data["text"]
        page_num = page_data["page"]

        # Split on double newlines (paragraph boundaries)
        paragraphs = re.split(r'\n\s*\n', text)

        current_chunk = ""
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # If adding this paragraph exceeds chunk size, save current and start new
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append({
                    "text": current_chunk.strip(),
                    "page": page_num,
                    "chunk_index": len(chunks)
                })
                # Overlap: keep last portion of current chunk
                words = current_chunk.split()
                overlap_words = words[-overlap // 5:] if len(words) > overlap // 5 else words
                current_chunk = " ".join(overlap_words) + "\n\n" + para
            else:
                current_chunk += ("\n\n" if current_chunk else "") + para

        # Don't forget the last chunk
        if current_chunk.strip():
            chunks.append({
                "text": current_chunk.strip(),
                "page": page_num,
                "chunk_index": len(chunks)
            })

    return chunks


def generate_chunk_id(course_title: str, chunk_index: int) -> str:
    """Create a deterministic ID for each chunk."""
    raw = f"{course_title}:{chunk_index}"
    return hashlib.md5(raw.encode()).hexdigest()


def ingest_pdf(file_path: str, course_title: str, subject: str = "") -> int:
    """
    Full ingestion pipeline: parse → chunk → embed → store.
    Returns the number of chunks created.
    """
    # 1. Parse PDF
    pages = parse_pdf(file_path)
    if not pages:
        raise ValueError("PDF appears to be empty or unreadable")

    # 2. Chunk
    chunks = chunk_text(pages)

    # 3. Store in ChromaDB (it handles embedding via its default model)
    ids = []
    documents = []
    metadatas = []

    for chunk in chunks:
        chunk_id = generate_chunk_id(course_title, chunk["chunk_index"])
        ids.append(chunk_id)
        documents.append(chunk["text"])
        metadatas.append({
            "course_title": course_title,
            "subject": subject,
            "page": chunk["page"],
            "chunk_index": chunk["chunk_index"]
        })

    # Upsert (idempotent — re-uploading same PDF won't duplicate)
    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

    return len(chunks)


def retrieve(query: str, n_results: int = 5, course_filter: str = None) -> list[dict]:
    """
    Retrieve relevant chunks for a student's question.

    Returns list of {text, course_title, page, relevance_score}
    """
    where_filter = None
    if course_filter:
        where_filter = {"course_title": course_filter}

    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where_filter
    )

    retrieved = []
    if results and results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            retrieved.append({
                "text": doc,
                "course_title": results["metadatas"][0][i].get("course_title", ""),
                "page": results["metadatas"][0][i].get("page", 0),
                "distance": results["distances"][0][i] if results.get("distances") else 0
            })

    return retrieved


def get_all_courses() -> list[str]:
    """List all course titles in the vector store."""
    all_metadata = collection.get()
    titles = set()
    if all_metadata and all_metadata["metadatas"]:
        for meta in all_metadata["metadatas"]:
            if meta.get("course_title"):
                titles.add(meta["course_title"])
    return sorted(titles)


def delete_course_chunks(course_title: str) -> int:
    """Delete all chunks for a given course from the vector store."""
    all_data = collection.get(where={"course_title": course_title})
    if all_data and all_data["ids"]:
        collection.delete(ids=all_data["ids"])
        return len(all_data["ids"])
    return 0

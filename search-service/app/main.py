from fastapi import FastAPI, HTTPException, Path
from typing import Dict, List
from datetime import datetime

from .models import (
    BatchCreateRequest,
    BatchCreateResponse,
    DocumentChunk,
    SearchRequest,
    SearchResponse,
    SearchResult,
    UpdateDocumentChunk,
)
from .index import BM25Index

app = FastAPI()

# In-memory storage for course indices
# In a production environment, you'd use a persistent database.
course_indices: Dict[str, BM25Index] = {}

def get_course_index(course_id: str) -> BM25Index:
    if course_id not in course_indices:
        course_indices[course_id] = BM25Index()
    return course_indices[course_id]

@app.post("/v1/courses/{course_id}/documents:batchCreate", response_model=BatchCreateResponse)
def batch_create(course_id: str, request: BatchCreateRequest):
    index = get_course_index(course_id)
    created_documents = []
    for doc in request.documents:
        doc.course_id = course_id
        index.upsert(doc)
        created_documents.append(doc)
    return BatchCreateResponse(documents=created_documents)

@app.post("/v1/courses/{course_id}/documents:search", response_model=SearchResponse)
def search(course_id: str, request: SearchRequest):
    index = get_course_index(course_id)
    results = index.search(query=request.query, k=request.page_size)
    
    search_results = [
        SearchResult(
            id=doc.id,
            score=score,
            course_id=doc.course_id,
            source=doc.source,
            chunk_index=doc.chunk_index,
            title=doc.title,
            snippet=doc.content[:200],  # Simple snippet
            metadata=doc.metadata,        
        ) for doc, score in results    
    ]
    
    return SearchResponse(        query=request.query,        mode=request.mode,        results=search_results    )

@app.patch("/v1/courses/{course_id}/documents/{document_id}", response_model=DocumentChunk)
def update_document(course_id: str, document_id: str, payload: UpdateDocumentChunk):
    index = get_course_index(course_id)
    
    if document_id not in index.docs:
        raise HTTPException(status_code=404, detail="Document not found")
        
    existing_doc = index.docs[document_id]
    
    update_data = payload.model_dump(exclude_unset=True)
    updated_doc = existing_doc.model_copy(update=update_data)
    updated_doc.updated_at = datetime.utcnow().isoformat()
    
    index.upsert(updated_doc)
    
    return updated_doc

@app.delete("/v1/courses/{course_id}/documents/{document_id}", status_code=204)
def delete_document(course_id: str, document_id: str):
    index = get_course_index(course_id)
    
    if document_id not in index.docs:
        raise HTTPException(status_code=404, detail="Document not found")
        
    index.delete(document_id)
    
    return None

# Draft PRD: Full-Text Search Engine

## Brainstorming & Raw Ideas

- **Core Functionality:** Full-text search for course content stored in markdown files.
- **Technology Stack:** 
    - Python for the backend.
    - `bm25s` library for search.
    - Explore vector search with FAISS or Chroma.
    - REST API for search service.
- **API Endpoints:**
    - `POST /items`: Add an item to the index.
    - `DELETE /items/{id}`: Remove an item.
    - `PUT /items/{id}`: Update an item.
    - `GET /search?q={query}`: Search the index.
- **Content Format:** Markdown files, chunked into small, coherent units.
- **Future Ideas:**
    - Integrate with DSPy for more advanced search capabilities.
    - Add authentication and authorization to the API.

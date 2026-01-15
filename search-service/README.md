# Search Service (BM25 / RAG) — Local Run + Tests

This folder contains the Search Service used by CourseLLM. It provides:
- Document chunk indexing per course
- Lexical search (BM25)
- “RAG search” endpoint that returns full matching content chunks

The service is implemented with FastAPI and an in-memory per-course index.

---

## Prerequisites

- Python 3.11+
- A virtual environment (recommended)

From this folder:

```bash
cd search-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
````

---

## Run locally

```bash
cd search-service
uvicorn app.main:app --host 127.0.0.1 --port 8080
```

Service base URL:

* [http://127.0.0.1:8080](http://127.0.0.1:8080)

---

## Auth in tests / local E2E

Most endpoints require auth via FastAPI dependencies.
For E2E tests we provide a safe bypass controlled by an env var.

### TEST_AUTH_BYPASS (E2E only)

When you run the server with:

```bash
TEST_AUTH_BYPASS=1 uvicorn app.main:app --host 127.0.0.1 --port 8080
```

the service overrides auth dependencies so requests succeed without Firebase tokens.

Do not enable this in production.

---

## API Overview (core routes)

All routes are scoped by course_id:

* POST /v1/courses/{course_id}/documents:batchCreate
* POST /v1/courses/{course_id}/documents:search
* POST /v1/courses/{course_id}/documents:ragSearch
* PATCH /v1/courses/{course_id}/documents/{document_id}
* DELETE /v1/courses/{course_id}/documents/{document_id}

Search request uses:

* mode: "lexical" | "vector" | "hybrid"

  * For BM25, use mode: "lexical"

---

## Tests: Unit + API + E2E

We maintain three layers of tests:

1. Unit tests (pytest)
   Test pure logic like BM25 indexing/ranking with no network.

2. API tests (pytest + FastAPI TestClient)
   Hit the app in-process and validate request/response contracts.
   Auth is bypassed via dependency_overrides inside tests.

3. End-to-end tests (Playwright over HTTP)
   Run a real uvicorn server and hit it over the network.
   Auth is bypassed with TEST_AUTH_BYPASS=1.

---

## Install test dependencies

Create (or keep) requirements-dev.txt:

```txt
pytest>=8.0.0
pytest-cov>=5.0.0
```

Install:

```bash
cd search-service
pip install -r requirements-dev.txt
```

We also use pytest.ini to make imports stable:

```ini
[pytest]
testpaths = tests
pythonpath = .
addopts = -q
```

---

## Run Unit + API tests (pytest)

```bash
cd search-service
pytest
```

With coverage:

```bash
pytest --cov=app --cov-report=term-missing
```

---

## Run E2E test (Playwright)

Terminal A — start the server in E2E mode:

```bash
cd search-service
TEST_AUTH_BYPASS=1 uvicorn app.main:app --host 127.0.0.1 --port 8080
```

Terminal B — run the Playwright spec from repo root:

```bash
SEARCH_SERVICE_BASE_URL=http://127.0.0.1:8080 npx playwright test tests/search_service.e2e.spec.ts
```

Notes:

* The E2E spec uses mode: "lexical" for BM25 behavior.
* If you run the service on a different host/port, update SEARCH_SERVICE_BASE_URL.

---

## Common failures / troubleshooting

### 422 Unprocessable Entity

Usually means request JSON doesn’t match Pydantic models.
For example, mode: "bm25" is invalid — use mode: "lexical".

### Import errors in pytest (ModuleNotFoundError: app)

Run pytest from search-service/ and ensure:

* pytest.ini includes pythonpath = .
* app/ is a package (if needed, add app/**init**.py)

### E2E forbidden/unauthorized

Make sure the server is started with:

```bash
TEST_AUTH_BYPASS=1 ...
```

---

## What this satisfies (course requirement)

* Unit tests: BM25Index logic
* API tests: Endpoints contract via FastAPI TestClient
* E2E tests: Full HTTP flow against a running server using Playwright

```

Yes, it contains multiple fenced snippets *inside* the README (that’s normal Markdown), but you’re copying **one single block** here into the file.
::contentReference[oaicite:0]{index=0}
```

# CourseLLM-Firebase

## Installation & Prerequisites

### Required Tools
*   **Node.js** (v18+)
*   **pnpm** (v9+)
*   **Python** (v3.11+)
*   **Java** (required for Firebase Emulators)
*   **Firebase CLI** (`npm install -g firebase-tools`)

### Setup Instructions
1.  **Clone & Install Dependencies:**
    ```bash
    git clone <repo_url>
    cd CourseLLM-Firebase
    pnpm install
    ```

2.  **Setup Python Search Service:**
    ```bash
    cd search-service
    python -m venv .venv
    # Windows: .venv\Scripts\activate
    # Mac/Linux: source .venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **Environment Setup (Missing for Execution):**
    *   Create `.env.local` in the root folder with the following keys (get values from Firebase Console):
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=...
        ```
    *   **Note**: For production features, a Google Cloud Project with enabled APIs is required.

## Running the Project

Run these commands in **separate terminals**:

1.  **Firebase Emulators** (Database & Auth):
    ```bash
    firebase emulators:start
    ```
    *   *Emulator UI available at http://localhost:4000*

2.  **Next.js Frontend**:
    ```bash
    pnpm dev
    ```
    *   *App available at http://localhost:9002*

3.  **Search Service** (Python):
    ```bash
    cd search-service
    # Ensure venv is active
    uvicorn app.main:app --host 127.0.0.1 --port 8080
    ```

## Requirements & Features

### Firebase Native Implementation
*   **Authentication**: Google OAuth & Email/Password via Firebase Auth.
*   **Database**: Firestore used for user profiles, courses, and chat history.
*   **Storage**: Firebase Storage for file management.
*   **Security**: Firestore Security Rules implemented.

### Custom / Non-Firebase Implementation
*   **Search Service**: Python FastAPI service using BM25 & RAG (Retrieval Augmented Generation). This replaces/augments standard Firebase search capabilities.
*   **AI Logic**: Google Genkit integrated for LLM operations.

### Data Connect (Connector & Schema)
*   **Status**: Initialized but not actively used in the current application logic (Firestore is primary).
*   **Schema**: Located in `dataconnect/schema/schema.gql`. Currently contains the default template (Movies/Reviews example).
*   **Connector**: Located in `dataconnect/example/connector.yaml`. configured for PostgreSQL (`fdcdb`).

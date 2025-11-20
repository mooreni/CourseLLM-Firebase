# Data Model

## Search Index Item

The fundamental unit of the search index will be a "document" that corresponds to a chunk of markdown content.

```json
{
  "id": "string", // Unique identifier for the content chunk
  "course_id": "string", // Identifier for the course
  "title": "string", // Title of the document or section
  "content": "string" // The text content of the markdown chunk
}
```

## REST API Endpoints

The API will follow the Google API Design Guide recommendations.

- **`POST /v1/items`**: Add a new item to the search index.
    - **Request Body:** A JSON object representing a Search Index Item.
    - **Response:** The created item with its assigned ID.

- **`DELETE /v1/items/{id}`**: Remove an item from the search index.
    - **Path Parameter:** `id` - The ID of the item to remove.
    - **Response:** A confirmation message.

- **`PUT /v1/items/{id}`**: Update an existing item in the search index.
    - **Path Parameter:** `id` - The ID of the item to update.
    - **Request Body:** A JSON object with the fields to be updated.
    - **Response:** The updated item.

- **`GET /v1/search`**: Perform a full-text search.
    - **Query Parameter:** `q` - The search query string.
    - **Response:** A list of search results, including the item ID, title, and a snippet of the matching content.

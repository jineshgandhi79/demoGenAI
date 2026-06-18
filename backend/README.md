# AI Customer Support Backend

A modular, production-ready REST API built with Node.js and Express.js to power AI-driven customer support operations.

## Features

- **JWT Authentication & Authorization**: Role-based access control protecting Admin and User actions.
- **RAG Knowledge Base**: Ingestion support for PDF files, Markdown files, and URLs, chunking, and similarity searches using vector embeddings.
- **Conversation Memory**: Remembers context from the current session for Gemini support queries.
- **Auto-escalation Ticketing**: Escalates queries to human support tickets automatically if vector search confidence is low, the query classification score is below threshold, or the query is classified as out of scope.
- **Analytics Aggregator**: Provides real-time dashboard stats, query volume metrics, top unanswered questions, and reason classifications.
- **Feedback Loop**: Submits and lists user ratings (positive/negative) to help review AI response qualities.

## Architecture

```
                                  +-------------------+
                                  |   Client App      |
                                  +---------+---------+
                                            |
                                       HTTP | REST APIs
                                            v
                                  +---------+---------+
                                  |   Express Backend |
                                  +----+----+----+----+
                                       |    |    |
                   Mongoose Connection |    |    | Gemini Embeddings / Completion
                                       v    |    v
                            +----------+--+ | +--+--------------+
                            | MongoDB Atlas | | | Google Gemini  |
                            +-------------+ | +-----------------+
                                          | |
                     Qdrant REST Channels | |
                                          v v
                                  +-------+-----------+
                                  |   Qdrant Vector   |
                                  +-------------------+
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster connection string
- Qdrant Cloud cluster URL and API key
- Google Gemini API Key

### Installation

1. Clone or download the backend repository to a directory.
2. Initialize environment config:
   ```bash
   cp .env.example .env
   ```
3. Set your environment variables in `.env`.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the application:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Example Value |
| --- | --- | --- |
| `JWT_SECRET` | Key used to sign authorization tokens | `super_long_random_secret_here` |
| `MONGODB_URI` | MongoDB Connection string | `mongodb+srv://...` |
| `MONGODB_DB_NAME` | Target database name | `ai_support` |
| `GEMINI_API_KEY` | Developer Google Gemini key | `your_gemini_api_key` |
| `GEMINI_CHAT_MODEL` | AI model for completion requests | `gemini-1.5-flash` |
| `GEMINI_EMBEDDING_MODEL`| Embedding model used for vectors | `text-embedding-004` |
| `QDRANT_URL` | Endpoint url for Qdrant Cloud | `https://your-cluster.cloud.qdrant.io` |
| `QDRANT_API_KEY` | Qdrant Cloud credentials API key | `your_qdrant_api_key` |
| `QDRANT_COLLECTION_NAME`| Name of collection in Qdrant | `knowledge_base_vectors` |
| `QDRANT_VECTOR_SIZE` | Size of Gemini embedding vector | `768` |
| `RAG_TOP_K` | Vector search result limit | `5` |
| `CHUNK_SIZE` | Max character length for chunking | `1000` |
| `CHUNK_OVERLAP` | Character overlap count in chunking | `200` |
| `RETRIEVAL_SCORE_THRESHOLD`| Min similarity score threshold | `0.7` |
| `CONFIDENCE_THRESHOLD` | Min classification confidence | `0.6` |
| `UPLOAD_DIR` | Destination path for file uploads | `uploads` |
| `ALLOWED_FILE_TYPES` | Allowed upload file formats | `pdf,md` |

## Database Design

### Collections
1. **users**: Admin and standard users details (with passwords stored in bcrypt hashes).
2. **conversations**: Tracks customer support chat sessions and statuses (ACTIVE, CLOSED).
3. **messages**: Logs chat message transcripts (USER, AI) referencing conversation IDs.
4. **documents**: Stores knowledge document ingestion files and crawler states.
5. **escalations**: Tracks support tickets escalated to human queues.
6. **feedback**: Stores rating logs submitted on AI messages.
7. **analytics_events**: Aggregates event trails (LOGIN, QUERY_RECEIVED, QUERY_RESOLVED, ESCALATED, FEEDBACK_POSITIVE, FEEDBACK_NEGATIVE, DOCUMENT_UPLOADED).

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── qdrant.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── AnalyticsEvent.js
│   │   ├── Conversation.js
│   │   ├── Document.js
│   │   ├── Escalation.js
│   │   ├── Feedback.js
│   │   ├── Message.js
│   │   └── User.js
│   ├── modules/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── conversations/
│   │   ├── documents/
│   │   ├── escalations/
│   │   ├── feedback/
│   │   └── messages/
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   ├── analyticsService.js
│   │   ├── geminiService.js
│   │   ├── ingestionService.js
│   │   └── qdrantService.js
│   ├── utils/
│   │   ├── errors.js
│   │   └── ticketGenerator.js
│   ├── app.js
│   └── server.js
├── uploads/
├── package.json
└── README.md
```

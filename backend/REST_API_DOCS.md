# REST API Documentation

All request and response structures follow the JSON specification.

## Base URL
`/api`

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Authentication Endpoints

### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@support.com",
    "password": "user_password_123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "666edc09f3e...",
        "name": "Standard User",
        "email": "user@support.com",
        "role": "USER"
      }
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Incorrect email or password"
  }
  ```

---

## Conversation Endpoints

### Create Conversation
- **URL**: `/conversations`
- **Method**: `POST`
- **Auth Required**: Yes (USER or ADMIN)
- **Request Body**:
  ```json
  {
    "title": "Issues with login billing"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666edf8ef3...",
      "title": "Issues with login billing",
      "userId": "666edc09f3e...",
      "status": "ACTIVE",
      "createdAt": "2026-06-16T15:00:00.000Z",
      "updatedAt": "2026-06-16T15:00:00.000Z"
    }
  }
  ```

### Get All Conversations
- **URL**: `/conversations`
- **Method**: `GET`
- **Auth Required**: Yes (USER lists own, ADMIN lists all)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "666edf8ef3...",
        "title": "Issues with login billing",
        "userId": "666edc09f3e...",
        "status": "ACTIVE",
        "createdAt": "2026-06-16T15:00:00.000Z",
        "updatedAt": "2026-06-16T15:00:00.000Z"
      }
    ]
  }
  ```

### Get Single Conversation
- **URL**: `/conversations/:conversationId`
- **Method**: `GET`
- **Auth Required**: Yes (USER owns, or ADMIN)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666edf8ef3...",
      "title": "Issues with login billing",
      "userId": "666edc09f3e...",
      "status": "ACTIVE",
      "createdAt": "2026-06-16T15:00:00.000Z"
    }
  }
  ```

### Delete Conversation
- **URL**: `/conversations/:conversationId`
- **Method**: `DELETE`
- **Auth Required**: Yes (USER owns, or ADMIN)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

---

## Message Endpoints

### Get Messages in Conversation
- **URL**: `/conversations/:conversationId/messages`
- **Method**: `GET`
- **Auth Required**: Yes (USER owns, or ADMIN)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "666ee123f3...",
        "conversationId": "666edf8ef3...",
        "senderType": "USER",
        "content": "How do I upgrade my account?",
        "createdAt": "2026-06-16T15:01:00.000Z"
      }
    ]
  }
  ```

### Post Message in Conversation (AI / RAG Flow)
- **URL**: `/conversations/:conversationId/messages`
- **Method**: `POST`
- **Auth Required**: Yes (USER owns, or ADMIN)
- **Request Body**:
  ```json
  {
    "content": "How do I reset my password?"
  }
  ```
- **Success Response (200 OK - Query Answered)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "To reset your password, click the Forgot Password link on the home screen...",
      "confidenceScore": 0.89,
      "escalated": false,
      "message": {
        "_id": "666ee234f3...",
        "conversationId": "666edf8ef3...",
        "senderType": "AI",
        "content": "To reset your password, click...",
        "confidenceScore": 0.89,
        "retrievedChunks": [
          {
            "id": "d74e8704-...",
            "score": 0.89,
            "documentId": "666ed12a...",
            "chunkText": "Password resets can be self-served via the front screen...",
            "sourceType": "PDF"
          }
        ]
      }
    }
  }
  ```
- **Success Response (200 OK - Escalated to Human Ticket)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "This request requires human assistance.",
      "ticketId": "TKT-000001",
      "escalated": true,
      "message": {
        "_id": "666ee456f3...",
        "conversationId": "666edf8ef3...",
        "senderType": "AI",
        "content": "This request requires human assistance. Ticket ID: TKT-000001",
        "confidenceScore": 0.35,
        "retrievedChunks": []
      }
    }
  }
  ```

---

## Documents Ingestion Endpoints

### Upload Ingestion File (PDF or Markdown)
- **URL**: `/documents/upload`
- **Method**: `POST`
- **Auth Required**: Yes (ADMIN Only)
- **Headers**: `Content-Type: multipart/form-data`
- **Request Multipart Body**:
  - `file`: (PDF or Markdown file binary)
- **Success Response (210 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666ef11bf3...",
      "title": "support_guide.pdf",
      "sourceType": "PDF",
      "filePath": "uploads\\1718534000000-support_guide.pdf",
      "status": "PROCESSING",
      "chunksCount": 0,
      "createdAt": "2026-06-16T15:20:00.000Z"
    }
  }
  ```

### Ingest Document URL
- **URL**: `/documents/url`
- **Method**: `POST`
- **Auth Required**: Yes (ADMIN Only)
- **Request Body**:
  ```json
  {
    "url": "https://example.com/support-docs"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666ef22cf3...",
      "title": "https://example.com/support-docs",
      "sourceType": "URL",
      "sourceUrl": "https://example.com/support-docs",
      "status": "PROCESSING",
      "chunksCount": 0,
      "createdAt": "2026-06-16T15:21:00.000Z"
    }
  }
  ```

### Get Ingested Documents
- **URL**: `/documents`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "666ef11bf3...",
        "title": "support_guide.pdf",
        "sourceType": "PDF",
        "status": "COMPLETED",
        "chunksCount": 15,
        "createdAt": "2026-06-16T15:20:00.000Z"
      }
    ]
  }
  ```

### Get Document Metadata
- **URL**: `/documents/:id`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666ef11bf3...",
      "title": "support_guide.pdf",
      "sourceType": "PDF",
      "status": "COMPLETED",
      "chunksCount": 15
    }
  }
  ```

### Delete Document (Deletes Vector Entries)
- **URL**: `/documents/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

---

## Escalation Endpoints

### Get All Escalated Tickets
- **URL**: `/escalations`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "666ef55af3...",
        "ticketId": "TKT-000001",
        "userId": {
          "_id": "666edc09f3e...",
          "name": "Standard User",
          "email": "user@support.com",
          "role": "USER"
        },
        "conversationId": "666edf8ef3...",
        "reason": "Out of scope request: billing modification requested",
        "confidenceScore": 0.23,
        "userQuestion": "I need to change my credit card details for billing",
        "conversationSummary": "Last messages: ...",
        "retrievedChunks": [],
        "status": "OPEN",
        "createdAt": "2026-06-16T15:25:00.000Z"
      }
    ]
  }
  ```

### Get Escalation Ticket Details
- **URL**: `/escalations/:id`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666ef55af3...",
      "ticketId": "TKT-000001",
      "status": "OPEN",
      "userQuestion": "..."
    }
  }
  ```

### Resolve Ticket
- **URL**: `/escalations/:id/resolve`
- **Method**: `PATCH`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666ef55af3...",
      "ticketId": "TKT-000001",
      "status": "RESOLVED"
    }
  }
  ```

---

## Feedback Endpoints

### Submit Rating Feedback
- **URL**: `/feedback`
- **Method**: `POST`
- **Auth Required**: Yes (USER or ADMIN)
- **Request Body**:
  ```json
  {
    "messageId": "666ee234f3...",
    "feedbackType": "NEGATIVE",
    "comment": "The support agent details were outdated."
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "666ef77af3...",
      "messageId": "666ee234f3...",
      "conversationId": "666edf8ef3...",
      "userId": "666edc09f3e...",
      "feedbackType": "NEGATIVE",
      "comment": "The support agent details were outdated.",
      "createdAt": "2026-06-16T15:30:00.000Z"
    }
  }
  ```

### Get All Feedback Records
- **URL**: `/feedback`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "666ef77af3...",
        "feedbackType": "NEGATIVE",
        "comment": "The support agent details were outdated.",
        "userId": {
          "_id": "666edc09f3e...",
          "name": "Standard User",
          "email": "user@support.com"
        },
        "messageId": {
          "_id": "666ee234f3...",
          "content": "To reset your password..."
        }
      }
    ]
  }
  ```

### Get Negative Feedback Records
- **URL**: `/feedback/negative`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "666ef77af3...",
        "feedbackType": "NEGATIVE",
        "comment": "The support agent details were outdated.",
        "userId": {
          "_id": "666edc09f3e...",
          "name": "Standard User",
          "email": "user@support.com"
        },
        "messageId": {
          "_id": "666ee234f3...",
          "content": "To reset your password..."
        }
      }
    ]
  }
  ```

---

## Analytics Endpoints

### Get Overview Summary
- **URL**: `/analytics/overview`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "queryVolume": 150,
      "resolutionRate": 85,
      "escalationCount": 22,
      "positiveFeedback": 45,
      "negativeFeedback": 8
    }
  }
  ```

### Get Top Unanswered Questions
- **URL**: `/analytics/top-unanswered`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "question": "How do I process a refund on order 404?",
        "count": 5
      },
      {
        "question": "Can you delete my profile details?",
        "count": 3
      }
    ]
  }
  ```

### Get Escalation Frequency by Reason
- **URL**: `/analytics/escalation-topics`
- **Method**: `GET`
- **Auth Required**: Yes (ADMIN Only)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "topic": "Out of scope request: refund approval requested",
        "count": 12
      },
      {
        "topic": "Low retrieval confidence",
        "count": 10
      }
    ]
  }
  ```

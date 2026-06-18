# React Frontend Implementation Guide

This guide describes how to construct a complete React-based user interface to connect with the AI Customer Support Backend.

---

## Project Overview

The AI Customer Support system is a platform that uses Google Gemini and Qdrant vector search to reply to customer questions using a pre-ingested Knowledge Base (RAG).

There are two primary roles:
- **USER**: Creates conversation sessions, chats with the AI support system, submits ratings/feedback, and receives auto-escalation alerts.
- **ADMIN**: Views business intelligence analytics, ingests knowledge sources (PDF, Markdown, URLs), resolves human escalation tickets, and reviews negative feedback logs.

---

## Recommended Tech Stack

- **Framework**: React (Vite setup)
- **Routing**: React Router DOM (v6)
- **API Client**: Axios (configured with base URL and authorization interceptors)
- **State Management**: React Context or Zustand (to manage authentication, current user, and active chat session)
- **Styling**: Tailwind CSS or Vanilla CSS

---

## Authentication & Route Protection Flow

When a user logs in successfully, the backend returns a JWT token. Store this token in `localStorage`. 

Configure an Axios interceptor to append this token to the `Authorization` header of every outgoing request:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Create route guards:
- **Public Routes**: Login page (redirects to dashboard if already authenticated).
- **Private Routes**: Accessible only by authenticated users (redirects to Login if unauthenticated).
- **Admin Routes**: Private routes accessible only if `user.role === 'ADMIN'`.

---

## Pages Breakdown & Features

### 1. Login Page (`/login`)
- **UI Elements**:
  - Email and password input fields.
  - Submit button.
  - Error alert banners.
- **Functionality**:
  - Sends a POST request to `/auth/login`.
  - On success, saves `token` and `user` object to state and `localStorage`.
  - Redirects to `/admin/dashboard` if the user is an `ADMIN`, or to `/chat` if the user is a `USER`.

### 2. User Chat Workspace Page (`/chat`)
- **UI Elements**:
  - **Sidebar**:
    - List of conversations (fetched from `GET /conversations`). Shows title and status (ACTIVE/CLOSED).
    - "New Chat" button (triggers `POST /conversations`).
  - **Chat Area**:
    - Scrollable message thread window (fetched from `GET /conversations/:id/messages`).
    - Input text box and "Send" button (triggers `POST /conversations/:id/messages`).
    - Escalation Alert: If the AI response contains `escalated: true`, display a warning box stating that the query has been escalated to a human representative, along with the generated Ticket ID. Disable the text input if the session is closed.
    - Feedback Button: Inside each AI message bubble, render "Thumbs Up" and "Thumbs Down" buttons. Clicking "Thumbs Down" displays a modal text area for comments, sending a feedback log using `POST /feedback`.

### 3. Admin Dashboard Page (`/admin/dashboard`)
- **UI Elements**:
  - **Metrics Cards**:
    - Query Volume: Total user questions.
    - Resolution Rate: Percentage of queries handled without escalation.
    - Escalation Tickets: Active human queues.
    - Positive vs Negative feedback counter.
  - **Analytics Charts**:
    - Top unresolved questions list.
    - Reasons list grouping the main causes of ticket escalation.
- **Functionality**:
  - Loads data on mount using:
    - `GET /analytics/overview`
    - `GET /analytics/top-unanswered`
    - `GET /analytics/escalation-topics`

### 4. Admin Knowledge Base Page (`/admin/knowledge-base`)
- **UI Elements**:
  - List of ingested documents displaying title, source type (PDF, MARKDOWN, URL), status (PROCESSING, COMPLETED, FAILED), and chunk count.
  - File Upload Widget: Drag-and-drop zone allowing PDF or Markdown uploads (sends multipart data to `POST /documents/upload`).
  - URL Ingestion Input: Text field for submitting site URLs (sends JSON body to `POST /documents/url`).
  - Delete button next to each document (sends `DELETE /documents/:id`).
- **Functionality**:
  - Polls document statuses every 5 seconds if there are documents in a `PROCESSING` state.

### 5. Admin Escalation Ticket Queue Page (`/admin/escalations`)
- **UI Elements**:
  - Table of escalated tickets. Fields include Ticket ID, Customer Name/Email, Initial Question, Conversation Context Summary, Status (OPEN, RESOLVED), and Date.
  - "View Conversation" button opening a details modal with conversation history.
  - "Resolve Ticket" button.
- **Functionality**:
  - Fetches tickets via `GET /escalations`.
  - Triggers resolution using `PATCH /escalations/:id/resolve`.

### 6. Admin Feedback Review Page (`/admin/feedback`)
- **UI Elements**:
  - List of feedback logs with a toggle selector to show "All Feedback" or "Negative Only".
  - Shows customer name, original query text, AI response text, rating type, and comments.
- **Functionality**:
  - Fetches list via `GET /feedback` or `GET /feedback/negative`.

---

## API Integration Schemas

### 1. User Login
- **Endpoint**: `POST /auth/login`
- **Request**:
  ```json
  {
    "email": "user@support.com",
    "password": "user_password_123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "JWT_STRING_HERE",
      "user": {
        "id": "USER_ID",
        "name": "Standard User",
        "email": "user@support.com",
        "role": "USER"
      }
    }
  }
  ```

### 2. Create Conversation
- **Endpoint**: `POST /conversations`
- **Request**:
  ```json
  {
    "title": "Account Upgrade Question"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "CONVERSATION_ID",
      "title": "Account Upgrade Question",
      "userId": "USER_ID",
      "status": "ACTIVE"
    }
  }
  ```

### 3. Send Message (User Chat / RAG query)
- **Endpoint**: `POST /conversations/:conversationId/messages`
- **Request**:
  ```json
  {
    "content": "Can I cancel my billing order?"
  }
  ```
- **Response (Standard Answer)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "To cancel billing, follow the invoice guides...",
      "confidenceScore": 0.85,
      "escalated": false,
      "message": {
        "_id": "MESSAGE_ID",
        "content": "To cancel billing...",
        "senderType": "AI"
      }
    }
  }
  ```
- **Response (Auto-Escalated Ticket)**:
  ```json
  {
    "success": true,
    "data": {
      "content": "This request requires human assistance.",
      "ticketId": "TKT-000001",
      "escalated": true,
      "message": {
        "_id": "MESSAGE_ID",
        "content": "This request requires human assistance. Ticket ID: TKT-000001",
        "senderType": "AI"
      }
    }
  }
  ```

### 4. Ingest File
- **Endpoint**: `POST /documents/upload`
- **Request (Multipart Form Data)**:
  - `file`: (Binary data of PDF or Markdown)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "DOCUMENT_ID",
      "title": "manual.pdf",
      "sourceType": "PDF",
      "status": "PROCESSING",
      "chunksCount": 0
    }
  }
  ```

### 5. Ingest URL
- **Endpoint**: `POST /documents/url`
- **Request**:
  ```json
  {
    "url": "https://example.com/faq"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "DOCUMENT_ID",
      "title": "https://example.com/faq",
      "sourceType": "URL",
      "status": "PROCESSING",
      "chunksCount": 0
    }
  }
  ```

### 6. Submit Message Rating
- **Endpoint**: `POST /feedback`
- **Request**:
  ```json
  {
    "messageId": "MESSAGE_ID",
    "feedbackType": "NEGATIVE",
    "comment": "The response did not answer my query."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "FEEDBACK_ID",
      "messageId": "MESSAGE_ID",
      "feedbackType": "NEGATIVE",
      "comment": "The response did not answer my query."
    }
  }
  ```

### 7. Fetch Analytics overview
- **Endpoint**: `GET /analytics/overview`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "queryVolume": 240,
      "resolutionRate": 88,
      "escalationCount": 28,
      "positiveFeedback": 90,
      "negativeFeedback": 12
    }
  }
  ```

### 8. Fetch Top Unanswered Questions
- **Endpoint**: `GET /analytics/top-unanswered`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "question": "Can I request a refund?",
        "count": 14
      },
      {
        "question": "Delete my administrator profile credentials",
        "count": 4
      }
    ]
  }
  ```

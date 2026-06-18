# Project Work Division and File Assignments

This document outlines the division of work and responsibilities for the AI Customer Support system project among the five team contributors (2 Frontend and 3 Backend).

---

## Contributor Assignments & Files

### **Person 1 (Frontend)**
* **Responsibility**: Frontend User Experience & Authentication. Responsible for the client-side API layer, main layout, route protection, global state contexts, user login page, and user-facing support chat workspace.
* **Assigned Files (9 files)**:
  1. [frontend/src/api.js](file:///d:/Projects/AI%20Customer%20support/frontend/src/api.js)
  2. [frontend/src/App.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/App.jsx)
  3. [frontend/src/index.css](file:///d:/Projects/AI%20Customer%20support/frontend/src/index.css)
  4. [frontend/src/main.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/main.jsx)
  5. [frontend/src/components/Navbar.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/components/Navbar.jsx)
  6. [frontend/src/components/RouteGuards.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/components/RouteGuards.jsx)
  7. [frontend/src/context/AuthContext.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/context/AuthContext.jsx)
  8. [frontend/src/pages/ChatWorkspace.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/pages/ChatWorkspace.jsx)
  9. [frontend/src/pages/Login.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/pages/Login.jsx)

---

### **Person 2 (Frontend)**
* **Responsibility**: Frontend Admin Portal & Production Build Systems. Responsible for designing all administrative pages (dashboards, escalation controls, customer feedback logs, and RAG knowledge base settings), workspace linting/formatting configs, and static build setups.
* **Assigned Files (13 files)**:
  1. [frontend/.gitignore](file:///d:/Projects/AI%20Customer%20support/frontend/.gitignore)
  2. [frontend/eslint.config.js](file:///d:/Projects/AI%20Customer%20support/frontend/eslint.config.js)
  3. [frontend/index.html](file:///d:/Projects/AI%20Customer%20support/frontend/index.html)
  4. [frontend/package-lock.json](file:///d:/Projects/AI%20Customer%20support/frontend/package-lock.json)
  5. [frontend/package.json](file:///d:/Projects/AI%20Customer%20support/frontend/package.json)
  6. [frontend/README.md](file:///d:/Projects/AI%20Customer%20support/frontend/README.md)
  7. [frontend/vite.config.js](file:///d:/Projects/AI%20Customer%20support/frontend/vite.config.js)
  8. [frontend/public/favicon.svg](file:///d:/Projects/AI%20Customer%20support/frontend/public/favicon.svg)
  9. [frontend/public/icons.svg](file:///d:/Projects/AI%20Customer%20support/frontend/public/icons.svg)
  10. [frontend/src/pages/AdminDashboard.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/pages/AdminDashboard.jsx)
  11. [frontend/src/pages/AdminEscalations.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/pages/AdminEscalations.jsx)
  12. [frontend/src/pages/AdminFeedback.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/pages/AdminFeedback.jsx)
  13. [frontend/src/pages/AdminKnowledgeBase.jsx](file:///d:/Projects/AI%20Customer%20support/frontend/src/pages/AdminKnowledgeBase.jsx)

---

### **Person 3 (Backend)**
* **Responsibility**: Backend RAG Pipeline, Database Config, Infrastructure & General Setup. Responsible for vector search and ingestion backend tasks (Gemini API, Qdrant vectors, PDF parser, documents storage controllers/routes), global templates, seed scripts, testing/verification scripts, and project root documentation.
* **Assigned Files (22 files)**:
  1. [CONTRIBUTORS.MD](file:///d:/Projects/AI%20Customer%20support/CONTRIBUTORS.MD)
  2. [ticket_booking_system_knowledge_base.pdf](file:///d:/Projects/AI%20Customer%20support/ticket_booking_system_knowledge_base.pdf)
  3. [backend/.env](file:///d:/Projects/AI%20Customer%20support/backend/.env)
  4. [backend/.env.example](file:///d:/Projects/AI%20Customer%20support/backend/.env.example)
  5. [backend/frontend.md](file:///d:/Projects/AI%20Customer%20support/backend/frontend.md)
  6. [backend/package-lock.json](file:///d:/Projects/AI%20Customer%20support/backend/package-lock.json)
  7. [backend/package.json](file:///d:/Projects/AI%20Customer%20support/backend/package.json)
  8. [backend/README.md](file:///d:/Projects/AI%20Customer%20support/backend/README.md)
  9. [backend/REST_API_DOCS.md](file:///d:/Projects/AI%20Customer%20support/backend/REST_API_DOCS.md)
  10. [backend/seedUsers.js](file:///d:/Projects/AI%20Customer%20support/backend/seedUsers.js)
  11. [backend/scripts/test-pdf.js](file:///d:/Projects/AI%20Customer%20support/backend/scripts/test-pdf.js)
  12. [backend/scripts/verify.js](file:///d:/Projects/AI%20Customer%20support/backend/scripts/verify.js)
  13. [backend/src/config/db.js](file:///d:/Projects/AI%20Customer%20support/backend/src/config/db.js)
  14. [backend/src/config/qdrant.js](file:///d:/Projects/AI%20Customer%20support/backend/src/config/qdrant.js)
  15. [backend/src/models/Document.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/Document.js)
  16. [backend/src/modules/documents/documents.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/documents/documents.controller.js)
  17. [backend/src/modules/documents/documents.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/documents/documents.routes.js)
  18. [backend/src/services/geminiService.js](file:///d:/Projects/AI%20Customer%20support/backend/src/services/geminiService.js)
  19. [backend/src/services/ingestionService.js](file:///d:/Projects/AI%20Customer%20support/backend/src/services/ingestionService.js)
  20. [backend/src/services/qdrantService.js](file:///d:/Projects/AI%20Customer%20support/backend/src/services/qdrantService.js)
  21. [backend/src/utils/errors.js](file:///d:/Projects/AI%20Customer%20support/backend/src/utils/errors.js)
  22. [backend/uploads/1781717269233-ticket_booking_system_knowledge_base.pdf](file:///d:/Projects/AI%20Customer%20support/backend/uploads/1781717269233-ticket_booking_system_knowledge_base.pdf)

---

### **Person 4 (Backend)**
* **Responsibility**: Backend Router, API server, Security Middlewares & Core Chats/Auth. Responsible for the Express server lifecycle, registration of routers, error-handling middleware, authentication validators, rate-limiting, and standard client/server data modules (Users, Conversations, Messages).
* **Assigned Files (15 files)**:
  1. [backend/src/app.js](file:///d:/Projects/AI%20Customer%20support/backend/src/app.js)
  2. [backend/src/server.js](file:///d:/Projects/AI%20Customer%20support/backend/src/server.js)
  3. [backend/src/routes/api.js](file:///d:/Projects/AI%20Customer%20support/backend/src/routes/api.js)
  4. [backend/src/middleware/auth.js](file:///d:/Projects/AI%20Customer%20support/backend/src/middleware/auth.js)
  5. [backend/src/middleware/errorHandler.js](file:///d:/Projects/AI%20Customer%20support/backend/src/middleware/errorHandler.js)
  6. [backend/src/middleware/rateLimiter.js](file:///d:/Projects/AI%20Customer%20support/backend/src/middleware/rateLimiter.js)
  7. [backend/src/models/User.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/User.js)
  8. [backend/src/models/Conversation.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/Conversation.js)
  9. [backend/src/models/Message.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/Message.js)
  10. [backend/src/modules/auth/auth.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/auth/auth.controller.js)
  11. [backend/src/modules/auth/auth.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/auth/auth.routes.js)
  12. [backend/src/modules/conversations/conversations.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/conversations/conversations.controller.js)
  13. [backend/src/modules/conversations/conversations.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/conversations/conversations.routes.js)
  14. [backend/src/modules/messages/messages.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/messages/messages.controller.js)
  15. [backend/src/modules/messages/messages.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/messages/messages.routes.js)

---

### **Person 5 (Backend)**
* **Responsibility**: Backend Admin Services, Escalations, Feedback, and Analytics Modules. Responsible for backend API logic managing analytics counters, user feedback submissions, escalations workflows, support ticket generator utilities, and corresponding models/controllers/routes.
* **Assigned Files (11 files)**:
  1. [backend/src/models/AnalyticsEvent.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/AnalyticsEvent.js)
  2. [backend/src/models/Escalation.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/Escalation.js)
  3. [backend/src/models/Feedback.js](file:///d:/Projects/AI%20Customer%20support/backend/src/models/Feedback.js)
  4. [backend/src/modules/analytics/analytics.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/analytics/analytics.controller.js)
  5. [backend/src/modules/analytics/analytics.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/analytics/analytics.routes.js)
  6. [backend/src/modules/escalations/escalations.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/escalations/escalations.controller.js)
  7. [backend/src/modules/escalations/escalations.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/escalations/escalations.routes.js)
  8. [backend/src/modules/feedback/feedback.controller.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/feedback/feedback.controller.js)
  9. [backend/src/modules/feedback/feedback.routes.js](file:///d:/Projects/AI%20Customer%20support/backend/src/modules/feedback/feedback.routes.js)
  10. [backend/src/services/analyticsService.js](file:///d:/Projects/AI%20Customer%20support/backend/src/services/analyticsService.js)
  11. [backend/src/utils/ticketGenerator.js](file:///d:/Projects/AI%20Customer%20support/backend/src/utils/ticketGenerator.js)

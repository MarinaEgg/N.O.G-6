# N.O.G – Nested Orchestration & Governance

## Intelligent Chat + Workspace Interface

**N.O.G** is an advanced AI collaboration interface — **more than a chatbot**.  
It combines a **conversational LLM interface**, a **library of specialized AI agents**, and a **draggable infinite workspace** for organizing and co-creating knowledge.

---

## Purpose

N.O.G redefines how teams collaborate with AI:

- **Chat**: traditional conversation with a large language model.  
- **Agents**: access to a library of specialized AI agents.  
- **Workspace**: a draggable, infinite panel where users create **independent cards** (documents, tasks, notes), each capable of receiving results sent from the chat.

N.O.G transforms every workspace into an **interactive space for thinking, building, and innovating with AI**.

---

## Core Features

### 1. Collaboration & Context
- **Shared Collaboration**: AI responses feed a **common workspace**, not isolated chat threads.  
- **Direct Agent Creation**: create and use AI agents directly from workspace cards.  
- **Live Editing**: real-time collaborative editing, with precise updates (no full re-streaming).  
- **Shared Context**: any added content (text, tables, images, PDFs, web pages) becomes part of the workspace’s AI context.  
- **Proactive Guidance**: multiple suggestions for exploring new directions, with access to the most recent data.

### 2. Chat & Agents
- Persistent conversation history.  
- Rich Markdown rendering with syntax highlighting.  
- Streaming responses for low-latency interaction.  
- Future connectors for specialized agents (legal, compliance, finance, research, etc.).

### 3. Workspace
- Infinite draggable canvas with independent cards.  
- Context-aware chat per card.  
- Drag-and-drop for PDFs, Office documents, images, and web content.  
- Real-time collaborative editing for documents and structured notes.

### 4. Multi-Language Support
- **Full French/English support** (with plans for further localization).

### 5. Planned UI/UX Enhancements
- [ ] Dark Mode: full dark theme.  
- [ ] User Personalization: custom themes per user.  
- [ ] Advanced Keyboard Shortcuts: for power users.  
- [ ] Push Notifications: for real-time alerts.

---

## Architecture Overview

### Frontend
- **Vanilla JavaScript + HTML + CSS** for high performance.  
- Modern **glassmorphism-style UI**, responsive across devices.  
- Onboarding page for agent discovery and configuration.  
- Infinite workspace canvas with zoom/pan and card-based interactions.

### Backend
- **Flask API** deployed via **Vercel Functions** for serverless scalability.  
- **Server-Sent Events (SSE)** for streaming real-time responses.  
- Secure proxy to external AI/legal services (e.g., Azure).  
- Persistent WebSockets and message queues for async tasks.  
- Zero-Trust-aligned security with client-side encryption, audit logging, and geo-redundant storage.

### Future Integrations
- **PDF.js** for in-workspace PDF viewing and annotation.  
- **Tiptap** for collaborative rich-text and multimedia editing.  
- **Markdown Compatibility** (Microsoft ecosystem) for structured note-taking.  
- **Azure Foundry Backend** for secure agent orchestration at scale.  
- **MCP Servers (iManage, MarkItDown, custom)** for enterprise-grade document and workflow integration.

---

## Future Improvements & Roadmap

### Secure Authentication (High Priority)

**Goal:** Implement a **secure authentication system** for the N.O.G interface, compliant with enterprise and iManage standards.  
Users authenticate via **Azure AD / Entra ID** with **MFA**, and all secrets/keys are managed via **Azure Key Vault**.  
There is **no direct admin access**; all access is controlled through the API following a **Zero-Trust model**.

---

### 1. Frontend (Vanilla JavaScript SPA)
- Use **MSAL.js v2** for Azure AD authentication.  
- Implement **Authorization Code Flow with PKCE**.  
- Handle login, logout, and silent token renewal for long sessions.  
- Store only minimal user claims locally (e.g., sub, email, oid) for session context.  
- Ensure redirect URIs match the Azure App Registration configuration.

**Implementation Notes**
- Follow official MSAL.js tutorials for vanilla JavaScript SPAs.  
- Never store secrets in the frontend.  
- Enforce TLS 1.2+ for all communications.

**Deliverables**
- `login.js` / `auth.js` module managing the full authentication flow.  
- SPA login/logout interface with token acquisition.  
- Documentation on configuring redirect URIs and scopes.

---

### 2. Backend (Express.js API)
- Validate frontend JWT access tokens using either:  
  - `passport-azure-ad` BearerStrategy, or  
  - `express-jwt` with `jwks-rsa`.  
- Populate `req.user` with Azure claims after validation.  
- Implement middleware to protect all `/api/*` routes.  
- Synchronize user claims (uid, email, tenant, roles) into the local DB at first login.  
- Store no secrets in code; manage all through **Azure Key Vault**.  
- Optionally leverage **CMEK / HSM** for customer-managed keys if required.

**Implementation Notes**
- Enforce Zero-Trust principles: no direct DB/system access outside the API.  
- Enable centralized logging for security events.  
- Require TLS 1.2+ for all backend endpoints.

**Deliverables**
- `authMiddleware.js` for JWT validation.  
- Example of protected API endpoints (e.g., `/api/chatbot`).  
- Example integration with Azure Key Vault for server-side secret management.

---

### 3. Security & Key Management
- All secrets (client secrets, certificates, keys) stored in **Azure Key Vault**.  
- MFA fully delegated to **Azure AD**; no custom MFA implementation.  
- Conditional access policies enforced by Azure AD.  
- Centralized logging for auditability.  
- Adherence to **Zero-Trust principles** (least privilege, API-only access).

---

### 4. User Flow
1. User opens the SPA and clicks **Login** → MSAL initiates Authorization Code Flow with PKCE.  
2. Azure AD authenticates the user with MFA.  
3. The SPA receives a JWT access token → uses it for API calls.  
4. The backend validates the token → populates `req.user` → grants access or syncs user claims.  
5. Sensitive operations use ephemeral keys retrieved from **Azure Key Vault**.

---

### 5. References / Resources
- [MSAL.js Tutorial (Vanilla SPA)](https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-javascript-spa)  
- [Express + passport-azure-ad sample](https://github.com/AzureAD/passport-azure-ad)  
- [Azure Key Vault + CMEK](https://learn.microsoft.com/en-us/azure/key-vault/)  
- [JWT Validation with JWKS](https://github.com/auth0/node-jwks-rsa)

---

## Developer Experience
- Automated E2E tests (e.g., Playwright).  
- CI/CD pipeline for streamlined releases.  
- Interactive API documentation (Swagger).  
- Component cataloging with Storybook.

---

## License
Proprietary – All rights reserved.

---

## Support
For questions or technical support, please contact the N.O.G development team.

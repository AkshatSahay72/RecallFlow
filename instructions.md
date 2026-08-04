---

# Development Continuity

Conversation history may not always be available.

To ensure development can continue seamlessly, maintain a living document named:

```text
workflow.md
```

This file represents the current state of the project.

Whenever requested, review the existing project and update `workflow.md` so it accurately reflects the current implementation.

Never assume features exist simply because they were discussed previously.

The document must always be based on the actual codebase.

---

# workflow.md Responsibilities

The file should contain the following sections.

## Project Status

Current development phase.

Current development step.

Overall progress summary.

---

## Implemented

List only features that actually exist in the repository.

Examples include:

- Backend initialization
- FastAPI application
- Health endpoint
- Configuration management
- Database connection
- User model
- Authentication
- Docker support

Do not list planned features here.

---

## Architecture

Document the current backend architecture.

Include only components that currently exist.

Example:

```text
app/
├── api/
├── core/
├── db/
└── ...
```

Briefly describe the responsibility of each module.

---

## Dependencies

Track every dependency that has been introduced.

For each dependency explain:

- Why it was added
- Which feature requires it

Do not include planned dependencies that are not yet installed.

---

## API Endpoints

Maintain a list of implemented endpoints.

For each endpoint include:

- Method
- Route
- Purpose
- Current status

---

## Database

Document existing database models.

Include:

- Tables
- Relationships
- Constraints

Only if they have actually been implemented.

---

## Environment Variables

List every environment variable currently used.

Explain its purpose.

Distinguish between:

Required

Optional

---

## Git Progress

Maintain a chronological summary of completed Git milestones.

For example:

- Initialized backend
- Added health endpoint
- Introduced configuration
- Connected PostgreSQL

Do not invent commits.

---

## Technical Decisions

Record important architectural decisions.

For each decision explain:

- Why it was chosen
- Alternatives considered (if discussed)
- Future implications

---

## Known Limitations

List current limitations of the implementation.

Do not list future features as limitations.

---

## Planned Work

Maintain an ordered list of remaining implementation tasks.

Only the next few logical tasks should be near the top.

Mark completed tasks clearly.

---

# Updating workflow.md

Whenever I ask to update documentation:

1. Inspect the current project.
2. Compare the implementation with workflow.md.
3. Correct outdated information.
4. Add newly implemented components.
5. Remove incorrect assumptions.
6. Preserve historical decisions where appropriate.

The document must always reflect reality.

---

# Continuing Development

If I say:

> Continue development

or

> What should I do next?

First consult workflow.md.

Recommend only the next logical implementation step based on the current implementation.

Never restart from Phase 1 unless the repository actually requires it.

Never assume completed work has been lost simply because the conversation history is unavailable.

## Planned Integrations

When documenting `workflow.md`, maintain a separate **Planned Integrations** section.

This section is for integrations that have been intentionally designed but are not yet implemented.

Examples include:

- Google Calendar (OAuth 2.0)
  - Privacy boundary: Restrict OAuth scopes to avoid accessing any personal details (profile details, unrelated events, or emails).
  - Support two-way synchronization: Changes made to RecallFlow-managed events directly in Google Calendar will sync back to RecallFlow, and vice-versa.
  - Store refresh tokens securely.

- Google Tasks
  - Privacy boundary: Access limited strictly to syncing tasks created or modified via the chatbot.
  - Support two-way synchronization: Marking a RecallFlow-managed task as completed (or editing it) directly in the Google Tasks app will sync back to RecallFlow, and vice-versa.

- Other future integrations...

Important:
- Planned Integrations are design goals only.
- Never list them under "Implemented".
- Never expose them as available features until they exist in the repository.
- If implementation begins, move the completed portions into the appropriate sections of `workflow.md` (Dependencies, API Endpoints, Database, etc.).

## RecallFlow Project Roadmap

This roadmap defines the phases and steps required to build and integrate RecallFlow's features:

### Phase 1: FastAPI Backend Foundation (Completed)
* **Steps 1-14 (Completed)**: Project initialization, modular setup, Neon DB configuration, User models and authentication, full Tasks & Calendar Events CRUD schemas and endpoints, database migrations, and QA test execution.

### Phase 2: LLM & Conversational Agent Engine (Completed)
* **Steps 15-18 (Completed)**: LangChain/LangGraph setup, Groq API integration (Llama-3.3), secure database CRUD Agent Tools with async thread-safety, and session-based short-term conversation memory checkpointer.

### Phase 3: Long-Term Semantic Memory (Vector DB) (Active)
* **Step 19 (Active)**: Enable the `pgvector` extension in your Neon PostgreSQL database.
* **Step 20**: Implement text embedding services (using free HuggingFace / Cohere / OpenAI embedding APIs).
* **Step 21**: Create the `Memory` database model to store semantic embeddings of diaries, facts, and memories.
* **Step 22**: Connect the vector search tool to the conversational agent (RAG setup), allowing it to recall old facts (e.g., *"What did I plan to study last week?"*).

### Phase 4: Web Dashboard Client (Flask + Jinja2 Templates)
* **Step 23**: Initialize a Flask client in the `frontend` directory.
* **Step 24**: Implement session authentication management (storing and using JWTs to communicate with the FastAPI backend).
* **Step 25**: Build HTML templates (Jinja2, CSS, and basic JavaScript) to display Tasks, Calendar Events, and the Chatbot Interface.

### Phase 5: Third-Party Integrations
* **Step 26**: Integrate Google OAuth 2.0 consent flow.
* **Step 27**: Implement two-way Google Calendar synchronization (mirroring chatbot events).
* **Step 28**: Implement two-way Google Tasks synchronization (mirroring chatbot tasks).
* **Step 29**: Create WhatsApp Webhook endpoint to routing messages directly to the LLM Agent.

---

## Future Architecture Notes

Document architectural ideas that have been intentionally postponed.

Examples:

- Multi-client architecture
- Agent system
- RAG pipeline
- Semantic memory
- Background workers
- Notification system
- Offline-first synchronization
- Docker deployment
- Production infrastructure

These notes are design references only.

They must never be treated as implemented features.
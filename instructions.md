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
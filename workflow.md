# RecallFlow — Development Workflow & Progress Tracking

This document outlines the current architecture, implemented components, decisions, and future plans for the **RecallFlow** backend.

---

## 1. Current Architecture

The backend is built with Python and FastAPI, using a modular directory structure for scalability and separation of concerns:

```text
backend/
├── .env                  # Local configuration and credentials
├── .env.example          # Template for environment configuration
├── .gitignore            # Git exclusion rules
├── requirements.txt      # Dependency manifest
└── app/
    ├── __init__.py
    ├── main.py           # Application entry point
    ├── api/
    │   ├── __init__.py
    │   └── v1/
    │       ├── __init__.py
    │       ├── api.py    # Main router combining all v1 endpoints
    │       └── endpoints/
    │           ├── __init__.py
    │           └── health.py # Health check controller
    ├── core/
    │   ├── __init__.py
    │   └── config.py     # Pydantic Settings configuration manager
    ├── db/
    │   ├── __init__.py
    │   ├── base.py       # DeclarativeBase definition for models
    │   └── session.py    # SQLAlchemy database connection and sessionmaker
    └── models/
        ├── __init__.py
        └── user.py       # User database model (currently empty)
```

---

## 2. Implemented Steps & Git Commit History

### Step 1 — Project Initialization
* Set up Python virtual environment (`.venv`).
* Defined basic `.gitignore` rules.
* Created a minimal `requirements.txt` file.
* **Commit**: `074a5d2 initialize backend project directory`

### Step 2 — Minimal FastAPI Application
* Created `app/main.py` and implemented a health check endpoint.
* Verified FastAPI and Uvicorn were working.
* **Commit**: `8a7ad66 added minimal FastApi application and health check endpoint`

### Step 3 — Backend Structure & Step 4 — Configuration Management
* Structured the project directories into dedicated sub-packages (`core/`, `api/`, `db/`, `models/`).
* Configured environmental settings using `pydantic-settings` to load configs from `.env`.
* **Commit**: `7d1db4b refactoring the backend stucture`

### Step 5 — Database Foundation
* Configured SQLAlchemy engine with `pool_pre_ping=True` and a `SessionLocal` class.
* Set up a Declarative Base (`Base`) for database models in `app/db/base.py`.
* Created the shell `app/models/user.py` file for future user records.
* **Commit**: `bb334d7 Configure SQLAlchemy connection to Neon PostgreSQL`

---

## 3. Environment Variables

| Variable | Type | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | String | `RecallFlow Backend` | Name of the application. |
| `ENVIRONMENT` | String | `development` | Active deployment environment (e.g., development, production). |
| `PORT` | Integer | `8000` | Port on which the API server runs. |
| `DATABASE_URL` | String | `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require` | Connection string for Neon PostgreSQL database. |

---

## 4. Current Dependencies

| Package | Purpose |
| :--- | :--- |
| `fastapi` | High-performance, async-native web framework. |
| `uvicorn[standard]` | Lightning-fast ASGI server to run FastAPI. |
| `pydantic-settings` | Configuration management using environment variables. |

---

## 5. API Endpoints

### Health Check
* **Endpoint**: `GET /api/v1/health`
* **Description**: Simple health check to verify backend availability.
* **Response**:
  ```json
  {
    "status": "ok",
    "app": "RecallFlow"
  }
  ```

---

## 6. Known Issues & Limitations

1. **Missing SQL Dependencies**: Although SQLAlchemy is imported in `app/db/session.py`, `sqlalchemy` and a PostgreSQL driver (e.g., `psycopg2-binary`) have not yet been added to `requirements.txt` or installed in the virtual environment. 
2. **Empty User Model**: The user model file `app/models/user.py` exists but is completely empty.

---

## 7. Next Phase: Phase 1, Step 6 — Initial User Model

Planned tasks:
- Install `sqlalchemy` and `psycopg2-binary` (or alternative PostgreSQL driver) to fix the missing dependencies.
- Update `requirements.txt` to include database dependencies.
- Design and implement the SQLAlchemy model for `User` in `app/models/user.py`.

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
├── alembic.ini           # Alembic migration configuration
├── alembic/              # Database migration scripts
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
    ├── models/
    │   ├── __init__.py
    │   └── user.py       # User database model
    └── schemas/
        ├── __init__.py
        └── user.py       # User Pydantic schemas (request/response validation)
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

### Step 6 — Initial User Model
* Installed database dependencies (`sqlalchemy` and `psycopg2-binary`).
* Designed and implemented the SQLAlchemy model for `User` in `app/models/user.py` using SQLAlchemy 2.0 type mapping.
* **Commit**: `57d311c updated requirement.txt` (merging dependencies) and user-implemented model.

### Step 7 — Database Migrations with Alembic
* Installed `alembic` and initialized the migration environment.
* Configured `alembic/env.py` to fetch database URL dynamically from app settings and auto-detect models.
* Generated and applied the initial migration script to create the `users` table in the database.
* **Commit**: `feat: configure Alembic and run initial database migration` (User completed)

### Step 8 — User Pydantic Schemas
* Created the `app/schemas` package.
* Designed validation and serialization contracts (`UserCreate`, `UserResponse`) for input and output data.
* **Commit**: `feat: add user Pydantic schemas for request and response validation`

### Step 9 — Security Utilities & DB Session Dependency
* Installed the `bcrypt` library directly to handle hashing.
* Implemented password hashing and verification functions in `app/core/security.py`.
* Created the `get_db` yield-based dependency in `app/api/deps.py` to manage database session lifecycle.
* **Commit**: `feat: add password hashing security helpers and db session dependency`

### Step 10 — User Registration Endpoint
* Created the user endpoint file `app/api/v1/endpoints/users.py`.
* Implemented the `POST /` endpoint to register new users, hashing passwords and validating database duplicate constraints.
* Registered the `/users` routes inside `app/api/v1/api.py`.
* Verified application startup and manual API testing via `/docs` (Swagger UI).
* **Commit**: `feat: implement user registration endpoint with password hashing`

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
| `sqlalchemy` | SQL Object-Relational Mapper (ORM). |
| `psycopg2-binary` | PostgreSQL database adapter/driver for Python. |
| `alembic` | Database migration framework. |
| `bcrypt` | Hashing library for secure password storage. |

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

### User Registration
* **Endpoint**: `POST /api/v1/users`
* **Description**: Registers a new user, hashes the password, and saves the user record.
* **Request Body**: `UserCreate` (email, password, full_name, etc.)
* **Response**: `UserResponse` (id, email, full_name, is_active, created_at, updated_at)

---

## 6. Known Issues & Limitations

* None currently. Core endpoints run and database integration works.

---

## 7. Next Phase: Phase 1, Step 11 — Authentication & Token Generation (JWT)

Planned tasks:
- Install `pyjwt` or `python-jose` for generating JSON Web Tokens.
- Implement login endpoint (`POST /api/v1/login/access-token`) using OAuth2 password flow.
- Add user authentication dependency (`get_current_user`) to secure future endpoints.



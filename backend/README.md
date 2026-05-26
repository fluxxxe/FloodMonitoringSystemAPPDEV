# Flood Monitoring System – Backend

> **Project Overview**
This repository contains the backend for the Flood Monitoring System. It provides a RESTful API built with **FastAPI** (and optional Django components) that ingests sensor data, stores it in SQLite, and serves real‑time water‑level information to the frontend.

---

## Setup
1. **Create a virtual environment**
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate   # Windows
   ```
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Apply migrations / initialise DB** (if using Django models)
   ```bash
   python manage.py migrate
   ```
4. **Run the development server**
   ```bash
   uvicorn fastapi_backend.main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`.

---

## API Documentation
The API is automatically documented with **OpenAPI**. After starting the server, visit:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Redoc: `http://127.0.0.1:8000/redoc`

### Core Endpoints (example)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/waters/` | List recent water‑level readings |
| POST | `/api/waters/` | Submit a new sensor reading |
| GET | `/api/alerts/` | Retrieve active flood alerts |

*(Add detailed endpoint docs as the API evolves.)*

---

## Testing
Tests are written with **pytest**.
```bash
pytest
```
Ensure the virtual environment is active and all dev dependencies are installed.

---

## Deployment
The backend can be containerised with Docker:
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
CMD ["uvicorn", "fastapi_backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
Deploy to any platform that supports Docker (AWS ECS, Azure Container Instances, etc.) or to a traditional VM.

---

## License
This project is licensed under the MIT License – see the `LICENSE` file for details.

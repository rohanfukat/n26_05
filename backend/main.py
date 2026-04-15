from fastapi import FastAPI, Depends, HTTPException
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db, engine, Base
from sqlalchemy import text

# ── Register all ORM models BEFORE create_all() ───────────────────────────────
import models.user       # users table
import models.grievance  # sessions + grievances tables

from routes.auth import router as auth_router
from routes.webhook import router as webhook_router
from routes.grievance import router as grievance_router

load_dotenv()

# ── Create all tables on startup (idempotent) ─────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Unified Grievance Intelligence & Resolution Platform",
    description="Government grievance aggregation, categorisation and resolution tracking API",
    version="1.0.0",
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(webhook_router)    # GET /webhook + POST /webhook
app.include_router(grievance_router)  # POST/GET/PATCH /grievances


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "online",
            "database": "connected",
            "message": "FastAPI server is responding on port 8000",
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Database connection failed")
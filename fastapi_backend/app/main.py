"""
FastAPI Backend – Flood Monitoring System
==========================================
Provides REST endpoints consumed by the React frontend and an
IoT ingest endpoint that hardware sensors can POST to.
"""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from . import models, schemas

# ── Create tables ──────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Flood Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple API key for the IoT device – change this for production!
IOT_API_KEY = "flood-iot-secret-2026"

# Thresholds as % of max_level (used when ingesting IoT readings)
THRESHOLD_WARNING_PCT = 0.70
THRESHOLD_DANGER_PCT = 0.90
ALERT_DEDUP_MINUTES = 15
IOT_STALE_MINUTES = 5


# ── Startup: seed data ────────────────────────────────────────────────────────
@app.on_event("startup")
def seed_data():
    db = next(get_db())
    _migrate_incident_columns(db)
    if db.query(models.WaterLevel).count() == 0:
        seeds = [
            models.WaterLevel(
                location_name="Cagayan De Oro River",
                current_level=8.0, max_level=10.0,
                status="Danger", trend="Rising",
            ),
            models.WaterLevel(
                location_name="Bigaan River",
                current_level=4.1, max_level=8.0,
                status="Normal", trend="Steady",
            ),
            models.WaterLevel(
                location_name="Bitan-ag Creek",
                current_level=7.0, max_level=10.0,
                status="Warning", trend="Rising",
            ),
            models.WaterLevel(
                location_name="Kauswagan Canal",
                current_level=3.5, max_level=7.0,
                status="Normal", trend="Falling",
            ),
            models.WaterLevel(
                location_name="Taguanao Creek",
                current_level=6.9, max_level=9.0,
                status="Warning", trend="Steady",
            ),
            models.WaterLevel(
                location_name="Iponan River",
                current_level=9.2, max_level=10.5,
                status="Danger", trend="Rising",
            ),
        ]
        db.add_all(seeds)
        db.commit()

    if db.query(models.Alert).count() == 0:
        db.add(models.Alert(
            title="High Water Level",
            message="Central Dam water level is approaching maximum capacity.",
            type="danger",
        ))
        db.commit()
    db.close()


# ── Helpers ────────────────────────────────────────────────────────────────────
def _migrate_incident_columns(db: Session) -> None:
    """Add new incident_reports columns on existing SQLite DBs."""
    columns = [
        ("email", "VARCHAR"),
        ("contact_number", "VARCHAR"),
        ("urgency", "VARCHAR DEFAULT 'Medium'"),
        ("observed_level", "FLOAT"),
        ("notes", "VARCHAR"),
    ]
    for name, col_type in columns:
        try:
            db.execute(text(f"ALTER TABLE incident_reports ADD COLUMN {name} {col_type}"))
            db.commit()
        except Exception:
            db.rollback()


def compute_status_from_level(current_level: float, max_level: float) -> str:
    if max_level <= 0:
        return "Normal"
    ratio = current_level / max_level
    if ratio >= THRESHOLD_DANGER_PCT:
        return "Danger"
    if ratio >= THRESHOLD_WARNING_PCT:
        return "Warning"
    return "Normal"


def _should_create_danger_alert(db: Session, location_name: str) -> bool:
    cutoff = datetime.utcnow() - timedelta(minutes=ALERT_DEDUP_MINUTES)
    recent = (
        db.query(models.Alert)
        .filter(
            models.Alert.type == "danger",
            models.Alert.title.contains(location_name),
            models.Alert.created_at >= cutoff,
        )
        .first()
    )
    return recent is None


def _to_camel_water(w: models.WaterLevel) -> dict:
    return {
        "id": w.id,
        "locationName": w.location_name,
        "currentLevel": str(w.current_level),
        "maxLevel": str(w.max_level),
        "status": w.status,
        "trend": w.trend,
        "lastUpdated": w.last_updated.isoformat() if w.last_updated else None,
    }


def _to_camel_alert(a: models.Alert) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "message": a.message,
        "type": a.type,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }


def _to_camel_report(r: models.IncidentReport) -> dict:
    return {
        "id": r.id,
        "reporterName": r.reporter_name,
        "incidentType": r.incident_type,
        "rescueNeeds": r.rescue_needs,
        "location": r.location,
        "email": r.email or "",
        "contactNumber": r.contact_number or "",
        "urgency": r.urgency or "Medium",
        "observedLevel": r.observed_level,
        "notes": r.notes or "",
        "createdAt": r.created_at.isoformat() if r.created_at else None,
    }


def _to_camel_product(p: models.Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": str(p.price),
        "createdAt": p.created_at.isoformat() if p.created_at else None,
    }


def _to_camel_iot(r: models.IoTReading) -> dict:
    return {
        "id": r.id,
        "locationName": r.location_name,
        "currentLevel": str(r.current_level),
        "status": r.status,
        "trend": r.trend,
        "timestamp": r.timestamp.isoformat() if r.timestamp else None,
    }


# ══════════════════════════════════════════════════════════════════════════════
#  HEALTH
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/health/")
def health_check(db: Session = Depends(get_db)):
    latest_iot = (
        db.query(models.IoTReading)
        .order_by(models.IoTReading.timestamp.desc())
        .first()
    )
    latest_at = latest_iot.timestamp if latest_iot else None
    iot_stale = False
    if latest_at:
        iot_stale = (datetime.utcnow() - latest_at) > timedelta(minutes=IOT_STALE_MINUTES)

    return {
        "status": "ok",
        "db": True,
        "stationCount": db.query(models.WaterLevel).count(),
        "alertCount": db.query(models.Alert).count(),
        "iotReadingCount": db.query(models.IoTReading).count(),
        "latestIotAt": latest_at.isoformat() if latest_at else None,
        "latestIotLocation": latest_iot.location_name if latest_iot else None,
        "iotStale": iot_stale,
        "thresholds": {
            "warningPct": THRESHOLD_WARNING_PCT,
            "dangerPct": THRESHOLD_DANGER_PCT,
        },
    }


# ══════════════════════════════════════════════════════════════════════════════
#  WATER LEVELS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/water-levels/")
def list_water_levels(db: Session = Depends(get_db)):
    return [_to_camel_water(w) for w in db.query(models.WaterLevel).all()]


@app.post("/api/water-levels/", status_code=201)
def create_water_level(payload: schemas.WaterLevelCreate, db: Session = Depends(get_db)):
    w = models.WaterLevel(**payload.model_dump())
    db.add(w)
    db.commit()
    db.refresh(w)
    return _to_camel_water(w)


@app.put("/api/water-levels/{item_id}/")
def update_water_level(item_id: int, payload: schemas.WaterLevelUpdate, db: Session = Depends(get_db)):
    w = db.query(models.WaterLevel).get(item_id)
    if not w:
        raise HTTPException(404, "Water level not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(w, k, v)
    w.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(w)
    return _to_camel_water(w)


@app.delete("/api/water-levels/{item_id}/", status_code=204)
def delete_water_level(item_id: int, db: Session = Depends(get_db)):
    w = db.query(models.WaterLevel).get(item_id)
    if not w:
        raise HTTPException(404, "Water level not found")
    db.delete(w)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
#  ALERTS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/alerts/")
def list_alerts(db: Session = Depends(get_db)):
    return [_to_camel_alert(a) for a in db.query(models.Alert).order_by(models.Alert.created_at.desc()).all()]


@app.post("/api/alerts/", status_code=201)
def create_alert(payload: schemas.AlertCreate, db: Session = Depends(get_db)):
    a = models.Alert(**payload.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return _to_camel_alert(a)


@app.delete("/api/alerts/{item_id}/", status_code=204)
def delete_alert(item_id: int, db: Session = Depends(get_db)):
    a = db.query(models.Alert).get(item_id)
    if not a:
        raise HTTPException(404, "Alert not found")
    db.delete(a)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
#  INCIDENT REPORTS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/reports/")
def list_reports(db: Session = Depends(get_db)):
    return [_to_camel_report(r) for r in db.query(models.IncidentReport).order_by(models.IncidentReport.created_at.desc()).all()]


@app.post("/api/reports/", status_code=201)
def create_report(payload: schemas.IncidentReportCreate, db: Session = Depends(get_db)):
    r = models.IncidentReport(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return _to_camel_report(r)


@app.delete("/api/reports/{item_id}/", status_code=204)
def delete_report(item_id: int, db: Session = Depends(get_db)):
    r = db.query(models.IncidentReport).get(item_id)
    if not r:
        raise HTTPException(404, "Report not found")
    db.delete(r)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
#  PRODUCTS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/products/")
def list_products(db: Session = Depends(get_db)):
    return [_to_camel_product(p) for p in db.query(models.Product).all()]


@app.post("/api/products/", status_code=201)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    p = models.Product(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return _to_camel_product(p)


@app.delete("/api/products/{item_id}/", status_code=204)
def delete_product(item_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Product).get(item_id)
    if not p:
        raise HTTPException(404, "Product not found")
    db.delete(p)
    db.commit()


# ══════════════════════════════════════════════════════════════════════════════
#  IOT INGEST   –  POST /api/iot/reading/
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/iot/reading/", status_code=201)
def iot_push_reading(payload: schemas.IoTReadingCreate, db: Session = Depends(get_db)):
    """
    Endpoint for the IoT hardware sensor to push water-level data.

    Example curl from the device:
        curl -X POST http://<server>:8001/api/iot/reading/ \\
             -H "Content-Type: application/json" \\
             -d '{"location_name":"Cagayan De Oro River","current_level":8.5,
                  "status":"Danger","trend":"Rising","api_key":"flood-iot-secret-2026"}'
    """
    # Authenticate
    if payload.api_key != IOT_API_KEY:
        raise HTTPException(403, "Invalid API key")

    # Resolve max level and compute status from thresholds
    water = (
        db.query(models.WaterLevel)
        .filter(models.WaterLevel.location_name == payload.location_name)
        .first()
    )
    max_level = (water.max_level if water else None) or payload.max_level or 10.0
    computed_status = compute_status_from_level(payload.current_level, max_level)

    # 1. Log the raw reading
    reading = models.IoTReading(
        location_name=payload.location_name,
        current_level=payload.current_level,
        status=computed_status,
        trend=payload.trend,
    )
    db.add(reading)

    # 2. Upsert the live water-level row
    if water:
        water.current_level = payload.current_level
        water.status = computed_status
        water.trend = payload.trend
        water.last_updated = datetime.utcnow()
    else:
        water = models.WaterLevel(
            location_name=payload.location_name,
            current_level=payload.current_level,
            max_level=max_level,
            status=computed_status,
            trend=payload.trend,
        )
        db.add(water)

    # 3. Auto-create a deduplicated alert when status is Danger
    if computed_status == "Danger" and _should_create_danger_alert(db, payload.location_name):
        pct = round((payload.current_level / max_level) * 100, 1) if max_level else 0
        db.add(models.Alert(
            title=f"IoT Danger – {payload.location_name}",
            message=(
                f"Sensor reading {payload.current_level:.2f}m ({pct}% of max, {payload.trend}). "
                "Automated alert."
            ),
            type="danger",
        ))

    db.commit()
    db.refresh(reading)
    return _to_camel_iot(reading)


@app.get("/api/iot/readings/")
def list_iot_readings(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Return the most recent IoT readings (newest first)."""
    rows = (
        db.query(models.IoTReading)
        .order_by(models.IoTReading.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [_to_camel_iot(r) for r in rows]


@app.get("/api/iot/latest/")
def latest_iot_reading(
    location_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return the single most-recent IoT reading (or null)."""
    query = db.query(models.IoTReading)
    if location_name:
        query = query.filter(models.IoTReading.location_name == location_name)
    row = query.order_by(models.IoTReading.timestamp.desc()).first()
    if not row:
        return None
    return _to_camel_iot(row)


@app.get("/api/iot/history/")
def iot_history(
    location_name: str = Query(..., min_length=1),
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
):
    """Return IoT readings for a location within the last N hours (oldest first)."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    rows = (
        db.query(models.IoTReading)
        .filter(
            models.IoTReading.location_name == location_name,
            models.IoTReading.timestamp >= cutoff,
        )
        .order_by(models.IoTReading.timestamp.asc())
        .all()
    )
    return [
        {
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "level": float(r.current_level),
            "status": r.status,
            "trend": r.trend,
        }
        for r in rows
    ]

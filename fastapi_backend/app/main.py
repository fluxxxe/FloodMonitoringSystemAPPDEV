"""
FastAPI Backend – Flood Monitoring System
==========================================
Provides REST endpoints consumed by the React frontend and an
IoT ingest endpoint that hardware sensors can POST to.
"""

from datetime import datetime
from typing import List

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
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


# ── Startup: seed data ────────────────────────────────────────────────────────
@app.on_event("startup")
def seed_data():
    db = next(get_db())
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

    # 1. Log the raw reading
    reading = models.IoTReading(
        location_name=payload.location_name,
        current_level=payload.current_level,
        status=payload.status,
        trend=payload.trend,
    )
    db.add(reading)

    # 2. Upsert the live water-level row
    water = (
        db.query(models.WaterLevel)
        .filter(models.WaterLevel.location_name == payload.location_name)
        .first()
    )
    if water:
        water.current_level = payload.current_level
        water.status = payload.status
        water.trend = payload.trend
        water.last_updated = datetime.utcnow()
    else:
        water = models.WaterLevel(
            location_name=payload.location_name,
            current_level=payload.current_level,
            max_level=payload.max_level or 10.0,
            status=payload.status,
            trend=payload.trend,
        )
        db.add(water)

    # 3. Auto-create an alert when status is Danger
    if payload.status == "Danger":
        db.add(models.Alert(
            title=f"IoT Danger – {payload.location_name}",
            message=f"Sensor reading {payload.current_level}m ({payload.trend}). Automated alert.",
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

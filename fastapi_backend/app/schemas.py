from pydantic import BaseModel
from typing import Optional


# ── Water Level ────────────────────────────────────────────────────────────────
class WaterLevelCreate(BaseModel):
    location_name: str
    current_level: float
    max_level: float
    status: str = "Normal"
    trend: str = "Steady"


class WaterLevelUpdate(BaseModel):
    location_name: Optional[str] = None
    current_level: Optional[float] = None
    max_level: Optional[float] = None
    status: Optional[str] = None
    trend: Optional[str] = None


# ── Alert ──────────────────────────────────────────────────────────────────────
class AlertCreate(BaseModel):
    title: str
    message: str
    type: str = "info"


# ── Incident Report ────────────────────────────────────────────────────────────
class IncidentReportCreate(BaseModel):
    reporter_name: str
    incident_type: str
    rescue_needs: str = ""
    location: str


# ── Product ────────────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float


# ── IoT Reading ────────────────────────────────────────────────────────────────
class IoTReadingCreate(BaseModel):
    """Payload sent by the IoT hardware sensor."""
    location_name: str
    current_level: float
    status: str = "Normal"
    trend: str = "Steady"
    max_level: Optional[float] = None   # Used only when creating a brand-new location
    api_key: str                        # Required for authentication

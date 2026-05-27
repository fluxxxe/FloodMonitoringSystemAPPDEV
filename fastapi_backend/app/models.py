from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, func
from .database import Base


class WaterLevel(Base):
    __tablename__ = "water_levels"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, index=True, nullable=False)
    current_level = Column(Float, nullable=False)
    max_level = Column(Float, nullable=False)
    status = Column(String, default="Normal")   # Normal | Warning | Danger
    trend = Column(String, default="Steady")    # Steady | Rising | Falling
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")       # info | warning | danger
    created_at = Column(DateTime, default=datetime.utcnow)


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String, nullable=False)
    incident_type = Column(String, nullable=False)
    rescue_needs = Column(String, default="")
    location = Column(String, nullable=False)
    email = Column(String, default="")
    contact_number = Column(String, default="")
    urgency = Column(String, default="Medium")
    observed_level = Column(Float, nullable=True)
    notes = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class IoTReading(Base):
    """Raw log of every push from the IoT sensor device."""
    __tablename__ = "iot_readings"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String, nullable=False)
    current_level = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    trend = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

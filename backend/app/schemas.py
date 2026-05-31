from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IssueCreate(BaseModel):
    description: str
    category: str
    latitude: float
    longitude: float
    address: Optional[str] = ""
    area: Optional[str] = ""
    reporter_name: Optional[str] = ""
    reporter_phone: Optional[str] = ""
    reporter_email: Optional[str] = ""
    transcript: Optional[str] = ""


class IssueResponse(BaseModel):
    id: str
    tracking_id: str
    description: str
    category: str
    status: str
    latitude: float
    longitude: float
    address: str
    area: str
    authority_name: str
    authority_contact: str
    authority_email: str
    photo_path: str
    transcript: str
    reporter_name: str
    reporter_phone: str
    reporter_email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: str


class StatsResponse(BaseModel):
    total: int
    pending: int
    acknowledged: int
    in_progress: int
    resolved: int
    by_category: dict

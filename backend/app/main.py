from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import os
import uuid
import shutil

from app.models import get_db, init_db, Issue
from app.schemas import IssueResponse, StatusUpdate, StatsResponse
from app.classifier import classify_issue, get_authority_for_category

app = FastAPI(title="CivicBLR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup():
    init_db()


@app.post("/api/issues", response_model=IssueResponse)
async def create_issue(
    description: str = Form(...),
    category: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(""),
    area: str = Form(""),
    reporter_name: str = Form(""),
    reporter_phone: str = Form(""),
    reporter_email: str = Form(""),
    transcript: str = Form(""),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    photo_path = ""
    if photo:
        ext = os.path.splitext(photo.filename)[1] if photo.filename else ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_path = filename

    from app.classifier import AUTHORITIES as VALID_CATEGORIES
    if category == "auto" or category not in VALID_CATEGORIES:
        result = classify_issue(description)
        if result["category"] and result["category"] != "unknown":
            category = result["category"]

    authority = get_authority_for_category(category)

    issue = Issue(
        description=description,
        category=category,
        latitude=latitude,
        longitude=longitude,
        address=address,
        area=area,
        authority_name=authority.get("name", ""),
        authority_contact=authority.get("helpline", ""),
        authority_email=authority.get("email", ""),
        photo_path=photo_path,
        transcript=transcript,
        reporter_name=reporter_name,
        reporter_phone=reporter_phone,
        reporter_email=reporter_email,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@app.get("/api/issues", response_model=list[IssueResponse])
def list_issues(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Issue)
    if status:
        query = query.filter(Issue.status == status)
    if category:
        query = query.filter(Issue.category == category)
    if area:
        query = query.filter(Issue.area.ilike(f"%{area}%"))
    return query.order_by(Issue.created_at.desc()).all()


@app.get("/api/issues/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@app.get("/api/issues/track/{tracking_id}", response_model=IssueResponse)
def track_issue(tracking_id: str, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.tracking_id == tracking_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@app.patch("/api/issues/{issue_id}/status", response_model=IssueResponse)
def update_status(issue_id: str, update: StatusUpdate, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    valid_statuses = ["pending", "acknowledged", "in_progress", "resolved"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    issue.status = update.status
    db.commit()
    db.refresh(issue)
    return issue


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Issue.id)).scalar()
    pending = db.query(func.count(Issue.id)).filter(Issue.status == "pending").scalar()
    acknowledged = db.query(func.count(Issue.id)).filter(Issue.status == "acknowledged").scalar()
    in_progress = db.query(func.count(Issue.id)).filter(Issue.status == "in_progress").scalar()
    resolved = db.query(func.count(Issue.id)).filter(Issue.status == "resolved").scalar()

    by_category = {}
    category_counts = db.query(Issue.category, func.count(Issue.id)).group_by(Issue.category).all()
    for cat, count in category_counts:
        by_category[cat] = count

    return StatsResponse(
        total=total,
        pending=pending,
        acknowledged=acknowledged,
        in_progress=in_progress,
        resolved=resolved,
        by_category=by_category
    )

from sqlalchemy import create_engine, Column, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import uuid

DATABASE_URL = "sqlite:///./civic.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def generate_tracking_id():
    year = datetime.now().year
    rand_part = uuid.uuid4().hex[:6].upper()
    return f"BLR-{year}-{rand_part}"


class Issue(Base):
    __tablename__ = "issues"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_id = Column(String, unique=True, index=True, default=generate_tracking_id)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="pending", index=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, default="")
    area = Column(String(100), default="")

    authority_name = Column(String(200), default="")
    authority_contact = Column(String(50), default="")
    authority_email = Column(String(200), default="")

    photo_path = Column(String(500), default="")
    transcript = Column(Text, default="")

    reporter_name = Column(String(100), default="")
    reporter_phone = Column(String(20), default="")
    reporter_email = Column(String(100), default="")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)

import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel

# 1. Configuration: Extract environment variables
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "feedback_db")

# Connection string for SQLAlchemy
DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DATABASE}"

# 2. Database Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Model
class Feedback(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    student_name = Column(String(100), index=True)
    message = Column(Text, nullable=False)

# Auto-create tables (in production, use Alembic migrations instead)
Base.metadata.create_all(bind=engine)

# 3. FastAPI App Initialization
app = FastAPI(title="Campus Feedback API")

# Pydantic Schemas for Request/Response validation
class FeedbackCreate(BaseModel):
    student_name: str
    message: str

class FeedbackResponse(BaseModel):
    id: int
    student_name: str
    message: str

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy models

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. API Endpoints
@app.post("/api/feedback", response_model=FeedbackResponse)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    new_feedback = Feedback(student_name=feedback.student_name, message=feedback.message)
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback

@app.get("/api/feedback", response_model=list[FeedbackResponse])
def get_feedbacks(db: Session = Depends(get_db)):
    return db.query(Feedback).all()
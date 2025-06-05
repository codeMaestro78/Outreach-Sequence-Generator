from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn

from .database import SessionLocal, engine
from . import models, schemas, services

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Outreach Sequence Generator")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to Outreach Sequence Generator API"}

@app.post("/templates/", response_model=schemas.Template)
def create_template(template: schemas.TemplateCreate, db: Session = Depends(get_db)):
    return services.create_template(db=db, template=template)

@app.get("/templates/", response_model=List[schemas.Template])
def get_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_templates(db=db, skip=skip, limit=limit)

@app.post("/sequences/generate", response_model=schemas.Sequence)
def generate_sequence(
    lead_data: schemas.LeadData,
    template_id: int,
    db: Session = Depends(get_db)
):
    return services.generate_sequence(db=db, lead_data=lead_data, template_id=template_id)

@app.post("/sequences/send")
def send_sequence(sequence_id: int, db: Session = Depends(get_db)):
    return services.send_sequence(db=db, sequence_id=sequence_id)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 
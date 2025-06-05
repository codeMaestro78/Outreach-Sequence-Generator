from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from collections import defaultdict
import json

app = FastAPI(title="Automated Outreach Sequence Generator")




# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Template(BaseModel):
    id: Optional[int] = None
    name: str
    subject: str
    content: str
    variables: List[str] = []

class SequenceStep(BaseModel):
    template_id: int
    delay_days: int
    status: str = "pending"
    sent_at: Optional[datetime] = None

class Sequence(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    steps: List[SequenceStep]
    status: str = "draft"
    created_at: datetime = datetime.now()
    sent_at: Optional[datetime] = None
    sent_count: int = 0
    total_steps: int = 0
    response_rate: float = 0.0
    engagement_score: float = 0.0

class Contact(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    company: str
    position: str
    industry: str
    company_size: str
    engagement_score: float = 0.0
    last_contacted: Optional[datetime] = None
    response_history: List[dict] = []

# In-memory storage (replace with database in production)
templates = []
sequences = []
contacts = []
sent_emails = []

# Machine Learning Models
class EngagementPredictor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.engagement_scores = defaultdict(float)
        self.response_history = defaultdict(list)
        
    def update_engagement_score(self, contact_id: int, response_type: str, content: str):
        # Update response history
        self.response_history[contact_id].append({
            'type': response_type,
            'content': content,
            'timestamp': datetime.now().isoformat()
        })
        
        # Calculate engagement score based on response type
        score_weights = {
            'positive': 1.0,
            'neutral': 0.5,
            'negative': 0.2,
            'no_response': 0.0
        }
        
        # Update engagement score with decay
        current_score = self.engagement_scores[contact_id]
        new_score = score_weights.get(response_type, 0.0)
        self.engagement_scores[contact_id] = (current_score * 0.7) + (new_score * 0.3)
        
        return self.engagement_scores[contact_id]

    def predict_best_time(self, contact_id: int) -> dict:
        # Analyze response history to predict best time to send
        history = self.response_history[contact_id]
        if not history:
            return {'day': 'monday', 'hour': 10}
            
        # Simple time-based analysis
        response_times = [datetime.fromisoformat(r['timestamp']) for r in history]
        best_hour = max(range(24), key=lambda h: sum(1 for t in response_times if t.hour == h))
        best_day = max(range(7), key=lambda d: sum(1 for t in response_times if t.weekday() == d))
        
        return {
            'day': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][best_day],
            'hour': best_hour
        }

    def get_similar_contacts(self, contact_id: int, n: int = 5) -> List[int]:
        # Find similar contacts based on response patterns
        if not self.response_history:
            return []
            
        # Create response pattern vectors
        patterns = []
        contact_ids = []
        for cid, history in self.response_history.items():
            if cid != contact_id:
                pattern = [1 if r['type'] == 'positive' else 0 for r in history]
                patterns.append(pattern)
                contact_ids.append(cid)
                
        if not patterns:
            return []
            
        # Calculate similarity
        target_pattern = [1 if r['type'] == 'positive' else 0 for r in self.response_history[contact_id]]
        similarities = [cosine_similarity([target_pattern], [p])[0][0] for p in patterns]
        
        # Get top N similar contacts
        similar_indices = np.argsort(similarities)[-n:][::-1]
        return [contact_ids[i] for i in similar_indices]

engagement_predictor = EngagementPredictor()

# Routes
@app.get("/")
def read_root():
    return {"message": "Welcome to the Outreach Sequence Generator API"}

@app.get("/templates/", response_model=List[Template])
async def get_templates():
    return templates

@app.post("/templates/", response_model=Template)
async def create_template(template: Template):
    template.id = len(templates) + 1
    templates.append(template)
    return template

@app.put("/templates/{template_id}", response_model=Template)
async def update_template(template_id: int, template: Template):
    for i, t in enumerate(templates):
        if t.id == template_id:
            template.id = template_id
            templates[i] = template
            return template
    raise HTTPException(status_code=404, detail="Template not found")

@app.delete("/templates/{template_id}")
async def delete_template(template_id: int):
    for i, template in enumerate(templates):
        if template.id == template_id:
            templates.pop(i)
            return {"message": "Template deleted"}
    raise HTTPException(status_code=404, detail="Template not found")

@app.get("/sequences/", response_model=List[Sequence])
async def get_sequences():
    return sequences

@app.post("/sequences/", response_model=Sequence)
async def create_sequence(sequence: Sequence):
    sequence.id = len(sequences) + 1
    sequence.total_steps = len(sequence.steps)
    sequences.append(sequence)
    return sequence

@app.put("/sequences/{sequence_id}", response_model=Sequence)
async def update_sequence(sequence_id: int, sequence: Sequence):
    for i, s in enumerate(sequences):
        if s.id == sequence_id:
            sequence.id = sequence_id
            sequence.total_steps = len(sequence.steps)
            sequences[i] = sequence
            return sequence
    raise HTTPException(status_code=404, detail="Sequence not found")

@app.delete("/sequences/{sequence_id}")
async def delete_sequence(sequence_id: int):
    for i, sequence in enumerate(sequences):
        if sequence.id == sequence_id:
            sequences.pop(i)
            return {"message": "Sequence deleted"}
    raise HTTPException(status_code=404, detail="Sequence not found")

@app.post("/sequences/{sequence_id}/send")
async def send_sequence(sequence_id: int, contact_id: int):
    sequence = next((s for s in sequences if s.id == sequence_id), None)
    if not sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
        
    contact = next((c for c in contacts if c.id == contact_id), None)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    # Update sequence status
    sequence.status = "active"
    sequence.sent_at = datetime.now()
    
    # Record sent email
    sent_email = {
        "sequence_id": sequence_id,
        "contact_id": contact_id,
        "sent_at": datetime.now(),
        "steps": []
    }
    
    # Process each step
    for step in sequence.steps:
        template = next((t for t in templates if t.id == step.template_id), None)
        if template:
            # Send email (implement your email sending logic here)
            # For now, we'll just record it
            step.status = "sent"
            step.sent_at = datetime.now()
            sequence.sent_count += 1
            
            sent_email["steps"].append({
                "template_id": template.id,
                "sent_at": step.sent_at,
                "status": step.status
            })
            
            # Update contact's last contacted time
            contact.last_contacted = datetime.now()
            
            # Add delay between steps
            if step.delay_days > 0:
                # In a real implementation, you would schedule the next email
                pass
    
    sent_emails.append(sent_email)
    return {"message": "Sequence sent successfully", "sent_email": sent_email}

@app.post("/contacts/{contact_id}/response")
async def record_response(contact_id: int, response_type: str, content: str):
    contact = next((c for c in contacts if c.id == contact_id), None)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    # Update engagement score
    new_score = engagement_predictor.update_engagement_score(contact_id, response_type, content)
    contact.engagement_score = new_score
    
    # Record response
    contact.response_history.append({
        "type": response_type,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })
    
    return {
        "message": "Response recorded",
        "engagement_score": new_score,
        "best_time": engagement_predictor.predict_best_time(contact_id)
    }

@app.get("/contacts/{contact_id}/similar")
async def get_similar_contacts(contact_id: int, n: int = 5):
    similar_ids = engagement_predictor.get_similar_contacts(contact_id, n)
    similar_contacts = [c for c in contacts if c.id in similar_ids]
    return similar_contacts

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    return {
        "total_sequences": len(sequences),
        "sent_sequences": len([s for s in sequences if s.status == "active"]),
        "draft_sequences": len([s for s in sequences if s.status == "draft"]),
        "templates": len(templates),
        "active_sequences": len([s for s in sequences if s.status == "active"]),
        "total_contacts": len(contacts),
        "response_rate": calculate_response_rate(),
        "recent_sequences": get_recent_sequences()
    }

def calculate_response_rate():
    if not sent_emails:
        return 0.0
    
    total_sent = sum(len(email["steps"]) for email in sent_emails)
    total_responses = sum(1 for contact in contacts if contact.response_history)
    
    return (total_responses / total_sent * 100) if total_sent > 0 else 0.0

def get_recent_sequences():
    recent = sorted(sequences, key=lambda x: x.created_at, reverse=True)[:5]
    return [
        {
            "id": s.id,
            "name": s.name,
            "status": s.status,
            "created_at": s.created_at,
            "sent_count": s.sent_count,
            "total_steps": s.total_steps
        }
        for s in recent
    ]

@app.patch("/sequences/{sequence_id}")
async def update_sequence_status(sequence_id: int, status_update: dict):
    for i, sequence in enumerate(sequences):
        if sequence.id == sequence_id:
            sequence.status = status_update.get("status", sequence.status)
            return sequence
    raise HTTPException(status_code=404, detail="Sequence not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 
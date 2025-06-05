from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class TemplateBase(BaseModel):
    name: str
    subject: str
    body: str

class TemplateCreate(TemplateBase):
    pass

class Template(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class LeadData(BaseModel):
    name: str
    email: EmailStr
    company: str
    position: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    recent_news: Optional[str] = None

class SequenceBase(BaseModel):
    template_id: int
    lead_name: str
    lead_email: EmailStr
    lead_company: str
    lead_position: str
    personalized_subject: str
    personalized_body: str
    status: str

class SequenceCreate(SequenceBase):
    pass

class Sequence(SequenceBase):
    id: int
    created_at: datetime
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True 
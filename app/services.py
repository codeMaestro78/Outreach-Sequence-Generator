from sqlalchemy.orm import Session
from datetime import datetime
import spacy
import re
from typing import List
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

from . import models, schemas

# Load environment variables
load_dotenv()

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Download the model if it's not available
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def create_template(db: Session, template: schemas.TemplateCreate) -> models.Template:
    db_template = models.Template(
        name=template.name,
        subject=template.subject,
        body=template.body
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_templates(db: Session, skip: int = 0, limit: int = 100) -> List[models.Template]:
    return db.query(models.Template).offset(skip).limit(limit).all()

def personalize_content(content: str, lead_data: schemas.LeadData) -> str:
    """Personalize content using NLP and template variables."""
    # Replace basic variables
    variables = {
        "{{name}}": lead_data.name,
        "{{company}}": lead_data.company,
        "{{position}}": lead_data.position,
        "{{industry}}": lead_data.industry or "your industry",
        "{{company_size}}": lead_data.company_size or "your company size"
    }
    
    for var, value in variables.items():
        content = content.replace(var, value)
    
    # Use NLP for more advanced personalization
    doc = nlp(content)
    
    # Add company-specific context if available
    if lead_data.recent_news:
        content += f"\n\nI noticed {lead_data.company} {lead_data.recent_news}"
    
    return content

def generate_sequence(
    db: Session,
    lead_data: schemas.LeadData,
    template_id: int
) -> models.Sequence:
    # Get template
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if not template:
        raise ValueError("Template not found")
    
    # Personalize content
    personalized_subject = personalize_content(template.subject, lead_data)
    personalized_body = personalize_content(template.body, lead_data)
    
    # Create sequence
    sequence = models.Sequence(
        template_id=template_id,
        lead_name=lead_data.name,
        lead_email=lead_data.email,
        lead_company=lead_data.company,
        lead_position=lead_data.position,
        personalized_subject=personalized_subject,
        personalized_body=personalized_body,
        status="draft"
    )
    
    db.add(sequence)
    db.commit()
    db.refresh(sequence)
    return sequence

async def send_sequence(db: Session, sequence_id: int) -> dict:
    sequence = db.query(models.Sequence).filter(models.Sequence.id == sequence_id).first()
    if not sequence:
        raise ValueError("Sequence not found")
    
    # Create email message
    message = MIMEMultipart()
    message["From"] = os.getenv("SMTP_USERNAME")
    message["To"] = sequence.lead_email
    message["Subject"] = sequence.personalized_subject
    
    message.attach(MIMEText(sequence.personalized_body, "plain"))
    
    try:
        # Send email
        async with aiosmtplib.SMTP(
            hostname=os.getenv("SMTP_HOST"),
            port=int(os.getenv("SMTP_PORT", "587")),
            use_tls=True
        ) as smtp:
            await smtp.login(
                os.getenv("SMTP_USERNAME"),
                os.getenv("SMTP_PASSWORD")
            )
            await smtp.send_message(message)
        
        # Update sequence status
        sequence.status = "sent"
        sequence.sent_at = datetime.utcnow()
        db.commit()
        
        return {"status": "success", "message": "Email sent successfully"}
    except Exception as e:
        sequence.status = "failed"
        db.commit()
        raise Exception(f"Failed to send email: {str(e)}") 
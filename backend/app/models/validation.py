"""Models pour les validation_points et la progression."""
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
import uuid

class ValidationPoint(BaseModel):
    """Point de validation détecté par bpmnlint ou IA."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    layer: int = Field(..., ge=1, le=6, description="Numéro de couche")
    source: Literal["bpmnlint", "ai" , "algorithm"] = Field(..., description="Source")
    category: str = Field(..., description="Catégorie du problème")
    bpmn_element_id: str = Field(..., description="ID élément BPMN")
    message: str = Field(..., max_length=200, description="Résumé")
    details: str = Field(..., description="Explication longue")
    recommendation: str = Field(..., description="Comment corriger")
    status: Literal["open", "resolved"] = Field(default="open")
    ignored: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    #new 
    domain_expert_feedback: str | None = Field(default=None)
    element_name: str | None = None

class Progression(BaseModel):
    """Progression gamifiée à travers les layers."""
    current_layer: int = Field(default=1, ge=1, le=6)
    completed_layers: list[int] = Field(default_factory=list)
    overall_score: float = Field(default=0.0, ge=0, le=100)

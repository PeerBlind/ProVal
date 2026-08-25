from pydantic import BaseModel, Field
from .validation import ValidationPoint, Progression
import uuid

class AnalyzeResponse(BaseModel):
    """Response complète avec tous les validation_points."""
    analysis_id: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )
    project_id: str
    progression: Progression
    validation_points: list[ValidationPoint] = Field(default_factory=list)

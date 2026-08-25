from pydantic import BaseModel, Field
#from typing import Literal
from typing import Optional

class AnalyzeRequest(BaseModel):
    """Requete pour analyser un diagramme BPMN."""
    bpmn_xml: str = Field(..., min_length=10)
    project_id: str = Field(...)

class UpdateStatusRequest(BaseModel):
    """Requete pour mettre à jour le statut d'un point."""
    project_id: str = Field(...)
    point_id: str = Field(...)
    status: Optional[str] = None
    ignored: Optional[bool] = None
    #analysis_id: str = Field(...)
    #point_id: str = Field(...)
    #status: Literal["open", "resolved"] | None = None
    #ignored: bool | None = None

from pydantic import BaseModel
from typing import List
from app.models.validation import ValidationPoint
from app.ai.category_layer_map import category_to_layer


class ValidationFinalReport(BaseModel):

    validation_points: List[ValidationPoint]


def convert_ai_points(ai_points):

    converted = []

    for p in ai_points:

        vp = ValidationPoint(

            layer=category_to_layer.get(p.category),

            source="ai",

            category=p.category,

            bpmn_element_id=p.bpmn_element_id,

            message=p.category,

            details=p.recommendation,

            recommendation=p.OpenQuestion

        )

        converted.append(vp)

    return converted
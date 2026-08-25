import httpx
from typing import List
from app.models.validation import ValidationPoint


async def validate_layer2(bpmn_xml: str) -> List[ValidationPoint]:
    """
    Analyse la soundness du BPMN via l'API TUM.
    """

    url = "https://passion.bpm.cit.tum.de/check_bpmn"

    payload = {
        "bpmn_file_content": bpmn_xml,
        "properties_to_be_checked": [
            "Safeness",
            "OptionToComplete",
            "ProperCompletion",
        ]
    }

    validation_points = []

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, json=payload)

        data = response.json()

        for prop in data.get("property_results", []):

            # seulement si problème
            if not prop.get("fulfilled", True):

                elements = prop.get("problematic_elements", [])

                # fallback si aucun élément
                if not elements:
                    elements = ["unknown"]

                for el in elements:
                    validation_points.append(
                        ValidationPoint(
                            layer=2,
                            source="algorithm",
                            category=prop["property"],
                            bpmn_element_id=el,
                            message=f"{prop['property']} violated",
                            details=f"The property {prop['property']} is not satisfied.",
                            recommendation="Review process logic and gateway synchronization."
                        )
                    )

        print(f"✅ Layer 2 (soundness): {len(validation_points)} issues")

    except Exception as e:
        print("❌ Soundness API error:", e)

    return validation_points
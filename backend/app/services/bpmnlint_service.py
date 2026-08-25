# app/services/bpmnlint_service.py
"""
Service pour appeler bpmnlint et convertir les résultats en ValidationPoints.
"""
import subprocess
import json
import tempfile
import os
from typing import List
from app.models.validation import ValidationPoint
from app.config import BPMNLINT_PATH

# Mapping des règles bpmnlint vers messages en français
RULE_MESSAGES = {
    "start-event-required": {
        "message": "start-event-required",
        "details": "...",
        "recommendation": "..."
    },
    "end-event-required": {
        "message": "end-event-required",
        "details": "...",
        "recommendation": "..."
    },
    "label-required": {
        "message": "label-required",
        "details": "...",
        "recommendation": "..."
    },
    "no-duplicate-sequence-flows": {
        "message": "no-duplicate-sequence-flows",
        "details": "...",
        "recommendation": "..."
    },
    "no-gateway-join-fork": {
        "message": "no-gateway-join-fork",
        "details": "...",
        "recommendation": "..."
    },
    "conditional-flows": {
        "message": "conditional-flows",
        "details": "...",
        "recommendation": "..."
    },
    "no-inclusive-gateway": {
        "message": "no-inclusive-gateway",
        "details": "...",
        "recommendation": "..."
    },
    "single-blank-start-event": {
        "message": "single-blank-start-event",
        "details": "...",
        "recommendation": "..."
    },
    "no-complex-gateway": {
        "message": "no-complex-gateway",
        "details": "...",
        "recommendation": "..."
    },
    "superfluous-gateway": {
        "message": "superfluous-gateway",
        "details": "...",
        "recommendation": "..."
    },
    "fake-join": {
        "message": "fake-join",
        "details": "...",
        "recommendation": "..."
    },
    "event-sub-process-typed-start-event": {
        "message": "event-sub-process-typed-start-event",
        "details": "...",
        "recommendation": "..."
    },
    "event-based-gateway": {
        "message": "event-based-gateway",
        "details": "...",
        "recommendation": "..."
    },
    "ad-hoc-sub-process": {
        "message": "ad-hoc-sub-process",
        "details": "...",
        "recommendation": "..."
    },
    "no-inclusive-gateway": {
        "message": "no-inclusive-gateway",
        "details": "...",
        "recommendation": "..."
    },
}


def validate_layer1(bpmn_xml: str) -> List[ValidationPoint]:
    """
    Valide la syntaxe BPMN avec bpmnlint (Layer 1).
    
    Args:
        bpmn_xml: Contenu XML du diagramme BPMN
    
    Returns:
        Liste de ValidationPoint pour le Layer 1
    """
    validation_points = []
    temp_path = None
    
    try:
        # Créer un fichier temporaire pour le BPMN
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.bpmn',
            delete=False,
            encoding='utf-8'
        ) as temp_file:
            temp_file.write(bpmn_xml)
            temp_path = temp_file.name
        
        # Appeler bpmnlint avec reporter JSON
        BPMNLINT_PATH = os.getenv("BPMNLINT_PATH", "bpmnlint")
        config_path = os.path.join(os.path.dirname(__file__), "../../.bpmnlintrc")
        result = subprocess.run(
            [BPMNLINT_PATH, "-c", config_path, "-f", "json", temp_path],
            capture_output=True,
            text=True,
            timeout=30    
        )
        #print("STDOUT:", result.stdout)
        #errors = parse_bpmnlint_output(result.stdout)
        #print("Parsed errors:", errors)
        #print("STDERR:", result.stderr)
        print("Running:", BPMNLINT_PATH)
        print("File:", temp_path)
         
        
        
        # Parser la sortie JSON
        if result.stdout:
            errors = parse_bpmnlint_output(result.stdout)

            # Convertir chaque erreur en ValidationPoint
            for issue in errors:

                rule_name = issue.get("rule", "unknown")
                element_id = issue.get("elementId", "unknown")

                # Récupérer les messages traduits
                rule_info = RULE_MESSAGES.get(
                rule_name,
            {
                "message": f"Issue BPMN : {rule_name}",
                "details": "...",
                "recommendation": "..."
            }
                )

                validation_points.append(
                    ValidationPoint(
                        layer=1,
                        source="bpmnlint",
                        category=rule_name,
                        bpmn_element_id=element_id,
                        **rule_info
                    )
            )
        print("Validation point created:", rule_name, element_id)
        print("Layer1 points:", len(validation_points))
        
    except subprocess.TimeoutExpired:
        print(" bpmnlint timeout")
    except FileNotFoundError:
        print(f" bpmnlint non trouvé. Vérifiez que '{BPMNLINT_PATH}' est installé.")
        print("   Installation : npm install -g bpmnlint")
    except json.JSONDecodeError as e:
        print(f" Erreur parsing JSON bpmnlint: {e}")
    except Exception as e:
        print(f" Erreur bpmnlint: {e}")
    finally:
        # Nettoyer le fichier temporaire
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass
    
    return validation_points

def parse_bpmnlint_output(output: str):
    points = []

    lines = output.split("\n")

    for line in lines:
        line = line.strip()

        if not line or "problems" in line:
            continue

        parts = line.split()

        if len(parts) < 4:
            continue

        element_id = parts[0]
        severity = parts[1]
        rule = parts[-1]

        message = " ".join(parts[2:-1])

        points.append({
            "elementId": element_id,
            "severity": severity,
            "rule": rule,
            "message": message
        })

    return points

#fonction helper pour mapper ID->NAME
def get_element_name(element_id: str, context: dict) -> str:
    # Chercher dans tasks
    for task in context.get("tasks", []):
        if task["id"] == element_id:
            if task.get("name"):
                return task["name"]

    # gateways
    for g in context.get("gateways", []):
        if g["id"] == element_id:
            return g["name"]

    # events
    for e in context.get("events", []):
        if e["id"] == element_id:
            return e["name"]

    return element_id  # fallback
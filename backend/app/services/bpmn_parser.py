"""
Parser BPMN XML pour extraire le contexte structuré.
"""
# app/services/bpmn_parser.py
from lxml import etree
import json

# Namespace BPMN 2.0
BPMN_NS = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}

def parse_bpmn_xml(xml_content: str) -> str:
    """
    Parse le XML BPMN et extrait un contexte structuré en JSON.
    """
    try:
        root = etree.fromstring(xml_content.encode('utf-8'))
    except Exception as e:
        raise ValueError(f"XML BPMN invalide: {e}")
    
    context = {
        "processes": [],
        "tasks": [],
        "gateways": [],
        "events": [],
        "sequence_flows": [],
        "message_flows": [],
        "pools": [],
    }
    
    # Extraire les processus
    for process in root.findall(".//bpmn:process", BPMN_NS):
        process_id = process.get("id")
        process_name = process.get("name", "Sans nom")
        
        context["processes"].append({
            "id": process_id,
            "name": process_name
        })
        
        # CORRECTION : Utiliser xpath() au lieu de findall() avec contains()
        # Extraire les tâches (tous types)
        for task in process.xpath(
            ".//bpmn:task | .//bpmn:userTask | .//bpmn:serviceTask | .//bpmn:manualTask", 
            namespaces=BPMN_NS):
            name = task.get("name")

            if not name or not name.strip():
                name = None

            context["tasks"].append({
                "id": task.get("id"),
                "name": name,
                "type": etree.QName(task).localname  # Meilleure façon d'extraire le type
            })
        
        # Extraire les gateways
        for gateway in process.xpath(".//*[contains(local-name(), 'Gateway')]", namespaces=BPMN_NS):
            context["gateways"].append({
                "id": gateway.get("id"),
                "type": etree.QName(gateway).localname,
                "name": gateway.get("name", "")
            })
        
        # Extraire les events
        for event in process.xpath(".//*[contains(local-name(), 'Event')]", namespaces=BPMN_NS):
            context["events"].append({
                "id": event.get("id"),
                "type": etree.QName(event).localname,
                "name": event.get("name", "")
            })
        
        # Extraire les sequence flows
        for flow in process.findall(".//bpmn:sequenceFlow", BPMN_NS):
            context["sequence_flows"].append({
                "id": flow.get("id"),
                "sourceRef": flow.get("sourceRef"),
                "targetRef": flow.get("targetRef"),
                "name": flow.get("name", "")
            })
    
    # Extraire les message flows
    for msg_flow in root.findall(".//bpmn:messageFlow", BPMN_NS):
        context["message_flows"].append({
            "id": msg_flow.get("id"),
            "sourceRef": msg_flow.get("sourceRef"),
            "targetRef": msg_flow.get("targetRef")
        })
    
    # Extraire les pools
    for participant in root.findall(".//bpmn:participant", BPMN_NS):
        context["pools"].append({
            "id": participant.get("id"),
            "name": participant.get("name", "Sans nom"),
            "processRef": participant.get("processRef")
        })
    
    return json.dumps(context, indent=2, ensure_ascii=False)
    
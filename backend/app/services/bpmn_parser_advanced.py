"""
Parser BPMN avancé.
Retourne une structure BPMN complète (processes, lanes, flowElements).
"""

import xml.etree.ElementTree as ET

NS = {
    "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
    "bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
    "dc": "http://www.omg.org/spec/DD/20100524/DC",
    "di": "http://www.omg.org/spec/DD/20100524/DI"
}


def strip_ns(tag):
    return tag.split("}")[-1]


# ----------------------
# EVENT DEFINITIONS
# ----------------------
def get_event_definition(elem):
    for child in elem:
        tag = strip_ns(child.tag)
        if tag.endswith("EventDefinition"):
            return tag.replace("EventDefinition", "")
    return None


# ----------------------
# COLLABORATIONS
# ----------------------
def parse_collaborations(root):
    collaborations = []

    for collab in root.findall("bpmn:collaboration", NS):
        participants = []

        for p in collab.findall("bpmn:participant", NS):
            participants.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "processRef": p.get("processRef")
            })

        collaborations.append({
            "id": collab.get("id"),
            "participants": participants
        })

    return collaborations


# ----------------------
# LANES
# ----------------------
def parse_lanes(proc):
    lanes = []

    for laneSet in proc.findall("bpmn:laneSet", NS):
        for lane in laneSet.findall("bpmn:lane", NS):
            lanes.append({
                "id": lane.get("id"),
                "name": lane.get("name"),
                "flowNodeRefs": [
                    ref.text for ref in lane.findall("bpmn:flowNodeRef", NS)
                ]
            })

    return lanes


# ----------------------
# TASKS / ACTIVITIES
# ----------------------
def parse_task(elem):
    tag = strip_ns(elem.tag)

    return {
        "type": "activity",
        "activityType": "task",
        "taskType": tag,  # userTask, serviceTask, etc.
        "bpmn_element_id": elem.get("id"),
        "name": elem.get("name")
    }


# ----------------------
# EVENTS
# ----------------------
def parse_event(elem):
    tag = strip_ns(elem.tag)

    return {
        "type": "event",
        "eventType": tag,  # startEvent, endEvent, intermediateCatchEvent...
        "eventDefinition": get_event_definition(elem),  # message, timer, error...
        "bpmn_element_id": elem.get("id"),
        "name": elem.get("name")
    }


# ----------------------
# GATEWAYS
# ----------------------
def parse_gateway(elem):
    tag = strip_ns(elem.tag)

    return {
        "type": "gateway",
        "gatewayType": tag,
        "bpmn_element_id": elem.get("id"),
        "name": elem.get("name")
    }


# ----------------------
# FLOWS
# ----------------------
def parse_sequence_flow(elem):
    return {
        "type": "sequenceFlow",
        "bpmn_element_id": elem.get("id"),
        "source": elem.get("sourceRef"),
        "target": elem.get("targetRef")
    }


# ----------------------
# SUBPROCESS
# ----------------------
def parse_subprocess(elem):
    return {
        "type": "activity",
        "activityType": "subProcess",
        "subProcessType": "eventSubProcess" if elem.get("triggeredByEvent") == "true" else "embedded",
        "bpmn_element_id": elem.get("id"),
        "name": elem.get("name"),
        "flowElements": parse_flow_elements(elem)
    }


# ----------------------
# FLOW ELEMENTS
# ----------------------
def parse_flow_elements(proc):
    elements = []

    for elem in proc:
        tag = strip_ns(elem.tag)

        if tag in [
            "task", "userTask", "serviceTask", "manualTask",
            "scriptTask", "businessRuleTask", "sendTask", "receiveTask"
        ]:
            elements.append(parse_task(elem))

        elif "Event" in tag:
            elements.append(parse_event(elem))

        elif "Gateway" in tag:
            elements.append(parse_gateway(elem))

        elif tag == "sequenceFlow":
            elements.append(parse_sequence_flow(elem))

        elif tag == "subProcess":
            elements.append(parse_subprocess(elem))

    return elements


# ----------------------
# PROCESS
# ----------------------
def parse_processes(root):
    processes = []

    for proc in root.findall("bpmn:process", NS):
        processes.append({
            "bpmn_element_id": proc.get("id"),
            "name": proc.get("name"),
            "lanes": parse_lanes(proc),
            "flowElements": parse_flow_elements(proc)
        })

    return processes


# ----------------------
# MAIN FUNCTION
# ----------------------
def parse_bpmn_xml_advanced(xml_content: str):

    root = ET.fromstring(xml_content)

    return {
        "definitions": {
            "processes": parse_processes(root),
            "collaborations": parse_collaborations(root)
        }
    }
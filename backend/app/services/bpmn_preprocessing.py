import xml.etree.ElementTree as ET


def assign_default_lane_names(bpmn_xml: str) -> str:
    """
    Assign default names to unnamed BPMN lanes.

    This prevents BPMNlint errors like:
    'Missing label name (for lanes)'.

    Args:
        bpmn_xml (str): BPMN XML as string

    Returns:
        str: Updated BPMN XML string
    """

    root = ET.fromstring(bpmn_xml)

    ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}

    lane_counter = 1

    for lane in root.findall(".//bpmn:lane", ns):

        name = lane.get("name")

        if not name or name.strip() == "":
            lane.set("name", f"Default Lane {lane_counter}")
            lane_counter += 1

    return ET.tostring(root, encoding="unicode")



def replace_message_start_events(bpmn_xml: str) -> str:
    """
    Replace BPMN message start events with simple start events.

    This avoids false positives in soundness validation.

    Args:
        bpmn_xml (str): BPMN XML as string

    Returns:
        str: Updated BPMN XML string
    """

    root = ET.fromstring(bpmn_xml)

    ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}

    for start_event in root.findall(".//bpmn:startEvent", ns):

        message_def = start_event.find("bpmn:messageEventDefinition", ns)

        if message_def is not None:
            start_event.remove(message_def)

    return ET.tostring(root, encoding="unicode")
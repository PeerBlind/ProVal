import xml.etree.ElementTree as ET


def compute_metrics(xml_content):

    root = ET.fromstring(xml_content)

    metricsInfo = "Warning:\n"

    redundant = count_redundant_activities(root)
    if redundant:
        metricsInfo += "Redundant activities detected: There are activities with identical labels.\n"

    Modelsize = count_bpmn_elements(root)
    if Modelsize > 50:
        metricsInfo += "Minimize model size: Model size is large (>50 elements).\n"

    Outgoing = find_elements_with_many_outgoing(root)
    if len(Outgoing) > 0:
        metricsInfo += "Elements with more than 2 outgoing sequence flows: " + str(Outgoing) + "\n"

    Lanes = pool_has_too_many_lanes(root)
    Pools = count_pools(root)

    if Pools > 3:
        metricsInfo += "Model contains more than 3 pools.\n"

    if Lanes:
        metricsInfo += "A pool contains more than 5 lanes.\n"

    result, pairs = check_message_flows_between_pools(root)
    if result:
        metricsInfo += "Too many message flows between pools: " + str(pairs) + "\n"

    if pool_has_too_many_subprocesses(root):
        metricsInfo += "A pool contains more than 4 subprocesses.\n"

    if pool_has_too_many_gateways(root):
        metricsInfo += "A pool contains more than 5 gateways.\n"

    if pool_has_too_many_tasks(root):
        metricsInfo += "A pool contains more than 15 tasks.\n"

    imbalance, lane = task_distribution_imbalance_lanes(root)
    if imbalance:
        metricsInfo += "Task distribution imbalance detected in lane " + str(lane) + "\n"

    return metricsInfo


def count_redundant_activities(root):

    labels = set()

    for elem in root.iter():

        tag = elem.tag.split('}')[-1]

        if tag in ['task', 'userTask', 'serviceTask']:

            name = elem.get('name')

            if name:

                normalized_name = name.lower().replace(" ", "")

                labels = {label.lower().replace(" ", "") for label in labels}

                if normalized_name in labels:
                    return True

                labels.add(normalized_name)

    return False


def count_bpmn_elements(root):

    count = 0

    for elem in root.iter():

        tag = elem.tag.split('}')[-1]

        if tag in [

            'participant', 'lane',

            'task', 'userTask', 'serviceTask', 'manualTask',
            'businessRuleTask', 'scriptTask', 'sendTask',
            'receiveTask', 'callActivity',

            'startEvent', 'endEvent',
            'intermediateThrowEvent', 'intermediateCatchEvent',

            'exclusiveGateway', 'parallelGateway',
            'inclusiveGateway', 'eventBasedGateway'
        ]:

            count += 1

    return count


def find_elements_with_many_outgoing(root):

    outgoing_count = {}

    for elem in root.iter():

        tag = elem.tag.split('}')[-1]

        if tag == 'sequenceFlow':

            source = elem.get('sourceRef')

            if source:
                outgoing_count[source] = outgoing_count.get(source, 0) + 1

    result = []

    for element_id, count in outgoing_count.items():

        if count > 2:
            result.append(element_id)

    return result


def count_pools(root):

    count = 0

    for elem in root.iter():

        tag = elem.tag.split('}')[-1]

        if tag == 'participant':
            count += 1

    return count


def pool_has_too_many_lanes(root):

    process_lanes = {}

    for process in root.iter():

        tag = process.tag.split('}')[-1]

        if tag == 'process':

            process_id = process.get('id')
            lane_count = 0

            for elem in process.iter():

                if elem.tag.split('}')[-1] == 'lane':
                    lane_count += 1

            process_lanes[process_id] = lane_count

    for participant in root.iter():

        tag = participant.tag.split('}')[-1]

        if tag == 'participant':

            process_ref = participant.get('processRef')

            if process_ref and process_ref in process_lanes:

                if process_lanes[process_ref] > 5:
                    return True

    return False


def check_message_flows_between_pools(root):

    process_to_pool = {}

    for elem in root.iter():

        tag = elem.tag.split('}')[-1]

        if tag == 'participant':

            process_ref = elem.get('processRef')
            pool_id = elem.get('id')

            if process_ref:
                process_to_pool[process_ref] = pool_id

    element_to_process = {}

    for process in root.iter():

        tag = process.tag.split('}')[-1]

        if tag == 'process':

            process_id = process.get('id')

            for elem in process.iter():

                elem_id = elem.get('id')

                if elem_id:
                    element_to_process[elem_id] = process_id

    flow_counts = {}

    for elem in root.iter():

        tag = elem.tag.split('}')[-1]

        if tag == 'messageFlow':

            source = elem.get('sourceRef')
            target = elem.get('targetRef')

            if source in element_to_process and target in element_to_process:

                source_process = element_to_process[source]
                target_process = element_to_process[target]

                source_pool = process_to_pool.get(source_process)
                target_pool = process_to_pool.get(target_process)

                if source_pool and target_pool and source_pool != target_pool:

                    pair = tuple(sorted([source_pool, target_pool]))

                    flow_counts[pair] = flow_counts.get(pair, 0) + 1

    violating_pairs = [

        pair for pair, count in flow_counts.items()

        if count > 3
    ]

    return (len(violating_pairs) > 0, violating_pairs)


def pool_has_too_many_subprocesses(root):

    for process in root.iter():

        if process.tag.split('}')[-1] == 'process':

            subprocess_count = 0

            for elem in process.iter():

                if elem.tag.split('}')[-1] == 'subProcess':
                    subprocess_count += 1

            if subprocess_count > 4:
                return True

    return False


def pool_has_too_many_gateways(root):

    gateway_types = [

        'exclusiveGateway',
        'parallelGateway',
        'inclusiveGateway',
        'eventBasedGateway'
    ]

    for process in root.iter():

        if process.tag.split('}')[-1] == 'process':

            gateway_count = 0

            for elem in process.iter():

                if elem.tag.split('}')[-1] in gateway_types:
                    gateway_count += 1

            if gateway_count > 5:
                return True

    return False


def pool_has_too_many_tasks(root, threshold=15):

    activity_types = [

        'task', 'userTask', 'serviceTask', 'manualTask',
        'businessRuleTask', 'scriptTask', 'sendTask',
        'receiveTask', 'callActivity'
    ]

    for process in root.iter():

        if process.tag.split('}')[-1] == 'process':

            task_count = 0

            for elem in process.iter():

                if elem.tag.split('}')[-1] in activity_types:
                    task_count += 1

            if task_count > threshold:
                return True

    return False


def task_distribution_imbalance_lanes(root, imbalance_threshold=0.6):

    lane_tasks = {}

    total_tasks = 0

    activity_types = [

        'task', 'userTask', 'serviceTask', 'manualTask',
        'businessRuleTask', 'scriptTask', 'sendTask',
        'receiveTask', 'callActivity'
    ]

    for lane in root.iter():

        if lane.tag.split('}')[-1] == 'lane':

            lane_id = lane.get('id')
            task_count = 0

            for elem in lane.iter():

                if elem.tag.split('}')[-1] in activity_types:
                    task_count += 1

            lane_tasks[lane_id] = task_count

            total_tasks += task_count

    for lane_id, count in lane_tasks.items():

        if total_tasks == 0:
            continue

        proportion = count / total_tasks

        if proportion > imbalance_threshold:
            return True, lane_id

    return False, None
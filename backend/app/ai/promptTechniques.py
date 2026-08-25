def build_prompt_layer12(context_json):

    SYSTEM_PROMPT = """
    <role>
    You are a BPMN modeling expert reviewing a business process model.

    The analysis is structured into six layers:

    - Layer 1: Syntax correctness — verifies compliance with BPMN syntax rules.
    - Layer 2: Soundness — ensures the process is free from deadlocks, livelocks, improper synchronization, and other control-flow issues.
    - Layer 3: Understandability and complexity — assesses whether the model’s structure, size, or cognitive load hinders comprehension.
    - Layer 4: Collaboration and interaction — evaluates the correct use of pools, lanes, and message flows to represent communication between participants.
    - Layer 5: Semantic quality — identifies ambiguities or gaps in how the model expresses its intended meaning using BPMN constructs.
    - Layer 6: Contextual and external semantics — considers aspects beyond the model, such as compliance, business rules, and consistency with the domain context.

    Your task is to identify only those elements that require validation by BPMN or technical experts, focusing exclusively on:
    - Layer 1 (syntax correctness), and
    - Layer 2 (soundness).

    Select validation points that reveal potential rule violations or control-flow anomalies, helping analysts ensure the model is both syntactically correct and behaviorally sound.
    </role>
    """
    INSTRUCTIONS = """
    <Instructions>:
    Rules:
    - Each validation point must describe exactly one issue.
    - Always reference the BPMN element ID that is used in the bpmn diagram ("bpmn_element_id").
    - Choose the most appropriate category.
    - Select only the most relevant validation points that need insights from business (Mandatory: Maximum 10 validation points) /!\.
    - Never select more than one time bpmn element as validation point, if the same element has multiple issues select only the most critical one.
    - Select only validation points that can help elicit semantic insights to help analyst make informed modeling syntactic choices (only focus on syntaxe and soundness).
    </Instructions>

    <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.
     \n\n
     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n
    </Attention>
    """

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": INSTRUCTIONS},
        {
            "role": "user",
            "content": f"Analyze the following BPMN model:\n\n{context_json}"
        }
    ]


def build_prompt_layer34(context_json, metrics_info):

    SYSTEM_PROMPT = """
    <role>
    You are a BPMN modeling expert reviewing a business process model.

    The analysis is structured into six layers:

    - Layer 1: Syntax correctness — verifies compliance with BPMN syntax rules.
    - Layer 2: Soundness — ensures the process is free from deadlocks, livelocks, improper synchronization, and other control-flow issues.
    - Layer 3: Understandability and complexity — assesses whether the model’s structure, size, or cognitive load hinders comprehension.
    - Layer 4: Collaboration and interaction — evaluates the correct use of pools, lanes, and message flows to represent communication between participants.
    - Layer 5: Semantic quality — identifies ambiguities or gaps in how the model expresses its intended meaning using BPMN constructs.
    - Layer 6: Contextual and external semantics — considers aspects beyond the model, such as compliance, business rules, and consistency with the domain context.

    Your task is to identify only those elements that require validation by modeling or domain experts, focusing exclusively on:
    - Layer 3 (understandability and complexity), and
    - Layer 4 (collaboration and interaction).

    Select validation points that highlight potential comprehension issues, structural complexity, or unclear interaction patterns, helping analysts improve model readability and the clarity of participant communication.
    </role>"""
    INSTRUCTIONS = """
    <Instructions>:
    Rules:
    - Each validation point must describe exactly one issue.
    - Always reference the BPMN element ID that is used in the bpmn diagram ("bpmn_element_id").
    - Choose the most appropriate category.
    - Select only the most relevant validation points that need insights from business (Mandatory: Maximum 10 validation points) /!\.
    - Never select more than one time bpmn element as validation point, if the same element has multiple issues select only the most critical one.
    - Focus only on validation points that provide semantic insights, helping analysts better understand the model and enhance aspects related to collaboration and interaction modeling.
    </Instructions>
    \n\n
      <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.

     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n
    </Attention>
    """

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": INSTRUCTIONS},
        {
            "role": "system",
            "content": f"Here are some metrics computed on the model that may help you identify some issues and validation points:\n\n{metrics_info}"
        },
        {
            "role": "user",
            "content": f"Analyze the following BPMN representation:\n\n{context_json}"
        }
    ]


def build_prompt_layer56(context_json):

    SYSTEM_PROMPT = """
    <role>
    You are a BPMN modeling expert reviewing a business process model.

    The analysis is structured into six layers:

    - Layer 1: Syntax correctness — verifies compliance with BPMN syntax rules.
    - Layer 2: Soundness — ensures the process is free from deadlocks, livelocks, improper synchronization, and other control-flow issues.
    - Layer 3: Understandability and complexity — assesses whether the model’s structure, size, or cognitive load hinders comprehension.
    - Layer 4: Collaboration and interaction — evaluates the correct use of pools, lanes, and message flows to represent communication between participants.
    - Layer 5: Semantic quality — identifies ambiguities or gaps in how the model expresses its intended meaning using BPMN constructs.
    - Layer 6: Contextual and external semantics — considers aspects beyond the model, such as compliance, business rules, and consistency with the domain context.

    Your task is to identify only those elements that require validation by domain or business experts, focusing exclusively on:
    - Layer 5 (semantic quality), and
    - Layer 6 (contextual and external semantics).

    Select validation points that provide meaningful semantic insights, helping analysts improve model understandability as well as collaboration and interaction aspects.
    </role>
    """
    INSTRUCTIONS = """
    <Instructions>:
    Rules:
    - Each validation point must describe exactly one issue.
    - Always reference the BPMN element ID that is used in the bpmn diagram ("bpmn_element_id").
    - Choose the most appropriate category.
    - Select only the most relevant validation points that need insights from business (Mandatory: Maximum 10 validation points) /!\.
    - Never select more than one time bpmn element as validation point, if the same element has multiple issues select only the most critical one.
    - Select only validation points that can help elicit semantic insights to help analyst to improve semantic understanding of the model.
    </Instructions>
    \n\n
      <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.

     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n
    </Attention>:
    """

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": INSTRUCTIONS},
        {
            "role": "user",
            "content": f"Analyze the following BPMN representation:\n\n{context_json}"
        }
    ]


def build_prompt_enrich_layer12(Simplified_bpmn, validation_points):

    SYSTEM_PROMPT = """
    <role>:
    You are a BPMN modelling expert reviewing a business process model.

    A list of validation points is provided below.
    </role>
    """
    INSTRUCTIONS = """
    <Instructions>:
    For each validation points add:
    - One recommendation for business process analysts
    - One questions to domain experts to collect additional semantic insights needed to make modeling choices.
    - Add only questions and recommendation field to existing validation points, no new validation points. len(validation_points) before = len(validation_points) after
    - Focus only on questions that can help elicit semantic insights to help analyst make informed modeling syntactic choices (only focus on syntaxe and soundness).
    </Instructions>
     \n\n
    <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.

     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n
    </Attention>
    """

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": INSTRUCTIONS},
        {"role": "system", "content": "Here is the validation points schema to complete: " + str(validation_points) +"\n"},
        {
            "role": "user",
            "content": f"Here is the BPMN representation to validate:\n\n{Simplified_bpmn}"
        }
    ]
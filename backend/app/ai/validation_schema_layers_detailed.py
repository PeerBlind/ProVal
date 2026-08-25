
from enum import Enum
from pydantic import BaseModel, Field
from typing import List

class Category00(str, Enum):
    #--- Layer 1-2: Syntax and soundness
    AdHocSubProcess = "ad-hoc-sub-process"
    ConditionalFlows = "conditional-flows"
    EventSubProcessTypedStartEvent = "event-sub-process-typed-start-event"
    FakeJoin = "fake-join"
    SuperfluousGateway = "superfluous-gateway"
    LabelRequired = "label-required"
    NoComplexGateway = "no-complex-gateway"
    NoDuplicateSequenceFlows = "no-duplicate-sequence-flows"
    NoGatewayJoinFork = "no-gateway-join-fork"
    NoInclusiveGateway = "no-inclusive-gateway"
    SingleBlankStartEvent = "single-blank-start-event"
    SubProcessBlankStartEvent = "sub-process-blank-start-event"

    OptionToComplete = "OptionToComplete"
    Safeness = "Safeness"
    ProperCompletion = "Proper Completion"

class Category(str, Enum):
    #--- Syntax errors
    emptyConditionsInclusiveExclusiveGateways = "empty conditions for inclusive and exclusive gateways" 
    uniqueLabels = "unique labels" 
    notConnectedDataObjects = "not connected data objects" 
    useMessageFlows = "Use message flows"  
    useMessageFlowsOnlyOnCorrectNodes = "Use message flows only on correct nodes" 

    #--- Soundness
    NoDeadActivities ="No Dead Activities"
    incorrectTerminationError = "Incorrect termination error" 
    modelAsStructuredAsPossible = "Model as structured as possible" 
    useOneStartAndOneEndEvent = "Use one start and one end event" 

    #--- Understandability
    labelDeficit = "Label deficit"
    useALabelingConvention = "Use a labeling convention"
    reduceNumberOfRedundantActivities = "Reduce the number of redundant activities"
    complexity = "Complexity"
    minimizeModelSize = "Minimize model size"
    applyHierarchicalStructureWithSubProcesses = "Apply hierarchical structure with sub-processes"
    useSubProcesses = "Use sub-processes"
    usePoolsConsistently = "Use pools consistently"
    useLanesConsistently = "Use lanes consistently"
    useDefaultFlows = "Use default flows"
    useAsFewElementsInModelAsPossible = "Use as few elements in the model as possible"
    minimizeRoutingPathsPerElement = "Minimize the routing paths per element"

    #--- Collaboration
    NumberOfPools= "Number Of Pools"
    QuantityOfMessageFlowsBetweenTwoPools = "Quantity of Message Flows Between Two Pools"
    QuantityofSubProcessesperPool = "Quantity of SubProcesses per Pool"
    QuantityofDecisionsperPool = "Quantity of Decisions per Pool"
    QuantityOfTasksExecutedinaSpecificPool = "Quantity Of Tasks Executed in a SpecificPool"   
    ProportionofTaskDistributionPerParticipant = "Proportion of Task Distribution Per Participant"

    #---Semantic (model related)
    UnclearRelations = "Unclear Relations"
    UnclearReferences = "Unclear References"
    Underspecifications = "Underspecifications"
    InconsistentSpecifications = "Inconsistent Specifications"
    ModellingFuzziness = "Modelling Fuzziness"
    optionalControlFlow = "optional control flow" 

    #---Semantic (process related)
    communicationDefects = "Communication defects"
    IncorrectInformation = "Incorrect Information"
    ImpreciseInformation = "Imprecise Information"
    UnexpectedInformation = "Unexpected Information"


class ValidationPoint00(BaseModel):  # Validation point with category details
    category: Category00 = Field(
        description = (
            "Type of issue that requires validation with a domain expert: \n\n"
                "ad-hoc-sub-process"
                "conditional-flows"
                "event-sub-process-typed-start-event"
                "fake-join"
                "superfluous-gateway"
                "no-inclusive-gateway"
                "label-required"
                "no-complex-gateway"
                "no-duplicate-sequence-flows"
                "no-gateway-join-fork"
                "single-blank-start-event"
                "sub-process-blank-start-event"

                # --- Soundness (layer 2)
                "OptionToComplete"
                "Safeness"
                "Proper Completion"
        )
    )
    bpmn_element_id: str = Field(description="ID of the BPMN element that needs to be validated" )
    justification: str = Field(description="Specific and concise natural language of why this element must be validated and exact fragment or element that triggered the issue")
    recommendation: str = Field(description="Specific and concise natural language explanation of the relevant modifications that should be done on the bpmn graph")
    OpenQuestion: str = Field(description="""Open question to be answered by the domain expert to provide missing semantic information that enable addressing the issue identified in the validation point (Only semantic information). Attention, this questions should never reference the model or bpmn elements, self-contained and should not require the business/domain expert to have the bpmn model in front of them to be able to answer it. \n
    <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.
     \n\n
     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n""" )

class ValidationPoint12(BaseModel):  # Validation point with category details
    category: Category = Field(
        description = (
            "Type of issue that requires validation with a domain expert:\n\n"

            "1. Empty conditions for inclusive and exclusive gateways:\n"
            "For each Exclusive (XOR) or Inclusive (OR) gateway, all outgoing sequence flows should define explicit conditions.\n"
            "If all outgoing flows lack conditions, the decision logic becomes ambiguous.\n"
            "Example: An XOR gateway splits into 3 paths, but none has a condition like 'amount > 1000'.\n\n"

            "2. Unique labels:\n"
            "Each element in the model (tasks, events, gateways, etc.) should have a distinct and meaningful label.\n"
            "Duplicate labels can create confusion when interpreting or maintaining the process.\n"
            "Example: Two tasks both named 'Process Request' without differentiation.\n\n"

            "3. Not connected data objects:\n"
            "All data objects should be connected to at least one activity or event using data associations.\n"
            "Unconnected data objects indicate incomplete or unused data definitions.\n"
            "Example: A data object 'Invoice' exists in the diagram but is not linked to any task.\n\n"

            "4. Label required:\n"
            "All relevant BPMN elements must have a label describing their purpose and enabling clear interpretation.\n"
            "Missing labels reduce readability and make the process harder to understand.\n"
            "Example: A task box without any text inside it.\n\n"

            "5. Use of message flows:\n"
            "Message flows should be used to represent communication between different pools (participants).\n"
            "All pools should be meaningfully connected through message flows if they interact.\n"
            "Example: A 'Customer' pool sends a request message to a 'Service Provider' pool.\n\n"

            "6. Correct usage of message flows:\n"
            "Message flows must only connect valid BPMN elements (e.g., between pools or participants, not within the same pool).\n"
            "They should also respect directionality (sending vs receiving elements).\n"
            "Example: A message flow incorrectly drawn between two tasks inside the same pool.\n\n"

            "6. No dead activities:\n"
            "All activities in the process should be reachable from the start event.\n"
            "Dead activities are those that cannot be reached during process execution.\n"
            "Example: A task that is not connected to any sequence flow.\n\n"

            "7. Incorrect termination:\n"
            "Every process instance that starts should eventually reach a proper end event.\n"
            "Missing or unreachable end events may result in processes that never terminate.\n"
            "Example: A flow that loops indefinitely without any path to an end event.\n\n"

            "8. Structured modeling:\n"
            "The process should follow structured control-flow patterns (well-balanced splits and joins).\n"
            "Avoid unstructured constructs such as mismatched gateways or arbitrary loops.\n"
            "Example: A parallel split without a corresponding join gateway.\n\n"

            "9. Single start and end events:\n"
            "Prefer using one start event and one end event per process to maintain clarity.\n"
            "Multiple start or end events should only be used when clearly justified.\n"
            "Example: A process with three unrelated start events causing ambiguity in execution."
        )
    )
    bpmn_element_id: str = Field(description="ID of the BPMN element that needs to be validated" )
    justification: str = Field(description="Specific and concise natural language of why this element must be validated and exact fragment or element that triggered the issue")
    recommendation: str = Field(description="Specific and concise natural language explanation of the relevant modifications that should be done on the bpmn graph")
    OpenQuestion: str = Field(description="""Open question to be answered by the domain expert to provide missing semantic information that enable addressing the issue identified in the validation point (Only semantic information). Attention, this questions should never reference the model or bpmn elements, self-contained and should not require the business/domain expert to have the bpmn model in front of them to be able to answer it. \n
    <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.
     \n\n
     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n""" )


class ValidationPoint34(BaseModel):  # Validation point with category details
    category: Category = Field(
    description = (
        "Type of issue that requires validation with a domain expert:\n\n"

        "1. Label deficit:\n"
        "Labels describe BPMN elements and are critical for understanding the process.\n"
        "Poor-quality, vague, or ambiguous labels reduce clarity and may lead to incorrect interpretations.\n"
        "Example: A task labeled 'Handle' instead of 'Handle Customer Complaint'.\n\n"

        "2. Use a labeling convention:\n"
        "All labels should follow a consistent naming convention (e.g., verb-object format).\n"
        "Inconsistent, incomplete, or unclear labels reduce readability and professionalism.\n"
        "Example: Mixing 'Approve Invoice' with 'Invoice Approval' and 'Processing'.\n\n"

        "3. Reduce redundant activities:\n"
        "Consecutive activities performed by the same participant and without special behavior (e.g., boundary events)\n"
        "should be merged or grouped into a single task or sub-process.\n"
        "This may also indicate missing participant distinctions or incorrect process granularity.\n"
        "Example: Three consecutive tasks 'Check Form', 'Validate Form', 'Review Form' by the same user.\n\n"

        "4. Minimize model size:\n"
        "Models should remain as compact as possible while preserving necessary detail.\n"
        "Overly large models are harder to read, maintain, and validate.\n"
        "Example: A diagram with dozens of low-level tasks that could be abstracted.\n\n"

        "5. Apply hierarchical structure with sub-processes:\n"
        "Use sub-processes to organize the model into multiple abstraction levels.\n"
        "This improves readability and allows progressive disclosure of details.\n"
        "Example: A 'Order Handling' sub-process containing detailed steps internally.\n\n"

        "6. Use sub-processes appropriately:\n"
        "Sub-processes should group activities when they share a common goal, owner, or are reusable.\n"
        "Call Activities should be used for reusable process fragments.\n"
        "Example: A reusable 'Payment Processing' sub-process used in multiple workflows.\n\n"

        "7. Use pools consistently:\n"
        "Pools represent independent participants or processes.\n"
        "Too many expanded pools can clutter the diagram and reduce clarity.\n"
        "Typically, one main expanded pool is sufficient.\n"
        "Example: A diagram with 5 expanded pools showing too much detail at once.\n\n"

        "8. Use lanes consistently:\n"
        "Lanes should represent internal roles, departments, or organizational units within a pool.\n"
        "They help clarify responsibility distribution.\n"
        "Example: Lanes for 'Sales', 'Finance', and 'Support' within a company pool.\n\n"

        "9. Use default flows:\n"
        "Gateways (especially XOR and OR) should define a default flow to ensure execution continues\n"
        "when no other conditions are met.\n"
        "Example: An XOR gateway where one outgoing path is marked as the default fallback.\n\n"

        "10. Use as few elements as possible:\n"
        "Keep the model simple by minimizing unnecessary BPMN elements.\n"
        "This reduces cognitive load and improves readability.\n"
        "Example: Avoid splitting a simple task into multiple trivial steps.\n\n"

        "11. Minimize routing paths per element:\n"
        "Limit the number of outgoing sequence flows from gateways or activities.\n"
        "Too many paths increase complexity and make decision logic harder to follow.\n"
        "Example: A gateway with 5 outgoing branches.\n\n"

        "12. Number of pools:\n"
        "A high number of pools may indicate unclear process boundaries or excessive decomposition\n"
        "of participants.\n"
        "Example: Splitting one organization into multiple pools instead of lanes.\n\n"

        "13. Quantity of message flows between two pools:\n"
        "Too many message flows between the same participants may indicate overly complex interactions.\n"
        "Consider simplifying or grouping communications.\n"
        "Example: 10+ message flows between 'Customer' and 'Service Provider'.\n\n"

        "14. Quantity of sub-processes per pool:\n"
        "A high number of sub-processes in one pool may indicate excessive complexity\n"
        "or improper decomposition.\n"
        "Example: A pool containing 15+ sub-processes.\n\n"

        "15. Quantity of decisions per pool:\n"
        "Too many gateways (decision points) in a single pool may indicate complex logic\n"
        "that should be simplified or modularized.\n"
        "Example: A process with frequent branching every few steps.\n\n"

        "16. Quantity of tasks in a specific pool:\n"
        "A large number of tasks assigned to a single pool may indicate overload\n"
        "or missing participants.\n"
        "Example: One pool handling all activities without delegation.\n\n"

        "17. Proportion of task distribution per participant:\n"
        "Tasks should be reasonably balanced across participants.\n"
        "Strong imbalance may indicate poor responsibility allocation.\n"
        "Example: One lane performs 90% of tasks while others are nearly empty.\n"
    )
    )
    bpmn_element_id: str = Field(description="ID of the BPMN element that needs to be validated" )
    recommendation: str = Field(description="Specific and concise natural language explanation of the relevant modifications that should be done on the bpmn graph")
    justification: str = Field(description="Specific and concise natural language explanation of why this element must be validated and exact fragment or element that triggered the issue")
    OpenQuestion: str = Field(description="""Open question to be answered by the domain expert to provide missing semantic information that enable addressing the issue identified in the validation point (Only semantic information). Attention, this questions should never reference the model or bpmn elements, self-contained and should not require the business/domain expert to have the bpmn model in front of them to be able to answer it. \n
    <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.
     \n\n
     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n""" )

class ValidationPoint56(BaseModel):  # Validation point with category details
    category: Category = Field(
    description = (
        "Type of issue that requires validation with a domain expert:\n\n"

        "1. Unclear relations:\n"
        "Relationships between elements (e.g., sequence flows, dependencies, or associations) are not clearly defined,\n"
        "leading to multiple possible interpretations of the process logic.\n"
        "Example: Two tasks connected without clear conditions or unclear branching logic at a gateway.\n\n"

        "2. Unclear references:\n"
        "Textual references (e.g., in labels or documentation) do not clearly indicate what element, data, or concept they refer to.\n"
        "This creates ambiguity in understanding the process.\n"
        "Example: A task labeled 'Update it' without specifying what 'it' refers to.\n\n"

        "3. Underspecification:\n"
        "The model or requirements lack necessary details, leaving gaps in how the process should be executed.\n"
        "This may result in incomplete or undefined behavior.\n"
        "Example: A task 'Validate Order' without specifying validation rules or criteria.\n\n"

        "4. Inconsistent specifications:\n"
        "Different parts of the model or requirements contradict each other,\n"
        "making it impossible to satisfy all conditions simultaneously.\n"
        "Example: One branch requires approval for orders >1000, while another allows bypassing approval for all orders.\n\n"

        "5. Modelling fuzziness:\n"
        "The model is syntactically correct (valid BPMN) but semantically unclear or vague.\n"
        "This often results from overly abstract or poorly defined elements.\n"
        "Example: Tasks like 'Process Data' or 'Handle Case' without clear meaning.\n\n"

        "6. Optional control flow:\n"
        "The presence of optional tasks or branches introduces ambiguity about when or why they are executed.\n"
        "This reduces predictability of the process behavior.\n"
        "Example: A task that may or may not execute without any condition or explanation.\n\n"

        "7. Communication defects:\n"
        "Issues related to how information is exchanged between participants (e.g., via message flows).\n"
        "Poorly defined communication can lead to misunderstandings or incomplete information transfer.\n"
        "Example: A message flow without specifying the content or purpose of the message.\n\n"

        "8. Incorrect information:\n"
        "Data or information in the model contradicts known rules, constraints, or expected semantics.\n"
        "This leads to invalid or misleading process behavior.\n"
        "Example: A status marked as 'Approved' before any approval task occurs.\n\n"

        "9. Imprecise information:\n"
        "Information lacks sufficient precision or detail, making interpretation difficult.\n"
        "This often occurs with vague values or poorly defined metrics.\n"
        "Example: A duration specified as 'short time' instead of a measurable value.\n\n"

        "10. Unexpected information:\n"
        "The model contains values, events, or behaviors that are not anticipated and whose meaning is unclear.\n"
        "This may indicate errors, edge cases, or missing explanations.\n"
        "Example: An event that triggers without any identifiable cause in the process.\n"
    )
    )
    bpmn_element_id: str = Field(description="ID of the BPMN element that needs to be validated" )
    justification: str = Field(description="Specific and concise natural language explanation of why this element must be validated and exact fragment or element that triggered the issue")
    recommendation: str = Field(description="Specific and concise natural language explanation of the relevant modifications that should be done on the bpmn graph")
    OpenQuestion: str = Field(description="""Open question to be answered by the domain expert to provide missing semantic information that enable addressing the issue identified in the validation point (only semantic information). Attention, this questions should never reference the model or bpmn elements, self-contained and should not require the business/domain expert to have the bpmn model in front of them to be able to answer it. \n
    <Attention>: 
    Questions should be only related to the semantic of the model and should not reference any technical aspect of the modeling language or notation. In particular, they have to respect 5 conditions:\n\n
     1) Self-contained: They must be formulated in a way that domain experts can answer them without having the model in front of them (no reference to bpmn elements), they should be self-contained.\n
     2) Contextualized: They should be contextualized with the necessary information to be answered by domain experts, for example, if a question is about a decision point in the model, it should include the possible conditions and options related to this decision point. \n
     3) Non-technical: They should not include any technical term related to the modeling \n
     4) Semantic-focused: They must only focus on eliciting semantic insights about the process, such as business rules, constraints, exceptions, conditions, etc. and should not focus on any technical aspect of the modeling language or notation.
     5) Examplified: Whenever possible, questions should include examples to clarify the intent of the question and make it easier for domain experts to understand and answer them.
     \n\n
     Bad question example: "What are the conditions for the sequence flow with id 'flow_123' outgoing from the exclusive gateway with id 'gateway_456'?"\n
     Good question example: "In the context of order processing, what are the conditions and options for the decision point related to order approval? (e.g., under what circumstances would an order be approved or rejected?)"\n""" )


class ValidationReport00(BaseModel):
    validation_points: List[ValidationPoint00]

class ValidationReport12(BaseModel):
    validation_points: List[ValidationPoint12]
class ValidationReport34(BaseModel):
    validation_points: List[ValidationPoint34]
class ValidationReport56(BaseModel):
    validation_points: List[ValidationPoint56]
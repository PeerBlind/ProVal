import asyncio
from openai import AsyncOpenAI
from typing import List

from app.models.validation import ValidationPoint
from app.ai.promptTechniques import build_prompt_layer34, build_prompt_layer56 ,build_prompt_layer12,build_prompt_enrich_layer12
from app.ai.validation_schema_layers_detailed import ValidationReport00, ValidationReport12, ValidationReport34,ValidationReport56
from app.ai.FinalValidationSchema_layers import convert_ai_points
from app.services.metrics_layer34 import compute_metrics
from app.config import OPENAI_API_KEY


client = AsyncOpenAI(api_key=OPENAI_API_KEY)


# -----------------------------
# Detect NEW Layer1/2 issues
# -----------------------------
async def detect_layer12(bpmn_context):

    prompt = build_prompt_layer12(
        context_json=bpmn_context
    )

    response = await client.chat.completions.parse(
        model="gpt-5.4-nano-2026-03-17",
        messages=prompt,
        response_format=ValidationReport12
    )

    parsed =response.choices[0].message.parsed.validation_points
    #print(response)
    print (parsed)

    return parsed


# -----------------------------
# Layer 3-4 analysis
# -----------------------------
async def analyze_layer34(bpmn_context, bpmn_xml):

    metrics_info = compute_metrics(bpmn_xml)

    prompt = build_prompt_layer34(
        context_json=bpmn_context,
        metrics_info=metrics_info
    )

    response = await client.chat.completions.parse(
        model="gpt-5.4-nano-2026-03-17",
        messages=prompt,
        response_format=ValidationReport34
    )

    parsed =response.choices[0].message.parsed.validation_points
    #print(response)
    print (parsed)

    return parsed


# -----------------------------
# Layer 5-6 analysis
# -----------------------------
async def analyze_layer56(bpmn_context):

    prompt = build_prompt_layer56(
        context_json=bpmn_context
    )

    response = await client.chat.completions.parse(
        model="gpt-5.4-nano-2026-03-17",
        messages=prompt,
        response_format=ValidationReport56
    )

    parsed =response.choices[0].message.parsed.validation_points
    #print(response)
    print (parsed)

    return parsed

# -----------------------------
# Enrich lint / rust results
# ----------------------------
async def enrich_layer12(bpmn_context, validation_points):

    if validation_points == []:
        print("No Layer 1/2 points to enrich")
        return []   

    prompt = build_prompt_enrich_layer12(
        bpmn_context,
        validation_points
    )

    response = await client.chat.completions.parse(
        model="gpt-5.4-nano-2026-03-17",
        messages=prompt,
        response_format=ValidationReport00
    )

    parsed =response.choices[0].message.parsed.validation_points
    print(response)
    print (parsed)

    return parsed

# -----------------------------
# MAIN AI ANALYSIS
# -----------------------------
async def analyze_all_layers(
    bpmn_context,
    bpmn_xml,
    lint_rust_points
) -> List[ValidationPoint]:

    try:

        # lancer toutes les analyses GPT en parallèle
        enrich_task = enrich_layer12(
            bpmn_context,
            lint_rust_points
        )

        detect12_task = detect_layer12(
            bpmn_context
        )

        layer34_task = analyze_layer34(
            bpmn_context,
            bpmn_xml
        )

        layer56_task = analyze_layer56(
            bpmn_context
        )

        enrich_result, new12, results34, results56 = await asyncio.gather(

            enrich_task,
            detect12_task,
            layer34_task,
            layer56_task

        )

        print ("ok1")
        # fusionner
        ai_points_raw = enrich_result + new12 + results34 + results56

        #print (ai_points_raw)
        # convertir vers ValidationPoint
        ai_points = convert_ai_points(ai_points_raw)

        #print (ai_points)

        print(f"OpenAI analysis: {len(ai_points)} AI points detected")

        return ai_points

    except Exception as e:

        print("OpenAI error:", e)

        return []
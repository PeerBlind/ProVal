# app/routers/ai.py
"""
Routes API pour l'analyse IA par couches.
"""
from fastapi import APIRouter, HTTPException
from app.models.requests import AnalyzeRequest, UpdateStatusRequest
from app.models.responses import AnalyzeResponse
from app.models.validation import Progression, ValidationPoint
from app.services import (
    parse_bpmn_xml,
    validate_layer1,
    validate_layer2,
    analyze_all_layers,
    calculate_progression
)
from app.services.firestore_service import db
from app.services.bpmnlint_service import get_element_name
from app.services.bpmn_parser_advanced import parse_bpmn_xml_advanced
import os
import hashlib
import json
import asyncio
from app.services.bpmn_preprocessing import (
    assign_default_lane_names,
    replace_message_start_events
)

router = APIRouter()



#test pour desactiver l'ia et n'est pas gaspiller de token 
DISABLE_AI = os.getenv("DISABLE_AI") == "false"

#fonction qui permet le hashage
def compute_bpmn_hash(bpmn_xml: str) -> str:
    """Calcule un hash du diagramme BPMN."""
    return hashlib.sha256(bpmn_xml.encode("utf-8")).hexdigest()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_diagram(request: AnalyzeRequest):
    """
    Analyse complète d'un diagramme BPMN en 6 layers.
    
    Process :
    1. Parser le BPMN XML
    2. Layer 1 : bpmnlint validation
    3. Layer 2 : Algorithm soundness
    3. Layers 3-6 : OpenAI analysis (1 seule requête)
    4. Fusionner tous les points
    5. Calculer la progression
    6. Retourner AnalyzeResponse
    """
    try:
        print(f"📊 Analyse du projet {request.project_id}...")

        #hashage du projet
        bpmn_hash = compute_bpmn_hash(request.bpmn_xml)

        # 0. Vérifier si une analyse existe déjà
        analysis_ref = db.collection("projects")\
            .document(request.project_id)\
            .collection("analysis")\
            .document("current")

        doc = analysis_ref.get()

        if doc.exists:

            existing_analysis = doc.to_dict()

            if existing_analysis.get("bpmn_hash") == bpmn_hash:
                print("📦 Analyse existante valide → chargement")
                return existing_analysis

            print("♻️ Diagramme modifié → nouvelle analyse")

        
        # 1. Parser le BPMN
        #bpmn_context = parse_bpmn_xml(request.bpmn_xml)
        bpmn_context = parse_bpmn_xml_advanced(request.bpmn_xml)
        print("✅ BPMN parsé")

        # Preprocess BPMN pour modifier le diagramme avant l'analyze du layer 1 et 2
        clean_bpmn_xml = assign_default_lane_names(request.bpmn_xml)
        clean_bpmn_xml = replace_message_start_events(clean_bpmn_xml)
        
        # 2. Layer 1 (bpmnlint)
        layer1_task = asyncio.to_thread(validate_layer1, clean_bpmn_xml)

        # 3. Layer 2 (soundness API)
        layer2_task = validate_layer2(clean_bpmn_xml)

        # attendre lint + rust
        layer1_points, layer2_points = await asyncio.gather(
            layer1_task,
            layer2_task
        )

        lint_rust_points = layer1_points + layer2_points

        print ("attention: lint + rust terminé")
        print (lint_rust_points)
        
        # 4. Layers 2-6 (OpenAI) - 1 SEULE REQUÊTE(avec untest sur l'IA)
        if DISABLE_AI:
            print("⚠️ IA désactivée")
            ai_points = []
        else :
            ai_points = await analyze_all_layers(
                bpmn_context,
                request.bpmn_xml,
                lint_rust_points
                )
            
        #layer1_points, layer2_points, ai_points = await asyncio.gather(
                #layer1_task,
                #layer2_task,
                #ai_task
            #)
        print(f"✅ Layer 1 : {len(layer1_points)} points détectés")
        print(f"✅ Layer 2 : {len(layer2_points)} points détectés")
        print(f"✅ Layers 1-6 : {len(ai_points)} points détectés")   

        print ("here are the ai points")
        print (ai_points) 
        
        # 5. Fusionner TOUS les points
        all_points = ai_points
        context_dict = bpmn_context
        #layer1_points + layer2_points +

        for point in all_points:
            point.element_name = get_element_name(
                point.bpmn_element_id,
                context_dict
            )
        
        # 5. Calculer la progression initiale
        progression = calculate_progression(all_points, Progression())
        
        # 6. Créer la réponse
        response = AnalyzeResponse(
            project_id=request.project_id,
            progression=progression,
            validation_points=all_points
        )
        
        
        analysis_data = response.model_dump()
        analysis_data["bpmn_hash"] = bpmn_hash
        analysis_ref.set(analysis_data)
        print("Analyse sauvegarder dans firestore")
        print(f"✅ Analyse terminée : {len(all_points)} points au total")
        return response
        
    except Exception as e:
        print(f"❌ Erreur analyse: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse: {str(e)}"
        )

#modification d'un statut du validation point
@router.post("/update-status")
async def update_status(request: UpdateStatusRequest):
    """
    Met à jour le statut d'un validation_point.
    Recalcule automatiquement la progression.
    """
    try:
        # Récupérer l'analyse
        analysis_ref = db.collection("projects")\
            .document(request.project_id) \
            .collection("analysis") \
            .document("current")

        doc = analysis_ref.get()
        if not doc.exists:
            raise HTTPException(
                status_code=404,
                detail="Analyse non trouvée"
            )
        
        # Trouver le point à modifier
        analysis = doc.to_dict()
        points = analysis["validation_points"]
        
        # Mettre à jour le point
        for point in points:
            if point["id"] == request.point_id:
                if request.status is not None:
                    point["status"] = request.status
                if request.ignored is not None:
                    point["ignored"] = request.ignored

        #print(points)
        
         # convertir dict → ValidationPoint
        validation_points_objects = [
            ValidationPoint(**{k: v for k, v in p.items() if k != "created_at"})
            for p in points
        ]
        #print(validation_points_objects)

        # Recalculer la progression
        current_progression = Progression(
            current_layer=analysis["progression"]["current_layer"],
            completed_layers=analysis["progression"]["completed_layers"],
            overall_score=float(analysis["progression"]["overall_score"])
        )

        progression = calculate_progression(
            validation_points_objects,
            current_progression
        )

        
        analysis["progression"] = progression.model_dump()
        analysis["validation_points"] = points
        # Sauvegarder la nouvelle version 
        analysis_ref.set(analysis)
        print(f"✅ Point {request.point_id} mis à jour")

        
        return analysis
        
    except Exception as e:

        print("❌ update-status error:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# Modification du feedback 
@router.post("/update-feedback")
async def update_feedback(request: dict):
    """
    Sauvegarde le feedback du domain expert pour un validation point.
    """
    try:
        project_id = request.get("project_id")
        point_id = request.get("point_id")
        feedback = request.get("feedback")

        if not project_id or not point_id:
            raise HTTPException(400, "Missing project_id or point_id")

        # 🔹 récupérer analyse Firestore
        analysis_ref = db.collection("projects")\
            .document(project_id)\
            .collection("analysis")\
            .document("current")

        doc = analysis_ref.get()

        if not doc.exists:
            raise HTTPException(404, "Analysis not found")

        analysis = doc.to_dict()
        points = analysis.get("validation_points", [])

        updated = False

        # 🔹 mise à jour du feedback
        for point in points:
            if point["id"] == point_id:
                point["domain_expert_feedback"] = feedback
                updated = True
                break

        if not updated:
            raise HTTPException(404, "Point not found")

        # 🔹 sauvegarde
        analysis["validation_points"] = points
        analysis_ref.set(analysis)

        print(f"✅ Feedback ajouté pour point {point_id}")

        return {"success": True}

    except Exception as e:
        print("❌ update-feedback error:", e)
        raise HTTPException(500, str(e))


# Generer le pdf 
@router.post("/export-pdf")
async def export_pdf(data: dict):

    from fastapi.responses import FileResponse
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        HRFlowable
    )
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib import colors
    import tempfile
    from itertools import groupby
    from svglib.svglib import svg2rlg
    

    # 📄 Création fichier temporaire
    file_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name

    # 📘 Document
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()

    # 🎨 Custom styles (DAIMO style)
    styles["Title"].textColor = colors.HexColor("#2563eb")
    styles["Heading2"].textColor = colors.HexColor("#1e293b")
    styles["Normal"].spaceAfter = 6

    elements = []

    # 🧠 HEADER
    elements.append(Paragraph("BPMN AI ANALYSIS REPORT", styles["Title"]))
    elements.append(Spacer(1, 10))

    elements.append(Paragraph(
        "Automated analysis combined with domain expert feedback",
        styles["Normal"]
    ))
    elements.append(Spacer(1, 20))
    # 🖼️ DIAGRAMME BPMN
    if data.get("svg"):
        try:
            # 1. créer fichier temporaire
            with tempfile.NamedTemporaryFile(delete=False, suffix=".svg") as tmp_svg:
                tmp_svg.write(data["svg"].encode("utf-8"))
                tmp_svg_path = tmp_svg.name

            # 2. lire le svg correctement
            drawing = svg2rlg(tmp_svg_path)

            # 3. ajouter au PDF
            elements.append(drawing)
            elements.append(Spacer(1, 20))

        except Exception as e:
            print("Erreur SVG:", e)


    # 📊 PROGRESSION
    progression = data["analysisData"]["progression"]

    elements.append(Paragraph(
        f"<b>Overall Score:</b> {progression['overall_score']}%",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"<b>Completed Layers:</b> {progression['completed_layers']}",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 20))

    # 📌 VALIDATION POINTS
    points = data["analysisData"]["validation_points"]

    # 🔥 Trier + grouper par layer
    points = sorted(points, key=lambda x: x["layer"])

    for layer, layer_points in groupby(points, key=lambda x: x["layer"]):

        # 🧱 Layer title
        elements.append(Paragraph(f"Layer {layer}", styles["Heading2"]))
        elements.append(Spacer(1, 10))

        for p in layer_points:

            # ✅ FIX IMPORTANT (fallback nom → id)
            element_name = p.get("element_name") or p["bpmn_element_id"]

            elements.append(Paragraph(
                f"❌ <b>Issue:</b> {p['message']}",
                styles["Normal"]
            ))

            elements.append(Paragraph(
                f"<b>Element:</b> {element_name}",
                styles["Normal"]
            ))

            elements.append(Paragraph(
                f"❓ <b>Question:</b> {p['recommendation']}",
                styles["Normal"]
            ))

            # 🧠 Feedback expert
            if p.get("domain_expert_feedback"):
                elements.append(Paragraph(
                    f"<b>Expert feedback:</b> {p['domain_expert_feedback']}",
                    styles["Italic"]
                ))

            elements.append(Spacer(1, 12))

        # 🔹 séparation entre layers
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
        elements.append(Spacer(1, 15))

    # 📄 Génération PDF
    doc.build(elements)

    return FileResponse(file_path, filename="bpmn-report.pdf")
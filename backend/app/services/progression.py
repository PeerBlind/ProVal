# app/services/progression.py
"""
Calcul automatique de la progression gamifiée à travers les layers.
"""
from typing import List
from app.models.validation import ValidationPoint, Progression

def calculate_progression(
    validation_points: List[ValidationPoint],
    current_prog: Progression
) -> Progression:
    """
    Calcule la progression automatiquement.
    
    Logique :
    - Si TOUS les points du current_layer sont resolved OU ignored
    - Alors : ajouter ce layer aux completed_layers et passer au suivant
    
    Args:
        validation_points: Tous les validation points
        current_prog: Progression actuelle
    
    Returns:
        Progression mise à jour
    """
    current_layer = current_prog.current_layer
    
    while current_layer <= 6:

        # récupérer les points du layer
        layer_points = [
            p for p in validation_points
            if p.layer == current_layer
        ]

        print(f"Layer {current_layer} → {len(layer_points)} points")

        # CAS 1 — aucun point → layer validé automatiquement
        if len(layer_points) == 0:
            if current_layer not in current_prog.completed_layers:
                current_prog.completed_layers.append(current_layer)

            current_layer += 1
            continue

        # CAS 2 — vérifier si tous les points sont traités
        all_done = all(
            p.status == 'resolved' or p.ignored
            for p in layer_points
        )

        if all_done:
            if current_layer not in current_prog.completed_layers:
                current_prog.completed_layers.append(current_layer)

            current_layer += 1
            continue

        # CAS 3 — il reste des points → on s’arrête ici
        break

    # 🔥 mise à jour du layer courant FINAL
    current_prog.current_layer = min(current_layer, 6)
    
    # Calculer le score global (pourcentage de layers complétés)
    nb_completed = len(current_prog.completed_layers)
    current_prog.overall_score = round((nb_completed / 6) * 100, 1)
    
    return current_prog
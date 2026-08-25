"""
Configuration de l'application avec variables d'environnement.
"""
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

# Configuration OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY manquante dans .env")

# Configuration générale
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")
# dev en local dans le cors_origins : http://localhost:5173
# Configuration bpmnlint
BPMNLINT_PATH = os.getenv("BPMNLINT_PATH", "bpmnlint")

# Logs
DEBUG = ENVIRONMENT == "development"

if DEBUG:
    print("✅ Config chargée :")
    print(f"  - Environment: {ENVIRONMENT}")
    print(f"  - CORS Origins: {CORS_ORIGINS}")
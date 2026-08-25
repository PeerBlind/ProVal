"""
Point d'entrée FastAPI avec configuration CORS et routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.routers import ai
from fastapi.staticfiles import StaticFiles
import os

# Créer l'application FastAPI
app = FastAPI(
    title="BPMN AI Analysis API",
    description="API d'analyse BPMN intelligente par couches avec bpmnlint + OpenAI",
    version="1.0.0"
)

# Configuration CORS pour le frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes IA
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Analysis"])

@app.get("/health")
async def health():
    """Endpoint de santé pour monitoring."""
    return {"status": "healthy"}


# SERVIR REACT
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")
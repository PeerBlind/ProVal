"""
Service de connexion à Firestore.

Ce fichier initialise Firebase Admin pour permettre au backend
de lire et écrire dans Firestore.

IMPORTANT :
On protège l'initialisation avec `if not firebase_admin._apps`
car FastAPI avec `--reload` redémarre plusieurs fois le serveur.
"""
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Empêche Firebase de s'initialiser plusieurs fois
if not firebase_admin._apps:

    if os.getenv("FIREBASE_KEY"):
        firebase_key = json.loads(os.environ["FIREBASE_KEY"])
        cred = credentials.Certificate(firebase_key)

    else:
        cred = credentials.Certificate("firebase-key.json")

    # Initialiser Firebase Admin
    firebase_admin.initialize_app(cred)

# Client Firestore global
db = firestore.client()
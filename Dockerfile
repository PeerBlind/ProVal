# ---------- Build React(front)---------
FROM node:20 AS build

WORKDIR /app

# variable d'environnement
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_API_URL

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_API_URL=$VITE_API_URL

#  install deps
COPY package.json package-lock.json ./
RUN npm install

#  copy code
COPY . .

#  build (maintenant les variables sont dispo)
RUN npm run build

#  serve
#RUN npm install -g serve
#CMD ["serve", "-s", "dist", "-l", "3000"]

#---------- Backend -------------
  FROM python:3.12

WORKDIR /app

RUN apt-get update && apt-get install -y nodejs npm
RUN npm install -g bpmnlint

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
# IMPORTANT
ENV PYTHONPATH=/app/backend

# copier le build React
COPY --from=build /app/dist ./dist


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
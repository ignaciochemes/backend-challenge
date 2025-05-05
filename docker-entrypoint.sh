#!/bin/sh

# Esperar 5 segundos antes de iniciar la aplicación
echo "Esperando 10 segundos para que el backend esté listo..."
sleep 10

# Iniciar la aplicación
cd /app
npm run start:${DEPLOY_ENV}
# Backend Challenge - NestJS API

## Descripción

Este proyecto es una API desarrollada con NestJS que proporciona endpoints para la gestión de empresas y transferencias.

## Endpoints Implementados

- **Empresas que hicieron transferencias el último mes**:
  - `GET /api/v1/backend-challenge/transfers/companies/last-month`

- **Empresas que se adhirieron el último mes**:
  - `GET /api/v1/backend-challenge/companies/adhering/last-month`

- **Adhesión de una empresa**:
  - `POST /api/v1/backend-challenge/companies`

## Estructura del Proyecto

```
src/
├── controllers/       # Controladores de la API
├── services/          # Servicios con la lógica de negocio
├── daos/              # Data Access Objects para acceso a datos
├── models/            # Modelos de datos
│   ├── entities/      # Entidades de base de datos
│   ├── request/       # DTOs para las peticiones
│   ├── response/      # DTOs para las respuestas
├── config/            # Configuraciones
└── utils/             # Utilidades
```

## Requisitos

- Node.js 22.x
- PostgreSQL 17.x
- npm

## Configuración

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo `.env.example` y crea los archivos de configuración necesarios:
   ```bash
   cp .env.example .env.local
   cp .env.example .env.dev
   cp .env.example .env
   ```
4. Configura las variables de entorno en los archivos `.env.local`, `.env.dev` y `.env` según tus necesidades.

## Ejecución

### Base de Datos

Puedes iniciar PostgreSQL utilizando Docker Compose:

```bash
docker-compose up -d
```

### Desarrollo Local

```bash
npm run start:local
```

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run start:prod
```

## Pruebas

### Pruebas Unitarias

```bash
npm run test
```

### Pruebas End-to-End

```bash
npm run test:e2e
```

### Cobertura de Pruebas

```bash
npm run test:cov
```

## Docker

### Construcción de la Imagen

```bash
docker build -t backend-challenge .
```

### Ejecución del Contenedor
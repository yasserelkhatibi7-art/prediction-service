# Microservicio de Predicción (`prediction-service`)
**Asignatura:** Sistemas Operativos y Distribuidos  
**Grado:** Ingeniería en Inteligencia Artificial  

---

## 📌 Descripción del Proyecto
Este microservicio forma parte de una arquitectura distribuida orientada a microservicios para la monitorización y predicción del consumo de recursos mediante modelos de Deep Learning.

El servicio expone una API REST construida con **Node.js** y **Express** que ejecuta inferencias de una red neuronal multicapa (MLP) exportada en formato **ONNX** a través del motor **ONNX Runtime**, encargándose del preprocesamiento estadístico (normalización Z-score) y la entrega de predicciones.

---

## 📅 Registro de Actividades por Sesión

### Sesión 1 — Sprint 1: Diseño del Sistema y Entrenamiento del Modelo
*Fecha: 13 de noviembre de 2026*

- **Diseño Arquitectónico Distribuido:**
  - Definición de la interacción entre microservicios: *Orchestrator*, *Acquisition Service*, *Prediction Service* y la capa de *Frontend*.
  - Elaboración de diagramas de componentes y diagramas de secuencia para el flujo de datos.
  - Especificación formal de contratos de comunicación API REST y formatos de intercambio JSON (`contratos.pdf`).
- **Preparación y Procesamiento de Datos:**
  - Análisis de series temporales de consumo histórico (`X_consumo.csv`, `y_consumo.csv`).
  - Configuración de las 7 variables predictivas: `consumo_t`, `consumo_t-1`, `consumo_t-2`, `hora`, `dia_semana`, `mes`, `dia_mes`.
- **Entrenamiento y Exportación del Modelo:**
  - Entrenamiento de la red neuronal Perceptrón Multicapa (MLP) en Kaggle.
  - Exportación del modelo entrenado a formato interoperable **ONNX** (`modelo.onnx`).
  - Generación de los parámetros de estandarización (`normalizacion.json` con vectores `mean` y `scale`).

---

### Sesión 2 — Sprint 2: Creación y Refactorización del Microservicio
*Fecha: 20 de noviembre de 2026*

- **Puesta en Marcha del Entorno:**
  - Inicialización del repositorio Git `prediction-service` configurado con `.gitignore` específico para Node.js.
  - Creación del proyecto con `package.json` e instalación de dependencias núcleo: `express` y `onnxruntime-node`.
  - Integración de los artefactos del modelo en el directorio local `modelo/`.
- **Implementación Monolítica Inicial:**
  - Construcción de un primer prototipo en `server.js` que unificaba en un solo archivo la configuración HTTP, middlewares, inferencia ONNX y endpoints.
  - Respaldo de esta versión funcional inicial en `server_old.js`.
- **Refactorización a Arquitectura Modular por Capas:**
  - **Capa de Configuración de la App (`src/app.js`):** Desacoplamiento de la inicialización de Express, configuración de middleware para parsing JSON (`express.json()`) y montaje de enrutadores.
  - **Capa de Rutas (`src/routes/prediction.routes.js`):** Definición declarativa de endpoints mediante `express.Router()`.
  - **Capa de Controladores (`src/controllers/prediction.controller.js`):** Recepción de peticiones HTTP, extracción de parámetros, invocación de la lógica de negocio y gestión de respuestas/códigos de error (`200 OK`, `400 Bad Request`, `500 Internal Server Error`).
  - **Capa de Servicios (`src/services/prediction.service.js`):** Aislamiento completo de la lógica de negocio y Machine Learning (independiente de Express):
    - Ciclo de vida del modelo con inicialización asíncrona de la sesión ONNX (`initModel`).
    - Validación rigurosa de entradas (comprobación de array, dimensión exacta de 7 variables y finitud numérica).
    - Transformación y escalado de datos mediante normalización Z-score.
    - Conversión a tensor `Float32` y ejecución de la inferencia.
  - **Punto de Arranque Asíncrono (`server.js`):** Implementación de arranque seguro donde la sesión de inferencia ONNX se carga obligatoriamente en memoria antes de comenzar a escuchar peticiones en el puerto `3002`.

---

## 🛠️ Estructura Actual del Microservicio

```text
prediction-service/
├── modelo/
│   ├── modelo.onnx             # Modelo ONNX exportado
│   └── normalizacion.json      # Medias y desviaciones de las 7 variables
├── src/
│   ├── app.js                  # Configuración de Express y middlewares
│   ├── controllers/
│   │   └── prediction.controller.js  # Manejador de peticiones y respuestas HTTP
│   ├── routes/
│   │   └── prediction.routes.js      # Enrutador de la API REST
│   └── services/
│       └── prediction.service.js     # Lógica de inferencia, validación y normalización
├── node_modules/               # Dependencias del proyecto
├── .gitignore                  # Exclusiones de Git para Node.js
├── package.json                # Metadatos y dependencias (Express, ONNX Runtime)
├── package-lock.json           # Árbol de dependencias bloqueado
├── server.js                   # Punto de entrada principal con precarga del modelo
├── server_old.js               # Versión previa monolítica (respaldo pre-refactorización)
└── README.md                   # Documentación y bitácora del proyecto
```

---

## 🚀 Endpoints Disponibles

| Método | Endpoint | Descripción | Formato Body | Respuesta Exitosa |
| :---: | :--- | :--- | :--- | :--- |
| **GET** | `/features` | Consulta los nombres de las 7 variables requeridas | Ninguno | `200 OK` `{ "features": [...] }` |
| **POST** | `/predictions` | Realiza una predicción, calcula metadatos y persiste en MongoDB | `{ "features": [v1, ..., v7], "dataId": "opcional" }` | `200 OK` `{ "predictionId": "...", "prediction": <float>, "timestamp": "...", "latencyMs": <int>, "dataId": "..." }` |
| **GET** | `/predictions` | Obtiene el historial completo de predicciones almacenadas | Ninguno | `200 OK` `{ "predictions": [...] }` |
| **GET** | `/predictions/:id` | Consulta una predicción por `_id` de Mongo o `predictionId` UUID | Ninguno | `200 OK` `{ "prediction": {...} }` |
| **DELETE**| `/predictions/:id` | Elimina una predicción del registro por `_id` o `predictionId` | Ninguno | `200 OK` `{ "mensaje": "..." }` |
| **GET** | `/health` | Liveness probe: estado general y tiempo de actividad del servicio | Ninguno | `200 OK` `{ "status": "ok", "uptime": <float> }` |
| **GET** | `/ready` | Readiness probe: verifica modelo ONNX cargado y conexión activa con MongoDB | Ninguno | `200 OK` `{ "ready": true }` / `503 Service Unavailable` |

---

## 💾 Persistencia y Base de Datos (MongoDB)
- **Base de datos:** `prediction-service`
- **Cadena de conexión por defecto:** `mongodb://127.0.0.1:27017/prediction-service` (configurable vía variable de entorno `MONGO_URI`).
- **Colección:** `predictions` (gestionada mediante Mongoose con esquema estricto y auditoría de latencia).
- **Control de arranque:** Si MongoDB no está iniciado (servicio manual en Windows), el servidor se inicia en modo resiliente reportando `ready: false` hasta que el servicio de BD esté activo.

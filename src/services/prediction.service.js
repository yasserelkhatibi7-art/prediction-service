const ort = require("onnxruntime-node");
const path = require("path");
const fs = require("fs");

// Rutas de los archivos del modelo
const modelPath = path.join(
    __dirname, "../../modelo/modelo.onnx"
);
const normPath = path.join(
    __dirname, "../../modelo/normalizacion.json"
);

// Cargar parámetros de normalización
const norm = JSON.parse(
    fs.readFileSync(normPath, "utf8")
);

let session;

// Inicializar el modelo
async function initModel() {
    session = await ort.InferenceSession.create(modelPath);
    console.log("Modelo ONNX cargado correctamente");
}

// Obtener nombres de las características
function getFeatures() {
    return norm.features;
}

// Realizar predicción
async function predict(features) {
    // Validar entrada
    if (
        !Array.isArray(features) ||
        features.length !== norm.mean.length ||
        !features.every(v =>
            typeof v === "number" && Number.isFinite(v)
        )
    ) {
        const error = new Error(
            `Se esperan ${norm.mean.length} valores numéricos`
        );
        error.status = 400;
        throw error;
    }

    // Normalizar las entradas
    const datos = features.map((valor, i) =>
        (valor - norm.mean[i]) / norm.scale[i]
    );

    // Construir tensor de entrada
    const tensor = new ort.Tensor(
        "float32",
        Float32Array.from(datos),
        [1, datos.length]
    );

    // Ejecutar inferencia
    const resultado = await session.run({
        [session.inputNames[0]]: tensor
    });

    // Devolver el consumo predicho
    return resultado[session.outputNames[0]].data[0];
}

// Comprobar si el modelo está listo
function isReady() {
    return session != null;
}

module.exports = {
    initModel,
    getFeatures,
    predict,
    isReady
};
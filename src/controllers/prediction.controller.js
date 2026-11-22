const crypto = require("crypto");
const predictionService = require("../services/prediction.service");

// Consultar características
function getFeatures(req, res) {
    res.json({
        features: predictionService.getFeatures()
    });
}

// Procesar petición de predicción
async function predict(req, res) {
    try {
        const { features, dataId = null } = req.body || {};
        const start = Date.now();
        const prediccion = await predictionService.predict(features);
        const latencyMs = Date.now() - start;

        res.json({
            predictionId: crypto.randomUUID(),
            prediction: prediccion,
            timestamp: new Date().toISOString(),
            latencyMs,
            dataId
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            error: error.status === 400
                ? error.message
                : "Error al ejecutar la predicción"
        });
    }
}

// Probe de liveness
function health(req, res) {
    res.json({ status: "ok", uptime: process.uptime() });
}

// Probe de readiness
function ready(req, res) {
    if (predictionService.isReady()) {
        res.json({ ready: true });
    } else {
        res.status(503).json({ ready: false });
    }
}

module.exports = {
    getFeatures,
    predict,
    health,
    ready
};

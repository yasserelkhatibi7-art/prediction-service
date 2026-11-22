const crypto = require("crypto");
const predictionService = require("../services/prediction.service");

// Consultar características requeridas
function getFeatures(req, res) {
    res.json({
        features: predictionService.getFeatures()
    });
}

// Procesar petición de predicción y persistir en MongoDB
async function predict(req, res) {
    try {
        const { features, dataId = null } = req.body || {};
        const start = Date.now();
        const prediccion = await predictionService.predict(features);
        const latencyMs = Date.now() - start;

        const resultado = {
            predictionId: crypto.randomUUID(),
            prediction: prediccion,
            timestamp: new Date().toISOString(),
            latencyMs,
            dataId,
            features
        };

        // Persistir en MongoDB
        try {
            await predictionService.savePrediction(resultado);
        } catch (dbError) {
            console.error("Error al persistir la predicción en la base de datos:", dbError);
        }

        res.json({
            predictionId: resultado.predictionId,
            prediction: resultado.prediction,
            timestamp: resultado.timestamp,
            latencyMs: resultado.latencyMs,
            dataId: resultado.dataId
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

// Obtener listado de todas las predicciones persistidas
async function getPredictions(req, res) {
    try {
        const predictions = await predictionService.getPredictions();
        res.json({ predictions });
    } catch (error) {
        console.error("Error al obtener las predicciones:", error);
        res.status(500).json({
            error: `Error al obtener las predicciones: ${error.message}`
        });
    }
}

// Obtener una predicción específica por identificador
async function getPredictionById(req, res) {
    try {
        const { id } = req.params;
        const item = await predictionService.getPredictionById(id);
        if (!item) {
            return res.status(404).json({
                error: "Predicción no encontrada"
            });
        }
        res.json({ prediction: item });
    } catch (error) {
        console.error("Error al consultar la predicción:", error);
        res.status(500).json({
            error: `Error al consultar la predicción: ${error.message}`
        });
    }
}

// Eliminar una predicción específica por identificador
async function deletePrediction(req, res) {
    try {
        const { id } = req.params;
        const item = await predictionService.deletePredictionById(id);
        if (!item) {
            return res.status(404).json({
                error: "Predicción no encontrada"
            });
        }
        res.json({
            mensaje: "Predicción eliminada correctamente"
        });
    } catch (error) {
        console.error("Error al eliminar la predicción:", error);
        res.status(500).json({
            error: `Error al eliminar la predicción: ${error.message}`
        });
    }
}

// Probe de liveness
function health(req, res) {
    res.json({
        status: "ok",
        uptime: process.uptime()
    });
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
    getPredictions,
    getPredictionById,
    deletePrediction,
    health,
    ready
};

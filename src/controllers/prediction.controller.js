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
 const { features } = req.body || {};
 const prediccion =
 await predictionService.predict(features);
 res.json({
 prediction: prediccion });
 } catch (error) {
 console.error(error);
 res.status(error.status || 500).json({
 error: error.status === 400
 ? error.message
 : "Error al ejecutar la predicción"
 });
 }
}
module.exports = {
 getFeatures,
 predict
};
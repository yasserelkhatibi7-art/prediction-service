const app = require("./src/app");
const predictionService = require(
 "./src/services/prediction.service"
);
const PORT = 3002;
async function iniciar() {
 // Inicializar modelo antes de aceptar peticiones
 await predictionService.initModel();
 // Arrancar servidor HTTP
 app.listen(PORT, () => {
 console.log(`Servidor en http://localhost:${PORT}`);
 });
}iniciar().catch(error => {
 console.error("Error al iniciar el servidor:", error);
 process.exit(1);
});

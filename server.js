const mongoose = require("mongoose");
const app = require("./src/app");
const predictionService = require("./src/services/prediction.service");

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/prediction-service";

async function iniciar() {
    // Conectar a MongoDB según la guía Material_complementario_CRUD
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Conexión a la base de datos establecida");
    } catch (err) {
        console.error("Error de conexión a la base de datos:", err);
    }

    // Inicializar modelo antes de aceptar peticiones
    await predictionService.initModel();

    // Arrancar servidor HTTP
    app.listen(PORT, () => {
        console.log(`Servidor en http://localhost:${PORT}`);
    });
}

iniciar().catch(error => {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
});

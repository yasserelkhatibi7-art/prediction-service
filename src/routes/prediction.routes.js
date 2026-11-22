const express = require("express");
const controller = require("../controllers/prediction.controller");
const router = express.Router();
router.get("/features", controller.getFeatures);
router.post("/predictions", controller.predict);
router.get("/health", controller.health);
router.get("/ready", controller.ready);
module.exports = router;
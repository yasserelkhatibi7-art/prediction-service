'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
    predictionId: {
        type: String,
        required: true,
        unique: true
    },
    prediction: {
        type: Number,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    latencyMs: {
        type: Number,
        required: true
    },
    dataId: {
        type: String,
        default: null
    },
    features: {
        type: [Number],
        required: true
    }
}, {
    versionKey: false
});

module.exports = mongoose.model("Prediction", PredictionSchema);

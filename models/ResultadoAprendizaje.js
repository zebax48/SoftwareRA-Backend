// models/ResultadoAprendizaje.js
const mongoose = require('mongoose');

const resultadoAprendizajeSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    facultad: {type: String, required: true},
    descripcion: { type: String, required: true },
    programas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Programa' }]
});

const ResultadoAprendizaje = mongoose.model('ResultadoAprendizaje', resultadoAprendizajeSchema);

module.exports = ResultadoAprendizaje;
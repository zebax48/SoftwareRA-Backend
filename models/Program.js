//Program.js
const mongoose = require('mongoose');

const programaSchema = new mongoose.Schema({
    facultad: { type: String, required: true },
    nombre: { type: String, required: true },
    semestres: { type: Number, required: true },
    registroCalificado: { type: String, required: false }
});

const Programa = mongoose.model('Programa', programaSchema, 'programas');

module.exports = Programa;
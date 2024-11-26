const mongoose = require('mongoose');

// Esquema para los estudiantes
const estudianteSchema = new mongoose.Schema({
    documento: { type: String, required: true },
    nombre: { type: String, required: true },
    notas: [{
        ra: { type: mongoose.Schema.Types.ObjectId, ref: 'ResultadoAprendizaje', required: true },
        nota: { type: Number, required: true }
    }],
});

// Esquema para los grupos
const grupoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    encargado: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    estudiantes: [estudianteSchema],
    promediosRA: [{
        ra: { type: mongoose.Schema.Types.ObjectId, ref: 'ResultadoAprendizaje' },
        promedio: { type: Number, default: 0 }
    }],
    promedioGrupo: { type: Number, default: 0 }
});

// Esquema para las pruebas
const pruebaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    programa: { type: mongoose.Schema.Types.ObjectId, ref: 'Programa', required: true },
    resultadosAprendizaje: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResultadoAprendizaje', required: true }],
    descripcion: { type: String, required: true },
    grupos: [grupoSchema],
    promedioPrueba: { type: Number, default: 0 },
    semestre: { type: String, required: true },
    fecha: { type: String, required: true }
});

const Prueba = mongoose.model('Prueba', pruebaSchema);

module.exports = Prueba;

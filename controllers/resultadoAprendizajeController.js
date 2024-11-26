// controllers/resultadoAprendizajeController.js
const ResultadoAprendizaje = require('../models/ResultadoAprendizaje');
const Program = require('../models/Program');
const mongoose = require('mongoose');

// Controlador para crear un nuevo Resultado de Aprendizaje
const createResultadoAprendizaje = async (req, res) => {
    const { nombre, facultad, descripcion, programas } = req.body;

    try {
        // Verificar si los programas existen (si se proporcionan)
        if (programas && programas.length > 0) {
            const existingPrograms = await Program.find({ _id: { $in: Programa } });
            if (existingPrograms.length !== programas.length) {
                return res.status(404).json({ message: 'Uno o más programas no fueron encontrados' });
            }
        }

        // Crear el nuevo RA
        const nuevoRA = new ResultadoAprendizaje({
            nombre,
            facultad,
            descripcion,
            programas: programas || [] // Asignar un arreglo vacío si no se proporcionan programas
        });

        await nuevoRA.save();

        res.status(201).json({ message: 'Resultado de Aprendizaje creado exitosamente', nuevoRA });
    } catch (error) {
        console.error('Error al crear Resultado de Aprendizaje:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Controlador para agregar programas a un Resultado de Aprendizaje
const addProgramToRA = async (req, res) => {
    const { raId, programIds } = req.body;

    try {
        // Verificar si el RA existe
        const resultadoAprendizaje = await ResultadoAprendizaje.findById(raId);
        if (!resultadoAprendizaje) {
            return res.status(404).json({ message: 'Resultado de aprendizaje no encontrado' });
        }

        // Asegurarse de que programIds sea un arreglo
        const programIdsArray = Array.isArray(programIds) ? programIds : [programIds];

        // Verificar si los programas existen
        const existingPrograms = await Program.find({ _id: { $in: programIdsArray } });
        if (existingPrograms.length !== programIdsArray.length) {
            return res.status(404).json({ message: 'Uno o más programas no fueron encontrados' });
        }

        // Filtrar los programas que ya están en el RA
        const programasNoExistentesEnRA = programIdsArray.filter(
            programId => !resultadoAprendizaje.programas.includes(programId)
        );

        if (programasNoExistentesEnRA.length === 0) {
            return res.status(400).json({ message: 'Todos los programas ya están agregados al Resultado de Aprendizaje' });
        }

        // Agregar los programas que no están ya presentes en el RA
        resultadoAprendizaje.programas.push(...programasNoExistentesEnRA);

        await resultadoAprendizaje.save();

        res.status(200).json({ message: 'Programas agregados al Resultado de Aprendizaje exitosamente', resultadoAprendizaje });
    } catch (error) {
        console.error('Error al agregar programas al Resultado de Aprendizaje:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Obtener todos los resultados de aprendizaje
const getAllResultadosAprendizaje = async (req, res) => {
    try {
        const resultados = await ResultadoAprendizaje.find();
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener Resultados de Aprendizaje:', error.message, error.stack);
        res.status(500).json({ error: 'Error al obtener Resultados de Aprendizaje' });
    }
};

//Obtener todos los reultados de aprendizaje con programas relacionados

const getAllResultadosAprendizajePrograms = async (req, res) => {
    try {
        const resultados = await ResultadoAprendizaje.find().populate('programas');
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener Resultados de Aprendizaje con programas relacionados:', error.message, error.stack);
        res.status(500).json({ error: 'Error al obtener Resultados de Aprendizaje con programas relacionados' });
    }
};

// Obtener un resultado de aprendizaje por su ID
const getResultadoAprendizajeById = async (req, res) => {
    const raId = req.params.raId;

    try {
        const resultado = await ResultadoAprendizaje.findById(raId).populate('programas');

        if (!resultado) {
            return res.status(404).json({ message: 'Resultado de Aprendizaje no encontrado' });
        }

        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener Resultado de Aprendizaje:', error);
        res.status(500).json({ error: 'Error al obtener Resultado de Aprendizaje' });
    }
};

// Actualizar un resultado de aprendizaje por su ID
const updateResultadoAprendizaje = async (req, res) => {
    const raId = req.params.raId;
    const { nombre, facultad, descripcion } = req.body;

    try {

        const resultado = await ResultadoAprendizaje.findByIdAndUpdate(raId, {
            nombre,
            facultad,
            descripcion
        }, { new: true }).populate('programas');

        if (!resultado) {
            return res.status(404).json({ message: 'Resultado de Aprendizaje no encontrado' });
        }

        res.json({ message: 'Resultado de Aprendizaje actualizado exitosamente', resultado });
    } catch (error) {
        console.error('Error al actualizar Resultado de Aprendizaje:', error);
        res.status(500).json({ error: 'Error al actualizar Resultado de Aprendizaje' });
    }
};

// Eliminar un resultado de aprendizaje por su ID
const deleteResultadoAprendizaje = async (req, res) => {
    const raId = req.params.raId;

    try {
        const resultado = await ResultadoAprendizaje.findByIdAndDelete(raId);

        if (!resultado) {
            return res.status(404).json({ message: 'Resultado de Aprendizaje no encontrado' });
        }

        res.json({ message: 'Resultado de Aprendizaje eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar Resultado de Aprendizaje:', error);
        res.status(500).json({ error: 'Error al eliminar Resultado de Aprendizaje' });
    }
};

// Obtener resultados de aprendizaje por programa
const getResultadosByProgram = async (req, res) => {
    const { programId } = req.params;

    try {
        const resultados = await ResultadoAprendizaje.find({ programas: programId });

        if (!resultados.length) {
            return res.status(404).json({ message: 'No se encontraron resultados de aprendizaje para este programa' });
        }

        res.status(200).json(resultados);
    } catch (error) {
        console.error('Error al obtener resultados de aprendizaje por programa:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

//Eliminar programas de un RA
const removeProgramFromRA = async (req, res) => {
    const { raId, programIds } = req.body;

    try {
        // Verificar si el Resultado de Aprendizaje existe
        const resultadoAprendizaje = await ResultadoAprendizaje.findById(raId);
        if (!resultadoAprendizaje) {
            return res.status(404).json({ message: 'Resultado de aprendizaje no encontrado' });
        }

        // Asegurarse de que programIds sea un arreglo y convertir a ObjectId
        const programIdsArray = Array.isArray(programIds) ? programIds : [programIds];
        const programIdsObjectId = programIdsArray.map(id => new mongoose.Types.ObjectId(id));

        // Eliminar los programas del Resultado de Aprendizaje usando .equals() para comparación de ObjectId
        resultadoAprendizaje.programas = resultadoAprendizaje.programas.filter(programId => 
            !programIdsObjectId.some(id => id.equals(programId))
        );

        // Guardar los cambios en el Resultado de Aprendizaje
        await resultadoAprendizaje.save();

        // Volver a obtener el resultado de aprendizaje actualizado
        const updatedResultadoAprendizaje = await ResultadoAprendizaje.findById(raId).populate('programas');

        res.status(200).json({ message: 'Programas eliminados del Resultado de Aprendizaje exitosamente', resultadoAprendizaje: updatedResultadoAprendizaje });
    } catch (error) {
        console.error('Error al eliminar programas del Resultado de Aprendizaje:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

module.exports = {
    createResultadoAprendizaje,
    addProgramToRA,
    getAllResultadosAprendizaje,
    getAllResultadosAprendizajePrograms,
    getResultadoAprendizajeById,
    updateResultadoAprendizaje,
    deleteResultadoAprendizaje,
    getResultadosByProgram,
    removeProgramFromRA
};
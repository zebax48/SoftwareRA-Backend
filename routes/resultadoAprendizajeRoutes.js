// routes/resultadoAprendizajeRoutes.js
const express = require('express');
const router = express.Router();
const { createResultadoAprendizaje, addProgramToRA, getAllResultadosAprendizaje, getAllResultadosAprendizajePrograms, getResultadoAprendizajeById, updateResultadoAprendizaje, deleteResultadoAprendizaje, getResultadosByProgram, removeProgramFromRA } = require('../controllers/resultadoAprendizajeController');
const authMiddleware = require('../middleware/authMiddleware');

// Proteger todas las rutas con el middleware de autenticación
router.use(authMiddleware);

// Ruta para crear un nuevo resultado de aprendizaje
router.post('/create', createResultadoAprendizaje);

// Ruta para agregar programas a un RA
router.post('/add-programs', addProgramToRA);

// Ruta para obtener todos los resultados de aprendizaje
router.get('/', getAllResultadosAprendizaje);

// Ruta para obtener todos los resultados de aprendizaje con programas relacionados
router.get('/rap', getAllResultadosAprendizajePrograms);

// Ruta para obtener un resultado de aprendizaje por su ID
router.get('/:raId', getResultadoAprendizajeById);

// Ruta para actualizar un resultado de aprendizaje por su ID
router.put('/update/:raId', updateResultadoAprendizaje);

// Ruta para eliminar un resultado de aprendizaje por su ID
router.delete('/delete/:raId', deleteResultadoAprendizaje);

// Ruta para obtener resultados de aprendizaje por programa
router.get('/program/:programId', getResultadosByProgram);

// Ruta para eliminar programas de un RA
router.post('/remove-programs', removeProgramFromRA);



module.exports = router;
const express = require('express');
const router = express.Router();
const { createProgram, getAllPrograms, updateProgram, deleteProgram, getProgramById } = require('../controllers/programController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Ruta para crear un nuevo programa académico
router.post('/create', authMiddleware, createProgram);

//Ruta para obtener todos los programas
router.get('/', authMiddleware, getAllPrograms)

//Ruta para actualizar programa
router.put('/update/:programId', updateProgram);

//Ruta para eliminar programa
router.delete('/delete/:programId', deleteProgram);

// Ruta para obtener un programa por su ID
router.get('/:programId', getProgramById);

module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware.js');

const { 
    createPrueba, 
    editPrueba,
    createOrUpdateStudent,
    deleteStudentFromGroup,
    importStudentsToGroup,
    getAllPruebas,
    getPrueba,
    deletePrueba,
    getPromedios,
    getGrupoByPruebaIdAndGrupoId,
    createStudent
} = require('../controllers/pruebaController');

const router = express.Router();

router.use(authMiddleware);

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Ruta para crear una nueva prueba
router.post('/create-prueba', createPrueba);

// Ruta para obtener todos las pruebas
router.get('/', getAllPruebas)

// Ruta para obtener prueba por Id
router.get('/:pruebaId', getPrueba)

// Ruta para actualizar prueba
router.put('/:pruebaId', editPrueba)

// Ruta para importar estudiantes desde un archivo Excel
router.post('/:pruebaId/grupos/:grupoId/importar-estudiantes', upload.single('file'), importStudentsToGroup);

// Ruta para actualizar un estudiante
router.put('/:pruebaId/grupos/:grupoId/estudiantes/:estudianteId/notas/:notaId', createOrUpdateStudent);

// Ruta para crear un estudiante
router.post('/:pruebaId/grupos/:grupoId/estudiantes', createStudent);

// Ruta para eliminar un estudiante
router.delete('/:pruebaId/grupos/:grupoId/estudiantes/:estudianteId', deleteStudentFromGroup);

// Ruta para obtener los promedios de los resultados de aprendizaje de un programa
//router.get('/promedios/:programaId', getPromedios);

// Ruta para eliminar una prueba
router.delete('/:pruebaId', deletePrueba)

// Ruta para obtener un grupo específico de una prueba específica
router.get('/:pruebaId/grupos/:grupoId', getGrupoByPruebaIdAndGrupoId);

module.exports = router;
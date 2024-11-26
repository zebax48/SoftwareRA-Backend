const Prueba = require('../models/Prueba');
const ResultadoAprendizaje = require('../models/ResultadoAprendizaje');
const Program = require('../models/Program');
const User = require('../models/User');
const XLSX = require('xlsx');

// Crear una nueva prueba
const createPrueba = async (req, res) => {
    const { nombre, programaId, raIds, semestre, descripcion, cantidadGrupos, usuarios, fecha } = req.body;

    try {
        const programa = await Program.findById(programaId);
        if (!programa) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        const resultadosAprendizaje = await ResultadoAprendizaje.find({ '_id': { $in: raIds } });
        if (resultadosAprendizaje.length !== raIds.length) {
            return res.status(404).json({ message: 'Uno o más resultados de aprendizaje no encontrados' });
        }

        const grupos = [];
        for (let i = 0; i < cantidadGrupos; i++) {
            const encargadoId = usuarios[i];
            const encargado = await User.findById(encargadoId);
            if (!encargado) {
                return res.status(404).json({ message: `Encargado ${encargadoId} no encontrado` });
            }
            grupos.push({
                nombre: `Grupo ${i + 1}`,
                encargado: encargadoId,
                estudiantes: [],
            });
        }

        const prueba = new Prueba({
            nombre,
            programa: programaId,
            resultadosAprendizaje: raIds,
            descripcion,
            semestre,
            grupos,
            fecha,
        });

        await prueba.save();

        res.status(201).json({ message: 'Prueba creada exitosamente', prueba });
    } catch (error) {
        console.error('Error al crear la prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Obtener un grupo específico de una prueba específica
const getGrupoByPruebaIdAndGrupoId = async (req, res) => {
    const { pruebaId, grupoId } = req.params;
    try {
        const prueba = await Prueba.findById(pruebaId).populate('grupos.encargado');
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const grupo = prueba.grupos.id(grupoId);
        if (!grupo) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        grupo.estudiantes.sort((a, b) => a.nombre.localeCompare(b.nombre));

        res.status(200).json({ grupo });
    } catch (error) {
        console.error('Error al obtener el grupo de la prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Importar nombres de estudiantes a un grupo específico desde un archivo Excel
const importStudentsToGroup = async (req, res) => {
    const { pruebaId, grupoId } = req.params;
    const filePath = req.file.path;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const grupo = prueba.grupos.id(grupoId);
        if (!grupo) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length === 0 || data[0][1].toLowerCase() !== 'nombre' || data[0][0].toLowerCase() !== 'documento') {
            throw new Error('El archivo Excel debe tener columnas "Documento" y "Nombre" en la primera fila');
        }

        const estudiantes = data.slice(1).map(row => ({ nombre: row[1], documento: row[0], notas: [] }));

        grupo.estudiantes.push(...estudiantes);
        await prueba.save();

        res.status(200).json({ message: 'Estudiantes importados exitosamente', prueba });
    } catch (error) {
        console.error('Error al importar estudiantes:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Obtener todas las pruebas
const getAllPruebas = async (req, res) => {
    try {
        const pruebas = await Prueba.find().populate('programa resultadosAprendizaje grupos.encargado grupos.estudiantes.notas.ra');

        // Calcular promedios para cada prueba y grupo
        pruebas.forEach(prueba => {
            prueba.grupos.forEach(grupo => {
                grupo.promediosRA = prueba.resultadosAprendizaje.map(ra => ({
                    ra: ra._id,
                    promedio: calcularPromedioRA(grupo, ra._id)
                }));

                grupo.promedioGrupo = calcularPromedioGrupo(grupo);
            });

            prueba.promedioPrueba = calcularPromedioPrueba(prueba);
        });

        res.status(200).json(pruebas);
    } catch (error) {
        console.error('Error al obtener todas las pruebas:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Calcular promedio por RA para un grupo de estudiantes
const calcularPromedioRA = (grupo, raId) => {
    let totalNotas = 0;
    let cantidadNotas = 0;

    if (!grupo.estudiantes || !Array.isArray(grupo.estudiantes)) {
        console.error('Error: grupo.estudiantes no es un array o está undefined');
        return 0;
    }

    grupo.estudiantes.forEach(estudiante => {
        console.log('Procesando estudiante:', estudiante.nombre);

        if (!estudiante.notas || !Array.isArray(estudiante.notas)) {
            console.warn(`Estudiante ${estudiante.nombre} no tiene notas o notas no es un array.`);
            return;
        }

        estudiante.notas.forEach(nota => {
            console.log('Nota encontrada:', nota);
            if (nota.ra._id.toString() === raId.toString()) {
                totalNotas += nota.nota;
                cantidadNotas++;
            }
        });
    });

    console.log('Total notas:', totalNotas, 'Cantidad notas:', cantidadNotas);
    const promedio = cantidadNotas > 0 ? (totalNotas / cantidadNotas) : 0;
    return promedio;
};

// Calcular el promedio de un grupo
const calcularPromedioGrupo = (grupo) => {
    const totalNotas = grupo.estudiantes.reduce((acc, estudiante) => {
        const totalNotasEstudiante = estudiante.notas.reduce((sum, nota) => sum + nota.nota, 0);
        return acc + totalNotasEstudiante;
    }, 0);

    const cantidadNotas = grupo.estudiantes.reduce((acc, estudiante) => acc + estudiante.notas.length, 0);
    return cantidadNotas ? totalNotas / cantidadNotas : 0;
};

// Calcular promedio de toda la prueba
const calcularPromedioPrueba = (prueba) => {
    let totalNotas = 0;
    let cantidadNotas = 0;

    prueba.grupos.forEach(grupo => {
        grupo.estudiantes.forEach(estudiante => {
            estudiante.notas.forEach(nota => {
                totalNotas += nota.nota;
                cantidadNotas++;
            });
        });
    });

    return cantidadNotas ? (totalNotas / cantidadNotas) : 0;
};


// Obtener una prueba con cálculo de promedios
const getPrueba = async (req, res) => {
    const { pruebaId } = req.params;

    try {
        const prueba = await Prueba.findById(pruebaId)
            .populate({
                path: 'grupos.estudiantes.notas.ra',
                select: 'nombre'
            })
            .populate({
                path: 'programa resultadosAprendizaje',
                select: 'nombre descripcion'
            })
            .populate({
                path: 'grupos.encargado',
                select: 'nombres apellidos'
            });

        console.log('Prueba con datos poblados:', prueba);

        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        prueba.grupos.forEach(grupo => {
            grupo.promediosRA = prueba.resultadosAprendizaje.map(ra => ({
                ra: ra._id,
                promedio: calcularPromedioRA(grupo, ra._id)
            }));

            grupo.promedioGrupo = calcularPromedioGrupo(grupo);
        });

        prueba.promedioPrueba = calcularPromedioPrueba(prueba);

        await prueba.save();

        res.status(200).json({ prueba });
    } catch (error) {
        console.error('Error al obtener la prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};


// Eliminar una prueba
const deletePrueba = async (req, res) => {
    const { pruebaId } = req.params;

    try {
        const prueba = await Prueba.findByIdAndDelete(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        res.status(200).json({ message: 'Prueba eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Editar una prueba
const editPrueba = async (req, res) => {
    const { pruebaId } = req.params;
    const { nombre, programaId, raIds, semestre, descripcion, cantidadGrupos, usuarios } = req.body;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        prueba.nombre = nombre;
        prueba.programa = programaId;
        prueba.resultadosAprendizaje = raIds;
        prueba.semestre = semestre;
        prueba.descripcion = descripcion;

        const grupos = [];
        for (let i = 0; i < cantidadGrupos; i++) {
            const encargadoId = usuarios[i];
            const encargado = await User.findById(encargadoId);
            if (!encargado) {
                return res.status(404).json({ message: `Encargado ${encargadoId} no encontrado` });
            }
            grupos.push({
                nombre: `Grupo ${i + 1}`,
                encargado: encargadoId,
                estudiantes: [],
            });
        }
        prueba.grupos = grupos;

        await prueba.save();

        res.status(200).json({ message: 'Prueba editada exitosamente', prueba });
    } catch (error) {
        console.error('Error al editar la prueba:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Eliminar un estudiante de un grupo
const deleteStudentFromGroup = async (req, res) => {
    const { pruebaId, grupoId, estudianteId } = req.params;

    try {
        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ message: 'Prueba no encontrada' });
        }

        const grupo = prueba.grupos.id(grupoId);
        if (!grupo) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }

        const estudianteIndex = grupo.estudiantes.findIndex(est => est._id.toString() === estudianteId);
        if (estudianteIndex === -1) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        grupo.estudiantes.splice(estudianteIndex, 1);

        await prueba.save();

        res.status(200).json({ message: 'Estudiante eliminado exitosamente', prueba });
    } catch (error) {
        console.error('Error al eliminar el estudiante:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

// Crear un estudiante
const createStudent = async (req, res) => {
    const { pruebaId, grupoId } = req.params;
    const { documento, nombre } = req.body;

    try {
        if (!documento || !nombre) {
            return res.status(400).json({ error: 'El campo "documento" y "nombre" son obligatorios' });
        }

        const prueba = await Prueba.findById(pruebaId);
        if (!prueba) {
            return res.status(404).json({ error: 'Prueba no encontrada' });
        }

        const grupo = prueba.grupos.id(grupoId);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo no encontrado' });
        }

        // Verificar si el estudiante ya existe
        const existingStudent = grupo.estudiantes.find(est => est.documento === documento);
        if (existingStudent) {
            return res.status(400).json({ error: 'El estudiante con este documento ya existe en el grupo' });
        }

        // Crear el nuevo estudiante
        const newStudent = {
            documento,
            nombre,
            notas: []  // Asumimos que el estudiante inicia sin notas
        };

        grupo.estudiantes.push(newStudent);

        await prueba.save();
        res.status(201).json({ mensaje: 'Estudiante creado exitosamente', estudiante: newStudent });
    } catch (error) {
        console.error('Error al crear el estudiante:', error);
        res.status(500).json({ error: error.message });
    }
};

// Crear o actualizar el nombre o la nota de un estudiante de forma manual
const createOrUpdateStudent = async (req, res) => {
    const { pruebaId, grupoId, estudianteId } = req.params;
    const { documento, nombre, notas } = req.body;

    try {
        const prueba = await Prueba.findById(pruebaId).populate('grupos.estudiantes.notas.ra');
        if (!prueba) return res.status(404).json({ mensaje: 'Prueba no encontrada' });

        const grupo = prueba.grupos.id(grupoId);
        if (!grupo) return res.status(404).json({ mensaje: 'Grupo no encontrado' });

        let estudiante = grupo.estudiantes.id(estudianteId);

        if (estudiante) {
            // Si el estudiante existe, actualiza sus datos
            estudiante.nombre = nombre || estudiante.nombre;
            estudiante.documento = documento || estudiante.documento;

            // Actualiza las notas
            if (notas && Array.isArray(notas)) {
                estudiante.notas = notas.map(nota => {
                    if (nota._id) {
                        // Actualiza nota existente
                        return { ...nota };
                    } else if (nota.ra && nota.nota != null) {
                        // Agrega nueva nota
                        return { ra: nota.ra, nota: nota.nota };
                    }
                }).filter(nota => nota); // Filtra las notas vacías o nulas
            }

            await prueba.save();
            return res.status(200).json({ mensaje: 'Estudiante actualizado', estudiante });
        } else {
            // Si el estudiante no existe, crea uno nuevo
            if (!documento || !nombre) {
                return res.status(400).json({ mensaje: 'Documento y nombre son obligatorios para crear un nuevo estudiante' });
            }
            estudiante = { documento, nombre, notas: notas || [] };
            grupo.estudiantes.push(estudiante);

            await prueba.save();
            return res.status(201).json({ mensaje: 'Estudiante creado', estudiante });
        }
    } catch (error) {
        console.error('Error al crear o actualizar estudiante:', error);
        return res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

module.exports = {
    createPrueba,
    importStudentsToGroup,
    getAllPruebas,
    getPrueba,
    deletePrueba,
    editPrueba,
    deleteStudentFromGroup,
    createOrUpdateStudent,
    getGrupoByPruebaIdAndGrupoId,
    createStudent
};

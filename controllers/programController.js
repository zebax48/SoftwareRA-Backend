const Program = require('../models/Program');

// Controlador para crear un nuevo programa académico
const createProgram = async (req, res) => {
    const { facultad, nombre, semestres, registroCalificado } = req.body;

    try {
        // Verificar si ya existe un programa con el mismo nombre
        const existingProgram = await Program.findOne({ nombre, registroCalificado });

        if (existingProgram) {
            return res.status(400).json({ message: 'Ya existe este programa' });
        }

        // Crear el nuevo programa académico
        const program = new Program({
            facultad,
            nombre,
            semestres,
            registroCalificado
        });

        // Guardar el programa en la base de datos
        await program.save();

        res.status(201).json({ message: 'Programa académico creado exitosamente', programId: program._id });

    } catch (error) {
        console.error('Error al crear programa académico:', error);
        res.status(500).json({ error: 'Error al crear programa académico' });
    }
};

// Controlador para obtener todos los programas académicos
const getAllPrograms = async (req, res) => {
    try {
        // Buscar todos los programas académicos en la base de datos
        const programs = await Program.find();
        res.json(programs);
    } catch (error) {
        console.error('Error al obtener todos los programas:', error);
        res.status(500).json({ error: 'Error al obtener todos los programas' });
    }
};

// Controlador para actualizar un programa
const updateProgram = async (req, res) => {
    const programId = req.params.programId;
    const { facultad, nombre, semestres, registroCalificado } = req.body;

    try {
        // Buscar el programa por su ID en la base de datos
        let program = await Program.findById(programId);

        // Verificar si el programa existe
        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        // Verificar si ya existe un programa con el mismo nombre
        const existingProgram = await Program.findOne({ facultad, nombre, semestres, registroCalificado });
    
        if (existingProgram) {
            return res.status(400).json({ message: 'Ya existe este programa' });
        }    

        // Actualizar los campos del programa
        program.facultad = facultad;
        program.nombre = nombre;
        program.semestres = semestres;
        program.registroCalificado = registroCalificado;

        // Guardar los cambios en la base de datos
        await program.save();

        res.json({ message: 'Programa actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar programa:', error);
        res.status(500).json({ error: 'Error al actualizar programa' });
    }
};

// Controlador para eliminar un programa
const deleteProgram = async (req, res) => {
    const programId = req.params.programId;

    try {
        // Buscar el programa por su ID en la base de datos
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        // Eliminar el programa de la base de datos
        await Program.findByIdAndDelete(programId);

        res.json({ message: 'Programa eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar programa:', error);
        res.status(500).json({ error: 'Error al eliminar programa' });
    }
};

// Controlador para obtener un programa por su ID
const getProgramById = async (req, res) => {
    const programId = req.params.programId;

    try {
        // Buscar el programa por su ID en la base de datos
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({ message: 'Programa no encontrado' });
        }

        // Devolver el programa encontrado
        res.json(program);
    } catch (error) {
        console.error('Error al obtener programa:', error);
        res.status(500).json({ error: 'Error al obtener programa' });
    }
};

module.exports = {
    createProgram,
    getAllPrograms,
    updateProgram,
    deleteProgram,
    getProgramById
};
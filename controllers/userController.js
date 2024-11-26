//userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

// Controlador para registrar un nuevo usuario
const registerUser = async (req, res) => {
    console.log(req.body); // Imprimir el cuerpo de la solicitud en la consola
    const { username, cc, password, nombres, apellidos, celular, correo, role } = req.body;

    try {
        // Verificar si el usuario ya existe
        let user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario con ID generado automáticamente
        user = new User({
            username,
            cc,
            password,
            nombres,
            apellidos,
            celular,
            correo,
            role
        });

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Guardar el usuario en la base de datos
        await user.save();

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener un usuario por su nombre de usuario
const getUser = async (req, res) => {
    const username = req.params.username;

    try {
        // Buscar el usuario por su nombre de usuario en la base de datos
        const user = await User.findOne({ username });

        // Verificar si se encontró el usuario
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Enviar el usuario como respuesta
        res.json(user);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

// Controlador para iniciar sesión
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Verificar si el usuario existe
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token único para el usuario
        const token = jwt.sign({ userId: user._id }, 'jwtSecret', { expiresIn: '1h' });

        // Almacenar el token en la base de datos (por ejemplo, en el campo token del usuario)
        user.token = token;
        await user.save();
        console.log('Token almacenado en la base de datos:', token);

        // Imprimir el objeto user después de guardarlo
        console.log('Usuario después de guardar:', user);
        
        // Establecer el token como una cookie de sesión
        res.cookie('token', token, { httpOnly: true });
        
        res.json({ 
            token,
            id: user._id,
            username: user.username,
            cc: user.cc,
            nombres: user.nombres,
            apellidos: user.apellidos,
            celular: user.celular,
            correo: user.correo,
            role: user.role});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error del servidor');
    }
};

const logoutUser = async (req, res) => {
    const username = req.params.username;

    try {
        // Buscar al usuario por su nombre de usuario en la base de datos
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Eliminar el token de sesión del usuario en la base de datos
        console.log('Valor de user.token:', user.token);
        const revokedToken = user.token;
        console.log('RT EN LOGOUT:', revokedToken);
        user.token = null;
        await user.save();

        // Agregar el token revocado a la lista de tokens revocados si existe
        if (revokedToken) {
            await RevokedToken.create({ token: revokedToken });
            console.log('Token agregado a la lista de tokens revocados');
        }

        // Eliminar la cookie de sesión
        res.clearCookie('token');

        res.json({ message: 'Sesión cerrada exitosamente' });
        // Mensaje cerrar sesión
        console.log('Sesión cerrada exitosamente');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
};

// Controlador para actualizar usuario
const updateUser = async (req, res) => {
    const username = req.params.username; 
    const { newUsername, newCc, newPassword, newNombres, newApellidos, newCelular, newCorreo, newRole } = req.body;

    try {
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.username = newUsername;
        user.cc = newCc,
        user.nombres = newNombres;
        user.apellidos = newApellidos;
        user.celular = newCelular;
        user.correo = newCorreo;
        user.role = newRole;

        // Verificar si newPassword está definida antes de intentar hashearla
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();

        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

// Controlador para obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener todos los usuarios' });
    }
};

//Generar contraseña aleatoria para usuarios que la olvidaron
const generateRandomPassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
        newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return newPassword;
};

//Utilizar contraseña aleatoria para usuario indicado
const updateUserPassword = async (username, newPassword) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return false; // Usuario no encontrado
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return true; // Contraseña actualizada exitosamente
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return false; // Error al actualizar la contraseña
    }
};

// Controlador para eliminar usuario
const deleteUser = async (req, res) => {
    const username = req.params.username; 

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await User.findOneAndDelete({ username });

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    deleteUser,
    getAllUsers,
    generateRandomPassword,
    updateUserPassword,
    getUser
};
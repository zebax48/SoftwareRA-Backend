//userRoutes.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { registerUser, loginUser, updateUser, deleteUser, getAllUsers, logoutUser, getUser } = require('../controllers/userController');
const { generateRandomPassword, updateUserPassword } = require('../controllers/userController.js');
const { sendNewPasswordEmail } = require('../emailService');
const authMiddleware = require('../middleware/authMiddleware.js');


// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para iniciar sesión
router.post('/login', loginUser);

// Ruta para solicitar un restablecimiento de contraseña
router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;

    try {
        // Buscar al usuario por su nombre de usuario en la base de datos
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Obtener el correo electrónico del usuario
        const email = user.correo;

        // Generar una nueva contraseña aleatoria
        const newPassword = generateRandomPassword();

        // Actualizar la contraseña del usuario en la base de datos
        const updateResult = await updateUserPassword(username, newPassword);

        if (updateResult) {
            // Enviar la nueva contraseña al correo electrónico del usuario
            const emailSent = await sendNewPasswordEmail(email, newPassword);

            if (emailSent) {
                return res.json({ message: 'Se ha enviado una nueva contraseña al correo electrónico asociado a tu cuenta.' });
            } else {
                return res.status(500).json({ message: 'Error al enviar el correo electrónico.' });
            }
        } else {
            return res.status(400).json({ message: 'No se pudo restablecer la contraseña. Por favor, verifica el nombre de usuario proporcionado.' });
        }
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        return res.status(500).json({ message: 'Error al restablecer la contraseña.' });
    }
});

router.use(authMiddleware);

// Ruta para actualizar información de usuario
router.put('/update/:username', updateUser);

// Ruta para eliminar un usuario
router.delete('/delete/:username', deleteUser);

// Ruta para cerrar sesión de un usuario específico
router.get('/logout/:username', logoutUser);

// Ruta para obtener todos los usuarios
router.get('/', getAllUsers);

//Ruta para obtener un usuario
router.get('/:username', getUser)

module.exports = router;
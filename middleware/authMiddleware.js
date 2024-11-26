//authMiddleware.js
const jwt = require('jsonwebtoken');
const RevokedToken = require('../models/RevokedToken');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada' });
    }

    try {
        const decoded = jwt.verify(token, 'jwtSecret');
 
        // Verificar si el token está en la lista de tokens revocados
        const revokedToken = await RevokedToken.findOne({ token });
        if (revokedToken) {
            return res.status(401).json({ message: 'Token revocado' });
        }

        // Verificar si el token ha expirado
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ message: 'La sesión a expirado' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token inválido:', error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;
//User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    cc: { type: String, required: true },
    password: { type: String, required: true },
    nombres: { type: String, required: false },
    apellidos: { type: String, required: false },
    celular: { type: String, required: false },
    correo: { type: String, required: false },
    role: { type: String, enum: ['admin', 'Coordinador', 'Evaluador', 'Profesor'], default: 'Evaluador' },
    token: { type: String, required: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
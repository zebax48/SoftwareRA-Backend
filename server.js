//server.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const programRoutes = require('./routes/programRoutes');
const resultadoAprendizajeRoutes = require('./routes/resultadoAprendizajeRoutes');
const pruebaRoutes = require('./routes/pruebaRoutes');
const connectDB = require('./config');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// Conectar a la base de datos
connectDB();

// Analizar en JSON y convertir a req.body
app.use(express.json());

// Usar las rutas de usuario
app.use('/api/users', userRoutes);

//Usar las rutas de programas
app.use('/api/programs', programRoutes);

// Usar las rutas de resultados de aprendizaje
app.use('/api/ra', resultadoAprendizajeRoutes);

// Usar las rutas de pruebas
app.use('/api/pruebas', pruebaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
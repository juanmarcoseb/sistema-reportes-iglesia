const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const Reporte = require('./reporte');


// Configuración de Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb+srv://juanmarcoseb:kNBQdmVPamlVjYgo@cluster0.86xyl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar a MongoDB:', err));

// Configuración de Rutas
app.get('/', (req, res) => {
    res.send('Bienvenido al sistema de reportes de la iglesia');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

//Manejar las solicitudes de creación de reportes
app.post('/reporte', async (req, res) => {
    const nuevoReporte = new Reporte(req.body);
    try {
        await nuevoReporte.save();
        res.status(201).send('Reporte guardado exitosamente');
    } catch (error) {
        res.status(400).send('Error al guardar el reporte: ' + error.message);
    }
});

//Obtener todos los reportes
app.get('/reportes', async (req, res) => {
    try {
        const reportes = await Reporte.find({});
        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).send('Error al obtener los reportes: ' + error.message);
    }
});

//Buscar reportes con filtros
app.get('/reportes/buscar', async (req, res) => {
    const { fecha, predicador, tema } = req.query; // Obtener parámetros de búsqueda desde la URL
    const filtro = {};

    // Agregar filtros condicionalmente
    if (fecha) {
        filtro.fecha = new Date(fecha);
    }
    if (predicador) {
        filtro.predicador = predicador;
    }
    if (tema) {
        filtro.tema = tema;
    }

    try {
        const reportesFiltrados = await Reporte.find(filtro);
        res.status(200).json(reportesFiltrados);
    } catch (error) {
        res.status(500).send('Error al buscar los reportes: ' + error.message);
    }
});



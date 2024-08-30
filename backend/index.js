const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const Reporte = require('./reporte');
const Joi = require('joi');
const schemaReporte = Joi.object({
    fecha: Joi.date().required(),
    horaInicio: Joi.string().required(),
    horaFin: Joi.string().required(),
    profecias: Joi.number().integer().min(0).required(),
    predicador: Joi.string().required(),
    tema: Joi.string().required(),
    asistencia: Joi.number().integer().min(0).required(),
    fluyo: Joi.boolean().required(),
    liberacion: Joi.boolean().required(),
    convertidos: Joi.boolean().required(),
    fueraDeLoNormal: Joi.string().required()
});


// Configuración de Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Manejo de errores de JSON no válido
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).send('Error: JSON no válido.');
    }
    next();
});

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

//Actualizar reporte existente
app.put('/reportes/:id', async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;

    try {
        const reporteActualizado = await Reporte.findByIdAndUpdate(id, datosActualizados, { new: true });
        if (!reporteActualizado) {
            return res.status(404).send('Reporte no encontrado');
        }
        res.status(200).json(reporteActualizado);
    } catch (error) {
        res.status(500).send('Error al actualizar el reporte: ' + error.message);
    }
});

//Eliminar reporte existente
app.delete('/reportes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const reporteEliminado = await Reporte.findByIdAndDelete(id);
        if (!reporteEliminado) {
            return res.status(404).send('Reporte no encontrado');
        }
        res.status(200).send('Reporte eliminado exitosamente');
    } catch (error) {
        res.status(500).send('Error al eliminar el reporte: ' + error.message);
    }
});

//Validar error al crear reporte
app.post('/reporte', async (req, res) => {
    const { error } = schemaReporte.validate(req.body);
    if (error) return res.status(400).send('Error de validación: ' + error.details[0].message);

    const nuevoReporte = new Reporte(req.body);
    try {
        await nuevoReporte.save();
        res.status(201).send('Reporte guardado exitosamente');
    } catch (error) {
        res.status(500).send('Error al guardar el reporte: ' + error.message);
    }
});

//Validar error al actualizar reporte
app.put('/reportes/:id', async (req, res) => {
    const { error } = schemaReporte.validate(req.body);
    if (error) return res.status(400).send('Error de validación: ' + error.details[0].message);

    const { id } = req.params;
    const datosActualizados = req.body;

    try {
        const reporteActualizado = await Reporte.findByIdAndUpdate(id, datosActualizados, { new: true });
        if (!reporteActualizado) {
            return res.status(404).send('Reporte no encontrado');
        }
        res.status(200).json(reporteActualizado);
    } catch (error) {
        res.status(500).send('Error al actualizar el reporte: ' + error.message);
    }
});

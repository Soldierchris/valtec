const express = require('express');
const cors = require('cors');
const formularioRoutes = require('./src/infrastructure/routes/formularioRoutes');
const tabletRoutes = require('./src/infrastructure/routes/tabletRoutes');
const colaboradorRoutes = require('./src/infrastructure/routes/colaboradorRoutes');
const productoRoutes = require('./src/infrastructure/routes/productoRoutes');
const movimientoRoutes = require('./src/infrastructure/routes/movimientoRoutes');

// En tu app.js añade esto con las otras rutas:
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir tu HTML


// Rutas de la API
app.use('/api/formularios', formularioRoutes);
//app.use('/api/tablets', require('./src/infrastructure/routes/tabletRoutes'));
app.use('/api/tablets', tabletRoutes)
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/movimientos', movimientoRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
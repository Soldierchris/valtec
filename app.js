const express = require('express');
const cors = require('cors');

// ── Rutas ─────────────────────────────────────────────────────
const formularioRoutes        = require('./src/infrastructure/routes/formularioRoutes');
const tabletRoutes            = require('./src/infrastructure/routes/tabletRoutes');
const colaboradorRoutes       = require('./src/infrastructure/routes/colaboradorRoutes');
const productoRoutes          = require('./src/infrastructure/routes/productoRoutes');
const movimientoRoutes        = require('./src/infrastructure/routes/movimientoRoutes');
const notificacionRoutes      = require('./src/infrastructure/routes/notificacionRoutes');
const uniformePendienteRoutes = require('./src/infrastructure/routes/uniformePendienteRoutes'); // ← NUEVO

// ── App ───────────────────────────────────────────────────────
const app = express();

app.get('/', (req, res) => res.redirect('/login.html'));

app.post('/api/auth/login', (req, res) => {
    const { usuario, password } = req.body;
    const USERS = {
        admin:  { password: process.env.ADMIN_PASS,  rol: 'admin'  },
        valtec: { password: process.env.VIEWER_PASS, rol: 'viewer' }
    };
    const user = USERS[usuario];
    if (user && user.password === password) {
        res.json({ ok: true, rol: user.rol });
    } else {
        res.status(401).json({ ok: false });
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── Registro de rutas ─────────────────────────────────────────
app.use('/api/formularios',           formularioRoutes);
app.use('/api/tablets',               tabletRoutes);
app.use('/api/colaboradores',         colaboradorRoutes);
app.use('/api/productos',             productoRoutes);
app.use('/api/movimientos',           movimientoRoutes);
app.use('/api/notificaciones',        notificacionRoutes);
app.use('/api/uniformes-pendientes',  uniformePendienteRoutes); // ← NUEVO

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const rutasRoutes = require('./routes/rutas.routes');
const busesRoutes = require('./routes/buses.routes');
const viajesRoutes = require('./routes/viajes.routes');
const authRoutes = require('./routes/auth.routes');
const clientesRoutes = require('./routes/clientes.routes');
const pasajesRoutes = require('./routes/pasajes.routes');

app.use(cors());
app.use(express.json());

app.use('/api/rutas', rutasRoutes);
app.use('/api/buses', busesRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pasajes', pasajesRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
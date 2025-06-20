const express = require('express');
const router = express.Router();
const db = require('../database');

// POST vender pasaje
router.post('/', async (req, res) => {
  const { viajeCodigo, clienteCodigo, asiento, importePagar, usuarioVendedorCodigo } = req.body;

  try {
    const pasajeId = await db.venderPasaje(viajeCodigo, clienteCodigo, asiento, importePagar, usuarioVendedorCodigo);
    res.status(201).json({ mensaje: 'Pasaje vendido', pasajeId });
  } catch (err) {
    console.error('Error al vender pasaje:', err);
    res.status(500).json({ error: err.message || 'Error interno' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  try {
    const buses = await db.obtenerBuses();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener buses' });
  }
});

router.post('/', async (req, res) => {
  const { placa, fabricante, numAsientos } = req.body;
  try {
    const id = await db.registrarBus(placa, fabricante, numAsientos);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar bus' });
  }
});

module.exports = router;
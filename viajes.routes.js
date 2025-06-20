const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
  const { fecha } = req.query;
  try {
    const viajes = await db.obtenerViajes(fecha);
    res.json(viajes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
});

router.post('/', async (req, res) => {
  const { rutaCodigo, busCodigo, choferCodigo, fechaHoraSalida, fechaHoraLlegada } = req.body;
  try {
    const id = await db.programarViaje(rutaCodigo, busCodigo, choferCodigo, fechaHoraSalida, fechaHoraLlegada);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Error al programar viaje' });
  }
});

module.exports = router;
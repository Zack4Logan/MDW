const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const [result] = await db.pool.execute(
      'SELECT u.codigo, u.clave, u.estado, u.tipo_usuario_codigo, e.codigo AS empleado_codigo FROM USUARIOS u INNER JOIN EMPLEADO e ON u.empleado_codigo = e.codigo WHERE u.usuario = ?',
      [usuario]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result[0];

    if (user.estado !== 'activo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    const claveValida = await bcrypt.compare(clave, user.clave);
    if (!claveValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Puedes emitir token si lo deseas
    const token = jwt.sign({
      codigo: user.codigo,
      tipo_usuario: user.tipo_usuario_codigo
    }, 'secreto_super_seguro', { expiresIn: '1h' });

    res.json({ mensaje: 'Login exitoso', token, usuarioId: user.codigo });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
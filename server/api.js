// API REST para NORTEEXPRESO - Integración completa con MySQL
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'norteexpreso_secret_key';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Bdvargas2005',
  database: process.env.DB_NAME || 'transporte_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Pool de conexiones
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 Usuario: ${dbConfig.user}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    console.error('💡 Verifica que MySQL esté ejecutándose y las credenciales sean correctas');
    return false;
  }
}

// Middleware para verificar JWT
const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

// Login SOLO CLIENTE
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usuario, password, type } = req.body;
    if (type === 'admin') {
      // Login de administrador
      const [admins] = await pool.execute(
        `SELECT p.codigo, p.nombre, p.apellidos, p.dni, e.telefono, e.email, e.direccion, u.clave, u.usuario, u.estado, e.cargo_codigo
         FROM PERSONA p
         INNER JOIN EMPLEADO e ON p.codigo = e.codigo
         INNER JOIN USUARIOS u ON e.codigo = u.empleado_codigo
         WHERE u.usuario = ? AND u.estado = 'activo' AND e.cargo_codigo IN (1,2,4)`,
        [usuario]
      );
      if (admins.length === 0) {
        return res.status(401).json({ error: 'Administrador no encontrado' });
      }
      const admin = admins[0];
      const passwordValida = await bcrypt.compare(password, admin.clave);
      if (!passwordValida) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      // Generar JWT
      const token = jwt.sign(
        {
          codigo: admin.codigo,
          email: admin.email,
          type: 'admin',
          cargo_codigo: admin.cargo_codigo
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({
        token,
        usuario: {
          codigo: admin.codigo,
          nombre: admin.nombre,
          apellidos: admin.apellidos,
          email: admin.email,
          dni: admin.dni,
          telefono: admin.telefono,
          direccion: admin.direccion,
          usuario: admin.usuario,
          cargo_codigo: admin.cargo_codigo
        }
      });
    } else {
      // Login SOLO CLIENTE
      const [clientes] = await pool.execute(
        `SELECT p.codigo, p.nombre, p.apellidos, p.dni, e.telefono, e.email, u.clave
         FROM PERSONA p
         INNER JOIN CLIENTE c ON p.codigo = c.codigo
         INNER JOIN EMPLEADO e ON p.codigo = e.codigo
         INNER JOIN USUARIOS u ON e.codigo = u.empleado_codigo
         WHERE u.usuario = ? AND u.estado = 'activo'`, [usuario]
      );
      if (clientes.length === 0) {
        return res.status(401).json({ error: 'Cliente no encontrado' });
      }
      const cliente = clientes[0];
      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, cliente.clave);
      if (!passwordValida) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      // Generar JWT
      const token = jwt.sign(
        {
          codigo: cliente.codigo,
          email: cliente.email,
          type: 'customer'
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({
        token,
        cliente: {
          codigo: cliente.codigo,
          nombre: cliente.nombre,
          apellidos: cliente.apellidos,
          email: cliente.email,
          dni: cliente.dni,
          telefono: cliente.telefono
        }
      });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro de cliente
app.post('/api/auth/register-cliente', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nombre, apellidos, dni, telefono, email, password } = req.body;
    console.log(`👤 Registrando cliente: ${nombre} ${apellidos}`);
    
    // Validar datos requeridos
    if (!nombre || !apellidos || !dni || !telefono || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }
    
    await connection.beginTransaction();
    
    // Verificar si ya existe una persona con ese DNI
    const [personaExistente] = await connection.execute(`
      SELECT codigo FROM PERSONA WHERE dni = ?
    `, [dni]);
    
    if (personaExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ya existe una persona con ese DNI' });
    }
    
    // Verificar si ya existe un cliente con ese email
    const [clienteExistente] = await connection.execute(`
      SELECT c.codigo FROM CLIENTE c
      INNER JOIN EMPLEADO e ON c.codigo = e.codigo
      WHERE e.email = ?
    `, [email]);
    
    if (clienteExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ya existe un cliente con ese email' });
    }
    
    // Insertar persona
    const [personaResult] = await connection.execute(`
      INSERT INTO PERSONA (nombre, apellidos, dni) 
      VALUES (?, ?, ?)
    `, [nombre, apellidos, dni]);
    
    const personaCodigo = personaResult.insertId;
    
    // Insertar empleado (para cliente)
    const [empleadoResult] = await connection.execute(`
      INSERT INTO EMPLEADO (codigo, direccion, telefono, email, contrato_codigo, cargo_codigo) 
      VALUES (?, 'Por definir', ?, ?, 2, 2)
    `, [personaCodigo, telefono, email]);
    
    // Insertar cliente
    await connection.execute(`
      INSERT INTO CLIENTE (codigo, razon_social, ruc) 
      VALUES (?, NULL, NULL)
    `, [personaCodigo]);
    
    // Crear usuario para el cliente
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(`
      INSERT INTO USUARIOS (usuario, clave, estado, empleado_codigo, tipo_usuario_codigo) 
      VALUES (?, ?, 'activo', ?, 2)
    `, [email, hashedPassword, personaCodigo]);
    
    await connection.commit();
    
    console.log(`✅ Cliente registrado exitosamente: ${nombre} ${apellidos}`);
    
    res.json({
      success: true,
      message: 'Cliente registrado exitosamente',
      cliente: {
        codigo: personaCodigo,
        nombre,
        apellidos,
        dni,
        telefono,
        email
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error registrando cliente:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al registrar cliente' 
    });
  } finally {
    connection.release();
  }
});

// Registro de administrador
app.post('/api/auth/register-admin', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { nombre, apellidos, dni, telefono, email, direccion, usuario, password, cargo_codigo } = req.body;
    console.log(`👨‍💼 Registrando administrador: ${nombre} ${apellidos}`);
    
    // Validar datos requeridos
    if (!nombre || !apellidos || !dni || !telefono || !email || !direccion || !usuario || !password || !cargo_codigo) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }
    
    await connection.beginTransaction();
    
    // Verificar si ya existe una persona con ese DNI
    const [personaExistente] = await connection.execute(`
      SELECT codigo FROM PERSONA WHERE dni = ?
    `, [dni]);
    
    if (personaExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ya existe una persona con ese DNI' });
    }
    
    // Verificar si ya existe un usuario con ese nombre de usuario
    const [usuarioExistente] = await connection.execute(`
      SELECT codigo FROM USUARIOS WHERE usuario = ?
    `, [usuario]);
    
    if (usuarioExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre de usuario' });
    }
    
    // Verificar si ya existe un empleado con ese email
    const [empleadoExistente] = await connection.execute(`
      SELECT codigo FROM EMPLEADO WHERE email = ?
    `, [email]);
    
    if (empleadoExistente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ya existe un empleado con ese email' });
    }
    
    // Insertar persona
    const [personaResult] = await connection.execute(`
      INSERT INTO PERSONA (nombre, apellidos, dni) 
      VALUES (?, ?, ?)
    `, [nombre, apellidos, dni]);
    
    const personaCodigo = personaResult.insertId;
    
    // Crear contrato
    const [contratoResult] = await connection.execute(`
      INSERT INTO CONTRATO (fecha_inicio, sueldo, turno_codigo) 
      VALUES (NOW(), 3500.00, 1)
    `);
    
    const contratoCodigo = contratoResult.insertId;
    
    // Insertar empleado
    await connection.execute(`
      INSERT INTO EMPLEADO (codigo, direccion, telefono, email, contrato_codigo, cargo_codigo) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [personaCodigo, direccion, telefono, email, contratoCodigo, cargo_codigo]);
    
    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.execute(`
      INSERT INTO USUARIOS (usuario, clave, estado, empleado_codigo, tipo_usuario_codigo) 
      VALUES (?, ?, 'activo', ?, ?)
    `, [usuario, hashedPassword, personaCodigo, cargo_codigo]);
    
    await connection.commit();
    
    console.log(`✅ Administrador registrado exitosamente: ${nombre} ${apellidos}`);
    
    res.json({
      success: true,
      message: 'Administrador registrado exitosamente',
      admin: {
        codigo: personaCodigo,
        nombre,
        apellidos,
        dni,
        telefono,
        email,
        direccion,
        usuario,
        cargo_codigo
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error registrando administrador:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al registrar administrador' 
    });
  } finally {
    connection.release();
  }
});

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

// Endpoint de prueba para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor NORTEEXPRESO funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Obtener rutas disponibles
app.get('/api/rutas', async (req, res) => {
  try {
    console.log('📍 Obteniendo rutas disponibles...');
    const [rutas] = await pool.execute(`
      SELECT codigo, origen, destino, costo_referencial 
      FROM RUTAS 
      ORDER BY origen, destino
    `);
    console.log(`✅ ${rutas.length} rutas encontradas`);
    res.json(rutas);
  } catch (error) {
    console.error('❌ Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

// Buscar viajes - ACTUALIZADO PARA USAR BD REAL
app.get('/api/viajes/buscar', async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;
    console.log(`🔍 Buscando viajes: ${origen} → ${destino} el ${fecha}`);
    
    let query = `
      SELECT 
        v.codigo,
        v.fecha_hora_salida,
        v.fecha_hora_llegada_estimada,
        v.estado,
        r.origen,
        r.destino,
        r.costo_referencial,
        b.placa,
        b.fabricante,
        b.num_asientos,
        CONCAT(p.nombre, ' ', p.apellidos) as chofer_nombre,
        (b.num_asientos - COALESCE(asientos_ocupados.ocupados, 0)) as asientos_disponibles
      FROM VIAJE v
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      INNER JOIN BUSES b ON v.bus_codigo = b.codigo
      INNER JOIN CHOFER ch ON v.chofer_codigo = ch.codigo
      INNER JOIN EMPLEADO e ON ch.codigo = e.codigo
      INNER JOIN PERSONA p ON e.codigo = p.codigo
      LEFT JOIN (
        SELECT viaje_codigo, COUNT(*) as ocupados
        FROM PASAJE 
        WHERE estado = 'Vendido'
        GROUP BY viaje_codigo
      ) asientos_ocupados ON v.codigo = asientos_ocupados.viaje_codigo
      WHERE v.estado = 'Programado'
    `;
    const params = [];
    if (origen) {
      query += ' AND r.origen = ?';
      params.push(origen);
    }
    if (destino) {
      query += ' AND r.destino = ?';
      params.push(destino);
    }
    if (fecha) {
      query += ' AND DATE(v.fecha_hora_salida) = ?';
      params.push(fecha);
    }
    query += ' ORDER BY v.fecha_hora_salida';

    const [viajes] = await pool.execute(query, params);
    console.log(`✅ ${viajes.length} viajes encontrados`);
    res.json(viajes);
  } catch (error) {
    console.error('❌ Error al buscar viajes:', error);
    res.status(500).json({ error: 'Error al buscar viajes' });
  }
});

// Obtener asientos ocupados de un viaje
app.get('/api/viajes/:viajeId/asientos', async (req, res) => {
  try {
    const { viajeId } = req.params;
    console.log(`🪑 Obteniendo asientos ocupados para viaje ${viajeId}`);
    
    const [asientosOcupados] = await pool.execute(`
      SELECT p.asiento, per.sexo
      FROM PASAJE p
      INNER JOIN CLIENTE c ON p.cliente_codigo = c.codigo
      INNER JOIN PERSONA per ON c.codigo = per.codigo
      WHERE p.viaje_codigo = ? AND p.estado IN ('Vendido', 'Reservado')
    `, [viajeId]);
    
    const asientos = asientosOcupados.map(a => ({ asiento: a.asiento, genero: a.sexo }));
    console.log(`✅ ${asientos.length} asientos ocupados: [${asientos.map(a => a.asiento).join(', ')}]`);
    res.json(asientos);
  } catch (error) {
    console.error('❌ Error al obtener asientos:', error);
    res.status(500).json({ error: 'Error al obtener asientos' });
  }
});

// ==========================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ==========================================

// Procesar compra completa de pasajes
app.post('/api/pasajes/compra-completa', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    console.log('🛒 Procesando compra completa de pasajes...');
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    const { viaje_codigo, cliente, asientos, metodo_pago, datosAdicionales } = req.body;
    // Parche: si viaje_codigo es string tipo 'V001-2024', extraer solo el número
    let viajeCodigoNumerico = typeof viaje_codigo === 'string'
      ? Number(String(viaje_codigo).replace(/\D/g, ''))
      : viaje_codigo;
    
    // Validar datos requeridos
    if (!viajeCodigoNumerico || !cliente || !asientos) {
      return res.status(400).json({ 
        error: 'Datos incompletos: se requiere viaje_codigo, cliente y asientos' 
      });
    }
    
    await connection.beginTransaction();
    
    // 1. Registrar o obtener cliente
    let clienteCodigo;
    const [clienteExistente] = await connection.execute(`
      SELECT codigo FROM PERSONA WHERE dni = ?
    `, [cliente.dni]);
    
    if (clienteExistente.length > 0) {
      clienteCodigo = clienteExistente[0].codigo;
      console.log(`Cliente existente encontrado: ${clienteCodigo}`);
    } else {
      // Insertar nueva persona
      const [personaResult] = await connection.execute(`
        INSERT INTO PERSONA (nombre, apellidos, dni) 
        VALUES (?, ?, ?)
      `, [cliente.nombre, cliente.apellidos, cliente.dni]);
      
      clienteCodigo = personaResult.insertId;
      
      // Insertar como cliente
      await connection.execute(`
        INSERT INTO CLIENTE (codigo, razon_social, ruc) 
        VALUES (?, NULL, NULL)
      `, [clienteCodigo]);
      
      console.log(`Nuevo cliente creado: ${clienteCodigo}`);
    }
    
    // 2. Obtener información del viaje para calcular precio
    const [viajeInfo] = await connection.execute(`
      SELECT r.costo_referencial 
      FROM VIAJE v
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      WHERE v.codigo = ?
    `, [viajeCodigoNumerico]);
    
    if (viajeInfo.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }
    
    const costoUnitario = viajeInfo[0].costo_referencial;
    const pasajesCreados = [];
    
    // 3. Crear pasajes para cada asiento
    for (const asiento of asientos) {
      console.log(`📝 Creando pasaje para asiento ${asiento}...`);
      
      // Cambiar la validación de asiento ocupado:
      const [asientoOcupado] = await connection.execute(
        `SELECT codigo FROM PASAJE WHERE viaje_codigo = ? AND asiento = ?`,
        [viajeCodigoNumerico, asiento]
      );
      if (asientoOcupado.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: `El asiento ${asiento} ya está ocupado` });
      }
      
      // Calcular precio (incluir costo de mascota si aplica)
      let importeTotal = costoUnitario;
      if (datosAdicionales?.viaja_con_mascota) {
        importeTotal += 15.00; // Costo adicional por mascota
      }
      
      // Insertar pasaje
      const [result] = await connection.execute(`
        INSERT INTO PASAJE (
          viaje_codigo, 
          cliente_codigo, 
          asiento, 
          importe_pagar, 
          usuario_vendedor_codigo, 
          estado
        ) VALUES (?, ?, ?, ?, 1, 'Vendido')
      `, [viajeCodigoNumerico, clienteCodigo, asiento, importeTotal]);
      
      pasajesCreados.push(result.insertId);
      console.log(`✅ Pasaje creado: ID ${result.insertId} para asiento ${asiento}`);
    }
    
    await connection.commit();
    
    const totalImporte = pasajesCreados.length * costoUnitario + 
                        (datosAdicionales?.viaja_con_mascota ? 15.00 : 0);
    
    console.log(`🎉 Compra procesada exitosamente:`);
    console.log(`   - Cliente: ${cliente.nombre} ${cliente.apellidos}`);
    console.log(`   - Pasajes creados: ${pasajesCreados.length}`);
    console.log(`   - Total: S/ ${totalImporte.toFixed(2)}`);
    
    res.json({
      success: true,
      message: 'Compra procesada exitosamente',
      data: {
        clienteCodigo,
        pasajes: pasajesCreados,
        totalImporte
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error procesando compra:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al procesar la compra' 
    });
  } finally {
    connection.release();
  }
});

// Endpoint para obtener pasajes de un cliente
app.get('/api/pasajes/cliente/:clienteId', async (req, res) => {
  try {
    const { clienteId } = req.params;
    const [pasajes] = await pool.execute(
      `SELECT p.codigo, p.fecha_emision, p.asiento, p.importe_pagar, p.estado, p.viaje_codigo,
       v.fecha_hora_salida, v.fecha_hora_llegada_estimada, v.ruta_codigo, r.origen, r.destino,
       b.placa
       FROM PASAJE p
       INNER JOIN VIAJE v ON p.viaje_codigo = v.codigo
       INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
       INNER JOIN BUSES b ON v.bus_codigo = b.codigo
       WHERE p.cliente_codigo = ?`, [clienteId]
    );
    res.json(pasajes);
  } catch (error) {
    console.error('❌ Error al obtener pasajes del cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas del dashboard - ACTUALIZADO CON DATOS REALES
app.get('/api/dashboard/estadisticas', verificarToken, async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas del dashboard...');
    const hoy = new Date().toISOString().split('T')[0];
    
    // Ventas del día
    const [ventasHoy] = await pool.execute(`
      SELECT 
        COUNT(*) as total_pasajes,
        COALESCE(SUM(importe_pagar), 0) as total_ingresos
      FROM PASAJE 
      WHERE DATE(fecha_emision) = ? AND estado = 'Vendido'
    `, [hoy]);
    
    // Buses operativos
    const [busesOperativos] = await pool.execute(`
      SELECT COUNT(*) as total FROM BUSES WHERE estado = 'Operativo'
    `);
    
    // Viajes programados hoy
    const [viajesHoy] = await pool.execute(`
      SELECT COUNT(*) as total FROM VIAJE 
      WHERE DATE(fecha_hora_salida) = ? AND estado = 'Programado'
    `, [hoy]);
    
    // Rutas más populares
    const [rutasPopulares] = await pool.execute(`
      SELECT 
        r.origen,
        r.destino,
        COUNT(pa.codigo) as total_pasajes,
        SUM(pa.importe_pagar) as total_ingresos
      FROM RUTAS r
      INNER JOIN VIAJE v ON r.codigo = v.ruta_codigo
      INNER JOIN PASAJE pa ON v.codigo = pa.viaje_codigo
      WHERE pa.estado = 'Vendido'
      GROUP BY r.codigo, r.origen, r.destino
      ORDER BY total_pasajes DESC
      LIMIT 5
    `);
    
    // Ventas del mes
    const [ventasMes] = await pool.execute(`
      SELECT 
        COUNT(*) as total_pasajes,
        COALESCE(SUM(importe_pagar), 0) as total_ingresos
      FROM PASAJE 
      WHERE MONTH(fecha_emision) = MONTH(CURRENT_DATE()) 
        AND YEAR(fecha_emision) = YEAR(CURRENT_DATE())
        AND estado = 'Vendido'
    `);
    
    const estadisticas = {
      ventas_hoy: {
        pasajeros: ventasHoy[0].total_pasajes,
        ingresos: ventasHoy[0].total_ingresos
      },
      ventas_mes: {
        pasajeros: ventasMes[0].total_pasajes,
        ingresos: ventasMes[0].total_ingresos
      },
      buses_operativos: busesOperativos[0].total,
      viajes_programados: viajesHoy[0].total,
      rutas_populares: rutasPopulares
    };
    
    console.log('✅ Estadísticas obtenidas:', estadisticas);
    res.json(estadisticas);
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener todos los viajes (admin) - ACTUALIZADO CON DATOS REALES
app.get('/api/admin/viajes', verificarToken, async (req, res) => {
  try {
    const { fecha, estado } = req.query;
    console.log(`📅 Obteniendo viajes admin - Fecha: ${fecha}, Estado: ${estado}`);
    
    let query = `
      SELECT 
        v.codigo,
        v.fecha_hora_salida,
        v.fecha_hora_llegada_estimada,
        v.estado,
        r.origen,
        r.destino,
        r.costo_referencial,
        b.placa,
        b.fabricante,
        b.num_asientos,
        CONCAT(p.nombre, ' ', p.apellidos) as chofer_nombre,
        (b.num_asientos - COALESCE(asientos_ocupados.ocupados, 0)) as asientos_disponibles
      FROM VIAJE v
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      INNER JOIN BUSES b ON v.bus_codigo = b.codigo
      INNER JOIN CHOFER ch ON v.chofer_codigo = ch.codigo
      INNER JOIN EMPLEADO e ON ch.codigo = e.codigo
      INNER JOIN PERSONA p ON e.codigo = p.codigo
      LEFT JOIN (
        SELECT viaje_codigo, COUNT(*) as ocupados
        FROM PASAJE 
        WHERE estado = 'Vendido'
        GROUP BY viaje_codigo
      ) asientos_ocupados ON v.codigo = asientos_ocupados.viaje_codigo
    `;
    
    const params = [];
    const conditions = [];
    
    if (fecha) {
      conditions.push('DATE(v.fecha_hora_salida) = ?');
      params.push(fecha);
    }
    
    if (estado) {
      conditions.push('v.estado = ?');
      params.push(estado);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY v.fecha_hora_salida';
    
    const [viajes] = await pool.execute(query, params);
    res.json(viajes);
  } catch (error) {
    console.error('❌ Error al obtener viajes:', error);
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
});

// Crear nuevo viaje (admin) - NUEVO ENDPOINT
app.post('/api/admin/viajes', verificarToken, async (req, res) => {
  try {
    const { ruta_codigo, bus_codigo, chofer_codigo, fecha_hora_salida, fecha_hora_llegada_estimada } = req.body;
    console.log('🚌 Creando nuevo viaje:', req.body);
    
    // Validar datos requeridos
    if (!ruta_codigo || !bus_codigo || !chofer_codigo || !fecha_hora_salida || !fecha_hora_llegada_estimada) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Verificar que el bus esté disponible en esa fecha/hora
    const [busOcupado] = await pool.execute(`
      SELECT codigo FROM VIAJE 
      WHERE bus_codigo = ? 
        AND estado = 'Programado'
        AND (
          (fecha_hora_salida <= ? AND fecha_hora_llegada_estimada >= ?) OR
          (fecha_hora_salida <= ? AND fecha_hora_llegada_estimada >= ?)
        )
    `, [bus_codigo, fecha_hora_salida, fecha_hora_salida, fecha_hora_llegada_estimada, fecha_hora_llegada_estimada]);
    
    if (busOcupado.length > 0) {
      return res.status(400).json({ error: 'El bus ya tiene un viaje programado en ese horario' });
    }
    
    // Verificar que el chofer esté disponible
    const [choferOcupado] = await pool.execute(`
      SELECT codigo FROM VIAJE 
      WHERE chofer_codigo = ? 
        AND estado = 'Programado'
        AND (
          (fecha_hora_salida <= ? AND fecha_hora_llegada_estimada >= ?) OR
          (fecha_hora_salida <= ? AND fecha_hora_llegada_estimada >= ?)
        )
    `, [chofer_codigo, fecha_hora_salida, fecha_hora_salida, fecha_hora_llegada_estimada, fecha_hora_llegada_estimada]);
    
    if (choferOcupado.length > 0) {
      return res.status(400).json({ error: 'El chofer ya tiene un viaje programado en ese horario' });
    }
    
    // Crear el viaje
    const [result] = await pool.execute(`
      INSERT INTO VIAJE (ruta_codigo, bus_codigo, chofer_codigo, fecha_hora_salida, fecha_hora_llegada_estimada, estado)
      VALUES (?, ?, ?, ?, ?, 'Programado')
    `, [ruta_codigo, bus_codigo, chofer_codigo, fecha_hora_salida, fecha_hora_llegada_estimada]);
    
    console.log(`✅ Viaje creado exitosamente: ID ${result.insertId}`);
    
    res.json({
      success: true,
      message: 'Viaje creado exitosamente',
      viaje_codigo: result.insertId
    });
    
  } catch (error) {
    console.error('❌ Error creando viaje:', error);
    res.status(500).json({ error: 'Error al crear viaje' });
  }
});

// Obtener buses disponibles
app.get('/api/admin/buses', verificarToken, async (req, res) => {
  try {
    console.log('🚌 Obteniendo lista de buses...');
    const [buses] = await pool.execute(`
      SELECT codigo, placa, fabricante, num_asientos, estado 
      FROM BUSES 
      ORDER BY placa
    `);
    console.log(`✅ ${buses.length} buses encontrados`);
    res.json(buses);
  } catch (error) {
    console.error('❌ Error al obtener buses:', error);
    res.status(500).json({ error: 'Error al obtener buses' });
  }
});

// Obtener choferes disponibles
app.get('/api/admin/choferes', verificarToken, async (req, res) => {
  try {
    console.log('👨‍✈️ Obteniendo lista de choferes...');
    const [choferes] = await pool.execute(`
      SELECT 
        ch.codigo,
        CONCAT(p.nombre, ' ', p.apellidos) as nombre_completo,
        ch.licencia,
        e.telefono
      FROM CHOFER ch
      INNER JOIN EMPLEADO e ON ch.codigo = e.codigo
      INNER JOIN PERSONA p ON e.codigo = p.codigo
      ORDER BY p.apellidos, p.nombre
    `);
    console.log(`✅ ${choferes.length} choferes encontrados`);
    res.json(choferes);
  } catch (error) {
    console.error('❌ Error al obtener choferes:', error);
    res.status(500).json({ error: 'Error al obtener choferes' });
  }
});

// Obtener pasajes vendidos - NUEVO ENDPOINT
app.get('/api/admin/pasajes', verificarToken, async (req, res) => {
  try {
    const { fecha, estado } = req.query;
    console.log(`🎫 Obteniendo pasajes - Fecha: ${fecha}, Estado: ${estado}`);
    
    let query = `
      SELECT 
        pa.codigo,
        pa.fecha_emision,
        pa.asiento,
        pa.importe_pagar,
        pa.estado,
        CONCAT(p.nombre, ' ', p.apellidos) as cliente_nombre,
        p.dni as cliente_dni,
        r.origen,
        r.destino,
        v.fecha_hora_salida,
        b.placa
      FROM PASAJE pa
      INNER JOIN CLIENTE c ON pa.cliente_codigo = c.codigo
      INNER JOIN PERSONA p ON c.codigo = p.codigo
      INNER JOIN VIAJE v ON pa.viaje_codigo = v.codigo
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      INNER JOIN BUSES b ON v.bus_codigo = b.codigo
    `;
    
    const params = [];
    const conditions = [];
    
    if (fecha) {
      conditions.push('DATE(pa.fecha_emision) = ?');
      params.push(fecha);
    }
    
    if (estado) {
      conditions.push('pa.estado = ?');
      params.push(estado);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY pa.fecha_emision DESC';
    
    const [pasajes] = await pool.execute(query, params);
    console.log(`✅ ${pasajes.length} pasajes encontrados`);
    res.json(pasajes);
  } catch (error) {
    console.error('❌ Error al obtener pasajes:', error);
    res.status(500).json({ error: 'Error al obtener pasajes' });
  }
});

// ==========================================
// ENDPOINT DE VERIFICACIÓN DE TOKEN
// ==========================================

// Verificar token de administrador
app.get('/api/auth/verify', verificarToken, async (req, res) => {
  try {
    console.log('🔐 Verificando token de administrador...');
    
    // El middleware verificarToken ya validó el token
    // Solo necesitamos verificar que sea un admin
    if (req.usuario.type !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado - Solo administradores' });
    }
    
    console.log(`✅ Token válido para administrador: ${req.usuario.usuario}`);
    res.json({ 
      valid: true, 
      usuario: req.usuario 
    });
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// ENDPOINTS PARA RUTAS Y VIAJES
// ==========================================

// Obtener todas las rutas
app.get('/api/rutas', async (req, res) => {
  try {
    console.log('🗺️ Obteniendo rutas...');
    const [rutas] = await pool.execute(`
      SELECT 
        codigo as id,
        CONCAT('R', LPAD(codigo, 3, '0')) as codigo,
        origen,
        destino,
        distancia,
        duracion_estimada as duracion,
        precio_base,
        estado,
        descripcion,
        (SELECT COUNT(*) FROM VIAJE v WHERE v.ruta_codigo = r.codigo AND v.estado = 'Programado') as viajes_disponibles,
        (SELECT COUNT(*) FROM PASAJE p 
         INNER JOIN VIAJE v ON p.viaje_codigo = v.codigo 
         WHERE v.ruta_codigo = r.codigo) as pasajes_vendidos
      FROM RUTAS r
      ORDER BY origen, destino
    `);
    console.log(`✅ ${rutas.length} rutas encontradas`);
    res.json(rutas);
  } catch (error) {
    console.error('❌ Error al obtener rutas:', error);
    res.status(500).json({ error: 'Error al obtener rutas' });
  }
});

// Agregar nueva ruta
app.post('/api/rutas', verificarToken, async (req, res) => {
  try {
    const { origen, destino, distancia, duracion, precio_base, descripcion } = req.body;
    console.log(`🗺️ Creando nueva ruta: ${origen} → ${destino}`);
    
    if (!origen || !destino || !distancia || !duracion || !precio_base) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO RUTAS (origen, destino, distancia, duracion_estimada, precio_base, estado, descripcion)
      VALUES (?, ?, ?, ?, ?, 'activa', ?)
    `, [origen, destino, distancia, duracion, precio_base, descripcion || null]);
    
    console.log(`✅ Ruta creada exitosamente: ID ${result.insertId}`);
    
    res.json({
      success: true,
      message: 'Ruta creada exitosamente',
      ruta: {
        id: result.insertId,
        codigo: `R${String(result.insertId).padStart(3, '0')}`,
        origen,
        destino,
        distancia,
        duracion,
        precio_base,
        estado: 'activa',
        descripcion,
        viajes_disponibles: 0,
        pasajes_vendidos: 0
      }
    });
  } catch (error) {
    console.error('❌ Error al crear ruta:', error);
    res.status(500).json({ error: 'Error al crear ruta' });
  }
});

// Actualizar ruta
app.put('/api/rutas/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { origen, destino, distancia, duracion, precio_base, estado, descripcion } = req.body;
    console.log(`🗺️ Actualizando ruta: ${id}`);
    
    const [result] = await pool.execute(`
      UPDATE RUTAS 
      SET origen = ?, destino = ?, distancia = ?, duracion_estimada = ?, 
          precio_base = ?, estado = ?, descripcion = ?
      WHERE codigo = ?
    `, [origen, destino, distancia, duracion, precio_base, estado, descripcion, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    
    console.log(`✅ Ruta actualizada exitosamente: ${id}`);
    res.json({ success: true, message: 'Ruta actualizada exitosamente' });
  } catch (error) {
    console.error('❌ Error al actualizar ruta:', error);
    res.status(500).json({ error: 'Error al actualizar ruta' });
  }
});

// Eliminar ruta
app.delete('/api/rutas/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗺️ Eliminando ruta: ${id}`);
    
    // Verificar si hay viajes asociados
    const [viajes] = await pool.execute(`
      SELECT COUNT(*) as count FROM VIAJE WHERE ruta_codigo = ?
    `, [id]);
    
    if (viajes[0].count > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la ruta porque tiene viajes asociados' 
      });
    }
    
    const [result] = await pool.execute(`
      DELETE FROM RUTAS WHERE codigo = ?
    `, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    
    console.log(`✅ Ruta eliminada exitosamente: ${id}`);
    res.json({ success: true, message: 'Ruta eliminada exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar ruta:', error);
    res.status(500).json({ error: 'Error al eliminar ruta' });
  }
});

// Obtener viajes por ruta
app.get('/api/rutas/:id/viajes', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🚌 Obteniendo viajes para ruta: ${id}`);
    
    const [viajes] = await pool.execute(`
      SELECT 
        v.codigo as id,
        CONCAT('V', LPAD(v.codigo, 3, '0'), '-2024') as codigo,
        v.ruta_codigo as ruta_id,
        CONCAT(r.origen, ' - ', r.destino) as ruta,
        DATE(v.fecha_hora_salida) as fecha_salida,
        TIME(v.fecha_hora_salida) as hora_salida,
        DATE(v.fecha_hora_llegada_estimada) as fecha_llegada,
        TIME(v.fecha_hora_llegada_estimada) as hora_llegada,
        b.placa as bus_placa,
        b.num_asientos as capacidad,
        (b.num_asientos - COALESCE((
          SELECT COUNT(*) FROM PASAJE p 
          WHERE p.viaje_codigo = v.codigo AND p.estado != 'cancelado'
        ), 0)) as asientos_disponibles,
        r.precio_base as precio,
        v.estado
      FROM VIAJE v
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      INNER JOIN BUSES b ON v.bus_codigo = b.codigo
      WHERE v.ruta_codigo = ?
      ORDER BY v.fecha_hora_salida
    `, [id]);
    
    console.log(`✅ ${viajes.length} viajes encontrados para ruta ${id}`);
    res.json(viajes);
  } catch (error) {
    console.error('❌ Error al obtener viajes de ruta:', error);
    res.status(500).json({ error: 'Error al obtener viajes' });
  }
});

// Agregar viaje a una ruta
app.post('/api/rutas/:id/viajes', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_salida, hora_salida, bus_placa, capacidad, precio } = req.body;
    console.log(`🚌 Agregando viaje a ruta: ${id}`);
    
    if (!fecha_salida || !hora_salida || !bus_placa) {
      return res.status(400).json({ error: 'Fecha, hora y bus son requeridos' });
    }
    
    // Obtener bus por placa
    const [buses] = await pool.execute(`
      SELECT codigo FROM BUSES WHERE placa = ?
    `, [bus_placa]);
    
    if (buses.length === 0) {
      return res.status(400).json({ error: 'Bus no encontrado' });
    }
    
    const bus_codigo = buses[0].codigo;
    const fecha_hora_salida = `${fecha_salida} ${hora_salida}:00`;
    
    // Calcular hora de llegada estimada (simplificado)
    const [ruta] = await pool.execute(`
      SELECT duracion_estimada FROM RUTAS WHERE codigo = ?
    `, [id]);
    
    if (ruta.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    
    const duracion = ruta[0].duracion_estimada;
    const fecha_hora_llegada = new Date(fecha_hora_salida);
    fecha_hora_llegada.setHours(fecha_hora_llegada.getHours() + duracion);
    
    // Obtener un chofer disponible (simplificado)
    const [choferes] = await pool.execute(`
      SELECT codigo FROM CHOFER LIMIT 1
    `);
    
    if (choferes.length === 0) {
      return res.status(400).json({ error: 'No hay choferes disponibles' });
    }
    
    const chofer_codigo = choferes[0].codigo;
    
    const [result] = await pool.execute(`
      INSERT INTO VIAJE (ruta_codigo, bus_codigo, chofer_codigo, fecha_hora_salida, fecha_hora_llegada_estimada, estado)
      VALUES (?, ?, ?, ?, ?, 'Programado')
    `, [id, bus_codigo, chofer_codigo, fecha_hora_salida, fecha_hora_llegada, 'Programado']);
    
    console.log(`✅ Viaje agregado exitosamente: ID ${result.insertId}`);
    
    res.json({
      success: true,
      message: 'Viaje agregado exitosamente',
      viaje: {
        id: result.insertId,
        codigo: `V${String(result.insertId).padStart(3, '0')}-2024`,
        ruta_id: parseInt(id),
        bus_placa,
        capacidad,
        precio: precio || ruta[0].precio_base,
        estado: 'programado'
      }
    });
  } catch (error) {
    console.error('❌ Error al agregar viaje:', error);
    res.status(500).json({ error: 'Error al agregar viaje' });
  }
});

// Buscar viajes disponibles
app.get('/api/viajes/buscar', async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;
    let sql = `
      SELECT v.*, r.origen, r.destino, r.costo_referencial, b.placa, b.fabricante, b.num_asientos
      FROM VIAJE v
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      INNER JOIN BUSES b ON v.bus_codigo = b.codigo
      WHERE v.estado = 'Programado'
    `;
    const params = [];
    if (origen) {
      sql += ' AND r.origen = ?';
      params.push(origen);
    }
    if (destino) {
      sql += ' AND r.destino = ?';
      params.push(destino);
    }
    if (fecha) {
      sql += ' AND DATE(v.fecha_hora_salida) = ?';
      params.push(fecha);
    }
    sql += ' ORDER BY v.fecha_hora_salida ASC';
    const [viajes] = await pool.execute(sql, params);
    res.json(viajes);
  } catch (error) {
    console.error('❌ Error al buscar viajes:', error);
    res.status(500).json({ error: 'Error al buscar viajes' });
  }
});

// ==========================================
// CANCELACIÓN DE PASAJE POR CLIENTE
// ==========================================

// Endpoint para cancelar un pasaje (solo el dueño puede cancelar)
app.put('/api/pasajes/cancelar/:pasajeId', verificarToken, async (req, res) => {
  try {
    const { pasajeId } = req.params;
    const usuario = req.usuario;
    // Solo clientes pueden cancelar sus propios pasajes
    if (usuario.type !== 'customer') {
      return res.status(403).json({ error: 'Solo los clientes pueden cancelar sus pasajes' });
    }
    // Verificar que el pasaje pertenezca al cliente
    const [pasajes] = await pool.execute(
      'SELECT * FROM PASAJE WHERE codigo = ? AND cliente_codigo = ?',
      [pasajeId, usuario.codigo]
    );
    if (pasajes.length === 0) {
      return res.status(404).json({ error: 'Pasaje no encontrado o no pertenece al cliente' });
    }
    // Actualizar estado a Cancelado
    await pool.execute(
      'UPDATE PASAJE SET estado = ? WHERE codigo = ?',
      ['Cancelado', pasajeId]
    );
    res.json({ success: true, message: 'Pasaje cancelado correctamente' });
  } catch (error) {
    console.error('❌ Error al cancelar pasaje:', error);
    res.status(500).json({ error: 'Error al cancelar pasaje' });
  }
});

// ==========================================
// MANEJO DE ERRORES Y SERVIDOR
// ==========================================

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ruta 404
app.use('*', (req, res) => {
  console.log(`❓ Endpoint no encontrado: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
async function iniciarServidor() {
  try {
    console.log('🚀 Iniciando servidor NORTEEXPRESO...');
    
    // Probar conexión a la base de datos
    const conexionExitosa = await testConnection();
    
    if (!conexionExitosa) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.error('💡 Verifica que MySQL esté ejecutándose y las credenciales sean correctas');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🎉 Servidor API ejecutándose en puerto ${PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   POST /api/auth/login`);
      console.log(`   POST /api/auth/register-cliente`);
      console.log(`   POST /api/auth/register-admin`);
      console.log(`   GET  /api/rutas`);
      console.log(`   GET  /api/viajes/buscar`);
      console.log(`   GET  /api/viajes/:id/asientos`);
      console.log(`   POST /api/pasajes/compra-completa`);
      console.log(`   GET  /api/dashboard/estadisticas`);
      console.log(`   GET  /api/admin/viajes`);
      console.log(`   POST /api/admin/viajes`);
      console.log(`   GET  /api/admin/buses`);
      console.log(`   GET  /api/admin/choferes`);
      console.log(`   GET  /api/admin/pasajes`);
      console.log(`🔗 Frontend URL: http://localhost:5173`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await pool.end();
  process.exit(0);
});

// Iniciar servidor si este archivo se ejecuta directamente
if (require.main === module) {
  iniciarServidor();
}

module.exports = app;
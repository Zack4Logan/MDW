// Configuración actualizada de la base de datos para NORTEEXPRESO con MySQL real
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Bdvargas2005',
  database: process.env.DB_NAME || 'transporte_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 Usuario: ${dbConfig.user}`);
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', rows[0]);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    console.error('💡 Verifica que MySQL esté ejecutándose y las credenciales sean correctas');
    return false;
  }
}

// Función para inicializar datos de prueba si no existen
async function initializeTestData() {
  try {
    // Verificar si ya existe el usuario admin
    const [existingUser] = await pool.execute(
      'SELECT codigo FROM USUARIOS WHERE usuario = ?',
      ['admin']
    );

    if (existingUser.length === 0) {
      console.log('🔧 Inicializando datos de prueba...');
      
      // Crear contraseña hasheada para admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Actualizar el usuario admin con la contraseña correcta
      await pool.execute(`
        UPDATE USUARIOS 
        SET clave = ? 
        WHERE codigo = 1
      `, [hashedPassword]);
      
      console.log('✅ Usuario admin actualizado con contraseña hasheada');
    }

    // Verificar si necesitamos agregar campos a la tabla CLIENTE
    try {
      await pool.execute(`
        ALTER TABLE CLIENTE 
        ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE,
        ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
        ADD COLUMN IF NOT EXISTS password VARCHAR(255),
        ADD COLUMN IF NOT EXISTS puntos INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS nivel VARCHAR(20) DEFAULT 'Bronce',
        ADD COLUMN IF NOT EXISTS fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo'
      `);
      console.log('✅ Tabla CLIENTE actualizada con nuevos campos');
    } catch (error) {
      console.log('ℹ️ Tabla CLIENTE ya tiene los campos necesarios');
    }

    console.log('✅ Datos de prueba verificados');
  } catch (error) {
    console.error('❌ Error al inicializar datos de prueba:', error);
  }
}

// 1. GESTIÓN DE RUTAS
async function obtenerRutas() {
  try {
    const [rows] = await pool.execute(`
      SELECT codigo, origen, destino, costo_referencial 
      FROM RUTAS 
      ORDER BY origen, destino
    `);
    return rows;
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    throw error;
  }
}

async function crearRuta(origen, destino, costoReferencial) {
  try {
    const [result] = await pool.execute(`
      INSERT INTO RUTAS (origen, destino, costo_referencial) 
      VALUES (?, ?, ?)
    `, [origen, destino, costoReferencial]);
    return result.insertId;
  } catch (error) {
    console.error('Error al crear ruta:', error);
    throw error;
  }
}

// 2. GESTIÓN DE BUSES
async function obtenerBuses() {
  try {
    const [rows] = await pool.execute(`
      SELECT codigo, placa, fabricante, num_asientos, estado 
      FROM BUSES 
      ORDER BY placa
    `);
    return rows;
  } catch (error) {
    console.error('Error al obtener buses:', error);
    throw error;
  }
}

async function registrarBus(placa, fabricante, numAsientos) {
  try {
    const [result] = await pool.execute(`
      INSERT INTO BUSES (placa, fabricante, num_asientos, estado) 
      VALUES (?, ?, ?, 'Operativo')
    `, [placa, fabricante, numAsientos]);
    return result.insertId;
  } catch (error) {
    console.error('Error al registrar bus:', error);
    throw error;
  }
}

// 3. GESTIÓN DE VIAJES
async function obtenerViajes(fecha = null) {
  try {
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
    if (fecha) {
      query += ' WHERE DATE(v.fecha_hora_salida) = ?';
      params.push(fecha);
    }
    
    query += ' ORDER BY v.fecha_hora_salida';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error al obtener viajes:', error);
    throw error;
  }
}

async function programarViaje(rutaCodigo, busCodigo, choferCodigo, fechaHoraSalida, fechaHoraLlegada) {
  try {
    const [result] = await pool.execute(`
      INSERT INTO VIAJE (ruta_codigo, bus_codigo, chofer_codigo, fecha_hora_salida, fecha_hora_llegada_estimada, estado) 
      VALUES (?, ?, ?, ?, ?, 'Programado')
    `, [rutaCodigo, busCodigo, choferCodigo, fechaHoraSalida, fechaHoraLlegada]);
    return result.insertId;
  } catch (error) {
    console.error('Error al programar viaje:', error);
    throw error;
  }
}

// 4. GESTIÓN DE PASAJES - FUNCIÓN PRINCIPAL PARA GUARDAR PASAJES
async function venderPasaje(viajeCodigo, clienteCodigo, asiento, importePagar, usuarioVendedorCodigo, datosAdicionales = {}) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Verificar disponibilidad del asiento
    const [asientoOcupado] = await connection.execute(`
      SELECT codigo FROM PASAJE 
      WHERE viaje_codigo = ? AND asiento = ? AND estado = 'Vendido'
    `, [viajeCodigo, asiento]);
    
    if (asientoOcupado.length > 0) {
      throw new Error('El asiento ya está ocupado');
    }
    
    // Insertar el pasaje con datos adicionales
    const [result] = await connection.execute(`
      INSERT INTO PASAJE (
        viaje_codigo, 
        cliente_codigo, 
        asiento, 
        importe_pagar, 
        usuario_vendedor_codigo, 
        estado
      ) VALUES (?, ?, ?, ?, ?, 'Vendido')
    `, [
      viajeCodigo, 
      clienteCodigo, 
      asiento, 
      importePagar, 
      usuarioVendedorCodigo
    ]);
    
    await connection.commit();
    console.log(`✅ Pasaje vendido exitosamente: ID ${result.insertId}`);
    return result.insertId;
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al vender pasaje:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 5. GESTIÓN DE CLIENTES - FUNCIÓN MEJORADA
async function registrarCliente(nombre, apellidos, dni, telefono = null, email = null) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Verificar si la persona ya existe
    const [personaExistente] = await connection.execute(`
      SELECT codigo FROM PERSONA WHERE dni = ?
    `, [dni]);
    
    let personaCodigo;
    
    if (personaExistente.length > 0) {
      personaCodigo = personaExistente[0].codigo;
      console.log(`Cliente existente encontrado: ${personaCodigo}`);
    } else {
      // Insertar nueva persona
      const [personaResult] = await connection.execute(`
        INSERT INTO PERSONA (nombre, apellidos, dni) 
        VALUES (?, ?, ?)
      `, [nombre, apellidos, dni]);
      
      personaCodigo = personaResult.insertId;
      console.log(`Nueva persona creada: ${personaCodigo}`);
    }
    
    // Verificar si ya es cliente
    const [clienteExistente] = await connection.execute(`
      SELECT codigo FROM CLIENTE WHERE codigo = ?
    `, [personaCodigo]);
    
    if (clienteExistente.length === 0) {
      // Insertar como cliente
      await connection.execute(`
        INSERT INTO CLIENTE (codigo, razon_social, ruc) 
        VALUES (?, NULL, NULL)
      `, [personaCodigo]);
      console.log(`Cliente registrado: ${personaCodigo}`);
    }
    
    await connection.commit();
    return personaCodigo;
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar cliente:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 6. FUNCIÓN PRINCIPAL PARA PROCESAR COMPRA COMPLETA
async function procesarCompraCompleta(datosCompra) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('🛒 Iniciando procesamiento de compra completa...');
    
    const { viaje_codigo, cliente, asientos, metodo_pago, datosAdicionales } = datosCompra;
    
    // 1. Registrar o obtener cliente
    const clienteCodigo = await registrarCliente(
      cliente.nombre,
      cliente.apellidos,
      cliente.dni,
      cliente.telefono,
      cliente.email
    );
    
    // 2. Obtener información del viaje para calcular precio
    const [viajeInfo] = await connection.execute(`
      SELECT r.costo_referencial 
      FROM VIAJE v
      INNER JOIN RUTAS r ON v.ruta_codigo = r.codigo
      WHERE v.codigo = ?
    `, [viaje_codigo]);
    
    if (viajeInfo.length === 0) {
      throw new Error('Viaje no encontrado');
    }
    
    const costoUnitario = viajeInfo[0].costo_referencial;
    const pasajesCreados = [];
    
    // 3. Crear pasajes para cada asiento
    for (const asiento of asientos) {
      console.log(`📝 Creando pasaje para asiento ${asiento}...`);
      
      // Verificar disponibilidad del asiento
      const [asientoOcupado] = await connection.execute(`
        SELECT codigo FROM PASAJE 
        WHERE viaje_codigo = ? AND asiento = ? AND estado = 'Vendido'
      `, [viaje_codigo, asiento]);
      
      if (asientoOcupado.length > 0) {
        throw new Error(`El asiento ${asiento} ya está ocupado`);
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
      `, [
        viaje_codigo,
        clienteCodigo,
        asiento,
        importeTotal
      ]);
      
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
    
    return {
      success: true,
      clienteCodigo,
      pasajes: pasajesCreados,
      totalImporte
    };
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error procesando compra:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 7. GESTIÓN DE PERSONAL
async function obtenerPersonal() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.codigo,
        p.nombre,
        p.apellidos,
        p.dni,
        e.direccion,
        e.telefono,
        e.email,
        c.descripcion as cargo,
        a.descripcion as area,
        co.sueldo
      FROM PERSONA p
      INNER JOIN EMPLEADO e ON p.codigo = e.codigo
      INNER JOIN CARGO c ON e.cargo_codigo = c.codigo
      INNER JOIN AREA a ON c.area_codigo = a.codigo
      INNER JOIN CONTRATO co ON e.contrato_codigo = co.codigo
      ORDER BY p.apellidos, p.nombre
    `);
    return rows;
  } catch (error) {
    console.error('Error al obtener personal:', error);
    throw error;
  }
}

// 8. REPORTES Y ESTADÍSTICAS
async function obtenerEstadisticasVentas(fechaInicio, fechaFin) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        DATE(pa.fecha_emision) as fecha,
        COUNT(*) as total_pasajes,
        SUM(pa.importe_pagar) as total_ingresos,
        AVG(pa.importe_pagar) as promedio_pasaje
      FROM PASAJE pa
      WHERE DATE(pa.fecha_emision) BETWEEN ? AND ?
        AND pa.estado = 'Vendido'
      GROUP BY DATE(pa.fecha_emision)
      ORDER BY fecha
    `, [fechaInicio, fechaFin]);
    return rows;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}

async function obtenerRutasPopulares(limite = 10) {
  try {
    const [rows] = await pool.execute(`
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
      LIMIT ?
    `, [limite]);
    return rows;
  } catch (error) {
    console.error('Error al obtener rutas populares:', error);
    throw error;
  }
}

// Función para cerrar el pool de conexiones
async function cerrarConexion() {
  try {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error al cerrar conexiones:', error);
  }
}

// Exportar funciones
module.exports = {
  pool,
  testConnection,
  initializeTestData,
  
  // Rutas
  obtenerRutas,
  crearRuta,
  
  // Buses
  obtenerBuses,
  registrarBus,
  
  // Viajes
  obtenerViajes,
  programarViaje,
  
  // Pasajes
  venderPasaje,
  procesarCompraCompleta,
  
  // Clientes
  registrarCliente,
  
  // Personal
  obtenerPersonal,
  
  // Reportes
  obtenerEstadisticasVentas,
  obtenerRutasPopulares,
  
  // Utilidades
  cerrarConexion
};
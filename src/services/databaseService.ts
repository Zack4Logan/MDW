// Servicio completo para conectar con la base de datos MySQL real
export interface PasajeData {
  viaje_codigo: number;
  cliente: {
    nombre: string;
    apellidos: string;
    dni: string;
    telefono?: string;
    email?: string;
  };
  asientos: number[];
  metodo_pago: string;
  telefono_contacto?: string;
  viaja_con_mascota?: boolean;
  tipo_mascota?: string;
  nombre_mascota?: string;
  peso_mascota?: number;
  tutor_nombre?: string;
  tutor_dni?: string;
  permiso_notarial?: boolean;
  pasajeros_info?: Array<{
    asiento: number;
    genero: 'M' | 'F';
    nombre: string;
  }>;
}

export interface ViajeData {
  ruta_codigo: number;
  bus_codigo: number;
  chofer_codigo: number;
  fecha_hora_salida: string;
  fecha_hora_llegada_estimada: string;
}

export interface RegistroClienteData {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  password: string;
}

export interface RegistroAdminData {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  usuario: string;
  password: string;
  cargo_codigo: number;
}

export interface BusData {
  placa: string;
  fabricante: string;
  num_asientos: number;
  año?: string;
  modelo?: string;
}

export interface RutaData {
  origen: string;
  destino: string;
  costo_referencial: number;
  duracion_horas?: number;
  distancia_km?: number;
  descripcion?: string;
}

export interface EmpleadoData {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  cargo_codigo: number;
  sueldo: number;
}

class DatabaseService {
  private baseUrl = 'http://localhost:3001/api';

  private async getAuthHeaders() {
    const token = localStorage.getItem('norteexpreso_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // ==========================================
  // MÉTODOS PÚBLICOS (sin autenticación)
  // ==========================================

  async obtenerRutas() {
    try {
      const response = await fetch(`${this.baseUrl}/rutas`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo rutas:', error);
      return [];
    }
  }

  async buscarViajes(origen: string, destino: string, fecha: string) {
    try {
      const response = await fetch(`${this.baseUrl}/viajes/buscar?origen=${encodeURIComponent(origen)}&destino=${encodeURIComponent(destino)}&fecha=${fecha}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error buscando viajes:', error);
      return [];
    }
  }

  async obtenerAsientosOcupados(viajeId: number): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/viajes/${viajeId}/asientos`);
      if (response.ok) {
        const asientos = await response.json();
        return asientos;
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo asientos ocupados:', error);
      return [];
    }
  }

  async guardarPasaje(pasajeData: PasajeData): Promise<{ success: boolean; pasajes?: number[]; error?: string }> {
    try {
      console.log('Guardando pasaje en base de datos:', pasajeData);
      
      const response = await fetch(`${this.baseUrl}/pasajes/compra-completa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viaje_codigo: pasajeData.viaje_codigo,
          cliente: pasajeData.cliente,
          asientos: pasajeData.asientos,
          metodo_pago: pasajeData.metodo_pago,
          datosAdicionales: {
            telefono_contacto: pasajeData.telefono_contacto,
            viaja_con_mascota: pasajeData.viaja_con_mascota,
            tipo_mascota: pasajeData.tipo_mascota,
            nombre_mascota: pasajeData.nombre_mascota,
            peso_mascota: pasajeData.peso_mascota,
            tutor_nombre: pasajeData.tutor_nombre,
            tutor_dni: pasajeData.tutor_dni,
            permiso_notarial: pasajeData.permiso_notarial
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          pasajes: result.data?.pasajes || []
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Error al guardar el pasaje'
        };
      }
    } catch (error) {
      console.error('Error guardando pasaje:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  // ==========================================
  // MÉTODOS ADMIN (requieren autenticación)
  // ==========================================

  async obtenerEstadisticas() {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/estadisticas`, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  async obtenerViajes(fecha?: string, estado?: string) {
    try {
      let url = `${this.baseUrl}/admin/viajes`;
      const params = new URLSearchParams();
      
      if (fecha) params.append('fecha', fecha);
      if (estado) params.append('estado', estado);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo viajes:', error);
      return [];
    }
  }

  async crearViaje(viajeData: ViajeData): Promise<{ success: boolean; error?: string; viaje_codigo?: number }> {
    try {
      console.log('Creando nuevo viaje:', viajeData);
      
      const response = await fetch(`${this.baseUrl}/admin/viajes`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(viajeData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          viaje_codigo: result.viaje_codigo
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al crear viaje'
        };
      }
    } catch (error) {
      console.error('Error creando viaje:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  async obtenerBuses() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/buses`, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo buses:', error);
      return [];
    }
  }

  async crearBus(busData: BusData): Promise<{ success: boolean; error?: string; bus_codigo?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/buses`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(busData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          bus_codigo: result.bus_codigo
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al crear bus'
        };
      }
    } catch (error) {
      console.error('Error creando bus:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  async obtenerChoferes() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/choferes`, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo choferes:', error);
      return [];
    }
  }

  async obtenerPasajes(fecha?: string, estado?: string) {
    try {
      let url = `${this.baseUrl}/admin/pasajes`;
      const params = new URLSearchParams();
      
      if (fecha) params.append('fecha', fecha);
      if (estado) params.append('estado', estado);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo pasajes:', error);
      return [];
    }
  }

  async crearRuta(rutaData: RutaData): Promise<{ success: boolean; error?: string; ruta_codigo?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/rutas`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(rutaData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          ruta_codigo: result.ruta_codigo
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al crear ruta'
        };
      }
    } catch (error) {
      console.error('Error creando ruta:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  async obtenerPersonal() {
    try {
      const response = await fetch(`${this.baseUrl}/admin/personal`, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo personal:', error);
      return [];
    }
  }

  async crearEmpleado(empleadoData: EmpleadoData): Promise<{ success: boolean; error?: string; empleado_codigo?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/empleados`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(empleadoData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          empleado_codigo: result.empleado_codigo
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al crear empleado'
        };
      }
    } catch (error) {
      console.error('Error creando empleado:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  // ==========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ==========================================

  async registrarCliente(clienteData: RegistroClienteData): Promise<{ success: boolean; error?: string; cliente?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register-cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          cliente: result.cliente
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al registrar cliente'
        };
      }
    } catch (error) {
      console.error('Error registrando cliente:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  async registrarAdmin(adminData: RegistroAdminData): Promise<{ success: boolean; error?: string; admin?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      });

      const result = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          admin: result.admin
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error al registrar administrador'
        };
      }
    } catch (error) {
      console.error('Error registrando administrador:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor'
      };
    }
  }

  // ==========================================
  // MÉTODOS DE REPORTES
  // ==========================================

  async obtenerReportesBuses(fechaInicio?: string, fechaFin?: string) {
    try {
      let url = `${this.baseUrl}/admin/reportes/buses`;
      const params = new URLSearchParams();
      
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo reportes de buses:', error);
      return [];
    }
  }

  async obtenerReportesVentas(fechaInicio?: string, fechaFin?: string) {
    try {
      let url = `${this.baseUrl}/admin/reportes/ventas`;
      const params = new URLSearchParams();
      
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: await this.getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error obteniendo reportes de ventas:', error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();
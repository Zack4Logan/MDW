import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bus, 
  MapPin, 
  CreditCard,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalVentas: number;
  ventasHoy: number;
  ventasMes: number;
  totalClientes: number;
  clientesNuevos: number;
  totalViajes: number;
  viajesActivos: number;
  totalRutas: number;
  rutasActivas: number;
  totalBuses: number;
  busesDisponibles: number;
  ingresosHoy: number;
  ingresosMes: number;
  porcentajeCrecimiento: number;
}

interface VentaReciente {
  id: number;
  cliente: string;
  ruta: string;
  fecha: string;
  monto: number;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
}

interface ViajeProximo {
  id: number;
  ruta: string;
  fecha: string;
  hora: string;
  asientosOcupados: number;
  asientosTotales: number;
  estado: 'programado' | 'en_curso' | 'completado';
}

export function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVentas: 0,
    ventasHoy: 0,
    ventasMes: 0,
    totalClientes: 0,
    clientesNuevos: 0,
    totalViajes: 0,
    viajesActivos: 0,
    totalRutas: 0,
    rutasActivas: 0,
    totalBuses: 0,
    busesDisponibles: 0,
    ingresosHoy: 0,
    ingresosMes: 0,
    porcentajeCrecimiento: 0
  });

  const [ventasRecientes, setVentasRecientes] = useState<VentaReciente[]>([]);
  const [viajesProximos, setViajesProximos] = useState<ViajeProximo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      // Simular carga de datos desde el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos simulados para demostración
      setStats({
        totalVentas: 1247,
        ventasHoy: 23,
        ventasMes: 156,
        totalClientes: 892,
        clientesNuevos: 12,
        totalViajes: 45,
        viajesActivos: 8,
        totalRutas: 12,
        rutasActivas: 10,
        totalBuses: 25,
        busesDisponibles: 18,
        ingresosHoy: 3450.50,
        ingresosMes: 45678.90,
        porcentajeCrecimiento: 15.3
      });

      setVentasRecientes([
        {
          id: 1,
          cliente: 'María González',
          ruta: 'Lima - Trujillo',
          fecha: '2024-01-15',
          monto: 85.00,
          estado: 'confirmado'
        },
        {
          id: 2,
          cliente: 'Carlos Rodríguez',
          ruta: 'Lima - Piura',
          fecha: '2024-01-15',
          monto: 120.00,
          estado: 'confirmado'
        },
        {
          id: 3,
          cliente: 'Ana Martínez',
          ruta: 'Lima - Chiclayo',
          fecha: '2024-01-15',
          monto: 95.00,
          estado: 'pendiente'
        },
        {
          id: 4,
          cliente: 'Luis Pérez',
          ruta: 'Lima - Tumbes',
          fecha: '2024-01-15',
          monto: 150.00,
          estado: 'confirmado'
        }
      ]);

      setViajesProximos([
        {
          id: 1,
          ruta: 'Lima - Trujillo',
          fecha: '2024-01-16',
          hora: '08:00',
          asientosOcupados: 42,
          asientosTotales: 50,
          estado: 'programado'
        },
        {
          id: 2,
          ruta: 'Lima - Piura',
          fecha: '2024-01-16',
          hora: '10:30',
          asientosOcupados: 38,
          asientosTotales: 50,
          estado: 'programado'
        },
        {
          id: 3,
          ruta: 'Lima - Chiclayo',
          fecha: '2024-01-16',
          hora: '14:00',
          asientosOcupados: 45,
          asientosTotales: 50,
          estado: 'programado'
        }
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'text-green-600 bg-green-100';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return <CheckCircle className="w-4 h-4" />;
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'cancelado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-oscuro"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-oscuro mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600">
          Bienvenido al panel de control de NORTEEXPRESO
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ventas Totales */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-azul-oscuro">{stats.totalVentas}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.porcentajeCrecimiento}% este mes
              </p>
            </div>
            <div className="bg-azul-oscuro bg-opacity-10 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-azul-oscuro" />
            </div>
          </div>
        </div>

        {/* Ingresos Hoy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Hoy</p>
              <p className="text-2xl font-bold text-azul-oscuro">
                S/. {stats.ingresosHoy.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.ventasHoy} ventas realizadas
              </p>
            </div>
            <div className="bg-green-500 bg-opacity-10 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-azul-oscuro">{stats.totalClientes}</p>
              <p className="text-sm text-blue-600 mt-1">
                +{stats.clientesNuevos} nuevos este mes
              </p>
            </div>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Viajes Activos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Viajes Activos</p>
              <p className="text-2xl font-bold text-azul-oscuro">{stats.viajesActivos}</p>
              <p className="text-sm text-orange-600 mt-1">
                de {stats.totalViajes} programados
              </p>
            </div>
            <div className="bg-orange-500 bg-opacity-10 p-3 rounded-full">
              <Bus className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ventas Recientes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-azul-oscuro">
              Ventas Recientes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {ventasRecientes.map((venta) => (
                <div key={venta.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{venta.cliente}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(venta.estado)}`}>
                        {venta.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{venta.ruta}</p>
                    <p className="text-xs text-gray-500">{venta.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-azul-oscuro">S/. {venta.monto.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Viajes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-azul-oscuro">
              Próximos Viajes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {viajesProximos.map((viaje) => (
                <div key={viaje.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{viaje.ruta}</h4>
                    <span className="text-sm text-gray-500">{viaje.fecha}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{viaje.hora}</span>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {viaje.asientosOcupados}/{viaje.asientosTotales}
                        </span>
                      </div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-azul-oscuro h-2 rounded-full"
                        style={{ width: `${(viaje.asientosOcupados / viaje.asientosTotales) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-azul-oscuro mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-azul-oscuro text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Nuevo Viaje</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Bus className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Gestionar Buses</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <MapPin className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Gestionar Rutas</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <BarChart3 className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Ver Reportes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
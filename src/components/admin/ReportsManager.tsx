import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter,
  DollarSign,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ReporteData {
  ventasPorMes: {
    mes: string;
    ventas: number;
    ingresos: number;
  }[];
  ventasPorRuta: {
    ruta: string;
    ventas: number;
    ingresos: number;
    porcentaje: number;
  }[];
  ventasPorEstado: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
  topClientes: {
    cliente: string;
    ventas: number;
    totalGastado: number;
  }[];
  estadisticasGenerales: {
    totalVentas: number;
    totalIngresos: number;
    promedioPorVenta: number;
    ventasHoy: number;
    ingresosHoy: number;
    crecimientoMes: number;
  };
}

export function ReportsManager() {
  const [reporteData, setReporteData] = useState<ReporteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('ventas');

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin, tipoReporte]);

  const cargarReportes = async () => {
    try {
      setIsLoading(true);
      // Simular carga de datos desde el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const datosSimulados: ReporteData = {
        ventasPorMes: [
          { mes: 'Enero', ventas: 156, ingresos: 23450.00 },
          { mes: 'Febrero', ventas: 189, ingresos: 28350.00 },
          { mes: 'Marzo', ventas: 234, ingresos: 35100.00 },
          { mes: 'Abril', ventas: 198, ingresos: 29700.00 },
          { mes: 'Mayo', ventas: 267, ingresos: 40050.00 },
          { mes: 'Junio', ventas: 289, ingresos: 43350.00 }
        ],
        ventasPorRuta: [
          { ruta: 'Lima - Trujillo', ventas: 89, ingresos: 13350.00, porcentaje: 35.2 },
          { ruta: 'Lima - Piura', ventas: 67, ingresos: 10050.00, porcentaje: 26.5 },
          { ruta: 'Lima - Chiclayo', ventas: 45, ingresos: 6750.00, porcentaje: 17.8 },
          { ruta: 'Lima - Tumbes', ventas: 34, ingresos: 5100.00, porcentaje: 13.4 },
          { ruta: 'Lima - Cajamarca', ventas: 18, ingresos: 2700.00, porcentaje: 7.1 }
        ],
        ventasPorEstado: [
          { estado: 'Confirmado', cantidad: 245, porcentaje: 85.2 },
          { estado: 'Pendiente', cantidad: 32, porcentaje: 11.1 },
          { estado: 'Cancelado', cantidad: 11, porcentaje: 3.7 }
        ],
        topClientes: [
          { cliente: 'María González', ventas: 12, totalGastado: 1800.00 },
          { cliente: 'Carlos Rodríguez', ventas: 8, totalGastado: 1200.00 },
          { cliente: 'Ana Martínez', ventas: 6, totalGastado: 900.00 },
          { cliente: 'Luis Pérez', ventas: 5, totalGastado: 750.00 },
          { cliente: 'Carmen Silva', ventas: 4, totalGastado: 600.00 }
        ],
        estadisticasGenerales: {
          totalVentas: 288,
          totalIngresos: 43200.00,
          promedioPorVenta: 150.00,
          ventasHoy: 23,
          ingresosHoy: 3450.00,
          crecimientoMes: 15.3
        }
      };

      setReporteData(datosSimulados);
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      setIsLoading(false);
    }
  };

  const exportarReporte = (tipo: string) => {
    if (!reporteData) return;

    let contenido = '';
    let nombreArchivo = '';

    switch (tipo) {
      case 'ventas':
        contenido = [
          ['Mes', 'Ventas', 'Ingresos (S/.)'],
          ...reporteData.ventasPorMes.map(item => [
            item.mes,
            item.ventas.toString(),
            item.ingresos.toFixed(2)
          ])
        ].map(row => row.join(',')).join('\n');
        nombreArchivo = 'reporte_ventas_mensual.csv';
        break;
      case 'rutas':
        contenido = [
          ['Ruta', 'Ventas', 'Ingresos (S/.)', 'Porcentaje (%)'],
          ...reporteData.ventasPorRuta.map(item => [
            item.ruta,
            item.ventas.toString(),
            item.ingresos.toFixed(2),
            item.porcentaje.toFixed(1)
          ])
        ].map(row => row.join(',')).join('\n');
        nombreArchivo = 'reporte_ventas_por_ruta.csv';
        break;
      case 'clientes':
        contenido = [
          ['Cliente', 'Ventas', 'Total Gastado (S/.)'],
          ...reporteData.topClientes.map(item => [
            item.cliente,
            item.ventas.toString(),
            item.totalGastado.toFixed(2)
          ])
        ].map(row => row.join(',')).join('\n');
        nombreArchivo = 'reporte_top_clientes.csv';
        break;
    }

    const blob = new Blob([contenido], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Confirmado':
        return 'text-green-600 bg-green-100';
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Confirmado':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pendiente':
        return <Clock className="w-4 h-4" />;
      case 'Cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-oscuro"></div>
      </div>
    );
  }

  if (!reporteData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar los reportes</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-oscuro mb-2">
          Reportes de Ventas
        </h1>
        <p className="text-gray-600">
          Análisis detallado de ventas y rendimiento
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
            >
              <option value="ventas">Ventas Mensuales</option>
              <option value="rutas">Ventas por Ruta</option>
              <option value="clientes">Top Clientes</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => exportarReporte(tipoReporte)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-azul-oscuro">{reporteData.estadisticasGenerales.totalVentas}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{reporteData.estadisticasGenerales.crecimientoMes}% este mes
              </p>
            </div>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-azul-oscuro">
                S/. {reporteData.estadisticasGenerales.totalIngresos.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Promedio: S/. {reporteData.estadisticasGenerales.promedioPorVenta.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-500 bg-opacity-10 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-azul-oscuro">{reporteData.estadisticasGenerales.ventasHoy}</p>
              <p className="text-sm text-green-600 mt-1">
                S/. {reporteData.estadisticasGenerales.ingresosHoy.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-500 bg-opacity-10 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-azul-oscuro">{reporteData.topClientes.length}</p>
              <p className="text-sm text-blue-600 mt-1">
                Top clientes
              </p>
            </div>
            <div className="bg-purple-500 bg-opacity-10 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ventas por Estado */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-azul-oscuro">
              Ventas por Estado
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reporteData.ventasPorEstado.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(item.estado)}`}>
                      {getEstadoIcon(item.estado)}
                      <span className="ml-1">{item.estado}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-azul-oscuro">{item.cantidad}</p>
                    <p className="text-sm text-gray-500">{item.porcentaje.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-azul-oscuro">
              Top Clientes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {reporteData.topClientes.map((cliente, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-yellow-600' : 'bg-azul-oscuro'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{cliente.cliente}</div>
                      <div className="text-sm text-gray-500">{cliente.ventas} ventas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-azul-oscuro">
                      S/. {cliente.totalGastado.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ventas por Ruta */}
      <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-azul-oscuro">
            Ventas por Ruta
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reporteData.ventasPorRuta.map((ruta, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-azul-oscuro mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{ruta.ruta}</div>
                    <div className="text-sm text-gray-500">{ruta.ventas} ventas</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-azul-oscuro">
                    S/. {ruta.ingresos.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{ruta.porcentaje.toFixed(1)}% del total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas Mensuales */}
      <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-azul-oscuro">
            Ventas Mensuales
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reporteData.ventasPorMes.map((mes, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-azul-oscuro mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{mes.mes}</div>
                    <div className="text-sm text-gray-500">{mes.ventas} ventas</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-azul-oscuro">
                    S/. {mes.ingresos.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
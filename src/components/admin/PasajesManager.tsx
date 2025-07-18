import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface Pasaje {
  id: number;
  codigo: string;
  cliente: {
    nombre: string;
    apellidos: string;
    dni: string;
    email: string;
    telefono: string;
  };
  viaje: {
    ruta: string;
    fecha: string;
    hora: string;
    bus: string;
  };
  asiento: number;
  precio: number;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  fecha_venta: string;
  metodo_pago: string;
}

export function PasajesManager() {
  const [pasajes, setPasajes] = useState<Pasaje[]>([]);
  const [filteredPasajes, setFilteredPasajes] = useState<Pasaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPasaje, setSelectedPasaje] = useState<Pasaje | null>(null);

  useEffect(() => {
    cargarPasajes();
  }, []);

  useEffect(() => {
    filtrarPasajes();
  }, [pasajes, searchTerm, statusFilter, dateFilter]);

  const cargarPasajes = async () => {
    try {
      // Simular carga de datos desde el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const datosSimulados: Pasaje[] = [
        {
          id: 1,
          codigo: 'P001-2024',
          cliente: {
            nombre: 'María',
            apellidos: 'González Pérez',
            dni: '12345678',
            email: 'maria@gmail.com',
            telefono: '999888777'
          },
          viaje: {
            ruta: 'Lima - Trujillo',
            fecha: '2024-01-16',
            hora: '08:00',
            bus: 'Bus-001'
          },
          asiento: 15,
          precio: 85.00,
          estado: 'confirmado',
          fecha_venta: '2024-01-15',
          metodo_pago: 'Tarjeta'
        },
        {
          id: 2,
          codigo: 'P002-2024',
          cliente: {
            nombre: 'Carlos',
            apellidos: 'Rodríguez López',
            dni: '87654321',
            email: 'carlos@gmail.com',
            telefono: '888777666'
          },
          viaje: {
            ruta: 'Lima - Piura',
            fecha: '2024-01-16',
            hora: '10:30',
            bus: 'Bus-002'
          },
          asiento: 22,
          precio: 120.00,
          estado: 'confirmado',
          fecha_venta: '2024-01-15',
          metodo_pago: 'Efectivo'
        },
        {
          id: 3,
          codigo: 'P003-2024',
          cliente: {
            nombre: 'Ana',
            apellidos: 'Martínez Silva',
            dni: '11223344',
            email: 'ana@gmail.com',
            telefono: '777666555'
          },
          viaje: {
            ruta: 'Lima - Chiclayo',
            fecha: '2024-01-16',
            hora: '14:00',
            bus: 'Bus-003'
          },
          asiento: 8,
          precio: 95.00,
          estado: 'pendiente',
          fecha_venta: '2024-01-15',
          metodo_pago: 'Transferencia'
        },
        {
          id: 4,
          codigo: 'P004-2024',
          cliente: {
            nombre: 'Luis',
            apellidos: 'Pérez García',
            dni: '55667788',
            email: 'luis@gmail.com',
            telefono: '666555444'
          },
          viaje: {
            ruta: 'Lima - Tumbes',
            fecha: '2024-01-17',
            hora: '06:00',
            bus: 'Bus-004'
          },
          asiento: 12,
          precio: 150.00,
          estado: 'cancelado',
          fecha_venta: '2024-01-14',
          metodo_pago: 'Tarjeta'
        }
      ];

      setPasajes(datosSimulados);
      setIsLoading(false);
    } catch (error) {
      console.error('Error cargando pasajes:', error);
      setIsLoading(false);
    }
  };

  const filtrarPasajes = () => {
    let filtrados = pasajes;

    // Filtro por búsqueda
    if (searchTerm) {
      filtrados = filtrados.filter(pasaje =>
        pasaje.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pasaje.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pasaje.cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pasaje.cliente.dni.includes(searchTerm) ||
        pasaje.viaje.ruta.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtrados = filtrados.filter(pasaje => pasaje.estado === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter) {
      filtrados = filtrados.filter(pasaje => pasaje.viaje.fecha === dateFilter);
    }

    setFilteredPasajes(filtrados);
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
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleVerDetalle = (pasaje: Pasaje) => {
    setSelectedPasaje(pasaje);
    setShowModal(true);
  };

  const handleEditar = (pasaje: Pasaje) => {
    // Implementar edición
    console.log('Editar pasaje:', pasaje);
  };

  const handleEliminar = (pasaje: Pasaje) => {
    if (confirm('¿Estás seguro de que quieres eliminar este pasaje?')) {
      setPasajes(pasajes.filter(p => p.id !== pasaje.id));
    }
  };

  const exportarDatos = () => {
    const csvContent = [
      ['Código', 'Cliente', 'DNI', 'Ruta', 'Fecha', 'Asiento', 'Precio', 'Estado', 'Fecha Venta'],
      ...filteredPasajes.map(pasaje => [
        pasaje.codigo,
        `${pasaje.cliente.nombre} ${pasaje.cliente.apellidos}`,
        pasaje.cliente.dni,
        pasaje.viaje.ruta,
        pasaje.viaje.fecha,
        pasaje.asiento.toString(),
        pasaje.precio.toString(),
        pasaje.estado,
        pasaje.fecha_venta
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pasajes_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          Gestión de Pasajes
        </h1>
        <p className="text-gray-600">
          Administra todas las ventas y reservas de pasajes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pasajes</p>
              <p className="text-2xl font-bold text-azul-oscuro">{pasajes.length}</p>
            </div>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-green-600">
                {pasajes.filter(p => p.estado === 'confirmado').length}
              </p>
            </div>
            <div className="bg-green-500 bg-opacity-10 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pasajes.filter(p => p.estado === 'pendiente').length}
              </p>
            </div>
            <div className="bg-yellow-500 bg-opacity-10 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-azul-oscuro">
                S/. {pasajes.reduce((sum, p) => sum + p.precio, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-500 bg-opacity-10 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Código, cliente, DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Viaje
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={exportarDatos}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPasajes.map((pasaje) => (
                <tr key={pasaje.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{pasaje.codigo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pasaje.cliente.nombre} {pasaje.cliente.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">{pasaje.cliente.dni}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pasaje.viaje.ruta}</div>
                      <div className="text-sm text-gray-500">
                        {pasaje.viaje.fecha} - {pasaje.viaje.hora}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{pasaje.asiento}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      S/. {pasaje.precio.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(pasaje.estado)}`}>
                      {getEstadoIcon(pasaje.estado)}
                      <span className="ml-1">{pasaje.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerDetalle(pasaje)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditar(pasaje)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(pasaje)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {showModal && selectedPasaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-azul-oscuro">
                Detalle del Pasaje
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información del Cliente</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Nombre:</span> {selectedPasaje.cliente.nombre} {selectedPasaje.cliente.apellidos}</p>
                  <p><span className="font-medium">DNI:</span> {selectedPasaje.cliente.dni}</p>
                  <p><span className="font-medium">Email:</span> {selectedPasaje.cliente.email}</p>
                  <p><span className="font-medium">Teléfono:</span> {selectedPasaje.cliente.telefono}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información del Viaje</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Ruta:</span> {selectedPasaje.viaje.ruta}</p>
                  <p><span className="font-medium">Fecha:</span> {selectedPasaje.viaje.fecha}</p>
                  <p><span className="font-medium">Hora:</span> {selectedPasaje.viaje.hora}</p>
                  <p><span className="font-medium">Bus:</span> {selectedPasaje.viaje.bus}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detalles del Pasaje</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Código:</span> {selectedPasaje.codigo}</p>
                  <p><span className="font-medium">Asiento:</span> {selectedPasaje.asiento}</p>
                  <p><span className="font-medium">Precio:</span> S/. {selectedPasaje.precio.toFixed(2)}</p>
                  <p><span className="font-medium">Estado:</span> 
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(selectedPasaje.estado)}`}>
                      {getEstadoIcon(selectedPasaje.estado)}
                      <span className="ml-1">{selectedPasaje.estado}</span>
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información de Pago</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Método de Pago:</span> {selectedPasaje.metodo_pago}</p>
                  <p><span className="font-medium">Fecha de Venta:</span> {selectedPasaje.fecha_venta}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleEditar(selectedPasaje)}
                className="px-4 py-2 bg-azul-oscuro text-white rounded-lg hover:bg-primary-700"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MapPin,
  Bus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Viaje {
  id: number;
  codigo: string;
  ruta: {
    origen: string;
    destino: string;
    distancia: number;
    duracion: number;
  };
  bus: {
    placa: string;
    capacidad: number;
    estado: string;
  };
  chofer: {
    nombre: string;
    apellidos: string;
    dni: string;
  };
  fecha_salida: string;
  hora_salida: string;
  fecha_llegada: string;
  hora_llegada: string;
  precio_base: number;
  asientos_disponibles: number;
  asientos_ocupados: number;
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado';
  observaciones?: string;
}

export function ViajesManager() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [filteredViajes, setFilteredViajes] = useState<Viaje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState<Viaje | null>(null);

  useEffect(() => {
    cargarViajes();
  }, []);

  useEffect(() => {
    filtrarViajes();
  }, [viajes, searchTerm, statusFilter, dateFilter]);

  const cargarViajes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('norteexpreso_token');
      const response = await fetch('http://localhost:3001/api/admin/viajes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setViajes(data);
      } else {
        setViajes([]);
      }
    } catch (error) {
      setViajes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarViajes = () => {
    let filtrados = viajes;

    // Filtro por búsqueda
    if (searchTerm) {
      filtrados = filtrados.filter(viaje =>
        viaje.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.ruta.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.chofer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.chofer.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        viaje.bus.placa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtrados = filtrados.filter(viaje => viaje.estado === statusFilter);
    }

    // Filtro por fecha
    if (dateFilter) {
      filtrados = filtrados.filter(viaje => viaje.fecha_salida === dateFilter);
    }

    setFilteredViajes(filtrados);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'text-blue-600 bg-blue-100';
      case 'en_curso':
        return 'text-green-600 bg-green-100';
      case 'completado':
        return 'text-gray-600 bg-gray-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'programado':
        return <Clock className="w-4 h-4" />;
      case 'en_curso':
        return <CheckCircle className="w-4 h-4" />;
      case 'completado':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleVerDetalle = (viaje: Viaje) => {
    setSelectedViaje(viaje);
    setShowModal(true);
  };

  const handleEditar = (viaje: Viaje) => {
    // Implementar edición
    console.log('Editar viaje:', viaje);
  };

  const handleEliminar = (viaje: Viaje) => {
    if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
      setViajes(viajes.filter(v => v.id !== viaje.id));
    }
  };

  const calcularOcupacion = (ocupados: number, total: number) => {
    return Math.round((ocupados / total) * 100);
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
          Gestión de Viajes
        </h1>
        <p className="text-gray-600">
          Administra todos los viajes programados y en curso
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Viajes</p>
              <p className="text-2xl font-bold text-azul-oscuro">{viajes.length}</p>
            </div>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <Bus className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programados</p>
              <p className="text-2xl font-bold text-blue-600">
                {viajes.filter(v => v.estado === 'programado').length}
              </p>
            </div>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Curso</p>
              <p className="text-2xl font-bold text-green-600">
                {viajes.filter(v => v.estado === 'en_curso').length}
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
              <p className="text-sm font-medium text-gray-600">Promedio Ocupación</p>
              <p className="text-2xl font-bold text-azul-oscuro">
                {Math.round(viajes.reduce((sum, v) => sum + calcularOcupacion(v.asientos_ocupados, v.bus.capacidad), 0) / viajes.length)}%
              </p>
            </div>
            <div className="bg-orange-500 bg-opacity-10 p-3 rounded-full">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Código, ruta, chofer..."
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
              <option value="programado">Programado</option>
              <option value="en_curso">En Curso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Salida
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
            />
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
                  Ruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus/Chofer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocupación
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
              {filteredViajes.map((viaje) => (
                <tr key={viaje.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{viaje.codigo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viaje.ruta.origen} → {viaje.ruta.destino}
                      </div>
                      <div className="text-sm text-gray-500">
                        {viaje.ruta.distancia} km • {viaje.ruta.duracion}h
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viaje.fecha_salida}
                      </div>
                      <div className="text-sm text-gray-500">
                        {viaje.hora_salida} - {viaje.hora_llegada}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viaje.bus.placa}
                      </div>
                      <div className="text-sm text-gray-500">
                        {viaje.chofer.nombre} {viaje.chofer.apellidos}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viaje.asientos_ocupados}/{viaje.bus.capacidad}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-azul-oscuro h-2 rounded-full"
                          style={{ width: `${calcularOcupacion(viaje.asientos_ocupados, viaje.bus.capacidad)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      S/. {viaje.precio_base.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(viaje.estado)}`}>
                      {getEstadoIcon(viaje.estado)}
                      <span className="ml-1">{viaje.estado}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerDetalle(viaje)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditar(viaje)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(viaje)}
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
      {showModal && selectedViaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-azul-oscuro">
                Detalle del Viaje
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
                <h4 className="font-medium text-gray-900 mb-3">Información del Viaje</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Código:</span> {selectedViaje.codigo}</p>
                  <p><span className="font-medium">Ruta:</span> {selectedViaje.ruta.origen} → {selectedViaje.ruta.destino}</p>
                  <p><span className="font-medium">Distancia:</span> {selectedViaje.ruta.distancia} km</p>
                  <p><span className="font-medium">Duración:</span> {selectedViaje.ruta.duracion} horas</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Horarios</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Salida:</span> {selectedViaje.fecha_salida} {selectedViaje.hora_salida}</p>
                  <p><span className="font-medium">Llegada:</span> {selectedViaje.fecha_llegada} {selectedViaje.hora_llegada}</p>
                  <p><span className="font-medium">Precio Base:</span> S/. {selectedViaje.precio_base.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información del Bus</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Placa:</span> {selectedViaje.bus.placa}</p>
                  <p><span className="font-medium">Capacidad:</span> {selectedViaje.bus.capacidad} asientos</p>
                  <p><span className="font-medium">Estado:</span> {selectedViaje.bus.estado}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Información del Chofer</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Nombre:</span> {selectedViaje.chofer.nombre} {selectedViaje.chofer.apellidos}</p>
                  <p><span className="font-medium">DNI:</span> {selectedViaje.chofer.dni}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ocupación</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Asientos Ocupados:</span> {selectedViaje.asientos_ocupados}</p>
                  <p><span className="font-medium">Asientos Disponibles:</span> {selectedViaje.asientos_disponibles}</p>
                  <p><span className="font-medium">Porcentaje de Ocupación:</span> {calcularOcupacion(selectedViaje.asientos_ocupados, selectedViaje.bus.capacidad)}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estado</h4>
                <div className="space-y-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(selectedViaje.estado)}`}>
                    {getEstadoIcon(selectedViaje.estado)}
                    <span className="ml-1">{selectedViaje.estado}</span>
                  </span>
                  {selectedViaje.observaciones && (
                    <p><span className="font-medium">Observaciones:</span> {selectedViaje.observaciones}</p>
                  )}
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
                onClick={() => handleEditar(selectedViaje)}
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
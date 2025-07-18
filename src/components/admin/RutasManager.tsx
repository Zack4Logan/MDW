import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Bus,
  Calendar,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { databaseService, Ruta, Viaje } from '../../services/databaseService';

export function RutasManager() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [filteredRutas, setFilteredRutas] = useState<Ruta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);
  const [showViajeModal, setShowViajeModal] = useState(false);
  const [selectedRutaForViaje, setSelectedRutaForViaje] = useState<Ruta | null>(null);

  // Estados para formularios
  const [nuevaRuta, setNuevaRuta] = useState({
    origen: '',
    destino: '',
    distancia: 0,
    duracion: 0,
    precio_base: 0,
    descripcion: ''
  });

  const [nuevoViaje, setNuevoViaje] = useState({
    fecha_salida: '',
    hora_salida: '',
    bus_placa: '',
    capacidad: 50,
    precio: 0
  });

  useEffect(() => {
    cargarRutas();
  }, []);

  useEffect(() => {
    filtrarRutas();
  }, [rutas, searchTerm, statusFilter]);

  const cargarRutas = async () => {
    try {
      setIsLoading(true);
      const [rutasData, viajesData] = await Promise.all([
        databaseService.obtenerRutas(),
        databaseService.obtenerViajes()
      ]);
      
      setRutas(rutasData);
      setViajes(viajesData);
    } catch (error) {
      console.error('Error cargando rutas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtrarRutas = () => {
    let filtrados = rutas;

    // Filtro por búsqueda
    if (searchTerm) {
      filtrados = filtrados.filter(ruta =>
        ruta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ruta.destino.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtrados = filtrados.filter(ruta => ruta.estado === statusFilter);
    }

    setFilteredRutas(filtrados);
  };

  const handleAgregarRuta = async () => {
    if (!nuevaRuta.origen || !nuevaRuta.destino || nuevaRuta.precio_base <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const rutaNueva = await databaseService.agregarRuta({
        origen: nuevaRuta.origen,
        destino: nuevaRuta.destino,
        distancia: nuevaRuta.distancia,
        duracion: nuevaRuta.duracion,
        precio_base: nuevaRuta.precio_base,
        estado: 'activa',
        descripcion: nuevaRuta.descripcion
      });

      setRutas([...rutas, rutaNueva]);
      setNuevaRuta({
        origen: '',
        destino: '',
        distancia: 0,
        duracion: 0,
        precio_base: 0,
        descripcion: ''
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error agregando ruta:', error);
      alert('Error al agregar la ruta');
    }
  };

  const handleAgregarViaje = async () => {
    if (!selectedRutaForViaje || !nuevoViaje.fecha_salida || !nuevoViaje.hora_salida || !nuevoViaje.bus_placa) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const viajeNuevo = await databaseService.agregarViaje({
        ruta_id: selectedRutaForViaje.id,
        ruta: `${selectedRutaForViaje.origen} - ${selectedRutaForViaje.destino}`,
        fecha_salida: nuevoViaje.fecha_salida,
        hora_salida: nuevoViaje.hora_salida,
        fecha_llegada: nuevoViaje.fecha_salida, // Simplificado
        hora_llegada: '16:00', // Simplificado
        bus_placa: nuevoViaje.bus_placa,
        capacidad: nuevoViaje.capacidad,
        asientos_disponibles: nuevoViaje.capacidad,
        precio: nuevoViaje.precio || selectedRutaForViaje.precio_base,
        estado: 'programado'
      });

      setViajes([...viajes, viajeNuevo]);
      
      // Actualizar viajes disponibles en la ruta
      setRutas(rutas.map(r => 
        r.id === selectedRutaForViaje.id 
          ? { ...r, viajes_disponibles: r.viajes_disponibles + 1 }
          : r
      ));

      setNuevoViaje({
        fecha_salida: '',
        hora_salida: '',
        bus_placa: '',
        capacidad: 50,
        precio: 0
      });
      setShowViajeModal(false);
      setSelectedRutaForViaje(null);
    } catch (error) {
      console.error('Error agregando viaje:', error);
      alert('Error al agregar el viaje');
    }
  };

  const handleEditarRuta = (ruta: Ruta) => {
    setSelectedRuta(ruta);
    setShowModal(true);
  };

  const handleEliminarRuta = async (ruta: Ruta) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
      try {
        const success = await databaseService.eliminarRuta(ruta.id);
        if (success) {
          setRutas(rutas.filter(r => r.id !== ruta.id));
        } else {
          alert('Error al eliminar la ruta');
        }
      } catch (error) {
        console.error('Error eliminando ruta:', error);
        alert('Error al eliminar la ruta');
      }
    }
  };

  const handleVerViajes = (ruta: Ruta) => {
    setSelectedRutaForViaje(ruta);
    setShowViajeModal(true);
  };

  const getViajesDeRuta = (rutaId: number) => {
    return viajes.filter(v => v.ruta_id === rutaId);
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
          Gestión de Rutas
        </h1>
        <p className="text-gray-600">
          Administra las rutas disponibles y sus viajes programados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rutas</p>
              <p className="text-2xl font-bold text-azul-oscuro">{rutas.length}</p>
            </div>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rutas Activas</p>
              <p className="text-2xl font-bold text-green-600">
                {rutas.filter(r => r.estado === 'activa').length}
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
              <p className="text-sm font-medium text-gray-600">Total Viajes</p>
              <p className="text-2xl font-bold text-azul-oscuro">{viajes.length}</p>
            </div>
            <div className="bg-orange-500 bg-opacity-10 p-3 rounded-full">
              <Bus className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pasajes</p>
              <p className="text-2xl font-bold text-azul-oscuro">
                {rutas.reduce((sum, r) => sum + r.pasajes_vendidos, 0)}
              </p>
            </div>
            <div className="bg-purple-500 bg-opacity-10 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="bg-azul-oscuro text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Nueva Ruta
        </button>
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
                placeholder="Código, origen, destino..."
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
              <option value="todos">Todas las rutas</option>
              <option value="activa">Activas</option>
              <option value="inactiva">Inactivas</option>
            </select>
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
                  Distancia/Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Viajes/Pasajes
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
              {filteredRutas.map((ruta) => (
                <tr key={ruta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{ruta.codigo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ruta.origen} → {ruta.destino}
                      </div>
                      <div className="text-sm text-gray-500">{ruta.descripcion}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ruta.distancia} km</div>
                      <div className="text-sm text-gray-500">{ruta.duracion} horas</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      S/. {typeof ruta.precio_base === 'number' && !isNaN(ruta.precio_base)
                        ? ruta.precio_base.toFixed(2)
                        : Number(ruta.precio_base || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ruta.viajes_disponibles} viajes
                      </div>
                      <div className="text-sm text-gray-500">
                        {ruta.pasajes_vendidos} pasajes
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ruta.estado === 'activa' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {ruta.estado === 'activa' ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                      {ruta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerViajes(ruta)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver viajes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditarRuta(ruta)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar ruta"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminarRuta(ruta)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar ruta"
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

      {/* Modal para agregar/editar ruta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-azul-oscuro">
                {selectedRuta ? 'Editar Ruta' : 'Agregar Nueva Ruta'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRuta(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  value={selectedRuta ? selectedRuta.origen : nuevaRuta.origen}
                  onChange={(e) => selectedRuta 
                    ? setSelectedRuta({...selectedRuta, origen: e.target.value})
                    : setNuevaRuta({...nuevaRuta, origen: e.target.value})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="Ej: Lima"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  value={selectedRuta ? selectedRuta.destino : nuevaRuta.destino}
                  onChange={(e) => selectedRuta 
                    ? setSelectedRuta({...selectedRuta, destino: e.target.value})
                    : setNuevaRuta({...nuevaRuta, destino: e.target.value})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="Ej: Trujillo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distancia (km) *
                </label>
                <input
                  type="number"
                  value={selectedRuta ? selectedRuta.distancia : nuevaRuta.distancia}
                  onChange={(e) => selectedRuta 
                    ? setSelectedRuta({...selectedRuta, distancia: Number(e.target.value)})
                    : setNuevaRuta({...nuevaRuta, distancia: Number(e.target.value)})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="560"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas) *
                </label>
                <input
                  type="number"
                  value={selectedRuta ? selectedRuta.duracion : nuevaRuta.duracion}
                  onChange={(e) => selectedRuta 
                    ? setSelectedRuta({...selectedRuta, duracion: Number(e.target.value)})
                    : setNuevaRuta({...nuevaRuta, duracion: Number(e.target.value)})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Base (S/.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedRuta ? selectedRuta.precio_base : nuevaRuta.precio_base}
                  onChange={(e) => selectedRuta 
                    ? setSelectedRuta({...selectedRuta, precio_base: Number(e.target.value)})
                    : setNuevaRuta({...nuevaRuta, precio_base: Number(e.target.value)})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="85.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={selectedRuta ? selectedRuta.descripcion || '' : nuevaRuta.descripcion}
                  onChange={(e) => selectedRuta 
                    ? setSelectedRuta({...selectedRuta, descripcion: e.target.value})
                    : setNuevaRuta({...nuevaRuta, descripcion: e.target.value})
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="Descripción de la ruta"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRuta(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarRuta}
                className="px-4 py-2 bg-azul-oscuro text-white rounded-lg hover:bg-primary-700"
              >
                {selectedRuta ? 'Actualizar' : 'Agregar'} Ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar viaje */}
      {showViajeModal && selectedRutaForViaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-azul-oscuro">
                Agregar Viaje a: {selectedRutaForViaje.origen} → {selectedRutaForViaje.destino}
              </h3>
              <button
                onClick={() => {
                  setShowViajeModal(false);
                  setSelectedRutaForViaje(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Salida *
                </label>
                <input
                  type="date"
                  value={nuevoViaje.fecha_salida}
                  onChange={(e) => setNuevoViaje({...nuevoViaje, fecha_salida: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Salida *
                </label>
                <input
                  type="time"
                  value={nuevoViaje.hora_salida}
                  onChange={(e) => setNuevoViaje({...nuevoViaje, hora_salida: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa del Bus *
                </label>
                <input
                  type="text"
                  value={nuevoViaje.bus_placa}
                  onChange={(e) => setNuevoViaje({...nuevoViaje, bus_placa: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="ABC-123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad
                </label>
                <input
                  type="number"
                  value={nuevoViaje.capacidad}
                  onChange={(e) => setNuevoViaje({...nuevoViaje, capacidad: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (S/.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoViaje.precio}
                  onChange={(e) => setNuevoViaje({...nuevoViaje, precio: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
                  placeholder={selectedRutaForViaje.precio_base.toString()}
                />
              </div>
            </div>

            {/* Lista de viajes existentes */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Viajes Existentes</h4>
              <div className="space-y-2">
                {getViajesDeRuta(selectedRutaForViaje.id).map((viaje) => (
                  <div key={viaje.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{viaje.codigo}</div>
                      <div className="text-sm text-gray-500">
                        {viaje.fecha_salida} {viaje.hora_salida} - Bus: {viaje.bus_placa}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">S/. {viaje.precio.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{viaje.asientos_disponibles} asientos disponibles</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowViajeModal(false);
                  setSelectedRutaForViaje(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarViaje}
                className="px-4 py-2 bg-azul-oscuro text-white rounded-lg hover:bg-primary-700"
              >
                Agregar Viaje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
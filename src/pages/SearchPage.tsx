import React, { useState, useEffect } from 'react';
import { SearchForm } from '../components/SearchForm';
import { databaseService, Viaje } from '../services/databaseService';
import { northernRoutes } from '../data/routes';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bus, 
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SearchPage() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origen: '',
    destino: '',
    fecha: '',
    pasajeros: 1 // valor por defecto
  });
  const navigate = useNavigate();

  // Agregar función para normalizar los viajes recibidos del backend
  function normalizarViaje(viaje: any) {
    return {
      ...viaje,
      precio: Number(viaje.costo_referencial ?? viaje.precio ?? 0),
      capacidad: viaje.num_asientos ?? viaje.capacidad ?? 0,
      ruta: viaje.origen && viaje.destino ? `${viaje.origen} - ${viaje.destino}` : (viaje.ruta || ''),
      bus_placa: viaje.placa ?? viaje.bus_placa ?? '',
      asientos_disponibles: viaje.asientos_disponibles ?? viaje.num_asientos ?? 0,
      hora_salida: viaje.fecha_hora_salida ? new Date(viaje.fecha_hora_salida).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : (viaje.hora_salida || ''),
      hora_llegada: viaje.fecha_hora_llegada_estimada ? new Date(viaje.fecha_hora_llegada_estimada).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : (viaje.hora_llegada || ''),
      fecha_salida: viaje.fecha_hora_salida ? viaje.fecha_hora_salida.split('T')[0] : (viaje.fecha_salida || ''),
      fecha_llegada: viaje.fecha_hora_llegada_estimada ? viaje.fecha_hora_llegada_estimada.split('T')[0] : (viaje.fecha_llegada || ''),
      origen: viaje.origen ?? (viaje.ruta ? viaje.ruta.split(' - ')[0] : ''),
      destino: viaje.destino ?? (viaje.ruta ? viaje.ruta.split(' - ')[1] : ''),
      fabricante: viaje.fabricante ?? 'Desconocido',
    };
  }

  // Mostrar todos los viajes al cargar la página
  useEffect(() => {
    const fetchAllViajes = async () => {
      setIsLoading(true);
      try {
        const resultados = await databaseService.buscarViajes(); // sin filtros
        setViajes(resultados.map(normalizarViaje));
      } catch (error) {
        setViajes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllViajes();
  }, []);

  const handleSearch = async (params: { origen: string; destino: string; fecha: string }) => {
    setIsLoading(true);
    setSearchParams({ ...params, pasajeros: searchParams.pasajeros || 1 });
    
    try {
      const resultados = await databaseService.buscarViajes(
        params.origen || undefined,
        params.destino || undefined,
        params.fecha || undefined
      );
      setViajes(resultados.map(normalizarViaje));
    } catch (error) {
      console.error('Error buscando viajes:', error);
      setViajes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComprar = (viaje: any) => {
    // Normalizar fechas para evitar errores en BookingPage
    let fecha_hora_salida = '';
    let fecha_hora_llegada_estimada = '';
    if (viaje.fecha_salida && viaje.hora_salida) {
      fecha_hora_salida = `${viaje.fecha_salida}T${viaje.hora_salida.length === 5 ? viaje.hora_salida + ':00' : viaje.hora_salida}`;
    } else if (viaje.fecha_hora_salida) {
      fecha_hora_salida = viaje.fecha_hora_salida;
    }
    if (viaje.fecha_llegada && viaje.hora_llegada) {
      fecha_hora_llegada_estimada = `${viaje.fecha_llegada}T${viaje.hora_llegada.length === 5 ? viaje.hora_llegada + ':00' : viaje.hora_llegada}`;
    } else if (viaje.fecha_hora_llegada_estimada) {
      fecha_hora_llegada_estimada = viaje.fecha_hora_llegada_estimada;
    }

    const viajeMapped = {
      codigo: viaje.codigo || viaje.id,
      fecha_hora_salida,
      fecha_hora_llegada_estimada,
      estado: viaje.estado,
      ruta: {
        codigo: viaje.ruta_id || 0,
        origen: viaje.origen || (viaje.ruta ? viaje.ruta.split(' - ')[0] : ''),
        destino: viaje.destino || (viaje.ruta ? viaje.ruta.split(' - ')[1] : ''),
        costo_referencial: viaje.precio,
      },
      bus: {
        codigo: viaje.id,
        placa: viaje.bus_placa,
        fabricante: viaje.fabricante || 'Desconocido',
        num_asientos: viaje.capacidad,
        estado: 'Operativo'
      },
      chofer: {
        codigo: 1,
        nombre: 'Chofer',
        apellidos: '',
        dni: '',
        direccion: '',
        telefono: '',
        email: '',
        cargo: '',
        area: ''
      },
      asientos_disponibles: viaje.asientos_disponibles
    };
    navigate('/booking', { state: { viaje: viajeMapped, filters: searchParams } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'text-green-600 bg-green-100';
      case 'en_curso':
        return 'text-blue-600 bg-blue-100';
      case 'completado':
        return 'text-gray-600 bg-gray-100';
      case 'cancelado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-azul-oscuro">
            Buscar Pasajes
          </h1>
          <p className="text-gray-600 mt-2">
            Encuentra y reserva tus pasajes de bus de manera fácil y rápida
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <SearchForm onSearch={handleSearch} />
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-oscuro"></div>
            </div>
          ) : viajes.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-azul-oscuro">
                  Viajes Disponibles
                </h2>
                <span className="text-gray-600">
                  {viajes.length} resultado{viajes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-6">
                {viajes.map((viaje) => (
                  <div key={viaje.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Información principal */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-azul-oscuro mb-2">
                              {viaje.ruta}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>Viaje directo</span>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{formatDate(viaje.fecha_salida)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{viaje.hora_salida} - {viaje.hora_llegada}</span>
                              </div>
                              <div className="flex items-center">
                                <Bus className="w-4 h-4 mr-1" />
                                <span>Bus: {viaje.bus_placa}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-azul-oscuro">
                              S/. {typeof viaje.precio === 'number' ? viaje.precio.toFixed(2) : 'S/N'}
                            </div>
                            <div className="text-sm text-gray-500">por pasaje</div>
                          </div>
                        </div>

                        {/* Detalles adicionales */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {viaje.asientos_disponibles}
                              </div>
                              <div className="text-xs text-gray-500">Asientos disponibles</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {viaje.capacidad - viaje.asientos_disponibles}
                              </div>
                              <div className="text-xs text-gray-500">Ocupados</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {Math.round(((viaje.capacidad - viaje.asientos_disponibles) / viaje.capacidad) * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">Ocupación</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(viaje.estado)}`}>
                              {viaje.estado}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="lg:ml-6 mt-4 lg:mt-0">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleComprar(viaje)}
                            disabled={viaje.asientos_disponibles === 0}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                              viaje.asientos_disponibles > 0
                                ? 'bg-azul-oscuro text-white hover:bg-primary-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {viaje.asientos_disponibles > 0 ? 'Comprar' : 'Sin disponibilidad'}
                          </button>
                          <button className="px-6 py-2 border border-azul-oscuro text-azul-oscuro rounded-lg hover:bg-azul-oscuro hover:text-white transition-colors">
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : searchParams.origen || searchParams.destino || searchParams.fecha ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron viajes
              </h3>
              <p className="text-gray-600 mb-6">
                No hay viajes disponibles con los criterios de búsqueda especificados.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Intenta con otras fechas</p>
                <p>• Verifica el origen y destino</p>
                <p>• Considera rutas alternativas</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Busca tu destino
              </h3>
              <p className="text-gray-600">
                Completa el formulario de búsqueda para encontrar viajes disponibles.
              </p>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {viajes.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Información Importante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Presenta tu DNI al momento del abordaje</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Llega 30 minutos antes de la hora de salida</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Equipaje máximo 20kg por pasajero</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Cancelaciones hasta 2 horas antes del viaje</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
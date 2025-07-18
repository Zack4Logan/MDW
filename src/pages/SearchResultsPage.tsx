import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, CreditCard, Star, Gift } from 'lucide-react';
import { SearchFilters, Viaje } from '../types';
import { Promotion } from '../data/promotions';
import { databaseService } from '../services/databaseService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const filters = location.state?.filters as SearchFilters;
  const selectedPromotion = location.state?.selectedPromotion as Promotion;

  useEffect(() => {
    if (!filters) {
      navigate('/search');
      return;
    }

    // Buscar viajes reales en la base de datos
    const buscarViajesReales = async () => {
      setLoading(true);
      try {
        console.log('🔍 Buscando viajes en BD:', filters);
        const viajesReales = await databaseService.buscarViajes(
          filters.origen,
          filters.destino,
          filters.fecha
        );
        
        console.log('✅ Viajes encontrados:', viajesReales);
        
        // Mapear los datos de la BD al formato esperado por el frontend
        const viajesMapeados = viajesReales.map((viaje: any) => ({
          codigo: Number(String(viaje.codigo).replace(/\D/g, '')),
          fecha_hora_salida: viaje.fecha_hora_salida,
          fecha_hora_llegada_estimada: viaje.fecha_hora_llegada_estimada,
          estado: viaje.estado,
          ruta: {
            codigo: Number(viaje.ruta_codigo),
            origen: viaje.origen,
            destino: viaje.destino,
            costo_referencial: selectedPromotion ? selectedPromotion.discountedPrice : viaje.costo_referencial
          },
          bus: {
            codigo: Number(viaje.bus_codigo),
            placa: viaje.placa,
            fabricante: viaje.fabricante,
            num_asientos: viaje.num_asientos,
            estado: 'Operativo'
          },
          chofer: {
            codigo: viaje.codigo, // Usar el código del viaje como referencia
            nombre: viaje.chofer_nombre?.split(' ')[0] || 'Chofer',
            apellidos: viaje.chofer_nombre?.split(' ').slice(1).join(' ') || 'Asignado',
            dni: '12345678',
            direccion: 'Lima',
            telefono: '999999999',
            email: 'chofer@norteexpreso.com',
            cargo: 'Chofer',
            area: 'Operaciones'
          },
          asientos_disponibles: viaje.asientos_disponibles
        }));
        
        setViajes(viajesMapeados);
      } catch (error) {
        console.error('❌ Error buscando viajes:', error);
        setViajes([]);
      } finally {
        setLoading(false);
      }
    };

    buscarViajesReales();
  }, [filters, navigate, selectedPromotion]);

  const handleSelectViaje = (viaje: Viaje) => {
    // Forzar que el código sea numérico
    const viajeConCodigoNumerico = { ...viaje, codigo: Number(viaje.codigo) };
    navigate('/booking', { state: { viaje: viajeConCodigoNumerico, filters, selectedPromotion } });
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return format(date, 'HH:mm', { locale: es });
  };

  const formatDuration = (salida: string, llegada: string) => {
    const start = new Date(salida);
    const end = new Date(llegada);
    const diffHours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${diffHours}h`;
  };

  const getBusFeatures = (fabricante: string) => {
    const features = {
      'Mercedes Benz': ['WiFi Premium', 'Asientos Reclinables', 'Aire Acondicionado', 'Entretenimiento'],
      'Scania': ['WiFi Gratis', 'Asientos Cómodos', 'Baño a Bordo', 'Snack Incluido'],
      'Volvo': ['WiFi Ultra', 'Asientos Premium', 'Climatización', 'Servicio VIP']
    };
    return features[fabricante as keyof typeof features] || ['WiFi', 'Comodidad', 'Seguridad'];
  };

  if (!filters) {
    return null;
  }

  return (
    <div className="min-h-screen bg-blanco-crema dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-azul-oscuro dark:text-white mb-2">
                  {filters.origen} → {filters.destino}
                </h1>
                <p className="text-gris-suave dark:text-gray-400">
                  {format(new Date(filters.fecha), 'EEEE, d MMMM yyyy', { locale: es })} • {filters.pasajeros} {filters.pasajeros === 1 ? 'pasajero' : 'pasajeros'}
                </p>
                {selectedPromotion && (
                  <div className="mt-2 inline-flex items-center bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm">
                    <Gift className="h-4 w-4 mr-1" />
                    Promoción aplicada: {selectedPromotion.title}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate('/search')}
                className="bg-azul-oscuro dark:bg-amarillo-dorado text-white dark:text-azul-oscuro px-6 py-2 rounded-lg hover:bg-primary-600 dark:hover:bg-yellow-500 transition-colors"
              >
                Modificar búsqueda
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-oscuro dark:border-amarillo-dorado mx-auto mb-4"></div>
              <p className="text-gris-suave dark:text-gray-400">Buscando los mejores viajes al norte...</p>
            </div>
          )}

          {/* Results */}
          {!loading && viajes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-azul-oscuro dark:text-white">
                  {viajes.length} viajes encontrados
                </h2>
                <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white">
                  <option>Ordenar por horario</option>
                  <option>Ordenar por precio</option>
                  <option>Ordenar por duración</option>
                </select>
              </div>

              {viajes.map((viaje, index) => (
                <div key={viaje.codigo} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                      {/* Horarios */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-azul-oscuro dark:text-white">
                              {formatTime(viaje.fecha_hora_salida)}
                            </div>
                            <div className="text-sm text-gris-suave dark:text-gray-400">
                              {viaje.ruta.origen}
                            </div>
                          </div>
                          
                          <div className="flex-1 relative">
                            <div className="border-t-2 border-gray-300 dark:border-gray-600 relative">
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amarillo-dorado text-azul-oscuro text-xs px-2 py-1 rounded-full font-medium">
                                {formatDuration(viaje.fecha_hora_salida, viaje.fecha_hora_llegada_estimada)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-azul-oscuro dark:text-white">
                              {formatTime(viaje.fecha_hora_llegada_estimada)}
                            </div>
                            <div className="text-sm text-gris-suave dark:text-gray-400">
                              {viaje.ruta.destino}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gris-suave dark:text-gray-400 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {viaje.bus.fabricante} - {viaje.bus.placa}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {viaje.asientos_disponibles} asientos disponibles
                          </div>
                        </div>

                        {/* Bus Features */}
                        <div className="flex flex-wrap gap-2">
                          {getBusFeatures(viaje.bus.fabricante).map((feature, i) => (
                            <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full">
                              ✓ {feature}
                            </span>
                          ))}
                        </div>

                        {/* Promotion indicator */}
                        {selectedPromotion && index === 0 && (
                          <div className="mt-3 flex items-center text-sm text-red-600 dark:text-red-400">
                            <Gift className="h-4 w-4 mr-1" />
                            Precio promocional aplicado
                          </div>
                        )}
                      </div>

                      {/* Precio */}
                      <div className="text-center lg:text-right">
                        {selectedPromotion && index === 0 ? (
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              S/ {selectedPromotion.originalPrice.toFixed(2)}
                            </div>
                            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                              S/ {viaje.ruta.costo_referencial.toFixed(2)}
                            </div>
                            <div className="text-sm bg-red-100 dark:bg-red-900/20 text-re d-800 dark:text-red-400 px-2 py-1 rounded-full inline-block">
                              -{selectedPromotion.discount}% OFF
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl font-bold text-azul-oscuro dark:text-white mb-1">
                              S/ {viaje.ruta.costo_referencial.toFixed(2)}
                            </div>
                            <div className="text-sm text-gris-suave dark:text-gray-400">
                              por pasajero
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botón */}
                      <div className="text-center lg:text-right">
                        <button
                          onClick={() => handleSelectViaje(viaje)}
                          className="w-full lg:w-auto bg-amarillo-dorado text-azul-oscuro px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2"
                        >
                          <CreditCard className="h-5 w-5" />
                          <span>Seleccionar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && viajes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold text-azul-oscuro dark:text-white mb-2">
                No hay viajes disponibles
              </h3>
              <p className="text-gris-suave dark:text-gray-400 mb-6">
                No encontramos viajes para esta ruta en la fecha seleccionada.
                Intenta con otra fecha o revisa nuestras promociones especiales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/search')}
                  className="bg-azul-oscuro dark:bg-amarillo-dorado text-white dark:text-azul-oscuro px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-yellow-500 transition-colors"
                >
                  Buscar otras fechas
                </button>
                <button
                  onClick={() => navigate('/promotions')}
                  className="border border-azul-oscuro dark:border-amarillo-dorado text-az ul-oscuro dark:text-amarillo-dorado px-6 py-3 rounded-lg hover:bg-azul-oscuro hover:text-white dark:hover:bg-amarillo-dorado dark:hover:text-azul-oscuro transition-colors"
                >
                  Ver Promociones
                </button>
              </div>
            </div>
          )}
        </div>
      
      </div>
    </div>
  );
}
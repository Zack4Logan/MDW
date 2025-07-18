import React, { useState } from 'react';
import { Search, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { northernRoutes } from '../data/routes';

interface SearchFormProps {
  onSearch: (params: { origen: string; destino: string; fecha: string }) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.origen && formData.destino && formData.fecha) {
      onSearch(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  // Extraer valores únicos de origen y destino
  const origenes = Array.from(new Set(northernRoutes.map(r => r.origen)));
  const destinos = Array.from(new Set(northernRoutes.map(r => r.destino)));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Origen */}
        <div>
          <label htmlFor="origen" className="block text-sm font-medium text-gray-700 mb-2">
            Origen
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              id="origen"
              value={formData.origen}
              onChange={(e) => handleInputChange('origen', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
              required
            >
              <option value="">Selecciona origen</option>
              {origenes.map((origen) => (
                <option key={origen} value={origen}>{origen}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Destino */}
        <div>
          <label htmlFor="destino" className="block text-sm font-medium text-gray-700 mb-2">
            Destino
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              id="destino"
              value={formData.destino}
              onChange={(e) => handleInputChange('destino', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
              required
            >
              <option value="">Selecciona destino</option>
              {destinos.map((destino) => (
                <option key={destino} value={destino}>{destino}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Viaje
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              id="fecha"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              min={today}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Botón de búsqueda */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-azul-oscuro text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 font-medium"
        >
          <Search className="w-5 h-5" />
          <span>Buscar Viajes</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Consejos para tu búsqueda
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="space-y-1">
                <li>• Busca con al menos 24 horas de anticipación</li>
                <li>• Verifica la disponibilidad de asientos</li>
                <li>• Considera rutas alternativas si no hay disponibilidad</li>
                <li>• Los precios pueden variar según la demanda</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
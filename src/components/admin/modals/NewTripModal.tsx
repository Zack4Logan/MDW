import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Bus, User, Clock } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTripModal({ isOpen, onClose }: NewTripModalProps) {
  const [formData, setFormData] = useState({
    ruta_codigo: '',
    bus_codigo: '',
    chofer_codigo: '',
    fecha: '',
    hora_salida: '',
    hora_llegada: ''
  });

  const [loading, setLoading] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [buses, setBuses] = useState([]);
  const [choferes, setChoferes] = useState([]);

  // Agrega estados para mostrar formularios rápidos
  const [showNewRuta, setShowNewRuta] = useState(false);
  const [showNewBus, setShowNewBus] = useState(false);
  const [showNewChofer, setShowNewChofer] = useState(false);
  const [newRuta, setNewRuta] = useState({ origen: '', destino: '', costo_referencial: '' });
  const [newBus, setNewBus] = useState({ placa: '', fabricante: '', num_asientos: '', estado: 'Operativo' });
  const [newChofer, setNewChofer] = useState({ nombre: '', apellidos: '', dni: '', licencia: '', sexo: 'M' });

  // Cargar datos necesarios para el formulario
  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('norteexpreso_token');
      
      // Cargar rutas
      const rutasResponse = await fetch('http://localhost:3001/api/rutas');
      if (rutasResponse.ok) {
        const rutasData = await rutasResponse.json();
        setRutas(rutasData);
      }

      // Cargar buses
      const busesResponse = await fetch('http://localhost:3001/api/admin/buses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (busesResponse.ok) {
        const busesData = await busesResponse.json();
        setBuses(busesData.filter(bus => bus.estado === 'Operativo'));
      }

      // Cargar choferes
      const choferesResponse = await fetch('http://localhost:3001/api/admin/choferes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (choferesResponse.ok) {
        const choferesData = await choferesResponse.json();
        setChoferes(choferesData);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('norteexpreso_token');
      
      // Combinar fecha y hora para crear datetime
      const fecha_hora_salida = `${formData.fecha} ${formData.hora_salida}:00`;
      const fecha_hora_llegada_estimada = `${formData.fecha} ${formData.hora_llegada}:00`;

      const response = await fetch('http://localhost:3001/api/admin/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ruta_codigo: parseInt(formData.ruta_codigo),
          bus_codigo: parseInt(formData.bus_codigo),
          chofer_codigo: parseInt(formData.chofer_codigo),
          fecha_hora_salida,
          fecha_hora_llegada_estimada
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('¡Viaje creado exitosamente! Los clientes ya pueden verlo y reservar.');
        onClose();
        setFormData({
          ruta_codigo: '',
          bus_codigo: '',
          chofer_codigo: '',
          fecha: '',
          hora_salida: '',
          hora_llegada: ''
        });
        // Recargar la página para actualizar las estadísticas
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creando viaje:', error);
      alert('Error al crear el viaje. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-azul-oscuro" />
              Programar Nuevo Viaje
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Ruta *
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.ruta_codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ruta_codigo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Seleccionar ruta</option>
                    {rutas.map(ruta => (
                      <option key={ruta.codigo} value={ruta.codigo}>
                        {ruta.origen} → {ruta.destino} (S/ {ruta.costo_referencial})
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewRuta(true)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-700 font-bold">+</button>
                </div>
                {showNewRuta && (
                  <div className="bg-white border p-4 rounded-lg mt-2">
                    <h4 className="font-bold mb-2">Nueva Ruta</h4>
                    <input type="text" placeholder="Origen" value={newRuta.origen} onChange={e => setNewRuta(r => ({ ...r, origen: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="text" placeholder="Destino" value={newRuta.destino} onChange={e => setNewRuta(r => ({ ...r, destino: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="number" placeholder="Costo" value={newRuta.costo_referencial} onChange={e => setNewRuta(r => ({ ...r, costo_referencial: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={async () => {
                      if (!newRuta.origen || !newRuta.destino || Number(newRuta.costo_referencial) <= 0) {
                        alert('Completa todos los campos de la ruta');
                        return;
                      }
                      const res = await fetch('http://localhost:3001/api/rutas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRuta) });
                      if (res.ok) {
                        const ruta = await res.json();
                        setRutas(rs => [...rs, ruta]);
                        setFormData(f => ({ ...f, ruta_codigo: ruta.codigo }));
                        setShowNewRuta(false);
                        setNewRuta({ origen: '', destino: '', costo_referencial: '' });
                      }
                    }}>Guardar</button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowNewRuta(false)}>Cancelar</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Bus className="h-4 w-4 inline mr-1" />
                  Bus *
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.bus_codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, bus_codigo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Seleccionar bus</option>
                    {buses.map(bus => (
                      <option key={bus.codigo} value={bus.codigo}>
                        {bus.placa} - {bus.fabricante} ({bus.num_asientos} asientos)
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewBus(true)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-700 font-bold">+</button>
                </div>
                {showNewBus && (
                  <div className="bg-white border p-4 rounded-lg mt-2">
                    <h4 className="font-bold mb-2">Nuevo Bus</h4>
                    <input type="text" placeholder="Placa" value={newBus.placa} onChange={e => setNewBus(b => ({ ...b, placa: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="text" placeholder="Fabricante" value={newBus.fabricante} onChange={e => setNewBus(b => ({ ...b, fabricante: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="number" placeholder="Número de Asientos" value={newBus.num_asientos} onChange={e => setNewBus(b => ({ ...b, num_asientos: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <select value={newBus.estado} onChange={e => setNewBus(b => ({ ...b, estado: e.target.value }))} className="mb-2 p-2 border rounded w-full">
                      <option value="Operativo">Operativo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Fuera de Servicio">Fuera de Servicio</option>
                    </select>
                    <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={async () => {
                      if (!newBus.placa || !newBus.fabricante || Number(newBus.num_asientos) <= 0) {
                        alert('Completa todos los campos del bus');
                        return;
                      }
                      const res = await fetch('http://localhost:3001/api/admin/buses', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('norteexpreso_token')}` }, body: JSON.stringify(newBus) });
                      if (res.ok) {
                        const bus = await res.json();
                        setBuses(bs => [...bs, bus]);
                        setFormData(f => ({ ...f, bus_codigo: bus.codigo }));
                        setShowNewBus(false);
                        setNewBus({ placa: '', fabricante: '', num_asientos: '', estado: 'Operativo' });
                      }
                    }}>Guardar</button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowNewBus(false)}>Cancelar</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Chofer *
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.chofer_codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, chofer_codigo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Seleccionar chofer</option>
                    {choferes.map(chofer => (
                      <option key={chofer.codigo} value={chofer.codigo}>
                        {chofer.nombre_completo} - {chofer.licencia}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowNewChofer(true)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-700 font-bold">+</button>
                </div>
                {showNewChofer && (
                  <div className="bg-white border p-4 rounded-lg mt-2">
                    <h4 className="font-bold mb-2">Nuevo Chofer</h4>
                    <input type="text" placeholder="Nombre" value={newChofer.nombre} onChange={e => setNewChofer(c => ({ ...c, nombre: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="text" placeholder="Apellidos" value={newChofer.apellidos} onChange={e => setNewChofer(c => ({ ...c, apellidos: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="text" placeholder="DNI" value={newChofer.dni} onChange={e => setNewChofer(c => ({ ...c, dni: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <input type="text" placeholder="Licencia" value={newChofer.licencia} onChange={e => setNewChofer(c => ({ ...c, licencia: e.target.value }))} className="mb-2 p-2 border rounded w-full" />
                    <select value={newChofer.sexo} onChange={e => setNewChofer(c => ({ ...c, sexo: e.target.value }))} className="mb-2 p-2 border rounded w-full">
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                    <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={async () => {
                      if (!newChofer.nombre || !newChofer.apellidos || !newChofer.dni || !newChofer.licencia) {
                        alert('Completa todos los campos del chofer');
                        return;
                      }
                      const res = await fetch('http://localhost:3001/api/admin/choferes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('norteexpreso_token')}` }, body: JSON.stringify(newChofer) });
                      if (res.ok) {
                        const chofer = await res.json();
                        setChoferes(cs => [...cs, chofer]);
                        setFormData(f => ({ ...f, chofer_codigo: chofer.codigo }));
                        setShowNewChofer(false);
                        setNewChofer({ nombre: '', apellidos: '', dni: '', licencia: '', sexo: 'M' });
                      }
                    }}>Guardar</button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowNewChofer(false)}>Cancelar</button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Hora de Salida *
                </label>
                <input
                  type="time"
                  value={formData.hora_salida}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_salida: e.target.value }))}
                  
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Hora de Llegada *
                </label>
                <input
                  type="time"
                  value={formData.hora_llegada}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_llegada: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-azul-oscuro focus:border-azul-oscuro dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Información importante
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• El viaje será visible inmediatamente para los clientes</li>
                <li>• Se verificará que el bus y chofer estén disponibles</li>
                <li>• Los asientos estarán disponibles para reserva</li>
                <li>• El estado inicial será "Programado"</li>
              </ul>
            </div>

            

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover: bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-azul-oscuro text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <span>Crear Viaje</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
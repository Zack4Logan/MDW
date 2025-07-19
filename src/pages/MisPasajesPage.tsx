//Commit visual

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MisPasajesPage = () => {
  const { customerUser, token } = useAuth();
  const [pasajes, setPasajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    if (!customerUser) return;
    setLoading(true);
    axios.get(`/api/pasajes/cliente/${customerUser.codigo}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setPasajes(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los pasajes');
        setLoading(false);
      });
  }, [customerUser, token]);

  const cancelarPasaje = async (pasajeId) => {
    if (!window.confirm('¿Seguro que deseas cancelar este pasaje?')) return;
    setCancelando(pasajeId);
    try {
      await axios.put(`/api/pasajes/cancelar/${pasajeId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasajes(pasajes => pasajes.map(p => p.codigo === pasajeId ? { ...p, estado: 'Cancelado' } : p));
    } catch {
      alert('No se pudo cancelar el pasaje');
    }
    setCancelando(null);
  };

  if (!customerUser) return <div className="p-8">Debes iniciar sesión para ver tus pasajes.</div>;
  if (loading) return <div className="p-8">Cargando pasajes...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Mis Pasajes</h2>
      {pasajes.length === 0 ? (
        <div>No tienes pasajes comprados.</div>
      ) : (
        <div className="space-y-4">
          {pasajes.map(p => (
            <div key={p.codigo} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 shadow">
              <div>
                <div className="font-semibold">{p.origen} → {p.destino}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Salida: {new Date(p.fecha_hora_salida).toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Asiento: {p.asiento}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Estado: <span className={p.estado === 'Cancelado' ? 'text-red-500' : 'text-green-600'}>{p.estado}</span></div>
              </div>
              {p.estado === 'Vendido' && (
                <button
                  className="mt-4 md:mt-0 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  onClick={() => cancelarPasaje(p.codigo)}
                  disabled={cancelando === p.codigo}
                >
                  {cancelando === p.codigo ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPasajesPage; 
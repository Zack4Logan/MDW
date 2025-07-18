import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Bus, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Users, 
  FileText, 
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  ArrowRight
} from 'lucide-react';

export function AdminHomePage() {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const [reportes, setReportes] = useState<any>(null);

  useEffect(() => {
    const fetchReportes = async () => {
      const token = localStorage.getItem('norteexpreso_token');
      const response = await fetch('http://localhost:3001/api/dashboard/estadisticas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportes(data);
      }
    };
    fetchReportes();
  }, []);

  const features = [
    {
      title: 'Gestión de Rutas',
      description: 'Crea y administra rutas con precios, horarios y disponibilidad',
      icon: MapPin,
      href: '/admin/dashboard/rutas',
      color: 'bg-blue-500'
    },
    {
      title: 'Programación de Viajes',
      description: 'Programa viajes específicos con buses y choferes asignados',
      icon: Calendar,
      href: '/admin/dashboard/viajes',
      color: 'bg-green-500'
    },
    {
      title: 'Gestión de Buses',
      description: 'Administra la flota de buses, mantenimiento y capacidad',
      icon: Bus,
      href: '/admin/dashboard/buses',
      color: 'bg-purple-500'
    },
    {
      title: 'Control de Pasajes',
      description: 'Monitorea ventas, reservas y estado de los pasajes',
      icon: CreditCard,
      href: '/admin/dashboard/pasajes',
      color: 'bg-orange-500'
    },
    {
      title: 'Gestión de Personal',
      description: 'Administra choferes, empleados y permisos del sistema',
      icon: Users,
      href: '/admin/dashboard/personal',
      color: 'bg-indigo-500'
    },
    {
      title: 'Reportes y Análisis',
      description: 'Genera reportes detallados de ventas y rendimiento',
      icon: FileText,
      href: '/admin/dashboard/reportes',
      color: 'bg-red-500'
    }
  ];

  const stats = [
    { label: 'Rutas Activas', value: '12', change: '+2', changeType: 'positive' },
    { label: 'Viajes Hoy', value: '8', change: '+1', changeType: 'positive' },
    { label: 'Pasajes Vendidos', value: '156', change: '+23', changeType: 'positive' },
    { label: 'Ingresos del Mes', value: 'S/. 45,230', change: '+12%', changeType: 'positive' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {adminUser.nombre_completo}
              </h1>
              <p className="text-gray-600 mt-2">
                Panel de administración de NORTEEXPRESO
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver sitio principal
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  window.location.href = '/admin/login';
                }}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/dashboard/rutas"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Agregar Nueva Ruta</h3>
                <p className="text-sm text-gray-500">Crear ruta con origen y destino</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
            
            <Link
              to="/admin/dashboard/viajes"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Programar Viaje</h3>
                <p className="text-sm text-gray-500">Asignar bus y chofer</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
            
            <Link
              to="/admin/dashboard/reportes"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-6 h-6 text-orange-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Generar Reporte</h3>
                <p className="text-sm text-gray-500">Análisis de ventas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.href}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow group"
            >
              <div className="flex items-center mb-4">
                <div className={`${feature.color} p-3 rounded-lg mr-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>Acceder</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* System Info */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-blue-900">Información del Sistema</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p><strong>Usuario:</strong> {adminUser.usuario}</p>
              <p><strong>Tipo:</strong> {adminUser.tipo_usuario}</p>
            </div>
            <div>
              <p><strong>Email:</strong> {adminUser.email}</p>
              <p><strong>Último acceso:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Reportes de Ventas de Viajes */}
        <div className="mt-8 bg-white rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Reportes de Ventas de Viajes</h2>
          {!reportes ? (
            <div className="p-8">Cargando reportes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-azul-oscuro mb-2">Ventas del día</h3>
                <p className="text-2xl font-bold">{reportes.ventas_hoy.pasajeros} pasajes</p>
                <p className="text-green-600 font-bold">S/ {reportes.ventas_hoy.ingresos.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-azul-oscuro mb-2">Ventas del mes</h3>
                <p className="text-2xl font-bold">{reportes.ventas_mes.pasajeros} pasajes</p>
                <p className="text-green-600 font-bold">S/ {reportes.ventas_mes.ingresos.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-azul-oscuro mb-2">Buses operativos</h3>
                <p className="text-2xl font-bold">{reportes.buses_operativos}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
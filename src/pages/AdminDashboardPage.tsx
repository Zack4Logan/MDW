import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Bus, 
  Users, 
  MapPin, 
  Calendar, 
  CreditCard,
  Settings,
  TrendingUp,
  Clock,
  Shield,
  Home,
  FileText,
  Gamepad2,
  LogOut,
  User,
  Bell,
  Search,
  Plus
} from 'lucide-react';

// Admin components
import { AdminHomePage } from './AdminHomePage';
import { AdminOverview } from '../components/admin/AdminOverview';
import { ViajesManager } from '../components/admin/ViajesManager';
import { BusesManager } from '../components/admin/BusesManager';
import { RutasManager } from '../components/admin/RutasManager';
import { PasajesManager } from '../components/admin/PasajesManager';
import { PersonalManager } from '../components/admin/PersonalManager';
import { ReportsManager } from '../components/admin/ReportsManager';
import { LoyaltyGameManager } from '../components/admin/LoyaltyGameManager';

interface AdminUser {
  codigo: number;
  usuario: string;
  nombre_completo: string;
  email: string;
  tipo_usuario: string;
}

export function AdminDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (user) {
      setAdminUser(JSON.parse(user));
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Inicio', href: '/admin/dashboard', icon: BarChart3, current: location.pathname === '/admin/dashboard' },
    { name: 'Rutas', href: '/admin/dashboard/rutas', icon: MapPin, current: location.pathname === '/admin/dashboard/rutas' },
    { name: 'Viajes', href: '/admin/dashboard/viajes', icon: Calendar, current: location.pathname === '/admin/dashboard/viajes' },
    { name: 'Buses', href: '/admin/dashboard/buses', icon: Bus, current: location.pathname === '/admin/dashboard/buses' },
    { name: 'Pasajes', href: '/admin/dashboard/pasajes', icon: CreditCard, current: location.pathname === '/admin/dashboard/pasajes' },
    { name: 'Personal', href: '/admin/dashboard/personal', icon: Users, current: location.pathname === '/admin/dashboard/personal' },
    { name: 'Reportes', href: '/admin/dashboard/reportes', icon: FileText, current: location.pathname === '/admin/dashboard/reportes' },
    { name: 'Juego Fidelidad', href: '/admin/dashboard/loyalty-game', icon: Gamepad2, current: location.pathname === '/admin/dashboard/loyalty-game' },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center ml-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">NORTEEXPRESO</h1>
                <p className="text-sm text-gray-500">Panel Administrativo</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{adminUser.nombre_completo}</p>
                  <p className="text-xs text-gray-500">{adminUser.tipo_usuario}</p>
                </div>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 lg:flex-shrink-0`}>
          <div className="bg-white shadow-lg h-full">
            <div className="p-6">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        item.current ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Nueva Ruta
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Programar Viaje
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Generar Reporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <Routes>
                <Route path="/" element={<AdminHomePage />} />
                <Route path="/overview" element={<AdminOverview />} />
                <Route path="/rutas" element={<RutasManager />} />
                <Route path="/viajes" element={<ViajesManager />} />
                <Route path="/buses" element={<BusesManager />} />
                <Route path="/pasajes" element={<PasajesManager />} />
                <Route path="/personal" element={<PersonalManager />} />
                <Route path="/reportes" element={<ReportsManager />} />
                <Route path="/loyalty-game" element={<LoyaltyGameManager />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}
    </div>
  );
} 
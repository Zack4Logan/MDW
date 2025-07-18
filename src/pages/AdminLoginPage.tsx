import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Bus, TrendingUp, Users, FileText, User } from 'lucide-react';

export function AdminLoginPage() {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    usuario: '', password: '', nombre: '', apellidos: '', dni: '', email: '', sexo: 'M', telefono: '', direccion: '', cargo_codigo: 1
  });
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: formData.usuario,
          password: formData.password,
          type: 'admin'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.usuario));
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Error en las credenciales');
      }
    } catch (error) {
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Administrador registrado correctamente. Ahora puedes iniciar sesión.');
        setShowRegister(false);
        setRegisterData({ usuario: '', password: '', nombre: '', apellidos: '', dni: '', email: '', sexo: 'M', telefono: '', direccion: '', cargo_codigo: 1 });
      } else {
        setRegisterError(data.error || 'Error al registrar');
      }
    } catch (error) {
      setRegisterError('Error de conexión.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-8 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 rounded-full p-4 shadow-lg mb-2 animate-pop-in">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Panel Administrativo</h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm">Accede al sistema de gestión de NORTEEXPRESO</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">Usuario Administrador</label>
            <div className="relative">
              <input
                type="text"
                id="usuario"
                value={formData.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12 shadow-sm transition-all"
                placeholder="Ingresa tu usuario"
                required
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                <User className="w-5 h-5" />
              </span>
            </div>
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12 pr-12 shadow-sm transition-all"
                placeholder="Ingresa tu contraseña"
                required
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                <Eye className="w-5 h-5" />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg animate-pop-in"
          >
            {isLoading ? 'Iniciando sesión...' : 'Acceder al Panel'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Volver al sitio principal
          </button>
        </div>
        {/* Botón para mostrar el registro */}
        <div className="mt-4 text-center">
          <button onClick={() => setShowRegister(true)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            ¿No tienes cuenta? Regístrate como admin
          </button>
        </div>
        {/* Modal de registro de admin */}
        {showRegister && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative animate-pop-in">
              <button onClick={() => setShowRegister(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
              <form onSubmit={handleRegister} className="space-y-4">
                <h2 className="text-lg font-bold text-blue-900 mb-2">Registro de Administrador</h2>
                <input type="text" placeholder="Usuario" value={registerData.usuario} onChange={e => setRegisterData(d => ({ ...d, usuario: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="password" placeholder="Contraseña" value={registerData.password} onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Nombres" value={registerData.nombre} onChange={e => setRegisterData(d => ({ ...d, nombre: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Apellidos" value={registerData.apellidos} onChange={e => setRegisterData(d => ({ ...d, apellidos: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="DNI" value={registerData.dni} onChange={e => setRegisterData(d => ({ ...d, dni: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="email" placeholder="Email" value={registerData.email} onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Teléfono" value={registerData.telefono} onChange={e => setRegisterData(d => ({ ...d, telefono: e.target.value }))} className="w-full p-2 border rounded" required />
                <input type="text" placeholder="Dirección" value={registerData.direccion} onChange={e => setRegisterData(d => ({ ...d, direccion: e.target.value }))} className="w-full p-2 border rounded" required />
                <select value={registerData.sexo} onChange={e => setRegisterData(d => ({ ...d, sexo: e.target.value }))} className="w-full p-2 border rounded" required>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                <select value={registerData.cargo_codigo} onChange={e => setRegisterData(d => ({ ...d, cargo_codigo: Number(e.target.value) }))} className="w-full p-2 border rounded" required>
                  <option value={1}>Administrador</option>
                  <option value={2}>Vendedor</option>
                  <option value={3}>Supervisor</option>
                </select>
                {registerError && <div className="text-red-600 text-sm">{registerError}</div>}
                <button type="submit" disabled={registerLoading} className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-2">
                  {registerLoading ? 'Registrando...' : 'Registrar Administrador'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
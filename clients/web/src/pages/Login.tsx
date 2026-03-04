import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mapApiError } from '../api/utils/errorMapper';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#eb5d2a] rounded flex items-center justify-center font-bold text-xl text-white">L</div>
          <span className="font-semibold text-xl text-[#455362] tracking-wide">Libra Seguros</span>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-1">Iniciar sesión</h1>
          <p className="text-sm text-[#6b7280] mb-6">Ingresá con tu cuenta de Libra Legal AI</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#455362] mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] transition-all"
                placeholder="admin@libraseguros.com.ar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#455362] mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#eb5d2a]/20 focus:border-[#eb5d2a] transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-[#ef4444] bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#eb5d2a] hover:bg-[#d44e20] text-white font-medium py-2.5 rounded-md text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

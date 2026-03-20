import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="dz-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-dz-green/10 text-dz-green rounded-2xl flex items-center justify-center mx-auto">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold">مرحباً بك مجدداً</h1>
          <p className="text-gray-500 text-sm">سجل دخولك لمتابعة دروسك</p>
        </div>

        {error && (
          <div className="bg-dz-red/10 text-dz-red p-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dz-input pr-10"
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dz-input pr-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full dz-btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-dz-green font-bold hover:underline">
            أنشئ حساباً الآن
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

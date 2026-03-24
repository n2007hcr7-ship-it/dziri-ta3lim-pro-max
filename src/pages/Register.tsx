import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database'; // التعديل الجوهري هنا
import { auth, db } from '../firebase';
import { UserPlus, Mail, Lock, User, MapPin, BookOpen, UserCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher',
    city: '',
    subject: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. إنشاء الحساب (Firebase Auth)
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // 2. تحديث الاسم الشخصي
      await updateProfile(user, { displayName: formData.username });

      // 3. حفظ البيانات في Realtime Database (بدل Firestore المتعطل)
      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        city: formData.city,
        subject: formData.role === 'teacher' ? formData.subject : null,
        createdAt: new Date().toISOString()
      });

      // 4. التوجيه التلقائي
      navigate(formData.role === 'teacher' ? '/teacher-dashboard' : '/dashboard');
    } catch (err: any) {
      setError('حدث خطأ أثناء إنشاء الحساب. تأكد من بريدك الإلكتروني أو كلمة المرور.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-600 mt-2">انضم إلى منصة دزيري للتعليم</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 animate-shake">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4" /> اسم المستخدم
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" /> البريد الإلكتروني
              </label>
              <input
                required
                type="email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> كلمة المرور
            </label>
            <input
              required
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserCircle className="w-4 h-4" /> نوع الحساب
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'teacher' })}
              >
                <option value="student">طالب</option>
                <option value="teacher">أستاذ</option>
              </select>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> الولاية
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          {/* Subject (Only for Teachers) */}
          {formData.role === 'teacher' && (
            <div className="space-y-2 animate-slideDown">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> المادة المدرسة
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'إنشاء الحساب'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserPlus, Mail, Lock, User, MapPin, Phone, GraduationCap, Briefcase, AlertCircle } from 'lucide-react';
import { UserRole, EducationLevel } from '../types';

const Register: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [level, setLevel] = useState<EducationLevel>('secondary');
  const [subject, setSubject] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      const profileData: any = {
        uid: user.uid,
        fullName,
        email,
        role,
        wilaya,
        phoneNumber,
        walletBalance: 0,
        totalEarnings: 0,
        premiumPackage: 'none',
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
      };

      if (role === 'student') {
        profileData.level = level;
      } else {
        profileData.subjects = [subject];
      }

      await setDoc(doc(db, 'users', user.uid), profileData);
      navigate('/');
    } catch (err: any) {
      setError('حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="dz-card space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-dz-green/10 text-dz-green rounded-2xl flex items-center justify-center mx-auto">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-gray-500 text-sm">انضم إلى أكبر منصة تعليمية في الجزائر</p>
        </div>

        {/* Role Selector */}
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'student' ? 'bg-white text-dz-green shadow-sm' : 'text-gray-500'
            }`}
          >
            <GraduationCap size={20} />
            تلميذ
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'teacher' ? 'bg-white text-dz-green shadow-sm' : 'text-gray-500'
            }`}
          >
            <Briefcase size={20} />
            أستاذ
          </button>
        </div>

        {error && (
          <div className="bg-dz-red/10 text-dz-red p-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 mr-1">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="dz-input pr-10"
                placeholder="الاسم واللقب"
              />
            </div>
          </div>

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
            <label className="text-sm font-bold text-gray-700 mr-1">الولاية</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                required
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="dz-input pr-10 appearance-none bg-white"
              >
                <option value="">اختر الولاية</option>
                <option value="الجزائر">الجزائر</option>
                <option value="وهران">وهران</option>
                <option value="قسنطينة">قسنطينة</option>
                {/* Add more wilayas */}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 mr-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="dz-input pr-10"
                placeholder="06XXXXXXXX"
              />
            </div>
          </div>

          {role === 'student' ? (
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 mr-1">المستوى الدراسي</label>
              <select
                required
                value={level}
                onChange={(e) => setLevel(e.target.value as EducationLevel)}
                className="dz-input bg-white"
              >
                <option value="primary">ابتدائي</option>
                <option value="middle">متوسط</option>
                <option value="secondary">ثانوي</option>
                <option value="university">جامعي</option>
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 mr-1">المادة المدرسة</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="dz-input"
                placeholder="مثال: رياضيات"
              />
            </div>
          )}

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

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full dz-btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-dz-green font-bold hover:underline">
            سجل دخولك
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

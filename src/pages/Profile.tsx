import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck,
  Edit2,
  Save,
  X
} from 'lucide-react';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    wilaya: profile?.wilaya || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  const handleUpdate = async () => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="dz-card flex flex-col items-center text-center space-y-4 py-8 relative">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-dz-green/10 flex items-center justify-center text-dz-green text-4xl font-bold">
            {profile.fullName[0]}
          </div>
          {profile.premiumPackage !== 'none' && (
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1.5 rounded-full border-4 border-white">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.fullName}</h1>
          <p className="text-gray-500">{profile.role === 'teacher' ? `أستاذ ${profile.subjects?.[0]}` : `تلميذ ${profile.level}`}</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-dz-green/10 text-dz-green px-4 py-1 rounded-full text-xs font-bold">{profile.wilaya}</span>
          {profile.premiumPackage !== 'none' && (
            <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-xs font-bold">عضو {profile.premiumPackage}</span>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="dz-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">المعلومات الشخصية</h2>
          <button 
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            className={`flex items-center gap-2 text-sm font-bold ${isEditing ? 'text-dz-green' : 'text-gray-500'}`}
          >
            {isEditing ? <><Save size={18} /> حفظ</> : <><Edit2 size={18} /> تعديل</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold">الاسم الكامل</label>
            {isEditing ? (
              <input 
                type="text" 
                className="dz-input" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            ) : (
              <p className="font-bold flex items-center gap-2"><User size={16} className="text-gray-400" /> {profile.fullName}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold">البريد الإلكتروني</label>
            <p className="font-bold flex items-center gap-2 text-gray-400"><Mail size={16} /> {profile.email}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold">الولاية</label>
            {isEditing ? (
              <input 
                type="text" 
                className="dz-input" 
                value={formData.wilaya} 
                onChange={(e) => setFormData({...formData, wilaya: e.target.value})}
              />
            ) : (
              <p className="font-bold flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {profile.wilaya}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-bold">رقم الهاتف</label>
            {isEditing ? (
              <input 
                type="text" 
                className="dz-input" 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            ) : (
              <p className="font-bold flex items-center gap-2"><Phone size={16} className="text-gray-400" /> {profile.phoneNumber || 'غير مسجل'}</p>
            )}
          </div>

          {profile.role === 'student' ? (
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold">المستوى الدراسي</label>
              <p className="font-bold flex items-center gap-2"><GraduationCap size={16} className="text-gray-400" /> {profile.level}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-bold">المادة المدرسة</label>
              <p className="font-bold flex items-center gap-2"><Briefcase size={16} className="text-gray-400" /> {profile.subjects?.[0]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Specific Section */}
      {profile.role === 'teacher' && (
        <div className="dz-card space-y-4">
          <h2 className="text-lg font-bold">معلومات الدفع (CCP / Edahabia)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">رقم الحساب البريدي (CCP)</p>
              <p className="font-mono font-bold">{profile.ccp || 'لم يتم الإدخال'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">رقم البطاقة الذهبية</p>
              <p className="font-mono font-bold">{profile.edahabia || 'لم يتم الإدخال'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

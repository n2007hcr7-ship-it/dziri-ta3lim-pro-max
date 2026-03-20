import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';
import { 
  Search, 
  Video, 
  Users, 
  Star, 
  ChevronLeft,
  BookOpen,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const { profile } = useAuth();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch top teachers
    const qTeachers = query(
      collection(db, 'users'),
      where('role', '==', 'teacher'),
      orderBy('rating', 'desc'),
      limit(10)
    );
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    });

    // Fetch live sessions (assuming a collection exists or will exist)
    const qLive = query(
      collection(db, 'live_sessions'),
      where('status', '==', 'active'),
      limit(6)
    );
    const unsubLive = onSnapshot(qLive, (snapshot) => {
      setLiveSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.log("Live sessions collection might not exist yet");
      setLiveSessions([]);
    });

    return () => {
      unsubTeachers();
      unsubLive();
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-dz-green p-8 text-white">
        <div className="relative z-10 max-w-2xl space-y-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-bold leading-tight"
          >
            مستقبلك يبدأ هنا مع <br />
            <span className="text-yellow-400">دزيري تعليم</span>
          </motion.h1>
          <p className="text-dz-white/80 text-lg">
            أفضل الأساتذة الجزائريين في مكان واحد، دروس خصوصية، بث مباشر، ومتابعة يومية.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/courses" className="bg-white text-dz-green px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all">
              ابدأ التعلم الآن
            </Link>
            {!profile && (
              <Link to="/register" className="bg-dz-green border-2 border-white/20 px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
                سجل كأستاذ
              </Link>
            )}
          </div>
        </div>
        <div className="absolute left-0 bottom-0 opacity-10 pointer-events-none">
          <Award size={300} />
        </div>
      </section>

      {/* Search Bar Mobile */}
      <div className="md:hidden">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث عن أستاذ أو درس..."
            className="dz-input pr-10"
          />
        </div>
      </div>

      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Video className="text-dz-red" size={24} />
              بث مباشر الآن
            </h2>
            <Link to="/live" className="text-dz-green text-sm font-bold flex items-center gap-1">
              عرض الكل <ChevronLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSessions.map((session) => (
              <div key={session.id} className="dz-card border-r-4 border-r-dz-red relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-dz-red text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">مباشر</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} /> {session.viewers || 0} مشاهد
                  </span>
                </div>
                <h3 className="font-bold mb-1">{session.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{session.teacherName}</p>
                <button className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                  session.isFree ? 'bg-dz-green text-white' : 'bg-dz-red text-white'
                }`}>
                  {session.isFree ? 'دخول مجاني' : 'دخول مدفوع'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Teachers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-yellow-500" size={24} />
            أفضل الأساتذة
          </h2>
          <Link to="/teachers" className="text-dz-green text-sm font-bold flex items-center gap-1">
            عرض الكل <ChevronLeft size={16} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <div key={teacher.uid} className="dz-card min-w-[200px] flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-dz-green/10 flex items-center justify-center text-dz-green text-2xl font-bold border-4 border-dz-green/10">
                    {teacher.fullName[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1 rounded-full border-2 border-white">
                    <Star size={12} fill="currentColor" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold">{teacher.fullName}</h3>
                  <p className="text-xs text-dz-green font-medium">{teacher.subjects?.[0] || 'أستاذ'}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <span>⭐ {teacher.rating}</span>
                  <span>👤 {teacher.ratingCount} تقييم</span>
                </div>
                <Link to={`/teacher/${teacher.uid}`} className="w-full py-2 bg-gray-50 text-dz-green rounded-lg text-xs font-bold hover:bg-dz-green hover:text-white transition-all text-center">
                  عرض الملف
                </Link>
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-gray-400">لا يوجد أساتذة مسجلون حالياً</div>
          )}
        </div>
      </section>

      {/* Categories / Levels */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ابتدائي', icon: BookOpen, color: 'bg-blue-500' },
          { label: 'متوسط', icon: BookOpen, color: 'bg-dz-green' },
          { label: 'ثانوي', icon: BookOpen, color: 'bg-dz-red' },
          { label: 'جامعي', icon: BookOpen, color: 'bg-purple-500' },
        ].map((level) => (
          <div key={level.label} className="dz-card flex flex-col items-center justify-center p-6 space-y-3 cursor-pointer hover:scale-105 transition-all">
            <div className={`${level.color} text-white p-3 rounded-2xl`}>
              <level.icon size={24} />
            </div>
            <span className="font-bold">{level.label}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;

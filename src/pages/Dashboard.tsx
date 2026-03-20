import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Course, Subscription, PremiumPackage } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Star,
  Award,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!profile) return;
    const qCourses = query(collection(db, 'courses'), where('teacherId', '==', profile.uid));
    const unsubCourses = onSnapshot(qCourses, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    });

    const qSubs = query(collection(db, 'subscriptions'), where('teacherId', '==', profile.uid));
    const unsubSubs = onSnapshot(qSubs, (snapshot) => {
      setSubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription)));
    });

    return () => { unsubCourses(); unsubSubs(); };
  }, [profile]);

  const stats = [
    { label: 'إجمالي الأرباح', value: `${profile?.totalEarnings || 0} دج`, icon: DollarSign, color: 'text-dz-green' },
    { label: 'عدد المشتركين', value: subs.length, icon: Users, color: 'text-blue-500' },
    { label: 'عدد الدروس', value: courses.length, icon: BookOpen, color: 'text-purple-500' },
    { label: 'التقييم العام', value: `⭐ ${profile?.rating || 0}`, icon: Star, color: 'text-yellow-500' },
  ];

  const packages = [
    { id: 'bronze', name: 'البرونزي', price: '2,000 دج', duration: 'شهر واحد', color: 'bg-orange-100 text-orange-700' },
    { id: 'silver', name: 'الفضي', price: '5,000 دج', duration: '3 أشهر', color: 'bg-gray-100 text-gray-700' },
    { id: 'gold', name: 'الذهبي', price: '10,000 دج', duration: 'سنة كاملة', color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-dz-green" />
          لوحة تحكم الأستاذ
        </h1>
        <div className="flex items-center gap-2 bg-dz-green/10 text-dz-green px-4 py-2 rounded-xl text-sm font-bold">
          <Award size={18} />
          الباقة الحالية: {profile?.premiumPackage === 'none' ? 'مجانية' : profile?.premiumPackage}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="dz-card flex flex-col items-center justify-center p-6 space-y-2">
            <stat.icon className={stat.color} size={28} />
            <p className="text-xs text-gray-500">{stat.label}</p>
            <h3 className="text-xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">آخر الدروس المنشورة</h2>
            <button className="text-dz-green text-sm font-bold">عرض الكل</button>
          </div>
          <div className="space-y-3">
            {courses.length > 0 ? (
              courses.slice(0, 5).map((course) => (
                <div key={course.id} className="dz-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="text-dz-green" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{course.title}</h4>
                      <p className="text-[10px] text-gray-500">{course.subject} • {course.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-dz-green">{course.isFree ? 'مجاني' : 'مدفوع'}</span>
                    <Settings size={16} className="text-gray-400 cursor-pointer" />
                  </div>
                </div>
              ))
            ) : (
              <div className="dz-card text-center py-12 text-gray-400">لم تنشر أي دروس بعد</div>
            )}
          </div>
        </div>

        {/* Premium Packages */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">ترقية الحساب</h2>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="dz-card space-y-3 border-r-4 border-dz-green">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${pkg.color}`}>
                    باقة {pkg.name}
                  </span>
                  <span className="text-sm font-bold text-dz-green">{pkg.price}</span>
                </div>
                <p className="text-xs text-gray-500">مدة الاشتراك: {pkg.duration}</p>
                <button className="w-full py-2 bg-dz-green text-white rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all">
                  اشترك الآن
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

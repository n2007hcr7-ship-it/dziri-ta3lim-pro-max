import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const TeacherDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [teacherName, setTeacherName] = useState('');

  // يمكنك تغيير هذا الكود السري لاحقاً أو إعطاء كود لكل أستاذ
  const SECRET_CODE = "DZ-2026"; 

  const handleLogin = () => {
    if (accessCode === SECRET_CODE) {
      setIsLoggedIn(true);
    } else {
      alert("عذراً، الكود السري غير صحيح!");
    }
  };

  const fetchStats = async () => {
    const q = query(collection(db, "payments"), where("teacherName", "==", teacherName));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data());
    setPayments(data);
  };

  const totalEarnings = payments.length * 1400; // حصة الأستاذ 70%

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', direction: 'rtl' }}>
        <h2>🔐 دخول الأساتذة فقط</h2>
        <input 
          type="password" 
          placeholder="أدخل الكود السري الخاص بك..." 
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          style={{ padding: '12px', width: '250px', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <br /><br />
        <button onClick={handleLogin} style={{ padding: '10px 30px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          دخول
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', direction: 'rtl', textAlign: 'right' }}>
      <h1 style={{ color: '#2d5a27' }}>لوحة تحكم الأستاذ 📊</h1>
      <p>مرحباً بك، يمكنك البحث عن إحصائياتك باستخدام اسمك المسجل:</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="أدخل اسمك الكامل..." 
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 }}
        />
        <button onClick={fetchStats} style={{ padding: '10px 20px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '5px' }}>
          عرض النتائج
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1.5px solid #2d5a27' }}>
          <h3>إجمالي الطلاب</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{payments.length}</p>
        </div>
        <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '10px', border: '1.5px solid #2d5a27' }}>
          <h3>أرباحك المستحقة (دج)</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d5a27' }}>{totalEarnings.toLocaleString()} دج</p>
        </div>
      </div>

      <h3 style={{ marginTop: '30px' }}>قائمة العمليات الأخيرة:</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#2d5a27', color: 'white' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>التاريخ</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>اسم الطالب</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>لا توجد بيانات حالياً</td></tr>
            ) : (
              payments.map((p, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.studentName || "طالب تجريبي"}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', color: '#f39c12' }}>قيد المراجعة</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherDashboard;
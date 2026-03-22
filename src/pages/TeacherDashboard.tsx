import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const TeacherDashboard = ({ teacherData }: { teacherData: any }) => {
  // --- 1. الحالات (States) ---
  const [teacherName, setTeacherName] = useState(teacherData?.name || '');
  const [liveTitle, setLiveTitle] = useState('');
  const [liveTicketPrice, setLiveTicketPrice] = useState(500);
  const [maxStudents, setMaxStudents] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chatPrice, setChatPrice] = useState(teacherData?.chatPrice || 1000);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  // حالات البيانات والإحصائيات
  const [payments, setPayments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]); // أضفتها هنا لتختار الكورس عند الرفع
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);

  const SECRET_CODE = "DZ-2026";

  // --- 2. جلب البيانات عند التحميل ---
  useEffect(() => {
    const fetchData = async () => {
      if (!teacherData?.id) return;
      try {
        // 1. جلب الكورسات الخاصة بالأستاذ لتظهر في القائمة
        const qCourses = query(collection(db, 'courses'), where('teacherId', '==', teacherData.id));
        const coursesSnap = await getDocs(qCourses);
        setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 2. جلب المدفوعات والإحصائيات
        const qPayments = query(collection(db, 'payments'), where('teacherId', '==', teacherData.id));
        const paymentsSnap = await getDocs(qPayments);
        const pData = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayments(pData);

        // حساب الأرباح
        const total = pData.reduce((acc, curr: any) => acc + (Number(curr.amount) || 0), 0);
        setTotalEarnings(total);
        setStudentsCount(pData.length);
      } catch (err) { console.error("Data Fetch Error:", err); }
    };
    fetchData();
  }, [teacherData]);

  // --- 3. الدوال (Logic) ---

  const saveChatPrice = async () => {
    try {
      const teacherRef = doc(db, 'teachers', teacherData.id);
      await updateDoc(teacherRef, { chatPrice: Number(chatPrice) });
      alert("✅ تم تحديث سعر الاشتراك!");
    } catch (err) { alert("❌ خطأ في الحفظ"); }
  };

  const handleUploadLesson = async () => {
    if (!videoFile || !lessonTitle || !selectedCourseId) return alert("يرجى اختيار الكورس وعنوان الدرس");
    setUploading(true);
    const storageRef = ref(storage, `courses/${selectedCourseId}/lessons/${Date.now()}_${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on('state_changed', 
      (snapshot) => setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (error) => { alert("خطأ في الرفع"); setUploading(false); },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const courseRef = doc(db, 'courses', selectedCourseId);
        await updateDoc(courseRef, {
          lessons: arrayUnion({ title: lessonTitle, videoUrl: downloadURL, createdAt: new Date().toISOString() })
        });
        alert("🎉 تم رفع الدرس بنجاح!");
        setUploading(false); setIsModalOpen(false); setLessonTitle('');
      }
    );
  };

  const handleCreateLive = async () => {
    if (!liveTitle) return alert("عنوان البث مطلوب");
    try {
      await addDoc(collection(db, 'lives'), {
        title: liveTitle, teacherId: teacherData.id, teacherName: teacherData.name,
        price: Number(liveTicketPrice), maxStudents: Number(maxStudents),
        status: 'scheduled', createdAt: new Date().toISOString()
      });
      alert("📺 تم جدولة البث المباشر!");
      setLiveTitle('');
    } catch (err) { console.error(err); }
  };

  // --- 4. واجهة تسجيل الدخول ---
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'Arial' }}>
        <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h2 style={{ color: '#1a73e8', marginBottom: '20px' }}>بوابة إدارة الأساتذة</h2>
          <input type="password" placeholder="أدخل كود الوصول السري" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', textAlign: 'center' }} />
          <button onClick={() => accessCode === SECRET_CODE ? setIsLoggedIn(true) : alert("الكود خاطئ")} style={{ width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>دخول للنظام</button>
        </div>
      </div>
    );
  }

  // --- 5. الواجهة الرئيسية ---
  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', direction: 'rtl', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f8f9fa' }}>
      
      {/* رأس الصفحة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1a73e8', fontSize: '24px' }}>أهلاً بك، أ. {teacherName}</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>لوحة التحكم في الدروس والبث المباشر</p>
        </div>
        <div style={{ textAlign: 'left' }}>
          <span style={{ background: '#e8f0fe', color: '#1967d2', padding: '8px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>تحديث DZ-2026</span>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #2e7d32, #4caf50)', color: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(46,125,50,0.2)' }}>
          <h3 style={{ margin: '0 0 10px', opacity: 0.9 }}>إجمالي أرباحك</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{totalEarnings.toLocaleString()} دج</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)', color: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(21,101,192,0.2)' }}>
          <h3 style={{ margin: '0 0 10px', opacity: 0.9 }}>عدد الطلاب المشتركين</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{studentsCount} طالب</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        
        {/* التحكم في البث */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>🎥 جدولة حصة مباشرة</h3>
          <input type="text" placeholder="عنوان الحصة المباشرة" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd' }} />
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>سعر التذكرة</label>
              <input type="number" value={liveTicketPrice} onChange={(e) => setLiveTicketPrice(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>الحد الأقصى للطلاب</label>
              <input type="number" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
          </div>
          <button onClick={handleCreateLive} style={{ width: '100%', padding: '15px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد الجدولة ونشرها</button>
        </div>

        {/* إدارة الدروس */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' }}>📂 رفع المحتوى المسجل</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>يمكنك رفع فيديوهات جديدة لدروسك هنا وتحديد الكورس التابع لها.</p>
          <button onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '15px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>+ إضافة درس جديد للمكتبة</button>
          
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ marginBottom: '10px' }}>💰 سعر اشتراك الدردشة</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" value={chatPrice} onChange={(e) => setChatPrice(Number(e.target.value))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <button onClick={saveChatPrice} style={{ padding: '10px 20px', background: '#34a853', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>حفظ</button>
            </div>
          </div>
        </div>

        {/* جدول الاشتراكات */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>🔔 قائمة الطلاب المشتركين مؤخراً</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', color: '#555' }}>
                  <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>اسم الطالب</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>المبلغ المدفوع</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>تاريخ الاشتراك</th>
                  <th style={{ padding: '15px', borderBottom: '2px solid #eee' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{p.studentName || 'طالب مجهول'}</td>
                    <td style={{ padding: '15px', color: '#2e7d32', fontWeight: 'bold' }}>{p.amount} دج</td>
                    <td style={{ padding: '15px', color: '#666' }}>{new Date(p.createdAt).toLocaleDateString('ar-DZ')}</td>
                    <td style={{ padding: '15px' }}><span style={{ background: '#e6f4ea', color: '#1e8e3e', padding: '5px 12px', borderRadius: '15px', fontSize: '13px' }}>تم الدفع</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* مودال رفع الدرس */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '25px', width: '90%', maxWidth: '550px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: '25px', color: '#1a73e8' }}>رفع محتوى تعليمي جديد</h2>
            
            <label style={{ display: 'block', marginBottom: '8px' }}>اختر الكورس المستهدف:</label>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
              <option value="">-- اختر من كورساتك المتاحة --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>

            <input type="text" placeholder="ما هو عنوان هذا الدرس؟" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd' }} />
            
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)} style={{ marginBottom: '25px', display: 'block' }} />
            
            {uploading && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}>جاري المعالجة والرفع... {Math.round(progress)}%</p>
                <div style={{ width: '100%', background: '#eee', borderRadius: '10px', height: '12px' }}>
                  <div style={{ width: `${progress}%`, background: '#34a853', height: '100%', borderRadius: '10px', transition: 'width 0.3s' }}></div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleUploadLesson} disabled={uploading} style={{ flex: 2, padding: '15px', background: '#34a853', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                {uploading ? 'يرجى الانتظار...' : 'بدء عملية الرفع'}
              </button>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '15px', background: '#ea4335', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
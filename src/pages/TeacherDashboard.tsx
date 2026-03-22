import { useState } from 'react';
import { db, storage } from '../firebase'; // تأكد من تصدير storage من ملف firebase.ts
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { PlusCircle, Upload, X } from 'lucide-react';
const TeacherDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [teacherName, setTeacherName] = useState('');
const [liveTitle, setLiveTitle] = useState('');
const [liveTicketPrice, setLiveTicketPrice] = useState(500);
const [maxStudents, setMaxStudents] = useState(50);
  // يمكنك تغيير هذا الكود السري لاحقاً أو إعطاء كود لكل أستاذ
  const SECRET_CODE = "DZ-2026"; 

  // حالات الرفع (Upload States)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // دالة الرفع
  const handleUploadLesson = async () => {
    if (!videoFile || !lessonTitle || !selectedCourseId) return alert("يرجى ملء جميع الحقول");
    
    setUploading(true);
    const storageRef = ref(storage, `courses/${selectedCourseId}/lessons/${Date.now()}_${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      }, 
      (error) => {
        console.error(error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const courseRef = doc(db, "courses", selectedCourseId);
        
        await updateDoc(courseRef, {
          lessons: arrayUnion({
            title: lessonTitle,
            videoUrl: downloadURL,
            duration: "15:00", // قيمة افتراضية
            createdAt: new Date().toISOString()
          })
        });

        alert("تم إضافة الدرس بنجاح!");
        setUploading(false);
        setIsModalOpen(false);
        setLessonTitle('');
        setVideoFile(null);
      }
    );
  };
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
  <button 
  onClick={() => {
    setSelectedCourseId(course.id);
    setIsModalOpen(true);
  }}
  className="p-2 text-dz-green hover:bg-dz-green/10 rounded-lg transition-colors"
  title="إضافة درس جديد"
>
  <PlusCircle size={20} />
</button>

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
const [chatPrice, setChatPrice] = useState(teacherData?.chatPrice || 1000);

const saveChatPrice = async () => {
  if (!chatPrice || chatPrice < 100) {
    alert("يرجى إدخال سعر صالح (على الأقل 100 دج)");
    return;
  }
  try {
    const teacherRef = doc(db, 'teachers', teacherData.id);
    await updateDoc(teacherRef, { chatPrice: Number(chatPrice) });
    alert("تم حفظ سعر الاشتراك الجديد بنجاح!");
  } catch (err) {
    console.error("خطأ في حفظ السعر:", err);
    alert("حدث خطأ أثناء حفظ السعر.");
  }
};
// متغيرات البث المباشر الجديدة
  const [liveTitle, setLiveTitle] = useState('');
  const [liveTicketPrice, setLiveTicketPrice] = useState(500);
  const [maxStudents, setMaxStudents] = useState(50);

  // دالة حفظ البث في Firestore
  const handleCreateLive = async () => {
    if (!liveTitle) return alert("يرجى كتابة عنوان للبث");
    try {
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'live_sessions'), {
            title: liveTitle,
            price: Number(liveTicketPrice),
            maxStudents: Number(maxStudents),
            teacherName: teacherName || "أستاذ", // يستخدم teacherName المعرف في السطر 9
            teacherId: teacherData?.id || "unknown",
            createdAt: new Date(),
            status: 'upcoming'
        });
        alert("تم جدولة البث بنجاح!");
        setLiveTitle(''); // تنظيف الحقل بعد الحفظ
    } catch (error) {
        console.error("خطأ في الجدولة:", error);
        alert("حدث خطأ أثناء جدولة البث.");
    }
  };
  {/* --- قسم جدولة بث مباشر جديد --- */}
<div style={{ 
    background: '#fff', 
    padding: '20px', 
    borderRadius: '15px', 
    border: '1px solid #e3f2fd', 
    marginTop: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
}}>
    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1565c0', margin: '0 0 15px 0' }}>
        <span style={{ fontSize: '24px' }}>🎥</span> جدولة حصة بث مباشر جديدة
    </h3>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
            type="text" 
            placeholder="عنوان الحصة (مثلاً: مراجعة الدوال النيبيرية)" 
            value={liveTitle}
            onChange={(e) => setLiveTitle(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }}
        />
        
        <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>سعر التذكرة (دج)</label>
                <input 
                    type="number" 
                    value={liveTicketPrice}
                    onChange={(e) => setLiveTicketPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>أقصى عدد للحضور</label>
                <input 
                    type="number" 
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
            </div>
        </div>
    </div>

    <button 
        onClick={handleCreateLive}
        style={{ 
            width: '100%', 
            marginTop: '20px', 
            padding: '14px', 
            background: '#1565c0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            fontSize: '16px'
        }}
    >
        نشر الحصة وتفعيل تذاكر الدخول
    </button>
</div>

// ==========================================
// 3. اذهب لأسفل في جزء الـ return (مثلاً بعد السطر 66 مباشرة) وأضف هذا الـ HTML:
// ==========================================

{/* --- القسم الجديد: إعدادات اشتراك الشات --- */}
<div style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px' }}>
    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
        <span style={{ fontSize: '24px' }}>💬</span> إعدادات اشتراك الشات الشهري
    </h3>
    <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        حدد السعر الذي تريده مقابل وصول الطلاب للدردشة المباشرة معك لمدة 30 يوماً.
        (ستحصل على 70% من هذا المبلغ)
    </p>

    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input 
            type="number" 
            value={chatPrice}
            onChange={(e) => setChatPrice(e.target.value)}
            placeholder="أدخل السعر دج..."
            style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1.5px solid #ddd', 
                flex: '1',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#2d5a27'
            }} 
        />
        <button 
            onClick={saveChatPrice}
            style={{ 
                padding: '12px 25px', 
                background: '#2d5a27', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold'
            }}
        >
            حفظ السعر
        </button>
    </div>
</div>
{/* -------------------------------------- */}

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
    {/* Modal إضافة درس */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl w-full max-w-md p-6">
             <h2 className="text-xl font-bold mb-4">إضافة درس جديد</h2>
             <input type="text" placeholder="عنوان الدرس" className="w-full bg-[#252525] p-3 rounded mb-4 outline-none" onChange={(e)=>setLessonTitle(e.target.value)} />
             <input type="file" accept="video/*" className="mb-4" onChange={(e)=>setVideoFile(e.target.files?.[0] || null)} />
             {uploading && <div className="w-full bg-gray-700 h-1 mb-4"><div className="bg-dz-green h-full" style={{width: `${progress}%`}}></div></div>}
             <button onClick={handleUploadLesson} className="w-full bg-dz-green text-black p-3 rounded font-bold">
                {uploading ? `جاري الرفع ${Math.round(progress)}%` : "تأكيد الرفع"}
             </button>
             <button onClick={()=>setIsModalOpen(false)} className="w-full mt-2 text-gray-500">إلغاء</button>
          </div>
        </div>
      )}
  );
};

export default TeacherDashboard;
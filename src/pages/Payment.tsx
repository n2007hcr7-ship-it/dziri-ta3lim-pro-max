import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { collection, addDoc, getDocs } from 'firebase/firestore';
const Payment = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // معلومات حسابك الـ CCP - يمكنك تعديلها ببياناتك الحقيقية
  const ccpInfo = {
    name: "ANES [اسمك الكامل هنا]",
    account: "0044030504",
    key: "93",
    rip: "00799999004403050493"
  };
  const [teachers, setTeachers] = useState([]); // مخزن قائمة الأساتذة
const [teacherName, setTeacherName] = useState(''); // الأستاذ المختار حالياً

useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        const teachersList = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as any[];
        setTeachers(teachersList);
      } catch (error) {
        console.error("Error fetching teachers: ", error);
      }
    };
    fetchTeachers();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      alert("من فضلك اختر صورة وصل الدفع أولاً");
      return;
    }
    
    setLoading(true);
    try {
      // 1. رفع الصورة إلى Storage
      const storageRef = ref(storage, `receipts/ccp_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
// 1. الحصول على رابط الصورة المرفوعة
      const downloadURL = await getDownloadURL(storageRef);

      // 2. الكود الجديد لإرسال البيانات إلى n8n (أضفه هنا)
      const webhookUrl = 'https://hbza3im07.app.n8n.cloud/webhook-test/09e1ff1a-04b2-470b-849c-b82eddbbf2c3';
      
      const paymentData = {
        studentName: "أنس (تجربة)", // لاحقاً سنربطها باسم المستخدم المسجل
        totalAmount: 2000,           // سعر الاشتراك (يمكنك تغييره)
        myCommission: 2000 * 0.3,    // حصتك كصاحب منصة (600 دج)
        teacherShare: 2000 * 0.7,    // حصة الأستاذ (1400 دج)
       teacherName: teacherName,
      receiptUrl: downloadURL,
      status: "pending",
      date: new Date().toLocaleString('ar-DZ')
    };

    await addDoc(collection(db, "payments"), paymentData);

      await fetch(webhookUrl, {
        
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });


      alert("تم إرسال الوصل بنجاح! سيتم التحقق وتفعيل حسابك.");
      // 2. حفظ الطلب في Firestore لكي تراه في لوحة التحكم
      await addDoc(collection(db, "payment_requests"), {
        receiptUrl: url,
        status: "pending",
        createdAt: new Date(),
        type: "CCP_PAYMENT"
      });

      alert("تم إرسال وصل الدفع بنجاح! سيتم التحقق من حسابك وتفعيله قريباً.");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفع، تأكد من اتصال الإنترنت.");
    }
    setLoading(false);
    <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          اختر الأستاذ:
        </label>
        <select 
          required
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', direction: 'rtl' }}
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
        >
          <option value="">-- الأساتذة المتاحون حالياً --</option>
          {teachers.map((t: any) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#2d5a27' }}>تفعيل الحساب عبر بريد الجزائر (CCP)</h2>
      
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
        <p>يرجى إرسال مبلغ الاشتراك إلى الحساب التالي:</p>
        <p><b>الاسم الكامل:</b> {ccpInfo.name}</p>
        <p><b>رقم الحساب (CCP):</b> {ccpInfo.account} <b>المفتاح:</b> {ccpInfo.key}</p>
        <p><b>رقم الـ RIP:</b> <span style={{ letterSpacing: '1px' }}>{ccpInfo.rip}</span></p>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          بعد الدفع، قم بتصوير الوصل ورفعه هنا:
        </label>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
          accept="image/*"
          style={{ marginBottom: '15px' }}
        />
        <br />
        <button 
          onClick={handleUpload} 
          disabled={loading}
          style={{
            background: '#2d5a27',
            color: 'white',
            padding: '10px 25px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? "جاري إرسال البيانات..." : "تأكيد وإرسال الوصل"}
        </button>
      </div>
    </div>
  );
};

export default Payment;
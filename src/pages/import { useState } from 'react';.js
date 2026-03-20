import { useState } from 'react';
import { storage, db } from './firebase'; // تأكد من إعداد فايربيز لديك
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const PaymentModule = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("من فضلك اختر صورة الوصل أولاً");
    
    setLoading(true);
    try {
      // 1. رفع الصورة إلى Firebase Storage
      const storageRef = ref(storage, `receipts/${userId}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. حفظ بيانات الطلب في Firestore لكي تراها أنت في لوحة التحكم
      await addDoc(collection(db, "payment_requests"), {
        studentId: userId,
        receiptUrl: url,
        status: "pending", // الحالة: قيد الانتظار
        createdAt: new Date()
      });

      alert("تم إرسال الوصل بنجاح! سيتم تفعيل حسابك بعد التحقق.");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفع.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', direction: 'rtl' }}>
      <h2>تفعيل الحساب عبر CCP</h2>
      <div className="ccp-info" style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <p>الاسم: <b>ANAS [لقبك هنا]</b></p>
        <p>رقم الحساب: <b>12345678</b> | المفتاح: <b>90</b></p>
        <p>الـ RIP: <b>00799999001234567890</b></p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>ارفع صورة وصل الدفع هنا:</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "جاري الإرسال..." : "إرسال لتفعيل الحساب"}
        </button>
      </div>
    </div>
  );
};
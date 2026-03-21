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

  const handlePayment = async (teacherId) => {
    // القيم الثابتة (يمكنك جلبها لاحقاً من قاعدة البيانات)
    const price = 2000;
    const teacherShare = 1400; // 70%
    const teacherChargilyId = "CH_ACC_XXXXXXXXXXXX"; // معرف الأستاذ الحقيقي

    try {
      const response = await fetch('https://pay.chargily.net/backoffice/api/v2/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer test_sk_wkEO4mDOro6bWK6oVgcMHFSlYJUcmVbG1PKlZ743`, // مفتاحك السري
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: price,
          currency: 'dzd',
          success_url: 'https://anas-dz.github.io/dziri-ta3lim-pro-max/#/success',
          metadata: [
            {
              "account_id": teacherChargilyId,
              "amount": teacherShare
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url; // توجيه الطالب للدفع
      } else {
        console.error("خطأ من شارجيلي:", data);
        alert("فشل إنشاء رابط الدفع.");
      }
    } catch (error) {
      console.error("خطأ في الاتصال:", error);
      alert("حدث خطأ، يرجى المحاولة لاحقاً.");
    }
  };
 
  // --- هذا الجزء المفقود في صورتك ---
  return (
    <div className="payment-container">
      <h2>إتمام عملية الشراء</h2>
      <button onClick={() => handlePayment("teacher_id")}>
        ادفع الآن (2000 دج)
      </button>
    </div>
  );
}; // <--- هذا القوس يغلق السطر رقم 6

export default Payment;
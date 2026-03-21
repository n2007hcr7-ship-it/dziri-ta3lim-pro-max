import React, { useState } from 'react';
import { db, auth } from '../firebase-applet-config'; 
import { doc, getDoc } from 'firebase/firestore';

const TeacherChat = ({ teacherData }: { teacherData: any }) => {
  const [loading, setLoading] = useState(false);

  // السعر يحدده الأستاذ (مثلاً 1000 دج) أو نستخدم قيمة افتراضية
  const chatMonthlyPrice = teacherData?.chatPrice || 1000;
  const teacherShare = chatMonthlyPrice * 0.7; // 70% للأستاذ و 30% للمنصة (لك)

  const handleChatSubscription = async () => {
    setLoading(true);
    try {
      // 1. طلب إنشاء عملية دفع من شارجيلي (نفس المنطق الذي نجحنا فيه سابقاً)
      const response = await fetch('https://pay.chargily.net/backoffice/api/v2/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer test_sk_wkEO4mDOro6bWK6oVgcMHFSlYJUcmVbG1PKlZ743, // استبدله بمفتاحك السري الحقيقي
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: chatMonthlyPrice,
          currency: 'dzd',
          success_url: 'https://anas-dz.github.io/dziri-ta3lim-pro-max/#/chat-success', 
          metadata: [
            {
              "account_id": teacherData?.chargilyAccountId, // معرف حساب الأستاذ لاستلام أمواله
              "amount": teacherShare
            },
            {
              "payment_type": "monthly_chat",
              "student_uid": auth.currentUser?.uid,
              "teacher_id": teacherData?.id
            }
          ]
        })
      });

      const data = await response.json();

      if (data.checkout_url) {
        // 2. توجيه الطالب لصفحة الدفع الآمنة
        window.location.href = data.checkout_url;
      } else {
        alert("فشل إنشاء رابط الدفع. تأكد من إعدادات الأستاذ.");
      }
    } catch (err) {
      console.error("خطأ:", err);
      alert("حدث خطأ في الاتصال بشركة شارجيلي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-3xl shadow-2xl border border-blue-50 mt-10 text-center">
      <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <span className="text-white text-3xl">💬</span>
      </div>
      
      <h2 className="text-2xl font-black text-gray-800 mb-2">اشتراك الشات المباشر</h2>
      <p className="text-gray-600 mb-6 px-4">
        افتح ميزة التواصل المباشر مع الأستاذ <span className="font-bold text-blue-600">{teacherData?.name}</span> لمدة شهر كامل للحصول على إجابات لأسئلتك.
      </p>

      <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 mb-8">
        <p className="text-blue-800 text-sm uppercase tracking-wider font-bold mb-1">تكلفة الاشتراك الشهري</p>
        <div className="text-4xl font-black text-blue-700">{chatMonthlyPrice} <span className="text-lg">دج</span></div>
      </div>

      <button 
        onClick={handleChatSubscription}
        disabled={loading}
        className={`w-full py-4 rounded-2xl text-white font-black text-xl shadow-xl transition-all active:scale-95 ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
        }`}
      >
        {loading ? 'جاري التحويل للدفع...' : 'تفعيل الاشتراك الآن'}
      </button>

      <p className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-1">
        🔒 دفع آمن عبر البطاقة الذهبية أو CIB
      </p>
    </div>
  );
};

export default TeacherChat;
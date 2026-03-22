import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LiveSessions = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const q = query(collection(db, "live_sessions"), where("status", "==", "upcoming"));
                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSessions(docs);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching sessions:", error);
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    const handleBuyTicket = async (session: any) => {
        try {
            const response = await fetch('https://api.chargily.net/backoffice/api/v2/checkouts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer test_sk_uk_wk5O4mDOncGbWKGvZwMUH51YVbmVbG1PK17743`, // تأكد من مفتاحك الخاص هنا
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    metadata: {
                        type: "live_ticket",
                        session_id: session.id,
                        student_uid: auth.currentUser?.uid
                    },
                    // أضف هنا باقي الحقول المطلوبة من Chargily مثل amount و currency إذا لم تكن موجودة تلقائياً
                })
            });

            const data = await response.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                alert("حدث خطأ في إنشاء رابط الدفع");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("فشلت عملية الاتصال ببوابة الدفع");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'right', color: '#1565c0' }}>🎥 الحصص المباشرة المتاحة</h2>
            
            {loading ? (
                <p style={{ textAlign: 'center' }}>جاري التحميل...</p>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <div key={session.id} style={{ 
                                border: '1px solid #ddd', 
                                padding: '15px', 
                                borderRadius: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: '#fff',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}>
                                <div>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{session.title}</h4>
                                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>الأستاذ: {session.teacherName || 'غير محدد'}</p>
                                    <span style={{ color: '#2d5a27', fontWeight: 'bold' }}>{session.price} دج</span>
                                </div>
                                <button 
                                    onClick={() => handleBuyTicket(session)}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#1565c0',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    شراء تذكرة دخول
                                </button>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center' }}>لا توجد حصص مباشرة حالياً</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveSessions;
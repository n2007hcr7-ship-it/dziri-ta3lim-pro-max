import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LiveSessions = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            const q = query(collection(db, "live_sessions"), where("status", "==", "upcoming"));
            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSessions(docs);
            setLoading(false);
        };
        fetchSessions();
    }, []);

    const handleBuyTicket = async (session: any) => {
        try {
            const response = await fetch('https://api.chargily.net/backoffice/api/v2/checkouts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer test_sk_wkEO4mDOro6bWK6oVgcMHFSlYJUcmVbG1PKlZ743`, // استبدله بمفتاحك الحقيقي من لوحة تحكم شارجيلي
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: session.price,
                    currency: 'dzd',
                    // الرابط الذي سيعود إليه الطالب ليتم تفعيل تذكرته تلقائياً
                    success_url: `${window.location.origin}/#/payment-success?session_id=${session.id}`,
                    metadata: {
                        type: "live_ticket",
                        session_id: session.id,
                        student_uid: auth.currentUser?.uid
                    }
                })
            });
            const data = await response.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
             <div style={{ marginTop: '15px', width: '100%' }}>
    { (session.allowedStudents?.includes(auth.currentUser?.uid) || session.teacherId === auth.currentUser?.uid) ? (
        <button 
            onClick={() => navigate(`/live/${session.id}`)}
            style={{ 
                padding: '12px', background: '#2d5a27', color: '#fff', 
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                width: '100%', fontWeight: 'bold'
            }}
        >
            دخول الحصة المباشرة الآن 🎥
        </button>
    ) : (
        <button 
            onClick={() => handleBuyTicket(session)}
            style={{ 
                padding: '12px', background: '#1565c0', color: '#fff', 
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                width: '100%', fontWeight: 'bold'
            }}
        >
            شراء تذكرة دخول ({session.price} دج)
        </button>
    )}
</div>
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'right', color: '#1565c0' }}>🎥 الحصص المباشرة المتاحة</h2>
            {loading ? <p>جاري التحميل...</p> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {sessions.map(session => (
                        <div key={session.id} style={{ 
                            background: '#fff', padding: '20px', borderRadius: '15px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e3f2fd',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', direction: 'rtl'
                        }}>
                            <div>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{session.title}</h4>
                                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>الأستاذ: {session.teacherName}</p>
                                <span style={{ color: '#2d5a27', fontWeight: 'bold' }}>{session.price} دج</span>
                            </div>
                            <button 
                                onClick={() => handleBuyTicket(session)}
                                style={{ 
                                    padding: '10px 20px', background: '#1565c0', color: '#fff', 
                                    border: 'none', borderRadius: '8px', cursor: 'pointer' 
                                }}
                            >
                                شراء تذكرة دخول
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveSessions;
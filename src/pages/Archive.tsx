import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Archive = () => {
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        // نجلب فقط الحصص التي انتهت بنجاح ولديها فيديو
        const q = query(collection(db, "live_sessions"), where("status", "==", "ended"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={{ padding: '30px', background: '#121212', minHeight: '100vh', color: 'white', direction: 'rtl' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#4fc3f7' }}>📺 مكتبة الحصص المسجلة</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {sessions.length === 0 ? (
                    <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد دروس مسجلة حالياً.</p>
                ) : (
                    sessions.map(s => (
                        <div key={s.id} style={{ background: '#1e1e1e', borderRadius: '12px', padding: '15px', border: '1px solid #333' }}>
                            <div style={{ height: '140px', background: '#333', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>🎬</div>
                            <h3>{s.title}</h3>
                            <p style={{ fontSize: '12px', color: '#aaa' }}>تاريخ الحصة: {s.date}</p>
                            
                            {/* شرط الوصول: الأستاذ أو طالب في القائمة المسموحة */}
                            {(s.teacherId === auth.currentUser?.uid || s.allowedStudents?.includes(auth.currentUser?.uid)) ? (
                                <button 
                                    onClick={() => window.open(s.videoUrl, '_blank')}
                                    style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    مشاهدة التسجيل ▶️
                                </button>
                            ) : (
                                <div style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#c62828', borderRadius: '6px', textAlign: 'center', fontSize: '13px' }}>
                                    🔒 محتوى مغلق (اشترِ التذكرة)
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Archive;
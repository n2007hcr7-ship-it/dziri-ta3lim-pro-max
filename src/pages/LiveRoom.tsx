import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { db, auth, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const LiveRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    // --- 1. الحالات (States) بدون تكرار ---
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewers, setViewers] = useState(0);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!sessionId || !auth.currentUser) return;

        const checkAccess = async () => {
            const docRef = doc(db, "live_sessions", sessionId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const sData = docSnap.data();
                setData(sData);
                // التحقق: هل هو الأستاذ أم طالب اشترى التذكرة؟
                if (sData.teacherId === auth.currentUser?.uid || sData.allowedStudents?.includes(auth.currentUser?.uid)) {
                    setAuthorized(true);
                    startVideo(sData);
                }
            }
            setLoading(false);
        };

        const watchLiveStatus = () => {
            // مراقب الدردشة
            const chatQ = query(collection(db, "live_sessions", sessionId, "chat"), orderBy("timestamp", "asc"));
            onSnapshot(chatQ, (snapshot) => {
                setMessages(snapshot.docs.map(doc => doc.data()));
            });
            // مراقب عداد المشاهدين
            onSnapshot(doc(db, "live_sessions", sessionId), (doc) => {
                if (doc.exists()) setViewers(doc.data().onlineViewers || 0);
            });
        };

        checkAccess();
        watchLiveStatus();

        return () => {
            client.leave();
        };
    }, [sessionId]);

    // --- 2. تشغيل الفيديو والتسجيل ---
    const startVideo = async (sessionData: any) => {
        try {
            await client.join("8e4ef10f0a5c4b7b9091de3dd377ed2c", sessionId!, null);
            const localTrack = await AgoraRTC.createMicrophoneAndCameraTracks();
            await client.publish(localTrack);
            localTrack[1].play('video-container');

            // بدء التسجيل للأستاذ فقط
            if (sessionData.teacherId === auth.currentUser?.uid) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                const recorder = new MediaRecorder(stream);
                let chunks: Blob[] = [];
                recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
                recorder.onstop = () => setRecordedChunks(chunks);
                recorder.start();
                setMediaRecorder(recorder);
            }
        } catch (err) {
            console.error("Video/Recording Error:", err);
        }
    };

    // --- 3. إنهاء الحصة والرفع للأرشيف ---
    const handleEndLive = async () => {
        if (!window.confirm("إنهاء الحصة ورفعها للأرشيف؟")) return;
        setIsUploading(true);
        try {
            let videoUrl = "";
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                await new Promise(res => setTimeout(res, 1500));
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const fileRef = ref(storage, `recordings/${sessionId}.webm`);
                await uploadBytes(fileRef, blob);
                videoUrl = await getDownloadURL(fileRef);
            }
            await updateDoc(doc(db, "live_sessions", sessionId!), { status: "ended", videoUrl, onlineViewers: 0 });
            await client.leave();
            navigate('/teacher-dashboard');
        } catch (e) {
            setIsUploading(false);
        }
    };

    // --- 4. إرسال الدردشة ---
    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        await addDoc(collection(db, "live_sessions", sessionId!, "chat"), {
            text: newMessage,
            sender: auth.currentUser?.displayName || "مستخدم",
            uid: auth.currentUser?.uid,
            timestamp: serverTimestamp()
        });
        setNewMessage("");
    };

    if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>جاري التحقق...</div>;
    if (!authorized) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>ليس لديك صلاحية لدخول هذا البث.</div>;
    if (isUploading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>جاري حفظ الحصة للأرشيف، يرجى الانتظار...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#1a1a1a', color: 'white', direction: 'rtl' }}>
            {/* قسم الفيديو */}
            <div style={{ flex: 3, position: 'relative', borderLeft: '2px solid #333' }}>
                <div id="video-container" style={{ width: '100%', height: '100%', background: '#000' }}></div>
                <div style={{ position: 'absolute', top: 20, right: 20, background: 'red', padding: '5px 15px', borderRadius: '20px' }}>
                    مباشر 🔴 {viewers} مشاهد
                </div>
                {data?.teacherId === auth.currentUser?.uid && (
                    <button onClick={handleEndLive} style={{ position: 'absolute', top: 20, left: 20, background: '#b71c1c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                        إنهاء الحصة ⏹️
                    </button>
                )}
            </div>

            {/* قسم الدردشة */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#252525' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center' }}>الدردشة المباشرة</div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ marginBottom: '10px', background: '#333', padding: '8px', borderRadius: '8px' }}>
                            <small style={{ color: '#4fc3f7' }}>{m.sender}</small>
                            <p style={{ margin: 0 }}>{m.text}</p>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '15px', display: 'flex', gap: '5px' }}>
                    <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="اكتب رسالتك..." style={{ flex: 1, padding: '10px', borderRadius: '5px', border:'none' }} />
                    <button onClick={sendMessage} style={{ background: '#1565c0', color: 'white', border: 'none', padding: '10px', borderRadius: '5px' }}>إرسال</button>
                </div>
            </div>
        </div>
    );
};

export default LiveRoom;
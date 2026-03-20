import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../AuthContext';
import { Group, Exercise, Submission } from '../types';
import { 
  Users, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  Upload, 
  Download,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const GroupView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for new exercise
  const [newEx, setNewEx] = useState({ title: '', deadline: '' });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchGroup = async () => {
      const groupDoc = await getDoc(doc(db, 'groups', id));
      if (groupDoc.exists()) {
        setGroup({ id: groupDoc.id, ...groupDoc.data() } as Group);
      }
    };
    fetchGroup();

    const q = query(collection(db, `groups/${id}/exercises`), where('groupId', '==', id));
    const unsub = onSnapshot(q, (snapshot) => {
      setExercises(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise)));
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !file || !profile) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `exercises/${id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, `groups/${id}/exercises`), {
        groupId: id,
        title: newEx.title,
        deadline: new Date(newEx.deadline).toISOString(),
        contentUrl: url,
        createdAt: new Date().toISOString()
      });

      setShowAddExercise(false);
      setNewEx({ title: '', deadline: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;
  if (!group) return <div className="text-center py-20">الفوج غير موجود</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Group Header */}
      <div className="bg-dz-green rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-dz-white/70 text-sm">{group.description}</p>
          </div>
        </div>
        {profile?.role === 'teacher' && (
          <button 
            onClick={() => setShowAddExercise(true)}
            className="bg-white text-dz-green px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-all"
          >
            <Plus size={20} />
            نشر تمرين جديد
          </button>
        )}
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText size={24} className="text-dz-green" />
          التمارين والواجبات
        </h2>
        <div className="space-y-4">
          {exercises.length > 0 ? (
            exercises.map((ex) => (
              <div key={ex.id} className="dz-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{ex.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-dz-red font-bold bg-dz-red/5 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    آخر أجل: {format(new Date(ex.deadline), 'PPP p', { locale: ar })}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={ex.contentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                  >
                    <Download size={16} />
                    تحميل التمرين
                  </a>
                  {ex.correctionUrl && (
                    <a 
                      href={ex.correctionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-dz-green/10 text-dz-green px-4 py-2 rounded-xl text-sm font-bold hover:bg-dz-green/20 transition-all"
                    >
                      <CheckCircle size={16} />
                      التصحيح النموذجي
                    </a>
                  )}
                </div>

                {profile?.role === 'student' && (
                  <div className="pt-4 border-t border-gray-50">
                    <button className="w-full dz-btn-primary py-3 flex items-center justify-center gap-2">
                      <Upload size={18} />
                      رفع الإجابة
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="dz-card text-center py-12 text-gray-400">لا توجد تمارين منشورة حالياً</div>
          )}
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-center">نشر تمرين جديد</h2>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">عنوان التمرين</label>
                <input
                  type="text"
                  required
                  value={newEx.title}
                  onChange={(e) => setNewEx({ ...newEx, title: e.target.value })}
                  className="dz-input"
                  placeholder="مثال: تمرين حول المتتاليات"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">آخر أجل للتسليم</label>
                <input
                  type="datetime-local"
                  required
                  value={newEx.deadline}
                  onChange={(e) => setNewEx({ ...newEx, deadline: e.target.value })}
                  className="dz-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700">ملف التمرين</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="dz-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddExercise(false)}
                  className="py-3 rounded-xl font-bold text-gray-500 bg-gray-100"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={loading || !file}
                  className="dz-btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'جاري النشر...' : 'نشر التمرين'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupView;

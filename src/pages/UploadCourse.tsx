import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Video, FileText, HelpCircle, Upload, CheckCircle } from 'lucide-react';

const UploadCourse: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: profile?.subjects?.[0] || '',
    level: profile?.levels?.[0] || 'secondary',
    monthNumber: 1,
    contentType: 'video' as 'video' | 'pdf' | 'quiz' | 'mixed',
    isFree: false
  });

  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !file) return;
    setLoading(true);

    try {
      const storageRef = ref(storage, `courses/${profile.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'courses'), {
        ...formData,
        teacherId: profile.uid,
        teacherName: profile.fullName,
        contentUrl: downloadUrl,
        publishedAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-20 h-20 bg-dz-green/10 text-dz-green rounded-full flex items-center justify-center">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold">تم نشر الدرس بنجاح!</h1>
        <p className="text-gray-500">سيتم توجيهك إلى لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="dz-card space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-dz-green/10 text-dz-green rounded-xl flex items-center justify-center">
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">نشر درس جديد</h1>
            <p className="text-xs text-gray-500">أضف محتوى تعليمي جديد لتلاميذك</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">عنوان الدرس</label>
              <input
                type="text"
                required
                className="dz-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: حل المعادلات من الدرجة الثانية"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">المادة</label>
              <input
                type="text"
                required
                className="dz-input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">المستوى</label>
              <select
                className="dz-input bg-white"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="primary">ابتدائي</option>
                <option value="middle">متوسط</option>
                <option value="secondary">ثانوي</option>
                <option value="university">جامعي</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">رقم الشهر (1-12)</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                className="dz-input"
                value={formData.monthNumber}
                onChange={(e) => setFormData({ ...formData, monthNumber: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">وصف الدرس</label>
            <textarea
              className="dz-input min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً موجزاً لما سيتعلمه التلميذ..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">نوع المحتوى</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'video', label: 'فيديو', icon: Video },
                { id: 'pdf', label: 'ملف PDF', icon: FileText },
                { id: 'quiz', label: 'اختبار', icon: HelpCircle },
                { id: 'mixed', label: 'مزيج', icon: PlusCircle },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, contentType: type.id as any })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    formData.contentType === type.id 
                      ? 'border-dz-green bg-dz-green/5 text-dz-green' 
                      : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <type.icon size={24} />
                  <span className="text-xs font-bold mt-2">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">رفع الملف</label>
            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-dz-green transition-all group">
              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto group-hover:text-dz-green group-hover:bg-dz-green/5">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-bold">{file ? file.name : 'اسحب الملف هنا أو انقر للاختيار'}</p>
                <p className="text-xs text-gray-400">يدعم الفيديو، PDF، والصور</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <input
              type="checkbox"
              id="isFree"
              checked={formData.isFree}
              onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
              className="w-5 h-5 accent-dz-green"
            />
            <label htmlFor="isFree" className="text-sm font-bold text-gray-700">هذا الدرس مجاني للجميع</label>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full dz-btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'جاري الرفع...' : 'نشر الدرس الآن'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadCourse;

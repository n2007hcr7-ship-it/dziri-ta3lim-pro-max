import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Course } from '../types';
import { useAuth } from '../AuthContext';
import { downloadService } from '../services/downloadService';
import { 
  Play, 
  FileText, 
  Lock, 
  ChevronRight, 
  Star, 
  Download,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id || !profile) return;
      try {
        // Check if downloaded first
        const offlineCourse = await downloadService.getCourse(id);
        if (offlineCourse) {
          setIsDownloaded(true);
          setCourse({
            id: offlineCourse.id,
            title: offlineCourse.title,
            teacherName: offlineCourse.teacherName,
            subject: offlineCourse.subject,
            level: offlineCourse.level,
            contentType: offlineCourse.contentType,
            contentUrl: URL.createObjectURL(offlineCourse.blob),
            description: '', // Description not saved for now
            teacherId: '',
            monthNumber: 0,
            isFree: true,
            publishedAt: offlineCourse.downloadedAt
          } as Course);
          setHasAccess(true);
          setLoading(false);
          return;
        }

        const courseDoc = await getDoc(doc(db, 'courses', id));
        if (courseDoc.exists()) {
          const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
          setCourse(courseData);

          if (courseData.isFree || courseData.teacherId === profile.uid) {
            setHasAccess(true);
          } else {
            // Check subscription
            const q = query(
              collection(db, 'subscriptions'),
              where('studentId', '==', profile.uid),
              where('teacherId', '==', courseData.teacherId),
              where('status', '==', 'active')
            );
            const subDocs = await getDocs(q);
            if (!subDocs.empty) {
              setHasAccess(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, profile]);

  const handleDownload = async () => {
    if (!course || !hasAccess) return;
    setDownloading(true);
    try {
      const success = await downloadService.saveCourse({
        id: course.id,
        title: course.title,
        teacherName: course.teacherName,
        subject: course.subject,
        level: course.level,
        contentType: course.contentType,
      }, course.contentUrl);
      
      if (success) {
        setIsDownloaded(true);
      } else {
        alert('فشل التحميل. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;
  if (!course) return <div className="text-center py-20">الدرس غير موجود</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button onClick={() => navigate(-1)} className="hover:text-dz-green flex items-center gap-1">
          <ChevronRight size={16} /> العودة للدروس
        </button>
        <span>/</span>
        <span className="text-dz-green font-bold">{course.subject}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {hasAccess ? (
            <div className="dz-card p-0 overflow-hidden bg-black aspect-video flex items-center justify-center relative group">
              {course.contentType === 'video' ? (
                <video 
                  src={course.contentUrl} 
                  controls 
                  className="w-full h-full"
                  poster="https://picsum.photos/seed/course/800/450"
                />
              ) : (
                <div className="bg-white w-full h-full flex flex-col items-center justify-center space-y-4 p-8">
                  <FileText size={64} className="text-dz-red" />
                  <h3 className="text-xl font-bold">{course.title}</h3>
                  <a 
                    href={course.contentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="dz-btn-primary flex items-center gap-2"
                  >
                    <Download size={20} />
                    تحميل ملف الدرس (PDF)
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="dz-card aspect-video flex flex-col items-center justify-center space-y-4 bg-gray-100 border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-dz-red/10 text-dz-red rounded-full flex items-center justify-center">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold">هذا المحتوى مقفل</h3>
              <p className="text-gray-500 text-center max-w-xs">يجب عليك الاشتراك مع الأستاذ {course.teacherName} لمشاهدة هذا الدرس.</p>
              <button className="dz-btn-secondary px-12">اشترك الآن</button>
            </div>
          )}

            <div className="dz-card space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold">{course.title}</h1>
                {hasAccess && (
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloaded || downloading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isDownloaded 
                        ? 'bg-dz-green/10 text-dz-green cursor-default' 
                        : 'bg-dz-green text-white hover:opacity-90 disabled:opacity-50'
                    }`}
                  >
                    {downloading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isDownloaded ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                    {downloading ? 'جاري التحميل...' : isDownloaded ? 'تم التحميل' : 'تحميل للمشاهدة أوفلاين'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="bg-dz-green/10 text-dz-green px-3 py-1 rounded-full font-bold">{course.subject}</span>
              <span>المستوى: {course.level}</span>
              <span>الشهر: {course.monthNumber}</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{course.description}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Teacher Card */}
          <div className="dz-card text-center space-y-4">
            <img src={`https://picsum.photos/seed/${course.teacherId}/100/100`} className="w-20 h-20 rounded-full mx-auto border-4 border-dz-green/10" />
            <div>
              <h3 className="font-bold text-lg">{course.teacherName}</h3>
              <p className="text-xs text-dz-green font-medium">أستاذ {course.subject}</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> 4.8</span>
              <span>👤 1.2k تلميذ</span>
            </div>
            <button className="w-full dz-btn-primary py-2 text-sm">عرض الملف الشخصي</button>
            <button className="w-full bg-dz-red/5 text-dz-red py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              <MessageSquare size={16} />
              شات خاص (مدفوع)
            </button>
          </div>

          {/* Related Info */}
          <div className="dz-card space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle size={18} className="text-dz-green" />
              معلومات إضافية
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center justify-between">
                <span>تاريخ النشر:</span>
                <span className="font-bold">{new Date(course.publishedAt).toLocaleDateString('ar-DZ')}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>نوع الوصول:</span>
                <span className={`font-bold ${course.isFree ? 'text-dz-green' : 'text-dz-red'}`}>
                  {course.isFree ? 'مجاني' : 'للمشتركين'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;

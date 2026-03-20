import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadService, OfflineCourse } from '../services/downloadService';
import { Play, FileText, Trash2, DownloadCloud, ChevronLeft } from 'lucide-react';

const Offline: React.FC = () => {
  const [courses, setCourses] = useState<OfflineCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOfflineCourses = async () => {
      const all = await downloadService.getAllCourses();
      setCourses(all);
      setLoading(false);
    };
    fetchOfflineCourses();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا الدرس من التحميلات؟')) {
      await downloadService.deleteCourse(id);
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-dz-green">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الدروس المحملة</h1>
          <p className="text-gray-500">يمكنك مشاهدة هذه الدروس بدون الحاجة للاتصال بالإنترنت</p>
        </div>
        <div className="bg-dz-green/10 p-3 rounded-full text-dz-green">
          <DownloadCloud size={32} />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="dz-card py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <DownloadCloud size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-700">لا توجد دروس محملة حالياً</h3>
          <p className="text-gray-500 max-w-xs mx-auto">قم بتحميل دروسك المفضلة لمشاهدتها في أي وقت وأي مكان</p>
          <button 
            onClick={() => navigate('/')}
            className="dz-btn-primary px-8"
          >
            تصفح الدروس
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div 
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="dz-card group cursor-pointer hover:border-dz-green transition-all flex items-center gap-4 p-4"
            >
              <div className="w-16 h-16 bg-dz-green/10 rounded-xl flex items-center justify-center text-dz-green flex-shrink-0">
                {course.contentType === 'video' ? <Play size={24} /> : <FileText size={24} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{course.title}</h3>
                <p className="text-sm text-gray-500">{course.teacherName} • {course.subject}</p>
                <p className="text-xs text-gray-400 mt-1">تم التحميل في: {new Date(course.downloadedAt).toLocaleDateString('ar-DZ')}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button 
                  onClick={(e) => handleDelete(course.id, e)}
                  className="p-2 text-gray-400 hover:text-dz-red hover:bg-dz-red/5 rounded-lg transition-colors"
                  title="حذف من التحميلات"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronLeft size={20} className="text-gray-300 group-hover:text-dz-green group-hover:translate-x-[-4px] transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offline;

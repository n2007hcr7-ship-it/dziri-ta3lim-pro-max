import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Course } from '../types';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Play, FileText, Star } from 'lucide-react';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    });
    return () => unsubscribe();
  }, []);

  const filteredCourses = courses.filter(c => 
    (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedLevel === 'all' || c.level === selectedLevel)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="text-dz-green" />
          استكشف الدروس
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن درس..."
              className="dz-input pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="dz-input w-auto bg-white"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="all">كل المستويات</option>
            <option value="primary">ابتدائي</option>
            <option value="middle">متوسط</option>
            <option value="secondary">ثانوي</option>
            <option value="university">جامعي</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <Link key={course.id} to={`/course/${course.id}`} className="dz-card group hover:scale-[1.02] transition-all">
            <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
              <img src={`https://picsum.photos/seed/${course.id}/400/225`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  {course.contentType === 'video' ? <Play size={24} fill="currentColor" /> : <FileText size={24} />}
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  course.isFree ? 'bg-dz-green text-white' : 'bg-dz-red text-white'
                }`}>
                  {course.isFree ? 'مجاني' : 'مدفوع'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-sm line-clamp-2">{course.title}</h3>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="font-bold text-dz-green">{course.subject}</span>
                <span>{course.level}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-dz-green/10 flex items-center justify-center text-[10px] font-bold text-dz-green">
                    {course.teacherName?.[0]}
                  </div>
                  <span className="text-[10px] font-bold">{course.teacherName}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Star size={10} className="text-yellow-500" fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-gray-400">لا توجد نتائج مطابقة لبحثك</div>
      )}
    </div>
  );
};

export default Courses;

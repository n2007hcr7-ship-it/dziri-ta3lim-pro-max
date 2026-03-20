import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Group } from '../types';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronLeft, Star, ShieldCheck } from 'lucide-react';

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
    });
    return () => unsubscribe();
  }, []);

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-dz-green" />
          الأفواج الدراسية
        </h1>
        <div className="relative md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث عن فوج..."
            className="dz-input pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Link key={group.id} to={`/group/${group.id}`} className="dz-card hover:border-dz-green transition-all space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-dz-green/10 text-dz-green rounded-2xl flex items-center justify-center">
                <Users size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{group.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{group.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-dz-green/10 flex items-center justify-center text-xs font-bold text-dz-green">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold">أ. أحمد علي</span>
                  <span className="text-[8px] text-gray-400">أستاذ رياضيات</span>
                </div>
              </div>
              <div className="text-dz-green">
                <ChevronLeft size={20} />
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500" /> 4.8</span>
              <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-dz-green" /> أستاذ موثق</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-20 text-gray-400">لا توجد أفواج حالياً</div>
      )}
    </div>
  );
};

export default Groups;

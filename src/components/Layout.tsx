import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Home, 
  BookOpen, 
  Users, 
  Wallet, 
  User, 
  LogOut, 
  Bell, 
  Search,
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Video,
  DownloadCloud,
  CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/courses', icon: BookOpen, label: 'الدروس' },
    { path: '/groups', icon: Users, label: 'الأفواج' },
    { path: '/offline', icon: DownloadCloud, label: 'التحميلات' },
    { path: '/wallet', icon: Wallet, label: 'المحفظة' },
    { path: '/profile', icon: User, label: 'حسابي' },
    { path: '/payment', icon: CreditCard, label: 'تفعيل الحساب' },
  ];

  if (profile?.role === 'teacher') {
    navItems.splice(1, 0, { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' });
    navItems.splice(2, 0, { path: '/upload', icon: PlusCircle, label: 'نشر درس' });
  }

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0 md:pr-64">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex fixed right-0 top-0 h-full w-64 bg-white border-l border-gray-100 flex-col z-50">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-dz-green flex items-center gap-2">
            <span className="bg-dz-green text-white p-1 rounded-lg">DZ</span>
            دزيري تعليم
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-dz-green text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dz-red hover:bg-dz-red/5 w-full transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-dz-green hover:bg-dz-green/5 w-full transition-all"
            >
              <User size={20} />
              <span className="font-medium">تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-4 py-3 flex items-center justify-between">
        <div className="md:hidden">
          <Link to="/" className="text-xl font-bold text-dz-green flex items-center gap-2">
            <span className="bg-dz-green text-white p-1 rounded-lg">DZ</span>
            دزيري تعليم
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن أستاذ أو درس..."
              className="dz-input pr-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
            <Bell size={22} />
            <span className="absolute top-2 left-2 w-2 h-2 bg-dz-red rounded-full border-2 border-white"></span>
          </button>
          {profile && (
            <div className="flex items-center gap-2">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold">{profile.fullName}</p>
                <p className="text-xs text-gray-500">{profile.walletBalance} دج</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-dz-green/10 flex items-center justify-center text-dz-green font-bold">
                {profile.fullName[0]}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex items-center justify-around py-3 z-50">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? 'text-dz-green' : 'text-gray-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

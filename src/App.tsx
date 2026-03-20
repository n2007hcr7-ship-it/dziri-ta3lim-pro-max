import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import Groups from './pages/Groups';
import Payment from './pages/Payment'; // تأكد من استيراد صفحة الدفع
import Offline from './pages/Offline';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route path="/" element={<Home />} />
          
          {/* صفحة تفعيل الحساب (الدفع) */}
          <Route path="/payment" element={<Payment />} />
          
          {/* بقية الصفحات */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/groups" element={<Groups />} />
          {/* صفحات إضافية */}
<Route path="/offline" element={<Offline />} />
<Route path="/wallet" element={<Wallet />} />
<Route path="/profile" element={<Profile />} />
<Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          {/* في حال كتابة رابط خاطئ، يعود للرئيسية */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
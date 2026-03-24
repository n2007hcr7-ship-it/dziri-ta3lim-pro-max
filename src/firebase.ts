import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // استيراد قاعدة البيانات الجديدة
import { getStorage } from 'firebase/storage';

// الإعدادات المباشرة لضمان عملها على GitHub Pages
const firebaseConfig = {
  apiKey: "AIzaSyC0TAESL0Ef7FtdFLX6-6zY5mASLXISxg8",
  authDomain: "dziry-learning-app.firebaseapp.com",
  databaseURL: "https://dziry-learning-app-default-rtdb.firebaseio.com/", // أضفنا هذا السطر يدوياً
  projectId: "dziry-learning-app",
  storageBucket: "dziry-learning-app.firebasestorage.app",
  messagingSenderId: "646176534722",
  appId: "1:646176534722:web:1200f09165d8a5e63acb5b",
  measurementId: "G-F5J8P4YQ8C"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app); // تغيير من getFirestore إلى getDatabase
export const storage = getStorage(app);

export default app;
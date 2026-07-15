import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore, terminate } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * @fileOverview إعدادات الفايربيز المطورة - تم تحسين التهيئة لمنع خطأ Unexpected response في أجهزة سامسونج.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

// تهيئة التطبيق مرة واحدة فقط لضمان الاستقرار
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;

if (typeof window !== "undefined") {
  // للعملاء (المتصفح): نستخدم تهيئة معزولة تضمن تجاوز قيود أجهزة سامسونج
  try {
    // محاولة الحصول على النسخة الموجودة مسبقاً لتجنب تعارض الإعدادات
    db = getFirestore(app);
    // ملاحظة: لا يمكن تغيير الإعدادات بعد التهيئة الأولى، لذا نعتمد على الضبط التلقائي أو التهيئة المتخصصة
  } catch (e) {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
} else {
  // للسيرفر (Node.js): تهيئة كلاسيكية لمنع الـ Internal Server Error
  db = getFirestore(app);
}

const auth = getAuth(app);

export { db, auth, firebaseConfig };

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز المطورة - نسخة الاستقرار القصوى (V17).
 * تم حل مشكلة "An unexpected response" جذرياً عبر فصل إعدادات المتصفح عن السيرفر.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

// تهيئة التطبيق الأساسي
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;

// الحل الجذري: لا نستخدم initializeFirestore أكثر من مرة، ونميز بين البيئات
if (typeof window !== "undefined") {
    // بيئة المتصفح (الموبايل): فرض Long Polling لضمان الاستقرار في الشبكات الضعيفة
    try {
        db = initializeFirestore(app, {
            experimentalForceLongPolling: true,
        });
    } catch (e) {
        db = getFirestore(app);
    }
} else {
    db = getFirestore(app);
}

const auth = getAuth(app);

// دالة جلب Messaging بأمان لمنع الانهيار
export const getMessagingSafe = async () => {
    if (typeof window !== "undefined" && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

export { db, auth, firebaseConfig };
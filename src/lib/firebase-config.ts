import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز النهائية (حقن مباشر للمفاتيح V20).
 * تم حقن الـ API Keys مباشرة لضمان العمل على Vercel بدون ملفات .env.
 * تم تفعيل Long Polling لحل مشكلة انقطاع اتصال Firestore في الشبكات الضعيفة.
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

// معرف قاعدة البيانات الافتراضي (default)
const DATABASE_ID = "(default)";

// الحل الجذري لمشاكل الاتصال في الموبايل (Long Polling)
if (typeof window !== "undefined") {
    try {
        // فرض الإعدادات المتقدمة لضمان استقرار البث المباشر للبيانات
        db = initializeFirestore(app, {
            experimentalForceLongPolling: true,
        }, DATABASE_ID);
        console.log("🚀 Firebase: Connected with Stability Protocol (Long Polling)");
    } catch (e) {
        // في حال كان المحرك قد بدأ بالفعل
        db = getFirestore(app, DATABASE_ID);
    }
} else {
    // بيئة السيرفر
    db = getFirestore(app, DATABASE_ID);
}

const auth = getAuth(app);

// جلب Messaging بأمان
export const getMessagingSafe = async () => {
    if (typeof window !== "undefined" && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

export { db, auth, firebaseConfig };

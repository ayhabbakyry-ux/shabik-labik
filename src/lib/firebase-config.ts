import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز المطورة - نسخة الاستقرار القصوى (V18).
 * تم حل مشكلة انقطاع اتصال WebChannelConnection RPC 'Listen' stream عبر فرض Long Polling.
 * تم تحديد معرف قاعدة البيانات بشكل صريح لضمان استقرار العمليات في كافة الشبكات.
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

// معرف قاعدة البيانات الافتراضي (default) لضمان الربط الصحيح
const DATABASE_ID = "(default)";

// الحل الجذري لمشاكل الاتصال في بيئة المتصفح (الموبايل والشبكات الضعيفة)
if (typeof window !== "undefined") {
    try {
        // استخدام initializeFirestore لفرض الإعدادات المتقدمة (Long Polling)
        db = initializeFirestore(app, {
            experimentalForceLongPolling: true,
            // منع تعارض القنوات في المتصفحات التي تدعم الاتصال المتعدد
        }, DATABASE_ID);
        console.log("🔥 Firestore Initialized with Long Polling");
    } catch (e) {
        // في حال كان المحرك قد بدأ بالفعل، نستخدم getFirestore مباشرة
        db = getFirestore(app, DATABASE_ID);
    }
} else {
    // بيئة السيرفر (SSR) - لا نحتاج لـ Long Polling هنا
    db = getFirestore(app, DATABASE_ID);
}

const auth = getAuth(app);

// دالة جلب Messaging بأمان لمنع انهيار الموقع في البيئات غير المدعومة (مثل Incognito)
export const getMessagingSafe = async () => {
    if (typeof window !== "undefined" && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

export { db, auth, firebaseConfig };

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز المستقرة - نسخة التوافق العالي للسيرفر والعميل.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

// تهيئة التطبيق الأساسي مع ضمان عدم التكرار SSR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// تهيئة قاعدة البيانات بشكل قياسي
export const db = getFirestore(app);
export const auth = getAuth(app);

// جلب Messaging بأمان للتوافق مع المتصفحات فقط
export const getMessagingSafe = async () => {
    if (typeof window !== "undefined" && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

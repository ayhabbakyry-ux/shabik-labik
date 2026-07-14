import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز الأساسية - تم تحسينها لضمان استقرار الاتصال في الأجهزة الضعيفة.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;
if (typeof window !== "undefined") {
  try {
    // تفعيل Long Polling بشكل صارم لضمان استقرار أجهزة سامسونج ومنع خطأ "Could not reach backend"
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false // تعطيل Fetch Streams لزيادة التوافق مع المتصفحات القديمة
    });
  } catch (e) {
    db = getFirestore(app);
  }
} else {
  // السيرفر يستخدم التهيئة العادية لمنع Internal Server Error
  db = getFirestore(app);
}

const auth = getAuth(app);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { db, auth, messaging, firebaseConfig };

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز المطورة - تم تأمين التهيئة لمنع الـ Internal Server Error وضمان استقرار السامسونج.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

// تهيئة التطبيق مرة واحدة فقط لمنع تعارض السيرفر
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;

if (typeof window !== "undefined") {
  // تهيئة الفايربيز للمتصفح مع ضمان عدم التكرار
  try {
    db = getFirestore(app);
    // محاولة تفعيل Long Polling لثبات أجهزة سامسونج دون التسبب بانهيار
    initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // إذا كانت مهيأة مسبقاً، نستخدم النسخة الموجودة
    db = getFirestore(app);
  }
} else {
  // تهيئة السيرفر (Vercel) بشكل نقي لمنع الـ 500 Error
  db = getFirestore(app);
}

const auth = getAuth(app);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { db, auth, messaging, firebaseConfig };

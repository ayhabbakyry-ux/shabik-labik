
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز الأساسية - تم تحسين التهيئة لمنع Internal Server Error وعزل إعدادات الموبايل.
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

// تهيئة Firestore بطريقة تمنع الانهيار الداخلي (Internal Server Error) وتدعم أجهزة سامسونج
let db: Firestore;
if (typeof window !== "undefined") {
  try {
    // على المتصفح فقط: نستخدم Long Polling لضمان استقرار أجهزة سامسونج وإنفينيكس
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    db = getFirestore(app);
  }
} else {
  // على السيرفر: نستخدم التهيئة العادية لمنع أخطاء الـ 500
  db = getFirestore(app);
}

const auth = getAuth(app);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { db, auth, messaging, firebaseConfig };

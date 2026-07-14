import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore, terminate } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * @fileOverview إعدادات الفايربيز البرقية - تم تحسين التهيئة لضمان استجابة لحظية بلمح البصر.
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
  // للعملاء (المتصفح): نستخدم تهيئة مخصصة تضمن عمل أجهزة سامسونج بلمح البصر
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    db = getFirestore(app);
  }
} else {
  // للسيرفر: تهيئة كلاسيكية لمنع الـ 500 Error
  db = getFirestore(app);
}

const auth = getAuth(app);

export { db, auth, firebaseConfig };

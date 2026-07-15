import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * @fileOverview إعدادات الفايربيز المطورة - نسخة الاستقرار القصوى (V16).
 * تم فرض بروتوكول Long Polling على كافة المنصات لحل مشكلة "An unexpected response" في أجهزة Infinix وSamsung.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

// تهيئة التطبيق مرة واحدة
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;

// فرض بروتوكول Long Polling بشكل قاطع لتجاوز قيود الشبكات وأجهزة الأندرويد
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  // في حال كان الفايربيز مشغلاً مسبقاً، نستخدم النسخة الموجودة
  db = getFirestore(app);
}

const auth = getAuth(app);

export { db, auth, firebaseConfig };

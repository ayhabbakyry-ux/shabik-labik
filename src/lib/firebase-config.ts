import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز الأساسية - تم تحسين التهيئة لمنع Internal Server Error.
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

// تهيئة Firestore بطريقة تمنع تكرار التهيئة وتدعم أجهزة سامسونج
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  db = getFirestore(app);
}

const auth = getAuth(app);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { db, auth, messaging, firebaseConfig };

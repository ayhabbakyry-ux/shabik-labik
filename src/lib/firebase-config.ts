import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز الأساسية - تم تحديثها لدعم الإشعارات (Messaging).
 */

const firebaseConfig = {
  apiKey: "AIzaSyBCpBxbVjDl9C8XvVFN18DV",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export { db, auth, messaging, firebaseConfig };
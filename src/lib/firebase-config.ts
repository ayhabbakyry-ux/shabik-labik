import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

/**
 * @fileOverview إعدادات الفايربيز المسرعة - نسخة الاستقرار العالي V11.
 * تفعيل Long Polling لضمان عمل الإيداع في أجهزة السامسونج والانفينكس دون تضارب مع الإشعارات.
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

// تفعيل التخزين المحلي مع Long Polling لحل مشكلة السامسونج نهائياً
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalForceLongPolling: true // حل مشكلة تعليق الإيداع في أجهزة Samsung و Infinix
});

export const auth = getAuth(app);

export const getMessagingSafe = async () => {
    if (typeof window !== "undefined" && await isSupported()) {
        return getMessaging(app);
    }
    return null;
};

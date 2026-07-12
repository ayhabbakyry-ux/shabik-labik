
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// إعدادات الفايربيز الموحدة لاستقبال إشعارات الخلفية
const firebaseConfig = {
  apiKey: "AIzaSyBCpBxbVjDl9C8XvVFN18DV",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// التعامل مع الإشعارات عندما يكون الموقع مغلقاً (Background)
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'تحديث من شبيك لبيك';
  const notificationOptions = {
    body: payload.notification.body || 'لديك تحديث جديد في حسابك.',
    icon: 'https://picsum.photos/seed/genie/200/200',
    badge: 'https://picsum.photos/seed/genie/100/100',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

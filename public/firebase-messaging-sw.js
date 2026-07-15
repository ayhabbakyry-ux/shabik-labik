
// @fileOverview محرك إشعارات الخلفية - نسخة الاستقرار القصوى
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// معالجة الرسائل عندما يكون التطبيق في الخلفية أو مغلقاً
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || "تنبيه من شبيك لبيك";
  const notificationOptions = {
    body: payload.notification.body || "لديك تحديث جديد في حسابك",
    icon: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg',
    badge: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg',
    vibrate: [200, 100, 200],
    data: {
        url: '/dashboard'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// التعامل مع الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

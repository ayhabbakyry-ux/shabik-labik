
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

/**
 * @fileOverview ملف الخدمة الخلفي - مسؤول عن عرض الإشعارات في "ستارة الموبايل" حتى لو كان الموقع مغلقاً.
 */

firebase.initializeApp({
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
});

const messaging = firebase.messaging();

// معالجة الرسائل عندما يكون المتصفح في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || payload.data.title || "تنبيه جديد - شبيك لبيك";
  const notificationOptions = {
    body: payload.notification.body || payload.data.body || "لديك تحديث جديد في حسابك.",
    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
    badge: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
    vibrate: [200, 100, 200],
    tag: 'shabik-labik-notification',
    renotify: true,
    data: {
      url: payload.data?.url || '/history'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// التعامل مع النقر على الإشعار في ستارة الموبايل
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

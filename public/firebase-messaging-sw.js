
// @fileOverview Service Worker لإشعارات شبيك لبيك الرقمي - يعمل في الخلفية حتى لو التطبيق مغلق.

importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js');

// ملاحظة لأيهم: القيم هنا لا تحتاج تغيير لأن الـ SW يحتاج فقط لربط الإشعار بالخلفية.
firebase.initializeApp({
  apiKey: "AIzaSyBCpbXvIDJl9C8XvVFNl8DViQEC8msCgBU",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
});

const messaging = firebase.messaging();

// التقاط الرسائل في الخلفية وإظهارها Native في ستارة الموبايل
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || "تنبيه جديد من شبيك لبيك";
  const notificationOptions = {
    body: payload.notification.body || "اضغط للتفاصيل",
    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
    badge: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
    data: { url: payload.data?.url || '/history' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// التعامل مع الضغط على الإشعار
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

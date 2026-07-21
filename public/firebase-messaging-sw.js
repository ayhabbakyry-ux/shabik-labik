
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

// معالجة الرسائل في الخلفية (عندما يكون التطبيق مغلقاً)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background Message received: ', payload);
  
  const notificationTitle = payload.notification.title || payload.data.title;
  const notificationOptions = {
    body: payload.notification.body || payload.data.body,
    icon: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg',
    badge: 'https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg',
    data: {
        url: payload.data.url || payload.data.click_action || '/history'
    },
    vibrate: [200, 100, 200],
    tag: 'shabik-labik-notification',
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// التعامل مع نقرة الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

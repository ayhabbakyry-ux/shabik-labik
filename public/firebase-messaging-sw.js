
// @ts-nocheck
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

// معالجة الإشعارات في الخلفية (عندما يكون التطبيق مغلقاً)
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "إشعار من شبيك لبيك";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "لديك تحديث جديد في حسابك",
    icon: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
    badge: "https://i.postimg.cc/C1bjq1Wh/Screenshot-20260710-202636.jpg",
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

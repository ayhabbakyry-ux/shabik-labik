
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBCpBxbVjDl9C8XvVFN18DV",
  authDomain: "studio-4603707742-d33ce.firebaseapp.com",
  projectId: "studio-4603707742-d33ce",
  storageBucket: "studio-4603707742-d33ce.appspot.com",
  messagingSenderId: "723678552538",
  appId: "1:723678552538:web:579e6791a1211c7998e0e3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "تحديث من شبيك لبيك";
  const notificationOptions = {
    body: payload.notification?.body || "لديك تحديث جديد في حالة طلبك.",
    icon: "https://picsum.photos/seed/genie/200/200",
    badge: "https://picsum.photos/seed/genie/100/100"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

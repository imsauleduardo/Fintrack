importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "TU_API_KEY",
    authDomain: "fintrack-xxxxx.firebaseapp.com",
    projectId: "fintrack-xxxxx",
    storageBucket: "fintrack-xxxxx.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Mensaje en background:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
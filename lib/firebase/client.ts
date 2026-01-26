import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: any = null;
let messaging: any = null;

// Inicializar solo en el cliente
if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
}

export async function requestNotificationPermission() {
    if (!messaging || !process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
        console.log('Firebase no configurado - notificaciones deshabilitadas');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });
            return token;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener token FCM:', error);
        return null;
    }
}

export function onMessageListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        console.log('Mensaje recibido:', payload);
        // Aquí puedes mostrar una notificación personalizada
    });
}
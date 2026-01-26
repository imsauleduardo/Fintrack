import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const initFirebase = () => {
    if (typeof window !== "undefined" && !getApps().length) {
        // Solo inicializar si todas las variables de entorno están configuradas
        if (firebaseConfig.apiKey && firebaseConfig.projectId) {
            return initializeApp(firebaseConfig);
        } else {
            console.warn("Firebase no configurado - variables de entorno faltantes");
            return null;
        }
    }
};

export const requestForToken = async () => {
    // Verificar que Firebase esté configurado
    if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
        console.warn("Firebase VAPID key no configurada - notificaciones push deshabilitadas");
        return null;
    }

    try {
        const app = initFirebase();
        if (!app) return null;

        const messaging = getMessaging(app);

        // Solicitar permiso de notificaciones
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log("Permiso de notificaciones denegado");
            return null;
        }

        const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (currentToken) {
            console.log("Token FCM obtenido exitosamente");
            return currentToken;
        } else {
            console.log("No se pudo obtener el token FCM");
            return null;
        }
    } catch (err) {
        console.error("Error al obtener token FCM:", err);
        return null;
    }
};

export const onMessageListener = () => {
    return new Promise((resolve) => {
        const app = initFirebase();
        if (!app) return;

        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
            console.log("Mensaje recibido:", payload);
            resolve(payload);
        });
    });
};
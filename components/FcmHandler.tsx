"use client";

import { useFcm } from "@/hooks/use-fcm";

export default function FcmHandler() {
    // Solo activar FCM si Firebase está configurado
    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        useFcm();
    }

    return null; // Este componente no renderiza nada
}
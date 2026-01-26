"use client";

import { useEffect } from 'react';
import { initFirebase, requestForToken } from '@/lib/firebase';
import { supabase } from '@/supabase/client';

export const useFcm = () => {
    useEffect(() => {
        const setupFCM = async () => {
            // Verificar que estamos en el navegador y que soporta notificaciones
            if (typeof window === "undefined" || !("Notification" in window)) {
                console.log("Notificaciones no soportadas en este navegador");
                return;
            }

            // Verificar que Firebase esté configurado
            if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                console.log("Firebase no configurado - saltando configuración de FCM");
                return;
            }

            try {
                // Inicializar Firebase
                const app = initFirebase();
                if (!app) {
                    console.log("Firebase no se pudo inicializar");
                    return;
                }

                // Solicitar token (esto pide permiso al usuario)
                const token = await requestForToken();

                if (token) {
                    // Obtener usuario actual
                    const { data: { user } } = await supabase.auth.getUser();

                    if (user) {
                        // Guardar el token en la base de datos
                        const { error } = await supabase
                            .from('users')
                            .update({ fcm_token: token })
                            .eq('id', user.id);

                        if (error) {
                            console.error("Error al guardar token FCM:", error);
                        } else {
                            console.log("Token FCM guardado exitosamente");
                        }
                    }
                } else {
                    console.log("No se obtuvo token FCM - usuario probablemente rechazó permisos");
                }
            } catch (error) {
                console.error("Error en setupFCM:", error);
            }
        };

        // Ejecutar setup con un pequeño delay para evitar problemas de hidratación
        const timer = setTimeout(() => {
            setupFCM();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);
};
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

interface UserContextType {
    currency: string;
    currencySymbol: string;
    refreshProfile: () => Promise<void>;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
    currency: "USD",
    currencySymbol: "$",
    refreshProfile: async () => { },
    isLoading: true,
});

export const useUser = () => useContext(UserContext);

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    EUR: "€",
    MXN: "$",
    PEN: "S/",
};

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState("USD");
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("users")
                .select("default_currency")
                .eq("id", user.id)
                .single();

            if (data?.default_currency) {
                setCurrency(data.default_currency);
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshProfile();

        // Listen for auth state changes to reload profile
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            refreshProfile();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";

    return (
        <UserContext.Provider value={{ currency, currencySymbol, refreshProfile, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

"use server";

import { google } from "googleapis";
import { createClient } from "@/supabase/server";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export async function getGoogleAuthUrl() {
    const scopes = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
    });

    return url;
}

export async function disconnectGmail() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from("gmail_tokens")
        .delete()
        .eq("user_id", user.id);

    if (error) throw new Error("Error al desconectar Gmail");
}
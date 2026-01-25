import { google } from "googleapis";
import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) return NextResponse.redirect(new URL("/dashboard", request.url));

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user && userInfo.data.email) {
            const { error } = await supabase
                .from("gmail_tokens")
                .upsert({
                    user_id: user.id,
                    email: userInfo.data.email,
                    access_token: tokens.access_token!,
                    refresh_token: tokens.refresh_token!,
                    expiry_date: tokens.expiry_date,
                });

            if (error) console.error("Error saving tokens:", error);
        }

        return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) {
        console.error("Error in Google Callback:", error);
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
}
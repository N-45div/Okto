import { NextResponse } from "next/server";
import { postSignedRequest } from "../../helper/postSignedRequest";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;
        if (!email) {
            return NextResponse.json({ error: "Missing email" }, { status: 400 });
        }
        // Call the real Okto sendOtp logic (using postSignedRequest) with the provided email.
        const payload = { email, client_swa: process.env.NEXT_PUBLIC_OKTO_CLIENT_SWA };
        console.log("Request Body:", {
            data: { ...payload, timestamp: Date.now() - 1000 },
            type: "ethsign"
        });
        const res = await postSignedRequest("https://sandbox-api.okto.tech/api/oc/v1/authenticate/email", payload);
        console.log("Okto sendOtp response:", res);
        // (Note: sendOtp in the template is a wrapper that uses a hardcoded email; here we use the payload from the request.)
        // (In a real implementation, you might refactor emailAuthenticate_template.ts so that sendOtp accepts an email parameter.)
        // (For now, we mimic the template's postSignedRequest call.)
        if (res && res.data && res.data.token) {
            return NextResponse.json({ status: "success", token: res.data.token });
        } else {
            return NextResponse.json({ error: "Failed to send OTP", details: res }, { status: 500 });
        }
    } catch (err: any) {
        console.error("Error in /api/auth/emailAuthenticate:", err);
        return NextResponse.json({ error: err.message || "Email OTP send failed" }, { status: 500 });
    }
} 
import { NextResponse } from "next/server";
import { postSignedRequest } from "../../../helper/postSignedRequest";
import { loginUsingOAuth } from "../../../utils/generateOktoAuthToken";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Verify OTP request body:", body);
        const { email, token, otp } = body;
        if (!email || !token || !otp) {
            return NextResponse.json({ error: "Missing email, token, or OTP" }, { status: 400 });
        }
        // Call the Okto verifyOtp logic
        const payload = { email, token, otp, client_swa: process.env.OKTO_CLIENT_SWA };
        const res = await postSignedRequest("https://sandbox-api.okto.tech/api/oc/v1/authenticate/email/verify", payload);
        console.log("Okto verify response:", res);

        if (res && res.data && res.data.auth_token) {
            try {
                // Call loginUsingOAuth to generate session info
                const sessionConfig = await loginUsingOAuth(res.data.auth_token, "okto");
                return NextResponse.json({
                    status: "success",
                    user: {
                        userSWA: sessionConfig.userSWA || "",
                        sessionPrivKey: sessionConfig.sessionPrivKey || "",
                        sessionPubKey: sessionConfig.sessionPubKey || "",
                    },
                });
            } catch (authError: any) {
                console.error("Error in loginUsingOAuth:", authError);
                return NextResponse.json(
                    {
                        error: "Failed to create session",
                        details: authError?.response?.data || authError.message || "Unknown error in session creation",
                    },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json({ error: "Failed to verify OTP", details: res }, { status: 400 });
        }
    } catch (err: any) {
        console.error("Error in /api/auth/emailAuthenticate/verify:", err);
        return NextResponse.json(
            {
                error: "Email OTP verification failed",
                details: err?.response?.data || err.message || "Unknown error",
            },
            { status: 400 }
        );
    }
}
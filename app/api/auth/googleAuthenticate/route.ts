import { NextResponse } from 'next/server';
import { loginUsingOAuth } from '../../utils/generateOktoAuthToken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token } = body;
        if (!token) {
            return NextResponse.json({ error: 'Missing Google ID token' }, { status: 400 });
        }
        // Call the real Okto login logic
        const sessionConfig = await loginUsingOAuth(token, 'google');
        return NextResponse.json({
            status: 'success',
            user: {
                userSWA: sessionConfig.userSWA || '',
                sessionPrivKey: sessionConfig.sessionPrivKey || '',
                sessionPubKey: sessionConfig.sessionPubKey || '',
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Google authentication failed' }, { status: 500 });
    }
} 
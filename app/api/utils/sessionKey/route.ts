import { NextResponse } from 'next/server';
import { SessionKey } from '../sessionKey';

export async function GET() {
    // Generate a new session key each time (for demo/demo purposes)
    const session = SessionKey.create();
    return NextResponse.json({
        privateKey: session.privateKeyHexWith0x,
        publicKey: session.uncompressedPublicKeyHexWith0x,
        ethereumAddress: session.ethereumAddress,
    });
} 
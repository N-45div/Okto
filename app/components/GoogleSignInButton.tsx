import { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
    onSuccess: (idToken: string) => void;
    disabled?: boolean;
}

export default function GoogleSignInButton({ onSuccess, disabled }: GoogleSignInButtonProps) {
    const buttonDiv = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!(window as any).google || !buttonDiv.current) return;
        (window as any).google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            callback: (response: any) => {
                if (response.credential) {
                    onSuccess(response.credential);
                }
            },
        });
        // @ts-ignore
        window.google.accounts.id.renderButton(buttonDiv.current, {
            theme: 'outline',
            size: 'large',
            width: 260,
        });
    }, [onSuccess]);

    return <div ref={buttonDiv} style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }} />;
} 
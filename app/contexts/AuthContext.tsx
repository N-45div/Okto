"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, sessionService } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    loading: boolean;
    error: string | null;
    loginWithGoogle: (token: string) => Promise<void>;
    loginWithEmail: (email: string) => Promise<{ token: string }>;
    verifyOTP: (email: string, otp: string, token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing session on mount
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const sessionKey = await sessionService.getSessionKey();
            if (sessionKey) {
                setIsAuthenticated(true);
                setUser(sessionKey);
            }
        } catch (err) {
            console.error('Session check failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (token: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.googleAuth(token);
            setIsAuthenticated(true);
            setUser(response.user);
        } catch (err: any) {
            setError(err.message || 'Google authentication failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loginWithEmail = async (email: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.emailAuth(email);
            return response; // Return { token: string }
        } catch (err: any) {
            setError(err.message || 'Email authentication failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async (email: string, otp: string, token: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.verifyEmailOTP(email, otp, token);
            setIsAuthenticated(true);
            setUser(response.user);
        } catch (err: any) {
            setError(err.message || 'OTP verification failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        // Additional cleanup if needed
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                loading,
                error,
                loginWithGoogle,
                loginWithEmail,
                verifyOTP,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
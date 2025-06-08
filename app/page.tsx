"use client"

import Image from "next/image";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleSignInButton from './components/GoogleSignInButton';
import { useAuth } from './contexts/AuthContext';

const TABS = [
  { label: 'Google', value: 'google' },
  { label: 'Email', value: 'email' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'JWT', value: 'jwt' },
];

export default function Home() {
  const [tab, setTab] = useState('google');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, verifyOTP, loading, error, isAuthenticated } = useAuth();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailStep, setEmailStep] = useState<'input' | 'otp'>('input');

  // Google login handler
  const handleGoogleSuccess = async (idToken: string) => {
    try {
      await loginWithGoogle(idToken);
      router.push('/home');
    } catch (err) {
      // error handled in context
    }
  };

  // Email OTP flow
  const handleSendOtp = async () => {
    setEmailError(null);
    try {
      const response = await loginWithEmail(email);
      setOtpToken(response.token);
      setOtpSent(true);
      setEmailStep('otp');
    } catch (err: any) {
      setEmailError(err?.response?.data?.error || err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setEmailError(null);
    try {
      if (!otpToken) throw new Error('OTP token missing');
      await verifyOTP(email, otp, otpToken);
      router.push('/home');
    } catch (err: any) {
      setEmailError(err?.response?.data?.error || err.message || 'Invalid OTP or session creation failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#181C27] flex flex-col">
      {/* Top Bar */}
      <header className="w-full h-16 flex items-center px-8 bg-[#23283B] border-b border-[#23283B]">
        <div className="flex items-center gap-3">
          <Image src="/icon.svg" alt="Okto Logo" width={40} height={40} />
        </div>
        <div className="flex-1 text-center">
          <span className="text-lg font-semibold text-white tracking-wide">Okto API Demo</span>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex border-b border-[#23283B] mb-2">
            {TABS.map((t) => (
              <button
                key={t.value}
                className={`flex-1 py-2 text-sm font-medium text-[#A3AED0] transition-colors border-b-2 ${tab === t.value
                  ? 'border-[#5B6CFF] text-[#5B6CFF] bg-[#23283B]' : 'border-transparent'
                  }`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="bg-[#23283B] rounded-xl shadow-lg p-8 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome to Okto</h2>
            {tab === 'google' && (
              <>
                <p className="text-[#A3AED0] text-center mb-4">Sign in with your Google account</p>
                <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={loading} />
                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
              </>
            )}
            {tab === 'email' && (
              <>
                {emailStep === 'input' && (
                  <div className="w-full flex flex-col gap-3">
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded bg-[#181C27] text-white border border-[#23283B] focus:outline-none"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="w-full px-4 py-2 rounded bg-[#5B6CFF] text-white font-semibold hover:bg-[#6C7CFF] transition"
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </div>
                )}
                {emailStep === 'otp' && (
                  <div className="w-full flex flex-col gap-3">
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded bg-[#181C27] text-white border border-[#23283B] focus:outline-none"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="w-full px-4 py-2 rounded bg-[#5B6CFF] text-white font-semibold hover:bg-[#6C7CFF] transition"
                      onClick={handleVerifyOtp}
                      disabled={loading || !otp}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                )}
                {emailError && <div className="text-red-400 text-sm mt-2">{emailError}</div>}
              </>
            )}
            {tab !== 'google' && tab !== 'email' && (
              <div className="text-[#A3AED0] text-center">Coming soon</div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <button
              className="px-6 py-2 rounded bg-[#5B6CFF] text-white font-semibold hover:bg-[#6C7CFF] transition disabled:bg-[#4B5BFF] disabled:cursor-not-allowed"
              onClick={() => router.push('/home')}
              disabled={!isAuthenticated}
            >
              Go to homepage
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
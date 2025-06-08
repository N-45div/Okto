"use client";
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Fallbacks for loading or missing user
    const userSWA = user?.userSWA || '...';

    return (
        <div className="min-h-screen bg-[#f3f0ff] flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-16 flex items-center px-8 bg-[#374151] z-10 shadow text-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3">
                    <Image src="/icon.svg" alt="Okto Logo" width={40} height={40} />
                </div>
                <div className="flex-1 text-center">
                    <span className="text-lg font-semibold tracking-wide">Okto API Demo</span>
                </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8">
                <div className="w-full max-w-2xl flex flex-col gap-8">
                    {/* User Details Card */}
                    <section className="bg-white rounded-lg shadow p-6 mb-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-xl font-bold mb-4 text-[#7c3aed]">User Details</h2>
                        <div className="text-[#22223b] font-medium mb-2">Logged in</div>
                        {loading ? (
                            <div className="text-gray-400">Loading...</div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="text-sm text-[#374151]">
                                    <span className="font-semibold">userSWA:</span>
                                    <span className="ml-2 font-mono break-all">{userSWA}</span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Session Card */}
                    <section className="bg-white rounded-lg shadow p-6 mb-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-xl font-bold mb-4 text-[#7c3aed]">Session</h2>
                        <div className="flex gap-4">
                            <button
                                className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-md py-3 px-6 font-semibold transition-colors"
                                onClick={() => console.log('Okto Log out')}
                            >
                                Okto Log out
                            </button>
                            <button
                                className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-md py-3 px-6 font-semibold transition-colors"
                                onClick={() => console.log('Show Session Info')}
                            >
                                Show Session Info
                            </button>
                        </div>
                    </section>

                    {/* Intents Card */}
                    <section className="bg-white rounded-lg shadow p-6 mt-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-xl font-bold mb-4 text-[#7c3aed]">Intents</h2>
                        <div className="flex justify-center mt-4">
                            <button
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md py-3 px-8 font-semibold transition-colors"
                                onClick={() => router.push('/transfertoken')}
                                style={{ transition: 'background 0.2s' }}
                            >
                                Transfer Token
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
} 
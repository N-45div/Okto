"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import { transferTokenAPI } from '../services/api';

export default function TransferTokenPage() {
    const { user, loading: authLoading } = useAuth();
    const { tokens, chains, loading: tokenLoading, error: tokenError } = useToken();

    const [chain, setChain] = useState('');
    const [token, setToken] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    // Optional: Manual sessionConfig input for testing
    const [useManualConfig, setUseManualConfig] = useState(false);
    const [manualUserSWA, setManualUserSWA] = useState('');
    const [manualSessionPrivKey, setManualSessionPrivKey] = useState('');
    const [manualSessionPubKey, setManualSessionPubKey] = useState('');

    // Set default chain and token when loaded
    useEffect(() => {
        if (chains.length && !chain) setChain(chains[0].id.toString());
    }, [chains, chain]);

    useEffect(() => {
        if (tokens.length && !token) setToken(tokens[0].address);
    }, [tokens, token]);

    useEffect(() => {
        // Check for missing user data or token data
        if (!authLoading && !user) {
            setError("Please log in to perform a token transfer");
        } else if (!authLoading && user && (!user.userSWA || !user.sessionPrivKey || !user.sessionPubKey)) {
            setError("Incomplete session configuration. Please re-authenticate.");
        } else if (!tokenLoading && (!chains.length || !tokens.length)) {
            setError(tokenError || "Failed to load chains or tokens. Check OKTO_AUTH_TOKEN or network connection.");
        } else {
            setError(null);
        }
    }, [user, authLoading, chains, tokens, tokenLoading, tokenError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);
        setError(null);
        setSubmitting(true);

        try {
            // Prepare sessionConfig
            const sessionConfig = useManualConfig
                ? {
                    userSWA: manualUserSWA,
                    sessionPrivKey: manualSessionPrivKey,
                    sessionPubKey: manualSessionPubKey,
                }
                : {
                    userSWA: user?.userSWA || user?.data?.userSWA,
                    sessionPrivKey: user?.sessionPrivKey || user?.data?.sessionPrivKey,
                    sessionPubKey: user?.sessionPubKey || user?.data?.sessionPubKey,
                };

            // Validate sessionConfig
            if (!sessionConfig.userSWA || !sessionConfig.sessionPrivKey || !sessionConfig.sessionPubKey) {
                throw new Error("Missing session configuration data");
            }

            // Prepare payload for backend
            const payload = {
                caip2Id: chain,
                recipient,
                token,
                amount: Number(amount),
                sessionConfig,
            };

            console.log("Sending payload:", payload); // Debug payload

            const response = await transferTokenAPI(payload);
            setResult(response?.message || `Transfer submitted! Job ID: ${response.jobId}`);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || err.message || 'Transfer failed';
            const errorDetails = err?.response?.data?.details || '';
            setError(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f0ff] flex flex-col items-center">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full h-16 flex items-center px-8 bg-[#374151] z-10 shadow text-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div className="flex items-center gap-3">
                    <img src="/icon.svg" alt="Okto Logo" width={40} height={40} />
                </div>
                <div className="flex-1 text-center">
                    <span className="text-lg font-semibold tracking-wide">Okto API Demo</span>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 w-full">
                <div className="w-full max-w-lg">
                    <section className="bg-white rounded-lg shadow p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 className="text-xl font-bold mb-6 text-[#7c3aed] text-center">Transfer Token</h2>
                        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#374151]">Chain</label>
                                <select
                                    className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none text-black"
                                    value={chain}
                                    onChange={e => setChain(e.target.value)}
                                    required
                                    disabled={tokenLoading || authLoading}
                                >
                                    <option value="" style={{ color: '#000000' }}>Select a chain</option>
                                    {chains.map((c) => (
                                        <option key={c.id} value={c.id} style={{ color: '#000000' }}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#374151]">Token</label>
                                <select
                                    className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none text-black"
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    required
                                    disabled={tokenLoading || authLoading}
                                >
                                    <option value="" style={{ color: '#000000' }}>Native Token</option>
                                    {tokens.map((t) => (
                                        <option key={t.address} value={t.address} style={{ color: '#000000' }}>{t.symbol} ({t.name})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#374151]">Recipient Address</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none font-mono text-black"
                                    style={{ '::placeholder': { color: '#000000' } } as any}
                                    value={recipient}
                                    onChange={e => setRecipient(e.target.value)}
                                    required
                                    placeholder="0x..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#374151]">Amount</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none text-black"
                                    style={{ '::placeholder': { color: '#000000' } } as any}
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    required
                                    min={0}
                                    step={1}
                                    placeholder="Amount in lowest denomination"
                                />
                            </div>
                            {/* Optional: Manual sessionConfig input for testing */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[#374151]">
                                    <input
                                        type="checkbox"
                                        checked={useManualConfig}
                                        onChange={e => setUseManualConfig(e.target.checked)}
                                        className="mr-2"
                                    />
                                    Use Manual Session Config (for testing)
                                </label>
                                {useManualConfig && (
                                    <div className="flex flex-col gap-3 mt-2">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none font-mono text-black"
                                            style={{ '::placeholder': { color: '#000000' } } as any}
                                            value={manualUserSWA}
                                            onChange={e => setManualUserSWA(e.target.value)}
                                            placeholder="User SWA (0x...)"
                                        />
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none font-mono text-black"
                                            style={{ '::placeholder': { color: '#000000' } } as any}
                                            value={manualSessionPrivKey}
                                            onChange={e => setManualSessionPrivKey(e.target.value)}
                                            placeholder="Session Private Key (0x...)"
                                        />
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded bg-[#f3f0ff] border border-[#e5e7eb] focus:outline-none font-mono text-black"
                                            style={{ '::placeholder': { color: '#000000' } } as any}
                                            value={manualSessionPubKey}
                                            onChange={e => setManualSessionPubKey(e.target.value)}
                                            placeholder="Session Public Key (0x...)"
                                        />
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md py-3 px-8 font-semibold transition-colors mt-2"
                                disabled={submitting || authLoading || tokenLoading}
                            >
                                {submitting ? 'Transferring...' : 'Transfer'}
                            </button>
                        </form>
                        {result && <div className="text-green-600 text-center mt-4">{result}</div>}
                        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
                    </section>
                </div>
            </main>
        </div>
    );
}
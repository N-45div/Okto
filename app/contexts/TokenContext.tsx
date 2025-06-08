"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenService, portfolioService } from '../services/api';

interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    chainId: number;
    balance: string;
}

interface Chain {
    id: number;
    name: string;
    rpcUrl: string;
}

interface TokenContextType {
    tokens: Token[];
    chains: Chain[];
    portfolio: any;
    activity: any[];
    loading: boolean;
    error: string | null;
    transferToken: (params: {
        to: string;
        tokenAddress: string;
        amount: string;
        chainId: number;
    }) => Promise<void>;
    refreshPortfolio: () => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [chains, setChains] = useState<Chain[]>([]);
    const [portfolio, setPortfolio] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load tokens and chains in parallel
            const [tokensData, chainsData, portfolioData, activityData] = await Promise.all([
                tokenService.getTokens(),
                portfolioService.getChains(),
                portfolioService.getPortfolio(),
                portfolioService.getActivity(),
            ]);

            setTokens(tokensData);
            setChains(chainsData);
            setPortfolio(portfolioData);
            setActivity(activityData);
        } catch (err: any) {
            setError(err.message || 'Failed to load token data');
        } finally {
            setLoading(false);
        }
    };

    const transferToken = async (params: {
        to: string;
        tokenAddress: string;
        amount: string;
        chainId: number;
    }) => {
        try {
            setLoading(true);
            setError(null);
            await tokenService.transfer(params);
            // Refresh portfolio after transfer
            await refreshPortfolio();
        } catch (err: any) {
            setError(err.message || 'Token transfer failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const refreshPortfolio = async () => {
        try {
            setLoading(true);
            setError(null);
            const [portfolioData, activityData] = await Promise.all([
                portfolioService.getPortfolio(),
                portfolioService.getActivity(),
            ]);
            setPortfolio(portfolioData);
            setActivity(activityData);
        } catch (err: any) {
            setError(err.message || 'Failed to refresh portfolio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TokenContext.Provider
            value={{
                tokens,
                chains,
                portfolio,
                activity,
                loading,
                error,
                transferToken,
                refreshPortfolio,
            }}
        >
            {children}
        </TokenContext.Provider>
    );
}

export function useToken() {
    const context = useContext(TokenContext);
    if (context === undefined) {
        throw new Error('useToken must be used within a TokenProvider');
    }
    return context;
} 
/*
"use client"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React, {type ReactNode} from "react";
import config from "@/ranbowKitConfig";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers(props: {children: ReactNode}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
                {props.children}
            </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}*/
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode, useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers(props: { children: ReactNode }) {
    const [config, setConfig] = useState<any>(null);
    const [queryClient] = useState(() => new QueryClient());

    useEffect(() => {
        // Only import config on client side
        import("@/ranbowKitConfig").then((mod) => {
            setConfig(mod.default);
        });
    }, []);

    // Show loading state until config is ready
    if (!config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-zinc-600">Loading...</div>
            </div>
        );
    }

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {props.children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
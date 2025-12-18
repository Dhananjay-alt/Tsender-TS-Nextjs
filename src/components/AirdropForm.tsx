"use client";

//import InputField from "@/components/ui/InputField";
import { useState, useMemo, useEffect } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "process";
import { calculateTotal, formatTokenAmount } from "@/utils";
import { write } from "fs";
//For new functionality
import { RiAlertFill, RiInformationLine } from "react-icons/ri"
import { CgSpinner } from "react-icons/cg"
import { useWaitForTransactionReceipt, useReadContracts } from "wagmi"
//import { formatTokenAmount } from "@/utils"
import { InputForm } from "./ui/InputField"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"


//export default function AirdropForm() {
interface AirdropFormProps {
    isUnsafeMode: boolean
    onModeChange: (unsafe: boolean) => void
}

export default function AirdropForm({ isUnsafeMode, onModeChange }: AirdropFormProps) {
    const [mounted, setMounted] = useState(false);
    const [tokenAddress, setTokenAddress] = useState(""); // Fixed typo: toeknaAddress -> tokenAddress
    const [recipients, setRecipients] = useState(""); // Added state for recipients
    const [amounts, setAmounts] = useState(""); // Added state for amounts
    const [hasEnoughTokens, setHasEnoughTokens] = useState(true);
    
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total : number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: tokenData } = useReadContracts({
    contracts: [
        {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "decimals",
        },
        {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "name",
        },
        {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "balanceOf",
            args: [account.address],
        },
    ],
})
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
    }) 
    async function getApprovedAmount(tSenderAddress: string): Promise<number> {
        if (!tSenderAddress) {
        alert("This chain only has the safer version!")
        return 0
    }
    const response = await readContract(config, {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [account.address, tSenderAddress as `0x${string}`],
    })
    return response as number
    }
    async function handleSubmit() {
        //1. Approve our tsender contract to send our tokens 
        //1a If already approved, skip to step 2
        //2. Call the airdrop function on our tsender contract
        //3. wait for the transaction to be mined
        // Add your submission logic here
    const contractType = isUnsafeMode ? "no_check" : "tsender"
    const tSenderAddress = chainsToTSender[chainId][contractType]
        if (!tSenderAddress) {
        alert("This chain only has the safer version!")
        return  // Exit early if no address
    }
    const result = await getApprovedAmount(tSenderAddress)

    if (result < total) {
        const approvalHash = await writeContractAsync({
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "approve",
            args: [tSenderAddress as `0x${string}`, BigInt(total)],
        })
        const approvalReceipt = await waitForTransactionReceipt(config, {
            hash: approvalHash,
        })

        console.log("Approval confirmed:", approvalReceipt)

        await writeContractAsync({
            abi: tsenderAbi,
            address: tSenderAddress as `0x${string}`,
            functionName: "airdropERC20",
            args: [
                tokenAddress,
                recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                BigInt(total),
            ],
        })
        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }
    }   

    function getButtonContent() {
    if (isPending)
        return (
            <div className="flex items-center justify-center gap-2 w-full">
                <CgSpinner className="animate-spin" size={20} />
                <span>Confirming in wallet...</span>
            </div>
        )
    if (isConfirming)
        return (
            <div className="flex items-center justify-center gap-2 w-full">
                <CgSpinner className="animate-spin" size={20} />
                <span>Waiting for transaction to be included...</span>
            </div>
        )
    if (error || isError) {
        console.log(error)
        return (
            <div className="flex items-center justify-center gap-2 w-full">
                <span>Error, see console.</span>
            </div>
        )
    }
    if (isConfirmed) {
        return "Transaction confirmed."
    }
    return isUnsafeMode ? "Send Tokens (Unsafe)" : "Send Tokens"
}
// Set mounted to true on client
useEffect(() => {
    setMounted(true);
}, []);

// Load from localStorage on mount (only on client)
useEffect(() => {
    if (!mounted) return;
    
    const savedTokenAddress = localStorage.getItem('tokenAddress');
    const savedRecipients = localStorage.getItem('recipients');
    const savedAmounts = localStorage.getItem('amounts');

    if (savedTokenAddress) setTokenAddress(savedTokenAddress);
    if (savedRecipients) setRecipients(savedRecipients);
    if (savedAmounts) setAmounts(savedAmounts);
}, [mounted]);

// Save to localStorage when values change (only on client)
useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('tokenAddress', tokenAddress);
}, [tokenAddress, mounted]);

useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('recipients', recipients);
}, [recipients, mounted]);

useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('amounts', amounts);
}, [amounts, mounted]);

// Check if user has enough tokens (this one is fine as-is)
useEffect(() => {
    if (tokenAddress && total > 0 && tokenData?.[2]?.result as number !== undefined) {
        const userBalance = tokenData?.[2].result as number;
        setHasEnoughTokens(userBalance >= total);
    } else {
        setHasEnoughTokens(true);
    }
}, [tokenAddress, total, tokenData]);

    return (
    <div
        className={`max-w-2xl min-w-full xl:min-w-lg w-full lg:mx-auto p-6 flex flex-col gap-6 bg-white rounded-xl ring-[4px] border-2 ${
            isUnsafeMode ? " border-red-500 ring-red-500/25" : " border-blue-500 ring-blue-500/25"
        }`}
    >
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">T-Sender</h2>
            <Tabs defaultValue={"false"}>
                <TabsList>
                    <TabsTrigger value={"false"} onClick={() => onModeChange(false)}>
                        Safe Mode
                    </TabsTrigger>
                    <TabsTrigger value={"true"} onClick={() => onModeChange(true)}>
                        Unsafe Mode
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        <div className="space-y-6">
            <InputForm
    label="Token Address"
    placeholder="0x"
    value={tokenAddress}
    onChange={(e) => setTokenAddress(e.target.value)}
/>
<InputForm
    label="Recipients (comma or new line separated)"
    placeholder="0x123..., 0x456..."
    value={recipients}
    onChange={(e) => setRecipients(e.target.value)}
    large={true}
/>
<InputForm
    label="Amounts (wei; comma or new line separated)"
    placeholder="100, 200, 300..."
    value={amounts}
    onChange={(e) => setAmounts(e.target.value)}
    large={true}
/>

            {/* THIS IS THE TOKEN DETAILS BOX */}
            <div className="bg-white border border-zinc-300 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-900 mb-3">Transaction Details</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Token Name:</span>
                        <span className="font-mono text-zinc-900">
                            {tokenData?.[1]?.result as string}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Amount (wei):</span>
                        <span className="font-mono text-zinc-900">{total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Amount (tokens):</span>
                        <span className="font-mono text-zinc-900">
                            {formatTokenAmount(total, tokenData?.[0]?.result as number)}
                        </span>
                    </div>
                </div>
            </div>

            {/* UNSAFE MODE WARNING */}
            {isUnsafeMode && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <RiAlertFill size={20} />
                        <span>
                            Using{" "}
                            <span className="font-medium underline underline-offset-2 decoration-2 decoration-red-300">
                                unsafe
                            </span>{" "}
                            super gas optimized mode
                        </span>
                    </div>
                    <div className="relative group">
                        <RiInformationLine className="cursor-help w-5 h-5 opacity-45" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-64">
                            This mode skips certain safety checks to optimize for gas. Do not
                            use this mode unless you know how to verify the calldata of your
                            transaction.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 border-8 border-transparent border-t-zinc-900"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* BUTTON WITH SPINNER */}
            <button
                className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] text-white transition-colors font-semibold relative border ${
                    isUnsafeMode
                        ? "bg-red-500 hover:bg-red-600 border-red-500"
                        : "bg-blue-500 hover:bg-blue-600 border-blue-500"
                } ${!hasEnoughTokens && tokenAddress ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleSubmit}
                disabled={isPending || (!hasEnoughTokens && tokenAddress !== "")}
            >
                {/* Gradient */}
                <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
                {/* Inner shadow */}
                <div className="absolute w-full inset-0 mix-blend-overlay z-10 inner-shadow rounded-lg" />
                {/* White inner border */}
                <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
                {isPending || error || isConfirming
                    ? getButtonContent()
                    : !hasEnoughTokens && tokenAddress
                        ? "Insufficient token balance"
                        : isUnsafeMode
                            ? "Send Tokens (Unsafe)"
                            : "Send Tokens"}
            </button>
        </div>
    </div>
    );
}
"use client";

import InputField from "@/components/ui/InputField";
import { useState, useMemo } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "process";
import { calculateTotal } from "@/utils";
import { write } from "fs";

export default function AirdropForm() {
    const [tokenAddress, setTokenAddress] = useState(""); // Fixed typo: toeknaAddress -> tokenAddress
    const [recipients, setRecipients] = useState(""); // Added state for recipients
    const [amounts, setAmounts] = useState(""); // Added state for amounts
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total : number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: hash, isPending, writeContractAsync } = useWriteContract();

    async function getApprovedAmount(tSenderAddress: string): Promise<number> {
        if(!tSenderAddress){
            alert("No address found, please use a supported network");
            return 0;
        }// read from the chain to see if we have approved enoungh tokens
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tSenderAddress],

        })
        return response as number;
    }
    async function handleSubmit() {
        //1. Approve our tsender contract to send our tokens 
        //1a If already approved, skip to step 2
        //2. Call the airdrop function on our tsender contract
        //3. wait for the transaction to be mined
        // Add your submission logic here
        const tsenderAddress = chainsToTSender[chainId]["tsender"]; // Assuming chain ID 1 for Ethereum Mainnet
        const approvedAmount = await getApprovedAmount(tsenderAddress);
        console.log("Approved Amount: ", approvedAmount);

        if(approvedAmount < total){
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tsenderAddress as `0x${string}`, BigInt(total)],
            });

            const approvalReceipt = await waitForTransactionReceipt(config, { 
                hash: approvalHash
            });

            console.log("Approval Confirmerd: ", approvalReceipt);

                        await writeContractAsync({
                abi: tsenderAbi,
                address: tsenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress as `0x${string}`,
                    //Comma or newline separated 
                    recipients.split(/[\n,]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[\n,]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
            })

        } else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tsenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress as `0x${string}`,
                    //Comma or newline separated 
                    recipients.split(/[\n,]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[\n,]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ]
            })
        }
    }   
    return (
        <div>
            <InputField
                label="token address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={setTokenAddress} // Pass the setter directly
            />
            <InputField
                label="Recipents"
                placeholder="0x123..., 0x456..."
                value={recipients}
                onChange={setRecipients} // Pass the setter directly
                large={true}
            />
            <InputField
                label="Amounts"
                placeholder="100, 200, 300"
                value={amounts}
                onChange={setAmounts} // Pass the setter directly
                large={true}
            />
            <button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 active:scale-95">
                Send Tokens
                </button>

        </div>
    )
}
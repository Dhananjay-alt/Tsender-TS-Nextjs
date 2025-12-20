"use client"; 

import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";

export default function Home() {
  const {isConnected} = useAccount();
  
  return (
    <div>
    {!isConnected ? (
    <div>
      <h1 className="text-3xl font-bold underline">
        Please connect your wallet to use the Airdrop Service
      </h1>
    </div>
  ) : (
      <div>
        <HomeContent />
      </div>
  )
}
</div>  );
}


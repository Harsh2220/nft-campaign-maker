"use client";

import Card from "@/components/Card";
import { CampaignDeployerABI, CampaignDeployerAddress } from "@/config";
import React from "react";
import { useContractRead } from "wagmi";

export default function Feed() {
  const { data, error, isLoading } = useContractRead({
    abi: CampaignDeployerABI,
    address: CampaignDeployerAddress,
    functionName: "getallCampaigns",
  });

  return (
    <div className="container mx-auto flex items-center gap-10 my-10 flex-wrap p-10">
      {data ?
        <>
          {data?.map((address: string) => (
            <Card key={address} address={address} />
          ))}
        </>
        : <div className="flex justify-center items-center w-full h-full">
          <h1 className="font-bold text-2xl">No campaigns</h1>
        </div>}
    </div>
  )
}

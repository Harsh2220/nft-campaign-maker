"use client";

import { CampaignContractABI } from "@/config";
import getNFTDetails, { NFTDetails } from "@/utils/getNFTDetails";
import { useState } from "react";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import getIPFSLink from "../../../utils/getIPFSLink";

export default function NFTDetail({ params }: { params: { id: string } }) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const { isConnected, address } = useAccount();

  const { data: rawmetadata, error } = useContractRead({
    abi: CampaignContractABI,
    address: params.id as `0x${string}`,
    functionName: "metadataUri",
  });

  const { config } = usePrepareContractWrite({
    address: params.id as `0x${string}`,
    abi: CampaignContractABI,
    functionName: 'safeMint',
  })

  const { write, data } = useContractWrite(config)

  if (rawmetadata) {
    getNFTDetails(getIPFSLink(rawmetadata as string))
      .then((res) => setNftDetails(res!))
      .catch((er) => {
        console.log(er);
      });
  }

  async function MintNFT() {
    if (!isConnected) return;
    write?.();
    console.log(data)
  }

  return (
    nftDetails && (
      <section className="py-10 sm:py-16 lg:py-24">
        <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:items-stretch md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-10">
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:leading-tight lg:text-5xl">{nftDetails?.name}</h2>
              <p className="text-lg leading-relaxed text-white">{nftDetails?.description}</p>
              <button
                className="inline-block px-8 py-4 my-4 tracking-tighter bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 font-medium"
                onClick={MintNFT}
              >
                Buy Now
              </button>
            </div>
            <div className="overflow-hidden rounded-md">
              <img src={getIPFSLink(nftDetails?.image)} alt="" className="h-96 w-full object-contain bg-gray-950" />
            </div>
          </div>
        </div>
      </section>
    )
  );
}

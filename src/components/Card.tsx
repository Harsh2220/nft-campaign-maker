import { CampaignContractABI } from "@/config";
import getIPFSLink from "@/utils/getIPFSLink";
import getNFTDetails, { NFTDetails } from "@/utils/getNFTDetails";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useContractRead } from "wagmi";

export default function Card({ address }: { address: string }) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const { data, error, isLoading } = useContractRead({
    abi: CampaignContractABI,
    address: address as `0x${string}`,
    functionName: "metadataUri",
  });
  const router = useRouter()

  if (data) {
    getNFTDetails(getIPFSLink(data as string))
      .then((res) => setNftDetails(res!))
      .catch((er) => {
        console.log(er);
      });
  }

  return (
    <div className="h-[469px] w-full max-w-[330px] lg:max-w-[330px] bg-gray-900 rounded-xl">
      <div className="rounded-t-xl">
        <img
          src={getIPFSLink(nftDetails?.image)}
          alt="img"
          className="w-full max-h-[300px] rounded-t-xl"
        />
      </div>
      <div className="h-[173px] rounded-b-xl p-4">
        <div className="flex flex-col justify-center gap-[25px]">
          <div className="flex w-full max-w-[270px] flex-col gap-2 text-start">
            <h1 className="flex text-2xl font-semibold">{nftDetails?.name}</h1>
            <p className="!font-spacemono text-base font-normal leading-[22px] line-clamp-1">
              {nftDetails?.description}
            </p>
          </div>
          <button
            className="inline-block px-8 py-3 tracking-tighter bg-green-400 hover:bg-green-500 text-black focus:ring-4 focus:ring-green-500 focus:ring-opacity-40 rounded-full transition duration-300 font-semibold"
            onClick={() => {
              router.push(`/nft/${address}`);
            }}
          >
            Collect Now
          </button>
        </div>
      </div>
    </div>
  );
}

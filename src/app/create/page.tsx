"use client";

import { CampaignDeployerABI, CampaignDeployerAddress } from "@/config";
import uploadImageToIPFS from "@/utils/uploadImage";
import uploadMetadataToIPFS from "@/utils/uploadMetadata";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { providers, Contract } from "ethers";

type CampaignDetails = {
  collectionname: string | null;
  title: string | null;
  description: string | null;
  totalSupply: number;
  imageUrl: string | null;
  metadata: string | null;
};

export default function Create() {
  const [image, setImage] = useState<File | null>(null);
  const { address } = useAccount();
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails>({
    description: null,
    title: null,
    totalSupply: 100,
    collectionname: null,
    imageUrl: null,
    metadata: null,
  });

  const { config } = usePrepareContractWrite({
    abi: CampaignDeployerABI,
    address: CampaignDeployerAddress,
    functionName: "createCampaign",
    args: [
      campaignDetails.title,
      campaignDetails.description,
      campaignDetails.imageUrl,
      campaignDetails.metadata,
      campaignDetails.totalSupply,
    ],
  });

  const { write, data, status, writeAsync } = useContractWrite(config);

  const handleSubmit = async () => {
    try {
      if (!address) {
        toast.error("Please connect wallet!");
        return;
      }

      if (!image) {
        toast.error("Please select an image");
        return;
      }

      const toastPromise = toast.loading("Uploading NFT Image....");

      const hash = await uploadImageToIPFS(image);
      console.log("Image cid", hash);
      setCampaignDetails((prev) => ({
        ...prev,
        imageUrl: `ipfs://${hash}`,
      }));

      const metadata = {
        description: campaignDetails.description,
        external_url: `ipfs://${hash}`,
        image: `ipfs://${hash}`,
        name: campaignDetails.title,
        attributes: [
          { trait_type: "total_supply", value: campaignDetails.totalSupply },
          {
            trait_type: "collection_name",
            value: campaignDetails.collectionname,
          },
        ],
      };
      const metadatahash = await uploadMetadataToIPFS(JSON.stringify(metadata));
      console.log("metadata uri", metadatahash);
      setCampaignDetails((prev) => ({
        ...prev,
        metadata: `ipfs://${metadatahash}`,
      }));
      //@ts-expect-error
      const provider = new providers.Web3Provider(window.ethereum);
      const contract = new Contract(
        CampaignDeployerAddress,
        CampaignDeployerABI,
        provider.getSigner()
      );
      const result = await contract.createCampaign(
        campaignDetails.title,
        campaignDetails.description,
        `ipfs://${hash}`,
        `ipfs://${metadatahash}`,
        campaignDetails.totalSupply
      );
      toast.update(toastPromise, {
        render: "Campaign created!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="py-8 my-12">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap -mx-4 mb-8">
          <div className="w-full lg:w-1/3 px-4 mb-8 lg:mb-0">
            <div className="mt-8">
              <h3 className="text-2xl font-bold tracking-wide text-white mb-1">
                Create campaign
              </h3>
              <p className="text-xs text-gray-300">
                Enter data to create campaign
              </p>
            </div>
          </div>
          <div className="w-full lg:w-2/3 px-4">
            <div className="px-8 md:px-16 pt-16 pb-8 bg-gray-900 rounded-xl">
              <div className="max-w-xl mx-auto">
                <div className="flex flex-wrap -mx-4 -mb-10">
                  <div className="w-full md:w-1/2 px-4 mb-10">
                    <div className="relative w-full h-14 py-4 px-3 border border-gray-400 hover:border-white focus-within:border-green-400 rounded-lg">
                      <span className="absolute bottom-full left-0 ml-3 -mb-1 transform translate-y-0.5 text-xs font-semibold text-gray-300 px-1 bg-gray-900">
                        NFT Collection Name
                      </span>
                      <input
                        className="block w-full outline-none bg-transparent text-gray-50 placeholder-gray-50 font-semibold"
                        id="formInput2-1"
                        type="text"
                        onChange={(e) => {
                          setCampaignDetails(() => ({
                            ...campaignDetails,
                            collectionname: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 px-4 mb-10">
                    <div className="relative w-full h-14 py-4 px-3 border border-gray-400 hover:border-white focus-within:border-green-400 rounded-lg">
                      <span className="absolute bottom-full left-0 ml-3 -mb-1 transform translate-y-0.5 text-xs font-semibold text-gray-300 px-1 bg-gray-900">
                        Campaign Title
                      </span>
                      <input
                        className="block w-full outline-none bg-transparent text-gray-50 placeholder-gray-50 font-semibold"
                        id="formInput2-2"
                        type="text"
                        onChange={(e) => {
                          setCampaignDetails(() => ({
                            ...campaignDetails,
                            title: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 mb-10">
                    <div className="relative w-full py-4 px-3 border border-gray-400 hover:border-white focus-within:border-green-400 rounded-lg">
                      <span className="absolute bottom-full left-0 ml-3 -mb-1 transform translate-y-0.5 text-xs font-semibold text-gray-300 px-1 bg-gray-900">
                        Campaign Description
                      </span>
                      <textarea
                        className="block w-full outline-none bg-transparent text-gray-50 placeholder-gray-50 font-semibold resize-none"
                        id="formInput2-5"
                        name=""
                        cols={20}
                        rows={5}
                        onChange={(e) => {
                          setCampaignDetails(() => ({
                            ...campaignDetails,
                            description: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 mb-10">
                    <div className="flex flex-wrap sm:flex-nowrap">
                      <div className="w-full py-8 px-4 text-center border-dashed border border-gray-400 hover:border-white rounded-lg">
                        <div className="relative group h-14 w-14 mx-auto mb-4">
                          <div className="flex items-center justify-center h-14 w-14 bg-blue-500 group-hover:bg-blue-600 rounded-full">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6.71 5.71002L9 3.41002V13C9 13.2652 9.10536 13.5196 9.29289 13.7071C9.48043 13.8947 9.73478 14 10 14C10.2652 14 10.5196 13.8947 10.7071 13.7071C10.8946 13.5196 11 13.2652 11 13V3.41002L13.29 5.71002C13.383 5.80375 13.4936 5.87814 13.6154 5.92891C13.7373 5.97968 13.868 6.00582 14 6.00582C14.132 6.00582 14.2627 5.97968 14.3846 5.92891C14.5064 5.87814 14.617 5.80375 14.71 5.71002C14.8037 5.61706 14.8781 5.50645 14.9289 5.3846C14.9797 5.26274 15.0058 5.13203 15.0058 5.00002C15.0058 4.86801 14.9797 4.7373 14.9289 4.61544C14.8781 4.49358 14.8037 4.38298 14.71 4.29002L10.71 0.290018C10.6149 0.198978 10.5028 0.127613 10.38 0.0800184C10.1365 -0.0199996 9.86346 -0.0199996 9.62 0.0800184C9.49725 0.127613 9.3851 0.198978 9.29 0.290018L5.29 4.29002C5.19676 4.38326 5.1228 4.49395 5.07234 4.61577C5.02188 4.73759 4.99591 4.86816 4.99591 5.00002C4.99591 5.13188 5.02188 5.26245 5.07234 5.38427C5.1228 5.50609 5.19676 5.61678 5.29 5.71002C5.38324 5.80326 5.49393 5.87722 5.61575 5.92768C5.73757 5.97814 5.86814 6.00411 6 6.00411C6.13186 6.00411 6.26243 5.97814 6.38425 5.92768C6.50607 5.87722 6.61676 5.80326 6.71 5.71002ZM19 10C18.7348 10 18.4804 10.1054 18.2929 10.2929C18.1054 10.4804 18 10.7348 18 11V17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8947 17.2652 18 17 18H3C2.73478 18 2.48043 17.8947 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V11C2 10.7348 1.89464 10.4804 1.70711 10.2929C1.51957 10.1054 1.26522 10 1 10C0.734784 10 0.48043 10.1054 0.292893 10.2929C0.105357 10.4804 0 10.7348 0 11V17C0 17.7957 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7957 20 17V11C20 10.7348 19.8946 10.4804 19.7071 10.2929C19.5196 10.1054 19.2652 10 19 10Z"
                                fill="#E8EDFF"
                              ></path>
                            </svg>
                          </div>
                          <input
                            className="absolute top-0 left-0 h-14 w-14 opacity-0"
                            id="formInput2-6"
                            type="file"
                            name="filephoto"
                            onChange={(e) => {
                              e.preventDefault();
                              if (e.target.files && e.target.files.length > 0) {
                                setImage(e.target.files[0]);
                              }
                            }}
                          />
                        </div>
                        <p className="font-semibold leading-normal mb-1">
                          <span className="text-blue-500">
                            Click to upload a file
                          </span>
                          <span className="text-gray-300">
                            or drag and drop
                          </span>
                        </p>
                        <span className="text-xs text-gray-300 font-semibold">
                          PNG, JPG, GIF or up to 10MB
                        </span>
                      </div>
                    </div>
                    {image && (
                      <div className="w-full h-64 my-4">
                        {image && (
                          <img
                            src={URL.createObjectURL(image)}
                            alt={""}
                            className="rounded-lg object-contain w-full h-full"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8 text-right">
                  <button
                    className="inline-block py-2 px-6 mb-2 text-xs text-center font-semibold leading-6 text-black bg-green-400 hover:bg-green-500 rounded-lg transition duration-200"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

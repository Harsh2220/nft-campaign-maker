"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <div className="container px-4 mx-auto">
      <div className="flex items-center justify-between pt-6">
        <h1 className="font-semibold text-3xl">NFTS</h1>
        <ConnectButton />
      </div>
    </div>
  );
}

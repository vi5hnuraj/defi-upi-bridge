// src/components/Pay.jsx
import React, { useState, useEffect } from "react";
import "../index.css";
import api from "../utils/api";
import { ConnectWallet, useAddress, useSDK } from "@thirdweb-dev/react";
import { ethers } from "ethers";

const Pay = () => {
  const [upi, setUpi] = useState("");
  const [option, setOption] = useState("");
  const [amount, setAmount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [metamaskID, setMetamaskId] = useState("");

  const walletAddress = useAddress();
  const sdk = useSDK();
  const token = localStorage.getItem("token");

  const USDC_CONTRACT = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Circle Sepolia USDC
  const DAI_CONTRACT = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";

  const [USDCPrice, setUSDCPrice] = useState(0);
  const [DAIPrice, setDAIPrice] = useState(0);

  // 🔹 Fetch prices from CoinGecko
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,dai&vs_currencies=inr"
        );
        const data = await res.json();
        setUSDCPrice(data["usd-coin"].inr);
        setDAIPrice(data.dai.inr);
      } catch (err) {
        console.warn("Price fetch failed:", err);
      }
    };
    fetchPrice();
  }, []);

  // 🔹 Payment Handler
  const paymentHandler = async () => {
    try {
      if (!walletAddress) return alert("Please connect your wallet first.");
      if (!token) return alert("You must be logged in to make payments.");
      if (!upi || !option || !amount) return alert("Please fill in all fields.");

      // Fetch sender details
      const userRes = await api.get("/auth/fetchdetail", {
        headers: { Authorization: `Bearer ${token}` },
        params: { waddr: walletAddress },
      });
      const user = userRes.data;
      if (!user || !user._id || !user.metamask)
        return alert("Sender details not found.");
      setMetamaskId(user.metamask);

      if (walletAddress.toLowerCase() !== user.metamask.toLowerCase()) {
        return alert("This wallet is not linked to your registered UPI account.");
      }

      // Fetch receiver details
      let receiver;
      try {
        const receiverRes = await api.get("/auth/fetchdetail", { params: { upi } });
        receiver = receiverRes.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          return alert("Receiver UPI not found or not registered.");
        }
        throw err;
      }

      if (!receiver || !receiver.metamask)
        return alert("Receiver UPI not linked with any MetaMask wallet.");

      // 🔹 Convert INR → token amount
      const inrToUsd = amount / 83;
      const tokenAmount =
        option === "USDC"
          ? ethers.utils.parseUnits(inrToUsd.toFixed(6), 6)
          : ethers.utils.parseUnits(inrToUsd.toFixed(6), 18);

      // Confirm transaction
      if (
        !window.confirm(
          `Transaction Details:\nPurpose: ${keyword || "N/A"}\nAmount: ₹${amount}\nPay in: ${option}\nReceiver: ${upi}\nProceed?`
        )
      )
        return;

      // 🔹 Send token using ethers.js
      const signer = await sdk?.getSigner();
      const contractAddress =
        option === "USDC" ? USDC_CONTRACT : DAI_CONTRACT;

      const erc20Abi = [
        "function transfer(address to, uint256 value) public returns (bool)",
      ];
      const tokenContract = new ethers.Contract(contractAddress, erc20Abi, signer);

      const tx = await tokenContract.transfer(receiver.metamask, tokenAmount);
      await tx.wait();

      // 🔹 Record transaction in backend
      await api.post("/pay/paymentWrite", {
        date: new Date().toISOString(),
        to: upi,
        amt: amount,
        sender: user._id,
        keyword,
        coin: option,
      });

      // Clear form
      setUpi("");
      setAmount("");
      setOption("");
      setKeyword("");

      alert("✅ Payment successful!");
    } catch (err) {
      console.error("Payment error:", err);
      alert(`Unexpected error: ${err.message}`);
    }
  };

  return (
    <div className="bg-boxbg flex flex-col justify-between w-1/4 h-3/5 rounded-lg p-5 mt-20 border">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Receiver UPI ID"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          className="p-4 bg-neutral-700 outline-none rounded-md"
        />
        <input
          type="number"
          placeholder="Amount in INR"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="p-4 bg-neutral-700 outline-none rounded-md"
        />
        <select
          value={option}
          onChange={(e) => setOption(e.target.value)}
          className="p-3 bg-neutral-700 outline-none rounded-md"
        >
          <option value="">Select Token</option>
          <option value="USDC">USDC</option>
          <option value="DAI">DAI</option>
        </select>
        <input
          type="text"
          placeholder="Purpose / Keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="p-4 bg-neutral-700 outline-none rounded-md"
        />
      </div>

      <div className="flex flex-col items-center">
        <ConnectWallet theme="dark" />
        <button
          onClick={paymentHandler}
          className="rounded-full w-full p-3 mt-4 bg-blue-800 text-white hover:bg-blue-700 transition-all"
        >
          Pay Now
        </button>
        <p className="text-sm mt-3 font-thin text-gray-400">
          Powered by UPI-Crypto Connect
        </p>
      </div>
    </div>
  );
};

export default Pay;

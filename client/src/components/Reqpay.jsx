// src/components/Reqpay.jsx
import React, { useState } from "react";
import { GrRadial, GrRadialSelected } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Reqpay = ({ name, sender, amount }) => {
  const [paytoggle, setPaytoggle] = useState(false);
  const [paythrough, setPaythrough] = useState("metamask");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const navigate = useNavigate();

  const payHandler = () => {
    setMsg(null);
    setPaytoggle(true);
  };
  const closeHandler = () => {
    if (!loading) {
      setPaytoggle(false);
      setMsg(null);
    }
  };
  const paythroughHandler = (type) => setPaythrough(type);

  const confirmPay = async () => {
    setMsg(null);

    if (!sender) {
      setMsg({ type: "error", text: "Receiver address/UPI missing" });
      return;
    }

    // ensure amount is a number
    const numericAmount = Number(amount) || 0;
    if (numericAmount <= 0) {
      setMsg({ type: "error", text: "Invalid amount" });
      return;
    }

    setLoading(true);

    try {
      const userRes = await api.get("/auth/fetchdetail");
      const user = userRes?.data;

      if (!user || !user._id) {
        setMsg({ type: "error", text: "You must be logged in to pay." });
        setLoading(false);
        return;
      }

      if (paythrough === "metamask") {
        if (!user.metamask) {
          setMsg({ type: "error", text: "Please link your MetaMask in profile before paying with crypto." });
          setLoading(false);
          return;
        }

        const query = new URLSearchParams({
          upi: sender,
          amount: String(numericAmount),
          prefillFromRequest: "true",
        }).toString();

        setLoading(false);
        setPaytoggle(false);
        navigate(`/pay?${query}`);
        return;
      }

      // UPI path: record payment in backend
      if (paythrough === "upi") {
        const payload = {
          date: new Date().toISOString(),
          to: sender, // receiver UPI
          amt: numericAmount,
          sender: user._id,
          keyword: "request_payment",
          coin: "UPI",
        };

        const writeRes = await api.post("/pay/paymentWrite", payload);

        // Accept status 200/201 and success object
        if (writeRes && (writeRes.status === 200 || writeRes.status === 201)) {
          setMsg({ type: "success", text: "Payment recorded successfully." });
          setTimeout(() => {
            setPaytoggle(false);
            setMsg(null);
          }, 1100);
        } else {
          // unexpected but informative
          setMsg({ type: "error", text: `Unexpected server response (${writeRes?.status})` });
        }
        setLoading(false);
        return;
      }

      setMsg({ type: "error", text: "Unknown payment method." });
    } catch (err) {
      console.error("Reqpay confirmPay error:", err);
      const message = err?.response?.data?.message || err.message || "Payment failed";
      setMsg({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between m-2 items-center w-full border-2 border-zinc-400 rounded-lg bg-boxbg p-8 relative">
      <div className="flex flex-col justify-center">
        <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">{name}</p>
        <p className="flex items-center font-bold text-2xl text-zinc-300">${amount}</p>
        <p className="text-sm text-stone-400 inset-x-0 bottom-0 font-medium">{sender}</p>
      </div>

      <button onClick={payHandler} className="rounded-full p-5 bg-icon text-black w-24 h-full" disabled={loading}>
        Pay
      </button>

      {paytoggle && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="flex flex-col justify-between relative w-1/4 max-w-md rounded-2xl bg-boxbg border-2 p-6 border-stone-500">
            <div className="flex flex-col justify-between h-full py-6">
              <div className="flex flex-col items-center gap-3">
                <p className="text-lg font-medium text-stone-500">{sender}</p>
                <p className="text-4xl font-semibold text-zinc-300">${amount}</p>
              </div>

              <div className="flex flex-col w-full gap-2 text-zinc-400">
                <div
                  onClick={() => !loading && paythroughHandler("metamask")}
                  className={`flex justify-between items-center w-full border p-3 text-xl rounded-md cursor-pointer ${paythrough === "metamask" ? "border-icon" : ""}`}
                >
                  <p>Metamask</p>
                  {paythrough === "metamask" ? <GrRadialSelected className="text-icon" /> : <GrRadial />}
                </div>

                <div
                  onClick={() => !loading && paythroughHandler("upi")}
                  className={`flex justify-between w-full items-center border p-3 text-xl rounded-md cursor-pointer ${paythrough === "upi" ? "border-icon" : ""}`}
                >
                  <p>UPI</p>
                  {paythrough === "upi" ? <GrRadialSelected className="text-icon" /> : <GrRadial />}
                </div>
              </div>
            </div>

            {msg && (
              <div className="mt-2 text-center">
                <p className={msg.type === "error" ? "text-red-400" : "text-green-400"}>{msg.text}</p>
              </div>
            )}

            <div className="flex gap-3 font-semibold items-end mt-4">
              <button onClick={closeHandler} disabled={loading} className="w-full rounded-full p-3 border bg-neutral-600 text-stone-300">
                cancel
              </button>
              <button
                onClick={confirmPay}
                disabled={loading}
                className="p-3 border bg-icon w-full rounded-full text-black flex items-center justify-center"
              >
                {loading ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reqpay;

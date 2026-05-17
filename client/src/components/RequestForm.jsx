import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import api from '../utils/api';
import { FiSend, FiUser, FiArrowRight } from 'react-icons/fi';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    receiver: '',
    amount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.receiver || !formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter valid receiver details and amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/money-transfer/money-requested`, formData);
      toast.success('Request sent successfully!');
      setFormData({ receiver: '', amount: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-boxbg flex flex-col justify-between w-1/4 h-3/5 rounded-lg p-5 mt-20 border">
      <Toaster />
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Request Money</h2>
        <p className="text-zinc-500 text-sm mt-1">Ask for payment via UPI ID or Wallet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <input
            type="text"
            id="receiver"
            name="receiver"
            value={formData.receiver}
            onChange={handleChange}
            className="w-full p-4 bg-neutral-700 outline-none rounded-md text-white placeholder-gray-400"
            placeholder="From (UPI ID or Wallet)"
          />
        </div>

        <div>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-4 bg-neutral-700 outline-none rounded-md text-white placeholder-gray-400"
            placeholder="Amount"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 mt-4 rounded-full font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSubmitting 
            ? 'bg-zinc-700 cursor-not-allowed' 
            : 'bg-amber-600 hover:bg-amber-500'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Send Request
              <FiSend size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;

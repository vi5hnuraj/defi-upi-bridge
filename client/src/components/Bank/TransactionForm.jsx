import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { FiSend, FiUser, FiArrowRight, FiCreditCard } from 'react-icons/fi';
import api from '../../utils/api';

const TransactionForm = ({ onTransactionSuccess, userData }) => {
  const [formData, setFormData] = useState({
    senderUPI: '',
    receiverUPI: '',
    amount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userData?.bankDetails?.upiId) {
      setFormData(prev => ({ ...prev, senderUPI: userData.bankDetails.upiId }));
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.receiverUPI || !formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter valid receiver details and amount');
      return;
    }

    if (Number(formData.amount) > (userData?.bankDetails?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`/money-transfer/create`, formData);
      toast.success('Transaction successful!');
      if (onTransactionSuccess) onTransactionSuccess();
      setFormData({ 
        senderUPI: userData?.bankDetails?.upiId || '', 
        receiverUPI: '', 
        amount: '' 
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to send transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 border-zinc-800 border-[1px] p-8 rounded-2xl flex-1 shadow-2xl transition-all duration-300">
      <Toaster />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Quick Transfer</h2>
          <p className="text-zinc-500 text-sm mt-1">Send money instantly via UPI ID</p>
        </div>
        <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
          <FiSend size={24} />
        </div>
      </div>

      {userData?.bankDetails && (
        <div className="mb-8 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-700 rounded-lg text-zinc-400">
              <FiCreditCard size={18} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Available Balance</p>
              <p className="text-xl font-bold text-white">${userData.bankDetails.balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-zinc-500 font-medium">Linked Account</p>
             <p className="text-xs text-zinc-300">{userData.bankDetails.bankName}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="senderUPI" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Your UPI ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
              <FiUser size={18} />
            </div>
            <input
              type="text"
              id="senderUPI"
              name="senderUPI"
              value={formData.senderUPI}
              readOnly
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/30 border border-zinc-700 text-zinc-500 focus:outline-none cursor-not-allowed text-sm"
              placeholder="Your UPI ID"
            />
          </div>
        </div>

        <div>
          <label htmlFor="receiverUPI" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Receiver's UPI ID</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-500 transition-colors">
              <FiArrowRight size={18} />
            </div>
            <input
              type="text"
              id="receiverUPI"
              name="receiverUPI"
              value={formData.receiverUPI}
              onChange={handleChange}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
              placeholder="recipient@upi"
            />
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Amount to Transfer</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-amber-500 transition-colors font-bold">
              $
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg font-bold"
              placeholder="0.00"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
            isSubmitting 
            ? 'bg-zinc-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/20'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Confirm Transfer
              <FiSend size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
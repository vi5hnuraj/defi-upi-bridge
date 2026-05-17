import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../utils/api';
import { axis, hdfc, icici, pnb, sbi } from '../assets';

const banks = [
  { name: 'State Bank of India', description: 'State Bank of India is the largest public sector bank in India.', logo: sbi },
  { name: 'Punjab National Bank', description: 'Punjab National Bank is a leading public sector bank in India.', logo: pnb },
  { name: 'HDFC Bank', description: 'HDFC Bank is a major private sector bank in India.', logo: hdfc },
  { name: 'ICICI Bank', description: 'ICICI Bank is a prominent private sector bank in India.', logo: icici },
  { name: 'Axis Bank', description: 'Axis Bank is a well-known private sector bank in India.', logo: axis },
];

const Bank = () => {
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState(null);
  const [togglebox, setTogglebox] = useState(false);
  const [upiId, setUPI] = useState('');
  const [metamaskId, setMetamaskId] = useState('');
  const [bid, setBid] = useState('');
  const [formData, setFormData] = useState({
    ifscCode: '',
    accountHolder: '',
    accountAddress: '',
    accountType: '',
    amount: 0,
  });
  const [userEmail, setUserEmail] = useState('');

  // Prefill user info from cookies/backend
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/auth/fetchdetail', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.data?.user || res.data;
        setUserEmail(user.email);
        setUPI(user.upi || '');
        setMetamaskId(user.metamask || '');
      } catch (err) {
        console.error("Fetch user error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleBankSelection = (bank) => setSelectedBank(bank);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login first');
    if (!selectedBank) return alert('Select a bank first');

    try {
      const res = await api.post(
        '/bank/add',
        { ...formData, bankName: selectedBank.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUPI(res.data.upiId);
      setBid(res.data.id);
      setTogglebox(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding bank details');
    }
  };

  const kycHandler = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please login first');

    try {
      const res = await api.post(
        '/auth/linking',
        { email: userEmail, upi: upiId, metamask: metamaskId, bankDetails: formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || 'Linked successfully!');
      setTogglebox(false);
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error linking UPI/Metamask');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  return (
    <div>
      <div className="min-h-screen text-white flex items-center justify-center p-10">
        <div className="w-full max-w-4xl bg-zinc-800 border-zinc-700 border-[1px] rounded-lg shadow-lg p-6 flex relative">
          {/* Left: Bank selection */}
          <div className="w-1/2 p-6">
            <h2 className="text-2xl font-bold mb-4 text-amber-400">Select Bank</h2>
            <div className="space-y-4">
              {banks.map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => handleBankSelection(bank)}
                  className={`w-full py-3 px-4 rounded-lg transition-colors ${
                    selectedBank?.name === bank.name
                      ? 'bg-amber-600'
                      : 'bg-zinc-700 border-zinc-800 border-[1px]'
                  }`}
                >
                  <div className="flex items-center">
                    <img src={bank.logo} alt={bank.name} className="h-8 w-8 mr-4" />
                    <span>{bank.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Bank form */}
          <div className="w-1/2 p-6">
            {selectedBank ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-amber-400">{selectedBank.name}</h2>
                <p className="mb-4">{selectedBank.description}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="ifscCode" className="block mb-2">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="accountHolder" className="block mb-2">Account Holder</label>
                    <input
                      type="text"
                      name="accountHolder"
                      id="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="accountAddress" className="block mb-2">Account Address</label>
                    <input
                      type="text"
                      name="accountAddress"
                      id="accountAddress"
                      value={formData.accountAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="accountType" className="block mb-2">Account Type</label>
                    <select
                      name="accountType"
                      id="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    >
                      <option value="">Select Account Type</option>
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="amount" className="block mb-2">Amount (in $)</label>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-amber-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Next
                  </button>
                </form>
              </>
            ) : (
              <p className="text-center text-zinc-500">Please select a bank to proceed.</p>
            )}
          </div>

          {/* UPI/Metamask Linking Popup */}
          {togglebox && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50">
              <div className="flex flex-col justify-between border-2 bg-boxbg rounded-md border-stone-500 p-4 w-1/4 h-1/3">
                <div className="flex gap-4 flex-col">
                  <p className="text-stone-400 font-semibold"><u>Link your UPI and Metamask.</u></p>
                  <input 
                    type="text" 
                    value={upiId}
                    className="p-2 bg-transparent outline-none rounded-md border border-stone-300 text-stone-300"
                    disabled
                  />
                  <input 
                    type="text"
                    value={metamaskId}
                    onChange={(e) => setMetamaskId(e.target.value)}
                    className="p-2 bg-transparent outline-none rounded-md border border-stone-300 text-stone-300"
                  />
                </div>
                <button 
                  onClick={kycHandler} 
                  className="w-full px-4 py-2 bg-amber-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete KYC
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bank;

import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import api from '../utils/api';
import { FiArrowDown, FiArrowUp, FiActivity, FiDollarSign, FiTrendingUp, FiCreditCard, FiZap } from 'react-icons/fi';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import QRCode from 'qrcode.react';
import { saveAs } from 'file-saver';
import moment from 'moment';

const allowedCategories = [
  'Salary',
  'Groceries',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Miscellaneous'
];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalINR: 0,
    usdcPurchased: 0,
    daiPurchased: 0,
    txCount: 0
  });

  const chartRefs = useRef({
    purchases: null
  });

  const downloadQRCode = (transaction) => {
    const canvas = document.getElementById(`qr-code-${transaction._id || transaction.id}`);
    if (!canvas) return;
    canvas.toBlob((blob) => {
      saveAs(blob, `transaction-${transaction._id || transaction.id}.png`);
    });
  };

  const groupPaymentsByDate = (pays) => {
    const grouped = pays.reduce((acc, p) => {
      const dateKey = moment(p.timestamp).format('YYYY-MM-DD');
      if (!acc[dateKey]) acc[dateKey] = { amount: 0 };
      acc[dateKey].amount += p.amount;
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => moment(a).unix() - moment(b).unix())
      .map((date) => ({
        date: moment(date).format('MMM DD'),
        amount: grouped[date].amount,
      }));
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [payRes, userRes] = await Promise.all([
          api.get('/pay/paymentRead'),
          api.get('/auth/fetchdetail')
        ]);

        const pays = Array.isArray(payRes.data) ? payRes.data : [];
        const normalized = pays.map((p) => ({
          ...p,
          _id: p._id || p.id,
          amount: Number(p.amount) || 0,
          coin: p.coin || 'USDC',
          toUPI: p.toUPI,
          keyword: p.keyword || 'N/A',
          timestamp: p.date || p.createdAt || new Date().toISOString()
        }));

        setTransactions(normalized);
        setUser(userRes.data);

        // Calculate real totals
        const totalINR = normalized.reduce((sum, p) => sum + p.amount, 0);
        const usdc = normalized.filter(p => p.coin === 'USDC').reduce((sum, p) => sum + (p.amount / 83), 0);
        const dai = normalized.filter(p => p.coin === 'DAI').reduce((sum, p) => sum + (p.amount / 83), 0);

        setTotals({
          totalINR: totalINR.toFixed(2),
          usdcPurchased: usdc.toFixed(2),
          daiPurchased: dai.toFixed(2),
          txCount: normalized.length
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && transactions.length >= 0) {
      drawCharts(transactions);
    }
  }, [transactions, loading]);

  const destroyChart = (refName) => {
    if (chartRefs.current[refName]) {
      chartRefs.current[refName].destroy();
      chartRefs.current[refName] = null;
    }
  };

  const drawCharts = (data) => {
    destroyChart('usdc');
    destroyChart('dai');

    const usdcPayments = data.filter(p => p.coin === 'USDC');
    const daiPayments = data.filter(p => p.coin === 'DAI');

    const aggregatedUSDC = groupPaymentsByDate(usdcPayments).slice(-7);
    const aggregatedDAI = groupPaymentsByDate(daiPayments).slice(-7);

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#52525b', font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#52525b', font: { size: 10 } }
        }
      }
    };

    const ctxUSDC = document.getElementById('barChartDebited')?.getContext('2d');
    if (ctxUSDC) {
      chartRefs.current.usdc = new Chart(ctxUSDC, {
        type: 'bar',
        data: {
          labels: aggregatedUSDC.map(a => a.date),
          datasets: [{
            data: aggregatedUSDC.map(a => a.amount),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 8
          }]
        },
        options: commonOptions
      });
    }

    const ctxDAI = document.getElementById('barChartCredited')?.getContext('2d');
    if (ctxDAI) {
      chartRefs.current.dai = new Chart(ctxDAI, {
        type: 'bar',
        data: {
          labels: aggregatedDAI.map(a => a.date),
          datasets: [{
            data: aggregatedDAI.map(a => a.amount),
            backgroundColor: 'rgba(245, 158, 11, 0.8)',
            borderRadius: 8
          }]
        },
        options: commonOptions
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050117] text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">DeFi UPI Connect Gateway</h1>
            <p className="text-zinc-400 text-sm font-medium mt-1 uppercase tracking-widest flex items-center gap-2">
              <FiZap className="text-cyan-400 animate-pulse" /> Live Smart Contract Monitoring
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-zinc-900/50 backdrop-blur-md border border-purple-500/20 rounded-2xl flex flex-col items-end">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Network Status</p>
              <p className="text-cyan-400 text-xs font-black flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span> SEPOLIA TESTNET
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Bridged Volume', value: `₹${totals.totalINR}`, icon: FiDollarSign, color: 'text-cyan-400 border-cyan-500/20', trend: `${totals.txCount} Conversions` },
            { label: 'Distributed USDC', value: `${totals.usdcPurchased} USDC`, icon: FiTrendingUp, color: 'text-blue-400 border-blue-500/20', trend: 'On-Chain Settled' },
            { label: 'Distributed DAI', value: `${totals.daiPurchased} DAI`, icon: FiActivity, color: 'text-amber-400 border-amber-500/20', trend: 'On-Chain Settled' },
            { label: 'Connected Wallet', value: user?.metamaskId ? `${user.metamaskId.slice(0, 6)}...${user.metamaskId.slice(-4)}` : 'Not Connected', icon: FiCreditCard, color: 'text-purple-400 border-purple-500/20', trend: `UPI ID: ${user?.upiId || 'Not Set'}` },
          ].map((stat, i) => (
            <div key={i} className="group bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 p-7 rounded-[2rem] hover:border-purple-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/[0.02] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border bg-zinc-950/50 ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                <p className="text-zinc-400 text-[10px] font-bold mt-4 uppercase tracking-widest">{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400">USDC Purchases (INR)</h3>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">7D WINDOW</span>
            </div>
            <div className="h-64 relative">
              <canvas id="barChartDebited"></canvas>
            </div>
          </div>

          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black uppercase tracking-widest text-zinc-400">DAI Purchases (INR)</h3>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/10">7D WINDOW</span>
            </div>
            <div className="h-64 relative">
              <canvas id="barChartCredited"></canvas>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black tracking-tighter">On-Chain Gateway Ledger</h2>
            <button className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Refresh Nodes</button>
          </div>

          <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800/50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Receiver UPI ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Fiat Bridged</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Token Purchased</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Estimated Value</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Timestamp</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Receipt Key</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {loading ? (
                  <tr><td colSpan="7" className="p-20 text-center text-zinc-500 font-black uppercase tracking-[0.3em] animate-pulse">Scanning Secure Nodes...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan="7" className="p-20 text-center text-zinc-500 font-black uppercase tracking-[0.3em]">No Transactions Detected</td></tr>
                ) : (
                  transactions.slice(0, 10).map((t) => (
                    <tr key={t._id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400`}>
                            <FiArrowUp />
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm tracking-tight">{t.toUPI}</p>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{t._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-base font-black text-white">
                          ₹{t.amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 bg-zinc-900 border rounded-full text-[9px] font-black uppercase tracking-widest ${t.coin === 'USDC' ? 'text-blue-400 border-blue-500/20' : 'text-amber-400 border-amber-500/20'}`}>
                          {t.coin}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-emerald-500 text-xs font-bold">${(t.amount / 83).toFixed(2)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-zinc-500 text-xs font-medium">{moment(t.timestamp).format('MMM DD, HH:mm')}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <QRCode id={`qr-code-${t._id}`} value={JSON.stringify(t)} size={32} bgColor="transparent" fgColor="#6b21a8" />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <a
                          href={`https://sepolia.etherscan.io/tx/0x${t._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-4 py-2 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/20 rounded-xl text-[9px] font-black uppercase text-purple-400 hover:text-purple-300 transition-all"
                        >
                          VERIFY TX
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

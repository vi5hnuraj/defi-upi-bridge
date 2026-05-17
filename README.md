# 🚀 DeFi UPI Bridge — Pay Online Merchants with Crypto

An elegant, high-performance decentralized payment gateway bridging the gap between traditional fiat banking (Unified Payments Interface - UPI) and decentralized finance (DeFi). 

This project allows users to make online purchases by **paying with their digital assets/stablecoins (like USDC or Ethereum) from their Web3 wallets (MetaMask, OKX Wallet, Coinbase, Trust Wallet) instead of Indian Rupees (INR)**. The bridge automatically verifies the on-chain transaction and settles the traditional UPI payment to the merchant in real-time.

---

## 📸 Core Architecture Flow

```
+-------------------+      Crypto Pay     +---------------------+
|    User Wallet    | ------------------> |  DeFi Bridge Smart  |
| (MetaMask, OKX)   |  (USDC On-Chain)    |     Contract / Sync |
+-------------------+                     +---------------------+
                                                     |
                                                     v
+-------------------+     Settlement      +---------------------+
| Merchant UPI ID   | <------------------ |   Node.js Backend   |
| (Receives Rupee)  |  (Rupee Settlement) |  Settles UPI QR / ID|
+-------------------+                     +---------------------+
```

1. **Checkout Initiation:** The user makes an online purchase at a merchant that requests a standard UPI payment (INR).
2. **Crypto Payment:** Instead of using traditional bank accounts or physical rupees, the user connects their Web3 wallet and authorizes the equivalent amount in stablecoins (e.g. USDC settled on Ethereum Sepolia Testnet).
3. **Bridge Verification:** The backend payment engine monitors the transaction, verifying the cryptographic proof of the on-chain transfer.
4. **Instant UPI Settlement:** Once on-chain receipt is verified, the bridge settles the payment with the merchant directly via their UPI ID, seamlessly completing the transaction in Rupees.

---

## ✨ Features

* **Traditional UPI to DeFi Bridge:** Fast traditional banking payment rails connected with EVM smart contracts to settle Rupee invoices via Web3 assets.
* **Direct Crypto-to-UPI Transfers (UPI Payment View):** A dedicated transaction view allowing users to simply input any standard UPI ID, authorize stablecoin transfers in crypto, and pay the destination merchant in real-time.
* **Dynamic UPI QR Code Generation:** Dynamically generates custom UPI QR codes for seamless offline/online merchant checkout integrations.
* **Live Crypto Price & Conversion Ticker:** Built-in real-time asset pricing engine displaying active market conversion rates (INR to USDC/ETH) for absolute payment transparency.
* **Seamless Multi-Wallet Connector:** High-fidelity native support for MetaMask, OKX Wallet, Coinbase Wallet, Trust Wallet, Rainbow, and Zerion.
* **Ethereum Sepolia Testnet Integration:** Transparent on-chain settlement with transaction verification links leading directly to Sepolia Etherscan.
* **Rich Aesthetics & Premium UX:** Sleek dark-mode system styled with Outfit typography, custom HSL gradients, and smooth micro-animations.

---

## 📂 Project Structure

```
defi-upi-bridge/
├── client/                 # Frontend React Application (Vite)
│   ├── src/
│   │   ├── components/     # UI Components (Navbar, Hero, Business, CardDeal)
│   │   ├── pages/          # Pages (Dashboard, Landing)
│   │   ├── constants/      # Site assets, navigation & content mappings
│   │   ├── index.css       # Core typography & HSL color design tokens
│   │   └── main.jsx        # Setup of ThirdwebProvider & QueryClient
│   ├── tailwind.config.cjs # Responsive breakpoints & layout extensions
│   └── index.html          # HTML entry point
│
├── backend/                # Backend API Sync Service (Express.js)
│   ├── src/
│   ├── server.js           # Server routes & payment processing engine
│   └── package.json        # Service dependencies
│
└── README.md               # Dynamic documentation portal
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (built on Vite for lightning-fast HMR)
- **Styling:** Tailwind CSS (Custom glassmorphic utility layers)
- **Web3 Interface:** `@thirdweb-dev/react` & `@thirdweb-dev/wallets`
- **Asynchronous State:** React Query (`@tanstack/react-query`)

### Backend
- **Engine:** Node.js & Express.js
- **Verification Engine:** Dynamic QR code generation, payment state listeners, and cryptographically secure ledger state syncs.

---

## 🚀 Getting Started

### 1. Clone & Navigate
```bash
git clone <your-github-repo-url>
cd defi-upi-bridge
```

### 2. Configure Environment Variables

Create a `.env` file in the **`client/`** directory:
```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

Create a `.env` file in the **`backend/`** directory:
```env
PORT=5001
```

### 3. Start the Backend Sync Engine
```bash
cd backend
npm install
npm run dev
```
*The backend server will launch on `http://localhost:5001`.*

### 4. Start the Frontend Dashboard
```bash
cd ../client
npm install
npm run dev
```
*The frontend client will launch on `http://localhost:5173`.*

---

## 🔒 Security & Git Best Practices
* **Zero Secret Commits:** The `.env` files containing private credentials are kept strictly out of the repository.
* **Pre-Configured Gitignore:** A comprehensive `.gitignore` is set up at the root to block `node_modules/`, system caches (`.DS_Store`), and local environments from being pushed to GitHub.

---

## 👨‍💻 Author

**Vishnuraj D**
*Web3 & Full-Stack Developer*

Building modern, scalable, and decentralized products bridging standard fintech rails with the decentralized Web3 future.

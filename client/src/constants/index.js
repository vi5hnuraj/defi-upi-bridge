import { people01, people02, people03, facebook, instagram, linkedin, twitter, airbnb, binance, coinbase, dropbox, send, shield, star  } from "../assets";
export const navLinks = [
 // {
   // id: "product",
  //  title: "Take Loans",
  //  redirect: '/flash-loans' 
 // },
  {
    id: "clients",
    title: "Crypto to UPI",
    redirect: '/cryptupi' 
  },
  {
    id: "home",
    title: "UPI Payments",
    redirect: '/bank-detail' // This link is now correct, but we need to add the page for it.
  },
  {
    id: "features",
    title: "Crypto Tracker",
    // This now correctly matches the route in App.jsx
    redirect: '/crypto-tracker'
  },
];
export const features = [
  {
    id: "feature-1",
    icon: star,
    title: "UPI to Crypto",
    content:
      "Instantly send fiat from your UPI ID and have it deposited directly as USDC or DAI into a MetaMask wallet.",
  },
  {
    id: "feature-2",
    icon: shield,
    title: "100% Secured",
    content:
      "We take proactive steps using encrypted ledgers to ensure your transactions and wallet data are secure.",
  },
  {
    id: "feature-3",
    icon: send,
    title: "Zero Delay",
    content:
      "Our automated smart contracts execute the swap in seconds, completely removing the hassle of centralized exchanges.",
  },
];

export const feedback = [
  {
    id: "feedback-1",
    content:
      "Bridging my bank account directly to my Metamask wallet using UPI was seamlessly fast. Outstanding developer experience!",
    name: "Alex Rivera",
    title: "DeFi Degen & Builder",
    img: people01,
  },
  {
    id: "feedback-2",
    content:
      "No more high exchanges fees or waiting for centralized platforms. DeFi UPI Connect is the ultimate fiat-to-crypto bridge.",
    name: "Sarah Chen",
    title: "Crypto Investor",
    img: people02,
  },
  {
    id: "feedback-3",
    content:
      "A game-changer for off-ramp/on-ramp solutions in emerging markets. It is incredibly simple and 100% secure.",
    name: "Vikram Mehta",
    title: "Web3 Founder",
    img: people03,
  },
];

export const stats = [
  {
    id: "stats-1",
    title: "User Active",
    value: "3800+",
  },
  {
    id: "stats-2",
    title: "Trusted by Company",
    value: "230+",
  },
  {
    id: "stats-3",
    title: "Transaction",
    value: "$230M+",
  },
];

export const footerLinks = [
  {
    title: "Useful Links",
    links: [
      {
        name: "Content",
        link: "#",
      },
      {
        name: "How it Works",
        link: "#",
      },
      {
        name: "Create",
        link: "#",
      },
      {
        name: "Explore",
        link: "#",
      },
      {
        name: "Terms & Services",
        link: "#",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        name: "Help Center",
        link: "#",
      },
      {
        name: "Partners",
        link: "#",
      },
      {
        name: "Suggestions",
        link: "#",
      },
      {
        name: "Blog",
        link: "#",
      },
      {
        name: "Newsletters",
        link: "#",
      },
    ],
  },
  {
    title: "Partner",
    links: [
      {
        name: "Our Partner",
        link: "#",
      },
      {
        name: "Become a Partner",
        link: "#",
      },
    ],
  },
];

export const socialMedia = [
  {
    id: "social-media-1",
    icon: instagram,
    link: "https://www.instagram.com/",
  },
  {
    id: "social-media-2",
    icon: facebook,
    link: "https://www.facebook.com/",
  },
  {
    id: "social-media-3",
    icon: twitter,
    link: "https://www.twitter.com/",
  },
  {
    id: "social-media-4",
    icon: linkedin,
    link: "https://www.linkedin.com/",
  },
];

export const clients = [
  {
    id: "client-1",
    logo: airbnb,
  },
  {
    id: "client-2",
    logo: binance,
  },
  {
    id: "client-3",
    logo: coinbase,
  },
  {
    id: "client-4",
    logo: dropbox,
  },
];
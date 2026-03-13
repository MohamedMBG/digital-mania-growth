import {
  Bitcoin,
  CreditCard,
  Landmark,
  Wallet,
} from "lucide-react";

export const paymentMethods = [
  {
    id: "card",
    name: "Credit or debit card",
    desc: "Visa, Mastercard, and Amex",
    icon: CreditCard,
    fee: "No extra fee",
    eta: "Instant",
  },
  {
    id: "paypal",
    name: "PayPal",
    desc: "Fast checkout with saved billing",
    icon: Wallet,
    fee: "1.5% processing",
    eta: "Instant",
  },
  {
    id: "crypto",
    name: "Crypto",
    desc: "USDT, Bitcoin, Ethereum",
    icon: Bitcoin,
    fee: "Network fee only",
    eta: "2-10 minutes",
  },
  {
    id: "bank",
    name: "Bank transfer",
    desc: "Manual review for larger top-ups",
    icon: Landmark,
    fee: "No extra fee",
    eta: "1-3 hours",
  },
];

export const savedCards = [
  { id: "visa-4242", brand: "Visa", last4: "4242", expires: "08/28", holder: "Marcus Lee" },
  { id: "mc-1847", brand: "Mastercard", last4: "1847", expires: "02/29", holder: "Marcus Lee" },
];

export const mockOrders = [
  {
    id: "#DM-2184",
    service: "Instagram Followers",
    platform: "Instagram",
    link: "instagram.com/nova.studio",
    qty: 5000,
    spent: "$24.95",
    status: "Completed",
    progress: 100,
    date: "2026-03-12",
  },
  {
    id: "#DM-2183",
    service: "TikTok Views",
    platform: "TikTok",
    link: "tiktok.com/@novastudio/video/8824",
    qty: 75000,
    spent: "$111.75",
    status: "In Progress",
    progress: 76,
    date: "2026-03-12",
  },
  {
    id: "#DM-2182",
    service: "YouTube Likes",
    platform: "YouTube",
    link: "youtube.com/watch?v=QX3demo",
    qty: 1500,
    spent: "$13.49",
    status: "Pending",
    progress: 18,
    date: "2026-03-11",
  },
  {
    id: "#DM-2181",
    service: "Spotify Plays",
    platform: "Spotify",
    link: "open.spotify.com/track/digitalmania",
    qty: 10000,
    spent: "$34.90",
    status: "Completed",
    progress: 100,
    date: "2026-03-10",
  },
];

export const walletActivity = [
  { id: "txn-1", title: "Top up via Visa", amount: "+$100.00", status: "Completed", date: "March 13, 2026" },
  { id: "txn-2", title: "Order payment", amount: "-$24.95", status: "Completed", date: "March 12, 2026" },
  { id: "txn-3", title: "Order payment", amount: "-$111.75", status: "Completed", date: "March 12, 2026" },
  { id: "txn-4", title: "Top up via PayPal", amount: "+$50.00", status: "Completed", date: "March 11, 2026" },
];

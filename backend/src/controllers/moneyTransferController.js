// src/controllers/moneyTransferController.js
import MoneyTransfer from '../models/MoneyTransfer.js';
import User from '../models/User.js';
import BankDetails from '../models/bank.js';
import RequestMoney from '../models/requestMoney.js';

/** Create money transfer (kept from your original) */
export const createMoneyTransfer = async (req, res) => {
  const { senderUPI, receiverUPI, amount, savePercent = 0 } = req.body;

  try {
    const senderBankDetails = await BankDetails.findOne({ upiId: senderUPI });
    if (!senderBankDetails) return res.status(404).json({ message: 'Sender bank details not found' });

    const receiverBankDetails = await BankDetails.findOne({ upiId: receiverUPI });
    if (!receiverBankDetails) return res.status(404).json({ message: 'Receiver bank details not found' });

    const savedAmount = (amount * savePercent) / 100;
    const transferAmount = amount - savedAmount;

    if (senderBankDetails.amount < amount) return res.status(400).json({ message: 'Insufficient funds' });

    senderBankDetails.amount -= amount;
    receiverBankDetails.amount += transferAmount;
    senderBankDetails.savings = (senderBankDetails.savings || 0) + savedAmount;

    const moneyTransfer = new MoneyTransfer({
      sender: senderBankDetails.user,
      senderUPI,
      receiver: receiverBankDetails.user,
      receiverUPI,
      amount: transferAmount,
      savedAmount,
      savePercent,
    });

    await moneyTransfer.save();
    await senderBankDetails.save();
    await receiverBankDetails.save();

    return res.json({ message: 'Money transfer successful', senderUPI, receiverUPI, transferAmount, savedAmount });
  } catch (err) {
    console.error("createMoneyTransfer error:", err);
    return res.status(500).send('Server error');
  }
};

/** Get money transfers for current user (kept) */
export const getMoneyTransfers = async (req, res) => {
  try {
    const userId = req.user.id;
    const transfers = await MoneyTransfer.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate('sender receiver');
    return res.json(transfers);
  } catch (err) {
    console.error("getMoneyTransfers error:", err);
    return res.status(500).send('Server error');
  }
};

/**
 * POST /api/transfer/money-requested
 * Create a request on a target user's RequestMoney document (creates doc if not exists)
 * Body: { receiver: <upi or metamask>, amount: Number }
 * Requires auth (req.user)
 */
export const requestMoneyCreate = async (req, res) => {
  try {
    const { receiver, amount } = req.body;
    const userId = req.user.id;

    const requester = await User.findById(userId).lean();
    if (!requester) return res.status(401).json({ message: "User not found." });

    // find the recipient by upi or metamask
    let recipientDoc = await RequestMoney.findOne({
      $or: [{ upi: receiver }, { metamask: receiver }]
    });

    // If recipient doc doesn't exist, attempt to create one using user record (if exists)
    if (!recipientDoc) {
      const recUser = await User.findOne({ $or: [{ upi: receiver }, { metamask: receiver }] }).lean();
      const recUserObj = recUser || {};
      recipientDoc = await RequestMoney.create({
        user: recUserObj._id || null,
        upi: recUserObj.upi || (receiver && receiver.includes('@') ? receiver : undefined),
        metamask: recUserObj.metamask || (receiver && receiver.startsWith('0x') ? receiver : undefined),
        requests: []
      });
    }

    // push new request item
    const requestItem = {
      amount: Number(amount),
      sender: requester.upi || requester.metamask || requester._id.toString(),
      name: requester.username || requester.name || "Unknown",
    };

    recipientDoc.requests.push(requestItem);
    await recipientDoc.save();

    return res.status(201).json({ success: true, message: "Request added", request: requestItem });
  } catch (err) {
    console.error("requestMoneyCreate error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/transfer/all-request-money
 * Public (no auth) endpoint returning flattened requests array across all RequestMoney docs.
 * Response: { message: "found", requests: [ ... ] }
 */
export const getAllRequestMoney = async (req, res) => {
  try {
    const docs = await RequestMoney.find().sort({ createdAt: -1 }).lean();

    const requests = docs.flatMap((doc) => {
      const ownerUpi = doc.upi || null;
      const ownerMetamask = doc.metamask || null;
      const ownerUserId = doc.user || null;
      const requestedAt = doc.createdAt || null;

      return (doc.requests || []).map((r) => ({
        _id: r._id || `${doc._id}_${Math.random().toString(36).slice(2, 8)}`,
        name: r.name,
        sender: r.sender,
        amount: typeof r.amount === "number" ? r.amount : Number(r.amount) || 0,
        ownerUpi,
        ownerMetamask,
        ownerUserId,
        requestedAt,
      }));
    });

    return res.status(200).json({ message: "found", requests });
  } catch (err) {
    console.error("getAllRequestMoney error:", err);
    return res.status(500).json({ message: "Server error fetching requests" });
  }
};

/** Legacy: return raw docs (kept if needed) */
export const getAllRawDocs = async (req, res) => {
  try {
    const rr = await RequestMoney.find({});
    return res.status(200).json({ rr });
  } catch (error) {
    console.error("getAllRawDocs error:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

export default {
  createMoneyTransfer,
  getMoneyTransfers,
  requestMoneyCreate,
  getAllRequestMoney,
  getAllRawDocs,
};

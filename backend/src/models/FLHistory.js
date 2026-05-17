import mongoose from 'mongoose';

const FLHistorySchema = new mongoose.Schema({
  // Example fields, update as needed
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FLHistory = mongoose.model('FLHistory', FLHistorySchema);

export default FLHistory;
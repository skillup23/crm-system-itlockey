import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    domen: { type: String, required: true, trim: true },
    registrator: { type: String, default: '', trim: true },
    datedomen: { type: Date, default: null },
    hosting: { type: String, default: '', trim: true },
    datehosting: { type: Date, default: null },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export default mongoose.models.Payment ||
  mongoose.model('Payment', PaymentSchema);

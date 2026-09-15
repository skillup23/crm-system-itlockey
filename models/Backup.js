import mongoose from 'mongoose';

const BackupSchema = new mongoose.Schema(
  {
    server: { type: String, required: true, trim: true },
    checkDate: { type: Date, default: Date.now },
    backupDate: { type: Date, default: Date.now },
    comment: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Успешно', 'Внимание', 'Ошибка'],
      default: 'Успешно',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export default mongoose.models.Backup || mongoose.model('Backup', BackupSchema);

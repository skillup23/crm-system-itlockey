import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    company: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Открыта', 'В работе', 'Ожидание', 'Закрыта', 'Архив'],
      default: 'Открыта',
    },
    todoDeadline: { type: Date, default: null },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    executors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    observers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);

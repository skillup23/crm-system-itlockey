import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true, default: 'other' },
    content: { type: String, required: true },
    authorName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

ArticleSchema.index({ title: 'text', content: 'text', group: 1 });

export default mongoose.models.Article ||
  mongoose.model('Article', ArticleSchema);

import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Укажите название организации'],
      trim: true,
    },
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Organization ||
  mongoose.model('Organization', OrganizationSchema);

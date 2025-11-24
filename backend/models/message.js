import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
messageSchema.index({ userId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);

const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, default: "general" },
    subject: { type: String, default: null },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.models.ContactMessage || mongoose.model("ContactMessage", contactMessageSchema);

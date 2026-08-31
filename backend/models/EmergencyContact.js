const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    number: { type: String, required: true },
    category: { type: String, default: "general" },
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

module.exports = mongoose.models.EmergencyContact || mongoose.model("EmergencyContact", emergencyContactSchema);

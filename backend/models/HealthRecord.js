const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    record_type: {
      type: String,
      enum: ["prescription", "report", "test", "vaccine"],
      default: "prescription",
    },
    notes: { type: String, default: "" },
    file_url: { type: String, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
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

module.exports = mongoose.models.HealthRecord || mongoose.model("HealthRecord", healthRecordSchema);

const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, default: "" },
    benefits: { type: String, default: "" },
    link: { type: String, default: "" },
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

module.exports = mongoose.models.Scheme || mongoose.model("Scheme", schemeSchema);

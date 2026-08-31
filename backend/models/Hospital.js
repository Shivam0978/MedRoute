const mongoose = require("mongoose");

const bedsSchema = new mongoose.Schema(
  {
    icu_available: { type: Number, default: 0 },
    icu_total: { type: Number, default: 0 },
    oxygen_available: { type: Number, default: 0 },
    oxygen_total: { type: Number, default: 0 },
    emergency_available: { type: Number, default: 0 },
    emergency_total: { type: Number, default: 0 },
    general_available: { type: Number, default: 0 },
    general_total: { type: Number, default: 0 },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    specialties: { type: [String], default: [] },
    rating: { type: Number, default: 4.0 },
    cost_tier: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    emergency_24x7: { type: Boolean, default: false },
    has_icu: { type: Boolean, default: false },
    has_mri: { type: Boolean, default: false },
    has_ambulance: { type: Boolean, default: false },
    is_government: { type: Boolean, default: false },
    ayushman: { type: Boolean, default: false },
    image_url: { type: String, default: null },
    beds: { type: bedsSchema, default: () => ({}) },
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

hospitalSchema.index({ name: "text", city: "text", specialties: "text" });

module.exports = mongoose.models.Hospital || mongoose.model("Hospital", hospitalSchema);

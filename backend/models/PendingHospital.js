const mongoose = require("mongoose");

const pendingHospitalSchema = new mongoose.Schema(
  {
    submitted_by: { type: String, required: true },
    submitter_email: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, default: null },
    phone: { type: String, default: null },
    specialties: { type: [String], default: [] },
    emergency_24x7: { type: Boolean, default: false },
    has_icu: { type: Boolean, default: false },
    has_mri: { type: Boolean, default: false },
    has_ambulance: { type: Boolean, default: false },
    is_government: { type: Boolean, default: false },
    ayushman: { type: Boolean, default: false },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    notes: { type: String, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
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

module.exports = mongoose.models.PendingHospital || mongoose.model("PendingHospital", pendingHospitalSchema);

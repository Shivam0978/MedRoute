const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
    experience_years: { type: Number, default: 5 },
    consultation_fee: { type: Number, default: 500 },
    rating: { type: Number, default: 4.5 },
    timing: { type: String, default: "10:00 AM - 5:00 PM" },
    available_days: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    avatar_url: { type: String, default: null },
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

doctorSchema.virtual("hospitals", {
  ref: "Hospital",
  localField: "hospital_id",
  foreignField: "_id",
  justOne: true,
});

doctorSchema.virtual("hospital", {
  ref: "Hospital",
  localField: "hospital_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

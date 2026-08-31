const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
    appointment_date: { type: String, required: true },
    appointment_time: { type: String, required: true },
    patient_name: { type: String, required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "confirmed" },
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

appointmentSchema.virtual("doctors", {
  ref: "Doctor",
  localField: "doctor_id",
  foreignField: "_id",
  justOne: true,
});

appointmentSchema.virtual("doctor", {
  ref: "Doctor",
  localField: "doctor_id",
  foreignField: "_id",
  justOne: true,
});

appointmentSchema.virtual("hospitals", {
  ref: "Hospital",
  localField: "hospital_id",
  foreignField: "_id",
  justOne: true,
});

appointmentSchema.virtual("hospital", {
  ref: "Hospital",
  localField: "hospital_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

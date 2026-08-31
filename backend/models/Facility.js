const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
    category: { type: String, default: "general" },
    available: { type: Boolean, default: true },
    notes: { type: String, default: "" },
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

facilitySchema.virtual("hospital", {
  ref: "Hospital",
  localField: "hospital_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.models.Facility || mongoose.model("Facility", facilitySchema);

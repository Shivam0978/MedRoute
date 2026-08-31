const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
    head_doctor: { type: String, default: "" },
    phone: { type: String, default: "" },
    description: { type: String, default: "" },
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

departmentSchema.virtual("hospital", {
  ref: "Hospital",
  localField: "hospital_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.models.Department || mongoose.model("Department", departmentSchema);

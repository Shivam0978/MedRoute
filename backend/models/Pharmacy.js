const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    open_24x7: { type: Boolean, default: false },
    home_delivery: { type: Boolean, default: false },
    medicines: { type: [String], default: [] },
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

module.exports = mongoose.models.Pharmacy || mongoose.model("Pharmacy", pharmacySchema);

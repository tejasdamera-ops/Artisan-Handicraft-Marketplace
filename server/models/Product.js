import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, required: true, trim: true, index: "text" },
    price: { type: Number, required: true, min: 0 },
    images: { type: [imageSchema], validate: [(v) => v.length <= 5, "Maximum 5 images allowed."] },
    category: { type: String, required: true, trim: true, index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    region: { type: String, trim: true, index: true },
    materials: [{ type: String, trim: true }],
    artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isApproved: { type: Boolean, default: false, index: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", category: "text", region: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;

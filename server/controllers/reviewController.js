import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";

const updateProductRating = async (productId) => {
  const objectId = new mongoose.Types.ObjectId(productId);
  const stats = await Review.aggregate([
    { $match: { productId: objectId } },
    { $group: { _id: "$productId", average: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  const rating = stats[0] || { average: 0, count: 0 };
  await Product.findByIdAndUpdate(productId, {
    ratings: {
      average: Number(rating.average.toFixed(1)),
      count: rating.count
    }
  });
};

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const purchased = await Order.exists({
    buyerId: req.user._id,
    status: "Delivered",
    "items.productId": productId
  });

  if (!purchased) {
    res.status(403);
    throw new Error("You can review products only after a delivered purchase.");
  }

  const review = await Review.findOneAndUpdate(
    { productId, buyerId: req.user._id },
    { rating, comment },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate("buyerId", "name avatar");

  await updateProductRating(review.productId);

  const product = await Product.findById(productId);
  await Notification.create({
    userId: product.artisanId,
    type: "review",
    message: `${req.user.name} reviewed ${product.title}.`
  });

  res.status(201).json(review);
});

export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId })
    .populate("buyerId", "name avatar")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

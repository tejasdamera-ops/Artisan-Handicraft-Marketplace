import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("buyerId", "name email")
    .populate("items.productId", "title")
    .populate("items.artisanId", "name email shop")
    .sort({ createdAt: -1 });

  res.json(orders);
});

export const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, pendingProducts, revenue] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({ approvalStatus: "pending" }),
    Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ])
  ]);

  res.json({
    totalUsers,
    totalOrders,
    pendingProducts,
    totalRevenue: revenue[0]?.total || 0
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.json(user);
});

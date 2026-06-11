import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendOrderEmail } from "../utils/email.js";

const orderPopulate = [
  { path: "buyerId", select: "name email" },
  { path: "items.productId", select: "title images" },
  { path: "items.artisanId", select: "name email shop" }
];

export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], address, paymentProvider = "razorpay" } = req.body;

  if (!items.length) {
    res.status(400);
    throw new Error("Order must include at least one item.");
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isApproved: true });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const orderItems = items.map((item) => {
    const product = productMap.get(String(item.productId));
    if (!product) throw new Error("One or more products are unavailable.");
    if (product.stock < item.quantity) throw new Error(`${product.title} does not have enough stock.`);

    return {
      productId: product._id,
      artisanId: product.artisanId,
      title: product.title,
      image: product.images?.[0]?.url,
      price: product.price,
      quantity: Number(item.quantity)
    };
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    buyerId: req.user._id,
    items: orderItems,
    totalAmount,
    address,
    paymentProvider
  });

  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } }, { new: true })
    )
  );

  const artisanIds = [...new Set(orderItems.map((item) => String(item.artisanId)))];
  await Notification.insertMany([
    {
      userId: req.user._id,
      type: "order",
      message: `Order ${order._id} was placed.`
    },
    ...artisanIds.map((artisanId) => ({
      userId: artisanId,
      type: "order",
      message: `New order received: ${order._id}.`
    }))
  ]);

  await sendOrderEmail(req.user, order, "Order placed");
  res.status(201).json(await order.populate(orderPopulate));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const filters =
    req.user.role === "artisan"
      ? { "items.artisanId": req.user._id }
      : req.user.role === "admin"
        ? {}
        : { buyerId: req.user._id };

  const orders = await Order.find(filters).populate(orderPopulate).sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(orderPopulate);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const isBuyer = String(order.buyerId._id) === String(req.user._id);
  const isArtisan = order.items.some((item) => String(item.artisanId._id) === String(req.user._id));

  if (!isBuyer && !isArtisan && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You cannot view this order.");
  }

  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["Placed", "Shipped", "Delivered"];

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("Invalid order status.");
  }

  const order = await Order.findById(req.params.id).populate(orderPopulate);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const isOrderArtisan = order.items.some((item) => String(item.artisanId._id) === String(req.user._id));
  if (!isOrderArtisan && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only the artisan or admin can update order status.");
  }

  order.status = status;
  await order.save();

  const buyer = await User.findById(order.buyerId._id);
  await Notification.create({
    userId: order.buyerId._id,
    type: "order",
    message: `Order ${order._id} is now ${status}.`
  });

  if (["Shipped", "Delivered"].includes(status)) {
    await sendOrderEmail(buyer, order, `Order ${status.toLowerCase()}`);
  }

  res.json(order);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (String(order.buyerId) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only the buyer can cancel this order.");
  }

  if (order.status !== "Placed") {
    res.status(400);
    throw new Error("Orders can only be cancelled before shipping.");
  }

  order.status = "Cancelled";
  await order.save();

  await Promise.all(
    order.items.map((item) => Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }))
  );

  res.json(order);
});

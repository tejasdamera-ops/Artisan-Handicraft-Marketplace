import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { getRazorpay, getStripe, verifyRazorpaySignature } from "../utils/payment.js";

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId, provider = "razorpay" } = req.body;
  const order = await Order.findById(orderId);

  if (!order || String(order.buyerId) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (provider === "stripe") {
    const stripe = getStripe();
    if (!stripe) {
      res.status(503);
      throw new Error("Stripe is not configured.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "inr",
      metadata: { orderId: String(order._id) }
    });

    order.paymentProvider = "stripe";
    order.paymentOrderId = paymentIntent.id;
    await order.save();

    res.json({ provider, clientSecret: paymentIntent.client_secret, paymentOrderId: paymentIntent.id });
    return;
  }

  const razorpay = getRazorpay();
  if (!razorpay) {
    const mockPaymentOrderId = `mock_${order._id}`;
    order.paymentOrderId = mockPaymentOrderId;
    await order.save();
    res.json({ provider: "mock", paymentOrderId: mockPaymentOrderId, amount: order.totalAmount });
    return;
  }

  const paymentOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: String(order._id)
  });

  order.paymentProvider = "razorpay";
  order.paymentOrderId = paymentOrder.id;
  await order.save();

  res.json({
    provider,
    paymentOrderId: paymentOrder.id,
    amount: paymentOrder.amount,
    currency: paymentOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, provider = "razorpay", paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findById(orderId);

  if (!order || String(order.buyerId) !== String(req.user._id)) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (provider === "razorpay" && process.env.RAZORPAY_KEY_SECRET) {
    const valid = verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      order.paymentStatus = "Failed";
      await order.save();
      res.status(400);
      throw new Error("Payment verification failed.");
    }
  }

  order.paymentStatus = "Paid";
  order.paymentId = paymentId || razorpay_payment_id || "manual-verification";
  await order.save();

  await Notification.create({
    userId: order.buyerId,
    type: "order",
    message: `Payment received for order ${order._id}.`
  });

  res.json(order);
});

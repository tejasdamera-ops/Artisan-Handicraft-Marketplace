import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const clearOrders = async () => {
  await connectDB();

  const orders = await Order.find();
  let restoredUnits = 0;

  for (const order of orders) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      restoredUnits += item.quantity;
    }
  }

  const result = await Order.deleteMany({});
  await Notification.deleteMany({ type: "order" });

  console.log(`Cleared ${result.deletedCount} orders.`);
  console.log(`Restored ${restoredUnits} product units.`);

  await mongoose.disconnect();
};

clearOrders().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

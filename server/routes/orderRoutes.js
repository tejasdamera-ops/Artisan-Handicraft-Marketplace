import express from "express";
import { cancelOrder, createOrder, getMyOrders, getOrderById, updateOrderStatus } from "../controllers/orderController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);

export default router;

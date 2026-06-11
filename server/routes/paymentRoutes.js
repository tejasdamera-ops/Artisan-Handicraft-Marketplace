import express from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", protect, authorize("buyer"), createPaymentOrder);
router.post("/verify", protect, authorize("buyer"), verifyPayment);

export default router;

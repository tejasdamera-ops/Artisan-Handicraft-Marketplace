import express from "express";
import { createReview, getReviews } from "../controllers/reviewController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("buyer"), createReview);
router.get("/:productId", getReviews);

export default router;

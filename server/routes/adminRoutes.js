import express from "express";
import { getAllOrders, getStats, getUsers, updateUserRole } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/orders", getAllOrders);
router.get("/stats", getStats);

export default router;

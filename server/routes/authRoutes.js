import express from "express";
import { getMe, login, logoutAll, refreshToken, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, getMe);
router.put("/profile", protect, upload.array("avatar", 1), updateProfile);
router.post("/logout-all", protect, logoutAll);

export default router;

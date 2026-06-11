import express from "express";
import {
  approveProduct,
  createProduct,
  deleteProduct,
  getArtisanShop,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { authorize, optionalAuth, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", optionalAuth, getProducts);
router.get("/shop/:id", getArtisanShop);
router.get("/:id", optionalAuth, getProductById);
router.post("/", protect, authorize("artisan"), upload.array("images", 5), createProduct);
router.put("/:id", protect, authorize("artisan", "admin"), upload.array("images", 5), updateProduct);
router.delete("/:id", protect, authorize("artisan", "admin"), deleteProduct);
router.put("/:id/approve", protect, authorize("admin"), approveProduct);

export default router;

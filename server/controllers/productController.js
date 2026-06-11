import asyncHandler from "../utils/asyncHandler.js";
import { uploadImages, deleteImage } from "../utils/cloudinaryUpload.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const parseMaterials = (materials) => {
  if (!materials) return [];
  if (Array.isArray(materials)) return materials;
  return String(materials)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, region, minPrice, maxPrice, rating, artisanId, includePending } = req.query;
  const filters = {};

  if (keyword) filters.$text = { $search: keyword };
  if (category) filters.category = category;
  if (region) filters.region = region;
  if (artisanId) filters.artisanId = artisanId;
  if (rating) filters["ratings.average"] = { $gte: Number(rating) };
  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = Number(minPrice);
    if (maxPrice) filters.price.$lte = Number(maxPrice);
  }

  const canViewPending =
    req.user?.role === "admin" || (req.user?.role === "artisan" && artisanId && String(req.user._id) === String(artisanId));

  if (!includePending || !canViewPending) {
    filters.isApproved = true;
  }

  const products = await Product.find(filters)
    .populate("artisanId", "name shop location avatar")
    .sort({ createdAt: -1 });

  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("artisanId", "name shop avatar");

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  if (!product.isApproved && req.user?.role !== "admin" && String(product.artisanId._id) !== String(req.user?._id)) {
    res.status(403);
    throw new Error("This product is not live yet.");
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const images = await uploadImages(req.files, "artisan-market/products");
  const product = await Product.create({
    title: req.body.title || req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    region: req.body.region,
    materials: parseMaterials(req.body.materials),
    images,
    artisanId: req.user._id
  });

  const admins = await User.find({ role: "admin" }).select("_id");
  await Notification.insertMany(
    admins.map((admin) => ({
      userId: admin._id,
      type: "product",
      message: `${req.user.name} submitted ${product.title} for approval.`
    }))
  );

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  if (String(product.artisanId) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only update your own products.");
  }

  const newImages = await uploadImages(req.files, "artisan-market/products");

  product.title = req.body.title || req.body.name || product.title;
  product.description = req.body.description ?? product.description;
  product.price = req.body.price ?? product.price;
  product.category = req.body.category ?? product.category;
  product.stock = req.body.stock ?? product.stock;
  product.region = req.body.region ?? product.region;
  product.materials = req.body.materials ? parseMaterials(req.body.materials) : product.materials;
  product.images = [...product.images, ...newImages].slice(0, 5);

  if (req.user.role === "artisan") {
    product.isApproved = false;
    product.approvalStatus = "pending";
  }

  await product.save();
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  if (String(product.artisanId) !== String(req.user._id) && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You can only delete your own products.");
  }

  await Promise.all(product.images.map((image) => deleteImage(image.publicId)));
  await product.deleteOne();
  res.json({ message: "Product deleted." });
});

export const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const approved = req.body.approved !== false;
  product.isApproved = approved;
  product.approvalStatus = approved ? "approved" : "rejected";
  await product.save();

  await Notification.create({
    userId: product.artisanId,
    type: "product",
    message: `${product.title} was ${product.approvalStatus}.`
  });

  res.json(product);
});

export const getArtisanShop = asyncHandler(async (req, res) => {
  const artisan = await User.findOne({ _id: req.params.id, role: "artisan" }).select("-password");

  if (!artisan) {
    res.status(404);
    throw new Error("Artisan not found.");
  }

  const products = await Product.find({ artisanId: artisan._id, isApproved: true }).sort({ createdAt: -1 });
  res.json({ artisan, products });
});

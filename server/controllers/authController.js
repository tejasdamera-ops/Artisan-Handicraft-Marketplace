import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenResponse, signAccessToken } from "../utils/token.js";
import { uploadImages } from "../utils/cloudinaryUpload.js";
import User from "../models/User.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "buyer", shop } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    shop: role === "artisan" ? shop : undefined
  });

  sendTokenResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  sendTokenResponse(res, user);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Refresh token is required.");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshTokenVersion !== decoded.tokenVersion) {
    res.status(401);
    throw new Error("Invalid refresh token.");
  }

  res.json({ accessToken: signAccessToken(user), user: user.toSafeJSON() });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeJSON());
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (typeof updates.shop === "string") {
    updates.shop = JSON.parse(updates.shop);
  }

  if (req.files?.length) {
    const [avatar] = await uploadImages(req.files, "artisan-market/avatars");
    updates.avatar = avatar;
    if (req.user.role === "artisan") {
      updates.shop = { ...(req.user.shop?.toObject?.() || req.user.shop || {}), profilePhoto: avatar };
    }
  }

  delete updates.password;
  delete updates.role;
  delete updates.email;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json(user.toSafeJSON());
});

export const logoutAll = asyncHandler(async (req, res) => {
  req.user.refreshTokenVersion += 1;
  await req.user.save();
  res.json({ message: "Logged out from all sessions." });
});

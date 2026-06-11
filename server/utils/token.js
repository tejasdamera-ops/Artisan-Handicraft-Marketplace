import jwt from "jsonwebtoken";

export const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.refreshTokenVersion },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );

export const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, tokenVersion: user.refreshTokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );

export const sendTokenResponse = (res, user, statusCode = 200) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(statusCode).json({
    user: user.toSafeJSON ? user.toSafeJSON() : user,
    accessToken,
    refreshToken
  });
};

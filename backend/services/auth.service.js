const User = require('../models/User');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const { hashToken, signAccessToken, signRefreshToken } = require('../utils/auth');

exports.register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create(userData);
  return user;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }
  return user;
};

exports.handleRefreshToken = async (refreshToken) => {
  const hashedToken = hashToken(refreshToken);
  
  // Find user by hashed refresh token
  const user = await User.findOne({ refreshTokens: hashedToken });
  
  // Token Reuse Detection
  if (!user) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      // Hacked user found! Revoke all tokens.
      const hackedUser = await User.findById(decoded.id);
      if (hackedUser) {
        hackedUser.refreshTokens = [];
        await hackedUser.save({ validateBeforeSave: false });
      }
    } catch (err) {
      // Token is just invalid or expired, do nothing
    }
    throw new AppError('Security Alert: Token reuse detected or invalid token. Please log in again.', 403);
  }

  // Token is valid and belongs to a user
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (decoded.id !== user.id) {
      throw new AppError('Token invalid', 403);
    }
  } catch (err) {
    // Expired token
    user.refreshTokens = user.refreshTokens.filter(t => t !== hashedToken);
    await user.save({ validateBeforeSave: false });
    throw new AppError('Refresh token expired, please log in again', 403);
  }

  // Generate new tokens
  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);
  const newHashedToken = hashToken(newRefreshToken);

  // Replace old token with new one (Rotation)
  user.refreshTokens = user.refreshTokens.filter(t => t !== hashedToken);
  user.refreshTokens.push(newHashedToken);
  await user.save({ validateBeforeSave: false });

  return { user, newAccessToken, newRefreshToken };
};

exports.logout = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) return;
  
  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter(t => t !== hashedToken);
    await user.save({ validateBeforeSave: false });
  }
};

exports.logoutAll = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
  }
};

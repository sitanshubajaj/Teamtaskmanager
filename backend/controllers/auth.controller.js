const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const { sendTokenResponse } = require('../utils/auth');

exports.register = catchAsync(async (req, res, next) => {
  const user = await authService.register(req.body);
  sendTokenResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  sendTokenResponse(user, 200, res);
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  const { user, newAccessToken, newRefreshToken } = await authService.handleRefreshToken(refreshToken);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  };

  res.cookie('jwt_refresh', newRefreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    data: { accessToken: newAccessToken }
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (req.user) {
    await authService.logout(req.user._id, refreshToken);
  }

  res.cookie('jwt_refresh', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

exports.logoutAll = catchAsync(async (req, res, next) => {
  await authService.logoutAll(req.user._id);
  res.cookie('jwt_refresh', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  });
  res.status(200).json({ success: true, message: 'Logged out from all devices' });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
});

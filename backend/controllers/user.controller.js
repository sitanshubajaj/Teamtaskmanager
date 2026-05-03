const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('username email role');
  res.status(200).json({ success: true, data: { users } });
});

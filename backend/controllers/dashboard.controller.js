const catchAsync = require('../utils/catchAsync');
const dashboardService = require('../services/dashboard.service');

exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await dashboardService.getDashboardStats(req.user._id, req.user.role);
  res.status(200).json({ success: true, data: stats });
});

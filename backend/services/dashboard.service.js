const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboardStats = async (userId, role) => {
  let projectMatch = {};
  let taskMatch = {};

  if (role !== 'Admin') {
    // Member stats: only projects they are in, and tasks assigned to them
    const memberProjects = await Project.find({ members: userId }).select('_id');
    const projectIds = memberProjects.map(p => p._id);
    
    projectMatch = { _id: { $in: projectIds } };
    taskMatch = { assignedTo: userId };
  }

  // 1. Task Status Counts
  const statusStats = await Task.aggregate([
    { $match: taskMatch },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // 2. Priority Distribution
  const priorityStats = await Task.aggregate([
    { $match: taskMatch },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  // 3. Overdue tasks count
  const overdueTasks = await Task.countDocuments({
    ...taskMatch,
    deadline: { $lt: new Date() },
    status: { $ne: 'Completed' }
  });

  // 4. Last 7 Days Trend (Created vs Completed)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendStats = await Task.aggregate([
    { $match: { ...taskMatch, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        created: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    statusStats,
    priorityStats,
    overdueTasks,
    trendStats
  };
};

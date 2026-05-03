require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const ActivityLog = require('./models/ActivityLog');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing data...');

    // Clear all existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Creating Users...');
    // Create Users (password is automatically hashed by pre-save hook)
    const admin = await User.create({
      username: 'Alice (Admin)',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'Admin'
    });

    const member1 = await User.create({
      username: 'Bob',
      email: 'bob@demo.com',
      password: 'password123',
      role: 'Member'
    });

    const member2 = await User.create({
      username: 'Charlie',
      email: 'charlie@demo.com',
      password: 'password123',
      role: 'Member'
    });

    console.log('Creating Projects...');
    // Create Projects
    const project1 = await Project.create({
      title: 'Website Redesign',
      description: 'Revamping the corporate website with a modern look.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdBy: admin._id,
      members: [member1._id, member2._id]
    });

    const project2 = await Project.create({
      title: 'Mobile App Launch',
      description: 'Getting the iOS and Android apps ready for the App Store.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: admin._id,
      members: [member1._id]
    });

    console.log('Creating Tasks and Activities...');
    // Helper to generate a random date within the last N days
    const getRandomDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
      return date;
    };

    const tasksData = [
      // Project 1 Tasks
      { title: 'Design Homepage Mockups', status: 'Completed', priority: 'High', project: project1, assignedTo: member1, daysAgo: 6 },
      { title: 'Write Copy for About Us', status: 'Completed', priority: 'Medium', project: project1, assignedTo: member2, daysAgo: 5 },
      { title: 'Setup React Router', status: 'Completed', priority: 'High', project: project1, assignedTo: member1, daysAgo: 4 },
      { title: 'Implement Auth Flow', status: 'In Progress', priority: 'High', project: project1, assignedTo: member1, daysAgo: 2 },
      { title: 'Create Footer Component', status: 'In Progress', priority: 'Low', project: project1, assignedTo: member2, daysAgo: 1 },
      { title: 'Optimize Images', status: 'To Do', priority: 'Low', project: project1, assignedTo: member2, daysAgo: 0 },
      { title: 'Setup CI/CD Pipeline', status: 'To Do', priority: 'High', project: project1, assignedTo: admin, daysAgo: 0 },
      
      // Project 2 Tasks
      { title: 'Define App Architecture', status: 'Completed', priority: 'High', project: project2, assignedTo: admin, daysAgo: 7 },
      { title: 'Design Login Screen', status: 'Completed', priority: 'Medium', project: project2, assignedTo: member1, daysAgo: 5 },
      { title: 'Integrate Payment Gateway', status: 'In Progress', priority: 'High', project: project2, assignedTo: member1, daysAgo: 3 },
      { title: 'Push Notifications Setup', status: 'To Do', priority: 'Medium', project: project2, assignedTo: member1, daysAgo: 0 },
      { title: 'App Store Submission', status: 'To Do', priority: 'Low', project: project2, assignedTo: admin, daysAgo: 0 },
      
      // Some overdue tasks
      { 
        title: 'Draft Privacy Policy', 
        status: 'In Progress', 
        priority: 'Medium', 
        project: project2, 
        assignedTo: member1, 
        daysAgo: 6,
        deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days overdue
      },
      { 
        title: 'Fix Navigation Bug', 
        status: 'To Do', 
        priority: 'High', 
        project: project1, 
        assignedTo: member2, 
        daysAgo: 4,
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day overdue
      }
    ];

    for (const data of tasksData) {
      const createdAt = getRandomDate(data.daysAgo);
      
      const task = await Task.create({
        title: data.title,
        description: `This is a demo task for ${data.title}.`,
        project: data.project._id,
        assignedTo: data.assignedTo._id,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
        createdBy: admin._id,
        createdAt: createdAt, // Override for trend chart realism
        updatedAt: createdAt
      });

      // Add a matching activity log
      await ActivityLog.create({
        actionType: 'TASK_CREATED',
        performedBy: admin._id,
        targetTask: task._id,
        targetProject: data.project._id,
        metadata: { title: task.title },
        createdAt: createdAt
      });
      
      if (data.status === 'Completed') {
        // Add a completion activity log slightly after creation
        await ActivityLog.create({
          actionType: 'TASK_UPDATED',
          performedBy: data.assignedTo._id,
          targetTask: task._id,
          targetProject: data.project._id,
          metadata: { updatedFields: ['status'] },
          createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
        });
      }
    }

    console.log('✅ Demo data seeded successfully!');
    console.log('------------------------------------------------');
    console.log('You can now log in with the following accounts:');
    console.log('Admin:  admin@demo.com  / password123');
    console.log('Member: bob@demo.com    / password123');
    console.log('------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

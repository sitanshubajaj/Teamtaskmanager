const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/AppError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

// 1. GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://team-task-manager-6200.up.railway.app'
  ].filter(Boolean),
  credentials: true // Allow cookies to be sent
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss());

const authRouter = require('./routes/auth.routes');
const projectRouter = require('./routes/project.routes');
const taskRouter = require('./routes/task.routes');
const dashboardRouter = require('./routes/dashboard.routes');
// 2. ROUTES
app.use('/api/v1/auth', authRouter);
const userRouter = require('./routes/user.routes');
app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error handler will catch everything else
// 3. ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

module.exports = app;

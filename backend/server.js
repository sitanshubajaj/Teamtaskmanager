require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// ✅ START SERVER FIRST
const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// ✅ THEN CONNECT DATABASE (non-blocking)
connectDB()
  .then(() => logger.info("MongoDB Connected"))
  .catch(err => logger.error("MongoDB Connection Failed:", err.message));


// --- error handlers ---
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});
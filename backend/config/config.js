require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  database: {
    path: process.env.DB_PATH || './database/app.db',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

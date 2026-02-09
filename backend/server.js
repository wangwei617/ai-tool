const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// 导入路由
const prototypeRoutes = require('./routes/prototype');
const dataRoutes = require('./routes/data');
const codeRoutes = require('./routes/code');
const designRoutes = require('./routes/design');

// 创建Express应用
const app = express();

// 中间件
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（用于上传的文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api/prototype', prototypeRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/design', designRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// 获取项目列表
app.get('/api/projects', async (req, res) => {
  try {
    const { dbService } = require('./models/database');
    const { type, limit } = req.query;
    const projects = await dbService.getProjects(type || null, parseInt(limit) || 50);
    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取项目列表失败',
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: err.message || '服务器内部错误',
  });
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n🚀 服务器已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${config.nodeEnv}`);
  console.log(`\nAPI端点:`);
  console.log(`  POST /api/prototype/generate - 生成原型`);
  console.log(`  POST /api/data/analyze - 分析数据`);
  console.log(`  POST /api/code/review - 审查代码`);
  console.log(`  POST /api/design/generate - 生成设计`);
  console.log(`  GET  /api/projects - 获取项目列表`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  process.exit(0);
});

module.exports = app;

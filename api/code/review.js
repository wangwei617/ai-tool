/**
 * 审查代码 - Vercel Serverless Function
 */
const aiService = require('../_utils/aiService');
const storage = require('../_utils/storage');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { code, title } = req.body;

    if (!code || code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '代码内容太短',
      });
    }

    // 创建项目记录
    const project = await storage.createProject(
      'code',
      title || '代码审查',
      { code }
    );

    // 异步审查代码
    aiService.reviewCode(code)
      .then(result => {
        if (result.success) {
          storage.updateProject(project.id, {
            review: result.review,
            code,
          }, 'completed');
        } else {
          storage.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('代码审查错误:', error);
        storage.updateProject(project.id, {
          error: error.message,
        }, 'failed');
      });

    res.json({
      success: true,
      projectId: project.id,
      message: '代码审查任务已提交',
    });
  } catch (error) {
    console.error('代码审查失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '代码审查失败',
    });
  }
};

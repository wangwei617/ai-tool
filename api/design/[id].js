/**
 * 获取设计稿详情 - Vercel Serverless Function
 */
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { id } = req.query;
    const project = await storage.getProject(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在',
      });
    }

    if (project.type !== 'design') {
      return res.status(400).json({
        success: false,
        message: '项目类型不匹配',
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('获取设计稿失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取设计稿失败',
    });
  }
};

/**
 * 生成设计稿 - Vercel Serverless Function
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
    const { requirement, title, brandSettings } = req.body;

    if (!requirement || requirement.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '设计需求描述太短',
      });
    }

    // 创建项目记录
    const project = await storage.createProject(
      'design',
      title || '新设计',
      {
        requirement,
        brandSettings: brandSettings || {},
      }
    );

    // 异步生成设计
    aiService.generateDesign(requirement, brandSettings || {})
      .then(result => {
        if (result.success) {
          storage.updateProject(project.id, {
            designs: result.designs,
            requirement,
            brandSettings: brandSettings || {},
          }, 'completed');
        } else {
          storage.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('设计生成错误:', error);
        storage.updateProject(project.id, {
          error: error.message,
        }, 'failed');
      });

    res.json({
      success: true,
      projectId: project.id,
      message: '设计生成任务已提交',
    });
  } catch (error) {
    console.error('生成设计失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成设计失败',
    });
  }
};

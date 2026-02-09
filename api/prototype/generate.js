/**
 * 生成原型 - Vercel Serverless Function
 * 同步模式：等待AI完成后直接返回结果
 */
const aiService = require('../_utils/aiService');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '方法不允许' });
  }

  try {
    const { requirement, title } = req.body;

    if (!requirement || requirement.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '需求描述太短，请提供更详细的信息（至少10个字符）',
      });
    }

    // 同步等待AI生成结果
    const result = await aiService.generatePrototype(requirement);

    if (result.success) {
      res.json({
        success: true,
        html: result.html,
        requirement,
        title: title || '新原型',
        message: '原型生成成功',
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || '原型生成失败',
      });
    }
  } catch (error) {
    console.error('生成原型失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成原型失败',
    });
  }
};

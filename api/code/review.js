/**
 * 审查代码 - Vercel Serverless Function
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
    const { code, title } = req.body;

    if (!code || code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '代码内容太短',
      });
    }

    // 同步等待AI审查结果
    const result = await aiService.reviewCode(code);

    if (result.success) {
      res.json({
        success: true,
        review: result.review,
        code,
        title: title || '代码审查',
        message: '代码审查完成',
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || '代码审查失败',
      });
    }
  } catch (error) {
    console.error('代码审查失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '代码审查失败',
    });
  }
};

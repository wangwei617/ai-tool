/**
 * 分析Excel数据 - Vercel Serverless Function
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
    let files = [];
    let title = '数据分析';

    // 处理JSON格式（文件以Base64编码）
    if (req.body && req.body.files) {
      files = Array.isArray(req.body.files) ? req.body.files : [req.body.files];
      files = files.map(file => {
        const buffer = file.data
          ? Buffer.from(file.data, 'base64')
          : (file.buffer ? Buffer.from(file.buffer, 'base64') : null);
        return {
          ...file,
          buffer: buffer,
          originalname: file.originalname || file.name || 'file.xlsx',
        };
      });
    }
    if (req.body && req.body.title) {
      title = req.body.title;
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请上传Excel文件',
      });
    }

    // 同步等待AI分析结果
    const firstFile = files[0];
    const fileBuffer = firstFile.buffer || Buffer.from(firstFile.data || '', 'base64');
    const result = await aiService.analyzeData(fileBuffer, firstFile.originalname || firstFile.name || 'file.xlsx');

    if (result.success) {
      res.json({
        success: true,
        analysis: result.analysis,
        data: result.data,
        fileCount: files.length,
        title,
        message: '数据分析完成',
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || '数据分析失败',
      });
    }
  } catch (error) {
    console.error('数据分析失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '数据分析失败',
    });
  }
};

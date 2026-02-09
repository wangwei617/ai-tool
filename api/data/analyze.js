/**
 * 分析Excel数据 - Vercel Serverless Function
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
    // 处理multipart/form-data
    // 在Vercel环境中，文件数据在req.body中（Base64编码）或通过formidable解析
    let files = [];
    let title = '数据分析';

    // 处理JSON格式（文件以Base64编码）
    if (req.body && req.body.files) {
      files = Array.isArray(req.body.files) ? req.body.files : [req.body.files];
      // Base64解码
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

    // 创建项目记录
    const project = await storage.createProject(
      'data',
      title,
      {
        fileCount: files.length,
        filenames: files.map(f => f.originalname || f.name || 'file.xlsx'),
      }
    );

    // 异步分析数据（分析第一个文件）
    const firstFile = files[0];
    const fileBuffer = firstFile.buffer || Buffer.from(firstFile.data || '', 'base64');
    
    aiService.analyzeData(fileBuffer, firstFile.originalname || firstFile.name || 'file.xlsx')
      .then(result => {
        if (result.success) {
          storage.updateProject(project.id, {
            analysis: result.analysis,
            data: result.data,
            fileCount: files.length,
          }, 'completed');
        } else {
          storage.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('数据分析错误:', error);
        storage.updateProject(project.id, {
          error: error.message,
        }, 'failed');
      });

    res.json({
      success: true,
      projectId: project.id,
      message: '数据分析任务已提交',
    });
  } catch (error) {
    console.error('数据分析失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '数据分析失败',
    });
  }
};

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const aiService = require('../services/aiService');
const { dbService } = require('../models/database');
const config = require('../config/config');

// 确保上传目录存在
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持Excel文件格式 (.xlsx, .xls)'));
    }
  },
});

/**
 * 分析Excel数据
 */
router.post('/analyze', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请上传Excel文件',
      });
    }

    // 创建项目记录
    const project = await dbService.createProject(
      'data',
      req.body.title || '数据分析',
      {
        fileCount: req.files.length,
        filenames: req.files.map(f => f.originalname),
      }
    );

    // 保存文件记录
    for (const file of req.files) {
      await dbService.saveFile(
        project.id,
        file.originalname,
        file.path,
        'excel',
        file.size
      );
    }

    // 异步分析数据（分析第一个文件）
    const firstFile = req.files[0];
    aiService.analyzeData(firstFile.path)
      .then(result => {
        if (result.success) {
          dbService.updateProject(project.id, {
            analysis: result.analysis,
            data: result.data,
            fileCount: req.files.length,
          }, 'completed');
        } else {
          dbService.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('数据分析错误:', error);
        dbService.updateProject(project.id, {
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
});

/**
 * 获取分析结果
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await dbService.getProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在',
      });
    }

    if (project.type !== 'data') {
      return res.status(400).json({
        success: false,
        message: '项目类型不匹配',
      });
    }

    const files = await dbService.getProjectFiles(project.id);

    res.json({
      success: true,
      project: {
        ...project,
        files,
      },
    });
  } catch (error) {
    console.error('获取分析结果失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取分析结果失败',
    });
  }
});

module.exports = router;

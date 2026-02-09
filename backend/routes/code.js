const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { dbService } = require('../models/database');

/**
 * 审查代码
 */
router.post('/review', async (req, res) => {
  try {
    const { code, title } = req.body;

    if (!code || code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '代码内容太短',
      });
    }

    // 创建项目记录
    const project = await dbService.createProject(
      'code',
      title || '代码审查',
      { code }
    );

    // 异步审查代码
    aiService.reviewCode(code)
      .then(result => {
        if (result.success) {
          dbService.updateProject(project.id, {
            review: result.review,
            code,
          }, 'completed');
        } else {
          dbService.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('代码审查错误:', error);
        dbService.updateProject(project.id, {
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
});

/**
 * 获取审查结果
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

    if (project.type !== 'code') {
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
    console.error('获取审查结果失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取审查结果失败',
    });
  }
});

module.exports = router;

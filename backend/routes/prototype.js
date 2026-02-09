const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { dbService } = require('../models/database');

/**
 * 生成原型
 */
router.post('/generate', async (req, res) => {
  try {
    const { requirement, title } = req.body;

    if (!requirement || requirement.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '需求描述太短，请提供更详细的信息（至少10个字符）',
      });
    }

    // 创建项目记录
    const project = await dbService.createProject(
      'prototype',
      title || '新原型',
      { requirement }
    );

    // 异步生成原型
    aiService.generatePrototype(requirement)
      .then(result => {
        if (result.success) {
          dbService.updateProject(project.id, {
            html: result.html,
            requirement,
          }, 'completed');
        } else {
          dbService.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('原型生成错误:', error);
        dbService.updateProject(project.id, {
          error: error.message,
        }, 'failed');
      });

    res.json({
      success: true,
      projectId: project.id,
      message: '原型生成任务已提交',
    });
  } catch (error) {
    console.error('生成原型失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成原型失败',
    });
  }
});

/**
 * 获取原型详情
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

    if (project.type !== 'prototype') {
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
    console.error('获取原型失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取原型失败',
    });
  }
});

module.exports = router;

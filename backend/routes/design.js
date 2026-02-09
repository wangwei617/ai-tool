const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { dbService } = require('../models/database');

/**
 * 生成设计稿
 */
router.post('/generate', async (req, res) => {
  try {
    const { requirement, title, brandSettings } = req.body;

    if (!requirement || requirement.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: '设计需求描述太短',
      });
    }

    // 创建项目记录
    const project = await dbService.createProject(
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
          dbService.updateProject(project.id, {
            designs: result.designs,
            requirement,
            brandSettings: brandSettings || {},
          }, 'completed');
        } else {
          dbService.updateProject(project.id, {
            error: result.message,
          }, 'failed');
        }
      })
      .catch(error => {
        console.error('设计生成错误:', error);
        dbService.updateProject(project.id, {
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
});

/**
 * 获取设计稿详情
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
});

module.exports = router;

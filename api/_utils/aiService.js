/**
 * AI服务 - OpenRouter API集成
 * 支持多个AI模型，包括Claude、GPT等
 */

// OpenRouter API配置
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 默认使用Claude 3.5 Sonnet
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

/**
 * AI服务封装
 */
class AIService {
  /**
   * 调用OpenRouter API
   */
  async callOpenRouter(model, messages, maxTokens = 4000) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'https://your-app.vercel.app',
          'X-Title': 'AI增强产设研工作平台',
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          messages: messages,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter API调用失败:', error);
      throw error;
    }
  }

  /**
   * 生成原型
   */
  async generatePrototype(requirement) {
    const prompt = `你是一个专业的前端开发工程师。根据以下产品需求，生成一个完整的、可交互的HTML原型。

需求描述：
${requirement}

要求：
1. 生成完整的HTML代码，包括HTML、CSS和JavaScript
2. 代码要可以直接在浏览器中运行
3. 界面要现代化、美观
4. 包含基本的交互功能（点击、输入等）
5. 响应式设计，支持移动端
6. 使用现代CSS特性（Grid、Flexbox等）

请直接返回HTML代码，不要包含其他说明文字。`;

    try {
      const htmlCode = await this.callOpenRouter(
        DEFAULT_MODEL,
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        8000
      );

      return {
        success: true,
        html: htmlCode,
        message: '原型生成成功',
      };
    } catch (error) {
      console.error('原型生成失败:', error);
      return {
        success: false,
        html: '',
        message: error.message || '原型生成失败',
      };
    }
  }

  /**
   * 分析Excel数据
   */
  async analyzeData(fileBuffer, filename) {
    try {
      const XLSX = require('xlsx');
      
      // 读取Excel文件
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      
      // 提取所有工作表数据
      const data = {};
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        data[sheetName] = jsonData.slice(0, 100); // 限制每个表最多100行
      });

      // 构建分析提示
      const dataSummary = JSON.stringify(data, null, 2);
      const prompt = `你是一个专业的数据分析师。请分析以下Excel数据，并提供：

1. 数据概览（数据量、字段、数据类型）
2. 关键洞察（发现的数据模式、异常、趋势）
3. 数据质量评估（缺失值、异常值等）
4. 业务建议（基于数据的业务建议）

Excel数据：
${dataSummary}

请以JSON格式返回分析结果，格式如下：
{
  "summary": {
    "totalSheets": 数量,
    "totalRows": 总行数,
    "columns": ["字段列表"]
  },
  "insights": [
    {
      "type": "异常/趋势/模式",
      "description": "描述",
      "severity": "high/medium/low"
    }
  ],
  "quality": {
    "missingValues": 缺失值数量,
    "anomalies": 异常值数量
  },
  "recommendations": [
    "建议1",
    "建议2"
  ]
}`;

      const analysisText = await this.callOpenRouter(
        DEFAULT_MODEL,
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        4000
      );
      let analysisResult;
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          analysisResult = { raw: analysisText };
        }
      } catch (e) {
        analysisResult = { raw: analysisText };
      }

      return {
        success: true,
        data: data,
        analysis: analysisResult,
        message: '数据分析完成',
      };
    } catch (error) {
      console.error('数据分析失败:', error);
      return {
        success: false,
        data: null,
        analysis: null,
        message: error.message || '数据分析失败',
      };
    }
  }

  /**
   * 代码审查
   */
  async reviewCode(code) {
    const prompt = `你是一个专业的代码审查专家。请审查以下代码，检查：

1. 架构问题（代码结构、设计模式）
2. 安全问题（SQL注入、XSS、安全漏洞）
3. 性能问题（算法效率、资源使用）
4. 代码质量（可读性、可维护性、最佳实践）
5. 业务逻辑（逻辑错误、边界情况）

代码：
\`\`\`
${code}
\`\`\`

请以JSON格式返回审查结果，格式如下：
{
  "summary": {
    "totalIssues": 总问题数,
    "critical": 严重问题数,
    "warning": 警告数,
    "info": 建议数
  },
  "issues": [
    {
      "type": "architecture/security/performance/quality/logic",
      "severity": "critical/warning/info",
      "title": "问题标题",
      "description": "问题描述",
      "line": 行号（如果有）,
      "suggestion": "修复建议"
    }
  ]
}`;

    try {
      const reviewText = await this.callOpenRouter(
        DEFAULT_MODEL,
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        4000
      );
      let reviewResult;
      try {
        const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reviewResult = JSON.parse(jsonMatch[0]);
        } else {
          reviewResult = { raw: reviewText };
        }
      } catch (e) {
        reviewResult = { raw: reviewText };
      }

      return {
        success: true,
        review: reviewResult,
        message: '代码审查完成',
      };
    } catch (error) {
      console.error('代码审查失败:', error);
      return {
        success: false,
        review: null,
        message: error.message || '代码审查失败',
      };
    }
  }

  /**
   * 生成设计稿
   */
  async generateDesign(requirement, brandSettings = {}) {
    const prompt = `你是一个专业的UI/UX设计师。根据以下设计需求，生成设计稿的HTML/CSS代码。

设计需求：
${requirement}

品牌设置：
${JSON.stringify(brandSettings, null, 2)}

要求：
1. 生成完整的HTML/CSS代码
2. 符合品牌规范（颜色、字体、间距等）
3. 现代化、美观的设计
4. 响应式设计
5. 可以生成多个设计方案（至少3个）

请以JSON格式返回，格式如下：
{
  "designs": [
    {
      "id": 1,
      "title": "方案名称",
      "description": "方案描述",
      "html": "完整的HTML代码",
      "compliant": true
    }
  ]
}`;

    try {
      const designText = await this.callOpenRouter(
        DEFAULT_MODEL,
        [
          {
            role: 'user',
            content: prompt,
          },
        ],
        12000
      );
      let designResult;
      try {
        const jsonMatch = designText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          designResult = JSON.parse(jsonMatch[0]);
        } else {
          designResult = {
            designs: [{
              id: 1,
              title: '设计方案',
              description: requirement,
              html: designText,
              compliant: true,
            }],
          };
        }
      } catch (e) {
        designResult = {
          designs: [{
            id: 1,
            title: '设计方案',
            description: requirement,
            html: designText,
            compliant: true,
          }],
        };
      }

      return {
        success: true,
        designs: designResult.designs || [],
        message: '设计稿生成完成',
      };
    } catch (error) {
      console.error('设计生成失败:', error);
      return {
        success: false,
        designs: [],
        message: error.message || '设计生成失败',
      };
    }
  }
}

module.exports = new AIService();

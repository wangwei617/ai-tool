/**
 * AI服务 - OpenRouter API集成
 * 支持多个AI模型，包括Claude、GPT等
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 默认使用Claude 3.5 Sonnet
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

/**
 * AI服务封装
 */
class AIService {
  /**
   * 获取API Key（运行时读取，确保获取最新值）
   */
  getApiKey() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('未配置 OPENROUTER_API_KEY 环境变量。请在 Vercel Dashboard → Settings → Environment Variables 中配置。');
    }
    return apiKey.trim();
  }

  /**
   * 调用OpenRouter API
   */
  async callOpenRouter(messages, maxTokens = 4000) {
    const apiKey = this.getApiKey();

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://ai-tool-zeta.vercel.app',
        'X-Title': 'AI Work Platform',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `OpenRouter API error: ${response.status}`;
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMsg,
        apiKeyConfigured: !!apiKey,
      });
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI返回了空结果');
    }

    return content;
  }

  /**
   * 从AI返回的文本中提取HTML（去除markdown代码块）
   */
  extractHtml(text) {
    if (!text) return '';
    let html = text.trim();
    // 匹配 ```html\n...\n``` 或 ```\n...\n```
    const codeBlockMatch = html.match(/```(?:html)?\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // 如果没有代码块包裹但是以<!DOCTYPE或<html开头，直接返回
    if (html.startsWith('<!DOCTYPE') || html.startsWith('<html') || html.startsWith('<div')) {
      return html;
    }
    return html;
  }

  /**
   * 从AI返回的文本中提取JSON
   */
  extractJson(text) {
    if (!text) return null;
    try {
      // 先尝试直接解析
      return JSON.parse(text.trim());
    } catch (e) {
      // 尝试从markdown代码块中提取
      const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        try {
          return JSON.parse(codeBlockMatch[1].trim());
        } catch (e2) {
          // 继续尝试
        }
      }
      // 尝试匹配第一个完整的JSON对象
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e3) {
          // 最终失败
        }
      }
      return null;
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
1. 生成完整的HTML代码，包含内联CSS和JavaScript
2. 必须是一个完整的HTML文件（以<!DOCTYPE html>开头）
3. 界面要现代化、美观，使用渐变色和圆角设计
4. 包含基本的交互功能
5. 响应式设计
6. 中文界面

请只返回HTML代码，不要返回任何解释文字。`;

    try {
      const text = await this.callOpenRouter(
        [{ role: 'user', content: prompt }],
        8000
      );

      const html = this.extractHtml(text);

      return {
        success: true,
        html: html,
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

      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;

      const data = {};
      let totalRows = 0;
      sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        data[sheetName] = jsonData.slice(0, 50); // 限制每表50行减少token消耗
        totalRows += jsonData.length;
      });

      const dataSummary = JSON.stringify(data, null, 2);
      const prompt = `你是一个专业的数据分析师。请分析以下Excel数据，提供深入的分析报告。

文件名：${filename}
工作表数量：${sheetNames.length}
总数据行数：${totalRows}

数据内容（部分）：
${dataSummary.substring(0, 6000)}

请以严格的JSON格式返回分析结果（不要添加任何额外文字），格式如下：
{
  "summary": {
    "totalSheets": ${sheetNames.length},
    "totalRows": ${totalRows},
    "columns": ["字段名列表"]
  },
  "insights": [
    {
      "type": "趋势/异常/模式",
      "description": "具体描述",
      "severity": "high/medium/low"
    }
  ],
  "quality": {
    "missingValues": 0,
    "anomalies": 0
  },
  "recommendations": [
    "建议1",
    "建议2",
    "建议3"
  ]
}`;

      const text = await this.callOpenRouter(
        [{ role: 'user', content: prompt }],
        4000
      );

      const analysisResult = this.extractJson(text) || { raw: text };

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
   * 代码审查（三维走查版）
   */
  async reviewCode(code) {
    const prompt = `你是一个全栈技术专家和产品体验专家。请对以下代码进行全方位的"三维走查"：

1. 代码技术走查：检查语法错误、安全性、性能问题、最佳实践。
2. 功能逻辑走查：检查业务逻辑是否完整、是否存在逻辑漏洞、流程是否通畅。
3. 体验/UX走查：检查交互是否友好、视觉是否规范、文案是否清晰、是否存在体验断点。

代码：
\`\`\`
${code}
\`\`\`

请以严格的JSON格式返回审查结果（不要添加任何额外文字），格式如下：
{
  "codeIssues": [
    {
      "title": "问题标题",
      "description": "详细描述",
      "severity": "critical/warning/info",
      "suggestion": "技术修复建议"
    }
  ],
  "logicIssues": [
    {
      "title": "逻辑问题标题",
      "description": "描述功能缺陷或逻辑漏洞",
      "severity": "critical/warning",
      "suggestion": "业务修复建议"
    }
  ],
  "uxIssues": [
    {
      "title": "体验问题标题",
      "description": "描述体验不好的地方",
      "severity": "warning/info",
      "suggestion": "设计优化建议"
    }
  ]
}`;

    try {
      const text = await this.callOpenRouter(
        [{ role: 'user', content: prompt }],
        4000
      );

      const reviewResult = this.extractJson(text) || { raw: text };

      return {
        success: true,
        review: reviewResult,
        message: '三维走查完成',
      };
    } catch (error) {
      console.error('走查失败:', error);
      return {
        success: false,
        review: null,
        message: error.message || '走查失败',
      };
    }
  }

  /**
   * 生成设计稿
   */
  async generateDesign(requirement, brandSettings = {}) {
    const prompt = `你是一个专业的UI/UX设计师。根据以下设计需求，生成设计稿的完整HTML/CSS代码。

设计需求：
${requirement}

${Object.keys(brandSettings).length > 0 ? `品牌设置：${JSON.stringify(brandSettings)}` : ''}

请以严格的JSON格式返回（不要添加任何额外文字），格式如下：
{
  "designs": [
    {
      "id": 1,
      "title": "方案名称",
      "description": "方案描述",
      "html": "完整的HTML代码（包含内联CSS，以<!DOCTYPE html>开头）",
      "compliant": true
    },
    {
      "id": 2,
      "title": "方案名称",
      "description": "方案描述",
      "html": "完整的HTML代码",
      "compliant": true
    }
  ]
}

请至少生成2个不同风格的设计方案。每个方案的html字段必须是完整可运行的HTML。`;

    try {
      const text = await this.callOpenRouter(
        [{ role: 'user', content: prompt }],
        12000
      );

      let designResult = this.extractJson(text);

      // 如果JSON解析失败，把整个文本当作单个设计
      if (!designResult || !designResult.designs) {
        const html = this.extractHtml(text);
        designResult = {
          designs: [{
            id: 1,
            title: '设计方案',
            description: requirement,
            html: html || text,
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

/**
 * API调用封装
 * 同步模式 - 直接等待AI完成后返回结果
 */
const API_BASE_URL = '/api';

class API {
  /**
   * 通用请求方法
   */
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `请求失败 (${response.status})`);
      }
      
      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  /**
   * 生成原型（同步等待结果）
   */
  static async generatePrototype(requirement, title) {
    return this.request('/prototype/generate', {
      method: 'POST',
      body: JSON.stringify({ requirement, title }),
    });
  }

  /**
   * 分析数据（同步等待结果）
   */
  static async analyzeData(filesData, title) {
    return this.request('/data/analyze', {
      method: 'POST',
      body: JSON.stringify({
        files: filesData,
        title: title || '数据分析',
      }),
    });
  }

  /**
   * 审查代码（同步等待结果）
   */
  static async reviewCode(code, title) {
    return this.request('/code/review', {
      method: 'POST',
      body: JSON.stringify({ code, title }),
    });
  }

  /**
   * 生成设计（同步等待结果）
   */
  static async generateDesign(requirement, title, brandSettings) {
    return this.request('/design/generate', {
      method: 'POST',
      body: JSON.stringify({ requirement, title, brandSettings }),
    });
  }

  /**
   * 健康检查
   */
  static async healthCheck() {
    return this.request('/health');
  }
}

// 导出到全局
window.API = API;

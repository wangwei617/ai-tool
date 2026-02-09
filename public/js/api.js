/**
 * API调用封装
 * 适配Vercel部署 - 使用相对路径
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
        throw new Error(data.message || '请求失败');
      }
      
      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  /**
   * 生成原型
   */
  static async generatePrototype(requirement, title) {
    return this.request('/prototype/generate', {
      method: 'POST',
      body: JSON.stringify({ requirement, title }),
    });
  }

  /**
   * 获取原型详情
   */
  static async getPrototype(id) {
    return this.request(`/prototype/${id}`);
  }

  /**
   * 分析数据
   * 注意：在Vercel Serverless环境中，文件需要转换为Base64
   */
  static async analyzeData(files, title) {
    // 将文件转换为Base64格式
    const filesWithData = await Promise.all(files.map(async (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            originalname: file.name,
            data: e.target.result.split(',')[1], // 移除data:xxx;base64,前缀
            size: file.size,
            mimetype: file.type,
          });
        };
        reader.readAsDataURL(file);
      });
    }));

    return this.request('/data/analyze', {
      method: 'POST',
      body: JSON.stringify({
        files: filesWithData,
        title: title || '数据分析',
      }),
    });
  }

  /**
   * 获取分析结果
   */
  static async getDataAnalysis(id) {
    return this.request(`/data/${id}`);
  }

  /**
   * 审查代码
   */
  static async reviewCode(code, title) {
    return this.request('/code/review', {
      method: 'POST',
      body: JSON.stringify({ code, title }),
    });
  }

  /**
   * 获取审查结果
   */
  static async getCodeReview(id) {
    return this.request(`/code/${id}`);
  }

  /**
   * 生成设计
   */
  static async generateDesign(requirement, title, brandSettings) {
    return this.request('/design/generate', {
      method: 'POST',
      body: JSON.stringify({ requirement, title, brandSettings }),
    });
  }

  /**
   * 获取设计详情
   */
  static async getDesign(id) {
    return this.request(`/design/${id}`);
  }

  /**
   * 获取项目列表
   */
  static async getProjects(type = null, limit = 50) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit);
    
    return this.request(`/projects?${params.toString()}`);
  }

  /**
   * 轮询获取项目状态
   */
  static async pollProjectStatus(projectId, type, maxAttempts = 30, interval = 2000) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const poll = async () => {
        try {
          let project;
          switch (type) {
            case 'prototype':
              project = await this.getPrototype(projectId);
              break;
            case 'data':
              project = await this.getDataAnalysis(projectId);
              break;
            case 'code':
              project = await this.getCodeReview(projectId);
              break;
            case 'design':
              project = await this.getDesign(projectId);
              break;
            default:
              reject(new Error('未知的项目类型'));
              return;
          }

          if (project.success && project.project) {
            const status = project.project.status;
            
            if (status === 'completed') {
              resolve(project.project);
              return;
            }
            
            if (status === 'failed') {
              reject(new Error(project.project.output_data?.error || '处理失败'));
              return;
            }
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('请求超时，请稍后手动刷新'));
            return;
          }

          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

// 导出到全局
window.API = API;

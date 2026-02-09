/**
 * 存储服务 - 适配Vercel Serverless环境
 * 使用内存存储 + 可选的文件系统存储
 */

// 内存存储（Serverless环境）
const memoryStore = {
  projects: new Map(),
  files: new Map(),
};

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 项目存储服务
 */
class StorageService {
  /**
   * 创建项目
   */
  async createProject(type, title, inputData) {
    const id = generateId();
    const project = {
      id,
      type,
      title: title || '未命名项目',
      input_data: inputData,
      output_data: {},
      status: 'processing',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    memoryStore.projects.set(id, project);
    return project;
  }

  /**
   * 更新项目
   */
  async updateProject(id, outputData, status = 'completed') {
    const project = memoryStore.projects.get(id);
    if (!project) {
      throw new Error('项目不存在');
    }
    
    project.output_data = outputData;
    project.status = status;
    project.updated_at = new Date().toISOString();
    
    memoryStore.projects.set(id, project);
    return project;
  }

  /**
   * 获取项目
   */
  async getProject(id) {
    const project = memoryStore.projects.get(id);
    if (!project) {
      return null;
    }
    
    return {
      ...project,
      input_data: project.input_data || {},
      output_data: project.output_data || {},
    };
  }

  /**
   * 获取项目列表
   */
  async getProjects(type = null, limit = 50) {
    let projects = Array.from(memoryStore.projects.values());
    
    if (type) {
      projects = projects.filter(p => p.type === type);
    }
    
    // 按创建时间倒序
    projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return projects.slice(0, limit);
  }

  /**
   * 保存文件记录
   */
  async saveFile(projectId, filename, filepath, fileType, fileSize) {
    const id = generateId();
    const file = {
      id,
      project_id: projectId,
      filename,
      filepath,
      file_type: fileType,
      file_size: fileSize,
      created_at: new Date().toISOString(),
    };
    
    memoryStore.files.set(id, file);
    return file;
  }

  /**
   * 获取项目文件
   */
  async getProjectFiles(projectId) {
    const files = Array.from(memoryStore.files.values())
      .filter(f => f.project_id === projectId);
    return files;
  }
}

module.exports = new StorageService();

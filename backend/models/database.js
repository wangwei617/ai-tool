const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 确保数据库目录存在
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new sqlite3.Database(config.database.path, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
    initializeDatabase();
  }
});

// 初始化数据库表
function initializeDatabase() {
  // 创建项目表
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT,
      input_data TEXT,
      output_data TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建projects表失败:', err.message);
    } else {
      console.log('projects表已就绪');
    }
  });

  // 创建文件表
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `, (err) => {
    if (err) {
      console.error('创建files表失败:', err.message);
    } else {
      console.log('files表已就绪');
    }
  });
}

// 数据库操作封装
const dbService = {
  // 创建项目
  createProject: (type, title, inputData) => {
    return new Promise((resolve, reject) => {
      const inputDataStr = JSON.stringify(inputData);
      db.run(
        'INSERT INTO projects (type, title, input_data, status) VALUES (?, ?, ?, ?)',
        [type, title, inputDataStr, 'processing'],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, type, title, inputData });
          }
        }
      );
    });
  },

  // 更新项目输出
  updateProject: (id, outputData, status = 'completed') => {
    return new Promise((resolve, reject) => {
      const outputDataStr = JSON.stringify(outputData);
      db.run(
        'UPDATE projects SET output_data = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [outputDataStr, status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, outputData, status });
          }
        }
      );
    });
  },

  // 获取项目
  getProject: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            row.input_data = JSON.parse(row.input_data || '{}');
            row.output_data = JSON.parse(row.output_data || '{}');
          }
          resolve(row);
        }
      });
    });
  },

  // 获取项目列表
  getProjects: (type = null, limit = 50) => {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM projects';
      const params = [];
      
      if (type) {
        query += ' WHERE type = ?';
        params.push(type);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const projects = rows.map(row => ({
            ...row,
            input_data: JSON.parse(row.input_data || '{}'),
            output_data: JSON.parse(row.output_data || '{}'),
          }));
          resolve(projects);
        }
      });
    });
  },

  // 保存文件记录
  saveFile: (projectId, filename, filepath, fileType, fileSize) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO files (project_id, filename, filepath, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
        [projectId, filename, filepath, fileType, fileSize],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, projectId, filename, filepath });
          }
        }
      );
    });
  },

  // 获取项目文件
  getProjectFiles: (projectId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM files WHERE project_id = ?', [projectId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
};

module.exports = { db, dbService };

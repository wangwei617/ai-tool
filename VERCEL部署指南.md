# Vercel部署指南

> 将AI增强产设研工作平台部署到Vercel的完整指南

---

## 一、前置准备

### 1. 需要的账号
- **GitHub账号**：用于代码托管
- **Vercel账号**：用于部署（可以用GitHub账号登录）
- **Anthropic账号**：用于获取Claude API密钥

### 2. 获取API密钥
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录账号
3. 创建API密钥
4. 复制密钥备用

---

## 二、GitHub准备

### 1. 创建GitHub仓库

1. 登录GitHub
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `ai-work-platform`（或自定义）
   - Description: `AI增强产设研工作平台`
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 2. 上传代码到GitHub

```bash
# 在项目根目录执行
cd "/Users/modao/Documents/2026 Q1 project/AI使用方法/场景设计方案/完整应用"

# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: AI增强产设研工作平台"

# 添加远程仓库（替换YOUR_USERNAME和YOUR_REPO）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

---

## 三、Vercel部署

### 方法1：通过Vercel Dashboard（推荐）

1. **登录Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的GitHub仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Other
   - **Root Directory**: `./`（默认）
   - **Build Command**: 留空（不需要构建）
   - **Output Directory**: `public`（Vercel会自动识别）

4. **配置环境变量**
   - 在 "Environment Variables" 部分添加：
     ```
     ANTHROPIC_API_KEY = your_claude_api_key_here
     ```
   - 点击 "Add"
   - 确保所有环境（Production、Preview、Development）都已添加

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常1-2分钟）
   - 部署完成后会显示部署URL

### 方法2：通过Vercel CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 在项目根目录登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

---

## 四、环境变量配置

### 在Vercel Dashboard中配置

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `OPENROUTER_API_KEY` | `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` | Production, Preview, Development |
| `APP_URL` | `https://your-project.vercel.app`（可选） | Production, Preview, Development |

### 重要提示

- ✅ **不要**将 `.env` 文件提交到GitHub
- ✅ 确保 `.gitignore` 包含 `.env`
- ✅ 在Vercel Dashboard中配置环境变量

---

## 五、项目结构说明（Vercel适配）

```
项目根目录/
├── api/                    # Vercel Serverless Functions
│   ├── prototype/        # 原型生成API
│   ├── data/             # 数据分析API
│   ├── code/             # 代码审查API
│   ├── design/           # 设计生成API
│   ├── projects.js       # 项目列表API
│   ├── health.js         # 健康检查
│   └── _utils/           # 工具函数
│       ├── aiService.js  # AI服务
│       ├── storage.js    # 存储服务
│       └── parseForm.js  # 表单解析
│
├── public/                # 静态文件（前端）
│   ├── index.html        # 主页面
│   ├── css/              # 样式文件
│   └── js/               # JavaScript文件
│
├── vercel.json           # Vercel配置
├── package.json          # 依赖管理
└── README.md            # 项目说明
```

---

## 六、部署后验证

### 1. 检查部署状态

访问你的Vercel部署URL，应该能看到应用界面。

### 2. 测试API

访问 `https://your-domain.vercel.app/api/health`，应该返回：
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "production"
}
```

### 3. 测试功能

- ✅ 快速原型生成
- ✅ 数据分析（上传Excel）
- ✅ 代码审查
- ✅ 设计生成

---

## 七、常见问题

### Q1: 部署失败 - 找不到模块
**A:** 确保 `package.json` 中包含了所有依赖，运行 `npm install` 检查。

### Q2: API调用失败 - CORS错误
**A:** 检查API路由中的CORS头设置，确保允许你的域名。

### Q3: 环境变量未生效
**A:** 
- 检查Vercel Dashboard中的环境变量配置
- 确保变量名拼写正确
- 重新部署项目

### Q4: 文件上传失败
**A:** 
- Vercel Serverless Functions有文件大小限制（4.5MB）
- 大文件需要使用Vercel Blob或外部存储服务

### Q5: 数据库问题
**A:** 
- 当前使用内存存储（Serverless环境限制）
- 生产环境建议使用Vercel KV或Postgres

---

## 八、生产环境优化建议

### 1. 使用Vercel KV存储
- 替换内存存储为Vercel KV
- 支持持久化数据

### 2. 使用Vercel Blob存储
- 处理大文件上传
- 替代临时文件存储

### 3. 添加缓存
- 缓存AI结果
- 减少API调用成本

### 4. 监控和日志
- 使用Vercel Analytics
- 配置错误监控

---

## 九、更新部署

### 自动部署
- 推送到GitHub main分支会自动触发部署
- Vercel会自动检测并部署

### 手动部署
```bash
vercel --prod
```

---

## 十、自定义域名（可选）

1. 在Vercel Dashboard中进入项目设置
2. 点击 "Domains"
3. 添加你的域名
4. 按照提示配置DNS记录

---

*部署完成后，你的应用就可以通过Vercel提供的URL访问了！*

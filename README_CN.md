# AI增强产设研工作平台

> 🚀 统一产品平台：快速原型验证 + 数据分析 + 代码审查 + 设计生成  
> 📦 部署平台：Vercel + GitHub  
> 🤖 AI能力：Claude 3.5 Sonnet

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

---

## ✨ 核心功能

### 🎯 快速原型验证
- 自然语言输入产品需求
- AI生成可交互HTML原型
- 快速迭代和修改
- 支持预览和下载

### 📊 数据分析与洞察
- 上传Excel文件（支持多文件）
- AI自动分析数据并生成洞察
- 自动识别数据模式和异常
- 生成数据报告和建议

### 🔍 代码审查与质量保证
- 输入代码
- AI自动审查（架构、安全、性能、业务逻辑）
- 问题分类和优先级
- 生成修复建议

### 🎨 设计稿自动生成
- 输入设计需求
- AI生成多个设计方案
- 自动检查品牌规范一致性
- 支持全屏查看和导出

---

## 🚀 快速部署（5分钟）

### 步骤1：上传到GitHub

```bash
cd "/Users/modao/Documents/2026 Q1 project/AI使用方法/场景设计方案/完整应用"
git init
git add .
git commit -m "Initial commit: AI增强产设研工作平台"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 步骤2：部署到Vercel

1. 访问 [vercel.com](https://vercel.com)，使用GitHub登录
2. 点击 "Add New..." → "Project"
3. 选择你的GitHub仓库
4. 配置环境变量：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的Claude API密钥（从 [Anthropic Console](https://console.anthropic.com/) 获取）
5. 点击 "Deploy"

### 步骤3：完成！

部署完成后，访问Vercel提供的URL即可使用。

---

## 📁 项目结构

```
├── api/                    # Vercel Serverless Functions
│   ├── prototype/        # 原型生成API
│   ├── data/             # 数据分析API
│   ├── code/             # 代码审查API
│   ├── design/           # 设计生成API
│   ├── _utils/           # 工具函数（AI服务、存储）
│   ├── projects.js       # 项目列表API
│   └── health.js         # 健康检查API
│
├── public/                # 前端静态文件
│   ├── index.html        # 主页面
│   ├── css/              # 样式文件
│   └── js/               # JavaScript文件
│
├── vercel.json           # Vercel配置
├── package.json          # 依赖管理
└── README.md            # 项目说明
```

---

## 🔧 技术栈

- **后端**：Vercel Serverless Functions + Node.js
- **前端**：HTML/CSS/JavaScript（原生）
- **AI服务**：Claude 3.5 Sonnet API
- **存储**：内存存储（可升级为Vercel KV/Postgres）
- **部署**：Vercel + GitHub

---

## 📖 API文档

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/prototype/generate` | POST | 生成原型 |
| `/api/prototype/:id` | GET | 获取原型详情 |
| `/api/data/analyze` | POST | 分析Excel数据 |
| `/api/data/:id` | GET | 获取分析结果 |
| `/api/code/review` | POST | 审查代码 |
| `/api/code/:id` | GET | 获取审查结果 |
| `/api/design/generate` | POST | 生成设计稿 |
| `/api/design/:id` | GET | 获取设计稿详情 |
| `/api/projects` | GET | 获取项目列表 |
| `/api/health` | GET | 健康检查 |

---

## 🔐 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API密钥 | ✅ 是 |

获取API密钥：访问 [Anthropic Console](https://console.anthropic.com/)

---

## 📝 使用说明

### 快速原型验证
1. 切换到"快速原型"标签
2. 输入产品需求描述（至少10个字符）
3. 点击"生成原型"
4. 等待AI处理完成（通常1-2分钟）
5. 查看和下载原型

### 数据分析与洞察
1. 切换到"数据分析"标签
2. 上传Excel文件（.xlsx或.xls，建议<4MB）
3. 点击"开始分析"
4. 等待AI分析完成
5. 查看洞察报告

### 代码审查与质量保证
1. 切换到"代码审查"标签
2. 粘贴代码
3. 点击"开始审查"
4. 等待AI审查完成
5. 查看问题报告和改进建议

### 设计稿自动生成
1. 切换到"设计生成"标签
2. 输入设计需求
3. 点击"生成设计稿"
4. 等待AI生成完成
5. 查看多个设计方案，支持全屏查看和导出

---

## ⚠️ 注意事项

1. **API密钥安全**：不要将API密钥提交到Git
2. **文件大小限制**：Excel文件建议<4MB（Base64编码限制）
3. **存储限制**：当前使用内存存储，Serverless环境重启会丢失数据
4. **API调用成本**：注意Claude API的调用费用

---

## 🔮 后续优化建议

- [ ] 使用Vercel KV替代内存存储（持久化）
- [ ] 使用Vercel Blob处理大文件上传
- [ ] 添加用户认证和权限管理
- [ ] 添加缓存机制减少API调用
- [ ] 添加WebSocket实时推送进度
- [ ] 添加单元测试和集成测试

---

## 📚 文档

- [快速部署指南.md](./快速部署指南.md) - 5分钟快速部署
- [VERCEL部署指南.md](./VERCEL部署指南.md) - 详细部署步骤
- [功能结构检查清单.md](./功能结构检查清单.md) - 功能验证
- [最终检查清单.md](./最终检查清单.md) - 部署前检查

---

## 📄 许可证

MIT License

---

**🚀 开始使用：部署到Vercel，立即体验AI增强的产设研工作流程！**

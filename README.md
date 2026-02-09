# AI增强产设研工作平台

> 🚀 统一产品平台：快速原型验证 + 数据分析 + 代码审查 + 设计生成  
> 📦 部署平台：Vercel + GitHub  
> 🤖 AI能力：Claude 3.5 Sonnet

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

---

## 🎯 快速开始

### 5分钟快速部署

1. **上传到GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. **部署到Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 导入GitHub仓库
   - 配置环境变量 `ANTHROPIC_API_KEY`
   - 点击 Deploy

3. **完成！** 访问Vercel提供的URL即可使用

详细步骤请查看 [快速部署指南.md](./快速部署指南.md)

---

## ✨ 功能特性

### 🎯 快速原型验证
- 自然语言输入产品需求
- AI生成可交互HTML原型
- 快速迭代和修改

### 📊 数据分析与洞察
- 上传Excel文件（支持多文件）
- AI自动分析数据并生成洞察
- 自动生成图表和数据报告

### 🔍 代码审查与质量保证
- 输入代码
- AI自动审查（架构、安全、性能、业务逻辑）
- 生成问题报告和改进建议

### 🎨 设计稿自动生成
- 输入设计需求
- AI生成多个设计方案
- 自动检查品牌规范一致性

---

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# .env文件已包含OpenRouter API密钥，可直接使用
# 如需修改，编辑 .env 文件
```

4. **本地运行**
```bash
# 使用Vercel CLI
npm install -g vercel
vercel dev
```

访问 `http://localhost:3000`

### Vercel部署

#### 方法1：一键部署（推荐）

1. 点击上方 "Deploy with Vercel" 按钮
2. 连接GitHub仓库
3. 配置环境变量 `ANTHROPIC_API_KEY`
4. 点击 Deploy

#### 方法2：手动部署

详细步骤请查看 [VERCEL部署指南.md](./VERCEL部署指南.md)

---

## 📁 项目结构

```
├── api/                    # Vercel Serverless Functions
│   ├── prototype/        # 原型生成API
│   ├── data/             # 数据分析API
│   ├── code/             # 代码审查API
│   ├── design/           # 设计生成API
│   ├── projects.js       # 项目列表API
│   ├── health.js         # 健康检查
│   └── _utils/           # 工具函数
│       ├── aiService.js  # AI服务（Claude API）
│       ├── storage.js    # 存储服务
│       └── parseForm.js  # 表单解析
│
├── public/                # 前端静态文件
│   ├── index.html        # 主页面
│   ├── css/              # 样式文件
│   └── js/               # JavaScript文件
│       ├── api.js        # API调用封装
│       └── app.js        # 主应用逻辑
│
├── .github/              # GitHub Actions
│   └── workflows/        # CI/CD配置
│
├── vercel.json           # Vercel配置
├── package.json          # 依赖管理
├── .env.example          # 环境变量示例
└── README.md             # 项目说明
```

---

## 🔧 技术栈

### 后端
- **Vercel Serverless Functions** - 无服务器函数
- **Node.js** - 运行时环境
- **@anthropic-ai/sdk** - Claude API集成
- **XLSX** - Excel文件解析

### 前端
- **HTML5/CSS3** - 结构和样式
- **原生JavaScript** - 交互逻辑
- **Fetch API** - HTTP请求

### AI服务
- **Claude 3.5 Sonnet** - AI模型

### 部署
- **Vercel** - 部署平台
- **GitHub** - 代码托管

---

## 📖 API文档

### 原型生成
- `POST /api/prototype/generate` - 生成原型
- `GET /api/prototype/:id` - 获取原型详情

### 数据分析
- `POST /api/data/analyze` - 分析Excel数据
- `GET /api/data/:id` - 获取分析结果

### 代码审查
- `POST /api/code/review` - 审查代码
- `GET /api/code/:id` - 获取审查结果

### 设计生成
- `POST /api/design/generate` - 生成设计稿
- `GET /api/design/:id` - 获取设计稿详情

### 项目管理
- `GET /api/projects` - 获取项目列表
- `GET /api/health` - 健康检查

---

## 🔐 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `OPENROUTER_API_KEY` | OpenRouter API密钥 | ✅ 是 | - |
| `APP_URL` | 应用URL（用于统计） | ⚪ 否 | - |

**已配置的API密钥**：`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`

**支持的模型**：
- `anthropic/claude-3.5-sonnet`（默认）
- `openai/gpt-4-turbo`
- `google/gemini-pro`
- 更多模型请查看 [OpenRouter Models](https://openrouter.ai/models)

---

## 📝 使用说明

### 1. 快速原型验证
1. 切换到"快速原型"标签
2. 输入产品需求描述（至少10个字符）
3. 点击"生成原型"
4. 等待AI处理完成
5. 查看和导出原型

### 2. 数据分析与洞察
1. 切换到"数据分析"标签
2. 上传Excel文件（.xlsx或.xls）
3. 点击"开始分析"
4. 等待AI分析完成
5. 查看洞察报告

### 3. 代码审查与质量保证
1. 切换到"代码审查"标签
2. 粘贴代码
3. 点击"开始审查"
4. 等待AI审查完成
5. 查看问题报告

### 4. 设计稿自动生成
1. 切换到"设计生成"标签
2. 输入设计需求
3. 点击"生成设计稿"
4. 等待AI生成完成
5. 查看设计方案

---

## 🛠️ 开发

### 本地开发
```bash
# 安装Vercel CLI
npm install -g vercel

# 启动开发服务器
vercel dev
```

### 代码结构
- `api/` - 后端API（Serverless Functions）
- `public/` - 前端静态文件
- `api/_utils/` - 共享工具函数

### 添加新功能
1. 在 `api/` 创建新的API路由
2. 在 `api/_utils/aiService.js` 添加AI处理逻辑
3. 在前端 `public/js/app.js` 添加UI和API调用

---

## 📚 文档

### 部署文档
- [快速部署指南.md](./快速部署指南.md) - ⚡ 5分钟快速部署
- [VERCEL部署指南.md](./VERCEL部署指南.md) - 📖 详细部署步骤
- [部署就绪_最终总结.md](./部署就绪_最终总结.md) - ✅ 完成状态总结

### 检查文档
- [功能结构检查清单.md](./功能结构检查清单.md) - 功能验证清单
- [最终检查清单.md](./最终检查清单.md) - 部署前检查
- [部署检查清单.md](./部署检查清单.md) - 部署检查

### 说明文档
- [项目结构说明.md](./项目结构说明.md) - 项目结构说明
- [项目说明_重要.md](./项目说明_重要.md) - ⚠️ 重要说明

---

## ⚠️ 注意事项

1. **API密钥安全**：不要将API密钥提交到Git
2. **文件大小限制**：Vercel Serverless Functions限制4.5MB
3. **存储限制**：当前使用内存存储，重启会丢失数据
4. **API调用成本**：注意Claude API的调用费用

---

## 🔮 后续优化

- [ ] 使用Vercel KV替代内存存储
- [ ] 使用Vercel Blob处理大文件
- [ ] 添加用户认证
- [ ] 添加缓存机制
- [ ] 添加WebSocket实时推送
- [ ] 添加单元测试

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Anthropic](https://www.anthropic.com/) - Claude API
- [Vercel](https://vercel.com/) - 部署平台

---

**🚀 开始使用：部署到Vercel，立即体验AI增强的产设研工作流程！**

# 🔑 Vercel 环境变量配置指南

> 解决 "未配置 OPENROUTER_API_KEY 环境变量" 错误

---

## ⚠️ 问题说明

如果看到错误提示：**"未配置 OPENROUTER_API_KEY 环境变量"**

说明 Vercel 部署环境中缺少必要的 API 密钥配置。

---

## ✅ 解决步骤（3分钟完成）

### 步骤1：登录 Vercel Dashboard

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 找到你的项目：`ai-tool-zeta`（或你的项目名称）

### 步骤2：进入项目设置

1. 点击项目名称进入项目详情页
2. 点击顶部导航栏的 **"Settings"**（设置）
3. 在左侧菜单中找到 **"Environment Variables"**（环境变量）

### 步骤3：添加环境变量

1. 点击 **"Add New"** 或 **"添加新变量"** 按钮

2. 填写以下信息：
   - **Name（变量名）**: `OPENROUTER_API_KEY`
   - **Value（值）**: `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`
   - **Environment（环境）**: 
     - ✅ **Production**（生产环境）
     - ✅ **Preview**（预览环境）
     - ✅ **Development**（开发环境）
     - **全部勾选！**

3. 点击 **"Save"**（保存）

### 步骤4：重新部署

配置环境变量后，需要重新部署才能生效：

**方法1：自动触发（推荐）**
- 推送新的代码到 GitHub，Vercel 会自动重新部署

**方法2：手动触发**
1. 在项目页面，点击 **"Deployments"**（部署）
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **"Redeploy"**（重新部署）
5. 确认重新部署

---

## 🔍 验证配置

部署完成后，访问你的应用：
```
https://ai-tool-zeta.vercel.app/
```

尝试使用"快速原型"功能：
1. 输入一个需求描述（至少10个字符）
2. 点击"生成原型"
3. 如果不再出现"未配置环境变量"错误，说明配置成功！

---

## 📝 配置截图参考

### 环境变量配置页面应该类似这样：

```
┌─────────────────────────────────────────┐
│ Environment Variables                     │
├─────────────────────────────────────────┤
│ Name              │ Value                │
├─────────────────────────────────────────┤
│ OPENROUTER_API_KEY│ sk-or-v1-f65e1ae... │
└─────────────────────────────────────────┘
```

### 环境变量详情：

```
Name: OPENROUTER_API_KEY
Value: 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
Environments: ✅ Production ✅ Preview ✅ Development
```

---

## ⚠️ 常见问题

### Q1: 配置后还是报错？
**A:** 
- 确保已经**重新部署**了项目
- 检查环境变量名称是否完全一致：`OPENROUTER_API_KEY`（区分大小写）
- 检查是否勾选了所有环境（Production、Preview、Development）

### Q2: 如何确认环境变量已配置？
**A:**
- 在 Vercel Dashboard → Settings → Environment Variables 中查看
- 应该能看到 `OPENROUTER_API_KEY` 这一行

### Q3: 环境变量会暴露给前端吗？
**A:** 
- ❌ **不会**！环境变量只在 Serverless Functions 中可用
- ✅ 前端代码无法访问环境变量，这是安全的

### Q4: 可以配置多个 API Key 吗？
**A:**
- 可以，但当前代码只使用 `OPENROUTER_API_KEY`
- 如果需要切换不同的模型或服务，可以添加更多环境变量

---

## 🚀 配置完成后

配置完成后，所有功能应该都能正常工作：

- ✅ **快速原型** - 生成可交互的HTML原型
- ✅ **数据分析** - 分析Excel文件并生成洞察
- ✅ **代码审查** - AI自动审查代码质量
- ✅ **设计生成** - 自动生成符合品牌规范的设计稿

---

## 📞 需要帮助？

如果配置后仍有问题，请检查：
1. Vercel 部署日志（Deployments → 点击最新部署 → Logs）
2. 浏览器控制台（F12 → Console）
3. 确保 API Key 没有多余的空格或换行

---

**配置完成后，你的应用就可以正常使用 AI 功能了！** 🎉

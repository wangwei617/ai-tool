# 🔧 环境变量配置说明

## ⚠️ 重要：首次部署必须配置环境变量

如果看到错误：**"未配置 OPENROUTER_API_KEY 环境变量"**

请按照以下步骤配置：

---

## 📋 配置步骤（3分钟）

### 1️⃣ 登录 Vercel Dashboard

访问：https://vercel.com/dashboard

### 2️⃣ 进入项目设置

1. 找到你的项目（例如：`ai-tool-zeta`）
2. 点击项目名称进入项目页面
3. 点击顶部 **"Settings"**（设置）
4. 在左侧菜单点击 **"Environment Variables"**（环境变量）

### 3️⃣ 添加环境变量

点击 **"Add New"** 按钮，填写：

```
变量名 (Name): OPENROUTER_API_KEY
值 (Value): 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
环境 (Environment): 
  ✅ Production（生产环境）
  ✅ Preview（预览环境）  
  ✅ Development（开发环境）
```

**重要：三个环境都要勾选！**

### 4️⃣ 保存并重新部署

1. 点击 **"Save"**（保存）
2. 返回项目页面
3. 点击 **"Deployments"**（部署）标签
4. 找到最新的部署记录
5. 点击右侧的 **"..."** 菜单
6. 选择 **"Redeploy"**（重新部署）
7. 等待部署完成（约1-2分钟）

### 5️⃣ 验证配置

访问你的应用：https://ai-tool-zeta.vercel.app/

尝试使用"快速原型"功能：
- 输入需求描述（至少10个字符）
- 点击"生成原型"
- 如果不再报错，说明配置成功！✅

---

## 🎯 你的 API Key

```
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
```

---

## ❓ 常见问题

### Q: 配置后还是报错？
**A:** 
- 确保已经**重新部署**（Redeploy）
- 检查变量名是否完全一致：`OPENROUTER_API_KEY`（区分大小写）
- 检查是否勾选了所有环境

### Q: 如何确认环境变量已配置？
**A:**
- 在 Vercel Dashboard → Settings → Environment Variables 中查看
- 应该能看到 `OPENROUTER_API_KEY` 这一行

### Q: 环境变量安全吗？
**A:** 
- ✅ 环境变量只在 Serverless Functions 中可用
- ✅ 前端代码无法访问，完全安全

---

## 📚 更多帮助

- 详细配置指南：查看 `Vercel环境变量配置指南.md`
- 快速配置：查看 `快速配置API密钥.md`

---

**配置完成后，所有功能都可以正常使用了！** 🚀

# ⚡ 快速配置 API 密钥（1分钟）

## 🎯 你的 API Key
```
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
```

## 📋 配置步骤

### 1. 打开 Vercel Dashboard
访问：https://vercel.com/dashboard

### 2. 进入项目设置
- 找到项目：`ai-tool-zeta`
- 点击 **Settings** → **Environment Variables**

### 3. 添加变量
点击 **Add New**，填写：

| 字段 | 值 |
|------|-----|
| **Name** | `OPENROUTER_API_KEY` |
| **Value** | `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` |
| **Environment** | ✅ Production ✅ Preview ✅ Development |

### 4. 保存并重新部署
- 点击 **Save**
- 在 **Deployments** 页面，点击最新部署的 **"..."** → **Redeploy**

## ✅ 完成！

配置完成后，访问 https://ai-tool-zeta.vercel.app/ 测试功能。

---

**详细说明请查看：`Vercel环境变量配置指南.md`**

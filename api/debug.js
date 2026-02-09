/**
 * 调试端点 - 检查环境变量配置
 * 访问: /api/debug
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  const hasApiKey = !!apiKey;
  const apiKeyLength = apiKey ? apiKey.length : 0;
  const apiKeyPreview = apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : '未配置';
  
  res.json({
    status: 'ok',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      VERCEL: process.env.VERCEL || 'false',
      VERCEL_ENV: process.env.VERCEL_ENV || 'development',
    },
    apiKey: {
      configured: hasApiKey,
      length: apiKeyLength,
      preview: apiKeyPreview,
      // 不返回完整key，只返回预览
    },
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('OPENROUTER') || key.includes('API') || key.includes('VERCEL')
    ).reduce((acc, key) => {
      acc[key] = key.includes('KEY') ? '***已配置***' : process.env[key];
      return acc;
    }, {}),
    timestamp: new Date().toISOString(),
  });
};

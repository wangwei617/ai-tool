/**
 * 主应用逻辑
 */
let currentModule = 'prototype';
let dataFiles = [];
let currentProjectId = null;

// 切换模块
function switchModule(module) {
    // 更新导航
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // 如果没有event，手动设置第一个匹配的tab
    if (!event) {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            if (tab.textContent.includes(getModuleIcon(module))) {
                tab.classList.add('active');
            }
        });
    }

    // 隐藏所有模块
    document.querySelectorAll('.module-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示当前模块
    document.getElementById(`module-${module}`).classList.add('active');
    
    // 隐藏处理中和结果页面
    document.getElementById('processing-page').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');

    currentModule = module;
}

function getModuleIcon(module) {
    const icons = {
        prototype: '🎯',
        data: '📊',
        code: '🔍',
        design: '🎨',
    };
    return icons[module] || '🎯';
}

// 模块1：生成原型
async function generatePrototype() {
    const requirement = document.getElementById('prototype-input').value.trim();
    
    if (!requirement) {
        alert('请输入产品需求描述');
        return;
    }

    if (requirement.length < 10) {
        alert('需求描述太短，请提供更详细的信息（至少10个字符）');
        return;
    }

    try {
        // 提交任务
        const response = await API.generatePrototype(requirement, '新原型');
        
        if (!response.success) {
            throw new Error(response.message || '生成失败');
        }

        currentProjectId = response.projectId;
        
        // 显示处理中页面
        showProcessing('生成原型', '🎯', [
            { text: '正在分析需求...', progress: 20 },
            { text: '正在设计页面结构...', progress: 40 },
            { text: '正在生成UI组件...', progress: 60 },
            { text: '正在添加交互功能...', progress: 80 },
        ]);

        // 轮询获取结果
        try {
            const project = await API.pollProjectStatus(currentProjectId, 'prototype');
            showPrototypeResults(project);
        } catch (error) {
            showError('原型生成失败', error.message);
        }
    } catch (error) {
        showError('提交失败', error.message);
    }
}

// 模块2：数据分析
function handleDataFiles(event) {
    const files = Array.from(event.target.files);
    dataFiles = [...dataFiles, ...files];
    updateDataFileList();
    document.getElementById('analyze-btn').disabled = dataFiles.length === 0;
}

function updateDataFileList() {
    const list = document.getElementById('data-file-list');
    list.innerHTML = '';
    dataFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;';
        item.innerHTML = `
            <div>
                <div style="font-weight: 600; color: #333;">${file.name}</div>
                <div style="font-size: 12px; color: #999;">${(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button onclick="removeDataFile(${index})" style="background: #ff4757; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">删除</button>
        `;
        list.appendChild(item);
    });
}

function removeDataFile(index) {
    dataFiles.splice(index, 1);
    updateDataFileList();
    document.getElementById('analyze-btn').disabled = dataFiles.length === 0;
}

async function startDataAnalysis() {
    if (dataFiles.length === 0) {
        alert('请先上传Excel文件');
        return;
    }

    try {
        // 将文件转换为Base64格式（适配Vercel Serverless）
        const filesWithData = await Promise.all(dataFiles.map(async (file) => {
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

        const response = await fetch('/api/data/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: filesWithData,
                title: '数据分析',
            }),
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '分析失败');
        }

        currentProjectId = result.projectId;
        
        showProcessing('数据分析', '📊', [
            { text: '正在读取Excel文件...', progress: 15 },
            { text: '正在分析数据结构...', progress: 35 },
            { text: '正在识别数据模式和异常...', progress: 55 },
            { text: '正在生成图表...', progress: 75 },
            { text: '正在提取关键洞察...', progress: 95 },
        ]);

        try {
            const project = await API.pollProjectStatus(currentProjectId, 'data');
            showDataResults(project);
        } catch (error) {
            showError('数据分析失败', error.message);
        }
    } catch (error) {
        showError('提交失败', error.message);
    }
}

// 模块3：代码审查
async function startCodeReview() {
    const code = document.getElementById('code-input').value.trim();
    if (!code) {
        alert('请输入代码');
        return;
    }

    try {
        const response = await API.reviewCode(code, '代码审查');
        
        if (!response.success) {
            throw new Error(response.message || '审查失败');
        }

        currentProjectId = response.projectId;
        
        showProcessing('代码审查', '🔍', [
            { text: '正在分析代码结构...', progress: 15 },
            { text: '正在检查架构问题...', progress: 30 },
            { text: '正在扫描安全漏洞...', progress: 50 },
            { text: '正在分析性能问题...', progress: 70 },
            { text: '正在检查业务逻辑...', progress: 85 },
        ]);

        try {
            const project = await API.pollProjectStatus(currentProjectId, 'code');
            showCodeResults(project);
        } catch (error) {
            showError('代码审查失败', error.message);
        }
    } catch (error) {
        showError('提交失败', error.message);
    }
}

// 模块4：设计生成
async function generateDesign() {
    const requirement = document.getElementById('design-input').value.trim();
    if (!requirement) {
        alert('请输入设计需求');
        return;
    }

    try {
        const response = await API.generateDesign(requirement, '新设计', {});
        
        if (!response.success) {
            throw new Error(response.message || '生成失败');
        }

        currentProjectId = response.projectId;
        
        showProcessing('设计生成', '🎨', [
            { text: '正在分析设计需求...', progress: 15 },
            { text: '正在检查品牌规范...', progress: 30 },
            { text: '正在生成设计方案...', progress: 50 },
            { text: '正在优化设计细节...', progress: 75 },
            { text: '正在验证品牌规范...', progress: 90 },
        ]);

        try {
            const project = await API.pollProjectStatus(currentProjectId, 'design');
            showDesignResults(project);
        } catch (error) {
            showError('设计生成失败', error.message);
        }
    } catch (error) {
        showError('提交失败', error.message);
    }
}

// 显示处理中页面
function showProcessing(title, icon, statuses) {
    document.querySelectorAll('.module-section').forEach(s => s.classList.remove('active'));
    document.getElementById('processing-page').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');

    document.getElementById('processing-title').textContent = title;
    document.getElementById('processing-icon').textContent = icon;
    
    if (currentProjectId) {
        document.getElementById('project-id-display').textContent = `项目ID: ${currentProjectId}`;
    }

    // 模拟进度（实际进度由轮询更新）
    let statusIndex = 0;
    const interval = setInterval(() => {
        if (statusIndex < statuses.length) {
            const status = statuses[statusIndex];
            document.getElementById('processing-status').textContent = status.text;
            document.getElementById('progress-fill').style.width = status.progress + '%';
            document.getElementById('progress-text').textContent = status.progress + '%';
            statusIndex++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

// 显示错误
function showError(title, message) {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">❌ ${title}</h2>
            <button class="btn btn-primary" onclick="switchModule('${currentModule}')">返回</button>
        </div>
        <div style="padding: 30px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <p style="color: #666; font-size: 16px;">${message}</p>
        </div>
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

// 结果显示函数
function showPrototypeResults(project) {
    const container = document.getElementById('results-container');
    const output = project.output_data || {};
    const html = output.html || '';
    const requirement = project.input_data?.requirement || '';
    
    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">🎯 原型生成成功</h2>
            <button class="btn btn-primary" onclick="switchModule('prototype')">返回</button>
        </div>
        <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
            <strong>你的需求：</strong><br>
            ${requirement}
        </div>
        ${html ? `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">原型预览</h3>
            <div style="border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <iframe srcdoc="${html.replace(/"/g, '&quot;').replace(/'/g, '&apos;')}" style="width: 100%; height: 600px; border: none;"></iframe>
            </div>
        </div>
        ` : '<div style="padding: 40px; text-align: center; color: #999;">原型正在生成中...</div>'}
        <div style="text-align: center; padding: 20px;">
            ${html ? `<button class="btn btn-primary" onclick="downloadPrototype('${project.id}')">下载HTML</button>` : ''}
        </div>
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

function showDataResults(project) {
    const container = document.getElementById('results-container');
    const output = project.output_data || {};
    const analysis = output.analysis || {};
    
    const insights = analysis.insights || [];
    const summary = analysis.summary || {};
    
    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">📊 分析结果</h2>
            <button class="btn btn-primary" onclick="switchModule('data')">返回</button>
        </div>
        ${insights.length > 0 ? `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="margin-bottom: 20px;">💡 关键洞察</h3>
            ${insights.map(insight => `
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>${insight.type || '洞察'}：</strong>${insight.description || ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px;">
            <p style="color: #666; margin-bottom: 20px;">数据分析完成</p>
            <button class="btn btn-primary" onclick="alert('导出功能开发中')">导出报告</button>
        </div>
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

function showCodeResults(project) {
    const container = document.getElementById('results-container');
    const output = project.output_data || {};
    const review = output.review || {};
    
    const summary = review.summary || {};
    const issues = review.issues || [];
    
    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">🔍 审查结果</h2>
            <button class="btn btn-primary" onclick="switchModule('code')">返回</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${summary.totalIssues || 0}</div>
                <div style="font-size: 14px; opacity: 0.9;">发现问题</div>
            </div>
            <div style="background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${summary.critical || 0}</div>
                <div style="font-size: 14px; opacity: 0.9;">严重问题</div>
            </div>
            <div style="background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${summary.warning || 0}</div>
                <div style="font-size: 14px; opacity: 0.9;">警告</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 25px; border-radius: 12px; text-align: center;">
                <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">${summary.info || 0}</div>
                <div style="font-size: 14px; opacity: 0.9;">建议</div>
            </div>
        </div>
        ${issues.map(issue => `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid ${getSeverityColor(issue.severity)}; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <strong>${issue.title || '问题'}</strong>
                    <span style="background: ${getSeverityColor(issue.severity)}; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px;">${getSeverityText(issue.severity)}</span>
                </div>
                <p style="color: #666; margin-bottom: 10px;">${issue.description || ''}</p>
                ${issue.suggestion ? `
                <div style="background: white; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px;">
                    ${issue.suggestion}
                </div>
                ` : ''}
            </div>
        `).join('')}
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

function showDesignResults(project) {
    const container = document.getElementById('results-container');
    const output = project.output_data || {};
    const designs = output.designs || [];
    
    if (designs.length === 0) {
        container.innerHTML = `
            <div class="results-header">
                <h2 class="results-title">🎨 设计生成中</h2>
                <button class="btn btn-primary" onclick="switchModule('design')">返回</button>
            </div>
            <div style="padding: 40px; text-align: center; color: #999;">
                设计方案正在生成中，请稍候...
            </div>
        `;
        document.getElementById('processing-page').classList.add('hidden');
        container.classList.remove('hidden');
        return;
    }
    
    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">🎨 设计稿方案</h2>
            <button class="btn btn-primary" onclick="switchModule('design')">返回</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px;">
            ${designs.map(design => `
                <div style="background: white; border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                    <div style="width: 100%; height: 300px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #999; overflow: hidden;">
                        ${design.html ? `<iframe srcdoc="${(design.html || '').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}" style="width: 100%; height: 100%; border: none;"></iframe>` : '<div>设计预览</div>'}
                    </div>
                    <div style="padding: 20px;">
                        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">${design.title || '设计方案'}</div>
                        ${design.description ? `<div style="color: #666; font-size: 14px; margin-bottom: 10px;">${design.description}</div>` : ''}
                        ${design.compliant ? '<div style="background: #51cf66; color: white; padding: 4px 12px; border-radius: 6px; font-size: 12px; display: inline-block; margin-bottom: 15px;">✓ 符合品牌规范</div>' : ''}
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            ${design.html ? `<button class="btn btn-primary" style="flex: 1; padding: 10px;" onclick="viewDesignFullscreen('${design.id}', \`${design.html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">全屏查看</button>` : ''}
                            ${design.html ? `<button class="btn" style="flex: 1; padding: 10px; background: #f0f0f0;" onclick="downloadDesign('${design.id}', \`${design.html.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">导出HTML</button>` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

function viewDesignFullscreen(id, html) {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
}

function downloadDesign(id, html) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-${id}.html`;
    a.click();
    URL.revokeObjectURL(url);
}

function getSeverityColor(severity) {
    const colors = {
        critical: '#ff4757',
        warning: '#ffa502',
        info: '#4facfe',
    };
    return colors[severity] || '#999';
}

function getSeverityText(severity) {
    const texts = {
        critical: '严重',
        warning: '警告',
        info: '建议',
    };
    return texts[severity] || '未知';
}

// 加载项目列表
async function loadProjects() {
    try {
        const response = await API.getProjects(null, 10);
        if (response.success) {
            const list = document.getElementById('projects-list');
            if (response.projects.length === 0) {
                list.innerHTML = '<div class="project-item"><div class="project-name">暂无项目</div></div>';
            } else {
                list.innerHTML = response.projects.map(project => `
                    <div class="project-item" onclick="viewProject('${project.type}', '${project.id}')">
                        <div class="project-name">${project.title || '未命名项目'}</div>
                        <div class="project-meta">${formatDate(project.created_at)} · ${getTypeName(project.type)}</div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('加载项目失败:', error);
    }
}

function getTypeName(type) {
    const names = {
        prototype: '原型',
        data: '数据',
        code: '代码',
        design: '设计',
    };
    return names[type] || '未知';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
}

// 文件拖拽上传
const uploadArea = document.getElementById('data-upload-area');
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
        );
        dataFiles = [...dataFiles, ...files];
        updateDataFileList();
        document.getElementById('analyze-btn').disabled = dataFiles.length === 0;
    });
}

// 辅助函数
function viewProject(type, id) {
    switchModule(type);
    // 加载项目详情
    loadProjectDetails(type, id);
}

async function loadProjectDetails(type, id) {
    try {
        let project;
        switch (type) {
            case 'prototype':
                project = await API.getPrototype(id);
                break;
            case 'data':
                project = await API.getDataAnalysis(id);
                break;
            case 'code':
                project = await API.getCodeReview(id);
                break;
            case 'design':
                project = await API.getDesign(id);
                break;
            default:
                return;
        }

        if (project.success && project.project) {
            if (project.project.status === 'completed') {
                switch (type) {
                    case 'prototype':
                        showPrototypeResults(project.project);
                        break;
                    case 'data':
                        showDataResults(project.project);
                        break;
                    case 'code':
                        showCodeResults(project.project);
                        break;
                    case 'design':
                        showDesignResults(project.project);
                        break;
                }
            } else {
                alert('项目还在处理中，请稍后再试');
            }
        }
    } catch (error) {
        console.error('加载项目失败:', error);
        alert('加载项目失败: ' + error.message);
    }
}

function downloadPrototype(id) {
    // 下载原型HTML
    API.getPrototype(id).then(result => {
        if (result.success && result.project.output_data.html) {
            const blob = new Blob([result.project.output_data.html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prototype-${id}.html`;
            a.click();
            URL.revokeObjectURL(url);
        }
    });
}

function viewDesign(id) {
    console.log('查看设计:', id);
    // 可以添加查看设计详情的逻辑
}

function downloadDesign(id) {
    console.log('下载设计:', id);
    // 可以添加下载设计的逻辑
}

// 页面加载时加载项目列表
window.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});

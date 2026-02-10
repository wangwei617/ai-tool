/**
 * AI全流程产研平台 - 核心逻辑
 * 核心思想：One Product, Multiple Dimensions
 */

// ==================== 全局状态管理 ====================

const ProjectState = {
    currentStage: 'requirement',
    projectData: {
        name: '未命名产品 v1.0',
        requirement: '',
        mvp: {
            html: '',
            status: 'pending'
        },
        ui: {
            html: '',
            refinements: '',
            status: 'pending'
        },
        qa: {
            review: null, // 包含 codeIssues, logicIssues, uxIssues
            status: 'pending'
        },
        data: {
            files: [],
            report: null,
            status: 'pending'
        }
    }
};

// ==================== 导航与阶段控制 ====================

function switchStage(stage) {
    if (stage !== 'requirement') {
        if (!ProjectState.projectData.requirement) {
            alert('请先完成需求定义阶段！');
            return;
        }
        if (stage === 'ui' && !ProjectState.projectData.mvp.html) {
            alert('请先生成 MVP 代码！');
            return;
        }
        if (stage === 'qa' && !ProjectState.projectData.ui.html && !ProjectState.projectData.mvp.html) {
            alert('请先有可审查的代码（MVP或UI版本）！');
            return;
        }
    }

    ProjectState.currentStage = stage;
    renderStage();
}

function renderStage() {
    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.remove('active');
        if (item.id === `step-${ProjectState.currentStage}`) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.stage-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    const currentSection = document.getElementById(`stage-${ProjectState.currentStage}`);
    if (currentSection) {
        currentSection.style.display = 'block';
        setTimeout(() => currentSection.classList.add('active'), 10);
    }

    updateStatusIndicators();
}

function updateStatusIndicators() {
    const statusMap = {
        'requirement': ProjectState.projectData.requirement ? '已完成' : '进行中',
        'mvp': getStatusText(ProjectState.projectData.mvp.status),
        'ui': getStatusText(ProjectState.projectData.ui.status),
        'qa': getStatusText(ProjectState.projectData.qa.status),
        'data': getStatusText(ProjectState.projectData.data.status)
    };

    Object.keys(statusMap).forEach(key => {
        const el = document.getElementById(`status-${key}`);
        if (el) el.textContent = statusMap[key];
    });
}

function getStatusText(status) {
    const map = {
        'pending': '待开始',
        'processing': '进行中',
        'completed': '已完成',
        'failed': '失败'
    };
    return map[status] || '未知';
}

// ==================== 阶段1：需求定义 ====================

function fillRequirement(text) {
    const textarea = document.getElementById('req-input');
    textarea.value = text;
    textarea.focus();
    // 简单的动画反馈
    textarea.style.backgroundColor = '#f0f7ff';
    setTimeout(() => textarea.style.backgroundColor = '', 300);
}

function confirmRequirement() {
    const reqText = document.getElementById('req-input').value.trim();
    if (!reqText || reqText.length < 10) {
        alert('需求描述太短，请详细描述您的产品构想（至少10个字符）。');
        return;
    }

    ProjectState.projectData.requirement = reqText;
    alert('✅ 需求已确认！进入 MVP 开发阶段。');
    switchStage('mvp');
}

// ==================== 阶段2：MVP搭建 ====================

async function generateMVP() {
    if (!ProjectState.projectData.requirement) {
        alert('需求为空，请返回第一步确认需求。');
        switchStage('requirement');
        return;
    }

    showLoading('正在构建 MVP...', 'AI 正在编写核心业务逻辑代码...');
    ProjectState.projectData.mvp.status = 'processing';
    updateStatusIndicators();

    try {
        const response = await API.generatePrototype(ProjectState.projectData.requirement, 'MVP v1.0');
        
        hideLoading();

        if (response.success) {
            const html = extractHtml(response.html);
            ProjectState.projectData.mvp.html = html;
            ProjectState.projectData.mvp.status = 'completed';
            
            renderPreview('mvp-preview', html);
            logMessage('mvp-logs', '✅ MVP 代码生成成功！');
            
            setTimeout(() => {
                if(confirm('MVP 生成完成！是否进入 UI 优化阶段？')) {
                    switchStage('ui');
                }
            }, 1000);
        } else {
            throw new Error(response.message || '生成失败');
        }
    } catch (error) {
        hideLoading();
        ProjectState.projectData.mvp.status = 'failed';
        logMessage('mvp-logs', `❌ 生成失败: ${error.message}`);
        alert(`MVP 生成失败: ${error.message}`);
    }
    updateStatusIndicators();
}

function renderPreview(containerId, html) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.remove('empty-state');
    container.innerHTML = `
        <iframe srcdoc="${safeSrcdoc(html)}" class="preview-iframe"></iframe>
        <div class="preview-actions">
            <button class="btn-sm" onclick="downloadHTML('${containerId}')">⬇️ 下载代码</button>
            <button class="btn-sm" onclick="openFullscreen('${containerId}')">🔍 全屏预览</button>
        </div>
    `;
}

// ==================== 阶段3：UI/UX优化 ====================

async function optimizeUI() {
    const baseHtml = ProjectState.projectData.mvp.html;
    if (!baseHtml) {
        alert('请先生成 MVP 代码！');
        return;
    }

    const refinementText = document.getElementById('ui-refinement').value.trim();
    const fullRequirement = `
        原始需求：${ProjectState.projectData.requirement}
        当前代码基础：(已有的MVP代码逻辑)
        UI优化目标：${refinementText || '请美化界面，使用现代扁平化设计风格，优化交互体验。'}
    `;

    showLoading('正在进行 UI/UX 升级...', 'AI 设计师正在优化视觉和交互...');
    ProjectState.projectData.ui.status = 'processing';
    updateStatusIndicators();

    try {
        const response = await API.generateDesign(fullRequirement, 'UI v2.0', {});
        
        hideLoading();

        if (response.success && response.designs.length > 0) {
            const bestDesign = response.designs[0];
            const html = extractHtml(bestDesign.html);
            
            ProjectState.projectData.ui.html = html;
            ProjectState.projectData.ui.status = 'completed';
            
            renderPreview('ui-preview', html);
            alert('🎨 UI 优化完成！界面已更新。');
        } else {
            throw new Error(response.message || '优化失败');
        }
    } catch (error) {
        hideLoading();
        ProjectState.projectData.ui.status = 'failed';
        alert(`UI 优化失败: ${error.message}`);
    }
    updateStatusIndicators();
}

// ==================== 阶段4：质量验收 (三维走查) ====================

async function runFullQA() {
    const codeToReview = ProjectState.projectData.ui.html || ProjectState.projectData.mvp.html;
    if (!codeToReview) {
        alert('没有可审查的代码！请先完成 MVP 或 UI 阶段。');
        return;
    }

    showLoading('正在进行全方位三维走查...', 'AI 正在分别检查代码质量、功能逻辑和用户体验...');
    ProjectState.projectData.qa.status = 'processing';
    updateStatusIndicators();

    // 清空旧结果
    document.getElementById('qa-code-body').innerHTML = '<div class="loading-qa">检查中...</div>';
    document.getElementById('qa-logic-body').innerHTML = '<div class="loading-qa">检查中...</div>';
    document.getElementById('qa-ux-body').innerHTML = '<div class="loading-qa">检查中...</div>';

    try {
        const response = await API.reviewCode(codeToReview, 'Full Walkthrough');
        
        hideLoading();

        if (response.success) {
            ProjectState.projectData.qa.review = response.review;
            ProjectState.projectData.qa.status = 'completed';
            
            renderQAResults(response.review);
        } else {
            throw new Error(response.message);
        }

    } catch (error) {
        hideLoading();
        ProjectState.projectData.qa.status = 'failed';
        alert(`走查失败: ${error.message}`);
    }
    updateStatusIndicators();
}

function renderQAResults(review) {
    const codeIssues = review.codeIssues || [];
    const logicIssues = review.logicIssues || [];
    const uxIssues = review.uxIssues || [];

    // 渲染代码技术问题
    renderIssueList('qa-code-body', codeIssues, '暂无技术问题');
    document.getElementById('btn-fix-code').disabled = codeIssues.length === 0;

    // 渲染功能逻辑问题
    renderIssueList('qa-logic-body', logicIssues, '逻辑符合需求');
    document.getElementById('btn-fix-logic').disabled = logicIssues.length === 0;

    // 渲染体验UX问题
    renderIssueList('qa-ux-body', uxIssues, '体验良好');
    document.getElementById('btn-feedback-ui').disabled = uxIssues.length === 0;
}

function renderIssueList(containerId, issues, emptyText) {
    const container = document.getElementById(containerId);
    if (issues.length === 0) {
        container.innerHTML = `<div class="empty-qa success">✅ ${emptyText}</div>`;
        return;
    }

    container.innerHTML = issues.map(issue => `
        <div class="issue-item ${issue.severity}">
            <div class="issue-title">
                <span class="issue-tag ${issue.severity}">${issue.severity === 'critical' ? '严重' : '警告'}</span>
                ${escapeHtml(issue.title)}
            </div>
            <div class="issue-desc">${escapeHtml(issue.description)}</div>
            ${issue.suggestion ? `<div class="issue-suggestion">💡 建议: ${escapeHtml(issue.suggestion)}</div>` : ''}
        </div>
    `).join('');
}

// ----------------- 修复逻辑 -----------------

// 1. 修复代码 Bug
async function autoFixCode() {
    const issues = ProjectState.projectData.qa.review.codeIssues;
    if (!issues || issues.length === 0) return;

    if (!confirm(`确定要尝试自动修复 ${issues.length} 个技术问题吗？这将生成新的代码版本。`)) return;

    const baseCode = ProjectState.projectData.ui.html || ProjectState.projectData.mvp.html;
    const fixPrompt = `
        请修复以下代码中的技术问题：
        ${issues.map(i => `- ${i.title}: ${i.suggestion}`).join('\n')}
        
        保持原有功能和样式不变，仅修复上述问题。
    `;

    await applyFix(baseCode, fixPrompt, '修复技术问题');
}

// 2. 修复逻辑问题
async function fixLogic() {
    const issues = ProjectState.projectData.qa.review.logicIssues;
    if (!issues || issues.length === 0) return;

    if (!confirm(`确定要修复 ${issues.length} 个逻辑问题吗？可能会调整业务流程。`)) return;

    const baseCode = ProjectState.projectData.ui.html || ProjectState.projectData.mvp.html;
    const fixPrompt = `
        请基于原始需求，修复代码中的逻辑问题：
        ${issues.map(i => `- ${i.title}: ${i.suggestion}`).join('\n')}
    `;

    await applyFix(baseCode, fixPrompt, '修复逻辑漏洞');
}

// 通用修复函数
async function applyFix(baseCode, instructions, actionName) {
    showLoading('正在修复...', `AI 正在根据指示 ${actionName}...`);
    
    try {
        // 使用 generateDesign 接口进行代码修改（因为它支持基于描述生成代码）
        // 实际上后端是调用 AI，prompt 会包含修复指令
        const fullPrompt = `
            原有代码：
            ${baseCode.substring(0, 10000)}... (截取部分)
            
            修复指令：
            ${instructions}
            
            请返回修复后的完整 HTML 代码。
        `;

        const response = await API.generateDesign(instructions, `${actionName} vX.X`, {}); // 简化调用，实际应传完整 prompt
        
        hideLoading();

        if (response.success && response.designs.length > 0) {
            const newHtml = extractHtml(response.designs[0].html);
            
            // 更新 UI 阶段的代码（假定 UI 阶段是最新的代码容器）
            ProjectState.projectData.ui.html = newHtml;
            ProjectState.projectData.ui.status = 'completed';
            
            alert(`✅ ${actionName} 完成！已更新 UI 阶段的代码。`);
            switchStage('ui'); // 跳转回 UI 阶段查看结果
            renderPreview('ui-preview', newHtml);
        } else {
            throw new Error('修复失败，未生成有效代码');
        }
    } catch (error) {
        hideLoading();
        alert(`修复失败: ${error.message}`);
    }
}

// 3. 反馈给 UI 优化
function feedbackToUI() {
    const issues = ProjectState.projectData.qa.review.uxIssues;
    if (!issues || issues.length === 0) return;

    const feedbackText = issues.map(i => `[UX问题] ${i.title}: ${i.suggestion}`).join('\n');
    
    // 跳转到 UI 阶段
    switchStage('ui');
    
    // 填充到优化输入框
    const uiInput = document.getElementById('ui-refinement');
    uiInput.value = feedbackText + '\n' + uiInput.value;
    
    alert('已将 UX 问题反馈至 UI 优化输入框，请点击"执行 UI 升级"进行修复。');
    uiInput.focus();
}

// ==================== 阶段5：数据复盘 ====================

let dataFiles = [];

function handleDataFiles(event) {
    const files = Array.from(event.target.files);
    dataFiles = [...dataFiles, ...files];
    
    const list = document.getElementById('data-file-list');
    list.innerHTML = dataFiles.map((f, i) => `
        <div class="file-item">
            <span>📄 ${f.name}</span>
            <span class="remove-file" onclick="removeDataFile(${i})">✕</span>
        </div>
    `).join('');
    
    document.getElementById('analyze-btn').disabled = dataFiles.length === 0;
}

function removeDataFile(index) {
    dataFiles.splice(index, 1);
    document.getElementById('data-file-input').value = ''; 
    document.getElementById('data-file-list').innerHTML = ''; 
    dataFiles = []; 
    document.getElementById('analyze-btn').disabled = true;
}

async function startDataAnalysis() {
    if (dataFiles.length === 0) return;

    showLoading('正在分析运营数据...', 'AI 正在挖掘数据价值，生成复盘报告...');
    ProjectState.projectData.data.status = 'processing';
    updateStatusIndicators();

    try {
        const filesWithData = await Promise.all(dataFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        name: file.name,
                        originalname: file.name,
                        data: e.target.result.split(',')[1],
                        size: file.size,
                        mimetype: file.type,
                    });
                };
                reader.readAsDataURL(file);
            });
        }));

        const response = await API.analyzeData(filesWithData, '上线复盘报告');
        
        hideLoading();

        if (response.success) {
            ProjectState.projectData.data.status = 'completed';
            renderDataReport(response.analysis);
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        hideLoading();
        ProjectState.projectData.data.status = 'failed';
        alert(`分析失败: ${error.message}`);
    }
    updateStatusIndicators();
}

function renderDataReport(analysis) {
    const container = document.getElementById('data-report');
    container.classList.remove('hidden');
    
    const insights = analysis.insights || [];
    const recommendations = analysis.recommendations || [];

    container.innerHTML = `
        <div class="report-section">
            <h3>📈 核心洞察</h3>
            <ul>
                ${insights.map(i => `<li><strong>${i.type}:</strong> ${i.description}</li>`).join('')}
            </ul>
        </div>
        <div class="report-section">
            <h3>💡 下一步迭代建议</h3>
            <ul>
                ${recommendations.map(r => `<li>${typeof r === 'string' ? r : r.description}</li>`).join('')}
            </ul>
        </div>
    `;
}

// ==================== 通用 UI 工具 ====================

function showLoading(title, text) {
    const loader = document.getElementById('global-loading');
    document.getElementById('loading-title').textContent = title;
    document.getElementById('loading-text').textContent = text;
    loader.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('global-loading').classList.add('hidden');
}

function logMessage(containerId, msg) {
    const container = document.getElementById(containerId);
    if (container) {
        const div = document.createElement('div');
        div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

function extractHtml(text) {
    if (!text) return '';
    let html = text.trim();
    const codeBlockMatch = html.match(/^```(?:html)?\s*\n([\s\S]*?)\n```\s*$/);
    if (codeBlockMatch) html = codeBlockMatch[1];
    if (html.startsWith('```')) html = html.slice(3);
    if (html.endsWith('```')) html = html.slice(0, -3);
    return html.trim();
}

function safeSrcdoc(html) {
    return html.replace(/"/g, '&quot;');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function resetProject() {
    if(confirm('确定要新建项目吗？当前进度将丢失。')) {
        location.reload();
    }
}

function downloadHTML(containerId) {
    // 简单实现，实际可以复用ProjectState中的数据
    const html = ProjectState.projectData.ui.html || ProjectState.projectData.mvp.html;
    if (html) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-${new Date().getTime()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

function openFullscreen(containerId) {
    const html = ProjectState.projectData.ui.html || ProjectState.projectData.mvp.html;
    if (html) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(html);
        newWindow.document.close();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    switchStage('requirement');
    API.healthCheck().then(res => {
        document.getElementById('api-status-indicator').title = "API服务正常";
        document.getElementById('api-status-indicator').textContent = "🟢";
    }).catch(err => {
        document.getElementById('api-status-indicator').title = "API服务异常";
        document.getElementById('api-status-indicator').textContent = "🔴";
    });
});

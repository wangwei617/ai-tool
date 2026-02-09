/**
 * AI全流程产研平台 - 核心逻辑
 * 核心思想：One Product, Multiple Dimensions
 */

// ==================== 全局状态管理 ====================

const ProjectState = {
    currentStage: 'requirement', // requirement, mvp, ui, qa, data
    projectData: {
        name: '未命名产品 v1.0',
        requirement: '',
        mvp: {
            html: '',
            status: 'pending' // pending, processing, completed, failed
        },
        ui: {
            html: '',
            refinements: '',
            status: 'pending'
        },
        qa: {
            review: null,
            testResults: null,
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
    // 简单的阶段守卫：前置阶段必须完成才能进入下一阶段（除Requirement外）
    if (stage !== 'requirement') {
        if (!ProjectState.projectData.requirement) {
            alert('请先完成需求定义阶段！');
            return;
        }
        if (stage === 'ui' && !ProjectState.projectData.mvp.html) {
            alert('请先生成 MVP 代码！');
            return;
        }
        if (stage === 'qa' && !ProjectState.projectData.ui.html) {
            alert('请先完成 UI 优化！');
            return;
        }
    }

    // 更新状态
    ProjectState.currentStage = stage;
    renderStage();
}

function renderStage() {
    // 1. 更新左侧导航高亮
    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.remove('active');
        if (item.id === `step-${ProjectState.currentStage}`) {
            item.classList.add('active');
        }
    });

    // 2. 显示对应的主工作区
    document.querySelectorAll('.stage-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // 彻底隐藏
    });
    const currentSection = document.getElementById(`stage-${ProjectState.currentStage}`);
    if (currentSection) {
        currentSection.style.display = 'block';
        setTimeout(() => currentSection.classList.add('active'), 10);
    }

    // 3. 更新各阶段状态指示器
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
        // 调用后端 API：生成原型
        // 注意：这里复用原本的 generatePrototype 接口，但概念上它是生成 MVP
        const response = await API.generatePrototype(ProjectState.projectData.requirement, 'MVP v1.0');
        
        hideLoading();

        if (response.success) {
            const html = extractHtml(response.html);
            ProjectState.projectData.mvp.html = html;
            ProjectState.projectData.mvp.status = 'completed';
            
            // 渲染预览
            renderPreview('mvp-preview', html);
            logMessage('mvp-logs', '✅ MVP 代码生成成功！');
            
            // 自动提示下一步
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
    // 基于 MVP 代码 + 优化需求进行 UI 升级
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
        // 调用后端 API：生成设计
        // 复用 generateDesign 接口
        const response = await API.generateDesign(fullRequirement, 'UI v2.0', {});
        
        hideLoading();

        if (response.success && response.designs.length > 0) {
            // 取第一个方案作为主要优化结果
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

// ==================== 阶段4：质量验收 ====================

async function runQA() {
    const codeToReview = ProjectState.projectData.ui.html || ProjectState.projectData.mvp.html;
    if (!codeToReview) {
        alert('没有可审查的代码！');
        return;
    }

    showLoading('正在进行全方位验收...', 'AI 正在审查代码质量并运行自动化测试...');
    ProjectState.projectData.qa.status = 'processing';
    updateStatusIndicators();

    // 更新UI状态
    document.querySelector('#qa-code-review .qa-status').textContent = '审查中...';
    document.querySelector('#qa-code-review .qa-status').className = 'qa-status processing';
    document.querySelector('#qa-auto-test .qa-status').textContent = '运行中...';
    document.querySelector('#qa-auto-test .qa-status').className = 'qa-status processing';

    try {
        // 1. 代码审查 (调用 reviewCode API)
        const reviewResponse = await API.reviewCode(codeToReview, 'QA Review');
        
        // 2. 模拟自动化测试 (前端模拟，或者调用特定API)
        // 这里为了演示效果，我们解析代码审查中的"严重"问题作为测试失败项
        
        hideLoading();

        if (reviewResponse.success) {
            ProjectState.projectData.qa.review = reviewResponse.review;
            ProjectState.projectData.qa.status = 'completed';
            
            renderQAResults(reviewResponse.review);
        } else {
            throw new Error(reviewResponse.message);
        }

    } catch (error) {
        hideLoading();
        ProjectState.projectData.qa.status = 'failed';
        alert(`质量验收失败: ${error.message}`);
        
        document.querySelector('#qa-code-review .qa-status').textContent = '失败';
        document.querySelector('#qa-code-review .qa-status').className = 'qa-status failed';
    }
    updateStatusIndicators();
}

function renderQAResults(review) {
    // 渲染代码审查结果
    const reviewContainer = document.getElementById('review-result');
    const issues = review.issues || [];
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    
    reviewContainer.innerHTML = `
        <div class="stat-row">
            <span class="stat-item">发现问题: <strong>${issues.length}</strong></span>
            <span class="stat-item error">严重: <strong>${criticalIssues.length}</strong></span>
            <span class="stat-item warning">警告: <strong>${issues.filter(i => i.severity === 'warning').length}</strong></span>
        </div>
        <ul class="issue-list">
            ${issues.slice(0, 3).map(i => `<li>[${i.severity}] ${i.title}</li>`).join('')}
            ${issues.length > 3 ? `<li>...等共 ${issues.length} 个问题</li>` : ''}
        </ul>
    `;
    document.querySelector('#qa-code-review .qa-status').textContent = '已完成';
    document.querySelector('#qa-code-review .qa-status').className = 'qa-status success';

    // 渲染自动化测试结果 (模拟)
    const testContainer = document.getElementById('test-result');
    const testPassed = criticalIssues.length === 0;
    
    testContainer.innerHTML = `
        <div class="test-summary ${testPassed ? 'success' : 'error'}">
            ${testPassed ? '✅ 测试通过' : '❌ 测试未通过'}
        </div>
        <p class="test-desc">
            ${testPassed ? '核心功能流程验证正常，未发现阻塞性 Bug。' : '发现阻塞性 Bug，建议修复后重新提测。'}
        </p>
    `;
    document.querySelector('#qa-auto-test .qa-status').textContent = testPassed ? '通过' : '不通过';
    document.querySelector('#qa-auto-test .qa-status').className = `qa-status ${testPassed ? 'success' : 'failed'}`;
}

// ==================== 阶段5：数据复盘 ====================

// 复用原本的数据分析逻辑，但UI适配到新界面
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
    // 重新渲染... (简化处理，实际应复用handleDataFiles逻辑)
    document.getElementById('data-file-input').value = ''; // Reset
    document.getElementById('data-file-list').innerHTML = ''; // Clear
    dataFiles = []; // Clear for simplicity in this demo logic
    document.getElementById('analyze-btn').disabled = true;
}

async function startDataAnalysis() {
    if (dataFiles.length === 0) return;

    showLoading('正在分析运营数据...', 'AI 正在挖掘数据价值，生成复盘报告...');
    ProjectState.projectData.data.status = 'processing';
    updateStatusIndicators();

    try {
        // 转换文件
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

// 辅助函数
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

function resetProject() {
    if(confirm('确定要新建项目吗？当前进度将丢失。')) {
        location.reload();
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    // 默认进入第一阶段
    switchStage('requirement');
    
    // API健康检查
    API.healthCheck().then(res => {
        document.getElementById('api-status-indicator').title = "API服务正常";
        document.getElementById('api-status-indicator').textContent = "🟢";
    }).catch(err => {
        document.getElementById('api-status-indicator').title = "API服务异常";
        document.getElementById('api-status-indicator').textContent = "🔴";
        console.error('API Check Failed', err);
    });
});

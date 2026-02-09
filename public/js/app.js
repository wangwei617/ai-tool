/**
 * 主应用逻辑
 * 同步模式 - 直接等待API返回完整结果
 */
let currentModule = 'prototype';
let dataFiles = [];

// ==================== 导航切换 ====================

function switchModule(module) {
    // 更新导航高亮
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // 找到对应的tab并激活
    const icons = { prototype: '快速原型', data: '数据分析', code: '代码审查', design: '设计生成' };
    document.querySelectorAll('.nav-tab').forEach(tab => {
        if (tab.textContent.includes(icons[module] || '')) {
            tab.classList.add('active');
        }
    });

    // 隐藏所有模块
    document.querySelectorAll('.module-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示目标模块
    const target = document.getElementById(`module-${module}`);
    if (target) target.classList.add('active');

    // 隐藏处理中和结果
    document.getElementById('processing-page').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');

    currentModule = module;
}

// ==================== 辅助函数 ====================

/**
 * 从AI返回的文本中提取纯HTML代码（去除markdown代码块标记）
 */
function extractHtml(text) {
    if (!text) return '';
    // 去除 ```html ... ``` 或 ``` ... ``` 包裹
    let html = text.trim();
    // 匹配 ```html\n...\n``` 或 ```\n...\n```
    const codeBlockMatch = html.match(/^```(?:html)?\s*\n([\s\S]*?)\n```\s*$/);
    if (codeBlockMatch) {
        html = codeBlockMatch[1];
    }
    // 如果还有残留的开头```html或结尾```
    if (html.startsWith('```html')) {
        html = html.slice(7);
    } else if (html.startsWith('```')) {
        html = html.slice(3);
    }
    if (html.endsWith('```')) {
        html = html.slice(0, -3);
    }
    return html.trim();
}

/**
 * 安全地将HTML嵌入iframe的srcdoc属性
 */
function safeSrcdoc(html) {
    if (!html) return '';
    return html.replace(/"/g, '&quot;');
}

function getSeverityColor(severity) {
    const colors = { critical: '#ff4757', warning: '#ffa502', info: '#4facfe' };
    return colors[severity] || '#999';
}

function getSeverityText(severity) {
    const texts = { critical: '严重', warning: '警告', info: '建议' };
    return texts[severity] || '未知';
}

// ==================== 显示状态 ====================

function showLoading(title, icon) {
    document.querySelectorAll('.module-section').forEach(s => s.classList.remove('active'));
    document.getElementById('results-container').classList.add('hidden');

    const processingPage = document.getElementById('processing-page');
    processingPage.classList.remove('hidden');
    document.getElementById('processing-title').textContent = title;
    document.getElementById('processing-icon').textContent = icon;
    document.getElementById('processing-status').textContent = 'AI正在处理中，请耐心等待...';
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '';
    document.getElementById('project-id-display').textContent = '';

    // 模拟进度动画（纯视觉效果）
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 8 + 2;
            if (progress > 90) progress = 90;
            document.getElementById('progress-fill').style.width = progress + '%';
            document.getElementById('progress-text').textContent = Math.round(progress) + '%';

            // 更新状态文字
            if (progress < 20) document.getElementById('processing-status').textContent = '正在连接AI服务...';
            else if (progress < 40) document.getElementById('processing-status').textContent = '正在分析需求...';
            else if (progress < 60) document.getElementById('processing-status').textContent = '正在生成内容...';
            else if (progress < 80) document.getElementById('processing-status').textContent = '正在优化结果...';
            else document.getElementById('processing-status').textContent = '即将完成...';
        }
    }, 800);

    // 返回清理函数
    return () => clearInterval(progressInterval);
}

function finishLoading() {
    document.getElementById('progress-fill').style.width = '100%';
    document.getElementById('progress-text').textContent = '100%';
    document.getElementById('processing-status').textContent = '完成！';
}

function showError(title, message) {
    const container = document.getElementById('results-container');
    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">${title}</h2>
            <button class="btn btn-primary" onclick="switchModule('${currentModule}')">返回</button>
        </div>
        <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">&#9888;&#65039;</div>
            <p style="color: #666; font-size: 16px;">${message}</p>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">请检查网络连接或稍后重试</p>
        </div>
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

// ==================== 模块1：生成原型 ====================

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

    const stopLoading = showLoading('生成原型中...', '&#127919;');

    try {
        const response = await API.generatePrototype(requirement, '新原型');
        stopLoading();
        finishLoading();

        if (response.success) {
            const html = extractHtml(response.html);
            showPrototypeResults(html, requirement);
        } else {
            showError('原型生成失败', response.message || '未知错误');
        }
    } catch (error) {
        stopLoading();
        showError('原型生成失败', error.message || '网络请求失败');
    }
}

function showPrototypeResults(html, requirement) {
    const container = document.getElementById('results-container');
    const safeHtml = safeSrcdoc(html);

    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">&#127919; 原型生成成功</h2>
            <button class="btn btn-primary" onclick="switchModule('prototype')">返回</button>
        </div>
        <div style="padding: 16px 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
            <strong>你的需求：</strong>${escapeHtml(requirement)}
        </div>
        ${html ? `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">原型预览</h3>
            <div style="border: 2px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <iframe srcdoc="${safeHtml}" style="width: 100%; height: 600px; border: none;"></iframe>
            </div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: center; padding: 20px;">
            <button class="btn btn-primary" onclick="openPrototypeFullscreen()">全屏预览</button>
            <button class="btn" style="background: #f0f0f0; padding: 10px 24px; border-radius: 8px; cursor: pointer;" onclick="downloadPrototypeHtml()">下载HTML</button>
        </div>
        ` : '<div style="padding: 40px; text-align: center; color: #999;">未生成有效的原型内容</div>'}
    `;

    // 保存到全局方便下载/全屏
    window._lastPrototypeHtml = html;

    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

function openPrototypeFullscreen() {
    if (window._lastPrototypeHtml) {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(window._lastPrototypeHtml);
        newWindow.document.close();
    }
}

function downloadPrototypeHtml() {
    if (window._lastPrototypeHtml) {
        const blob = new Blob([window._lastPrototypeHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prototype.html';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ==================== 模块2：数据分析 ====================

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
                <div style="font-weight: 600; color: #333;">${escapeHtml(file.name)}</div>
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

    const stopLoading = showLoading('数据分析中...', '&#128202;');

    try {
        // 将文件转换为Base64
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

        const response = await API.analyzeData(filesWithData, '数据分析');
        stopLoading();
        finishLoading();

        if (response.success) {
            showDataResults(response.analysis || {});
        } else {
            showError('数据分析失败', response.message || '未知错误');
        }
    } catch (error) {
        stopLoading();
        showError('数据分析失败', error.message || '网络请求失败');
    }
}

function showDataResults(analysis) {
    const container = document.getElementById('results-container');
    const insights = analysis.insights || [];
    const summary = analysis.summary || {};
    const recommendations = analysis.recommendations || [];
    const quality = analysis.quality || {};
    const rawText = analysis.raw || '';

    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">&#128202; 分析完成</h2>
            <button class="btn btn-primary" onclick="switchModule('data')">返回</button>
        </div>

        ${summary.totalRows ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${summary.totalSheets || '-'}</div>
                <div style="font-size: 13px; opacity: 0.9;">工作表</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${summary.totalRows || '-'}</div>
                <div style="font-size: 13px; opacity: 0.9;">数据行</div>
            </div>
            <div style="background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${quality.anomalies || 0}</div>
                <div style="font-size: 13px; opacity: 0.9;">异常值</div>
            </div>
        </div>
        ` : ''}

        ${insights.length > 0 ? `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h3 style="margin-bottom: 16px;">&#128161; 关键洞察</h3>
            ${insights.map(insight => `
                <div style="background: rgba(255,255,255,0.15); padding: 14px; border-radius: 8px; margin-bottom: 10px;">
                    <strong>${escapeHtml(insight.type || '洞察')}：</strong>${escapeHtml(insight.description || '')}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${recommendations.length > 0 ? `
        <div style="background: #f8f9fa; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h3 style="margin-bottom: 16px;">&#128640; 业务建议</h3>
            ${recommendations.map((rec, i) => `
                <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
                    <strong>${i + 1}.</strong> ${escapeHtml(typeof rec === 'string' ? rec : rec.description || '')}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${rawText ? `
        <div style="background: #f8f9fa; padding: 24px; border-radius: 12px;">
            <h3 style="margin-bottom: 16px;">&#128203; 分析详情</h3>
            <div style="white-space: pre-wrap; font-size: 14px; color: #444; line-height: 1.6;">${escapeHtml(rawText)}</div>
        </div>
        ` : ''}

        ${!insights.length && !recommendations.length && !rawText ? `
        <div style="padding: 40px; text-align: center; color: #999;">
            <p>分析完成，但未识别到结构化数据</p>
        </div>
        ` : ''}
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

// ==================== 模块3：代码审查 ====================

async function startCodeReview() {
    const code = document.getElementById('code-input').value.trim();
    if (!code) {
        alert('请输入代码');
        return;
    }
    if (code.length < 10) {
        alert('代码内容太短，请输入更多代码');
        return;
    }

    const stopLoading = showLoading('代码审查中...', '&#128269;');

    try {
        const response = await API.reviewCode(code, '代码审查');
        stopLoading();
        finishLoading();

        if (response.success) {
            showCodeResults(response.review || {});
        } else {
            showError('代码审查失败', response.message || '未知错误');
        }
    } catch (error) {
        stopLoading();
        showError('代码审查失败', error.message || '网络请求失败');
    }
}

function showCodeResults(review) {
    const container = document.getElementById('results-container');
    const summary = review.summary || {};
    const issues = review.issues || [];
    const rawText = review.raw || '';

    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">&#128269; 审查完成</h2>
            <button class="btn btn-primary" onclick="switchModule('code')">返回</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${summary.totalIssues || issues.length || 0}</div>
                <div style="font-size: 13px; opacity: 0.9;">发现问题</div>
            </div>
            <div style="background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${summary.critical || 0}</div>
                <div style="font-size: 13px; opacity: 0.9;">严重</div>
            </div>
            <div style="background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${summary.warning || 0}</div>
                <div style="font-size: 13px; opacity: 0.9;">警告</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                <div style="font-size: 28px; font-weight: bold;">${summary.info || 0}</div>
                <div style="font-size: 13px; opacity: 0.9;">建议</div>
            </div>
        </div>

        ${issues.length > 0 ? issues.map(issue => `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid ${getSeverityColor(issue.severity)}; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>${escapeHtml(issue.title || '问题')}</strong>
                    <span style="background: ${getSeverityColor(issue.severity)}; color: white; padding: 3px 10px; border-radius: 6px; font-size: 12px;">${getSeverityText(issue.severity)}</span>
                </div>
                <p style="color: #666; margin-bottom: 10px; line-height: 1.5;">${escapeHtml(issue.description || '')}</p>
                ${issue.suggestion ? `
                <div style="background: white; padding: 12px; border-radius: 8px; font-size: 13px; color: #333; border: 1px solid #e0e0e0;">
                    <strong>建议：</strong>${escapeHtml(issue.suggestion)}
                </div>
                ` : ''}
            </div>
        `).join('') : ''}

        ${rawText ? `
        <div style="background: #f8f9fa; padding: 24px; border-radius: 12px;">
            <h3 style="margin-bottom: 16px;">审查详情</h3>
            <div style="white-space: pre-wrap; font-size: 14px; color: #444; line-height: 1.6;">${escapeHtml(rawText)}</div>
        </div>
        ` : ''}

        ${!issues.length && !rawText ? `
        <div style="padding: 40px; text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 10px;">&#9989;</div>
            <p>代码质量良好，未发现明显问题</p>
        </div>
        ` : ''}
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

// ==================== 模块4：设计生成 ====================

async function generateDesign() {
    const requirement = document.getElementById('design-input').value.trim();
    if (!requirement) {
        alert('请输入设计需求');
        return;
    }
    if (requirement.length < 10) {
        alert('设计需求描述太短，请提供更多信息（至少10个字符）');
        return;
    }

    const stopLoading = showLoading('设计生成中...', '&#127912;');

    try {
        const response = await API.generateDesign(requirement, '新设计', {});
        stopLoading();
        finishLoading();

        if (response.success) {
            showDesignResults(response.designs || [], requirement);
        } else {
            showError('设计生成失败', response.message || '未知错误');
        }
    } catch (error) {
        stopLoading();
        showError('设计生成失败', error.message || '网络请求失败');
    }
}

function showDesignResults(designs, requirement) {
    const container = document.getElementById('results-container');

    // 保存设计数据到全局
    window._lastDesigns = designs;

    if (!designs || designs.length === 0) {
        container.innerHTML = `
            <div class="results-header">
                <h2 class="results-title">&#127912; 设计生成</h2>
                <button class="btn btn-primary" onclick="switchModule('design')">返回</button>
            </div>
            <div style="padding: 40px; text-align: center; color: #999;">
                未生成有效的设计方案，请尝试提供更详细的需求描述
            </div>
        `;
        document.getElementById('processing-page').classList.add('hidden');
        container.classList.remove('hidden');
        return;
    }

    container.innerHTML = `
        <div class="results-header">
            <h2 class="results-title">&#127912; 设计方案 (${designs.length}个)</h2>
            <button class="btn btn-primary" onclick="switchModule('design')">返回</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px;">
            ${designs.map((design, index) => {
                const designHtml = extractHtml(design.html || '');
                const safeHtml = safeSrcdoc(designHtml);
                return `
                <div style="background: white; border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                    <div style="width: 100%; height: 280px; background: #f8f9fa; overflow: hidden;">
                        ${designHtml ? `<iframe srcdoc="${safeHtml}" style="width: 100%; height: 100%; border: none; pointer-events: none;"></iframe>` : '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">设计预览</div>'}
                    </div>
                    <div style="padding: 16px;">
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${escapeHtml(design.title || '方案 ' + (index + 1))}</div>
                        ${design.description ? `<div style="color: #666; font-size: 13px; margin-bottom: 12px; line-height: 1.4;">${escapeHtml(design.description)}</div>` : ''}
                        ${design.compliant ? '<div style="background: #51cf66; color: white; padding: 3px 10px; border-radius: 6px; font-size: 12px; display: inline-block; margin-bottom: 12px;">&#10003; 符合品牌规范</div>' : ''}
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            ${designHtml ? `<button class="btn btn-primary" style="flex: 1; padding: 8px; font-size: 13px;" onclick="viewDesignFullscreen(${index})">全屏查看</button>` : ''}
                            ${designHtml ? `<button class="btn" style="flex: 1; padding: 8px; font-size: 13px; background: #f0f0f0; border-radius: 8px; cursor: pointer;" onclick="downloadDesignHtml(${index})">导出HTML</button>` : ''}
                        </div>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
    document.getElementById('processing-page').classList.add('hidden');
    container.classList.remove('hidden');
}

function viewDesignFullscreen(index) {
    const designs = window._lastDesigns;
    if (designs && designs[index]) {
        const html = extractHtml(designs[index].html || '');
        const newWindow = window.open('', '_blank');
        newWindow.document.write(html);
        newWindow.document.close();
    }
}

function downloadDesignHtml(index) {
    const designs = window._lastDesigns;
    if (designs && designs[index]) {
        const html = extractHtml(designs[index].html || '');
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-${index + 1}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ==================== 文件拖拽 ====================

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

// ==================== 通用工具 ====================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 页面初始化 ====================

window.addEventListener('DOMContentLoaded', () => {
    // 简单的健康检查
    API.healthCheck().then(data => {
        console.log('API服务正常:', data);
    }).catch(err => {
        console.warn('API服务检查失败:', err.message);
    });
});

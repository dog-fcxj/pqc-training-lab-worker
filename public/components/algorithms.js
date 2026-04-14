import { algorithms, keySizeComparison } from '../data.js';

export function renderAlgorithms(container) {
    let activeAlgoId = algorithms[0].id;
    let animationVersion = 0;
    let isPlaying = false;
    
    // 初始 Toy 数据副本，用于随机化逻辑
    let currentToy = null;
    const mlKem = algorithms.find(a => a.id === 'ml-kem');
    if (mlKem && mlKem.toyExample) {
        currentToy = JSON.parse(JSON.stringify(mlKem.toyExample));
    }

    function update() {
        const algo = algorithms.find(a => a.id === activeAlgoId);
        animationVersion++; // 切换 tab 或更新时增加版本号，中断旧动画
        isPlaying = false;
        
        container.innerHTML = `
            <style>
                .algo-lab {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    margin-top: 1rem;
                }
                .tabs {
                    display: flex;
                    gap: 1rem;
                    border-bottom: 1px solid var(--glass-border);
                    padding-bottom: 0.5rem;
                }
                .tab {
                    padding: 0.5rem 1.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-dim);
                    border-radius: 0.5rem 0.5rem 0 0;
                    transition: all 0.3s;
                    border-bottom: 3px solid transparent;
                }
                .tab.active {
                    color: #fff;
                    border-bottom-color: var(--active-color);
                    background: rgba(255,255,255,0.05);
                }
                .detail-panel {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(340px, 0.95fr);
                    gap: 2rem;
                    align-items: start;
                }
                .info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .spec-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .spec-table th, .spec-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid var(--glass-border);
                }
                .spec-table th { color: var(--text-dim); font-weight: normal; }
                
                .path-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    position: relative;
                    padding-left: 3.25rem;
                }
                .path-steps::before {
                    content: '';
                    position: absolute;
                    left: 0.75rem;
                    top: 10px;
                    bottom: 10px;
                    width: 2px;
                    background: var(--glass-border);
                }
                .step-item {
                    position: relative;
                    min-width: 0;
                }
                .step-circle {
                    position: absolute;
                    left: 0;
                    top: 1rem;
                    width: 24px;
                    height: 24px;
                    background: var(--active-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 1;
                    transform: translateX(-50%);
                }
                .step-content {
                    background: rgba(255,255,255,0.03);
                    padding: 1rem 1rem 1rem 1.25rem;
                    border-radius: 0.5rem;
                    margin-left: 0.75rem;
                }
                .step-label { font-weight: bold; display: block; margin-bottom: 0.25rem; }
                .step-detail { font-size: 0.85rem; color: var(--text-dim); }

                .toy-playground {
                    grid-column: span 2;
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px dashed var(--accent-cyan);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin-top: 1rem;
                }
                .toy-grid {
                    display: grid;
                    grid-template-columns: auto auto auto auto auto;
                    align-items: center;
                    gap: 1.5rem;
                    font-family: 'JetBrains Mono', monospace;
                }
                .matrix-box {
                    background: rgba(0,0,0,0.3);
                    padding: 1rem;
                    border-radius: 4px;
                    border: 1px solid var(--glass-border);
                }
                .matrix-row { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; transition: background 0.3s; }
                .matrix-cell { width: 30px; text-align: center; }
                .matrix-cell.highlight { color: var(--accent-cyan); font-weight: bold; }
                .matrix-row.active { background: rgba(34, 211, 238, 0.2); border-radius: 2px; }
                .matrix-row.done { opacity: 0.5; }
                
                .log-panel {
                    margin-top: 1.5rem;
                    background: rgba(0,0,0,0.4);
                    border-radius: 0.5rem;
                    padding: 1rem;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.85rem;
                    color: var(--text-dim);
                    min-height: 120px;
                    border: 1px solid var(--glass-border);
                }
                .log-line { margin-bottom: 0.4rem; border-left: 2px solid var(--accent-cyan); padding-left: 0.75rem; animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }

                .comparison-chart {
                    background: var(--glass-bg);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    margin-top: 2rem;
                }
                .chart-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                }
                .chart-label { width: 120px; font-size: 0.8rem; }
                .chart-bar-container { flex: 1; height: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; }
                .chart-bar { height: 100%; transition: width 1s ease-out; }
                .chart-value { width: 60px; font-size: 0.75rem; color: var(--text-dim); text-align: right; }

                @media (max-width: 900px) {
                    .detail-panel { grid-template-columns: 1fr; }
                    .toy-playground { grid-column: span 1; }
                }
            </style>
            
            <div class="algo-lab" style="--active-color: ${algo.color}">
                <div class="tabs">
                    ${algorithms.map(a => `
                        <div class="tab ${a.id === activeAlgoId ? 'active' : ''}" data-id="${a.id}">
                            ${a.name}
                        </div>
                    `).join('')}
                </div>

                <div class="detail-panel">
                    <div class="info-section">
                        <div class="card-corners" style="padding: 1.5rem; background: var(--glass-bg); border: 1px solid var(--glass-border);">
                            <h3 style="margin-top:0">${algo.name} 详情</h3>
                            <p style="font-size: 0.9rem; color: var(--text-dim)">${algo.detail}</p>
                            <div style="margin-top: 1rem; font-size: 0.85rem;">
                                <div><strong>标准:</strong> ${algo.standard} (${algo.standardDate})</div>
                                <div style="margin-top: 0.5rem"><strong>数学基础:</strong> ${algo.math}</div>
                            </div>
                        </div>

                        <table class="spec-table">
                            <thead>
                                <tr><th>参数级别</th><th>公钥 (pk)</th><th>密文/签名</th><th>安全性</th></tr>
                            </thead>
                            <tbody>
                                ${algo.params.map(p => `
                                    <tr>
                                        <td>${p.level}</td>
                                        <td>${p.pk}B</td>
                                        <td>${p.ct || p.sig}B</td>
                                        <td>${p.security}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div class="interfaces">
                            <h4 style="margin: 1rem 0 0.5rem 0">接口签名</h4>
                            ${algo.interfaces.map(i => `<div style="font-family: 'JetBrains Mono'; font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 0.25rem;">${i}</div>`).join('')}
                        </div>
                    </div>

                    <div class="path-steps">
                        ${algo.pathSteps.map(s => `
                            <div class="step-item">
                                <div class="step-circle">${s.step}</div>
                                <div class="step-content">
                                    <span class="step-label">${s.label}</span>
                                    <span class="step-detail">${s.detail}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    ${activeAlgoId === 'ml-kem' && currentToy ? renderToyPlayground(currentToy) : ''}
                </div>

                <div class="comparison-chart card-corners">
                    <h4 style="margin-top: 0">密钥与载荷大小对比 (Bytes)</h4>
                    ${keySizeComparison.map(c => {
                        const val = c.pk + (c.ct || c.sig || 0);
                        const max = 18000; // Adjust max for SLH-DSA visibility
                        const width = Math.min((val / max) * 100, 100);
                        return `
                            <div class="chart-row">
                                <div class="chart-label">${c.algorithm}</div>
                                <div class="chart-bar-container">
                                    <div class="chart-bar" style="width: ${width}%; background: ${c.type === 'pqc' ? 'var(--accent-cyan)' : 'var(--text-dim)'}"></div>
                                </div>
                                <div class="chart-value">${val}B</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        setupListeners();
    }

    function renderToyPlayground(toy) {
        return `
            <div class="toy-playground">
                <h4 style="margin-top:0; color: var(--accent-cyan)">Toy LWE 游乐场: b = A·s + e mod ${toy.q}</h4>
                <p style="font-size: 0.85rem; margin-bottom: 1.5rem">${toy.description}</p>
                <div class="toy-grid">
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">矩阵 A</div>
                        ${toy.A.map((row, r) => `
                            <div class="matrix-row toy-a-row" data-row="${r}">
                                ${row.map(cell => `<div class="matrix-cell">${cell}</div>`).join('')}
                            </div>
                        `).join('')}
                    </div>
                    <div style="font-size: 1.5rem">×</div>
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">向量 s</div>
                        ${toy.s.map((cell, i) => `<div class="matrix-row toy-s-cell" data-index="${i}"><div class="matrix-cell">${cell}</div></div>`).join('')}
                    </div>
                    <div style="font-size: 1.5rem">+</div>
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">误差 e</div>
                        ${toy.e.map((cell, i) => `<div class="matrix-row toy-e-cell" data-index="${i}"><div class="matrix-cell">${cell}</div></div>`).join('')}
                    </div>
                    <div style="font-size: 1.5rem">=</div>
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">结果 b</div>
                        ${toy.b.map((cell, i) => `<div class="matrix-row toy-b-cell" data-index="${i}"><div class="matrix-cell result-cell">${cell}</div></div>`).join('')}
                    </div>
                </div>
                
                <div id="toy-log" class="log-panel">
                    <div style="color: var(--text-dim); opacity: 0.5 italic">点击"开始计算"观察 LWE 构造过程...</div>
                </div>

                <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem">
                    <button id="toy-calc-btn" class="code-btn" style="background: var(--accent-cyan); color: black; font-weight: bold; padding: 8px 20px;">开始计算</button>
                    <button id="toy-random-btn" class="code-btn" style="border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 8px 20px;">随机化</button>
                </div>
            </div>
        `;
    }

    function setupListeners() {
        container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                activeAlgoId = tab.dataset.id;
                update();
            });
        });

        const calcBtn = container.querySelector('#toy-calc-btn');
        const randomBtn = container.querySelector('#toy-random-btn');
        const logPanel = container.querySelector('#toy-log');
        
        if (calcBtn && currentToy) {
            calcBtn.addEventListener('click', async () => {
                if (isPlaying) return;
                
                isPlaying = true;
                calcBtn.disabled = true;
                calcBtn.style.opacity = '0.5';
                const currentVersion = animationVersion;

                logPanel.innerHTML = '';
                
                // 重置样式
                container.querySelectorAll('.matrix-row').forEach(r => r.classList.remove('active', 'done'));
                container.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('highlight'));

                for (let i = 0; i < 4; i++) {
                    if (currentVersion !== animationVersion) return;

                    // 高亮当前行和向量
                    const aRow = container.querySelector(`.toy-a-row[data-row="${i}"]`);
                    const sCells = container.querySelectorAll('.toy-s-cell');
                    const eCell = container.querySelector(`.toy-e-cell[data-index="${i}"]`);
                    const bCell = container.querySelector(`.toy-b-cell[data-index="${i}"]`);

                    aRow.classList.add('active');
                    sCells.forEach(s => s.classList.add('active'));
                    eCell.classList.add('active');
                    
                    const rowData = currentToy.A[i];
                    const sData = currentToy.s;
                    const eVal = currentToy.e[i];
                    const prod = rowData.reduce((acc, val, idx) => acc + val * sData[idx], 0);
                    const bVal = currentToy.b[i];

                    const logLine = document.createElement('div');
                    logLine.className = 'log-line';
                    logLine.innerHTML = `A[${i}]·s = ${rowData.map((v,idx)=>`${v}×${sData[idx]}`).join(' + ')} = ${prod} → ${prod} mod ${currentToy.q} = ${prod % currentToy.q} → +e[${i}](${eVal}) → b[${i}] = ${bVal}`;
                    logPanel.appendChild(logLine);
                    logPanel.scrollTop = logPanel.scrollHeight;

                    await new Promise(r => setTimeout(r, 800));
                    if (currentVersion !== animationVersion) return;

                    aRow.classList.remove('active');
                    aRow.classList.add('done');
                    sCells.forEach(s => s.classList.remove('active'));
                    eCell.classList.remove('active');
                    eCell.classList.add('done');
                    bCell.querySelector('.result-cell').classList.add('highlight');
                }

                if (currentVersion === animationVersion) {
                    const finalLine = document.createElement('div');
                    finalLine.className = 'log-line';
                    finalLine.style.borderColor = 'var(--active-color)';
                    finalLine.style.marginTop = '0.5rem';
                    finalLine.innerHTML = `<strong>计算完成:</strong> b = [${currentToy.b.join(', ')}]，最终公钥 pk = (A, b)`;
                    logPanel.appendChild(finalLine);
                    
                    isPlaying = false;
                    calcBtn.disabled = false;
                    calcBtn.style.opacity = '1';
                    calcBtn.innerText = '重新播放';
                }
            });
        }

        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                animationVersion++; // 中断正在播放的动画
                isPlaying = false;
                
                // 随机化 s (0-4) 和 e (-2 到 2)
                currentToy.s = currentToy.s.map(() => Math.floor(Math.random() * 5));
                currentToy.e = currentToy.e.map(() => Math.floor(Math.random() * 5) - 2);
                
                // 重算 b
                currentToy.b = currentToy.A.map((row, i) => {
                    const prod = row.reduce((acc, val, idx) => acc + val * currentToy.s[idx], 0);
                    let res = (prod + currentToy.e[i]) % currentToy.q;
                    if (res < 0) res += currentToy.q;
                    return res;
                });

                // 更新界面
                update();
            });
        }
    }

    update();
}


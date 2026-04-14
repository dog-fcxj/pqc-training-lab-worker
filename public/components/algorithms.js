import { algorithms, keySizeComparison } from '../data.js';

export function renderAlgorithms(container) {
    let activeAlgoId = algorithms[0].id;

    function update() {
        const algo = algorithms.find(a => a.id === activeAlgoId);
        
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
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
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
                    padding-left: 2rem;
                }
                .path-steps::before {
                    content: '';
                    position: absolute;
                    left: 9px;
                    top: 10px;
                    bottom: 10px;
                    width: 2px;
                    background: var(--glass-border);
                }
                .step-item {
                    position: relative;
                }
                .step-circle {
                    position: absolute;
                    left: -2rem;
                    width: 20px;
                    height: 20px;
                    background: var(--active-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                    z-index: 1;
                }
                .step-content {
                    background: rgba(255,255,255,0.03);
                    padding: 1rem;
                    border-radius: 0.5rem;
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
                .matrix-row { display: flex; gap: 0.5rem; margin-bottom: 0.25rem; }
                .matrix-cell { width: 30px; text-align: center; }
                .matrix-cell.highlight { color: var(--accent-cyan); font-weight: bold; background: rgba(34, 211, 238, 0.2); }
                
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

                    ${activeAlgoId === 'ml-kem' ? renderToyPlayground(algo.toyExample) : ''}
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
                            <div class="matrix-row" data-row="${r}">
                                ${row.map(cell => `<div class="matrix-cell">${cell}</div>`).join('')}
                            </div>
                        `).join('')}
                    </div>
                    <div style="font-size: 1.5rem">×</div>
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">向量 s</div>
                        ${toy.s.map(cell => `<div class="matrix-row"><div class="matrix-cell">${cell}</div></div>`).join('')}
                    </div>
                    <div style="font-size: 1.5rem">+</div>
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">误差 e</div>
                        ${toy.e.map(cell => `<div class="matrix-row"><div class="matrix-cell">${cell}</div></div>`).join('')}
                    </div>
                    <div style="font-size: 1.5rem">=</div>
                    <div class="matrix-box">
                        <div style="font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.5rem">结果 b</div>
                        ${toy.b.map(cell => `<div class="matrix-row"><div class="matrix-cell result-cell">${cell}</div></div>`).join('')}
                    </div>
                </div>
                <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem">
                    <button id="toy-calc-btn" class="code-btn" style="background: var(--accent-cyan); color: black; font-weight: bold; padding: 8px 20px;">分步计算</button>
                    <span id="toy-step-msg" style="font-size: 0.85rem; color: var(--accent-cyan)"></span>
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
        if (calcBtn) {
            let step = -1;
            const rows = container.querySelectorAll('.matrix-row[data-row]');
            const resultCells = container.querySelectorAll('.result-cell');
            const msg = container.querySelector('#toy-step-msg');
            
            calcBtn.addEventListener('click', () => {
                step = (step + 1) % 4;
                rows.forEach(r => r.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('highlight')));
                resultCells.forEach(c => c.classList.remove('highlight'));
                
                const activeRow = container.querySelector(`.matrix-row[data-row="${step}"]`);
                activeRow.querySelectorAll('.matrix-cell').forEach(c => c.classList.add('highlight'));
                resultCells[step].classList.add('highlight');
                
                const rowData = algorithms.find(a => a.id === 'ml-kem').toyExample.A[step];
                const sData = algorithms.find(a => a.id === 'ml-kem').toyExample.s;
                const eVal = algorithms.find(a => a.id === 'ml-kem').toyExample.e[step];
                const res = algorithms.find(a => a.id === 'ml-kem').toyExample.b[step];
                
                msg.innerText = `第 ${step+1} 行: (${rowData.join('×')}) · (${sData.join('×')}) + (${eVal}) ≡ ${res} (mod 23)`;
            });
        }
    }

    update();
}

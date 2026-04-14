import { algorithms, keySizeComparison } from '../data.js';
import { toyMLKEM, toyMLDSA, toySLHDSA, toyHQC } from './crypto-demos.js';

export function renderAlgorithms(container) {
    let activeAlgoId = algorithms[0].id;
    
    // 演示状态存储
    const demoStates = {
        'ml-kem': { step: 'keygen', pk: null, sk: null, ct: null, sharedSecret: null, result: null },
        'ml-dsa': { step: 'keygen', pk: null, sk: null, sig: null, message: 'hello', result: null, attempts: 0 },
        'slh-dsa': { step: 'keygen', pk: null, sk: null, sig: null, leafIndex: 0, result: null, treeStructure: null },
        'hqc': { step: 'keygen', pk: null, sk: null, ct: null, sharedSecret: null, result: null }
    };

    const delay = ms => new Promise(res => setTimeout(res, ms));

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

                /* Demo Panel Styles */
                .demo-panel {
                    grid-column: span 2;
                    background: rgba(var(--active-rgb), 0.05);
                    border: 1px dashed rgba(var(--active-rgb), 0.3);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin-top: 1rem;
                }
                .demo-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }
                .demo-run-btn {
                    background: var(--active-color);
                    color: black;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .demo-run-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .demo-run-btn:active { transform: translateY(0); }
                .demo-run-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .demo-reset-btn {
                    background: transparent;
                    color: #fff;
                    border: 1px solid var(--glass-border);
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.3s;
                }
                .demo-reset-btn:hover { background: rgba(255,255,255,0.05); }

                /* Pipeline Styles */
                .pipeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }
                .pipeline-stage {
                    background: rgba(0,0,0,0.2);
                    border-radius: 0.75rem;
                    padding: 1.25rem;
                    border: 1px solid rgba(var(--active-rgb), 0.2);
                    display: none;
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fadeSlideIn 0.5s ease-out forwards;
                    display: block !important;
                }
                .stage-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    color: var(--active-color);
                }
                .stage-number {
                    width: 24px;
                    height: 24px;
                    background: var(--active-color);
                    color: black;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                .stage-name { font-weight: bold; font-size: 1.05rem; }
                .stage-body { display: flex; flex-direction: column; gap: 0.75rem; }
                .stage-input { font-size: 0.75rem; color: #fbbf24; }
                .stage-computation {
                    font-family: 'JetBrains Mono', monospace;
                    background: rgba(0,0,0,0.3);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    color: #e5e7eb;
                }
                .stage-output { font-size: 0.75rem; color: #10b981; }
                .flow-arrow { color: var(--active-color); font-weight: bold; }
                .pipeline-connector {
                    text-align: center;
                    color: var(--active-color);
                    font-size: 0.85rem;
                    padding: 0.5rem 0;
                    font-weight: bold;
                    display: none;
                }

                .demo-input-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.05);
                    padding: 0.4rem 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid var(--glass-border);
                }
                .demo-input-group label { font-size: 0.8rem; color: var(--text-dim); }
                .demo-input-group input, .demo-input-group select {
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 0.85rem;
                    outline: none;
                }
                .demo-input-group input { width: 100px; }

                /* Toy Disclaimer */
                .toy-disclaimer {
                    margin-bottom: 1rem;
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    border-radius: 0.5rem;
                    overflow: hidden;
                    font-size: 0.85rem;
                }
                .toy-disclaimer-header {
                    background: rgba(251, 191, 36, 0.1);
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #fbbf24;
                    font-weight: bold;
                }
                .toy-disclaimer-content {
                    padding: 1rem;
                    background: rgba(0, 0, 0, 0.2);
                    color: var(--text-dim);
                    display: none;
                }
                .toy-disclaimer.open .toy-disclaimer-content { display: block; }

                /* Complexity Table */
                .complexity-section {
                    background: var(--glass-bg);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    margin-top: 2rem;
                }
                .complexity-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                }
                .complexity-table th, .complexity-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid var(--glass-border);
                }
                .complexity-table th { color: var(--text-dim); }
                .complexity-table tr.classic { background: rgba(255,255,255,0.03); }
                .bottleneck { 
                    padding: 0.2rem 0.5rem; 
                    border-radius: 4px; 
                    font-size: 0.75rem; 
                }
                .toy-mapping { font-size: 0.7rem; color: var(--text-dim); font-style: italic; display: block; margin-top: 2px; }

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
                    .demo-panel { grid-column: span 1; }
                }
            </style>
            
            <div class="algo-lab" style="--active-color: ${algo.color}; --active-rgb: ${hexToRgb(algo.color)}">
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
                            ${algo.interfaces.map(i => `<div style="font-family: 'JetBrains Mono'; font-size: 0.8rem; color: var(--active-color); margin-bottom: 0.25rem;">${i}</div>`).join('')}
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

                    ${renderDemoPanel(activeAlgoId)}
                </div>

                <div class="complexity-section card-corners">
                    <h4 style="margin-top: 0">计算复杂度对比（代表性参数集）</h4>
                    <table class="complexity-table">
                        <thead>
                            <tr>
                                <th>算法</th><th>参数</th><th>KeyGen</th><th>Encaps/Sign</th><th>Decaps/Verify</th><th>瓶颈</th><th>Toy 对应</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ML-KEM-768</td>
                                <td>n=256,k=3,q=3329</td>
                                <td>O(k²·n log n)</td>
                                <td>O(12次多项式乘)</td>
                                <td>O(3次相位恢复)</td>
                                <td><span class="bottleneck" style="background: rgba(34, 211, 238, 0.2); color: #22d3ee">NTT 变换</span></td>
                                <td><span class="toy-mapping">b = As + e</span></td>
                            </tr>
                            <tr>
                                <td>ML-DSA-65</td>
                                <td>n=256,l=5,k=6,q=8.3M</td>
                                <td>O(k·l·n log n)</td>
                                <td>O(30次) × 重试</td>
                                <td>O(30次)</td>
                                <td><span class="bottleneck" style="background: rgba(239, 68, 68, 0.2); color: #f87171">拒绝采样</span></td>
                                <td><span class="toy-mapping">z = y + c·s1</span></td>
                            </tr>
                            <tr>
                                <td>SLH-DSA-128f</td>
                                <td>n=16B,h=66,d=22</td>
                                <td>O(d·2^(h/d)·n)</td>
                                <td>O(33棵FORS+22层)</td>
                                <td>O(重建+22层)</td>
                                <td><span class="bottleneck" style="background: rgba(167, 139, 250, 0.2); color: #a78bfa">哈希调用量</span></td>
                                <td><span class="toy-mapping">authPath</span></td>
                            </tr>
                            <tr>
                                <td>HQC-128</td>
                                <td>n=17669,w=66</td>
                                <td>O(n·w) 稀疏多项式</td>
                                <td>O(n·wr + 编码)</td>
                                <td>O(n·wr + 解码)</td>
                                <td><span class="bottleneck" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24">长二元多项式</span></td>
                                <td><span class="toy-mapping">H · ctᵀ</span></td>
                            </tr>
                            <tr class="classic">
                                <td style="color: var(--text-dim)">RSA-2048</td>
                                <td>2048-bit</td>
                                <td>O(n⁴) 素数生成</td>
                                <td>O(n³) 模幂</td>
                                <td>O(n²) 小指数</td>
                                <td><span class="bottleneck" style="background: rgba(255,255,255,0.1); color: #ccc">大整数模幂</span></td>
                                <td><span class="toy-mapping">无 Toy</span></td>
                            </tr>
                            <tr class="classic">
                                <td style="color: var(--text-dim)">ECDSA-P256</td>
                                <td>2^256</td>
                                <td>O(1) 标量乘</td>
                                <td>O(1) 标量乘+模逆</td>
                                <td>O(1) 2次标量乘</td>
                                <td><span class="bottleneck" style="background: rgba(255,255,255,0.1); color: #ccc">曲线标量乘</span></td>
                                <td><span class="toy-mapping">无 Toy</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="comparison-chart card-corners">
                    <h4 style="margin-top: 0">密钥与载荷大小对比 (Bytes)</h4>
                    ${keySizeComparison.map(c => {
                        const val = c.pk + (c.ct || c.sig || 0);
                        const max = 18000;
                        const width = Math.min((val / max) * 100, 100);
                        return `
                            <div class="chart-row">
                                <div class="chart-label">${c.algorithm}</div>
                                <div class="chart-bar-container">
                                    <div class="chart-bar" style="width: ${width}%; background: ${c.type === 'pqc' ? 'var(--active-color)' : 'var(--text-dim)'}"></div>
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

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }

    function renderDemoPanel(id) {
        const state = demoStates[id];
        const algo = algorithms.find(a => a.id === id);
        
        const toyDisclaimers = {
            'ml-kem': '这是用于课堂直觉的 Toy 流程：把真实 ML-KEM 里的 256 阶多项式向量、NTT、压缩和 FO 一致性检查，压缩成 4 维整数向量与 1 bit 教学消息演示。',
            'ml-dsa': 'Toy 声明：简化了 ML-DSA 的拒绝采样逻辑和多项式维度，仅展示基于格的签名与拒绝采样的直观逻辑。',
            'slh-dsa': 'Toy 声明：将 SLH-DSA 的多层树结构简化为单层 Merkle Tree，展示基于哈希的签名与认证路径原理。',
            'hqc': 'Toy 声明：简化了 HQC 的码字长度和纠错过程，使用 Hamming 编码展示基于纠错码的加密逻辑。'
        };

        const isKEM = id === 'ml-kem' || id === 'hqc';
        const opName = isKEM ? 'Encaps 封装' : 'Sign 签名';
        const verifyName = isKEM ? 'Decaps 解封' : 'Verify 验证';

        return `
            <div class="demo-panel" style="border-color: rgba(var(--active-rgb), 0.3)">
                <h4 style="margin-top:0;">🧪 交互演示：${algo.name} 完整流程</h4>
                
                <div class="toy-disclaimer" id="toy-disclaimer">
                    <div class="toy-disclaimer-header">
                        <span>⚠️ Toy 声明 (点击展开)</span>
                        <span>▼</span>
                    </div>
                    <div class="toy-disclaimer-content">
                        ${toyDisclaimers[id]}
                    </div>
                </div>

                <div class="demo-controls">
                    <button class="demo-run-btn" id="demo-run">▶ 运行完整流程</button>
                    
                    ${id === 'ml-dsa' ? `
                        <div class="demo-input-group">
                            <label>消息:</label>
                            <input type="text" id="ml-dsa-msg" value="${escapeHtml(state.message)}">
                        </div>
                    ` : ''}
                    
                    ${id === 'slh-dsa' ? `
                        <div class="demo-input-group">
                            <label>叶子索引:</label>
                            <select id="slh-dsa-idx">
                                ${[0,1,2,3,4,5,6,7].map(i => `<option value="${i}" ${state.leafIndex === i ? 'selected' : ''}>${i}</option>`).join('')}
                            </select>
                        </div>
                    ` : ''}
                    
                    <button class="demo-reset-btn" id="demo-reset">🔄 重新生成</button>
                </div>

                <div class="pipeline" id="demo-pipeline">
                    <!-- 阶段 1: KeyGen -->
                    <div class="pipeline-stage" id="stage-0">
                        <div class="stage-header">
                            <span class="stage-number">①</span>
                            <span class="stage-name">KeyGen 密钥生成</span>
                        </div>
                        <div class="stage-body" id="stage-0-body"></div>
                    </div>
                    
                    <div class="pipeline-connector" id="connector-0">↓ pk, sk</div>
                    
                    <!-- 阶段 2: Encaps/Sign -->
                    <div class="pipeline-stage" id="stage-1">
                        <div class="stage-header">
                            <span class="stage-number">②</span>
                            <span class="stage-name">${opName}</span>
                        </div>
                        <div class="stage-body" id="stage-1-body"></div>
                    </div>
                    
                    <div class="pipeline-connector" id="connector-1">↓ ${isKEM ? 'ct' : 'sig'}</div>
                    
                    <!-- 阶段 3: Decaps/Verify -->
                    <div class="pipeline-stage" id="stage-2">
                        <div class="stage-header">
                            <span class="stage-number">③</span>
                            <span class="stage-name">${verifyName}</span>
                        </div>
                        <div class="stage-body" id="stage-2-body"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderKeyGenResult(id, result) {
        let computation = '';
        let output = '';
        
        switch(id) {
            case 'ml-kem':
                const imK = result.intermediates;
                const calcK = result.pk.b.map((v, i) => `b[${i}] = A[${i}]·s + e[${i}] = ${imK.dotProducts[i]} + e[${i}] = ${result.pk.b[i]} mod 23`).join('\n');
                computation = `A = ${JSON.stringify(result.pk.A)}\ns = ${JSON.stringify(result.sk.s)}\ne = [采样噪声]\n\n计算 b = A·s + e mod 23:\n${calcK}`;
                output = `pk = (A, b=${JSON.stringify(result.pk.b)}) → <span class="flow-arrow">传给 ② Encaps</span>\nsk = s = ${JSON.stringify(result.sk.s)} → <span class="flow-arrow">传给 ③ Decaps</span>`;
                break;
            case 'ml-dsa':
                computation = `A = ${JSON.stringify(result.pk.A)}\ns1 = ${JSON.stringify(result.sk.s1)}, s2 = ${JSON.stringify(result.sk.s2)}\n\n计算 t = A·s1 + s2 mod 23\nt = ${JSON.stringify(result.pk.t)}`;
                output = `pk = (A, t) → <span class="flow-arrow">传给 ② Sign</span>\nsk = (s1, s2) → <span class="flow-arrow">传给 ② Sign</span>`;
                break;
            case 'slh-dsa':
                computation = `构建 Merkle Tree (8个叶子)\n叶子值: ${result.treeStructure.leaves.map(l => l.value).join(', ')}\n哈希传播: Root = Hash(Layer1_Nodes)`;
                output = `pk = Root Hash = ${result.pk.root} → <span class="flow-arrow">传给 ③ Verify</span>\nsk = Tree Structure → <span class="flow-arrow">传给 ② Sign</span>`;
                break;
            case 'hqc':
                computation = `采样秘密向量 s = ${JSON.stringify(result.sk.secretVec)}\n计算 pk = sG = ${JSON.stringify(result.pk.publicVec)} mod 2`;
                output = `pk = (G, publicVec) → <span class="flow-arrow">传给 ② Encaps</span>\nsk = s → <span class="flow-arrow">传给 ③ Decaps</span>`;
                break;
        }

        return `
            <div class="stage-input">📥 输入：从随机源采样</div>
            <div class="stage-computation">${computation}</div>
            <div class="stage-output">📤 输出：${output}</div>
        `;
    }

    function renderOpResult(id, result, keyResult) {
        let computation = '';
        let output = '';
        
        switch(id) {
            case 'ml-kem':
                const imE = result.intermediates;
                computation = `采样 r=${JSON.stringify(imE.r)}, e1=[...], e2=${imE.e2}, 消息 m=${imE.m}\n\n计算 u = Aᵀ·r + e1 mod 23 = ${JSON.stringify(result.ct.u)}\n计算 v = bᵀ·r + e2 + ⌊23/2⌋×m mod 23\n  = ${imE.bDotR} + ${imE.e2} + 11×${imE.m} = ${result.ct.v} mod 23`;
                output = `ct = (u, v=${result.ct.v}) → <span class="flow-arrow">传给 ③ Decaps</span>\n共享秘密 m = ${imE.m}`;
                break;
            case 'ml-dsa':
                const imS = result.intermediates;
                let log = imS.attempts.map((a, i) => {
                    const status = a.rejected ? '❌ 拒绝' : '✅ 通过';
                    return `尝试 #${i+1}：y=${JSON.stringify(a.y)} → ||z||∞ = ${a.norm.toFixed(1)} ${status}`;
                }).join('\n');
                computation = `消息 = "${escapeHtml(demoStates[id].message)}"\n执行拒绝采样 (Rejection Sampling):\n${log}`;
                output = `sig = (z=${JSON.stringify(result.sig.z)}, c=${result.sig.c}) → <span class="flow-arrow">传给 ③ Verify</span>`;
                break;
            case 'slh-dsa':
                let pathLog = result.sig.authPath.map((p, i) => `  层 #${i}: 兄弟节点 ${p.position} = ${p.siblingHash}`).join('\n');
                computation = `选中叶子 #${demoStates[id].leafIndex} = ${result.sig.leaf}\n构建认证路径 (Auth Path):\n${pathLog}`;
                output = `sig = { leaf, authPath } → <span class="flow-arrow">传给 ③ Verify</span>`;
                break;
            case 'hqc':
                const imH = result.intermediates;
                computation = `采样消息 m = ${JSON.stringify(result.sharedSecret)}\nHamming 编码: codeword = ${JSON.stringify(imH.originalCodeword)}\n注入噪声: 翻转第 ${imH.errorPosition + 1} 位`;
                output = `ct = ${JSON.stringify(result.ct.noisyCodeword)} → <span class="flow-arrow">传给 ③ Decaps</span>\n共享秘密 m = ${result.sharedSecret}`;
                break;
        }

        return `
            <div class="stage-input">📥 输入：pk 来自 ① KeyGen</div>
            <div class="stage-computation">${computation}</div>
            <div class="stage-output">📤 输出：${output}</div>
        `;
    }

    function renderVerifyResult(id, result, opResult) {
        let computation = '';
        let output = '';
        
        switch(id) {
            case 'ml-kem':
                const imD = result.intermediates;
                computation = `计算 sᵀ·u = ${imD.sDotU} mod 23\n计算 phase = v - sᵀ·u = ${opResult.ct.v} - ${imD.sDotU} = ${imD.phase} mod 23\n\n距离判断：\n  距离 0: ${imD.distTo0}, 距离 11: ${imD.distToHalf}\n  PP 更接近 11 → 恢复 m = ${result.recoveredSecret}`;
                output = `结果：恢复秘密 = ${result.recoveredSecret} ${result.match ? '✅ 匹配成功' : '❌ 失败'}`;
                break;
            case 'ml-dsa':
                computation = `计算 w' = Az - tc mod 23\n计算 c' = H(w', message) = ${opResult.sig.c}`;
                output = `验证结果: ${result.valid ? '✅ 有效签名' : '❌ 无效'}`;
                break;
            case 'slh-dsa':
                computation = `从叶子值开始逐层合并哈希...\n计算出的根: ${result.computedRoot}\n对比公钥根: ${demoStates[id].pk.root}`;
                output = `验证结果: ${result.valid ? '✅ 匹配成功' : '❌ 失败'}`;
                break;
            case 'hqc':
                const imHD = result.intermediates;
                computation = `计算伴随式 (Syndrome): H·ctᵀ = [${imHD.syndrome.join(',')}]\n${imHD.errorIndex !== -1 ? `定位错误：在第 ${imHD.errorIndex + 1} 位\n执行纠错：翻转该位` : '未发现错误位'}`;
                output = `恢复秘密 = ${JSON.stringify(result.recoveredSecret)} ${result.match ? '✅ 匹配成功' : '❌ 失败'}`;
                break;
        }

        return `
            <div class="stage-input">📥 输入：sk 来自 ①, ${id === 'ml-kem' || id === 'hqc' ? 'ct' : 'sig'} 来自 ②</div>
            <div class="stage-computation">${computation}</div>
            <div class="stage-output">📤 ${output}</div>
        `;
    }

    async function runPipeline(algoId) {
        const state = demoStates[algoId];
        const runBtn = container.querySelector('#demo-run');
        if (runBtn) runBtn.disabled = true;

        // Reset UI
        const stages = [
            container.querySelector('#stage-0'),
            container.querySelector('#stage-1'),
            container.querySelector('#stage-2')
        ];
        const connectors = [
            container.querySelector('#connector-0'),
            container.querySelector('#connector-1')
        ];
        
        stages.forEach(s => { s.classList.remove('animate-in'); s.style.display = 'none'; });
        connectors.forEach(c => c.style.display = 'none');

        // ① KeyGen
        let keyResult;
        if (algoId === 'ml-kem') keyResult = toyMLKEM.keyGen();
        else if (algoId === 'ml-dsa') keyResult = toyMLDSA.keyGen();
        else if (algoId === 'slh-dsa') keyResult = toySLHDSA.keyGen();
        else if (algoId === 'hqc') keyResult = toyHQC.keyGen();
        
        state.pk = keyResult.pk;
        state.sk = keyResult.sk;
        if (keyResult.treeStructure) state.treeStructure = keyResult.treeStructure;

        container.querySelector('#stage-0-body').innerHTML = renderKeyGenResult(algoId, keyResult);
        stages[0].classList.add('animate-in');
        
        await delay(800);
        connectors[0].style.display = 'block';

        // ② Encaps / Sign
        let opResult;
        if (algoId === 'ml-kem') opResult = toyMLKEM.encaps(state.pk);
        else if (algoId === 'ml-dsa') opResult = toyMLDSA.sign(state.sk, state.message);
        else if (algoId === 'slh-dsa') opResult = toySLHDSA.sign(state.sk, state.leafIndex);
        else if (algoId === 'hqc') opResult = toyHQC.encaps(state.pk);
        
        state.ct = opResult.ct;
        state.sig = opResult.sig;
        state.sharedSecret = opResult.sharedSecret;

        container.querySelector('#stage-1-body').innerHTML = renderOpResult(algoId, opResult, keyResult);
        stages[1].classList.add('animate-in');

        await delay(800);
        connectors[1].style.display = 'block';

        // ③ Decaps / Verify
        let verifyResult;
        if (algoId === 'ml-kem') verifyResult = toyMLKEM.decaps(state.sk, state.ct);
        else if (algoId === 'ml-dsa') verifyResult = toyMLDSA.verify(state.pk, state.message, state.sig);
        else if (algoId === 'slh-dsa') verifyResult = toySLHDSA.verify(state.pk, state.sig);
        else if (algoId === 'hqc') verifyResult = toyHQC.decaps(state.sk, state.ct);
        
        state.result = verifyResult;

        container.querySelector('#stage-2-body').innerHTML = renderVerifyResult(algoId, verifyResult, opResult);
        stages[2].classList.add('animate-in');
        
        if (runBtn) runBtn.disabled = false;
    }

    function setupListeners() {
        container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                activeAlgoId = tab.dataset.id;
                update();
            });
        });

        // Toy Disclaimer Toggle
        const disclaimer = container.querySelector('#toy-disclaimer');
        if (disclaimer) {
            disclaimer.addEventListener('click', () => {
                disclaimer.classList.toggle('open');
                const arrow = disclaimer.querySelector('.toy-disclaimer-header span:last-child');
                arrow.textContent = disclaimer.classList.contains('open') ? '▲' : '▼';
            });
        }

        // ML-DSA message input
        const dsaMsgInput = container.querySelector('#ml-dsa-msg');
        if (dsaMsgInput) {
            dsaMsgInput.addEventListener('input', (e) => {
                demoStates['ml-dsa'].message = e.target.value;
            });
        }

        // SLH-DSA index select
        const slhIdxSelect = container.querySelector('#slh-dsa-idx');
        if (slhIdxSelect) {
            slhIdxSelect.addEventListener('change', (e) => {
                demoStates['slh-dsa'].leafIndex = parseInt(e.target.value);
            });
        }

        const runBtn = container.querySelector('#demo-run');
        if (runBtn) {
            runBtn.addEventListener('click', () => {
                runPipeline(activeAlgoId);
            });
        }

        const resetBtn = container.querySelector('#demo-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                demoStates[activeAlgoId] = { 
                    step: 'keygen', pk: null, sk: null, ct: null, sig: null, 
                    message: 'hello', leafIndex: 0, result: null, sharedSecret: null 
                };
                update();
            });
        }
    }

    update();
}

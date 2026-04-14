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
                    background: rgba(var(--active-rgb, 16, 185, 129), 0.05);
                    border: 1px dashed var(--active-color);
                    border-radius: 1rem;
                    padding: 2rem;
                    margin-top: 1rem;
                }
                .demo-steps {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                .demo-step-btn {
                    flex: 1;
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.5rem;
                    color: var(--text-dim);
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .demo-step-btn.active {
                    background: var(--active-color);
                    color: black;
                    border-color: var(--active-color);
                }
                .demo-output {
                    background: rgba(0,0,0,0.3);
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9rem;
                    min-height: 150px;
                    line-height: 1.5;
                    border: 1px solid var(--glass-border);
                    white-space: pre-wrap;
                }
                .demo-actions {
                    margin-top: 1.5rem;
                    display: flex;
                    gap: 1rem;
                }
                .btn-next {
                    background: var(--active-color);
                    color: black;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: opacity 0.3s;
                }
                .btn-next:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-reset {
                    background: transparent;
                    color: var(--text-dim);
                    border: 1px solid var(--glass-border);
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                }
                .io-label { color: var(--text-dim); font-size: 0.8rem; margin-right: 0.5rem; }
                .io-value { color: var(--active-color); word-break: break-all; }
                .io-step-label { color: #fff; font-weight: bold; margin-bottom: 0.5rem; display: block; background: rgba(255,255,255,0.05); padding: 0.25rem 0.5rem; border-radius: 4px; }
                .io-input-source { font-size: 0.75rem; color: #fbbf24; margin-bottom: 0.5rem; display: block; }

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
        const algoName = algorithms.find(a => a.id === id).name;
        const steps = id === 'ml-dsa' || id === 'slh-dsa' ? ['keygen', 'sign', 'verify'] : ['keygen', 'encaps', 'decaps'];
        
        const toyDisclaimers = {
            'ml-kem': '这是用于课堂直觉的 Toy 流程：把真实 ML-KEM 里的 256 阶多项式向量、NTT、压缩和 FO 一致性检查，压缩成 4 维整数向量与 1 bit 教学消息演示。',
            'ml-dsa': 'Toy 声明：简化了 ML-DSA 的拒绝采样逻辑和多项式维度，仅展示基于格的签名与拒绝采样的直观逻辑。',
            'slh-dsa': 'Toy 声明：将 SLH-DSA 的多层树结构简化为单层 Merkle Tree，展示基于哈希的签名与认证路径原理。',
            'hqc': 'Toy 声明：简化了 HQC 的码字长度和纠错过程，使用 Hamming 编码展示基于纠错码的加密逻辑。'
        };

        return `
            <div class="demo-panel">
                <h4 style="margin-top:0;">🧪 交互演示：${algoName} 完整流程</h4>
                
                <div class="toy-disclaimer" id="toy-disclaimer">
                    <div class="toy-disclaimer-header">
                        <span>⚠️ Toy 声明 (点击展开)</span>
                        <span>▼</span>
                    </div>
                    <div class="toy-disclaimer-content">
                        ${toyDisclaimers[id]}
                    </div>
                </div>

                <div class="demo-steps">
                    ${steps.map((s, idx) => `
                        <button class="demo-step-btn ${state.step === s ? 'active' : ''}" data-step="${s}">
                            ${idx + 1}. ${s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    `).join('')}
                </div>
                <div class="demo-output" id="demo-output">${renderStepOutput(id)}</div>
                <div class="demo-actions">
                    <button class="btn-next" id="demo-run">${state.step === 'keygen' ? '生成密钥' : (state.step === 'encaps' || state.step === 'sign' ? '执行加密/签名' : '执行解密/验证')}</button>
                    <button class="btn-reset" id="demo-reset">重置</button>
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderStepOutput(id) {
        const state = demoStates[id];
        if (!state.pk && state.step !== 'keygen') return `<div style="color: var(--text-dim)">请先执行 KeyGen 步骤</div>`;

        switch(id) {
            case 'ml-kem':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    const im = state.intermediates;
                    let calc = state.pk.b.map((v, i) => `  A[${i}]·s = ${im.dotProducts[i]} → mod 23 = ${im.dotProducts[i]%23} → + e[${i}] = ${state.pk.b[i]}`).join('\n');
                    return `<span class="io-input-source">📥 输入：无（从随机源采样）</span><span class="io-step-label">KeyGen 过程</span>A = ${JSON.stringify(state.pk.A)}\ns = ${JSON.stringify(state.sk.s)}\ne = [误差向量]\n\n计算 b = A·s + e mod 23:\n${calc}\n\n<span class="io-label">📤 输出:</span> pk = (A, b=${JSON.stringify(state.pk.b)}) → 传给 Encaps\n<span class="io-label">📤 输出:</span> sk = s = ${JSON.stringify(state.sk.s)} → 传给 Decaps`;
                }
                if (state.step === 'encaps') {
                    if (!state.ct) return '点击"执行加密"开始...';
                    const im = state.intermediates;
                    return `<span class="io-input-source">📥 输入：pk 来自上一步 KeyGen</span><span class="io-step-label">Encaps 过程</span>采样 r=${JSON.stringify(im.r)}, e1=[...], e2=${im.e2}, 消息 m=${im.m}\n\n计算 u = Aᵀ·r + e1 mod 23:\n  Aᵀ·r = ${JSON.stringify(im.uBeforeNoise)}\n  u = ${JSON.stringify(state.ct.u)}\n计算 v = bᵀ·r + e2 + ⌊23/2⌋×m mod 23:\n  bᵀ·r = ${im.bDotR}\n  v = ${im.bDotR} + ${im.e2} + 11×${im.m} = ${state.ct.v}\n\n<span class="io-label">📤 输出:</span> ct = (u=${JSON.stringify(state.ct.u)}, v=${state.ct.v}) → 传给 Decaps\n<span class="io-label">📤 共享秘密</span> m = ${im.m} (教学随机bit)`;
                }
                if (state.step === 'decaps') {
                    if (!state.result) return '点击"执行解密"开始...';
                    const im = state.intermediates;
                    return `<span class="io-input-source">📥 输入：sk=s 来自 KeyGen，ct=(u,v) 来自 Encaps</span><span class="io-step-label">Decaps 过程</span>计算 sᵀ·u mod 23:\n  sᵀ·u = ${im.sDotU}\n计算 phase = v - sᵀ·u mod 23:\n  phase = ${state.ct.v} - ${im.sDotU} = ${im.phase}\n\n判断：phase=${im.phase} 更接近 0 还是 11？\n  距离 0: ${im.distTo0}, 距离 11: ${im.distToHalf}\n  → 恢复 m = ${state.result.recoveredSecret}\n\n<span class="io-label">📤 结果:</span> 恢复秘密 = ${state.result.recoveredSecret}, 与 Encaps 的 m = ${state.sharedSecret} → ${state.result.match ? '✅ 匹配成功' : '❌ 失败'}`;
                }
                break;

            case 'ml-dsa':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-input-source">📥 输入：无（从随机源采样）</span><span class="io-step-label">KeyGen 过程</span>A = ${JSON.stringify(state.pk.A)}\ns1 = ${JSON.stringify(state.sk.s1)}, s2 = ${JSON.stringify(state.sk.s2)}\n\n计算 t = A·s1 + s2 mod 23\n<span class="io-label">📤 输出:</span> pk = (A, t=${JSON.stringify(state.pk.t)}) → 传给 Sign\n<span class="io-label">📤 输出:</span> sk = (s1, s2)`;
                }
                if (state.step === 'sign') {
                    if (!state.sig) return `消息: <input type="text" id="ml-dsa-msg" value="${escapeHtml(state.message)}" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: #fff; padding: 2px 5px; border-radius: 3px;">\n点击"执行签名"开始...`;
                    const im = state.intermediates;
                    let log = im.attempts.map((a, i) => {
                        if (a.rejected) return `尝试 #${i+1}：采样 y=${JSON.stringify(a.y)} → ||z||∞ = ${a.norm.toFixed(1)} > 6 → ❌ 拒绝！`;
                        return `尝试 #${i+1}：采样 y=${JSON.stringify(a.y)} → ||z||∞ = ${a.norm.toFixed(1)} ≤ 6 → ✅ 通过！`;
                    }).join('\n');
                    return `<span class="io-input-source">📥 输入：sk=(s1,s2) 来自 KeyGen，消息 = "${escapeHtml(state.message)}"</span><span class="io-step-label">Sign 过程 (拒绝采样)</span>${log}\n\n<span class="io-label">📤 签名:</span> (z=${JSON.stringify(state.sig.z)}, c=${state.sig.c}) → 传给 Verify`;
                }
                if (state.step === 'verify') {
                    if (!state.result) return '点击"执行验证"开始...';
                    return `<span class="io-input-source">📥 输入：pk 来自 KeyGen, 消息, 签名来自 Sign</span><span class="io-step-label">Verify 过程</span>计算 w' = Az - tc mod 23\n计算 c' = H(w', message) mod 5 = ${state.sig.c}\n\n<span class="io-label">📤 验证结果:</span> ${state.result.valid ? '<span class="io-value">✅ 有效签名</span>' : '❌ 无效'}`;
                }
                break;

            case 'slh-dsa':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-input-source">📥 输入：随机种子</span><span class="io-step-label">KeyGen 过程</span>构建 Merkle Tree (8个叶子)\n叶子值: ${state.treeStructure.leaves.map(l => l.value).join(', ')}\n哈希传播至根节点...\n\n<span class="io-label">📤 输出:</span> pk = Root Hash = <span class="io-value">${state.pk.root}</span>`;
                }
                if (state.step === 'sign') {
                    if (!state.sig) return `选择叶子索引: <select id="slh-dsa-idx" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: #fff; border-radius: 3px;">${[0,1,2,3,4,5,6,7].map(i => `<option value="${i}">${i}</option>`).join('')}</select>\n点击"执行签名"开始...`;
                    let pathLog = state.sig.authPath.map((p, i) => `  层 #${i}: 兄弟节点 ${p.position} = ${p.siblingHash}`).join('\n');
                    return `<span class="io-input-source">📥 输入：树结构来自 KeyGen，选中叶子 #${state.leafIndex}</span><span class="io-step-label">Sign 过程 (认证路径构建)</span>叶子 #${state.leafIndex} 值 = ${state.sig.leaf}\n认证路径构建:\n${pathLog}\n\n<span class="io-label">📤 签名:</span> { leaf:${state.sig.leaf}, authPath:[...] }\n<span class="io-label">签名大小:</span> ≈ ${state.sigSize} Bytes (vs 公钥 4 Bytes)`;
                }
                if (state.step === 'verify') {
                    if (!state.result) return '点击"执行验证"开始...';
                    return `<span class="io-input-source">📥 输入：pk=RootHash 来自 KeyGen，签名来自 Sign</span><span class="io-step-label">Verify 过程 (路径重构)</span>从叶子值开始逐层合并哈希...\n计算出的根: ${state.result.computedRoot}\n\n<span class="io-label">验证结果:</span> ${state.result.valid ? '<span class="io-value">✅ 与公钥根哈希匹配</span>' : '❌ 不匹配'}`;
                }
                break;

            case 'hqc':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-input-source">📥 输入：生成矩阵 G</span><span class="io-step-label">KeyGen 过程</span>采样秘密向量 s = ${JSON.stringify(state.sk.secretVec)}\n计算 pk = sG = ${JSON.stringify(state.pk.publicVec)}\n\n<span class="io-label">📤 输出:</span> pk = (G, publicVec)\n<span class="io-label">📤 输出:</span> sk = s`;
                }
                if (state.step === 'encaps') {
                    if (!state.ct) return '点击"执行封装"开始...';
                    const im = state.intermediates;
                    return `<span class="io-input-source">📥 输入：G 来自 KeyGen</span><span class="io-step-label">Encaps 过程 (编码与加噪)</span>采样消息 m = ${JSON.stringify(state.sharedSecret)}\n\nHamming 编码: codeword = ${JSON.stringify(im.originalCodeword)}\n注入噪声: 翻转第 ${im.errorPosition + 1} 位\n\n<span class="io-label">📤 密文:</span> ct = ${JSON.stringify(state.ct.noisyCodeword)} → 传给 Decaps\n<span class="io-label">📤 共享秘密:</span> ${JSON.stringify(state.sharedSecret)}`;
                }
                if (state.step === 'decaps') {
                    if (!state.result) return '点击"执行解封"开始...';
                    const im = state.intermediates;
                    return `<span class="io-input-source">📥 输入：sk=s 来自 KeyGen，ct=密文 来自 Encaps</span><span class="io-step-label">Decaps 过程 (纠错解码)</span>计算伴随式 (Syndrome): H·ctᵀ = [${im.syndrome.join(',')}]\n${im.errorIndex !== -1 ? `定位错误：查表发现错误在第 ${im.errorIndex + 1} 位\n执行纠错：翻转该位` : '未发现错误位'}\n\n<span class="io-label">📤 恢复秘密:</span> ${JSON.stringify(state.result.recoveredSecret)}\n<span class="io-label">验证结果:</span> ${state.result.match ? '✅ 匹配成功' : '❌ 失败'}`;
                }
                break;
        }
        return '';
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

        // Demo step switching
        container.querySelectorAll('.demo-step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                demoStates[activeAlgoId].step = btn.dataset.step;
                update();
            });
        });

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
                const state = demoStates[activeAlgoId];
                if (state.step === 'keygen') {
                    if (activeAlgoId === 'ml-kem') {
                        const { pk, sk, intermediates } = toyMLKEM.keyGen();
                        state.pk = pk; state.sk = sk; state.intermediates = intermediates;
                    } else if (activeAlgoId === 'ml-dsa') {
                        const { pk, sk } = toyMLDSA.keyGen();
                        state.pk = pk; state.sk = sk;
                    } else if (activeAlgoId === 'slh-dsa') {
                        const { pk, sk, treeStructure } = toySLHDSA.keyGen();
                        state.pk = pk; state.sk = sk; state.treeStructure = treeStructure;
                    } else if (activeAlgoId === 'hqc') {
                        const { pk, sk } = toyHQC.keyGen();
                        state.pk = pk; state.sk = sk;
                    }
                } else if (state.step === 'encaps' || state.step === 'sign') {
                    if (activeAlgoId === 'ml-kem') {
                        const { ct, sharedSecret, intermediates } = toyMLKEM.encaps(state.pk);
                        state.ct = ct; state.sharedSecret = sharedSecret; state.intermediates = intermediates;
                    } else if (activeAlgoId === 'ml-dsa') {
                        const { sig, attempts, intermediates } = toyMLDSA.sign(state.sk, state.message);
                        state.sig = sig; state.attempts = attempts; state.intermediates = intermediates;
                    } else if (activeAlgoId === 'slh-dsa') {
                        const { sig, sigSize } = toySLHDSA.sign(state.sk, state.leafIndex);
                        state.sig = sig; state.sigSize = sigSize;
                    } else if (activeAlgoId === 'hqc') {
                        const { ct, sharedSecret, intermediates } = toyHQC.encaps(state.pk);
                        state.ct = ct; state.sharedSecret = sharedSecret; state.intermediates = intermediates;
                    }
                } else if (state.step === 'decaps' || state.step === 'verify') {
                    if (activeAlgoId === 'ml-kem') {
                        const { recoveredSecret, match, intermediates } = toyMLKEM.decaps(state.sk, state.ct);
                        state.result = { recoveredSecret, match }; state.intermediates = intermediates;
                    } else if (activeAlgoId === 'ml-dsa') {
                        state.result = toyMLDSA.verify(state.pk, state.message, state.sig);
                    } else if (activeAlgoId === 'slh-dsa') {
                        state.result = toySLHDSA.verify(state.pk, state.sig);
                    } else if (activeAlgoId === 'hqc') {
                        const { recoveredSecret, correctedBit, match, intermediates } = toyHQC.decaps(state.sk, state.ct);
                        state.result = { recoveredSecret, correctedBit, match }; state.intermediates = intermediates;
                    }
                }
                update();
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

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
                }
                .complexity-table th, .complexity-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid var(--glass-border);
                }
                .complexity-table th { color: var(--text-dim); font-size: 0.85rem; }
                .bottleneck { 
                    padding: 0.2rem 0.5rem; 
                    border-radius: 4px; 
                    font-size: 0.75rem; 
                    background: rgba(239, 68, 68, 0.2); 
                    color: #f87171; 
                }

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
                    <h4 style="margin-top: 0">计算复杂度对比</h4>
                    <table class="complexity-table">
                        <thead>
                            <tr>
                                <th>算法</th><th>KeyGen</th><th>Encaps/Sign</th><th>Decaps/Verify</th><th>主要瓶颈</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ML-KEM</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td><span class="bottleneck" style="background: rgba(34, 211, 238, 0.2); color: #22d3ee">NTT 变换</span></td>
                            </tr>
                            <tr>
                                <td>ML-DSA</td><td>O(n log n)</td><td>O(n log n) × 重试</td><td>O(n log n)</td><td><span class="bottleneck">拒绝采样</span></td>
                            </tr>
                            <tr>
                                <td>SLH-DSA</td><td>O(n)</td><td>O(n·h)</td><td>O(n·h)</td><td><span class="bottleneck" style="background: rgba(167, 139, 250, 0.2); color: #a78bfa">哈希调用量</span></td>
                            </tr>
                            <tr>
                                <td>HQC</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td><td><span class="bottleneck" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24">解码复杂度</span></td>
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
        
        return `
            <div class="demo-panel">
                <h4 style="margin-top:0;">🧪 交互演示：${algoName} 完整流程</h4>
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

    function renderStepOutput(id) {
        const state = demoStates[id];
        if (!state.pk && state.step !== 'keygen') return `<div style="color: var(--text-dim)">请先执行 KeyGen 步骤</div>`;

        switch(id) {
            case 'ml-kem':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-label">输入:</span> 随机种子, 误差分布\n<span class="io-label">输出:</span>\n  pk = (A, b) = (${JSON.stringify(state.pk.A)}, ${JSON.stringify(state.pk.b)})\n  sk = s = ${JSON.stringify(state.sk.s)}`;
                }
                if (state.step === 'encaps') {
                    if (!state.ct) return '点击"执行加密"开始...';
                    return `<span class="io-label">输入:</span> pk = (A, b)\n<span class="io-label">输出:</span>\n  ct = (u, v) = (${JSON.stringify(state.ct.u)}, ${state.ct.v})\n  共享秘密 m = <span class="io-value">${state.sharedSecret}</span>`;
                }
                if (state.step === 'decaps') {
                    if (!state.result) return '点击"执行解密"开始...';
                    return `<span class="io-label">输入:</span> sk = s, ct = (u, v)\n<span class="io-label">输出:</span>\n  恢复的秘密 = <span class="io-value">${state.result.recoveredSecret}</span>\n  验证结果 = ${state.result.match ? '✅ 匹配成功' : '❌ 失败'}`;
                }
                break;

            case 'ml-dsa':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-label">输入:</span> 随机性\n<span class="io-label">输出:</span>\n  pk = (A, t) = (${JSON.stringify(state.pk.A)}, ${JSON.stringify(state.pk.t)})\n  sk = (s1, s2) = (${JSON.stringify(state.sk.s1)}, ${JSON.stringify(state.sk.s2)})`;
                }
                if (state.step === 'sign') {
                    if (!state.sig) return `消息: <input type="text" id="ml-dsa-msg" value="${state.message}" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: #fff; padding: 2px 5px; border-radius: 3px;">\n点击"执行签名"开始...`;
                    let log = '';
                    for(let i=1; i<=state.attempts; i++) log += `尝试 #${i}...范数过大！拒绝采样。\n`;
                    log += `尝试 #${state.attempts + 1}...通过！\n`;
                    return `<span class="io-label">输入:</span> sk, 消息="${state.message}"\n<span class="io-label">过程:</span>\n${log}\n<span class="io-label">输出:</span>\n  签名 (z, c) = (${JSON.stringify(state.sig.z)}, ${state.sig.c})`;
                }
                if (state.step === 'verify') {
                    if (!state.result) return '点击"执行验证"开始...';
                    return `<span class="io-label">输入:</span> pk, 消息, 签名\n<span class="io-label">输出:</span>\n  验证结果 = ${state.result.valid ? '<span class="io-value">✅ 有效签名</span>' : '❌ 无效'}`;
                }
                break;

            case 'slh-dsa':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-label">过程:</span> 构建高度为 3 的 Merkle Tree (8个叶子)\n<span class="io-label">叶子值:</span> ${state.treeStructure.leaves.map(l => l.value).join(', ')}\n<span class="io-label">输出:</span>\n  pk = Root Hash = <span class="io-value">${state.pk.root}</span>`;
                }
                if (state.step === 'sign') {
                    if (!state.sig) return `选择叶子索引: <select id="slh-dsa-idx" style="background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); color: #fff; border-radius: 3px;">${[0,1,2,3,4,5,6,7].map(i => `<option value="${i}">${i}</option>`).join('')}</select>\n点击"执行签名"开始...`;
                    return `<span class="io-label">输入:</span> sk, 索引=${state.leafIndex}\n<span class="io-label">过程:</span> 提取认证路径 (Authentication Path)\n<span class="io-label">输出:</span>\n  签名 = { 值: ${state.sig.leaf}, 路径: ${state.sig.authPath.length}个节点 }\n  签名大小 ≈ <span class="io-value">${state.sigSize} Bytes</span> (vs 公钥 4 Bytes)`;
                }
                if (state.step === 'verify') {
                    if (!state.result) return '点击"执行验证"开始...';
                    return `<span class="io-label">输入:</span> pk, 签名\n<span class="io-label">过程:</span> 从叶子值和认证路径重建根哈希...\n<span class="io-label">计算出的根:</span> ${state.result.computedRoot}\n<span class="io-label">验证结果:</span> ${state.result.valid ? '<span class="io-value">✅ 与公钥匹配</span>' : '❌ 不匹配'}`;
                }
                break;

            case 'hqc':
                if (state.step === 'keygen') {
                    if (!state.pk) return '点击"生成密钥"开始...';
                    return `<span class="io-label">过程:</span> 选择随机向量 s, 计算 pk = sG + e\n<span class="io-label">输出:</span>\n  pk = (G, publicVec) = (Hamming G, ${JSON.stringify(state.pk.publicVec)})\n  sk = secretVec = ${JSON.stringify(state.sk.secretVec)}`;
                }
                if (state.step === 'encaps') {
                    if (!state.ct) return '点击"执行封装"开始...';
                    return `<span class="io-label">过程:</span>\n  1. 原始消息: ${JSON.stringify(state.sharedSecret)}\n  2. Hamming 编码: ${JSON.stringify(state.ct.noisyCodeword.map((v,i)=>v ^ (i===state.errorIdx?1:0)))}\n  3. 注入噪声 (1 bit)\n<span class="io-label">输出:</span>\n  ct = noisyCodeword = <span class="io-value">${JSON.stringify(state.ct.noisyCodeword)}</span>`;
                }
                if (state.step === 'decaps') {
                    if (!state.result) return '点击"执行解封"开始...';
                    return `<span class="io-label">过程:</span>\n  1. 计算伴随式 (Syndrome): H·ctᵀ\n  2. 定位错误位: ${state.result.correctedBit ? `第 ${state.result.correctedBit} 位` : '未发现错误'}\n  3. 纠错并解码\n<span class="io-label">输出:</span>\n  恢复的消息 = <span class="io-value">${JSON.stringify(state.result.recoveredSecret)}</span>\n  验证结果 = ${state.result.match ? '✅ 匹配成功' : '❌ 失败'}`;
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
                        const { pk, sk } = toyMLKEM.keyGen();
                        state.pk = pk; state.sk = sk;
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
                        const { ct, sharedSecret } = toyMLKEM.encaps(state.pk);
                        state.ct = ct; state.sharedSecret = sharedSecret;
                    } else if (activeAlgoId === 'ml-dsa') {
                        const { sig, attempts } = toyMLDSA.sign(state.sk, state.message);
                        state.sig = sig; state.attempts = attempts;
                    } else if (activeAlgoId === 'slh-dsa') {
                        const { sig, sigSize } = toySLHDSA.sign(state.sk, state.leafIndex);
                        state.sig = sig; state.sigSize = sigSize;
                    } else if (activeAlgoId === 'hqc') {
                        const { ct, sharedSecret } = toyHQC.encaps(state.pk);
                        state.ct = ct; state.sharedSecret = sharedSecret;
                        // Find error idx for display
                        const codeword = state.sharedSecret.reduce((acc, bit, i) => {
                            const row = state.pk.G[i];
                            return acc.map((v, j) => (v + bit * row[j]) % 2);
                        }, [0,0,0,0,0,0,0]);
                        state.errorIdx = state.ct.noisyCodeword.findIndex((v, i) => v !== codeword[i]);
                    }
                } else if (state.step === 'decaps' || state.step === 'verify') {
                    if (activeAlgoId === 'ml-kem') {
                        state.result = toyMLKEM.decaps(state.sk, state.ct);
                    } else if (activeAlgoId === 'ml-dsa') {
                        state.result = toyMLDSA.verify(state.pk, state.message, state.sig);
                    } else if (activeAlgoId === 'slh-dsa') {
                        state.result = toySLHDSA.verify(state.pk, state.sig);
                    } else if (activeAlgoId === 'hqc') {
                        state.result = toyHQC.decaps(state.sk, state.ct);
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

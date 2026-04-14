import { algorithms, keySizeComparison } from '../data.js';
import { toyMLKEM, toyMLDSA, toySLHDSA, toyHQC } from './crypto-demos.js';

function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const algoContent = {
    'ml-kem': {
        analogy: "像公开一把故意带模糊纹理的锁，任何人都能把一次性会话钥匙锁进去，但只有你能顺着这些纹理把它正确取出来。",
        table: [
            ["公钥", "(A, b=As+e) 带噪线性关系", "公开一个\"带噪声的方程\"，知道 s 能消除噪声，不知道的人无法反推"],
            ["私钥", "s（秘密短向量）", "持有 s 就能从密文中恢复共享秘密"],
            ["加密(封装)", "Encaps：用公钥封装随机秘密", "把一次性会话钥匙锁进只有私钥持有者能打开的箱子"],
            ["密文", "(u, v) 另一组带噪关系", "密文里藏着被封装的临时值，只有私钥能恢复"],
            ["解密(解封)", "Decaps：用私钥恢复共享秘密", "利用 s 消除噪声，恢复被封装的秘密"],
            ["共享秘密", "K（由临时值派生的密钥）", "双方最终得到同一个密钥，用于后续对称加密"]
        ],
        steps: [
            { badge: "① KeyGen", meaning: "生成公私钥对。公钥是\"带噪声的线性方程\"，私钥是方程的\"秘密解\"", analogy: "像造一把人人看得到的锁，但锁芯里故意留了一层只有原主人知道怎么抵消的模糊" },
            { badge: "② Encaps", meaning: "发送方把临时秘密封装成只有私钥持有者能恢复的密文", analogy: "像把一次性会话钥匙装进专属包装盒，只有收件人的私有开锁方式能打开" },
            { badge: "③ Decaps", meaning: "接收方先取出临时秘密，再验证密文是否按规矩封出来的", analogy: "像先拆包裹取出内容，再核对封条和包装是否原厂一致" }
        ],
        connector1: "↓ 公钥 → ② / 私钥 → ③",
        connector2: "↓ 密文 → ③"
    },
    'ml-dsa': {
        analogy: "像先交一份不会泄密的随机草稿，再让消息现场出题，最后用私钥交出刚好能过关但暴露不了底稿的答卷。",
        table: [
            ["公钥", "(A, t=As1+s2) 公开承诺", "公钥是可验证的承诺：签名者确实知道某组短秘密"],
            ["私钥", "(s1, s2) 短秘密向量", "签名者用这些秘密回答消息产生的挑战"],
            ["签名", "(z, c) 响应+挑战", "一份非交互证明：我知道私钥，且这份回答和消息匹配"],
            ["验签", "重建承诺，比对挑战", "验证者重演证明过程，检查是否自洽"]
        ],
        steps: [
            { badge: "① KeyGen", meaning: "建立公开验证基准和私有签名见证", analogy: "像公布一个高难度的杂技动作标准，但只有你自己知道如何保持平衡的诀窍" },
            { badge: "② Sign", meaning: "承诺→挑战→响应，拒绝采样是\"防泄漏安全阀\"", analogy: "像在答卷时如果发现某个步骤可能暴露自己的底稿，就撕掉重写，直到安全为止" },
            { badge: "③ Verify", meaning: "重演证明过程，检查是否自洽", analogy: "像观众根据你公布的标准，复核你的每一个动作是否完全符合逻辑" }
        ],
        connector1: "↓ 公钥/私钥 → ②",
        connector2: "↓ 签名 → ③"
    },
    'slh-dsa': {
        analogy: "像从一次性票据本里撕下一张票，再附上从这张票一路通到封面防伪章的证明链。",
        table: [
            ["公钥", "树的根哈希（公钥锚点）", "验证者只需信任根，就能验证任何叶子的合法路径"],
            ["私钥", "主种子（能派生所有一次性签名密钥）", "不是单个数字，而是能生成海量一次性签名材料的种子"],
            ["签名", "叶子签名材料 + 认证路径", "证明两件事：消息被合法私钥签过，且该私钥属于公开根的树"],
            ["验签", "沿路径重建根，与公钥比对", "归属链验证：局部签名材料能否回到公开根"]
        ],
        steps: [
            { badge: "① KeyGen", meaning: "计算海量一次性密钥的\"根承诺\"", analogy: "像印制一本有上亿张防伪票据的本子，最后只在封面上盖一个总防伪章" },
            { badge: "② Sign", meaning: "选取一张未使用的票据签名，并附上它通往根的认证路径", analogy: "从本子里撕下一张票，并展示它是如何从本子的哪一页、哪一叠里撕出来的" },
            { badge: "③ Verify", meaning: "沿路径重建根，与公钥比对", analogy: "拿着票和证明路径，层层核对，最后看能不能刚好对上封面那个防伪章" }
        ],
        connector1: "↓ 公钥 → ③ / 私钥 → ②",
        connector2: "↓ 签名 → ③"
    },
    'hqc': {
        analogy: "像把秘密写成自带纠错的条码再故意刮花，只有知道纠错规则和去噪诀窍的人才能完整读回来。",
        table: [
            ["公钥", "公开码结构 + 遮蔽关系", "让任何人能构造合法密文，但不暴露秘密向量"],
            ["私钥", "秘密稀疏向量 + 纠错能力", "只有持有者能去噪并纠错恢复"],
            ["加密(封装)", "编码成码字 + 叠加噪声", "不靠代数求逆，靠\"带噪编码后的解码困难\""],
            ["解密(解封)", "去噪 + 纠错解码", "私钥不是拿来反算，而是把噪声环境变回纠错器可处理的样子"]
        ],
        steps: [
            { badge: "① KeyGen", meaning: "公开纠错码的某种结构，但保留它的秘密偏移量", analogy: "宣布一个复杂的条码体系，但只有你知道如何滤掉那种特定的干扰噪声" },
            { badge: "② Encaps", meaning: "编码成码字 + 叠加噪声", analogy: "把秘密印成条码，并在上面胡乱涂抹一层噪声，让普通人根本读不出原意" },
            { badge: "③ Decaps", meaning: "去噪 + 纠错解码", analogy: "利用你的秘密诀窍先擦掉那层特定的噪声，再用纠错功能把模糊的条码还原" }
        ],
        connector1: "↓ 公钥 → ② / 私钥 → ③",
        connector2: "↓ 密文 → ③"
    }
};

export function renderAlgorithms(container) {
    let activeAlgoId = algorithms[0].id;
    
    // 演示状态存储
    const demoStates = {
        'ml-kem': { pk: null, sk: null, ct: null, sharedSecret: null, result: null },
        'ml-dsa': { pk: null, sk: null, sig: null, message: 'hello', result: null, attempts: 0 },
        'slh-dsa': { pk: null, sk: null, sig: null, leafIndex: 0, result: null, treeStructure: null },
        'hqc': { pk: null, sk: null, ct: null, sharedSecret: null, result: null }
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
                
                .algo-analogy {
                    background: rgba(var(--active-rgb), 0.08);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    border-left: 3px solid var(--active-color);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .analogy-icon { font-size: 1.25rem; }
                .analogy-text { font-size: 0.95rem; line-height: 1.5; color: #fff; }

                .concept-table-wrapper {
                    margin-bottom: 2rem;
                    overflow-x: auto;
                }
                .concept-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .concept-table th {
                    background: rgba(0,0,0,0.3);
                    padding: 0.6rem 0.75rem;
                    text-align: left;
                    color: var(--text-dim);
                }
                .concept-table td {
                    padding: 0.75rem;
                    border-bottom: 1px solid var(--glass-border);
                }
                .concept-table td:first-child {
                    color: var(--active-color);
                    font-weight: bold;
                    white-space: nowrap;
                }

                .concept-pipeline {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .concept-step {
                    background: rgba(0,0,0,0.15);
                    border-radius: 0.75rem;
                    padding: 1.25rem;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .step-badge {
                    background: var(--active-color);
                    color: black;
                    border-radius: 4px;
                    padding: 0.2rem 0.5rem;
                    font-size: 0.75rem;
                    font-weight: bold;
                    display: inline-block;
                    margin-bottom: 0.75rem;
                }
                .step-crypto-meaning {
                    color: white;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 0.4rem;
                }
                .step-analogy {
                    color: var(--text-dim);
                    font-style: italic;
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                }
                .math-detail summary {
                    color: var(--active-color);
                    cursor: pointer;
                    font-size: 0.8rem;
                    user-select: none;
                    outline: none;
                }
                .math-detail .math-content {
                    font-family: 'JetBrains Mono', monospace;
                    background: rgba(0,0,0,0.3);
                    border-radius: 0.5rem;
                    padding: 0.75rem;
                    font-size: 0.8rem;
                    margin-top: 0.75rem;
                    white-space: pre-wrap;
                    color: #e5e7eb;
                    border-left: 2px solid var(--active-color);
                }
                .concept-connector {
                    text-align: center;
                    color: var(--active-color);
                    font-size: 0.85rem;
                    padding: 0.25rem 0;
                    font-weight: bold;
                }

                .demo-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1.5rem;
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
                    margin-bottom: 1.5rem;
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

                @keyframes highlightResult {
                    0% { background: rgba(var(--active-rgb), 0.3); }
                    100% { background: rgba(0,0,0,0.3); }
                }
                .highlight-new {
                    animation: highlightResult 1.5s ease-out;
                }

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
                    <h4 style="margin-top: 0">性能与计算成本对比</h4>
                    <p style="font-size:0.8rem; color:var(--text-dim); margin-bottom:1rem">相对速度用条形直觉表示，越短越快。数据基于 128-bit 安全级别的代表性参数集。</p>
                    <table class="complexity-table">
                        <thead>
                            <tr>
                                <th>算法</th><th>类型</th><th>KeyGen</th><th>核心操作</th><th>验证/解封</th><th>主要瓶颈</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="color:#10b981; font-weight:bold">ML-KEM-768</td>
                                <td>KEM</td>
                                <td><div style="background:#10b981; height:8px; width:15%; border-radius:4px" title="极快"></div><span class="toy-mapping">极快 (~9 次多项式乘)</span></td>
                                <td><div style="background:#10b981; height:8px; width:20%; border-radius:4px"></div><span class="toy-mapping">极快 (封装)</span></td>
                                <td><div style="background:#10b981; height:8px; width:12%; border-radius:4px"></div><span class="toy-mapping">极快 (解封)</span></td>
                                <td><span class="bottleneck" style="background:rgba(34,211,238,0.2); color:#22d3ee">NTT 多项式乘法</span><br><span class="toy-mapping">Toy: b = As + e</span></td>
                            </tr>
                            <tr>
                                <td style="color:#a855f7; font-weight:bold">ML-DSA-65</td>
                                <td>签名</td>
                                <td><div style="background:#a855f7; height:8px; width:25%; border-radius:4px"></div><span class="toy-mapping">快 (~30 次多项式乘)</span></td>
                                <td><div style="background:#a855f7; height:8px; width:50%; border-radius:4px"></div><span class="toy-mapping">中等 (签名，含重试)</span></td>
                                <td><div style="background:#a855f7; height:8px; width:25%; border-radius:4px"></div><span class="toy-mapping">快 (验签)</span></td>
                                <td><span class="bottleneck" style="background:rgba(239,68,68,0.2); color:#f87171">拒绝采样循环</span><br><span class="toy-mapping">Toy: z = y + c·s1 范数检查</span></td>
                            </tr>
                            <tr>
                                <td style="color:#22d3ee; font-weight:bold">SLH-DSA-128f</td>
                                <td>签名</td>
                                <td><div style="background:#22d3ee; height:8px; width:30%; border-radius:4px"></div><span class="toy-mapping">中等</span></td>
                                <td><div style="background:#22d3ee; height:8px; width:90%; border-radius:4px"></div><span class="toy-mapping">慢 (大量哈希调用)</span></td>
                                <td><div style="background:#22d3ee; height:8px; width:60%; border-radius:4px"></div><span class="toy-mapping">较慢 (路径重建)</span></td>
                                <td><span class="bottleneck" style="background:rgba(167,139,250,0.2); color:#a78bfa">海量哈希 + WOTS+ 链</span><br><span class="toy-mapping">Toy: 认证路径遍历</span></td>
                            </tr>
                            <tr>
                                <td style="color:#3b82f6; font-weight:bold">HQC-128</td>
                                <td>KEM</td>
                                <td><div style="background:#3b82f6; height:8px; width:40%; border-radius:4px"></div><span class="toy-mapping">中等</span></td>
                                <td><div style="background:#3b82f6; height:8px; width:45%; border-radius:4px"></div><span class="toy-mapping">中等 (编码+加噪)</span></td>
                                <td><div style="background:#3b82f6; height:8px; width:55%; border-radius:4px"></div><span class="toy-mapping">较慢 (纠错解码)</span></td>
                                <td><span class="bottleneck" style="background:rgba(251,191,36,0.2); color:#fbbf24">长二元多项式运算</span><br><span class="toy-mapping">Toy: H·ct 校验矩阵</span></td>
                            </tr>
                            <tr class="classic">
                                <td style="color:var(--text-dim)">RSA-2048</td>
                                <td>经典</td>
                                <td><div style="background:#64748b; height:8px; width:100%; border-radius:4px"></div><span class="toy-mapping">极慢 (素数生成)</span></td>
                                <td><div style="background:#64748b; height:8px; width:70%; border-radius:4px"></div><span class="toy-mapping">慢 (模幂)</span></td>
                                <td><div style="background:#64748b; height:8px; width:20%; border-radius:4px"></div><span class="toy-mapping">快 (小指数)</span></td>
                                <td><span class="bottleneck" style="background:rgba(255,255,255,0.1); color:#ccc">大整数模幂</span></td>
                            </tr>
                            <tr class="classic">
                                <td style="color:var(--text-dim)">ECDSA-P256</td>
                                <td>经典</td>
                                <td><div style="background:#64748b; height:8px; width:10%; border-radius:4px"></div><span class="toy-mapping">极快</span></td>
                                <td><div style="background:#64748b; height:8px; width:12%; border-radius:4px"></div><span class="toy-mapping">极快</span></td>
                                <td><div style="background:#64748b; height:8px; width:18%; border-radius:4px"></div><span class="toy-mapping">极快</span></td>
                                <td><span class="bottleneck" style="background:rgba(255,255,255,0.1); color:#ccc">曲线标量乘</span></td>
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
        const content = algoContent[id];
        
        const toyDisclaimers = {
            'ml-kem': '这是用于课堂直觉的 Toy 流程：把真实 ML-KEM 里的 256 阶多项式向量、NTT、压缩和 FO 一致性检查，压缩成 4 维整数向量与 1 bit 教学消息演示。',
            'ml-dsa': 'Toy 声明：简化了 ML-DSA 的拒绝采样逻辑和多项式维度，仅展示基于格的签名与拒绝采样的直观逻辑。',
            'slh-dsa': 'Toy 声明：将 SLH-DSA 的多层树结构简化为单层 Merkle Tree，展示基于哈希的签名与认证路径原理。',
            'hqc': 'Toy 声明：简化了 HQC 的码字长度和纠错过程，使用 Hamming 编码展示基于纠错码的加密逻辑。'
        };

        return `
            <div class="demo-panel">
                <h4 style="margin-top:0;">🧪 交互演示：${algo.name} 概念与原理</h4>
                
                <div class="toy-disclaimer" id="toy-disclaimer">
                    <div class="toy-disclaimer-header">
                        <span>⚠️ Toy 声明 (点击展开)</span>
                        <span>▼</span>
                    </div>
                    <div class="toy-disclaimer-content">
                        ${toyDisclaimers[id]}
                    </div>
                </div>

                <!-- 一句话类比 -->
                <div class="algo-analogy">
                    <span class="analogy-icon">💡</span>
                    <span class="analogy-text">${content.analogy}</span>
                </div>
                
                <!-- 概念映射表 -->
                <div class="concept-table-wrapper">
                    <table class="concept-table">
                        <thead><tr><th>传统概念</th><th>PQC 对应物</th><th>为什么这样做</th></tr></thead>
                        <tbody>
                            ${content.table.map(row => `
                                <tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- 三步流程 -->
                <div class="concept-pipeline">
                    ${content.steps.map((step, index) => `
                        <div class="concept-step">
                            <div class="step-badge">${step.badge}</div>
                            <div class="step-crypto-meaning">${step.meaning}</div>
                            <div class="step-analogy">${step.analogy}</div>
                            <details class="math-detail" id="math-detail-${index}">
                                <summary>展开数学细节</summary>
                                <div class="math-content" id="math-content-${index}">请点击下方的“运行 Toy 演示”查看实际计算结果</div>
                            </details>
                        </div>
                        ${index < 2 ? `<div class="concept-connector">${index === 0 ? content.connector1 : content.connector2}</div>` : ''}
                    `).join('')}
                </div>

                <div class="demo-controls">
                    <button class="demo-run-btn" id="demo-run">▶ 运行 Toy 演示</button>
                    
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
                            <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.5rem; line-height:1.4">
                                💡 在真实 SLH-DSA 中，待签名的消息经过哈希后决定使用哪个叶子（FORS 索引）。这里简化为手动选择叶子索引，等价于"选择用哪把一次性私钥来签名"。
                            </div>
                        </div>
                    ` : ''}
                    
                    <button class="demo-reset-btn" id="demo-reset">🔄 重新生成</button>
                </div>
            </div>
        `;
    }

    function renderKeyGenMath(id, result) {
        let computation = '';
        switch(id) {
            case 'ml-kem':
                const imK = result.intermediates;
                const calcK = result.pk.b.map((v, i) => `b[${i}] = A[${i}]·s + e[${i}] = ${imK.dotProducts[i]} + e[${i}] = ${result.pk.b[i]} mod 23`).join('\n');
                computation = `A = ${JSON.stringify(result.pk.A)}\ns = ${JSON.stringify(result.sk.s)}\ne = [采样噪声]\n\n计算 b = A·s + e mod 23:\n${calcK}\n\n生成 pk = (A, b), sk = s`;
                break;
            case 'ml-dsa':
                computation = `A = ${JSON.stringify(result.pk.A)}\ns1 = ${JSON.stringify(result.sk.s1)}, s2 = ${JSON.stringify(result.sk.s2)}\n\n计算 t = A·s1 + s2 mod 23\nt = ${JSON.stringify(result.pk.t)}\n\n生成 pk = (A, t), sk = (s1, s2)`;
                break;
            case 'slh-dsa':
                computation = `构建 Merkle Tree (8个叶子)\n叶子值 (哈希结果):\n${result.treeStructure.leaves.map((l, i) => `  Leaf #${i}: ${l.value}`).join('\n')}\n\n逐层向上计算哈希...\n最终根 Root Hash = ${result.pk.root}\n\npk = Root, sk = 完整的树结构`;
                break;
            case 'hqc':
                computation = `采样秘密向量 s = ${JSON.stringify(result.sk.secretVec)}\n计算 pk = sG = ${JSON.stringify(result.pk.publicVec)} mod 2\n\npk = (G, publicVec), sk = s`;
                break;
        }
        return computation;
    }

    function renderOpMath(id, result) {
        let computation = '';
        switch(id) {
            case 'ml-kem':
                const imE = result.intermediates;
                computation = `采样随机值 r=${JSON.stringify(imE.r)}, e1=[...], e2=${imE.e2}\n消息 m=${imE.m} (映射到 0 或 11)\n\n计算 u = Aᵀ·r + e1 mod 23 = ${JSON.stringify(result.ct.u)}\n计算 v = bᵀ·r + e2 + 11×m mod 23\n  = ${imE.bDotR} + ${imE.e2} + 11×${imE.m} = ${result.ct.v} mod 23\n\n密文 ct = (u, v), 共享秘密 K = Hash(m)`;
                break;
            case 'ml-dsa':
                const imS = result.intermediates;
                let log = imS.attempts.map((a, i) => {
                    const status = a.rejected ? '❌ 范数过大，拒绝！重新采样 y...' : '✅ 范数合格，签名通过！';
                    return `尝试 #${i+1}：\n  采样 y = [${a.y.join(', ')}]\n  w = A·y mod q → c = H(w, msg) % 5 = ${a.c}\n  z = y + ${a.c}·s1 = [${a.z.join(', ')}]\n  ||z||∞ = ${a.norm.toFixed(1)} ${a.norm > 6 ? '> 6' : '≤ 6'} → ${status}`;
                }).join('\n\n');
                computation = `消息 = "${escapeHtml(demoStates[id].message)}"\n\n执行拒绝采样 (Rejection Sampling):\n每次采样新的随机 y → 计算确定性挑战 c → 检查响应 z 的范数\n\n${log}`;
                break;
            case 'slh-dsa':
                let pathLog = result.sig.authPath.map((p, i) => `  层 #${i}: 兄弟节点 ${p.position} = ${p.siblingHash}`).join('\n');
                computation = `选择第 ${demoStates[id].leafIndex} 个叶子进行签名\n叶子值: ${result.sig.leaf}\n\n计算认证路径 (Auth Path):\n${pathLog}\n\n签名 sig = { leaf, authPath }`;
                break;
            case 'hqc':
                const imH = result.intermediates;
                computation = `消息 m = ${JSON.stringify(result.sharedSecret)}\nHamming 编码: codeword = ${JSON.stringify(imH.originalCodeword)}\n\n叠加噪声 (模拟传输干扰):\n翻转第 ${imH.errorPosition + 1} 位\n结果 ct = ${JSON.stringify(result.ct.noisyCodeword)}`;
                break;
        }
        return computation;
    }

    function renderVerifyMath(id, result, opResult) {
        let computation = '';
        switch(id) {
            case 'ml-kem':
                const imD = result.intermediates;
                computation = `收到密文 (u, v)\n计算 sᵀ·u = ${imD.sDotU} mod 23\n计算 phase = v - sᵀ·u = ${opResult.ct.v} - ${imD.sDotU} = ${imD.phase} mod 23\n\n判定消息 m：\n  距离 0: ${imD.distTo0}, 距离 11: ${imD.distToHalf}\n  ${imD.distTo0 < imD.distToHalf ? '更接近 0' : '更接近 11'} → 恢复 m = ${result.recoveredSecret}\n\n验证结果: ${result.match ? '✅ 密钥匹配' : '❌ 密钥不匹配'}`;
                break;
            case 'ml-dsa':
                computation = `收到签名 (z, c)\n计算 w' = Az - tc mod 23\n计算挑战 c' = H(w', message) = ${opResult.sig.c}\n\n验证：c' == c ?\n验证结果: ${result.valid ? '✅ 有效签名' : '❌ 无效签名'}`;
                break;
            case 'slh-dsa':
                computation = `收到签名 { leaf, authPath }\n从叶子值开始逐层向上合并哈希...\n${result.computedRoot ? `计算出的根: ${result.computedRoot}\n对比公钥根: ${demoStates[id].pk.root}` : ''}\n\n验证结果: ${result.valid ? '✅ 路径有效' : '❌ 路径无效'}`;
                break;
            case 'hqc':
                const imHD = result.intermediates;
                computation = `收到带噪密文 ct\n利用私钥计算伴随式: Syndrome = H·ctᵀ = [${imHD.syndrome.join(',')}]\n\n${imHD.errorIndex !== -1 ? `定位错误位置：第 ${imHD.errorIndex + 1} 位\n执行纠错：翻转该位并恢复码字` : '未发现错误位'}\n\n恢复秘密 m = ${JSON.stringify(result.recoveredSecret)}\n验证结果: ${result.match ? '✅ 纠错成功' : '❌ 纠错失败'}`;
                break;
        }
        return computation;
    }

    async function runPipeline(algoId) {
        const state = demoStates[algoId];
        const runBtn = container.querySelector('#demo-run');
        if (runBtn) runBtn.disabled = true;

        // ① KeyGen
        let keyResult;
        if (algoId === 'ml-kem') keyResult = toyMLKEM.keyGen();
        else if (algoId === 'ml-dsa') keyResult = toyMLDSA.keyGen();
        else if (algoId === 'slh-dsa') keyResult = toySLHDSA.keyGen();
        else if (algoId === 'hqc') keyResult = toyHQC.keyGen();
        
        state.pk = keyResult.pk;
        state.sk = keyResult.sk;
        if (keyResult.treeStructure) state.treeStructure = keyResult.treeStructure;

        const math0 = container.querySelector('#math-content-0');
        math0.innerHTML = renderKeyGenMath(algoId, keyResult);
        math0.classList.add('highlight-new');
        container.querySelector('#math-detail-0').open = true;
        
        await delay(600);

        // ② Encaps / Sign
        let opResult;
        if (algoId === 'ml-kem') opResult = toyMLKEM.encaps(state.pk);
        else if (algoId === 'ml-dsa') opResult = toyMLDSA.sign(state.sk, state.message);
        else if (algoId === 'slh-dsa') opResult = toySLHDSA.sign(state.sk, state.leafIndex);
        else if (algoId === 'hqc') opResult = toyHQC.encaps(state.pk);
        
        state.ct = opResult.ct;
        state.sig = opResult.sig;
        state.sharedSecret = opResult.sharedSecret;

        const math1 = container.querySelector('#math-content-1');
        math1.innerHTML = renderOpMath(algoId, opResult);
        math1.classList.add('highlight-new');
        container.querySelector('#math-detail-1').open = true;

        await delay(600);

        // ③ Decaps / Verify
        let verifyResult;
        if (algoId === 'ml-kem') verifyResult = toyMLKEM.decaps(state.sk, state.ct);
        else if (algoId === 'ml-dsa') verifyResult = toyMLDSA.verify(state.pk, state.message, state.sig);
        else if (algoId === 'slh-dsa') verifyResult = toySLHDSA.verify(state.pk, state.sig);
        else if (algoId === 'hqc') verifyResult = toyHQC.decaps(state.sk, state.ct);
        
        state.result = verifyResult;

        const math2 = container.querySelector('#math-content-2');
        math2.innerHTML = renderVerifyMath(algoId, verifyResult, opResult);
        math2.classList.add('highlight-new');
        container.querySelector('#math-detail-2').open = true;
        
        if (runBtn) runBtn.disabled = false;
        
        // Remove highlight class after animation
        setTimeout(() => {
            [math0, math1, math2].forEach(m => m.classList.remove('highlight-new'));
        }, 1500);
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
                const isMLDSA = activeAlgoId === 'ml-dsa';
                demoStates[activeAlgoId] = { 
                    pk: null, sk: null, ct: null, sig: null, 
                    message: isMLDSA ? 'hello' : '', leafIndex: 0, result: null, sharedSecret: null 
                };
                update();
            });
        }
    }

    update();
}

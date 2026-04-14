import { principles } from '../data.js';

export function renderPrinciples(container) {
    container.innerHTML = `
        <style>
            .principles-container {
                display: flex;
                flex-direction: column;
                gap: 3rem;
                padding: 1rem 0;
            }
            .principle-panel {
                display: flex;
                min-height: 460px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1.5rem;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            }
            .principle-visual {
                flex: 0 0 60%;
                background: rgba(0, 0, 0, 0.4);
                padding: 2rem;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                border-right: 1px solid var(--glass-border);
            }
            .principle-tutorial {
                flex: 0 0 40%;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background: rgba(255, 255, 255, 0.02);
            }
            .step-content {
                flex-grow: 1;
            }
            .step-title {
                font-size: 1.4rem;
                font-weight: 700;
                color: #fff;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .step-desc {
                font-size: 1rem;
                color: var(--text-dim);
                line-height: 1.7;
                margin-bottom: 2rem;
            }
            .step-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            .btn-next {
                padding: 0.7rem 1.5rem;
                background: var(--accent-cyan);
                color: #000;
                border: none;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-next:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(34, 211, 238, 0.4);
            }
            .btn-reset {
                padding: 0.7rem 1.5rem;
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border: 1px solid var(--glass-border);
                border-radius: 0.5rem;
                cursor: pointer;
            }
            .panel-footer {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .analogy-box {
                font-size: 0.9rem;
                color: var(--text-dim);
                font-style: italic;
                margin-bottom: 1rem;
                line-height: 1.5;
            }
            .algo-labels {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .algo-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75rem;
                padding: 2px 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: var(--accent-cyan);
            }

            /* 1. Lattice Grid Styles */
            .lattice-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 15px;
                position: relative;
            }
            .grid-dot {
                width: 14px;
                height: 14px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            .grid-dot:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.2);
            }
            .grid-dot.secret {
                background: var(--accent-cyan);
                box-shadow: 0 0 15px var(--accent-cyan);
            }
            .grid-dot.noise {
                background: rgba(34, 211, 238, 0.3);
                box-shadow: 0 0 8px rgba(34, 211, 238, 0.2);
            }
            .coord-label {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.7rem;
                color: var(--accent-cyan);
                white-space: nowrap;
                font-family: 'JetBrains Mono', monospace;
            }
            .quantum-icon {
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 3rem;
                background: rgba(0,0,0,0.5);
                padding: 10px;
                border-radius: 12px;
                border: 1px solid var(--accent-magenta);
                animation: pulse 2s infinite;
            }

            /* 2. Merkle Tree Styles */
            .merkle-viz {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 3rem;
                width: 100%;
            }
            .merkle-level {
                display: flex;
                justify-content: space-around;
                width: 100%;
                position: relative;
            }
            .tree-node {
                width: 60px;
                height: 40px;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
                z-index: 2;
            }
            .tree-node.highlight {
                border-color: var(--accent-violet);
                box-shadow: 0 0 15px var(--accent-violet);
                background: rgba(168, 85, 247, 0.2);
            }
            .tree-node.sibling {
                border-style: dashed;
                border-color: var(--accent-cyan);
            }
            .tree-node.error {
                border-color: var(--accent-magenta);
                color: var(--accent-magenta);
                box-shadow: 0 0 10px var(--accent-magenta);
            }
            .node-label {
                position: absolute;
                bottom: -18px;
                font-size: 0.6rem;
                color: var(--text-dim);
                white-space: nowrap;
            }
            .tree-svg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            }
            .trace-log {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.85rem;
                background: rgba(0,0,0,0.3);
                padding: 1rem;
                border-radius: 8px;
                margin-top: 1rem;
                color: #ccc;
            }
            .trace-line {
                margin-bottom: 0.5rem;
                opacity: 0;
                transform: translateX(-10px);
                transition: all 0.5s;
            }
            .trace-line.visible {
                opacity: 1;
                transform: translateX(0);
            }

            /* 3. Hamming Code Styles */
            .hamming-viz {
                display: flex;
                flex-direction: column;
                gap: 2rem;
                align-items: center;
                width: 100%;
            }
            .hamming-row {
                display: flex;
                gap: 8px;
                perspective: 1000px;
            }
            .bit-box {
                width: 32px;
                height: 45px;
                background: var(--glass-bg);
                border: 1px solid #fff;
                border-radius: 4px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
            }
            .bit-box.parity {
                border-color: var(--accent-cyan);
            }
            .bit-box.error {
                background: rgba(244, 63, 94, 0.3);
                border-color: var(--accent-magenta);
                animation: shake 0.5s;
            }
            .bit-box.fixed {
                background: rgba(16, 185, 129, 0.3);
                border-color: #10b981;
            }
            .bit-box.scanning {
                box-shadow: 0 0 15px var(--accent-cyan);
                transform: scale(1.1);
            }
            .bit-val {
                font-family: 'JetBrains Mono', monospace;
                font-weight: 700;
                font-size: 1.1rem;
            }
            .bit-pos {
                font-size: 0.6rem;
                color: var(--text-dim);
                margin-top: 2px;
            }
            .syndrome-calc {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.8rem;
                width: 100%;
                background: rgba(0,0,0,0.2);
                padding: 1rem;
                border-radius: 8px;
            }
            .syndrome-line {
                margin-bottom: 4px;
                color: var(--text-dim);
            }
            .syndrome-line.active {
                color: var(--accent-cyan);
                font-weight: bold;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(0.95); }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-4px); }
                75% { transform: translateX(4px); }
            }
        </style>

        <div class="principles-container">
            <!-- 1. Lattice Panel -->
            <div class="principle-panel" id="panel-lattice">
                <div class="principle-visual">
                    <div class="lattice-grid" id="lattice-grid">
                        ${Array(49).fill(0).map((_, i) => `
                            <div class="grid-dot" data-index="${i}"></div>
                        `).join('')}
                    </div>
                    <div id="quantum-shield" class="quantum-icon" style="display:none">🖥️ ❌</div>
                </div>
                <div class="principle-tutorial">
                    <div class="step-content">
                        <div class="step-title" id="lattice-title">格密码探索</div>
                        <div class="step-desc" id="lattice-desc">点击格点选择秘密位置以开始交互实验。</div>
                        <div class="step-actions">
                            <button class="btn-next" id="lattice-next" style="display:none">下一步</button>
                            <button class="btn-reset" id="lattice-reset">重置</button>
                        </div>
                    </div>
                    <div class="panel-footer">
                        <div class="analogy-box">"${principles.find(p => p.id === 'lattice').analogy}"</div>
                        <div class="algo-labels">
                            <span class="algo-label">ML-KEM</span>
                            <span class="algo-label">ML-DSA</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. Hash Tree Panel -->
            <div class="principle-panel" id="panel-hash">
                <div class="principle-visual">
                    <div class="merkle-viz">
                        <svg class="tree-svg" id="tree-lines"></svg>
                        <div class="merkle-level">
                            <div class="tree-node" id="node-root" data-val="f091">
                                <span class="node-val">f091</span>
                                <span class="node-label">Root</span>
                            </div>
                        </div>
                        <div class="merkle-level">
                            <div class="tree-node" id="node-h0" data-val="d4e8">
                                <span class="node-val">d4e8</span>
                                <span class="node-label">H0</span>
                            </div>
                            <div class="tree-node" id="node-h1" data-val="9a2f">
                                <span class="node-val">9a2f</span>
                                <span class="node-label">H1</span>
                            </div>
                        </div>
                        <div class="merkle-level">
                            <div class="tree-node leaf" id="node-l0" data-val="a3f2">
                                <span class="node-val">a3f2</span>
                                <span class="node-label">L0</span>
                            </div>
                            <div class="tree-node leaf" id="node-l1" data-val="7b1c">
                                <span class="node-val">7b1c</span>
                                <span class="node-label">L1</span>
                            </div>
                            <div class="tree-node leaf" id="node-l2" data-val="e5d9">
                                <span class="node-val">e5d9</span>
                                <span class="node-label">L2</span>
                            </div>
                            <div class="tree-node leaf" id="node-l3" data-val="2f8a">
                                <span class="node-val">2f8a</span>
                                <span class="node-label">L3</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="principle-tutorial">
                    <div class="step-content">
                        <div class="step-title">哈希树验证</div>
                        <div class="step-desc" id="hash-desc">点击任意叶子节点开始追踪认证路径。</div>
                        <div class="trace-log" id="hash-log" style="display:none"></div>
                        <div class="step-actions">
                            <button class="btn-next" id="hash-tamper">篡改实验</button>
                            <button class="btn-reset" id="hash-reset">重置</button>
                        </div>
                    </div>
                    <div class="panel-footer">
                        <div class="analogy-box">"${principles.find(p => p.id === 'hash').analogy}"</div>
                        <div class="algo-labels">
                            <span class="algo-label">SLH-DSA</span>
                            <span class="algo-label">XMSS / LMS</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Error Correction Panel -->
            <div class="principle-panel" id="panel-code">
                <div class="principle-visual">
                    <div class="hamming-viz">
                        <div class="hamming-row" id="hamming-bits">
                            <!-- Bits will be injected here -->
                        </div>
                        <div class="syndrome-calc" id="syndrome-calc" style="display:none">
                            <div class="syndrome-line" id="s1-line">s1 = P1⊕D3⊕D5⊕D7⊕D9⊕D11⊕D13⊕D15 = ?</div>
                            <div class="syndrome-line" id="s2-line">s2 = P2⊕D3⊕D6⊕D7⊕D10⊕D11⊕D14⊕D15 = ?</div>
                            <div class="syndrome-line" id="s4-line">s4 = P4⊕D5⊕D6⊕D7⊕D12⊕D13⊕D14⊕D15 = ?</div>
                            <div class="syndrome-line" id="s8-line">s8 = P8⊕D9⊕D10⊕D11⊕D12⊕D13⊕D14⊕D15 = ?</div>
                            <div class="syndrome-line" id="syndrome-result" style="margin-top:10px; color:white;"></div>
                        </div>
                    </div>
                </div>
                <div class="principle-tutorial">
                    <div class="step-content">
                        <div class="step-title">纠错码恢复</div>
                        <div class="step-desc" id="code-desc">这是一个有效的 Hamming(15,11) 码。青色位是校验位（位置 1,2,4,8），白色位是数据位。点击任意一位翻转来模拟信道噪声。</div>
                        <div class="step-actions">
                            <button class="btn-next" id="code-repair" style="display:none">执行纠错</button>
                            <button class="btn-reset" id="code-reset">重置</button>
                        </div>
                    </div>
                    <div class="panel-footer">
                        <div class="analogy-box">"${principles.find(p => p.id === 'code').analogy}"</div>
                        <div class="algo-labels">
                            <span class="algo-label">HQC</span>
                            <span class="algo-label">McEliece</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initLatticeInteraction(container);
    initHashInteraction(container);
    initCodeInteraction(container);
}

// 1. Lattice Interaction Logic
function initLatticeInteraction(container) {
    const grid = container.querySelector('#lattice-grid');
    const dots = grid.querySelectorAll('.grid-dot');
    const title = container.querySelector('#lattice-title');
    const desc = container.querySelector('#lattice-desc');
    const nextBtn = container.querySelector('#lattice-next');
    const resetBtn = container.querySelector('#lattice-reset');
    const shield = container.querySelector('#quantum-shield');

    let step = 0;
    let secretIndex = -1;

    const reset = () => {
        step = 0;
        secretIndex = -1;
        dots.forEach(d => {
            d.className = 'grid-dot';
            d.innerHTML = '';
        });
        title.innerText = '格密码探索';
        desc.innerText = '点击格点选择秘密位置以开始交互实验。';
        nextBtn.style.display = 'none';
        shield.style.display = 'none';
    };

    grid.addEventListener('click', (e) => {
        if (step !== 0) return;
        const dot = e.target.closest('.grid-dot');
        if (!dot) return;

        secretIndex = parseInt(dot.dataset.index);
        dot.classList.add('secret');
        const x = secretIndex % 7;
        const y = Math.floor(secretIndex / 7);
        dot.innerHTML = `<span class="coord-label">(${x},${y})</span>`;

        step = 1;
        title.innerText = 'Step 1: 经典密码';
        desc.innerText = '🔓 经典密码就像在地图上标注精确坐标——知道算法就能直接算出位置。量子计算机可以用 Shor 算法在多项式时间内破解。';
        nextBtn.style.display = 'block';
        nextBtn.innerText = '下一步：加噪保护 →';
    });

    nextBtn.addEventListener('click', () => {
        if (step === 1) {
            step = 2;
            title.innerText = 'Step 2: 加噪保护';
            desc.innerText = '🛡️ 格密码在秘密位置周围注入随机噪声——攻击者看到的是一团模糊区域，无法确定哪个才是真正的秘密点。这就是 LWE（Learning With Errors）的核心思想。';
            
            // Add noise around secret
            const sx = secretIndex % 7;
            const sy = Math.floor(secretIndex / 7);
            dots.forEach((d, i) => {
                const x = i % 7;
                const y = Math.floor(i / 7);
                const dist = Math.abs(x - sx) + Math.abs(y - sy);
                if (dist > 0 && dist <= 2 && Math.random() > 0.3) {
                    d.classList.add('noise');
                }
            });
            nextBtn.innerText = '下一步：量子挑战 →';
        } else if (step === 2) {
            step = 3;
            title.innerText = 'Step 3: 量子也无解';
            desc.innerText = '🔒 即使量子计算机也无法从噪声中精确恢复秘密向量——最短向量问题（SVP）和最近向量问题（CVP）目前没有已知的量子多项式时间算法。这就是 ML-KEM 和 ML-DSA 的安全基础。';
            shield.style.display = 'block';
            nextBtn.style.display = 'none';
        }
    });

    resetBtn.addEventListener('click', reset);
}

// 2. Hash Tree Interaction Logic
function initHashInteraction(container) {
    const leaves = container.querySelectorAll('.tree-node.leaf');
    const nodes = container.querySelectorAll('.tree-node');
    const desc = container.querySelector('#hash-desc');
    const log = container.querySelector('#hash-log');
    const tamperBtn = container.querySelector('#hash-tamper');
    const resetBtn = container.querySelector('#hash-reset');
    const svg = container.querySelector('#tree-lines');

    const drawLines = () => {
        svg.innerHTML = '';
        const connect = (id1, id2) => {
            const el1 = container.querySelector(`#${id1}`);
            const el2 = container.querySelector(`#${id2}`);
            const rect1 = el1.getBoundingClientRect();
            const rect2 = el2.getBoundingClientRect();
            const parentRect = svg.getBoundingClientRect();

            const x1 = rect1.left + rect1.width / 2 - parentRect.left;
            const y1 = rect1.top + rect1.height / 2 - parentRect.top;
            const x2 = rect2.left + rect2.width / 2 - parentRect.left;
            const y2 = rect2.top + rect2.height / 2 - parentRect.top;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'rgba(255,255,255,0.1)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
        };

        connect('node-root', 'node-h0');
        connect('node-root', 'node-h1');
        connect('node-h0', 'node-l0');
        connect('node-h0', 'node-l1');
        connect('node-h1', 'node-l2');
        connect('node-h1', 'node-l3');
    };

    setTimeout(drawLines, 100);

    const reset = () => {
        nodes.forEach(n => {
            n.className = n.classList.contains('leaf') ? 'tree-node leaf' : 'tree-node';
            n.querySelector('.node-val').innerText = n.dataset.val;
        });
        desc.style.display = 'block';
        log.style.display = 'none';
        log.innerHTML = '';
    };

    leaves.forEach(leaf => {
        leaf.addEventListener('click', async () => {
            reset();
            desc.style.display = 'none';
            log.style.display = 'block';
            
            const id = leaf.id;
            const path = [];
            const siblings = [];
            
            if (id === 'node-l0') { path.push('node-l0', 'node-h0', 'node-root'); siblings.push('node-l1', 'node-h1'); }
            else if (id === 'node-l1') { path.push('node-l1', 'node-h0', 'node-root'); siblings.push('node-l0', 'node-h1'); }
            else if (id === 'node-l2') { path.push('node-l2', 'node-h1', 'node-root'); siblings.push('node-l3', 'node-h0'); }
            else if (id === 'node-l3') { path.push('node-l3', 'node-h1', 'node-root'); siblings.push('node-l2', 'node-h0'); }

            const steps = [
                `📄 叶子数据: ${id.slice(-2).toUpperCase()} = hash('data_${id.slice(-1)}') = ${leaf.dataset.val}`,
                `🔗 与兄弟 ${siblings[0].slice(-2).toUpperCase()}(${container.querySelector('#'+siblings[0]).dataset.val}) 拼接 → hash(...) = ${container.querySelector('#'+path[1]).dataset.val}`,
                `🔗 与兄弟 ${siblings[1].slice(-2).toUpperCase()}(${container.querySelector('#'+siblings[1]).dataset.val}) 拼接 → hash(...) = ${container.querySelector('#'+path[2]).dataset.val} ✅ 根值匹配！`,
                `💡 验证者只需持有根值，就能验证任意叶子的真实性。`
            ];

            for (let i = 0; i < path.length; i++) {
                await new Promise(r => setTimeout(r, 500));
                container.querySelector('#' + path[i]).classList.add('highlight');
                if (i < 2) container.querySelector('#' + siblings[i]).classList.add('sibling');
                
                const line = document.createElement('div');
                line.className = 'trace-line';
                line.innerText = steps[i];
                log.appendChild(line);
                setTimeout(() => line.classList.add('visible'), 10);
            }
        });
    });

    tamperBtn.addEventListener('click', () => {
        reset();
        const l0 = container.querySelector('#node-l0');
        const h0 = container.querySelector('#node-h0');
        const root = container.querySelector('#node-root');

        l0.querySelector('.node-val').innerText = 'xxxx';
        l0.classList.add('error');
        
        setTimeout(() => {
            h0.querySelector('.node-val').innerText = 'beef';
            h0.classList.add('error');
        }, 500);

        setTimeout(() => {
            root.querySelector('.node-val').innerText = 'dead';
            root.classList.add('error');
            desc.innerText = '篡改一个叶子 → 整条路径的哈希全部改变 → 根值不再匹配 → 篡改被发现！';
        }, 1000);
    });

    resetBtn.addEventListener('click', reset);
}

// 3. Hamming Code Interaction Logic
function initCodeInteraction(container) {
    const bitContainer = container.querySelector('#hamming-bits');
    const desc = container.querySelector('#code-desc');
    const repairBtn = container.querySelector('#code-repair');
    const resetBtn = container.querySelector('#code-reset');
    const calcPanel = container.querySelector('#syndrome-calc');

    // Valid Hamming(15,11) codeword for data [1,0,1,1,0,0,1,0,1,1,0]
    // Positions: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
    // Bits:      0, 1, 1, 0, 0, 1, 1, 1, 0,  0,  1,  0,  1,  1,  0
    const original = [0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0];
    let current = [...original];

    const renderBits = () => {
        bitContainer.innerHTML = current.map((b, i) => {
            const pos = i + 1;
            const isParity = [1, 2, 4, 8].includes(pos);
            return `
                <div class="bit-box ${isParity ? 'parity' : ''} ${current[i] !== original[i] ? 'error' : ''}" data-index="${i}">
                    <span class="bit-val">${b}</span>
                    <span class="bit-pos">${pos}</span>
                    <span style="font-size:0.5rem; color:var(--accent-cyan)">${isParity ? 'P' : 'D'}</span>
                </div>
            `;
        }).join('');
    };

    renderBits();

    bitContainer.addEventListener('click', (e) => {
        const box = e.target.closest('.bit-box');
        if (!box) return;
        const idx = parseInt(box.dataset.index);
        current[idx] = current[idx] === 0 ? 1 : 0;
        renderBits();
        
        const hasError = current.some((b, i) => b !== original[i]);
        if (hasError) {
            const errorIdx = current.findIndex((b, i) => b !== original[i]);
            desc.innerText = `⚡ 位 ${errorIdx + 1} 被翻转！信道噪声注入了 1 位错误。点击'纠错'按钮启动校验。`;
            repairBtn.style.display = 'block';
        } else {
            desc.innerText = `这是一个有效的 Hamming(15,11) 码。点击任意一位翻转来模拟信道噪声。`;
            repairBtn.style.display = 'none';
        }
    });

    repairBtn.addEventListener('click', async () => {
        repairBtn.style.display = 'none';
        calcPanel.style.display = 'block';
        const boxes = bitContainer.querySelectorAll('.bit-box');
        
        const getVal = (pos) => current[pos-1];
        
        const checkGroups = [
            { id: 's1', bits: [1, 3, 5, 7, 9, 11, 13, 15] },
            { id: 's2', bits: [2, 3, 6, 7, 10, 11, 14, 15] },
            { id: 's4', bits: [4, 5, 6, 7, 12, 13, 14, 15] },
            { id: 's8', bits: [8, 9, 10, 11, 12, 13, 14, 15] }
        ];

        let syndrome = 0;
        const sResults = [];

        for (let i = 0; i < checkGroups.length; i++) {
            const group = checkGroups[i];
            const line = container.querySelector(`#${group.id}-line`);
            line.classList.add('active');
            
            // Highlight group bits
            group.bits.forEach(p => boxes[p-1].classList.add('scanning'));
            
            await new Promise(r => setTimeout(r, 800));
            
            const val = group.bits.reduce((acc, p) => acc ^ getVal(p), 0);
            sResults.push(val);
            if (val === 1) syndrome += Math.pow(2, i);
            
            line.innerText = `${group.id} = ${group.bits.map(p => (p==group.bits[0]?'P':'D')+p).join('⊕')} = ${val}`;
            group.bits.forEach(p => boxes[p-1].classList.remove('scanning'));
            line.classList.remove('active');
        }

        const resultLine = container.querySelector('#syndrome-result');
        resultLine.innerText = `📍 错误位置 = s8×8 + s4×4 + s2×2 + s1×1 = ${syndrome} → 第 ${syndrome} 位出错！`;
        
        if (syndrome > 0) {
            await new Promise(r => setTimeout(r, 800));
            boxes[syndrome-1].classList.add('scanning');
            await new Promise(r => setTimeout(r, 800));
            current[syndrome-1] = current[syndrome-1] === 0 ? 1 : 0;
            renderBits();
            bitContainer.querySelectorAll('.bit-box')[syndrome-1].classList.add('fixed');
            desc.innerText = `✅ 纠错完成！Hamming 码通过校验矩阵精确定位并修复了 1 位错误。HQC 就是基于这种纠错能力构建密钥封装的。`;
        }
    });

    resetBtn.addEventListener('click', () => {
        current = [...original];
        renderBits();
        calcPanel.style.display = 'none';
        repairBtn.style.display = 'none';
        desc.innerText = `这是一个有效的 Hamming(15,11) 码。青色位是校验位（位置 1,2,4,8），白色位是数据位。点击任意一位翻转来模拟信道噪声。`;
    });
}

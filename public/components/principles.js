import { principles } from '../data.js';

export function renderPrinciples(container) {
    container.innerHTML = `
        <style>
            .principles-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
                margin-top: 2rem;
            }
            .principle-card {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1rem;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                transition: transform 0.3s ease;
            }
            .principle-card:hover {
                transform: translateY(-5px);
            }
            .principle-header {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .principle-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #fff;
            }
            .hard-problem-tag {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.7rem;
                color: var(--accent-cyan);
                background: rgba(34, 211, 238, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                align-self: flex-start;
            }
            .visual-area {
                height: 180px;
                background: rgba(0,0,0,0.2);
                border-radius: 0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            /* Lattice Visual */
            .lattice-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 12px;
            }
            .lattice-dot {
                width: 6px;
                height: 6px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
            }
            .target-dot {
                background: var(--accent-cyan);
                box-shadow: 0 0 10px var(--accent-cyan);
                position: relative;
            }
            .noise-cloud {
                position: absolute;
                width: 40px;
                height: 40px;
                background: radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
                pointer-events: none;
                animation: drift 4s infinite ease-in-out;
            }
            @keyframes drift {
                0%, 100% { transform: translate(-10px, -10px); }
                50% { transform: translate(10px, 10px); }
            }

            /* Merkle Tree Visual */
            .merkle-tree {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1.5rem;
                width: 100%;
            }
            .merkle-row {
                display: flex;
                gap: 1.5rem;
                position: relative;
            }
            .merkle-node {
                width: 24px;
                height: 24px;
                border: 1px solid var(--glass-border);
                border-radius: 4px;
                background: var(--glass-bg);
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            .merkle-node.active {
                background: var(--accent-violet);
                border-color: var(--accent-violet);
                box-shadow: 0 0 8px var(--accent-violet);
            }

            /* Code Visual */
            .code-visual {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                align-items: center;
                width: 100%;
            }
            .codeword {
                font-family: 'JetBrains Mono', monospace;
                letter-spacing: 4px;
                font-size: 1rem;
                background: rgba(0,0,0,0.3);
                padding: 8px 12px;
                border-radius: 4px;
            }
            .bit-error { color: var(--accent-magenta); font-weight: bold; }
            .bit-fixed { color: var(--accent-cyan); font-weight: bold; }
            .code-btn {
                font-size: 0.75rem;
                padding: 4px 12px;
                border-radius: 4px;
                background: var(--accent-blue);
                color: white;
                border: none;
                cursor: pointer;
            }

            .principle-footer {
                margin-top: auto;
            }
            .analogy-text {
                font-size: 0.85rem;
                color: var(--text-dim);
                line-height: 1.5;
                font-style: italic;
                margin-bottom: 1rem;
            }
            .algo-tags {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .algo-tag {
                font-size: 0.7rem;
                padding: 2px 8px;
                border-radius: 10px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
            }
        </style>
        <div class="principles-grid">
            ${principles.map(p => `
                <div class="principle-card card-corners">
                    <div class="principle-header">
                        <span class="principle-title">${p.label}</span>
                        <span class="hard-problem-tag">困难问题: ${p.hardProblem}</span>
                    </div>
                    
                    <div class="visual-area" id="visual-${p.id}">
                        ${renderVisual(p.visualType)}
                    </div>

                    <div class="principle-footer">
                        <p class="analogy-text">"${p.analogy}"</p>
                        <div class="algo-tags">
                            ${p.algorithms.map(a => `<span class="algo-tag">${a.toUpperCase()}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    setupInteractions(container);
}

function renderVisual(type) {
    if (type === 'lattice') {
        return `
            <div class="lattice-grid">
                ${Array(25).fill(0).map((_, i) => `
                    <div class="lattice-dot ${i === 12 ? 'target-dot' : ''}">
                        ${i === 12 ? '<div class="noise-cloud"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else if (type === 'merkle') {
        return `
            <div class="merkle-tree">
                <div class="merkle-row">
                    <div class="merkle-node" id="m-root">R</div>
                </div>
                <div class="merkle-row">
                    <div class="merkle-node" id="m-1-0">H</div>
                    <div class="merkle-node" id="m-1-1">H</div>
                </div>
                <div class="merkle-row">
                    <div class="merkle-node leaf" data-idx="0">L</div>
                    <div class="merkle-node leaf" data-idx="1">L</div>
                    <div class="merkle-node leaf" data-idx="2">L</div>
                    <div class="merkle-node leaf" data-idx="3">L</div>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-dim)">点击叶子节点查看认证路径</div>
            </div>
        `;
    } else if (type === 'code') {
        return `
            <div class="code-visual">
                <div class="codeword" id="codeword-display">10110010110</div>
                <button class="code-btn" id="code-action-btn">注入错误</button>
            </div>
        `;
    }
    return '';
}

function setupInteractions(container) {
    // Merkle Tree Interaction
    const leaves = container.querySelectorAll('.merkle-node.leaf');
    leaves.forEach(leaf => {
        leaf.addEventListener('click', () => {
            const idx = parseInt(leaf.dataset.idx);
            container.querySelectorAll('.merkle-node').forEach(n => n.classList.remove('active'));
            leaf.classList.add('active');
            
            // Highlight path (simplified logic for 3 layers)
            const parentIdx = Math.floor(idx / 2);
            container.querySelector(`#m-1-${parentIdx}`).classList.add('active');
            container.querySelector('#m-root').classList.add('active');
        });
    });

    // Code Correction Interaction
    const codeBtn = container.querySelector('#code-action-btn');
    const display = container.querySelector('#codeword-display');
    let state = 'normal';
    const original = "10110010110";
    
    codeBtn.addEventListener('click', () => {
        if (state === 'normal') {
            display.innerHTML = `101<span class="bit-error">01</span>010110`;
            codeBtn.innerText = '执行纠错';
            state = 'error';
        } else {
            display.innerHTML = `101<span class="bit-fixed">10</span>010110`;
            codeBtn.innerText = '重置';
            state = 'fixed';
        } else if (state === 'fixed') {
            display.innerHTML = original;
            codeBtn.innerText = '注入错误';
            state = 'normal';
        }
    });
}

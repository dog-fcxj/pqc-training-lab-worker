import { scenarios } from '../data.js';

export function renderHandshake(container) {
    let activeScenarioId = scenarios[0].id;

    function update() {
        const scenario = scenarios.find(s => s.id === activeScenarioId);
        
        const analysisMap = {
            'tls-classic': "问题不在「今天能不能被秒破」，而在「今天截获的数据，明天还能不能保密」。",
            'tls-hybrid': "混合模式的核心价值不是「更前沿」，而是「单一路线失守时，会话仍有另一条安全来源兜底」。",
            'ikev2-pq': "IKEv2 不是把 TLS 的做法平移过去，而是要把算法升级、设备能力和运维流程一起验证。"
        };

        container.innerHTML = `
            <style>
                .handshake-lab {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    margin-top: 1rem;
                }
                .scene-tabs {
                    display: flex;
                    gap: 1rem;
                    border-bottom: 1px solid var(--glass-border);
                }
                .scene-tab {
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    color: var(--text-dim);
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s;
                }
                .scene-tab.active {
                    color: var(--accent-cyan);
                    border-bottom-color: var(--accent-cyan);
                    background: rgba(34, 211, 238, 0.05);
                }
                
                .main-display {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 2rem;
                }
                
                .sequence-diagram {
                    background: rgba(0,0,0,0.2);
                    border-radius: 1rem;
                    padding: 2rem;
                    position: relative;
                    min-height: 400px;
                }
                .diag-headers {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    font-weight: bold;
                    color: var(--text-dim);
                }
                .diag-line {
                    position: absolute;
                    top: 4rem;
                    bottom: 2rem;
                    width: 2px;
                    background: var(--glass-border);
                    z-index: 0;
                }
                .diag-line.client { left: 4rem; }
                .diag-line.server { right: 4rem; }
                
                .step-arrow {
                    position: relative;
                    margin-bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }
                .arrow-body-wrapper {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    position: relative;
                }
                .arrow-body {
                    flex: 1;
                    height: 2px;
                    background: var(--accent-cyan);
                    margin: 0 1rem;
                    position: relative;
                }
                .arrow-head {
                    position: absolute;
                    top: -4px;
                    width: 10px;
                    height: 10px;
                    border-top: 2px solid var(--accent-cyan);
                    border-right: 2px solid var(--accent-cyan);
                }
                .to-server .arrow-head { right: 0; transform: rotate(45deg); }
                .to-client .arrow-head { left: 0; transform: rotate(-135deg); }
                .arrow-label {
                    background: var(--glass-bg);
                    padding: 0.25rem 0.75rem;
                    border: 1px solid var(--glass-border);
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    z-index: 2;
                }
                .diagram-note {
                    font-size: 0.72rem;
                    color: var(--text-dim);
                    background: rgba(255,255,255,0.04);
                    border-radius: 0.75rem;
                    padding: 0.5rem 0.75rem;
                    max-width: 280px;
                    margin-top: 0.4rem;
                    text-align: center;
                    line-height: 1.3;
                }

                .metrics-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .metric-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    padding: 1rem;
                    border-radius: 0.75rem;
                }
                .metric-title { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.25rem; }
                .metric-value { font-size: 1.25rem; font-weight: bold; color: var(--accent-cyan); }
                
                .packet-visual {
                    padding: 1.5rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: 1rem;
                }
                .packet-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 1rem;
                }
                .packet-box {
                    width: 12px;
                    height: 12px;
                    background: var(--accent-cyan);
                    border-radius: 2px;
                    opacity: 0.8;
                }
                .packet-box.classic { background: var(--text-dim); }
                .packet-box.extra { background: var(--accent-violet); }

                .comparison-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                .comp-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .comp-badge {
                    font-size: 0.7rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 0.5rem;
                    width: fit-content;
                    font-weight: bold;
                }
                .badge-red { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
                .badge-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
                .badge-orange { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
                .badge-cyan { background: rgba(34, 211, 238, 0.15); color: #22d3ee; }
                
                .comp-headline { font-weight: bold; font-size: 1.05rem; }
                .comp-body { font-size: 0.85rem; color: var(--text-dim); line-height: 1.5; }
            </style>
            
            <div class="handshake-lab">
                <div class="scene-tabs">
                    ${scenarios.map(s => `
                        <div class="scene-tab ${s.id === activeScenarioId ? 'active' : ''}" data-id="${s.id}">
                            ${s.label}
                        </div>
                    `).join('')}
                </div>

                <div class="main-display">
                    <div class="sequence-diagram card-corners">
                        <div class="diag-headers">
                            <span>Client / Initiator</span>
                            <span>Server / Responder</span>
                        </div>
                        <div class="diag-line client"></div>
                        <div class="diag-line server"></div>
                        
                        <div style="margin-top: 1rem">
                            ${scenario.steps.map(step => {
                                const isToServer = step.to === 'Server' || step.to === 'Responder';
                                const isBoth = step.from === 'Both';
                                if (isBoth) return `
                                    <div style="text-align:center; margin: 2rem 0; font-size: 0.8rem; color: var(--accent-magenta); font-style: italic; display: flex; flex-direction: column; align-items: center; gap: 0.5rem">
                                        <div>${step.label}</div>
                                        ${step.diagramNote ? `<div class="diagram-note">${step.diagramNote}</div>` : ''}
                                    </div>
                                `;
                                return `
                                    <div class="step-arrow ${isToServer ? 'to-server' : 'to-client'}" style="padding: 0 4rem">
                                        <div class="arrow-body-wrapper">
                                            <div class="arrow-body">
                                                <div class="arrow-head"></div>
                                            </div>
                                            <div class="arrow-label">${step.label}</div>
                                        </div>
                                        ${step.diagramNote ? `<div class="diagram-note">${step.diagramNote}</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="metrics-panel">
                        <div class="metric-card">
                            <div class="metric-title">客户端额外载荷</div>
                            <div class="metric-value">+${scenario.clientExtra} B</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">服务端额外载荷</div>
                            <div class="metric-value">+${scenario.serverExtra} B</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">最大单个对象</div>
                            <div class="metric-value">${scenario.largestObject} B</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-title">延迟影响估算</div>
                            <div class="metric-value" style="color: var(--accent-magenta)">${scenario.latencyImpact}</div>
                        </div>
                        
                        <div class="metric-card">
                            <div class="metric-title">场景说明</div>
                            <div style="font-size: 0.85rem; line-height: 1.4">${scenario.notes}</div>
                            <div style="margin-top: 0.5rem">
                                ${scenario.facts.map(f => `<span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${f}</span>`).join('')}
                            </div>
                        </div>

                        <div class="metric-card" style="margin-top: auto; border-left: 3px solid var(--accent-cyan)">
                            <div class="metric-title">场景分析</div>
                            <div style="font-size: 0.85rem; line-height: 1.5; color: var(--accent-cyan); font-style: italic">
                                "${analysisMap[scenario.id]}"
                            </div>
                        </div>
                    </div>
                </div>

                <div class="packet-visual card-corners">
                    <h4 style="margin-top:0">数据包大小可视化 (1方块 ≈ 32B)</h4>
                    <div class="packet-grid">
                        ${renderPacketBoxes(scenario.id)}
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-dim); display: flex; gap: 1.5rem">
                        <span style="display:flex; align-items:center; gap:0.5rem"><div class="packet-box classic" style="width:10px; height:10px"></div> 经典 (X25519)</span>
                        <span style="display:flex; align-items:center; gap:0.5rem"><div class="packet-box extra" style="width:10px; height:10px"></div> PQC 额外载荷 (ML-KEM)</span>
                    </div>
                </div>

                <div class="comparison-grid">
                    <div class="comp-card">
                        <div class="comp-badge badge-red">风险基线</div>
                        <div class="comp-headline">兼容性最好，但对 HNDL 零防护</div>
                        <div class="comp-body">如果数据的保密寿命只有很短几小时或几天，经典 TLS 仍是最低摩擦路径；但只要数据需要保密多年，它就不应再被视为长期答案。</div>
                    </div>
                    <div class="comp-card">
                        <div class="comp-badge badge-green">推荐起点</div>
                        <div class="comp-headline">保留现网兼容性，同时把 PQ 安全性接进来</div>
                        <div class="comp-body">它的优势不只是「更安全」，而是迁移成本可控：不强迫你立刻抛弃经典体系，却能先把 HNDL 风险压下去，是互联网入口最现实的第一步。</div>
                    </div>
                    <div class="comp-card">
                        <div class="comp-badge badge-orange">高运维要求</div>
                        <div class="comp-headline">安全收益明确，但落地成败取决于设备与网络</div>
                        <div class="comp-body">对分支互联、站点到站点隧道和长期敏感流量很有价值，但必须先验证分片、NAT-T、固件能力和跨厂商互通，不能只看算法本身。</div>
                    </div>
                    <div class="comp-card">
                        <div class="comp-badge badge-cyan">迁移路线</div>
                        <div class="comp-headline">先从最有价值、最容易落地的链路开始</div>
                        <div class="comp-body">公网入口优先推进混合 TLS；长期高敏数据优先覆盖；IKEv2 场景先做实验室压测和小范围试点，再逐步推广到生产隧道。</div>
                    </div>
                </div>
            </div>
        `;

        setupListeners();
    }

    function renderPacketBoxes(id) {
        if (id === 'tls-classic') {
            return `<div class="packet-box classic"></div>`;
        }
        const extra = id === 'tls-hybrid' ? 38 : 34;
        return `
            <div class="packet-box classic"></div>
            ${Array(extra).fill(0).map(() => `<div class="packet-box extra"></div>`).join('')}
        `;
    }

    function setupListeners() {
        container.querySelectorAll('.scene-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                activeScenarioId = tab.dataset.id;
                update();
            });
        });
    }

    update();
}

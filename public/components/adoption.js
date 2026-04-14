import { adoptionStats, adoptionSource, standardsTimeline } from '../data.js';

export function renderAdoption(container) {
    container.innerHTML = `
        <style>
            .adoption-dashboard {
                display: flex;
                flex-direction: column;
                gap: 3rem;
                margin-top: 1rem;
            }
            .stats-rings {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 2rem;
            }
            .ring-card {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1rem;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 1rem;
            }
            .ring-visual {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                background: conic-gradient(var(--ring-color) var(--percent), rgba(255,255,255,0.05) 0deg);
            }
            .ring-visual::after {
                content: '';
                position: absolute;
                width: 100px;
                height: 100px;
                background: #0f172a; /* Same as body bg */
                border-radius: 50%;
            }
            .ring-inner-text {
                position: relative;
                z-index: 1;
                font-size: 1.5rem;
                font-weight: 700;
            }
            .ring-label { font-size: 0.85rem; color: var(--text-dim); line-height: 1.3; }
            .prev-val { font-size: 0.7rem; color: var(--accent-magenta); margin-top: 0.25rem; }

            .timeline-container {
                position: relative;
                padding: 4rem 0;
                overflow-x: auto;
            }
            .timeline-line {
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--glass-border);
                z-index: 0;
            }
            .timeline-nodes {
                display: flex;
                justify-content: space-between;
                position: relative;
                z-index: 1;
                min-width: 800px;
            }
            .timeline-node {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 120px;
                position: relative;
            }
            .node-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--node-color);
                margin-bottom: 1rem;
                box-shadow: 0 0 10px var(--node-color);
            }
            .node-date { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-dim); margin-bottom: 0.25rem; }
            .node-label { font-size: 0.75rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem; height: 2.5rem; overflow: hidden; }
            .node-detail { 
                position: absolute;
                top: 100%;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.7rem;
                width: 160px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s;
                z-index: 10;
            }
            .timeline-node:hover .node-detail { opacity: 1; }

            .source-footer {
                text-align: right;
                font-size: 0.75rem;
                color: var(--text-dim);
                font-style: italic;
            }
        </style>
        
        <div class="adoption-dashboard">
            <div class="stats-rings">
                ${adoptionStats.map(s => `
                    <div class="ring-card card-corners">
                        <div class="ring-visual" style="--ring-color: ${s.color}; --percent: ${(s.value / 100) * 360}deg">
                            <span class="ring-inner-text">${s.value}${s.unit}</span>
                        </div>
                        <div class="ring-label">${s.label}</div>
                        ${s.prevValue ? `<div class="prev-val">前值: ${s.prevValue}${s.unit} ↑</div>` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="timeline-section">
                <h4 style="margin-bottom: 1rem">PQC 标准化与迁移时间线</h4>
                <div class="timeline-container">
                    <div class="timeline-line"></div>
                    <div class="timeline-nodes">
                        ${standardsTimeline.map(t => {
                            const colors = {
                                standard: 'var(--accent-cyan)',
                                guidance: 'var(--accent-violet)',
                                draft: 'var(--accent-magenta)',
                                milestone: '#facc15' // yellow
                            };
                            return `
                                <div class="timeline-node">
                                    <div class="node-date">${t.date}</div>
                                    <div class="node-dot" style="--node-color: ${colors[t.type]}"></div>
                                    <div class="node-label">${t.label}</div>
                                    <div class="node-detail">${t.detail}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="source-footer">数据来源: ${adoptionSource}</div>
        </div>
    `;
}

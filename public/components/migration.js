import { migrationRules, migrationSteps } from '../data.js';

export function renderMigration(container) {
    let selectedIds = new Set();
    let activeStepIdx = 0;

    function update() {
        const recommendations = migrationRules
            .filter(r => selectedIds.has(r.id))
            .sort((a, b) => {
                const p = { critical: 0, high: 1, medium: 2 };
                return p[a.priority] - p[b.priority];
            });

        container.innerHTML = `
            <style>
                .migration-container {
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                    margin-top: 1rem;
                }
                
                .profiler-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .profiler-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                }
                .profiler-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.2s;
                }
                .profiler-card.active {
                    border-color: var(--accent-cyan);
                    background: rgba(34, 211, 238, 0.05);
                }
                .profiler-icon { font-size: 1.5rem; }
                .profiler-info { display: flex; flex-direction: column; }
                .profiler-label { font-weight: bold; font-size: 0.9rem; }
                .profiler-check { font-size: 0.75rem; color: var(--text-dim); }

                .advice-panel {
                    min-height: 100px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px dashed var(--glass-border);
                }
                .advice-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                    padding: 0.75rem;
                    background: rgba(255,255,255,0.03);
                    border-radius: 0.5rem;
                }
                .priority-tag {
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 4px;
                    width: 60px;
                    text-align: center;
                }
                .priority-critical { background: var(--accent-magenta); color: white; }
                .priority-high { background: var(--accent-violet); color: white; }
                .priority-medium { background: var(--accent-cyan); color: black; }

                .stepper-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                .stepper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                }
                .stepper-line {
                    position: absolute;
                    top: 25px;
                    left: 50px;
                    right: 50px;
                    height: 2px;
                    background: var(--glass-border);
                    z-index: 0;
                }
                .step-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100px;
                    cursor: pointer;
                    position: relative;
                    z-index: 1;
                }
                .step-circle {
                    width: 50px;
                    height: 50px;
                    background: #0f172a;
                    border: 2px solid var(--glass-border);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    transition: all 0.3s;
                }
                .step-node.active .step-circle {
                    border-color: var(--accent-cyan);
                    box-shadow: 0 0 15px var(--accent-cyan);
                    background: rgba(34, 211, 238, 0.1);
                }
                .step-label { font-size: 0.8rem; font-weight: bold; }
                
                .step-detail-box {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: 1rem;
                    padding: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .step-detail-icon { font-size: 3rem; opacity: 0.5; }
                .step-detail-text h3 { margin-top: 0; color: var(--accent-cyan); }
            </style>
            
            <div class="migration-container">
                <div class="profiler-section">
                    <h4 style="margin:0">系统画像器: 识别您的迁移优先级</h4>
                    <div class="profiler-grid">
                        ${migrationRules.map(r => `
                            <div class="profiler-card ${selectedIds.has(r.id) ? 'active' : ''}" data-id="${r.id}">
                                <span class="profiler-icon">${r.icon}</span>
                                <div class="profiler-info">
                                    <span class="profiler-label">${r.label}</span>
                                    <span class="profiler-check">${r.check}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="advice-panel card-corners">
                        ${recommendations.length > 0 ? `
                            <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem">基于您的画像，我们建议采取以下行动:</div>
                            ${recommendations.map(r => `
                                <div class="advice-item">
                                    <span class="priority-tag priority-${r.priority}">${r.priority}</span>
                                    <span style="font-size: 0.9rem">${r.action}</span>
                                </div>
                            `).join('')}
                        ` : `
                            <div style="height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-dim); font-style: italic">
                                请勾选上方场景以获取定制化迁移建议
                            </div>
                        `}
                    </div>
                </div>

                <div class="stepper-section">
                    <h4 style="margin:0">后量子迁移 5 步路径</h4>
                    <div class="stepper">
                        <div class="stepper-line"></div>
                        ${migrationSteps.map((s, i) => `
                            <div class="step-node ${i === activeStepIdx ? 'active' : ''}" data-idx="${i}">
                                <div class="step-circle">${s.icon}</div>
                                <div class="step-label">${s.label}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="step-detail-box card-corners">
                        <div class="step-detail-icon">${migrationSteps[activeStepIdx].icon}</div>
                        <div class="step-detail-text">
                            <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: 'JetBrains Mono'">STEP 0${activeStepIdx + 1}</span>
                            <h3>${migrationSteps[activeStepIdx].title}</h3>
                            <p style="color: var(--text-dim); line-height: 1.5">${migrationSteps[activeStepIdx].detail}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        setupListeners();
    }

    function setupListeners() {
        container.querySelectorAll('.profiler-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                if (selectedIds.has(id)) selectedIds.delete(id);
                else selectedIds.add(id);
                update();
            });
        });

        container.querySelectorAll('.step-node').forEach(node => {
            node.addEventListener('click', () => {
                activeStepIdx = parseInt(node.dataset.idx);
                update();
            });
        });
    }

    update();
}

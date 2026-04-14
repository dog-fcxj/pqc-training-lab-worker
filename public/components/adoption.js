import { adoptionStats, adoptionSource, standardsTimeline } from '../data.js';

export function renderAdoption(container) {
    // 整理数据以供叙事使用
    const stats = adoptionStats.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
    }, {});

    container.innerHTML = `
        <style>
            .adoption-story {
                display: flex;
                flex-direction: column;
                gap: 3.5rem;
                padding: 1rem 0;
            }

            /* 1. 大标题 + 引导语 */
            .dashboard-header {
                text-align: left;
            }
            .dashboard-header h2 {
                font-size: 2.2rem;
                font-weight: 800;
                margin-bottom: 0.75rem;
                background: linear-gradient(90deg, #fff 0%, var(--accent-cyan) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .dashboard-lead {
                color: var(--text-dim);
                font-size: 0.95rem;
                max-width: 700px;
                line-height: 1.6;
            }

            /* 2. 核心叙事区 */
            .narrative-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
            }
            .narrative-card {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1rem;
                padding: 1.5rem;
                display: flex;
                gap: 1.5rem;
                position: relative;
                overflow: hidden;
            }
            .narrative-left {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 100px;
            }
            .narrative-number {
                font-family: 'JetBrains Mono', monospace;
                font-size: 3rem;
                font-weight: 800;
                line-height: 1;
            }
            .narrative-right {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 0.5rem;
            }
            .narrative-title {
                font-weight: 700;
                font-size: 1.1rem;
                color: #fff;
            }
            .narrative-text {
                font-size: 0.9rem;
                color: var(--text-dim);
                line-height: 1.6;
            }
            
            /* 进度条样式 */
            .growth-container {
                margin-top: 0.75rem;
                background: rgba(255,255,255,0.05);
                height: 6px;
                border-radius: 3px;
                position: relative;
            }
            .growth-bar {
                height: 100%;
                border-radius: 3px;
                background: var(--bar-color);
                width: 0;
                animation: grow 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            @keyframes grow {
                to { width: var(--target-width); }
            }
            .growth-label {
                display: flex;
                justify-content: space-between;
                font-size: 0.7rem;
                color: var(--text-dim);
                margin-top: 4px;
            }

            /* 差距对比图 */
            .gap-compare {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-top: 0.5rem;
            }
            .gap-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .gap-bar-bg {
                flex: 1;
                height: 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 6px;
            }
            .gap-bar {
                height: 100%;
                border-radius: 6px;
                background: var(--bar-color);
                width: var(--val);
            }
            .gap-val {
                font-size: 0.7rem;
                min-width: 30px;
                color: var(--text-dim);
                font-family: 'JetBrains Mono', monospace;
            }

            /* 3. 关键洞察卡片 */
            .insights-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1.25rem;
            }
            .insight-card {
                background: var(--glass-bg);
                border-radius: 0.75rem;
                padding: 1.25rem;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                border: 1px solid var(--glass-border);
            }
            .insight-title {
                color: #fff;
                font-weight: 700;
                font-size: 0.95rem;
            }
            .insight-body {
                color: var(--text-dim);
                font-size: 0.85rem;
                line-height: 1.5;
            }

            /* 4. 时间线增强 */
            .timeline-section {
                padding-top: 2rem;
            }
            .timeline-container {
                position: relative;
                padding: 6rem 0 8rem 0; /* 预留上下交替显示的空间 */
                overflow-x: auto;
                margin: 0 -1rem;
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
                min-width: 1200px;
                padding: 0 50px;
            }
            .timeline-node {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 160px;
                position: relative;
            }
            .node-dot {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: var(--node-color);
                box-shadow: 0 0 12px var(--node-color);
                transition: transform 0.3s;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
            }
            .node-info {
                position: absolute;
                width: 180px;
                text-align: center;
            }
            .node-info.up { bottom: 25px; }
            .node-info.down { top: 25px; }

            .node-date { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--accent-cyan); font-weight: bold; margin-bottom: 4px; }
            .node-label { font-size: 0.85rem; font-weight: bold; color: #fff; margin-bottom: 4px; }
            .node-detail { font-size: 0.75rem; color: var(--text-dim); line-height: 1.4; }

            /* 当前位置标记 */
            .current-marker {
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                z-index: 5;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .current-dot {
                width: 16px;
                height: 16px;
                background: #fff;
                border-radius: 50%;
                box-shadow: 0 0 20px #fff;
                position: relative;
            }
            .current-dot::after {
                content: '';
                position: absolute;
                top: -4px; left: -4px; right: -4px; bottom: -4px;
                border: 2px solid #fff;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(2.5); opacity: 0; }
            }
            .current-label {
                position: absolute;
                bottom: 30px;
                background: #fff;
                color: #000;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.7rem;
                font-weight: 800;
                white-space: nowrap;
            }

            /* 5. 数据来源 */
            .source-footer {
                text-align: right;
                font-size: 0.75rem;
                color: var(--text-dim);
                font-style: italic;
                opacity: 0.6;
            }

            @media (max-width: 1024px) {
                .narrative-grid, .insights-grid { grid-template-columns: 1fr; }
            }
        </style>
        
        <div class="adoption-story">
            <!-- 1. 标题区 -->
            <div class="dashboard-header">
                <h2>全球 PQ 迁移现状</h2>
                <p class="dashboard-lead">超过一半的 Web 流量已受后量子保护，但从边缘到源站的鸿沟仍然巨大。以下数据基于 Cloudflare 2025 年末观测。</p>
            </div>

            <!-- 2. 核心叙事 -->
            <div class="narrative-grid">
                <!-- Card A -->
                <div class="narrative-card card-corners">
                    <div class="narrative-left">
                        <div class="narrative-number" style="color: ${stats['pq-traffic'].color}">${stats['pq-traffic'].value}%</div>
                    </div>
                    <div class="narrative-right">
                        <div class="narrative-title">PQ 流量爆发增长</div>
                        <div class="narrative-text">2025 年末，超过一半的人类 Web 流量已使用后量子加密保护。一年前这个数字还只有 29%——增长近一倍。</div>
                        <div class="growth-container">
                            <div class="growth-bar" style="--bar-color: ${stats['pq-traffic'].color}; --target-width: ${stats['pq-traffic'].value}%"></div>
                        </div>
                        <div class="growth-label">
                            <span>2024: 29%</span>
                            <span>2025: 52%</span>
                        </div>
                    </div>
                </div>

                <!-- Card B -->
                <div class="narrative-card card-corners">
                    <div class="narrative-left">
                        <div class="narrative-number" style="color: ${stats['site-support'].color}">${stats['site-support'].value}%</div>
                    </div>
                    <div class="narrative-right">
                        <div class="narrative-title">站点支持快速扩展</div>
                        <div class="narrative-text">近四成公共网站已支持 PQ 密钥交换。浏览器（如 Chrome/Firefox）和 CDN 的默认开启是主要驱动力。</div>
                        <div class="growth-container">
                            <div class="growth-bar" style="--bar-color: ${stats['site-support'].color}; --target-width: ${stats['site-support'].value}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Card C -->
                <div class="narrative-card card-corners">
                    <div class="narrative-left">
                        <div class="narrative-number" style="color: ${stats['origin-support'].color}">${stats['origin-support'].value}%</div>
                    </div>
                    <div class="narrative-right">
                        <div class="narrative-title">源站：最大的鸿沟</div>
                        <div class="narrative-text">只有 3.7% 的源站支持 PQ——边缘到源站的鸿沟是当前最大挑战。反向代理、负载均衡和遗留应用都需要升级。</div>
                        <div class="gap-compare">
                            <div class="gap-row">
                                <span class="gap-val">边缘</span>
                                <div class="gap-bar-bg"><div class="gap-bar" style="--bar-color: var(--accent-cyan); --val: 39%"></div></div>
                                <span class="gap-val">39%</span>
                            </div>
                            <div class="gap-row">
                                <span class="gap-val">源站</span>
                                <div class="gap-bar-bg"><div class="gap-bar" style="--bar-color: ${stats['origin-support'].color}; --val: 3.7%"></div></div>
                                <span class="gap-val">3.7%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card D -->
                <div class="narrative-card card-corners">
                    <div class="narrative-left">
                        <div class="narrative-number" style="color: ${stats['latency-regression'].color}">~${stats['latency-regression'].value}%</div>
                    </div>
                    <div class="narrative-right">
                        <div class="narrative-title">代价可控</div>
                        <div class="narrative-text">混合握手带来约 4% 的延迟回归和 ~2.3KB 额外载荷。对于大多数生产场景来说，这是极具性价比的安全投资。</div>
                        <div class="growth-container">
                            <div class="growth-bar" style="--bar-color: ${stats['latency-regression'].color}; --target-width: 100%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. 关键洞察 -->
            <div class="insights-grid">
                <div class="insight-card" style="border-left: 3px solid #10b981">
                    <div class="insight-title">KEM 领先，签名滞后</div>
                    <div class="insight-body">密钥封装（ML-KEM）已广泛部署在 TLS 握手中，但签名算法（ML-DSA）的迁移因证书链和移动端兼容性而明显滞后。</div>
                </div>
                <div class="insight-card" style="border-left: 3px solid #f43f5e">
                    <div class="insight-title">边缘 vs 源站：10 倍差距</div>
                    <div class="insight-body">CDN 边缘升级快（39%），但源站仅 3.7%。这意味着即使边缘到客户端受保护，边缘到源站的链路仍然脆弱。</div>
                </div>
                <div class="insight-card" style="border-left: 3px solid #facc15">
                    <div class="insight-title">2030 倒计时：不到 4 年</div>
                    <div class="insight-body">NIST 计划 2030 年弃用量子脆弱算法。对于长期敏感数据，HNDL 风险意味着迁移窗口实际上已经在快速缩小。</div>
                </div>
            </div>

            <!-- 4. 时间线 -->
            <div class="timeline-section">
                <h3 style="margin-bottom: 0.5rem">PQC 演进与标准化里程碑</h3>
                <div class="timeline-container">
                    <div class="timeline-line"></div>
                    
                    <!-- 当前位置标记 (估算在 2026.04) -->
                    <div class="current-marker" style="left: 45%;">
                        <div class="current-label">📍 当前位置 (2026.04)</div>
                        <div class="current-dot"></div>
                    </div>

                    <div class="timeline-nodes">
                        ${standardsTimeline.map((t, index) => {
                            const colors = {
                                standard: 'var(--accent-cyan)',
                                guidance: 'var(--accent-violet)',
                                draft: 'var(--accent-magenta)',
                                milestone: '#facc15'
                            };
                            const isMilestone = t.type === 'milestone';
                            const color = colors[t.type] || 'var(--accent-cyan)';
                            const positionClass = index % 2 === 0 ? 'up' : 'down';
                            
                            return `
                                <div class="timeline-node">
                                    <div class="node-info ${positionClass}">
                                        <div class="node-date">${t.date}</div>
                                        <div class="node-label">${t.label}</div>
                                        <div class="node-detail">${t.detail}</div>
                                    </div>
                                    <div class="node-dot" style="--node-color: ${color}; ${isMilestone ? 'width: 20px; height: 20px; box-shadow: 0 0 15px #facc15;' : ''}"></div>
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

import { adoptionStats } from '../data.js';

export function renderHero(container) {
    const stats = adoptionStats.filter(s => ['pq-traffic', 'site-support', 'origin-support'].includes(s.id));
    
    container.innerHTML = `
        <style>
            .hero-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 3rem;
                align-items: center;
                padding: 2rem 0;
            }
            .hero-text h1 {
                font-size: 3.5rem;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #fff 0%, var(--accent-cyan) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .hero-text p {
                font-size: 1.25rem;
                color: var(--text-dim);
                max-width: 500px;
                line-height: 1.6;
            }
            .hero-visual {
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            .hndl-threat-card {
                padding: 2rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 1rem;
                backdrop-filter: blur(12px);
                position: relative;
                overflow: hidden;
            }
            .hndl-title {
                font-family: 'JetBrains Mono', monospace;
                color: var(--accent-magenta);
                font-size: 0.9rem;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .hndl-phases {
                display: flex;
                justify-content: space-between;
                position: relative;
                z-index: 1;
            }
            .hndl-phase {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.75rem;
                width: 30%;
                opacity: 0.3;
                transition: all 0.5s ease;
            }
            .hndl-phase.active {
                opacity: 1;
                transform: translateY(-5px);
            }
            .hndl-icon {
                font-size: 2rem;
            }
            .hndl-label {
                font-size: 0.85rem;
                font-weight: 600;
                text-align: center;
            }
            .hndl-progress-container {
                width: 100%;
                height: 4px;
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
                overflow: hidden;
                margin-top: 0.5rem;
            }
            .hndl-progress-bar {
                height: 100%;
                width: 0%;
                background: var(--accent-magenta);
                transition: width 3s linear;
            }
            .hndl-phase.active .hndl-progress-bar {
                width: 100%;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
            }
            .stat-mini-card {
                padding: 1.25rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 0.75rem;
                text-align: center;
            }
            .stat-value {
                font-size: 1.75rem;
                font-weight: 700;
                display: block;
                margin-bottom: 0.25rem;
            }
            .stat-label {
                font-size: 0.75rem;
                color: var(--text-dim);
                line-height: 1.2;
            }
            @media (max-width: 968px) {
                .hero-container { grid-template-columns: 1fr; text-align: center; }
                .hero-text p { margin: 0 auto 2rem; }
                .hero-text h1 { font-size: 2.5rem; }
            }
        </style>
        <div class="hero-container">
            <div class="hero-text">
                <h1>PQC 训练实验室</h1>
                <p>探索、验证并掌握后量子密码学。在这个交互式空间中，我们将解构抗量子算法，模拟现实握手场景，并规划通向加密敏捷的路径。</p>
            </div>
            <div class="hero-visual">
                <div class="hndl-threat-card card-corners">
                    <div class="hndl-title">
                        <span>⚠️ THREAT MODEL: HNDL (Harvest Now, Decrypt Later)</span>
                    </div>
                    <div class="hndl-phases">
                        <div class="hndl-phase" id="phase-0">
                            <span class="hndl-icon">📡</span>
                            <span class="hndl-label">数据截获</span>
                            <div class="hndl-progress-container"><div class="hndl-progress-bar"></div></div>
                        </div>
                        <div class="hndl-phase" id="phase-1">
                            <span class="hndl-icon">🖥️</span>
                            <span class="hndl-label">量子解密</span>
                            <div class="hndl-progress-container"><div class="hndl-progress-bar"></div></div>
                        </div>
                        <div class="hndl-phase" id="phase-2">
                            <span class="hndl-icon">💀</span>
                            <span class="hndl-label">数据泄露</span>
                            <div class="hndl-progress-container"><div class="hndl-progress-bar"></div></div>
                        </div>
                    </div>
                </div>
                <div class="stats-grid">
                    ${stats.map(s => `
                        <div class="stat-mini-card">
                            <span class="stat-value" style="color: ${s.color}">${s.value}${s.unit}</span>
                            <span class="stat-label">${s.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // HNDL Animation Logic
    let currentPhase = 0;
    const phases = container.querySelectorAll('.hndl-phase');
    
    function updateAnimation() {
        phases.forEach((p, i) => {
            p.classList.remove('active');
            const bar = p.querySelector('.hndl-progress-bar');
            bar.style.transition = 'none';
            bar.style.width = '0%';
        });

        const activePhase = container.querySelector(`#phase-${currentPhase}`);
        activePhase.classList.add('active');
        
        // Force reflow
        void activePhase.offsetWidth;
        
        const bar = activePhase.querySelector('.hndl-progress-bar');
        bar.style.transition = 'width 3s linear';
        bar.style.width = '100%';

        currentPhase = (currentPhase + 1) % 3;
    }

    updateAnimation();
    const interval = setInterval(updateAnimation, 3100);
    
    // Cleanup on remove (not strictly required by task but good practice)
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(container)) {
            clearInterval(interval);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

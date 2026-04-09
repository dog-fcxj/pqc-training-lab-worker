import { heroMetrics, heroNarrative } from '../data.js';

export function renderHero(container) {
  const visibleBullets = heroNarrative.bullets.slice(0, 2);
  const visibleMetrics = heroMetrics.slice(0, 3);
  const title = heroNarrative.title.replace("\n", "<br/>");

  container.innerHTML = `
    <div class="card card-corners hero-panel-shell" style="display: flex; gap: 60px; align-items: center; width: 100%; max-width: 1200px;">
      <div style="flex: 1.2">
        <p style="color: var(--accent-cyan); font-family: 'JetBrains Mono'; font-size: 14px; letter-spacing: 4px; font-weight: 700; margin-bottom: 16px;">${heroNarrative.eyebrow}</p>
        <h1 style="margin:0 0 24px 0;">${title}</h1>
        <p style="color: var(--text-dim); font-size: 18px; line-height: 1.8; margin-bottom: 24px;">
          ${heroNarrative.summary}
        </p>
        <div class="hero-bullet-list">
          ${visibleBullets.map((item) => `
            <div class="hero-bullet-item">
              <span class="hero-bullet-mark"></span>
              <span>${item}</span>
            </div>
          `).join("")}
        </div>
        <div style="display: flex; gap: 20px; margin-top: 32px;">
          <button class="cta-button" onclick="window.goToPage(2)">Algorithm View</button>
          <button class="cta-button" style="border-color: var(--accent-violet); color: var(--accent-violet)" onclick="window.goToPage(1)">Principles</button>
        </div>
      </div>
      <div style="flex: 1; display: grid; gap: 18px;">
        <div style="height: 280px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 8px; position: relative;">
          <svg id="hero-network" viewBox="0 0 440 360" style="width:100%; height:100%;"></svg>
        </div>
        <div class="hero-metrics-grid">
          ${visibleMetrics.map((metric) => `
            <div class="hero-metric-card">
              <div class="hero-metric-value">${metric.value}</div>
              <div class="hero-metric-label">${metric.label}</div>
              <div class="hero-metric-summary">${metric.summary}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

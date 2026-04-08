import { scenarios } from '../data.js';

export function renderHandshake(container) {
  container.innerHTML = `
    <div class="card card-corners" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; width: 100%; max-width: 1200px;">
      <div>
        <h2 style="margin-bottom: 40px;">工程化握手开销</h2>
        <div id="scenario-list" style="display: grid; gap: 16px;">
          ${scenarios.map(s => `
            <div class="scenario-item" style="padding: 20px; border: 1px solid var(--glass-border); cursor:pointer; transition:0.3s;" onclick="window.selectScenario('${s.id}')">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${s.label}</strong>
                <span style="font-family:'JetBrains Mono'; font-size:10px; color:var(--accent-magenta); opacity:0.8;">${s.stats}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <div style="background: rgba(168, 85, 247, 0.05); border: 1px solid rgba(168, 85, 247, 0.2); padding: 40px; border-radius: 8px;">
        <div id="scenario-brief"></div>
        <div style="margin-top: 48px; border-top: 1px solid var(--border-glass); padding-top: 32px;">
          <p style="color: var(--accent-violet); font-size: 13px; font-weight: 800; letter-spacing: 2px; margin-bottom: 12px;">SECURITY ADVISORY</p>
          <p style="font-size: 15px; color: var(--text-dim); line-height: 1.8;">
            Hybrid 模式允许在不破坏现有合规性的前提下，叠加抗量子保护，是目前全球范围内最稳健的迁移路径。
          </p>
        </div>
        <span class="detail-jump" style="color: var(--accent-violet); margin-top: 32px;" onclick="window.openDetail('handshake')">Traffic Capture →</span>
      </div>
    </div>
  `;
  
  window.selectScenario('tls-hybrid');
}

window.selectScenario = (id) => {
  const s = scenarios.find(x => x.id === id);
  const brief = document.getElementById("scenario-brief");
  if (brief) brief.innerHTML = `<h2 style="font-size:24px;">${s.label}</h2><p style="color:var(--text-dim); margin-top:12px; font-size:14px; line-height:1.6;">${s.brief}</p>`;
  
  document.querySelectorAll(".scenario-item").forEach(el => {
    const isTarget = el.innerText.includes(s.label);
    el.style.borderColor = isTarget ? 'var(--accent-magenta)' : 'var(--glass-border)';
    el.style.background = isTarget ? 'rgba(244, 63, 94, 0.05)' : 'transparent';
  });
};

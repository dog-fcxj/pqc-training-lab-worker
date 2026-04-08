import { principles } from '../data.js';

export function renderPrinciples(container) {
  container.innerHTML = `
    <div class="card card-corners" style="display: grid; grid-template-columns: 1fr 1.8fr; gap: 48px; width: 100%; max-width: 1200px;">
      <div>
        <h2 style="font-size: 32px; margin-bottom: 32px;">核心数学原理</h2>
        <div id="principle-nav" style="display: grid; gap: 16px;">
          ${principles.map((p, i) => `
            <div class="principle-item" style="padding:16px; border:1px solid var(--glass-border); cursor:pointer; transition:0.3s;" onclick="window.selectPrinciple(${i})">
              <strong style="color:var(--accent-cyan); font-size:13px; letter-spacing:0.1em;">${p.label.toUpperCase()}</strong>
            </div>
          `).join("")}
        </div>
      </div>
      <div style="display: grid; grid-template-rows: 1fr auto;">
        <div id="principle-stage" style="border: 1px solid var(--glass-border); background: rgba(0,0,0,0.4); min-height: 320px; border-radius: 4px; display:grid; place-items:center;">
          <!-- 动态演示区 -->
        </div>
        <div style="padding-top: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div id="principle-info"></div>
          <span class="detail-jump" onclick="window.openDetail('principle')">Explore Math →</span>
        </div>
      </div>
    </div>
  `;
  
  // 初始化第一个
  window.selectPrinciple(0);
}

window.selectPrinciple = (idx) => {
  const p = principles[idx];
  const info = document.getElementById("principle-info");
  const stage = document.getElementById("principle-stage");
  if (info) info.innerHTML = `<h3 style="margin:0; font-size:24px;">${p.label}</h3><p style="color:var(--text-dim); font-size:14px; margin-top:10px; line-height:1.6;">${p.brief}</p>`;
  if (stage) stage.innerHTML = `<div style="color:var(--accent-cyan); font-family:'JetBrains Mono'; font-size:11px; opacity:0.5;">// SIMULATING_${p.id.toUpperCase()}_MODEL...</div>`;
  
  // 切换高亮样式
  document.querySelectorAll(".principle-item").forEach((el, i) => {
    el.style.borderColor = i === idx ? 'var(--accent-cyan)' : 'var(--glass-border)';
    el.style.background = i === idx ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  });
};

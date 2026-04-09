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
        <div id="principle-stage" style="border: 1px solid var(--glass-border); background: rgba(0,0,0,0.4); min-height: 320px; border-radius: 4px; display:grid; place-items:center; padding: 32px; box-sizing: border-box;">
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
  if (info) {
    info.innerHTML = `
      <h3 style="margin:0; font-size:24px;">${p.label}</h3>
      <p style="color:var(--text-dim); font-size:14px; margin-top:10px; line-height:1.6; max-width: 520px;">${p.brief}</p>
    `;
  }
  if (stage) {
    stage.innerHTML = `
      <div style="display:grid; gap:24px; width:100%; max-width:540px;">
        <div style="display:flex; justify-content:space-between; align-items:end; gap:24px;">
          <div>
            <p style="margin:0 0 12px 0; color:var(--accent-cyan); font-family:'JetBrains Mono'; font-size:11px; letter-spacing:0.18em;">MODEL CUE</p>
            <div style="font-size:28px; font-weight:800; line-height:1.2;">${p.cue}</div>
          </div>
          <div style="width:88px; height:88px; border:1px solid var(--glass-border); border-radius:50%; display:grid; place-items:center; color:var(--accent-cyan); font-family:'JetBrains Mono'; font-size:12px;">
            ${String(idx + 1).padStart(2, "0")}
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:12px;">
          ${p.metrics.map((metric) => `
            <div style="border:1px solid var(--glass-border); background:rgba(255,255,255,0.02); padding:14px 12px; font-size:12px; line-height:1.6; color:var(--text-dim);">
              ${metric}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  if (window.setCurrentSelection) window.setCurrentSelection("principle", p.id);
  
  // 切换高亮样式
  document.querySelectorAll(".principle-item").forEach((el, i) => {
    el.style.borderColor = i === idx ? 'var(--accent-cyan)' : 'var(--glass-border)';
    el.style.background = i === idx ? 'rgba(34, 211, 238, 0.05)' : 'transparent';
  });
};

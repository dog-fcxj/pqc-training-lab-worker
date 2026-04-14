import { algorithms } from '../data.js';

export function renderAlgorithms(container) {
  container.innerHTML = `
    <div class="card card-corners" style="display: grid; grid-template-rows: auto 1fr; gap: 48px; width: 100%; max-width: 1200px; min-height: 600px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <h2 style="margin:0;">NIST 标准算法矩阵</h2>
        <span class="detail-jump" style="opacity:0.3; cursor:default;">Phase 2: 算法详情将内联展示</span>
      </div>
      <div id="algorithm-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; width: 100%;">
        ${algorithms.map(a => `
          <div class="card card-corners algo-card" style="cursor:pointer; padding:30px; background:rgba(255,255,255,0.02);" onclick="window.selectAlgorithm('${a.id}')">
            <h3 style="font-size:18px; color:var(--accent-cyan); margin:0;">${a.name}</h3>
            <p style="font-size:11px; color:var(--text-dim); margin-top:12px; letter-spacing:1px;">${a.role}</p>
            <p style="font-size:13px; color:var(--text-dim); line-height:1.7; margin:16px 0 0 0;">${a.summary}</p>
            <div style="margin-top:18px; font-family:'JetBrains Mono'; font-size:11px; color:var(--accent-magenta); opacity:0.85;">
              ${a.specs.pk} / ${a.specs.ct || a.specs.sig}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

window.selectAlgorithm = (id) => {
  // TODO: Phase 2 将在此展开算法详情面板
  console.log('Selected algorithm:', id);
};

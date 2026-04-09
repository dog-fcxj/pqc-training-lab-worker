import { algorithms, getAlgorithmById } from '../data.js';

function renderAlgorithmDetail(id) {
  const algorithm = getAlgorithmById(id);
  if (!algorithm) return;

  const detail = document.getElementById("algorithm-detail-panel");
  if (!detail) return;

  detail.innerHTML = `
    <div class="algorithm-detail-header">
      <div>
        <div class="algorithm-detail-role">${algorithm.role}</div>
        <h3 class="algorithm-detail-title">${algorithm.name}</h3>
        <p class="algorithm-detail-summary">${algorithm.detail}</p>
      </div>
      <div class="algorithm-detail-meta">
        <div class="algorithm-meta-card">
          <span class="algorithm-meta-label">Family</span>
          <span class="algorithm-meta-value">${algorithm.family}</span>
        </div>
        <div class="algorithm-meta-card">
          <span class="algorithm-meta-label">Sizes</span>
          <span class="algorithm-meta-value">${algorithm.sizes}</span>
        </div>
        <div class="algorithm-meta-card">
          <span class="algorithm-meta-label">Perf</span>
          <span class="algorithm-meta-value">${algorithm.specs.perf}</span>
        </div>
      </div>
    </div>
    <div class="algorithm-detail-grid">
      <div class="algorithm-info-card">
        <div class="algorithm-info-label">部署角色</div>
        <p class="algorithm-info-text">${algorithm.why}</p>
      </div>
      <div class="algorithm-info-card">
        <div class="algorithm-info-label">${algorithm.formulaTitle}</div>
        <pre class="algorithm-formula-block">${algorithm.formula}</pre>
      </div>
    </div>
    <div class="algorithm-facts-grid">
      ${algorithm.facts.map(([label, value]) => `
        <div class="algorithm-fact-row">
          <span class="algorithm-fact-label">${label}</span>
          <span class="algorithm-fact-value">${value}</span>
        </div>
      `).join("")}
    </div>
    <div class="algorithm-path-card">
      <div class="algorithm-info-label">${algorithm.pathTitle}</div>
      <ol class="algorithm-path-list">
        ${algorithm.pathSteps.map((step) => `<li>${step}</li>`).join("")}
      </ol>
    </div>
    <div class="algorithm-takeaway-card">
      <div class="algorithm-info-label">Takeaway</div>
      <p class="algorithm-info-text">${algorithm.takeaway}</p>
    </div>
  `;

  document.querySelectorAll(".algo-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.algorithmId === id);
  });
}

export function renderAlgorithms(container) {
  const defaultId = algorithms[0]?.id;

  container.innerHTML = `
    <div class="card card-corners algorithm-shell" style="display: grid; grid-template-rows: auto 1fr; gap: 32px; width: 100%; max-width: 1200px; min-height: 680px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 24px;">
        <div>
          <h2 style="margin:0;">NIST 标准算法矩阵</h2>
          <p style="margin:12px 0 0; color:rgba(255,255,255,0.68); font-size:14px; line-height:1.7; max-width:780px;">
            这一屏先解决“它们分别干什么、代价是什么、该放在什么位置”三个问题。基础比较留在主页面，深度说明再进入附录式详情层。
          </p>
        </div>
        <span class="detail-jump" onclick="window.openDetail('algorithm')">Deep Notes →</span>
      </div>
      <div class="algorithm-layout">
        <div class="algorithm-list-column">
          ${algorithms.map((algorithm) => `
            <button
              class="algo-card"
              data-algorithm-id="${algorithm.id}"
              onclick="window.selectAlgorithm('${algorithm.id}')"
            >
              <span class="algo-card-role">${algorithm.role}</span>
              <h3 class="algo-card-title">${algorithm.name}</h3>
              <p class="algo-card-family">${algorithm.family}</p>
              <div class="algo-card-spec">SPEC: ${algorithm.specs.pk} / ${algorithm.specs.ct || algorithm.specs.sig}</div>
            </button>
          `).join("")}
        </div>
        <div id="algorithm-detail-panel" class="algorithm-detail-column"></div>
      </div>
    </div>
  `;

  if (defaultId) {
    renderAlgorithmDetail(defaultId);
  }
}

window.selectAlgorithm = (id) => {
  renderAlgorithmDetail(id);
};

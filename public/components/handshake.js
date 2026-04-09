import {
  handshakeMetrics,
  handshakeScenarios,
  migrationRules,
  getHandshakeScenarioById,
} from '../data.js';

function formatMetricValue(value, unit) {
  if (value === null || value === undefined) return "N/A";
  return `${value}${unit}`;
}

function renderScenarioDetail(id) {
  const scenario = getHandshakeScenarioById(id);
  if (!scenario) return;

  const detail = document.getElementById("scenario-detail-panel");
  if (!detail) return;

  detail.innerHTML = `
    <div class="scenario-detail-header">
      <div>
        <div class="scenario-badge">${scenario.badge}</div>
        <h3 class="scenario-title">${scenario.label}</h3>
        <p class="scenario-summary">${scenario.summary}</p>
      </div>
      <div class="scenario-advisory-card">
        <div class="scenario-advisory-label">Security Advisory</div>
        <p class="scenario-advisory-text">${scenario.advisory}</p>
      </div>
    </div>
    <div class="scenario-compare-grid">
      ${handshakeMetrics.map((metric) => `
        <div class="scenario-metric-card">
          <div class="scenario-metric-label">${metric.label}</div>
          <div class="scenario-metric-value">${formatMetricValue(scenario.compare[metric.key], metric.unit)}</div>
          <div class="scenario-metric-note">${metric.note}</div>
        </div>
      `).join("")}
    </div>
    <div class="scenario-facts-grid">
      ${scenario.facts.map(([label, value]) => `
        <div class="scenario-fact-row">
          <span class="scenario-fact-label">${label}</span>
          <span class="scenario-fact-value">${value}</span>
        </div>
      `).join("")}
    </div>
    <div class="scenario-notes-card">
      <div class="scenario-notes-label">Engineering Notes</div>
      <ul class="scenario-notes-list">
        ${scenario.notes.map((note) => `<li>${note}</li>`).join("")}
      </ul>
    </div>
  `;

  document.querySelectorAll(".scenario-item").forEach((item) => {
    item.classList.toggle("is-selected", item.dataset.scenarioId === id);
  });
}

function renderMigrationResults() {
  const result = document.getElementById("migration-result");
  if (!result) return;

  const selectedKeys = Array.from(
    document.querySelectorAll('#migration-form input[type="checkbox"]:checked'),
  ).map((input) => input.name);

  const matchedRules = migrationRules
    .filter((rule) => selectedKeys.includes(rule.key))
    .sort((left, right) => {
      const priorityRank = { high: 0, medium: 1, low: 2 };
      return priorityRank[left.priority] - priorityRank[right.priority];
    });

  if (!matchedRules.length) {
    result.innerHTML = `
      <div class="migration-empty-card">
        <div class="migration-result-title">等待系统画像输入</div>
        <p class="migration-result-text">
          先勾选你的系统特征，系统会把高优先级迁移动作、性能风险和供应商依赖集中列出来。
        </p>
      </div>
    `;
    return;
  }

  result.innerHTML = matchedRules.map((rule) => `
    <div class="migration-result-card">
      <div class="migration-result-priority migration-priority-${rule.priority}">${rule.priority.toUpperCase()}</div>
      <div class="migration-result-title">${rule.title}</div>
      <p class="migration-result-text">${rule.text}</p>
    </div>
  `).join("");
}

export function renderHandshake(container) {
  container.innerHTML = `
    <div class="card card-corners deployment-shell" style="display: grid; grid-template-rows: auto 1fr; gap: 28px; width: 100%; max-width: 1200px; min-height: 720px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:24px;">
        <div>
          <h2 style="margin:0;">Deployment & Migration Lab</h2>
          <p style="margin:12px 0 0; color:rgba(255,255,255,0.68); font-size:14px; line-height:1.7; max-width:780px;">
            这一屏先把协议对象和握手开销讲清楚，再把这些工程影响转换成迁移动作建议。目标不是背数字，而是判断先迁哪里、测什么、会卡在哪。
          </p>
        </div>
        <span class="detail-jump" onclick="window.openDetail('handshake')">Scenario Notes →</span>
      </div>
      <div class="deployment-layout">
        <div class="deployment-top-row">
          <div class="deployment-card">
            <div class="deployment-card-head">
              <h3>Handshake Lab</h3>
              <span class="deployment-card-subtitle">Classical / Hybrid / IKEv2</span>
            </div>
            <div class="deployment-handshake-layout">
              <div id="scenario-list" class="scenario-list-column">
                ${handshakeScenarios.map((scenario) => `
                  <button
                    class="scenario-item"
                    data-scenario-id="${scenario.id}"
                    onclick="window.selectScenario('${scenario.id}')"
                  >
                    <span class="scenario-item-title">${scenario.label}</span>
                    <span class="scenario-item-stat">${scenario.stats}</span>
                    <span class="scenario-item-brief">${scenario.brief}</span>
                  </button>
                `).join("")}
              </div>
              <div id="scenario-detail-panel" class="scenario-detail-column"></div>
            </div>
          </div>
        </div>
        <div class="deployment-bottom-row">
          <div class="deployment-card">
            <div class="deployment-card-head">
              <h3>Migration Lab</h3>
              <span class="deployment-card-subtitle">System Profile</span>
            </div>
            <form id="migration-form" class="migration-form-grid">
              ${migrationRules.map((rule) => `
                <label class="migration-option">
                  <input type="checkbox" name="${rule.key}" />
                  <span class="migration-option-text">${rule.title}</span>
                </label>
              `).join("")}
            </form>
          </div>
          <div class="deployment-card">
            <div class="deployment-card-head">
              <h3>Migration Result</h3>
              <span class="deployment-card-subtitle">Action Queue</span>
            </div>
            <div id="migration-result" class="migration-result-grid"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const defaultScenarioId = handshakeScenarios[1]?.id || handshakeScenarios[0]?.id;
  if (defaultScenarioId) {
    renderScenarioDetail(defaultScenarioId);
  }

  document.querySelectorAll('#migration-form input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", renderMigrationResults);
  });
  renderMigrationResults();
}

window.selectScenario = (id) => {
  renderScenarioDetail(id);
};

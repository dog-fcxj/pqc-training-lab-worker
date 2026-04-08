import { algorithms, principles, scenarios } from './data.js';
import { buildHeroNetwork, initDataStreams } from './visuals.js';

let currentPage = 0;
let isScrolling = false;

function goToPage(idx) {
  if (idx < 0 || idx > 3) return;
  currentPage = idx;
  const shell = document.getElementById("app-shell");
  shell.style.transform = `translateY(-${currentPage * 100}%)`;
  
  document.querySelectorAll(".nav-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentPage);
  });
  document.querySelectorAll(".content-section").forEach((sec, i) => {
    sec.classList.toggle("is-active", i === currentPage);
  });
}

window.addEventListener("wheel", (e) => {
  if (isScrolling) return;
  if (Math.abs(e.deltaY) < 40) return;
  isScrolling = true;
  if (e.deltaY > 0) goToPage(currentPage + 1);
  else goToPage(currentPage - 1);
  setTimeout(() => isScrolling = false, 1000);
}, { passive: true });

function openDetail(type) {
  const overlay = document.getElementById("detail-overlay");
  const content = document.getElementById("detail-content");
  overlay.classList.add("is-open");
  
  if (type === 'algorithm') {
    content.innerHTML = algorithms.map(a => `
      <div class="card card-corners">
        <h3 style="color:var(--accent-cyan); margin:0 0 12px 0;">${a.name}</h3>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.6;">${a.detail}</p>
        <div style="margin-top:20px; font-family:'JetBrains Mono'; font-size:11px; color:var(--accent-magenta)">
          SPEC: ${a.specs.pk} / ${a.specs.ct || a.specs.sig} | PERF: ${a.specs.perf}
        </div>
      </div>
    `).join("");
  }
}

function closeDetail() {
  document.getElementById("detail-overlay").classList.remove("is-open");
}

function renderUI() {
  // 原理列表
  document.getElementById("principle-nav").innerHTML = principles.map((p, i) => `
    <div style="padding:16px; border:1px solid var(--glass-border); cursor:pointer; transition:0.3s;" onclick="window.selectPrinciple(${i})">
      <strong style="color:var(--accent-cyan); font-size:13px; letter-spacing:0.1em;">${p.label.toUpperCase()}</strong>
    </div>
  `).join("");

  // 算法预览
  document.getElementById("algorithm-grid").innerHTML = algorithms.map(a => `
    <div class="card card-corners" style="cursor:pointer;" onclick="window.selectAlgorithm('${a.id}')">
      <h3 style="font-size:16px; color:var(--accent-cyan); margin:0;">${a.name}</h3>
      <p style="font-size:11px; color:var(--text-muted); margin-top:8px;">${a.role}</p>
    </div>
  `).join("");

  // 部署场景
  document.getElementById("scenario-list").innerHTML = scenarios.map(s => `
    <div style="padding:20px; border:1px solid var(--glass-border); cursor:pointer;" onclick="window.selectScenario('${s.id}')">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-size:14px;">${s.label}</strong>
        <span style="font-family:'JetBrains Mono'; font-size:10px; color:var(--accent-magenta); opacity:0.8;">${s.stats}</span>
      </div>
    </div>
  `).join("");

  window.selectPrinciple(0);
  window.selectScenario('tls-hybrid');
}

// 全局暴露
window.selectPrinciple = (idx) => {
  const p = principles[idx];
  document.getElementById("principle-info").innerHTML = `<h2 style="font-size:24px;">${p.label}</h2><p style="color:var(--text-muted); font-size:14px; line-height:1.7;">${p.brief}</p>`;
  document.getElementById("principle-stage").innerHTML = `<div style="display:grid; place-items:center; height:100%; color:var(--accent-cyan); font-family:'JetBrains Mono'; font-size:11px; opacity:0.5;">// SIMULATING_${p.id.toUpperCase()}_ENV...</div>`;
};

window.selectScenario = (id) => {
  const s = scenarios.find(x => x.id === id);
  document.getElementById("scenario-brief").innerHTML = `<h2 style="font-size:24px;">${s.label}</h2><p style="color:var(--text-muted); font-size:14px; line-height:1.7;">${s.brief}</p>`;
};

window.goToPage = goToPage;
window.openDetail = openDetail;
window.closeDetail = closeDetail;

document.addEventListener("DOMContentLoaded", () => {
  buildHeroNetwork();
  initDataStreams();
  renderUI();
  
  document.querySelectorAll(".nav-dot").forEach(dot => {
    dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.index)));
  });
});

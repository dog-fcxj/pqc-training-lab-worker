import { algorithms } from './data.js';
import { buildHeroNetwork, initDataStreams } from './visuals.js';
import { renderHero } from './components/hero.js';
import { renderPrinciples } from './components/principles.js';
import { renderAlgorithms } from './components/algorithms.js';
import { renderHandshake } from './components/handshake.js';

let currentPage = 0;
let isScrolling = false;

const pageModules = [renderHero, renderPrinciples, renderAlgorithms, renderHandshake];

function goToPage(idx) {
  if (idx < 0 || idx >= pageModules.length) return;
  currentPage = idx;
  
  // 1. 物理翻页
  const shell = document.getElementById("app-shell");
  shell.style.transform = `translateY(-${currentPage * 100}%)`;
  
  // 2. 动态渲染组件内容
  const container = document.getElementById(`section-${idx}`);
  if (container && !container.dataset.rendered) {
    pageModules[idx](container);
    container.dataset.rendered = "true";
    if (idx === 0) buildHeroNetwork(); // 仅 Hero 需要重新构建网络
  }

  // 3. 更新导航状态
  document.querySelectorAll(".nav-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentPage);
  });
  document.querySelectorAll(".content-section").forEach((sec, i) => {
    sec.classList.toggle("is-active", i === currentPage);
  });
}

// 滚轮监听
window.addEventListener("wheel", (e) => {
  if (isScrolling) return;
  if (Math.abs(e.deltaY) < 40) return;
  isScrolling = true;
  if (e.deltaY > 0) goToPage(currentPage + 1);
  else goToPage(currentPage - 1);
  setTimeout(() => isScrolling = false, 1000);
}, { passive: true });

// 详情页逻辑
function openDetail(type) {
  const overlay = document.getElementById("detail-overlay");
  const content = document.getElementById("detail-content");
  overlay.classList.add("is-open");
  
  if (type === 'algorithm') {
    content.innerHTML = algorithms.map(a => `
      <div class="card card-corners">
        <h3 style="color:var(--accent-cyan); margin:0 0 12px 0;">${a.name}</h3>
        <p style="font-size:13px; color:var(--text-dim); line-height:1.6;">${a.detail}</p>
        <div style="margin-top:20px; font-family:'JetBrains Mono'; font-size:11px; color:var(--accent-magenta)">
          SPEC: ${a.specs.pk} / ${a.specs.ct || a.specs.sig} | PERF: ${a.specs.perf}
        </div>
      </div>
    `).join("");
  } else {
    content.innerHTML = `<div class="card card-corners"><h3>Detail analysis</h3><p style="color:var(--text-dim)">Under development...</p></div>`;
  }
}

function closeDetail() {
  document.getElementById("detail-overlay").classList.remove("is-open");
}

// 暴露全局
window.goToPage = goToPage;
window.openDetail = openDetail;
window.closeDetail = closeDetail;

document.addEventListener("DOMContentLoaded", () => {
  initDataStreams();
  // 初始渲染第一页
  goToPage(0);
  
  document.querySelectorAll(".nav-dot").forEach(dot => {
    dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.index)));
  });
});

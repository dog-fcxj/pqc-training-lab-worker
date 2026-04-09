import { detailViews } from './data.js';
import { buildHeroNetwork, initDataStreams } from './visuals.js';
import { renderHero } from './components/hero.js';
import { renderPrinciples } from './components/principles.js';
import { renderAlgorithms } from './components/algorithms.js';
import { renderHandshake } from './components/handshake.js';

let currentPage = 0;
let isScrolling = false;
const currentSelections = {
  principle: "lattice",
  algorithm: null,
  handshake: "tls-hybrid"
};

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
  const title = document.getElementById("overlay-title");
  const view = detailViews[type];
  if (!view) return;

  const selectedId = currentSelections[type] || null;
  const sections = view.getSections(selectedId);

  title.textContent = view.title;
  overlay.classList.add("is-open");

  content.innerHTML = `
    <div class="detail-lead card card-corners">
      <p class="detail-eyebrow">${view.eyebrow}</p>
      <p class="detail-intro">${view.intro}</p>
    </div>
    ${sections.map((section) => `
      <div class="detail-section">
        <div class="detail-section-title">${section.title}</div>
        <div class="detail-card-grid">
          ${section.cards.map((card) => `
            <article class="card card-corners detail-card">
              <h3>${card.heading}</h3>
              <p>${card.body}</p>
            </article>
          `).join("")}
        </div>
      </div>
    `).join("")}
  `;
}

function closeDetail() {
  document.getElementById("detail-overlay").classList.remove("is-open");
}

function setCurrentSelection(type, id) {
  currentSelections[type] = id;
}

// 暴露全局
window.goToPage = goToPage;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.setCurrentSelection = setCurrentSelection;

document.addEventListener("DOMContentLoaded", () => {
  initDataStreams();
  // 初始渲染第一页
  goToPage(0);
  
  document.querySelectorAll(".nav-dot").forEach(dot => {
    dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.index)));
  });
});

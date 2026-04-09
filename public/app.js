import { getDetailDocumentsByType } from './data.js';
import { buildHeroNetwork, initDataStreams } from './visuals.js';
import { renderHero } from './components/hero.js';
import { renderPrinciples } from './components/principles.js';
import { renderAlgorithms } from './components/algorithms.js';
import { renderHandshake } from './components/handshake.js';

let currentPage = 0;

const pageModules = [renderHero, renderPrinciples, renderAlgorithms, renderHandshake];
const pageHashes = ["hero", "principles", "algorithms", "deployment"];

function setBodyViewportVar() {
  document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
}

function renderPageIfNeeded(idx) {
  const container = document.getElementById(`section-${idx}`);
  if (container && !container.dataset.rendered) {
    pageModules[idx](container);
    container.dataset.rendered = "true";
    if (idx === 0) buildHeroNetwork();
  }
}

function ensureAllPagesRendered() {
  pageModules.forEach((_, idx) => renderPageIfNeeded(idx));
}

function goToPage(idx) {
  if (idx < 0 || idx >= pageModules.length) return;
  currentPage = idx;

  renderPageIfNeeded(idx);
  const section = document.getElementById(`section-${idx}`);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".nav-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentPage);
  });
  document.querySelectorAll(".content-section").forEach((sec, i) => {
    sec.classList.toggle("is-active", i === currentPage);
  });

  const hash = pageHashes[idx];
  if (hash && window.location.hash !== `#${hash}`) {
    history.replaceState(null, "", `#${hash}`);
  }
}

window.addEventListener("keydown", (event) => {
  if (document.getElementById("detail-overlay")?.classList.contains("is-open")) {
    if (event.key === "Escape") closeDetail();
    return;
  }

  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    goToPage(currentPage + 1);
  }

  if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    goToPage(currentPage - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToPage(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    goToPage(pageModules.length - 1);
  }
});

function renderDetailBlock(block) {
  if (block.kind === 'summary') {
    return `
      <div class="card card-corners">
        <p style="margin:0; color:rgba(255,255,255,0.8); font-size:14px; line-height:1.8;">${block.text}</p>
      </div>
    `;
  }

  if (block.kind === 'bulletList') {
    return `
      <div class="card card-corners">
        <h3 style="color:var(--accent-cyan); margin:0 0 14px 0;">${block.title}</h3>
        <ul style="margin:0; padding-left:18px; color:rgba(255,255,255,0.76); font-size:13px; line-height:1.8;">
          ${block.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  if (block.kind === 'factGrid') {
    return `
      <div class="card card-corners">
        <div style="display:grid; gap:12px;">
          ${block.items.map(([label, value]) => `
            <div style="padding:12px; border:1px solid var(--glass-border); border-radius:8px; background:rgba(255,255,255,0.02);">
              <div style="color:var(--accent-cyan); font-size:11px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase;">${label}</div>
              <div style="margin-top:8px; color:rgba(255,255,255,0.76); font-size:13px; line-height:1.6;">${value}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  return `
    <div class="card card-corners">
      <p style="margin:0; color:var(--text-dim);">Unsupported detail block.</p>
    </div>
  `;
}

function renderDetailDocuments(type) {
  const documents = getDetailDocumentsByType(type);
  if (!documents.length) {
    return `<div class="card card-corners"><h3>Detail analysis</h3><p style="color:var(--text-dim)">Under development...</p></div>`;
  }

  return documents.map((document) => `
    <div style="display:grid; gap:18px;">
      <h3 style="margin:0; font-size:28px; color:#fff;">${document.title}</h3>
      ${document.blocks.map((block) => renderDetailBlock(block)).join("")}
    </div>
  `).join("");
}

// 详情页逻辑
function openDetail(type) {
  const overlay = document.getElementById("detail-overlay");
  const title = document.getElementById("overlay-title");
  const content = document.getElementById("detail-content");
  overlay.classList.add("is-open");
  
  if (type === 'algorithm') {
    title.textContent = "Algorithm Deep Notes";
    content.innerHTML = renderDetailDocuments('algorithm');
  } else if (type === 'principle') {
    title.textContent = "Principle Deep Notes";
    content.innerHTML = renderDetailDocuments('principle');
  } else if (type === 'handshake') {
    title.textContent = "Scenario Notes";
    content.innerHTML = renderDetailDocuments('handshake');
  } else {
    title.textContent = "Technical Spec";
    content.innerHTML = renderDetailDocuments(type);
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
  setBodyViewportVar();
  initDataStreams();
  const initialHash = window.location.hash.replace("#", "");
  const initialPage = Math.max(pageHashes.indexOf(initialHash), 0);
  ensureAllPagesRendered();
  currentPage = initialPage;
  document.querySelectorAll(".nav-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentPage);
  });
  document.querySelectorAll(".content-section").forEach((sec, i) => {
    sec.classList.toggle("is-active", i === currentPage);
  });
  requestAnimationFrame(() => {
    const initialSection = document.getElementById(`section-${initialPage}`);
    if (initialSection) {
      initialSection.scrollIntoView({ behavior: "auto", block: "start" });
    }
  });
  
  document.querySelectorAll(".nav-dot").forEach(dot => {
    dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.index)));
  });

  const sections = Array.from(document.querySelectorAll(".content-section"));
  const observer = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    if (!visibleEntry) return;
    const idx = sections.indexOf(visibleEntry.target);
    if (idx < 0 || idx === currentPage) return;
    currentPage = idx;
    document.querySelectorAll(".nav-dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentPage);
    });
    const hash = pageHashes[idx];
    if (hash && window.location.hash !== `#${hash}`) {
      history.replaceState(null, "", `#${hash}`);
    }
  }, {
    threshold: [0.35, 0.6],
  });

  sections.forEach((section) => observer.observe(section));
});

window.addEventListener("resize", () => {
  setBodyViewportVar();
});

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.replace("#", "");
  const idx = pageHashes.indexOf(hash);
  if (idx >= 0 && idx !== currentPage) {
    goToPage(idx);
  }
});

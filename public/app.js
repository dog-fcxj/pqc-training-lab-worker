// --- 核心数据集 ---
const algorithms = [
  { id: "ml-kem", name: "ML-KEM", role: "KEM", detail: "格密码主力标准，Module-LWE 假设。具备极高的运算效率和中等的对象尺寸。", metrics: { pk: "1184B", ct: "1088B", speed: "High" } },
  { id: "ml-dsa", name: "ML-DSA", role: "Signature", detail: "基于格的签名方案，采用拒绝采样技术确保安全性与效率的平衡。", metrics: { pk: "1312B", sig: "2420B", speed: "Medium" } },
  { id: "slh-dsa", name: "SLH-DSA", role: "Signature", detail: "哈希签名方案，极其稳健，不依赖任何代数困难性假设。对象开销较大。", metrics: { pk: "32B", sig: "17KB", speed: "Low" } },
  { id: "hqc", name: "HQC", role: "KEM", detail: "基于纠错码理论的备选方案，为系统提供非格基算法的多样性保护。", metrics: { pk: "2249B", ct: "4481B", speed: "Medium" } }
];

const principles = [
  { id: "lattice", label: "Lattice 格密码", brief: "利用高维空间中最短向量问题的搜索难度。Module-LWE 允许更紧凑的对象表示。", icon: "grid" },
  { id: "hash", label: "Hash 哈希树", brief: "基于单向函数的碰撞抵御性。通过多层 Merkle 树认证路径构建数字签名。", icon: "tree" },
  { id: "code", label: "Code 纠错码", brief: "将信息编码为带噪码字，仅合法接收方能通过校验矩阵恢复原始共享密钥。", icon: "cpu" }
];

const scenarios = [
  { id: "tls-classical", label: "Classical TLS 1.3", brief: "基准：X25519 握手。没有任何抗量子保护，但效率最高。", stats: "0 B Extra Overhead" },
  { id: "tls-hybrid", label: "Hybrid X25519+MLKEM", brief: "工业界当前推荐标准。兼顾传统安全性与未来防御。", stats: "1.2 KB Extra Overhead" },
  { id: "ikev2-pq", label: "IKEv2 PQ-VPN", brief: "企业级隧道抗量子升级。处理 PMTU 分片是关键挑战。", stats: "Multiple Fragments" }
];

// --- 实验室活跃系统 (Data Streams) ---
function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  for (let i = 0; i < 15; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `nebula-pulse ${5 + Math.random() * 5}s linear infinite`;
    stream.textContent = Math.random().toString(16).substring(2, 10).toUpperCase();
    container.appendChild(stream);
  }
}

// --- 视口翻页引擎 ---
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

// --- 细节钻取系统 ---
function openDetail(type) {
  const overlay = document.getElementById("detail-overlay");
  const content = document.getElementById("detail-content");
  const title = document.getElementById("overlay-title");
  
  if (type === 'algorithm') {
    title.textContent = "Algorithm spec & Performance benchmark";
    content.innerHTML = algorithms.map(a => `
      <div class="card">
        <h3 style="color:var(--accent-cyan)">${a.name}</h3>
        <p style="font-size:13px; color:var(--text-muted); margin:12px 0;">${a.detail}</p>
        <div style="font-family:'JetBrains Mono'; font-size:11px; color:var(--accent-magenta)">
          PK: ${a.metrics.pk} / CT/SIG: ${a.metrics.sig || a.metrics.ct}<br/>
          PERF: ${a.metrics.speed}
        </div>
      </div>
    `).join("");
  } else if (type === 'handshake') {
    title.textContent = "Protocol Handshake analysis";
    content.innerHTML = scenarios.map(s => `
      <div class="card">
        <h3 style="color:var(--accent-green)">${s.label}</h3>
        <p style="font-size:13px; color:var(--text-muted)">Payload Detail: ${s.stats}</p>
      </div>
    `).join("");
  }
  
  overlay.classList.add("is-open");
}

function closeDetail() {
  document.getElementById("detail-overlay").classList.remove("is-open");
}

// --- 3D 深度网络拓扑 ---
function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  const layers = [
    { count: 15, opacity: 0.1, blur: 4, speed: 6 },
    { count: 20, opacity: 0.4, blur: 0, speed: 4 },
    { count: 10, opacity: 0.8, blur: 0, speed: 2 }
  ];

  layers.forEach((layer, lIdx) => {
    for (let i = 0; i < layer.count; i++) {
      nodes.push({
        x: 20 + Math.random() * 400,
        y: 20 + Math.random() * 320,
        r: 1.5 + (2 - lIdx) * 2,
        opacity: layer.opacity,
        blur: layer.blur,
        tone: ['cyan', 'violet', 'magenta'][Math.floor(Math.random()*3)]
      });
    }
  });

  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 60 && nodes[i].opacity === nodes[j].opacity) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="0.2" opacity="${nodes[i].opacity * 0.5}" />`;
      }
    }
  }

  svg.innerHTML = `
    <g opacity="0.05">
      ${[...Array(12)].map((_, i) => `<line x1="${i*40}" y1="0" x2="${i*40}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(10)].map((_, i) => `<line x1="0" y1="${i*40}" x2="440" y2="${i*40}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="var(--accent-${n.tone})" opacity="${n.opacity}" style="filter:blur(${n.blur}px)">
        <animate attributeName="opacity" values="${n.opacity*0.5};${n.opacity};${n.opacity*0.5}" dur="${3+Math.random()*4}s" repeatCount="indefinite" />
      </circle>
    `).join("")}
  `;
}

// --- 数据渲染 ---
function renderUI() {
  document.getElementById("principle-nav").innerHTML = principles.map((p, i) => `
    <div style="padding: 16px; border: 1px solid var(--glass-border); cursor:pointer; transition:0.3s;" onclick="selectPrinciple(${i})">
      <strong style="color:var(--accent-cyan); font-size:14px;">${p.label}</strong>
    </div>
  `).join("");

  document.getElementById("algorithm-grid").innerHTML = algorithms.map(a => `
    <div class="card" style="cursor:pointer;" onclick="selectAlgorithm('${a.id}')">
      <h3 style="font-size:18px; color:var(--accent-cyan)">${a.name}</h3>
      <p style="font-size:12px; color:var(--text-muted); margin-top:8px;">${a.role}</p>
    </div>
  `).join("");

  document.getElementById("scenario-list").innerHTML = scenarios.map(s => `
    <div style="padding: 20px; border: 1px solid var(--glass-border); cursor:pointer;" onclick="selectScenario('${s.id}')">
      <div style="display:flex; justify-content:space-between;">
        <strong>${s.label}</strong>
        <span style="font-family:'JetBrains Mono'; font-size:11px; color:var(--accent-magenta)">${s.stats}</span>
      </div>
    </div>
  `).join("");

  selectPrinciple(0);
  selectScenario('tls-hybrid');
}

function selectPrinciple(idx) {
  const p = principles[idx];
  document.getElementById("principle-info").innerHTML = `<h3>${p.label}</h3><p style="color:var(--text-muted); font-size:14px; margin-top:10px;">${p.brief}</p>`;
  document.getElementById("principle-stage").innerHTML = `<div style="display:grid; place-items:center; height:100%; font-family:'JetBrains Mono'; color:var(--accent-cyan); font-size:12px;">// SIMULATING_${p.id.toUpperCase()}_MODEL...</div>`;
}

function selectScenario(id) {
  const s = scenarios.find(x => x.id === id);
  document.getElementById("scenario-brief").innerHTML = `<h3>${s.label}</h3><p style="color:var(--text-muted); margin-top:12px; font-size:14px; line-height:1.6;">${s.brief}</p>`;
}

// 启动
document.addEventListener("DOMContentLoaded", () => {
  initDataStreams();
  buildHeroNetwork();
  renderUI();
  
  document.querySelectorAll(".nav-dot").forEach(dot => {
    dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.index)));
  });
});

window.goToPage = goToPage;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.selectPrinciple = selectPrinciple;
window.selectScenario = selectScenario;

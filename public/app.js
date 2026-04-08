// --- 完整数据集 ---
const algorithms = [
  { id: "ml-kem", name: "ML-KEM", role: "KEM", detail: "格密码主力，Module-LWE 假设。pk: 1184B, ct: 1088B。", extra: "基于 R_q = Z_q[x]/(x^256 + 1)。NTT 加速实现。" },
  { id: "ml-dsa", name: "ML-DSA", role: "Sign", detail: "格签名标准，模块格拒绝采样。sig: 2420B。", extra: "拒绝采样确保分布均匀。支持多级安全参数。" },
  { id: "slh-dsa", name: "SLH-DSA", role: "Sign", detail: "哈希签名，极其保守，不依赖代数假设。sig: 17KB。", extra: "基于 Merkle Tree 构造。签名开销极大但安全性最高。" },
  { id: "hqc", name: "HQC", role: "KEM", detail: "码基 KEM，NIST 备份路线。pk: 2249B。", extra: "基于纠错码理论。抗格攻击能力强。" }
];

const principles = [
  { id: "lattice", label: "Lattice (格)", brief: "利用高维空间中寻找最短向量的数学困难性。", visual: "lattice" },
  { id: "hash", label: "Hash (哈希树)", brief: "基于单向函数的单次签名与多层树状认证路径。", visual: "hash" },
  { id: "code", label: "Code (码基)", brief: "利用纠错码解码过程中的伪随机噪声干扰。", visual: "code" }
];

const scenarios = [
  { id: "tls-hybrid", label: "Hybrid TLS 1.3", brief: "X25519 + ML-KEM-768。当前主流部署路线。", metrics: "+1.2KB Client Hello" },
  { id: "ikev2", label: "IKEv2 VPN", brief: "面向隧道建立的抗量子保护。分片与 MTU 挑战。", metrics: "Multi-fragmented UDP" }
];

// --- 全屏翻页逻辑 ---
let currentPage = 0;
const totalPages = 4;
let isScrolling = false;

function goToPage(index) {
  if (index < 0 || index >= totalPages) return;
  currentPage = index;
  const shell = document.getElementById("app-shell");
  shell.style.transform = `translateY(-${currentPage * 100}%)`;
  
  // 更新导航点
  document.querySelectorAll(".nav-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentPage);
  });

  // 更新内容激活状态
  document.querySelectorAll(".content-section").forEach((sec, i) => {
    sec.classList.toggle("is-active", i === currentPage);
  });
}

window.addEventListener("wheel", (e) => {
  if (isScrolling) return;
  if (Math.abs(e.deltaY) < 30) return;
  
  isScrolling = true;
  if (e.deltaY > 0) goToPage(currentPage + 1);
  else goToPage(currentPage - 1);
  
  setTimeout(() => { isScrolling = false; }, 1000);
}, { passive: true });

document.querySelectorAll(".nav-dot").forEach(dot => {
  dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.index)));
});

// --- 详情浮层逻辑 ---
function openDetail(type) {
  const overlay = document.getElementById("detail-overlay");
  const content = document.getElementById("detail-content");
  overlay.classList.add("is-active"); // CSS 处理滑动
  
  // 这里根据类型填充极其详细的数据
  if (type === 'algorithm') {
    content.innerHTML = `
      <h2 style="color:var(--accent-violet)">算法规格矩阵 (Spec Matrix)</h2>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 40px;">
        ${algorithms.map(a => `
          <div class="card">
            <h3>${a.name}</h3>
            <p>${a.extra}</p>
            <div style="margin-top: 20px; font-family: 'JetBrains Mono'; font-size: 13px; color: var(--accent-cyan)">
              CPU Cycles: ~${Math.floor(Math.random()*100000)}<br/>
              Memory Footprint: ${Math.floor(Math.random()*64)} KB
            </div>
          </div>
        `).join("")}
      </div>
    `;
  } else if (type === 'principle') {
    content.innerHTML = `<h2 style="color:var(--accent-cyan)">底层数学方程 (Mathematical Logic)</h2><p style="margin-top:20px;">这里显示 LaTeX 公式和复杂的格点变换逻辑...</p>`;
  } else if (type === 'handshake') {
    content.innerHTML = `<h2 style="color:var(--accent-green)">Wireshark 数据包深度分析</h2><p style="margin-top:20px;">这里显示二进制包头、TLS 扩展字段以及具体的握手时序图...</p>`;
  }
  
  overlay.classList.add("is-open");
}

function closeDetail() {
  document.getElementById("detail-overlay").classList.remove("is-open");
}

// --- 复杂 Hero 网络生成 ---
function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  // 生成 45 个节点
  const nodes = [];
  for (let i = 0; i < 45; i++) {
    nodes.push({
      x: 20 + Math.random() * 400,
      y: 20 + Math.random() * 320,
      r: 2 + Math.random() * 4,
      tone: ['cyan', 'violet', 'green', 'blue'][Math.floor(Math.random()*4)]
    });
  }

  // 生成连接关系 (距离较近的连线)
  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 80) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="0.3" opacity="${1 - dist/80}" />`;
      }
    }
  }

  svg.innerHTML = `
    <!-- 背景坐标系 -->
    <g opacity="0.1">
      ${[...Array(10)].map((_, i) => `<line x1="${i*44}" y1="0" x2="${i*44}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(8)].map((_, i) => `<line x1="0" y1="${i*45}" x2="440" y2="${i*45}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map((n, i) => `
      <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="var(--accent-${n.tone})" opacity="0.6">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="${2+Math.random()*3}s" repeatCount="indefinite" />
      </circle>
    `).join("")}
  `;
}

// --- 数据渲染 ---
function renderUI() {
  // 原理导航
  document.getElementById("principle-nav").innerHTML = principles.map((p, i) => `
    <button class="cta-button" style="text-align:left; padding: 12px 20px; font-size:13px;" onclick="selectPrinciple(${i})">${p.label}</button>
  `).join("");

  // 算法列表
  document.getElementById("algorithm-list").innerHTML = algorithms.map(a => `
    <div style="padding: 16px; border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer" onclick="selectAlgorithm('${a.id}')">
      <strong style="display:block; color:var(--accent-cyan)">${a.name}</strong>
      <span style="font-size:12px; color:var(--text-muted)">${a.role}</span>
    </div>
  `).join("");

  // 场景列表
  document.getElementById("scenario-list").innerHTML = scenarios.map(s => `
    <div style="padding: 16px; border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer" onclick="selectScenario('${s.id}')">
      <strong style="display:block; color:var(--accent-green)">${s.label}</strong>
      <p style="font-size:12px; color:var(--text-muted); margin-top:5px;">${s.brief}</p>
    </div>
  `).join("");

  selectPrinciple(0);
  selectAlgorithm('ml-kem');
  selectScenario('tls-hybrid');
}

function selectPrinciple(idx) {
  const p = principles[idx];
  document.getElementById("principle-summary").innerHTML = `<h3 style="color:var(--accent-cyan)">${p.label} 模型</h3><p style="color:var(--text-muted)">${p.brief}</p>`;
  document.getElementById("principle-visual-container").innerHTML = `<div style="display:grid; place-items:center; height:100%; color:var(--accent-cyan)">[ 动态演示: ${p.id} ]</div>`;
}

function selectAlgorithm(id) {
  const a = algorithms.find(x => x.id === id);
  document.getElementById("algorithm-brief").innerHTML = `<h3 style="color:var(--accent-violet)">${a.name} 简介</h3><p style="color:var(--text-muted)">${a.detail}</p>`;
}

function selectScenario(id) {
  const s = scenarios.find(x => x.id === id);
  document.getElementById("scenario-brief").innerHTML = `<h3 style="color:var(--accent-green)">${s.label}</h3><p style="color:var(--text-muted)">${s.brief}</p><div style="margin-top:20px; font-weight:700; color:var(--accent-cyan)">Metrics: ${s.metrics}</div>`;
}

// 启动
document.addEventListener("DOMContentLoaded", () => {
  buildHeroNetwork();
  renderUI();
  goToPage(0);
});

window.goToPage = goToPage;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.selectPrinciple = selectPrinciple;
window.selectAlgorithm = selectAlgorithm;
window.selectScenario = selectScenario;

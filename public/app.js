// --- 数据定义 ---
const heroIndicators = [
  {
    percent: 52,
    precision: 0,
    short: "PQC",
    tone: "cyan",
    title: "Web 流量占比",
    detail: "Cloudflare 2025 年末观测到的 PQ 加密流量占比",
  },
  {
    percent: 39,
    precision: 0,
    short: "Sites",
    tone: "violet",
    title: "公开网站启用率",
    detail: "支持 X25519MLKEM768 或相关 PQ 路线的网站占比",
  },
  {
    percent: 3.7,
    precision: 1,
    short: "Origin",
    tone: "green",
    title: "源站保护率",
    detail: "Cloudflare 与 origin 之间具备 PQ 保护的连接占比",
  },
];

const handshakeMetrics = [
  {
    key: "clientExtraBytes",
    label: "C -> S 额外开销",
    unit: "B",
    max: 1200,
    note: "TLS 1.3 引入 PQ Key Share 后的典型增量。",
  },
  {
    key: "serverExtraBytes",
    label: "S -> C 额外开销",
    unit: "B",
    max: 1100,
    note: "服务端返回 Ciphertext 造成的握手字节增长。",
  },
  {
    key: "largestNewObject",
    label: "新增单体对象",
    unit: "B",
    max: 1184,
    note: "ML-KEM-768 公钥尺寸为 1184 字节。",
  },
];

const handshakeScenarios = [
  {
    id: "tls-classical",
    label: "Classical TLS 1.3",
    badge: "Baseline",
    summary: "X25519 / ECDHE 基线",
    compare: { clientExtraBytes: 0, serverExtraBytes: 0, largestNewObject: 0 },
    facts: [
      ["基线对象", "X25519 32 B"],
      ["长期保密性", "无法抵抗量子攻击"],
      ["兼容性", "100% 现代设备支持"],
    ],
    packet: {
      lead: "传统路径下对象极小，通常在几十字节量级。",
      blocks: [
        { label: "32B", tone: "base" },
        { label: "X25519", tone: "ghost", flex: true },
      ],
    },
    notes: ["作为基线对比", "无 PQ 保护"],
  },
  {
    id: "tls-hybrid",
    label: "Hybrid TLS 1.3",
    badge: "Current Standard",
    summary: "X25519MLKEM768 混合模式",
    compare: { clientExtraBytes: 1200, serverExtraBytes: 1100, largestNewObject: 1184 },
    facts: [
      ["PQ 对象", "ML-KEM-768 (1.1KB)"],
      ["握手延迟", "+4% 均值回归"],
      ["状态", "IETF Draft 推进中"],
    ],
    packet: {
      lead: "混合模式在保留传统安全性的同时，插入了约 1KB 的 PQ 对象。",
      blocks: [
        { label: "32B", tone: "base" },
        { label: "pk", tone: "cyan", repeat: 4 },
        { label: "ct", tone: "violet", repeat: 4 },
        { label: "KDF", tone: "green" },
      ],
    },
    notes: ["Cloudflare 默认首选", "防止 Harvest Now, Decrypt Later"],
  },
  {
    id: "ikev2-mlkem",
    label: "IKEv2 + ML-KEM",
    badge: "VPN / IPsec",
    summary: "工业级隧道 PQC 集成",
    compare: { clientExtraBytes: null, serverExtraBytes: null, largestNewObject: 1184 },
    facts: [
      ["核心挑战", "消息分片与网关固件兼容性"],
      ["网络影响", "MTU 敏感，可能触发重传"],
      ["部署价值", "保护企业内网长久安全"],
    ],
    packet: {
      lead: "VPN 场景更关注分片后的稳健性，而非单纯的字节数。",
      blocks: [
        { label: "HDR", tone: "base" },
        { label: "SA", tone: "ghost" },
        { label: "KE", tone: "cyan", repeat: 5 },
        { label: "Frag", tone: "green", flex: true },
      ],
    },
    notes: ["适用于网对网隧道", "抗量子 IKE 交换"],
  },
];

const algorithms = [
  {
    id: "ml-kem",
    name: "ML-KEM",
    family: "Lattice / Module-LWE",
    role: "密钥封装 (KEM)",
    sizes: "768级: pk 1184 / ct 1088",
    why: "NIST 选定的主力 KEM，具备优秀的性能与尺寸平衡。",
    facts: [
      ["数学基础", "模块格上的学习错误问题"],
      ["主要运算", "数论变换 (NTT)"],
      ["安全级别", "AES-192 等效"],
    ],
    pathTitle: "格问题机制",
    pathSteps: [
      "基于 A*s + e 的带噪线性方程组。",
      "利用秘密向量 s 作为陷门进行纠偏。",
      "在多项式环上通过 NTT 实现极速乘法。",
    ],
    formulaTitle: "核心关系",
    formula: "b = A * s + e (mod q)\n\nA: 公开矩阵\ns: 私钥\ne: 小噪声",
    takeaway: "噪声 e 是核心，它让普通的一元方程组变成了量子计算机也难以解决的搜索问题。",
  },
  {
    id: "ml-dsa",
    name: "ML-DSA",
    family: "Lattice / Module-LWE",
    role: "数字签名",
    sizes: "44级: pk 1312 / sig 2420",
    why: "下一代通用签名标准，用于替换 RSA 和 ECDSA。",
    facts: [
      ["数学基础", "基于格的拒绝采样"],
      ["安全特点", "抗重放与强不可伪造性"],
      ["接口", "KeyGen / Sign / Verify"],
    ],
    pathTitle: "签名生成路径",
    pathSteps: [
      "采样随机掩码向量并进行线性变换。",
      "结合消息 Hash 生成挑战值。",
      "使用拒绝采样确保私钥信息不被泄露。",
    ],
    formulaTitle: "结构口径",
    formula: "z = y + c * s1\n\ny: 掩码\nc: 挑战值\ns1: 私钥向量",
    takeaway: "拒绝采样的引入是 ML-DSA 保持分布均匀、防止泄露私钥的关键。",
  },
];

const principleFamilies = [
  {
    id: "lattice",
    label: "格密码 (Lattice)",
    title: "高维空间中的噪声纠偏",
    intro: "后量子时代的主力军，利用高维格点的数学困难性。",
    facts: [
      ["核心问题", "最短向量问题 (SVP)"],
      ["优势", "实现高效，对象尺寸中等"],
    ],
    steps: ["规则格点构成背景空间。", "噪声云让精确点变得模糊。", "私钥陷门引导接收者找到唯一的真解。"],
    formulaTitle: "LWE 方程",
    formula: "b = A * s + e",
    takeaway: "格密码的魅力在于它将数学上的'近似'转化为了逻辑上的'绝对'。",
  },
  {
    id: "hash",
    label: "哈希签名 (Hash)",
    title: "Merkle 树的层级信任",
    intro: "基于最简单的哈希原语构造极其稳健的签名体系。",
    facts: [
      ["核心原语", "SHA-3 / SHAKE"],
      ["优势", "不依赖复杂的代数假设"],
    ],
    steps: ["消息映射到巨型 Merkle 树的叶子。", "签名包含到达根部的认证路径。", "验证者只需不断哈希即可确认根节点的真实性。"],
    formulaTitle: "认证路径",
    formula: "root = H(H(leaf, sibling), uncle...)",
    takeaway: "只要哈希函数不被破解，哈希签名就是安全的。它是最保守、最长寿的方案。",
  },
];

// --- 逻辑实现 ---

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// 初始化 UI
function init() {
  renderHeroRings();
  initNavigation();
  initScrollReveal();
  renderScenario(handshakeScenarios[1].id);
  renderAlgorithm(algorithms[0].id);
  renderPrinciple(0);
  buildHeroNetwork();
}

// 导航逻辑
function initNavigation() {
  const navButtons = document.querySelectorAll(".view-link");
  const sections = document.querySelectorAll(".content-section");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      if (scrollY >= top - 200) current = sec.getAttribute("id");
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.target === current);
    });
  }, { passive: true });
}

// 入场动画逻辑
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// 统计环渲染
function renderHeroRings() {
  const container = document.getElementById("hero-rings");
  container.innerHTML = heroIndicators.map((item, i) => `
    <div class="stat-ring-card reveal" style="transition-delay: ${i * 100}ms">
      <div class="stat-ring-wrap">
        <svg viewBox="0 0 80 80">
          <circle class="stat-ring-bg" cx="40" cy="40" r="${RING_RADIUS}"></circle>
          <circle class="stat-ring-fg" cx="40" cy="40" r="${RING_RADIUS}" 
            style="stroke: var(--accent-${item.tone}); stroke-dasharray: ${RING_CIRCUMFERENCE}; stroke-dashoffset: ${RING_CIRCUMFERENCE}"
          ></circle>
        </svg>
        <div class="stat-ring-center" style="position: absolute; inset:0; display:flex; align-items:center; justify-content:center;">
          <strong id="ring-val-${i}">0%</strong>
        </div>
      </div>
      <div class="stat-ring-copy">
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      </div>
    </div>
  `).join("");

  // 动画启动
  setTimeout(() => {
    heroIndicators.forEach((item, i) => {
      const fg = container.querySelectorAll(".stat-ring-fg")[i];
      const offset = RING_CIRCUMFERENCE * (1 - item.percent / 100);
      fg.style.strokeDashoffset = offset;
      animateNumber(`ring-val-${i}`, item.percent, item.precision);
    });
  }, 500);
}

function animateNumber(id, target, precision) {
  const el = document.getElementById(id);
  let start = 0;
  const duration = 1500;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const val = (target * eased).toFixed(precision);
    el.textContent = `${val}%`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// 场景渲染
function renderScenario(id) {
  const scenario = handshakeScenarios.find(s => s.id === id);
  const list = document.getElementById("scenario-list");
  const detail = document.getElementById("scenario-detail");

  list.innerHTML = handshakeScenarios.map(s => `
    <div class="option ${s.id === id ? 'is-active' : ''}">
      <button onclick="renderScenario('${s.id}')">
        <span class="label">${s.badge}</span>
        <strong>${s.label}</strong>
        <p>${s.summary}</p>
      </button>
    </div>
  `).join("");

  detail.innerHTML = `
    <div class="detail-section reveal active">
      <h4>对象与指标</h4>
      <div style="display:grid; gap:12px;">
        ${scenario.facts.map(f => `
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-glass);">
            <span style="color:var(--text-muted)">${f[0]}</span>
            <span>${f[1]}</span>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="detail-section reveal active">
      <h4>数据包模拟</h4>
      <p style="font-size:14px; color:var(--text-muted); margin-bottom:12px;">${scenario.packet.lead}</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${scenario.packet.blocks.map(b => `
          <div class="label" style="background:var(--bg-core); min-width:60px; text-align:center;">${b.label}</div>
        `).join("")}
      </div>
    </div>
  `;
}

// 算法渲染
function renderAlgorithm(id) {
  const algo = algorithms.find(a => a.id === id);
  const grid = document.getElementById("algorithm-grid");
  const detail = document.getElementById("algorithm-detail");

  grid.innerHTML = algorithms.map(a => `
    <div class="algo-card ${a.id === id ? 'is-active' : ''}">
      <button onclick="renderAlgorithm('${a.id}')">
        <strong>${a.name}</strong>
        <div class="algo-meta">${a.family}</div>
      </button>
    </div>
  `).join("");

  detail.innerHTML = `
    <div class="detail-section reveal active">
      <span class="label">${algo.role}</span>
      <h4>${algo.why}</h4>
      <pre class="formula-block">${algo.formula}</pre>
    </div>
    <div class="detail-section reveal active">
      <h4>核心步骤</h4>
      <ul style="padding-left:18px; color:var(--text-muted); font-size:14px;">
        ${algo.pathSteps.map(s => `<li style="margin-bottom:8px;">${s}</li>`).join("")}
      </ul>
    </div>
  `;
}

// 原理渲染
function renderPrinciple(idx) {
  const family = principleFamilies[idx];
  const visual = document.getElementById("principle-visual");
  const detail = document.getElementById("principle-detail");

  visual.innerHTML = `
    <div style="height:240px; background:var(--bg-core); border-radius:12px; display:grid; place-items:center; border:1px solid var(--border-glass);">
      <div style="text-align:center;">
        <div class="label" style="margin-bottom:20px;">${family.label} 交互演示</div>
        <div style="color:var(--text-dim); font-size:13px;">[此处在生产环境中可接入特定的 SVG 动画引擎]</div>
      </div>
    </div>
    <div style="display:flex; gap:12px; margin-top:20px;">
      ${principleFamilies.map((f, i) => `
        <button class="cta-secondary" style="flex:1; font-size:13px; padding:8px;" onclick="renderPrinciple(${i})">
          ${f.label}
        </button>
      `).join("")}
    </div>
  `;

  detail.innerHTML = `
    <div class="detail-section reveal active">
      <h4>${family.title}</h4>
      <p style="color:var(--text-muted); font-size:14px;">${family.intro}</p>
      <pre class="formula-block" style="margin-top:16px;">${family.formula}</pre>
    </div>
  `;
}

// Hero SVG 网络背景渲染 (简化版)
function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = Array.from({ length: 12 }, () => ({
    x: Math.random() * 440,
    y: Math.random() * 360,
    r: 2 + Math.random() * 4
  }));

  svg.innerHTML = `
    ${nodes.map(n => `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="var(--accent-cyan)" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="${3+Math.random()*3}s" repeatCount="indefinite" />
    </circle>`).join("")}
    ${nodes.map((n, i) => {
      const next = nodes[(i + 1) % nodes.length];
      return `<line x1="${n.x}" y1="${n.y}" x2="${next.x}" y2="${next.y}" stroke="var(--accent-blue)" stroke-width="0.5" opacity="0.2" />`;
    }).join("")}
  `;
}

// 启动
window.addEventListener("DOMContentLoaded", init);

// 将渲染函数暴露给全局，以便 HTML 内联调用
window.renderScenario = renderScenario;
window.renderAlgorithm = renderAlgorithm;
window.renderPrinciple = renderPrinciple;

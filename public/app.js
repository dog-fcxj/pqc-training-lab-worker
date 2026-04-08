// --- 完整数据集 (从原始版本恢复) ---
const heroIndicators = [
  { percent: 52, precision: 0, short: "PQC", tone: "cyan", title: "Web 流量占比", detail: "Cloudflare 2025 年末观测到的 PQ 加密流量占比" },
  { percent: 39, precision: 0, short: "Sites", tone: "violet", title: "公开网站启用率", detail: "支持 X25519MLKEM768 或相关 PQ 路线的网站占比" },
  { percent: 3.7, precision: 1, short: "Origin", tone: "green", title: "源站保护率", detail: "Cloudflare 与 origin 之间具备 PQ 保护的连接占比" },
];

const handshakeMetrics = [
  { key: "clientExtraBytes", label: "C -> S 额外开销", unit: "B", max: 1200, note: "TLS 1.3 引入 PQ Key Share 后的典型增量。" },
  { key: "serverExtraBytes", label: "S -> C 额外开销", unit: "B", max: 1100, note: "服务端返回 Ciphertext 造成的握手字节增长。" },
  { key: "largestNewObject", label: "新增单体对象", unit: "B", max: 1184, note: "ML-KEM-768 公钥尺寸为 1184 字节。" },
];

const handshakeScenarios = [
  {
    id: "tls-classical",
    label: "Classical TLS 1.3",
    badge: "Baseline",
    summary: "X25519 / ECDHE 基线",
    compare: { clientExtraBytes: 0, serverExtraBytes: 0, largestNewObject: 0 },
    facts: [["基线对象", "X25519 32 B"], ["长期保密性", "无法抵抗量子攻击"], ["用途", "作为 classical baseline"]],
    packet: {
      lead: "传统路径下对象极小，通常在几十字节量级。",
      blocks: [{ label: "32B", tone: "base" }, { label: "X25519", tone: "ghost", flex: true }],
    },
    notes: ["今天大多数 TLS 1.3 部署仍以 X25519 为基线。", "对象最小、兼容性最好，但不提供 post-quantum key agreement。"],
  },
  {
    id: "tls-hybrid",
    label: "Hybrid TLS 1.3",
    badge: "Current Standard",
    summary: "X25519MLKEM768 混合模式",
    compare: { clientExtraBytes: 1200, serverExtraBytes: 1100, largestNewObject: 1184 },
    facts: [["PQ 对象", "ML-KEM-768 (1.1KB)"], ["握手延迟", "约 4% 均值回归"], ["状态", "draft-ietf-tls-ecdhe-mlkem 已提交 IESG"]],
    packet: {
      lead: "混合模式在保留传统安全性的同时，插入了约 1KB 的 PQ 对象。",
      blocks: [{ label: "32B", tone: "base" }, { label: "pk", tone: "cyan", repeat: 5 }, { label: "ct", tone: "violet", repeat: 4 }, { label: "KDF", tone: "green" }],
    },
    notes: ["Cloudflare 文档将 X25519MLKEM768 作为推荐 hybrid key agreement。", "KEM 路线可先处理 HNDL 风险，签名体系的替换仍需单独评估。"],
  },
  {
    id: "ikev2-mlkem",
    label: "IKEv2 + ML-KEM",
    badge: "VPN / IPsec",
    summary: "工业级隧道 PQC 集成",
    compare: { clientExtraBytes: null, serverExtraBytes: null, largestNewObject: 1184 },
    facts: [["核心挑战", "消息分片与网关固件兼容性"], ["网络影响", "MTU 敏感，可能触发重传"], ["状态", "draft-ietf-ipsecme-ikev2-mlkem 已提交 IESG"]],
    packet: {
      lead: "VPN 场景更关注分片后的稳健性，而非单纯的字节数。",
      blocks: [{ label: "HDR", tone: "base" }, { label: "SA", tone: "ghost" }, { label: "KE", tone: "cyan", repeat: 6 }, { label: "Frag", tone: "green", flex: true }],
    },
    notes: ["ML-KEM 对象进入 IKE 交换后，PMTU 与 fragmentation 会直接影响行为。", "这条路线把 PQC 拉进了 VPN / 隧道协议栈，而不只是浏览器流量。"],
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
    facts: [["数学基础", "模块格上的学习错误问题"], ["主要运算", "数论变换 (NTT)"], ["安全级别", "AES-192 等效"]],
    pathTitle: "格问题机制",
    pathSteps: ["公开矩阵 A 与秘密向量 s 生成带噪关系 b = A*s + e (mod q)。", "利用秘密向量 s 作为陷门进行纠偏。", "在多项式环上通过 NTT 实现极速乘法。"],
    formulaTitle: "核心关系",
    formula: "b = A * s + e (mod q)\n\nA: 公开矩阵\ns: 私钥\ne: 小噪声",
    takeaway: "噪声 e 让问题从精确线性求解变成带噪近似求解。ML-KEM 把这个困难性搬到了多项式模块。",
  },
  {
    id: "ml-dsa",
    name: "ML-DSA",
    family: "Lattice / Module-LWE",
    role: "数字签名",
    sizes: "44级: pk 1312 / sig 2420",
    why: "下一代通用签名标准，用于替换 RSA 和 ECDSA。",
    facts: [["数学对象", "模块格签名"], ["安全特点", "拒绝采样机制"], ["接口", "KeyGen / Sign / Verify"]],
    pathTitle: "签名生成路径",
    pathSteps: ["先采样临时向量 y，并计算 w = A*y。", "从消息与高位信息导出 challenge c。", "构造 z = y + c*s1，并附带 hint 让验证者恢复必要的高位信息。"],
    formulaTitle: "结构口径",
    formula: "z = y + c * s1\n\ny: 掩码\nc: 挑战值\ns1: 私钥向量",
    takeaway: "ML-DSA 与 ML-KEM 使用相近的格基对象，但构造目标不同：签名关心分布控制与可验证性。",
  },
  {
    id: "slh-dsa",
    name: "SLH-DSA",
    family: "Hash-based",
    role: "数字签名",
    sizes: "128f: pk 32 / sig 17088",
    why: "更保守的签名路线，不依赖任何代数假设，作为算法多样性的备份。",
    facts: [["数学对象", "哈希树 / FORS"], ["参数族", "SHA2 / SHAKE"], ["签名大小", "约 17 KB"]],
    pathTitle: "哈希基签名路径",
    pathSteps: ["消息先进入 FORS 结构，生成一次性签名片段。", "FORS 输出再挂到 XMSS 节点上，形成可验证的树路径。", "多层 XMSS 继续向上堆叠成 hypertree。"],
    formulaTitle: "结构口径",
    formula: "M -> FORS leaves\nFORS output -> XMSS leaf\nXMSS auth path -> hypertree path",
    takeaway: "SLH-DSA 的核心不在复杂代数，而在大量哈希调用与认证路径生成。它是最稳健但最重的方案。",
  },
  {
    id: "hqc",
    name: "HQC",
    family: "Code-based",
    role: "备份 KEM",
    sizes: "pk 2249 / ct 4481",
    why: "为 NIST 提供非格基备用路线，基于纠错码理论。",
    facts: [["数学对象", "带噪码字与解码问题"], ["路线价值", "算法多样性备份"], ["接口", "KeyGen / Encaps / Decaps"]],
    pathTitle: "码基 KEM 路线",
    pathSteps: ["公开值与密文都围绕带噪码字构造。", "解封装依赖纠错码解码，不同于格基的 CVP 问题。", "工程差异体现在对象更大、实现热点不同。"],
    formulaTitle: "结构口径",
    formula: "c = encode(m) + e\ndecode(c) -> m",
    takeaway: "码基路线更像可靠通信问题：先容忍错误，再用结构恢复信息。",
  },
];

const principleFamilies = [
  {
    id: "lattice",
    label: "格密码 (Lattice)",
    title: "高维空间中的噪声纠偏",
    intro: "LWE 把精确线性关系改写成带噪关系，公开信息落在规则格点附近的一团扰动里。",
    facts: [["公开量", "A 与 b = A*s + e"], ["核心困难", "带噪学习错误 (LWE)"]],
    steps: ["中心亮点代表一个结构化关系，规则网格代表离散格空间。", "周围涨缩的粒子云对应小噪声 e，观测值因此扩成近邻区域。", "合法接收方利用私钥结构完成纠偏，得到稳定的共享秘密。"],
    formulaTitle: "最短口径",
    formula: "b = A * s + e (mod q)",
    takeaway: "Module-LWE 的价值在于把困难问题与高效实现组织到同一个对象上。",
  },
  {
    id: "hash",
    label: "哈希签名 (Hash)",
    title: "Merkle 树的层级信任",
    intro: "哈希基签名把消息映射到叶节点，再沿认证路径逐层重建到根，验证者只需复算路径。",
    facts: [["核心原语", "SHA-3 / SHAKE"], ["验证逻辑", "路径重构与根比对"]],
    steps: ["消息落到树底部的叶节点，签名给出对应片段。", "认证路径提供每一层的兄弟节点哈希，验证者逐层向上合成。", "到达根节点后，与公开根比较即可完成验证。"],
    formulaTitle: "最短口径",
    formula: "node_i+1 = H(node_i || sibling_i)",
    takeaway: "SLH-DSA 的核心不在复杂代数，而在很长的认证路径对象。",
  },
  {
    id: "code",
    label: "码基密码 (Code)",
    title: "带噪码字与纠错恢复",
    intro: "码基路线把共享秘密编码成冗余码字，通过纠错能力对抗信道式噪声。",
    facts: [["核心原语", "纠错码 (Error Correction)"], ["困难来源", "通用译码问题 (SDP)"]],
    steps: ["发送方先把比特串编码成冗余更强的码字。", "传输后有码位翻转或扰动，接收侧计算 syndrome 观察错误模式。", "解码器根据纠错能力恢复原始码字。"],
    formulaTitle: "最短口径",
    formula: "r = c + e\ndecode(r) -> m",
    takeaway: "码基路线的观感更像可靠通信问题：先容忍错误，再用结构恢复信息。",
  },
];

const heroNoiseParticles = [
  { x: 0, y: 0, size: 10, delay: 0 },
  { x: 24, y: -16, size: 8, delay: 120 },
  { x: -26, y: 20, size: 7, delay: 220 },
  { x: 42, y: 10, size: 9, delay: 320 },
  { x: -40, y: -18, size: 10, delay: 420 },
  { x: 14, y: 36, size: 8, delay: 520 },
  { x: -12, y: -38, size: 9, delay: 620 },
  { x: 48, y: -34, size: 7, delay: 740 },
  { x: -52, y: 34, size: 8, delay: 860 },
];

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// --- 初始化与动效 ---

function init() {
  renderHeroRings();
  initNavigation();
  initScrollReveal();
  renderScenario(handshakeScenarios[1].id);
  renderAlgorithm(algorithms[0].id);
  renderPrinciple(0);
  buildHeroNetwork();
}

function initNavigation() {
  const navButtons = document.querySelectorAll(".view-link");
  const sections = document.querySelectorAll(".content-section");
  navButtons.forEach(btn => btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(sec => { if (scrollY >= sec.offsetTop - 200) current = sec.getAttribute("id"); });
    navButtons.forEach(btn => btn.classList.toggle("is-active", btn.dataset.target === current));
  }, { passive: true });
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

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
          <strong id="ring-val-${i}" style="color:var(--accent-${item.tone})">0%</strong>
        </div>
      </div>
      <div class="stat-ring-copy">
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      </div>
    </div>
  `).join("");
  setTimeout(() => {
    heroIndicators.forEach((item, i) => {
      const fg = container.querySelectorAll(".stat-ring-fg")[i];
      fg.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - item.percent / 100);
      animateNumber(`ring-val-${i}`, item.percent, item.precision);
    });
  }, 500);
}

function animateNumber(id, target, precision) {
  const el = document.getElementById(id);
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / 1500, 1);
    const val = (target * (1 - Math.pow(1 - progress, 3))).toFixed(precision);
    el.textContent = `${val}%`;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// --- 详情渲染逻辑 ---

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
      <div style="display:grid; gap:10px;">
        ${scenario.facts.map(f => `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-glass);">
          <span style="color:var(--text-muted)">${f[0]}</span><span>${f[1]}</span>
        </div>`).join("")}
      </div>
    </div>
    <div class="detail-section reveal active">
      <h4>数据包模拟</h4>
      <p style="font-size:14px; color:var(--text-muted); margin-bottom:12px;">${scenario.packet.lead}</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${scenario.packet.blocks.map((b, i) => `<div class="label tone-${b.tone}" style="min-width:60px; text-align:center;">${b.label}</div>`).join("")}
      </div>
    </div>
    <div class="detail-section reveal active">
      <h4>约束来源</h4>
      <ul style="padding-left:18px; color:var(--text-muted); font-size:14px;">
        ${scenario.notes.map(n => `<li style="margin-bottom:6px;">${n}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderAlgorithm(id) {
  const algo = algorithms.find(a => a.id === id);
  const grid = document.getElementById("algorithm-grid");
  const detail = document.getElementById("algorithm-detail");
  grid.innerHTML = algorithms.map(a => `
    <div class="algo-card ${a.id === id ? 'is-active' : ''}">
      <button onclick="renderAlgorithm('${a.id}')">
        <strong>${a.name}</strong>
        <div class="algo-meta">${a.family} | ${a.role}</div>
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
      <h4>${algo.pathTitle}</h4>
      <ul style="padding-left:18px; color:var(--text-muted); font-size:14px;">
        ${algo.pathSteps.map(s => `<li style="margin-bottom:8px;">${s}</li>`).join("")}
      </ul>
    </div>
    <p class="subtle" style="margin:0 24px; color:var(--text-dim); font-size:13px;">${algo.takeaway}</p>
  `;
}

function renderPrinciple(idx) {
  const family = principleFamilies[idx];
  const visual = document.getElementById("principle-visual");
  const detail = document.getElementById("principle-detail");
  
  let visualMarkup = "";
  if (family.id === "lattice") visualMarkup = renderLatticeVisual();
  else if (family.id === "hash") visualMarkup = renderHashVisual();
  else if (family.id === "code") visualMarkup = renderCodeVisual();

  visual.innerHTML = `
    <div class="principle-viewport" style="min-height:300px; background:var(--bg-core); border-radius:12px; border:1px solid var(--border-glass); overflow:hidden; position:relative;">
      ${visualMarkup}
    </div>
    <div style="display:flex; gap:12px; margin-top:20px;">
      ${principleFamilies.map((f, i) => `
        <button class="cta-secondary ${i === idx ? 'is-active' : ''}" style="flex:1; font-size:12px; padding:10px; ${i === idx ? 'border-color:var(--accent-cyan); color:var(--accent-cyan)' : ''}" onclick="renderPrinciple(${i})">
          ${f.label}
        </button>
      `).join("")}
    </div>
  `;

  detail.innerHTML = `
    <div class="detail-section reveal active">
      <h4>${family.title}</h4>
      <p style="color:var(--text-muted); font-size:14px; margin-bottom:16px;">${family.intro}</p>
      <div style="display:grid; gap:8px;">
        ${family.facts.map(f => `<div style="display:flex; justify-content:space-between; font-size:13px;"><span style="color:var(--text-dim)">${f[0]}</span><span>${f[1]}</span></div>`).join("")}
      </div>
    </div>
    <div class="detail-section reveal active">
      <h4>运算步骤</h4>
      <ul style="padding-left:18px; color:var(--text-muted); font-size:13px;">
        ${family.steps.map(s => `<li style="margin-bottom:6px;">${s}</li>`).join("")}
      </ul>
    </div>
  `;
}

// --- SVG 动效组件 (恢复自旧版本) ---

function renderLatticeVisual() {
  return `
    <div style="position:absolute; inset:0; opacity:0.1; background-image:radial-gradient(var(--text-dim) 1px, transparent 1px); background-size:30px 30px;"></div>
    <svg viewBox="0 0 400 300" style="position:absolute; inset:0; width:100%; height:100%">
      <circle cx="200" cy="150" r="10" fill="var(--accent-cyan)" style="filter:drop-shadow(0 0 10px var(--accent-cyan))">
        <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
      </circle>
      <g opacity="0.6">
        ${[...Array(12)].map((_, i) => `<circle cx="${200 + Math.cos(i) * 60}" cy="${150 + Math.sin(i) * 60}" r="3" fill="var(--accent-violet)">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="${2 + i % 3}s" repeatCount="indefinite" />
        </circle>`).join("")}
      </g>
    </svg>
    <div style="position:absolute; bottom:15px; width:100%; text-align:center; color:var(--accent-cyan); font-size:12px; font-weight:700">噪声云纠偏示意</div>
  `;
}

function renderHashVisual() {
  return `
    <svg viewBox="0 0 400 300" style="position:absolute; inset:0; width:100%; height:100%">
      <path d="M200 40 L120 100 L60 180 M200 40 L280 100 L340 180" stroke="var(--border-glass)" fill="none" />
      <circle cx="200" cy="40" r="12" fill="var(--accent-green)" />
      <circle cx="120" cy="100" r="10" fill="var(--accent-cyan)" />
      <circle cx="280" cy="100" r="10" fill="var(--border-glass)" />
      <circle cx="60" cy="180" r="8" fill="var(--accent-violet)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
    <div style="position:absolute; top:45px; right:60px; color:var(--accent-green); font-size:11px">ROOT</div>
  `;
}

function renderCodeVisual() {
  const bits = [1, 0, 1, 1, 0, 0, 1, 0];
  return `
    <div style="display:flex; flex-direction:column; gap:20px; align-items:center; height:100%; justify-content:center;">
      <div style="display:flex; gap:6px;">
        ${bits.map(b => `<div class="label" style="width:30px; height:30px; display:grid; place-items:center; background:var(--bg-core)">${b}</div>`).join("")}
      </div>
      <div style="color:var(--text-dim)">+ 噪声 (e)</div>
      <div style="display:flex; gap:6px;">
        ${bits.map((b, i) => `<div class="label" style="width:30px; height:30px; display:grid; place-items:center; background:${i === 3 ? 'var(--accent-violet)' : 'var(--bg-core)'}">${i === 3 ? 1 - b : b}</div>`).join("")}
      </div>
    </div>
  `;
}

function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  const nodes = [
    { x: 76, y: 170, tone: "cyan" }, { x: 118, y: 126, tone: "green" }, { x: 164, y: 92, tone: "blue" },
    { x: 216, y: 72, tone: "cyan" }, { x: 270, y: 92, tone: "green" }, { x: 320, y: 130, tone: "violet" },
    { x: 340, y: 192, tone: "green" }, { x: 304, y: 242, tone: "violet" }, { x: 244, y: 272, tone: "blue" },
    { x: 178, y: 264, tone: "green" }, { x: 130, y: 226, tone: "cyan" }, { x: 204, y: 148, tone: "violet" }
  ];
  const edges = [[0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,8], [8,9], [9,10], [10,0], [11,1], [11,3], [11,5], [11,8]];
  svg.innerHTML = `
    <defs><linearGradient id="line-grad" x1="0%" y1="0%" x2="100%"><stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.2"/><stop offset="100%" stop-color="var(--accent-violet)" stop-opacity="0.2"/></linearGradient></defs>
    ${edges.map(e => `<line x1="${nodes[e[0]].x}" y1="${nodes[e[0]].y}" x2="${nodes[e[1]].x}" y2="${nodes[e[1]].y}" stroke="url(#line-grad)" stroke-width="1" />`).join("")}
    ${nodes.map(n => `<circle cx="${n.x}" cy="${n.y}" r="6" fill="var(--accent-${n.tone})" opacity="0.8">
      <animate attributeName="r" values="5;7;5" dur="${2+Math.random()*2}s" repeatCount="indefinite" />
    </circle>`).join("")}
  `;
  document.getElementById("hero-noise-cloud").innerHTML = heroNoiseParticles.map(p => `
    <span style="position:absolute; left:50%; top:50%; width:${p.size}px; height:${p.size}px; background:var(--accent-violet); border-radius:50%; filter:blur(4px); opacity:0.6; transform:translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px));">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" delay="${p.delay}ms" repeatCount="indefinite" />
    </span>
  `).join("");
}

window.addEventListener("DOMContentLoaded", init);
window.renderScenario = renderScenario;
window.renderAlgorithm = renderAlgorithm;
window.renderPrinciple = renderPrinciple;

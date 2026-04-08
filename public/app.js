const heroIndicators = [
  {
    percent: 52,
    precision: 0,
    short: "PQC",
    tone: "cyan",
    title: "Web 流量中的 PQ 加密占比",
    detail: "Cloudflare 2025 年末 human-generated Web traffic",
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
    title: "源站侧保护率",
    detail: "Cloudflare 与 origin 之间已具备 PQ 保护的连接占比",
  },
];

const handshakeMetrics = [
  {
    key: "clientExtraBytes",
    label: "C -> S 额外握手字节",
    unit: "B",
    max: 1200,
    note: "TLS 的 1200 B 来自 Cloudflare 公开观测；IKEv2 没有统一公开固定增量。",
  },
  {
    key: "serverExtraBytes",
    label: "S -> C 额外握手字节",
    unit: "B",
    max: 1100,
    note: "TLS 的 1100 B 来自 Cloudflare 公开观测；IKEv2 更常按对象尺寸与消息分片讨论。",
  },
  {
    key: "largestNewObject",
    label: "新增单个对象大小",
    unit: "B",
    max: 1184,
    note: "ML-KEM-768 public key 为 1184 B，ciphertext 为 1088 B，这组对象会直接进入协议消息。",
  },
];

const handshakeScenarios = [
  {
    id: "tls-classical",
    label: "Classical TLS 1.3",
    badge: "Baseline",
    summary: "X25519 / ECDHE + 传统证书链",
    compare: {
      clientExtraBytes: 0,
      serverExtraBytes: 0,
      largestNewObject: 0,
    },
    facts: [
      ["基线对象", "X25519 public share 32 B"],
      ["额外握手字节", "0 B / 0 B"],
      ["长期保密性", "不覆盖量子对手场景"],
      ["用途", "作为 classical baseline"],
    ],
    packet: {
      lead: "Classical 路径里，key share 仍维持在几十字节量级。",
      blocks: [
        { label: "32B", tone: "base" },
        { label: "X25519", tone: "ghost", flex: true },
      ],
    },
    notes: [
      "今天大多数 TLS 1.3 部署仍以 X25519 为基线。",
      "对象最小、兼容性最好，但不提供 post-quantum key agreement。",
      "适合与 hybrid 路线做尺寸、延迟和兼容性对照。",
    ],
  },
  {
    id: "tls-hybrid",
    label: "Hybrid TLS 1.3",
    badge: "Current path",
    summary: "X25519MLKEM768 等 hybrid group",
    compare: {
      clientExtraBytes: 1200,
      serverExtraBytes: 1100,
      largestNewObject: 1184,
    },
    facts: [
      ["新增 PQ 对象", "ML-KEM-768 pk 1184 B / ct 1088 B"],
      ["额外握手字节", "+1200 B / +1100 B"],
      ["握手时间回归", "约 4%"],
      ["状态", "draft-ietf-tls-ecdhe-mlkem 已提交 IESG"],
    ],
    packet: {
      lead: "Hybrid 的新增代价主要来自 PQ 对象进入握手，证书链通常仍沿用传统路径。",
      blocks: [
        { label: "32B", tone: "base" },
        { label: "pk", tone: "cyan", repeat: 6 },
        { label: "ct", tone: "violet", repeat: 5 },
        { label: "KDF", tone: "green" },
      ],
    },
    notes: [
      "Cloudflare 文档将 X25519MLKEM768 作为推荐 hybrid key agreement。",
      "公开部署中最常见的定量变化是握手字节增长，证书链通常仍沿用传统路径。",
      "KEM 路线可先处理 HNDL 风险，签名体系的替换仍需单独评估。",
    ],
  },
  {
    id: "ikev2-mlkem",
    label: "IKEv2 + ML-KEM",
    badge: "VPN / IPsec",
    summary: "面向隧道建立的 ML-KEM 集成",
    compare: {
      clientExtraBytes: null,
      serverExtraBytes: null,
      largestNewObject: 1184,
    },
    facts: [
      ["新增 PQ 对象", "ML-KEM-768 pk 1184 B / ct 1088 B"],
      ["固定额外字节", "无统一公开值"],
      ["主要压力", "分片 / PMTU / 重传 / 网关固件"],
      ["状态", "draft-ietf-ipsecme-ikev2-mlkem 已提交 IESG"],
    ],
    packet: {
      lead: "IKEv2 场景里更重要的是对象进入消息后是否触发分片与重传，通常不会收敛成单一固定值。",
      blocks: [
        { label: "HDR", tone: "base" },
        { label: "SA", tone: "ghost" },
        { label: "KE", tone: "cyan", repeat: 6 },
        { label: "N", tone: "violet", repeat: 3 },
        { label: "frag?", tone: "green", flex: true },
      ],
    },
    notes: [
      "IKEv2 更常按对象尺寸、分片和网关资源边界来讨论，通常不会收敛成单一固定字节增量。",
      "ML-KEM 对象进入 IKE 交换后，PMTU 与 fragmentation 会直接影响行为。",
      "这条路线把 PQC 拉进了 VPN / 隧道协议栈，而不只是浏览器流量。",
    ],
  },
];

const algorithms = [
  {
    id: "ml-kem",
    name: "ML-KEM",
    family: "Module-LWE / lattice",
    role: "KEM",
    sizes: "ML-KEM-768: pk 1184 / ct 1088",
    why: "当前公开部署中最常见的 KEM 之一，也是 hybrid TLS 的主要对象。",
    facts: [
      ["数学对象", "Module-LWE over Rq = Zq[x] / (x^256 + 1), q = 3329"],
      ["主流参数", "ML-KEM-768 对应 k = 3"],
      ["热点运算", "NTT / inverse NTT / sampling / compression"],
      ["接口", "KeyGen / Encaps / Decaps"],
    ],
    pathTitle: "格问题速览",
    pathSteps: [
      "公开矩阵 A 与秘密向量 s 生成带噪关系 b = A*s + e (mod q)。",
      "攻击者看到的是 (A, b)，目标是恢复 s；噪声 e 让问题从精确线性求解变成带噪近似求解。",
      "Module-LWE 把标量扩展到多项式模块，既保留困难性，也让实现可以用 NTT 加速乘法。",
      "ML-KEM 在此基础上组织出 KeyGen / Encaps / Decaps，并在 Decaps 中处理 FO transform 与 failure semantics。",
    ],
    formulaTitle: "玩具 LWE 例子",
    formula: ["q = 23", "A = [[19, 7], [3, 11]]", "s = [5, 2]", "e = [1, -1]", "b = A*s + e mod 23 = [18, 13]"].join("\n"),
    takeaway:
      "若 e 为 0，这就是普通线性代数关系；加入小噪声后，观测值只落在近似解附近，困难性由此出现。ML-KEM 把这个困难性搬到了多项式模块。",
  },
  {
    id: "ml-dsa",
    name: "ML-DSA",
    family: "Module-LWE / lattice",
    role: "Signature",
    sizes: "ML-DSA-44: pk 1312 / sig 2420",
    why: "通用 PQ 签名主力之一，但进入传统 PKI 时仍有明显对象与兼容代价。",
    facts: [
      ["数学对象", "模块格签名，核心仍在多项式环上运算"],
      ["参数集", "44 / 65 / 87"],
      ["热点运算", "NTT / rejection sampling / hint"],
      ["接口", "KeyGen / Sign / Verify"],
    ],
    pathTitle: "签名路径速览",
    pathSteps: [
      "先采样临时向量 y，并计算 w = A*y。",
      "从消息与高位信息导出 challenge c。",
      "构造 z = y + c*s1，并附带 hint 让验证者恢复必要的高位信息。",
      "实现层风险集中在随机性、采样路径、分支与缓存 side-channel，以及 ctx / rnd / deterministic 语义。",
    ],
    formulaTitle: "结构口径",
    formula: ["sample y", "w = A*y", "c = H(w1, M, ctx)", "z = y + c*s1", "sig = (z, hint, c)"].join("\n"),
    takeaway:
      "ML-DSA 与 ML-KEM 使用相近的格基对象，但构造目标不同。KEM 关心共享密钥恢复，签名则关心分布控制、可验证性与 side-channel。",
  },
  {
    id: "slh-dsa",
    name: "SLH-DSA",
    family: "Hash-based",
    role: "Signature",
    sizes: "128f: pk 32 / sig 17088",
    why: "更保守的签名路线，可提供多样性，但签名代价较大。",
    facts: [
      ["数学对象", "哈希树、FORS、XMSS、hypertree"],
      ["参数族", "SHA2 / SHAKE x 128 / 192 / 256 x s / f"],
      ["热点运算", "大量哈希调用与认证路径生成"],
      ["接口", "KeyGen / Sign / Verify"],
    ],
    pathTitle: "哈希基签名路径",
    pathSteps: [
      "消息先进入 FORS 结构，生成一次性签名片段。",
      "FORS 输出再挂到 XMSS 节点上，形成可验证的树路径。",
      "多层 XMSS 继续向上堆叠成 hypertree。",
      "签名大，换来的是对哈希原语的保守假设与路线多样性。",
    ],
    formulaTitle: "结构口径",
    formula: ["M -> FORS leaves", "FORS output -> XMSS leaf", "XMSS auth path -> hypertree path", "sig = FORS parts + auth paths"].join("\n"),
    takeaway:
      "SLH-DSA 的问题不在能否落地，而在对象尺寸、链路带宽、证书链与分发系统是否承受得住。",
  },
  {
    id: "hqc",
    name: "HQC",
    family: "Code-based",
    role: "Backup KEM",
    sizes: "对象明显大于 ML-KEM",
    why: "为 NIST 提供非格基备用路线，用于增强算法多样性。",
    facts: [
      ["数学对象", "带噪码字与纠错码解码"],
      ["路线角色", "non-lattice backup KEM"],
      ["热点运算", "编码 / 解码 / 更大对象搬运"],
      ["接口", "KeyGen / Encaps / Decaps"],
    ],
    pathTitle: "码基 KEM 路线",
    pathSteps: [
      "公开值与密文都围绕带噪码字构造。",
      "解封装依赖纠错码解码，和格基路线的最近向量近似问题不同。",
      "工程差异首先体现在对象更大、实现热点不同。",
      "路线价值主要在算法多样性与长期备份，而非立即替代 ML-KEM。",
    ],
    formulaTitle: "结构口径",
    formula: ["public key -> code-based structure", "ciphertext -> noisy codeword", "decapsulation -> decode + derive shared secret"].join("\n"),
    takeaway:
      "HQC 回答的是如果主力格基路线之外还需要一条正式备用路线，系统要如何准备。",
  },
];

const principleFamilies = [
  {
    id: "lattice",
    label: "LWE / Module-LWE",
    title: "格点、噪声云与解封装纠偏",
    intro: "LWE 把精确线性关系改写成带噪关系，公开信息落在规则格点附近的一团扰动里。",
    facts: [
      ["公开量", "A 与 b = A*s + e (mod q)"],
      ["困难来源", "同时满足许多带噪约束"],
      ["实现热点", "NTT / sampling / compression / FO"],
      ["工程意义", "对象尺寸可控，适合 KEM 主力部署"],
    ],
    steps: [
      "中心亮点代表一个结构化关系，规则网格代表离散格空间。",
      "周围涨缩的粒子云对应小噪声 e，观测值因此从精确点扩成近邻区域。",
      "合法接收方利用私钥结构完成纠偏，得到稳定的共享秘密。",
    ],
    formulaTitle: "最短口径",
    formula: ["b = A*s + e (mod q)", "", "A : 公开矩阵 / 模块", "s : 私钥相关秘密", "e : 小噪声"].join("\n"),
    takeaway: "Module-LWE 的价值在于把困难问题与高效实现组织到同一个对象上。",
  },
  {
    id: "hash",
    label: "Hash-based / SLH-DSA",
    title: "哈希树认证路径",
    intro: "哈希基签名把消息映射到叶节点，再沿认证路径逐层重建到根，验证者只需复算路径。",
    facts: [
      ["叶节点", "FORS / XMSS 叶或其导出值"],
      ["公开量", "根节点与参数集"],
      ["困难来源", "碰撞、二次原像与树路径伪造难度"],
      ["工程意义", "原语保守，签名对象较大"],
    ],
    steps: [
      "消息先落到树底部的某个叶节点，签名同时给出对应片段。",
      "认证路径提供每一层的兄弟节点哈希，验证者可逐层向上合成父节点。",
      "到达根节点后，与公开根比较即可完成验证。",
    ],
    formulaTitle: "最短口径",
    formula: ["leaf = H(message, addr)", "node_i+1 = H(node_i || sibling_i)", "verify(root') = (root' == public_root)"].join("\n"),
    takeaway: "SLH-DSA 的核心不在复杂代数，而在大量哈希与很长的认证路径对象。",
  },
  {
    id: "code",
    label: "Code-based / HQC",
    title: "带噪码字与纠错恢复",
    intro: "码基路线把共享秘密编码成冗余码字，通过纠错能力对抗信道式噪声。",
    facts: [
      ["公开量", "与生成矩阵 / 校验矩阵相关的结构"],
      ["密文直觉", "带噪码字 + 辅助对象"],
      ["困难来源", "通用译码问题与错误向量恢复难度"],
      ["工程意义", "对象更大，作为非格基备份路线"],
    ],
    steps: [
      "发送方先把比特串编码成冗余更强的码字。",
      "传输后有码位翻转或扰动，接收侧先计算 syndrome 观察错误模式。",
      "解码器根据纠错能力恢复原始码字，再导出共享秘密。",
    ],
    formulaTitle: "最短口径",
    formula: ["c = encode(m)", "r = c + e", "s = H * r^T", "decode(r, s) -> m"].join("\n"),
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

const principleNoiseParticles = [
  { x: -56, y: -34, size: 9, delay: 0 },
  { x: -24, y: -60, size: 8, delay: 100 },
  { x: 10, y: -68, size: 11, delay: 240 },
  { x: 54, y: -24, size: 8, delay: 340 },
  { x: 64, y: 22, size: 10, delay: 440 },
  { x: 40, y: 56, size: 8, delay: 560 },
  { x: -4, y: 66, size: 12, delay: 660 },
  { x: -44, y: 50, size: 8, delay: 760 },
  { x: -66, y: 10, size: 9, delay: 900 },
];

const navButtons = document.querySelectorAll(".view-link");
const contentSections = document.querySelectorAll(".content-section");
const scenarioList = document.getElementById("scenario-list");
const scenarioDetail = document.getElementById("scenario-detail");
const algorithmGrid = document.getElementById("algorithm-grid");
const algorithmDetail = document.getElementById("algorithm-detail");
const principleVisual = document.getElementById("principle-visual");
const principleDetail = document.getElementById("principle-detail");
const heroNetwork = document.getElementById("hero-network");
const heroNoiseCloud = document.getElementById("hero-noise-cloud");
const heroRings = document.getElementById("hero-rings");

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

let principleIndex = 0;
let activeSectionId = "section-intro";

function setActiveNav(targetId) {
  activeSectionId = targetId;
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === targetId);
  });
}

function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveNav(targetId);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => scrollToSection(button.dataset.target));
});

function updateActiveFromScroll() {
  let closestSection = contentSections[0];
  let closestDistance = Number.POSITIVE_INFINITY;

  contentSections.forEach((section) => {
    const distance = Math.abs(section.getBoundingClientRect().top - 160);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSection = section;
    }
  });

  if (closestSection) {
    setActiveNav(closestSection.id);
  }
}

function formatMetricValue(metric, value) {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return `${value} ${metric.unit}`;
}

function formatPercent(value, precision) {
  return `${Number(value.toFixed(precision)).toString()}%`;
}

function animatePercentValue(element, target, precision) {
  const startTime = performance.now();
  const duration = 1400;

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = formatPercent(target * eased, precision);
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function renderFactGrid(facts) {
  return facts
    .map(
      ([label, value]) => `
        <div class="fact-row">
          <span class="fact-label">${label}</span>
          <strong class="fact-value">${value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderPacketBlocks(packet) {
  const blocks = packet.blocks
    .map((block, index) => {
      const repeat = block.repeat ?? 1;
      return Array.from({ length: repeat })
        .map(
          (_, subIndex) => `
            <div class="packet-block tone-${block.tone}${block.flex ? " packet-flex" : ""}" style="animation-delay:${(index + subIndex) * 80}ms">
              ${block.label}
            </div>
          `,
        )
        .join("");
    })
    .join("");

  return `
    <div class="packet-card">
      <p class="subtle">${packet.lead}</p>
      <div class="packet-strip">${blocks}</div>
    </div>
  `;
}

function buildHeroNetwork() {
  const nodes = [
    { x: 76, y: 170, size: 8, tone: "cyan" },
    { x: 118, y: 126, size: 7, tone: "green" },
    { x: 164, y: 92, size: 9, tone: "blue" },
    { x: 216, y: 72, size: 8, tone: "cyan" },
    { x: 270, y: 92, size: 9, tone: "green" },
    { x: 320, y: 130, size: 8, tone: "violet" },
    { x: 340, y: 192, size: 7, tone: "green" },
    { x: 304, y: 242, size: 8, tone: "violet" },
    { x: 244, y: 272, size: 7, tone: "blue" },
    { x: 178, y: 264, size: 9, tone: "green" },
    { x: 130, y: 226, size: 8, tone: "cyan" },
    { x: 204, y: 148, size: 10, tone: "violet" },
    { x: 248, y: 156, size: 9, tone: "cyan" },
    { x: 212, y: 208, size: 8, tone: "green" },
    { x: 266, y: 206, size: 8, tone: "violet" },
    { x: 160, y: 174, size: 7, tone: "blue" },
  ];
  const edges = [
    [0, 1], [0, 10], [0, 15],
    [1, 2], [1, 11], [1, 15],
    [2, 3], [2, 11], [2, 12],
    [3, 4], [3, 11], [3, 12],
    [4, 5], [4, 12], [4, 14],
    [5, 6], [5, 12], [5, 14],
    [6, 7], [6, 14], [6, 12],
    [7, 8], [7, 13], [7, 14],
    [8, 9], [8, 13], [8, 14],
    [9, 10], [9, 13], [9, 15],
    [10, 15], [10, 13],
    [11, 12], [11, 13], [11, 15],
    [12, 13], [12, 14],
    [13, 14], [13, 15],
  ];

  if (heroNetwork) {
    heroNetwork.innerHTML = `
      <defs>
        <linearGradient id="hero-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00E5FF"></stop>
          <stop offset="50%" stop-color="#00C853"></stop>
          <stop offset="100%" stop-color="#B85CFF"></stop>
        </linearGradient>
      </defs>
      ${edges
        .map(([from, to], index) => {
          const start = nodes[from];
          const end = nodes[to];
          return `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" style="animation-delay:${index * 70}ms"></line>`;
        })
        .join("")}
      ${nodes
        .map(
          (node, index) => `
            <circle cx="${node.x}" cy="${node.y}" r="${node.size}" class="tone-${node.tone}" style="animation-delay:${index * 110}ms"></circle>
          `,
        )
        .join("")}
    `;
  }

  heroNoiseCloud.innerHTML = heroNoiseParticles
    .map(
      (particle) => `
        <span
          class="hero-noise-dot"
          style="--x:${particle.x}px;--y:${particle.y}px;--size:${particle.size}px;--delay:${particle.delay}ms"
        ></span>
      `,
    )
    .join("");
}

function renderHeroRings() {
  heroRings.innerHTML = heroIndicators
    .map(
      (item) => `
        <article class="stat-ring-card tone-${item.tone}" data-percent="${item.percent}" data-precision="${item.precision}">
          <div class="stat-ring-wrap">
            <svg class="stat-ring-svg" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="stat-ring-bg" cx="60" cy="60" r="${RING_RADIUS}"></circle>
              <circle class="stat-ring-fg" cx="60" cy="60" r="${RING_RADIUS}"></circle>
            </svg>
            <div class="stat-ring-center">
              <strong class="stat-ring-value">0%</strong>
              <span class="stat-ring-short">${item.short}</span>
            </div>
          </div>
          <div class="stat-ring-copy">
            <strong>${item.title}</strong>
            <p>${item.detail}</p>
          </div>
        </article>
      `,
    )
    .join("");

  requestAnimationFrame(() => {
    heroRings.querySelectorAll(".stat-ring-card").forEach((card, index) => {
      const percent = Number(card.dataset.percent);
      const precision = Number(card.dataset.precision);
      const ring = card.querySelector(".stat-ring-fg");
      const value = card.querySelector(".stat-ring-value");

      ring.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
      ring.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;

      setTimeout(() => {
        ring.style.strokeDashoffset = `${RING_CIRCUMFERENCE * (1 - percent / 100)}`;
        animatePercentValue(value, percent, precision);
      }, 160 + index * 140);
    });
  });
}

function renderComparisonRows(activeId) {
  return handshakeMetrics
    .map((metric) => {
      const series = handshakeScenarios
        .map((scenario) => {
          const value = scenario.compare[metric.key];
          const width = value === null || value === undefined ? 0 : Math.max((value / metric.max) * 100, value === 0 ? 0 : 4);
          return `
            <div class="series-item${scenario.id === activeId ? " is-selected" : ""}">
              <div class="series-top">
                <span>${scenario.label}</span>
                <strong>${formatMetricValue(metric, value)}</strong>
              </div>
              <div class="series-track">
                ${
                  value === null || value === undefined
                    ? '<span class="series-na">N/A</span>'
                    : `<div class="series-bar" style="width:${width}%"></div>`
                }
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="compare-row">
          <div class="compare-head">
            <strong>${metric.label}</strong>
            <span>标度 0 - ${metric.max} ${metric.unit}</span>
          </div>
          <div class="series-list">${series}</div>
          <p class="subtle">${metric.note}</p>
        </div>
      `;
    })
    .join("");
}

function renderScenarioButtons(activeId) {
  scenarioList.innerHTML = "";
  handshakeScenarios.forEach((scenario) => {
    const wrapper = document.createElement("div");
    wrapper.className = `option${scenario.id === activeId ? " is-active" : ""}`;
    wrapper.innerHTML = `
      <button type="button" data-scenario="${scenario.id}">
        <span class="label">${scenario.badge}</span>
        <strong>${scenario.label}</strong>
        <p>${scenario.summary}</p>
      </button>
    `;
    scenarioList.appendChild(wrapper);
  });

  scenarioList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => renderScenario(button.dataset.scenario));
  });
}

function renderScenario(id) {
  const scenario = handshakeScenarios.find((item) => item.id === id) ?? handshakeScenarios[0];
  renderScenarioButtons(scenario.id);
  const notes = scenario.notes.map((note) => `<li>${note}</li>`).join("");

  scenarioDetail.innerHTML = `
    <div class="detail-section">
      <span class="label">${scenario.badge}</span>
      <h4>${scenario.label}</h4>
      <p>${scenario.summary}</p>
    </div>
    <div class="detail-section">
      <h4>对象与口径</h4>
      <div class="fact-grid">${renderFactGrid(scenario.facts)}</div>
    </div>
    <div class="detail-section">
      <h4>包体可视化</h4>
      ${renderPacketBlocks(scenario.packet)}
    </div>
    <div class="detail-section">
      <h4>跨场景对比</h4>
      <div class="compare-grid">${renderComparisonRows(scenario.id)}</div>
    </div>
    <div class="detail-section">
      <h4>约束来源</h4>
      <ul class="detail-list">${notes}</ul>
    </div>
  `;
}

function renderAlgorithmCards(activeId) {
  algorithmGrid.innerHTML = "";
  algorithms.forEach((item) => {
    const card = document.createElement("div");
    card.className = `algo-card${item.id === activeId ? " is-active" : ""}`;
    card.innerHTML = `
      <button type="button" data-algorithm="${item.id}">
        <strong>${item.name}</strong>
        <div class="algo-meta">
          <span>${item.family}</span>
          <span>${item.role}</span>
          <span>${item.sizes}</span>
        </div>
      </button>
    `;
    algorithmGrid.appendChild(card);
  });

  algorithmGrid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => renderAlgorithm(button.dataset.algorithm));
  });
}

function renderAlgorithm(id) {
  const item = algorithms.find((entry) => entry.id === id) ?? algorithms[0];
  renderAlgorithmCards(item.id);
  const steps = item.pathSteps.map((step) => `<li>${step}</li>`).join("");

  algorithmDetail.innerHTML = `
    <div class="detail-section">
      <span class="label">${item.role}</span>
      <h4>${item.name}</h4>
      <p>${item.why}</p>
    </div>
    <div class="detail-section">
      <h4>对象与运算</h4>
      <div class="fact-grid">${renderFactGrid(item.facts)}</div>
    </div>
    <div class="detail-section">
      <h4>${item.pathTitle}</h4>
      <ol class="step-list">${steps}</ol>
    </div>
    <div class="detail-section">
      <h4>${item.formulaTitle}</h4>
      <pre class="formula-block">${item.formula}</pre>
      <p class="subtle">${item.takeaway}</p>
    </div>
  `;
}

function renderPrincipleNoiseDots() {
  return principleNoiseParticles
    .map(
      (particle) => `
        <span class="lattice-noise-dot" style="--x:${particle.x}px;--y:${particle.y}px;--size:${particle.size}px;--delay:${particle.delay}ms"></span>
      `,
    )
    .join("");
}

function renderHashTreeVisual() {
  return `
    <div class="principle-viewport visual-hash">
      <svg class="hash-tree-svg" viewBox="0 0 360 300" aria-hidden="true">
        <line x1="180" y1="40" x2="122" y2="94" class="tree-line auth"></line>
        <line x1="180" y1="40" x2="238" y2="94" class="tree-line"></line>
        <line x1="122" y1="94" x2="90" y2="148" class="tree-line auth"></line>
        <line x1="122" y1="94" x2="154" y2="148" class="tree-line"></line>
        <line x1="238" y1="94" x2="206" y2="148" class="tree-line"></line>
        <line x1="238" y1="94" x2="270" y2="148" class="tree-line"></line>
        <line x1="90" y1="148" x2="66" y2="220" class="tree-line"></line>
        <line x1="90" y1="148" x2="114" y2="220" class="tree-line auth"></line>
        <line x1="154" y1="148" x2="138" y2="220" class="tree-line"></line>
        <line x1="154" y1="148" x2="176" y2="220" class="tree-line"></line>
        <line x1="206" y1="148" x2="192" y2="220" class="tree-line"></line>
        <line x1="206" y1="148" x2="220" y2="220" class="tree-line"></line>
        <line x1="270" y1="148" x2="254" y2="220" class="tree-line"></line>
        <line x1="270" y1="148" x2="294" y2="220" class="tree-line"></line>

        <circle cx="180" cy="40" r="16" class="tree-node root"></circle>
        <circle cx="122" cy="94" r="14" class="tree-node auth"></circle>
        <circle cx="238" cy="94" r="14" class="tree-node"></circle>
        <circle cx="90" cy="148" r="13" class="tree-node auth"></circle>
        <circle cx="154" cy="148" r="13" class="tree-node"></circle>
        <circle cx="206" cy="148" r="13" class="tree-node"></circle>
        <circle cx="270" cy="148" r="13" class="tree-node"></circle>
        <circle cx="66" cy="220" r="11" class="tree-node"></circle>
        <circle cx="114" cy="220" r="11" class="tree-node selected"></circle>
        <circle cx="138" cy="220" r="11" class="tree-node auth"></circle>
        <circle cx="176" cy="220" r="11" class="tree-node"></circle>
        <circle cx="192" cy="220" r="11" class="tree-node"></circle>
        <circle cx="220" cy="220" r="11" class="tree-node"></circle>
        <circle cx="254" cy="220" r="11" class="tree-node"></circle>
        <circle cx="294" cy="220" r="11" class="tree-node"></circle>
      </svg>
      <div class="hash-tag tag-root">公开根</div>
      <div class="hash-tag tag-auth">认证路径</div>
      <div class="hash-tag tag-leaf">消息叶</div>
    </div>
    <div class="visual-legend">
      <span>1. 叶节点选中</span>
      <span>2. 兄弟哈希上送</span>
      <span>3. 与公开根比对</span>
    </div>
  `;
}

function renderCodeRow(label, values, variants = {}) {
  const bits = values
    .map((bit, index) => {
      const variant = variants[index] ?? "";
      return `<span class="bit${variant ? ` ${variant}` : ""}" style="animation-delay:${index * 70}ms">${bit}</span>`;
    })
    .join("");

  return `
    <div class="code-row">
      <span class="code-label">${label}</span>
      <div class="bit-strip">${bits}</div>
    </div>
  `;
}

function renderCodeVisual() {
  const codeword = ["1", "0", "1", "1", "0", "0", "1", "0", "1", "1", "0", "1"];
  const received = ["1", "0", "1", "0", "0", "0", "1", "1", "1", "1", "0", "0"];
  const corrected = ["1", "0", "1", "1", "0", "0", "1", "0", "1", "1", "0", "1"];

  return `
    <div class="principle-viewport visual-code">
      <div class="code-stack">
        ${renderCodeRow("编码后", codeword, { 0: "core", 3: "core", 8: "core" })}
        <div class="code-arrow">信道噪声 / error vector</div>
        ${renderCodeRow("接收后", received, { 3: "flip", 7: "flip", 11: "flip" })}
        <div class="syndrome-card">
          <strong>syndrome</strong>
          <span>H · r^T</span>
          <span class="syndrome-bits">0 1 0 1 1</span>
        </div>
        <div class="code-arrow">纠错译码</div>
        ${renderCodeRow("恢复后", corrected, { 3: "fixed", 7: "fixed", 11: "fixed" })}
      </div>
    </div>
    <div class="visual-legend">
      <span>1. 码字带冗余</span>
      <span>2. 噪声造成翻转</span>
      <span>3. 解码器恢复原值</span>
    </div>
  `;
}

function renderPrincipleVisual(family) {
  let visualMarkup = "";

  if (family.id === "lattice") {
    visualMarkup = `
      <div class="principle-viewport visual-lattice">
        <div class="grid-surface"></div>
        <div class="lattice-point lattice-origin"></div>
        <div class="lattice-halo"></div>
        <div class="lattice-noise">${renderPrincipleNoiseDots()}</div>
        <div class="lattice-point lattice-recover"></div>
        <div class="lattice-line line-a"></div>
        <div class="lattice-line line-b"></div>
        <div class="lattice-label label-origin">公开点</div>
        <div class="lattice-label label-noise">噪声云</div>
        <div class="lattice-label label-recover">解封装纠偏</div>
      </div>
      <div class="visual-legend">
        <span>1. 规则格点</span>
        <span>2. 小噪声扩散</span>
        <span>3. 私钥纠偏</span>
      </div>
    `;
  }

  if (family.id === "hash") {
    visualMarkup = renderHashTreeVisual();
  }

  if (family.id === "code") {
    visualMarkup = renderCodeVisual();
  }

  principleVisual.innerHTML = `
    ${visualMarkup}
    <div class="principle-switches">
      ${principleFamilies
        .map(
          (item, index) => `
            <button type="button" class="principle-switch${index === principleIndex ? " is-active" : ""}" data-stage="${index}">
              <span>${item.label}</span>
              <strong>${item.title}</strong>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  principleVisual.querySelectorAll(".principle-switch").forEach((button) => {
    button.addEventListener("click", () => {
      principleIndex = Number(button.dataset.stage);
      renderPrinciple(principleIndex);
    });
  });
}

function renderPrincipleDetail(family) {
  principleDetail.innerHTML = `
    <div class="detail-section">
      <span class="label">${family.label}</span>
      <h4>${family.title}</h4>
      <p>${family.intro}</p>
    </div>
    <div class="detail-section">
      <h4>结构观察点</h4>
      <div class="fact-grid">${renderFactGrid(family.facts)}</div>
    </div>
    <div class="detail-section">
      <h4>运算路径</h4>
      <ul class="detail-list">
        ${family.steps.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
    <div class="detail-section">
      <h4>${family.formulaTitle}</h4>
      <pre class="formula-block">${family.formula}</pre>
      <p class="subtle">${family.takeaway}</p>
    </div>
  `;
}

function renderPrinciple(index) {
  const family = principleFamilies[index];
  renderPrincipleVisual(family);
  renderPrincipleDetail(family);
}

document.querySelectorAll("[data-target]").forEach((button) => {
  if (!button.classList.contains("view-link")) {
    button.addEventListener("click", () => scrollToSection(button.dataset.target));
  }
});
buildHeroNetwork();
renderHeroRings();
renderScenario(handshakeScenarios[1].id);
renderAlgorithm(algorithms[0].id);
renderPrinciple(principleIndex);
setActiveNav(activeSectionId);
window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
window.addEventListener("resize", updateActiveFromScroll);
updateActiveFromScroll();

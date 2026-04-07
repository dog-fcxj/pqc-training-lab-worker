const handshakeMetrics = [
  {
    key: "clientExtraBytes",
    label: "C -> S 额外握手字节",
    unit: "B",
    max: 1200,
    note: "TLS 的 1200 B 来自 Cloudflare 公开的端到端观测；IKEv2 未公开统一的固定增量。",
  },
  {
    key: "serverExtraBytes",
    label: "S -> C 额外握手字节",
    unit: "B",
    max: 1100,
    note: "TLS 的 1100 B 来自 Cloudflare 公开的端到端观测；IKEv2 以对象尺寸而非统一固定增量来讨论。",
  },
  {
    key: "largestNewObject",
    label: "新增单个对象大小",
    unit: "B",
    max: 1184,
    note: "ML-KEM-768 的 public key 为 1184 B，ciphertext 为 1088 B；这组对象会直接进入协议消息。",
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
    notes: [
      "Cloudflare 文档将 X25519MLKEM768 作为推荐 hybrid key agreement。",
      "公开部署中最常见的定量变化是握手字节增长，证书链通常仍沿用传统路径。",
      "KEM 路线可先处理 HNDL 风险，签名迁移仍是独立问题。",
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
    formula: [
      "q = 23",
      "A = [[19, 7], [3, 11]]",
      "s = [5, 2]",
      "e = [1, -1]",
      "b = A*s + e mod 23 = [18, 13]",
    ].join("\n"),
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
    formula: [
      "sample y",
      "w = A*y",
      "c = H(w1, M, ctx)",
      "z = y + c*s1",
      "sig = (z, hint, c)",
    ].join("\n"),
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
    formula: [
      "M -> FORS leaves",
      "FORS output -> XMSS leaf",
      "XMSS auth path -> hypertree path",
      "sig = FORS parts + auth paths",
    ].join("\n"),
    takeaway:
      "SLH-DSA 的问题不在“能不能做”，而在对象尺寸、链路带宽、证书链与分发系统是否承受得住。",
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
    formula: [
      "public key -> code-based structure",
      "ciphertext -> noisy codeword",
      "decapsulation -> decode + derive shared secret",
    ].join("\n"),
    takeaway:
      "HQC 回答的是“如果主力格基路线之外还需要一条正式备用路线，系统要如何准备”的问题。",
  },
];

const migrationRules = [
  {
    key: "long_lived_data",
    title: "visitor-facing hybrid KEM",
    text: "长期敏感数据对应更高的 HNDL 风险，可先规划 TLS / Zero Trust / Tunnel 的 hybrid KEM 试点。",
  },
  {
    key: "mobile_clients",
    title: "弱网与移动端压测",
    text: "移动网络对握手回归和首包字节更敏感，可单独评估 resumption、握手失败率和大证书链。",
  },
  {
    key: "vpn_or_ipsec",
    title: "IKEv2 / VPN 路线",
    text: "IKEv2 / VPN 可单独评估 PMTU、分片、设备固件和安全网关支持。",
  },
  {
    key: "heavy_pki",
    title: "签名迁移单独规划",
    text: "证书链、CT、SCT、代码签名、固件签名可作为独立路线规划。",
  },
  {
    key: "origin_sprawl",
    title: "origin 侧依赖盘点",
    text: "源站、反向代理、LB、WAF 和老 SDK 往往对应更长的改造周期。",
  },
  {
    key: "third_party_appliances",
    title: "供应商路线图",
    text: "HSM、网关和安全设备常决定迁移窗口，可提前同步采购与供应商路线图。",
  },
];

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === `panel-${target}`);
    });
  });
});

const scenarioList = document.getElementById("scenario-list");
const scenarioDetail = document.getElementById("scenario-detail");
const algorithmGrid = document.getElementById("algorithm-grid");
const algorithmDetail = document.getElementById("algorithm-detail");
const migrationForm = document.getElementById("migration-form");
const migrationResult = document.getElementById("migration-result");

function formatMetricValue(metric, value) {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return `${value} ${metric.unit}`;
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

function renderScenario(id) {
  const scenario = handshakeScenarios.find((item) => item.id === id) ?? handshakeScenarios[0];
  renderScenarioButtons(scenario.id);
  const notes = scenario.notes.map((note) => `<li>${note}</li>`).join("");

  scenarioDetail.innerHTML = `
    <div class="detail-section">
      <span class="label">${scenario.badge}</span>
      <h3>${scenario.label}</h3>
      <p>${scenario.summary}</p>
    </div>
    <div class="detail-section">
      <h3>对象与口径</h3>
      <div class="fact-grid">${renderFactGrid(scenario.facts)}</div>
    </div>
    <div class="detail-section">
      <h3>跨场景对比</h3>
      <div class="compare-grid">${renderComparisonRows(scenario.id)}</div>
    </div>
    <div class="detail-section">
      <h3>约束来源</h3>
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
      <h3>${item.name}</h3>
      <p>${item.why}</p>
    </div>
    <div class="detail-section">
      <h3>对象与运算</h3>
      <div class="fact-grid">${renderFactGrid(item.facts)}</div>
    </div>
    <div class="detail-section">
      <h3>${item.pathTitle}</h3>
      <ol class="step-list">${steps}</ol>
    </div>
    <div class="detail-section">
      <h3>${item.formulaTitle}</h3>
      <pre class="formula-block">${item.formula}</pre>
      <p class="subtle">${item.takeaway}</p>
    </div>
  `;
}

function renderMigrationResult() {
  const formData = new FormData(migrationForm);
  const activeRules = migrationRules.filter((rule) => formData.has(rule.key));
  const resultCards = activeRules.length
    ? activeRules
        .map(
          (rule) => `
            <article class="result-card">
              <h3>${rule.title}</h3>
              <p>${rule.text}</p>
            </article>
          `,
        )
        .join("")
    : `
      <article class="result-card">
        <h3>从 inventory 开始</h3>
        <p>可先盘点 TLS、VPN、PKI、HSM、代码签名和 origin 侧的公钥算法使用点。</p>
      </article>
    `;

  migrationResult.innerHTML = resultCards;
}

migrationForm.addEventListener("change", renderMigrationResult);

renderScenario(handshakeScenarios[1].id);
renderAlgorithm(algorithms[0].id);
renderMigrationResult();

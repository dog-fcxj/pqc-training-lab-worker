// PQC 实验室核心数据仓库
// 约束：
// 1. 保留当前页面依赖的字段，避免首轮数据升级打断 UI
// 2. 为后续知识扩展预留稳定 id、来源标识和更新时间
// 3. 详情层优先消费结构化内容块，而不是长字符串

export const contentMeta = {
  baselineDate: "2026-04-07",
  updatedAt: "2026-04-09",
};

export const sourceCatalog = {
  nistMigration: {
    key: "nistMigration",
    label: "NIST PQC Migration Project",
  },
  nistStandards: {
    key: "nistStandards",
    label: "NIST PQC Standards and News",
  },
  ietfPqc: {
    key: "ietfPqc",
    label: "IETF PQC-related Draft Progress",
  },
  cloudflarePqc: {
    key: "cloudflarePqc",
    label: "Cloudflare PQ Deployment and Measurement",
  },
  trainingKit: {
    key: "trainingKit",
    label: "PQC Sharing Kit Notes",
  },
};

export const heroMetrics = [
  {
    id: "first-standards",
    value: "2024-08-13",
    label: "首批 FIPS 203 / 204 / 205 发布",
    summary: "PQC 已从候选算法阶段进入正式标准阶段。",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "backup-kem",
    value: "2025-03-11",
    label: "HQC 被选为备用 KEM",
    summary: "NIST 明确保留非格基备用路线，以增强算法多样性。",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "kem-guidance",
    value: "2025-09-18",
    label: "SP 800-227 发布 KEM 使用建议",
    summary: "焦点已从“选算法”转向“如何工程化部署”。",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "cloudflare-share",
    value: "52%",
    label: "2025 年末 Cloudflare human-generated Web 流量中的 PQ 加密占比",
    summary: "Edge-facing 流量中的 PQC 部署已进入真实规模化阶段。",
    sourceKey: "cloudflarePqc",
    updatedAt: contentMeta.updatedAt,
  },
];

export const heroNarrative = {
  eyebrow: "// DEFENSE_MATRIX_READY",
  title: "后量子密码学\n安全实验室",
  summary:
    "量子威胁最先冲击的是公钥层。这个实验室聚焦算法角色、协议对象和迁移代价，帮助网络、安全与架构团队把 PQC 从概念问题转成工程判断。",
  bullets: [
    "先窃取、后解密让长期敏感数据现在就暴露在时间窗口里。",
    "KEM 迁移与签名迁移并不同步，TLS、IKEv2、PKI 的难点也不相同。",
    "真正的难点通常不是算法名词，而是对象尺寸、兼容性、网关、证书链和供应商路线图。",
  ],
  sourceKey: "trainingKit",
  updatedAt: contentMeta.updatedAt,
};

export const principles = [
  {
    id: "lattice",
    label: "Lattice 格密码",
    brief: "高维空间最短向量问题的搜索难度。Module-LWE 允许更紧凑的对象表示。",
    intuition:
      "把秘密埋在高维带噪关系里。若没有噪声，这只是普通线性代数；一旦加入小噪声，攻击者看到的就不再是可直接求解的精确方程。",
    engineeringMeaning:
      "路线优势是对象尺寸、性能和标准化成熟度更均衡，因此目前主力 KEM 与主力签名都落在格基族上。",
    representativeAlgorithms: ["ML-KEM", "ML-DSA"],
    stageLabel: "SIMULATING_LATTICE_MODEL",
    detailId: "principle-lattice",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "hash",
    label: "Hash 哈希树",
    brief: "基于单向函数的碰撞抵御性。通过多层 Merkle 树认证路径构建签名。",
    intuition:
      "不是依赖代数结构，而是依赖大量哈希调用和树形认证路径。它更像把许多一次性签名装配成一个可长期验证的树结构。",
    engineeringMeaning:
      "路线更保守，安全假设更稳健，但签名和认证路径通常更大，对带宽、证书分发和链路存储更敏感。",
    representativeAlgorithms: ["SLH-DSA"],
    stageLabel: "SIMULATING_HASH_TREE_MODEL",
    detailId: "principle-hash",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "code",
    label: "Code 纠错码",
    brief: "将信息编码为带噪码字，仅合法接收方能通过校验矩阵恢复。",
    intuition:
      "把秘密藏进带噪码字和纠错结构里。合法接收方知道如何把噪声剥离，攻击者则只能面对一个更大的码字恢复问题。",
    engineeringMeaning:
      "路线价值在于多样性和备用能力，工程代价通常先体现在对象更大、传输更重、实现热点不同。",
    representativeAlgorithms: ["HQC"],
    stageLabel: "SIMULATING_CODE_BASED_MODEL",
    detailId: "principle-code",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
];

export const handshakeMetrics = [
  {
    key: "clientExtraBytes",
    label: "C -> S 额外握手字节",
    unit: "B",
    max: 1200,
    note: "TLS 的 1200 B 来自 Cloudflare 公开观测；IKEv2 更常按对象尺寸与分片行为讨论。",
    sourceKey: "cloudflarePqc",
    updatedAt: contentMeta.updatedAt,
  },
  {
    key: "serverExtraBytes",
    label: "S -> C 额外握手字节",
    unit: "B",
    max: 1100,
    note: "TLS 侧公开数字更稳定；IKEv2 通常不收敛为统一固定增量。",
    sourceKey: "cloudflarePqc",
    updatedAt: contentMeta.updatedAt,
  },
  {
    key: "largestNewObject",
    label: "新增单个对象大小",
    unit: "B",
    max: 1184,
    note: "ML-KEM-768 public key 为 1184 B，ciphertext 为 1088 B。",
    sourceKey: "cloudflarePqc",
    updatedAt: contentMeta.updatedAt,
  },
];

export const handshakeScenarios = [
  {
    id: "tls-classical",
    label: "Classical TLS 1.3",
    brief: "X25519 / ECDHE + 传统证书链，作为现有部署基线。",
    stats: "0 B Overhead",
    summary: "X25519 / ECDHE + 传统证书链",
    badge: "Baseline",
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
      "适合作为 hybrid 路线的尺寸、性能和兼容性对照。",
    ],
    advisory:
      "它是最好的兼容性基线，但不是面向长期敏感数据的终局方案。",
    detailId: "handshake-tls-classical",
    sourceKey: "cloudflarePqc",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "tls-hybrid",
    label: "Hybrid TLS 1.3",
    brief: "X25519 + ML-KEM-768。当前主流部署路线。",
    stats: "+1.2KB Overhead",
    summary: "X25519MLKEM768 等 hybrid group",
    badge: "Current path",
    compare: {
      clientExtraBytes: 1200,
      serverExtraBytes: 1100,
      largestNewObject: 1184,
    },
    facts: [
      ["新增 PQ 对象", "ML-KEM-768 pk 1184 B / ct 1088 B"],
      ["额外握手字节", "+1200 B / +1100 B"],
      ["握手时间回归", "约 4%"],
      ["状态", "TLS hybrid draft 已提交 IESG"],
    ],
    notes: [
      "公开部署中最常见的定量变化是握手字节增长。",
      "证书链通常仍沿用传统路径，因此 KEM 迁移和签名迁移要分开看。",
      "对移动网络、首包大小和恢复策略的测试需要单独做。",
    ],
    advisory:
      "Hybrid 模式允许在不破坏现有兼容性的前提下叠加抗量子保护，是当前最稳健的迁移起点。",
    detailId: "handshake-tls-hybrid",
    sourceKey: "cloudflarePqc",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "ikev2-mlkem",
    label: "IKEv2 + ML-KEM",
    brief: "企业级隧道抗量子升级。处理 PMTU 分片是关键挑战。",
    stats: "Multi-Fragment",
    summary: "面向隧道建立的 ML-KEM 集成",
    badge: "VPN / IPsec",
    compare: {
      clientExtraBytes: null,
      serverExtraBytes: null,
      largestNewObject: 1184,
    },
    facts: [
      ["新增 PQ 对象", "ML-KEM-768 pk 1184 B / ct 1088 B"],
      ["固定额外字节", "无统一公开值"],
      ["主要压力", "分片 / PMTU / 重传 / 网关固件"],
      ["状态", "IKEv2 ML-KEM draft 已提交 IESG"],
    ],
    notes: [
      "IKEv2 更常按对象尺寸、分片和网关资源边界讨论，而不是只看固定字节增量。",
      "对象变大后，PMTU 与 fragmentation 会直接影响行为。",
      "这条路线主要决定企业 VPN 和隧道协议栈什么时候能跟上 PQC。",
    ],
    advisory:
      "这里的真正难点往往不在算法本身，而在网关、设备固件、PMTU 和重传行为。",
    detailId: "handshake-ikev2-mlkem",
    sourceKey: "ietfPqc",
    updatedAt: contentMeta.updatedAt,
  },
];

// 兼容当前 handshake 组件使用的旧导出名。
export const scenarios = handshakeScenarios.map((scenario) => ({
  id: scenario.id,
  label: scenario.label,
  brief: scenario.brief,
  stats: scenario.stats,
}));

export const algorithms = [
  {
    id: "ml-kem",
    name: "ML-KEM",
    role: "KEM",
    family: "Module-LWE / lattice",
    detail: "格密码主力标准，基于 Module-LWE 假设。",
    why: "当前公开部署中最常见的 KEM 之一，也是 hybrid TLS 的主要对象。",
    specs: { pk: "1184B", ct: "1088B", perf: "High" },
    sizes: "ML-KEM-768: pk 1184 / ct 1088",
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
      "若 e 为 0，这就是普通线性代数关系；加入小噪声后，观测值只落在近似解附近，困难性由此出现。",
    wiki: "https://en.wikipedia.org/wiki/Kyber",
    detailId: "algorithm-ml-kem",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "ml-dsa",
    name: "ML-DSA",
    role: "Signature",
    family: "Module-LWE / lattice",
    detail: "基于格的签名方案，采用拒绝采样技术。",
    why: "通用 PQ 签名主力之一，但进入传统 PKI 时仍有明显对象与兼容代价。",
    specs: { pk: "1312B", sig: "2420B", perf: "Medium" },
    sizes: "ML-DSA-44: pk 1312 / sig 2420",
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
    detailId: "algorithm-ml-dsa",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "slh-dsa",
    name: "SLH-DSA",
    role: "Signature",
    family: "Hash-based",
    detail: "哈希签名方案，极其稳健，不依赖代数假设。",
    why: "更保守的签名路线，可提供多样性，但签名代价较大。",
    specs: { pk: "32B", sig: "17KB", perf: "Low" },
    sizes: "128f: pk 32 / sig 17088",
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
    detailId: "algorithm-slh-dsa",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "hqc",
    name: "HQC",
    role: "KEM",
    family: "Code-based",
    detail: "基于纠错码理论的备选方案，非格基多样性保护。",
    why: "为 NIST 提供非格基备用路线，用于增强算法多样性。",
    specs: { pk: "2249B", ct: "4481B", perf: "Medium" },
    sizes: "对象明显大于 ML-KEM",
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
    detailId: "algorithm-hqc",
    sourceKey: "nistStandards",
    updatedAt: contentMeta.updatedAt,
  },
];

export const migrationRules = [
  {
    id: "migration-long-lived-data",
    key: "long_lived_data",
    title: "visitor-facing hybrid KEM",
    text: "长期敏感数据对应更高的 HNDL 风险，可先规划 TLS / Zero Trust / Tunnel 的 hybrid KEM 试点。",
    priority: "high",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "migration-mobile-clients",
    key: "mobile_clients",
    title: "弱网与移动端压测",
    text: "移动网络对握手回归和首包字节更敏感，可单独评估 resumption、握手失败率和大证书链。",
    priority: "medium",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "migration-vpn-or-ipsec",
    key: "vpn_or_ipsec",
    title: "IKEv2 / VPN 路线",
    text: "IKEv2 / VPN 可单独评估 PMTU、分片、设备固件和安全网关支持。",
    priority: "high",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "migration-heavy-pki",
    key: "heavy_pki",
    title: "签名迁移单独规划",
    text: "证书链、CT、SCT、代码签名、固件签名可作为独立路线规划。",
    priority: "high",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "migration-origin-sprawl",
    key: "origin_sprawl",
    title: "origin 侧依赖盘点",
    text: "源站、反向代理、LB、WAF 和老 SDK 往往对应更长的改造周期。",
    priority: "medium",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
  {
    id: "migration-third-party-appliances",
    key: "third_party_appliances",
    title: "供应商路线图",
    text: "HSM、网关和安全设备常决定迁移窗口，可提前同步采购与供应商路线图。",
    priority: "medium",
    sourceKey: "trainingKit",
    updatedAt: contentMeta.updatedAt,
  },
];

export const detailDocuments = {
  "principle-lattice": {
    id: "principle-lattice",
    type: "principle",
    title: "Lattice 格密码",
    blocks: [
      {
        kind: "summary",
        text: "格基路线目前是 PQC 工程部署中的主力路线，因为它在尺寸、性能和实现成熟度之间提供了较好的平衡。",
      },
      {
        kind: "bulletList",
        title: "工程视角",
        items: [
          "主力 KEM 和主力签名都落在格基家族中。",
          "真正的实现难点通常在 NTT、采样、常数时间和 side-channel。",
          "路线优势不代表没有风险，failure semantics 和实现细节仍然关键。",
        ],
      },
    ],
  },
  "principle-hash": {
    id: "principle-hash",
    type: "principle",
    title: "Hash 哈希树",
    blocks: [
      {
        kind: "summary",
        text: "哈希基路线的保守性很强，但通常用更大的签名和更重的认证路径换取这种保守性。",
      },
      {
        kind: "bulletList",
        title: "工程视角",
        items: [
          "路线不依赖格问题，可作为多样性选择。",
          "对象尺寸会更快撞上带宽、证书链和分发系统边界。",
          "更适合放进“签名多样性与长期保守性”讨论，而不是默认主力。 ",
        ],
      },
    ],
  },
  "principle-code": {
    id: "principle-code",
    type: "principle",
    title: "Code 纠错码",
    blocks: [
      {
        kind: "summary",
        text: "码基路线更像是主力格基之外的正式备用方案，价值在于多样性和长期准备，而不是立刻替换主力路线。",
      },
      {
        kind: "bulletList",
        title: "工程视角",
        items: [
          "对象通常更大，网络与存储压力会更早出现。",
          "实现热点与格基不同，团队需要不同的优化与测试关注点。",
          "它回答的是“系统是否准备好多一条正式备用路线”。",
        ],
      },
    ],
  },
  "algorithm-ml-kem": {
    id: "algorithm-ml-kem",
    type: "algorithm",
    title: "ML-KEM Deep Notes",
    blocks: [
      {
        kind: "summary",
        text: "ML-KEM 是当前工程部署中最值得优先理解的 PQ KEM，因为它已经进入 hybrid TLS 等现实协议场景。",
      },
      {
        kind: "factGrid",
        items: [
          ["Family", "Module-LWE / lattice"],
          ["Role", "KEM"],
          ["Sizes", "ML-KEM-768: pk 1184 / ct 1088"],
          ["Perf", "High"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "对象会直接进入协议消息，因此首包大小与分片风险会更早暴露。",
          "真正的实现难点包括 NTT、采样、failure semantics 和常数时间。",
          "它适合优先作为 KEM 迁移试点对象，而不代表签名路线已经同步完成。",
        ],
      },
    ],
  },
  "algorithm-ml-dsa": {
    id: "algorithm-ml-dsa",
    type: "algorithm",
    title: "ML-DSA Deep Notes",
    blocks: [
      {
        kind: "summary",
        text: "ML-DSA 是通用 PQ 签名的主力候选，但它真正困难的地方通常出现在 PKI、证书链和实现语义，而不是算法名字本身。",
      },
      {
        kind: "factGrid",
        items: [
          ["Family", "Module-LWE / lattice"],
          ["Role", "Signature"],
          ["Sizes", "ML-DSA-44: pk 1312 / sig 2420"],
          ["Perf", "Medium"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "进入传统 PKI 时，对证书链、CT、SCT 和分发系统的影响会放大。",
          "实现层要特别关注 rejection sampling、hint 和 deterministic 语义。",
          "签名迁移通常不能简单复用 KEM 迁移节奏。",
        ],
      },
    ],
  },
  "algorithm-slh-dsa": {
    id: "algorithm-slh-dsa",
    type: "algorithm",
    title: "SLH-DSA Deep Notes",
    blocks: [
      {
        kind: "summary",
        text: "SLH-DSA 的核心价值在于更保守的假设和路线多样性，但它往往以更大的签名代价换取这些优点。",
      },
      {
        kind: "factGrid",
        items: [
          ["Family", "Hash-based"],
          ["Role", "Signature"],
          ["Sizes", "128f: pk 32 / sig 17088"],
          ["Perf", "Low"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "签名尺寸会更快撞上链路带宽与证书分发边界。",
          "它更适合作为保守型签名路线和多样性选项，而不是默认全量替换主力。",
          "对缓存、存储、日志与 OTA 等链路要单独评估。",
        ],
      },
    ],
  },
  "algorithm-hqc": {
    id: "algorithm-hqc",
    type: "algorithm",
    title: "HQC Deep Notes",
    blocks: [
      {
        kind: "summary",
        text: "HQC 的意义不在于立刻取代 ML-KEM，而在于系统是否准备好面对一条正式的非格基备用路线。",
      },
      {
        kind: "factGrid",
        items: [
          ["Family", "Code-based"],
          ["Role", "Backup KEM"],
          ["Sizes", "对象明显大于 ML-KEM"],
          ["Perf", "Medium"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "对象更大意味着网络与存储约束会更早显现。",
          "实现热点与格基不同，优化与测试策略也要不同。",
          "它更像是系统长期多样性策略的一部分。",
        ],
      },
    ],
  },
  "handshake-tls-classical": {
    id: "handshake-tls-classical",
    type: "handshake",
    title: "Classical TLS 1.3 Notes",
    blocks: [
      {
        kind: "summary",
        text: "Classical TLS 1.3 仍然是现实部署中的兼容性基线，也是比较 hybrid 开销与迁移收益的参考点。",
      },
      {
        kind: "factGrid",
        items: [
          ["额外握手字节", "0 B / 0 B"],
          ["新增单对象", "0 B"],
          ["基线对象", "X25519 public share 32 B"],
          ["价值", "最佳兼容性对照组"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "它适合做所有 PQ 迁移对比实验的 baseline。",
          "兼容性最好，但不提供 post-quantum key agreement。",
          "适合回答“当前系统离 PQ 方案有多远”。",
        ],
      },
    ],
  },
  "handshake-tls-hybrid": {
    id: "handshake-tls-hybrid",
    type: "handshake",
    title: "Hybrid TLS 1.3 Notes",
    blocks: [
      {
        kind: "summary",
        text: "Hybrid TLS 是当前最现实的 KEM 迁移路线，因为它保留现有兼容性，同时把 ML-KEM 拉进真实握手。",
      },
      {
        kind: "factGrid",
        items: [
          ["C -> S", "1200 B"],
          ["S -> C", "1100 B"],
          ["最大新增对象", "1184 B"],
          ["路线状态", "Current path"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "握手字节增长会直接影响首包大小、弱网表现和恢复策略。",
          "证书链通常仍是传统路径，所以 KEM 迁移与签名迁移要拆开看。",
          "这是最适合先做试点和压测的一条路线。",
        ],
      },
    ],
  },
  "handshake-ikev2-mlkem": {
    id: "handshake-ikev2-mlkem",
    type: "handshake",
    title: "IKEv2 + ML-KEM Notes",
    blocks: [
      {
        kind: "summary",
        text: "IKEv2 的 PQ 问题通常不是一个固定增量数字，而是对象尺寸如何触发 PMTU、分片和网关行为变化。",
      },
      {
        kind: "factGrid",
        items: [
          ["固定额外字节", "N/A"],
          ["最大新增对象", "1184 B"],
          ["主要压力", "PMTU / 分片 / 重传"],
          ["路线状态", "VPN / IPsec"],
        ],
      },
      {
        kind: "bulletList",
        title: "工程关注点",
        items: [
          "最先暴露问题的往往是网关、固件和网络边界。",
          "要单独评估 fragmentation、重传和设备资源限制。",
          "这是企业内部隧道栈能否跟上 PQC 的关键路径之一。",
        ],
      },
    ],
  },
};

// 兼容当前详情层的简单消费方式，也为后续统一 detail renderer 预留入口。
export function getDetailDocument(id) {
  return detailDocuments[id] || null;
}

export function getDetailDocumentsByType(type) {
  return Object.values(detailDocuments).filter((document) => document.type === type);
}

export function getAlgorithmById(id) {
  return algorithms.find((item) => item.id === id) || null;
}

export function getPrincipleById(id) {
  return principles.find((item) => item.id === id) || null;
}

export function getHandshakeScenarioById(id) {
  return handshakeScenarios.find((item) => item.id === id) || null;
}

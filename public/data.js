// PQC 实验室核心数据仓库
// 注：本文件已移除 detailViews，调用方需同步删除对 detailViews 的 import。
// 注：HQC 截至 2026-04-13 尚无最终 FIPS，以下按 NIST 公布的 FIPS 207 草案路线标注，并单独保留 selectionDate。
// 注：HQC ciphertext 采用 NIST IR 8545 表 7 官方值 4497 / 9042 / 14485；TLS Hybrid Draft 的 IESG 提交时间以 Datatracker history 的 2025-11-23 为准。
// 数据核验来源：
// https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards
// https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.203.pdf
// https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.204.pdf
// https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.205.pdf
// https://www.nist.gov/news-events/news/2025/03/nist-selects-hqc-fifth-algorithm-post-quantum-encryption
// https://csrc.nist.gov/pubs/ir/8545/final
// https://csrc.nist.gov/pubs/sp/800/227/final
// https://datatracker.ietf.org/doc/draft-ietf-tls-ecdhe-mlkem/history/
// https://datatracker.ietf.org/doc/draft-ietf-ipsecme-ikev2-mlkem/history/
// https://blog.cloudflare.com/pq-2025/
// https://blog.cloudflare.com/pq-2024/

export const algorithms = [
  {
    id: "ml-kem",
    name: "ML-KEM",
    role: "KEM",
    family: "lattice",
    standard: "FIPS 203",
    standardDate: "2024-08-13",
    detail: "格密码主力标准，基于 Module-LWE 假设，是当前最成熟的通用抗量子 KEM。",
    summary: "当前最主流的抗量子密钥封装方案，适合与 X25519/ECDHE 进行混合部署。",
    math: "基于模格上的带噪线性方程组，攻击者需要在高维噪声中恢复短秘密向量。",
    color: "#10b981",
    specs: { pk: "1184B", ct: "1088B", perf: "High" },
    highlights: ["NIST 主线 KEM", "Hybrid TLS 默认组合", "NIST 推荐 768 作为默认参数"],
    params: [
      { level: "512", pk: 800, ct: 768, security: "128-bit" },
      { level: "768", pk: 1184, ct: 1088, security: "192-bit" },
      { level: "1024", pk: 1568, ct: 1568, security: "256-bit" },
    ],
    interfaces: [
      "KeyGen() → (ek, dk)",
      "Encaps(ek) → (K, c)",
      "Decaps(dk, c) → K",
    ],
    pathSteps: [
      { step: 1, label: "KeyGen", detail: "采样矩阵 A、秘密向量 s 与误差 e，计算 b = A·s + e，输出公钥 pk 与私钥 sk。" },
      { step: 2, label: "Encaps", detail: "采样临时随机量 r、e1、e2，计算 u、v 并导出共享秘密 K，输出密文 c。" },
      { step: 3, label: "Decaps", detail: "使用私钥对密文解封装，恢复共享秘密并进行一致性检查。" },
    ],
    toyExample: {
      q: 23,
      n: 4,
      A: [
        [6, 15, 8, 12],
        [10, 2, 19, 1],
        [4, 17, 3, 9],
        [11, 7, 20, 5],
      ],
      s: [3, 1, 4, 1],
      e: [1, 0, -1, 2],
      b: [9, 17, 3, 12],
      description: "Toy LWE：b = A·s + e mod 23，用小模数演示「带噪多维线性方程」直觉。",
    },
  },
  {
    id: "ml-dsa",
    name: "ML-DSA",
    role: "Signature",
    family: "lattice",
    standard: "FIPS 204",
    standardDate: "2024-08-13",
    detail: "基于格的签名标准，源自 CRYSTALS-Dilithium，核心机制是拒绝采样与 hint 辅助验证。",
    summary: "适合作为新一代签名能力接入证书、固件、代码签名与身份认证链路。",
    math: "基于模格短向量问题与 Module-LWE 难题，通过拒绝采样控制泄漏并保持签名分布安全。",
    color: "#a855f7",
    specs: { pk: "1312B", sig: "2420B", perf: "Medium" },
    highlights: ["NIST 主线签名", "工程复杂度中等", "适合 PKI / 固件 / 身份认证"],
    params: [
      { level: "44", pk: 1312, sig: 2420, security: "128-bit" },
      { level: "65", pk: 1952, sig: 3309, security: "192-bit" },
      { level: "87", pk: 2592, sig: 4627, security: "256-bit" },
    ],
    interfaces: [
      "KeyGen() → (pk, sk)",
      "Sign(sk, M, ctx) → sig",
      "Verify(pk, M, sig, ctx) → boolean",
    ],
    pathSteps: [
      { step: 1, label: "KeyGen", detail: "扩展种子，采样短向量 s1、s2，计算 t = A·s1 + s2，并生成公私钥材料。" },
      { step: 2, label: "Sign", detail: "对消息求摘要后进入拒绝采样循环，计算临时向量并分解 w，生成挑战与 hint。" },
      { step: 3, label: "Verify", detail: "重建挑战并检查 z 的范数与 hint 一致性，验证签名是否落在允许边界内。" },
    ],
  },
  {
    id: "slh-dsa",
    name: "SLH-DSA",
    role: "Signature",
    family: "hash",
    standard: "FIPS 205",
    standardDate: "2024-08-13",
    detail: "哈希签名标准，源自 SPHINCS+，以 FORS、XMSS 与超树结构组合出无状态签名。",
    summary: "性能偏慢但假设保守，适合做高稳健性的备用签名路线。",
    math: "基于哈希函数的单向性、碰撞抵御与认证路径安全，不依赖格或代数结构假设。",
    color: "#22d3ee",
    specs: { pk: "32B", sig: "17088B", perf: "Low" },
    highlights: ["哈希路线", "假设最保守", "签名尺寸明显更大"],
    params: [
      { level: "128s", pk: 32, sig: 7856, security: "128-bit" },
      { level: "128f", pk: 32, sig: 17088, security: "128-bit" },
      { level: "192f", pk: 48, sig: 35664, security: "192-bit" },
    ],
    interfaces: [
      "KeyGen() → (pk, sk)",
      "Sign(sk, M, ctx) → sig",
      "Verify(pk, M, sig, ctx) → boolean",
    ],
    pathSteps: [
      { step: 1, label: "KeyGen", detail: "生成种子与根节点，构造 FORS、XMSS 与 hypertree 所需的密钥材料。" },
      { step: 2, label: "Sign", detail: "先做 FORS 签名，再逐层通过 XMSS 与超树认证路径把消息绑定到根节点。" },
      { step: 3, label: "Verify", detail: "重建 FORS 公钥并沿认证路径向上恢复根节点，最终与公钥根值比对。" },
    ],
  },
  {
    id: "hqc",
    name: "HQC",
    role: "KEM",
    family: "code",
    standard: "FIPS 207 (draft)",
    standardDate: "TBD",
    selectionDate: "2025-03-11",
    detail: "基于纠错码的后备 KEM，NIST 于 2025-03-11 选定用于补充 ML-KEM 的非格基路线。",
    summary: "作为非格基备选路线，适合做多样性储备与风险对冲。",
    math: "基于准循环码上的解码困难问题，通过带噪码字与纠错恢复共享秘密。",
    color: "#3b82f6",
    specs: { pk: "2249B", ct: "4497B", perf: "Medium" },
    highlights: ["非格基路线", "对象尺寸更重", "适合作为备份 KEM 储备"],
    params: [
      { level: "128", pk: 2249, ct: 4497, security: "128-bit" },
      { level: "192", pk: 4522, ct: 9042, security: "192-bit" },
      { level: "256", pk: 7245, ct: 14485, security: "256-bit" },
    ],
    interfaces: [
      "KeyGen() → (ek, dk)",
      "Encaps(ek) → (K, c)",
      "Decaps(dk, c) → K",
    ],
    pathSteps: [
      { step: 1, label: "KeyGen", detail: "生成公用码参数与秘密向量，构造可公开分发的封装密钥与本地解封装密钥。" },
      { step: 2, label: "Encaps", detail: "对消息进行编码并注入噪声，计算密文分量后导出共享秘密。" },
      { step: 3, label: "Decaps", detail: "利用私钥执行纠错解码，从带噪码字中恢复消息并重建共享秘密。" },
    ],
  },
];

export const principles = [
  {
    id: "lattice",
    label: "Lattice 格密码",
    brief: "在高维带噪空间里恢复短秘密向量极难，因此能构造高性能的 KEM 与签名。",
    cue: "高维噪声、矩阵乘法、模约化",
    metrics: ["主线 KEM 与签名", "性能 / 尺寸平衡最好", "工程成熟度最高"],
    analogy: "像在带噪多维迷宫里找一条最短隐秘路径，看到很多线索也很难回推出入口。",
    visualType: "lattice",
    algorithms: ["ml-kem", "ml-dsa"],
    hardProblem: "SVP / CVP / Module-LWE",
  },
  {
    id: "hash",
    label: "Hash 哈希树",
    brief: "依赖单向哈希与 Merkle 认证路径，把消息绑定到一棵可验证的哈希树根。",
    cue: "单向函数、认证路径、树结构",
    metrics: ["假设最保守", "签名通常更大", "适合高稳健备用路线"],
    analogy: "像单向传送门加认证路径，进去容易、倒推困难，只能沿着正确路径验真。",
    visualType: "merkle",
    algorithms: ["slh-dsa"],
    hardProblem: "碰撞抵御 / 预映像抵御",
  },
  {
    id: "code",
    label: "Code 纠错码",
    brief: "把信息编码成带噪码字，合法接收方依靠纠错能力恢复消息，攻击者面对解码难题。",
    cue: "带噪码字、校验结构、纠错恢复",
    metrics: ["非格基 KEM 备选", "对象尺寸更重", "用于多样性对冲"],
    analogy: "像寄出带噪信封，只有知道纠错规则的一方才能把被扰动的内容还原出来。",
    visualType: "code",
    algorithms: ["hqc"],
    hardProblem: "Syndrome Decoding / 解码问题",
  },
];

export const scenarios = [
  {
    id: "tls-classic",
    label: "经典 TLS 1.3",
    brief: "X25519/ECDHE 基线。无量子保护。",
    stats: "Baseline / 32B share",
    clientExtra: 0, serverExtra: 0, largestObject: 32, latencyImpact: "0%",
    status: "当前默认", ietfDraft: null,
    steps: [
      { 
        from: "Client", to: "Server", 
        label: "ClientHello + X25519 share (32B)",
        diagramNote: "发起套件协商并送出经典临时公钥，整个握手仍是纯经典密钥交换。",
        explanation: "客户端发起 TLS 1.3 握手，并送出一个 X25519 临时公钥。这样服务端可以立即参与一次经典 ECDHE 密钥交换，但这一步完全没有引入抗量子成分。"
      },
      { 
        from: "Server", to: "Client", 
        label: "ServerHello + X25519 share (32B)",
        diagramNote: "服务端补齐经典 ECDHE，共享秘密建立完成，但对 HNDL 没有防护。",
        explanation: "服务端返回自己选择的参数和 X25519 临时公钥，双方据此形成经典共享秘密。今天它足够快也足够成熟，但如果流量现在被截获，未来量子计算可能回头破解这一共享秘密。"
      },
      { 
        from: "Client", to: "Server", 
        label: "Finished + application traffic keys",
        diagramNote: "进入应用流量前会做完整性校验，但流量密钥仍只依赖经典秘密。",
        explanation: "双方用经典共享秘密导出握手密钥和应用流量密钥，再通过 Finished 校验握手完整性。问题是：完整会话的保密性依然全部压在经典密钥交换上。"
      },
    ],
    facts: ["无 PQ 保护", "HNDL 风险暴露"],
    notes: "量子计算机一旦成熟，可回溯解密今天已经截获的经典握手流量。",
  },
  {
    id: "tls-hybrid",
    label: "混合 TLS 1.3",
    brief: "X25519 + ML-KEM-768。当前主流部署路线。",
    stats: "+1.2KB Client / +1.1KB Server",
    clientExtra: 1200, serverExtra: 1100, largestObject: 1184, latencyImpact: "~4%",
    status: "Browser / CDN / Gateway", ietfDraft: "draft-ietf-tls-ecdhe-mlkem",
    steps: [
      { 
        from: "Client", to: "Server", 
        label: "ClientHello + X25519(32B) + ML-KEM-768 pk(1184B)",
        diagramNote: "同一轮 RTT 同时送出经典 share 和 ML-KEM 公钥，不额外增加一轮握手。",
        explanation: "客户端在同一个 ClientHello 里同时带上经典 X25519 share 和 ML-KEM-768 公钥。这样做的目的是在不增加往返次数的前提下，同时建立经典和抗量子两条共享秘密来源。"
      },
      { 
        from: "Server", to: "Client", 
        label: "ServerHello + X25519(32B) + ML-KEM-768 ct(1088B)",
        diagramNote: "服务端回经典 share 和 ML-KEM 密文，补齐第二条 PQ 共享秘密来源。",
        explanation: "服务端返回经典 X25519 share，并基于客户端的 ML-KEM 公钥完成一次封装，把密文发回客户端。此时双方已经各自拿到一份经典秘密和一份 PQ 秘密。"
      },
      { 
        from: "Both", to: "Both", 
        label: "组合 ECDHE 与 ML-KEM 共享秘密，导出握手密钥",
        diagramNote: "两路秘密一起进 KDF；只要经典或 PQ 仍安全，最终会话密钥就不会整体失守。",
        explanation: "双方把 ECDHE 与 ML-KEM 两路秘密一起送入密钥派生过程。关键点不是「平均安全」，而是「至少一条路径还安全时，最终会话密钥就仍然安全」。"
      },
      { 
        from: "Client", to: "Server", 
        label: "Finished + 进入受 PQ 保护的会话",
        diagramNote: "握手完成后，应用流量由混合秘密保护，付出的只是可控的大小与延迟成本。",
        explanation: "Finished 验证的是组合后的握手状态，随后应用流量建立在混合密钥之上。代价是多出约客户端 1.2KB、服务端 1.1KB 载荷和约 4% 的握手回归，但能显著缓解 HNDL 风险。"
      },
    ],
    facts: ["保留经典安全性", "叠加 PQ 保护", "~4% 握手回归"],
    notes: "Cloudflare 观测显示混合握手已广泛部署，额外传输约为客户端 +1.2KB、服务端 +1.1KB。",
  },
  {
    id: "ikev2-pq",
    label: "IKEv2 + ML-KEM",
    brief: "企业级隧道抗量子升级。",
    stats: "+1184B / +1088B",
    clientExtra: 1184, serverExtra: 1088, largestObject: 1184, latencyImpact: "Variable",
    status: "Tunnel / Branch / Appliance", ietfDraft: "draft-ietf-ipsecme-ikev2-mlkem",
    steps: [
      { 
        from: "Initiator", to: "Responder", 
        label: "IKE_SA_INIT + DH/KE + ML-KEM-768 pk(1184B)",
        diagramNote: "隧道场景同时保留传统 KE 和 PQ KE，优先保证现网可接入。",
        explanation: "发起端在 IKE_SA_INIT 中同时带上传统 DH/KE 参数和 ML-KEM 公钥。目的不是立刻替换现网设备，而是在企业隧道里先保留兼容性，再逐步引入 PQ 共享秘密。"
      },
      { 
        from: "Responder", to: "Initiator", 
        label: "IKE_SA_INIT response + DH/KE + ML-KEM-768 ct(1088B)",
        diagramNote: "响应端补齐 DH/KE 和 ML-KEM 密文，形成双轨密钥材料。",
        explanation: "响应端返回自己的传统 DH/KE 信息，并基于 ML-KEM 公钥生成密文。这样 IKEv2 也能和混合 TLS 类似，得到经典与 PQ 两套密钥材料。"
      },
      { 
        from: "Initiator", to: "Responder", 
        label: "IKE_AUTH + 证书 / 策略 / 身份认证",
        diagramNote: "真正的企业复杂度主要集中在认证、策略和设备协同，而不只是算法本身。",
        explanation: "进入 IKE_AUTH 后，还要处理证书、身份、策略和访问控制。企业场景里这一步往往比 Web TLS 复杂得多，因为它牵涉 AAA、设备证书、分支网关、跨厂商互通与运维流程。"
      },
      { 
        from: "Both", to: "Both", 
        label: "安装 CHILD_SA，建立受保护隧道",
        diagramNote: "安全收益明确，但是否能稳定落地取决于分片、NAT-T、固件和互通。",
        explanation: "握手完成后安装 CHILD_SA，隧道正式启用。此时需要重点关注 PMTU、分片、NAT-T、硬件加速和固件兼容，否则额外载荷会从理论问题变成部署事故。"
      },
    ],
    facts: ["PMTU 分片压力", "网关固件依赖", "需场景化压测"],
    notes: "IKEv2 需要独立评估分片策略、NAT-T、设备固件能力以及跨厂商互通性。",
  },
];

// 取整自 Cloudflare 2025 年末状态综述与其 2024 对比文。
export const adoptionStats = [
  { id: "pq-traffic", label: "PQ 加密 Web 流量", value: 52, prevValue: 29, unit: "%", color: "#10b981" },
  { id: "site-support", label: "公共站点 PQ 支持", value: 39, unit: "%", color: "#22d3ee" },
  { id: "origin-support", label: "源站 PQ 支持", value: 3.7, unit: "%", color: "#f43f5e" },
  { id: "latency-regression", label: "混合握手延迟回归", value: 4, unit: "%", color: "#a855f7" },
];

export const adoptionSource = "Cloudflare 2025 Year-End Report";

export const standardsTimeline = [
  { date: "2024-08-13", label: "FIPS 203/204/205", detail: "ML-KEM、ML-DSA、SLH-DSA 正式发布", type: "standard" },
  { date: "2025-03-11", label: "HQC 入选", detail: "NIST 选定 HQC 作为第五个 PQC 算法", type: "standard" },
  { date: "2025-09-18", label: "SP 800-227", detail: "KEM 使用建议最终版发布", type: "guidance" },
  { date: "2025-11-23", label: "TLS Hybrid Draft", detail: "draft-ietf-tls-ecdhe-mlkem 提交 IESG", type: "draft" },
  { date: "2026-03-24", label: "IKEv2 ML-KEM Draft", detail: "draft-ietf-ipsecme-ikev2-mlkem 提交 IESG", type: "draft" },
  { date: "2030", label: "弃用目标", detail: "NIST 迁移时间线将量子脆弱传统公钥算法推进到弃用窗口", type: "milestone" },
  { date: "2035", label: "禁用目标", detail: "NIST 计划在标准体系中全面移除量子脆弱算法", type: "milestone" },
];

export const migrationRules = [
  { id: "long-lived", label: "长期敏感数据", icon: "🔒", check: "是否存储需保密 10+ 年的数据？", action: "优先部署混合 KEM，防御 HNDL 攻击", priority: "critical" },
  { id: "mobile", label: "移动/弱网客户端", icon: "📱", check: "是否服务移动端或弱网环境？", action: "重点测试 PQ 握手在弱网下的表现", priority: "high" },
  { id: "vpn", label: "VPN/IPsec", icon: "🔗", check: "是否使用 VPN 或 IPsec 隧道？", action: "独立评估 PMTU 分片和网关固件支持", priority: "high" },
  { id: "pki", label: "重度 PKI 依赖", icon: "📜", check: "是否深度依赖 PKI 证书链？", action: "将签名迁移作为独立轨道规划", priority: "medium" },
  { id: "origin-sprawl", label: "源站扩散", icon: "🌐", check: "是否有多源站/反向代理/WAF？", action: "盘点所有依赖点，建立升级矩阵", priority: "medium" },
  { id: "third-party", label: "第三方设备", icon: "🏭", check: "是否依赖 HSM/网关/CA 等第三方？", action: "同步厂商 PQ 路线图，确认升级时间表", priority: "medium" },
];

export const migrationSteps = [
  { step: 1, label: "盘点", title: "密码资产盘点", detail: "映射所有 RSA/ECC/DH/ECDH/ECDSA 使用点", icon: "📋" },
  { step: 2, label: "敏捷化", title: "密码敏捷性改造", detail: "抽象算法接口，避免硬编码", icon: "🔧" },
  { step: 3, label: "试点", title: "混合部署试点", detail: "在 TLS/Zero Trust/Tunnel 场景试运行", icon: "🧪" },
  { step: 4, label: "同步", title: "厂商路线图同步", detail: "对齐 HSM、CA、云厂商的 PQ 支持计划", icon: "🤝" },
  { step: 5, label: "签名", title: "签名迁移规划", detail: "独立规划 PKI/代码签名/固件签名策略", icon: "✍️" },
];

export const keySizeComparison = [
  { algorithm: "RSA-2048", type: "classic", pk: 256, sig: 256 },
  { algorithm: "ECDSA-P256", type: "classic", pk: 64, sig: 64 },
  { algorithm: "ML-KEM-768", type: "pqc", pk: 1184, ct: 1088 },
  { algorithm: "ML-DSA-44", type: "pqc", pk: 1312, sig: 2420 },
  { algorithm: "SLH-DSA-128f", type: "pqc", pk: 32, sig: 17088 },
  { algorithm: "HQC-128", type: "pqc", pk: 2249, ct: 4497 },
];

export const latticeLesson = {
  modulus: 23,
  noiseBound: 2,
  stages: [
    {
      id: "exact-1d",
      title: "第一关：无噪声，秒解",
      equation: "7 · s ≡ 21 (mod 23)",
      hint: "试试用 s = 21 ÷ 7 来算",
      secret: 3,
      a: 7, b: 21, e: 0,
      candidates: [3],
      reveal: "没有噪声时，公开方程几乎直接把秘密暴露出来。量子计算机用 Shor 算法可以更快地破解这类问题。"
    },
    {
      id: "noisy-1d",
      title: "第二关：加一点噪声",
      equation: "7 · s + e ≡ 0 (mod 23)，e ∈ [-2, 2]",
      hint: "b=0 可能是 7·s+e 的结果，e 在 -2 到 2 之间",
      secret: 3,
      a: 7, b: 0, e: -2,
      candidates: [0, 3, 10, 13, 20],
      reveal: "一旦加入小噪声，原来唯一的答案变成了 5 个候选！攻击者猜中概率从 100% 降到 20%。"
    },
    {
      id: "grid-exact",
      title: "第三关：二维精确方程",
      equations: [
        { label: "s₁ + s₂ = 4", a: [1, 1], b: 4, e: 0 },
        { id: "e2", label: "s₁ + 2·s₂ = 5", a: [1, 2], b: 5, e: 0 }
      ],
      secret: [3, 1],
      gridSize: 7,
      plausiblePoints: [[3, 1]],
      reveal: "无噪声时，两条线唯一相交于 (3,1)——秘密一目了然。"
    },
    {
      id: "grid-noisy",
      title: "第四关：二维带噪攻击（核心挑战）",
      equations: [
        { label: "s₁ + s₂ + e₁ ≡ 2 (mod 7)", a: [1, 1], b: 2, e: -2 },
        { label: "s₁ + 2·s₂ + e₂ ≡ 3 (mod 7)", a: [1, 2], b: 3, e: -2 },
        { label: "2·s₁ + s₂ + e₃ ≡ 5 (mod 7)", a: [2, 1], b: 5, e: -2 }
      ],
      secret: [3, 1],
      gridSize: 7,
      plausiblePoints: [[1,1],[1,2],[2,0],[2,1],[3,0],[3,1]],
      reveal: "带噪后，唯一解变成了 6 个候选点！你猜中的概率只有 1/6。真实 ML-KEM 在高维空间运算，候选爆炸比这严重得多。"
    }
  ]
};

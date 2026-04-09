// PQC 实验室核心数据仓库
export const algorithms = [
  { 
    id: "ml-kem", 
    name: "ML-KEM", 
    role: "KEM", 
    detail: "格密码主力标准，基于 Module-LWE 假设。", 
    summary: "当前最主流的抗量子密钥封装方案，适合与经典密钥交换做混合部署。",
    specs: { pk: "1184B", ct: "1088B", perf: "High" },
    highlights: ["NIST 主线 KEM", "适配 Hybrid TLS", "性能与尺寸平衡较好"],
    wiki: "https://en.wikipedia.org/wiki/Kyber"
  },
  { 
    id: "ml-dsa", 
    name: "ML-DSA", 
    role: "Signature", 
    detail: "基于格的签名方案，采用拒绝采样技术。", 
    summary: "适合作为新一代签名能力接入证书、固件和身份认证链路。",
    specs: { pk: "1312B", sig: "2420B", perf: "Medium" },
    highlights: ["标准化签名主力", "工程复杂度中等", "适合长期演进"]
  },
  { 
    id: "slh-dsa", 
    name: "SLH-DSA", 
    role: "Signature", 
    detail: "哈希签名方案，极其稳健，不依赖代数假设。", 
    summary: "性能偏慢但假设保守，适合做高稳健性的备用签名路线。",
    specs: { pk: "32B", sig: "17KB", perf: "Low" },
    highlights: ["哈希路线", "签名体积偏大", "适合高稳健场景"]
  },
  { 
    id: "hqc", 
    name: "HQC", 
    role: "KEM", 
    detail: "基于纠错码理论的备选方案，非格基多样性保护。", 
    summary: "作为非格基备选路线，适合做多样性储备与风险对冲。",
    specs: { pk: "2249B", ct: "4481B", perf: "Medium" },
    highlights: ["非格基路线", "对象尺寸更大", "适合方案储备"]
  }
];

export const principles = [
  {
    id: "lattice",
    label: "Lattice 格密码",
    brief: "高维空间最短向量问题的搜索难度。Module-LWE 允许更紧凑的对象表示。",
    cue: "高维噪声、矩阵运算、紧凑对象",
    metrics: ["主流标准核心", "对象尺寸平衡", "工程成熟度高"]
  },
  {
    id: "hash",
    label: "Hash 哈希树",
    brief: "基于单向函数的碰撞抵御性。通过多层 Merkle 树认证路径构建签名。",
    cue: "单向函数、认证路径、状态管理",
    metrics: ["假设更保守", "签名通常更大", "适合高稳健需求"]
  },
  {
    id: "code",
    label: "Code 纠错码",
    brief: "将信息编码为带噪码字，仅合法接收方能通过校验矩阵恢复。",
    cue: "带噪码字、校验矩阵、结构多样性",
    metrics: ["非格基备选", "对象通常更重", "用于风险对冲"]
  }
];

export const scenarios = [
  {
    id: "tls-hybrid",
    label: "Hybrid TLS 1.3",
    brief: "X25519 + ML-KEM-768。当前主流部署路线。",
    stats: "+1.2KB Overhead",
    status: "Browser / CDN / Gateway"
  },
  {
    id: "ikev2-pq",
    label: "IKEv2 PQ-VPN",
    brief: "企业级隧道抗量子升级。处理 PMTU 分片是关键挑战。",
    stats: "Multi-Fragment",
    status: "Tunnel / Branch / Appliance"
  }
];

export const detailViews = {
  principle: {
    title: "Mathematical Foundations",
    eyebrow: "Explore Math",
    intro: "主页面只保留结构化提示；这里承接原理层的完整说明、工程后果与后续可扩展知识模块。",
    getSections: (selectedId) => {
      const current = principles.find((item) => item.id === selectedId) || principles[0];
      return [
        {
          title: current.label,
          cards: [
            {
              heading: "核心直觉",
              body: current.brief
            },
            {
              heading: "为什么会被采用",
              body: current.id === "lattice"
                ? "格基方案在安全性、性能和对象尺寸之间取得了工程上最可用的平衡，因此成为当前标准化主线。"
                : current.id === "hash"
                  ? "哈希路线的假设更保守，适合做高稳健性签名能力的后备与补充。"
                  : "码基路线提供非格基多样性，能降低单一路线失效时的系统性风险。"
            },
            {
              heading: "后续可扩展内容",
              body: "可以继续在这里挂接推导动画、参数解释、攻击模型、标准文档摘录与实验记录，而不影响主页面观感。"
            }
          ]
        },
        {
          title: "Implementation Notes",
          cards: current.metrics.map((metric) => ({
            heading: metric,
            body: current.cue
          }))
        }
      ];
    }
  },
  algorithm: {
    title: "Algorithm Bench",
    eyebrow: "Benchmark Analysis",
    intro: "算法页维持矩阵感知；具体对象尺寸、部署位置、迁移建议全部下沉到这里，并支持按当前算法继续展开。",
    getSections: (selectedId) => {
      const current = algorithms.find((item) => item.id === selectedId);
      const leadCards = current
        ? [
            {
              heading: current.name,
              body: `${current.detail} ${current.summary}`
            },
            {
              heading: "规格概览",
              body: `Public Key ${current.specs.pk} · Cipher/Sign ${current.specs.ct || current.specs.sig} · Performance ${current.specs.perf}`
            },
            {
              heading: "适配建议",
              body: current.highlights.join(" · ")
            }
          ]
        : [
            {
              heading: "标准族谱",
              body: "ML-KEM、ML-DSA、SLH-DSA 与 HQC 构成当前最值得跟踪的主线与备选组合。"
            },
            {
              heading: "迁移视角",
              body: "优先看对象尺寸、验证耗时、协议适配方式以及与现网链路的兼容程度。"
            },
            {
              heading: "扩展入口",
              body: "后续可继续增加具体参数集、测试平台数据、实现库差异与版本记录。"
            }
          ];

      return [
        {
          title: current ? "Selected Track" : "Overview",
          cards: leadCards
        },
        {
          title: "Algorithm Cards",
          cards: algorithms.map((item) => ({
            heading: `${item.name} / ${item.role}`,
            body: `${item.summary} 关键标签：${item.highlights.join("、")}。`
          }))
        }
      ];
    }
  },
  handshake: {
    title: "Deployment Traffic",
    eyebrow: "Traffic Capture",
    intro: "部署页只保留迁移信号和开销印象；链路拆解、报文变化、实施检查点统一放到这个浮层承接。",
    getSections: (selectedId) => {
      const current = scenarios.find((item) => item.id === selectedId) || scenarios[0];
      return [
        {
          title: current.label,
          cards: [
            {
              heading: "场景摘要",
              body: current.brief
            },
            {
              heading: "工程状态",
              body: `${current.status} · ${current.stats}`
            },
            {
              heading: "实施提醒",
              body: current.id === "tls-hybrid"
                ? "重点关注握手对象尺寸增长、证书链兼容与边缘设备的最大报文承载能力。"
                : "重点关注 PMTU、碎片重组、设备固件支持情况以及隧道建立耗时。"
            }
          ]
        },
        {
          title: "Rollout Checklist",
          cards: [
            {
              heading: "Inventory First",
              body: "先盘点终端、网关、证书系统与 VPN 设备支持矩阵，确定混合部署边界。"
            },
            {
              heading: "Observe Before Expand",
              body: "先在灰度链路观察对象大小、失败率与回退路径，再决定是否扩大覆盖范围。"
            },
            {
              heading: "Knowledge Extension",
              body: "后续可继续挂接 Wireshark 截图、报文字段注释、实验结论和迁移模板。"
            }
          ]
        }
      ];
    }
  }
};

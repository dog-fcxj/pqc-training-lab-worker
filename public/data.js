// PQC 实验室核心数据仓库
export const algorithms = [
  { 
    id: "ml-kem", 
    name: "ML-KEM", 
    role: "KEM", 
    detail: "格密码主力标准，基于 Module-LWE 假设。", 
    specs: { pk: "1184B", ct: "1088B", perf: "High" },
    wiki: "https://en.wikipedia.org/wiki/Kyber"
  },
  { 
    id: "ml-dsa", 
    name: "ML-DSA", 
    role: "Signature", 
    detail: "基于格的签名方案，采用拒绝采样技术。", 
    specs: { pk: "1312B", sig: "2420B", perf: "Medium" }
  },
  { 
    id: "slh-dsa", 
    name: "SLH-DSA", 
    role: "Signature", 
    detail: "哈希签名方案，极其稳健，不依赖代数假设。", 
    specs: { pk: "32B", sig: "17KB", perf: "Low" }
  },
  { 
    id: "hqc", 
    name: "HQC", 
    role: "KEM", 
    detail: "基于纠错码理论的备选方案，非格基多样性保护。", 
    specs: { pk: "2249B", ct: "4481B", perf: "Medium" }
  }
];

export const principles = [
  { id: "lattice", label: "Lattice 格密码", brief: "高维空间最短向量问题的搜索难度。Module-LWE 允许更紧凑的对象表示。" },
  { id: "hash", label: "Hash 哈希树", brief: "基于单向函数的碰撞抵御性。通过多层 Merkle 树认证路径构建签名。" },
  { id: "code", label: "Code 纠错码", brief: "将信息编码为带噪码字，仅合法接收方能通过校验矩阵恢复。" }
];

export const scenarios = [
  { id: "tls-hybrid", label: "Hybrid TLS 1.3", brief: "X25519 + ML-KEM-768。当前主流部署路线。", stats: "+1.2KB Overhead" },
  { id: "ikev2-pq", label: "IKEv2 PQ-VPN", brief: "企业级隧道抗量子升级。处理 PMTU 分片是关键挑战。", stats: "Multi-Fragment" }
];

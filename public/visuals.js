// PQC 实验室视觉增强引擎
export function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  // 增加节点密度和亮度
  const layerConfigs = [
    { count: 20, opacity: 0.2, blur: 6, r: 1.5 }, // 远景
    { count: 25, opacity: 0.5, blur: 0, r: 3 },   // 中景
    { count: 12, opacity: 1.0, blur: 0, r: 5 }    // 近景
  ];

  layerConfigs.forEach((config, lIdx) => {
    for (let i = 0; i < config.count; i++) {
      nodes.push({
        x: 30 + Math.random() * 380,
        y: 30 + Math.random() * 300,
        r: config.r,
        opacity: config.opacity,
        blur: config.blur,
        tone: ['cyan', 'violet', 'magenta'][Math.floor(Math.random()*3)]
      });
    }
  });

  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      // 仅连接同层或相邻层节点，增加秩序感
      if (dist < 80 && Math.abs(nodes[i].r - nodes[j].r) <= 2) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="0.5" opacity="${nodes[i].opacity * 0.3}" />`;
      }
    }
  }

  svg.innerHTML = `
    <!-- 坐标辅助线 -->
    <g opacity="0.1">
      ${[...Array(11)].map((_, i) => `<line x1="${i*44}" y1="0" x2="${i*44}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${i*45}" x2="440" y2="${i*45}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="var(--accent-${n.tone})" opacity="${n.opacity}" style="filter:blur(${n.blur}px)">
        <animate attributeName="r" values="${n.r};${n.r*1.2};${n.r}" dur="${3+Math.random()*2}s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="${n.opacity*0.6};${n.opacity};${n.opacity*0.6}" dur="${3+Math.random()*2}s" repeatCount="indefinite" />
      </circle>
    `).join("")}
  `;
}

export function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  // 增加数据流的可见度和色彩
  for (let i = 0; i < 25; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `nebula-pulse ${6 + Math.random() * 8}s linear infinite`;
    stream.style.fontSize = (9 + Math.random() * 5) + "px";
    stream.style.opacity = (0.15 + Math.random() * 0.25);
    stream.style.color = i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)';
    stream.textContent = Math.random().toString(16).substring(2, 14).toUpperCase();
    container.appendChild(stream);
  }
}

// PQC 实验室视觉增强引擎 5.0 (No-Blur Stable Edition)
export function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  const layers = [
    { count: 15, opacity: 0.2, r: 2 }, 
    { count: 20, opacity: 0.5, r: 4 },
    { count: 10, opacity: 0.9, r: 7 }
  ];

  layers.forEach((layer, lIdx) => {
    for (let i = 0; i < layer.count; i++) {
      nodes.push({
        x: 40 + Math.random() * 360,
        y: 40 + Math.random() * 280,
        r: layer.r,
        opacity: layer.opacity,
        tone: ['cyan', 'violet', 'magenta'][Math.floor(Math.random()*3)]
      });
    }
  });

  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 80 && Math.abs(nodes[i].r - nodes[j].r) <= 3) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="1" opacity="${nodes[i].opacity * 0.2}" />`;
      }
    }
  }

  // 使用 SVG 渐变代替 Filter，彻底解决黑洞问题
  svg.innerHTML = `
    <defs>
      <radialGradient id="grad-cyan"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="var(--accent-cyan)"/></radialGradient>
      <radialGradient id="grad-violet"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="var(--accent-violet)"/></radialGradient>
      <radialGradient id="grad-magenta"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="var(--accent-magenta)"/></radialGradient>
    </defs>
    <g opacity="0.1">
      ${[...Array(11)].map((_, i) => `<line x1="${i*44}" y1="0" x2="${i*44}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${i*45}" x2="440" y2="${i*45}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <g opacity="${n.opacity}">
        <!-- 外圈光晕 -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r * 2}" fill="var(--accent-${n.tone})" opacity="0.3">
          <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite" />
        </circle>
        <!-- 实体中心 -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="url(#grad-${n.tone})">
          <animate attributeName="r" values="${n.r};${n.r*1.2};${n.r}" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    `).join("")}
  `;
}

export function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  container.innerHTML = ""; // 清空旧的
  for (let i = 0; i < 30; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `orb-float ${10 + Math.random() * 10}s linear infinite alternate`;
    stream.style.opacity = (0.2 + Math.random() * 0.4);
    stream.style.color = i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)';
    stream.textContent = "0x" + Math.random().toString(16).substring(2, 10).toUpperCase();
    container.appendChild(stream);
  }
}

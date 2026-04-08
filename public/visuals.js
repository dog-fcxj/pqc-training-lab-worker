// PQC 实验室视觉增强引擎 6.0 (Zero-Gradient Compatible Edition)
export function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  const layers = [
    { count: 12, opacity: 0.25, r: 2.5 }, 
    { count: 18, opacity: 0.55, r: 4.5 },
    { count: 10, opacity: 0.9, r: 7.5 }
  ];

  layers.forEach((layer, lIdx) => {
    for (let i = 0; i < layer.count; i++) {
      nodes.push({
        x: 40 + Math.random() * 360,
        y: 40 + Math.random() * 280,
        r: layer.r,
        opacity: layer.opacity,
        tone: ['cyan', 'violet', 'magenta'][Math.floor(Math.random()*3)],
        color: ['#22d3ee', '#a855f7', '#f43f5e'][Math.floor(Math.random()*3)]
      });
    }
  });

  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 80 && Math.abs(nodes[i].r - nodes[j].r) <= 3) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="1.2" opacity="${nodes[i].opacity * 0.25}" />`;
      }
    }
  }

  // 核心修复：不使用 Gradient，使用多层实体圆叠加
  svg.innerHTML = `
    <g opacity="0.15">
      ${[...Array(11)].map((_, i) => `<line x1="${i*44}" y1="0" x2="${i*44}" y2="360" stroke="#fff" stroke-width="0.5"/>`).join("")}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${i*45}" x2="440" y2="${i*45}" stroke="#fff" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <g opacity="${n.opacity}">
        <!-- 外层超柔和光晕 -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r * 3}" fill="${n.color}" opacity="0.15">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
        </circle>
        <!-- 中层核心色 -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r * 1.5}" fill="${n.color}" opacity="0.4">
          <animate attributeName="r" values="${n.r * 1.2};${n.r * 1.8};${n.r * 1.2}" dur="3s" repeatCount="indefinite" />
        </circle>
        <!-- 内层高亮核心 (白色) -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="#fff" opacity="0.9">
          <animate attributeName="r" values="${n.r};${n.r * 1.1};${n.r}" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
    `).join("")}
  `;
}

export function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  container.innerHTML = ""; 
  for (let i = 0; i < 25; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `nebula-drift 15s linear infinite alternate`;
    stream.style.opacity = (0.2 + Math.random() * 0.3);
    stream.style.color = i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)';
    stream.textContent = "0x" + Math.random().toString(16).substring(2, 10).toUpperCase();
    container.appendChild(stream);
  }
}

// PQC 实验室视觉增强引擎 (High Contrast)
export function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  const layerConfigs = [
    { count: 20, opacity: 0.3, blur: 8, r: 2 }, 
    { count: 25, opacity: 0.6, blur: 0, r: 3.5 },
    { count: 12, opacity: 1.0, blur: 0, r: 6 }
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
      if (dist < 85 && Math.abs(nodes[i].opacity - nodes[j].opacity) < 0.2) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="0.8" opacity="${nodes[i].opacity * 0.4}" />`;
      }
    }
  }

  svg.innerHTML = `
    <!-- 强对比坐标辅助线 -->
    <g opacity="0.2">
      ${[...Array(11)].map((_, i) => `<line x1="${i*44}" y1="0" x2="${i*44}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${i*45}" x2="440" y2="${i*45}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="var(--accent-${n.tone})" opacity="${n.opacity}" style="filter:blur(${n.blur}px)">
        <animate attributeName="r" values="${n.r};${n.r*1.25};${n.r}" dur="${2.5+Math.random()*2}s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="${n.opacity*0.7};${n.opacity};${n.opacity*0.7}" dur="${2.5+Math.random()*2}s" repeatCount="indefinite" />
      </circle>
    `).join("")}
  `;
}

export function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  for (let i = 0; i < 30; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `orb-float ${10 + Math.random() * 10}s linear infinite alternate`;
    stream.style.fontSize = (10 + Math.random() * 6) + "px";
    stream.style.opacity = (0.2 + Math.random() * 0.3);
    stream.style.color = i % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-violet)';
    stream.textContent = "0x" + Math.random().toString(16).substring(2, 10).toUpperCase();
    container.appendChild(stream);
  }
}

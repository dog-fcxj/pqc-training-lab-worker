// PQC 实验室视觉增强引擎 7.0 (Compatibility & Visibility First)
export function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  const layers = [
    { count: 12, opacity: 0.3, r: 2, color: '#22d3ee' }, 
    { count: 18, opacity: 0.6, r: 4, color: '#a855f7' },
    { count: 10, opacity: 0.9, r: 6, color: '#f43f5e' }
  ];

  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      nodes.push({
        x: 40 + Math.random() * 360,
        y: 40 + Math.random() * 280,
        r: layer.r,
        opacity: layer.opacity,
        color: layer.color
      });
    }
  });

  let edges = "";
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 80 && Math.abs(nodes[i].r - nodes[j].r) <= 2) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="white" stroke-width="0.5" opacity="${nodes[i].opacity * 0.2}" />`;
      }
    }
  }

  // 彻底抛弃 Gradient 和 Filter，使用三层实体叠加确保显示
  svg.innerHTML = `
    <g opacity="0.1">
      ${[...Array(11)].map((_, i) => `<line x1="${i*44}" y1="0" x2="${i*44}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${i*45}" x2="440" y2="${i*45}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <g opacity="${n.opacity}">
        <!-- 底层柔光 -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r * 2.5}" fill="${n.color}" opacity="0.2">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
        </circle>
        <!-- 核心色 -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r * 1.2}" fill="${n.color}" opacity="0.6">
          <animate attributeName="r" values="${n.r};${n.r * 1.5};${n.r}" dur="3s" repeatCount="indefinite" />
        </circle>
        <!-- 亮芯 (白色，绝不会变黑) -->
        <circle cx="${n.x}" cy="${n.y}" r="${n.r * 0.6}" fill="white" opacity="1" />
      </g>
    `).join("")}
  `;
}

export function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  container.innerHTML = ""; 
  for (let i = 0; i < 20; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `nebula-drift ${10 + Math.random() * 10}s linear infinite alternate`;
    stream.style.opacity = (0.1 + Math.random() * 0.2);
    stream.style.color = i % 2 === 0 ? '#22d3ee' : '#a855f7';
    stream.textContent = "0x" + Math.random().toString(16).substring(2, 10).toUpperCase();
    container.appendChild(stream);
  }
}

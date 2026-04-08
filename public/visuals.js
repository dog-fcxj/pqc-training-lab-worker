// PQC 实验室视觉引擎
export function buildHeroNetwork() {
  const svg = document.getElementById("hero-network");
  if (!svg) return;
  
  const nodes = [];
  const layerConfigs = [
    { count: 18, opacity: 0.15, blur: 5 },
    { count: 22, opacity: 0.45, blur: 0 },
    { count: 12, opacity: 0.9, blur: 0 }
  ];

  layerConfigs.forEach((config, lIdx) => {
    for (let i = 0; i < config.count; i++) {
      nodes.push({
        x: 40 + Math.random() * 360,
        y: 40 + Math.random() * 280,
        r: 1.5 + (2 - lIdx) * 2,
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
      if (dist < 70 && nodes[i].opacity === nodes[j].opacity) {
        edges += `<line x1="${nodes[i].x}" y1="${nodes[i].y}" x2="${nodes[j].x}" y2="${nodes[j].y}" 
                    stroke="var(--accent-cyan)" stroke-width="0.4" opacity="${nodes[i].opacity * 0.4}" />`;
      }
    }
  }

  svg.innerHTML = `
    <g opacity="0.15">
      ${[...Array(12)].map((_, i) => `<line x1="${i*40}" y1="0" x2="${i*40}" y2="360" stroke="white" stroke-width="0.5"/>`).join("")}
      ${[...Array(10)].map((_, i) => `<line x1="0" y1="${i*40}" x2="440" y2="${i*40}" stroke="white" stroke-width="0.5"/>`).join("")}
    </g>
    ${edges}
    ${nodes.map(n => `
      <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="var(--accent-${n.tone})" opacity="${n.opacity}" style="filter:blur(${n.blur}px)">
        <animate attributeName="opacity" values="${n.opacity*0.5};${n.opacity};${n.opacity*0.5}" dur="${3+Math.random()*4}s" repeatCount="indefinite" />
      </circle>
    `).join("")}
  `;
}

export function initDataStreams() {
  const container = document.getElementById("data-streams");
  if (!container) return;
  
  for (let i = 0; i < 20; i++) {
    const stream = document.createElement("div");
    stream.className = "data-stream";
    stream.style.left = Math.random() * 100 + "vw";
    stream.style.top = Math.random() * 100 + "vh";
    stream.style.animation = `nebula-pulse ${4 + Math.random() * 6}s linear infinite`;
    stream.style.fontSize = (8 + Math.random() * 4) + "px";
    stream.style.opacity = (0.1 + Math.random() * 0.2);
    stream.textContent = Math.random().toString(16).substring(2, 12).toUpperCase();
    container.appendChild(stream);
  }
}

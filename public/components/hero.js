export function renderHero(container) {
  container.innerHTML = `
    <div class="card card-corners" style="display: flex; gap: 60px; align-items: center; width: 100%; max-width: 1200px;">
      <div style="flex: 1.2">
        <p style="color: var(--accent-cyan); font-family: 'JetBrains Mono'; font-size: 14px; letter-spacing: 4px; font-weight: 700; margin-bottom: 16px;">// DEFENSE_MATRIX_READY</p>
        <h1 style="margin:0 0 24px 0;">后量子密码学<br/>安全实验室</h1>
        <p style="color: var(--text-dim); font-size: 18px; line-height: 1.8; margin-bottom: 48px;">
          量子计算正在重塑信息安全的边界。我们通过格密码、哈希树与纠错码，构建不可逾越的抗量子堡垒。
        </p>
        <div style="display: flex; gap: 20px;">
          <button class="cta-button" onclick="window.goToPage(2)">Algorithm View</button>
          <button class="cta-button" style="border-color: var(--accent-violet); color: var(--accent-violet)" onclick="window.goToPage(1)">Principles</button>
        </div>
      </div>
      <div style="flex: 1; height: 400px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 8px; position: relative;">
        <svg id="hero-network" viewBox="0 0 440 360" style="width:100%; height:100%;"></svg>
      </div>
    </div>
  `;
}

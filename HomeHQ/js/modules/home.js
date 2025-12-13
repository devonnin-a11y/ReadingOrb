Router.register("home", (view) => {
  const p = Store.current();
  const info = Store.levelInfo(p.stars);

  view.innerHTML = `
    <div class="card">
      <div class="big">Welcome back, ${Store.getState().activeProfile}! 🐾</div>
      <div class="muted">Stars power your level-ups. Streaks reward consistency.</div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="big">Today’s Missions</div>
        <ul>
          <li>📖 Read 1 passage</li>
          <li>➕ Finish 1 math game</li>
          <li>💻 Run 1 coding program</li>
        </ul>
        <div class="muted">Tip: Mom can award ⭐ when they do great.</div>
      </div>

      <div class="card">
        <div class="big">Progress</div>
        <div>⭐ Stars: <strong>${p.stars}</strong></div>
        <div>🔥 Streak: <strong>${p.streak}</strong></div>
        <div>⚡ Level: <strong>${info.level}</strong></div>
        <div class="muted">Every 10 stars = level up.</div>
      </div>
    </div>

    <div class="card">
      <div class="big">Quick Launch</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="goReading" type="button">📖 Reading</button>
        <button class="btn primary" id="goMath" type="button">➕ Math</button>
        <button class="btn primary" id="goCoding" type="button">💻 Coding</button>
        <button class="btn ghost" id="goParent" type="button">🛡 Parent</button>
      </div>
    </div>
  `;

  view.querySelector("#goReading").onclick = () => Router.go("reading");
  view.querySelector("#goMath").onclick = () => Router.go("math");
  view.querySelector("#goCoding").onclick = () => Router.go("coding");
  view.querySelector("#goParent").onclick = () => Router.go("parent");
});

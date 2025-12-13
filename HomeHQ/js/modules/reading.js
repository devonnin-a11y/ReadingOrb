Router.register("reading", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">📖 Reading (Embedded)</div>
      <div class="muted">Kids stay inside HomeHQ while ReadingOrb runs below.</div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="awardStar" type="button">⭐ Award Star</button>
        <button class="btn ghost" id="backHome" type="button">🏠 Back to Home</button>
        <a class="btn ghost" href="../" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
          Open ReadingOrb Fullscreen ↗
        </a>
      </div>

      <p class="hint small muted" style="margin-top:10px;">
        Tip: Use the floating 🏠 button (bottom-right) anytime.
      </p>
    </div>

    <div class="iframe-wrap">
      <iframe class="iframe" src="../" title="ReadingOrb Embedded"></iframe>
    </div>
  `;

  view.querySelector("#awardStar").onclick = () => awardStar("Reading success");
  view.querySelector("#backHome").onclick = () => Router.go("home");
});

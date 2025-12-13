Router.register("reading", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">📖 Reading (Embedded)</div>
      <div class="muted">
        This runs your ReadingOrb inside HomeHQ so kids stay in the hub.
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="awardStar" type="button">⭐ Award Star</button>
        <a class="btn ghost" href="../" style="text-decoration:none; display:inline-flex; align-items:center; justify-content:center;">
          Open ReadingOrb Fullscreen ↗
        </a>
      </div>
    </div>

    <div class="iframe-wrap">
      <iframe class="iframe" src="../" title="ReadingOrb Embedded"></iframe>
    </div>
  `;

  view.querySelector("#awardStar").onclick = () => {
    Store.addStars(1);
    updateProgressUI();
    alert("⭐ Star awarded!");
  };
});

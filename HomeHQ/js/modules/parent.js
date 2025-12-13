Router.register("parent", (view) => {
  const state = Store.getState();
  const active = state.activeProfile;
  const p = Store.current();

  // Build a 7-day window
  const days = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${day}`;
    days.push(iso);
  }

  const weekStars = days.map(iso => (p.weekly?.[iso] || 0));
  const totalWeek = weekStars.reduce((a,b)=>a+b,0);

  view.innerHTML = `
    <div class="card">
      <div class="big">🛡 Parent Dashboard</div>
      <div class="muted">Profile: <strong>${active}</strong></div>
    </div>

    <div class="card">
      <div class="big">Weekly Stars (last 7 days)</div>
      <div class="muted">Total: <strong>${totalWeek}</strong></div>
      <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">
        ${days.map((iso, idx)=>`
          <div class="chip" title="${iso}">
            ${iso.slice(5)}: ⭐ ${weekStars[idx]}
          </div>
        `).join("")}
      </div>
    </div>

    <div class="card">
      <div class="big">Notes for Mom</div>
      <div class="muted">Save quick observations (focus, wins, struggles, etc.)</div>
      <textarea id="notes" rows="5" style="width:100%; margin-top:10px; padding:10px; border-radius:14px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff;">${p.notes || ""}</textarea>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="saveNotes" type="button">Save Notes</button>
        <button class="btn ghost" id="awardStar" type="button">⭐ Award Star</button>
      </div>
    </div>

    <div class="card">
      <div class="big">Admin</div>
      <div class="muted">Use these if things get messy.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn danger" id="resetActive" type="button">Reset ${active}</button>
        <button class="btn danger" id="resetStreaks" type="button">Reset All Streaks</button>
      </div>
    </div>
  `;

  view.querySelector("#saveNotes").onclick = () => {
    Store.setNotes(view.querySelector("#notes").value);
    alert("Saved ✅");
  };

  view.querySelector("#awardStar").onclick = () => {
    Store.addStars(1);
    updateProgressUI();
    alert("⭐ Star awarded!");
  };

  view.querySelector("#resetActive").onclick = () => {
    if (!confirm(`Reset ${active}? This clears stars/streak/notes/weekly.`)) return;
    Store.resetProfile(active);
    updateProgressUI();
    Router.go("parent");
  };

  view.querySelector("#resetStreaks").onclick = () => {
    if (!confirm("Reset streaks for both profiles?")) return;
    Store.resetStreaks();
    updateProgressUI();
    Router.go("parent");
  };
});

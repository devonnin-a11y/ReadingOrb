Router.register("parent", (view) => {
  const state = Store.getState();
  const active = state.activeProfile;
  const p = Store.current();

  const days = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }

  const weekStars = days.map(iso => (p.weekly?.[iso] || 0));
  const totalWeek = weekStars.reduce((a,b)=>a+b,0);
  const badges = p.badges || [];

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
      <div class="big">🏅 Trophy Locker</div>
      <div class="muted">Badges earned:</div>
      <div style="margin-top:10px; display:flex; gap:6px; flex-wrap:wrap;">
        ${badges.length ? badges.map(b => `<div class="chip">🏅 ${b}</div>`).join("") : `<div class="muted">No badges yet (they’ll get one after the first ⭐).</div>`}
      </div>
    </div>

    <div class="card">
      <div class="big">Notes for Mom</div>
      <textarea id="notes" rows="5" style="width:100%; margin-top:10px; padding:10px; border-radius:14px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff;">${p.notes || ""}</textarea>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="saveNotes" type="button">Save Notes</button>
        <button class="btn primary" id="awardStar" type="button">⭐ Award Star</button>
        <button class="btn ghost" id="backHome" type="button">🏠 Back to Home</button>
      </div>
    </div>

    <div class="card">
      <div class="big">Parent Lock PIN</div>
      <div class="muted">Change your PIN (numbers only recommended).</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <input id="newPin" placeholder="New PIN" inputmode="numeric"
          style="flex:1; padding:10px 12px; border-radius:14px; border:1px solid rgba(166,220,255,.22); background:rgba(0,0,0,.25); color:#fff; font-weight:900;">
        <button class="btn primary" id="savePin" type="button">Save PIN</button>
      </div>
      <p class="hint small muted">Tip: write it down somewhere safe.</p>
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

  view.querySelector("#backHome").onclick = () => Router.go("home");

  view.querySelector("#saveNotes").onclick = () => {
    Store.setNotes(view.querySelector("#notes").value);
    alert("Saved ✅");
  };

  view.querySelector("#awardStar").onclick = () => awardStar("Parent award");

  view.querySelector("#savePin").onclick = () => {
    const pin = String(view.querySelector("#newPin").value || "").trim();
    if (!pin || pin.length < 3) return alert("PIN too short.");
    Store.setParentPin(pin);
    alert("PIN saved ✅");
    view.querySelector("#newPin").value = "";
  };

  view.querySelector("#resetActive").onclick = () => {
    if (!confirm(`Reset ${active}? This clears stars/streak/notes/weekly/badges.`)) return;
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

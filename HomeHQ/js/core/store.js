// HomeHQ Rewards + Toast (safe/compat version)

(function () {
  // --- Toast ---
  function ensureToast() {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.hidden = true;
      el.title = "Click to dismiss";
      el.addEventListener("click", () => (el.hidden = true));
      document.body.appendChild(el);
    }
    return el;
  }

  window.showToast = function showToast(text, ms = 1200) {
    const el = ensureToast();
    el.textContent = text;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (el.hidden = true), ms);
  };

  // --- Confetti ---
  window.burstConfetti = function burstConfetti() {
    const layer = document.getElementById("fxLayer");
    if (!layer) return;

    const w = window.innerWidth, h = window.innerHeight;
    const n = 18;

    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.className = "fx";

      const x0 = w * 0.5 + (Math.random() * 80 - 40);
      const y0 = h - 90;
      const x1 = x0 + (Math.random() * 260 - 130);
      const y1 = y0 - (Math.random() * 240 + 140);

      d.style.setProperty("--x0", `${x0}px`);
      d.style.setProperty("--y0", `${y0}px`);
      d.style.setProperty("--x1", `${x1}px`);
      d.style.setProperty("--y1", `${y1}px`);
      d.style.setProperty("--r", `${Math.floor(Math.random() * 520) - 260}deg`);

      layer.appendChild(d);
      setTimeout(() => d.remove(), 700);
    }
  };

  // --- Stars (compat) ---
  function tryAddStar() {
    // Try multiple Store APIs safely
    try {
      if (window.Store?.addStars) return Store.addStars(1);
      if (window.Store?.addStar) return Store.addStar(1);
      if (window.Store?.add) return Store.add("stars", 1);
      // fallback: mutate active profile if it exists
      const p = (Store?.current && Store.current()) || (Store?.getActive && Store.getActive());
      if (p) {
        p.stars = (p.stars || 0) + 1;
        Store?.save?.();
      }
    } catch {}
  }

  window.awardStar = function awardStar(source = "General") {
    tryAddStar();
    try { window.updateProgressUI?.(); } catch {}
    try { window.burstConfetti?.(); } catch {}
    window.showToast?.(`⭐ +1 Star (${source})`, 1200);
  };
})();

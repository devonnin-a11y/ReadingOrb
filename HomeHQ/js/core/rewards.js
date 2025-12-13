// Rewards / Stars / Confetti / Badges + Toast
// Safe: if a toast already exists, it updates + auto-hides.

function awardStar(source = "General") {
  try { Store.addStars(1); } catch {}
  try { updateProgressUI(); } catch {}
  try { burstConfetti(); } catch {}
  try { maybeAwardBadges(source); } catch {}
  showToast(`⭐ +1 Star (${source})`, 1200);
}

function showToast(text, ms = 1200) {
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

  el.textContent = text;
  el.hidden = false;

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.hidden = true; }, ms);
}

// Simple confetti burst (uses fxLayer from index.html)
function burstConfetti() {
  const layer = document.getElementById("fxLayer");
  if (!layer) return;

  const rect = { w: window.innerWidth, h: window.innerHeight };
  const n = 18;

  for (let i = 0; i < n; i++) {
    const d = document.createElement("div");
    d.className = "fx";

    const x0 = (rect.w * 0.5) + (Math.random() * 80 - 40);
    const y0 = rect.h - 90;

    const x1 = x0 + (Math.random() * 260 - 130);
    const y1 = y0 - (Math.random() * 240 + 140);

    d.style.left = "0px";
    d.style.top = "0px";
    d.style.setProperty("--x0", `${x0}px`);
    d.style.setProperty("--y0", `${y0}px`);
    d.style.setProperty("--x1", `${x1}px`);
    d.style.setProperty("--y1", `${y1}px`);
    d.style.setProperty("--r", `${Math.floor(Math.random() * 520) - 260}deg`);

    layer.appendChild(d);
    setTimeout(() => d.remove(), 700);
  }
}

function maybeAwardBadges(source) {
  // Minimal badge system (non-breaking).
  // If you already have a badge system, this won't interfere.
  const p = Store.current?.();
  if (!p) return;
  p.badges ||= [];

  const add = (b) => {
    if (!p.badges.includes(b)) {
      p.badges.push(b);
      Store.save?.();
      showToast(`🏅 Badge: ${b}`, 1400);
    }
  };

  if (p.stars >= 5) add("Rookie Star");
  if (p.stars >= 20) add("Star Ranger");
  if ((p.streak || 0) >= 3) add("Streak Spark");
}

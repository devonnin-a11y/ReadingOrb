// Global FX + Rewards utilities

function spawnMorphBurst() {
  const fxLayer = document.getElementById("fxLayer");
  if (!fxLayer) return;

  const colors = [
    "rgba(99,179,255,0.95)",
    "rgba(255,201,75,0.95)",
    "rgba(255,75,106,0.95)",
    "rgba(255,255,255,0.9)"
  ];

  const cx = Math.round(window.innerWidth * 0.5);
  const cy = Math.round(window.innerHeight * 0.18);

  const rand = (min, max) => Math.random() * (max - min) + min;

  const count = 28;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "fx";
    el.style.background = colors[i % colors.length];

    const dx = rand(-180, 180);
    const dy = rand(-20, 220);

    el.style.setProperty("--x0", `${cx}px`);
    el.style.setProperty("--y0", `${cy}px`);
    el.style.setProperty("--x1", `${cx + dx}px`);
    el.style.setProperty("--y1", `${cy + dy}px`);
    el.style.setProperty("--r", `${rand(-540, 540)}deg`);

    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;

    if (Math.random() < 0.35) {
      el.style.width = "6px";
      el.style.height = "18px";
      el.style.borderRadius = "2px";
    }

    fxLayer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

function updateProgressUI() {
  const p = Store.current();
  const info = Store.levelInfo(p.stars);

  document.getElementById("starsChip").textContent = `⭐ ${p.stars}`;
  document.getElementById("streakChip").textContent = `🔥 ${p.streak}`;
  document.getElementById("levelChip").textContent = `⚡ Lv ${info.level}`;

  const badges = (p.badges || []).length;
  document.getElementById("badgeChip").textContent = `🏅 ${badges}`;

  document.getElementById("levelLeft").textContent = `Level ${info.level}`;
  document.getElementById("levelRight").textContent = `${info.into} / ${info.per}`;
  document.getElementById("levelFill").style.width = `${(info.into / info.per) * 100}%`;
}

// Badge rules (simple + motivating)
function evaluateBadges() {
  const p = Store.current();
  const info = Store.levelInfo(p.stars);

  const badges = new Set(p.badges || []);

  // first star
  if (p.stars >= 1) badges.add("First Star");

  // streak badges
  if (p.streak >= 3) badges.add("3-Day Streak");
  if (p.streak >= 7) badges.add("7-Day Streak");

  // level badges
  if (info.level >= 2) badges.add("Level 2");
  if (info.level >= 5) badges.add("Level 5");

  p.badges = Array.from(badges);
  Store.save();
}

// One function to use everywhere
function awardStar(reason = "") {
  Store.addStars(1);
  evaluateBadges();
  updateProgressUI();
  spawnMorphBurst();
  if (reason) console.log("Awarded star:", reason);
}

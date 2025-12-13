function updateProgressUI() {
  const p = Store.current();
  const info = Store.levelInfo(p.stars);

  document.getElementById("starsChip").textContent = `⭐ ${p.stars}`;
  document.getElementById("streakChip").textContent = `🔥 ${p.streak}`;
  document.getElementById("levelChip").textContent = `⚡ Lv ${info.level}`;

  document.getElementById("levelLeft").textContent = `Level ${info.level}`;
  document.getElementById("levelRight").textContent = `${info.into} / ${info.per}`;
  document.getElementById("levelFill").style.width = `${(info.into / info.per) * 100}%`;
}

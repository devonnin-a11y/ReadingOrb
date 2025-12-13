function updateProgressUI() {
  const p = Store.current();
  document.getElementById("stars").textContent = `⭐ ${p.stars}`;
  document.getElementById("streak").textContent = `🔥 ${p.streak} day streak`;
  document.getElementById("level").textContent = `⚡ Level ${p.level}`;
}

Store.load();
updateProgressUI();

document.querySelectorAll(".profile-btn").forEach(btn => {
  btn.onclick = () => {
    Store.activeProfile = btn.dataset.profile;
    document.querySelectorAll(".profile-btn")
      .forEach(b => b.classList.toggle("active", b === btn));
    updateProgressUI();
    Store.save();
  };
});

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => Router.go(btn.dataset.route);
});

// Default route
Router.go("home");

// Home route
Router.register("home", (view) => {
  view.innerHTML = `
    <h2>🏠 Welcome back, ${Store.activeProfile}!</h2>
    <p>Choose a mission:</p>

    <ul>
      <li>📖 Read a passage</li>
      <li>➕ Practice numbers</li>
      <li>💻 Write your first code</li>
    </ul>
  `;
});

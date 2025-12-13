Store.load();
updateProgressUI();

// Profile switching
document.querySelectorAll(".profile-btn").forEach(btn => {
  btn.onclick = () => {
    const name = btn.dataset.profile;
    Store.setActive(name);

    document.querySelectorAll(".profile-btn")
      .forEach(b => b.classList.toggle("active", b === btn));

    updateProgressUI();
    // Stay on current route but re-render to reflect profile data where needed
    const activeRoute = document.querySelector(".nav-btn.active")?.dataset.route || "home";
    Router.go(activeRoute);
  };
});

// Nav
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => Router.go(btn.dataset.route);
});

// Default landing
Router.go("home");

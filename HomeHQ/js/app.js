// App bootstrap
Store.load();
updateProgressUI();

// Home FAB
document.getElementById("homeFab").onclick = () => Router.go("home");

// Profile switching
document.querySelectorAll(".profile-btn").forEach(btn => {
  btn.onclick = () => {
    Store.setActive(btn.dataset.profile);

    document.querySelectorAll(".profile-btn")
      .forEach(b => b.classList.toggle("active", b === btn));

    updateProgressUI();
    const activeRoute = document.querySelector(".nav-btn.active")?.dataset.route || "home";
    Router.go(activeRoute);
  };
});

// Parent PIN modal
const pinOverlay = document.getElementById("pinOverlay");
const pinInput   = document.getElementById("pinInput");
const pinUnlock  = document.getElementById("pinUnlock");
const pinCancel  = document.getElementById("pinCancel");

const PARENT_PIN = "0111";

// ALWAYS hidden on load
pinOverlay.hidden = true;

function openPinModal() {
  pinInput.value = "";
  pinOverlay.hidden = false;
  setTimeout(() => pinInput.focus(), 30);
}

function closePinModal() {
  pinOverlay.hidden = true;
  pinInput.value = "";
}

// click outside card closes
pinOverlay.addEventListener("click", (e) => {
  if (e.target === pinOverlay) closePinModal();
});

pinCancel.onclick = () => closePinModal();

pinUnlock.onclick = () => {
  const entered = String(pinInput.value || "").trim();
  if (entered === PARENT_PIN) {
    closePinModal();
    // route AFTER overlay is hidden (prevents “stuck overlay”)
    requestAnimationFrame(() => Router.go("parent"));
  } else {
    showToast?.("❌ Wrong PIN", 900);
    // shake the card for feedback
    const card = pinOverlay.querySelector(".modal-card");
    card?.classList.remove("shake");
    void card?.offsetWidth;
    card?.classList.add("shake");
    pinInput.focus();
  }
};

pinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pinUnlock.click();
  if (e.key === "Escape") closePinModal();
});

// Navigation
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    const route = btn.dataset.route;

    // ONLY gate the Parent tab
    if (route === "parent") {
      openPinModal();
      return;
    }

    Router.go(route);
  };
});

// Default landing
Router.go("home");

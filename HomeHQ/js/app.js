Store.load();
updateProgressUI();

// Floating Home button always works
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

// Parent Lock modal elements
const pinOverlay = document.getElementById("pinOverlay");
const pinInput = document.getElementById("pinInput");
const pinUnlock = document.getElementById("pinUnlock");
const pinCancel = document.getElementById("pinCancel");

// Force hidden on load (belt + suspenders)
pinOverlay.hidden = true;

function openPinModal() {
  pinInput.value = "";
  pinOverlay.hidden = false;
  setTimeout(() => pinInput.focus(), 50);
}

function closePinModal() {
  pinOverlay.hidden = true;
  pinInput.value = "";
}

// Close if clicking background (not the card)
pinOverlay.addEventListener("click", (e) => {
  if (e.target === pinOverlay) closePinModal();
});

pinCancel.onclick = () => closePinModal();

pinUnlock.onclick = () => {
  const entered = String(pinInput.value || "").trim();
  if (entered === Store.getParentPin()) {
    closePinModal();
    // Route AFTER close so overlay never sticks
    requestAnimationFrame(() => Router.go("parent"));
  } else {
    alert("Wrong PIN 🙂");
    pinInput.focus();
  }
};

pinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pinUnlock.click();
});

// Navigation
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    const route = btn.dataset.route;

    // PIN gate ONLY for Parent tab
    if (route === "parent") {
      openPinModal();
      return;
    }

    Router.go(route);
  };
});

// Default landing
Router.go("home");

Store.load();
updateProgressUI();

// Floating home button: always works
document.getElementById("homeFab").onclick = () => Router.go("home");

// Profile switching
document.querySelectorAll(".profile-btn").forEach(btn => {
  btn.onclick = () => {
    const name = btn.dataset.profile;
    Store.setActive(name);

    document.querySelectorAll(".profile-btn")
      .forEach(b => b.classList.toggle("active", b === btn));

    updateProgressUI();
    const activeRoute = document.querySelector(".nav-btn.active")?.dataset.route || "home";
    Router.go(activeRoute);
  };
});

// Parent Lock helpers
const pinOverlay = document.getElementById("pinOverlay");
const pinInput = document.getElementById("pinInput");
const pinUnlock = document.getElementById("pinUnlock");
const pinCancel = document.getElementById("pinCancel");

let pendingParentNav = false;

function openPinModal() {
  pinInput.value = "";
  pinOverlay.hidden = false;
  setTimeout(() => pinInput.focus(), 50);
}

function closePinModal() {
  pinOverlay.hidden = true;
  pendingParentNav = false;
}

pinCancel.onclick = () => closePinModal();

pinUnlock.onclick = () => {
  const entered = String(pinInput.value || "").trim();
  if (entered === Store.getParentPin()) {
    closePinModal();
    Router.go("parent");
  } else {
    alert("Wrong PIN 🙂");
    pinInput.focus();
  }
};

pinInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pinUnlock.click();
});

// Nav
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.onclick = () => {
    const route = btn.dataset.route;

    if (route === "parent") {
      pendingParentNav = true;
      openPinModal();
      return;
    }

    Router.go(route);
  };
});

// Default landing
Router.go("home");

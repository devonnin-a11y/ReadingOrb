// DOM elements
const setupScreen = document.getElementById("setupScreen");
const readingScreen = document.getElementById("readingScreen");

const passageInput = document.getElementById("passageInput");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const startReadingBtn = document.getElementById("startReadingBtn");

const backBtn = document.getElementById("backBtn");
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");

const readingArea = document.getElementById("readingArea");
const readingText = document.getElementById("readingText");
const orb = document.getElementById("orb");
const beam = document.getElementById("beam");

const wordSlider = document.getElementById("wordSlider");
const currentWordDisplay = document.getElementById("currentWordDisplay");
const phonicsDisplay = document.getElementById("phonicsDisplay");

const chunkToggle = document.getElementById("chunkToggle");
const modeToggle = document.getElementById("modeToggle");
const modeLabel = document.getElementById("modeLabel");
const presetButtons = document.querySelectorAll(".preset-btn");

const voiceSelect = document.getElementById("voiceSelect");

const rewardBanner = document.getElementById("rewardBanner");
const streakChip = document.getElementById("streakChip");
const levelChip = document.getElementById("levelChip");
const levelLabelLeft = document.getElementById("levelLabelLeft");
const levelLabelRight = document.getElementById("levelLabelRight");
const levelbarFill = document.getElementById("levelbarFill");

const rewardBtn = document.getElementById("rewardBtn");
const profileButtons = document.querySelectorAll(".profile-btn");

const characterImage = document.getElementById("characterImage");

const fxLayer = document.getElementById("fxLayer");

const modalOverlay = document.getElementById("modalOverlay");
const modalYes = document.getElementById("modalYes");
const modalNo = document.getElementById("modalNo");

// App state
let words = [];
let currentIndex = 0;
let isPlaying = false;
let currentUtterance = null;

let availableVoices = [];
let selectedVoice = null;

const STORAGE_KEY = "orbReaderProfiles_v2";

// Per-profile state stored
let profiles = {
  Vhon: { stars: 0, streak: 0, lastStarISO: null },
  Vio:  { stars: 0, streak: 0, lastStarISO: null }
};
let currentProfile = "Vhon";

const CHARACTER_IMAGES = {
  Vhon: "img/vhon.png",
  Vio: "img/vio.png"
};

// Level system
const STARS_PER_LEVEL = 10;

// Orb smoothing
let orbAnimId = null;
let orbX = 0, orbY = 0;         // current
let targetX = 0, targetY = 0;   // target
const ORB_EASE = 0.18;          // higher = snappier

// ---------- Utilities ----------
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function todayISODateLocal() {
  const d = new Date();
  // local date string YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function yesterdayISODateLocal() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function showScreen(name) {
  if (name === "setup") {
    setupScreen.classList.add("active");
    readingScreen.classList.remove("active");
  } else {
    setupScreen.classList.remove("active");
    readingScreen.classList.add("active");
  }
}

function pop(el) {
  if (!el) return;
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

// ---------- Profiles / storage ----------
function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.profiles) profiles = parsed.profiles;
      if (parsed.currentProfile) currentProfile = parsed.currentProfile;
    }
  } catch (e) {
    console.warn("Could not load profiles", e);
  }

  // Ensure shape
  if (!profiles.Vhon) profiles.Vhon = { stars: 0, streak: 0, lastStarISO: null };
  if (!profiles.Vio) profiles.Vio = { stars: 0, streak: 0, lastStarISO: null };

  updateProfileButtons();
  updateCharacterImage();
  updateProgressUI();
}

function saveProfiles() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentProfile, profiles }));
  } catch (e) {
    console.warn("Could not save profiles", e);
  }
}

function updateProfileButtons() {
  profileButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.profile === currentProfile);
  });
}

function updateCharacterImage() {
  if (!characterImage) return;
  const src = CHARACTER_IMAGES[currentProfile] || CHARACTER_IMAGES.Vhon;
  characterImage.src = src;
  characterImage.alt = `${currentProfile} character`;
}

function getP() { return profiles[currentProfile]; }

function computeLevel(stars) {
  const level = Math.floor(stars / STARS_PER_LEVEL) + 1;
  const intoLevel = stars % STARS_PER_LEVEL;
  return { level, intoLevel };
}

function updateProgressUI() {
  const p = getP();
  const { level, intoLevel } = computeLevel(p.stars);

  if (rewardBanner) rewardBanner.textContent = `⭐ Stars today: ${p.stars}`;
  if (streakChip) streakChip.textContent = `🔥 Streak: ${p.streak}`;
  if (levelChip) levelChip.textContent = `⚡ Level ${level}`;

  if (levelLabelLeft) levelLabelLeft.textContent = `Level ${level}`;
  if (levelLabelRight) levelLabelRight.textContent = `${intoLevel} / ${STARS_PER_LEVEL}`;

  if (levelbarFill) {
    const pct = (intoLevel / STARS_PER_LEVEL) * 100;
    levelbarFill.style.width = `${pct}%`;
  }

  pop(rewardBanner);
}

// ---------- Reward burst (confetti) ----------
function rand(min, max) { return Math.random() * (max - min) + min; }

function spawnMorphBurst() {
  if (!fxLayer) return;

  const colors = [
    "rgba(99,179,255,0.95)",   // blue
    "rgba(255,201,75,0.95)",   // yellow bolt
    "rgba(255,75,106,0.95)",   // red
    "rgba(255,255,255,0.9)"    // white sparkle
  ];

  const cx = Math.round(window.innerWidth * 0.5);
  const cy = Math.round(window.innerHeight * 0.18);

  const count = 28;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "fx";
    el.style.background = colors[i % colors.length];

    const x0 = `${cx}px`;
    const y0 = `${cy}px`;

    const dx = rand(-180, 180);
    const dy = rand(-20, 220);

    const x1 = `${cx + dx}px`;
    const y1 = `${cy + dy}px`;

    const r = `${rand(-540, 540)}deg`;

    el.style.setProperty("--x0", x0);
    el.style.setProperty("--y0", y0);
    el.style.setProperty("--x1", x1);
    el.style.setProperty("--y1", y1);
    el.style.setProperty("--r", r);

    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;

    // some are "bolts" (thin rectangles)
    if (Math.random() < 0.35) {
      el.style.width = "6px";
      el.style.height = "18px";
      el.style.borderRadius = "2px";
    }

    fxLayer.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
}

// ---------- Streak rules ----------
function applyStreakOnStar(p) {
  const today = todayISODateLocal();
  const yesterday = yesterdayISODateLocal();
  const last = p.lastStarISO;

  if (!last) {
    p.streak = 1;
  } else if (last === today) {
    // same-day star: streak unchanged
  } else if (last === yesterday) {
    p.streak += 1;
  } else {
    p.streak = 1;
  }

  p.lastStarISO = today;
}

// Add star with effects + level-up callout
function addStar({ withBurst = true } = {}) {
  const p = getP();
  const before = computeLevel(p.stars).level;

  p.stars += 1;
  applyStreakOnStar(p);

  const after = computeLevel(p.stars).level;

  updateProgressUI();
  saveProfiles();

  if (withBurst) spawnMorphBurst();

  // Level-up pop
  if (after > before) {
    pop(levelChip);
    pop(rewardBanner);
    // Extra burst on level-up
    spawnMorphBurst();
  }
}

// ---------- Word rendering ----------
function renderWords() {
  readingText.innerHTML = "";
  words.forEach((word, idx) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word");
    span.dataset.index = String(idx);
    span.addEventListener("click", () => {
      stopSpeech();
      setCurrentIndex(idx);
      speakPhonicsForIndex(idx);
    });
    readingText.appendChild(span);
    readingText.appendChild(document.createTextNode(" "));
  });

  if (!words.length) {
    wordSlider.max = 0;
    setCurrentIndex(0);
  } else {
    wordSlider.max = words.length - 1;
    setCurrentIndex(0);
  }
}

// Chunkify for “syllable-ish” groups
function chunkify(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return [word];

  const vowels = "aeiouy";
  const chunks = [];
  let cur = clean[0];

  for (let i = 1; i < clean.length; i++) {
    const prevV = vowels.includes(clean[i - 1]);
    const curV = vowels.includes(clean[i]);
    if (prevV !== curV) {
      chunks.push(cur);
      cur = clean[i];
    } else {
      cur += clean[i];
    }
  }
  chunks.push(cur);
  return chunks;
}

function setCurrentIndex(index) {
  if (!words.length) {
    currentIndex = 0;
    currentWordDisplay.textContent = "–";
    phonicsDisplay.textContent = "–";
    return;
  }

  index = clamp(index, 0, words.length - 1);
  currentIndex = index;
  wordSlider.value = index;

  const spans = readingText.querySelectorAll(".word");
  spans.forEach((s) => s.classList.remove("active"));
  const active = spans[index];
  if (active) {
    active.classList.add("active");
    setOrbTargetFromSpan(active);
  }

  const word = words[index];
  currentWordDisplay.textContent = word;

  phonicsDisplay.innerHTML = "";
  if (chunkToggle.checked) {
    const chunks = chunkify(word);
    chunks.forEach((c, i) => {
      const el = document.createElement("span");
      el.textContent = c;
      el.className = "chunk" + (i % 2 === 1 ? " chunk-alt" : "");
      phonicsDisplay.appendChild(el);
      if (i < chunks.length - 1) {
        const sep = document.createElement("span");
        sep.textContent = "/";
        sep.className = "chunk-sep";
        phonicsDisplay.appendChild(sep);
      }
    });
  } else {
    word.split("").forEach((ch, i) => {
      const el = document.createElement("span");
      el.textContent = ch;
      el.className = "letter-pill";
      phonicsDisplay.appendChild(el);
      if (i < word.length - 1) phonicsDisplay.appendChild(document.createTextNode(" "));
    });
  }
}

// ---------- Orb smooth tracking + beam ----------
function readingTextRect() {
  return readingText.getBoundingClientRect();
}

function setOrbTargetFromSpan(span) {
  const area = readingTextRect();
  const r = span.getBoundingClientRect();

  // Target point slightly under the word
  targetX = (r.left + r.width / 2) - area.left;
  targetY = (r.bottom) - area.top + 12;

  // Turn beam on when we have a real target
  if (beam) beam.classList.add("on");
}

function ensureOrbAnimator() {
  if (orbAnimId) return;
  // initialize orb at current target for first time
  orbX = targetX || 0;
  orbY = targetY || 0;

  const tick = () => {
    // Ease orb position
    orbX += (targetX - orbX) * ORB_EASE;
    orbY += (targetY - orbY) * ORB_EASE;

    // Place orb (note: orb CSS already includes translate(-50%, -50%) but we control via left/top)
    // We'll set left/top in pixels within readingText coordinate system by using transform translate(x,y).
    orb.style.transform = `translate(${orbX}px, ${orbY}px)`;

    // Update beam: from orb to current active word position
    updateBeam();

    orbAnimId = requestAnimationFrame(tick);
  };

  orbAnimId = requestAnimationFrame(tick);
}

function updateBeam() {
  if (!beam) return;

  // Beam starts near orb center
  const x0 = orbX;
  const y0 = orbY - 10; // slightly above orb

  // Find active word center
  const active = readingText.querySelector(".word.active");
  if (!active) {
    beam.classList.remove("on");
    return;
  }
  const area = readingTextRect();
  const r = active.getBoundingClientRect();
  const x1 = (r.left + r.width / 2) - area.left;
  const y1 = (r.top + r.height / 2) - area.top;

  const dx = x1 - x0;
  const dy = y1 - y0;

  const dist = Math.max(6, Math.sqrt(dx * dx + dy * dy));
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  beam.style.left = `${x0}px`;
  beam.style.top = `${y0}px`;
  beam.style.width = `${dist}px`;
  beam.style.transform = `rotate(${angle}deg)`;

  beam.classList.add("on");
}

// ---------- Character speaking animation ----------
function startCharacterSpeaking() {
  if (characterImage) characterImage.classList.add("speaking");
}
function stopCharacterSpeaking() {
  if (characterImage) characterImage.classList.remove("speaking");
}

// ---------- Speech ----------
function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  isPlaying = false;
  currentUtterance = null;
  stopCharacterSpeaking();
}

function speakWord(index) {
  if (!("speechSynthesis" in window)) return;
  if (index < 0 || index >= words.length) return;

  const word = words[index];
  const u = new SpeechSynthesisUtterance(word);
  u.rate = parseFloat(speedSlider.value);
  if (selectedVoice) u.voice = selectedVoice;

  startCharacterSpeaking();

  u.onend = () => {
    if (!isPlaying) {
      stopCharacterSpeaking();
      return;
    }
    const next = currentIndex + 1;
    if (next < words.length) {
      setCurrentIndex(next);
      speakWord(next);
    } else {
      isPlaying = false;
      stopCharacterSpeaking();
      // Auto-star prompt after finishing playthrough
      openAutoStarPrompt();
    }
  };

  currentUtterance = u;
  window.speechSynthesis.speak(u);
}

function playSequence(parts) {
  if (!("speechSynthesis" in window)) return;
  if (!parts.length) return;

  const [first, ...rest] = parts;
  const u = new SpeechSynthesisUtterance(first);
  u.rate = parseFloat(speedSlider.value);
  if (selectedVoice) u.voice = selectedVoice;

  startCharacterSpeaking();

  u.onend = () => {
    if (!rest.length) {
      stopCharacterSpeaking();
      return;
    }
    playSequence(rest);
  };

  currentUtterance = u;
  window.speechSynthesis.speak(u);
}

function speakPhonicsForIndex(index) {
  if (!("speechSynthesis" in window)) return;
  if (index < 0 || index >= words.length) return;

  const word = words[index];

  let sequence = [];
  if (chunkToggle.checked) {
    const chunks = chunkify(word);
    sequence = [...chunks, word];
  } else {
    const letters = word.split("");
    sequence = [letters.join(" "), word];
  }

  playSequence(sequence);
}

// ---------- Voice selection ----------
function populateVoices() {
  if (!("speechSynthesis" in window)) return;

  availableVoices = window.speechSynthesis.getVoices();
  if (!availableVoices.length || !voiceSelect) return;

  voiceSelect.innerHTML = '<option value="">Auto (device default)</option>';

  const en = availableVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
  en.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = v.name;
    voiceSelect.appendChild(opt);
  });

  // Prefer nicer voices if available
  const preferred = /(Google US English|Microsoft.*Aria|Jenny|Neural)/i;
  selectedVoice = en.find(v => preferred.test(v.name)) || en[0] || null;
  voiceSelect.value = selectedVoice ? selectedVoice.name : "";
}

// ---------- Auto-star prompt ----------
function openAutoStarPrompt() {
  if (!modalOverlay) return;
  modalOverlay.hidden = false;
}

function closeAutoStarPrompt() {
  if (!modalOverlay) return;
  modalOverlay.hidden = true;
}

// ---------- Events ----------
speedSlider.addEventListener("input", () => {
  speedValue.textContent = `${speedSlider.value}x`;
});

modeToggle.addEventListener("click", () => {
  const kidMode = !document.body.classList.contains("kid-mode");
  document.body.classList.toggle("kid-mode", kidMode);
  modeLabel.textContent = kidMode ? "Kid mode" : "Parent mode";
});

profileButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const p = btn.dataset.profile;
    if (!p || p === currentProfile) return;
    currentProfile = p;
    updateProfileButtons();
    updateCharacterImage();
    updateProgressUI();
    saveProfiles();
  });
});

presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const passage = btn.dataset.passage || "";
    passageInput.value = passage;
    passageInput.focus();
  });
});

voiceSelect.addEventListener("change", () => {
  const name = voiceSelect.value;
  selectedVoice = availableVoices.find(v => v.name === name) || null;
});

startReadingBtn.addEventListener("click", () => {
  const text = (passageInput.value || "").trim();
  if (!text) {
    alert("Type a sentence or tap a preset first 😊");
    return;
  }
  words = text.split(/\s+/);
  renderWords();
  showScreen("reading");

  // Ensure orb animator running
  ensureOrbAnimator();
});

backBtn.addEventListener("click", () => {
  stopSpeech();
  showScreen("setup");
});

playBtn.addEventListener("click", () => {
  if (!words.length) return;
  stopSpeech();
  isPlaying = true;
  const startFrom = parseInt(wordSlider.value, 10) || 0;
  setCurrentIndex(startFrom);
  speakWord(startFrom);
});

stopBtn.addEventListener("click", () => {
  stopSpeech();
  setCurrentIndex(0);
});

wordSlider.addEventListener("input", () => {
  const index = parseInt(wordSlider.value, 10) || 0;
  stopSpeech();
  setCurrentIndex(index);
  speakPhonicsForIndex(index);
});

rewardBtn.addEventListener("click", () => {
  addStar({ withBurst: true });
  pop(rewardBtn);
});

modalYes.addEventListener("click", () => {
  addStar({ withBurst: true });
  closeAutoStarPrompt();
});

modalNo.addEventListener("click", () => {
  closeAutoStarPrompt();
});

// ---------- Init ----------
window.addEventListener("load", () => {
  loadProfiles();

  // Voices
  if ("speechSynthesis" in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Initialize orb target once text exists (after render)
  // (orb animator starts when reading starts)
});

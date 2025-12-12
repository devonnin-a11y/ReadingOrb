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

const readingText = document.getElementById("readingText");
const orb = document.getElementById("orb");

const wordSlider = document.getElementById("wordSlider");
const currentWordDisplay = document.getElementById("currentWordDisplay");
const phonicsDisplay = document.getElementById("phonicsDisplay");

const chunkToggle = document.getElementById("chunkToggle");
const modeToggle = document.getElementById("modeToggle");
const modeLabel = document.getElementById("modeLabel");
const presetButtons = document.querySelectorAll(".preset-btn");
const voiceSelect = document.getElementById("voiceSelect");
const rewardBanner = document.getElementById("rewardBanner");
const rewardBtn = document.getElementById("rewardBtn");
const profileButtons = document.querySelectorAll(".profile-btn");
const characterImage = document.getElementById("characterImage");


// State
let words = [];
let currentIndex = 0;
let isPlaying = false;      // for auto-play (Play button)
let currentUtterance = null;

let availableVoices = [];
let selectedVoice = null;

const STORAGE_KEY = "orbReaderProfiles_v1";

let profiles = {
  Vhon: { stars: 0 },
  Vio: { stars: 0 }
};
let currentProfile = "Vhon";

// ---- Profile & storage helpers ----

function loadProfiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.profiles) profiles = parsed.profiles;
      if (parsed.currentProfile) currentProfile = parsed.currentProfile;
    }
  } catch (e) {
    console.warn("Could not load profiles", e);
  }

  // Ensure both profiles exist
  if (!profiles.Vhon) profiles.Vhon = { stars: 0 };
  if (!profiles.Vio) profiles.Vio = { stars: 0 };

  updateProfileButtons();
  updateRewardBanner();
}

function saveProfiles() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentProfile,
        profiles
      })
    );
  } catch (e) {
    console.warn("Could not save profiles", e);
  }
}

function updateProfileButtons() {
  profileButtons.forEach((btn) => {
    const p = btn.dataset.profile;
    btn.classList.toggle("active", p === currentProfile);
  });
}

function getCurrentStars() {
  return profiles[currentProfile]?.stars ?? 0;
}

function setCurrentStars(value) {
  if (!profiles[currentProfile]) profiles[currentProfile] = { stars: 0 };
  profiles[currentProfile].stars = value;
}

// Update banner text + animation
function updateRewardBanner() {
  if (!rewardBanner) return;
  const stars = getCurrentStars();
  rewardBanner.textContent = `⭐ Stars today: ${stars}`;
  rewardBanner.classList.remove("pop");
  void rewardBanner.offsetWidth;
  rewardBanner.classList.add("pop");
}

// ---- Screen switch ----

function showScreen(screenName) {
  if (screenName === "setup") {
    setupScreen.classList.add("active");
    readingScreen.classList.remove("active");
  } else {
    setupScreen.classList.remove("active");
    readingScreen.classList.add("active");
  }
}

// ---- Word rendering & highlighting ----

function renderWords() {
  readingText.innerHTML = "";
  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("word");
    span.dataset.index = index;
    span.addEventListener("click", () => {
      stopSpeech();
      setCurrentIndex(index);
      // When a word is tapped, also sound it out
      speakPhonicsForIndex(index);
    });
    readingText.appendChild(span);
    readingText.appendChild(document.createTextNode(" "));
  });

  if (words.length === 0) {
    wordSlider.max = 0;
    setCurrentIndex(0);
  } else {
    wordSlider.max = words.length - 1;
    setCurrentIndex(0);
  }
}

// Rough chunking for "syllable-ish" groups
function chunkify(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return [word];

  const vowels = "aeiouy";
  const chunks = [];
  let current = clean[0];

  for (let i = 1; i < clean.length; i++) {
    const prevIsVowel = vowels.includes(clean[i - 1]);
    const currIsVowel = vowels.includes(clean[i]);

    if (prevIsVowel !== currIsVowel) {
      chunks.push(current);
      current = clean[i];
    } else {
      current += clean[i];
    }
  }
  chunks.push(current);

  return chunks;
}

// Highlight, move orb, build phonics UI
function setCurrentIndex(index) {
  if (words.length === 0) {
    currentIndex = 0;
    currentWordDisplay.textContent = "–";
    phonicsDisplay.textContent = "–";
    return;
  }

  if (index < 0) index = 0;
  if (index >= words.length) index = words.length - 1;

  currentIndex = index;
  wordSlider.value = index;

  const wordSpans = readingText.querySelectorAll(".word");
  wordSpans.forEach((span) => span.classList.remove("active"));
  const activeSpan = wordSpans[index];
  if (activeSpan) {
    activeSpan.classList.add("active");
    moveOrbToSpan(activeSpan);
  }

  const word = words[index];
  currentWordDisplay.textContent = word;

  // Clear and rebuild phonics display
  phonicsDisplay.innerHTML = "";

  if (chunkToggle && chunkToggle.checked) {
    const chunks = chunkify(word);
    chunks.forEach((chunk, idx) => {
      const span = document.createElement("span");
      span.textContent = chunk;
      span.classList.add("chunk");
      if (idx % 2 === 1) span.classList.add("chunk-alt");
      phonicsDisplay.appendChild(span);

      if (idx < chunks.length - 1) {
        const sep = document.createElement("span");
        sep.textContent = "/";
        sep.classList.add("chunk-sep");
        phonicsDisplay.appendChild(sep);
      }
    });
  } else {
    const letters = word.split("");
    letters.forEach((letter, idx) => {
      const span = document.createElement("span");
      span.textContent = letter;
      span.classList.add("letter-pill");
      phonicsDisplay.appendChild(span);

      if (idx < letters.length - 1) {
        phonicsDisplay.appendChild(document.createTextNode(" "));
      }
    });
  }
}

// Orb under the active word
function moveOrbToSpan(span) {
  const areaRect = readingText.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();

  const x = spanRect.left + spanRect.width / 2 - areaRect.left;
  const y = spanRect.bottom - areaRect.top + 10;

  orb.style.transform = `translate(${x}px, ${y}px)`;
}

// ---- Speech helpers ----

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isPlaying = false;
  currentUtterance = null;
}

// Auto-play one word at a time (Play button)
function speakWord(index) {
  if (!("speechSynthesis" in window)) return;
  if (index < 0 || index >= words.length) return;

  const word = words[index];
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = parseFloat(speedSlider.value);
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.onend = () => {
    if (!isPlaying) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex < words.length) {
      setCurrentIndex(nextIndex);
      speakWord(nextIndex);
    } else {
      isPlaying = false;
    }
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Play a small sequence: e.g. "c a t" then "cat" or chunks then whole word
function playSequence(parts) {
  if (!("speechSynthesis" in window)) return;
  if (!parts.length) return;

  const [first, ...rest] = parts;
  const utter = new SpeechSynthesisUtterance(first);
  utter.rate = parseFloat(speedSlider.value);
  if (selectedVoice) utter.voice = selectedVoice;

  utter.onend = () => {
    if (!rest.length) return;
    playSequence(rest);
  };

  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

// Sound-out for slider/word tap
function speakPhonicsForIndex(index) {
  if (!("speechSynthesis" in window)) return;
  if (index < 0 || index >= words.length) return;

  const word = words[index];
  let sequence = [];

  if (chunkToggle && chunkToggle.checked) {
    const chunks = chunkify(word);
    sequence = [...chunks, word]; // chunks then whole word
  } else {
    const letters = word.split("");
    const letterString = letters.join(" "); // "c a t" → letter names
    sequence = [letterString, word];
  }

  playSequence(sequence);
}

// ---- Voice loading / selection ----

function populateVoices() {
  if (!("speechSynthesis" in window)) return;

  availableVoices = window.speechSynthesis.getVoices();
  if (!availableVoices.length || !voiceSelect) return;

  voiceSelect.innerHTML = '<option value="">Auto (device default)</option>';

  const englishVoices = availableVoices.filter(
    (v) => v.lang && v.lang.toLowerCase().startsWith("en")
  );

  englishVoices.forEach((voice) => {
    const opt = document.createElement("option");
    opt.value = voice.name;
    opt.textContent = voice.name;
    voiceSelect.appendChild(opt);
  });

  const preferredPatterns = /(Google US English|Microsoft.*Aria|Jenny|Neural)/i;
  selectedVoice =
    englishVoices.find((v) => preferredPatterns.test(v.name)) ||
    englishVoices[0] ||
    null;

  if (selectedVoice) {
    voiceSelect.value = selectedVoice.name;
  } else {
    voiceSelect.value = "";
  }
}

// ---- Events ----

speedSlider.addEventListener("input", () => {
  speedValue.textContent = `${speedSlider.value}x`;
});

// Mode toggle
modeToggle.addEventListener("click", () => {
  const kidMode = !document.body.classList.contains("kid-mode");
  document.body.classList.toggle("kid-mode", kidMode);
  modeLabel.textContent = kidMode ? "Kid mode" : "Parent mode";
});

// Profile switching
profileButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const profile = btn.dataset.profile;
    if (!profile || profile === currentProfile) return;
    currentProfile = profile;
    updateProfileButtons();
    updateRewardBanner();
    saveProfiles();
  });
});

// Preset passages
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const passage = btn.dataset.passage || "";
    passageInput.value = passage;
    passageInput.focus();
  });
});

// Voice selection
if (voiceSelect) {
  voiceSelect.addEventListener("change", () => {
    const selectedName = voiceSelect.value;
    selectedVoice =
      availableVoices.find((v) => v.name === selectedName) || null;
  });
}

startReadingBtn.addEventListener("click", () => {
  const text = passageInput.value.trim();
  if (!text) {
    alert("Type a sentence or tap a preset first 😊");
    return;
  }

  words = text.split(/\s+/);
  renderWords();
  showScreen("reading");
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

// Slider: move orb, highlight word, AND sound it out
wordSlider.addEventListener("input", () => {
  const index = parseInt(wordSlider.value, 10) || 0;
  stopSpeech();
  setCurrentIndex(index);
  speakPhonicsForIndex(index);
});

// Reward button per profile
if (rewardBtn) {
  rewardBtn.addEventListener("click", () => {
    const stars = getCurrentStars() + 1;
    setCurrentStars(stars);
    updateRewardBanner();
    saveProfiles();

    rewardBtn.classList.remove("pop");
    void rewardBtn.offsetWidth;
    rewardBtn.classList.add("pop");
  });
}

// Init
window.addEventListener("load", () => {
  setTimeout(() => {
    moveOrbToSpan(readingText.querySelector(".word") || readingText);
  }, 300);

  // Profiles
  loadProfiles();

  // Voices
  if ("speechSynthesis" in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
});

// Grab elements
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

// New: chunk mode + mode toggle + presets
const chunkToggle = document.getElementById("chunkToggle");
const modeToggle = document.getElementById("modeToggle");
const modeLabel = document.getElementById("modeLabel");
const presetButtons = document.querySelectorAll(".preset-btn");

// State
let words = [];
let currentIndex = 0;
let isPlaying = false;
let currentUtterance = null;
let kidMode = false;

// Utility: switch screens
function showScreen(screenName) {
  if (screenName === "setup") {
    setupScreen.classList.add("active");
    readingScreen.classList.remove("active");
  } else {
    setupScreen.classList.remove("active");
    readingScreen.classList.add("active");
  }
}

// Utility: build word spans
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

// Utility: rough chunking for "syllable-ish" groups
function chunkify(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return [word];

  const vowels = "aeiouy";
  const chunks = [];
  let current = clean[0];

  for (let i = 1; i < clean.length; i++) {
    const prevIsVowel = vowels.includes(clean[i - 1]);
    const currIsVowel = vowels.includes(clean[i]);

    // Split when switching between vowel/consonant
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

// Utility: update highlight, orb position, phonics text
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

  if (chunkToggle && chunkToggle.checked) {
    // Chunk mode – show groups like "ca / t" or "sun / set"
    const chunks = chunkify(word);
    phonicsDisplay.textContent = chunks.join(" / ");
  } else {
    // Basic phonics: letters separated by dashes
    phonicsDisplay.textContent = word.split("").join(" - ");
  }
}

// Utility: move orb under the active word
function moveOrbToSpan(span) {
  const areaRect = readingText.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();

  const x = spanRect.left + spanRect.width / 2 - areaRect.left;
  const y = spanRect.bottom - areaRect.top + 8; // a bit under the word

  orb.style.transform = `translate(${x}px, ${y}px)`;
}

// Speech helpers
function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isPlaying = false;
  currentUtterance = null;
}

function speakWord(index) {
  if (!("speechSynthesis" in window)) return;
  if (index < 0 || index >= words.length) return;

  const word = words[index];
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = parseFloat(speedSlider.value);
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

// Events

speedSlider.addEventListener("input", () => {
  speedValue.textContent = `${speedSlider.value}x`;
});

// Parent/Kid mode toggle
modeToggle.addEventListener("click", () => {
  kidMode = !kidMode;
  document.body.classList.toggle("kid-mode", kidMode);
  modeLabel.textContent = kidMode ? "Kid mode" : "Parent mode";
});

// Preset passage buttons
presetButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const passage = btn.dataset.passage || "";
    passageInput.value = passage;
    passageInput.focus();
  });
});

startReadingBtn.addEventListener("click", () => {
  const text = passageInput.value.trim();
  if (!text) {
    alert("Type a sentence or tap a preset first 😊");
    return;
  }

  // Split words roughly by whitespace
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
  // Start from the slider position
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
});

// Init orb position when layout is ready
window.addEventListener("load", () => {
  setTimeout(() => {
    moveOrbToSpan(readingText.querySelector(".word") || readingText);
  }, 300);
});

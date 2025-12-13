const Store = (() => {
  const KEY = "HomeHQ_v2";
  const STARS_PER_LEVEL = 10;

  const defaultState = {
    activeProfile: "Vhon",
    parentPin: "1234",
    profiles: {
      Vhon: { stars: 0, streak: 0, lastStarISO: null, notes: "", weekly: {}, badges: [] },
      Vio:  { stars: 0, streak: 0, lastStarISO: null, notes: "", weekly: {}, badges: [] }
    }
  };

  let state = structuredClone(defaultState);

  const isoToday = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const isoYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = { ...state, ...JSON.parse(raw) };
    } catch {}

    if (!state.profiles?.Vhon) state.profiles.Vhon = structuredClone(defaultState.profiles.Vhon);
    if (!state.profiles?.Vio)  state.profiles.Vio  = structuredClone(defaultState.profiles.Vio);

    // ensure badges exist
    state.profiles.Vhon.badges ||= [];
    state.profiles.Vio.badges  ||= [];

    // ensure PIN exists
    if (!state.parentPin) state.parentPin = "1234";
  };

  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  const setActive = (name) => { state.activeProfile = name; save(); };
  const current = () => state.profiles[state.activeProfile];

  const levelInfo = (stars) => {
    const level = Math.floor(stars / STARS_PER_LEVEL) + 1;
    const into = stars % STARS_PER_LEVEL;
    return { level, into, per: STARS_PER_LEVEL };
  };

  const trackWeekly = (profile, deltaStars) => {
    const today = isoToday();
    profile.weekly ||= {};
    profile.weekly[today] = (profile.weekly[today] || 0) + deltaStars;
  };

  const applyStreak = (profile) => {
    const today = isoToday();
    const yday = isoYesterday();
    const last = profile.lastStarISO;

    if (!last) profile.streak = 1;
    else if (last === today) {/* no change */}
    else if (last === yday) profile.streak += 1;
    else profile.streak = 1;

    profile.lastStarISO = today;
  };

  const addStars = (n = 1) => {
    const p = current();
    p.stars += n;
    applyStreak(p);
    trackWeekly(p, n);
    save();
  };

  const setNotes = (text) => { current().notes = text || ""; save(); };
  const resetProfile = (name) => { state.profiles[name] = structuredClone(defaultState.profiles[name]); save(); };

  const resetStreaks = () => {
    Object.values(state.profiles).forEach(p => { p.streak = 0; p.lastStarISO = null; });
    save();
  };

  const setParentPin = (pin) => { state.parentPin = String(pin || "").trim(); save(); };
  const getParentPin = () => state.parentPin;

  const getState = () => state;

  return {
    load, save,
    setActive, current, getState,
    addStars, levelInfo,
    setNotes, resetProfile, resetStreaks,
    setParentPin, getParentPin
  };
})();

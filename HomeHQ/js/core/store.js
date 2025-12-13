const Store = {
  activeProfile: "Vhon",
  profiles: {
    Vhon: { stars: 0, streak: 0, level: 1 },
    Vio:  { stars: 0, streak: 0, level: 1 }
  },

  load() {
    const saved = localStorage.getItem("homeHQ");
    if (saved) Object.assign(this, JSON.parse(saved));
  },

  save() {
    localStorage.setItem("homeHQ", JSON.stringify({
      activeProfile: this.activeProfile,
      profiles: this.profiles
    }));
  },

  current() {
    return this.profiles[this.activeProfile];
  },

  addStar() {
    const p = this.current();
    p.stars++;
    p.level = Math.floor(p.stars / 10) + 1;
    p.streak++;
    this.save();
  }
};

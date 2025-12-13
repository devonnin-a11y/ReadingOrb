const Router = {
  routes: {},
  view: document.getElementById("view"),

  register(name, renderFn) {
    this.routes[name] = renderFn;
  },

  go(route) {
    document.querySelectorAll(".nav-btn")
      .forEach(b => b.classList.toggle("active", b.dataset.route === route));

    this.view.innerHTML = "";
    this.routes[route]?.(this.view);
  }
};

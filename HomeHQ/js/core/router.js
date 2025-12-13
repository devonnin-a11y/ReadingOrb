const Router = (() => {
  const routes = {};
  const view = document.getElementById("view");

  const register = (name, render) => { routes[name] = render; };

  const go = (route) => {
    document.querySelectorAll(".nav-btn")
      .forEach(b => b.classList.toggle("active", b.dataset.route === route));

    view.innerHTML = "";
    const fn = routes[route];
    if (!fn) {
      view.innerHTML = `<div class="card"><div class="big">Missing route:</div> <div class="muted">${route}</div></div>`;
      return;
    }
    fn(view);
  };

  return { register, go };
})();

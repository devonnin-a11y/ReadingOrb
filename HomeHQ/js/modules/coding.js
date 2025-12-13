Router.register("coding", (view) => {
  view.innerHTML = `
    <h2>💻 Coding</h2>
    <p>Tell the character what to do.</p>

    <button id="runCode">▶ Run Program</button>

    <pre class="code-block">
say("Hi!");
move(10);
jump();
    </pre>
  `;

  document.getElementById("runCode").onclick = () => {
    Store.addStar();
    updateProgressUI();
    alert("🎉 Great coding!");
  };
});

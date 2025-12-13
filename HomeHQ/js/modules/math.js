Router.register("math", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">➕ Math</div>
      <div class="muted">Pick the right level for the kid.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" id="backHome" type="button">🏠 Back to Home</button>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="big">3-year-old: Count & Match</div>
        <div class="muted">Tap the correct number of dots.</div>
        <div id="dots" style="font-size:1.6rem; margin:10px 0;">● ● ●</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn primary" data-ans="2" type="button">2</button>
          <button class="btn primary" data-ans="3" type="button">3</button>
          <button class="btn primary" data-ans="4" type="button">4</button>
        </div>
      </div>

      <div class="card">
        <div class="big">5-year-old: Add & Subtract</div>
        <div class="muted">Answer the problem.</div>
        <div id="problem" class="big" style="margin:12px 0;">2 + 3 = ?</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input id="answer" type="number" placeholder="Type answer" style="flex:1; padding:10px; border-radius:12px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff;">
          <button id="check" class="btn primary" type="button">Check</button>
        </div>
      </div>
    </div>

    <div class="card">
      <button id="newQ" class="btn ghost" type="button">🔁 New Questions</button>
    </div>
  `;

  view.querySelector("#backHome").onclick = () => Router.go("home");

  let dotCount = 3;
  const dotsEl = view.querySelector("#dots");
  const setDots = () => { dotsEl.textContent = Array(dotCount).fill("●").join(" "); };
  setDots();

  view.querySelectorAll("[data-ans]").forEach(btn => {
    btn.onclick = () => {
      const ans = Number(btn.dataset.ans);
      if (ans === dotCount) {
        awardStar("Math counting");
        alert("✅ Nice counting! +⭐");
      } else alert("Try again 🙂");
    };
  });

  const problemEl = view.querySelector("#problem");
  const answerEl = view.querySelector("#answer");
  let a=2,b=3,op="+";

  const newProblem = () => {
    a = Math.floor(Math.random()*9)+1;
    b = Math.floor(Math.random()*9)+1;
    op = Math.random() < 0.5 ? "+" : "−";
    if (op === "−" && b > a) [a,b] = [b,a];
    problemEl.textContent = `${a} ${op} ${b} = ?`;
    answerEl.value = "";
  };
  newProblem();

  view.querySelector("#check").onclick = () => {
    const user = Number(answerEl.value);
    const correct = op === "+" ? (a+b) : (a-b);
    if (user === correct) {
      awardStar("Math correct");
      alert("🎉 Correct! +⭐");
      newProblem();
    } else alert("Close! Try again 🙂");
  };

  view.querySelector("#newQ").onclick = () => {
    dotCount = Math.floor(Math.random()*5)+1;
    setDots();
    newProblem();
  };
});

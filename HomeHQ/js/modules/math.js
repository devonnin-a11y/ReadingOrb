Router.register("math", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">➕ Math</div>
      <div class="muted">Clear visuals for 3yo + challenges for 5yo.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" id="backHome" type="button">🏠 Back</button>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="big">3-year-old: Count the Items</div>
        <div class="muted">Count the <strong id="thingName">apples</strong> then tap the number.</div>

        <div id="items"
          style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center; align-items:center;
          padding:10px; border-radius:14px; background:rgba(0,0,0,.18); border:1px solid rgba(166,220,255,.14); margin:10px 0; font-size:2.2rem;">
        </div>

        <div id="choices" style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;"></div>
      </div>

      <div class="card">
        <div class="big">5-year-old: Add & Subtract</div>
        <div class="muted">Answer the problem.</div>
        <div id="problem" class="big" style="margin:12px 0;">2 + 3 = ?</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <input id="answer" type="number" placeholder="Type answer"
            style="flex:1; padding:10px; border-radius:12px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff;">
          <button id="check" class="btn primary" type="button">Check</button>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
          <button id="awardStar" class="btn ghost" type="button">⭐ Award Star</button>
        </div>
      </div>
    </div>

    <div class="card">
      <button id="newQ" class="btn ghost" type="button">🔁 New Questions</button>
    </div>
  `;

  view.querySelector("#backHome").onclick = () => Router.go("home");
  view.querySelector("#awardStar").onclick = () => awardStar("Math award");

  // 3yo
  const things = [
    {name:"apples", icon:"🍎"},
    {name:"bananas", icon:"🍌"},
    {name:"strawberries", icon:"🍓"},
    {name:"stars", icon:"⭐"},
    {name:"puppies", icon:"🐶"},
    {name:"cats", icon:"🐱"},
  ];

  const nameEl = view.querySelector("#thingName");
  const itemsEl = view.querySelector("#items");
  const choicesEl = view.querySelector("#choices");

  let count = 3;
  let thing = things[0];

  function newCountGame(){
    thing = things[Math.floor(Math.random()*things.length)];
    count = Math.floor(Math.random()*6)+1; // 1-6
    nameEl.textContent = thing.name;

    itemsEl.innerHTML = "";
    for (let i=0;i<count;i++){
      const s = document.createElement("span");
      s.textContent = thing.icon;
      s.style.filter = "drop-shadow(0 10px 14px rgba(0,0,0,.35))";
      itemsEl.appendChild(s);
    }

    const opts = new Set([count]);
    while(opts.size < 3) opts.add(Math.floor(Math.random()*6)+1);
    const arr = Array.from(opts).sort(()=>Math.random()-0.5);

    choicesEl.innerHTML = "";
    arr.forEach(n=>{
      const b = document.createElement("button");
      b.className = "btn primary";
      b.type = "button";
      b.textContent = String(n);
      b.onclick = ()=>{
        if (n === count){
          awardStar("3yo counting correct");
          alert("✅ Great counting! +⭐");
          newCountGame();
        } else {
          alert("Try again 🙂");
        }
      };
      choicesEl.appendChild(b);
    });
  }

  // 5yo
  const problemEl = view.querySelector("#problem");
  const answerEl = view.querySelector("#answer");
  let a=2,b=3,op="+";

  function newProblem(){
    a = Math.floor(Math.random()*9)+1;
    b = Math.floor(Math.random()*9)+1;
    op = Math.random() < 0.5 ? "+" : "−";
    if (op === "−" && b > a) [a,b] = [b,a];
    problemEl.textContent = `${a} ${op} ${b} = ?`;
    answerEl.value = "";
  }

  view.querySelector("#check").onclick = ()=>{
    const user = Number(answerEl.value);
    const correct = op === "+" ? (a+b) : (a-b);
    if (user === correct){
      awardStar("5yo math correct");
      alert("🎉 Correct! +⭐");
      newProblem();
    } else alert("Close! Try again 🙂");
  };

  view.querySelector("#newQ").onclick = ()=>{
    newCountGame();
    newProblem();
  };

  newCountGame();
  newProblem();
});

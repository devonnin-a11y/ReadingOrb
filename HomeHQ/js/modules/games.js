Router.register("games", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">🎮 Games</div>
      <div class="muted">Memory + problem solving + fun.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="maze" type="button">🧩 Kid Maze</button>
        <button class="btn primary" id="match" type="button">🃏 Match Cards</button>
        <button class="btn primary" id="seq" type="button">🧠 Memory Sequence</button>
        <button class="btn ghost" id="home" type="button">🏠 Back</button>
      </div>
    </div>

    <div id="gameArea"></div>
  `;

  const area = view.querySelector("#gameArea");
  view.querySelector("#home").onclick = () => Router.go("home");

  view.querySelector("#maze").onclick = () => renderKidMaze(area);
  view.querySelector("#match").onclick = () => renderMatch(area);
  view.querySelector("#seq").onclick = () => renderSequence(area);

  renderKidMaze(area);
});

/* ------------------ KID MAZE (SIMPLER) ------------------ */
function renderKidMaze(area){
  area.innerHTML = `
    <div class="card">
      <div class="big">🧩 Kid Maze Escape</div>
      <div class="muted">
        Add moves with the big arrows → press Run → reach the ⭐.
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" id="newMaze" type="button">🔁 New</button>
        <button class="btn primary" id="run" type="button">▶ Run</button>
        <button class="btn ghost" id="clear" type="button">🧹 Clear</button>
        <button class="btn ghost" id="award" type="button">⭐ Award</button>
      </div>
    </div>

    <!-- Layout that keeps arrows + list + maze visible -->
    <div class="kidMazeLayout">
      <div class="card">
        <div class="big">Big Arrows</div>
        <div class="muted">Tap to add moves.</div>

        <div class="arrowPad" style="margin-top:10px;">
          <button class="arrowBtn" data-m="U" type="button">⬆</button>
          <div class="arrowRow">
            <button class="arrowBtn" data-m="L" type="button">⬅</button>
            <button class="arrowBtn" data-m="D" type="button">⬇</button>
            <button class="arrowBtn" data-m="R" type="button">➡</button>
          </div>
        </div>

        <p class="hint small muted">Tip: Tap a move in the list to remove it.</p>

        <div class="big" style="margin-top:10px;">Move List</div>
        <div id="list" class="block-program" style="min-height:120px; max-height:240px; overflow:auto;"></div>
      </div>

      <div class="card">
        <div class="big">Maze</div>
        <div class="muted">Watch the blue square move.</div>
        <div id="mazeWrap" class="mazeWrap"></div>
      </div>
    </div>
  `;

  area.querySelector("#award").onclick = () => awardStar("Kid maze award");

  const listEl = area.querySelector("#list");
  const wrap = area.querySelector("#mazeWrap");

  // Smaller maze + simpler generation:
  // 6x6 feels manageable for kids.
  const W = 6, H = 6;

  // Generate a "perfect maze" then carve extra openings to reduce dead ends
  let maze = genMaze(W, H);

  // Soften difficulty: remove some random walls (more open, fewer traps)
  softenMaze(maze, W, H, 10);

  let player = {x:0,y:0};
  const exit = {x:W-1,y:H-1};

  const draw = () => { wrap.innerHTML = buildMazeHTML(maze, W, H, player, exit, 44); };
  draw();

  // Add moves
  area.querySelectorAll("[data-m]").forEach(btn=>{
    btn.onclick = ()=>{
      const m = btn.dataset.m;
      const chip = document.createElement("div");
      chip.className = "block";
      chip.dataset.m = m;
      chip.textContent = m==="U"?"⬆":m==="D"?"⬇":m==="L"?"⬅":"➡";
      chip.style.fontSize = "1.2rem";
      chip.style.padding = "10px 12px";
      chip.onclick = ()=>chip.remove();
      listEl.appendChild(chip);

      // keep list scrolled to the bottom so kids see the newest move
      listEl.scrollTop = listEl.scrollHeight;
    };
  });

  area.querySelector("#clear").onclick = ()=> listEl.innerHTML = "";

  area.querySelector("#newMaze").onclick = ()=>{
    maze = genMaze(W, H);
    softenMaze(maze, W, H, 10);
    player = {x:0,y:0};
    listEl.innerHTML = "";
    draw();
  };

  area.querySelector("#run").onclick = async ()=>{
    const moves = Array.from(listEl.querySelectorAll(".block")).map(b=>b.dataset.m);
    if (!moves.length) return alert("Add moves first 🙂");

    // Focus/scroll to the maze so they can watch it move
    wrap.scrollIntoView({behavior:"smooth", block:"center"});

    for (const m of moves){
      const nxt = {x:player.x, y:player.y};
      if (m==="U") nxt.y--;
      if (m==="D") nxt.y++;
      if (m==="L") nxt.x--;
      if (m==="R") nxt.x++;

      // bounds
      if (nxt.x<0||nxt.y<0||nxt.x>=W||nxt.y>=H){
        await wait(140);
        continue;
      }

      // walls
      if (isBlocked(maze, player, nxt)){
        await wait(140);
        continue;
      }

      player = nxt;
      draw();
      await wait(220);

      if (player.x===exit.x && player.y===exit.y){
        awardStar("Kid maze win");
        alert("🎉 You escaped! +⭐");
        break;
      }
    }
  };
}

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

// Maze cell walls: N,E,S,W true = wall
function genMaze(w,h){
  const cells = Array.from({length:h},()=>Array.from({length:w},()=>({N:true,E:true,S:true,W:true,vis:false})));
  const stack = [{x:0,y:0}];
  cells[0][0].vis = true;

  const dirs = [
    {dx:0,dy:-1,a:"N",b:"S"},
    {dx:1,dy:0,a:"E",b:"W"},
    {dx:0,dy:1,a:"S",b:"N"},
    {dx:-1,dy:0,a:"W",b:"E"},
  ];

  while(stack.length){
    const cur = stack[stack.length-1];
    const options = dirs
      .map(d=>({d, nx:cur.x+d.dx, ny:cur.y+d.dy}))
      .filter(o=>o.nx>=0&&o.ny>=0&&o.nx<w&&o.ny<h && !cells[o.ny][o.nx].vis);

    if(!options.length){ stack.pop(); continue; }

    const pick = options[Math.floor(Math.random()*options.length)];
    cells[cur.y][cur.x][pick.d.a] = false;
    cells[pick.ny][pick.nx][pick.d.b] = false;
    cells[pick.ny][pick.nx].vis = true;
    stack.push({x:pick.nx,y:pick.ny});
  }

  for (let y=0;y<h;y++) for (let x=0;x<w;x++) cells[y][x].vis=false;
  return cells;
}

// Remove a handful of random walls to make it more open / kid friendly
function softenMaze(maze, w, h, openings=8){
  const rand = (n)=>Math.floor(Math.random()*n);
  for (let i=0;i<openings;i++){
    const x = rand(w);
    const y = rand(h);
    const dirs = ["N","E","S","W"];
    const d = dirs[rand(dirs.length)];
    const c = maze[y][x];

    // Try to open wall if neighbor exists
    if (d==="N" && y>0){ c.N=false; maze[y-1][x].S=false; }
    if (d==="S" && y<h-1){ c.S=false; maze[y+1][x].N=false; }
    if (d==="W" && x>0){ c.W=false; maze[y][x-1].E=false; }
    if (d==="E" && x<w-1){ c.E=false; maze[y][x+1].W=false; }
  }
}

function isBlocked(maze, from, to){
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const c = maze[from.y][from.x];
  if (dx===1) return c.E;
  if (dx===-1) return c.W;
  if (dy===1) return c.S;
  if (dy===-1) return c.N;
  return true;
}

function buildMazeHTML(maze,w,h,player,exit,cellSize=44){
  let html = `<div class="mazeBoard" style="grid-template-columns:repeat(${w}, ${cellSize}px);">`;
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const c = maze[y][x];
      const isP = (x===player.x && y===player.y);
      const isE = (x===exit.x && y===exit.y);

      const content = isP ? "🟦" : (isE ? "⭐" : "");
      const bg = isP ? "rgba(99,179,255,.30)" : (isE ? "rgba(255,201,75,.24)" : "rgba(255,255,255,.05)");

      const style = `
        width:${cellSize}px;height:${cellSize}px;
        display:flex;align-items:center;justify-content:center;
        font-weight:1000;
        font-size:1.1rem;
        background:${bg};
        border-top:${c.N ? "3px solid rgba(220,245,255,.60)" : "3px solid transparent"};
        border-right:${c.E ? "3px solid rgba(220,245,255,.60)" : "3px solid transparent"};
        border-bottom:${c.S ? "3px solid rgba(220,245,255,.60)" : "3px solid transparent"};
        border-left:${c.W ? "3px solid rgba(220,245,255,.60)" : "3px solid transparent"};
        border-radius:10px;
      `;
      html += `<div style="${style}">${content}</div>`;
    }
  }
  html += `</div>`;
  return html;
}

/* ------------------ MATCH CARDS (unchanged) ------------------ */
function renderMatch(area){
  area.innerHTML = `
    <div class="card">
      <div class="big">🃏 Match Cards</div>
      <div class="muted">Pick a board size or difficulty tier.</div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" data-size="3" type="button">3x3</button>
        <button class="btn ghost" data-size="5" type="button">5x5</button>
        <button class="btn ghost" data-size="7" type="button">7x7</button>
        <button class="btn ghost" data-size="9" type="button">9x9</button>
        <button class="btn ghost" data-size="12" type="button">12x12</button>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" data-tier="easy1" type="button">Easy T1</button>
        <button class="btn primary" data-tier="easy2" type="button">Easy T2</button>
        <button class="btn primary" data-tier="easy3" type="button">Easy T3</button>
        <button class="btn primary" data-tier="med1" type="button">Med T1</button>
        <button class="btn primary" data-tier="med2" type="button">Med T2</button>
        <button class="btn primary" data-tier="med3" type="button">Med T3</button>
        <button class="btn primary" data-tier="hard1" type="button">Hard T1</button>
        <button class="btn primary" data-tier="hard2" type="button">Hard T2</button>
        <button class="btn primary" data-tier="hard3" type="button">Hard T3</button>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" id="award" type="button">⭐ Award Star</button>
      </div>
    </div>

    <div class="card">
      <div id="board"></div>
      <p class="hint small muted">Tip: Matching all pairs awards ⭐ automatically.</p>
    </div>
  `;

  area.querySelector("#award").onclick = () => awardStar("Match award");

  const tierMap = {
    easy1: 3, easy2: 5, easy3: 7,
    med1: 7,  med2: 9,  med3: 9,
    hard1: 9, hard2: 12, hard3: 12
  };

  const boardEl = area.querySelector("#board");

  function start(n){
    const total = n*n;
    const usable = (total % 2 === 0) ? total : total - 1;
    const pairs = usable / 2;

    const emoji = ["🐶","🐱","🦊","🐻","🐼","🐨","🐯","🦁","🐸","🐵","🐷","🐮","🐔","🦄","🐙","🦋","🌟","🍓","🍉","🍌","🍎","🍪","🍕","⚡","🛡️","🌀","🔥","💎","🎯","🎮","🚀","🌈","🌊","🧠","📘","🧩","🎈","🏆"];
    const deck = [];
    for (let i=0;i<pairs;i++){
      const v = emoji[i % emoji.length] + (i>=emoji.length ? String(i) : "");
      deck.push(v, v);
    }
    shuffle(deck);

    let first = null;
    let lock = false;
    let matched = 0;

    boardEl.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(${n}, 1fr); gap:8px;">
        ${Array.from({length: usable}).map((_,i)=>`
          <button class="cardBtn" data-i="${i}" type="button"
            style="height:${Math.max(44, 320/n)}px; border-radius:14px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff; font-size:${Math.max(16, 44 - n*2)}px; font-weight:1000; cursor:pointer;">
            ?
          </button>
        `).join("")}
      </div>
      ${total!==usable ? `<p class="muted" style="margin-top:10px;">(One tile removed so pairs are even.)</p>` : ``}
    `;

    boardEl.querySelectorAll(".cardBtn").forEach(btn=>{
      btn.onclick = async ()=>{
        if (lock) return;
        const i = Number(btn.dataset.i);
        if (btn.dataset.open === "1") return;

        btn.textContent = deck[i];
        btn.dataset.open = "1";

        if (!first){
          first = btn;
          return;
        }

        if (first.textContent === btn.textContent){
          matched += 2;
          first.style.opacity = "0.7";
          btn.style.opacity = "0.7";
          first = null;

          if (matched === usable){
            awardStar("Match win");
            alert("🎉 Board cleared! +⭐");
          }
        } else {
          lock = true;
          await wait(550);
          first.textContent = "?";
          btn.textContent = "?";
          first.dataset.open = "0";
          btn.dataset.open = "0";
          first = null;
          lock = false;
        }
      };
    });
  }

  area.querySelectorAll("[data-size]").forEach(b => b.onclick = () => start(Number(b.dataset.size)));
  area.querySelectorAll("[data-tier]").forEach(b => b.onclick = () => start(tierMap[b.dataset.tier] || 5));

  start(5);
}

/* ------------------ MEMORY SEQUENCE (BETTER HIGHLIGHT) ------------------ */
function renderSequence(area){
  area.innerHTML = `
    <div class="card">
      <div class="big">🧠 Memory Sequence</div>
      <div class="muted">Watch the sequence, then tap it back in order.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="start" type="button">▶ Start</button>
        <button class="btn ghost" id="award" type="button">⭐ Award Star</button>
      </div>
      <p class="hint small muted">Bigger glow + stronger flash.</p>
    </div>

    <div class="card">
      <div class="muted">Level: <strong id="lvl">1</strong></div>
      <div id="pad" class="simonPad">
        ${["A","B","C","D"].map(k=>`
          <button class="simonBtn" data-k="${k}" type="button">${k}</button>
        `).join("")}
      </div>
      <p class="hint small muted">Clearing levels awards ⭐.</p>
    </div>
  `;

  area.querySelector("#award").onclick = () => awardStar("Sequence award");

  const lvlEl = area.querySelector("#lvl");
  const buttons = Array.from(area.querySelectorAll(".simonBtn"));
  const keys = ["A","B","C","D"];

  let seq = [];
  let input = [];
  let level = 1;
  let locked = false;

  const flash = async (k)=>{
    const btn = buttons.find(b=>b.dataset.k===k);
    if(!btn) return;
    btn.classList.add("flash");
    await wait(420);
    btn.classList.remove("flash");
    await wait(120);
  };

  async function playSeq(){
    locked = true;
    for (const k of seq) await flash(k);
    locked = false;
  }

  function reset(){
    seq = [];
    input = [];
    level = 1;
    lvlEl.textContent = level;
  }

  function next(){
    input = [];
    seq.push(keys[Math.floor(Math.random()*keys.length)]);
    lvlEl.textContent = level;
    playSeq();
  }

  area.querySelector("#start").onclick = ()=>{
    reset();
    next();
  };

  buttons.forEach(btn=>{
    btn.onclick = async ()=>{
      if (locked || !seq.length) return;
      const k = btn.dataset.k;

      input.push(k);
      await flash(k);

      const idx = input.length-1;
      if (input[idx] !== seq[idx]){
        alert("Oops! Try again 🙂");
        reset();
        return;
      }

      if (input.length === seq.length){
        awardStar("Sequence level cleared");
        alert("✅ Level cleared! +⭐");
        level++;
        next();
      }
    };
  });
}

/* helpers */
function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
}

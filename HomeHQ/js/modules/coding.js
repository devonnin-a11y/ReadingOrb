Router.register("coding", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">💻 Coding Rangers + Physics</div>
      <div class="muted">Build a program → watch the ball move. Physics mode uses gravity + forces.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" id="backHome" type="button">🏠 Back</button>
        <button class="btn ghost" id="award" type="button">⭐ Award Star</button>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="big">Blocks</div>
        <div class="muted">Tap to add blocks. Tap a block in Program to remove.</div>

        <div class="muted" style="margin-top:10px;">Basic</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn primary" data-add="say:Hi!" type="button">SAY</button>
          <button class="btn primary" data-add="move:20" type="button">MOVE +</button>
          <button class="btn primary" data-add="move:-20" type="button">MOVE -</button>
          <button class="btn primary" data-add="jump" type="button">JUMP</button>
          <button class="btn primary" data-add="spin" type="button">SPIN</button>
          <button class="btn primary" data-add="repeat:3" type="button">REPEAT x3</button>
        </div>

        <div class="muted" style="margin-top:12px;">Physics</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn primary" data-add="grav:0.25" type="button">Gravity +</button>
          <button class="btn primary" data-add="grav:0.0" type="button">Gravity 0</button>
          <button class="btn primary" data-add="push:-1" type="button">Push ⬅</button>
          <button class="btn primary" data-add="push:1" type="button">Push ➡</button>
          <button class="btn primary" data-add="boost" type="button">Boost ⬆</button>
          <button class="btn primary" data-add="bounce:0.8" type="button">Bouncier</button>
        </div>

        <p class="hint small muted" style="margin-top:10px;">
          Physics blocks affect the ball inside the box.
        </p>
      </div>

      <div class="card">
        <div class="big">Program</div>
        <div id="program" class="block-program" style="min-height:220px; max-height:340px; overflow:auto;"></div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
          <button class="btn primary" id="run" type="button">▶ Run</button>
          <button class="btn ghost" id="clear" type="button">🧹 Clear</button>
          <button class="btn primary" id="challenge" type="button">🎯 Physics Challenge</button>
        </div>
        <p class="hint small muted">Challenge: move the ball into the ⭐ target.</p>
      </div>
    </div>

    <div class="card">
      <div class="big">Stage</div>
      <div id="stage" style="
        position:relative;
        height:260px;
        border-radius:18px;
        border:1px solid rgba(166,220,255,.2);
        background:rgba(0,0,0,.18);
        overflow:hidden;
      ">
        <div id="target" style="
          position:absolute;
          right:18px; bottom:18px;
          width:44px; height:44px;
          border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,201,75,.22);
          border:2px solid rgba(255,201,75,.6);
          font-size:1.4rem;
        ">⭐</div>

        <div id="ball" style="
          position:absolute;
          left:20px; top:40px;
          width:40px; height:40px;
          border-radius:50%;
          background:linear-gradient(135deg, rgba(99,179,255,1), rgba(255,201,75,1));
          box-shadow:0 14px 26px rgba(0,0,0,.45);
          border:2px solid rgba(255,255,255,.25);
        "></div>

        <div id="speech" style="
          position:absolute; left:12px; top:12px;
          padding:8px 10px;
          border-radius:14px;
          background:rgba(0,0,0,.35);
          border:1px solid rgba(255,255,255,.16);
          font-weight:900;
          color:#fff;
          opacity:0;
          transition:opacity 120ms ease-out;
        "></div>
      </div>
    </div>
  `;

  view.querySelector("#backHome").onclick = () => Router.go("home");
  view.querySelector("#award").onclick = () => awardStar("Coding award");

  const program = view.querySelector("#program");
  const ballEl = view.querySelector("#ball");
  const speech = view.querySelector("#speech");
  const stage = view.querySelector("#stage");
  const target = view.querySelector("#target");

  // Physics state (ball)
  let x=20, y=40, vx=0, vy=0;
  let gravity = 0.18;
  let bounce = 0.65;
  let challengeMode = false;

  const W = () => stage.clientWidth;
  const H = () => stage.clientHeight;

  const setBall = () => {
    ballEl.style.transform = `translate(${x}px, ${y}px)`;
  };

  // Continuous physics loop (always running so you SEE the ball)
  let raf;
  function tick(){
    // integrate
    vy += gravity;
    x += vx;
    y += vy;

    // friction
    vx *= 0.985;

    // bounds (simple collisions)
    const maxX = W() - 40 - 2;
    const maxY = H() - 40 - 2;

    if (x < 0){ x=0; vx = -vx*bounce; }
    if (x > maxX){ x=maxX; vx = -vx*bounce; }
    if (y < 0){ y=0; vy = -vy*bounce; }
    if (y > maxY){ y=maxY; vy = -vy*bounce; }

    setBall();

    // challenge check
    if (challengeMode){
      const br = ballEl.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      const hit = !(br.right < tr.left || br.left > tr.right || br.bottom < tr.top || br.top > tr.bottom);
      if (hit){
        challengeMode = false;
        awardStar("Physics challenge win");
        showToast("🎉 Target reached! +⭐", 1400);
      }
    }

    raf = requestAnimationFrame(tick);
  }
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);

  const say = async (text) => {
    speech.textContent = text;
    speech.style.opacity = "1";
    await wait(700);
    speech.style.opacity = "0";
  };

  const addBlock = (label, type, payload={})=>{
    const b = document.createElement("div");
    b.className = "block";
    b.textContent = label;
    b.dataset.type = type;
    b.dataset.payload = JSON.stringify(payload);
    b.onclick = ()=>b.remove();
    program.appendChild(b);
  };

  // Add block buttons
  view.querySelectorAll("[data-add]").forEach(btn=>{
    btn.onclick = ()=>{
      const v = btn.dataset.add;

      if (v.startsWith("say:")) addBlock(`SAY "${v.slice(4)}"`, "say", {text:v.slice(4)});
      else if (v.startsWith("move:")) addBlock(`MOVE ${v.slice(5)}`, "move", {dx:Number(v.slice(5))});
      else if (v==="jump") addBlock("JUMP", "jump");
      else if (v==="spin") addBlock("SPIN", "spin");
      else if (v.startsWith("repeat:")) addBlock(`REPEAT x${v.slice(7)}`, "repeat", {n:Number(v.slice(7))});

      // physics blocks
      else if (v.startsWith("grav:")) addBlock(`GRAVITY ${v.slice(5)}`, "grav", {g:Number(v.slice(5))});
      else if (v.startsWith("push:")) addBlock(`PUSH ${v.slice(5)}`, "push", {dir:Number(v.slice(5))});
      else if (v==="boost") addBlock("BOOST UP", "boost");
      else if (v.startsWith("bounce:")) addBlock(`BOUNCE ${v.slice(7)}`, "bounce", {b:Number(v.slice(7))});
    };
  });

  view.querySelector("#clear").onclick = ()=> program.innerHTML = "";

  // Expand repeat blocks
  function expandBlocks(blocks){
    const out = [];
    for (const b of blocks){
      if (b.dataset.type === "repeat"){
        const n = JSON.parse(b.dataset.payload || "{}").n || 2;
        const prev = out[out.length-1];
        if (!prev) continue;
        for (let i=0;i<n-1;i++) out.push({...prev});
      } else {
        out.push({type:b.dataset.type, payload:JSON.parse(b.dataset.payload||"{}")});
      }
    }
    return out;
  }

  // Run program
  view.querySelector("#run").onclick = async ()=>{
    const blocks = Array.from(program.querySelectorAll(".block"));
    if (!blocks.length) return showToast("Add blocks first 🙂", 1000);

    // bring stage into view so they SEE the ball run
    stage.scrollIntoView({behavior:"smooth", block:"center"});

    const seq = expandBlocks(blocks);

    for (const cmd of seq){
      if (cmd.type==="say") await say(cmd.payload.text || "Hi!");
      if (cmd.type==="move"){ x += (cmd.payload.dx || 0); }
      if (cmd.type==="jump"){ vy -= 5.2; }
      if (cmd.type==="spin"){ await say("Spin!"); }
      if (cmd.type==="grav"){ gravity = cmd.payload.g; await say(`Gravity ${gravity}`); }
      if (cmd.type==="bounce"){ bounce = cmd.payload.b; await say(`Bounce ${bounce}`); }
      if (cmd.type==="push"){ vx += (cmd.payload.dir || 0) * 1.6; }
      if (cmd.type==="boost"){ vy -= 7.0; }

      // small pause so kids can see cause→effect
      await wait(180);
    }

    awardStar("Coding run");
    showToast("✅ Program done! +⭐", 1000);
  };

  // Physics challenge: reset + enable goal
  view.querySelector("#challenge").onclick = ()=>{
    x = 20; y = 40; vx = 0; vy = 0;
    gravity = 0.18; bounce = 0.65;
    challengeMode = true;
    stage.scrollIntoView({behavior:"smooth", block:"center"});
    showToast("🎯 Challenge ON: reach ⭐", 1200);
  };

  setBall();
});

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

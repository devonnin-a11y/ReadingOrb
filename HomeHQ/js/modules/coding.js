Router.register("coding", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">💻 Coding Rangers</div>
      <div class="muted">Bigger workspace + more blocks. Tap blocks in Program to remove.</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn ghost" id="backHome" type="button">🏠 Back</button>
        <button class="btn ghost" id="award" type="button">⭐ Award Star</button>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="big">Blocks</div>
        <div class="muted">Tap a block to add it.</div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
          <button class="btn primary" data-add="say:Hi!" type="button">SAY “Hi!”</button>
          <button class="btn primary" data-add="say:Great job!" type="button">SAY “Great job!”</button>
          <button class="btn primary" data-add="move:20" type="button">MOVE +20</button>
          <button class="btn primary" data-add="move:-20" type="button">MOVE -20</button>
          <button class="btn primary" data-add="jump" type="button">JUMP</button>
          <button class="btn primary" data-add="spin" type="button">SPIN</button>
        </div>

        <div class="muted" style="margin-top:10px;">Maze Moves (for Maze game practice)</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn primary" data-add="U" type="button">⬆</button>
          <button class="btn primary" data-add="D" type="button">⬇</button>
          <button class="btn primary" data-add="L" type="button">⬅</button>
          <button class="btn primary" data-add="R" type="button">➡</button>
        </div>

        <div class="muted" style="margin-top:10px;">Repeats</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn primary" data-add="repeat:2" type="button">REPEAT x2</button>
          <button class="btn primary" data-add="repeat:3" type="button">REPEAT x3</button>
          <button class="btn primary" data-add="repeat:5" type="button">REPEAT x5</button>
        </div>

        <p class="hint small muted" style="margin-top:10px;">
          Repeat applies to the <strong>previous</strong> block.
        </p>
      </div>

      <div class="card">
        <div class="big">Program</div>
        <div id="program" class="block-program" style="min-height:200px; max-height:320px; overflow:auto;"></div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
          <button class="btn primary" id="run" type="button">▶ Run</button>
          <button class="btn ghost" id="clear" type="button">🧹 Clear</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="big">Stage</div>
      <div class="stage">
        <div class="sprite" id="sprite"></div>
        <div class="speech" id="speech"></div>
      </div>
    </div>

    <div class="card">
      <div class="big">Real Code Mode</div>
      <div class="muted">Allowed: <span class="kbd">say("text")</span>, <span class="kbd">move(20)</span>, <span class="kbd">jump()</span>, <span class="kbd">spin()</span></div>
      <textarea id="code" rows="6" style="width:100%; margin-top:10px; padding:10px; border-radius:14px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff;">say("Hi!");
move(20);
jump();
spin();</textarea>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="runCode" type="button">▶ Run Code</button>
      </div>
    </div>
  `;

  view.querySelector("#backHome").onclick = () => Router.go("home");
  view.querySelector("#award").onclick = () => awardStar("Coding award");

  const program = view.querySelector("#program");
  const sprite = view.querySelector("#sprite");
  const speech = view.querySelector("#speech");

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
      else if (["U","D","L","R"].includes(v)) addBlock(v==="U"?"⬆":v==="D"?"⬇":v==="L"?"⬅":"➡", "maze", {m:v});
      else if (v.startsWith("repeat:")) addBlock(`REPEAT x${v.slice(7)}`, "repeat", {n:Number(v.slice(7))});
    };
  });

  // Stage actions
  let x = 0;
  const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
  const setSprite = ()=>{ sprite.style.transform = `translateX(${x}px)`; };

  const doSay = async (text="Hi!")=>{
    speech.textContent = text;
    speech.classList.add("on");
    await wait(700);
    speech.classList.remove("on");
  };

  const doMove = async (dx=20)=>{
    x += dx; x = Math.max(-10, Math.min(220, x));
    setSprite();
    await wait(240);
  };

  const doJump = async ()=>{
    sprite.style.transform = `translateX(${x}px) translateY(-22px)`;
    await wait(170);
    sprite.style.transform = `translateX(${x}px) translateY(0px)`;
    await wait(120);
  };

  const doSpin = async ()=>{
    sprite.style.transition = "transform 200ms ease-out";
    sprite.style.transform = `translateX(${x}px) rotate(360deg)`;
    await wait(220);
    sprite.style.transform = `translateX(${x}px) rotate(0deg)`;
    await wait(120);
  };

  function expandWithRepeats(blocks){
    const out = [];
    for (let i=0;i<blocks.length;i++){
      const b = blocks[i];
      if (b.dataset.type === "repeat"){
        const n = JSON.parse(b.dataset.payload || "{}").n || 2;
        const prev = out[out.length-1];
        if (!prev) continue;
        for (let k=0;k<n-1;k++) out.push({...prev});
      } else {
        out.push({
          type: b.dataset.type,
          payload: JSON.parse(b.dataset.payload || "{}")
        });
      }
    }
    return out;
  }

  view.querySelector("#run").onclick = async ()=>{
    const blocks = Array.from(program.querySelectorAll(".block"));
    if (!blocks.length) return alert("Add blocks first 🙂");

    const seq = expandWithRepeats(blocks);

    for (const cmd of seq){
      if (cmd.type==="say") await doSay(cmd.payload.text);
      if (cmd.type==="move") await doMove(cmd.payload.dx);
      if (cmd.type==="jump") await doJump();
      if (cmd.type==="spin") await doSpin();
      if (cmd.type==="maze") await doSay(`Move ${cmd.payload.m}`); // teaches commands visually
    }

    awardStar("Coding run");
    alert("✅ Program done! +⭐");
  };

  view.querySelector("#clear").onclick = ()=> program.innerHTML = "";

  // Code mode parser (safe)
  view.querySelector("#runCode").onclick = async ()=>{
    const src = (view.querySelector("#code").value || "")
      .split("\n").map(l=>l.trim()).filter(Boolean);

    for (const line of src){
      if (line.startsWith("say(")){
        const m = line.match(/say\(["'](.+?)["']\)\s*;?$/);
        if (!m) return alert('Use: say("Hi!");');
        await doSay(m[1]);
      } else if (line.startsWith("move(")){
        const m = line.match(/move\((\-?\d+)\)\s*;?$/);
        if (!m) return alert("Use: move(20);");
        await doMove(Number(m[1]));
      } else if (line === "jump();" || line === "jump()" || line.startsWith("jump(")){
        await doJump();
      } else if (line === "spin();" || line === "spin()" || line.startsWith("spin(")){
        await doSpin();
      } else {
        return alert("Only say(), move(), jump(), spin() allowed 🙂");
      }
    }

    awardStar("Coding code run");
    alert("🚀 Nice coding! +⭐");
  };

  setSprite();
});

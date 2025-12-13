Router.register("coding", (view) => {
  view.innerHTML = `
    <div class="card">
      <div class="big">💻 Coding Rangers</div>
      <div class="muted">
        Drag blocks into the program, then Run. Earn ⭐ for completing a program.
      </div>
    </div>

    <div class="card">
      <div class="big">Block Mode</div>
      <div class="muted">Drag blocks into the Program Area.</div>

      <div class="block-palette" id="palette" aria-label="Block palette">
        <div class="block" draggable="true" data-type="say">SAY “Hi!”</div>
        <div class="block" draggable="true" data-type="move">MOVE +20</div>
        <div class="block" draggable="true" data-type="jump">JUMP</div>
      </div>

      <div class="muted" style="margin:10px 0 6px;">Program Area</div>
      <div class="block-program" id="program" aria-label="Program area"></div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="runBlocks" type="button">▶ Run Blocks</button>
        <button class="btn ghost" id="clearBlocks" type="button">🧹 Clear</button>
      </div>
    </div>

    <div class="card">
      <div class="big">Stage</div>
      <div class="stage" id="stage">
        <div class="sprite" id="sprite"></div>
        <div class="speech" id="speech"></div>
      </div>
    </div>

    <div class="card">
      <div class="big">Real Code Mode</div>
      <div class="muted">Kid-friendly commands: <span class="kbd">say("text")</span>, <span class="kbd">move(20)</span>, <span class="kbd">jump()</span></div>
      <textarea id="code" rows="6" style="width:100%; margin-top:10px; padding:10px; border-radius:14px; border:1px solid rgba(166,220,255,.2); background:rgba(0,0,0,.25); color:#fff;">say("Hi!");
move(20);
jump();</textarea>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn primary" id="runCode" type="button">▶ Run Code</button>
        <button class="btn ghost" id="codeStar" type="button">⭐ Award Star</button>
      </div>
    </div>
  `;

  const palette = view.querySelector("#palette");
  const program = view.querySelector("#program");
  const sprite = view.querySelector("#sprite");
  const speech = view.querySelector("#speech");

  // drag helpers
  const onDragStart = (e) => {
    const t = e.target;
    if (!t.classList.contains("block")) return;
    e.dataTransfer.setData("text/plain", t.dataset.type);
  };
  palette.addEventListener("dragstart", onDragStart);

  program.addEventListener("dragover", (e) => e.preventDefault());
  program.addEventListener("drop", (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    if (!type) return;

    const block = document.createElement("div");
    block.className = "block";
    block.draggable = true;
    block.dataset.type = type;
    block.textContent =
      type === "say" ? 'SAY “Hi!”' :
      type === "move" ? "MOVE +20" :
      "JUMP";

    block.addEventListener("dragstart", onDragStart);
    block.onclick = () => block.remove(); // tap to remove
    program.appendChild(block);
  });

  // stage actions
  let x = 0;
  const setSprite = () => { sprite.style.transform = `translateX(${x}px)`; };

  const doSay = async (text="Hi!") => {
    speech.textContent = text;
    speech.classList.add("on");
    await new Promise(r => setTimeout(r, 700));
    speech.classList.remove("on");
  };

  const doMove = async (dx=20) => {
    x += dx;
    x = Math.max(-10, Math.min(220, x));
    setSprite();
    await new Promise(r => setTimeout(r, 280));
  };

  const doJump = async () => {
    sprite.style.transform = `translateX(${x}px) translateY(-22px)`;
    await new Promise(r => setTimeout(r, 180));
    sprite.style.transform = `translateX(${x}px) translateY(0px)`;
    await new Promise(r => setTimeout(r, 120));
  };

  const runSequence = async (seq) => {
    for (const cmd of seq) {
      if (cmd.type === "say") await doSay(cmd.text);
      if (cmd.type === "move") await doMove(cmd.dx);
      if (cmd.type === "jump") await doJump();
    }
  };

  // Run blocks
  view.querySelector("#runBlocks").onclick = async () => {
    const blocks = Array.from(program.querySelectorAll(".block"));
    if (!blocks.length) return alert("Drag at least 1 block 🙂");

    const seq = blocks.map(b => {
      if (b.dataset.type === "say") return { type:"say", text:"Hi!" };
      if (b.dataset.type === "move") return { type:"move", dx:20 };
      return { type:"jump" };
    });

    await runSequence(seq);

    Store.addStars(1);
    updateProgressUI();
    alert("🎉 Program complete! +⭐");
  };

  view.querySelector("#clearBlocks").onclick = () => { program.innerHTML = ""; };

  // Run code (very safe parser: only accepts say/move/jump)
  view.querySelector("#runCode").onclick = async () => {
    const src = (view.querySelector("#code").value || "").split("\n").map(l => l.trim()).filter(Boolean);
    const seq = [];

    for (const line of src) {
      if (line.startsWith("say(")) {
        const m = line.match(/say\(["'](.+?)["']\)\s*;?$/);
        if (!m) return alert("Code error in say(). Use say(\"Hi!\");");
        seq.push({ type:"say", text:m[1] });
      } else if (line.startsWith("move(")) {
        const m = line.match(/move\((\-?\d+)\)\s*;?$/);
        if (!m) return alert("Code error in move(). Use move(20);");
        seq.push({ type:"move", dx:Number(m[1]) });
      } else if (line.startsWith("jump(") || line === "jump();" || line === "jump()") {
        seq.push({ type:"jump" });
      } else {
        return alert("Only say(), move(), jump() allowed right now 🙂");
      }
    }

    await runSequence(seq);
    Store.addStars(1);
    updateProgressUI();
    alert("🚀 Nice coding! +⭐");
  };

  view.querySelector("#codeStar").onclick = () => {
    Store.addStars(1);
    updateProgressUI();
    alert("⭐ Star awarded!");
  };

  setSprite();
});

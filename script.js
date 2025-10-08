/* script.js — simulation with a client-side fake login
   Credentials (client-only demo):
   username: admin
   password: admin1

   IMPORTANT: this checks everything locally in the browser.
   No network calls, no storage, nothing is logged or transmitted.
*/

(function(){
  // LOGIN elements
  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  const loginBtn = document.getElementById('loginBtn');
  const demoBtn = document.getElementById('demoBtn');
  const loginMsg = document.getElementById('loginMsg');

  // WATCH UI elements (rest of simulation)
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext && canvas.getContext('2d');
  const playPauseBtn = document.getElementById('playPause');
  const qualitySelect = document.getElementById('quality');
  const viewerEl = document.getElementById('viewerCount');
  const progressFill = document.getElementById('progressFill');
  const elapsedEl = document.getElementById('elapsed');
  const followBtn = document.getElementById('followBtn');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const joinServerBtn = document.getElementById('joinServer');

  const chatBox = document.getElementById('chatBox');
  const chatField = document.getElementById('chatField');
  const sendChat = document.getElementById('sendChat');

  const prankOverlay = document.getElementById('prankOverlay');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext && confettiCanvas.getContext('2d');

  // Defensive checks
  if (!loginOverlay || !loginForm || !loginUser || !loginPass) {
    console.warn('Login elements missing — login disabled.');
  }

  // Realistic credentials for the demo (only client-side)
  const DEMO_USER = 'admin';
  const DEMO_PASS = 'admin1';

  // Helper: show a short message (and optionally shake)
  function showLoginMessage(text, isError){
    loginMsg.textContent = text || '';
    loginMsg.style.color = isError ? '#ffb3b3' : '#bfe8c7';
    if (isError) {
      const card = document.querySelector('.loginCard');
      if (card) {
        card.classList.remove('shake');
        // trigger reflow to restart animation
        void card.offsetWidth;
        card.classList.add('shake');
      }
    }
  }

  // Demo credentials button (fills fields)
  demoBtn && demoBtn.addEventListener('click', () => {
    loginUser.value = DEMO_USER;
    loginPass.value = DEMO_PASS;
    showLoginMessage('Demo credentials filled. Press Sign in.', false);
  });

  // Handle login submission (client-side only)
  loginForm && loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    const u = (loginUser.value || '').trim();
    const p = (loginPass.value || '').trim();

    showLoginMessage('Verifying...', false);

    // small fake delay to feel realistic
    setTimeout(() => {
      if (u === DEMO_USER && p === DEMO_PASS) {
        showLoginMessage('Access granted — unlocking stream...', false);
        // hide overlay and start simulation
        loginOverlay && (loginOverlay.style.display = 'none');
        startSimulationAfterAuth();
      } else {
        showLoginMessage('Invalid credentials. Try again.', true);
        // clear password field for safety
        loginPass.value = '';
      }
    }, 800);
  });

  // Allow Enter/Esc convenience
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') {
      // do nothing, keep overlay until correct login
    }
  });

  // ========================
  // WATCH SIMULATION
  // ========================

  // If user bypassed login (e.g., editing files), start simulation anyway
  function startSimulationAfterAuth(){
    // bootstrap / enable UI and simulation
    initCanvas();
    requestAnimationFrame(tick);
  }

  // If the page loads and login overlay is hidden manually, allow starting
  if (loginOverlay && getComputedStyle(loginOverlay).display === 'none') {
    startSimulationAfterAuth();
  }

  // Canvas / simulation (lightweight, same as before)
  if (!canvas || !ctx) {
    console.error('Canvas not found; simulation cannot run.');
    return;
  }

  function sizeCanvas(){
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(640, Math.floor(rect.width * ratio));
    canvas.height = Math.max(360, Math.floor(rect.width * 9/16 * ratio));
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  let running = true;
  let elapsedSec = 0;
  let progress = 0.24;
  let viewers = 1024 + Math.floor(Math.random()*500);
  let lastTick = performance.now();
  const objects = [];

  function spawnObjects(){
    objects.length = 0;
    for (let i=0;i<6;i++){
      objects.push({
        x: 100 + i*120,
        y: 180 + Math.sin(i)*20,
        vx: (Math.random()*1.2 - 0.6),
        vy: 0,
        w: 36,
        h: 36,
        color: `hsl(${Math.floor(Math.random()*360)},70%,60%)`
      });
    }
  }
  spawnObjects();

  const chatPool = [
    "Nice shot!", "Where did you get that skin?", "This map is insane", "gg", "No way!",
    "Who else is playing tonight?", "Teach me that trick!", "This sim looks legit", "🔥🔥🔥",
    "Streamer, pls nerf!", "Loot spawn was stacked", "That was epic"
  ];

  function tick(now){
    const dt = Math.min(60, now - lastTick)/1000;
    lastTick = now;

    if (running) {
      elapsedSec += dt;
      progress += dt * 0.003;
      if (progress > 1) progress = 1;

      viewers += (Math.random() - 0.48) * 4;
      viewers = Math.max(10, Math.round(viewers));

      for (const o of objects){
        o.x += o.vx * (dt*60);
        o.y += Math.sin((now/600) + o.x/600)*0.5;
        if (o.x < 20 || o.x > canvas.width - 60) o.vx *= -1;
      }
      if (Math.random() < 0.02){
        objects.push({
          x: Math.random()*(canvas.width-80)+40,
          y: 0,
          vx: (Math.random()-0.5)*6,
          vy: 2 + Math.random()*4,
          w: 8,
          h: 8,
          color: '#ffd86b',
          life: 3
        });
      }
    }

    render();
    requestAnimationFrame(tick);
  }

  function render(){
    ctx.fillStyle = '#07121a';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const grad = ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,'#07121a');
    grad.addColorStop(1,'#0b1a24');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (let x=0;x<canvas.width;x+=60){
      ctx.beginPath();
      ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }

    for (let i = objects.length-1; i >= 0; i--){
      const o = objects[i];
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.fillStyle = o.color || '#fff';
      roundRect(ctx, -o.w/2, -o.h/2, o.w, o.h, 6);
      ctx.fill();
      ctx.restore();

      if (o.life !== undefined){
        o.vy += 0.12;
        o.x += o.vx;
        o.y += o.vy;
        o.life -= 0.02;
        if (o.y > canvas.height + 40 || o.life < 0) objects.splice(i,1);
      }
    }

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(14, canvas.height - 84, 160, 70);
    ctx.fillStyle = '#cfe8ff';
    ctx.font = `${14 * (canvas.width/960)}px Inter, monospace`;
    ctx.fillText('MINI-MAP', 24, canvas.height - 60);

    for (const o of objects.slice(0,6)){
      ctx.fillStyle = '#ffcc00';
      const mx = 24 + ((o.x / canvas.width) * 120);
      const my = canvas.height - 40 + ((o.y / canvas.height) * 28);
      ctx.fillRect(mx, my, 4, 4);
    }

    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(canvas.width - 220, 12, 200, 46);
    ctx.fillStyle = '#fff';
    ctx.font = `${16 * (canvas.width/960)}px Inter, sans-serif`;
    ctx.fillText(`${viewers.toLocaleString()} watching`, canvas.width - 200, 38);

    progressFill.style.width = Math.round(progress*100)+'%';
    elapsedEl.textContent = formatTime(Math.floor(elapsedSec));
    viewerEl.textContent = viewers.toLocaleString();
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function formatTime(s){
    const hh = Math.floor(s/3600);
    const mm = Math.floor((s%3600)/60);
    const ss = s%60;
    if (hh>0) return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
    return `${pad(mm)}:${pad(ss)}`;
  }
  function pad(n){return n.toString().padStart(2,'0')}

  playPauseBtn && playPauseBtn.addEventListener('click', () => {
    running = !running;
    playPauseBtn.textContent = running ? '⏸ Pause' : '▶ Play';
  });

  qualitySelect && qualitySelect.addEventListener('change', () => {
    const q = qualitySelect.value;
    if (q.includes('1080')) spawnObjects();
    if (q.includes('480')) objects.splice(3, objects.length-3);
  });

  let followed = false, subscribed = false;
  followBtn && followBtn.addEventListener('click', ()=>{
    followed = !followed;
    followBtn.textContent = followed ? 'Following' : 'Follow';
    followBtn.style.background = followed ? 'linear-gradient(90deg,#3ad, #8ef)' : '';
  });
  subscribeBtn && subscribeBtn.addEventListener('click', ()=>{
    subscribed = !subscribed;
    subscribeBtn.textContent = subscribed ? 'Subscribed' : 'Subscribe';
    subscribeBtn.classList.toggle('outline', !subscribed);
  });

  // Join server button (opens real link)
  joinServerBtn && joinServerBtn.addEventListener('click', ()=>{
    // Change the URL below to your real invite link
    window.open('https://discord.gg/Wx5hQ3wVjG', '_blank');
  });

  // Chat
  function pushChat(author, text){
    const el = document.createElement('div');
    el.className = 'chatMsg';
    el.innerHTML = `<span class="chatMeta">${escapeHtml(author)}</span> ${escapeHtml(text)}`;
    chatBox && chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  const seed = [
    ['Vex', 'Yo, that movement is slick.'],
    ['Nova', 'What settings you using?'],
    ['Lurk', 'This sim looks clean ngl'],
    ['Shadow', 'pog'],
    ['GamerKid', 'where u from?']
  ];
  seed.forEach((s,i)=>setTimeout(()=>pushChat(s[0], s[1]), 800 + i*700));

  const chatPool = [
    "Nice shot!", "Where did you get that skin?", "This map is insane", "gg", "No way!",
    "Who else is playing tonight?", "Teach me that trick!", "This sim looks legit", "🔥🔥🔥",
    "Streamer, pls nerf!", "Loot spawn was stacked", "That was epic"
  ];

  setInterval(()=>{
    if (Math.random() < 0.7) {
      const nick = ['Rex','Vex','Nova','Lurk','Shadow','GamerKid','Ace'][Math.floor(Math.random()*7)];
      const msg = chatPool[Math.floor(Math.random()*chatPool.length)];
      pushChat(nick, msg);
    }
  }, 2200);

  sendChat && sendChat.addEventListener('click', ()=> {
    const v = chatField.value.trim();
    if (!v) return;
    pushChat('You', v);
    chatField.value = '';
  });
  chatField && chatField.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter') { e.preventDefault(); sendChat.click(); }
  });

  function escapeHtml(t){ return t.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  setInterval(()=>{
    if (Math.random() < 0.12) {
      viewers += Math.floor(20 + Math.random()*200);
      setTimeout(()=>{ viewers = Math.max(300, viewers - Math.floor(5 + Math.random()*250)); }, 5000 + Math.random()*8000);
    }
  }, 3000);

  // PRANK OVERLAY + CONFETTI (same as before)
  function revealPrank(){ if (prankOverlay) prankOverlay.classList.remove('hidden'); startConfetti(); }
  function hidePrank(){ if (prankOverlay) prankOverlay.classList.add('hidden'); stopConfetti(); }

  document.addEventListener('click', (e)=>{
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.id === 'prankReveal') revealPrank();
    if (t.id === 'closePrank') hidePrank();
    if (t.id === 'confettiBtn') startConfetti();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') hidePrank(); });

  function sizeConfetti(){ if (!confettiCanvas) return; const r = window.devicePixelRatio || 1; confettiCanvas.width = innerWidth * r; confettiCanvas.height = innerHeight * r; }
  window.addEventListener('resize', sizeConfetti);
  sizeConfetti();

  let confettiArr = [], confettiRun = false;
  function createConfetti(n=120){
    const w = confettiCanvas.width, h = confettiCanvas.height;
    confettiArr = [];
    const palette = ['#ffcc00','#ffd86b','#ff6b6b','#6be5ff','#b36bff','#7ef07a'];
    for (let i=0;i<n;i++){
      confettiArr.push({
        x: Math.random()*w,
        y: (Math.random()*-h),
        w: 6 + Math.random()*10,
        h: 6 + Math.random()*12,
        vx: -1 + Math.random()*2.5,
        vy: 2 + Math.random()*5,
        rot: Math.random()*360,
        rotSpeed: -4 + Math.random()*8,
        color: palette[Math.floor(Math.random()*palette.length)]
      });
    }
  }
  function startConfetti(){
    if (!confettiCtx || confettiRun) return;
    confettiRun = true;
    createConfetti(140);
    requestAnimationFrame(confettiLoop);
  }
  function stopConfetti(){ confettiRun = false; confettiArr = []; if (confettiCtx) confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }
  function confettiLoop(){
    if (!confettiRun || !confettiCtx) return;
    confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
    for (const p of confettiArr){
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rot += p.rotSpeed;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot * Math.PI/180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      confettiCtx.restore();

      if (p.y > confettiCanvas.height + 30){
        p.x = Math.random()*confettiCanvas.width;
        p.y = -20 - Math.random()*200;
        p.vy = 2 + Math.random()*3;
      }
    }
    requestAnimationFrame(confettiLoop);
  }

  // Initialize canvas & simulation
  function initCanvas(){ sizeCanvas(); spawnObjects(); lastTick = performance.now(); }

  // If you want the login overlay to be bypassable while testing, uncomment:
  // loginOverlay.style.display = 'none'; startSimulationAfterAuth();

})();

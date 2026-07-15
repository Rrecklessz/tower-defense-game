// ════════════════════════════════════════════════════════
//  UI — HUD, Shop, Hero Panel, Popups, Combo, Boss Bar
// ════════════════════════════════════════════════════════

// ── State ─────────────────────────────────────────────
let comboCount = 0, comboTimer = 0, comboMultiplier = 1;
let killGoldBonus = 1;
let shopBought = new Set();
let pendingSell = null;
let gameSpeed = 1;
let paused = false;
let heroLevel = 1, heroXP = 0, heroXPNext = 100;
let heroDPS = 25, heroRange = 4.5, heroCD = 0, heroMaxCD = 60;
let heroPlaced = false, heroMesh = null;
let shakeIntensity = 0;
let dayTick = 0;
let rangeRings = new Map();

const COMBO_WINDOW = 90;
const COMBO_COLS = ['#EF9F27','#ff8822','#ff5522','#ff2266','#cc00ff'];
const COMBO_LABELS = ['COMBO!','KILLING SPREE!','RAMPAGE!','GODLIKE!','BEYOND GODLIKE!'];

// ── Gold / Damage Popups ───────────────────────────────
function goldPopup(text, x3d, y3d, z3d, col='#EF9F27') {
  const vec = new THREE.Vector3(x3d, y3d+1.5, z3d);
  vec.project(camera);
  const sx = (vec.x*.5+.5)*window.innerWidth;
  const sy = (-vec.y*.5+.5)*window.innerHeight;
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `position:absolute;left:${sx}px;top:${sy}px;
    font-size:13px;font-weight:700;color:${col};
    text-shadow:0 0 8px ${col}88,0 1px 3px rgba(0,0,0,.9);
    pointer-events:none;transform:translateX(-50%);
    animation:goldPop .9s forwards ease-out;white-space:nowrap;letter-spacing:.5px;`;
  document.getElementById('popups').appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ── Combo System ──────────────────────────────────────
function addCombo() {
  comboCount++; comboTimer = COMBO_WINDOW;
  if (comboCount >= 3) {
    comboMultiplier = Math.min(5, 1+Math.floor((comboCount-2)*.5));
    const idx = Math.min(comboCount-3, COMBO_COLS.length-1);
    const col = COMBO_COLS[idx];
    const cn = document.getElementById('combo-num');
    const cl = document.getElementById('combo-lbl');
    if (cn) { cn.textContent = 'x'+comboCount; cn.style.color=col; }
    if (cl) { cl.textContent = COMBO_LABELS[Math.min(idx, COMBO_LABELS.length-1)]; cl.style.color=col; }
    document.getElementById('combo-display').classList.add('show');
  }
}

function updateCombo() {
  if (comboTimer > 0) {
    comboTimer--;
    if (comboTimer <= 0) {
      comboCount=0; comboMultiplier=1;
      document.getElementById('combo-display').classList.remove('show');
    }
  }
}

// ── Boss Bar ──────────────────────────────────────────
function updateBossBar(enemies) {
  const boss = enemies.find(e=>!e.dead&&e.isBoss);
  const bar = document.getElementById('boss-bar');
  if (boss) {
    bar.classList.add('show');
    document.getElementById('bb-fill').style.width = Math.max(0,boss.hp/boss.maxHp*100)+'%';
    document.getElementById('bb-name').textContent =
      '👹 '+boss.type+'  '+Math.floor(boss.hp).toLocaleString()+' HP remaining';
  } else {
    bar.classList.remove('show');
  }
}

// ── Wave Preview ──────────────────────────────────────
function updateWavePreview() {
  if (!race || !eSet) return;
  const nextIdx = Math.min(wave, WAVE_DEFS.length-1);
  const wd = WAVE_DEFS[nextIdx];
  const eb = eSet[Math.min(wd.ei, eSet.length-1)];
  const hs = wd.s*(1+(wave+1)*.08);
  document.getElementById('wp-content').textContent =
    `${wd.n}× ${eb.type} · HP ${Math.floor(eb.hp*hs)} · +${eb.reward}g each`;
}

// ── Lives ─────────────────────────────────────────────
function updateLives() {
  for(let i=1;i<=5;i++){
    const h=document.getElementById('h'+i);
    if(h) h.className='ht'+(i>lives?' e':'');
  }
}

// ── Message ───────────────────────────────────────────
function setMsg(m) { document.getElementById('msg').textContent=m; }

// ── Tower Bar ─────────────────────────────────────────
function buildTowerBar() {
  const bar = document.getElementById('trow'); bar.innerHTML='';
  RACES[race].towers.forEach(t=>{
    const d = document.createElement('div');
    d.className='tb'+(t.id===selT?' act':'');
    d.id='tbtn-'+t.id;
    const hex='#'+t.col.toString(16).padStart(6,'0');
    d.style.borderColor=t.id===selT?hex:'#2a1a08';
    d.innerHTML=`<span class="tn">${t.ico} ${t.name}</span><span class="tc">${t.cost}g · r${t.range}</span>`;
    d.onclick=()=>selectTower(t.id);
    bar.appendChild(d);
  });
  const s=document.createElement('div'); s.className='tb'; s.id='tbtn-sell';
  s.innerHTML='<span class="tn">🪙 Sell</span><span class="tc">½ price</span>';
  s.onclick=()=>selectTower('sell');
  bar.appendChild(s);
}

function selectTower(id) {
  selT=id;
  RACES[race].towers.forEach(t=>{
    const el=document.getElementById('tbtn-'+t.id);
    if(el){el.className='tb'+(id===t.id?' act':'');el.style.borderColor=id===t.id?('#'+t.col.toString(16).padStart(6,'0')):'#2a1a08';}
  });
  const s=document.getElementById('tbtn-sell');
  if(s){s.className='tb'+(id==='sell'?' act':'');s.style.borderColor=id==='sell'?'#8a5010':'#2a1a08';}
  if(id!=='sell'){
    const def=getTowerDef(id);
    if(def){
      const pi=document.getElementById('placement-info');
      pi.textContent=def.ico+' '+def.name+' — '+def.cost+'g · Range '+def.range;
      pi.classList.add('show');
      setTimeout(()=>pi.classList.remove('show'),2400);
    }
  }
}

// ── Wave countdown ────────────────────────────────────
let waveCountTimer=12, waveInterval=null;
function startCountdown() {
  if (wave > 0) openShop();
  updateWavePreview();
  waveCountTimer=12;
  document.getElementById('wf').style.width='100%';
  clearInterval(waveInterval);
  waveInterval=setInterval(()=>{
    waveCountTimer--;
    document.getElementById('wt').textContent=waveCountTimer;
    document.getElementById('wf').style.width=(waveCountTimer/12*100)+'%';
    if(waveCountTimer<=0){clearInterval(waveInterval);sendWave();}
  },1000);
}

// ── War Council Shop ──────────────────────────────────
function openShop() {
  document.getElementById('ws-gold-num').textContent=Math.floor(gold);
  const cont=document.getElementById('shop-items'); cont.innerHTML='';
  SHOP_ITEMS.forEach(item=>{
    const div=document.createElement('div');
    div.className='shop-item'+(shopBought.has(item.id)?' bought':'');
    div.innerHTML=`<div class="si-ico">${item.ico}</div>
      <div class="si-info"><div class="si-name">${item.name}</div><div class="si-desc">${item.desc}</div></div>
      <div class="si-cost">${item.cost}g</div>`;
    div.onclick=()=>buyShopItem(item, div);
    cont.appendChild(div);
  });
  document.getElementById('wave-shop').classList.add('show');
}

function closeShop() {
  document.getElementById('wave-shop').classList.remove('show');
  shopBought.clear();
  killGoldBonus=1;
}

function buyShopItem(item, el) {
  if(gold<item.cost){setMsg('Need '+item.cost+'g!');return;}
  gold-=item.cost;
  document.getElementById('gnum').textContent=Math.floor(gold);
  document.getElementById('ws-gold-num').textContent=Math.floor(gold);
  applyShopEffect(item.id);
  if(item.once) shopBought.add(item.id);
  el.classList.add('bought');
  setMsg('✅ '+item.name+' purchased!');
}

function applyShopEffect(id) {
  switch(id){
    case 'dmg':   towerMap.forEach(t=>{t.data.dps=Math.floor(t.data.dps*1.25);}); break;
    case 'range': towerMap.forEach(t=>{t.data.range*=1.15;}); break;
    case 'speed': towerMap.forEach(t=>{t.data.maxCd=Math.max(8,Math.floor(t.data.maxCd*.8));}); break;
    case 'gold':  killGoldBonus=1.5; break;
    case 'lives': lives=Math.min(5,lives+2); updateLives(); break;
    case 'hero':  if(heroPlaced){heroXP=heroXPNext; heroGainXP(0);}else setMsg('Place your hero first!'); break;
  }
}

// ── Sell Confirm ──────────────────────────────────────
function showSellConfirm(key, tData) {
  pendingSell=key;
  const price=Math.floor(tData.totalCost*.5);
  document.getElementById('sc-title').textContent='Sell '+tData.name+'?';
  document.getElementById('sc-price').textContent='You receive: '+price+'g';
  document.getElementById('sell-confirm').classList.add('show');
}

function confirmSell() {
  if(!pendingSell)return;
  const ex=towerMap.get(pendingSell);
  if(ex){
    gold+=Math.floor(ex.data.totalCost*.5);
    scene.remove(ex.mesh); towerMap.delete(pendingSell);
    document.getElementById('gnum').textContent=Math.floor(gold);
    document.getElementById('st').textContent=towerMap.size;
    setMsg('Sold for '+Math.floor(ex.data.totalCost*.5)+'g');
  }
  pendingSell=null;
  document.getElementById('sell-confirm').classList.remove('show');
}

function cancelSell() {
  pendingSell=null;
  document.getElementById('sell-confirm').classList.remove('show');
}

// ── Speed / Pause ─────────────────────────────────────
function togglePause() {
  paused=!paused;
  const btn=document.getElementById('pause-btn');
  if(btn){btn.textContent=paused?'▶ Resume':'⏸ Pause'; btn.classList.toggle('on',paused);}
  setMsg(paused?'⏸ Paused':'Resumed!');
}

function cycleSpeed() {
  gameSpeed=gameSpeed===1?2:gameSpeed===2?3:1;
  const btn=document.getElementById('speed-btn');
  if(btn){btn.textContent='▶ '+gameSpeed+'×'; btn.classList.toggle('on',gameSpeed>1);}
  setMsg('Game speed: '+gameSpeed+'×');
}

// ── Hero System ───────────────────────────────────────
function placeHero() {
  if(heroPlaced){setMsg('Hero already on the field!');return;}
  const mid=Math.floor(RAW_PATH.length/2);
  const pos=pathPos(mid).clone(); pos.x+=1.8; pos.y=0;
  heroMesh=buildHeroMesh();
  heroMesh.position.copy(pos);
  scene.add(heroMesh);
  heroPlaced=true;
  document.getElementById('hero-btn').textContent='On the field';
  document.getElementById('hero-btn').style.color='#3B6D11';
  setMsg(HERO_DATA[race].name+' deployed! Auto-attacks enemies in range.');
}

function updateHero(enemies) {
  if(!heroPlaced||!heroMesh)return;
  if(heroMesh.userData.orb){heroMesh.userData.orb.rotation.y+=.04;heroMesh.userData.orb.rotation.x+=.02;}
  if(heroMesh.userData.ring) heroMesh.userData.ring.rotation.z+=.022;
  if(heroMesh.userData.glow) heroMesh.userData.glow.intensity=1.4+Math.sin(tick*.06)*.4;
  if(heroCD>0){heroCD--;return;}
  const hpos=heroMesh.position.clone();
  const near=enemies.filter(e=>!e.dead&&e.mesh.position.distanceTo(hpos)<heroRange);
  if(!near.length)return;
  const tgt=near.reduce((a,b)=>b.pi>a.pi?b:a);
  heroCD=heroMaxCD;
  heroMesh.rotation.y=Math.atan2(tgt.mesh.position.x-hpos.x,tgt.mesh.position.z-hpos.z);
  const pr=makeProjectile(HERO_DATA[race].projCol);
  const sp=heroMesh.position.clone(); sp.y=1.4;
  pr.position.copy(sp);
  projectiles.push({g:pr,tgt,tower:{dps:heroDPS,splash:false,chain:false,projCol:HERO_DATA[race].projCol,slow:false},spd:.26,dead:false});
}

function heroGainXP(amount) {
  if(!heroPlaced)return;
  heroXP+=amount;
  while(heroXP>=heroXPNext){
    heroXP-=heroXPNext; heroLevel++;
    heroXPNext=Math.floor(heroXPNext*1.5);
    heroDPS=Math.floor(heroDPS*1.45);
    heroRange*=1.1; heroMaxCD=Math.max(25,heroMaxCD-4);
    if(heroMesh&&heroMesh.userData.glow){heroMesh.userData.glow.intensity=9;setTimeout(()=>{if(heroMesh&&heroMesh.userData.glow)heroMesh.userData.glow.intensity=1.6;},400);}
    if(heroMesh) spawnParticles(heroMesh.position,HERO_DATA[race].projCol,20,'spell');
    setMsg('🌟 '+HERO_DATA[race].name+' → Level '+heroLevel+'! DPS: '+heroDPS);
    if(heroMesh) goldPopup('LEVEL UP!',heroMesh.position.x,heroMesh.position.y,heroMesh.position.z,'#EF9F27');
  }
  const pct=Math.min(100,(heroXP/heroXPNext)*100);
  const xpf=document.getElementById('hxpf'); if(xpf)xpf.style.width=pct+'%';
  const xlbl=document.getElementById('hxplbl'); if(xlbl)xlbl.textContent='XP: '+heroXP+'/'+heroXPNext;
  const hs=document.getElementById('hstat'); if(hs)hs.textContent='DPS: '+heroDPS+' · Range: '+heroRange.toFixed(1)+' · Lv.'+heroLevel;
}

function showHeroPanel() {
  const hd=HERO_DATA[race];
  const panel=document.getElementById('hero-panel');
  document.getElementById('hero-ico').textContent=hd.ico;
  document.getElementById('hero-name').textContent=hd.name;
  panel.style.display='flex';
}

// ── Interest ──────────────────────────────────────────
function giveInterest() {
  if(gold<50)return;
  const interest=Math.min(Math.floor(gold*.08),40);
  if(interest<=0)return;
  gold+=interest;
  document.getElementById('gnum').textContent=Math.floor(gold);
  const badge=document.getElementById('interest-badge');
  if(badge){badge.textContent='📈+'+interest+'g';setTimeout(()=>{badge.textContent='';},3000);}
}

// ── Day/Night ─────────────────────────────────────────
function updateDayNight() {
  if(!race)return;
  dayTick++;
  const t=(Math.sin(dayTick/1800*Math.PI)+1)/2;
  sunLight.intensity=2.0-t*.85;
  ambLight.intensity=.55-t*.28;
  const rd=RACES[race];
  const skyCol=new THREE.Color(rd.sky);
  const nightCol=new THREE.Color(rd.sky).multiplyScalar(.28);
  scene.background=skyCol.lerp(nightCol,t*.65);
}

// ── Screen Shake ──────────────────────────────────────
function triggerShake(intensity) { shakeIntensity=Math.max(shakeIntensity,intensity); }
function updateShake() {
  if(shakeIntensity<.01)return;
  camera.position.x=Math.sin(tick*8.3)*shakeIntensity+Math.sin(tick*13.7)*shakeIntensity*.5;
  camera.position.z=24+Math.cos(tick*7.1)*shakeIntensity*.4;
  shakeIntensity*=.8;
}

// ── Range Rings ───────────────────────────────────────
function showRangeRings() {
  rangeRings.forEach(r=>scene.remove(r)); rangeRings.clear();
  towerMap.forEach((tw,key)=>{
    const pos=tilePos(tw.data.c,tw.data.r);
    const geo=new THREE.TorusGeometry(tw.data.range,.055,6,48);
    const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(tw.data.projCol||0xffffff),transparent:true,opacity:.3,depthWrite:false});
    const ring=new THREE.Mesh(geo,mat);
    ring.rotation.x=Math.PI/2; ring.position.set(pos.x,.24,pos.z); ring.renderOrder=5;
    scene.add(ring); rangeRings.set(key,ring);
  });
}

function clearRangeRings() { rangeRings.forEach(r=>scene.remove(r)); rangeRings.clear(); }

// ── Game Over ─────────────────────────────────────────
function showGameOver(win) {
  document.getElementById('go-t').textContent=win?'🏆 VICTORY!':'💀 GAME OVER';
  document.getElementById('go-t').style.color=win?'#EF9F27':'#E24B4A';
  document.getElementById('go-b').textContent=win?'All waves defeated! Score: '+score:'Overrun on wave '+wave+'. Score: '+score;
  document.getElementById('go').classList.add('show');
}

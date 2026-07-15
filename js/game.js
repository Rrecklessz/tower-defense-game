// ════════════════════════════════════════════════════════
//  GAME — Main loop, Three.js setup, Input, Wave logic
// ════════════════════════════════════════════════════════

// ── Three.js setup ────────────────────────────────────
const cv = document.getElementById('cvs');
const renderer = new THREE.WebGLRenderer({canvas:cv, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40,1,.1,400);
camera.position.set(0,28,24);
camera.lookAt(0,0,-2);

const ambLight = new THREE.AmbientLight(0x334466,.55); scene.add(ambLight);
const sunLight = new THREE.DirectionalLight(0xfff4e0,2.0);
sunLight.position.set(12,30,16); sunLight.castShadow=true;
sunLight.shadow.mapSize.set(2048,2048);
sunLight.shadow.camera.left=-30; sunLight.shadow.camera.right=30;
sunLight.shadow.camera.top=30;   sunLight.shadow.camera.bottom=-30;
sunLight.shadow.camera.far=100;  sunLight.shadow.bias=-.001;
scene.add(sunLight);
const rimLight = new THREE.DirectionalLight(0x2244aa,.4); rimLight.position.set(-10,12,-16); scene.add(rimLight);
const fillLight = new THREE.DirectionalLight(0xaa8844,.2); fillLight.position.set(6,6,18); scene.add(fillLight);

// ── Game State ────────────────────────────────────────
let race=null, selT=null;
let gold=150, lives=5, wave=0, kills=0, score=0;
let towerMap=new Map(), enemies=[];
let waveActive=false, gOver=false, tick=0;
let eSet=null;

// ── Raycasting ────────────────────────────────────────
const ray=new THREE.Raycaster(), mo=new THREE.Vector2();

function getHit(ev) {
  const r=cv.getBoundingClientRect();
  const cx=ev.touches?ev.touches[0].clientX:ev.clientX;
  const cy=ev.touches?ev.touches[0].clientY:ev.clientY;
  mo.x=((cx-r.left)/r.width)*2-1;
  mo.y=-((cy-r.top)/r.height)*2+1;
  ray.setFromCamera(mo,camera);
  const hits=ray.intersectObjects(worldMeshes,false);
  for(const h of hits) if(h.object.userData&&h.object.userData.c!==undefined) return h.object.userData;
  return null;
}

function getTowerDef(id) { return RACES[race]&&RACES[race].towers.find(t=>t.id===id); }

// ── Input ─────────────────────────────────────────────
cv.addEventListener('mousemove', ev=>{
  if(!race)return;
  const t=getHit(ev);
  if(t&&!t.isPath&&!towerMap.has(t.c+','+t.r)){
    const pos=tilePos(t.c,t.r);
    hoverMesh.position.set(pos.x,.02,pos.z); hoverMesh.visible=true;
    const def=getTowerDef(selT);
    if(def) hoverMesh.material.color.setHex(def.projCol||0x88ff44);
    showRangeRings();
  } else {
    if(hoverMesh) hoverMesh.visible=false;
    clearRangeRings();
  }
});

cv.addEventListener('mouseleave',()=>{
  if(hoverMesh) hoverMesh.visible=false;
  clearRangeRings();
});

function handleTap(ev) {
  if(gOver||!race)return;
  const t=getHit(ev); if(!t)return;
  const{c,r}=t, key=c+','+r;
  const ex=towerMap.get(key);
  if(ex){
    if(selT==='sell'){ showSellConfirm(key,ex.data); return; }
    if(ex.data.level>=3){setMsg('Already max level 3!');return;}
    if(gold<60){setMsg('Need 60g to upgrade!');return;}
    gold-=60; ex.data.level++; ex.data.dps*=1.7; ex.data.range*=1.12; ex.data.totalCost+=60;
    scene.remove(ex.mesh);
    const nm=buildTowerMesh(ex.data,ex.data.level);
    nm.position.copy(tilePos(c,r)); scene.add(nm); ex.mesh=nm;
    document.getElementById('gnum').textContent=Math.floor(gold);
    setMsg(ex.data.name+' → Level '+ex.data.level+' ★ (+70% DPS)');
    return;
  }
  if(t.isPath){setMsg("Can't build on the path!");return;}
  if(selT==='sell'){setMsg('No tower here.');return;}
  const def=getTowerDef(selT); if(!def)return;
  if(gold<def.cost){setMsg('Need '+def.cost+'g for '+def.name+'!');return;}
  gold-=def.cost;
  const td={...def,level:1,cd:0,totalCost:def.cost,c,r};
  const m=buildTowerMesh(def,1); m.position.copy(tilePos(c,r)); scene.add(m);
  towerMap.set(key,{data:td,mesh:m});
  document.getElementById('gnum').textContent=Math.floor(gold);
  document.getElementById('st').textContent=towerMap.size;
  setMsg(def.ico+' '+def.name+' placed · r'+def.range+' · tap again to upgrade (60g)');
  if('vibrate'in navigator) navigator.vibrate(8);
}

cv.addEventListener('click', handleTap);
cv.addEventListener('touchend', ev=>{ ev.preventDefault(); handleTap(ev); },{passive:false});

// ── Wave Logic ────────────────────────────────────────
function sendWave() {
  if(waveActive||gOver)return;
  giveInterest();
  closeShop();
  waveActive=true; clearInterval(waveInterval);
  wave++;
  document.getElementById('wnum').textContent=wave;
  document.getElementById('sw2').textContent=wave;
  const wd=WAVE_DEFS[Math.min(wave-1,WAVE_DEFS.length-1)];
  const eb=eSet[Math.min(wd.ei,eSet.length-1)];
  const hs=wd.s*(1+wave*.08);
  for(let i=0;i<wd.n;i++){
    setTimeout(()=>{
      if(gOver)return;
      const sp=pathPos(0).clone(); sp.y=0;
      const mesh=buildEnemyMesh(eb); mesh.position.copy(sp); scene.add(mesh);
      enemies.push({pi:0,mesh,hp:Math.floor(eb.hp*hs),maxHp:Math.floor(eb.hp*hs),
        spd:eb.spd,reward:eb.reward,type:eb.type,isBoss:eb.isBoss||false,
        slow:0,dead:false,id:Math.random(),bob:Math.random()*Math.PI*2,walkPhase:Math.random()*Math.PI*2});
    },i*700);
  }
  setMsg('⚔ Wave '+wave+' · '+wd.n+'× '+eb.type+' incoming!');
}

// ── Kill Enemy ────────────────────────────────────────
function killEnemy(e) {
  if(e.dead)return; e.dead=true;
  kills++; score+=e.reward*10;
  const bonusGold=Math.floor(e.reward*comboMultiplier*killGoldBonus);
  gold+=bonusGold;
  addBloodDecal(e.mesh.position);
  spawnParticles(e.mesh.position,0x880000,e.isBoss?20:8,'blood');
  spawnParticles(e.mesh.position,0xff4400,e.isBoss?10:4,'spell');
  scene.remove(e.mesh);
  goldPopup('+'+bonusGold+'g',e.mesh.position.x,e.mesh.position.y,e.mesh.position.z,'#EF9F27');
  if(comboMultiplier>1) goldPopup('x'+comboMultiplier,e.mesh.position.x,e.mesh.position.y+.6,e.mesh.position.z,'#ff8822');
  document.getElementById('gnum').textContent=Math.floor(gold);
  document.getElementById('sk').textContent=kills;
  document.getElementById('ss').textContent=score;
  if(e.isBoss) triggerShake(.55);
  addCombo();
  heroGainXP(e.reward*2);
}

// ── Main Update ───────────────────────────────────────
function update() {
  if(paused)return;

  // Move enemies
  enemies.forEach(e=>{
    if(e.dead)return;
    if(e.pi>=RAW_PATH.length-1){
      lives=Math.max(0,lives-1); updateLives();
      addBloodDecal(e.mesh.position); scene.remove(e.mesh); e.dead=true;
      if(lives<=0&&!gOver){gOver=true; showGameOver(false);} return;
    }
    const nxt=pathPos(e.pi+1).clone(); nxt.y=0;
    const spd=e.slow>0?e.spd*.3:e.spd;
    const dir=nxt.clone().sub(e.mesh.position); const dist=dir.length();
    if(dist<spd+.05){e.pi++; e.mesh.position.copy(nxt);}
    else{dir.normalize().multiplyScalar(spd); e.mesh.position.add(dir); e.mesh.rotation.y=Math.atan2(dir.x,dir.z);}
    animateEnemy(e,tick);
    if(e.slow>0) e.slow--;
    updateEnemyHPBar(e);
  });
  enemies=enemies.filter(e=>!e.dead);

  // Tower attacks
  towerMap.forEach(({data:t,mesh:tm})=>{
    if(t.cd>0){t.cd--;return;}
    const tpos=tm.position.clone(); tpos.y=.9;
    const ir=enemies.filter(e=>!e.dead&&e.mesh.position.distanceTo(tpos)<t.range);
    if(!ir.length)return;
    const tgt=t.snipe?ir.reduce((a,b)=>b.hp>a.hp?b:a):ir.reduce((a,b)=>b.pi>a.pi?b:a);
    t.cd=t.maxCd;
    tm.rotation.y=Math.atan2(tgt.mesh.position.x-tm.position.x,tgt.mesh.position.z-tm.position.z);
    if(t.chain){
      let cur=tgt,hits=0,vis=new Set([cur.id]);
      while(cur&&hits<4){
        cur.hp-=t.dps; if(t.slow)cur.slow=t.slowA||70;
        spawnParticles(cur.mesh.position,t.projCol,5,'spell');
        if(cur.hp<=0)killEnemy(cur); hits++;
        const nx=enemies.filter(e=>!vis.has(e.id)&&!e.dead&&e.mesh.position.distanceTo(cur.mesh.position)<t.range*.45)[0];
        if(nx)vis.add(nx.id); cur=nx;
      }
    } else {
      const pr=makeProjectile(t.projCol);
      const sp=tm.position.clone(); sp.y=1.5+t.level*.35; pr.position.copy(sp);
      projectiles.push({g:pr,tgt,tower:t,spd:.22+Math.random()*.04,dead:false});
    }
  });

  updateProjectiles(enemies);
  updateParticles();
  animateTowers(tick);
  updateHero(enemies);
  updateCombo();
  updateBossBar(enemies);
  updateDayNight();
  updateShake();
  updateTorches(tick);

  // Wave end
  if(enemies.length===0&&waveActive&&projectiles.length===0){
    waveActive=false;
    const bonus=wave*15; gold+=bonus;
    document.getElementById('gnum').textContent=Math.floor(gold);
    if(wave>=WAVE_DEFS.length){gOver=true; showGameOver(true);}
    else{setMsg('✅ Wave '+wave+' cleared! +'+bonus+'g'); startCountdown();}
  }
}

// ── Start Game ────────────────────────────────────────
function startGame(r) {
  race=r;
  document.getElementById('rs').style.display='none';
  const rd=RACES[race];
  selT=rd.towers[0].id;
  document.getElementById('rbadge').textContent=rd.badge;
  document.getElementById('rbadge').style.color=rd.badgeCol;
  document.getElementById('gold-d').style.color=rd.badgeCol;
  document.getElementById('wf').style.background=rd.hexCol;
  const opp=(race==='ne'||race==='be')?'horde':'alliance';
  eSet=ENEMIES[opp];
  buildTerrain(rd);
  buildTowerBar();
  showHeroPanel();
  updateWavePreview();
  startCountdown();
}

// ── Resize ────────────────────────────────────────────
function resize() {
  const w=window.innerWidth, h=window.innerHeight;
  renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize); resize();

// ── Main Loop ─────────────────────────────────────────
function loop() {
  requestAnimationFrame(loop);
  if(race&&!gOver){
    const steps=paused?0:gameSpeed;
    for(let i=0;i<steps;i++){tick++;update();}
  }
  if(!paused){
    camera.position.x=Math.sin(tick*.00045)*1.4;
    camera.position.z=24+Math.sin(tick*.00032)*.6;
  }
  renderer.render(scene,camera);
}
loop();

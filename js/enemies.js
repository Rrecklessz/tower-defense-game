// ════════════════════════════════════════════════════════
//  ENEMIES — 3D Character Builder + Hero
// ════════════════════════════════════════════════════════

function buildEnemyMesh(eData) {
  const g = new THREE.Group();
  const big = eData.isBoss||false, sc = big?1.75:1.0;
  const bMat = new THREE.MeshPhongMaterial({color:eData.bCol,shininess:20});
  const hMat = new THREE.MeshPhongMaterial({color:eData.hCol,shininess:30});
  const darkMat = new THREE.MeshPhongMaterial({color:new THREE.Color(eData.bCol).multiplyScalar(.45),shininess:12});
  const eyeMat = new THREE.MeshPhongMaterial({color:0xff2200,emissive:0xff0000,emissiveIntensity:3.0});

  // Shadow
  const shad = new THREE.Mesh(new THREE.CircleGeometry(.4*sc,12),
    new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.5,depthWrite:false}));
  shad.rotation.x = -Math.PI/2; shad.position.y = .015; g.add(shad);

  // Feet
  [-.15,.15].forEach((ox,i)=>{
    const f = new THREE.Mesh(new THREE.BoxGeometry(.16*sc,.11*sc,.22*sc), darkMat);
    f.position.set(ox*sc,.055*sc,.05*sc); f.castShadow=true; g.add(f);
    g.userData['foot'+i] = f;
  });

  // Legs
  const legs = [];
  [-.12,.12].forEach((ox,i)=>{
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.08*sc,.1*sc,.34*sc,6), bMat);
    leg.position.set(ox*sc,.23*sc,0); leg.castShadow=true; g.add(leg); legs.push(leg);
  });
  g.userData.legs = legs;

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.22*sc,.28*sc,.48*sc,8), bMat);
  torso.position.y = .57*sc; torso.castShadow=true; g.add(torso);

  // Chest plate
  const chest = new THREE.Mesh(new THREE.BoxGeometry(.28*sc,.3*sc,.12*sc), darkMat);
  chest.position.set(0,.59*sc,.15*sc); chest.castShadow=true; g.add(chest);

  // Shoulders + arms
  const arms = [];
  [-.26,.26].forEach((ox,i)=>{
    const sh = new THREE.Mesh(new THREE.SphereGeometry(.14*sc,7,7), bMat);
    sh.position.set(ox*sc,.7*sc,0); sh.castShadow=true; g.add(sh);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.075*sc,.09*sc,.34*sc,6), bMat);
    arm.position.set(ox*sc,.53*sc,0); arm.rotation.z=ox>0?-.48:.48; arm.castShadow=true; g.add(arm); arms.push(arm);
  });
  g.userData.arms = arms;

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(.22*sc,9,9), hMat);
  head.position.y = .96*sc; head.castShadow=true; g.add(head); g.userData.head=head;

  // Helmet
  const helm = new THREE.Mesh(new THREE.CylinderGeometry(.23*sc,.22*sc,.1*sc,9), darkMat);
  helm.position.y = .96*sc; g.add(helm);

  // Eyes
  [-.09,.09].forEach(ox=>{
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.058*sc,6,6), eyeMat);
    eye.position.set(ox*sc,1.0*sc,.19*sc); g.add(eye);
  });

  // Boss extras
  if (big) {
    [-.22,.22].forEach(ox=>{
      const horn = new THREE.Mesh(new THREE.ConeGeometry(.09,.46,6),
        new THREE.MeshPhongMaterial({color:0x110800,shininess:10}));
      horn.position.set(ox,1.3*sc,.04); horn.rotation.z=ox<0?.42:-.42; g.add(horn);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(.07,.3,5), darkMat);
      spike.position.set(ox*.9,.84*sc,0); spike.rotation.z=ox<0?.8:-.8; g.add(spike);
    });
    const bGlow = new THREE.PointLight(new THREE.Color(eData.hCol).multiplyScalar(3),2.0,6.5);
    bGlow.position.y = .9*sc; g.add(bGlow);
  }

  // HP bar
  const hpBg = new THREE.Mesh(new THREE.PlaneGeometry(.76*sc,.12*sc),
    new THREE.MeshBasicMaterial({color:0x1a0000,depthWrite:false,transparent:true,opacity:.88}));
  const hpBar = new THREE.Mesh(new THREE.PlaneGeometry(.74*sc,.10*sc),
    new THREE.MeshBasicMaterial({color:0x22cc44,depthWrite:false,transparent:true,opacity:1}));
  const hpY = (big?2.42:1.5)*sc;
  hpBg.position.set(0,hpY,.01); hpBg.renderOrder=4; g.add(hpBg);
  hpBar.position.set(0,hpY,.02); hpBar.renderOrder=5; g.add(hpBar);
  g.userData.hpBar=hpBar; g.userData.hpBg=hpBg; g.userData.hpBarMat=hpBar.material; g.userData.sc=sc;
  return g;
}

function buildHeroMesh() {
  const hd = HERO_DATA[race];
  const g = new THREE.Group(), sc = 1.28;
  const col = new THREE.Color(hd.col);
  const mat = new THREE.MeshPhongMaterial({color:col,emissive:new THREE.Color(hd.em),emissiveIntensity:.4,shininess:70});
  const goldMat = new THREE.MeshPhongMaterial({color:0xEF9F27,emissive:0xBA7517,emissiveIntensity:.9});
  const darkMat = new THREE.MeshPhongMaterial({color:col.clone().multiplyScalar(.4),shininess:15});

  // Shadow
  const shad = new THREE.Mesh(new THREE.CircleGeometry(.44*sc,12),
    new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.55,depthWrite:false}));
  shad.rotation.x=-Math.PI/2; shad.position.y=.02; g.add(shad);

  // Legs
  const legs=[];
  [-.14,.14].forEach((ox,i)=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.08*sc,.1*sc,.38*sc,7),mat);
    leg.position.set(ox*sc,.25*sc,0); leg.castShadow=true; g.add(leg); legs.push(leg);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.15*sc,.12*sc,.22*sc),darkMat);
    boot.position.set(ox*sc,.06*sc,.05*sc); g.add(boot);
  });
  g.userData.legs=legs;

  // Cape
  const cape=new THREE.Mesh(new THREE.ConeGeometry(.38*sc,.72*sc,6),
    new THREE.MeshPhongMaterial({color:col.clone().multiplyScalar(.58),side:THREE.DoubleSide}));
  cape.position.set(0,.52*sc,-.09*sc); cape.rotation.x=.14; g.add(cape);

  // Torso
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.24*sc,.29*sc,.52*sc,8),mat);
  torso.position.y=.64*sc; torso.castShadow=true; g.add(torso);

  // Pauldrons + arms
  const arms=[];
  [-.3,.3].forEach((ox,i)=>{
    const sh=new THREE.Mesh(new THREE.SphereGeometry(.19*sc,8,8),goldMat);
    sh.position.set(ox*sc,.74*sc,0); sh.castShadow=true; g.add(sh);
    const spike=new THREE.Mesh(new THREE.ConeGeometry(.07*sc,.28*sc,5),goldMat);
    spike.position.set(ox*sc*.98,.92*sc,0); g.add(spike);
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.08*sc,.09*sc,.36*sc,7),mat);
    arm.position.set(ox*sc,.56*sc,0); arm.rotation.z=ox>0?-.5:.5; arm.castShadow=true; g.add(arm); arms.push(arm);
  });
  g.userData.arms=arms;

  // Head + helmet
  const head=new THREE.Mesh(new THREE.SphereGeometry(.24*sc,10,10),mat);
  head.position.y=1.04*sc; head.castShadow=true; g.add(head); g.userData.head=head;
  const helm=new THREE.Mesh(new THREE.CylinderGeometry(.26*sc,.24*sc,.18*sc,8),goldMat);
  helm.position.y=1.12*sc; g.add(helm);
  const crest=new THREE.Mesh(new THREE.ConeGeometry(.08*sc,.3*sc,5),goldMat);
  crest.position.y=1.3*sc; g.add(crest);

  // Eyes
  const pCol=new THREE.Color(hd.projCol);
  [-.1,.1].forEach(ox=>{
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.062*sc,6,6),
      new THREE.MeshPhongMaterial({color:0xffffff,emissive:pCol,emissiveIntensity:2.2}));
    eye.position.set(ox*sc,1.06*sc,.21*sc); g.add(eye);
  });

  // Weapon
  const wMat=new THREE.MeshPhongMaterial({color:0xcccccc,shininess:120,emissive:pCol,emissiveIntensity:.5});
  const staff=new THREE.Mesh(new THREE.CylinderGeometry(.05*sc,.06*sc,1.4*sc,6),darkMat);
  staff.position.set(.44*sc,.64*sc,0); staff.rotation.z=-.15; g.add(staff);
  const orb=new THREE.Mesh(new THREE.OctahedronGeometry(.2*sc,0),wMat);
  orb.position.set(.52*sc,1.36*sc,0); g.add(orb); g.userData.orb=orb;

  // Glow + ring
  const glow=new THREE.PointLight(hd.projCol,1.7,5.2);
  glow.position.y=.82*sc; g.add(glow); g.userData.glow=glow;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.56*sc,.042,8,24),
    new THREE.MeshPhongMaterial({color:pCol,emissive:pCol,emissiveIntensity:.9}));
  ring.rotation.x=Math.PI/2; ring.position.y=.045; g.add(ring); g.userData.ring=ring;

  return g;
}

function animateEnemy(e, tick) {
  e.walkPhase += e.spd*8;
  e.mesh.position.y = Math.abs(Math.sin(e.walkPhase))*.07;
  const legs=e.mesh.userData.legs;
  if(legs) legs.forEach((l,i)=>{ l.rotation.x=Math.sin(e.walkPhase+(i===0?0:Math.PI))*.3; });
  const arms=e.mesh.userData.arms;
  if(arms) arms.forEach((a,i)=>{ a.rotation.x=Math.sin(e.walkPhase+(i===0?Math.PI:0))*.24; });
}

function updateEnemyHPBar(e) {
  const pct=e.hp/e.maxHp;
  const hb=e.mesh.userData.hpBar;
  if(!hb)return;
  hb.scale.x=Math.max(.01,pct);
  const sc=e.mesh.userData.sc||1;
  hb.position.x=(pct-1)*.37*sc;
  e.mesh.userData.hpBarMat.color.setHex(pct>.6?0x22cc44:pct>.3?0xe67e22:0xe74c3c);
  const bg=e.mesh.userData.hpBg;
  if(bg){ bg.lookAt(camera.position); hb.lookAt(camera.position); }
}

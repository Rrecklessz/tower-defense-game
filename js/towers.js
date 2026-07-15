// ════════════════════════════════════════════════════════
//  TOWERS — 3D Mesh Builder
// ════════════════════════════════════════════════════════

function buildTowerMesh(def, level) {
  const g = new THREE.Group();
  const col = new THREE.Color(def.col);
  const em  = new THREE.Color(def.em);
  const sT  = stoneTex(def.col, 64);
  const mat = new THREE.MeshPhongMaterial({map:sT, color:col, emissive:em, emissiveIntensity:.32, shininess:55});
  const dkMat = new THREE.MeshPhongMaterial({color:col.clone().multiplyScalar(.42), emissive:em, emissiveIntensity:.1, shininess:15});
  const h = .65 + level*.42;

  // Foundation platform
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.78,.96,.24,8), dkMat);
  base.position.y = .12; base.castShadow = true; base.receiveShadow = true; g.add(base);

  // Foundation stones
  for (let i=0; i<8; i++) {
    const a = (i/8)*Math.PI*2;
    const st = new THREE.Mesh(new THREE.BoxGeometry(.22,.28,.16), dkMat);
    st.position.set(Math.cos(a)*.86,.28,Math.sin(a)*.86);
    st.rotation.y = a; st.castShadow = true; g.add(st);
  }

  // Tower body
  const bodies = {
    ancient: ()=>new THREE.CylinderGeometry(.3,.46,h,7),
    moonwell:()=>new THREE.CylinderGeometry(.28,.32,h*1.1,14),
    glaive:  ()=>new THREE.CylinderGeometry(.24,.36,h,5),
    hippo:   ()=>new THREE.CylinderGeometry(.2,.3,h,6),
    arcane:  ()=>new THREE.BoxGeometry(.6,h,.6),
    mana:    ()=>new THREE.CylinderGeometry(.26,.35,h,8),
    blood:   ()=>new THREE.BoxGeometry(.56,h,.56),
    sunfire: ()=>new THREE.CylinderGeometry(.2,.3,h,5),
    grunt:   ()=>new THREE.CylinderGeometry(.32,.48,h,6),
    cata:    ()=>new THREE.BoxGeometry(.72,h,.72),
    shaman:  ()=>new THREE.CylinderGeometry(.3,.42,h,8),
    chief:   ()=>new THREE.BoxGeometry(.65,h*.85,.65),
    skel:    ()=>new THREE.CylinderGeometry(.27,.4,h,8),
    plague:  ()=>new THREE.CylinderGeometry(.25,.36,h,6),
    crypt:   ()=>new THREE.BoxGeometry(.58,h,.58),
    lich:    ()=>new THREE.CylinderGeometry(.22,.3,h,5),
  };
  const body = new THREE.Mesh((bodies[def.id]||bodies.grunt)(), mat);
  body.position.y = .24+h/2; body.castShadow = true; g.add(body);

  // Crown
  const crownMat = new THREE.MeshPhongMaterial({color:col.clone().multiplyScalar(.6),emissive:em,emissiveIntensity:.18,shininess:20});
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.42,.34,.24,8), crownMat);
  crown.position.y = .24+h+.12; crown.castShadow = true; g.add(crown);
  const mc = level===3?8:6;
  for (let i=0; i<mc; i++) {
    const a=(i/mc)*Math.PI*2;
    const m = new THREE.Mesh(new THREE.BoxGeometry(.16,.26,.14), crownMat);
    m.position.set(Math.cos(a)*.38,.24+h+.3,Math.sin(a)*.38);
    m.castShadow = true; g.add(m);
  }

  // Turret head
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.22,8), mat);
  turret.position.y = .24+h+.36; g.add(turret);

  // Barrel
  const bMat = new THREE.MeshPhongMaterial({color:0xbbbbbb,shininess:110,emissive:0x222222,emissiveIntensity:.12});
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.055,.072,.82,7), bMat);
  barrel.rotation.z = Math.PI/2;
  barrel.position.set(.46,.24+h+.36,0);
  barrel.castShadow = true; g.add(barrel);
  g.userData.barrel = barrel;

  // Magic crystal
  const magicIds = ['glaive','mana','crypt','lich','moonwell','sunfire','arcane','plague'];
  if (magicIds.includes(def.id)) {
    const pCol = new THREE.Color(def.projCol);
    const cMat = new THREE.MeshPhongMaterial({color:pCol,emissive:pCol,emissiveIntensity:1.7,transparent:true,opacity:.9,shininess:120});
    const cryst = new THREE.Mesh(new THREE.OctahedronGeometry(.22,0), cMat);
    cryst.position.y = .24+h+.74; g.add(cryst); g.userData.crystal = cryst;
    const cLight = new THREE.PointLight(def.projCol,1.1,4.6);
    cLight.position.y = .24+h+.62; g.add(cLight); g.userData.crystLight = cLight;
    if (level >= 2) {
      const c2 = cryst.clone(); c2.position.y = .24+h+.62; c2.scale.setScalar(.58); g.add(c2); g.userData.crystal2 = c2;
    }
  }

  // Fire orb
  const fireIds = ['chief','cata','blood','grunt'];
  if (fireIds.includes(def.id)) {
    const fMat = new THREE.MeshPhongMaterial({color:0xff4400,emissive:0xff2200,emissiveIntensity:2.6,transparent:true,opacity:.86});
    const fire = new THREE.Mesh(new THREE.SphereGeometry(.2,7,7), fMat);
    fire.position.y = .24+h+.56; g.add(fire); g.userData.fire = fire;
    const fLight = new THREE.PointLight(0xff4400,1.35,5);
    fLight.position.y = .24+h+.52; g.add(fLight); g.userData.fireLight = fLight;
  }

  // Level stars
  for (let i=0; i<level-1; i++) {
    const a = (i/Math.max(1,level-1))*Math.PI*2;
    const star = new THREE.Mesh(new THREE.SphereGeometry(.1,6,6),
      new THREE.MeshPhongMaterial({color:0xEF9F27,emissive:0xBA7517,emissiveIntensity:1.4}));
    star.position.set(Math.cos(a)*.94,.4,Math.sin(a)*.94); g.add(star);
  }
  return g;
}

function animateTowers(tick) {
  towerMap.forEach(({mesh:tm}) => {
    if (tm.userData.crystal) {
      tm.userData.crystal.rotation.y += .028;
      tm.userData.crystal.rotation.x += .014;
      tm.userData.crystal.position.y += Math.sin(tick*.07)*.004;
      if (tm.userData.crystLight) tm.userData.crystLight.intensity = .85+Math.abs(Math.sin(tick*.04))*.5;
    }
    if (tm.userData.crystal2) { tm.userData.crystal2.rotation.y -= .04; tm.userData.crystal2.rotation.z += .022; }
    if (tm.userData.fire) {
      const fs = .85+Math.sin(tick*.22)*.16;
      tm.userData.fire.scale.setScalar(fs);
      if (tm.userData.fireLight) tm.userData.fireLight.intensity = 1.2+Math.sin(tick*.18)*.5;
    }
  });
}

// ════════════════════════════════════════════════════════
//  COMBAT — Projectiles, Particles, Blood
// ════════════════════════════════════════════════════════

let projectiles = [];
let parts = [];
let bloods = [];

function makeProjectile(projCol) {
  const g = new THREE.Group();
  const c = new THREE.Color(projCol);
  const m = new THREE.Mesh(new THREE.SphereGeometry(.11,8,8),
    new THREE.MeshPhongMaterial({color:c,emissive:c,emissiveIntensity:2.6,transparent:true,opacity:.95,shininess:0}));
  g.add(m);
  // Trail spheres
  for (let i=0;i<3;i++) {
    const t=new THREE.Mesh(new THREE.SphereGeometry(.06,4,4),
      new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.28*(3-i)/3}));
    t.userData.trailIdx=i; g.add(t);
  }
  const l=new THREE.PointLight(projCol,1.6,3.2); g.add(l);
  scene.add(g); return g;
}

function spawnParticles(pos, col, n=6, type='spell') {
  for (let i=0;i<n;i++) {
    const a=Math.random()*Math.PI*2, sp=.04+Math.random()*.1;
    const c=type==='blood'?new THREE.Color(.55,.01,.01):new THREE.Color(col);
    const m=new THREE.Mesh(new THREE.SphereGeometry(.045+Math.random()*.055,4,4),
      new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95}));
    const p0=pos.clone(); p0.y+=.5; m.position.copy(p0); scene.add(m);
    parts.push({m,vx:Math.cos(a)*sp,vy:.07+Math.random()*.08,vz:Math.sin(a)*sp,life:24+Math.random()*14,max:38,type});
  }
}

function addBloodDecal(pos) {
  const m=new THREE.Mesh(new THREE.CircleGeometry(.24+Math.random()*.32,10),
    new THREE.MeshBasicMaterial({color:0x3a0000,transparent:true,opacity:.78,depthWrite:false}));
  m.rotation.x=-Math.PI/2;
  m.position.set(pos.x+(Math.random()-.5)*.7,.19,pos.z+(Math.random()-.5)*.7);
  m.renderOrder=3; scene.add(m); bloods.push(m);
  if(bloods.length>100) scene.remove(bloods.shift());
}

function updateParticles() {
  parts.forEach(p=>{
    p.m.position.x+=p.vx; p.m.position.y+=p.vy; p.m.position.z+=p.vz;
    p.vy-=.0035; p.life--;
    p.m.material.opacity=Math.max(0,p.life/p.max*.92);
    if(p.type==='blood'&&p.m.position.y<.19){p.m.position.y=.19;p.vy*=-.08;p.vx*=.55;p.vz*=.55;}
  });
  parts.filter(p=>p.life<=0).forEach(p=>scene.remove(p.m));
  parts=parts.filter(p=>p.life>0);
}

function updateProjectiles(enemies) {
  projectiles.forEach(p=>{
    if(p.dead||p.tgt.dead){p.dead=true;scene.remove(p.g);return;}
    const prev=p.g.position.clone();
    const dest=p.tgt.mesh.position.clone(); dest.y=.6;
    const dir=dest.sub(p.g.position); const dist=dir.length();
    if(dist<p.spd+.22){
      if(p.tower.splash){
        const sr=p.tower.id==='cata'?3.4:2.0;
        enemies.filter(e=>!e.dead&&e.mesh.position.distanceTo(p.tgt.mesh.position)<sr).forEach(e=>{
          e.hp-=p.tower.dps;
          if(p.tower.slow)e.slow=p.tower.slowA||70;
          if(e.hp<=0)killEnemy(e);
        });
        spawnParticles(p.tgt.mesh.position,p.tower.projCol,16,'spell');
      } else {
        p.tgt.hp-=p.tower.dps;
        if(p.tower.slow)p.tgt.slow=p.tower.slowA||70;
        spawnParticles(p.tgt.mesh.position,p.tower.projCol,6,'spell');
        if(p.tgt.hp<=0)killEnemy(p.tgt);
      }
      scene.remove(p.g); p.dead=true;
    } else {
      dir.normalize().multiplyScalar(p.spd); p.g.position.add(dir);
      p.g.position.y=Math.max(p.g.position.y,.5+Math.sin((1-dist/8)*Math.PI)*.85);
      // Trail update
      p.g.children.forEach(c=>{
        if(c.userData&&c.userData.trailIdx!==undefined){
          const off=prev.clone().sub(p.g.position).multiplyScalar((c.userData.trailIdx+1)*.28);
          c.position.copy(off);
        }
      });
    }
  });
  projectiles=projectiles.filter(p=>!p.dead);
}

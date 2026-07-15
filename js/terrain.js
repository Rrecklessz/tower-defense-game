// ════════════════════════════════════════════════════════
//  TERRAIN — Tiles, Trees, Rocks, Torches, Portals
// ════════════════════════════════════════════════════════

let worldMeshes = [];
let hoverMesh = null;
let torches = [];

// ── PROCEDURAL TEXTURES ───────────────────────────────
function makeCanvasTex(size, drawFn) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  drawFn(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function groundTex(hex, size=128) {
  return makeCanvasTex(size, (ctx, s) => {
    const r=(hex>>16)&255, g=(hex>>8)&255, b=hex&255;
    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fillRect(0,0,s,s);
    for(let i=0;i<800;i++){
      const x=Math.random()*s, y=Math.random()*s, v=Math.random()>.5?18:-14;
      ctx.fillStyle=`rgba(${r+v},${g+v},${b+v},.18)`;
      ctx.fillRect(x,y,2+Math.random()*3,2+Math.random()*3);
    }
    ctx.strokeStyle=`rgba(${r-20},${g-20},${b-20},.2)`; ctx.lineWidth=.8;
    for(let i=0;i<6;i++){
      ctx.beginPath(); ctx.moveTo(Math.random()*s,Math.random()*s);
      for(let j=0;j<4;j++) ctx.lineTo(Math.random()*s,Math.random()*s);
      ctx.stroke();
    }
  });
}

function stoneTex(hex, size=128) {
  return makeCanvasTex(size, (ctx, s) => {
    const r=(hex>>16)&255, g=(hex>>8)&255, b=hex&255;
    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fillRect(0,0,s,s);
    const bw=s/3, bh=s/4;
    for(let row=0;row<4;row++) for(let col=0;col<3;col++){
      const off=(row%2)*.5*bw, x=col*bw+off, y=row*bh;
      const v=(Math.random()-.5)*22;
      ctx.fillStyle=`rgba(${r+v},${g+v},${b+v},.55)`; ctx.fillRect(x+1,y+1,bw-2,bh-2);
      ctx.strokeStyle=`rgba(${r-30},${g-30},${b-30},.6)`; ctx.lineWidth=1.5;
      ctx.strokeRect(x+1,y+1,bw-2,bh-2);
    }
  });
}

function pathTex(hex, size=128) {
  return makeCanvasTex(size, (ctx, s) => {
    const r=(hex>>16)&255, g=(hex>>8)&255, b=hex&255;
    ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fillRect(0,0,s,s);
    for(let i=0;i<5;i++){
      ctx.strokeStyle=`rgba(${r-20},${g-20},${b-20},.4)`; ctx.lineWidth=2+Math.random()*2;
      ctx.beginPath(); ctx.moveTo(s*.1,Math.random()*s);
      ctx.quadraticCurveTo(s*.5,Math.random()*s,s*.9,Math.random()*s); ctx.stroke();
    }
    for(let i=0;i<500;i++){
      const x=Math.random()*s, y=Math.random()*s, v=(Math.random()-.5)*16;
      ctx.fillStyle=`rgba(${r+v},${g+v},${b+v},.2)`;
      ctx.fillRect(x,y,1+Math.random()*2,1+Math.random()*2);
    }
  });
}

// ── MAIN TERRAIN BUILD ────────────────────────────────
function buildTerrain(rd) {
  worldMeshes.forEach(m => scene.remove(m));
  worldMeshes = []; torches = [];
  if (hoverMesh) { scene.remove(hoverMesh); hoverMesh = null; }

  // Atmosphere
  scene.fog = new THREE.FogExp2(rd.fog, rd.fogD);
  scene.background = new THREE.Color(rd.sky);
  renderer.setClearColor(rd.sky);
  ambLight.color.setHex(rd.ambient);
  sunLight.color.setHex(rd.sun);

  // Ground fog plane
  const fogPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(COLS*TS+14, ROWS*TS+14),
    new THREE.MeshBasicMaterial({color:new THREE.Color(rd.fog).multiplyScalar(3),transparent:true,opacity:.16,depthWrite:false})
  );
  fogPlane.rotation.x = -Math.PI/2; fogPlane.position.y = .09; fogPlane.renderOrder = 0;
  scene.add(fogPlane); worldMeshes.push(fogPlane);

  // Big base ground
  const gTex = groundTex(rd.groundDark);
  const gnd = new THREE.Mesh(
    new THREE.PlaneGeometry(COLS*TS+14, ROWS*TS+14),
    new THREE.MeshLambertMaterial({map:gTex, color:new THREE.Color(rd.groundDark)})
  );
  gnd.rotation.x = -Math.PI/2; gnd.position.y = -.26; gnd.receiveShadow = true;
  scene.add(gnd); worldMeshes.push(gnd);

  const pTex = pathTex(rd.path);
  const sTex = stoneTex(rd.ground);

  for (let r=0; r<ROWS; r++) {
    for (let c=0; c<COLS; c++) {
      const isP = PATH_SET.has(c+','+r);
      const pos = tilePos(c, r);
      const jitter = isP ? 0 : Math.sin(c*4.1+r*2.7)*.055;

      // Tile
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(TS-.07,.32,TS-.07),
        new THREE.MeshLambertMaterial({map:isP?pTex:sTex, color:new THREE.Color(isP?rd.path:rd.ground)})
      );
      mesh.position.set(pos.x, isP?-.04:jitter, pos.z);
      mesh.receiveShadow = true;
      mesh.userData = {c, r, isPath:isP};
      scene.add(mesh); worldMeshes.push(mesh);

      // Top highlight
      const hc = new THREE.Color(isP?rd.path:rd.ground).multiplyScalar(1.5);
      const top = new THREE.Mesh(
        new THREE.PlaneGeometry(TS-.09, TS-.09),
        new THREE.MeshLambertMaterial({color:hc, transparent:true, opacity:.45, depthWrite:false})
      );
      top.rotation.x = -Math.PI/2;
      top.position.set(pos.x, (isP?-.04:jitter)+.168, pos.z);
      top.renderOrder = 1;
      scene.add(top); worldMeshes.push(top);

      // Path tracks
      if (isP) {
        [-.36,.36].forEach(ox => {
          const track = new THREE.Mesh(
            new THREE.PlaneGeometry(.11, TS*.72),
            new THREE.MeshBasicMaterial({color:new THREE.Color(rd.pathDark).multiplyScalar(.65),transparent:true,opacity:.5,depthWrite:false})
          );
          track.rotation.x = -Math.PI/2;
          track.position.set(pos.x+ox, .15, pos.z);
          track.renderOrder = 2;
          scene.add(track); worldMeshes.push(track);
        });
      }

      // Scenery
      if (!isP) {
        const rnd = Math.sin(c*7.3+r*5.1+c*r*.4)*.5+.5;
        if (rnd < .11) addRock(pos, rd, jitter);
        else if (rnd < .22) addTree(pos, rd, jitter);
      }
    }
  }

  // Portals
  addPortal(pathPos(0), 0x22ee55);
  addPortal(pathPos(RAW_PATH.length-1), 0xee2222);

  // Torches at path corners
  [3,7,14,18,22,26].forEach(i => {
    if (i < RAW_PATH.length) {
      const p = pathPos(i).clone(); p.y = 0;
      addTorch(p.x, p.z);
    }
  });

  // Hover tile
  hoverMesh = new THREE.Mesh(
    new THREE.BoxGeometry(TS-.07,.36,TS-.07),
    new THREE.MeshLambertMaterial({color:0x88ff44,transparent:true,opacity:.32,depthWrite:false})
  );
  hoverMesh.visible = false; hoverMesh.renderOrder = 3;
  scene.add(hoverMesh);
}

function addRock(pos, rd, jitter) {
  const n = 1 + Math.floor(Math.random()*3);
  for (let i=0; i<n; i++) {
    const s = .12+Math.random()*.2;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(s, 0),
      new THREE.MeshLambertMaterial({color:new THREE.Color(rd.ground).multiplyScalar(.65+Math.random()*.5), map:stoneTex(rd.groundDark,64)})
    );
    rock.position.set(pos.x+(Math.random()-.5)*.9, jitter+s*.5, pos.z+(Math.random()-.5)*.9);
    rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    rock.castShadow = true; rock.receiveShadow = true;
    scene.add(rock); worldMeshes.push(rock);
  }
}

function addTree(pos, rd, jitter) {
  const h = .6+Math.random()*.9;
  const trunkMat = new THREE.MeshLambertMaterial({color:0x3a2010});
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,h,6), trunkMat);
  const tx = pos.x+(Math.random()-.5)*.75, tz = pos.z+(Math.random()-.5)*.75;
  trunk.position.set(tx, jitter+h*.5, tz);
  trunk.castShadow = true;
  scene.add(trunk); worldMeshes.push(trunk);
  const fCol = race==='ne'?0x1a4a08:(race==='ud'?0x141520:0x183a0a);
  const levels = 2+Math.floor(Math.random()*2);
  for (let i=0; i<levels; i++) {
    const fr = (.38-i*.08)+Math.random()*.1;
    const f = new THREE.Mesh(
      new THREE.ConeGeometry(fr, .58+Math.random()*.3, 7),
      new THREE.MeshLambertMaterial({color:new THREE.Color(fCol).multiplyScalar(.8+Math.random()*.4)})
    );
    f.position.set(tx, jitter+h*.62+i*.34, tz);
    f.castShadow = true;
    scene.add(f); worldMeshes.push(f);
  }
}

function addPortal(pos, col) {
  const mat = new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:.9,shininess:80});
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.58,.09,8,24), mat);
  ring.position.set(pos.x,.85,pos.z); ring.rotation.x = Math.PI*.15;
  scene.add(ring); worldMeshes.push(ring);
  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(.46,16),
    new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false})
  );
  inner.position.set(pos.x,.85,pos.z); inner.rotation.x = Math.PI*.15-Math.PI/2;
  inner.renderOrder = 5; scene.add(inner); worldMeshes.push(inner);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(.065,.085,1.5,8), new THREE.MeshLambertMaterial({color:0x443322}));
  post.position.set(pos.x,.75,pos.z); scene.add(post); worldMeshes.push(post);
  const light = new THREE.PointLight(col,1.4,5.5);
  light.position.set(pos.x,1.3,pos.z); scene.add(light);
  worldMeshes.push({_portal:true, ring, inner, light});
}

function addTorch(x, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04,.055,.85,6), new THREE.MeshLambertMaterial({color:0x3a2010}));
  pole.position.set(x,.425,z); scene.add(pole); worldMeshes.push(pole);
  const flameMat = new THREE.MeshPhongMaterial({color:0xff6600,emissive:0xff3300,emissiveIntensity:2.6,transparent:true,opacity:.88});
  const flame = new THREE.Mesh(new THREE.SphereGeometry(.1,6,6), flameMat);
  flame.position.set(x,.96,z); scene.add(flame); worldMeshes.push(flame);
  const light = new THREE.PointLight(0xff5500,.95,4.8);
  light.position.set(x,1.0,z); scene.add(light);
  torches.push({flame, light, baseY:.96, phase:Math.random()*Math.PI*2});
}

function updateTorches(tick) {
  torches.forEach(t => {
    const f = Math.sin(tick*.18+t.phase)*.08+Math.sin(tick*.29+t.phase)*.05;
    t.flame.position.y = t.baseY + f*.2;
    t.flame.scale.setScalar(.88+f);
    t.light.intensity = .75+f*.65;
  });
  worldMeshes.forEach(m => {
    if (m && m._portal) {
      m.ring.rotation.z += .018; m.ring.rotation.x += .006;
      m.inner.material.opacity = .22+Math.abs(Math.sin(tick*.04))*.18;
      m.light.intensity = 1.2+Math.sin(tick*.06)*.4;
    }
  });
}

// ════════════════════════════════════════════════════════
//  DATA — Races, Towers, Enemies, Wave Definitions
// ════════════════════════════════════════════════════════

const RACES = {
  ne:{
    name:'Night Elves', badge:'🌲 Night Elves', badgeCol:'#7acc33',
    hexCol:'#3B6D11', numCol:0x3B6D11,
    sky:0x020904, fog:0x030b04, fogD:.016,
    ground:0x0c1e08, groundDark:0x081404, path:0x1e3a10, pathDark:0x122208,
    ambient:0x1a2e12, sun:0xeeffd0,
    towers:[
      {id:'ancient', name:'Ancient', ico:'🌲',cost:50, dps:12,range:4.2,maxCd:30,slow:true, slowA:88,splash:false,chain:false,col:0x2d6b0e,em:0x0e2a04,projCol:0x55cc22},
      {id:'moonwell',name:'Moonwell',ico:'💧',cost:65, dps:8, range:4.8,maxCd:20,slow:false,splash:true, chain:false,col:0x0e8a6a,em:0x043a2a,projCol:0x22eebb},
      {id:'glaive',  name:'Glaive',  ico:'🌙',cost:80, dps:26,range:5.5,maxCd:50,slow:false,splash:false,chain:true, col:0x5a4acc,em:0x1a1460,projCol:0xaa99ff},
      {id:'hippo',   name:'Hippo',   ico:'🦅',cost:95, dps:42,range:7.2,maxCd:66,snipe:true,slow:false,splash:false,chain:false,col:0x3a7a14,em:0x0e2e04,projCol:0x88ff44},
    ]
  },
  be:{
    name:'Blood Elves', badge:'✨ Blood Elves', badgeCol:'#EF9F27',
    hexCol:'#BA7517', numCol:0xBA7517,
    sky:0x060400, fog:0x0c0702, fogD:.015,
    ground:0x1c1408, groundDark:0x120d05, path:0x2e1e08, pathDark:0x1e1204,
    ambient:0x2a1e10, sun:0xffe8a0,
    towers:[
      {id:'arcane', name:'Arcane',  ico:'✨',cost:50, dps:18,range:4.5,maxCd:34,slow:false,splash:false,chain:false,col:0xc48018,em:0x3a1a04,projCol:0xffcc44},
      {id:'mana',   name:'ManaBurn',ico:'🔮',cost:68, dps:10,range:5.2,maxCd:26,slow:true, slowA:68,splash:true, chain:false,col:0x7a44cc,em:0x1e0a50,projCol:0xcc88ff},
      {id:'blood',  name:'Blood',   ico:'🩸',cost:82, dps:32,range:3.8,maxCd:46,slow:false,splash:true, chain:false,col:0xaa2020,em:0x3a0808,projCol:0xff4444},
      {id:'sunfire',name:'Sunfire', ico:'☀️',cost:100,dps:60,range:8.0,maxCd:86,snipe:true,slow:false,splash:false,chain:false,col:0xe89018,em:0x502a02,projCol:0xffee44},
    ]
  },
  orc:{
    name:'Orcs', badge:'🪓 Orcs', badgeCol:'#E24B4A',
    hexCol:'#A32D2D', numCol:0xA32D2D,
    sky:0x060200, fog:0x0c0402, fogD:.018,
    ground:0x1c0a06, groundDark:0x120604, path:0x2e1008, pathDark:0x1e0804,
    ambient:0x2a1008, sun:0xffcc88,
    towers:[
      {id:'grunt', name:'Grunt',   ico:'🪓',cost:42, dps:14,range:3.5,maxCd:34,slow:false,splash:false,chain:false,col:0x9a1a1a,em:0x380808,projCol:0xff4422},
      {id:'cata',  name:'Catapult',ico:'💣',cost:68, dps:35,range:3.8,maxCd:80,slow:false,splash:true, chain:false,col:0x884a08,em:0x2e1402,projCol:0xff8822},
      {id:'shaman',name:'Shaman',  ico:'⚡',cost:78, dps:18,range:5.0,maxCd:30,chain:true, slow:true, slowA:74,splash:false,col:0xcc3322,em:0x440e08,projCol:0xff6644},
      {id:'chief', name:'WarChief',ico:'🔥',cost:108,dps:52,range:4.5,maxCd:56,slow:false,splash:true, chain:false,col:0xcc5510,em:0x3a1204,projCol:0xff6600},
    ]
  },
  ud:{
    name:'Undead', badge:'☠️ Undead', badgeCol:'#AFA9EC',
    hexCol:'#534AB7', numCol:0x534AB7,
    sky:0x010108, fog:0x020210, fogD:.020,
    ground:0x080a1c, groundDark:0x040614, path:0x0e1030, pathDark:0x080a20,
    ambient:0x0e1030, sun:0xc8c0ff,
    towers:[
      {id:'skel',  name:'Skeleton',ico:'🦴',cost:38, dps:11,range:3.8,maxCd:24,slow:false,splash:false,chain:false,col:0x707068,em:0x1a1a18,projCol:0xccccaa},
      {id:'plague',name:'Plague',  ico:'☠️',cost:62, dps:9, range:4.5,maxCd:16,slow:true, slowA:70,splash:true, chain:false,col:0x22aa44,em:0x063016,projCol:0x44ff88},
      {id:'crypt', name:'Crypt',   ico:'💀',cost:78, dps:24,range:4.2,maxCd:42,chain:true, slow:false,splash:false,col:0x4a42aa,em:0x12105a,projCol:0x8888ff},
      {id:'lich',  name:'Lich',    ico:'🌀',cost:102,dps:62,range:6.2,maxCd:76,splash:true, slow:true, slowA:94,chain:false,col:0x6a60cc,em:0x1a1660,projCol:0xaaaaff},
    ]
  }
};

const ENEMIES = {
  alliance:[
    {type:'Footman', hp:50,  spd:.038,reward:6,  bCol:0x3a5888,hCol:0x5a78a8},
    {type:'Knight',  hp:120, spd:.048,reward:13, bCol:0x4a68a0,hCol:0x6a88c0},
    {type:'Gryphon', hp:85,  spd:.062,reward:10, bCol:0x507898,hCol:0x7098b8},
    {type:'Paladin', hp:280, spd:.032,reward:22, bCol:0x607aaa,hCol:0x8aaac8},
    {type:'BOSS',    hp:4200,spd:.022,reward:200,bCol:0x1a3870,hCol:0x2a5090,isBoss:true},
  ],
  horde:[
    {type:'Grunt',    hp:52,  spd:.038,reward:6,  bCol:0x6e2412,hCol:0x8e3418},
    {type:'Raider',   hp:125, spd:.050,reward:13, bCol:0x7e2c1a,hCol:0x9e3c22},
    {type:'Troll',    hp:88,  spd:.056,reward:10, bCol:0x5e1c0e,hCol:0x7e2c16},
    {type:'Warchief', hp:310, spd:.030,reward:24, bCol:0x8e1c12,hCol:0xae2c1a},
    {type:'BOSS',     hp:4200,spd:.020,reward:200,bCol:0x4e0a0a,hCol:0x6e1212,isBoss:true},
  ]
};

const WAVE_DEFS = [
  {ei:0,n:8, s:1.0},{ei:0,n:12,s:1.25},{ei:1,n:8, s:1.0},{ei:1,n:10,s:1.3},
  {ei:2,n:10,s:1.0},{ei:2,n:8, s:1.5}, {ei:3,n:6, s:1.0},{ei:3,n:8, s:1.4},
  {ei:1,n:14,s:1.8},{ei:4,n:1, s:1.0},
];

const HERO_DATA = {
  ne:  {name:'Malfurion', ico:'🧙',col:0x3B6D11,em:0x1a3a08,projCol:0x44ff88},
  be:  {name:"Kael'thas", ico:'👑',col:0xBA7517,em:0x3a1a04,projCol:0xffcc44},
  orc: {name:'Thrall',    ico:'⚡',col:0xA32D2D,em:0x3a0808,projCol:0xff6644},
  ud:  {name:'Arthas',    ico:'❄️',col:0x534AB7,em:0x1a1660,projCol:0xaaaaff},
};

const SHOP_ITEMS = [
  {id:'dmg',   ico:'⚔️', name:'Battle Hardened',   desc:'All towers deal +25% damage permanently',  cost:80,  once:false},
  {id:'range', ico:'🎯', name:'Eagle Eye',           desc:'All towers gain +15% range permanently',   cost:70,  once:false},
  {id:'speed', ico:'⚡', name:'Swift Reload',        desc:'All towers fire 20% faster',               cost:90,  once:false},
  {id:'gold',  ico:'💰', name:'Mercenary Contract',  desc:'Earn +50% gold from kills this wave',      cost:60,  once:true},
  {id:'lives', ico:'❤️', name:'Field Medic',         desc:'Restore 2 lives (max 5)',                  cost:100, once:false},
  {id:'hero',  ico:'🌟', name:'Hero Training',       desc:'Hero gains an instant level',              cost:110, once:false},
];

// Grid constants
const COLS = 14, ROWS = 8, TS = 2.4;
const GRID_OX = -(COLS*TS)/2 + TS/2;
const GRID_OZ = -(ROWS*TS)/2 + TS/2;

function tilePos(c, r) {
  return new THREE.Vector3(GRID_OX + c*TS, 0, GRID_OZ + r*TS);
}

const RAW_PATH = [
  {c:0,r:2},{c:1,r:2},{c:2,r:2},{c:3,r:2},
  {c:3,r:3},{c:3,r:4},{c:3,r:5},
  {c:4,r:5},{c:5,r:5},{c:6,r:5},{c:7,r:5},
  {c:7,r:4},{c:7,r:3},{c:7,r:2},{c:7,r:1},
  {c:8,r:1},{c:9,r:1},{c:10,r:1},
  {c:10,r:2},{c:10,r:3},{c:10,r:4},{c:10,r:5},{c:10,r:6},
  {c:11,r:6},{c:12,r:6},{c:13,r:6},
  {c:13,r:5},{c:13,r:4},{c:13,r:3},
];
const PATH_SET = new Set(RAW_PATH.map(p => p.c+','+p.r));

function pathPos(i) {
  const p = RAW_PATH[Math.min(i, RAW_PATH.length-1)];
  return tilePos(p.c, p.r);
}

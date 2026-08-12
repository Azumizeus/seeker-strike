/* ============================================================
   SEEKER STRIKE v4.2 - 4-moteur.js
   Moteur de jeu
   Lignes 3030 a 5101 du script d'origine (game/index_v37.html)
   Images base64 retirees : elles ne concernent pas l'audit.
   ============================================================ */

function initGame(mode, mun){
  const canvas=document.getElementById('gc');
  const ctx=canvas.getContext('2d');
  const dpr=Math.min(devicePixelRatio||1,3);
  const w=window.innerWidth, h=window.innerHeight;
  canvas.width=w*dpr; canvas.height=h*dpr;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  /* Le Seeker affiche en 3x : rester a 2x revenait a etirer toute la scene.
     Interpolation soignee pour les sprites agrandis. */
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';

  G={
    ctx,w,h, mode, mun, running:true,
    player:{x:w/2, y:h-Math.max(100,PLANCHER_VOL+20), r:22},
     touchY:null,
    bullets:[], eBullets:[], enemies:[], particles:[], orbs:[], explosions:[],
     boss:null, bossWarn:0, bossTimer:0, mortBoss:null, event:null, arena:null, chrono:0, arenaReussi:false, wing:null, killsJoueur:0, cooldownBonus:0, companions:null, coop:false,
    score:0, frags:0, kills:0,
     lives:mode.lives+(S.bonusVies||0)+((S.consommables&&S.consommables.vies)||0),
     multDrops:((S.consommables&&S.consommables.drops)||1)*(mode.multDropsNoeud||1),
     rareteButin:(RARETE_DIFFICULTE[loadout.difficulte]||1), viesLarguees:0, boostsUtilises:0,
     multDegats:(S.consommables&&S.consommables.degats)||1,
    wave:1, combo:1, comboTimer:0,
    lastShot:0, spawnT:0, waveT:0, frame:0,
    touchX:null, shake:0,
    power:{shield:0, rapid:0, perce:0}, invuln:0, noyaux:0, bonusTimer:0, bonusUsed:false,
    shipBonus:SHIPS[loadout.ship].bonus, bossSpawned:false,
     meca:(NODES.find(x=>x.id===S.currentNode)||{}).meca||null,   /* brouillard / inversion / zeroG / marathon */
     contrat:(mode.infini||mode.arena||mode.coop)?null:contratDuNoeud(S.currentNode),
     objectifVagues:(mode.infini||mode.arena||mode.coop)?null:vaguesRequises(S.currentNode),
     termine:false, plusDeSpawn:false,
     vx:0, vy:0
  };

  majBarreBonus();     /* les 3 bonus sont visibles des le depart */

  const c=canvas;
  /* Suivi tactile libre : X ET Y (mouvement 360) */
  c.ontouchstart=e=>{e.preventDefault(); const r=c.getBoundingClientRect(); G.touchX=e.touches[0].clientX-r.left; G.touchY=e.touches[0].clientY-r.top;};
  c.ontouchmove=e=>{e.preventDefault(); const r=c.getBoundingClientRect(); G.touchX=e.touches[0].clientX-r.left; G.touchY=e.touches[0].clientY-r.top;};
  c.ontouchend=()=>{G.touchX=null; G.touchY=null;};
  c.onmousedown=e=>{const r=c.getBoundingClientRect(); G.touchX=e.clientX-r.left; G.touchY=e.clientY-r.top;};
  c.onmousemove=e=>{if(G.touchX!==null){const r=c.getBoundingClientRect(); G.touchX=e.clientX-r.left; G.touchY=e.clientY-r.top;}};
  c.onmouseup=()=>{G.touchX=null; G.touchY=null;};

  afficherTitreSecteur();
  installerClavier();
  /* Les consommables ne valent que pour la mission qui commence */
  if(S.consommables && Object.keys(S.consommables).length){
    const c=[];
    if(S.consommables.vies)   c.push('+'+S.consommables.vies+' vies');
    if(S.consommables.drops)  c.push('drops \u00d7'+S.consommables.drops);
    if(S.consommables.degats) c.push('d\u00e9g\u00e2ts \u00d7'+S.consommables.degats);
    if(c.length) toast('\ud83d\udee0\ufe0f '+c.join(' \u2022 '),2600);
    S.consommables={}; save();
  }
  startMusic();
  loop();
}

/* --- Clavier 8 directions : ZQSD, WASD et fleches --- */
let clavierInstalle=false;
const TOUCHES={};
function installerClavier(){
  if(clavierInstalle) return; clavierInstalle=true;
  document.addEventListener('keydown', e=>{
    TOUCHES[e.key.toLowerCase()]=true;
    if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
  });
  document.addEventListener('keyup', e=>{ TOUCHES[e.key.toLowerCase()]=false; });
  /* Echap ou P : pause / reprise */
  document.addEventListener('keydown', e=>{
    const k=(e.key||'').toLowerCase();
    if(k==='escape'||k==='p'){ e.preventDefault(); if(G&&(G.running||_enPause)) basculerPause(); }
  });
  window.addEventListener('blur', ()=>{ for(const k in TOUCHES) TOUCHES[k]=false; });
}
/* Vecteur de direction clavier, normalise en diagonale */
function directionClavier(){
  let dx=0, dy=0;
  if(TOUCHES['q']||TOUCHES['a']||TOUCHES['arrowleft'])  dx-=1;
  if(TOUCHES['d']||TOUCHES['arrowright'])               dx+=1;
  if(TOUCHES['z']||TOUCHES['w']||TOUCHES['arrowup'])    dy-=1;
  if(TOUCHES['s']||TOUCHES['arrowdown'])                dy+=1;
  if(dx&&dy){ const k=Math.SQRT1_2; dx*=k; dy*=k; }      /* diagonale : meme vitesse */
  return {dx,dy};
}

/* Chaque bonus est utilisable en pleine partie, tant qu'il reste des charges */
/* ============================================================
   PLAFOND DE BOOSTS PAR MISSION
   Le stock de charges s'accumule sans limite dans la boutique. Sans
   plafond, on en achete vingt au premier secteur et plus rien ne
   resiste. On limite donc ce qu'on peut DEPENSER dans une mission,
   selon l'avancement dans la campagne et la difficulte choisie.
   Le stock, lui, n'est jamais confisque : il ressert plus loin.
   ============================================================ */
const BOOSTS_BASE = [                 /* selon le secteur atteint */
  {jusqu:3,  max:1},                  /* N0-N3   : decouverte, 1 seul appel */
  {jusqu:7,  max:2},                  /* N4-N7   : premiers boss */
  {jusqu:12, max:3},                  /* N8-N12  : fin de GENESIS */
  {jusqu:17, max:4},                  /* N13-N17 : CHAOS */
  {jusqu:99, max:5}                   /* N18+    : derniere ligne droite */
];
/* Plus c'est dur, moins on s'appuie sur les boosts : c'est ce qui
   distingue une victoire en extreme d'une victoire achetee. */
const BOOSTS_DIFFICULTE = { normal:1.0, difficile:0.7, extreme:0.5 };

function plafondBoosts(){
  if(!G) return 99;
  /* Modes libres : ils n'ont pas de secteur, on leur donne un forfait fixe.
     Ils se reconnaissent au numero de secteur negatif. */
  if((S.currentNode||0) < 0) return 3;
  const nd = S.currentNode||0;
  const base = (BOOSTS_BASE.find(p=>nd<=p.jusqu) || BOOSTS_BASE[BOOSTS_BASE.length-1]).max;
  const f = BOOSTS_DIFFICULTE[loadout.difficulte] ?? 1;
  return Math.max(1, Math.round(base*f));
}
function boostsRestants(){ return Math.max(0, plafondBoosts() - ((G&&G.boostsUtilises)||0)); }

function activerBonus(type){
  if(!G || !G.running) return;
  if((S.charges[type]||0)<=0){ toast('Aucune charge de '+type); return; }
  if(boostsRestants()<=0){
    toast(T('Plafond de boosts atteint pour ce secteur ({0}/{0})', plafondBoosts()), 2600);
    return;
  }
  if(G.cooldownBonus>0){ toast('Recharge en cours\u2026',1200); return; }
  S.charges[type]--; G.boostsUtilises=(G.boostsUtilises||0)+1;
  G.cooldownBonus=90; G.bonusUtilise=true;   /* 1,5 s entre deux activations */

  if(type==='mitra'){
    G.bonusActive='mitra'; G.bonusTimer=18*60;
    toast('\ud83d\udd2b MITRAILLEUSE 18s'); sfx('power');
  }
  if(type==='nuke'){
    G.enemies.forEach(e=>{ G.score+=25; G.kills++; spawnExplosion(e.x,e.y,22); });
    G.enemies=[]; G.eBullets=[]; G.shake=28;
    toast('\u2622\ufe0f BOMBE NUCL\u00c9AIRE'); sfx('nuke'); haptique('explosion');
  }
  if(type==='ghost'){
    /* Deux fantomes en escorte, un de chaque cote */
    G.companions=[
      {x:G.player.x-56, y:G.player.y+14, r:16, life:22*60, cote:-1},
      {x:G.player.x+56, y:G.player.y+14, r:16, life:22*60, cote: 1}
    ];
    G.companion=G.companions[0];              /* compat : ancien champ */
    if(G.wing && G.wing.mort<=0){             /* le wingman recoit sa propre escorte */
      G.companions.push({x:G.wing.x-46, y:G.wing.y+12, r:14, life:22*60, cote:-1, suit:'wing'});
      G.companions.push({x:G.wing.x+46, y:G.wing.y+12, r:14, life:22*60, cote: 1, suit:'wing'});
    }
    toast('\ud83d\udc7b ESCORTE FANT\u00d4ME \u00d72 \u2022 22s'); sfx('power');
  }
  Audio2.jouerSfx('levelup'); haptique('bouton');
  save(); majBarreBonus();
}
/* Ancien nom conserve : le premier bonus disponible */
function activateBonus(){
  const t=['mitra','nuke','ghost'].find(k=>(S.charges[k]||0)>0);
  if(t) activerBonus(t);
}
/* Etat visuel des 3 boutons */
function majBarreBonus(){
  [['mitra','bonusMitra'],['nuke','bonusNuke'],['ghost','bonusGhost']].forEach(([k,slot])=>{
    const b=document.getElementById('bb-'+k); if(!b) return;
    const nb=Math.min(S.charges[k]||0, boostsRestants());
    const img=ASSETS[slot];
    b.innerHTML=(img?'<img src="'+img.src+'"/>':'<span style="font-size:18px">'+
      (k==='mitra'?'\ud83d\udd2b':k==='nuke'?'\u2622\ufe0f':'\ud83d\udc7b')+'</span>')+
      '<span class="nb">'+nb+'</span>';
    b.classList.toggle('vide', nb<=0);
    b.classList.toggle('pret', nb>0);
  });
}

/* Cadence logique verrouillee a 60 Hz. L'ecran du Seeker monte a 120 Hz :
   sans ce regulateur, update() tournait 120 fois par seconde et tout le jeu
   (demo comprise) defilait deux fois trop vite. */
/* Bande basse reservee a l'interface : boutons de boost (58px) + leur
   marge (64px) + le bandeau du HUD. Le vaisseau ne descend jamais dedans. */
const PLANCHER_VOL = 152;
const PAS_LOGIQUE = 1000/60;
function loop(ts){
  if(!G||!G.running) return;
  G.raf=requestAnimationFrame(loop);
  const maintenant = (typeof ts==='number') ? ts : performance.now();
  if(G.tPrec==null) G.tPrec=maintenant;
  let ecart = maintenant - G.tPrec;
  G.tPrec = maintenant;
  if(ecart<0) ecart=0;
  if(ecart>250) ecart=250;      /* retour d'onglet : on ne rattrape pas 10 s d'un coup */
  G.reste = (G.reste||0) + ecart;
  let tours=0;
  while(G.reste>=PAS_LOGIQUE && tours<3){ update(); G.reste-=PAS_LOGIQUE; tours++; }
  if(tours===0 && G.reste>PAS_LOGIQUE*0.98){ update(); G.reste=0; }
  draw();
}

function update(){
  const g=G, now=performance.now(); g.frame++;
  /* --- Mouvement --- */
  /* Decalage tactile : le vaisseau vole au-dessus du doigt, jamais dessous.
     Sans ca, le pouce masque le vaisseau sur mobile. */
  const OFFSET_DOIGT = 78;
  /* 58px de bouton + 64px de marge basse + le bandeau HUD : le vaisseau
     s'arrete au-dessus de tout ca. */
  if(g.demo){ piloteAuto(g); }
  else if(g.touchX!==null && g.meca==='inversion'){
    /* Commandes inversees : le vaisseau vise le MIROIR du doigt.
       L'ancienne formule le faisait fuir le doigt, donc s'eloigner sans fin
       jusqu'a se coller au bord : la mecanique etait injouable. */
    const cibleX = g.w - g.touchX;
    g.player.x += (cibleX - g.player.x)*0.30;
    if(g.touchY!=null){
      const cibleY = g.h - (g.touchY - OFFSET_DOIGT);
      g.player.y += (cibleY - g.player.y)*0.26;
    }
  }
  else if(g.touchX!==null){
    g.player.x+=(g.touchX-g.player.x)*0.32;
    if(g.touchY!==null && g.touchY!==undefined){
      const cible=g.touchY-OFFSET_DOIGT;          /* on vise au-dessus du point touche */
      g.player.y+=(cible-g.player.y)*0.28;
    }
  }
  let dir=g.demo?{dx:0,dy:0}:directionClavier();
  if(g.meca==='inversion'){ dir={dx:-dir.dx, dy:-dir.dy}; }   /* Corruption : commandes inversees */
  if(g.meca==='zeroG'){
    /* Gravite zero : inertie au lieu d'un deplacement direct */
    g.vx=(g.vx+dir.dx*0.55)*0.975;
    g.vy=(g.vy+dir.dy*0.55)*0.975;
    g.player.x+=g.vx*1.5; g.player.y+=g.vy*1.5;
  } else if(dir.dx||dir.dy){ const v=7.2; g.player.x+=dir.dx*v; g.player.y+=dir.dy*v; }
  g.player.x=Math.max(28,Math.min(g.w-28,g.player.x));
  /* Plancher de vol : on garde libre la bande des boosts et le bandeau du
     HUD, sinon le vaisseau se pose sur les boutons et les masque. */
  g.player.y=Math.max(70, Math.min(g.h-PLANCHER_VOL, g.player.y));

  let rateMult = g.mun.rate * (g.bonusActive==='mitra'?2.8:1) * (g.power.rapid>0?1.6:1);
  if(now-g.lastShot > 230 / (S.fireRate * rateMult * g.shipBonus)){
    g.lastShot=now; fire(); if(g.companions) g.companions.forEach(c=>fireCompanion(c)); sfx('shot');
  }

  g.bullets=g.bullets.filter(b=>{ b.x+=b.vx||0; b.y+=b.vy; return b.y>-50 && b.x>-40 && b.x<g.w+40; });

  g.spawnT++;
  if(!g.plusDeSpawn && g.spawnT>cadenceSpawn(g)){ g.spawnT=0; spawnEnemy(); }

  g.enemies.forEach(e=>majEnnemi(e,g));
  /* Retrait des mines eteintes : sans ca elles restaient indefiniment et
     finissaient par occuper toute la place disponible. */
  for(let i=g.enemies.length-1;i>=0;i--){
    const e=g.enemies[i];
    if(e.expiree){ parts(e.x,e.y,'#fbbf24',4); g.enemies.splice(i,1); }
  }

  /* --- Boss : warning, apparition, patterns --- */
  if(!g.bossSpawned && !g.boss){
    g.bossTimer++;
    if(!g.infini){                       /* en mode infini, les vagues pilotent les boss */
      const def=bossDuNoeud(S.currentNode, g.wave);
      if(def && g.bossWarn===0 && (BOSS_DEFS[S.currentNode] ? g.bossTimer>420 : g.wave>=4)){
        declencherBoss(g);
      }
    }
  }
  if(g.bossWarn>0){ g.bossWarn--; if(g.bossWarn===0) spawnBoss(g); }
  if(g.boss) majBoss(g);
  if(g.wing) majWingman(g);
  majEvenement(g);
  /* Arena : compte a rebours, la survie vaut la victoire */
  if(g.arena){
    g.chrono--;
    if(g.arena.mod.primes && g.frame%420===0){
      const e=creerEnnemi('bouclier', 60+Math.random()*(g.w-120), -40, g);
      e.hp*=2.5; e.maxHp=e.hp; e.prime=true; e.color='#fbbf24'; ajouterEnnemi(g, e);
    }
    document.getElementById('hud-mode').textContent=Math.ceil(g.chrono/60)+'s';
    if(g.chrono<=0){ g.arenaReussi=true; endGame(); return; }
  }

  /* --- Projectiles ennemis : deplacement + impact sur le joueur --- */
  for(let i=g.eBullets.length-1;i>=0;i--){
    const p=g.eBullets[i];
    p.x+=p.vx; p.y+=p.vy;
    if(p.y<-40||p.y>g.h+40||p.x<-40||p.x>g.w+40){ g.eBullets.splice(i,1); continue; }
    if(g.invuln<=0 && Math.hypot(p.x-g.player.x,p.y-g.player.y) < g.player.r+p.r-4){
      g.eBullets.splice(i,1); g.lives--; g.viePerdue=true; g.invuln=75; g.shake=18; sfx('hurt'); haptique('degat');
      parts(g.player.x,g.player.y,'#fb7185',8);
      if(g.lives<=0){ endGame(); return; }
    }
  }

  for(let i=g.bullets.length-1;i>=0;i--){
    const b=g.bullets[i];
    /* Impact sur le boss (prioritaire) */
    if(g.boss && !g.boss.entree && Math.hypot(b.x-g.boss.x,b.y-g.boss.y)<g.boss.r*0.8){
      g.boss.hp-=b.dmg; g.boss.flash=4; g.bullets.splice(i,1);
      parts(b.x,b.y,g.boss.def.couleur,2); sfx('hit');
      if(g.boss.hp<=0){ tuerBoss(g); }
      continue;
    }
    for(let j=g.enemies.length-1;j>=0;j--){
      const e=g.enemies[j];
      const dx=b.x-e.x, dy=b.y-e.y;
      if(dx*dx+dy*dy<(e.r+6)**2){
        /* Bouclier : les tirs arrivant de face sont renvoyes */
        if(e.kind==='bouclier'){
          /* angle de l'ennemi VERS la balle, compare a l'orientation du bouclier */
          const versBalle=Math.atan2(b.y-e.y, b.x-e.x);
          let ecart=Math.abs(((versBalle-(e.angleBouclier||0))+Math.PI*3)%(Math.PI*2)-Math.PI);
          if(ecart<1.0){
            g.bullets.splice(i,1); parts(b.x,b.y,'#67e8f9',3); e.flash=3; sfx('hit'); break;
          }
        }
        e.hp-=b.dmg; e.tueParWing=!!b.wing; g.bullets.splice(i,1); parts(e.x,e.y,e.color,2); sfx('hit');
        if(e.hp<=0) kill(e,j);
        break;
      }
    }
  }

  g.orbs=g.orbs.filter(o=>{
    o.y+=o.vy; o.pulse=(o.pulse||0)+0.12;
    /* Legere attraction quand le joueur approche : le ramassage est agreable */
    const dx=g.player.x-o.x, dy=g.player.y-o.y, dist=Math.hypot(dx,dy);
    const rayon=S.aimant?192:120;
    if(dist<rayon){ o.x+=dx/dist*2.6; o.y+=dy/dist*2.6; }
    if(dist<34){
      appliquerDrop(o.t,g);
      parts(o.x,o.y,o.color||'#14F195',8);
      return false;
    }
    return o.y<g.h+30;
  });

  for(let j=g.enemies.length-1;j>=0;j--){
    const e=g.enemies[j];
    if(g.invuln<=0 && Math.hypot(e.x-g.player.x,e.y-g.player.y)<e.r+g.player.r-4){
      const etaitKamikaze = (e.kind==='kamikaze' || e.kind==='minefixe');
      g.invuln=75;
      g.enemies.splice(j,1); g.lives--; g.viePerdue=true; g.shake=etaitKamikaze?24:16;
      spawnExplosion(g.player.x,g.player.y);
      if(etaitKamikaze){ parts(e.x,e.y,'#fb7185',18); sfx('nuke'); }
      sfx('hurt'); haptique(etaitKamikaze?'explosion':'degat');
      if(g.lives<=0){ endGame(); return; }
    }
    if(e.y>g.h+70) g.enemies.splice(j,1);
  }

  if(g.companions && g.companions.length){
    g.companions.forEach(c=>{
      c.life--;
      const ref = (c.suit==='wing' && g.wing && g.wing.mort<=0) ? g.wing : g.player;
      c.x+=((ref.x+56*c.cote)-c.x)*0.11;
      c.y+=((ref.y+14)-c.y)*0.11;
    });
    g.companions=g.companions.filter(c=>c.life>0);
    g.companion=g.companions[0]||null;
  }
  if(g.bonusActive==='mitra'){ g.bonusTimer--; if(g.bonusTimer<=0) g.bonusActive=null; }
  if(g.power.rapid>0) g.power.rapid--;
  if(g.power.perce>0) g.power.perce--;
  if(g.power.shield>0){ g.power.shield--; g.invuln=Math.max(g.invuln,2); }   /* bouclier = invuln continue */
  if(g.invuln>0) g.invuln--;
  if(g.cooldownBonus>0) g.cooldownBonus--;
  if(g.comboTimer>0) g.comboTimer--; else g.combo=1;
  if(g.shake>0) g.shake--;
  g.waveT++;
  if(g.waveT>880){
    g.waveT=0;
    if(g.infini) vagueInfinie(g);
    else {
      g.wave++;
      const cible=g.objectifVagues;
      if(cible && g.wave>cible){ conclureSecteur(g,'vagues'); }
      else toast('\u26a1 '+T('VAGUE')+' '+g.wave+(cible?' / '+cible:''), 1600);
      if(!cible) Audio2.jouerSfx('wave_start'); else Audio2.jouerSfx('wave_start');
    }
    /* Un evenement toutes les 3 a 4 vagues, jamais deux d'affilee */
    if(!g.event && g.wave>=3 && (g.wave%3===0 || Math.random()<0.28)) declencherEvenement(g);
  }
  g.particles=g.particles.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.life--;return p.life>0;});
  g.explosions=g.explosions.filter(ex=>{ex.life--;return ex.life>0;});

  document.getElementById('hud-lives').textContent=g.lives;
  document.getElementById('hud-score').textContent=g.score;
  document.getElementById('hud-combo').textContent='x'+g.combo.toFixed(1);
  majContratHud();
  verifierPaliers(g);
  document.getElementById('hud-frags').textContent=g.frags;
  /* Avancement lisible : vague courante sur objectif, ou etat du boss */
  const hw=document.getElementById('hud-wave');
  if(hw){
    if(g.objectifVagues) hw.textContent=T('VAGUE')+' '+Math.min(g.wave,g.objectifVagues)+'/'+g.objectifVagues;
    else if(BOSS_DEFS[S.currentNode]) hw.textContent=g.boss?T('BOSS'):(T('VAGUE')+' '+g.wave);
    else hw.textContent=T('VAGUE')+' '+g.wave;
  }
  document.getElementById('hud-ship').innerHTML=ico('ship'+loadout.ship, SHIPS[loadout.ship].emoji, 20);
  const eff=[];
  if(g.power.shield>0) eff.push('\ud83d\udee1\ufe0f');
  if(g.power.rapid>0)  eff.push('\u26a1');
  if(g.power.perce>0)  eff.push('\ud83d\udca5');
  if(g.bonusActive==='mitra') eff.push('\ud83d\udd2b');
  if(g.companions&&g.companions.length) eff.push('\ud83d\udc7b\u00d7'+g.companions.length);
  document.getElementById('hud-pwr').textContent = eff.length?eff.join(' '):'—';
}

function fire(){
  const g=G, mun=g.mun, dmg=(1.15+S.weapon*0.38)*mun.dmg*g.shipBonus*(g.power.perce>0?1.5:1)*(g.multDegats||1);
  const px=g.player.x, py=g.player.y-18;
  g.bullets.push({x:px,y:py,vy:-14,dmg});
  if(mun.spread>=1 || S.weapon>=2){ g.bullets.push({x:px-12,y:py+4,vy:-13,vx:-0.7,dmg:dmg*0.9}); g.bullets.push({x:px+12,y:py+4,vy:-13,vx:0.7,dmg:dmg*0.9}); }
  if(mun.spread>=2 || S.weapon>=4){ g.bullets.push({x:px-20,y:py+8,vy:-12,vx:-1.2,dmg:dmg*0.75}); g.bullets.push({x:px+20,y:py+8,vy:-12,vx:1.2,dmg:dmg*0.75}); }
}
function fireCompanion(c){ if(!c) return; G.bullets.push({x:c.x, y:c.y-10, vy:-12, dmg:1.3}); }

/* Variantes avancees en vigueur, recalculees a chaque spawn selon le noeud et la vague */
let VARIANTES = {};

/* Fabrique : cree une unite d'un type donne, a une position donnee */
function creerEnnemi(kind, x, y, g){
  const hpM=g.mode.hp, spM=(g.mode.speed||1)*(g.mode.vitesse||1);
  /* En Infini les deux premieres vagues restent aux PV de base :
     le joueur a le temps de prendre ses reperes avant que ca monte. */
  const v = g.infini ? Math.max(0, g.wave-2) : g.wave;
  const modeles={
    chasseur:{r:20, hp:1.1+v*0.26, vy:2.1+v*0.09, color:'#a78bfa', slot:'enemyChasseur', forme:'triangle'},
    tireur:  {r:24, hp:2.0+v*0.34, vy:1.5,        color:'#38bdf8', slot:'enemyTireur',   forme:'carre',
              posteY:70+Math.random()*90, tir:0, rafale:0},
    kamikaze:{r:18, hp:0.8+v*0.16, vy:1.4+v*0.08, color:'#fb7185', slot:'enemyKamikaze', forme:'cercle', charge:false},
    tank:    {r:34, hp:6+v*0.85,   vy:0.6+v*0.02, color:'#34d399', slot:'enemyTank',     forme:'hexagone'},
    /* --- v4.2 : comportements qui changent le placement du joueur --- */
    teleport:{r:19, hp:1.6+v*0.24, vy:1.2,        color:'#c084fc', slot:'enemyTeleport', forme:'losange', tp:110},
    bouclier:{r:26, hp:3.2+v*0.45, vy:1.1,        color:'#67e8f9', slot:'enemyBouclier', forme:'hexagone'},
    diviseur:{r:24, hp:2.4+v*0.38, vy:1.5,        color:'#f0abfc', slot:'enemyDiviseur', forme:'cercle'},
    poseur:  {r:23, hp:2.6+v*0.38, vy:1.0,        color:'#fbbf24', slot:'enemyPoseur',   forme:'carre', pose:80}
  };
  const m=modeles[kind]||modeles.chasseur;
  const e={kind, x, y, ...m};
  /* Une variante peut remplacer le comportement, pas seulement l'apparence */
  if(m.comport){ e.comport=m.comport; }
  e.hp*=hpM; e.vy*=spM;
  const av=VARIANTES[kind];
  if(av){ e.slot=av.slot; e.hp*=av.hp; e.vy*=av.vy; e.avance=true; }
  e.type=kind; e.maxHp=e.hp; e.flash=0;
  return e;
}

/* Types disponibles selon l'avancement : la variete arrive progressivement */
function typesDisponibles(nd, vague){
  if(nd>=13) return ['chasseur','tireur','kamikaze','tank','diviseur','bouclier','teleport','poseur'];
  const t=['chasseur','tireur','kamikaze','tank'];
  if(nd>=3 || vague>4)  t.push('diviseur');
  if(nd>=5 || vague>7)  t.push('bouclier');
  if(nd>=7 || vague>10) t.push('teleport');
  if(nd>=9 || vague>13) t.push('poseur');
  return t;
}

/* ============================================================
   EVENEMENTS DE VAGUE — une surprise toutes les 3 a 4 vagues
   ============================================================ */
const EVENEMENTS=[
  {id:'meteores', nom:'\u2604\ufe0f PLUIE DE M\u00c9T\u00c9ORES', duree:600},
  {id:'blackout', nom:'\ud83c\udf11 BLACKOUT',              duree:520},
  {id:'invasion', nom:'\u2194\ufe0f INVASION LAT\u00c9RALE',    duree:420},
  {id:'essaim',   nom:'\ud83d\udc1d ESSAIM',                duree:400},
  {id:'chasse',   nom:'\ud83c\udfaf CHASSE \u2014 cible prioritaire', duree:900}
];
function declencherEvenement(g){
  const ev=EVENEMENTS[Math.floor(Math.random()*EVENEMENTS.length)];
  g.event={...ev, reste:ev.duree, t:0};
  toast(ev.nom, 2600);
  Audio2.jouerSfx('wave_start'); haptique('explosion'); g.shake=12;
  if(ev.id==='chasse'){
    /* une cible unique, tres resistante, qui rapporte gros */
    const e=creerEnnemi('bouclier', g.w/2, -40, g);
    e.hp*=4; e.maxHp=e.hp; e.prime=true; e.color='#fbbf24';
    ajouterEnnemi(g, e);
  }
}
function majEvenement(g){
  const ev=g.event; if(!ev) return;
  ev.reste--; ev.t++;
  if(ev.id==='meteores' && ev.t%18===0){
    /* meteores : rapides, en diagonale, ils traversent l'ecran */
    const e=creerEnnemi('kamikaze', Math.random()*g.w, -30, g);
    e.charge=true; e.vy*=2.2; e.hp=1; e.maxHp=1; e.color='#f59e0b';
    ajouterEnnemi(g, e);
  }
  if(ev.id==='invasion' && ev.t%70===0){
    const gauche=Math.random()<0.5;
    for(let i=0;i<3;i++){
      const e=creerEnnemi('chasseur', gauche?-30:g.w+30, 130+i*90, g);
      e.vy=0.2; e.lateral=gauche?3:-3; ajouterEnnemi(g, e);
    }
  }
  if(ev.id==='essaim' && ev.t%40===0){
    for(let i=0;i<3;i++)
      ajouterEnnemi(g, creerEnnemi('chasseur', 60+Math.random()*(g.w-120), -30-i*30, g));
  }
  if(ev.reste<=0){ g.event=null; }
}

/* ============================================================
   DROPS — ce que les ennemis laissent tomber
   Corrige le "on ne gagne rien pendant une partie".
   ============================================================ */
/* Poids de tirage. La vie est volontairement rare : c'est la ressource qui
   decide d'une partie. Les credits restent genereux, ce sont eux qui
   alimentent l'economie GC des vaisseaux. */
const DROPS = {
  vie:      {slot:'icoHealth',  couleur:'#f87171', r:15, poids:3,  nom:'+1 VIE'},
  bouclier: {slot:'icoShield',  couleur:'#67e8f9', r:15, poids:10, nom:'BOUCLIER 8s'},
  mitra:    {slot:'pwMinigun',  couleur:'#fbbf24', r:16, poids:8,  nom:'+1 MITRAILLEUSE'},
  nuke:     {slot:'pwNuke',     couleur:'#fb7185', r:16, poids:5,  nom:'+1 BOMBE'},
  ghost:    {slot:'pwGhost',    couleur:'#c4b5fd', r:16, poids:5,  nom:'+1 FANT\u00d4ME'},
  rapide:   {slot:'ammoScatter',couleur:'#14F195', r:14, poids:15, nom:'CADENCE x1.6 10s'},
  perce:    {slot:'ammoPerf',   couleur:'#a78bfa', r:14, poids:13, nom:'D\u00c9G\u00c2TS x1.5 12s'},
  /* Butin : uniquement des credits de jeu, jamais de SOL ni de SKR */
  noyau:    {slot:'orbSol',     couleur:'#9945FF', r:14, poids:20, nom:'NOYAU DE DONN\u00c9ES'},
  eclat:    {slot:'orbSkr',     couleur:'#14F195', r:14, poids:20, nom:'\u00c9CLAT DE DONN\u00c9ES'}
};
/* Le butin se rarefie quand la difficulte monte. Sans ce correctif, un mode
   plus dur generait plus d'ennemis donc PLUS de ressources : le jeu devenait
   relativement plus facile a mesure qu'on montait en difficulte. */
const RARETE_DIFFICULTE = { normal:1.00, difficile:0.80, extreme:0.65 };
const MAX_VIES_LARGUEES = 3;   /* plafond par partie : pas de boule de neige */
const DROPS_CLES=Object.keys(DROPS);
const DROPS_TOTAL=DROPS_CLES.reduce((t,k)=>t+DROPS[k].poids,0);

function tirerDrop(){
  let r=Math.random()*DROPS_TOTAL;
  for(const k of DROPS_CLES){ r-=DROPS[k].poids; if(r<=0) return k; }
  return 'eclat';
}
/* Un ennemi sur quatre laisse quelque chose ; les gros types beaucoup plus
   souvent. Le tout module par la difficulte choisie. */
function larguerDrop(e,g){
  const gros = ['tank','bouclier','poseur','teleport','diviseur'].includes(e.kind);
  const rarete = (g.rareteButin!==undefined) ? g.rareteButin
                                            : (RARETE_DIFFICULTE[loadout.difficulte]||1);
  const chance = (e.prime?1 : gros?0.52 : 0.26) * (g.multDrops||1) * rarete;
  if(Math.random()>chance) return;
  let k=tirerDrop();
  /* Plafond de vies larguees : au-dela, le tirage retombe sur des credits. */
  if(k==='vie'){
    if((g.viesLarguees||0)>=MAX_VIES_LARGUEES) k = Math.random()<0.5?'noyau':'eclat';
    else g.viesLarguees=(g.viesLarguees||0)+1;
  }
  const d=DROPS[k];
  g.orbs.push({x:e.x, y:e.y, vy:1.5, t:k, r:d.r, slot:d.slot, color:d.couleur, pulse:0});
}

/* Application d'un drop ramasse */
function appliquerDrop(k,g){
  const d=DROPS[k];
  if(k==='vie'){ g.lives++; }
  else if(k==='bouclier'){ g.power.shield=8*60; g.invuln=Math.max(g.invuln,20); }
  else if(k==='rapide'){ g.power.rapid=10*60; }
  else if(k==='perce'){ g.power.perce=12*60; }
  else if(k==='noyau'){ g.score+=18; g.noyaux=(g.noyaux||0)+1; }
  else if(k==='eclat'){ g.score+=12; g.frags+=3; }
  else { S.charges[k]=(S.charges[k]||0)+1; save(); majBarreBonus(); }
  toast(d.nom, 1500);
  Audio2.jouerSfx('pickup'); sfx('power'); haptique('bouton');
}

/* ---- Formations : les ennemis n'arrivent plus un par un ---- */
const FORMATIONS=['solo','v','ligne','arc','lateral','essaim',
                  'tenaille','colonne','croix','echelle','embuscade','duo'];
function lancerFormation(g){
  const nd=S.currentNode, dispo=typesDisponibles(nd, g.wave);
  const kind=dispo[Math.floor(Math.random()*dispo.length)];
  /* les formations groupees apparaissent surtout apres quelques vagues */
  const poids = g.wave<2 ? ['solo','solo','solo','v'] : FORMATIONS;
  const f=poids[Math.floor(Math.random()*poids.length)];
  const cx=90+Math.random()*(g.w-180);
  if(f==='v'){
    for(let i=-2;i<=2;i++)
      ajouterEnnemi(g, creerEnnemi(kind, cx+i*44, -30-Math.abs(i)*34, g));
  } else if(f==='ligne'){
    for(let i=0;i<4;i++)
      ajouterEnnemi(g, creerEnnemi(kind, 60+i*((g.w-120)/3), -30, g));
  } else if(f==='arc'){
    for(let i=0;i<5;i++){
      const a=Math.PI*(0.18+0.16*i);
      ajouterEnnemi(g, creerEnnemi(kind, g.w/2+Math.cos(a)*150, -30-Math.sin(a)*70, g));
    }
  } else if(f==='lateral'){
    /* arrivee par le cote : casse le reflexe "tout vient du haut" */
    const gauche=Math.random()<0.5;
    for(let i=0;i<3;i++){
      const e=creerEnnemi(kind, gauche?-30:g.w+30, 120+i*80, g);
      e.vy=0.2; e.lateral=gauche?2.6:-2.6;
      ajouterEnnemi(g, e);
    }
    toast('\u2194\ufe0f Flanc !',1100);
  } else if(f==='essaim'){
    for(let i=0;i<7;i++)
      ajouterEnnemi(g, creerEnnemi('chasseur', cx+(Math.random()-0.5)*130, -30-Math.random()*90, g));
  }
  /* ---------- Formations ajoutees : elles changent l'angle d'attaque ---------- */
  else if(f==='tenaille'){
    /* Les deux flancs en meme temps : impossible de rester colle a un bord */
    for(let cote of [-1,1]){
      for(let i=0;i<2;i++){
        const e=creerEnnemi(kind, cote<0?-30:g.w+30, 150+i*95, g);
        e.vy=0.25; e.lateral=cote<0?2.8:-2.8;
        ajouterEnnemi(g, e);
      }
    }
    toast('\u2194\ufe0f Tenaille !',1200);
  }
  else if(f==='colonne'){
    /* File indienne rapide : il faut ouvrir un couloir puis s'y tenir */
    for(let i=0;i<5;i++){
      const e=creerEnnemi(kind, cx, -30-i*62, g);
      e.vy*=1.35;
      ajouterEnnemi(g, e);
    }
  }
  else if(f==='croix'){
    /* Deux diagonales qui se croisent au centre de l'ecran */
    for(let i=0;i<3;i++){
      const a=creerEnnemi(kind, 40+i*30, -30-i*40, g);  a.derive= 0.9; ajouterEnnemi(g,a);
      const b=creerEnnemi(kind, g.w-40-i*30, -30-i*40, g); b.derive=-0.9; ajouterEnnemi(g,b);
    }
  }
  else if(f==='echelle'){
    /* Marches decalees : oblige a monter ou descendre en biais */
    for(let i=0;i<5;i++)
      ajouterEnnemi(g, creerEnnemi(kind, 55+i*((g.w-110)/4), -30-i*55, g));
  }
  else if(f==='embuscade'){
    /* Ils entrent lentement puis accelerent d'un coup a mi-ecran */
    for(let i=-1;i<=1;i++){
      const e=creerEnnemi(kind, cx+i*70, -30-Math.abs(i)*25, g);
      e.vy*=0.35; e.embuscade=true;
      ajouterEnnemi(g, e);
    }
  }
  else if(f==='duo'){
    /* Deux types differents en meme temps : fin de la monotonie du groupe unique */
    const autre=dispo[Math.floor(Math.random()*dispo.length)];
    for(let i=-1;i<=1;i+=2){
      ajouterEnnemi(g, creerEnnemi(kind,  cx+i*68, -30, g));
      ajouterEnnemi(g, creerEnnemi(autre, cx+i*34, -95, g));
    }
  }
  else {
    ajouterEnnemi(g, creerEnnemi(kind, 44+Math.random()*(g.w-88), -30, g));
  }
}

/* Ajout centralise : TOUT ennemi passe par ici, y compris les formations,
   les invocations de boss et les fragments de diviseur. Au-dela du plafond
   dur, on refuse plutot que d'empiler jusqu'a faire ramer l'appareil. */
function unitesActives(g){
  /* Les mines posees ne sont pas des unites : elles ne doivent pas
     bloquer l'apparition des ennemis. */
  let k=0;
  for(const e of g.enemies) if(e.kind!=='minefixe') k++;
  return k;
}
function ajouterEnnemi(g, e){
  if(!e) return null;
  const dur = (e.kind==='minefixe') ? PLAFOND_DUR+14 : PLAFOND_DUR;
  if(g.enemies.length >= dur) return null;
  g.enemies.push(e);
  return e;
}
const PLAFOND_DUR = 30;

/* Plafond d'unites simultanees. Sans lui, un secteur dense finit par
   empiler 200 ennemis : le telephone rame et l'ecran devient illisible.
   Le plafond depend du mode choisi, pas de la vague. */
function plafondEnnemis(g){
  const base = g.infini ? 24 : 22;
  const parMode = {facile:16, explo:19, pilote:22, chasseur:26};
  return Math.min(PLAFOND_DUR, (parMode[g.mode.id] || base) + (g.mode.bonusUnites||0));
}

function spawnEnemy(){
  const g=G;
  /* Saturation : on attend qu'il y ait de la place plutot que d'empiler */
  if(unitesActives(g) >= plafondEnnemis(g)) return;
  /* Les variantes avancees restent pilotees par le noeud */
  const nd=S.currentNode;
  const carte2 = nd>=13;      /* CHAOS PROTOCOL : sprites et statistiques dedies */
  VARIANTES = carte2 ? {
    chasseur:{slot:'cxRapide', hp:2.1, vy:1.45},
    tireur:  {slot:'cxSniper', hp:2.0, vy:1.1},
    tank:    {slot:'cxTank',   hp:2.4, vy:0.9},
    kamikaze:{slot:'cxGuepe',  hp:1.5, vy:1.2},
    diviseur:{slot:'cxDrone',  hp:1.8, vy:1.2},
    bouclier:{slot:'cxLourd',  hp:2.2, vy:0.95},
    teleport:{slot:'cxElite',  hp:1.9, vy:1.15},
    poseur:  {slot:'cxBoss',   hp:2.0, vy:0.9}
  } : {
    /* Trois paliers de variantes : plus on avance, plus les unites sont serieuses */
    chasseur:(nd>=11||g.wave>15)?{slot:'enemyZeroG',      hp:1.9, vy:1.4}
            :(nd>=9 ||g.wave>10)?{slot:'enemyDroneAv',    hp:1.5, vy:1.25, comport:'harceleur'}:null,
    tireur:  (nd>=10||g.wave>13)?{slot:'enemySniperElite',hp:1.8, vy:1.05}
            :(nd>=7 ||g.wave>8) ?{slot:'enemySniper',     hp:1.4, vy:1.0} :null,
    tank:    (nd>=12||g.wave>18)?{slot:'enemyDroneHeavy', hp:2.2, vy:0.85}
            :(nd>=10||g.wave>14)?{slot:'enemyTankCorr',   hp:1.7, vy:0.9} :null,
    kamikaze:(nd>=11||g.wave>16)?{slot:'enemyMineA',      hp:1.3, vy:1.15}:null
  };
  if(g.infini){
    ajouterEnnemi(g, creerEnnemi(typeInfini(g.wave), 44+Math.random()*(g.w-88), -30, g));
    return;
  }
  lancerFormation(g);
}

/* ---------- Comportement par type (appele chaque frame) ---------- */
function majEnnemi(e,g){
  if(e.flash>0) e.flash--;
  /* Effets herites de la formation, valables quel que soit le type */
  if(e.derive){ e.x+=e.derive; }
  if(e.embuscade && e.y>g.h*0.34){       /* la charge se declenche a mi-ecran */
    e.embuscade=false; e.vy*=3.4; e.flash=10;
  }
  if(e.lateral){                      /* entree par le flanc, puis reprise du comportement normal */
    e.x+=e.lateral;
    if(e.x>60 && e.x<g.w-60) e.lateral=0;
    return;
  }
  /* ---- HARCELEUR (drone avance N9+) : il ne fonce pas, il gene ----
     Il se poste sur un flanc a hauteur du joueur, tire en diagonale, et
     change de cote des que le joueur se rapproche trop. Il oblige a
     interrompre son placement pour aller le chercher. */
  if(e.comport==='harceleur'){
    const p=g.player;
    if(e.cote===undefined){ e.cote = (e.x<g.w/2) ? -1 : 1; e.tir=40; e.repli=0; }
    const posteX = e.cote<0 ? g.w*0.16 : g.w*0.84;
    const posteY = Math.max(90, p.y - 190);
    e.x += (posteX - e.x)*0.045;
    e.y += (posteY - e.y)*0.035 + 0.25;

    /* le joueur vient le deloger : il file de l'autre cote */
    if(Math.hypot(p.x-e.x, p.y-e.y) < 150 && e.repli<=0){
      e.cote*=-1; e.repli=95; e.flash=8;
    }
    if(e.repli>0) e.repli--;

    e.tir--;
    if(e.tir<=0){
      /* tir en diagonale vers le joueur, jamais purement vertical */
      const a=Math.atan2(p.y-e.y, p.x-e.x);
      tirEnnemi(e.x, e.y+14, Math.cos(a)*4.6, Math.max(2.2,Math.sin(a)*4.6), '#a78bfa', 'balle');
      e.tir = Math.round(74/(g.mode.cadence||1));
    }
    /* il ne descend jamais jusqu'en bas : on le combat, on ne l'attend pas */
    e.y = Math.min(e.y, g.h*0.62);
    return;
  }

  if(e.kind==='chasseur'){
    /* ---- CHASSEUR : trois tactiques tirees au sort a l'apparition ----
       Fini la ligne droite. Chaque unite pilote avec de l'inertie,
       ce qui produit des courbes au lieu de trajectoires rigides. */
    if(!e.tac){ e.tac=['intercept','zigzag','flanc'][(Math.random()*3)|0]; e.vx=0; e.tacT=0; }
    e.tacT++;
    const p=g.player;
    let ciblex;

    if(e.tac==='intercept'){
      /* Anticipe : vise la ou le joueur SERA, pas la ou il est.
         Le temps de vol estime depend de la distance verticale restante. */
      const dt = Math.max(0, (p.y - e.y)) / Math.max(0.6, e.vy) * 0.55;
      const vJoueur = (p.x - (e.dernierX!==undefined ? e.dernierX : p.x));
      ciblex = p.x + vJoueur * dt;
    }
    else if(e.tac==='zigzag'){
      /* Balayage lateral qui se resserre en approchant du joueur */
      const prox = 1 - Math.min(1, Math.abs(p.y-e.y)/g.h);
      const ampl = 90 * (1 - prox*0.65);
      ciblex = p.x + Math.sin(e.tacT*0.055 + e.y*0.01) * ampl;
    }
    else {
      /* FLANC : plonge sur le cote oppose, depasse le joueur, puis revient
         par le travers. Oblige a surveiller les bords. */
      const cote = (e.cote!==undefined) ? e.cote : (e.cote = (e.x < g.w/2 ? -1 : 1));
      ciblex = (e.y < g.h*0.55) ? (p.x + cote*150) : (p.x - cote*40);
    }
    e.dernierX = p.x;

    /* Pilotage par acceleration : l'unite ne se telepporte pas sur la cible */
    const ecart = ciblex - e.x;
    const accel = Math.max(-0.42, Math.min(0.42, ecart*0.012));
    e.vx = (e.vx||0)*0.92 + accel;
    e.vx = Math.max(-4.4, Math.min(4.4, e.vx));
    e.x += e.vx;

    /* Piqué final : sous une certaine distance il accelere sechement */
    const dist = Math.hypot(p.x-e.x, p.y-e.y);
    e.y += e.vy * (dist<210 ? 1.55 : 1);

    /* Rebond souple sur les bords, il ne sort jamais du terrain */
    if(e.x<22){ e.x=22; e.vx=Math.abs(e.vx)*0.6; }
    if(e.x>g.w-22){ e.x=g.w-22; e.vx=-Math.abs(e.vx)*0.6; }
  }
  else if(e.kind==='tireur'){
    /* Trois ecoles de tir tirees au sort : la parade n'est jamais la meme */
    if(!e.ecole) e.ecole=['rafale','eventail','predictif'][(Math.random()*3)|0];
    if(e.y<e.posteY) e.y+=e.vy;                                            /* descend puis stationne */
    else {
      e.x+=Math.sin(g.frame*0.02+e.posteY)*0.9;
      e.tir--;
      if(e.tir<=0){
        e.rafale=(e.rafale||0)+1;
        const munition = e.avance?'lance':'plasma';
        if(e.ecole==='eventail'){
          /* Trois traits ecartes : couvre une zone, se contourne par les cotes */
          for(let k=-1;k<=1;k++) tirEnnemi(e.x, e.y+18, k*1.9, 5.1, '#fb923c', munition);
          e.tir = Math.round(66/(g.mode.cadence||1));
        } else if(e.ecole==='predictif'){
          /* Vise ou le joueur SERA : rester en mouvement rectiligne ne sauve plus */
          const p=g.player;
          const dt=Math.max(0,(p.y-e.y))/5.6;
          const vx=(p.x-(e.viseX!==undefined?e.viseX:p.x));
          e.viseX=p.x;
          const cible=p.x+vx*dt*0.5;
          const dx=Math.max(-2.6,Math.min(2.6,(cible-e.x)*0.02));
          tirEnnemi(e.x, e.y+18, dx, 5.4, '#fb923c', munition);
          e.tir = Math.round(52/(g.mode.cadence||1));
        } else {
          tirEnnemi(e.x,e.y+18,0,5.6,'#fb923c', munition);                  /* rafale de 3 */
          e.tir = Math.round(((e.rafale%3===0) ? 78 : 11) / (g.mode.cadence||1));
        }
      }
    }
  }
  else if(e.kind==='kamikaze'){
    /* Un sur trois marque un temps d'arret avant de plonger : la feinte
       casse le reflexe d'esquive automatique. */
    if(e.feinte===undefined) e.feinte = Math.random()<0.34 ? 42 : 0;
    if(e.feinte>0 && e.y>g.h*0.22){
      e.feinte--; e.x+=Math.sin(g.frame*0.13)*1.6;
      if(e.feinte===0) e.flash=8;
      return;
    }
    if(!e.charge && e.y>(e.avance?g.h*0.15:g.h*0.3)) e.charge=true;   /* la mine s'amorce plus tot */                            /* declenche la charge */
    if(e.charge){
      const a=Math.atan2(g.player.y-e.y, g.player.x-e.x);
      const v=e.vy*2.6;
      e.x+=Math.cos(a)*v; e.y+=Math.sin(a)*v;
    } else e.y+=e.vy;
  }
  else if(e.kind==='teleport'){
    /* TELEPORTEUR : se volatilise et reapparait ailleurs, souvent derriere le joueur */
    e.y+=e.vy*0.6;
    e.tp=(e.tp||120)-1;
    if(e.tp<=0){
      e.invisible=(e.invisible?0:22);
      if(!e.invisible){
        e.x=40+Math.random()*(g.w-80);
        e.y=g.player.y + (Math.random()<0.5? -110 : 90);
        e.y=Math.max(60,Math.min(g.h-90,e.y));
        parts(e.x,e.y,'#a78bfa',10);
      }
      e.tp = e.invisible? 22 : (100+Math.random()*80);
    }
  }
  else if(e.kind==='bouclier'){
    /* PORTEUR DE BOUCLIER : invulnerable de face, il faut le contourner */
    e.y+=e.vy;
    e.x+=Math.sin(g.frame*0.02+e.r)*1.1;
    e.angleBouclier=Math.atan2(g.player.y-e.y, g.player.x-e.x);
  }
  else if(e.kind==='diviseur'){
    /* DIVISEUR : descend en cloche, se scinde en deux a la mort */
    e.y+=e.vy;
    e.x+=Math.cos(e.y*0.026)*1.9;
  }
  else if(e.kind==='poseur'){
    /* POSEUR : seme des mines statiques sur son passage */
    e.y+=e.vy;
    e.x+=Math.sin(e.y*0.02)*1.3;
    e.pose=(e.pose===undefined?80:e.pose)-1;
    if(e.pose<=0 && g.enemies.filter(x=>x.kind==='minefixe').length<8){   /* 8 mines au sol au maximum */
      ajouterEnnemi(g, {kind:'minefixe', x:e.x, y:e.y, r:13, hp:1, maxHp:1, vy:0,
                      color:'#dc2626', forme:'cercle', vie:900, flash:0, derivY:0.18});
      e.pose=110;
    }
  }
  else if(e.kind==='minefixe'){
    /* MINE LARGUEE : elle descend lentement vers la zone du joueur.
       Immobile, elle restait en haut de l'ecran et ne menacait personne. */
    e.vie--;
    e.derivY = Math.min(1.15, (e.derivY||0.18)+0.004);   /* accelere doucement */
    e.y += e.derivY;
    e.x += Math.sin((G.frame||0)*0.03 + e.y*0.01)*0.35;   /* leger balancement */
    if(e.y > g.h+40){ e.expiree=true; }                    /* sortie d'ecran */
    if(e.vie<=0){ e.expiree=true; }
    else if(e.vie<90 && Math.floor(e.vie/6)%2===0){ e.flash=2; }   /* clignote avant de s'eteindre */
  }
  else {
    /* TANK et variantes lourdes : lent, roulis, et surtout une salve lourde.
       Sans tir il traversait l'ecran sans jamais menacer personne. La cadence
       est basse et le projectile lent : on doit pouvoir l'esquiver, mais il
       faut s'en occuper. */
    e.y+=e.vy; e.x+=Math.sin(e.y*0.02)*0.7;
    if(e.y>0 && e.y<g.h*0.72){
      e.tir=(e.tir===undefined?110:e.tir)-1;
      if(e.tir<=0){
        const p=g.player;
        const a=Math.atan2(p.y-e.y, p.x-e.x);
        /* deux orbes lourds, ecartes : on passe entre les deux */
        for(const dec of [-0.22, 0.22]){
          tirEnnemi(e.x, e.y+16, Math.cos(a+dec)*3.1, Math.max(1.8, Math.sin(a+dec)*3.1),
                    '#34d399', 'orbe');
        }
        e.flash=6;
        e.tir = Math.round(132/(g.mode.cadence||1));
      }
    }
  }
}

/* ---------- Projectiles ennemis ---------- */
/* Sprite de projectile selon le tireur : chaque menace se reconnait d'un coup d'oeil */
const PROJ_SPRITE={ plasma:'projPlasma', lance:'projLance', orbe:'projOrbe',
                    disque:'projDisque', missile:'projMissile', singularite:'projSingularite',
                    /* deux munitions supplementaires : le tir de boss et la balle
                       standard, jusqu'ici jamais affichees */
                    tirBoss:'projBoss', balle:'projBalle' };
function tirEnnemi(x,y,vx,vy,couleur,type){
  if(!G) return;
  if(G.frame%9===0) Audio2.jouerSfx('enemy_shoot');   /* pas a chaque projectile */
  const t=type||'plasma';
  const gros = (t==='orbe'||t==='disque'||t==='singularite');
  G.eBullets.push({x,y,vx,vy,r:gros?11:6,color:couleur||'#fb7185',
                   sprite:PROJ_SPRITE[t]||null, angle:Math.atan2(vy,vx),
                   spin:(t==='disque'?0.22:t==='tirBoss'?0.14:0)});
}

/* ---------- Apparition du boss ---------- */
function declencherBoss(g){
  const def=g.bossDef || bossDuNoeud(S.currentNode, g.wave);
  if(!def) return;
  g.bossDef=def;
  g.bossWarn=110;                                              /* 1.8s de warning avant l'entree */
  toast('\u26a0\ufe0f '+def.nom+' D\u00c9TECT\u00c9',2600);
  sfx('nuke'); vibrate(70);
}
function spawnBoss(g){
  const def=g.bossDef || bossDuNoeud(S.currentNode, g.wave); if(!def) return;
  const hp=Math.round((34+S.weapon*4)*def.hpMult*g.mode.hp);
  g.boss={ def, x:g.w/2, y:-def.rayon*1.2, r:def.rayon, hp, maxHp:hp,
           phase:1, angle:0, tir:40, invoque:260, entree:true, flash:0, dir:1 };
  g.bossSpawned=true;
}

/* ---------- Comportement du boss : patterns + phases ---------- */
function majBoss(g){
  const b=g.boss; if(!b) return;
  const d=b.def;
  if(b.flash>0) b.flash--;
  if(b.entree){                                                /* animation d'entree */
    b.y+=2.2;
    if(b.y>=110){ b.y=110; b.entree=false; }
    return;
  }
  b.angle+=d.rotation||0;
  /* Phase 2 du dragon a 50% PV : plus rapide, pattern renforce */
  /* NEXUS PRIME : 5 apparences, une mutation tous les 20 % de PV */
  if(d.phases5){
    const palier = Math.min(5, 1+Math.floor((1-b.hp/b.maxHp)/0.2));
    if(palier>b.phase){
      b.phase=palier; b.flash=16; g.shake=26;
      toast('\u26a1 MUTATION \u2014 FORME '+palier+'/5',2400);
      sfx('nuke'); haptique('boss');
      for(let i=0;i<10;i++) parts(b.x+(Math.random()-0.5)*110, b.y+(Math.random()-0.5)*110, d.couleur, 7);
    }
  }
  if(d.phases3 && !d.phases5 && b.phase===2 && b.hp<=b.maxHp*0.22){
    b.phase=3; toast('\u2620\ufe0f PHASE FINALE \u2014 '+d.nom,3000); sfx('nuke'); haptique('boss'); g.shake=30;
  }
  if(d.phase2 && b.phase===1 && b.hp<=b.maxHp*0.5){
    b.phase=2; toast('\ud83d\udd25 PHASE 2 \u2014 '+d.nom+' EN FUREUR',2600);
    sfx('nuke'); haptique('boss'); g.shake=24; b.flash=14;
    for(let i=0;i<8;i++) parts(b.x+(Math.random()-0.5)*90, b.y+(Math.random()-0.5)*90, d.couleur, 6);
  }
  const vitesse = 1.7 + Math.min(b.phase-1,4)*0.62;   /* acceleration progressive */
  b.x+=b.dir*vitesse;
  if(b.x<70){ b.x=70; b.dir=1; } if(b.x>g.w-70){ b.x=g.w-70; b.dir=-1; }

  b.tir--;
  if(b.tir<=0){
    if(d.pattern==='spirale'){                                 /* VORTEX : spirale continue */
      const nb=b.phase===2?3:2;
      for(let i=0;i<nb;i++){
        const a=b.angle*7+i*(Math.PI*2/nb);
        tirEnnemi(b.x,b.y,Math.cos(a)*4.2,Math.sin(a)*4.2+1.2,'#c084fc','disque');
      }
      b.tir=Math.max(3,Math.round(7/(g.mode.cadence||1)));
    }
    else if(d.pattern==='croix'){                              /* SENTINELLE : croix rotative */
      const base=b.angle+ (b.phase===2?0.5:0);
      for(let i=0;i<4;i++){
        const a=base+i*Math.PI/2;
        tirEnnemi(b.x,b.y,Math.cos(a)*4.6,Math.sin(a)*4.6,'#67e8f9','missile');
      }
      b.angle+=0.42; b.tir=Math.round((b.phase===2?26:38)/(g.mode.cadence||1));
    }
    else if(d.pattern==='fusion'){
      /* NEXUS : alterne les trois patterns, intensite selon la phase */
      const cycle=Math.floor(g.frame/240)%3;
      if(cycle===0){
        const nb=b.phase>=2?4:3;
        for(let i=0;i<nb;i++){ const a=b.angle*7+i*(Math.PI*2/nb);
          tirEnnemi(b.x,b.y,Math.cos(a)*4.4,Math.sin(a)*4.4+1,'#c084fc','singularite'); }
        b.tir=Math.max(4,Math.round(8/(g.mode.cadence||1)));
      } else if(cycle===1){
        for(let i=0;i<4;i++){ const a=b.angle+i*Math.PI/2;
          tirEnnemi(b.x,b.y,Math.cos(a)*4.8,Math.sin(a)*4.8,'#67e8f9','disque'); }
        b.angle+=0.5; b.tir=Math.round((b.phase>=2?22:32)/(g.mode.cadence||1));
      } else {
        const nb=b.phase>=2?9:6, ouv=1.6;
        const vise=Math.atan2(g.player.y-b.y, g.player.x-b.x);
        for(let i=0;i<nb;i++){ const a=vise-ouv/2+ouv*(i/(nb-1));
          tirEnnemi(b.x,b.y+18,Math.cos(a)*5.4,Math.sin(a)*5.4,'#f0abfc','singularite'); }
        b.tir=Math.round((b.phase>=2?36:56)/(g.mode.cadence||1));
      }
    }
    else {                                                     /* DRAGON : eventail vers le joueur */
      const nb=b.phase===2?7:5, ouv=b.phase===2?1.5:1.0;
      const vise=Math.atan2(g.player.y-b.y, g.player.x-b.x);
      for(let i=0;i<nb;i++){
        const a=vise-ouv/2+ouv*(i/(nb-1));
        tirEnnemi(b.x,b.y+20,Math.cos(a)*5.2,Math.sin(a)*5.2,'#f0abfc',
                  (d.id==='prime'||d.id==='gardien')?'tirBoss':'missile');
      }
      b.tir=Math.round((b.phase===2?42:66)/(g.mode.cadence||1));
    }
  }
  /* Invocations : le boss appelle des renforts */
  if(d.invoque){
    b.invoque--;
    if(b.invoque<=0){ spawnEnemy(); spawnEnemy(); b.invoque=b.phase===2?190:300; toast('\u2795 RENFORTS'); }
  }
}

function tuerBoss(g){
  const b=g.boss, def=b.def;
  /* Sequence de mort : on l'arme toujours, le rendu utilise le sprite s'il est la */
  g.mortBoss={x:b.x, y:b.y, life:70, maxLife:70,
               sprite: def.mort || (def.id==='nexus'?'nexusDeath':def.id==='prime'?'primeDeath':null)};
  for(let i=0;i<10;i++) setTimeout(()=>{ if(G) spawnExplosion(b.x+(Math.random()-0.5)*120, b.y+(Math.random()-0.5)*120, 28); }, i*95);
  g.score+=Math.floor(900*g.mode.reward); g.frags+=14; g.kills++;
  S.totalKills++; S.secretBossKilled=true;
  g.boss=null; g.shake=34; sfx('nuke'); haptique('boss');
  if(def.mini){ g.bossSpawned=false; g.bossTimer=0; g.bossDef=null; }   /* un autre eclaireur viendra */
  toast('\ud83c\udfc6 '+def.nom+' TERRASS\u00c9',3200);
  if(!g.infini && !def.mini){
    tenterFragment(S.currentNode);                 /* peut laisser un fragment de cle */
    if(!g.arena && !g.coop) conclureSecteur(g,'boss');   /* le boss tombe : mission accomplie */
  }
}

function kill(e,idx){
  const g=G; g.enemies.splice(idx,1);
  if(g.wing){ if(e.tueParWing) g.wing.kills++; else g.killsJoueur=(g.killsJoueur||0)+1; }
  /* DIVISEUR : deux fragments plus rapides prennent sa place */
  if(e.kind==='diviseur' && !e.fragment && g.enemies.length<28){
    for(const s of [-1,1]){
      ajouterEnnemi(g, {kind:'chasseur', fragment:true, x:e.x+s*22, y:e.y, r:e.r*0.62,
        hp:Math.max(1,e.maxHp*0.35), maxHp:Math.max(1,e.maxHp*0.35), vy:e.vy*1.5,
        color:'#f0abfc', slot:e.slot, forme:'triangle', flash:0});
    }
    toast('\u2702\ufe0f Il se divise !',1200);
  }
  let base=e.type==='boss'?110:e.type==='heavy'?18:e.type==='node'?10:6;
  if(e.kind==='tank'||e.kind==='bouclier') base=16;
  if(e.kind==='diviseur'||e.kind==='teleport'||e.kind==='poseur') base=12;
  if(e.prime){ base=180; toast('\ud83d\udcb0 Prime encaiss\u00e9e !',1600); }
  g.score+=Math.floor(base*g.combo*g.shipBonus*g.mode.reward);
  g.kills++; S.totalKills++;
  if(e.type==='boss'){ g.frags+=7; S.secretBossKilled=true; }
  else g.frags+=e.type==='heavy'?2:1;
  g.combo=Math.min(g.combo+0.32,6.5); g.comboTimer=90;
  if(g.combo>(g.comboMax||0)) g.comboMax=g.combo;
  spawnExplosion(e.x,e.y);
  sfx(e.type==='boss'?'nuke':'kill');
  larguerDrop(e,g);
}

function parts(x,y,col,n){ const m=PART_MULT[(S.prefs&&S.prefs.particules)||'normal']||1; n=Math.max(1,Math.round(n*m)); for(let i=0;i<n;i++) G.particles.push({x,y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,life:12+Math.random()*14,color:col}); }
function spawnExplosion(x,y,ampleur){ const v=ampleur||18; G.explosions.push({x,y,life:v, maxLife:v}); }

function draw(){
  const g=G, ctx=g.ctx;
  ctx.save();
  if(g.shake>0) ctx.translate((Math.random()-0.5)*g.shake,(Math.random()-0.5)*g.shake);

  // Fond : on efface, le decor vient du CSS derriere. Voile leger = projectiles lisibles.
  ctx.clearRect(0,0,g.w,g.h);
  ctx.fillStyle='rgba(3,3,8,0.42)';
  ctx.fillRect(0,0,g.w,g.h);
  ctx.fillStyle='rgba(255,255,255,0.32)';
  for(let i=0;i<70;i++){ const sx=(i*97+g.frame*0.4)%g.w, sy=(i*59+g.frame*1.35)%g.h; ctx.fillRect(sx,sy,i%7===0?2.2:1.1,i%7===0?2.2:1.1); }
  ctx.strokeStyle='rgba(153,69,255,0.045)'; ctx.lineWidth=1;
  for(let y=(g.frame%42);y<g.h;y+=42){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(g.w,y);ctx.stroke(); }

  // Orbs
  g.orbs.forEach(o=>{
    const img = o.slot ? ASSETS[o.slot] : (o.t==='noyau'?ASSETS.orbSol:ASSETS.orbSkr);
    const battement=1+Math.sin(o.pulse||0)*0.10;
    const t=(o.r||14)*2.6*battement;
    /* Halo pour reperer le drop dans le feu de l'action */
    ctx.beginPath(); ctx.arc(o.x,o.y,t*0.55,0,7);
    ctx.fillStyle=(o.color||'#14F195')+'22'; ctx.fill();
    if(img){ ctx.drawImage(img, o.x-t/2, o.y-t/2, t, t); }
    else {
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r||10,0,7);
      ctx.fillStyle=o.color||'#14F195'; ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0;
    }
  });

  // Enemies — use all variants
  g.enemies.forEach(e=>{
    if(e.invisible){                       /* teleporteur en transit : simple halo */
      ctx.globalAlpha=0.25;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.r*0.7,0,7);
      ctx.strokeStyle='#c084fc'; ctx.lineWidth=2; ctx.stroke();
      ctx.globalAlpha=1; return;
    }
    const img = e.slot ? ASSETS[e.slot] : null;
    if(img){
      const size=e.r*2.6;
      const rot=(ORIENT[e.slot]||0)*Math.PI/180;
      ctx.save();
      if(e.flash>0){ ctx.globalAlpha=0.65; }
      if(rot){ ctx.translate(e.x,e.y); ctx.rotate(rot); ctx.drawImage(img,-size/2,-size/2,size,size); }
      else   { ctx.drawImage(img, e.x-size/2, e.y-size/2, size, size); }
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(e.x,e.y);
      if(e.kind==='minefixe') dessinerMine(ctx, e);
      else formeFallback(ctx, e.forme||'cercle', e.r, e.color);
      ctx.restore();
    }
    /* Arc de bouclier : montre le cote protege */
    if(e.kind==='bouclier'){
      const a=e.angleBouclier||0;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.r+7,a-0.9,a+0.9);
      ctx.strokeStyle=e.flash>0?'#fff':'#67e8f9'; ctx.lineWidth=3;
      ctx.shadowColor='#67e8f9'; ctx.shadowBlur=10; ctx.stroke(); ctx.shadowBlur=0;
    }
    /* Cible prioritaire : liseré doré */
    if(e.prime){
      ctx.beginPath(); ctx.arc(e.x,e.y,e.r+11,0,7);
      ctx.strokeStyle='#fbbf24'; ctx.lineWidth=2; ctx.stroke();
    }
    if(e.hp < e.maxHp){
      ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(e.x-18, e.y-e.r-14, 36, 4);
      ctx.fillStyle='#14F195'; ctx.fillRect(e.x-18, e.y-e.r-14, 36*(e.hp/e.maxHp), 4);
    }
  });

  /* --- Boss : sprite x3, rotation lente pour le vortex, flash a l'impact --- */
  if(g.boss){
    const b=g.boss, d=b.def;
    /* Sprite selon la phase quand le boss en propose plusieurs */
    const cle = (d.sprites && d.sprites[Math.min(b.phase,d.sprites.length)-1]) || d.sprite;
    /* Repli en cascade : phase -> sprite principal -> premiere phase connue.
       Un boss ne doit jamais s'afficher en losange geometrique. */
    const img = ASSETS[cle] || ASSETS[d.sprite] ||
                ((d.sprites||[]).map(k=>ASSETS[k]).find(Boolean)) || null;
    ctx.save(); ctx.translate(b.x,b.y);
    if(d.rotation) ctx.rotate(b.angle);                 /* rotation continue : vortex uniquement */
    if(b.flash>0){ ctx.globalAlpha=0.6; }
    if(img){ const s=b.r*3; ctx.drawImage(img,-s/2,-s/2,s,s); }
    else formeFallback(ctx,'losange',b.r*1.4,d.couleur);
    ctx.restore();
  }

  /* --- Explosion finale du boss --- */
  if(g.mortBoss){
    const m=g.mortBoss, t=1-m.life/m.maxLife, taille=200+t*420;
    ctx.globalAlpha=Math.max(0, m.life/m.maxLife);
    const sprite = m.sprite ? ASSETS[m.sprite] : null;
    if(sprite) ctx.drawImage(sprite, m.x-taille/2, m.y-taille/2, taille, taille);
    else if(m.life%6===0) spawnExplosion(m.x+(Math.random()-0.5)*140, m.y+(Math.random()-0.5)*140);
    ctx.globalAlpha=1;
    m.life--; if(m.life<=0) g.mortBoss=null;
  }

  if(g.wing) dessinerWingman(g);

  /* --- Projectiles ennemis --- */
  g.eBullets.forEach(p=>{
    const img=p.sprite?ASSETS[p.sprite]:null;
    if(img){
      const t=p.r*4;
      ctx.save(); ctx.translate(p.x,p.y);
      if(p.spin){ p.angle+=p.spin; ctx.rotate(p.angle); }        /* disque tranchant : rotation */
      else ctx.rotate(p.angle+Math.PI/2);                        /* les autres suivent leur trajectoire */
      ctx.drawImage(img,-t/2,-t/2,t,t); ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7);
      ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
    }
  });

  // Bullets — alternate cyan / green
  /* Chaque vaisseau tire differemment : couleur, forme et taille propres.
     TIRS[i] correspond au vaisseau SHIPS[i]. */
  const tir = TIRS[loadout.ship] || TIRS[0];
  /* Palier 45 : munition signature. On remplace le rendu vectoriel par un
     sprite dedie. Meme degats, meme cadence : seul le visuel change. */
  const munSig = debloque('munition') ? (ASSETS.projJoueur2 || ASSETS.projJoueur1) : null;
  if(munSig){
    g.bullets.forEach(b=>{
      const t=22;
      ctx.save();
      ctx.shadowColor=tir.c; ctx.shadowBlur=tir.glow;
      ctx.drawImage(munSig, b.x-t/2, b.y-t/2, t, t);
      ctx.restore();
    });
  } else
  g.bullets.forEach((b,i)=>{
    ctx.save();
    ctx.shadowColor=tir.c; ctx.shadowBlur=tir.glow;
    ctx.fillStyle=tir.c;

    if(tir.forme==='trait'){                       /* Seeker One : trait net */
      ctx.fillRect(b.x-tir.l/2, b.y-tir.h/2, tir.l, tir.h);
    }
    else if(tir.forme==='double'){                 /* Phantom : deux fins traits paralleles */
      ctx.fillRect(b.x-4, b.y-tir.h/2, 2.2, tir.h);
      ctx.fillRect(b.x+1.8, b.y-tir.h/2, 2.2, tir.h);
    }
    else if(tir.forme==='comete'){                 /* Comet : tete ronde et queue degradee */
      const q=ctx.createLinearGradient(0,b.y-4,0,b.y+18);
      q.addColorStop(0,tir.c); q.addColorStop(1,'rgba(251,146,60,0)');
      ctx.fillStyle=q; ctx.fillRect(b.x-2.2, b.y-4, 4.4, 22);
      ctx.fillStyle=tir.c;
      ctx.beginPath(); ctx.arc(b.x,b.y-3,4,0,7); ctx.fill();
    }
    else if(tir.forme==='losange'){                /* Nebula : cristal allonge */
      ctx.beginPath();
      ctx.moveTo(b.x, b.y-9); ctx.lineTo(b.x+4.5, b.y);
      ctx.lineTo(b.x, b.y+9);  ctx.lineTo(b.x-4.5, b.y);
      ctx.closePath(); ctx.fill();
    }
    else if(tir.forme==='eclair'){                 /* King : lance doree epaisse */
      ctx.fillRect(b.x-2.6, b.y-13, 5.2, 26);
      ctx.fillStyle='#fff8dc';
      ctx.fillRect(b.x-1, b.y-11, 2, 22);
    }
    else if(tir.forme==='triple'){                 /* Warden : salve serree de trois */
      for(let k=-1;k<=1;k++) ctx.fillRect(b.x-1.3+k*5, b.y-tir.h/2+Math.abs(k)*3, 2.6, tir.h-Math.abs(k)*5);
    }
    else if(tir.forme==='fleche'){                 /* Raptor : chevron agressif */
      ctx.beginPath();
      ctx.moveTo(b.x, b.y-10); ctx.lineTo(b.x+5.5, b.y+5);
      ctx.lineTo(b.x, b.y+1);  ctx.lineTo(b.x-5.5, b.y+5);
      ctx.closePath(); ctx.fill();
    }
    else if(tir.forme==='onde'){                   /* Specter : anneau qui se dilate */
      const r=3.5+((g.frame+i*5)%14)*0.28;
      ctx.lineWidth=2.4; ctx.strokeStyle=tir.c;
      ctx.beginPath(); ctx.arc(b.x,b.y,r,0,7); ctx.stroke();
    }
    else if(tir.forme==='givre'){                  /* Wraith : eclat a six branches */
      ctx.lineWidth=1.9; ctx.strokeStyle=tir.c;
      for(let k=0;k<3;k++){
        const a=k*Math.PI/3 + (g.frame+i*9)*0.04;
        ctx.beginPath();
        ctx.moveTo(b.x-Math.cos(a)*7, b.y-Math.sin(a)*7);
        ctx.lineTo(b.x+Math.cos(a)*7, b.y+Math.sin(a)*7);
        ctx.stroke();
      }
    }
    else if(tir.forme==='sceau'){                  /* Sovereign : lance doree a garde */
      ctx.fillRect(b.x-2.4, b.y-11, 4.8, 22);
      ctx.fillRect(b.x-6.5, b.y-2, 13, 2.4);
      ctx.fillStyle='#fffbeb'; ctx.fillRect(b.x-1, b.y-9, 2, 18);
    }
    else if(tir.forme==='flamme'){                 /* Inferno : noyau clair, halo braise */
      const q=ctx.createLinearGradient(0,b.y-9,0,b.y+13);
      q.addColorStop(0,'#fed7aa'); q.addColorStop(0.45,tir.c); q.addColorStop(1,'rgba(190,18,60,0)');
      ctx.fillStyle=q;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y-11); ctx.lineTo(b.x+4.2, b.y+2);
      ctx.lineTo(b.x, b.y+13);  ctx.lineTo(b.x-4.2, b.y+2);
      ctx.closePath(); ctx.fill();
    }
    else {                                         /* Ghost : orbe spectral pulsant */
      const r=4.5+Math.sin((g.frame+i*7)*0.25)*1.1;
      ctx.globalAlpha=0.85;
      ctx.beginPath(); ctx.arc(b.x,b.y,r+3,0,7);
      ctx.fillStyle='rgba(226,232,240,.28)'; ctx.fill();
      ctx.globalAlpha=1; ctx.fillStyle=tir.c;
      ctx.beginPath(); ctx.arc(b.x,b.y,r,0,7); ctx.fill();
    }
    ctx.restore();
  });

  // Explosions — cycle 3 variants
  g.explosions.forEach(ex=>{
    const progress = 1 - ex.life/ex.maxLife;
    const size = 45 + progress * 90;
    const expImg = (ex.maxLife>=26 ? ASSETS.fxBoss : ex.maxLife>=20 ? ASSETS.fxLarge : ASSETS.fxSmall)
                 || ASSETS.fxSmall;
    if(expImg){
      ctx.globalAlpha = Math.max(0.15, ex.life / ex.maxLife);
      ctx.drawImage(expImg, ex.x-size/2, ex.y-size/2, size, size);
      ctx.globalAlpha = 1;
    }
  });

  // Companion (Ghost ship) — prefer new ghost_v2
  if(g.companions){
    const gImg = ASSETS.ship5 || ASSETS.ship1 || ASSETS.ship0;
    g.companions.forEach(c=>{
      /* clignote sur la fin pour annoncer la disparition */
      ctx.globalAlpha = (c.life<90 && Math.floor(c.life/6)%2===0) ? 0.3 : 0.82;
      if(gImg) ctx.drawImage(gImg, c.x-30, c.y-30, 60, 60);
      else { ctx.save(); ctx.translate(c.x,c.y); formeFallback(ctx,'triangle',c.r,'#c4b5fd'); ctx.restore(); }
      ctx.globalAlpha=1;
    });
  }

  /* Vaisseau du joueur : un sprite dedie par modele (ship0 a ship5).
     L'ancien code visait des slots qui n'existent plus, d'ou le vaisseau
     geometrique de secours affiche a la place du sprite achete. */
  const p=g.player;
  const pImg = ASSETS['ship'+loadout.ship] || ASSETS.ship0 || ASSETS.ship2;

  const clignote = g.invuln>0 && Math.floor(g.frame/4)%2===0;
  if(clignote) ctx.globalAlpha=0.35;
  /* Palier 120 : traînee de reacteur coloree sous le vaisseau. */
  if(debloque('trainee')){
    const t=(TRAINEES.find(x=>x.id===S.trainee)||TRAINEES[0]).c;
    const l=16+Math.random()*10;
    ctx.save();
    ctx.globalAlpha=0.55;
    const grad=ctx.createLinearGradient(0,p.y+16,0,p.y+16+l);
    grad.addColorStop(0,t); grad.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=grad;
    ctx.beginPath(); ctx.moveTo(p.x-7,p.y+16); ctx.lineTo(p.x,p.y+16+l); ctx.lineTo(p.x+7,p.y+16); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if(pImg){
    /* Livree debloquee par les paliers on-chain : purement visuelle,
       elle ne change ni les degats ni la taille du vaisseau. */
    const liv = filtreLivree();
    if(liv) ctx.filter = liv;
    ctx.drawImage(pImg, p.x-40, p.y-40, 80, 80);
    if(liv) ctx.filter = 'none';
  } else {
    ctx.save(); ctx.translate(p.x,p.y);
    ctx.fillStyle='rgba(153,69,255,0.4)'; ctx.beginPath(); ctx.moveTo(-7,14); ctx.lineTo(0,28+Math.random()*6); ctx.lineTo(7,14); ctx.fill();
    ctx.shadowColor='#9945FF'; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(15,14); ctx.lineTo(0,7); ctx.lineTo(-15,14); ctx.closePath();
    ctx.fillStyle='#c4b5fd'; ctx.fill(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(0,-3,5,0,7); ctx.fillStyle='#14F195'; ctx.fill();
    ctx.restore();
  }

  dessinerTerminal(g);

  /* --- Nebuleuse : visibilite reduite autour du vaisseau --- */
  if(g.meca==='brouillard' || (g.event && g.event.id==='blackout')){
    const p=g.player, r=Math.min(g.w,g.h)*0.40;
    const halo=ctx.createRadialGradient(p.x,p.y,r*0.35,p.x,p.y,r);
    halo.addColorStop(0,'rgba(5,4,14,0)');
    halo.addColorStop(1,'rgba(5,4,14,0.93)');
    ctx.fillStyle=halo; ctx.fillRect(0,0,g.w,g.h);
  }

  /* --- Barre de vie du boss (HUD dedie) --- */
  if(g.boss && !g.boss.entree){
    const b=g.boss, w=Math.min(g.w-60,340), x=(g.w-w)/2, y=52;
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(x-2,y-2,w+4,14);
    ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(x,y,w,10);
    const grad=ctx.createLinearGradient(x,0,x+w,0);
    grad.addColorStop(0,b.def.couleur); grad.addColorStop(1, b.phase===2?'#ef4444':'#14F195');
    ctx.fillStyle=grad; ctx.fillRect(x,y,w*Math.max(0,b.hp/b.maxHp),10);
    ctx.font='bold 11px Orbitron,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#fff';
    ctx.fillText(b.def.nom+(b.phase===2?'  \u2022  PHASE 2':''), g.w/2, y-6);
    ctx.textAlign='left';
  }
  /* --- Warning clignotant avant l'entree du boss --- */
  if(g.bossWarn>0){
    const al=0.30+0.32*Math.sin(g.frame*0.3);
    ctx.fillStyle='rgba(239,68,68,'+al.toFixed(2)+')'; ctx.fillRect(0,g.h*0.36,g.w,64);
    ctx.font='bold 17px Orbitron,sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#fff';
    ctx.fillText('\u26a0 '+((g.bossDef&&g.bossDef.nom)||'BOSS')+' D\u00c9TECT\u00c9', g.w/2, g.h*0.36+40);
    ctx.textAlign='left';
  }

  ctx.globalAlpha=1;

  // Particles
  g.particles.forEach(pt=>{
    ctx.globalAlpha=pt.life/26; ctx.fillStyle=pt.color; ctx.fillRect(pt.x,pt.y,2.8,2.8);
  });
  ctx.globalAlpha=1; ctx.restore();
}

function endGame(){
  G.running=false; cancelAnimationFrame(G.raf); stopMusic();
  const g=G;
  /* Le mode demo joue sur des secteurs avances (VORTEX, NEXUS, CHAOS...).
     Sa fin de partie ecrivait dans la progression : credits, etoiles,
     contrats, et surtout completedNodes. Resultat : quelques minutes
     d'inactivite suffisaient a "terminer" le NEXUS et a ouvrir la
     seconde campagne. On travaille donc sur une copie de l'etat, qu'on
     jette ensuite : aucune ligne d'endGame ne peut plus fuir, meme
     celles qu'on ajoutera plus tard. */
  const _etatAvantDemo = g.demo ? JSON.stringify(S) : null;
  const _finirDemo = ()=>{
    if(!_etatAvantDemo) return;
    /* endGame appelle save() en cours de route : on restaure ET on
       reecrit, sinon l'etat pollue reste dans le stockage local. */
    try{ S=JSON.parse(_etatAvantDemo); save(); }catch(e){ LOG.warn('[SEEKER] restauration demo impossible'); }
  };
  /* Le resultat s'entend avant de se lire */
  Audio2.jouerMusique(g.lives>0 ? 'victoire' : 'defaite');
  if(g.infini){
    const scoreInfini = g.wave*1000 + Math.max(0,g.lives)*100 + g.score;
    if(!S.infiniRecord || scoreInfini>S.infiniRecord){
      S.infiniRecord=scoreInfini; S.infiniVague=g.wave;
      toast('\ud83c\udfc5 NOUVEAU RECORD \u2022 vague '+g.wave+' \u2022 '+scoreInfini.toLocaleString(),3600);
    }
    g.score=scoreInfini;
  }
  /* Recompense de mission : uniquement des cr\u00e9dits de jeu */
  /* Les noyaux ramasses se convertissent en credits de jeu a la fin */
  const gcG=Math.floor((g.score/6 + g.frags*2.3 + (g.noyaux||0)*220) * g.mode.reward);
  S.skr+=gcG;
  if(g.score>S.highScore) S.highScore=g.score;
  /* La demo joue sur des secteurs avances (VORTEX, NEXUS, CHAOS...) : sans
     ce garde-fou, elle les marquait comme termines et le joueur se
     retrouvait avec toute la campagne debloquee sans y avoir touche. */
  if(!g.demo && !g.infini && !g.arena && !g.coop && S.currentNode>=0 && !S.completedNodes.includes(S.currentNode)){
    S.completedNodes.push(S.currentNode); toast('Secteur s\u00e9curis\u00e9');
  }
  /* --- Contrat de secteur --- */
  if(g.contrat && g.lives>0){
    /* Un contrat rempli en Extreme reste a decrocher en Normal et
       inversement : chaque cran a sa propre recompense. */
    const cle=S.currentNode+':'+(g.contrat.difficulte||'normal');
    const dejaFait=(S.contratsRemplis||[]).includes(cle);
    if(contratRempli(g)){
      if(!dejaFait) S.skr+=g.contrat.gc;
      S.contratsRemplis=(S.contratsRemplis||[]).includes(cle)
        ? S.contratsRemplis : (S.contratsRemplis||[]).concat(cle);
      setTimeout(()=>toast('\u2713 CONTRAT REMPLI \u2022 '+g.contrat.def.nom+(dejaFait?'':' \u2022 +'+g.contrat.gc+' GC'),3400),700);
      Audio2.jouerSfx('levelup');
    } else {
      setTimeout(()=>toast('\u2717 Contrat non rempli \u2022 '+g.contrat.def.nom,2600),700);
    }
  }

  /* --- Exploits : records personnels et secrets --- */
  if((g.comboMax||0) > (S.comboMax||0)) S.comboMax=g.comboMax;
  if(g.lives>0 && !g.infini && !g.arena){
    if(!g.viePerdue) S.sansDegat=(S.sansDegat||0)+1;
    if(BOSS_DEFS[S.currentNode] && !g.bonusUtilise) S.sansBonus=(S.sansBonus||0)+1;
    if(!S.prefs.son && !S.prefs.musique) debloquerSecret('silence');
    if(S.currentNode===9) debloquerSecret('zerog');
  }
  verifierVaisseaux();
  /* Etoiles : on garde la meilleure difficulte reussie sur ce noeud */
  if(g.lives>0) verifierDeblocage();
  /* Le Nexus tombe : generique de fin */
  if(g.lives>0 && (S.currentNode===21 || (S.currentNode===12 && !boucleDebloquee(4)))){
    S.jeuTermine=true; save();
    setTimeout(()=>{ document.getElementById('modal-result').classList.remove('show'); lancerFinal(); }, 2200);
  }
  if(g.lives>0 && EPILOGUES[S.currentNode] && !(S.epVues||[]).includes(S.currentNode)){
    S.epVues=(S.epVues||[]).concat(S.currentNode);
    setTimeout(()=>afficherTransmission('GENESIS', EPILOGUES[S.currentNode], null, '#c4b5fd'), 1500);
  }
  if(g.lives>0 && !g.infini && S.currentNode>=0){
    const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
    if(!S.nodeStars) S.nodeStars={};
    if((S.nodeStars[S.currentNode]||0) < d.etoiles){
      S.nodeStars[S.currentNode]=d.etoiles;
      toast('\u2b50 Record : '+'\u2605'.repeat(d.etoiles)+' en '+d.nom,3000);
    }
  }
  document.getElementById('res-icon').innerHTML = g.lives>0 ? ico('uiVictoire','🏆',52) : ico('uiDefaite','💥',52);
  document.getElementById('res-title').textContent=g.lives>0?'MISSION RÉUSSIE':'MISSION FAILED';
  const sousTitre=NODES.find(n=>n.id===S.currentNode)?.title||'';
  /* L'indicatif de pilote, debloque a 60 TX, s'affiche avec le secteur. */
  document.getElementById('res-sub').textContent =
    (debloque('indicatif') && S.indicatif) ? ('\u00ab '+S.indicatif+' \u00bb \u2022 '+sousTitre) : sousTitre;
  document.getElementById('res-score').textContent=g.score;
  document.getElementById('res-kills').textContent=g.kills;
  document.getElementById('res-frags').textContent=g.frags;
  document.getElementById('res-wave').textContent=g.wave;
  document.getElementById('res-reward').textContent=`+${gcG.toLocaleString()} GC`;
  if(NODES.find(x=>x.id===S.currentNode&&x.type==='hub')){
    S.charges={ mitra:2, nuke:1, ghost:1 };      /* QG Terre : reapprovisionnement complet */
    toast('\ud83d\udee0\ufe0f R\u00e9approvisionnement complet');
  }
  if(g.lives>0){ Audio2.jouerSfx('victory'); haptique('victoire'); }
  else { Audio2.jouerSfx('defeat'); haptique('defaite'); }
  Audio2.jouerMusique('menu');
  /* Le score entre au classement local */
  if(g.coop && g.wing){
    const moi=g.killsJoueur||0, lui=g.wing.kills||0;
    const verdict = moi>lui?'VICTOIRE':moi<lui?'D\u00c9FAITE':'\u00c9GALIT\u00c9';
    const sub=document.getElementById('res-sub');
    if(sub) sub.textContent='VOUS '+moi+' \u2014 WINGMAN '+lui+'  \u2022  '+verdict;
    if(moi>lui){ S.skr+=180; Audio2.jouerSfx('victory'); toast('\ud83c\udfc6 '+verdict+' \u2022 +120 GC',3200); }
    else { Audio2.jouerSfx('defeat'); toast(verdict,2400); }
    enregistrerRecord('Arena Coop', g.score, moi+' vs '+lui);
  }
  if(g.arena){
    const bonus=g.arenaReussi?1.5:1;
    const sc=Math.round(g.score*bonus);
    if(!S.arenaRecords) S.arenaRecords={};
    if(sc>(S.arenaRecords[g.arena.id]||0)){
      S.arenaRecords[g.arena.id]=sc;
      toast('\ud83c\udfc5 Record Arena \u2022 '+sc.toLocaleString(),3200);
    }
    enregistrerRecord('Arena \u2022 '+g.arena.nom, sc, g.arenaReussi?'termin\u00e9':'\u00e9limin\u00e9');
    g.score=sc;
  }
  else if(g.infini) enregistrerRecord('Mode Infini', g.score, 'vague '+g.wave);
  else if(S.currentNode>=0){
    const nd=NODES.find(x=>x.id===S.currentNode);
    const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
    enregistrerRecord(nd?nd.title:'Mission', g.score, d.nom+(g.lives>0?'':' \u2022 \u00e9chec'));
  }
  document.getElementById('modal-result').classList.add('show');
  save();

  _finirDemo();   /* la demo ne laisse aucune trace dans la progression */
}
function closeResult(){ document.getElementById('modal-result').classList.remove('show'); show('map'); ui(); }

/* ============================================================
   ARMURERIE — 18 articles en 4 rayons
   ============================================================ */
function articlesShop(){
  return [
   {cat:'\u2699\ufe0f AM\u00c9LIORATIONS PERMANENTES', items:[
    {id:'wpn',   ico:'icoArme',   name:'Weapon Core',     desc:T('+1 niveau d\u2019arme')+' ('+T('actuel')+' : '+S.weapon+')', sol:0, skr:450},
    {id:'rate',  ico:'icoCadence',name:'Hyper Cycle',     desc:'Cadence +20% d\u00e9finitive',            sol:0, skr:600},
    {id:'vie',   ico:'icoCoque',   name:'Coque renforc\u00e9e', desc:'+1 vie de d\u00e9part (max 3)',       sol:0, skr:800},
    {id:'aimant',ico:'icoShield',  name:'Aimant \u00e0 butin',  desc:'Rayon de ramassage +60%',           sol:0, skr:550}
   ]},
   {cat:'\ud83d\udca5 CHARGES DE BONUS', items:[
    {id:'mitra', ico:'pwMinigun', name:'+2 Mitrailleuse',  desc:T('En stock')+' : '+(S.charges.mitra||0), sol:0, skr:120},
    {id:'nuke',  ico:'pwNuke',    name:'+1 Bombe',         desc:T('En stock')+' : '+(S.charges.nuke||0),  sol:0, skr:200},
    {id:'ghost', ico:'pwGhost',   name:'+1 Fant\u00f4me',      desc:T('En stock')+' : '+(S.charges.ghost||0), sol:0, skr:180},
    {id:'lot3',  ico:'icoLot',   name:'Lot complet',      desc:'2 mitrailleuses + 1 bombe + 1 fant\u00f4me', sol:0, skr:420}
   ]},
   {cat:'\ud83c\udfaf MUNITIONS', items:[
    {id:'spread',ico:'icoSpread',name:'Spread',      desc:S.unlockedMun.includes('spread')?T('Débloquée'):T('Tir large, 5 projectiles'), sol:0, skr:260, unique:'spread'},
    {id:'perf',  ico:'ammoPerf',   name:'Perforantes', desc:S.unlockedMun.includes('perf')?T('Débloquée'):T('Dégâts')+' \u00d71.55', sol:0, skr:340, unique:'perf'},
    {id:'hyper', ico:'ammoHoming', name:'Hyper Rapid', desc:S.unlockedMun.includes('hyper')?T('Débloquée'):T('Cadence')+' \u00d71.7', sol:0, skr:400, unique:'hyper'}
   ]},
   {cat:'\ud83d\udee0\ufe0f CONSOMMABLES \u2014 une mission', items:[
    {id:'repair', ico:'icoRepair',  name:'Kit de r\u00e9paration', desc:'+2 vies',        sol:0, skr:90},
    {id:'scan',   ico:'icoScan',   name:'Scan tactique',       desc:'Drops \u00d71.5',   sol:0, skr:130},
    {id:'boost',  ico:'icoBoost',name:'Surcharge',           desc:'D\u00e9g\u00e2ts \u00d71.3', sol:0, skr:160}
   ]}
  ];
}
function renderShop(){
  const box=document.getElementById('shop-list'); if(!box) return;
  box.innerHTML=articlesShop().map(rayon=>
    '<div class="text-[10px] text-gray-500 font-semibold tracking-wider mt-3 mb-1.5">'+rayon.cat+'</div>'+
    rayon.items.map(i=>{
      const img=ASSETS[i.ico];
      const possede = i.unique && S.unlockedMun.includes(i.unique);
      const prixOk = i.sol ? S.sol>=i.sol : S.skr>=i.skr;
      return '<div class="glass rounded-2xl flex justify-between items-center gap-3" style="padding:14px 15px;margin-bottom:10px"'+
        (possede?' data-off':'')+'>'+
        '<div class="flex items-center gap-2.5" style="min-width:0">'+
          (img?'<img src="'+img.src+'" style="width:30px;height:30px;object-fit:contain;flex:none"/>':'')+
          '<div style="min-width:0"><div class="font-semibold text-[13px]">'+T(i.name)+'</div>'+
          '<div class="text-[10px] text-gray-500">'+T(i.desc)+'</div></div>'+
        '</div>'+
        (possede
          ? '<span class="text-[10px] text-green-400 flex-none">\u2713</span>'
          : '<button onclick="buy(\''+i.id+'\')" class="'+(prixOk?'btn':'glass')+' px-3 py-2 rounded-xl text-[11px] font-bold flex-none"'+
            (prixOk?'':' style="opacity:.5"')+'>'+
            (i.sol?i.sol+' SOL':i.skr+' GC')+'</button>')+
      '</div>';
    }).join('')
  ).join('');
}
function buy(id){
  const tous=articlesShop().reduce((t,r)=>t.concat(r.items),[]);
  const it=tous.find(x=>x.id===id); if(!it) return;
  if(it.unique && S.unlockedMun.includes(it.unique)) return toast('D\u00e9j\u00e0 d\u00e9bloqu\u00e9');
  if(it.sol && S.sol<it.sol) return toast('SOL insuffisant');
  if(it.skr && S.skr<it.skr) return toast('Cr\u00e9dits insuffisants');
  if(id==='vie' && (S.bonusVies||0)>=3) return toast('Maximum atteint');
  S.sol-=it.sol||0; S.skr-=it.skr||0;

  if(id==='wpn')    S.weapon++;
  if(id==='rate')   S.fireRate=+(S.fireRate*1.2).toFixed(2);
  if(id==='vie'){   S.bonusVies=(S.bonusVies||0)+1; S.maxLives++; }
  if(id==='aimant') S.aimant=true;
  if(id==='mitra')  S.charges.mitra=(S.charges.mitra||0)+2;
  if(id==='nuke')   S.charges.nuke=(S.charges.nuke||0)+1;
  if(id==='ghost')  S.charges.ghost=(S.charges.ghost||0)+1;
  if(id==='lot3'){  S.charges.mitra=(S.charges.mitra||0)+2; S.charges.nuke=(S.charges.nuke||0)+1; S.charges.ghost=(S.charges.ghost||0)+1; }
  if(it.unique)     S.unlockedMun.push(it.unique);
  if(id==='repair') S.consommables={...(S.consommables||{}), vies:2};
  if(id==='scan')   S.consommables={...(S.consommables||{}), drops:1.5};
  if(id==='boost')  S.consommables={...(S.consommables||{}), degats:1.3};

  addTx('shop:'+id); Audio2.jouerSfx('levelup'); haptique('victoire');
  toast('\u2705 '+it.name);
  save(); renderShop(); ui();
}

function renderShips(){
  const g=document.getElementById('ship-grid'); if(!g) return;
  g.innerHTML='';
  SHIPS.forEach(sh=>{
    if(sh.id===5 && !S.ghostUnlocked) return;
    const un=S.unlocked.includes(sh.id), sel=S.ship===sh.id;
    const verrou=!un && !!sh.cond;      /* se merite, ne s'achete pas */
    const d=document.createElement('div');
    d.className='glass rounded-2xl text-center '+(sel?'ring-2 ring-green-400':'')+(un?'':' opacity-50');
    d.style.padding='14px 12px';
    const action = verrou
      ? '<div class="mt-2 py-1.5 text-[9.5px]" style="color:#8b8b9e;line-height:1.4">🔒 '+sh.condTxt+'</div>'
      : !un
      ? /* Deux moyens de paiement : SOL, ou le token SKR de Solana Mobile. */
        '<div class="mt-2 flex gap-1.5">'+
          '<button onclick="unlockShip('+sh.id+',\'sol\')" class="btn flex-1 py-2 rounded-xl text-[10.5px] font-bold"'+
            (S.sol<(sh.sol||0)?' style="opacity:.5"':'')+'>'+(sh.sol||0)+' SOL</button>'+
          '<button onclick="unlockShip('+sh.id+',\'skr\')" class="glass flex-1 py-2 rounded-xl text-[10.5px] font-bold" '+
            'style="border-color:rgba(20,241,149,.5);color:#14F195'+
            ((S.soldeSkr||0)<(sh.skr||0)?';opacity:.5':'')+'">'+
            (sh.skr||0).toLocaleString()+' SKR</button>'+
        '</div>'
      : sel
        ? '<div class="mt-2 py-2 text-[11px] font-bold text-green-400">\u2713 \u00c9QUIP\u00c9</div>'
        : '<button onclick="equiperVaisseau('+sh.id+')" class="glass w-full mt-2 py-2 rounded-xl text-[11px] font-bold" style="border-color:rgba(20,241,149,.5);color:#14F195">\u00c9QUIPER</button>';
    d.innerHTML='<div style="height:58px;display:flex;align-items:center;justify-content:center">'+
        ico('ship'+sh.id, sh.emoji, 50)+'</div>'+
      '<div class="font-semibold text-[12.5px] mt-1">'+sh.name+'</div>'+
      '<div class="text-[10px] text-gray-500">d\u00e9g\u00e2ts \u00d7'+sh.bonus.toFixed(2)+'</div>'+
      action;
    g.appendChild(d);
  });
}
function equiperVaisseau(id){
  if(!S.unlocked.includes(id)) return toast('Vaisseau non d\u00e9bloqu\u00e9');
  S.ship=id; loadout.ship=id;
  Audio2.jouerSfx('button_click'); haptique('bouton');
  toast(SHIPS[id].name+' \u00e9quip\u00e9',1600);
  save(); renderShips(); ui();
}
/* Paiement d'un vaisseau en SKR : un transfert SPL vers la tresorerie,
   signe par le joueur. Retourne la signature, ou null si rien n'est parti. */
async function payerEnSKR(montant, etiquette){
  if(!S.walletReel || !S.addressComplete){ CHAINE.derniereErreur='wallet non connecte'; return null; }
  if(CHAINE.enCours){ CHAINE.derniereErreur='transaction deja en cours'; return null; }
  const w3=await chargerWeb3(); if(!w3){ CHAINE.derniereErreur='web3.js indisponible'; return null; }
  const spl=await chargerSPL(); if(!spl){ CHAINE.derniereErreur='module SPL indisponible'; return null; }
  CHAINE.enCours=true;
  try{
    const { PublicKey, Transaction, TransactionInstruction } = w3;
    const joueur  = new PublicKey(normaliserAdresse(S.addressComplete, PublicKey));
    const tresor  = new PublicKey(TRESORERIE.adresse);
    const mint    = new PublicKey(mintSKR());
    const source  = spl.getAssociatedTokenAddressSync(mint, joueur, true);
    const dest    = spl.getAssociatedTokenAddressSync(mint, tresor, true);
    const brut    = BigInt(Math.round(montant * Math.pow(10, SKR.decimales)));

    const instrs=[];
    /* Si la tresorerie n'a pas encore de compte pour ce token, on le cree :
       sans ca le transfert echoue avec un message incomprehensible. */
    let existe=null;
    try{ existe = await CHAINE.connexion.getAccountInfo(dest); }catch(e){}
    if(!existe) instrs.push(spl.createAssociatedTokenAccountInstruction(joueur, dest, tresor, mint));
    instrs.push(spl.createTransferCheckedInstruction(source, mint, dest, joueur, brut, SKR.decimales));
    /* Trace lisible de l'achat, comme pour la Seeker Task */
    instrs.push(new TransactionInstruction({
      keys:[{ pubkey:joueur, isSigner:true, isWritable:false }],
      programId:new PublicKey(CHAINE.memoProgram),
      data:(typeof Buffer!=='undefined'&&Buffer.from)
             ? Buffer.from('seeker-strike:'+etiquette,'utf8')
             : new TextEncoder().encode('seeker-strike:'+etiquette)
    }));

    const { blockhash } = await CHAINE.connexion.getLatestBlockhash();
    const tx = new Transaction({ feePayer:joueur, recentBlockhash:blockhash });
    instrs.forEach(i=>tx.add(i));
    const sig = await signerEtEnvoyer(tx);
    if(sig){
      LOG.log('[SEEKER] paiement SKR : '+sig);
      if(!S.signatures) S.signatures=[];
      S.signatures.unshift({ action:etiquette, sig, t:Date.now() });
      S.signatures=S.signatures.slice(0,20);
    }
    return sig||null;
  }catch(e){
    CHAINE.derniereErreur=(e&&(e.message||e.toString()))||'erreur inconnue';
    LOG.warn('[SEEKER] paiement SKR refuse : '+CHAINE.derniereErreur);
    return null;
  }finally{ CHAINE.enCours=false; }
}

/* Don en SOL : un simple transfert natif, signe par le joueur. */
async function donnerSOL(montant){
  if(!S.connected) return toast('Connecte ton wallet d\'abord', 2400);
  if(!S.walletReel) return toast('Le don demande un vrai wallet', 2600);
  if(CHAINE.enCours) return toast('Transaction en cours…');
  const w3=await chargerWeb3();
  if(!w3) return toast('❌ web3.js indisponible', 3000);
  CHAINE.enCours=true;
  try{
    const { PublicKey, Transaction, TransactionInstruction, SystemProgram } = w3;
    const joueur = new PublicKey(normaliserAdresse(S.addressComplete, PublicKey));
    const tx = new Transaction({ feePayer:joueur,
      recentBlockhash:(await CHAINE.connexion.getLatestBlockhash()).blockhash });
    tx.add(SystemProgram.transfer({ fromPubkey:joueur,
      toPubkey:new PublicKey(DONS.adresse), lamports:Math.round(montant*1e9) }));
    tx.add(new TransactionInstruction({
      keys:[{ pubkey:joueur, isSigner:true, isWritable:false }],
      programId:new PublicKey(CHAINE.memoProgram),
      data:(typeof Buffer!=='undefined'&&Buffer.from)
             ? Buffer.from('seeker-strike:don:sol','utf8')
             : new TextEncoder().encode('seeker-strike:don:sol')
    }));
    toast('✍️ Signe le don de '+montant+' SOL…', 3000);
    const sig=await signerEtEnvoyer(tx);
    if(!sig){
      const c=CHAINE.derniereErreur?' • '+String(CHAINE.derniereErreur).slice(0,60):'';
      CHAINE.derniereErreur=null;
      return toast('❌ Don annulé'+c, 4000);
    }
    if(!S.signatures) S.signatures=[];
    S.signatures.unshift({ action:'don:sol', sig, t:Date.now() });
    S.signatures=S.signatures.slice(0,20);
    S.donsSol=+((S.donsSol||0)+montant).toFixed(4);
    S.sol=Math.max(0, +(S.sol-montant).toFixed(4));
    creditTX(1);
    Audio2.jouerSfx('levelup'); haptique('victoire');
    toast('💜 Merci • '+montant+' SOL reçus', 3400);
    save(); ui(); renderSettings();
  }catch(e){
    LOG.warn('[SEEKER] don SOL refuse : '+(e&&e.message));
    toast('❌ Don annulé • '+String(e&&e.message).slice(0,50), 4000);
  }finally{ CHAINE.enCours=false; }
}

/* Don en SKR : un transfert SPL, meme mecanique que l'achat d'un vaisseau. */
async function donnerSKR(montant){
  if(!S.connected) return toast('Connecte ton wallet d\'abord', 2400);
  if(!S.walletReel) return toast('Le don demande un vrai wallet', 2600);
  const solde=await lireSoldeSKR();
  if(solde<montant) return toast('Il te manque '+(montant-solde).toLocaleString()+' SKR', 3000);
  toast('✍️ Signe le don de '+montant.toLocaleString()+' SKR…', 3000);
  const sig=await payerEnSKR(montant, 'don:skr');
  if(!sig){
    const c=CHAINE.derniereErreur?' • '+String(CHAINE.derniereErreur).slice(0,60):'';
    CHAINE.derniereErreur=null;
    return toast('❌ Don annulé'+c, 4000);
  }
  S.donsSkr=(S.donsSkr||0)+montant;
  S.soldeSkr=Math.max(0,(S.soldeSkr||0)-montant);
  creditTX(1);
  Audio2.jouerSfx('levelup'); haptique('victoire');
  toast('💜 Merci • '+montant.toLocaleString()+' SKR reçus', 3400);
  save(); ui(); renderSettings();
}

/* Copie l'adresse de dons : on peut aussi donner sans passer par le jeu. */
function copierAdresseDon(){
  const t=DONS.adresse;
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(()=>toast('Adresse copiée', 2000))
                                      .catch(()=>toast(t, 6000));
      return;
    }
  }catch(e){}
  toast(t, 6000);   /* repli : on affiche l'adresse assez longtemps pour la noter */
}

function renderPanneauDons(){
  const box=document.getElementById('panneau-dons'); if(!box) return;
  if(!DONS.actif){ box.innerHTML=''; return; }
  const a=DONS.adresse;
  const court=a.slice(0,6)+'…'+a.slice(-6);
  box.innerHTML='<div class="sect"><span>💜 '+T('SOUTENIR LE JEU')+'</span><i class="lig"></i></div>'+
    '<div style="border-radius:16px;border:1px solid rgba(153,69,255,.32);padding:14px;'+
      'background:linear-gradient(180deg,rgba(30,16,56,.45),rgba(12,9,24,.3))">'+
    '<div class="text-[10.5px] mb-3" style="color:#a9a3bd;line-height:1.6">'+
      T('Entièrement facultatif. Aucun don ne débloque quoi que ce soit en jeu — ni vaisseau, ni bonus, ni avantage. Le jeu reste identique si tu ne donnes jamais.')+'</div>'+
    '<div class="glass" style="border-radius:12px;padding:9px 11px;margin-bottom:11px;'+
      'display:flex;align-items:center;justify-content:space-between;gap:8px">'+
      '<span style="font-family:monospace;font-size:10px;color:#9ca3af">'+court+'</span>'+
      '<button onclick="copierAdresseDon()" style="flex:none;padding:5px 10px;border-radius:8px;'+
        'font-size:9.5px;font-weight:700;color:#14F195;background:rgba(20,241,149,.12);'+
        'border:1px solid rgba(20,241,149,.35)">'+T('COPIER')+'</button>'+
    '</div>'+
    '<div class="text-[9.5px] mb-1.5" style="color:#7c7a8c">'+T('Don en SOL')+'</div>'+
    '<div style="display:flex;gap:6px;margin-bottom:10px">'+
      DONS.sol.map(v=>'<button onclick="donnerSOL('+v+')" class="btn flex-1 py-2 rounded-xl '+
        'text-[10.5px] font-bold">'+v+' SOL</button>').join('')+
    '</div>'+
    '<div class="text-[9.5px] mb-1.5" style="color:#7c7a8c">'+T('Don en SKR')+'</div>'+
    '<div style="display:flex;gap:6px">'+
      DONS.skr.map(v=>'<button onclick="donnerSKR('+v+')" class="glass flex-1 py-2 rounded-xl '+
        'text-[10.5px] font-bold" style="border-color:rgba(20,241,149,.45);color:#14F195">'+
        v.toLocaleString()+'</button>').join('')+
    '</div>'+
    (((S.donsSol||0)>0 || (S.donsSkr||0)>0)
      ? '<div class="text-[10px] mt-3" style="color:#14F195">'+
        T('Merci • tu as donné {0}',
          ((S.donsSol||0)>0?(S.donsSol+' SOL'):'')+
          (((S.donsSol||0)>0&&(S.donsSkr||0)>0)?T(' et '):'')+
          ((S.donsSkr||0)>0?((S.donsSkr).toLocaleString()+' SKR'):''))+'</div>'
      : '')+
    '</div>';
}

/* Achat d'un vaisseau. Deux monnaies, un seul resultat :
   - SOL : preleve sur le wallet du joueur, c'est le raccourci payant ;
   - GC  : gagne en jouant, c'est la voie longue. 1 SOL vaut 30 000 GC.
   Les vaisseaux a condition ne s'achetent ni en SOL ni en GC : ils se meritent. */
async function unlockShip(id, monnaie){
  const sh=SHIPS[id]; if(!sh) return;
  if(S.unlocked.includes(id)) return toast('Vaisseau d\u00e9j\u00e0 d\u00e9bloqu\u00e9', 1800);
  if(sh.cond) return toast('Ce vaisseau se m\u00e9rite : '+sh.condTxt, 2800);
  monnaie = (monnaie==='skr') ? 'skr' : 'sol';

  if(monnaie==='skr'){
    /* Paiement en token SKR : un vrai transfert SPL vers la tresorerie. */
    const prix=sh.skr||0;
    if(!prix) return toast('Ce vaisseau ne s\u2019ach\u00e8te pas en SKR', 2400);
    if(!S.connected) return toast('Connecte ton wallet pour payer en SKR', 2600);
    if(!S.walletReel) return toast('Le paiement SKR demande un vrai wallet', 2800);
    const solde = await lireSoldeSKR();
    if(solde < prix) return toast('Il te manque '+(prix-solde).toLocaleString()+' SKR', 3000);
    toast('\u270d\ufe0f Signe le transfert de '+prix.toLocaleString()+' SKR\u2026', 3000);
    const sig = await payerEnSKR(prix, 'ship:'+id);
    if(!sig){
      const cause = CHAINE.derniereErreur ? ' \u2022 '+String(CHAINE.derniereErreur).slice(0,70) : '';
      CHAINE.derniereErreur=null;
      return toast('\u274c Paiement echoue'+cause, 5000);
    }
    S.unlocked.push(id);
    S.soldeSkr=Math.max(0,(S.soldeSkr||0)-prix);
    creditTX(1);
    Audio2.jouerSfx('levelup'); haptique('victoire');
    toast('\ud83d\udee0\ufe0f '+sh.name+' d\u00e9bloqu\u00e9 \u2022 -'+prix.toLocaleString()+' SKR', 2800);
  } else {
    const prix=sh.sol||0;
    if(!S.connected) return toast('Connecte ton wallet pour payer en SOL', 2600);
    if(S.sol<prix) return toast('Solde insuffisant : il te faut '+prix+' SOL', 2800);
    S.sol=+(S.sol-prix).toFixed(4);
    S.unlocked.push(id); addTx('ship:'+id); creditTX(1);
    Audio2.jouerSfx('levelup'); haptique('victoire');
    toast('\ud83d\udee0\ufe0f '+sh.name+' d\u00e9bloqu\u00e9 \u2022 -'+prix+' SOL', 2800);
  }
  save(); renderShips(); ui();
}

/* ============================================================
   ORIENTATION ET REDIMENSIONNEMENT
   Deux problemes distincts :
   1. le canvas figeait ses dimensions au lancement de la partie et
      ne les recalculait jamais -> apres une rotation, ou quand la barre
      d'URL apparait, la zone de jeu ne correspondait plus a l'ecran ;
   2. un shoot'em up vertical n'a pas de sens en paysage : le terrain
      devient trop court. Les menus, eux, restent utilisables.
   ============================================================ */
function estPaysage(){
  return (window.innerWidth||0) > (window.innerHeight||0) * 1.15;
}

/* Reajuste la surface de jeu sans perdre la partie en cours */
function redimensionnerCanvas(){
  if(!G) return;
  const canvas=document.getElementById('gc'); if(!canvas) return;
  const dpr=Math.min(devicePixelRatio||1,3);
  const w=window.innerWidth, h=window.innerHeight;
  if(!w||!h||(w===G.w && h===G.h)) return;
  const ratioX=w/G.w, ratioY=h/G.h;
  canvas.width=w*dpr; canvas.height=h*dpr;
  canvas.style.width=w+'px'; canvas.style.height=h+'px';
  G.ctx.setTransform(dpr,0,0,dpr,0,0);
  /* On transpose ce qui vit a l'ecran pour ne rien perdre de vue */
  const bouge=(o)=>{ if(o){ o.x*=ratioX; o.y*=ratioY; } };
  bouge(G.player);
  [G.enemies,G.eBullets,G.bullets,G.orbs,G.particles,G.explosions].forEach(l=>(l||[]).forEach(bouge));
  bouge(G.boss); bouge(G.wing);
  G.w=w; G.h=h;
  G.player.x=Math.max(24,Math.min(w-24,G.player.x));
  G.player.y=Math.max(60,Math.min(h-PLANCHER_VOL,G.player.y));   /* meme plancher apres rotation */
}

let _pausePaysage=false;
/* Verrouillage logiciel : on demande au systeme de rester en portrait.
   Tous les appareils ne l'acceptent pas, le voile reste donc le filet. */
let _portraitVerrouille=false;
function verrouillerPortrait(){
  try{
    const o = (typeof screen!=='undefined') && (screen.orientation || screen.msOrientation);
    if(!o || !o.lock) return;
    o.lock('portrait-primary')
      .then(()=>{ _portraitVerrouille=true; })
      .catch(()=>{ o.lock('portrait').then(()=>{ _portraitVerrouille=true; }).catch(()=>{}); });
  }catch(e){}
}
/* Android n'accorde le verrouillage d'orientation qu'en plein ecran, et
   seulement a la suite d'un geste de l'utilisateur. On tente donc a chaque
   premier appui tant que le verrou n'est pas obtenu. */
function tenterVerrouillageComplet(){
  if(_portraitVerrouille) return;
  verrouillerPortrait();
  try{
    const d=document.documentElement;
    if(!document.fullscreenElement && d.requestFullscreen){
      d.requestFullscreen({navigationUI:'hide'}).then(verrouillerPortrait).catch(()=>{});
    }
  }catch(e){}
}
/* Le voile ne doit pas se declencher sur un ecran d'ordinateur, toujours large. */
function appareilTactile(){
  return ('ontouchstart' in window) || (navigator.maxTouchPoints||0) > 0;
}

function majOrientation(){
  const voile=document.getElementById('voile-rotation'); if(!voile) return;
  const enJeu = !!(G && (G.running || _enPause)) && !(G && G.demo);
  /* Portrait impose partout : menus, boutique, carte et parties. Un ecran
     d'ordinateur, lui, reste libre (il est large par nature). */
  const gene  = estPaysage() && appareilTactile();
  if(gene) verrouillerPortrait();
  voile.classList.toggle('on', gene);
  if(gene && enJeu && G && G.running && !_enPause){
    _pausePaysage=true; mettreEnPause();          /* on ne laisse pas mourir le joueur */
  } else if(!gene && _pausePaysage){
    _pausePaysage=false;
    if(_enPause) reprendrePartie();
  }
}

window.addEventListener('resize', ()=>{ redimensionnerCanvas(); majOrientation(); });
/* Premier contact : c'est le seul moment ou Android accepte le verrouillage. */
['pointerdown','touchstart','click'].forEach(ev=>{
  window.addEventListener(ev, tenterVerrouillageComplet, {passive:true});
});
verrouillerPortrait();
setTimeout(majOrientation, 80);
window.addEventListener('orientationchange', ()=>{
  setTimeout(()=>{ redimensionnerCanvas(); majOrientation(); }, 220);   /* le temps que l'ecran se stabilise */
});

/* ============================================================
   BAS DE PAGE — la barre d'onglets flotte au-dessus du contenu.
   Un ::after CSS ne suffit pas : env(safe-area-inset-bottom) vaut 0
   dans la WebView du Seeker et le padding d'un conteneur scrollable
   y est ignore. On injecte donc un vrai element de fin dans chaque
   ecran, une seule fois au demarrage.
   ============================================================ */
function poserFinsDePage(){
  document.querySelectorAll('.screen').forEach(ec=>{
    if(ec.classList.contains('game')) return;              /* l'ecran de jeu n'a pas d'onglets */
    if(ec.querySelector(':scope > .fin-page')) return;      /* deja pose */
    const sp=document.createElement('div');
    sp.className='fin-page';
    sp.setAttribute('aria-hidden','true');
    ec.appendChild(sp);
  });
}

/* ============================================================
   FRAGMENTS DE CLÉ
   Certains secteurs ne s'ouvrent plus par simple progression : il faut
   une cle, et une cle se compose de trois fragments laches par des boss
   precis. Le drop est volontairement rare, ce qui donne une raison de
   refaire un boss deja battu.
   ============================================================ */
const CLES = {
  genesis: {nom:'CLÉ GENESIS', couleur:'#14F195', boss:[4,6,7],    ouvre:9, slot:'cleGenesis',
            desc:'Ouvre le secteur secret DÉBRIS OUBLIÉS'},
  chaos:   {nom:'CLÉ DU CHAOS', couleur:'#e879f9', boss:[16,20,12], ouvre:19, slot:'cleChaos',
            desc:'Ouvre le COFFRE GENESIS, verrouillé depuis la chute du Nexus'}
};
const CHANCE_FRAGMENT = 0.34;      /* par boss terrasse */

function fragments(id){ return (S.cles && S.cles[id]) || 0; }
function cleComplete(id){ return fragments(id) >= 3; }

/* Appele quand un boss tombe : peut laisser un fragment */
function tenterFragment(nodeId){
  for(const [id,c] of Object.entries(CLES)){
    if(!c.boss.includes(nodeId)) continue;
    if(cleComplete(id)) continue;
    if(Math.random() > CHANCE_FRAGMENT) {
      setTimeout(()=>toast('Aucun fragment cette fois • '+c.nom+' '+fragments(id)+'/3',2600),1400);
      return;
    }
    if(!S.cles) S.cles={};
    S.cles[id]=fragments(id)+1;
    save();
    const n=fragments(id);
    setTimeout(()=>{
      if(n>=3){
        toast('🔑 '+c.nom+' RECONSTITUÉE • '+c.desc,4600);
        Audio2.jouerSfx('levelup'); haptique('victoire');
      } else {
        toast('🔩 Fragment de '+c.nom+' • '+n+'/3',3400);
        Audio2.jouerSfx('pickup');
      }
    },1400);
    return;
  }
}

/* Les secteurs sous cle ne s'ouvrent qu'une fois la cle reconstituee */
function noeudVerrouille(id){
  for(const [cid,c] of Object.entries(CLES)){
    if(c.ouvre===id && !cleComplete(cid)) return c;
  }
  return null;
}

/* ============================================================
   PALIERS DE SCORE
   Le score ne servait qu'a la fin. Il debloque maintenant des
   avantages en direct, ce qui donne une raison de jouer offensif.
   ============================================================ */
const PALIERS = [
  {pts:2500,  nom:'+1 VIE',            effet:g=>{ g.lives++; }},
  {pts:6000,  nom:'BOMBE OFFERTE',     effet:g=>{ S.charges.nuke=(S.charges.nuke||0)+1; majBarreBonus(); }},
  {pts:11000, nom:'SCORE ×1.5',        effet:g=>{ g.mode.reward*=1.5; }},
  {pts:18000, nom:'MITRAILLEUSE',      effet:g=>{ S.charges.mitra=(S.charges.mitra||0)+1; majBarreBonus(); }},
  {pts:28000, nom:'ESCORTE FANTÔME',   effet:g=>{ S.charges.ghost=(S.charges.ghost||0)+1; majBarreBonus(); }}
];
function verifierPaliers(g){
  if(!g || g.arena) return;
  const atteint=g.paliersAtteints||0;
  if(atteint>=PALIERS.length) return;
  const p=PALIERS[atteint];
  if((g.score||0) >= p.pts){
    g.paliersAtteints=atteint+1;
    try{ p.effet(g); }catch(e){}
    toast('⚡ PALIER '+p.pts.toLocaleString()+' • '+p.nom, 2600);
    Audio2.jouerSfx('levelup'); haptique('bouton');
    g.shake=Math.max(g.shake,10);
  }
}

/* ============================================================
   LANGUES — français par défaut, anglais disponible
   Le jeu a été écrit en français. Plutôt que de tout réécrire avec des
   clés abstraites, la table associe le texte français exact à sa version
   anglaise : T('Boutique') renvoie 'Store' si la langue est l'anglais,
   et le texte d'origine sinon. Les écrans statiques sont parcourus une
   fois à la bascule, les textes générés passent par T().
   ============================================================ */
let LANGUE = 'fr';
/* Table français -> anglais. Clé = le texte français exact du jeu. */

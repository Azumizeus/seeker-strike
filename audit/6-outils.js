/* ============================================================
   SEEKER STRIKE v4.4 - 6-outils.js
   Traduction, ecrans, reglages, easter eggs
   Lignes 6369 a 7418 du script (game/index_v37.html)
   Genere par game/build_audit.py — NE PAS EDITER A LA MAIN.
   La source de verite est game/index_v37.html.
   ============================================================ */
function T(fr, ...args){
  let t = (LANGUE==='en' && EN[fr]) ? EN[fr] : fr;
  args.forEach((v,i)=>{ t = t.split('{'+i+'}').join(v); });
  return t;
}

/* Détection au premier lancement, puis choix du joueur */
function langueInitiale(){
  if(S.prefs && S.prefs.langue) return S.prefs.langue;
  const l=(navigator.language||navigator.userLanguage||'fr').toLowerCase();
  return l.startsWith('fr') ? 'fr' : 'en';
}

/* Parcourt les textes statiques de la page et applique la table */
function traduirePage(){
  /* Parcours defensif : un contexte sans TreeWalker ne doit pas empecher
     le jeu de demarrer, il restera simplement en francais. */
  const aTraiter=[];
  try{
    if(typeof NodeFilter==='undefined' || !document.createTreeWalker) return;
    const marcheur=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let noeud;
    while((noeud=marcheur.nextNode())){
      const p=noeud.parentNode;
      if(!p || p.nodeName==='SCRIPT' || p.nodeName==='STYLE') continue;
      const brut=noeud.nodeValue;
      if(!brut || !brut.trim()) continue;
      aTraiter.push(noeud);
    }
  }catch(e){ LOG.warn('[SEEKER] traduction de la page impossible : '+(e&&e.message)); return; }
  aTraiter.forEach(nd=>{
    /* On garde le texte français d'origine sur le noeud pour pouvoir revenir */
    if(nd._fr===undefined) nd._fr=nd.nodeValue;
    const cle=nd._fr.trim();
    if(LANGUE==='en' && EN[cle]) nd.nodeValue=nd._fr.replace(cle, EN[cle]);
    else nd.nodeValue=nd._fr;
  });
  /* attributs visibles */
  try{
  document.querySelectorAll('[aria-label],[placeholder]').forEach(el=>{
    ['aria-label','placeholder'].forEach(a=>{
      const v=el.getAttribute(a); if(!v) return;
      if(!el.dataset['fr'+a]) el.dataset['fr'+a]=v;
      const o=el.dataset['fr'+a];
      el.setAttribute(a, (LANGUE==='en' && EN[o]) ? EN[o] : o);
    });
  });
  }catch(e){}
}

function changerLangue(l){
  LANGUE = (l==='en') ? 'en' : 'fr';
  if(!S.prefs) S.prefs={};
  S.prefs.langue=LANGUE; save();
  traduirePage();
  majBoutonsLangue();
  /* les écrans générés se redessinent avec la nouvelle langue */
  try{ renderSettings(); }catch(e){}
  try{ renderBestiaire(); }catch(e){}
  try{ renderQuests(); }catch(e){}
  try{ renderShop(); }catch(e){}
  try{ renderShips(); }catch(e){}
  try{ renderMap(); majBoutonCampagne(); }catch(e){}
  try{ poserIcones(); ui(); }catch(e){}
  toast(LANGUE==='en' ? 'Language: English' : 'Langue : Français', 1800);
}

/* ============================================================
   DUREE D'UN SECTEUR
   Un secteur de combat se termine apres un nombre de vagues donne ;
   un secteur a boss se termine quand le boss tombe. Sans cela la
   mission ne pouvait se conclure que par la mort du joueur.
   Une vague dure environ 15 s : 8 vagues = 2 min, 14 vagues = 3 min 30.
   ============================================================ */
const VAGUES_SECTEUR = {
  1:6, 2:7, 3:8,            /* decouverte : on apprend */
  5:9, 8:6,                 /* nebuleuse, hub */
  9:10, 10:11, 11:13,       /* transcendance : ca s'allonge */
  13:9, 14:6, 15:11,        /* chaos */
  17:6, 18:12, 19:8
};
function vaguesRequises(id){
  if(BOSS_DEFS[id]) return null;              /* c'est le boss qui conclut */
  return VAGUES_SECTEUR[id] || 9;
}

/* Fin de mission reussie : on laisse respirer avant l'ecran de resultat */
function conclureSecteur(g, raison){
  if(g.termine) return;
  g.termine=true;
  g.raisonFin=raison;
  const msg = raison==='boss' ? '☠️ SECTEUR NEUTRALISÉ' : '✅ SECTEUR SÉCURISÉ';
  toast(msg, 3000);
  Audio2.jouerSfx('levelup'); haptique('victoire');
  g.shake=Math.max(g.shake,16);
  /* on stoppe l'arrivee d'ennemis, le joueur savoure sa fin de mission */
  g.plusDeSpawn=true;
  setTimeout(()=>{ if(G===g && g.running) endGame(); }, 2400);
}

/* ============================================================
   CONTRATS DE SECTEUR
   Jusqu'ici une mission consistait a survivre a des vagues sans autre
   but que d'arriver au bout : aucun objectif lisible, aucun palier.
   Chaque noeud recoit desormais un contrat, affiche avant, suivi
   pendant, recompense apres. Le rater ne bloque pas la progression.
   ============================================================ */
const CONTRATS = {
  kills:   {nom:'PURGE',      texte:n=>T('Détruire ')+n+T(' unités'),        suivi:(g,n)=>Math.min(g.kills||0,n)+'/'+n,
            fait:(g,n)=>(g.kills||0)>=n},
  survie:  {nom:'TENIR',      texte:n=>T('Survivre ')+n+T(' secondes'),       suivi:(g,n)=>Math.min(Math.floor((g.frame||0)/60),n)+'/'+n+'s',
            fait:(g,n)=>Math.floor((g.frame||0)/60)>=n},
  score:   {nom:'RENDEMENT',  texte:n=>T('Atteindre ')+n.toLocaleString()+T(' points'), suivi:(g,n)=>Math.round((g.score||0)/n*100)+'%',
            fait:(g,n)=>(g.score||0)>=n},
  intact:  {nom:'SANS FAUTE', texte:()=>T('Terminer sans perdre de vie'),  suivi:(g)=>g.viePerdue?T('échoué'):T('intact'),
            fait:(g)=>!g.viePerdue},
  sobre:   {nom:'SOBRIÉTÉ',  texte:()=>T('Terminer sans utiliser de bonus'), suivi:(g)=>g.bonusUtilise?T('échoué'):T('aucun'),
            fait:(g)=>!g.bonusUtilise},
  combo:   {nom:'ENCHAÎNEMENT',texte:n=>T('Atteindre le combo ×')+n,       suivi:(g,n)=>'×'+(g.comboMax||1).toFixed(1),
            fait:(g,n)=>(g.comboMax||0)>=n}
};

/* Un contrat par noeud, choisi pour coller a ce que le secteur raconte.
   [type, valeur, recompense en GC] */
/* Un contrat par secteur jouable. Les valeurs sont celles de la
   difficulte Normal : elles sont recalculees plus bas selon le cran choisi. */
const CONTRAT_NOEUD = {
  1:['kills',45,150],    2:['survie',95,190],   3:['intact',0,260],    4:['kills',70,340],
  5:['survie',130,300],  6:['sobre',0,470],     7:['intact',0,540],    8:['score',9000,280],
  9:['combo',5,400],     10:['score',26000,440],11:['survie',185,520], 12:['kills',110,780],
  13:['kills',85,480],   14:['score',12000,360],15:['combo',6,580],    16:['intact',0,840],
  17:['survie',85,400],  18:['survie',170,620], 19:['kills',60,640],   20:['sobre',0,980],
  21:['kills',150,1500]
};

/* La difficulte change le rythme : l'objectif doit suivre, la recompense aussi. */
const ECHELLE_CONTRAT = {
  normal:    {cible:1.00, gain:1.0},
  difficile: {cible:1.35, gain:1.8},
  extreme:   {cible:1.75, gain:3.0}
};

/* Accesseurs traduits pour les donnees ecrites en francais */
function titreNoeud(nd){ return nd ? T(nd.title) : ''; }
function briefNoeud(nd){ return nd ? T(nd.brief) : ''; }

function contratDuNoeud(id){
  const c=CONTRAT_NOEUD[id]; if(!c) return null;
  const def=CONTRATS[c[0]]; if(!def) return null;
  const e=ECHELLE_CONTRAT[loadout.difficulte] || ECHELLE_CONTRAT.normal;
  /* les objectifs binaires (sans faute, sobriete) n'ont pas de palier a
     recalculer : seule leur recompense suit la difficulte */
  const chiffre = c[1]>0;
  let valeur = chiffre ? Math.round(c[1]*e.cible) : c[1];
  if(c[0]==='combo') valeur = Math.min(6, Math.round(c[1]*(1+(e.cible-1)*0.35)));  /* le combo plafonne a 6,5 */
  return {type:c[0], valeur, gc:Math.round(c[2]*e.gain), def, difficulte:loadout.difficulte};
}
function contratRempli(g){
  const c=g && g.contrat; if(!c) return false;
  return !!c.def.fait(g, c.valeur);
}
/* Ligne de suivi dans le HUD, rafraichie a chaque frame */
function majContratHud(){
  const el=document.getElementById('hud-contrat'); if(!el) return;
  const g=G;
  if(!g || !g.contrat){ el.style.display='none'; return; }
  el.style.display='block';
  const c=g.contrat, ok=contratRempli(g);
  el.innerHTML='<span style="color:'+(ok?'#14F195':'#9ca3af')+'">'+(ok?'✓ ':'')+
    c.def.nom+'</span> <b style="color:'+(ok?'#14F195':'#c4b5fd')+'">'+c.def.suivi(g,c.valeur)+'</b>';
}

/* ============================================================
   SECRETS — quatre easter eggs, invisibles tant qu'ils ne sont
   pas trouves. Ils n'apparaissent en clair qu'une fois debloques.
   ============================================================ */
const SECRETS=[
  {id:'silence', nom:'SILENCE RADIO',    gc:300, indice:"Il paraît que certains pilotes coupent tout.",
   d:"Secteur terminé avec le son ET la musique coupés."},
  {id:'arcade',  nom:'VÉTÉRAN D’ARCADE', gc:250, indice:"Parfois, il suffit de regarder.",
   d:"Laissé la démo tourner sur ses quatre mondes sans y toucher."},
  {id:'zerog',   nom:'DÉRIVE ZÉRO-G',    gc:400, indice:"Un secteur n’apparaît sur aucune carte officielle.",
   d:"Débris Oubliés sécurisé — le nœud secret de Genesis."},
  {id:'orbital', nom:'CODE ORBITAL',     gc:500, indice:"Quatre coins. Sens horaire. Depuis le haut-gauche.",
   d:"Séquence des quatre coins saisie sur l’accueil."},
  {id:'sidev',   nom:'SI J’ÉTAIS DEV',   gc:750, indice:"Le réseau sur lequel tu joues est écrit quelque part. Insiste.",
   d:"Mot DEVNET tapé 5 fois dans les réglages."}
];
function secretTrouve(id){ return (S.secrets||[]).includes(id); }

/* ---- Easter egg DEVNET : « SI J'ÉTAIS DEV » ----
   Cinq appuis sur le mot DEVNET des reglages. Ce qu'on donne : un terminal
   de bord en lecture seule, une livree blueprint et un indicatif ironique.
   Ce qu'on NE donne PAS : le vrai mode developpeur. Aucun avantage de jeu. */
let _devnetTaps=0, _devnetT=0;
function tapDevnet(ev){
  try{ if(ev && ev.stopPropagation) ev.stopPropagation(); }catch(e){}
  const now=Date.now();
  if(now-_devnetT>1600) _devnetTaps=0;
  _devnetT=now; _devnetTaps++;
  if(secretTrouve('sidev')){
    toast('Tu as déjà le badge. Le vrai accès, toujours pas.', 2600); return;
  }
  if(_devnetTaps>=5){
    _devnetTaps=0;
    S.terminal=true;                 /* telemetrie en lecture seule */
    S.blueprint=true;                /* livree filaire */
    debloquerSecret('sidev');
    setTimeout(()=>toast('🔒 Accès développeur refusé. Mais on t’a fait un badge.', 4200), 900);
    setTimeout(()=>toast('🖥️ Terminal de bord + livrée Blueprint + indicatif STAGIAIRE', 4600), 2400);
    try{ renderSettings(); }catch(e){}
  } else if(_devnetTaps>=3){
    toast('encore '+(5-_devnetTaps)+'…', 900);
  }
}
/* Le terminal n'affiche que de la technique : image par seconde, charge,
   nombre d'objets. Rien sur les ennemis, donc aucun avantage tactique. */
function dessinerTerminal(g){
  if(!S.terminal || !(S.prefs&&S.prefs.terminal!==false)) return;
  const ctx=g.ctx;
  const maintenant=performance.now();
  g._tImg=g._tImg||[]; g._tImg.push(maintenant);
  while(g._tImg.length && g._tImg[0]<maintenant-1000) g._tImg.shift();
  const ips=g._tImg.length;
  const lignes=[
    'ips '+String(ips).padStart(3),
    'obj '+String((g.enemies||[]).length+(g.eBullets||[]).length+(g.bullets||[]).length).padStart(3),
    'vag '+String(g.wave||0).padStart(3),
    'nd  '+String(S.currentNode).padStart(3)
  ];
  /* Place a gauche, sous le bandeau de mission : en bas il passait derriere
     les boutons de boost et restait invisible. */
  const X=8, Y=Math.round(g.h*0.22), L=86, H=66;
  ctx.save();
  ctx.font='10px ui-monospace, monospace'; ctx.textAlign='left';
  ctx.fillStyle='rgba(4,10,8,.72)';
  ctx.fillRect(X, Y, L, H);
  ctx.strokeStyle='rgba(20,241,149,.35)'; ctx.lineWidth=1;
  ctx.strokeRect(X+0.5, Y+0.5, L-1, H-1);
  ctx.fillStyle='rgba(20,241,149,.55)';
  ctx.fillText('TERMINAL', X+6, Y+13);
  ctx.fillStyle='#14F195';
  lignes.forEach((t,i)=>ctx.fillText(t, X+6, Y+27+i*13));
  ctx.restore();
}
function debloquerSecret(id){
  if(secretTrouve(id)) return;
  const sc=SECRETS.find(s=>s.id===id); if(!sc) return;
  S.secrets=(S.secrets||[]).concat(id);
  S.skr+=sc.gc;
  verifierVaisseaux();
  toast('✨ SECRET • '+sc.nom+' • +'+sc.gc+' GC', 4200);
  Audio2.jouerSfx('levelup'); haptique('victoire');
  save(); ui();
}
/* Vignettes de l'ecran quetes : masquees tant que non trouvees */
function renderCles(){
  const box=document.getElementById('cles-liste'); if(!box) return;
  box.innerHTML=Object.entries(CLES).map(([id,c])=>{
    const f=fragments(id), fini=f>=3;
    const noms=c.boss.map(b=>T((BOSS_DEFS[b]||{}).nom||('N'+b))).join(', ');
    return '<div style="padding:13px 15px;border-radius:16px;border:1px solid '+
      (fini?c.couleur+'66':'rgba(255,255,255,.08)')+';background:'+
      (fini?c.couleur+'12':'rgba(255,255,255,.025)')+'">'+
      '<div class="flex items-center gap-2">'+
        (ASSETS[c.slot]
          ? '<img src="'+ASSETS[c.slot].src+'" style="width:26px;height:26px;object-fit:contain;'+
            'filter:drop-shadow(0 0 5px '+c.couleur+')'+(fini?'':';opacity:.4;filter:grayscale(1)')+'"/>'
          : '<span style="font-size:15px">'+(fini?'🔑':'🔩')+'</span>')+
        '<span class="font-semibold text-[12.5px]" style="color:'+(fini?c.couleur:'#9ca3af')+'">'+T(c.nom)+'</span>'+
        '<span class="text-[11px] ml-auto font-bold" style="color:'+(fini?c.couleur:'#6b7280')+'">'+
          Math.min(f,3)+'/3</span>'+
      '</div>'+
      '<div class="bar mt-2 mb-2"><div style="width:'+Math.min(100,f/3*100)+'%"></div></div>'+
      '<div class="text-[10.5px]" style="color:#8b8b9e;line-height:1.55">'+c.desc+'</div>'+
      '<div class="text-[9.5px] mt-1" style="color:#6b7280">'+T('Fragments lâchés par')+' : '+noms+'</div>'+
      '</div>';
  }).join('');
}
function renderSecrets(){
  renderCles();
  const box=document.getElementById('secrets-liste'); if(!box) return;
  const nb=(S.secrets||[]).length;
  const t=document.getElementById('secrets-compteur');
  if(t) t.textContent=nb+'/'+SECRETS.length;
  box.innerHTML=SECRETS.map(sc=>{
    const ok=secretTrouve(sc.id);
    return '<div style="padding:13px 15px;border-radius:16px;border:1px solid '+
      (ok?'rgba(251,191,36,.4)':'rgba(255,255,255,.07)')+';background:'+
      (ok?'rgba(251,191,36,.07)':'rgba(255,255,255,.025)')+'">'+
      '<div class="flex items-center gap-2">'+
      '<span style="font-size:15px">'+(ok?'✨':'🔒')+'</span>'+
      '<span class="font-semibold text-[12.5px]" style="color:'+(ok?'#fcd34d':'#6b7280')+'">'+
        (ok?T(sc.nom):'? ? ?')+'</span>'+
      (ok?'<span class="text-[9px] ml-auto" style="color:#fbbf24">+'+sc.gc+' GC</span>':'')+
      '</div>'+
      '<div class="text-[10.5px] mt-1.5" style="color:'+(ok?'#9ca3af':'#5b6472')+';line-height:1.55;font-style:'+
        (ok?'normal':'italic')+'">'+(ok?T(sc.d):T(sc.indice))+'</div>'+
      '</div>';
  }).join('');
}

/* ============================================================
   MODE DEVELOPPEUR
   Cinq appuis sur le numero de version dans les Reglages.
   Sert aux demos : ouvrir tout le contenu sans refaire la campagne.
   ============================================================ */
let _devTaps=0, _devT=0;
function tapVersion(){
  const now=Date.now();
  if(now-_devT>1600) _devTaps=0;
  _devT=now; _devTaps++;
  if(_devTaps>=5 && !S.dev){
    S.dev=true; save(); renderSettings();
    toast('🛠️ MODE DÉVELOPPEUR ACTIVÉ', 3000);
    Audio2.jouerSfx('levelup');
  } else if(_devTaps>=3 && !S.dev){
    toast('encore '+(5-_devTaps)+'…', 900);
  }
}
function devToutDebloquer(){
  S.unlocked=SHIPS.map(s=>s.id);
  S.ghostUnlocked=true;
  S.completedNodes=NODES.map(x=>x.id);
  S.secrets=SECRETS.map(x=>x.id);
  S.cles={}; Object.keys(CLES).forEach(k=>{ S.cles[k]=3; });
  NODES.forEach(x=>{ S.nodeStars[x.id]=3; });
  S.skr+=50000;
  save(); ui(); renderSettings();
  toast('Tout ouvert • 12 vaisseaux, 22 secteurs, 4 secrets, +50 000 GC', 4000);
}
function devCredits(){ S.skr+=25000; save(); ui(); toast('+25 000 GC', 1800); }
function devVider(){
  S.completedNodes=[0]; S.currentNode=1; S.nodeStars={}; S.secrets=[];
  S.unlocked=[0,1]; S.ship=0; loadout.ship=0; S.carteActive=1;
  save(); ui(); renderSettings();
  toast('Progression remise a zero (le mode dev reste actif)', 3000);
}
function devQuitter(){ S.dev=false; _devTaps=0; save(); renderSettings(); toast('Mode développeur désactivé',2000); }

/* CODE ORBITAL : les quatre coins de l'accueil, dans le sens horaire */
let _coinsSeq=[], _coinsT=0;
function coinTape(i){
  const now=Date.now();
  if(now-_coinsT>2500) _coinsSeq=[];      /* trop lent : la sequence retombe */
  _coinsT=now;
  _coinsSeq.push(i);
  if(_coinsSeq.length>4) _coinsSeq.shift();
  if(_coinsSeq.join('')==='0123') debloquerSecret('orbital');
}

/* ============================================================
   BESTIAIRE — comportement de chaque unite
   ============================================================ */
const BESTIAIRE=[
  {slot:'enemyChasseur', nom:'Chasseur', menace:1, arrivee:'N1',
   d:"Rapide, il corrige sa trajectoire pour te suivre lat\u00e9ralement. Peu de PV : \u00e9limine-le t\u00f4t ou esquive de c\u00f4t\u00e9."},
  {slot:'enemyTireur', nom:'Tireur', menace:2, arrivee:'N1',
   d:"Se poste en haut d'\u00e9cran et lache des rafales de 3. Ne reste jamais dans son axe vertical."},
  {slot:'enemyKamikaze', nom:'Kamikaze', menace:2, arrivee:'N1',
   d:"Descend, puis fonce droit sur toi et explose au contact. Casse sa course avant qu'il ne s'amorce."},
  {slot:'enemyTank', nom:'Tank', menace:3, arrivee:'N1',
   d:"Lent, tr\u00e8s r\u00e9sistant, large. Il ne te vise pas : il occupe l'espace et te pousse \u00e0 la faute."},
  {slot:'enemyDiviseur', nom:'Diviseur', menace:3, arrivee:'N3',
   d:"\u00c0 sa mort, il se scinde en deux fragments plus rapides. Ne le tue pas dans un moment charg\u00e9."},
  {slot:'enemyBouclier', nom:'Porteur de bouclier', menace:4, arrivee:'N5',
   d:"Un arc d'\u00e9nergie prot\u00e8ge la face qu'il te pr\u00e9sente : tes tirs y sont renvoy\u00e9s. Contourne-le."},
  {slot:'enemyTeleport', nom:'T\u00e9l\u00e9porteur', menace:4, arrivee:'N7',
   d:"Dispara\u00eet puis r\u00e9appara\u00eet au-dessus ou en dessous de toi. Impossible de camper une position."},
  {slot:'enemyPoseur', nom:'Poseur de mines', menace:4, arrivee:'N9',
   d:"S\u00e8me des mines fixes qui persistent. Il r\u00e9duit ton terrain \u00e0 chaque passage."},
  {slot:'enemyDroneAv', nom:'Drone harceleur', menace:4, arrivee:'N9', variante:true,
   d:"Il ne fonce jamais. Il se poste sur un flanc \u00e0 ta hauteur, tire en diagonale, et change de c\u00f4t\u00e9 d\u00e8s que tu t'approches. Il faut aller le chercher, sinon il te grignote."},
  {slot:'enemySniperElite', nom:'Sniper \u00e9lite', menace:4, arrivee:'N10', variante:true,
   d:"Tireur d'\u00e9lite : lance d'\u00e9nergie fine, cadence accrue."},
  {slot:'enemyTankCorr', nom:'Tank corrompu', menace:4, arrivee:'N10', variante:true,
   d:"Tank contamin\u00e9 : PV largement sup\u00e9rieurs."},
  {slot:'enemyMineA', nom:'Mine chercheuse', menace:4, arrivee:'N11', variante:true,
   d:"Elle s'amorce t\u00f4t puis fonce droit sur toi. Abats-la avant qu'elle ne charge."},
  {slot:'enemyMineB', nom:'Mine d\u00e9rivante', menace:3, arrivee:'N9', variante:true,
   d:"Sem\u00e9e par le Poseur. Elle descend lentement, acc\u00e9l\u00e8re, puis s'\u00e9teint. Elle r\u00e9duit ton terrain."},
  {slot:'enemyZeroG', nom:'Chasseur z\u00e9ro-G', menace:5, arrivee:'N11', variante:true,
   d:"Trajectoire irr\u00e9guli\u00e8re, tr\u00e8s difficile \u00e0 anticiper."},
  {slot:'enemyDroneHeavy', nom:'Drone lourd', menace:5, arrivee:'N12', variante:true,
   d:"La forme la plus blind\u00e9e du r\u00e9seau. Pr\u00e9vois tes charges de bonus."},
  {slot:'bossVortexCore', nom:'\u2622 VORTEX', menace:5, arrivee:'N4', boss:true,
   d:"BOSS \u2014 PV \u00d75. Spirale continue de disques tranchants, rotation permanente. Reste en mouvement circulaire."},
  {slot:'bossSentinelle', nom:'\u2622 SENTINELLE / CORRUPTION', menace:5, arrivee:'N6 \u2022 N7', boss:true,
   d:"BOSS \u2014 PV \u00d78 \u00e0 \u00d710. Croix rotative de missiles et invocations. Au n\u0153ud 7, il inverse tes commandes."},
  {slot:'nexusIdle', nom:'\u2622 NEXUS', menace:5, arrivee:'N12', boss:true,
   d:"BOSS FINAL \u2014 PV \u00d716, 3 phases. Alterne spirale, croix et \u00e9ventail. Change d'apparence \u00e0 chaque phase."}
,

  /* ---------- CHAOS PROTOCOL : le reseau a mute ---------- */
  {slot:'cxRapide', nom:'Intercepteur Chaos', menace:4, arrivee:'C13', chaos:true,
   d:"Le chasseur, en pire. Mêmes trois tactiques, mais 2× plus de PV et une vitesse de piqué supérieure."},
  {slot:'cxSniper', nom:'Tireur Chaos', menace:4, arrivee:'C13', chaos:true,
   d:"Se poste plus haut et tient sa position plus longtemps. Ses rafales arrivent quand tu ne l'attends plus."},
  {slot:'cxGuepe', nom:'Guêpe', menace:4, arrivee:'C13', chaos:true,
   d:"Kamikaze léger mais nerveux. Il s'amorce tôt et corrige sa course pendant tout le vol."},
  {slot:'cxTank', nom:'Colosse Chaos', menace:5, arrivee:'C15', chaos:true,
   d:"PV ×2,4. Il ne te vise pas, il te prive d'espace. Passe derrière lui plutôt que de le percer."},
  {slot:'cxDrone', nom:'Essaimeur', menace:4, arrivee:'C15', chaos:true,
   d:"À sa mort il libère deux fragments rapides. Choisis le moment où tu l'abats."},
  {slot:'cxLourd', nom:'Garde Blindé', menace:5, arrivee:'C15', chaos:true,
   d:"Bouclier frontal qui renvoie tes tirs. La seule ouverture est sur ses flancs."},
  {slot:'cxElite', nom:'Spectre Chaos', menace:5, arrivee:'C18', chaos:true,
   d:"Téléporteur d'élite. Il réapparaît systématiquement dans ton angle mort."},
  {slot:'cxBoss', nom:'Semeur', menace:5, arrivee:'C18', chaos:true,
   d:"Tapisse le terrain de mines persistantes. Chaque passage réduit ta zone de jeu."},

  {slot:'primeIdle', nom:'☢ FRACTURE', menace:5, arrivee:'C16', boss:true, chaos:true,
   d:"BOSS — PV ×17, 3 formes. Croix rotative resserrée. Première anomalie stable du Chaos Protocol."},
  {slot:'cxDrone', nom:'☢ L’ESSAIMEUR', menace:4, arrivee:'N5', boss:true,
   d:"BOSS — PV ×6, 2 phases. Éventail de projectiles et invocations continues. Le premier vrai mur de Genesis."},
  {slot:'cxMassif2', nom:'☢ LE COLOSSE', menace:5, arrivee:'N11', boss:true,
   d:"BOSS — PV ×12, 2 phases. Croix rotative, aucune invocation : c’est un duel de placement pur."},
  {slot:'vortexCrystal', nom:'☢ L’ORACLE', menace:5, arrivee:'C18', boss:true, chaos:true,
   d:"BOSS — PV ×18, 2 phases. Spirale rapide et invocations. Il lit tes déplacements avant toi."},
  {slot:'bossDragon', nom:'☢ LE GARDIEN', menace:5, arrivee:'C20', boss:true, chaos:true,
   d:"BOSS — PV ×19, 2 phases, invocations. Il garde le portail et inverse tes commandes. Le dernier verrou avant NEXUS PRIME."},
  {slot:'cxMassif1', nom:'☢ NEXUS PRIME', menace:5, arrivee:'C21', boss:true, chaos:true,
   d:"BOSS ULTIME — PV ×26, 5 formes successives. Chaque mue change son pattern et son apparence. Le Nexus n'en était qu'une copie."}
];
/* Filtre courant du bestiaire : tous / genesis / chaos / boss */
let _bestFiltre='tous';
function filtrerBestiaire(f){ _bestFiltre=f; renderBestiaire(); }
/* Fiche de chaque vaisseau : silhouette, tir, et ce qu'il vaut vraiment */
const FICHES_VAISSEAU = {
  0:  {tir:'Trait vert Solana',   d:"Le vaisseau de départ. Aucun bonus, aucune faiblesse : c'est l'étalon auquel tous les autres se comparent."},
  1:  {tir:'Double trait violet', d:"Fourni dès le début. Léger gain de dégâts, silhouette large qui se repère bien dans le feu."},
  2:  {tir:'Comète orange',       d:"Premier achat conseillé. Tir à tête ronde et traînée, très lisible quand l'écran se charge."},
  3:  {tir:'Cristal cyan',        d:"Projectile en losange allongé. Bon compromis entre prix et dégâts pour aborder la boucle 2."},
  4:  {tir:'Lance dorée',         d:"Tir épais à cœur clair. Le dernier palier avant les vaisseaux qui se méritent."},
  5:  {tir:'Orbe spectral',       d:"Orbe pulsant avec halo : le tir le plus visible du jeu. Ne s'achète pas, ne se gagne dans aucun secteur. Certains pilotes jurent l'avoir trouvé sans quitter l'accueil."},
  6:  {tir:'Salve de trois',      d:"Série blindée. Trois traits serrés : couverture large, idéale contre les formations."},
  7:  {tir:'Chevron rose',        d:"Profil agressif. Tir en pointe, pensé pour percer les groupes en ligne."},
  8:  {tir:'Anneau violet',       d:"Se mérite après quatre secteurs de Chaos. Anneau qui se dilate, lisible sur fond chargé."},
  9:  {tir:'Éclat de givre',      d:"Se mérite avec les deux clés reconstituées. Éclat rotatif à six branches."},
  10: {tir:'Sceau doré',          d:"Le plus cher du hangar. Lance à garde, dégâts très élevés."},
  11: {tir:'Flamme dégradée',     d:"Ne s'achète pas : il faut terrasser NEXUS PRIME. Le vaisseau le plus puissant du jeu."},
  12: {tir:'Salve verte',         d:"Récompense de la CLÉ GENESIS. Blindé compact, tir en trois traits verts."},
  13: {tir:'Chevron sanglant',    d:"Récompense de la CLÉ DU CHAOS. Chevron rouge, dégâts élevés pour un vaisseau gratuit."},
};

function renderHangar(){
  const box=document.getElementById('bestiaire-liste'); if(!box) return;
  box.innerHTML=SHIPS.map(sh=>{
    const f=FICHES_VAISSEAU[sh.id]||{};
    const img=ASSETS['ship'+sh.id];
    const possede=S.unlocked.includes(sh.id);
    const acces = sh.cond ? T(sh.condTxt) : (sh.sol>0 ? sh.sol+' SOL' : T('Disponible dès le départ'));
    const teinte = sh.cond ? 'rgba(20,241,149,.35)' : (sh.sol>0 ? 'rgba(251,191,36,.3)' : 'rgba(153,69,255,.25)');
    return '<div class="glass rounded-2xl flex gap-3 items-start" style="border-color:'+teinte+';padding:14px 15px">'+
      '<div style="width:54px;height:54px;flex:none;display:flex;align-items:center;justify-content:center">'+
      (img?'<img src="'+img.src+'" style="width:100%;height:100%;object-fit:contain'+(possede?'':';opacity:.35;filter:grayscale(.8)')+'"/>'
          :'<div style="width:26px;height:26px;border-radius:6px;background:rgba(153,69,255,.3)"></div>')+
      '</div><div style="min-width:0;flex:1">'+
      '<div class="flex items-center gap-2 flex-wrap">'+
        '<span class="font-semibold text-[13px]">'+sh.name+'</span>'+
        '<span class="text-[9px] px-1.5 py-0.5 rounded" style="background:rgba(153,69,255,.18);color:#c4b5fd">'+
          T('dégâts')+' ×'+sh.bonus.toFixed(2)+'</span>'+
        (possede?'<span class="text-[9px] px-1.5 py-0.5 rounded" style="background:rgba(20,241,149,.16);color:#14F195">'+T('POSSÉDÉ')+'</span>'
                :'<span class="text-[9px]" style="color:#6b7280">🔒</span>')+
      '</div>'+
      '<div class="text-[10px] mt-1" style="color:#8b8b9e">'+T('Tir')+' : '+T(f.tir||'—')+' &bull; '+acces+'</div>'+
      '<div class="text-[11px] text-gray-400" style="line-height:1.6;margin-top:4px">'+T(f.d||'')+'</div>'+
      '</div></div>';
  }).join('');
}

/* Ce que le joueur ramasse en combat, et ce que ca fait */
const OBJETS = [
  {cle:'vie',      titre:'Réparation',        effet:'+1 vie immédiate',
   d:"Le seul objet qui rend une vie. Rare : ne compte pas dessus pour survivre."},
  {cle:'bouclier', titre:'Bouclier',          effet:'8 secondes d’invulnérabilité',
   d:"Traverse tout sans encaisser. Le moment de foncer dans la mêlée ou de passer un barrage."},
  {cle:'rapide',   titre:'Surcadence',        effet:'Cadence ×1.6 pendant 10 s',
   d:"Tir accéléré. Idéal juste avant une phase de boss."},
  {cle:'perce',    titre:'Munitions perçantes', effet:'Dégâts ×1.5 pendant 12 s',
   d:"Chaque tir frappe plus fort. Se cumule avec la surcadence."},
  {cle:'mitra',    titre:'Charge mitrailleuse', effet:'+1 charge de mitrailleuse',
   d:"S’ajoute à ta barre de bonus. Utilisable quand tu veux, y compris plus tard."},
  {cle:'nuke',     titre:'Charge de bombe',   effet:'+1 charge de bombe',
   d:"Nettoie l’écran d’un coup. Garde-la pour un moment vraiment saturé."},
  {cle:'ghost',    titre:'Charge fantôme',    effet:'+1 charge d’escorte',
   d:"Deux alliés te suivent et tirent avec toi pendant 22 secondes."},
  {cle:'noyau',    titre:'Noyau de données',  effet:'+18 points, converti en GC',
   d:"Le butin le plus rentable : chaque noyau ramassé se transforme en crédits à la fin de la mission."},
  {cle:'eclat',    titre:'Éclat de données',  effet:'+12 points et +3 frags',
   d:"Butin courant. Sans valeur seul, décisif en quantité."},
];
const PIEGES = [
  {couleur:'#dc2626', titre:'Mine posée', effet:'Explose au contact',
   d:"Cercle rouge cerclé d’une croix, avec des pointes. Ce n’est PAS un objet à ramasser : elle est lâchée par le Poseur et s’éteint d’elle-même au bout de quelques secondes."},
];

function renderObjets(){
  const box=document.getElementById('bestiaire-liste'); if(!box) return;
  box.innerHTML =
    OBJETS.map(o=>{
      const d=DROPS[o.cle]||{};
      const img=ASSETS[d.slot];
      return '<div class="glass rounded-2xl flex gap-3 items-start" style="border-color:'+
        ((d.couleur||'#9945FF')+'55')+';padding:14px 15px">'+
        '<div style="width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center">'+
        (img?'<img src="'+img.src+'" style="width:100%;height:100%;object-fit:contain"/>'
            :'<div style="width:22px;height:22px;border-radius:50%;background:'+(d.couleur||'#9945FF')+'"></div>')+
        '</div><div style="min-width:0">'+
        '<div class="flex items-center gap-2 flex-wrap">'+
          '<span class="font-semibold text-[13px]">'+T(o.titre)+'</span>'+
          '<span class="text-[9px] px-1.5 py-0.5 rounded" style="background:'+(d.couleur||'#9945FF')+'22;color:'+(d.couleur||'#c4b5fd')+'">'+T(o.effet)+'</span>'+
        '</div>'+
        '<div class="text-[11px] text-gray-400" style="line-height:1.6;margin-top:4px">'+T(o.d)+'</div>'+
        '</div></div>';
    }).join('') +
    '<div class="sect" style="margin-top:22px"><span>&#9888; &Agrave; NE PAS TOUCHER</span><i class="lig"></i></div>' +
    PIEGES.map(p=>
      '<div class="glass rounded-2xl flex gap-3 items-start" style="border-color:rgba(220,38,38,.45);padding:14px 15px">'+
      '<div style="width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center">'+
        '<div style="width:26px;height:26px;border-radius:50%;border:2.5px solid #dc2626;background:#3f0d12"></div></div>'+
      '<div style="min-width:0">'+
      '<div class="flex items-center gap-2 flex-wrap">'+
        '<span class="font-semibold text-[13px]" style="color:#f87171">'+T(p.titre)+'</span>'+
        '<span class="text-[9px] px-1.5 py-0.5 rounded" style="background:rgba(220,38,38,.18);color:#f87171">'+T(p.effet)+'</span>'+
      '</div>'+
      '<div class="text-[11px] text-gray-400" style="line-height:1.6;margin-top:4px">'+T(p.d)+'</div>'+
      '</div></div>').join('');
}

function renderBestiaire(){
  const box=document.getElementById('bestiaire-liste'); if(!box) return;
  const bf=document.getElementById('best-filtres');
  if(bf){
    bf.innerHTML=[['tous','TOUS'],['genesis','GENESIS'],['chaos','CHAOS'],['boss','BOSS'],['butin','BUTIN'],['hangar','HANGAR']].map(([id,lab])=>{
      const on=(_bestFiltre===id);
      return '<button onclick="filtrerBestiaire(\''+id+'\')" style="flex:1;padding:7px 4px;border-radius:11px;'+
        'font-size:9.5px;font-weight:800;letter-spacing:1px;border:1px solid '+
        (on?'rgba(153,69,255,.7)':'rgba(255,255,255,.09)')+';background:'+
        (on?'rgba(153,69,255,.22)':'rgba(255,255,255,.03)')+';color:'+(on?'#c4b5fd':'#8b8b9e')+'">'+lab+'</button>';
    }).join('');
  }
  if(_bestFiltre==='butin'){ renderObjets(); return; }
  if(_bestFiltre==='hangar'){ renderHangar(); return; }
  const liste=BESTIAIRE.filter(e=>
      _bestFiltre==='tous'   ? true :
      _bestFiltre==='boss'   ? !!e.boss :
      _bestFiltre==='chaos'  ? !!e.chaos : !e.chaos);
  box.innerHTML=liste.map(e=>{
    const img=ASSETS[e.slot];
    const etoiles='\u25c6'.repeat(e.menace)+'<span style="opacity:.25">'+'\u25c6'.repeat(5-e.menace)+'</span>';
    const teinte=e.boss?'rgba(232,121,249,.45)':e.chaos?'rgba(20,241,149,.35)':e.variante?'rgba(251,191,36,.35)':'rgba(153,69,255,.25)';
    return '<div class="glass rounded-2xl flex gap-3 items-start" style="border-color:'+teinte+';padding:14px 15px">'+
      '<div style="width:52px;height:52px;flex:none;display:flex;align-items:center;justify-content:center">'+
      (img?'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">'+
           '<img src="'+img.src+'" style="width:112%;height:112%;object-fit:contain;'+
           'transform:rotate('+((ORIENT[e.slot]||0))+'deg);filter:drop-shadow(0 0 3px rgba(255,255,255,.35))"/></div>'
          :'<div style="width:26px;height:26px;border-radius:6px;background:rgba(153,69,255,.3)"></div>')+
      '</div><div style="min-width:0">'+
      '<div class="flex items-center gap-2 flex-wrap"><span class="font-semibold text-[13px]">'+T(e.nom)+'</span>'+
      '<span class="text-[9px] text-gray-500">'+e.arrivee+'</span>'+
      (e.variante?'<span class="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">VARIANTE</span>':'')+
      (e.chaos?'<span class="text-[8px] px-1.5 py-0.5 rounded" style="background:rgba(20,241,149,.16);color:#5eead4">CHAOS</span>':'')+
      (e.boss?'<span class="text-[8px] px-1.5 py-0.5 rounded" style="background:rgba(232,121,249,.18);color:#f0abfc">BOSS</span>':'')+'</div>'+
      '<div class="text-[10px] text-red-300 my-0.5">'+etoiles+'</div>'+
      '<div class="text-[11px] text-gray-400" style="line-height:1.6;margin-top:3px">'+T(e.d)+'</div>'+
      '</div></div>';
  }).join('');
}

/* ============================================================
   PALIERS ON-CHAIN — chaque seuil de transactions reelles debloque
   quelque chose. Regle absolue : jamais de puissance. Une transaction
   coute presque rien a repeter ; si les paliers donnaient des degats
   ou des vies, le jeu deviendrait du pay-to-win. On ne distribue donc
   que du cosmetique, de l'information et du prestige.
   ============================================================ */
const PALIERS_TX = [
  {id:'tx5',   seuil:5,   cle:'journal',    n:'PREMIER CONTACT',
   d:'5 TX on-chain \u2022 ouvre le journal des signatures', gc:250,
   recompense:'Journal on-chain \u2014 tes transactions, avec lien vers Solscan'},
  {id:'tx15',  seuil:15,  cle:'eligible',   n:'SEEKER TASK',
   d:'15 TX on-chain \u2022 activit\u00e9 Solana', gc:600, sp:true,
   recompense:'Badge \u00c9LIGIBLE'},
  {id:'tx30',  seuil:30,  cle:'livree',     n:'PILOTE CONFIRM\u00c9',
   d:'30 TX on-chain', gc:900,
   recompense:'Livr\u00e9e chrom\u00e9e \u2014 teinte alternative sur ton vaisseau'},
  {id:'tx45',  seuil:45,  cle:'munition',   n:'ARMURIER',
   d:'45 TX on-chain', gc:1200,
   recompense:'Munition signature \u2014 un tir au visuel exclusif'},
  {id:'tx60',  seuil:60,  cle:'indicatif',  n:'V\u00c9T\u00c9RAN DU R\u00c9SEAU',
   d:'60 TX on-chain', gc:1500,
   recompense:'Indicatif de pilote \u2014 un titre affich\u00e9 en fin de partie'},
  {id:'tx75',  seuil:75,  cle:'transmission', n:'ARCHIVISTE',
   d:'75 TX on-chain', gc:1800,
   recompense:'Transmission classifi\u00e9e \u2014 un chapitre de lore et la piste CHAOS en menu'},
  {id:'tx90',  seuil:90,  cle:'hud',        n:'OP\u00c9RATEUR GENESIS',
   d:'90 TX on-chain', gc:2200,
   recompense:'Th\u00e8me HUD Genesis \u2014 interface or et violet'},
  {id:'tx100', seuil:100, cle:'validateur', n:'VALIDATEUR',
   d:'100 TX on-chain \u2022 le rang ultime', gc:3500,
   recompense:'Rang VALIDATEUR \u2014 badge permanent et livr\u00e9e dor\u00e9e'},
  {id:'tx120', seuil:120, cle:'trainee',    n:'PROPULSION LIBRE',
   d:'120 TX on-chain', gc:4200,
   recompense:'Tra\u00een\u00e9e de r\u00e9acteur \u2014 couleur de propulsion au choix'},
  {id:'tx150', seuil:150, cle:'architecte', n:'ARCHITECTE',
   d:'150 TX on-chain \u2022 le rang de prestige', gc:6000,
   recompense:'Rang ARCHITECTE \u2014 titre exclusif et carte aux couleurs Genesis'}
];
/* Couleurs de propulsion, palier 120. Purement decoratives. */
const TRAINEES = [
  {id:'violet', nom:'Violet',   c:'#9945FF'},
  {id:'vert',   nom:'\u00c9meraude', c:'#14F195'},
  {id:'or',     nom:'Or',       c:'#fbbf24'},
  {id:'cyan',   nom:'Cyan',     c:'#67e8f9'},
  {id:'rouge',  nom:'Braise',   c:'#fb7185'}
];
/* Transmission debloquee au palier 75. */
const TRANSMISSION_ARCHIVE = {
  titre:'ARCHIVE // PROTOCOLE GENESIS',
  texte:"Le Nexus n'a jamais \u00e9t\u00e9 con\u00e7u pour garder quoi que ce soit. "+
        "Il a \u00e9t\u00e9 con\u00e7u pour <b>signer</b>. Chaque secteur que tu s\u00e9curises "+
        "\u00e9crit une ligne dans un registre que personne ne peut r\u00e9\u00e9crire \u2014 "+
        "pas m\u00eame ceux qui l'ont b\u00e2ti.<br><br>"+
        "C'est pour \u00e7a qu'ils ont coup\u00e9 la Boucle. Pas pour t'arr\u00eater : "+
        "pour effacer la preuve. Ils ont oubli\u00e9 qu'un registre distribu\u00e9 "+
        "n'a pas de centre \u00e0 d\u00e9truire.<br><br>"+
        "<i>\u2014 fragment r\u00e9cup\u00e9r\u00e9 sur l'\u00e9pave du vaisseau-archive SEEKER-00</i>"
};
/* ---- Palier 5 : journal des signatures ----
   Les signatures etaient deja memorisees mais jamais montrees. */
/* Echappe tout ce qui vient de l'exterieur avant de l'inserer dans le DOM.
   Les signatures et libelles d'action transitent par le wallet et le RPC :
   on ne leur fait pas confiance. */
function txtSur(v){
  return String(v==null?'':v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
/* Une signature Solana est du base58 sur 64 a 96 caracteres. Tout le reste
   est refuse : pas de lien construit avec une valeur douteuse. */
const RE_SIGNATURE = /^[1-9A-HJ-NP-Za-km-z]{64,96}$/;

function renderJournalTx(){
  const box=document.getElementById('panneau-journal'); if(!box) return;
  /* Tout texte visible passe par T() : ces panneaux sont regeneres a chaque
     changement de langue, le parcours du DOM ne les atteint pas. */
  if(!debloque('journal')){
    box.innerHTML='<div class="sect"><span>\ud83d\udd12 '+T('JOURNAL ON-CHAIN')+'</span><i class="lig"></i></div>'+
      '<div class="text-[10.5px]" style="color:#6b7280;line-height:1.6;padding:4px 2px">'+
      T('Se débloque à 5 transactions on-chain ({0}/5).', txCumulees())+'</div>';
    return;
  }
  const sigs=(S.signatures||[]);
  box.innerHTML='<div class="sect"><span>\u26d3\ufe0f '+T('JOURNAL ON-CHAIN')+'</span><i class="lig"></i></div>'+
    '<div class="text-[10px] mb-2" style="color:#8b8b9e">'+
      T('{0} transactions confirmées • {1} dernières conservées', txCumulees(), sigs.length)+'</div>'+
    (sigs.length? sigs.map(x=>{
      const sig=String(x.sig||'');
      const valide=RE_SIGNATURE.test(sig);
      const court=txtSur(sig.slice(0,8)+'\u2026'+sig.slice(-6));
      const quand=txtSur(new Date(x.t).toLocaleString());
      const action=txtSur(x.action);
      const dedans=
        '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center">'+
          '<span style="font-size:10.5px;color:#14F195;font-weight:600">'+action+'</span>'+
          '<span style="font-size:9px;color:#6b7280">'+quand+'</span></div>'+
        '<div style="font-size:9.5px;color:#9ca3af;font-family:monospace;margin-top:3px">'+
          court+(valide?' \u2197':' \u26a0')+'</div>';
      const style='class="glass" style="display:block;border-radius:12px;padding:9px 11px;margin-bottom:6px;text-decoration:none"';
      /* Signature au format inattendu : on affiche, on ne lie pas. */
      return valide
        ? '<a href="https://solscan.io/tx/'+encodeURIComponent(sig)+'?cluster=devnet" target="_blank" rel="noopener" '+style+'>'+dedans+'</a>'
        : '<div '+style+'>'+dedans+'</div>';
    }).join('') : '<div class="text-[10.5px]" style="color:#6b7280">'+T('Aucune signature enregistrée.')+'</div>');
}

/* ---- Paliers 30 et 100 : livrees ----
   Un simple filtre de rendu : aucune incidence sur l'equilibre. */
function filtreLivree(){
  /* La livree blueprint prime : c'est une trouvaille, pas un palier. */
  if(S.blueprint && S.livreeBlueprint!==false)
    return 'grayscale(1) brightness(1.5) contrast(2.4) sepia(1) hue-rotate(160deg) saturate(4)';
  if(debloque('validateur')) return 'hue-rotate(35deg) saturate(1.5) brightness(1.12)';  /* doree */
  if(debloque('livree'))     return 'saturate(0.25) brightness(1.3) contrast(1.1)';      /* chromee */
  return null;
}

/* ---- Palier 60 : indicatif de pilote ---- */
function choisirTrainee(id){
  if(!debloque('trainee')) return toast('Tra\u00een\u00e9e verrouill\u00e9e', 2000);
  if(!TRAINEES.some(t=>t.id===id)) return;
  S.trainee=id; save(); renderSettings();
  Audio2.jouerSfx('button_click'); toast('Propulsion modifi\u00e9e', 1800);
}
function choisirIndicatif(v){
  if(!debloque('indicatif')) return toast('Indicatif verrouill\u00e9', 2000);
  if(!indicatifsDisponibles().includes(v)) return toast('Indicatif verrouill\u00e9', 2000);
  S.indicatif=v; save(); renderSettings(); ui();
  Audio2.jouerSfx('button_click');
  toast('Indicatif \u00ab '+v+' \u00bb adopt\u00e9', 2200);
}
function renderPanneauPaliers(){
  const box=document.getElementById('panneau-paliers'); if(!box) return;
  const n=txCumulees();
  box.innerHTML='<div class="sect"><span>\ud83c\udfc5 '+T('PALIERS ON-CHAIN')+'</span><i class="lig"></i></div>'+
    '<div class="text-[10.5px] mb-2" style="color:#8b8b9e;line-height:1.55">'+
      T('Chaque palier ne donne que du cosmétique ou du prestige : aucune récompense ne rend le vaisseau plus fort.')+'</div>'+
    PALIERS_TX.map(p=>{
      const ok=debloque(p.cle);
      return '<div style="display:flex;gap:9px;align-items:flex-start;padding:7px 2px;'+
        'border-bottom:1px solid rgba(255,255,255,.05)">'+
        '<span style="font-size:13px;flex:none">'+(ok?'\u2705':'\ud83d\udd12')+'</span>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-size:11px;font-weight:700;color:'+(ok?'#14F195':'#9ca3af')+'">'+
            p.seuil+' TX \u2022 '+T(p.n)+'</div>'+
          '<div style="font-size:9.5px;color:#7c7a8c;line-height:1.5">'+T(p.recompense)+'</div>'+
        '</div></div>';
    }).join('')+
    (debloque('indicatif')
      ? '<div class="text-[10px] mt-3 mb-1" style="color:#8b8b9e">'+T('Ton indicatif')+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px">'+
        indicatifsDisponibles().map(v=>'<button onclick="choisirIndicatif(\''+v+'\')" class="glass" '+
          'style="padding:6px 10px;border-radius:10px;font-size:10px;font-weight:700;'+
          (S.indicatif===v?'border-color:rgba(20,241,149,.65);color:#14F195':'color:#9ca3af')+'">'+T(v)+'</button>').join('')+
        '</div>'
      : '')+
    (debloque('trainee')
      ? '<div class="text-[10px] mt-3 mb-1" style="color:#8b8b9e">'+T('Traînée de réacteur')+'</div>'+
        '<div style="display:flex;flex-wrap:wrap;gap:6px">'+
        TRAINEES.map(t=>'<button onclick="choisirTrainee(\''+t.id+'\')" class="glass" '+
          'style="padding:6px 10px;border-radius:10px;font-size:10px;font-weight:700;color:'+t.c+';'+
          (S.trainee===t.id?'border-color:'+t.c:'')+'">'+T(t.nom)+'</button>').join('')+
        '</div>'
      : '')+
    (S.blueprint
      ? '<div class="text-[10px] mt-3 mb-1" style="color:#8b8b9e">'+T('Livrée Blueprint')+'</div>'+
        '<button onclick="basculerBlueprint()" class="glass" style="padding:7px 12px;border-radius:10px;'+
          'font-size:10px;font-weight:700;'+
          (S.livreeBlueprint!==false ? 'border-color:rgba(103,232,249,.6);color:#67e8f9' : 'color:#9ca3af')+'">'+
          (S.livreeBlueprint!==false ? T('Activée') : T('Désactivée'))+'</button>'
      : '')+
    (debloque('transmission')
      ? '<div class="glass" style="margin-top:12px;border-radius:14px;padding:12px;'+
          'border-color:rgba(153,69,255,.4)">'+
          '<div style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:1.5px;'+
            'color:#c4b5fd;margin-bottom:7px">'+T(TRANSMISSION_ARCHIVE.titre)+'</div>'+
          '<div style="font-size:10.5px;color:#9ca3af;line-height:1.7">'+T(TRANSMISSION_ARCHIVE.texte)+'</div>'+
        '</div>'
      : '')+
    '<div class="text-[10px] mt-3" style="color:#6b7280">'+T('Progression : {0} TX', n)+'</div>';
}

/* ---- Terminal de bord de la carte (easter egg DEVNET) ----
   Regle de conception : il ne montre QUE ce que le joueur peut deja savoir.
   Sur un secteur jamais joue, les lignes tactiques restent muettes, sinon
   ce serait un outil de reperage, donc un avantage de jeu. */
/* La livree Blueprint delave volontairement le vaisseau. Certains la
   trouveront jolie, d'autres voudront revoir leurs couleurs : elle doit
   pouvoir se retirer. */
function basculerBlueprint(){
  if(!S.blueprint) return;
  S.livreeBlueprint = (S.livreeBlueprint===false);
  save(); renderSettings();
  Audio2.jouerSfx('button_click');
  toast(S.livreeBlueprint!==false ? T('Livrée Blueprint activée') : T('Couleurs d\u2019origine rétablies'), 2200);
}

function basculerTerminalCarte(){
  const el=document.getElementById('terminal-carte'); if(!el) return;
  el.classList.toggle('ouvert');
  S.termOuvert=el.classList.contains('ouvert');
  const ong=document.getElementById('term-onglet');
  if(ong) ong.setAttribute('aria-expanded', S.termOuvert?'true':'false');
  Audio2.jouerSfx('button_click'); haptique('bouton');
  if(S.termOuvert) majTerminalCarte();
  save();
}
/* Deux temps, uniquement quand le terminal est deploye : le premier appui
   affiche le dossier du secteur, le second lance la preparation. Sans le
   terminal ouvert, un seul appui suffit — on ne rallonge pas le parcours
   des joueurs qui n'ont pas trouve l'easter egg. */
let _noeudArme=null, _noeudArmeT=0;
function terminalDeploye(){
  const el=document.getElementById('terminal-carte');
  return !!(el && !el.classList.contains('hidden') && el.classList.contains('ouvert'));
}
function toucherNoeud(id){
  if(!terminalDeploye()){ S.currentNode=id; majTerminalCarte(); return openPrep(id); }
  const now=Date.now();
  if(_noeudArme===id && (now-_noeudArmeT)<9000){
    _noeudArme=null; majTerminalCarte(); return openPrep(id);
  }
  _noeudArme=id; _noeudArmeT=now;
  S.currentNode=id;
  majTerminalCarte();
  Audio2.jouerSfx('button_click'); haptique('bouton');
}

function ligneTerm(cle, val, inconnu){
  return '<div class="li"><b>'+cle+'</b><span'+(inconnu?' class="inc"':'')+'>'+val+'</span></div>';
}
function majTerminalCarte(){
  const el=document.getElementById('terminal-carte'); if(!el) return;
  el.classList.toggle('hidden', !secretTrouve('sidev'));
  if(!secretTrouve('sidev')) return;
  el.classList.toggle('ouvert', !!S.termOuvert);
  const corps=document.getElementById('term-int'); if(!corps) return;

  const id=S.currentNode;
  const nd=NODES.find(x=>x.id===id);
  const joue = (S.completedNodes||[]).includes(id);
  const inc = T('non recueilli');
  let h='<div class="tl">// SEEKER TERMINAL v1</div>';

  /* Bloc chaine : purement informatif */
  h+= ligneTerm('cluster', 'devnet')
    + ligneTerm('rpc', String(CHAINE.rpc||'').replace(/^https?:\/\//,'').split('/')[0])
    + ligneTerm('tx', txCumulees())
    + ligneTerm(T('wallet'), S.walletReel ? txtSur(S.address||'ok') : T('non connecté'));

  h+= '<div class="nd">// '+T('SECTEUR')+' '+String(id).padStart(2,'0')+'</div>';
  if(!nd){ corps.innerHTML=h+ligneTerm(T('statut'), inc, true); return; }

  const b=BOUCLES[nd.boucle];
  h+= ligneTerm(T('nom'), T(nd.title))
    + ligneTerm(T('type'), nd.type||'combat')
    + ligneTerm(T('boucle'), b?T(b.nom):'—')
    + ligneTerm(T('statut'), joue ? T('sécurisé') : (noeudAccessible(nd) ? T('accessible') : T('verrouillé')));

  /* Etoiles obtenues : c'est un fait acquis, pas une information tactique. */
  const et=(S.nodeStars||{})[id]||0;
  h+= ligneTerm(T('étoiles'), et ? '★'.repeat(et) : '—');

  /* Les donnees tactiques n'apparaissent qu'une fois le secteur joue. */
  if(joue){
    const v=vaguesRequises(id);
    h+= ligneTerm(T('vagues'), v===null ? T('boss') : v);
    const bd=BOSS_DEFS[id];
    h+= ligneTerm('boss', bd ? T(bd.nom) : T('aucun'));
    const c=contratDuNoeud(id);
    h+= ligneTerm(T('contrat'), c && c.def ? T(c.def.nom) : '—');
    if(nd.meca) h+= ligneTerm(T('mécanique'), nd.meca);
  } else {
    h+= ligneTerm(T('vagues'),   inc, true)
      + ligneTerm('boss',        inc, true)
      + ligneTerm(T('contrat'),  inc, true);
    h+= '<div class="nd inc" style="letter-spacing:0;margin-top:9px;line-height:1.6;color:#5f5a72">'+
        T('Données tactiques indisponibles : secteur jamais parcouru.')+'</div>';
  }
  /* Rappel du second appui : sans ca on ne comprend pas pourquoi la
     preparation ne s'ouvre plus au premier contact. */
  if(_noeudArme===id) h+= '<div class="act">\u25b6 '+T('Appuie une seconde fois sur le nœud pour lancer la mission.')+'</div>';
  corps.innerHTML=h;
}

/* Indicatifs proposes au palier 60. Purement decoratifs. */
const INDICATIFS = ['SPECTRE','NOMADE','SENTINELLE','ORACLE','VECTEUR','FANTOME'];
/* Reserve au palier 150 : il ne figure pas dans la liste commune. */
const INDICATIF_PRESTIGE = 'ARCHITECTE';
function indicatifsDisponibles(){
  let l = debloque('architecte') ? INDICATIFS.concat(INDICATIF_PRESTIGE) : INDICATIFS.slice();
  if(secretTrouve('sidev')) l = l.concat('STAGIAIRE');   /* le badge ironique */
  return l;
}

/* Nombre de transactions REELLES cumulees. Sans wallet connecte, rien ne
   s'incremente : on ne decroche aucun rang sans signer. */
function txCumulees(){ return S.txTotal||0; }
/* Enregistre des transactions reellement confirmees on-chain. */
function creditTX(nb){
  if(!S.walletReel || !nb) return;
  S.txTotal=(S.txTotal||0)+nb;
  verifierPaliersTX();
}
/* Un deblocage est acquis definitivement, il ne se reprend jamais. */
function debloque(cle){ return (S.debloquesTx||[]).includes(cle); }
function verifierPaliersTX(){
  const n=txCumulees();
  PALIERS_TX.forEach(p=>{
    if(n>=p.seuil && !debloque(p.cle)){
      S.debloquesTx=(S.debloquesTx||[]).concat(p.cle);
      toast('\ud83d\udd13 '+p.n+' \u2022 '+p.recompense, 4600);
      Audio2.jouerSfx('levelup'); haptique('victoire');
      if(p.cle==='indicatif' && !S.indicatif) S.indicatif=INDICATIFS[0];
      if(p.cle==='trainee' && !S.trainee) S.trainee='violet';
    }
  });
  save();
}

/* ============================================================
   QUETES — progression, palier, et recompense a reclamer
   ============================================================ */
function listeQuetes(){
  const nbEtoiles=Object.values(S.nodeStars||{}).reduce((t,v)=>t+v,0);
  const nbExtreme=Object.values(S.nodeStars||{}).filter(v=>v>=3).length;
  /* Recompenses exclusivement en GC : le jeu ne distribue jamais de SOL. */
  return [
    {id:'streak',   n:'Daily Streak',      d:'3 jours de suite',            c:S.streak, m:3,  skr:150},
    {id:'streak7',  n:'Semaine compl\u00e8te',  d:'7 jours de suite',            c:S.streak, m:7,  skr:400},
    {id:'kills100', n:'Destroyer',         d:'100 ennemis d\u00e9truits',       c:S.totalKills, m:100, skr:220},
    {id:'kills500', n:'Exterminateur',     d:'500 ennemis d\u00e9truits',       c:S.totalKills, m:500, skr:700},
    /* Les six paliers on-chain, generes depuis PALIERS_TX */
    ...PALIERS_TX.map(p=>({ id:p.id, n:p.n, d:p.d, c:txCumulees(), m:p.seuil,
                            skr:p.gc, sp:!!p.sp, palier:p })),
    {id:'camp5',    n:'Campagne',          d:'5 secteurs s\u00e9curis\u00e9s',      c:(S.completedNodes||[]).length, m:5,  skr:250},
    {id:'camp12',   n:'Genesis Complete',  d:'12 secteurs s\u00e9curis\u00e9s',     c:(S.completedNodes||[]).length, m:12, skr:1200},
    {id:'boss3',    n:'Chasseur de boss',  d:'Vortex, Corruption, Nexus',   c:[4,7,12].filter(x=>(S.completedNodes||[]).includes(x)).length, m:3, skr:900},
    {id:'boss7',    n:'Tueur de titans',   d:'Les 10 boss du jeu terrass\u00e9s',
     c:[4,5,6,7,11,12,16,18,20,21].filter(x=>(S.completedNodes||[]).includes(x)).length, m:10, skr:2600},
    {id:'etoiles',  n:'Perfectionniste',   d:'20 \u00e9toiles cumul\u00e9es',       c:nbEtoiles, m:20, skr:500},
    {id:'extreme',  n:'Sans piti\u00e9',       d:'3 n\u0153uds en Extr\u00eame',        c:nbExtreme, m:3,  skr:650},
    {id:'infini10', n:'Survivant',         d:'Vague 10 en Infini',          c:S.infiniVague||0, m:10, skr:350},
    {id:'arena',    n:'Gladiateur',        d:'3 d\u00e9fis Arena remport\u00e9s',   c:Object.keys(S.arenaRecords||{}).length, m:3, skr:450},
    /* Tant que le secret n'est pas trouve, on donne un indice, pas la solution. */
    {id:'ghost',    n:'Ghost',
     d: S.ghostUnlocked ? 'Logo de l\u2019accueil tap\u00e9 7\u00d7' : 'Le protocole fant\u00f4me dort quelque part sur l\u2019accueil\u2026',
     c:S.ghostUnlocked?1:0, m:1, skr:400},
    {id:'chaos4',   n:'Protocole Chaos',   d:'4 secteurs de CHAOS s\u00e9curis\u00e9s',
     c:(S.completedNodes||[]).filter(x=>x>=13).length, m:4, skr:800},
    {id:'prime',    n:'Origine',           d:'Terrasser NEXUS PRIME',
     c:(S.completedNodes||[]).includes(21)?1:0, m:1, skr:1500},
    {id:'combo',    n:'Encha\u00eenement parfait', d:'Atteindre le combo maximum \u00d76',
     c:Math.floor(S.comboMax||0), m:6, skr:400},
    {id:'purete',   n:'Puret\u00e9',           d:'2 boss vaincus sans aucun bonus',
     c:S.sansBonus||0, m:2, skr:750},
    {id:'intact',   n:'Sans une \u00e9gratignure', d:'5 secteurs sans perdre de vie',
     c:S.sansDegat||0, m:5, skr:600},
    {id:'secrets',  n:'Archiviste',        d:'D\u00e9couvrir les 4 secrets',
     c:(S.secrets||[]).length, m:4, skr:1000},
    {id:'cles',     n:'Serrurier',         d:'Reconstituer les 2 cl\u00e9s',
     c:Object.keys(CLES).filter(k=>cleComplete(k)).length, m:2, skr:1600},
    {id:'contrats', n:'Sous contrat',      d:'8 contrats de secteur remplis',
     c:(S.contratsRemplis||[]).length, m:8, skr:1100}
  ].map(q=>({...q, sol:0}));
}
function reclamerQuete(id){
  const q=listeQuetes().find(x=>x.id===id); if(!q) return;
  if(q.c<q.m) return toast('Objectif non atteint');
  /* Un palier on-chain exige un wallet connecte : rien ne se reclame sans. */
  if(q.palier && !S.walletReel) return toast(T('Connecte ton wallet : ce palier se gagne on-chain'), 3400);
  if(q.palier) verifierPaliersTX();
  if((S.quetesReclamees||[]).includes(id)) return toast('D\u00e9j\u00e0 r\u00e9clam\u00e9');
  S.quetesReclamees=(S.quetesReclamees||[]).concat(id);
  S.skr+=q.skr;   /* les quetes ne versent que des credits */
  if(q.sp) toast('\ud83c\udf89 \u00c9LIGIBLE \u00c9LIGIBILIT\u00c9 AIRDROP \u2022 +'+q.skr+' GC',3800);
  else if(q.palier) toast('\ud83d\udd13 '+q.n+' \u2022 '+q.palier.recompense+' \u2022 +'+q.skr+' GC', 4400);
  else toast('\u2705 '+q.n+' \u2022 +'+(q.sol?q.sol+' SOL ':'')+'+'+q.skr+' GC',3000);
  Audio2.jouerSfx('levelup'); haptique('victoire');
  save(); ui(); renderQuests();
}
function renderQuests(){
  const box=document.getElementById('quest-list'); if(!box) return;
  const qs=listeQuetes();
  const faites=(S.quetesReclamees||[]);
  /* les quetes pretes a reclamer remontent en tete */
  qs.sort((a,b)=>{
    const pa=faites.includes(a.id)?2:(a.c>=a.m?0:1), pb=faites.includes(b.id)?2:(b.c>=b.m?0:1);
    return pa-pb;
  });
  const pretes=qs.filter(q=>q.c>=q.m && !faites.includes(q.id)).length;
  const badge=document.getElementById('badge-quetes');
  if(badge) badge.style.display = pretes>0 ? 'block' : 'none';

  renderSecrets();
  box.innerHTML=qs.map(q=>{
    const fini=faites.includes(q.id), pret=q.c>=q.m && !fini;
    const pct=Math.min(100, q.c/q.m*100);
    return '<div style="padding:15px 16px" class="glass rounded-2xl '+(q.sp?'border border-green-500/40':'')+
      (pret?' ring-2 ring-green-400':'')+(fini?' opacity-50':'')+'">'+
      '<div class="flex justify-between items-start gap-2 mb-1">'+
        '<div style="min-width:0"><div class="font-semibold text-sm">'+T(q.n)+'</div>'+
        '<div class="text-[10px] text-gray-500">'+T(q.d)+'</div></div>'+
        '<span class="text-[10px] flex-none">'+Math.min(q.c,q.m)+'/'+q.m+'</span>'+
      '</div>'+
      '<div class="bar mb-2"><div style="width:'+pct+'%"></div></div>'+
      '<div class="flex justify-between items-center gap-2">'+
        '<span class="text-[10px] text-gray-400">'+(q.sol?('+'+q.sol+' SOL  '):'')+'+'+q.skr+' GC</span>'+
        (fini ? '<span class="text-[10px] text-green-400 font-bold">\u2713 R\u00c9CLAM\u00c9</span>'
              : pret ? '<button onclick="reclamerQuete(\''+q.id+'\')" class="btn px-3 py-1.5 rounded-lg text-[11px] font-bold">R\u00c9CLAMER</button>'
                     : '<span class="text-[10px] text-gray-600">En cours</span>')+
      '</div></div>';
  }).join('');
}
/* finishRace : ancienne Arena, remplacee par les defis quotidiens */
/* Classement local : les vrais records du joueur */
function enregistrerRecord(nom, score, detail){
  if(!S.records) S.records=[];
  S.records.push({nom, score:Math.round(score), detail, date:Date.now()});
  S.records.sort((a,b)=>b.score-a.score);
  S.records=S.records.slice(0,12);
  save();
}

function renderLB(){
  const box=document.getElementById('lb'); if(!box) return;
  const r=(S.records||[]);
  if(!r.length){
    box.innerHTML='<div class="text-[11px] text-gray-500 text-center py-3">'+
      'Aucun record. Termine une mission ou lance le mode Infini pour ouvrir le classement.</div>';
    return;
  }
  box.innerHTML=r.map((e,i)=>{
    const medaille=i===0?'\ud83e\udd47':i===1?'\ud83e\udd48':i===2?'\ud83e\udd49':'<span style="opacity:.4">#'+(i+1)+'</span>';
    const d=new Date(e.date);
    return '<div class="flex justify-between items-center gap-2">'+
      '<span style="width:26px">'+medaille+'</span>'+
      '<span class="flex-1 truncate">'+e.nom+'<span class="text-gray-600 text-[10px]"> \u2022 '+e.detail+'</span></span>'+
      '<span class="text-green-300 font-bold">'+e.score.toLocaleString()+'</span>'+
      '<span class="text-gray-600 text-[9px]" style="width:38px;text-align:right">'+
      d.getDate()+'/'+(d.getMonth()+1)+'</span></div>';
  }).join('');
}

function ui(){
  /* Theme HUD Genesis (90 TX) et rang VALIDATEUR (100 TX) : deux classes
     posees sur la racine, tout le reste est du CSS. */
  try{
    const r=document.documentElement;
    if(r && r.classList){
      r.classList.toggle('hud-genesis', debloque('hud'));
      r.classList.toggle('rang-validateur', debloque('validateur'));
      r.classList.toggle('rang-architecte', debloque('architecte'));
    }
  }catch(e){}
  const bv=document.getElementById('badge-validateur');
  if(bv) bv.classList.toggle('hidden', !debloque('validateur'));
  document.getElementById('b-sol').textContent=S.sol.toFixed(2);
  const bt=document.getElementById('b-skrtok');
  if(bt) bt.textContent=(S.soldeSkr||0).toLocaleString(undefined,{maximumFractionDigits:0});
  document.getElementById('b-skr').textContent=Math.floor(S.skr).toLocaleString();
  document.getElementById('streak').textContent=S.streak;
  majSeekerTask();
  majBadgeWallet(); majRecordInfini(); renderQuests();
  const today=new Date().toDateString();
  const btn=document.getElementById('btn-daily');
  if(S.lastClaim===today){btn.disabled=true;btn.textContent='CLAIMED';btn.classList.add('opacity-40');}
  else{btn.disabled=false;btn.textContent='CLAIM';btn.classList.remove('opacity-40');}
}

document.getElementById('logo').addEventListener('click',()=>{
  S.logoTaps++;
  if(S.logoTaps===7 && !S.ghostUnlocked){ S.ghostUnlocked=true; if(!S.unlocked.includes(5)) S.unlocked.push(5); toast('👻 GHOST PROTOCOL DÉVERROUILLÉ'); sfx('power'); save(); }
  if(S.logoTaps>12) S.logoTaps=0;
});

load();
document.addEventListener('gesturestart',e=>e.preventDefault());

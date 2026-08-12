/* ============================================================
   SEEKER STRIKE v4.4 - 2-donnees.js
   Constantes, etat, donnees de jeu
   Lignes 1 a 2109 du script (game/index_v37.html)
   Genere par game/build_audit.py — NE PAS EDITER A LA MAIN.
   La source de verite est game/index_v37.html.
   ============================================================ */

/* ============================================================
   SEEKER STRIKE v3.5 — Premium Visual Upgrade
   Real sprites for ships, enemies, boss, bullets, orbs, explosion
   ============================================================ */

/* Certains WebView n'exposent qu'une partie de l'API console : on securise tout. */
const LOG = (function(){
  const c = (typeof console!=='undefined') ? console : null;
  const sortie = (c && (c.log||c.warn||c.error)) ? (c.log||c.warn||c.error).bind(c) : function(){};
  const prendre = m => (c && typeof c[m]==='function') ? c[m].bind(c) : sortie;
  return { info:prendre('info'), warn:prendre('warn'), erreur:prendre('error'), log:prendre('log') };
})();

const ASSETS = {
  // Ships
  ship: null, ship2: null, shipKing: null, shipGhost: null, shipOrange: null, shipV2: null, ghostV2: null, logoNexus:null,
  // Enemies enemyRed: null, enemyHeavy: null, enemyElite: null, heavyV2: null, boss: null, bossV2: null,
  // Projectiles & VFX bulletGreen: null, explosion: null, explosion2: null, explosionV3: null, trail: null,
  // Collectibles
  orbSol: null, orbSkr: null,
  // Icons iconNuke: null, iconShield: null, iconChasseur: null, iconFacile: null, iconStory: null, iconNukeWhite: null,
  // --- Slots v3.7 : boss, ennemis, noeuds, fonds (charges depuis assets/) ---
  bossVortexCore: null, bossVortexFace: null, bossSentinelle: null, bossDragon: null, bossFortress: null,
  enemyChasseur: null, enemyTireur: null, enemyKamikaze: null, enemyTank: null,
  node1:null, node2:null, node3:null, node4:null, node5:null, node6:null, node7:null, node8:null,
  /* Slots v4.2 : depose le PNG, le comportement est deja code */
  enemyTeleport:null, enemyBouclier:null, enemyDiviseur:null, enemyPoseur:null,
  icoRepair:null, icoCoque:null,
  cxBoss:null, cxDrone:null, cxElite:null, cxGuepe:null, cxLourd:null, cxMassif1:null, cxMassif2:null, cxMassif3:null, cxMassif4:null, cxMassif5:null, cxRapide:null, cxSniper:null, cxTank:null, cxNdboss:null, cxNdcombat:null, cxNdelite:null, cxNdmystere:null, cxNdportail:null, cxNdrepos:null, cxNdshop:null, cxNdtresor:null,
  primeIdle:null, primeP1:null, primeP2:null, primeP3:null, primeDeath:null,
  icoCadence:null, icoSpread:null, icoBoost:null, icoScan:null, icoArme:null, icoLot:null,
  ship0:null, ship1:null, ship2:null, ship3:null, ship4:null, ship5:null,
  ship6:null, ship7:null, ship8:null, ship9:null, ship10:null, ship11:null,
  ship12:null, ship13:null, cleGenesis:null, cleChaos:null, bonusMitra:null, bonusNuke:null, bonusGhost:null, nodeDone:null, nodeLock:null, nodePlay:null, uiMap:null, uiQuests:null, uiRules:null, uiArena:null, uiShop:null, uiStreak:null, uiSon:null, uiMusique:null, uiDiff:null, uiVague:null, uiVictoire:null, uiDefaite:null,
  projBoss:null, projBalle:null,
  projPlasma:null, projLance:null, projOrbe:null, projDisque:null, projMissile:null, projSingularite:null, projJoueur1:null, projJoueur2:null, enemyDroneHeavy:null, enemySniperElite:null, enemyZeroG:null, fxSmall:null, fxLarge:null, fxBoss:null, pwMinigun:null, pwNuke:null, pwGhost:null, ammoStd:null, ammoPerf:null, ammoScatter:null, ammoHoming:null, icoHealth:null, icoShield:null, icoScore:null, icoWarning:null,
  nexusIdle:null, nexusP1:null, nexusP2:null, nexusP3:null, nexusDeath:null, enemyDroneAv:null, enemySniper:null, enemyTankCorr:null, enemyMine:null, enemyMineA:null, enemyMineB:null, vortexCrystal: null, vortexRock: null, vortexFractal: null, bgHangarAlt: null
};

function loadAssets() {
  const list = [
    // Ships
    // Enemies
    // Projectiles & VFX
    // Collectibles
    ['orbSol', 'data:image/…;base64,<retiré>'],
    ['orbSkr', 'data:image/…;base64,<retiré>'],
    // Icons
    
  ];
  list.forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    img.onload = () => { ASSETS[key] = img; };
    img.onerror = () => LOG.warn('Failed', src);
  });
}
loadAssets();

/* Slots v3.7 : fichiers PNG dans assets/. Absent = fallback geometrique, aucun crash. */
/* Sprites critiques : embarques en base64 -> aucun probleme de chemin, meme sans dossier assets/ */
const ICO = { damage:'data:image/…;base64,<retiré>', speed:'data:image/…;base64,<retiré>', shield:'data:image/…;base64,<retiré>', health:'data:image/…;base64,<retiré>' };
const ASSETS_INLINE = [
  ['icoCadence','data:image/…;base64,<retiré>'],
  ['icoSpread','data:image/…;base64,<retiré>'],
  ['icoBoost','data:image/…;base64,<retiré>'],
  ['icoScan','data:image/…;base64,<retiré>'],
  ['icoArme','data:image/…;base64,<retiré>'],
  ['icoLot','data:image/…;base64,<retiré>'],
  ['orbSol','data:image/…;base64,<retiré>'],
  ['orbSkr','data:image/…;base64,<retiré>'],
    ['cxSniper','data:image/…;base64,<retiré>'],
    ['ship0','data:image/…;base64,<retiré>'],
    ['ship1','data:image/…;base64,<retiré>'],
    ['ship2','data:image/…;base64,<retiré>'],
    ['ship4','data:image/…;base64,<retiré>'],
    ['bonusMitra','data:image/…;base64,<retiré>'],
    ['bonusGhost','data:image/…;base64,<retiré>'],
    ['nodeDone','data:image/…;base64,<retiré>'],
    ['nodeLock','data:image/…;base64,<retiré>'],
    ['nodePlay','data:image/…;base64,<retiré>'],
    ['uiMap','data:image/…;base64,<retiré>'],
    ['uiQuests','data:image/…;base64,<retiré>'],
    ['uiRules','data:image/…;base64,<retiré>'],
    ['uiArena','data:image/…;base64,<retiré>'],
    ['uiShop','data:image/…;base64,<retiré>'],
    ['uiSon','data:image/…;base64,<retiré>'],
    ['uiMusique','data:image/…;base64,<retiré>'],
    ['uiVictoire','data:image/…;base64,<retiré>'],
    ['enemyBouclier','data:image/…;base64,<retiré>'],
    ['enemyTeleport','data:image/…;base64,<retiré>'],
    ['ammoPerf','data:image/…;base64,<retiré>'],
    ['ammoScatter','data:image/…;base64,<retiré>'],
    ['ammoHoming','data:image/…;base64,<retiré>'],
    ['icoScore','data:image/…;base64,<retiré>'],
    ['icoWarning','data:image/…;base64,<retiré>'],
    ['enemyChasseur','data:image/…;base64,<retiré>'],
    ['enemyTireur','data:image/…;base64,<retiré>'],
    ['enemyTank','data:image/…;base64,<retiré>'],
    
];
/* Decor optionnel : charge depuis assets/ si present, sinon ignore sans casse */
/* Decor optionnel. Vide : ces visuels ne sont pas dessines par le moteur.
   Pour en activer un, ajoute ['cleAssets','assets/fichier.png'] ici. */
/* Images sorties du fichier : chargees en parallele au demarrage, sans bloquer.
   Le dossier assets/ doit accompagner le HTML. */
const ASSETS_FICHIERS = [
  /* Icones redessinees : elles doivent vivre ici et pas dans
     ASSETS_INLINE, sinon le build autonome ne les embarque pas. */
  ['icoRepair','assets/inline/icoRepair.webp'],
  ['icoShield','assets/inline/icoShield.webp'],
  ['icoCoque','assets/inline/icoCoque.webp'],
  ['icoHealth','assets/inline/icoHealth.webp'],
  ['pwGhost','assets/inline/pwGhost.webp'],
  ['pwMinigun','assets/inline/pwMinigun.webp'],
  ['pwNuke','assets/inline/pwNuke.webp'],
  ['enemySniperElite','assets/inline/enemySniperElite.webp'],
  ['ship12','assets/inline/ship12.webp'],
  ['ship13','assets/inline/ship13.webp'],
  ['cleGenesis','assets/inline/cleGenesis.webp'],
  ['cleChaos','assets/inline/cleChaos.webp'],
  ['projPlasma','assets/inline/projPlasma.webp'],
  ['projLance','assets/inline/projLance.webp'],
  ['projMissile','assets/inline/projMissile.webp'],
  ['projSingularite','assets/inline/projSingularite.webp'],
  ['projBoss','assets/inline/projBoss.webp'],
  ['projBalle','assets/inline/projBalle.webp'],
  ['projJoueur1','assets/inline/projJoueur1.webp'],
  ['projJoueur2','assets/inline/projJoueur2.webp'],
  ['ship','assets/inline/ship.webp'],
  ['ship2','assets/inline/ship2.webp'],
  ['explosion','assets/inline/explosion.webp'],
  ['iconNukeWhite','assets/inline/iconNukeWhite.webp'],
  ['cxBoss','assets/inline/cxBoss.webp'],
  ['cxDrone','assets/inline/cxDrone.webp'],
  ['cxElite','assets/inline/cxElite.webp'],
  ['cxGuepe','assets/inline/cxGuepe.webp'],
  ['cxLourd','assets/inline/cxLourd.webp'],
  ['cxMassif1','assets/inline/cxMassif1.webp'],
  ['cxMassif2','assets/inline/cxMassif2.webp'],
  ['cxMassif3','assets/inline/cxMassif3.webp'],
  ['cxMassif4','assets/inline/cxMassif4.webp'],
  ['cxMassif5','assets/inline/cxMassif5.webp'],
  ['cxRapide','assets/inline/cxRapide.webp'],
  ['cxTank','assets/inline/cxTank.webp'],
  ['cxNdboss','assets/inline/cxNdboss.webp'],
  ['cxNdcombat','assets/inline/cxNdcombat.webp'],
  ['cxNdelite','assets/inline/cxNdelite.webp'],
  ['cxNdmystere','assets/inline/cxNdmystere.webp'],
  ['cxNdportail','assets/inline/cxNdportail.webp'],
  ['cxNdrepos','assets/inline/cxNdrepos.webp'],
  ['cxNdshop','assets/inline/cxNdshop.webp'],
  ['cxNdtresor','assets/inline/cxNdtresor.webp'],
  ['primeIdle','assets/inline/primeIdle.webp'],
  ['primeP1','assets/inline/primeP1.webp'],
  ['primeP2','assets/inline/primeP2.webp'],
  ['primeP3','assets/inline/primeP3.webp'],
  ['primeDeath','assets/inline/primeDeath.webp'],
  ['vortexCrystal','assets/inline/vortexCrystal.webp'],
  ['vortexRock','assets/inline/vortexRock.webp'],
  ['vortexFractal','assets/inline/vortexFractal.webp'],
  ['ship3','assets/inline/ship3.webp'],
  ['ship5','assets/inline/ship5.webp'],
  ['ship6','assets/inline/ship6.webp'],
  ['ship7','assets/inline/ship7.webp'],
  ['ship8','assets/inline/ship8.webp'],
  ['ship9','assets/inline/ship9.webp'],
  ['ship10','assets/inline/ship10.webp'],
  ['ship11','assets/inline/ship11.webp'],
  ['bonusNuke','assets/inline/bonusNuke.webp'],
  ['uiStreak','assets/inline/uiStreak.webp'],
  ['uiDefaite','assets/inline/uiDefaite.webp'],
  ['enemyDiviseur','assets/inline/enemyDiviseur.webp'],
  ['enemyPoseur','assets/inline/enemyPoseur.webp'],
  ['projOrbe','assets/inline/projOrbe.webp'],
  ['projDisque','assets/inline/projDisque.webp'],
  ['enemyDroneHeavy','assets/inline/enemyDroneHeavy.webp'],
  ['enemyZeroG','assets/inline/enemyZeroG.webp'],
  ['fxSmall','assets/inline/fxSmall.webp'],
  ['fxLarge','assets/inline/fxLarge.webp'],
  ['fxBoss','assets/inline/fxBoss.webp'],
  ['nexusIdle','assets/inline/nexusIdle.webp'],
  ['nexusP1','assets/inline/nexusP1.webp'],
  ['nexusP2','assets/inline/nexusP2.webp'],
  ['nexusP3','assets/inline/nexusP3.webp'],
  ['nexusDeath','assets/inline/nexusDeath.webp'],
  ['enemyDroneAv','assets/inline/enemyDroneAv.webp'],
  ['enemySniper','assets/inline/enemySniper.webp'],
  ['enemyTankCorr','assets/inline/enemyTankCorr.webp'],
  ['logoNexus','assets/inline/logoNexus.webp'],
  ['enemyMine','assets/inline/enemyMine.webp'],
  /* Deux mines distinctes : la chercheuse traque, la derivante tombe. */
  ['enemyMineA','assets/inline/enemyMineA.webp'],
  ['enemyMineB','assets/inline/enemyMineB.webp'],
  ['node1','assets/inline/node1.webp'],
  ['node2','assets/inline/node2.webp'],
  ['node3','assets/inline/node3.webp'],
  ['node4','assets/inline/node4.webp'],
  ['node5','assets/inline/node5.webp'],
  ['node6','assets/inline/node6.webp'],
  ['node7','assets/inline/node7.webp'],
  ['node8','assets/inline/node8.webp'],
  ['bossVortexCore','assets/inline/bossVortexCore.webp'],
  ['bossVortexFace','assets/inline/bossVortexFace.webp'],
  ['bossSentinelle','assets/inline/bossSentinelle.webp'],
  ['bossDragon','assets/inline/bossDragon.webp'],
  ['bossFortress','assets/inline/bossFortress.webp'],
  ['enemyKamikaze','assets/inline/enemyKamikaze.webp'],
  ['nodeVortexWhite','assets/inline/nodeVortexWhite.webp']
];
window.DIAG_ASSETS = { charges:0, echecs:0, manquants:[] };
/* Un ecran dessine avant l'arrivee des images restait fige sur ses formes
   de secours. On le redessine quand le lot est arrive. */
let _rafraichirTimer=null;
function rafraichirVisuels(){
  clearTimeout(_rafraichirTimer);
  _rafraichirTimer=setTimeout(()=>{
    try{ if(typeof renderBestiaire==='function') renderBestiaire(); }catch(e){}
    try{ if(typeof renderShips==='function')     renderShips(); }catch(e){}
    try{ if(typeof renderShop==='function')      renderShop(); }catch(e){}
    try{ if(typeof renderQuests==='function')    renderQuests(); }catch(e){}
    try{ if(typeof majBarreBonus==='function')   majBarreBonus(); }catch(e){}
    try{ if(typeof poserIcones==='function')     poserIcones(); }catch(e){}
    try{ if(typeof ui==='function')              ui(); }catch(e){}
  }, 140);        /* on groupe les arrivees pour ne pas redessiner 118 fois */
}

function loadSlots(){
  const suivre=(cle,img)=>{ ASSETS[cle]=img; window.DIAG_ASSETS.charges++; rafraichirVisuels(); };
  ASSETS_INLINE.forEach(([cle,srcImg])=>{
    const img=new Image();
    img.onload =()=>suivre(cle,img);
    img.onerror=()=>{ window.DIAG_ASSETS.echecs++; window.DIAG_ASSETS.manquants.push(cle+' (inline)');
                      LOG.erreur('[SEEKER] sprite inline illisible :', cle); };
    img.src=srcImg;
  });
  ASSETS_FICHIERS.forEach(([cle,chemin])=>{
    const img=new Image();
    img.onload =()=>suivre(cle,img);
    img.onerror=()=>{ window.DIAG_ASSETS.echecs++; window.DIAG_ASSETS.manquants.push(chemin);
                      LOG.warn('[SEEKER] decor absent (non bloquant) :', chemin); };
    img.src=chemin;
  });
  setTimeout(()=>{ const d=window.DIAG_ASSETS;
    LOG.log('[SEEKER] assets : '+d.charges+' charges, '+d.echecs+' echecs'+(d.echecs?' -> '+d.manquants.join(', '):''));
    rafraichirVisuels(); }, 2500);
}
loadSlots();

/* ---------- Definition des 3 boss (v3.7) ---------- */
/* --- Niveaux de difficulte par noeud (v3.8) --- */
/* La difficulte agit sur quatre leviers, pas seulement les PV :
   hp      = resistance des ennemis
   cadence = frequence de leurs tirs
   flux    = densite d'apparition (plus petit = plus serre)
   vitesse = deplacement des unites
   Normal reste la marche d'entree ; Difficile et Extreme doivent se sentir. */
const DIFFICULTES = {
  normal:   {id:'normal',   nom:'Normal',   etoiles:1, hp:1.0,  cadence:1.0,  flux:1.0,  vitesse:1.0,  bonusUnites:0, reward:1.0, couleur:'#86efac'},
  difficile:{id:'difficile',nom:'Difficile',etoiles:2, hp:1.6,  cadence:1.4,  flux:0.76, vitesse:1.14, bonusUnites:3, reward:2.1, couleur:'#fbbf24'},
  extreme:  {id:'extreme',  nom:'Extr\u00eame',  etoiles:3, hp:2.5,  cadence:1.85, flux:0.56, vitesse:1.28, bonusUnites:6, reward:3.8, couleur:'#f87171'}
};

/* ============================================================
   FONDS DE NIVEAU — un decor par noeud, charge avant le combat.
   Depose les fichiers dans assets/levels/ ; ce qui manque
   retombe sur bg_gameplay, aucun ecran noir possible.
   ============================================================ */
const FONDS_NIVEAU = {
  0:{nom:'QG Seeker',      fichier:'niveau_1'},
  1:{nom:'\u00c9veil',         fichier:'niveau_1'},
  2:{nom:'Ast\u00e9ro\u00efdes',    fichier:'niveau_2'},
  3:{nom:'P\u00e9rils',        fichier:'niveau_3'},
  4:{nom:'Vortex',         fichier:'niveau_4'},
  5:{nom:'N\u00e9buleuse',     fichier:'niveau_5'},
  6:{nom:'Station Sigma',  fichier:'niveau_3'},
  7:{nom:'Corruption',     fichier:'niveau_6'},
  8:{nom:'QG Terre',       fichier:'niveau_8'},
  9:{nom:'D\u00e9bris',        fichier:'niveau_2'},
  10:{nom:'Redressement',  fichier:'niveau_5'},
  11:{nom:'Point de rupture',fichier:'niveau_6'},
  12:{nom:'Nexus',         fichier:'niveau_7'},
  13:{nom:'Br\u00e8che',        chaos:101},
  14:{nom:'Comptoir',      chaos:104},
  15:{nom:'Meute',         chaos:103},
  16:{nom:'Fracture',      chaos:103},
  17:{nom:'Havre',         chaos:104},
  18:{nom:'Signal',        chaos:102},
  19:{nom:'Coffre',        chaos:104},
  20:{nom:'Portail',       chaos:101},
  21:{nom:'Nexus Prime',   chaos:103}
};
const DECORS_INLINE = {
  1:'data:image/…;base64,<retiré>',
  2:'data:image/…;base64,<retiré>',
  3:'data:image/…;base64,<retiré>',
  4:'data:image/…;base64,<retiré>',
  5:'data:image/…;base64,<retiré>',
  6:'data:image/…;base64,<retiré>',
  7:'data:image/…;base64,<retiré>',
  8:'data:image/…;base64,<retiré>',
  9:'data:image/…;base64,<retiré>',
  10:'data:image/…;base64,<retiré>',
  11:'data:image/…;base64,<retiré>',
  12:'data:image/…;base64,<retiré>'
};
const DECORS_CHAOS = {
  101:'data:image/…;base64,<retiré>',
  102:'data:image/…;base64,<retiré>',
  103:'data:image/…;base64,<retiré>',
  104:'data:image/…;base64,<retiré>'
};
const DECORS_EXTREME = {
  1:'data:image/…;base64,<retiré>',
  2:'data:image/…;base64,<retiré>',
  3:'data:image/…;base64,<retiré>',
  4:'data:image/…;base64,<retiré>',
  5:'data:image/…;base64,<retiré>',
  6:'data:image/…;base64,<retiré>',
  7:'data:image/…;base64,<retiré>',
  8:'data:image/…;base64,<retiré>',
  9:'data:image/…;base64,<retiré>',
  10:'data:image/…;base64,<retiré>',
  11:'data:image/…;base64,<retiré>',
  12:'data:image/…;base64,<retiré>'
};
/* Un fond par campagne. Plus de variantes : GENESIS garde la carte
   d'origine (double helice vert et violet), CHAOS PROTOCOL prend la
   version bleue. L'index correspond a S.carteActive. */
const CARTES = {
  1:{nom:'Genesis \u2014 Classic Helix', img:'assets/inline/map_genesis.jpg'},
  2:{nom:'Chaos Protocol \u2014 Cristaux', img:'assets/inline/map_chaos.jpg'}
};
const FONDS_CACHE = {};

/* Noeuds sans boss dedie : un mini-boss apparait quand meme (vague 4+),
   choisi selon le noeud pour rester coherent. Corrige la disparition
   des boss sur les secteurs 1, 2, 3 et 5. */
function bossDuNoeud(nodeId, vague){
  if(BOSS_DEFS[nodeId]) return BOSS_DEFS[nodeId];
  if(vague<4) return null;
  const cles=[4,6,7];                                   /* modeles de mini-boss */
  const idx=Math.abs(Math.floor(nodeId||0)) % cles.length;
  const modele=BOSS_DEFS[cles[idx]];
  if(!modele) return null;
  return { ...modele,
    nom:'\u00c9CLAIREUR '+modele.nom,
    hpMult:Math.max(2, modele.hpMult*0.45),   /* mini-boss : bien moins resistant */
    rayon:modele.rayon*0.78,
    phase2:false, invoque:false, mini:true };
}      /* url validee par noeud, ou null si absent */

/* Precharge le decor d'un noeud. Resout toujours : jamais de blocage. */
function chargerFondNiveau(nodeId){
  return new Promise(resolve=>{
    const def=FONDS_NIVEAU[nodeId];
    if(!def){ resolve(null); return; }
    const dificile = loadout.difficulte==='extreme' || loadout.difficulte==='difficile';
    if(!dificile && FONDS_CACHE[nodeId]!==undefined){ resolve(FONDS_CACHE[nodeId]); return; }
    /* Decor embarque : aucun acces disque, fonctionne meme en fichier local */
    /* Les secteurs de CHAOS ont leurs propres decors */
    if(def.chaos && DECORS_CHAOS[def.chaos]){ resolve(DECORS_CHAOS[def.chaos]); return; }
    const num=parseInt(String(def.fichier).replace('niveau_',''),10);
    /* En Difficile et Extreme, le secteur change de visage : la rejouabilite se voit */
    const dur = loadout.difficulte==='extreme' || loadout.difficulte==='difficile';
    if(dur && DECORS_EXTREME[num]){ resolve(DECORS_EXTREME[num]); return; }
    if(DECORS_INLINE[num]){ FONDS_CACHE[nodeId]=DECORS_INLINE[num]; resolve(DECORS_INLINE[num]); return; }
    const url='assets/levels/'+def.fichier+'.jpg';
    const img=new Image();
    img.onload =()=>{ FONDS_CACHE[nodeId]=url; resolve(url); };
    img.onerror=()=>{ FONDS_CACHE[nodeId]=null;
      LOG.info('[SEEKER] decor de niveau absent, repli sur bg_gameplay :',url);
      resolve(null); };
    img.src=url;
  });
}
/* Applique le decor avec un fondu depuis le precedent */
function appliquerFondNiveau(url){
  const couches=document.querySelectorAll('.jeu-fond');
  if(!couches.length) return;
  couches.forEach(c=>{
    c.style.transition='opacity .55s ease';
    c.style.opacity='0';
  });
  setTimeout(()=>{
    couches.forEach((c,i)=>{
      if(url) c.style.backgroundImage="url('"+url+"')";
      else    c.style.backgroundImage='';      /* revient au decor CSS par defaut */
      c.style.opacity = i===0 ? '.60' : '.28';
    });
  }, 260);
}

const BOSS_DEFS = {
  4: { id:'vortex',     nom:'VORTEX',     hpMult:5,  sprite:'bossVortexCore', sprites:['bossVortexCore','bossVortexFace','vortexRock'], pattern:'spirale',
       couleur:'#a855f7', rayon:70, rotation:0.006, phase2:true, invoque:false },
  6: { id:'sentinelle', nom:'SENTINELLE', hpMult:8,  sprite:'bossSentinelle', sprites:['bossSentinelle','bossFortress'], pattern:'croix',
       couleur:'#22d3ee', rayon:78, rotation:0,     phase2:true, invoque:true  },
  7: { id:'corruption', nom:'CORRUPTION', hpMult:10, sprite:'bossSentinelle', sprites:['bossSentinelle','vortexFractal'], pattern:'croix',
       couleur:'#f472b6', rayon:82, rotation:0,     phase2:true,  invoque:true  },
  16:{ id:'fracture',   nom:'FRACTURE',   hpMult:17, sprite:'primeIdle', sprites:['primeP1','primeP2','primeP3'], pattern:'croix',
       couleur:'#22d3ee', rayon:84, rotation:0.003, phase2:true, invoque:true, phases3:true, mort:'primeDeath' },
  /* --- Trois affrontements supplementaires, pour casser la repetition --- */
  5: { id:'essaimeur',  nom:'L\u2019ESSAIMEUR', hpMult:6,  sprite:'cxDrone', sprites:['cxDrone','cxGuepe'], pattern:'eventail',
       couleur:'#34d399', rayon:64, rotation:0.002, phase2:true, invoque:true },
  11:{ id:'colosse',    nom:'LE COLOSSE',  hpMult:12, sprite:'cxMassif2', sprites:['cxMassif2','cxMassif4'], pattern:'croix',
       couleur:'#fbbf24', rayon:88, rotation:0,     phase2:true, invoque:false },
  18:{ id:'oracle',     nom:'L\u2019ORACLE',   hpMult:18, sprite:'vortexCrystal', sprites:['vortexCrystal','vortexFractal'], pattern:'spirale',
       couleur:'#67e8f9', rayon:76, rotation:0.008, phase2:true, invoque:true },

  /* GARDIEN DU PORTAIL : dernier verrou avant NEXUS PRIME */
  20:{ id:'gardien',    nom:'LE GARDIEN',  hpMult:19, sprite:'bossDragon', sprites:['bossDragon','bossFortress'], pattern:'spirale',
       couleur:'#fbbf24', rayon:92, rotation:0.005, phase2:true, invoque:true },
  /* NEXUS PRIME : 5 apparences, une mutation tous les 20 % de PV */
  21:{ id:'prime',      nom:'NEXUS PRIME', hpMult:26, sprite:'cxMassif1', mort:'primeDeath',
       sprites:['cxMassif1','cxMassif2','cxMassif3','cxMassif4','cxMassif5'], pattern:'fusion',
       couleur:'#34d399', rayon:110, rotation:0.004, phase2:true, invoque:true, phases3:true, phases5:true },
  12:{ id:'nexus',      nom:'NEXUS',      hpMult:16, sprite:'nexusIdle', mort:'nexusDeath', sprites:['nexusP1','nexusP2','nexusP3'], pattern:'fusion',
       couleur:'#e879f9', rayon:96, rotation:0.004, phase2:true,  invoque:true, phases3:true }
};

/* Orientation des sprites : les ennemis descendent, ils doivent pointer vers le bas.
   Valeur en degres, ajustable slot par slot sans retoucher les images. */
const ORIENT = {
  /* Mesure de la repartition de masse : la pointe doit viser le bas de l'ecran. */
  /* Corrige d'apres observation en jeu : la face de l'unite doit regarder le joueur (vers le bas). */
  enemyChasseur:270,    /* nez a gauche  -> bas */
  enemySniper:90,       /* nez a droite  -> bas */
  enemySniperElite:90,  /* nez a droite  -> bas */
  enemyMine:315,        /* sprite en diagonale : capteur rouge en avant */
  enemyMineA:0,         /* mine chercheuse : radiale, aucune orientation */
  enemyMineB:0,         /* mine derivante  : radiale, aucune orientation */
  enemyTeleport:90,     /* sprite deja retourne a la creation */
  enemyDroneAv:45,      /* sprite en diagonale : nez effile vers le joueur */
  enemyZeroG:270,       /* face a gauche -> bas */
  enemyTankCorr:0,      /* deja de face */
  enemyDroneHeavy:0,    /* deja de face */
  /* Sprites CHAOS : dessines de face, aucune rotation */
  cxRapide:0, cxSniper:0, cxTank:0, cxGuepe:0, cxDrone:0, cxLourd:0, cxElite:0, cxBoss:0,
  cxMassif1:0, primeIdle:0, nexusIdle:0, bossVortexCore:0, bossSentinelle:0, bossDragon:0, bossFortress:0,
  cxMassif2:0, cxMassif4:0, vortexCrystal:0, vortexFractal:0,
  enemyTireur:0, enemyKamikaze:0, enemyTank:0,
  enemyDiviseur:0, enemyBouclier:0, enemyPoseur:0
};

/* Fallbacks geometriques : losange=boss, triangle=chasseur, carre=tireur, cercle=kamikaze, hexagone=tank */
/* Mine posee : lecture immediate du danger, jamais confondue avec un drop */
function dessinerMine(ctx, e){
  const r=e.r||13;
  const p=0.5+0.5*Math.sin((G.frame||0)*0.18);          /* pulsation */
  const finit=(e.vie||0)<90;                             /* bientot eteinte */
  const rouge=finit?'#f87171':'#dc2626';
  ctx.save();
  /* halo d'avertissement */
  ctx.beginPath(); ctx.arc(0,0,r*(1.7+p*0.35),0,Math.PI*2);
  ctx.fillStyle='rgba(220,38,38,'+(0.10+p*0.12).toFixed(2)+')'; ctx.fill();
  /* Sprite de la mine derivante. Radiale : aucune rotation a appliquer.
     On garde le halo et le clignotement de fin de vie autour. */
  const img=ASSETS.enemyMineB;
  if(img){
    const t=r*2.7;
    if(finit && Math.floor((e.vie||0)/6)%2===0) ctx.globalAlpha=0.45;
    ctx.shadowColor=rouge; ctx.shadowBlur=9+p*7;
    ctx.drawImage(img,-t/2,-t/2,t,t);
    ctx.shadowBlur=0; ctx.globalAlpha=1;
    ctx.restore(); return;
  }
  /* corps */
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle='#3f0d12'; ctx.fill();
  ctx.lineWidth=2.4; ctx.strokeStyle=rouge;
  ctx.shadowColor=rouge; ctx.shadowBlur=10+p*8; ctx.stroke(); ctx.shadowBlur=0;
  /* croix de danger */
  ctx.lineWidth=2; ctx.beginPath();
  ctx.moveTo(-r*0.45,-r*0.45); ctx.lineTo(r*0.45,r*0.45);
  ctx.moveTo(r*0.45,-r*0.45);  ctx.lineTo(-r*0.45,r*0.45);
  ctx.strokeStyle=rouge; ctx.stroke();
  /* pointes */
  for(let i=0;i<4;i++){
    const a=Math.PI/2*i+Math.PI/4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
    ctx.lineTo(Math.cos(a)*(r*1.42), Math.sin(a)*(r*1.42));
    ctx.lineWidth=2.6; ctx.strokeStyle=rouge; ctx.stroke();
  }
  ctx.restore();
}

function formeFallback(ctx,forme,r,couleur){
  ctx.save(); ctx.shadowColor=couleur; ctx.shadowBlur=14; ctx.fillStyle=couleur;
  ctx.beginPath();
  if(forme==='losange'){ ctx.moveTo(0,-r); ctx.lineTo(r*0.72,0); ctx.lineTo(0,r); ctx.lineTo(-r*0.72,0); }
  else if(forme==='triangle'){ ctx.moveTo(0,r); ctx.lineTo(r*0.85,-r*0.7); ctx.lineTo(-r*0.85,-r*0.7); }
  else if(forme==='carre'){ ctx.rect(-r*0.8,-r*0.6,r*1.6,r*1.2); }
  else if(forme==='cercle'){ ctx.arc(0,0,r,0,Math.PI*2); }
  else { for(let i=0;i<6;i++){ const a=Math.PI/3*i-Math.PI/2; const fn=i?'lineTo':'moveTo'; ctx[fn](Math.cos(a)*r,Math.sin(a)*r); } }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
const NODE_IMGS = {
  1: 'data:image/…;base64,<retiré>',
  2: 'data:image/…;base64,<retiré>',
  3: 'data:image/…;base64,<retiré>',
  4: 'data:image/…;base64,<retiré>',
  5: 'data:image/…;base64,<retiré>',
  6: 'data:image/…;base64,<retiré>',
  7: 'data:image/…;base64,<retiré>',
  8: 'data:image/…;base64,<retiré>'
};


/* 12 vaisseaux, deux voies d'acces :
     - `sol`  : achat direct depuis le wallet du joueur ;
     - `cond` : merite par la progression, sans depenser un lamport.
   Six vaisseaux sur douze s'obtiennent sans jamais sortir de SOL :
   les deux de depart, Ghost (secret du logo) et les trois a condition. */
const SHIPS = [
  {id:0,  emoji:'🚀', name:'Seeker One', bonus:1.00, sol:0},
  {id:1,  emoji:'🛸', name:'Phantom',    bonus:1.12, sol:0},
  {id:2,  emoji:'☄️', name:'Comet',      bonus:1.25, sol:0.15, skr:3800},
  {id:3,  emoji:'🌌', name:'Nebula',     bonus:1.38, sol:0.30, skr:7500},
  {id:4,  emoji:'👑', name:'King',       bonus:1.55, sol:0.55, skr:14000},
  {id:5,  emoji:'👻', name:'Ghost',      bonus:1.70, sol:0},
  {id:6,  emoji:'🛡️', name:'Warden',     bonus:1.20, sol:0.12, skr:3000},
  {id:7,  emoji:'🦅', name:'Raptor',     bonus:1.33, sol:0.22, skr:5500},
  {id:8,  emoji:'🌀', name:'Specter',    bonus:1.47, sol:0,
   cond:()=>(S.completedNodes||[]).filter(x=>x>=13).length>=4, condTxt:'4 secteurs CHAOS sécurisés'},
  {id:9,  emoji:'❄️', name:'Wraith',     bonus:1.62, sol:0,
   cond:()=>cleComplete('genesis') && cleComplete('chaos'), condTxt:'les 2 clés reconstituées'},
  {id:10, emoji:'⚜️', name:'Sovereign',  bonus:1.80, sol:0.85, skr:21000},
  {id:11, emoji:'🔥', name:'Inferno',    bonus:1.95, sol:0,
   cond:()=>(S.completedNodes||[]).includes(21), condTxt:'NEXUS PRIME terrassé'},
  {id:12, emoji:'🤖', name:'Sentinel',   bonus:1.28, sol:0,
   cond:()=>cleComplete('genesis'), condTxt:'CLÉ GENESIS reconstituée'},
  {id:13, emoji:'🩸', name:'Revenant',   bonus:1.52, sol:0,
   cond:()=>cleComplete('chaos'), condTxt:'CLÉ DU CHAOS reconstituée'},
];
/* Ouvre les vaisseaux dont la condition vient d'etre remplie */
function verifierVaisseaux(){
  let ouvert=null;
  SHIPS.forEach(sh=>{
    if(!sh.cond || S.unlocked.includes(sh.id)) return;
    if(sh.cond()){ S.unlocked.push(sh.id); ouvert=sh; }
  });
  if(ouvert){
    toast('🛠️ VAISSEAU DÉBLOQUÉ • '+ouvert.name, 4000);
    Audio2.jouerSfx('levelup'); haptique('victoire'); save();
  }
}
/* Signature visuelle du tir, un jeu par vaisseau (meme index que SHIPS) */
const TIRS = [
  {forme:'trait',   c:'#14F195', l:4.5, h:16, glow:11},   /* 0 Seeker One — vert Solana */
  {forme:'double',  c:'#a78bfa', l:2.2, h:15, glow:12},   /* 1 Phantom    — violet double */
  {forme:'comete',  c:'#fb923c', l:4,   h:14, glow:14},   /* 2 Comet      — orange a queue */
  {forme:'losange', c:'#67e8f9', l:5,   h:18, glow:13},   /* 3 Nebula     — cristal cyan */
  {forme:'eclair',  c:'#fbbf24', l:5.2, h:26, glow:16},   /* 4 King       — lance doree */
  {forme:'orbe',    c:'#e2e8f0', l:5,   h:12, glow:18},   /* 5 Ghost      — orbe spectral */
  {forme:'triple',  c:'#38bdf8', l:3,   h:14, glow:12},   /* 6 Warden     — salve de trois */
  {forme:'fleche',  c:'#f472b6', l:6,   h:16, glow:13},   /* 7 Raptor     — chevron rose */
  {forme:'onde',    c:'#c084fc', l:6,   h:6,  glow:15},   /* 8 Specter    — anneau violet */
  {forme:'givre',   c:'#bae6fd', l:5,   h:15, glow:16},   /* 9 Wraith     — eclat de givre */
  {forme:'sceau',   c:'#fde68a', l:5,   h:20, glow:17},   /* 10 Sovereign — sceau dore */
  {forme:'flamme',  c:'#fb7185', l:5,   h:18, glow:20},   /* 11 Inferno   — trainee de feu */
  {forme:'triple',  c:'#4ade80', l:3,   h:15, glow:13},   /* 12 Sentinel  — salve verte */
  {forme:'fleche',  c:'#dc2626', l:6,   h:17, glow:15}    /* 13 Revenant  — chevron sanglant */
];
const MUNITIONS = [
  {id:'std', name:'Standard', desc:'Équilibré', dmg:1, rate:1, spread:0},
  {id:'perf', name:'Perforantes', desc:'Hauts dégâts', dmg:1.55, rate:0.7, spread:0},
  {id:'spread', name:'Spread', desc:'Tir large', dmg:0.92, rate:0.88, spread:2},
  {id:'hyper', name:'Hyper Rapid', desc:'Cadence extrême', dmg:0.65, rate:1.7, spread:0},
];
const MODES = [
  {id:'facile', name:'Facile', lives:7, spawn:1.7, hp:0.6, speed:0.75, reward:0.85, color:'#86efac'},
  {id:'explo', name:'Explorateur', lives:6, spawn:1.4, hp:0.78, speed:0.88, reward:1.0, color:'#67e8f9'},
  {id:'pilote', name:'Pilote', lives:5, spawn:1.2, hp:0.9, speed:1.0, reward:1.2, color:'#c4b5fd'},
  {id:'chasseur', name:'Chasseur', lives:3, spawn:0.85, hp:1.2, speed:1.15, reward:1.7, color:'#fca5a5'},
];
const BONUSES = [
  {id:'mitra', name:'Mitrailleuse',      desc:'Cadence extrême 18s',      chargesKey:'mitra', slot:'pwMinigun', emoji:'🔫'},
  {id:'nuke',  name:'Bombe Nucléaire',   desc:'Détruit tout à l’écran',   chargesKey:'nuke',  slot:'pwNuke',    emoji:'☢️'},
  {id:'ghost', name:'Fantôme',           desc:'Vaisseau allié 22s',       chargesKey:'ghost', slot:'pwGhost',   emoji:'👻'},
];
const NODES = [
  /* ---- BOUCLE 1 : GENESIS (decouverte) ---- */
  {id:0, title:'QG Seeker',         brief:'Le QG te donne tes ordres.',                                   type:'start',  boucle:1, next:[1]},
  {id:1, title:'\u00c9veil',            brief:'Premiers pas. Apprends \u00e0 te d\u00e9placer et \u00e0 tirer.',        type:'combat', boucle:1, next:[2]},
  {id:2, title:'Champ d\u2019ast\u00e9ro\u00efdes', brief:'Esquive et tir. Les d\u00e9bris ne pardonnent pas.',      type:'combat', boucle:1, next:[3]},
  {id:3, title:'P\u00e9rils',            brief:'Snipers en approche. Apprends \u00e0 couper les lignes de tir.', type:'combat', boucle:1, next:[4]},
  {id:4, title:'Vortex',            brief:'Premi\u00e8re spirale. Le Vortex t\u2019attend.',                    type:'boss',   boucle:1, next:[5]},
  /* ---- BOUCLE 2 : APOCRYPHA (maitrise) ---- */
  {id:5, title:'N\u00e9buleuse',         brief:'Visibilit\u00e9 r\u00e9duite. Fie-toi \u00e0 tes r\u00e9flexes.',            type:'combat', boucle:2, next:[6], meca:'brouillard'},
  {id:6, title:'Station Sigma',     brief:'Couloirs \u00e9troits, unit\u00e9s lourdes.',                        type:'elite',  boucle:2, next:[7]},
  {id:7, title:'Corruption',        brief:'Le signal inverse tes commandes. Tiens bon.',                type:'boss',   boucle:2, next:[8], meca:'inversion'},
  {id:8, title:'QG Terre',          brief:'Point de repos. R\u00e9approvisionnement complet.',              type:'hub',    boucle:2, next:[9,10]},
  /* ---- BOUCLE 3 : TRANSCENDANCE (expert) ---- */
  {id:9, title:'D\u00e9bris Oubli\u00e9s',   brief:'Gravit\u00e9 z\u00e9ro. Ton inertie devient ton ennemie.',        type:'secret', boucle:3, next:[10], meca:'zeroG'},
  {id:10,title:'Redressement',      brief:'Tout ce que tu as appris, en simultan\u00e9.',                  type:'combat', boucle:3, next:[11]},
  {id:11,title:'Point de rupture',  brief:'Marathon. Aucun r\u00e9pit, aucune seconde chance.',             type:'combat', boucle:3, next:[12], meca:'marathon'},
  {id:12,title:'Nexus',             brief:'La fusion. Toutes les m\u00e9caniques, un seul adversaire.',     type:'final',  boucle:3, next:[13]},
  /* ---- CARTE 2 : CHAOS PROTOCOL (debloquee apres le Nexus) ---- */
  {id:13,title:'Br\u00e8che',         brief:'Le Nexus est tomb\u00e9. Quelque chose s\u2019est ouvert derri\u00e8re lui.', type:'combat',   boucle:4, carte:2, next:[14]},
  {id:14,title:'Comptoir',       brief:'Un marchand a surv\u00e9cu ici. Ses prix s\u2019en ressentent.',         type:'marchand', boucle:4, carte:2, next:[15]},
  {id:15,title:'Meute d\u2019\u00c9lite',brief:'Aucun rebut. Que des unit\u00e9s d\u2019\u00e9lite.',                    type:'elite',    boucle:4, carte:2, next:[16], meca:'marathon'},
  {id:16,title:'Fracture',       brief:'Une premi\u00e8re anomalie prend forme.',                       type:'boss',     boucle:4, carte:2, next:[17]},
  {id:17,title:'Havre',          brief:'Une poche de calme. Profites-en, il n\u2019y en aura plus.',       type:'repos',    boucle:4, carte:2, next:[18]},
  {id:18,title:'Signal Inconnu', brief:'Une \u00e9mission non r\u00e9pertori\u00e9e. Impossible de savoir ce qu\u2019elle cache.', type:'mystere', boucle:4, carte:2, next:[19]},
  {id:19,title:'Coffre Genesis', brief:'Une r\u00e9serve intacte. Bien gard\u00e9e.',                        type:'tresor',   boucle:4, carte:2, next:[20], meca:'zeroG'},
  {id:20,title:'Portail',        brief:'Le Gardien veille sur le passage. Personne ne franchit sans payer.', type:'portail',  boucle:4, carte:2, next:[21], meca:'inversion'},
  {id:21,title:'NEXUS PRIME',    brief:'La forme originelle. Celle que le Nexus imitait.',          type:'final',    boucle:4, carte:2, next:[]}
];
/* Les 3 boucles de progression */
/* ============================================================
   DEBLOCAGE DES BOUCLES — la campagne s'ouvre par paliers
   ============================================================ */
const CONDITIONS_BOUCLE = {
  2:{ noeud:4,  texte:'Terrasse le VORTEX (n\u0153ud 4)' },
  3:{ noeud:7,  texte:'Terrasse la CORRUPTION (n\u0153ud 7)' },
  4:{ noeud:12, texte:'Terrasse le NEXUS (n\u0153ud 12)' }
};
function boucleDebloquee(num){
  if(num<=1) return true;
  const c=CONDITIONS_BOUCLE[num]; if(!c) return true;
  return S.completedNodes.includes(c.noeud);
}
function noeudAccessible(n){
  if(!boucleDebloquee(n.boucle||1)) return false;
  if(noeudVerrouille(n.id) && !S.completedNodes.includes(n.id)) return false;   /* il faut la cle */
  return n.id===0 || S.completedNodes.includes(n.id) ||
         S.completedNodes.some(c=>NODES.find(x=>x.id===c)?.next?.includes(n.id));
}
/* Annonce le passage a la boucle suivante */
function verifierDeblocage(){
  for(const num of [2,3,4]){
    const cle='boucle'+num;
    if(boucleDebloquee(num) && !(S.bouclesVues||[]).includes(cle)){
      S.bouclesVues=(S.bouclesVues||[]).concat(cle);
      const b=BOUCLES[num];
      setTimeout(()=>toast('\ud83d\udd13 BOUCLE '+num+' \u2014 '+b.nom+' d\u00e9bloqu\u00e9e',4000), 900);
      save();
    }
  }
}

/* ============================================================
   LORE — Genesis Protocol
   Une transmission avant chaque secteur, une apres les boss.
   ============================================================ */
const LORE_INTRO = [
  "An 2140. Le r\u00e9seau Genesis relie chaque monde habit\u00e9.",
  "Il g\u00e8re l'\u00e9nergie, la m\u00e9moire, les \u00e9changes. Tout passe par lui.",
  "Puis les Chaos Nodes sont apparus. Des fragments de code devenus mati\u00e8re,",
  "qui d\u00e9vorent les secteurs un par un et recrachent des machines hostiles.",
  "Les flottes ont \u00e9chou\u00e9. Les IA ont capitul\u00e9.",
  "Il reste le Seed Vault \u2014 et un pilote assez fou pour y brancher son vaisseau.",
  "Tu es un Seeker. Ta mission : remonter la cha\u00eene jusqu'au Nexus.",
  "Ce que tu trouveras l\u00e0-bas n'a jamais \u00e9t\u00e9 con\u00e7u pour \u00eatre vu."
];

const TRANSMISSIONS = {
  1:{ de:'QG SEEKER', txt:"Signal capt\u00e9 en p\u00e9riph\u00e9rie. Faible, r\u00e9p\u00e9titif, artificiel.\nOn t'envoie voir. Reviens entier, pilote." },
  2:{ de:'QG SEEKER', txt:"Le champ d'ast\u00e9ro\u00efdes n'\u00e9tait pas l\u00e0 le mois dernier.\nQuelque chose a d\u00e9plac\u00e9 une ceinture enti\u00e8re. Reste mobile." },
  3:{ de:'ANALYSTE VEGA', txt:"Leurs snipers apprennent. Ils anticipent nos trajectoires.\nCe ne sont plus des drones : ce sont des \u00e9l\u00e8ves." },
  4:{ de:'ALERTE', txt:"\u26a0 Masse anormale d\u00e9tect\u00e9e. Rotation constante, PV hors \u00e9chelle.\nLe VORTEX est le premier vrai n\u0153ud. Il ne bluffe pas." },
  5:{ de:'ANALYSTE VEGA', txt:"La n\u00e9buleuse brouille tes capteurs autant que les leurs.\nTu ne verras rien venir. Eux non plus \u2014 utilise \u00e7a." },
  6:{ de:'QG SEEKER', txt:"Station Sigma \u00e9tait \u00e0 nous. Ses tourelles aussi.\nElles r\u00e9pondent d\u00e9sormais \u00e0 une autre voix." },
  7:{ de:'ALERTE', txt:"\u26a0 Le signal s'infiltre dans ton syst\u00e8me de vol.\nTes commandes vont s'inverser. Ce n'est pas une panne : c'est lui." },
  8:{ de:'QG SEEKER', txt:"Tu as travers\u00e9 la Corruption. Personne d'autre n'y \u00e9tait parvenu.\nRepose-toi ici. Le vrai gouffre commence apr\u00e8s." },
  9:{ de:'ANALYSTE VEGA', txt:"Gravit\u00e9 nulle. Ton vaisseau gardera son \u00e9lan, toujours.\nCe champ de d\u00e9bris est un cimeti\u00e8re de Seekers. Ne deviens pas le suivant." },
  10:{ de:'QG SEEKER', txt:"Ils ont copi\u00e9 nos tactiques et nous les renvoient toutes en m\u00eame temps.\nTout ce que tu as appris, maintenant, d'un seul bloc." },
  11:{ de:'ALERTE', txt:"\u26a0 Aucun r\u00e9pit pr\u00e9vu au-del\u00e0 de ce point.\nLe flux ne s'arr\u00eatera pas. Toi non plus." },
  19:{ de:'QG SEEKER', txt:"Une r\u00e9serve Genesis intacte, en pleine zone morte.\nQuelqu'un la garde. Prends ce que tu peux." },
  20:{ de:'ALERTE', txt:"\u26a0 Portail instable. Il te m\u00e8nera droit \u00e0 la fin \u2014 sans aucun r\u00e9pit.\nTes commandes vont l\u00e2cher en chemin." },
  21:{ de:'NEXUS PRIME', txt:"TU AS D\u00c9TRUIT MON REFLET.\nMAINTENANT TU ME VOIS.\nJE SUIS CE QU'IL VOULAIT DEVENIR." },
  13:{ de:'ANALYSTE VEGA', txt:"Le Nexus n'\u00e9tait pas l'origine. Il copiait quelque chose.\nUne br\u00e8che s'est ouverte l\u00e0 o\u00f9 il est tomb\u00e9." },
  14:{ de:'ALERTE', txt:"\u26a0 Densit\u00e9 hostile hors normes. Aucun r\u00e9pit pr\u00e9vu.\nReste en mouvement, toujours." },
  15:{ de:'QG SEEKER', txt:"Une anomalie prend forme. Elle n'a pas de nom dans nos archives.\nOn l'appelle FRACTURE, faute de mieux." },
  16:{ de:'ANALYSTE VEGA', txt:"Ni gravit\u00e9, ni visibilit\u00e9. Tes instruments ne servent plus \u00e0 rien.\nIl te reste tes r\u00e9flexes." },
  17:{ de:'ALERTE', txt:"\u26a0 Il a appris ta fa\u00e7on de voler. Il retourne tes commandes contre toi.\nCe n'est plus une machine : c'est un miroir." },
  12:{ de:'NEXUS', txt:"TU AS SUIVI MA TRACE JUSQU'ICI.\nJE T'AI LAISS\u00c9 FAIRE. J'AVAIS BESOIN D'UN PILOTE.\nMONTRE-MOI CE QUE TU AS APPRIS." }
};
const EPILOGUES = {
  4:"Le Vortex s'effondre sur lui-m\u00eame. Dans le silence qui suit, un second signal r\u00e9pond \u2014 plus profond, plus lent.",
  7:"La Corruption se tait. Tes commandes redeviennent tiennes. Mais quelque chose, quelque part, a not\u00e9 ta fa\u00e7on de voler.",
  16:"La Fracture se referme. Le silence revient, plus lourd qu'avant.",
  21:"NEXUS PRIME s'effondre. Le r\u00e9seau redevient silencieux \u2014 vraiment silencieux, cette fois.\nAucun signal ne r\u00e9pond. Tu es le dernier Seeker debout.",
  12:"Le Nexus se disperse en poussi\u00e8re de donn\u00e9es. Genesis respire enfin.\nQuelque part dans le r\u00e9seau, une ligne de code se recompose doucement."
};

/* Affiche une transmission plein \u00e9cran, effet machine \u00e0 \u00e9crire */
let _transmissionEnCours=false;
/* Illustration associee a chaque voix : le lore prend corps */
const PORTRAITS = {
  'QG SEEKER':'bossFortress', 'ANALYSTE VEGA':'vortexCrystal', 'ALERTE':'icoWarning',
  'NEXUS':'nexusIdle', 'GENESIS':'vortexFractal', 'ARCHIVES GENESIS':'vortexRock'
};
function afficherTransmission(de, texte, apres, couleur){
  if(_transmissionEnCours){ if(apres) apres(); return; }
  _transmissionEnCours=true;
  const ov=document.createElement('div');
  ov.id='transmission';
  ov.style.cssText='position:fixed;inset:0;z-index:480;background:rgba(3,3,10,.94);display:flex;'+
    'align-items:center;justify-content:center;padding:26px;cursor:pointer';
  const pSlot=PORTRAITS[de], pImg=pSlot?ASSETS[pSlot]:null;
  const portrait = pImg
    ? '<div style="display:flex;justify-content:center;margin-bottom:16px">'+
      '<div style="width:96px;height:96px;border-radius:50%;overflow:hidden;'+
      'border:2px solid '+(couleur||'#14F195')+'55;box-shadow:0 0 26px '+(couleur||'#14F195')+'40;'+
      'display:flex;align-items:center;justify-content:center;background:rgba(10,8,20,.7)">'+
      '<img src="'+pImg.src+'" style="width:88px;height:88px;object-fit:contain"/></div></div>'
    : '';
  ov.innerHTML='<div style="max-width:340px;width:100%">'+
    portrait+
    '<div style="font-family:Orbitron,sans-serif;font-size:10px;letter-spacing:3px;color:'+(couleur||'#14F195')+';margin-bottom:10px">'+
    '\u25b8 '+T('TRANSMISSION')+' \u2014 '+de+'</div>'+
    '<div id="tr-txt" style="font-size:13px;line-height:1.75;color:#d6d3e0;white-space:pre-line;min-height:96px"></div>'+
    '<div style="margin-top:18px;font-size:10px;color:#6b7280;letter-spacing:2px">'+T('APPUYER POUR CONTINUER')+'</div></div>';
  document.body.appendChild(ov);
  const cible=document.getElementById('tr-txt');
  let i=0;
  const timer=setInterval(()=>{
    cible.textContent=texte.slice(0,++i);
    if(i%3===0 && S.prefs && S.prefs.son) beep(680+Math.random()*90,0.012,'square',0.012);
    if(i>=texte.length) clearInterval(timer);
  }, 22);
  const fermer=()=>{
    clearInterval(timer);
    if(cible.textContent.length<texte.length){ cible.textContent=texte; return; }  /* 1er tap : tout afficher */
    ov.remove(); _transmissionEnCours=false; if(apres) apres();
  };
  ov.onclick=fermer;
}

const BOUCLES = {
  1:{nom:'GENESIS',       couleur:'#67e8f9'},
  2:{nom:'APOCRYPHA',     couleur:'#c4b5fd'},
  3:{nom:'TRANSCENDANCE', couleur:'#f87171'},
  4:{nom:'CHAOS PROTOCOL', couleur:'#f472b6'}
};

let S = {
  connected:false, address:'',
  rpcPerso:'',                  /* endpoint devnet choisi par le joueur (voir renderRpc) */
  sol:0, skr:900, soldeSkr:0,   /* sol/soldeSkr = soldes du wallet, jamais donnes par le jeu */
  weapon:1, fireRate:1.0, maxLives:3,
  ship:0, unlocked:[0,1],
  unlockedMun:['std','spread'],
  charges:{ mitra:2, nuke:1, ghost:1 },
  streak:0, lastClaim:null, txCount:0, walletReel:false, addressComplete:'', walletType:'', walletId:'',
  infiniRecord:0, infiniVague:0,
  totalKills:0, highScore:0,
  completedNodes:[0], currentNode:1,
  ghostUnlocked:false, logoTaps:0, secretBossKilled:false,
  comboMax:0, sansBonus:0, sansDegat:0, secrets:[], dev:false, contratsRemplis:[], cles:{},
  nodeStars:{}, bouclesVues:[], carteActive:1, trVues:[], epVues:[], loreVu:false, records:[], jeuTermine:false, arenaRecords:{}, quetesReclamees:[], bonusVies:0, aimant:false, consommables:{}, txOnChain:0, signatures:[], lotsTask:0, taskRecompensee:false, txTotal:0, debloquesTx:[], indicatif:'', trainee:'', donsSol:0, donsSkr:0, terminal:false, blueprint:false, termOuvert:false,
  prefs:{ son:true, musique:true, vibration:true, particules:'normal', langue:null }
};
let loadout = { mode:'pilote', ship:0, munition:'std', bonus:null, difficulte:'normal' };
let G = null;
let audioCtx = null;
let musicInterval = null;

const DEFAULT_PREFS={ son:true, musique:true, vibration:true, particules:'normal' };
const PART_MULT={ faible:1/3, normal:1, eleve:1.5 };
/* Pose les icones des boutons. Rappelee a chaque lot d'images charge :
   un bouton dessine trop tot gardait son emoji de secours. */
function poserIcones(){
    const m={'ico-lancer':['ship0','🚀'],'ico-carte':['uiMap','🗺️'],
             'ico-defi':['uiArena','⚔️'],'ico-coop':['ship1','🤖'],'ico-records':['uiVictoire','🏆'],'ico-arena':['uiArena','⚔️'],'ico-shop':['uiShop','🛒'],
             'ico-quetes':['uiQuests','📋'],'ico-regles':['uiRules','📜'],
             'ico-ships':['ship1','🛸'],'ico-best':['uiRules','📖'],'ico-streak':['uiStreak','🔥']};
    for(const id in m){ const el=document.getElementById(id); if(el) el.innerHTML=ico(m[id][0],m[id][1],19); }
    /* Logo Seeker Nexus dans la pastille de l'accueil. C'est aussi le
       declencheur du secret GHOST : sept appuis. */
    const pastille=document.getElementById('logo');
    if(pastille){
      const l=ASSETS.logoNexus;
      pastille.innerHTML = l
        ? '<img src="'+l.src+'" alt="Seeker Nexus" style="width:100%;height:100%;object-fit:contain"/>'
        : 'S';
      if(l) pastille.style.background='transparent';
    }
    /* Son et Musique apparaissent dans Reglages et dans la pause */
    document.querySelectorAll('.ico-son').forEach(e=>e.innerHTML=ico('uiSon','🔊',17));
    document.querySelectorAll('.ico-musique').forEach(e=>e.innerHTML=ico('uiMusique','🎵',17));
}

function demarrer(){
  armerDemo(); creerPoussiere();
  setTimeout(poserIcones, 900);
}
function load(){
  const defauts={...S};                      /* etat de reference avant fusion */
  try{
    const r=localStorage.getItem('ss_v35');
    if(r){ const lu=JSON.parse(r); if(lu && typeof lu==='object' && !Array.isArray(lu)) S={...S,...lu}; }
  }catch(e){ LOG.warn('[SAVE] sauvegarde illisible, retour aux valeurs par defaut'); }

  /* --- Normalisation : une save trafiquee ou d'une vieille version ne doit
         jamais laisser un champ dans le mauvais type, sinon le jeu plante
         au premier .push() ou .includes(). --- */
  const tableaux=['unlocked','completedNodes','bouclesVues','trVues','epVues','records','secrets','contratsRemplis','debloquesTx',
                  'quetesReclamees','signatures'];
  tableaux.forEach(k=>{ if(!Array.isArray(S[k])) S[k]=Array.isArray(defauts[k])?[...defauts[k]]:[]; });
  const objets=['charges','nodeStars','arenaRecords','consommables'];
  objets.forEach(k=>{ if(!S[k] || typeof S[k]!=='object' || Array.isArray(S[k]))
                        S[k]=(defauts[k] && typeof defauts[k]==='object')?{...defauts[k]}:{}; });
  const nombres=['skr','sol','ship','currentNode','streak','txCount','txOnChain','lotsTask','txTotal','donsSol','donsSkr','highScore',
                 'totalKills','comboMax','sansBonus','sansDegat','bonusVies','carteActive'];
  nombres.forEach(k=>{ const v=Number(S[k]); S[k]=Number.isFinite(v)?v:(Number(defauts[k])||0); });
  ['skr','sol','streak','txCount','txOnChain','txTotal','donsSol','donsSkr','totalKills'].forEach(k=>{ if(S[k]<0) S[k]=0; });
  delete S.txSimu;                    /* vestige du mode simulation, supprime */
  /* Endpoint personnel : une save trafiquee ne doit pas injecter n'importe
     quoi dans le pool. On n'accepte qu'une URL https. */
  if(typeof S.rpcPerso!=='string' || !/^https:\/\/[^\s]+$/i.test(S.rpcPerso)) S.rpcPerso='';
  reconstruirePool();
  ['mitra','nuke','ghost'].forEach(k=>{ const v=Number(S.charges[k]); S.charges[k]=Number.isFinite(v)&&v>0?Math.floor(v):0; });

  /* Compat anciennes saves : les prefs absentes reprennent la valeur par defaut */
  S.prefs=(S.prefs && typeof S.prefs==='object' && !Array.isArray(S.prefs)) ? S.prefs : {};
  S.prefs={...DEFAULT_PREFS, ...S.prefs};
  if(S.prefs.volMusique!==undefined) Audio2.volMusique=S.prefs.volMusique;
  if(S.prefs.volSfx!==undefined)     Audio2.volSfx=S.prefs.volSfx;
  if(S.ghostUnlocked&&!S.unlocked.includes(5)) S.unlocked.push(5);
  /* Reparation des sauvegardes ecrites avant le correctif : la demo y avait
     laisse des vaisseaux jamais achetes. On ne garde que ce qui est
     legitimement acquis — offert au depart, paye, ou merite. */
  if(!S.demoNettoyee){
    S.demoNettoyee=true;
    const legitimes = SHIPS.filter(sh=>{
      if(!sh.sol && !sh.skr && !sh.cond) return true;         /* offerts */
      if(sh.cond) return true;                                 /* verifies plus bas */
      return false;
    }).map(sh=>sh.id);
    const avant=(S.unlocked||[]).length;
    S.unlocked=(S.unlocked||[]).filter(id=>{
      if(legitimes.includes(id)) return true;
      const sh=SHIPS.find(x=>x.id===id);
      if(!sh) return false;
      /* Un vaisseau payant n'est garde que si une transaction l'atteste. */
      return (S.signatures||[]).some(x=>String(x.action)==='ship:'+id);
    });
    if(!S.unlocked.includes(0)) S.unlocked.unshift(0);
    if(S.unlocked.length<avant) LOG.log('[SEEKER] sauvegarde nettoyee : '+(avant-S.unlocked.length)+' vaisseau(x) laisse(s) par la demo');
  }

  /* Le vaisseau de depart est toujours disponible, et on ne pilote que
     ce qu'on possede : sans ca, une save modifiee donne acces a tout. */
  if(!S.unlocked.includes(0)) S.unlocked.unshift(0);
  S.unlocked=S.unlocked.filter(id=>SHIPS.some(s=>s.id===id));
  if(!S.unlocked.includes(S.ship)) S.ship=S.unlocked[0];
  loadout.ship=S.ship;
  if(!NODES.some(x=>x.id===S.currentNode)) S.currentNode=1;
  delete S.carte;                         /* vestige du selecteur de variantes */
  S.carteActive = (S.carteActive===2) ? 2 : 1;
  LANGUE=langueInitiale();
  if(!S.prefs.langue){ S.prefs.langue=LANGUE; }
  checkStreak(); ui(); renderSettings(); poserFinsDePage(); demarrer(); armerVeille();
  traduirePage();
}
function save(){
  /* La demo debloque des vaisseaux et parcourt des secteurs avances pour
     sa vitrine. Rien de tout cela ne doit atteindre le disque : on bloque
     l'ecriture a la source plutot que de nettoyer apres coup. */
  if(typeof _demoActive!=='undefined' && _demoActive) return;
  localStorage.setItem('ss_v35', JSON.stringify(S));
}

function beep(f=440,d=0.08,t='square',v=0.07){ if(!S.prefs||!S.prefs.son) return; try{ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); const o=audioCtx.createOscillator(),g=audioCtx.createGain(); o.type=t;o.frequency.value=f;g.gain.value=v; o.connect(g);g.connect(audioCtx.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d); o.stop(audioCtx.currentTime+d); }catch(e){} }
const SFX_FICHIER={shot:'shoot',hit:null,kill:'enemy_die',power:'pickup',hurt:'hit',nuke:'boss_die'};
function sfx(n){
  if(!S.prefs||!S.prefs.son) return;
  const f=SFX_FICHIER[n];
  if(f && Audio2.jouerSfx(f)) return;      /* fichier ou synthese riche */
  synth(n);                                 /* repli minimal */
}
function synth(n){ if(n==='shot') beep(820+Math.random()*80,0.035,'square',0.035); if(n==='hit') beep(180,0.05,'sawtooth',0.06); if(n==='kill'){beep(480,0.06,'square',0.05);setTimeout(()=>beep(720,0.08,'square',0.04),35);} if(n==='power'){beep(360,0.1,'sine',0.07);setTimeout(()=>beep(540,0.12,'sine',0.06),60);} if(n==='hurt') beep(110,0.14,'sawtooth',0.09); if(n==='nuke'){beep(60,0.25,'sawtooth',0.12);setTimeout(()=>beep(40,0.35,'sawtooth',0.1),80);} }
function startMusic(){
  stopMusic();
  if(!S.prefs||!S.prefs.son||!S.prefs.musique) return;
  /* Quatre combinaisons : combat ou boss, GENESIS ou CHAOS */
  const chaos = S.currentNode>=13;
  const boss  = !!BOSS_DEFS[S.currentNode];
  Audio2.jouerMusique(boss ? (chaos?'bossChaos':'boss') : (chaos?'combatChaos':'combat'));
  verrouillerPortrait();
  setTimeout(majOrientation,60);   /* si on lance une partie deja en paysage */
  if(Audio2.musiqueEnCours) return; if(!audioCtx) try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;} let step=0; musicInterval=setInterval(()=>{ if(!G||!G.running) return; const base=110; if(step%8===0) beep(base,0.3,'sine',0.025); if(step%8===4) beep(base*1.5,0.25,'sine',0.02); step++; },280); }
function stopMusic(){ if(musicInterval) clearInterval(musicInterval); musicInterval=null; Audio2.stopMusique(); }

function show(id){
  document.querySelectorAll('.screen').forEach(e=>e.classList.remove('active'));
  document.getElementById('s-'+id).classList.add('active');
  document.getElementById('main-nav').classList.toggle('hide', id==='solo');
  document.querySelectorAll('.nav-i').forEach(n=>n.classList.toggle('active', n.dataset.s===id));
  if(id==='map'){ appliquerCarte(); renderMap(); majBoutonCampagne(); Audio2.jouerMusique('carte');
    /* On ouvre la carte sur le QG, en bas du chemin */
    setTimeout(()=>{ const sc=document.getElementById('map-scroll'); if(sc) sc.scrollTop=sc.scrollHeight; },30);
  }
  if(id==='ships') renderShips();
  if(id==='shop') renderShop();
  if(id==='quests') renderQuests();
  if(id==='home'){ creerPoussiere();
    /* Palier 75 : la piste CHAOS remplace le theme du menu, une fois sur trois. */
    if(_splashParti) Audio2.jouerMusique(
      (debloque('transmission') && Math.random()<0.34) ? 'bossChaos' : 'menu'); }
  if(id==='multi') renderArena();
  if(id==='settings') renderSettings();
  if(id==='bestiaire') renderBestiaire();
  ui();
}
/* ============ ECRAN REGLAGES ============ */
function renderPanneauDev(){
  const box=document.getElementById('panneau-dev'); if(!box) return;
  if(!S.dev){ box.innerHTML=''; return; }
  box.innerHTML=
    '<div class="sect"><span>\ud83d\udee0\ufe0f '+T('MODE DÉVELOPPEUR')+'</span><i class="lig"></i></div>'+
    '<div style="border-radius:16px;border:1px solid rgba(251,191,36,.35);padding:15px;'+
      'background:linear-gradient(180deg,rgba(48,36,8,.5),rgba(24,18,6,.3))">'+
    '<div class="text-[10.5px] mb-3" style="color:#d6c99a;line-height:1.55">'+
      T('Raccourcis de démonstration. Aucun effet on-chain : seuls les crédits de jeu et la progression locale changent.')+'</div>'+
    '<button onclick="devToutDebloquer()" class="btn w-full py-2.5 rounded-xl text-[11.5px] font-bold mb-2">'+T('TOUT DÉBLOQUER')+'</button>'+
    '<div style="display:flex;gap:8px">'+
      '<button onclick="devCredits()" class="btn-dark flex-1 py-2 rounded-xl text-[11px] font-bold">+25 000 GC</button>'+
      '<button onclick="devVider()" class="btn-dark flex-1 py-2 rounded-xl text-[11px] font-bold">'+T('REMETTRE À ZÉRO')+'</button>'+
    '</div>'+
    '<button onclick="devQuitter()" class="w-full py-2 mt-2 rounded-xl text-[10.5px]" style="color:#8b8b9e;background:none;border:1px solid rgba(255,255,255,.1)">'+T('Quitter le mode développeur')+'</button>'+
    '</div>';
}
function majBoutonsLangue(){
  ['fr','en'].forEach(l=>{
    const b=document.getElementById('btn-lang-'+l); if(!b) return;
    const actif=(LANGUE===l);
    b.style.background = actif ? 'rgba(20,241,149,.18)' : '';
    b.style.borderColor = actif ? 'rgba(20,241,149,.6)' : '';
    b.style.color = actif ? '#14F195' : '#9ca3af';
  });
}
function renderSettings(){
  renderRpc();
  renderPanneauDev();
  renderPanneauPaliers();
  renderJournalTx();
  renderPanneauDons();
  majBoutonsLangue();
  if(!S.prefs) S.prefs={...DEFAULT_PREFS};
  [['son','tgl-son'],['musique','tgl-musique'],['vibration','tgl-vibration']].forEach(([k,id])=>{
    const el=document.getElementById(id); if(el) el.classList.toggle('on', !!S.prefs[k]);
  });
  const seg=document.getElementById('seg-particules');
  if(seg) seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b.dataset.v===S.prefs.particules));
}
function togglePref(cle){
  if(!S.prefs) S.prefs={...DEFAULT_PREFS};
  S.prefs[cle]=!S.prefs[cle];
  Audio2.majPreferences();
  if(cle==='son'||cle==='musique'){
    if(!S.prefs.son||!S.prefs.musique) stopMusic();
    else if(G&&G.running) startMusic();
  }
  if(cle==='vibration'&&S.prefs.vibration) vibrate(40);
  save(); renderSettings();
}
function setParticules(v){
  if(!S.prefs) S.prefs={...DEFAULT_PREFS};
  S.prefs.particules=v; save(); renderSettings();
}

/* --- Modal de confirmation generique --- */
let _confirmAction=null;
function showConfirm(titre,message,classeBouton,onConfirm){
  document.getElementById('cf-title').textContent=titre;
  document.getElementById('cf-msg').textContent=message;
  const ok=document.getElementById('cf-ok');
  ok.className=(classeBouton||'btn-danger')+' rounded-xl py-3 font-bold text-sm';
  _confirmAction=onConfirm;
  document.getElementById('modal-confirm').classList.add('show');
}
function closeConfirm(){
  document.getElementById('modal-confirm').classList.remove('show');
  _confirmAction=null;
}
function acceptConfirm(){
  const fn=_confirmAction; closeConfirm();
  if(typeof fn==='function') fn();
}

/* --- Niveau 1 : reset du run (achats conserves) --- */
function askResetRun(){
  showConfirm('R\u00e9initialiser le run ?',
    'R\u00e9initialiser ta progression du jour ? Tes achats et vaisseaux sont conserv\u00e9s.',
    'btn-warn', ()=>{
      /* On mesure avant/apres pour dire precisement ce qui a ete remis a zero */
      const avant={tx:S.txCount, streak:S.streak, daily:S.lastClaim?1:0};
      S.txCount=0; S.txOnChain=0; S.lotsTask=0; S.taskRecompensee=false; S.signatures=[];
      S.txTotal=0; S.debloquesTx=[]; S.indicatif=''; S.trainee='';
      S.terminal=false; S.blueprint=false; S.streak=0; S.lastClaim=null;
      S.charges={ mitra:2, nuke:1, ghost:1 };        /* recharges de bonus du jour */
      save(); ui(); renderSettings();
      const faits=[];
      if(avant.tx)     faits.push(avant.tx+' TX');
      if(avant.streak) faits.push('streak '+avant.streak);
      if(avant.daily)  faits.push('claim du jour');
      faits.push('charges de bonus recharg\u00e9es');
      toast('Run r\u00e9initialis\u00e9 \u2022 '+faits.join(', '), 3400);
      haptique('bouton');
    });
}
/* --- Niveau 2 : reset usine, double confirmation --- */
function askResetFactory(){
  showConfirm('Reset usine',
    'Tout sera effac\u00e9 : GC, vaisseaux, progression, \u00e9toiles. Continuer ?',
    'btn-danger', ()=>{
      setTimeout(()=>showConfirm('Derni\u00e8re chance',
        'Cette action est irr\u00e9versible.','btn-danger', ()=>{
          const prefs={...S.prefs};
          S={ connected:false, address:'', sol:0, skr:0,
              weapon:1, fireRate:1.0, maxLives:3, ship:0, unlocked:[0],
              unlockedMun:['std'], charges:{mitra:0,nuke:0,ghost:0},
              streak:0, lastClaim:null, txCount:0, txOnChain:0, soldeSkr:0,
              lotsTask:0, taskRecompensee:false, signatures:[], txTotal:0, debloquesTx:[], indicatif:'', trainee:'', donsSol:0, donsSkr:0, terminal:false, blueprint:false, termOuvert:false,
              totalKills:0, highScore:0,
              completedNodes:[0], currentNode:1,
              ghostUnlocked:false, logoTaps:0, secretBossKilled:false,
              comboMax:0, sansBonus:0, sansDegat:0, secrets:[],
              nodeStars:{}, prefs };
          localStorage.removeItem('ss35_first');
      localStorage.removeItem('ss_langue_choisie');   /* on redemandera la langue */
          save(); show('home'); ui(); renderSettings();
          toast('Reset usine effectu\u00e9 \u2022 GC, vaisseaux, campagne et \u00e9toiles effac\u00e9s',3600);
          haptique('defaite');
        }), 180);
    });
}
/* --- Niveau 3 : purge complete du localStorage --- */
function askResetUsine(){ askResetFactory(); }   /* alias : nom utilise cote Noah */
function askResetCache(){
  showConfirm('Vider le cache',
    'Efface TOUTES les donn\u00e9es locales, y compris les pr\u00e9f\u00e9rences. La page va recharger.',
    'btn-dark', ()=>{
      try{ localStorage.clear(); }catch(e){ LOG.warn('localStorage inaccessible'); }
      toast('Cache vid\u00e9 \u2022 rechargement\u2026',1500);
      setTimeout(()=>{ try{ location.reload(); }catch(e){ location.href=location.href; } }, 700);
    });
}

/* Rend une icone si le sprite est charge, sinon l'emoji d'origine */
function ico(cle, emoji, taille){
  const img=ASSETS[cle];
  const t=taille||18;
  return img ? '<img src="'+img.src+'" style="width:'+t+'px;height:'+t+'px;object-fit:contain;vertical-align:-3px;display:inline-block">'
             : (emoji||'');
}
function toast(m,t=2400){ const el=document.getElementById('toast'); el.textContent=m; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),t); }
/* ============================================================
   REGLES — sections depliables, une seule ouverte a la fois
   ============================================================ */
const REGLES=[
 {p:'\ud83c\udf0c', t:"L'HISTOIRE", d:
  "An 2140. Le r\u00e9seau <b>Genesis</b> relie tous les mondes habit\u00e9s.<br><br>"+
  "Les <b>Chaos Nodes</b> \u2014 du code devenu mati\u00e8re \u2014 d\u00e9vorent les secteurs un par un. "+
  "Les flottes ont \u00e9chou\u00e9, les IA ont capitul\u00e9.<br><br>"+
  "Tu es un <b>Seeker</b>. Remonte la cha\u00eene jusqu'au Nexus."},
 {p:'\ud83d\udd79\ufe0f', t:'SE D\u00c9PLACER ET TIRER', d:
  "Glisse ton doigt n'importe o\u00f9 : le vaisseau suit dans les <b>8 directions</b>, "+
  "et reste toujours au-dessus de ton doigt.<br><br>"+
  "Au clavier : <b>ZQSD</b>, WASD ou les fl\u00e8ches. <b>\u00c9chap</b> ou <b>P</b> pour la pause.<br><br>"+
  "<b>Le tir est automatique.</b> Tout se joue au placement."},
 {p:'\ud83d\uddfa\ufe0f', t:'CAMPAGNE \u2014 13 SECTEURS', d:
  "Trois boucles de progression :<br><br>"+
  "<b style='color:#67e8f9'>GENESIS</b> (1\u20134) d\u00e9couverte<br>"+
  "<b style='color:#c4b5fd'>APOCRYPHA</b> (5\u20138) ma\u00eetrise<br>"+
  "<b style='color:#f87171'>TRANSCENDANCE</b> (9\u201312) expert<br><br>"+
  "Battre le <b>Vortex</b> ouvre la boucle 2, la <b>Corruption</b> ouvre la boucle 3."},
 {p:'\u2699\ufe0f', t:'M\u00c9CANIQUES SP\u00c9CIALES', d:
  "<b>N5 N\u00e9buleuse</b> \u2014 visibilit\u00e9 r\u00e9duite<br>"+
  "<b>N7 Corruption</b> \u2014 commandes invers\u00e9es<br>"+
  "<b>N8 QG Terre</b> \u2014 r\u00e9approvisionnement complet<br>"+
  "<b>N9 D\u00e9bris</b> \u2014 gravit\u00e9 z\u00e9ro, inertie<br>"+
  "<b>N11 Rupture</b> \u2014 flux continu, aucun r\u00e9pit<br>"+
  "<b>N12 Nexus</b> \u2014 boss \u00e0 3 phases"},
 {p:'\u2b50', t:'DIFFICULT\u00c9 ET \u00c9TOILES', d:
  "<b>Normal</b> \u2605 \u2014 r\u00e9f\u00e9rence<br>"+
  "<b>Difficile</b> \u2605\u2605 \u2014 PV \u00d71,45 \u2022 gains \u00d71,9<br>"+
  "<b>Extr\u00eame</b> \u2605\u2605\u2605 \u2014 PV \u00d72,1 \u2022 gains \u00d73,2<br><br>"+
  "Un secteur termin\u00e9 reste <b>rejouable</b> : seule ta meilleure \u00e9toile compte. "+
  "En difficult\u00e9 \u00e9lev\u00e9e, le d\u00e9cor change."},
 {p:'\ud83d\udc7e', t:'CONNA\u00ceTRE L\u2019ENNEMI', d:
  "<b>8 comportements</b> distincts, plus 5 variantes renforc\u00e9es.<br><br>"+
  "Le <b>porteur de bouclier</b> renvoie tes tirs de face : contourne-le. "+
  "Le <b>diviseur</b> se scinde en deux \u00e0 sa mort. "+
  "Le <b>t\u00e9l\u00e9porteur</b> r\u00e9appara\u00eet derri\u00e8re toi.<br><br>"+
  "Le <b>Bestiaire</b> d\u00e9taille chacun d'eux."},
 {p:'\u26a1', t:'\u00c9V\u00c9NEMENTS ET BUTIN', d:
  "Toutes les 3 \u00e0 4 vagues : pluie de m\u00e9t\u00e9ores, blackout, invasion lat\u00e9rale, "+
  "essaim, ou <b>chasse</b> (cible dor\u00e9e, 180 points).<br><br>"+
  "Les ennemis l\u00e2chent du butin : vies, bouclier, cadence, d\u00e9g\u00e2ts, "+
  "charges de bonus et cr\u00e9dits. Approche-toi, il vient \u00e0 toi."},
 {p:'\ud83d\udca5', t:'BONUS', d:
  "\ud83d\udd2b <b>Mitrailleuse</b> \u2014 cadence extr\u00eame 18 s<br>"+
  "\u2622\ufe0f <b>Bombe</b> \u2014 nettoie l'\u00e9cran<br>"+
  "\ud83d\udc7b <b>Fant\u00f4me</b> \u2014 escorte de 2 alli\u00e9s, 22 s<br><br>"+
  "Utilisables <b>en pleine partie</b>, autant de fois que tu as de charges."},
 {p:'\ud83c\udfae', t:'AUTRES MODES', d:
  "<b>\u267e\ufe0f Infini</b> \u2014 vagues sans fin, mini-boss tous les 5 tours.<br><br>"+
  "<b>\u2694\ufe0f Arena</b> \u2014 d\u00e9fi quotidien, le m\u00eame pour tous. Bonus de 50 % si tu tiens le temps.<br><br>"+
  "<b>\ud83e\udd16 Arena Coop</b> \u2014 un wingman IA combat \u00e0 tes c\u00f4t\u00e9s. Qui fera le plus de kills ?"},
 {p:'\ud83d\udcb0', t:'\u00c9CONOMIE', d:
  "<b>GC (Genesis Credits)</b> \u2014 la monnaie du jeu. Gagn\u00e9e <b>uniquement en jouant</b>. "+
  "Ne s'ach\u00e8te pas, n'existe pas sur la blockchain.<br><br>"+
  "Tu commences avec <b>900 GC</b> : de quoi t'\u00e9quiper d'un consommable d\u00e8s la premi\u00e8re partie. "+
  "Le GC paie la boutique, les munitions et les consommables \u2014 tout le gameplay.<br><br>"+
  "<b>SOL</b> et <b>SKR</b> \u2014 ce sont <b>tes</b> tokens. Le jeu ne t'en donne jamais et n'y touche "+
  "jamais sans ta signature. Ils servent uniquement \u00e0 acheter des vaisseaux, au choix, "+
  "\u00e0 raison d'environ <b>1 SOL = 25 000 SKR</b>. Six vaisseaux sont payants ; "+
  "cinq autres se m\u00e9ritent en jeu et ne co\u00fbtent rien.<br><br>"+
  "Le <b>SKR</b> est le token officiel de <b>Solana Mobile</b>. Le jeu n'en distribue pas : "+
  "il se gagne ou s'ach\u00e8te en dehors du jeu.<br><br>"+
  "<span style='color:#fbbf24'>Tout se joue sur le devnet \u2014 aucune valeur r\u00e9elle engag\u00e9e.</span>"},
 {p:'\u26d3\ufe0f', t:'SEEKER TASK', d:
  "<b>15 transactions on-chain</b> pour maximiser ton activit\u00e9 Solana, "+
  "en vue de l'airdrop <b>SKR de Solana Mobile</b>.<br><br>"+
  "Chaque claim quotidien, achat ou d\u00e9blocage envoie une transaction sign\u00e9e par ton wallet. "+
  "Le compteur affiche les transactions <b>r\u00e9ellement confirm\u00e9es</b>."}
];
function renderRegles(){
  const box=document.getElementById('regles-liste'); if(!box) return;
  box.innerHTML=REGLES.map((r,i)=>
    '<div class="regle" id="regle-'+i+'">'+
      '<button onclick="basculerRegle('+i+')" aria-expanded="false">'+
        '<span class="puce">'+r.p+'</span>'+
        '<span class="titre">'+T(r.t)+'</span>'+
        '<span class="chev">\u25b6</span>'+
      '</button>'+
      '<div class="corps"><div>'+T(r.d)+'</div></div>'+
    '</div>').join('');
}
function basculerRegle(i){
  const el=document.getElementById('regle-'+i); if(!el) return;
  const ouvert=el.classList.contains('ouvert');
  /* une seule section ouverte a la fois : la lecture reste courte */
  document.querySelectorAll('.regle').forEach(r=>{
    r.classList.remove('ouvert');
    const b=r.querySelector('button'); if(b) b.setAttribute('aria-expanded','false');
  });
  if(!ouvert){
    el.classList.add('ouvert');
    el.querySelector('button').setAttribute('aria-expanded','true');
    setTimeout(()=>el.scrollIntoView({block:'nearest',behavior:'smooth'}),120);
  }
  Audio2.jouerSfx('button_click');
}

function showRules(){ renderRegles(); document.getElementById('modal-rules').classList.add('show'); }
function closeRules(){ document.getElementById('modal-rules').classList.remove('show'); }
function vibrate(ms=28){ if(S.prefs&&S.prefs.vibration===false) return; if(navigator.vibrate) navigator.vibrate(ms); }

/* ============================================================
   AUDIO — 2 canaux (musique / SFX), chargement paresseux,
   repli sur la synthese WebAudio existante si le fichier manque.
   Depose tes fichiers dans assets/audio/ : le nom suffit.
   ============================================================ */
const PISTES_MUSIQUE = {
  menu:'menu_theme',            /* accueil, retour au hub, credits    */
  carte:'map_theme',            /* ecran de campagne                  */
  combat:'combat_theme',        /* secteurs GENESIS                   */
  combatChaos:'combat_chaos',   /* secteurs CHAOS PROTOCOL            */
  boss:'boss_theme',            /* boss GENESIS                       */
  bossChaos:'boss_chaos',       /* boss CHAOS PROTOCOL                */
  victoire:'victory_theme',     /* secteur securise                   */
  defaite:'defeat_theme'        /* mission perdue                     */
};
const PISTES_SFX = { shoot:'shoot', enemy_shoot:'enemy_shoot', hit:'hit', enemy_die:'enemy_die',
  boss_die:'boss_die', pickup:'pickup', levelup:'levelup', button_click:'button_click',
  wave_start:'wave_start', victory:'victory', defeat:'defeat' };
/* Effets sonores livres sous forme de fichier. Aucun a ce jour : ils sont
   tous produits par la synthese WebAudio. Les demander au serveur ne servait
   qu'a remplir la console de 404 avant de retomber sur la synthese.
   Pour en activer un, depose assets/audio/<nom>.mp3 et ajoute son nom ici. */
const SFX_FICHIERS = [];

/* Musiques embarquees (version legere 32 kbps). Si assets/audio/<nom>.mp3
   existe, la version haute qualite est utilisee a la place. */
/* Les musiques vivent dans assets/audio/ : 8 pistes de 84 s, mono 64 kbps.
   Les garder en base64 alourdissait le fichier de pres d'un mega pour trois
   pistes seulement. Le chargement est paresseux : une piste a la fois. */
const MUSIQUES_INLINE = {};

/* ============================================================
   SYNTHESE WEBAUDIO — 11 effets, aucun fichier requis.
   Utilisee quand le MP3 correspondant est absent.
   ============================================================ */
const Synthe = {
  ctx:null,
  init(){
    if(this.ctx) return this.ctx;
    try{
      this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      if(this.ctx.state==='suspended') this.ctx.resume();
    }catch(e){ LOG.warn('WebAudio indisponible'); }
    return this.ctx;
  },
  vol(){ return (Audio2 && Audio2.volSfx!==undefined) ? Audio2.volSfx : 0.65; },
  _osc(type,freq,t0,dur,v,freqFin){
    const c=this.ctx; if(!c) return;
    const o=c.createOscillator(), g=c.createGain(), t=c.currentTime+t0;
    o.type=type; o.frequency.setValueAtTime(freq,t);
    if(freqFin) o.frequency.exponentialRampToValueAtTime(Math.max(1,freqFin),t+dur);
    g.gain.setValueAtTime(Math.max(0.0001,v*this.vol()),t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur);
  },
  _bruit(t0,dur,v,filtre,q){
    const c=this.ctx; if(!c) return;
    const t=c.currentTime+t0, len=Math.max(1,Math.ceil(c.sampleRate*dur));
    const buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const src=c.createBufferSource(); src.buffer=buf;
    const f=c.createBiquadFilter(); f.type='lowpass';
    f.frequency.value=filtre||1000; f.Q.value=q||1;
    const g=c.createGain();
    g.gain.setValueAtTime(Math.max(0.0001,v*this.vol()),t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(f).connect(g).connect(c.destination); src.start(t);
  },
  jouer(nom){
    if(!S.prefs || !S.prefs.son) return false;
    if(!this.init()) return false;
    const f=this.effets[nom];
    if(!f) return false;
    try{ f.call(this); return true; }catch(e){ return false; }
  },
  effets:{
    shoot(){ this._osc('square',880,0,0.08,0.10,220); },
    enemy_shoot(){ this._osc('sawtooth',220,0,0.12,0.09,110); },
    hit(){ this._bruit(0,0.15,0.26,800,2); this._osc('sine',150,0,0.15,0.18,60); },
    enemy_die(){ this._bruit(0,0.32,0.28,1200,1); this._osc('sine',200,0,0.28,0.16,40); },
    boss_die(){ this._bruit(0,1.2,0.40,900,1); this._bruit(0.1,1.0,0.26,400,1);
                this._osc('sine',120,0,1.0,0.26,25); this._osc('sine',60,0.2,0.9,0.22,20); },
    pickup(){ this._osc('sine',660,0,0.08,0.15); this._osc('sine',990,0.08,0.12,0.15); },
    levelup(){ [523,659,784,1047].forEach((f,i)=>this._osc('triangle',f,i*0.09,0.15,0.17)); },
    button_click(){ this._osc('square',1200,0,0.04,0.08,800); },
    wave_start(){ this._osc('sawtooth',300,0,0.4,0.12,900); this._osc('sawtooth',302,0,0.4,0.08,905); },
    victory(){ [523,659,784,1047,1319].forEach((f,i)=>this._osc('triangle',f,i*0.11,0.22,0.19)); },
    defeat(){ [440,415,392,330].forEach((f,i)=>this._osc('sawtooth',f,i*0.25,0.35,0.15)); }
  }
};
/* Reveil du contexte audio au premier geste (obligatoire sur mobile) */
document.addEventListener('pointerdown', ()=>Synthe.init(), {once:true});
document.addEventListener('touchstart',  ()=>Synthe.init(), {once:true});
/* L'autoplay est bloque avant interaction : on relance la piste au premier geste */
['pointerdown','touchstart','keydown'].forEach(ev=>{
  document.addEventListener(ev, ()=>{
    if(Audio2.pisteActuelle && Audio2.musiqueEnCours && Audio2.musiqueEnCours.paused){
      const p=Audio2.musiqueEnCours.play(); if(p&&p.catch) p.catch(()=>{});
    } else if(!Audio2.pisteActuelle && S.prefs && S.prefs.musique){
      Audio2.jouerMusique('menu');
    }
  }, {once:true});
});
/* Retour sonore sur toute l'interface */
document.addEventListener('click', e=>{
  if(e.target && e.target.closest && e.target.closest('button,.btn,.node,.tgl,.seg button'))
    Audio2.jouerSfx('button_click');
}, true);

/* Change a chaque livraison : force le navigateur a relire les assets */
const VERSION_ASSETS='4.2.1';

const Audio2 = {
  base:'assets/audio/', ext:'.mp3',
  cache:{}, musiqueEnCours:null, pisteActuelle:null,
  volMusique:0.45, volSfx:0.65,   /* ajustables via S.prefs.volMusique / volSfx */ dispo:{},

  /* ---- Lecture par Web Audio, pour les pistes embarquees ----
     Un <audio src="data:audio/mpeg;base64,..."> de plusieurs centaines de
     kilo-octets est rejete par le WebView du Seeker. On decode le base64
     en memoire et on le joue par le graphe audio, sans cette limite. */
  ctxWA:null, tampons:{}, sourceWA:null, gainWA:null,

  contexteWA(){
    if(!this.ctxWA){
      try{ this.ctxWA = new (window.AudioContext||window.webkitAudioContext)(); }
      catch(e){ return null; }
    }
    if(this.ctxWA.state==='suspended') this.ctxWA.resume().catch(()=>{});
    return this.ctxWA;
  },

  /* data URI -> ArrayBuffer, sans passer par fetch (bloque en file://) */
  versOctets(uri){
    const b64=uri.split(',')[1]||'';
    const brut=atob(b64);
    const buf=new Uint8Array(brut.length);
    for(let i=0;i<brut.length;i++) buf[i]=brut.charCodeAt(i);
    return buf.buffer;
  },

  async jouerEmbarquee(nom){
    const ctx=this.contexteWA(); if(!ctx) return false;
    try{
      if(!this.tampons[nom]){
        const uri=MUSIQUES_INLINE[nom]; if(!uri) return false;
        this.tampons[nom]=await new Promise((ok,ko)=>
          ctx.decodeAudioData(this.versOctets(uri), ok, ko));
      }
      this.stopWA();
      const src=ctx.createBufferSource();
      src.buffer=this.tampons[nom]; src.loop=true;
      const g=ctx.createGain();
      g.gain.value=0;
      src.connect(g); g.connect(ctx.destination);
      src.start(0);
      this.sourceWA=src; this.gainWA=g;
      /* fondu d'entree, comme pour l'element audio */
      const cible=this.volMusique;
      let v=0; const pas=setInterval(()=>{
        v=Math.min(cible, v+cible/14);
        if(this.gainWA) this.gainWA.gain.value=v;
        if(v>=cible) clearInterval(pas);
      },45);
      LOG.log('[SEEKER] musique '+nom+' : lue par Web Audio');
      return true;
    }catch(e){
      LOG.warn('[SEEKER] decodage impossible pour '+nom+' : '+(e&&e.message));
      return false;
    }
  },

  stopWA(){
    if(this.sourceWA){ try{ this.sourceWA.stop(); }catch(e){} this.sourceWA=null; }
    this.gainWA=null;
  },

  /* Chargement paresseux : rien ne bloque le demarrage */
  charger(nom){
    if(this.cache[nom]!==undefined) return this.cache[nom];
    const a=new Audio();
    a.preload='auto';
    a.addEventListener('canplaythrough',()=>{ this.dispo[nom]=true; }, {once:true});
    /* Le fichier est plus fiable qu'un long data URI sur les WebView
       Android : on le tente d'abord, et l'embarque prend le relais si le
       fichier manque (build autonome, ouverture en file://). */
    const embarque = MUSIQUES_INLINE[nom];
    /* Rien a telecharger si la piste est deja en memoire : on evite le 404. */
    if(embarque){ this.dispo[nom]=true; this.cache[nom]=a; return a; }
    a.addEventListener('error', ()=>{
      this.dispo[nom]=false;
      /* Les effets sonores n'ont pas de version embarquee : ils basculent
         silencieusement sur la synthese WebAudio, ce n'est pas une anomalie. */
      if(embarque) LOG.log('[SEEKER] '+nom+' : passage en lecture memoire');
    }, {once:true});
    /* Le navigateur garde en cache un fichier absent ou d'une version
       precedente : sans marqueur de version, il fallait vider le cache a
       la main pour que les nouvelles pistes soient prises en compte. */
    a.src=this.base+nom+this.ext+'?v='+VERSION_ASSETS;
    if(embarque) this.dispo[nom]=true;
    this.cache[nom]=a;
    return a;
  },
  sonAutorise(){ return !!(S.prefs && S.prefs.son); },
  musiqueAutorisee(){ return !!(S.prefs && S.prefs.son && S.prefs.musique); },

  /* SFX : instance clonee pour permettre les sons superposes */
  jouerSfx(cle){
    if(!this.sonAutorise()) return false;
    const nom=PISTES_SFX[cle]; if(!nom) return false;
    /* 1) fichier MP3, uniquement s'il est reellement livre */
    if(SFX_FICHIERS.indexOf(nom)>=0 && this.dispo[nom]!==false){
      try{
        const src=this.charger(nom);
        const inst=src.cloneNode();
        inst.volume=this.volSfx;
        const p=inst.play();
        if(p&&p.catch) p.catch(()=>{ this.dispo[nom]=false; Synthe.jouer(cle); });
        return true;
      }catch(e){ this.dispo[nom]=false; }
    }
    /* 2) sinon synthese WebAudio */
    return Synthe.jouer(cle);
  },
  /* Musique : une seule piste a la fois, en boucle, fondu court */
  jouerMusique(cle){
    if(!this.musiqueAutorisee()) return this.stopMusique();
    /* Les navigateurs refusent tout son avant un geste de l'utilisateur.
       Insister remplissait la console de refus a chaque changement de piste. */
    if(!_gesteFait){ this.pisteEnAttente=cle; return; }
    const nom=PISTES_MUSIQUE[cle]; if(!nom) return;
    if(this.pisteActuelle===cle && (this.sourceWA || (this.musiqueEnCours && !this.musiqueEnCours.paused))) return;
    this.stopMusique();
    this.pisteActuelle=cle;
    LOG.log('[SEEKER] musique : '+cle);

    /* Piste embarquee dans le build : on la joue directement en memoire.
       Avant, on tentait d'abord le fichier externe — qui n'existe pas dans
       le build autonome : chaque musique produisait un 404 dans la console
       et un aller-retour reseau inutile avant de basculer. */
    if(MUSIQUES_INLINE[nom]){ this.jouerEmbarquee(nom); return; }
    try{
      const a=this.charger(nom);
      a.loop=true; a.volume=0; a.currentTime=0;
      const p=a.play();
      if(p&&p.catch) p.catch(()=>{
        /* lecture refusee : on tente le decodage memoire */
        this.dispo[nom]=false;
        if(MUSIQUES_INLINE[nom]) this.jouerEmbarquee(nom);
      });
      this.musiqueEnCours=a;
      let v=0; const cible=this.volMusique;
      const fondu=setInterval(()=>{ v=Math.min(cible,v+cible/14); a.volume=v;
        if(v>=cible) clearInterval(fondu); },40);
    }catch(e){
      if(MUSIQUES_INLINE[nom]) this.jouerEmbarquee(nom);
    }
  },
  stopMusique(){
    this.stopWA();
    const a=this.musiqueEnCours;
    if(a){ try{ a.pause(); a.currentTime=0; }catch(e){} }
    this.musiqueEnCours=null; this.pisteActuelle=null;
  },
  /* Appele quand l'utilisateur change une preference */
  majPreferences(){
    if(!this.musiqueAutorisee()) this.stopMusique();
    else if(this.pisteActuelle) this.jouerMusique(this.pisteActuelle);
  }
};

/* ============================================================
   HAPTIQUE — un motif distinct par evenement
   ============================================================ */
const MOTIFS = {
  tir:[7], degat:[28,36,28], explosion:[55,28,85],
  victoire:[40,55,40,55,120], defaite:[130,70,130], bouton:[10], boss:[90,50,90,50,140]
};
function haptique(type){
  if(S.prefs && S.prefs.vibration===false) return;
  /* Le navigateur bloque la vibration tant que la page n'a pas ete touchee,
     et journalise un avertissement a chaque tentative. La demo, qui tourne
     avant tout geste, en produisait des dizaines. */
  if(typeof _gesteFait!=='undefined' && !_gesteFait) return;
  const m=MOTIFS[type]||[20];
  if(navigator.vibrate) navigator.vibrate(m);
}

/* ============================================================
   ECRAN DE DEMARRAGE
   ============================================================ */
/* La langue se choisit une seule fois, juste apres l'ecran d'accueil.
   On retient ce choix a part : S.prefs.langue est deja rempli par la
   detection automatique, il ne dit pas si le joueur a vraiment tranche. */
function langueDejaChoisie(){
  try{ return !!localStorage.getItem('ss_langue_choisie'); }catch(e){ return true; }
}
function ouvrirChoixLangue(){
  const el=document.getElementById('choix-langue'); if(!el){ apresChoixLangue(); return; }
  const l=ASSETS.logoNexus;
  const m=el.querySelector('.marque');
  if(m && l) m.style.backgroundImage='url('+l.src+')';
  el.classList.add('on');
}
function choisirLangueDepart(l){
  try{ localStorage.setItem('ss_langue_choisie','1'); }catch(e){}
  LANGUE=(l==='en')?'en':'fr';
  if(!S.prefs) S.prefs={};
  S.prefs.langue=LANGUE; save();
  traduirePage(); majBoutonsLangue();
  try{ renderSettings(); renderQuests(); renderShop(); renderShips(); renderBestiaire(); }catch(e){}
  try{ poserIcones(); ui(); }catch(e){}
  const el=document.getElementById('choix-langue'); if(el) el.classList.remove('on');
  Audio2.jouerSfx('button_click'); haptique('bouton');
  apresChoixLangue();
}
/* Suite normale du demarrage : tutoriel a la premiere visite, sinon accueil. */
function apresChoixLangue(){
  if(!localStorage.getItem('ss_tuto_vu')) ouvrirTuto(); else show('home');
}

/* Vrai des le premier geste du joueur. Avant cela, le navigateur refuse
   tout demarrage audio : inutile d'essayer. */
let _gesteFait=false;
['pointerdown','touchstart','keydown','mousedown'].forEach(ev=>
  document.addEventListener(ev, ()=>{
    if(_gesteFait) return;
    _gesteFait=true;
    /* On rejoue la piste qui attendait. */
    try{ if(Audio2.pisteEnAttente){ const p=Audio2.pisteEnAttente; Audio2.pisteEnAttente=null; Audio2.jouerMusique(p); } }catch(e){}
  }, {passive:true}));

let _splashParti=false, _minuteurDemo=null;
function quitterSplash(){
  if(_splashParti) return; _splashParti=true;
  clearTimeout(_minuteurDemo);
  const el=document.getElementById('splash');
  if(el){ el.classList.add('parti'); setTimeout(()=>{ el.style.display='none'; },520); }
  Audio2.jouerMusique('menu');
  haptique('bouton');
  /* Premiere chose apres l'accueil : la langue. Ensuite seulement le tuto. */
  if(!langueDejaChoisie()) ouvrirChoixLangue();
  else apresChoixLangue();
}
/* Sans interaction pendant 15 s : demo auto-jouee (captures du trailer) */
function armerDemo(){
  clearTimeout(_minuteurDemo);
  _minuteurDemo=setTimeout(()=>{ if(!_splashParti && !_demoActive) lancerDemo(); }, 15000);
}

/* ============================================================
   TUTO PREMIERE VISITE — 3 etapes
   ============================================================ */
const TUTO=[
  {p:'\ud83d\udd79\ufe0f', t:'SE D\u00c9PLACER', d:"Glisse ton doigt n'importe o\u00f9 sur l'\u00e9cran : le vaisseau suit dans les 8 directions, y compris en diagonale.\n\nAu clavier : ZQSD, WASD ou les fl\u00e8ches."},
  {p:'\ud83d\udca5', t:'TIRER', d:"Le tir part tout seul, en continu. Tu n'as aucun bouton \u00e0 presser.\n\nTout se joue au placement : coupe les lignes de tir, contourne les boucliers, ne reste jamais immobile."},
  {p:'\ud83d\udee1\ufe0f', t:'CONNA\u00ceTRE L\u2019ENNEMI', d:"Chaque unit\u00e9 a un comportement fixe : le kamikaze fonce, le t\u00e9l\u00e9porteur appara\u00eet derri\u00e8re toi, le porteur de bouclier renvoie les tirs de face.\n\nLe Bestiaire les d\u00e9crit tous."},
  {p:'\u2b50', t:'DIFFICULT\u00c9 ET \u00c9TOILES', d:"Chaque n\u0153ud se joue en Normal, Difficile ou Extr\u00eame. Plus dur = jusqu'\u00e0 3,2\u00d7 de r\u00e9compenses.\n\nUn n\u0153ud termin\u00e9 reste rejouable : seule ta meilleure \u00e9toile compte."},
  {p:'\ud83c\udfaf', t:'OBJECTIF', d:"13 secteurs, 3 boucles, 4 boss. Bats le Vortex pour ouvrir la boucle 2, la Corruption pour la boucle 3, puis affronte le Nexus.\n\n15 transactions te rendent \u00e9ligible \u00e0 l'airdrop SKR."}
];
let _tutoIdx=0;
function ouvrirTuto(){ _tutoIdx=0; document.getElementById('tuto').classList.add('on'); majTuto(); }
function majTuto(){
  const e=TUTO[_tutoIdx];
  document.getElementById('tuto-pict').textContent=e.p;
  document.getElementById('tuto-titre').textContent=T(e.t);
  document.getElementById('tuto-texte').textContent=T(e.d);
  document.getElementById('tuto-btn').textContent=(_tutoIdx===TUTO.length-1)?T('COMMENCER'):T('SUIVANT');
  document.getElementById('tuto-pts').innerHTML=TUTO.map((_,i)=>'<i class="'+(i===_tutoIdx?'on':'')+'"></i>').join('');
}
function tutoSuivant(){
  Audio2.jouerSfx('button_click'); haptique('bouton');
  if(_tutoIdx<TUTO.length-1){ _tutoIdx++; majTuto(); } else fermerTuto();
}
function fermerTuto(){
  localStorage.setItem('ss_tuto_vu','1');
  document.getElementById('tuto').classList.remove('on');
  /* Intro narrative au tout premier lancement */
  if(!S.loreVu){
    S.loreVu=true; save();
    afficherTransmission(T('ARCHIVES GENESIS'), T(LORE_INTRO.join('\n')), ()=>show('home'), '#c4b5fd');
  } else show('home');
}

/* ============================================================
   POUSSIERE D'ETOILES — accueil
   ============================================================ */
function creerPoussiere(){
  const box=document.getElementById('poussiere'); if(!box||box.dataset.pret) return;
  box.dataset.pret='1';
  const nb=(S.prefs&&S.prefs.particules==='faible')?10:(S.prefs&&S.prefs.particules==='eleve')?32:20;
  let html='';
  for(let i=0;i<nb;i++){
    const t=1+Math.random()*2.4, d=14+Math.random()*22, r=Math.random()*-30;
    html+='<span style="left:'+(Math.random()*100).toFixed(1)+'%;width:'+t.toFixed(1)+'px;height:'+t.toFixed(1)+
          'px;animation-duration:'+d.toFixed(1)+'s;animation-delay:'+r.toFixed(1)+'s;opacity:'+(0.25+Math.random()*0.45).toFixed(2)+
          ';background:'+(i%3?'#c4b5fd':'#14F195')+'"></span>';
  }
  box.innerHTML=html;
}

/* ============================================================
   MODE INFINI — vagues procedurales, sans fin
   Score = vague x 1000 + vies restantes x 100 + points de jeu
   ============================================================ */
/* ============================================================
   WINGMAN IA — allie autonome, mode Arena Coop
   ============================================================ */
const WINGMAN = { hp:60, offsetX:88, suivi:0.055, cadence:400, esquive:64, respawn:5000, degats:0.7 };

function creerWingman(g){
  g.wing={ x:g.player.x+WINGMAN.offsetX, y:g.player.y+30, r:18,
           hp:WINGMAN.hp, hpMax:WINGMAN.hp, tir:0, kills:0,
           mort:0, apparition:40, cote:1 };
}
function majWingman(g){
  const w=g.wing; if(!w) return;
  if(w.mort>0){
    w.mort--;
    if(w.mort===0){
      w.x=g.player.x-WINGMAN.offsetX; w.y=g.player.y+40;
      w.hp=w.hpMax; w.apparition=45;
      parts(w.x,w.y,'#67e8f9',20); Audio2.jouerSfx('levelup');
      toast('\ud83e\udd16 Wingman op\u00e9rationnel',1400);
    }
    return;
  }
  if(w.apparition>0) w.apparition--;
  const cibleX=g.player.x+WINGMAN.offsetX*w.cote, cibleY=g.player.y+34;
  w.x+=(cibleX-w.x)*WINGMAN.suivi*3;
  w.y+=(cibleY-w.y)*WINGMAN.suivi*3;
  for(const p of g.eBullets){
    if(Math.hypot(p.x-w.x,p.y-w.y)<WINGMAN.esquive){ w.cote=-w.cote; break; }
  }
  w.x=Math.max(24,Math.min(g.w-24,w.x));
  w.y=Math.max(60,Math.min(g.h-30,w.y));
  w.tir-=16.7;
  if(w.tir<=0 && w.apparition<=0){
    let best=null, bd=1e9;
    for(const e of g.enemies){ const d=Math.hypot(e.x-w.x,e.y-w.y); if(d<bd){bd=d;best=e;} }
    if(g.boss && !g.boss.entree){ const d=Math.hypot(g.boss.x-w.x,g.boss.y-w.y); if(d<bd){bd=d;best=g.boss;} }
    if(best){
      const a=Math.atan2(best.y-w.y,best.x-w.x);
      g.bullets.push({x:w.x, y:w.y, vx:Math.cos(a)*12, vy:Math.sin(a)*12,
                      dmg:(1.15+S.weapon*0.38)*WINGMAN.degats, wing:true});
      w.tir=WINGMAN.cadence;
    }
  }
  for(let i=g.eBullets.length-1;i>=0;i--){
    const p=g.eBullets[i];
    if(Math.hypot(p.x-w.x,p.y-w.y)<w.r+p.r){
      g.eBullets.splice(i,1); w.hp-=8; parts(w.x,w.y,'#67e8f9',4);
      if(w.hp<=0){ w.mort=Math.round(WINGMAN.respawn/16.7); spawnExplosion(w.x,w.y,22);
                   Audio2.jouerSfx('enemy_die'); toast('\u26a0 Wingman hors combat',1600); }
      break;
    }
  }
}
function dessinerWingman(g){
  const w=g.wing; if(!w || w.mort>0) return;
  const ctx=g.ctx, img=ASSETS['ship'+loadout.ship]||ASSETS.ship1||ASSETS.ship0;
  ctx.save();
  if(w.apparition>0) ctx.globalAlpha=0.3+0.7*(1-w.apparition/45);
  if(img) ctx.drawImage(img,w.x-30,w.y-30,60,60);
  else { ctx.translate(w.x,w.y); formeFallback(ctx,'triangle',w.r,'#67e8f9'); }
  ctx.restore();
  const l=34;
  ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(w.x-l/2,w.y-w.r-13,l,3);
  ctx.fillStyle='#67e8f9'; ctx.fillRect(w.x-l/2,w.y-w.r-13,l*Math.max(0,w.hp/w.hpMax),3);
}

/* ============================================================
   ARENA — defi quotidien : survie chronometree, seed du jour
   ============================================================ */
const DEFIS=[
  {id:'survie',   nom:'SURVIE',        d:"Tiens 60 secondes. Les renforts ne s'arr\u00eatent jamais.", duree:60, mod:{spawn:0.7}},
  {id:'sansfaute',nom:'SANS FAUTE',    d:"60 secondes, une seule vie. Chaque impact est fatal.",   duree:60, mod:{lives:1}},
  {id:'nuee',     nom:'NU\u00c9E',         d:"45 secondes face \u00e0 un flux continu de chasseurs.",     duree:45, mod:{spawn:0.45}},
  {id:'colosses', nom:'COLOSSES',      d:"75 secondes. Peu d'ennemis, mais tr\u00e8s r\u00e9sistants.",     duree:75, mod:{spawn:1.6, hp:2.4}},
  {id:'chasse',   nom:'PRIME',         d:"60 secondes pour accumuler un maximum de primes.",      duree:60, mod:{spawn:0.9, primes:true}}
];
/* Meme defi pour tout le monde un jour donne */
function defiDuJour(){
  const j=new Date(); const seed=j.getFullYear()*10000+(j.getMonth()+1)*100+j.getDate();
  return DEFIS[seed % DEFIS.length];
}
function renderArena(){
  const d=defiDuJour();
  const nom=document.getElementById('ar-nom'); if(nom) nom.textContent=d.nom;
  const desc=document.getElementById('arena-desc'); if(desc) desc.textContent=d.d;
  const du=document.getElementById('ar-duree'); if(du) du.textContent=d.duree+'s';
  const rec=(S.arenaRecords||{})[d.id]||0;
  const r=document.getElementById('ar-record'); if(r) r.textContent=rec?rec.toLocaleString():'\u2014';
  const g=document.getElementById('ar-gain'); if(g) g.textContent='\u00d71.5';
  renderLB();
}
function lancerCoop(){
  if(!S.connected) return toast('Connecte ton wallet');
  S.currentNode=-3;
  const base=MODES.find(m=>m.id==='pilote');
  const diff=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  const mode={...base, hp:base.hp*diff.hp*1.15, spawn:base.spawn*0.8,
              reward:base.reward*diff.reward, cadence:diff.cadence, diffId:diff.id,
              flux:diff.flux, vitesse:diff.vitesse, bonusUnites:diff.bonusUnites};
  const mun=MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0];
  show('solo');
  document.getElementById('hud-title').textContent='ARENA COOP';
  document.getElementById('hud-mode').textContent='avec Wingman';
  chargerFondNiveau(3).then(appliquerFondNiveau);
  initGame(mode, mun);
  if(!G) return;
  creerWingman(G); G.coop=true; G.contrat=null;   /* pas de contrat hors campagne */
  toast('\ud83e\udd16 Wingman d\u00e9ploy\u00e9 \u2014 qui fera le plus de kills ?',3000);
}

function lancerArena(){
  if(!S.connected) return toast('Connecte ton wallet');
  const d=defiDuJour();
  S.currentNode=-2;
  const base=MODES.find(m=>m.id==='pilote');
  const mode={...base,
    lives:d.mod.lives||base.lives,
    spawn:base.spawn*(d.mod.spawn||1),
    hp:base.hp*(d.mod.hp||1),
    reward:base.reward, cadence:1, diffId:'arena'};
  const mun=MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0];
  show('solo');
  document.getElementById('hud-title').textContent='ARENA \u2022 '+d.nom;
  document.getElementById('hud-mode').textContent=d.duree+'s';
  chargerFondNiveau(6).then(appliquerFondNiveau);
  initGame(mode, mun);
  if(!G) return;
  G.arena=d; G.chrono=d.duree*60; G.contrat=null;
  toast('\u2694\ufe0f '+d.nom+' \u2014 '+d.duree+' secondes',2600);
}

function lancerInfini(){
  if(!S.connected) return toast('Connecte ton wallet');
  S.currentNode=-1;                                  /* hors campagne */
  loadout.difficulte=loadout.difficulte||'normal';
  const base=MODES.find(m=>m.id==='pilote');
  const diff=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  const mode={...base, hp:base.hp*diff.hp, reward:base.reward*diff.reward, cadence:diff.cadence, diffId:diff.id,
              flux:diff.flux, vitesse:diff.vitesse, bonusUnites:diff.bonusUnites};
  const mun=MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0];
  show('solo');
  document.getElementById('hud-title').textContent='MODE INFINI';
  document.getElementById('hud-mode').textContent='Vague 1';
  chargerFondNiveau(2).then(appliquerFondNiveau);
  initGame(mode, mun);
  if(!G) return;
  G.infini=true; G.spawnMult=1; G.contrat=null;
  toast('\u267e\ufe0f MODE INFINI \u2014 survis le plus longtemps possible',3000);
}

/* Progression d'une vague en mode infini */
/* Secteurs traverses en boucle par le mode infini : le decor change toutes
   les quatre vagues, puis bascule sur CHAOS quand la pression monte. */
const INFINI_DECORS = [2,3,5,6,8,10,11,12];
const INFINI_DECORS_CHAOS = [14,15,17,19];

function vagueInfinie(g){
  g.wave++;
  g.spawnMult*=0.99;   /* legere pression supplementaire, la courbe fait le reste */
  toast('\u26a1 VAGUE '+g.wave);
  Audio2.jouerSfx('wave_start');

  /* Changement de decor toutes les 4 vagues : sans ca on regarde le meme
     fond pendant une demi-heure. */
  if(g.wave%4===0){
    const chaos = g.wave>=13;
    const liste = chaos ? INFINI_DECORS_CHAOS : INFINI_DECORS;
    const nd = liste[Math.floor(g.wave/4)%liste.length];
    chargerFondNiveau(nd).then(appliquerFondNiveau);
    if(chaos && !g.themeChaos){
      g.themeChaos=true;
      Audio2.jouerMusique('combatChaos');
      toast('\u26a0\ufe0f '+T('SIGNATURE CHAOS DÉTECTÉE'), 3200);
    }
  }
  /* Mini-boss toutes les 5 vagues, boss complet toutes les 15 */
  if(g.wave%18===0){
    g.bossSpawned=false; g.bossTimer=999;
    const modele=BOSS_DEFS[[4,6,7,12][Math.floor(g.wave/18)%4]];
    g.bossDef={...modele, nom:modele.nom+' \u2022 V'+g.wave,
               hpMult:modele.hpMult*(1+g.wave*0.04)};
    declencherBoss(g);
  } else if(g.wave>=8 && g.wave%6===0 && !g.boss){
    g.bossSpawned=false; g.bossTimer=999;
    const modele=BOSS_DEFS[[4,6,7][Math.floor(g.wave/6)%3]];
    g.bossDef={...modele, nom:'\u00c9CLAIREUR \u2022 V'+g.wave,
               hpMult:Math.max(2, modele.hpMult*0.5*(1+g.wave*0.03)),
               rayon:modele.rayon*0.8, phase2:false, invoque:false, mini:true};
    declencherBoss(g);
  }
}
/* ============================================================
   COURBE DE DIFFICULTE
   Regle : les premieres vagues doivent laisser respirer, la montee
   doit etre reguliere, et il faut un plancher pour que ca ne devienne
   jamais injouable. Valeur retournee = nombre de frames entre deux
   apparitions : plus le nombre est grand, plus c'est calme.
   ============================================================ */
function cadenceSpawn(g){
  const m = g.mode.spawn || 1;          /* le mode choisi reste determinant */
  const f = g.mode.flux || 1;           /* facteur de difficulte */
  /* Le plancher suit la difficulte : en Normal la partie reste tenable
     meme tres loin, en Extreme on accepte que ca devienne etouffant. */
  const plancher = f>=1 ? 22 : (f>=0.7 ? 18 : 14);
  if(g.infini){
    /* Trois vagues d'echauffement avant que la pression ne monte */
    const echauffement = g.wave<=3 ? (1.8 - (g.wave-1)*0.27) : 1;
    return Math.max(plancher, (96 - g.wave*2.4) * m * f * echauffement * g.spawnMult);
  }
  let base = (78 - g.wave*2.6) * m * f;
  if(g.meca==='marathon') base*=0.62;    /* Point de rupture : flux continu assume */
  return Math.max(plancher, base);
}

/* Types d'ennemis debloques progressivement */
function typeInfini(vague){
  /* Un seul type nouveau a la fois, avec de la place pour l'assimiler */
  const dispo=['chasseur'];
  if(vague>3)  dispo.push('tireur');
  if(vague>6)  dispo.push('kamikaze');
  if(vague>9)  dispo.push('diviseur');
  if(vague>12) dispo.push('tank');
  if(vague>15) dispo.push('bouclier');
  if(vague>19) dispo.push('teleport');
  if(vague>23) dispo.push('poseur');
  /* Passe la vague 13 on repioche plus souvent dans le haut du panier :
     la difficulte ne vient plus seulement du nombre. */
  if(vague>13){
    const lourds=dispo.filter(k=>['tank','bouclier','teleport','poseur','diviseur'].includes(k));
    if(lourds.length && Math.random()<0.45) return lourds[Math.floor(Math.random()*lourds.length)];
  }
  return dispo[Math.floor(Math.random()*dispo.length)];
}

/* ============================================================
   FIN CINEMATIQUE — apres la chute du Nexus
   ============================================================ */
const FINAL_TXT=[
  "Le Nexus se disperse en poussi\u00e8re de donn\u00e9es.",
  "Les Chaos Nodes s'\u00e9teignent un \u00e0 un, secteur apr\u00e8s secteur.",
  "Genesis respire enfin. Les mondes se reconnectent.",
  "Le QG t'appelle. Tu ne r\u00e9ponds pas tout de suite.",
  "Quelque part dans le r\u00e9seau, une ligne de code se recompose doucement.",
  "\u2014 mais \u00e7a, c'est une autre mission."
];
function lancerFinal(){
  const ov=document.getElementById('final'), bloc=document.getElementById('final-bloc');
  if(!ov||!bloc) return;
  Audio2.jouerMusique('menu');
  bloc.innerHTML=FINAL_TXT.map((t,i)=>
    '<div class="lig" style="animation-delay:'+(i*1.7+0.4)+'s">'+t+'</div>').join('')+
    '<div class="fin" style="animation-delay:'+(FINAL_TXT.length*1.7+1)+'s">FIN</div>'+
    '<div class="lig" style="animation-delay:'+(FINAL_TXT.length*1.7+2.4)+'s;font-size:11px;color:#6b7280;margin-top:22px">'+
    'Appuyer pour revenir au QG</div>';
  ov.classList.add('on');
  setTimeout(()=>{ ov.onclick=()=>{ ov.classList.remove('on'); ov.onclick=null; show('home'); }; },
             (FINAL_TXT.length*1.7+2.4)*1000);
}

/* ============================================================
   MENU PAUSE — accessible en pleine partie
   ============================================================ */
let _enPause=false;
function basculerPause(){ _enPause ? reprendrePartie() : mettreEnPause(); }
function mettreEnPause(){
  if(!G || !G.running || _enPause || G.demo) return;
  _enPause=true;
  G.running=false;                       /* stoppe la boucle : le jeu se fige */
  cancelAnimationFrame(G.raf);
  stopMusic();
  majTogglesPause();
  const info=document.getElementById('pause-info');
  if(info) info.textContent='Vague '+G.wave+'  \u2022  '+G.score+' pts  \u2022  '+G.lives+' vies';
  document.getElementById('pause').classList.add('on');
  Audio2.jouerSfx('button_click');
}
function reprendrePartie(){
  if(!_enPause) return;
  _enPause=false;
  document.getElementById('pause').classList.remove('on');
  if(G){ G.running=true; G.lastShot=performance.now(); startMusic(); loop(); }
}
function quitterPartie(){
  _enPause=false;
  document.getElementById('pause').classList.remove('on');
  abortMission();
  Audio2.jouerMusique('menu');
}
function majTogglesPause(){
  if(!S.prefs) S.prefs={...DEFAULT_PREFS};
  [['son','p-son'],['musique','p-musique'],['vibration','p-vibration']].forEach(([k,id])=>{
    const el=document.getElementById(id); if(el) el.classList.toggle('on', !!S.prefs[k]);
  });
  const seg=document.getElementById('p-particules');
  if(seg) seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on', b.dataset.v===S.prefs.particules));
}
/* Les reglages de la pause pilotent les memes preferences que l'ecran Reglages */
function togglePrefPause(cle){ togglePref(cle); majTogglesPause(); }
function setParticulesPause(v){ setParticules(v); majTogglesPause(); }

/* ============================================================
   MODE DEMO ATTRACT — partie auto-jouee pour les captures du trailer
   ============================================================ */
/* ============================================================
   MODE DEMO — attract mode facon borne d'arcade
   4 sequences contrastees : 2 secteurs de combat, 2 boss,
   sur les deux cartes. Enchainement automatique, en boucle.
   ============================================================ */
/* ============================================================
   TRAILER — sept tableaux enchaines, pense pour etre filme.
   Chaque sequence change de decor, de vaisseau et d'adversaire :
   deux campagnes, quatre boss, six vaisseaux differents.
   Duree totale : 2 min 15 environ, puis ca reboucle.
   ============================================================ */
/* mun : chaque tableau montre aussi une munition differente — sans ca, les
   sept sequences se ressemblaient malgre les sept vaisseaux. */
const DEMO_SEQ = [
  {node:2,  diff:'normal',    ship:0,  mun:'std',    duree:15000, nom:'GENESIS • CHAMP D’ASTÉROÏDES',
   accroche:'Esquive, tir continu, tout se joue au placement'},
  {node:4,  diff:'difficile', ship:2,  mun:'perf',   duree:22000, nom:'VORTEX • PREMIER BOSS',
   accroche:'Spirale de disques • PV ×5 • 2 phases'},
  {node:9,  diff:'difficile', ship:5,  mun:'hyper',  duree:15000, nom:'DÉBRIS OUBLIÉS • GRAVITÉ ZÉRO',
   accroche:'Secteur secret • l’inertie devient l’ennemie'},
  {node:12, diff:'difficile', ship:4,  mun:'spread', duree:24000, nom:'NEXUS • BOSS FINAL GENESIS',
   accroche:'PV ×16 • 3 phases • change de forme'},
  {node:15, diff:'difficile', ship:7,  mun:'hyper',  duree:15000, nom:'CHAOS PROTOCOL • MEUTE D’ÉLITE',
   accroche:'Seconde campagne • bestiaire entièrement différent'},
  {node:16, diff:'extreme',   ship:10, mun:'perf',   duree:22000, nom:'FRACTURE • ANOMALIE',
   accroche:'PV ×17 • 3 formes • difficulté Extrême'},
  {node:21, diff:'extreme',   ship:11, mun:'spread', duree:26000, nom:'NEXUS PRIME • BOSS ULTIME',
   accroche:'PV ×26 • 5 mutations successives'}
];
let _demoActive=false, _demoIdx=0, _demoTimer=null, _demoSnap=null, _demoVus=0;

function lancerDemo(){
  if(_demoActive) return;
  _demoActive=true;
  _demoSnap = JSON.stringify(S);            /* la demo ne doit rien laisser derriere elle */
  _demoIdx = 0;   /* un trailer se regarde depuis le debut */
  _demoVus = 0;
  const el=document.getElementById('splash'); if(el) el.classList.add('parti');
  _splashParti=true;
  const badge=document.createElement('div');
  badge.id='badge-demo';
  badge.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:90;'+
    'font-family:Orbitron,sans-serif;font-size:10px;color:#14F195;text-align:center;'+
    'background:rgba(0,0,0,.68);padding:8px 16px;border-radius:13px;max-width:92vw;'+
    'border:1px solid rgba(20,241,149,.32);backdrop-filter:blur(6px)';
  document.body.appendChild(badge);
  /* Tout geste rend la main immediatement, quel qu'il soit. */
  ['touchstart','mousedown','keydown','wheel','pointerdown'].forEach(ev=>
    document.addEventListener(ev, arreterDemo, {once:true, passive:true}));
  demoSequence();
}

/* Joue la sequence courante puis programme la suivante */
function demoSequence(){
  if(!_demoActive) return;
  if(!_demoSnap) _demoSnap=JSON.stringify(S);   /* filet : jamais de sequence sans snapshot */
  if(G && G.running){ G.running=false; cancelAnimationFrame(G.raf); }
  const sq = DEMO_SEQ[_demoIdx % DEMO_SEQ.length];
  const nd = NODES.find(x=>x.id===sq.node);

  S.connected=true;
  S.currentNode=sq.node;
  S.carteActive=(nd&&nd.carte===2)?2:1;
  S.trVues=(S.trVues||[]).concat(sq.node);   /* jamais de transmission en demo */
  loadout.difficulte=sq.diff;
  /* Vitrine du hangar : un vaisseau different a chaque tableau, avec sa
     signature de tir. Le snapshot restaure l'equipement du joueur a la fin. */
  if(sq.ship!==undefined){
    if(!S.unlocked.includes(sq.ship)) S.unlocked=S.unlocked.concat(sq.ship);
    S.ship=sq.ship; loadout.ship=sq.ship;
  }
  /* Munition de la sequence, avec repli si l'identifiant est inconnu. */
  loadout.munition = (sq.mun && MUNITIONS.some(m=>m.id===sq.mun)) ? sq.mun : 'std';

  const badge=document.getElementById('badge-demo');
  if(badge){
    const v=SHIPS[S.ship];
    badge.innerHTML='<b style="letter-spacing:2.5px">'+sq.nom+'</b>'+
      '<i style="display:block;font-style:normal;font-size:8.5px;letter-spacing:.6px;'+
      'color:#9ca3af;margin-top:3px">'+sq.accroche+'</i>'+
      '<i style="display:block;font-style:normal;font-size:8px;letter-spacing:1.2px;'+
      'color:#6b7280;margin-top:2px">'+(v?v.name.toUpperCase():'')+
      ' • '+((MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0]).name.toUpperCase())+
      ' • '+((_demoIdx%DEMO_SEQ.length)+1)+'/'+DEMO_SEQ.length+'</i>';
  }

  launchMission();
  if(!G){ arreterDemo(); return; }
  G.demo=true; G.lives=99;
  S.charges={mitra:3, nuke:3, ghost:3};      /* de quoi montrer tous les effets */

  _demoVus=(_demoVus||0)+1;
  if(_demoVus>=DEMO_SEQ.length) debloquerSecret('arcade');   /* spectateur patient */
  clearTimeout(_demoTimer);
  _demoTimer=setTimeout(()=>{ _demoIdx++; demoSequence(); }, sq.duree);
}

function arreterDemo(){
  if(!_demoActive) return; _demoActive=false;
  clearTimeout(_demoTimer);
  if(G&&G.running){ G.running=false; cancelAnimationFrame(G.raf); stopMusic(); }
  const b=document.getElementById('badge-demo'); if(b) b.remove();
  /* Restauration integrale de la sauvegarde du joueur */
  const secretsDemo=(S.secrets||[]).slice();
  if(_demoSnap){
    try{ const av=JSON.parse(_demoSnap);
      Object.keys(S).forEach(k=>{ if(!(k in av)) delete S[k]; });
      Object.assign(S, av);
    }catch(e){}
    _demoSnap=null;
  }
  /* Un secret decouvert PENDANT la demo survit a la restauration,
     avec sa recompense — mais rien d'autre de la demo n'est conserve. */
  secretsDemo.forEach(id=>{
    if((S.secrets||[]).includes(id)) return;
    const sc=SECRETS.find(x=>x.id===id); if(!sc) return;
    S.secrets=(S.secrets||[]).concat(id);
    S.skr+=sc.gc;
  });
  /* On rend la main a l'accueil. Remettre le splash par-dessus tout donnait
     l'impression d'une application figee : plus rien ne defilait et il
     fallait deviner qu'un appui supplementaire etait attendu. */
  const el=document.getElementById('splash');
  if(el){ el.classList.add('parti'); el.style.display='none'; }
  _splashParti=true;
  show('home');
  /* _demoActive est deja retombe a false : ce save ecrit bien l'etat restaure. */
  save();
  ui(); armerDemo(); armerVeille();
}

/* ============================================================
   VEILLE — aucune action pendant VEILLE_MS hors partie :
   retour a l'accueil puis attract mode.
   ============================================================ */
const VEILLE_MS = 60000;
let _veilleTimer=null;
function armerVeille(){
  clearTimeout(_veilleTimer);
  _veilleTimer=setTimeout(()=>{
    if(_demoActive) return;
    if(G && G.running && !G.demo) return armerVeille();   /* partie en cours : on ne coupe rien */
    if(!_splashParti) return armerVeille();               /* deja sur le splash : armerDemo gere */
    show('home');
    const el=document.getElementById('splash');
    if(el){ el.classList.remove('parti'); el.style.display='flex'; }
    _splashParti=false;
    setTimeout(()=>{ if(!_splashParti) lancerDemo(); }, 3000);
  }, VEILLE_MS);
}
['touchstart','mousedown','keydown','wheel'].forEach(ev=>
  document.addEventListener(ev, ()=>{ if(!_demoActive) armerVeille(); }, {passive:true}));

/* Pilote automatique : fuit la menace la plus proche, sinon va chercher les orbes */
/* Pilote de demonstration : joue proprement, reste au centre, utilise ses bonus.
   Objectif : produire de belles images pour le trailer. */
function piloteAuto(g){
  const p=g.player;
  let fx=0, fy=0;

  /* 1. Esquive predictive : on evalue ou sera le projectile dans 12 frames */
  g.eBullets.forEach(b=>{
    const px=b.x+b.vx*12, py=b.y+b.vy*12;
    const dx=p.x-px, dy=p.y-py, d2=dx*dx+dy*dy;
    if(d2<30000 && d2>1){ const f=3400/d2; fx+=dx*f; fy+=dy*f; }
  });
  /* 2. Distance de securite avec les ennemis */
  g.enemies.forEach(e=>{
    const dx=p.x-e.x, dy=p.y-e.y, d2=dx*dx+dy*dy;
    if(d2<24000 && d2>1){ const f=2400/d2; fx+=dx*f; fy+=dy*f; }
  });
  if(g.boss && !g.boss.entree){
    const dx=p.x-g.boss.x, dy=p.y-g.boss.y, d=Math.hypot(dx,dy)||1;
    if(d<210){ fx+=dx/d*2.2; fy+=dy/d*2.2; }
  }

  const menace=Math.hypot(fx,fy);

  /* 3. Quand c'est calme : viser une cible et ramasser le butin */
  if(menace<1.4){
    let butin=null, bd=1e9;
    g.orbs.forEach(o=>{ const d=Math.hypot(o.x-p.x,o.y-p.y); if(d<bd){bd=d;butin=o;} });
    if(butin && bd<260){ fx+=(butin.x-p.x)*0.08; fy+=(butin.y-p.y)*0.08; }
    else {
      /* se placer sous la cible la plus proche pour l'aligner */
      let cible=g.boss && !g.boss.entree ? g.boss : null, cd=cible?Math.hypot(cible.x-p.x,cible.y-p.y):1e9;
      g.enemies.forEach(e=>{ const d=Math.hypot(e.x-p.x,e.y-p.y); if(d<cd){cd=d;cible=e;} });
      if(cible) fx+=(cible.x-p.x)*0.055;
    }
  }

  /* 4. Ancrage : le vaisseau vit dans le tiers bas, jamais colle aux bords */
  const zoneY=g.h*0.74;
  fy+=(zoneY-p.y)*0.038;
  /* Rappel central : le vaisseau doit rester dans le champ, pas raser les bords */
  const ecart=(p.x-g.w*0.5)/(g.w*0.5);          /* -1 a 1 */
  fx-=ecart*ecart*ecart*7.5;                     /* rappel qui grandit vite vers l'exterieur */
  fx+=(g.w*0.5-p.x)*0.045;
  const marge=Math.min(115, g.w*0.28);
  if(p.x<marge)      fx+=(marge-p.x)*0.30;
  if(p.x>g.w-marge)  fx-=(p.x-(g.w-marge))*0.30;

  /* Degagement : coince trop longtemps sur un flanc, il traverse l'ecran.
     Sans ca, sous pression, le pilote reste scotche au bord. */
  const auBord = p.x<g.w*0.22 || p.x>g.w*0.78;
  g.demoBord = auBord ? (g.demoBord||0)+1 : 0;
  if(g.demoBord>45){
    g.demoTraverse = (p.x<g.w*0.5) ? 1 : -1;
    g.demoBord=0; g.demoTraverseT=70;
  }
  if(g.demoTraverseT>0){
    g.demoTraverseT--;
    fx += g.demoTraverse*9;          /* priorite absolue : rejoindre le centre */
    fy += 0.6;
  }

  /* 5. Deplacement lisse */
  const norme=Math.hypot(fx,fy)||1;
  const vitesse=Math.min(6.8, norme);
  g.demoVx=(g.demoVx||0)*0.72 + (fx/norme*vitesse)*0.28;
  g.demoVy=(g.demoVy||0)*0.72 + (fy/norme*vitesse)*0.28;
  p.x+=g.demoVx; p.y+=g.demoVy;
  p.x=Math.max(34,Math.min(g.w-34,p.x));
  p.y=Math.max(120,Math.min(g.h-60,p.y));

  /* 6. Utilisation des bonus, comme un joueur qui sait jouer */
  g.demoTempo=(g.demoTempo||0)+1;
  if(g.cooldownBonus<=0 && g.demoTempo>150){
    const menaceForte = g.enemies.length>=7 || g.eBullets.length>=26;
    if(menaceForte && (S.charges.nuke||0)>0){ activerBonus('nuke'); g.demoTempo=0; }
    else if(g.boss && !g.boss.entree && (S.charges.mitra||0)>0 && g.bonusActive!=='mitra'){
      activerBonus('mitra'); g.demoTempo=0;
    }
    else if(!g.companions && (S.charges.ghost||0)>0 && g.wave>=2){
      activerBonus('ghost'); g.demoTempo=0;
    }
  }
  /* La demo ne doit jamais tomber a court de charges */
  if(g.frame%900===0){ S.charges.mitra=Math.max(S.charges.mitra,1);
                       S.charges.nuke=Math.max(S.charges.nuke,1);
                       S.charges.ghost=Math.max(S.charges.ghost,1); }
}

/* ============================================================

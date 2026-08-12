const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Construit le mode EXACTEMENT comme launchMission, au lieu de passer une
   chaine a initGame : mon audit precedent tournait sur un mode vide. */
function vraiMode(){
  const base=MODES.find(m=>m.id===loadout.mode) || MODES[0];
  const diff=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  const mode={...base, hp:base.hp*diff.hp, reward:base.reward*diff.reward, cadence:diff.cadence,
              diffId:diff.id, flux:diff.flux, vitesse:diff.vitesse, bonusUnites:diff.bonusUnites};
  const nd=NODES.find(x=>x.id===S.currentNode);
  if(nd && nd.type==='tresor') mode.multDropsNoeud=2.6;
  if(nd && nd.type==='portail'){ if(!BOSS_DEFS[nd.id]) mode.hp*=1.35; mode.spawn*=0.7; mode.reward*=1.8; }
  return mode;
}
function mun(){ return MUNITIONS.find(m=>m.id===loadout.munition) || MUNITIONS[0]; }

const FRAMES=420;
let total=0; const pires={ennemis:0,balles:0,part:0}; const echecs=[]; const gains=[];
for(const nd of NODES.map(n=>n.id)){
  for(const diff of ['normal','difficile','extreme']){
    try{
      fixerHasard(nd*131+diff.length);
      S.currentNode=nd; loadout.difficulte=diff; loadout.mode=loadout.mode||'pilote'; S.connected=true;
      initGame(vraiMode(), mun());
      if(typeof G.mode.reward!=='number' || !isFinite(G.mode.reward)) throw new Error('mode.reward invalide');
      if(typeof G.mode.hp!=='number') throw new Error('mode.hp invalide');
      G.running=true;
      for(let i=0;i<FRAMES;i++){
        avancerTemps(1000/60); update();
        if(!G||!G.running) break;
        if(G.lives!==undefined && G.lives<3) G.lives=3;
        pires.ennemis=Math.max(pires.ennemis,(G.enemies||[]).length);
        pires.balles=Math.max(pires.balles,(G.eBullets||[]).length+(G.bullets||[]).length);
        pires.part=Math.max(pires.part,(G.particles||[]).length);
        if(!isFinite(G.player.x)||!isFinite(G.player.y)) throw new Error('position joueur invalide');
        if(!isFinite(G.score)) throw new Error('score NaN');
      }
      /* fin de partie reelle : on verifie que les credits ne partent pas en NaN */
      const av=S.skr; G.lives=3; endGame();
      if(!isFinite(S.skr)) throw new Error('credits NaN apres endGame');
      gains.push(S.skr-av);
      total++;
    }catch(e){ echecs.push('N'+nd+'/'+diff+' : '+e.message); }
  }
}
(echecs.length===0) ? ok(total+' parties completes (22 noeuds x 3 difficultes), mode reel, aucune exception')
                    : ko(echecs.length+' plantages :\n         '+echecs.slice(0,6).join('\n         '));
(gains.every(g=>isFinite(g) && g>=0)) ? ok('credits de fin de mission toujours finis et positifs ('+Math.min(...gains)+' a '+Math.max(...gains)+' GC)')
                                      : ko('credits aberrants : '+gains.filter(g=>!isFinite(g)||g<0).slice(0,3));
(pires.ennemis<=60) ? ok('plafond d\'ennemis tenu : '+pires.ennemis+' au pic') : ko('saturation : '+pires.ennemis);
(pires.balles<=400) ? ok('projectiles maitrises : '+pires.balles+' au pic') : ko('trop de projectiles : '+pires.balles);
(pires.part<=1500) ? ok('particules maitrisees : '+pires.part+' au pic') : ko('fuite de particules : '+pires.part);
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

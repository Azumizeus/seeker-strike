const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
function vraiMode(){ const b=MODES.find(m=>m.id===(loadout.mode||'pilote'))||MODES[0];
  const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  return {...b, hp:b.hp*d.hp, reward:b.reward*d.reward, cadence:d.cadence, diffId:d.id,
          flux:d.flux, vitesse:d.vitesse, bonusUnites:d.bonusUnites}; }
function vraieMun(){ return MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0]; }

console.log('RES ---------------------------------------------------------');
console.log('RES  CHAQUE BOSS TIRE-T-IL ?  (20 s de combat simulees)');
console.log('RES  noeud  boss                     tirs   invocations');
const muets=[];
for(const id of Object.keys(BOSS_DEFS).map(Number).sort((a,b)=>a-b)){
  const def=BOSS_DEFS[id];
  fixerHasard(id*7);
  S.currentNode=id; loadout.difficulte='normal'; S.connected=true;
  initGame(vraiMode(), vraieMun());
  G.running=true;
  /* on installe le boss tout de suite */
  G.bossDef=def; spawnBoss(G);
  G.boss.entree=false; G.boss.y=110;
  let tirs=0, invoc=0;
  const pousse=G.eBullets.push.bind(G.eBullets);
  G.eBullets.push=(...a)=>{ tirs+=a.length; return pousse(...a); };
  const avant=G.enemies.length;
  for(let i=0;i<20*60;i++){
    avancerTemps(1000/60);
    if(!G.boss) break;
    G.boss.hp=G.boss.maxHp;            /* il ne doit pas mourir : on observe */
    G.player.x=G.w/2; G.player.y=G.h-200;
    try{ majBoss(G); }catch(e){ ko('N'+id+' '+def.nom+' : '+e.message); break; }
    G.eBullets.length=0;               /* on compte la production, pas le stock */
  }
  invoc=Math.max(0,(G.enemies||[]).length-avant);
  console.log('RES  N'+String(id).padStart(2)+'    '+String(def.nom).padEnd(22).slice(0,22)+
              String(tirs).padStart(6)+String(invoc).padStart(12));
  if(tirs===0 && invoc===0) muets.push('N'+id+' '+def.nom);
  G.running=false;
}
console.log('RES ---------------------------------------------------------');
(muets.length===0) ? ok('les '+Object.keys(BOSS_DEFS).length+' boss attaquent tous')
                   : ko('boss inoffensifs : '+muets.join(', '));
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

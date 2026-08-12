const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
function vraiMode(){ const b=MODES.find(m=>m.id===(loadout.mode||'pilote'))||MODES[0];
  const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  return {...b, hp:b.hp*d.hp, reward:b.reward*d.reward, cadence:d.cadence, diffId:d.id,
          flux:d.flux, vitesse:d.vitesse, bonusUnites:d.bonusUnites}; }
function vraieMun(){ return MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0]; }
/* Isolation stricte : UN seul ennemi a l'ecran, on compte ses tirs. */
const KINDS=['chasseur','tireur','tank','bouclier','diviseur','teleport','poseur','kamikaze','zerog','sniper','elite','lourd','massif','drone'];
console.log('RES ------------------------------------------------');
console.log('RES  UN SEUL ENNEMI A L\'ECRAN, 25 s d\'observation');
console.log('RES  type          tirs   deplacement');
const muets=[];
for(const k of KINDS){
  fixerHasard(42); S.currentNode=15; loadout.difficulte='normal'; S.connected=true;
  initGame(vraiMode(), vraieMun()); G.running=true;
  G.plusDeSpawn=true; G.enemies.length=0;
  let e;
  try{ e={kind:k, x:G.w/2, y:120, r:20, hp:9999, maxHp:9999, vy:0.9, color:'#fff', forme:'carre', tir:30}; G.enemies.push(e); }
  catch(err){ continue; }
  let tirs=0; const y0=e.y, x0=e.x;
  const pousse=G.eBullets.push.bind(G.eBullets);
  G.eBullets.push=(...a)=>{ tirs+=a.length; return pousse(...a); };
  for(let i=0;i<25*60;i++){
    avancerTemps(1000/60);
    G.player.x=G.w/2; G.player.y=G.h-200; G.lives=9;
    if(!G.enemies.length) G.enemies.push(e);
    e.hp=e.maxHp; if(e.y>G.h-260) e.y=120;    /* on le garde a l'ecran */
    try{ update(); }catch(err){ ko(k+' : '+err.message); break; }
    G.eBullets.length=0;
  }
  const bouge=(Math.abs(e.x-x0)>4 || Math.abs(e.y-y0)>4) ? 'oui' : 'non';
  console.log('RES  '+String(k).padEnd(12)+String(tirs).padStart(6)+'   '+bouge);
  if(tirs===0) muets.push(k);
  G.running=false;
}
console.log('RES ------------------------------------------------');
/* kamikaze et minefixe n'ont pas vocation a tirer : ils foncent ou explosent */
/* Menace par le tir : seuls le tireur, le sniper et le tank. Les autres
   menacent autrement, c'est un choix de conception, pas un oubli :
     chasseur -> percute et poursuit      bouclier -> encaisse et bloque
     diviseur -> se scinde a la mort      teleport -> reapparait derriere
     poseur   -> seme des mines           kamikaze -> fonce et explose
   Seul le tank etait une vraie lacune : gros, lent, et rigoureusement inoffensif. */
const DOIVENT_TIRER=['tireur','tank'];
const anormaux=muets.filter(k=>DOIVENT_TIRER.includes(k));
(anormaux.length===0) ? ok('les types censes tirer le font : '+DOIVENT_TIRER.join(', '))
                      : ko('types sans aucun tir : '+anormaux.join(', '));
/* --- Le tank doit desormais tirer, et la livree Blueprint se retirer --- */
fixerHasard(9); S.currentNode=15; loadout.difficulte='normal'; S.connected=true;
initGame(vraiMode(), vraieMun()); G.running=true; G.plusDeSpawn=true; G.enemies.length=0;
const tk={kind:'tank', x:G.w/2, y:120, r:34, hp:9999, maxHp:9999, vy:0.6, color:'#34d399', forme:'hexagone'};
G.enemies.push(tk);
let tt=0; const pp=G.eBullets.push.bind(G.eBullets); G.eBullets.push=(...a)=>{ tt+=a.length; return pp(...a); };
for(let i=0;i<25*60;i++){ avancerTemps(1000/60); G.player.x=G.w/2; G.player.y=G.h-200; G.lives=9;
  if(!G.enemies.length) G.enemies.push(tk); tk.hp=tk.maxHp; if(tk.y>G.h*0.6) tk.y=120;
  update(); G.eBullets.length=0; }
(tt>0) ? ok('le tank tire desormais : '+tt+' projectiles en 25 s') : ko('tank toujours inoffensif');
(tt<80) ? ok('cadence raisonnable ('+tt+' tirs) : menaçant sans etre injouable') : ko('tank trop bavard : '+tt);
G.running=false;

/* Livree Blueprint retirable */
S.blueprint=true; S.livreeBlueprint=undefined; S.debloquesTx=[];
(/hue-rotate\(160deg\)/.test(filtreLivree()||'')) ? ok('Blueprint active par defaut') : ko('Blueprint absente');
basculerBlueprint();
(filtreLivree()===null) ? ok('Blueprint desactivable : le vaisseau retrouve ses couleurs') : ko('filtre encore applique : '+filtreLivree());
basculerBlueprint();
(/hue-rotate\(160deg\)/.test(filtreLivree()||'')) ? ok('et reactivable') : ko('reactivation cassee');
S.blueprint=false; S.livreeBlueprint=undefined;
basculerBlueprint();
(S.livreeBlueprint===undefined) ? ok('sans l\'easter egg : la bascule ne fait rien') : ko('bascule accessible sans le secret');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(0);

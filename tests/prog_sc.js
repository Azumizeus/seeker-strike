function vraiMode(){
  const base=MODES.find(m=>m.id===(loadout.mode||'pilote')) || MODES[0];
  const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  return {...base, hp:base.hp*d.hp, reward:base.reward*d.reward, cadence:d.cadence,
          diffId:d.id, flux:d.flux, vitesse:d.vitesse, bonusUnites:d.bonusUnites};
}
function vraieMun(){ return MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0]; }
const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Reproduction du bug : on termine les 3 premiers secteurs et on regarde
   ce qui devient accessible. */
S.completedNodes=[0]; S.currentNode=1; S.carteActive=1; S.nodeStars={};
function accessibles(){ return NODES.filter(n=>noeudAccessible(n)).map(n=>n.id); }
console.log('RES  depart          : '+accessibles().join(', '));
[1,2,3].forEach(id=>{ if(!S.completedNodes.includes(id)) S.completedNodes.push(id); });
const acc=accessibles();
console.log('RES  apres N1,N2,N3  : '+acc.join(', '));
const attendus=[0,1,2,3,4];
const enTrop=acc.filter(x=>!attendus.includes(x));
(enTrop.length===0) ? ok('apres 3 secteurs, seuls N0-N4 sont ouverts')
                    : ko('ouverts a tort : '+enTrop.join(', '));
(!acc.includes(12)) ? ok('NEXUS (N12) reste ferme') : ko('NEXUS accessible apres 3 secteurs !');
(!acc.includes(21)) ? ok('NEXUS PRIME (N21) reste ferme') : ko('NEXUS PRIME accessible !');
/* La carte 2 ne doit pas s'ouvrir */
(!boucleDebloquee(4)) ? ok('CHAOS PROTOCOL verrouille') : ko('CHAOS ouvert apres 3 secteurs');
/* Detail des chainages */
console.log('RES  --- chainage declare ---');
NODES.filter(n=>(n.carte||1)===1).forEach(n=>{
  console.log('RES  N'+String(n.id).padStart(2)+' -> '+JSON.stringify(n.next||[])+'   boucle '+(n.boucle||1)+'  ['+(n.type||'combat')+']');
});
console.log('RES  --- conditions de boucle ---');
Object.keys(CONDITIONS_BOUCLE||{}).forEach(k=>console.log('RES  boucle '+k+' : noeud '+CONDITIONS_BOUCLE[k].noeud));
/* ================= LE BUG SIGNALE : la demo debloquait la campagne ================= */
function neuf(){ S.completedNodes=[0]; S.currentNode=1; S.carteActive=1; S.nodeStars={};
                 S.skr=0; S.contratsRemplis=[]; S.highScore=0; S.jeuTermine=false; localStorage.removeItem('ss_v35'); }

/* On rejoue exactement le scenario : la demo tourne sur ses secteurs avances. */
neuf();
const avant=JSON.stringify({n:S.completedNodes, gc:S.skr, e:S.nodeStars});
let planta=null;
DEMO_SEQ.forEach(sq=>{
  try{
    S.connected=true; S.currentNode=sq.node; loadout.difficulte=sq.diff;
    fixerHasard(sq.node);
    initGame(vraiMode(), vraieMun());
    G.demo=true; G.lives=99; G.running=true; G.score=50000; G.frags=200; G.noyaux=30;
    endGame();
  }catch(e){ planta=sq.node+' : '+e.message; }
});
(!planta) ? ok('les '+DEMO_SEQ.length+' sequences de demo se terminent sans exception') : ko('plantage '+planta);
const apres=JSON.stringify({n:S.completedNodes, gc:S.skr, e:S.nodeStars});
(avant===apres) ? ok('apres toute la demo : progression, credits et etoiles inchanges')
                : ko('la demo a modifie la sauvegarde :\n         avant '+avant+'\n         apres '+apres);
(!S.completedNodes.includes(12)) ? ok('NEXUS non valide par la demo') : ko('NEXUS marque comme termine par la demo');
(!S.completedNodes.includes(16)) ? ok('FRACTURE non validee par la demo') : ko('FRACTURE marquee comme terminee');
(!boucleDebloquee(4)) ? ok('CHAOS PROTOCOL toujours verrouille apres la demo') : ko('CHAOS ouvert par la demo');
(S.skr===0) ? ok('aucun credit verse par la demo') : ko(S.skr+' GC verses par la demo');
/* le stockage local ne doit pas garder l'etat pollue */
try{
  const brut=JSON.parse(localStorage.getItem('ss_v35')||'{}');
  (!(brut.completedNodes||[]).includes(12)) ? ok('sauvegarde sur disque propre : NEXUS absent') : ko('NEXUS ecrit dans la sauvegarde');
}catch(e){ ko('sauvegarde illisible'); }

/* --- Une vraie partie, elle, doit bien valider --- */
neuf(); S.connected=true; S.currentNode=1; loadout.difficulte='normal';
fixerHasard(1); initGame(vraiMode(), vraieMun()); G.lives=3; G.running=true; G.score=1000;
endGame();
(S.completedNodes.includes(1)) ? ok('une partie normale valide bien le secteur') : ko('secteur non valide en jeu normal');
(S.skr>0) ? ok('une partie normale verse bien des credits ('+S.skr+' GC)') : ko('aucun credit en jeu normal');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(0);

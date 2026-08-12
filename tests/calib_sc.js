const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Mesure par tirage direct : 200 000 kills simules par difficulte.
   On appelle la vraie fonction larguerDrop, aucun raccourci. */
function mesurer(diff, kills, gros){
  loadout.difficulte=diff;
  const g={ multDrops:1, rareteButin:RARETE_DIFFICULTE[diff], viesLarguees:0, orbs:[] };
  const compte={};
  for(let i=0;i<kills;i++){
    g.orbs.length=0;
    if(i%110===0){ g.viesLarguees=0; }     /* une nouvelle partie tous les 110 kills */
    larguerDrop({kind:gros?'tank':'chasseur', x:0, y:0}, g);
    for(const o of g.orbs) compte[o.t]=(compte[o.t]||0)+1;
  }
  const tot=Object.values(compte).reduce((a,b)=>a+b,0);
  return {compte, tot, parKill:tot/kills};
}
const N=200000;
console.log('RES ---------------------------------------------------------------');
console.log('RES  BUTIN PAR SECTEUR (base 110 kills, ennemis standards)');
console.log('RES  difficulte   ennemis   butins   vies   charges   credits');
const ENN={normal:110, difficile:110*1.32, extreme:110*1.44};
const memo={};
for(const d of ['normal','difficile','extreme']){
  const m=mesurer(d,N,false); memo[d]=m;
  const e=ENN[d];
  const f=(k)=> (m.compte[k]||0)/N*e;
  const vies=f('vie'), ch=f('mitra')+f('nuke')+f('ghost'), cr=f('noyau')+f('eclat');
  console.log('RES  '+d.padEnd(12)+e.toFixed(0).padStart(6)+ (m.parKill*e).toFixed(1).padStart(9)+
              vies.toFixed(2).padStart(7)+ch.toFixed(1).padStart(10)+cr.toFixed(1).padStart(10));
}
console.log('RES ---------------------------------------------------------------');
/* --- Verifications --- */
const vN=(memo.normal.compte.vie||0)/N, vE=(memo.extreme.compte.vie||0)/N;
(vN>0.006 && vN<0.010) ? ok('1 vie tous les '+Math.round(1/vN)+' kills en normal (cible : 100 a 160)')
                       : ko('taux de vie hors cible : 1 pour '+Math.round(1/vN));
const butinN=memo.normal.parKill*ENN.normal, butinE=memo.extreme.parKill*ENN.extreme;
(butinE < butinN) ? ok('extreme rapporte MOINS de butin que normal en valeur absolue ('+
                       butinE.toFixed(1)+' contre '+butinN.toFixed(1)+') malgre 44% d\'ennemis en plus')
                  : ko('extreme rapporte encore plus : '+butinE.toFixed(1)+' vs '+butinN.toFixed(1));
(memo.normal.parKill>0.24 && memo.normal.parKill<0.28) ? ok('un ennemi standard sur quatre laisse un butin ('+
                       (memo.normal.parKill*100).toFixed(1)+'%)') : ko('taux de base : '+memo.normal.parKill);
const grosM=mesurer('normal',50000,true);
(grosM.parKill>0.50 && grosM.parKill<0.55) ? ok('les gros ennemis lachent dans '+(grosM.parKill*100).toFixed(0)+'% des cas')
                                           : ko('gros ennemis : '+grosM.parKill);
/* plafond de vies */
loadout.difficulte='normal';
const g2={multDrops:1, rareteButin:1, viesLarguees:0, orbs:[]};
let vies=0;
for(let i=0;i<4000;i++){ g2.orbs.length=0; larguerDrop({kind:'chasseur'},g2); for(const o of g2.orbs) if(o.t==='vie') vies++; }
(vies<=MAX_VIES_LARGUEES) ? ok('plafond respecte : '+vies+' vies max larguees sur une partie de 4 000 kills')
                          : ko('plafond ignore : '+vies+' vies');
/* les credits ne doivent pas s'ecrouler : c'est l'economie GC des vaisseaux */
const crN=((memo.normal.compte.noyau||0)+(memo.normal.compte.eclat||0))/N*ENN.normal;
(crN>10) ? ok(crN.toFixed(1)+' ramassages de credits par secteur : economie GC preservee')
         : ko('credits trop rares : '+crN.toFixed(1));
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

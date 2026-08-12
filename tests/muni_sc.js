const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
function vraiMode(){ const b=MODES.find(m=>m.id===(loadout.mode||'pilote'))||MODES[0];
  const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  return {...b, hp:b.hp*d.hp, reward:b.reward*d.reward, cadence:d.cadence, diffId:d.id,
          flux:d.flux, vitesse:d.vitesse, bonusUnites:d.bonusUnites}; }
/* Mesure reelle : on declenche fire() et on additionne les degats emis. */
function mesurer(munId, niveauArme){
  S.currentNode=5; loadout.difficulte='normal'; S.connected=true; S.weapon=niveauArme;
  loadout.munition=munId;
  fixerHasard(3);
  initGame(vraiMode(), MUNITIONS.find(m=>m.id===munId));
  G.running=true; G.bullets.length=0;
  fire();
  const tirs=G.bullets.slice();
  const total=tirs.reduce((t,b)=>t+b.dmg,0);
  const centre=tirs[0].dmg;
  G.running=false;
  const mun=MUNITIONS.find(m=>m.id===munId);
  return { n:tirs.length, total, centre, nappe:total*mun.rate, unique:centre*mun.rate };
}
console.log('RES ---------------------------------------------------------------');
console.log('RES  MUNITIONS — arme niveau 1');
console.log('RES  munition        tirs   DPS nappe   DPS cible unique');
const m={};
['std','perf','spread','hyper'].forEach(id=>{
  const r=mesurer(id,1); m[id]=r;
  console.log('RES  '+MUNITIONS.find(x=>x.id===id).name.padEnd(15)+String(r.n).padStart(4)+
              r.nappe.toFixed(2).padStart(12)+r.unique.toFixed(2).padStart(19));
});
console.log('RES ---------------------------------------------------------------');
const ref=m.std.nappe;
const ecart=Math.max(...Object.values(m).map(x=>x.nappe))/ref;
(ecart<1.6) ? ok('ecart maximal entre munitions : x'+ecart.toFixed(2)+' (etait x3.29 avant correction)')
            : ko('ecart encore trop fort : x'+ecart.toFixed(2));
(m.spread.nappe>m.std.nappe) ? ok('Spread reste le meilleur en nappe') : ko('Spread n\'a plus d\'interet');
(m.spread.unique<m.std.unique) ? ok('Spread est le plus faible sur cible unique : son role est clair') : ko('Spread domine partout');
(m.spread.n===5) ? ok('Spread tire bien 5 projectiles') : ko(m.spread.n+' projectiles');
(m.perf.unique>m.spread.unique) ? ok('Perforantes reste la reference sur boss') : ko('Perforantes depassee sur cible unique');

/* Arme haut niveau : les tirs lateraux ne doivent pas exploser le DPS */
const hautStd=mesurer('std',5);
console.log('RES  arme niveau 5, Standard : '+hautStd.n+' projectiles, DPS nappe '+hautStd.nappe.toFixed(2)+' (relatif '+(hautStd.nappe/hautStd.centre/MUNITIONS[0].rate).toFixed(2)+'x le tir central)');
((hautStd.nappe/hautStd.unique)<2) ? ok('arme haut niveau : la couverture ajoute moins du double, pas du triple') : ko('explosion du DPS a haut niveau');

/* --- Accessibilite : plus de conteneur interactif masque --- */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(!/aria-hidden="true"/.test(src)) ? ok('aucun conteneur interactif marque aria-hidden') : ko('aria-hidden encore present');
(/id="choix-langue" role="dialog"/.test(src)) ? ok('choix de langue annonce comme boite de dialogue') : ko('role manquant');
(/id="voile-rotation" role="alertdialog"/.test(src)) ? ok('voile de rotation annonce comme alerte') : ko('role manquant');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

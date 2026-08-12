const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);const wa=m=>R.push('RES !!  '+m);
/* ===================== AUDIT STATIQUE : COHERENCE DES DONNEES ===================== */
/* 1. Vaisseaux */
const ids=SHIPS.map(s=>s.id);
(new Set(ids).size===ids.length) ? ok('vaisseaux : identifiants uniques ('+ids.length+')') : ko('identifiants dupliques');
(SHIPS.every(s=>s.name && s.bonus>0)) ? ok('vaisseaux : nom et bonus de degats definis partout') : ko('vaisseau incomplet');
(TIRS.length>=SHIPS.length) ? ok('vaisseaux : une signature de tir par vaisseau ('+TIRS.length+')') : ko('signatures de tir manquantes : '+TIRS.length+' pour '+SHIPS.length);
(SHIPS.every(s=>FICHES_VAISSEAU[s.id])) ? ok('vaisseaux : une fiche de hangar pour chacun') : ko('fiche manquante');
const gratuits=SHIPS.filter(s=>!s.sol && !s.skr && !s.cond);
(gratuits.length===2) ? ok('vaisseaux : '+gratuits.length+' offerts au depart ('+gratuits.map(s=>s.name).join(', ')+')') : wa(gratuits.length+' vaisseaux gratuits sans condition');
/* 2. Noeuds */
const nid=NODES.map(n=>n.id);
(new Set(nid).size===nid.length) ? ok('carte : '+nid.length+' noeuds, identifiants uniques') : ko('noeuds dupliques');
const orphelins=NODES.filter(n=>(n.next||[]).some(x=>!nid.includes(x)));
(orphelins.length===0) ? ok('carte : aucun lien vers un noeud inexistant') : ko('liens casses : '+orphelins.map(n=>n.id));
const sansTitre=NODES.filter(n=>!n.title||!n.brief);
(sansTitre.length===0) ? ok('carte : titre et briefing partout') : ko('noeuds sans texte : '+sansTitre.map(n=>n.id));
/* 3. Boss */
const bossHorsCarte=Object.keys(BOSS_DEFS).filter(k=>!nid.includes(+k));
(bossHorsCarte.length===0) ? ok('boss : les '+Object.keys(BOSS_DEFS).length+' boss sont sur des noeuds existants') : ko('boss orphelins : '+bossHorsCarte);
(Object.values(BOSS_DEFS).every(b=>b.nom && b.hpMult>0 && b.rayon>0)) ? ok('boss : nom, multiplicateur de PV et rayon definis') : ko('boss incomplet');
/* 4. Difficultes */
(Object.keys(DIFFICULTES).length===3) ? ok('difficultes : 3 paliers') : ko('difficultes : '+Object.keys(DIFFICULTES).length);
const dOrd=['normal','difficile','extreme'].map(k=>DIFFICULTES[k]);
(dOrd[0].hp<dOrd[1].hp && dOrd[1].hp<dOrd[2].hp) ? ok('difficultes : PV ennemis strictement croissants ('+dOrd.map(d=>d.hp).join(' < ')+')') : ko('PV non croissants');
(dOrd[0].reward<dOrd[1].reward && dOrd[1].reward<dOrd[2].reward) ? ok('difficultes : recompenses croissantes ('+dOrd.map(d=>d.reward).join(' < ')+')') : ko('recompenses non croissantes');
(RARETE_DIFFICULTE.normal>RARETE_DIFFICULTE.difficile && RARETE_DIFFICULTE.difficile>RARETE_DIFFICULTE.extreme)
  ? ok('difficultes : butin de plus en plus rare ('+Object.values(RARETE_DIFFICULTE).join(' > ')+')') : ko('rarete non decroissante');
/* 5. Economie */
const payants=SHIPS.filter(s=>s.sol>0);
const taux=payants.map(s=>s.skr/s.sol);
(Math.max(...taux)-Math.min(...taux)<1500) ? ok('economie : taux SKR/SOL homogene ('+Math.round(Math.min(...taux))+' a '+Math.round(Math.max(...taux))+')') : ko('taux incoherents');
(TRESORERIE.frais>0 && TRESORERIE.frais<=0.01) ? ok('economie : frais de tresorerie raisonnables ('+TRESORERIE.frais+' SOL)') : wa('frais : '+TRESORERIE.frais+' SOL');
(TRESORERIE.adresse===DONS.adresse) ? ok('economie : tresorerie et dons sur la meme adresse') : wa('deux adresses distinctes');
/* 6. Paliers on-chain : aucune puissance */
const motsPuissance=/(vie|arme|degat|dégât|cadence|bouclier|puissance|bonus de tir)/i;
const suspects=PALIERS_TX.filter(p=>motsPuissance.test(p.recompense));
(suspects.length===0) ? ok('paliers : aucune recompense de puissance sur les '+PALIERS_TX.length+' paliers') : ko('recompense suspecte : '+suspects.map(p=>p.n));
/* 7. Butin */
const poidsTotal=DROPS_CLES.reduce((t,k)=>t+DROPS[k].poids,0);
(poidsTotal===DROPS_TOTAL) ? ok('butin : somme des poids coherente ('+poidsTotal+')') : ko('poids incoherents');
(DROPS.vie.poids < DROPS.noyau.poids) ? ok('butin : la vie ('+DROPS.vie.poids+') est plus rare que les credits ('+DROPS.noyau.poids+')') : ko('vie trop frequente');
(DROPS_CLES.every(k=>DROPS[k].slot && DROPS[k].nom)) ? ok('butin : sprite et libelle pour chaque objet') : ko('objet incomplet');
/* 8. Secrets et quetes */
(new Set(SECRETS.map(s=>s.id)).size===SECRETS.length) ? ok('secrets : '+SECRETS.length+' identifiants uniques') : ko('secrets dupliques');
const qs=listeQuetes();
(new Set(qs.map(q=>q.id)).size===qs.length) ? ok('quetes : '+qs.length+' identifiants uniques') : ko('quetes dupliquees');
(qs.every(q=>q.m>0 && q.skr>0)) ? ok('quetes : objectif et recompense definis partout') : ko('quete incomplete');
/* 9. Assets references mais jamais charges */
const charges=new Set(Object.keys(ASSETS));
const manquants=[];
SHIPS.forEach(s=>{ if(!charges.has('ship'+s.id)) manquants.push('ship'+s.id); });
Object.values(BOSS_DEFS).forEach(b=>{ (b.sprites||[b.sprite]).forEach(k=>{ if(k&&!charges.has(k)) manquants.push(k); }); });
Object.values(PROJ_SPRITE).forEach(k=>{ if(!charges.has(k)) manquants.push(k); });
BONUSES.forEach(b=>{ if(!charges.has(b.slot)) manquants.push(b.slot); });
DROPS_CLES.forEach(k=>{ if(!charges.has(DROPS[k].slot)) manquants.push(DROPS[k].slot); });
(manquants.length===0) ? ok('assets : tous les sprites references existent dans la table') : ko('slots inconnus : '+[...new Set(manquants)].join(', '));
/* 10. Sauvegarde */
const avant=JSON.stringify(S);
save(); load();
(typeof S.skr==='number' && typeof S.unlocked==='object') ? ok('sauvegarde : cycle save/load sans perte de structure') : ko('sauvegarde cassee');
S.unlocked=[999]; S.ship=999; load();
(S.unlocked.includes(0) && SHIPS.some(s=>s.id===S.ship)) ? ok('sauvegarde : une save trafiquee est rattrapee au chargement') : ko('save trafiquee acceptee');
S.skr=-500; S.txTotal=-3; load();
(S.skr>=0 && S.txTotal>=0) ? ok('sauvegarde : valeurs negatives corrigees') : ko('negatifs : skr='+S.skr+' tx='+S.txTotal);
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length, w=R.filter(l=>l.startsWith('RES !!')).length;
console.log(n?('RES '+n+' ECHECS'+(w?' / '+w+' avertissements':'')):('RES TOUS LES TESTS PASSENT'+(w?' ('+w+' avertissements)':'')));
process.exit(n?1:0);

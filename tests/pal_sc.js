const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
function neuf(){ S.txTotal=0; S.debloquesTx=[]; S.indicatif=''; S.walletReel=true; S.connected=true; S.skr=0; S.quetesReclamees=[]; }

/* ---- 1. Les six paliers ---- */
const seuils=PALIERS_TX.map(p=>p.seuil);
(JSON.stringify(seuils)==='[5,15,30,45,60,75,90,100,120,150]') ? ok('10 paliers : '+seuils.join(', ')) : ko('paliers : '+seuils);
PALIERS_TX.every(p=>p.gc>0) ? ok('chaque palier verse des GC') : ko('palier sans GC');
PALIERS_TX.every(p=>p.recompense && p.recompense.length>10) ? ok('chaque palier annonce sa recompense') : ko('recompense manquante');

/* ---- 2. Deblocage progressif ---- */
neuf();
creditTX(4);
(!debloque('journal')) ? ok('4 TX : journal encore verrouille') : ko('journal debloque trop tot');
creditTX(1);
(debloque('journal')) ? ok('5 TX : journal on-chain debloque') : ko('journal non debloque a 5');
(!debloque('livree')) ? ok('5 TX : livree encore verrouillee') : ko('livree debloquee trop tot');
creditTX(25);
(debloque('eligible') && debloque('livree')) ? ok('30 TX : badge ELIGIBLE et livree chromee debloques') : ko('paliers 15/30 manques');
(S.indicatif==='') ? ok('30 TX : aucun indicatif attribue') : ko('indicatif premature');
creditTX(30);
(debloque('indicatif') && S.indicatif===INDICATIFS[0]) ? ok('60 TX : indicatif debloque, "'+S.indicatif+'" par defaut') : ko('indicatif : '+S.indicatif);
creditTX(30);
(debloque('hud')) ? ok('90 TX : theme HUD Genesis debloque') : ko('hud non debloque');
(!debloque('validateur')) ? ok('90 TX : rang VALIDATEUR encore hors de portee') : ko('validateur trop tot');
creditTX(10);
(debloque('validateur')) ? ok('100 TX : rang VALIDATEUR obtenu') : ko('validateur non debloque');
(S.debloquesTx.length===8) ? ok('a 100 TX : 8 des 10 deblocages acquis') : ko(S.debloquesTx.length+' deblocages');

/* ---- 3. Anti-triche : la simulation ne compte pas ---- */
neuf(); S.walletReel=false;
creditTX(200);
(txCumulees()===0 && S.debloquesTx.length===0) ? ok('mode simulation : 200 TX ignorees, aucun palier debloque')
                                               : ko('simulation comptee : '+txCumulees());
S.walletReel=true;

/* ---- 4. Un deblocage ne se reprend jamais ---- */
neuf(); creditTX(100);
const avant=S.debloquesTx.slice();
S.txTotal=0; verifierPaliersTX();
(S.debloquesTx.length===avant.length) ? ok('remise a zero du compteur : les deblocages restent acquis') : ko('deblocages perdus');

/* ---- 5. Pas de double deblocage ---- */
neuf(); creditTX(100); creditTX(100);
(new Set(S.debloquesTx).size===S.debloquesTx.length) ? ok('aucun doublon dans les deblocages') : ko('doublons : '+S.debloquesTx);

/* ---- 6. Aucune recompense de puissance ---- */
neuf(); const armeAvant=S.weapon, viesAvant=S.maxLives, cadAvant=S.fireRate;
creditTX(100);
(S.weapon===armeAvant && S.maxLives===viesAvant && S.fireRate===cadAvant)
  ? ok('100 TX : arme, vies et cadence inchangees — aucun pay-to-win')
  : ko('un palier a modifie la puissance');

/* ---- 7. Livrees ---- */
neuf();
(filtreLivree()===null) ? ok('sans palier : aucun filtre applique au vaisseau') : ko('filtre parasite');
creditTX(30);
(/saturate\(0\.25\)/.test(filtreLivree()||'')) ? ok('30 TX : livree chromee active') : ko('livree chromee absente');
creditTX(70);
(/hue-rotate/.test(filtreLivree()||'')) ? ok('100 TX : la livree doree remplace la chromee') : ko('livree doree absente');

/* ---- 8. Les paliers apparaissent dans les quetes ---- */
neuf(); creditTX(60);
const qs=listeQuetes();
const pal=qs.filter(q=>q.palier);
(pal.length===10) ? ok('les 10 paliers apparaissent dans les quetes') : ko(pal.length+' paliers dans les quetes');
(pal.every(q=>q.c===60)) ? ok('la progression affichee suit le compteur reel (60 TX)') : ko('progression incoherente');
const pretes=pal.filter(q=>q.c>=q.m).length;
(pretes===5) ? ok('a 60 TX : 5 paliers reclamables (5, 15, 30, 45, 60)') : ko(pretes+' reclamables');

/* ---- 9. Reclamation ---- */
neuf(); creditTX(60); S.skr=0;
reclamerQuete('tx30');
(S.skr===900) ? ok('reclamation du palier 30 : +900 GC') : ko('GC : '+S.skr);
reclamerQuete('tx30');
(S.skr===900) ? ok('reclamation deja faite : rien de plus') : ko('double reclamation : '+S.skr);
/* palier hors de portee */
reclamerQuete('tx100');
(!(S.quetesReclamees||[]).includes('tx100')) ? ok('palier non atteint : reclamation refusee') : ko('palier 100 reclame a 60 TX');
/* wallet simule : refus */
S.walletReel=false; S.skr=0; S.quetesReclamees=[];
reclamerQuete('tx5');
(S.skr===0) ? ok('wallet simule : reclamation d\'un palier refusee') : ko('reclame en simulation');
S.walletReel=true;

/* ---- 10. Indicatif ---- */
neuf(); creditTX(60);
choisirIndicatif('ORACLE');
(S.indicatif==='ORACLE') ? ok('changement d\'indicatif : "ORACLE"') : ko('indicatif : '+S.indicatif);
neuf(); choisirIndicatif('ORACLE');
(S.indicatif!=='ORACLE') ? ok('indicatif verrouille tant que le palier 60 n\'est pas atteint') : ko('indicatif accessible trop tot');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

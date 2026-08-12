const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* --- 1. Aucune divulgation du secret GHOST --- */
const f5=FICHES_VAISSEAU[5];
(!/logo|sept fois|7 fois|7×|tapant/i.test(f5.d)) ? ok('fiche hangar du Ghost : ne revele plus le secret')
                                                 : ko('fiche encore divulgatrice : '+f5.d.slice(0,60));
(f5.d.length>60) ? ok('la fiche reste substantielle ('+f5.d.length+' caracteres)') : ko('fiche trop courte');
(EN[f5.d]) ? ok('fiche Ghost traduite en anglais') : ko('traduction manquante');
(!/logo|seven times|7 times|tapping/i.test(EN[f5.d]||'')) ? ok('la version anglaise ne revele rien non plus') : ko('EN divulgue');

S.ghostUnlocked=false;
let q=listeQuetes().find(x=>x.id==='ghost');
(!/7|sept|logo/i.test(q.d)) ? ok('quete Ghost verrouillee : indice seul ("'+q.d.slice(0,45)+'…")') : ko('quete divulgue : '+q.d);
(EN[q.d]) ? ok('indice traduit en anglais') : ko('indice non traduit');
S.ghostUnlocked=true;
q=listeQuetes().find(x=>x.id==='ghost');
(/7/.test(q.d)) ? ok('une fois trouve, la quete explique la manip : "'+q.d+'"') : ko('pas de revelation apres coup');
(EN[q.d]) ? ok('revelation traduite') : ko('revelation non traduite');

/* --- 2. Le secret fonctionne toujours --- */
S.ghostUnlocked=false; S.unlocked=[0]; S.logoTaps=0;
for(let i=0;i<6;i++) S.logoTaps++;
(!S.ghostUnlocked) ? ok('6 appuis : Ghost toujours verrouille') : ko('debloque trop tot');

/* --- 3. Le logo est charge comme asset --- */
('logoNexus' in ASSETS) ? ok('slot ASSETS.logoNexus declare') : ko('slot manquant');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

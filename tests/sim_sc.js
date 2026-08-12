const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
/* --- 1. Plus aucun mode simulation --- */
(typeof S.txSimu==='undefined') ? ok('S.txSimu supprime de l\'etat') : ko('txSimu encore present');
S.txOnChain=7; S.walletReel=false;
(taskFaites()===7) ? ok('taskFaites() ne lit que les TX reelles') : ko('taskFaites : '+taskFaites());

/* --- 2. Sans wallet, la Seeker Task refuse --- */
S.connected=true; S.walletReel=false; S.txOnChain=0; S.lotsTask=0; S.skr=0; S.taskRecompensee=false;
CHAINE.enCours=false;
await envoyerSeekerTask();
(S.txOnChain===0 && S.lotsTask===0 && S.skr===0)
  ? ok('sans wallet reel : aucune TX, aucun GC, rien de simule') : ko('etat modifie : tx='+S.txOnChain+' gc='+S.skr);

/* --- 3. Le compteur de paliers ignore l'absence de wallet --- */
S.txTotal=0; S.debloquesTx=[]; S.walletReel=false;
creditTX(200);
(txCumulees()===0 && S.debloquesTx.length===0) ? ok('sans wallet : aucun palier ne se debloque') : ko('paliers debloques sans wallet');

/* --- 4. Reclamation refusee sans wallet --- */
S.walletReel=true; S.txTotal=0; S.debloquesTx=[]; creditTX(100);
S.walletReel=false; S.skr=0; S.quetesReclamees=[];
reclamerQuete('tx30');
(S.skr===0) ? ok('reclamation d\'un palier refusee sans wallet') : ko('reclame sans wallet : '+S.skr);
S.walletReel=true; reclamerQuete('tx30');
(S.skr===900) ? ok('avec wallet : reclamation acceptee (+900 GC)') : ko('GC : '+S.skr);

/* --- 5. Achat SKR et dons : refus propre --- */
S.walletReel=false; S.unlocked=[0]; CHAINE.enCours=false;
await unlockShip(6,'skr');
(!S.unlocked.includes(6)) ? ok('achat SKR refuse sans wallet') : ko('achat passe');
S.donsSol=0; CHAINE.enCours=false;
await donnerSOL(0.05);
(S.donsSol===0) ? ok('don SOL refuse sans wallet') : ko('don passe');

/* --- 6. Le libelle d'etat ne parle plus de simulation --- */
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));
S.walletReel=false; S.connected=true; majSeekerTask();
const e=String(cache['task-etat'].textContent||'');
(!/simul/i.test(e)) ? ok('etat de la task sans mention de simulation : « '+e+' »') : ko('mention residuelle : '+e);
S.walletReel=true; majSeekerTask();
(/devnet|connect/i.test(String(cache['task-etat'].textContent))) ? ok('avec wallet : « '+cache['task-etat'].textContent+' »') : ko('etat connecte incorrect');

/* --- 7. Traductions des nouveaux messages --- */
['Annuler','Connexion échouée','Connecte un wallet pour envoyer des transactions',
 'Wallet connecté • devnet','Wallet non connecté','non connecté'].forEach(k=>{
  EN[k] ? ok('traduction presente : « '+k.slice(0,38)+' »') : ko('traduction manquante : '+k);
});

/* --- 8. Icones des bonus --- */
(BONUSES.length===3) ? ok('3 bonus') : ko(BONUSES.length+' bonus');
BONUSES.every(b=>b.slot && b.emoji) ? ok('chaque bonus a un sprite et un emoji de repli') : ko('sprite manquant');
BONUSES.every(b=>!/[🔫☢👻]/.test(b.name)) ? ok('les noms ne contiennent plus d\'emoji') : ko('emoji dans un nom');
BONUSES.every(b=>EN[b.name] && EN[b.desc]) ? ok('noms et descriptions des bonus traduits') : ko('traduction de bonus manquante');
(['pwMinigun','pwNuke','pwGhost'].every(k=>k in ASSETS)) ? ok('slots pwMinigun / pwNuke / pwGhost declares') : ko('slot manquant');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* --- LE BUG SIGNALE : des vaisseaux debloques sans achat --- */
localStorage.removeItem('ss_v35');
S.unlocked=[0,1]; S.ship=0; S.skr=0; S.signatures=[]; S.demoNettoyee=true;
save();
const propre=JSON.parse(localStorage.getItem('ss_v35'));
(propre.unlocked.length===2) ? ok('depart : 2 vaisseaux offerts') : ko('depart : '+propre.unlocked);

/* On simule la demo : elle debloque ses vaisseaux de vitrine et sauvegarde. */
_demoActive=true;
[2,5,4,7,10].forEach(id=>{ if(!S.unlocked.includes(id)) S.unlocked.push(id); });
S.ship=4; S.skr=99999;
save();                                   /* <- c'est ce save qui fuyait */
const pendant=JSON.parse(localStorage.getItem('ss_v35'));
(pendant.unlocked.length===2) ? ok('pendant la demo : le disque reste intact (2 vaisseaux)')
                              : ko('fuite : '+pendant.unlocked.join(','));
(pendant.skr===0) ? ok('pendant la demo : aucun credit ecrit sur le disque') : ko('credits fuites : '+pendant.skr);
_demoActive=false;

/* Sortie de demo : on restaure et on reecrit */
S.unlocked=[0,1]; S.ship=0; S.skr=0; save();
const apres=JSON.parse(localStorage.getItem('ss_v35'));
(apres.unlocked.length===2 && apres.skr===0) ? ok('apres la demo : sauvegarde propre reecrite') : ko('sauvegarde : '+JSON.stringify(apres.unlocked));

/* --- Reparation d'une sauvegarde deja polluee --- */
S.unlocked=[0,1,2,4,7,10];        /* etat tel qu'on l'a constate en production */
S.signatures=[]; S.ghostUnlocked=false; delete S.demoNettoyee;
save(); load();
const payantsRestants=S.unlocked.filter(id=>{ const sh=SHIPS.find(x=>x.id===id); return sh && sh.sol>0; });
(payantsRestants.length===0) ? ok('reparation : les vaisseaux payants non attestes sont retires') : ko('restent : '+payantsRestants);
(S.unlocked.includes(0) && S.unlocked.includes(1)) ? ok('reparation : les 2 vaisseaux offerts sont conserves') : ko('offerts perdus : '+S.unlocked);
(S.demoNettoyee===true) ? ok('reparation faite une seule fois (marqueur pose)') : ko('marqueur absent');

/* Un vaisseau reellement achete doit survivre */
delete S.demoNettoyee;
S.unlocked=[0,1,6]; S.signatures=[{action:'ship:6', sig:'x', t:Date.now()}];
save(); load();
(S.unlocked.includes(6)) ? ok('un vaisseau atteste par une transaction est conserve') : ko('achat legitime efface');

/* Un vaisseau merite (condition) survit aussi */
delete S.demoNettoyee;
S.unlocked=[0,1,8]; S.signatures=[];
save(); load();
(S.unlocked.includes(8)) ? ok('un vaisseau a condition est conserve (il se merite, il ne s\'achete pas)') : ko('vaisseau merite efface');

/* --- Terminal : plus de contradiction aria --- */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(!/id="terminal-carte"[^>]*aria-hidden/.test(src)) ? ok('terminal : aria-hidden retire du conteneur interactif') : ko('aria-hidden encore present');
(/id="term-onglet"[^>]*aria-expanded/.test(src)) ? ok('terminal : aria-expanded annonce l\'etat d\'ouverture') : ko('aria-expanded absent');

/* --- Plein ecran : plafond de tentatives --- */
(/_essaisPleinEcran>=3/.test(src)) ? ok('plein ecran : trois tentatives au maximum, plus de boucle de refus') : ko('plafond absent');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

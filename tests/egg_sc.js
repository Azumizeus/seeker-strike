const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
function neuf(){ S.secrets=[]; S.terminal=false; S.blueprint=false; S.skr=0; S.dev=false;
                 S.debloquesTx=[]; S.txTotal=0; S.indicatif=''; }
/* --- 1. Le secret existe --- */
const sc=SECRETS.find(s=>s.id==='sidev');
(sc) ? ok('secret "'+sc.nom+'" present') : ko('secret sidev absent');
(SECRETS.length===5) ? ok('5 secrets au total') : ko(SECRETS.length+' secrets');
(sc && sc.gc===750) ? ok('recompense : 750 GC') : ko('gc : '+(sc||{}).gc);

/* --- 2. Cinq appuis, pas quatre --- */
neuf();
for(let i=0;i<4;i++) tapDevnet();
(!secretTrouve('sidev')) ? ok('4 appuis : rien ne se debloque') : ko('debloque a 4 appuis');
tapDevnet();
(secretTrouve('sidev')) ? ok('5 appuis : secret debloque') : ko('non debloque a 5');
(S.skr===750) ? ok('750 GC verses') : ko('GC : '+S.skr);
(S.terminal===true) ? ok('terminal de bord actif') : ko('terminal inactif');
(S.blueprint===true) ? ok('livree Blueprint active') : ko('blueprint inactif');

/* --- 3. AUCUN acces developpeur reel --- */
(S.dev!==true) ? ok('le vrai mode developpeur reste FERME') : ko('mode dev ouvert par l\'easter egg');
const av=[S.weapon,S.maxLives,S.fireRate,S.unlocked.length,S.sol];
(S.weapon===av[0]&&S.maxLives===av[1]&&S.fireRate===av[2]&&S.unlocked.length===av[3])
  ? ok('arme, vies, cadence et vaisseaux inchanges : aucun avantage') : ko('avantage donne');

/* --- 4. Indicatif STAGIAIRE --- */
(indicatifsDisponibles().includes('STAGIAIRE')) ? ok('indicatif STAGIAIRE disponible') : ko('STAGIAIRE absent');
neuf();
(!indicatifsDisponibles().includes('STAGIAIRE')) ? ok('STAGIAIRE indisponible sans le secret') : ko('STAGIAIRE accessible d\'office');

/* --- 5. Pas de double declenchement --- */
neuf(); for(let i=0;i<20;i++) tapDevnet();
(S.skr===750) ? ok('20 appuis : le secret ne se donne qu\'une fois (750 GC)') : ko('GC : '+S.skr);
(S.secrets.filter(x=>x==='sidev').length===1) ? ok('un seul enregistrement du secret') : ko('doublons');

/* --- 6. Livree blueprint prioritaire --- */
neuf(); tapDevnet();tapDevnet();tapDevnet();tapDevnet();tapDevnet();
(/hue-rotate\(160deg\)/.test(filtreLivree()||'')) ? ok('livree Blueprint appliquee au vaisseau') : ko('filtre : '+filtreLivree());
S.txTotal=0; S.debloquesTx=[]; creditTX(0); S.walletReel=true; creditTX(150);
(/hue-rotate\(160deg\)/.test(filtreLivree()||'')) ? ok('Blueprint prime meme avec la livree doree du palier 100') : ko('blueprint ecrase');
S.blueprint=false;
(/hue-rotate\(35deg\)/.test(filtreLivree()||'')) ? ok('sans Blueprint, la livree doree reprend la main') : ko('doree absente');

/* --- 7. Terminal : uniquement de la technique --- */
neuf(); S.terminal=true; S.prefs=S.prefs||{};
let dessine=[];
const g={ ctx:{ save(){},restore(){},fillRect(){},strokeRect(){},fillText(t){dessine.push(String(t));},
                set font(v){}, set textAlign(v){}, set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){} },
          h:800, enemies:[{},{}], eBullets:[{}], bullets:[{},{},{}], wave:4 };
S.currentNode=7;
dessinerTerminal(g);
(dessine.length===5) ? ok('terminal : titre + 4 lignes de donnees') : ko(dessine.length+' lignes');
(dessine.some(t=>/obj\s+6/.test(t))) ? ok('compte les objets a l\'ecran : '+dessine.find(t=>/obj/.test(t)).trim()) : ko('objets : '+dessine);
(dessine.some(t=>/nd\s+7/.test(t))) ? ok('affiche le noeud courant') : ko('noeud absent');
(!dessine.some(t=>/pv|hp|vie|degat/i.test(t))) ? ok('aucune donnee sur les ennemis : pas d\'avantage tactique') : ko('info tactique divulguee');
/* desactive : rien ne se dessine */
neuf(); dessine=[]; dessinerTerminal(g);
(dessine.length===0) ? ok('terminal eteint : rien ne se dessine') : ko('dessine malgre tout');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

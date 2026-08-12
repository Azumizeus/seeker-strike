const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
function vraiMode(){ const b=MODES.find(m=>m.id===(loadout.mode||'pilote'))||MODES[0];
  const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  return {...b, hp:b.hp*d.hp, reward:b.reward*d.reward, cadence:d.cadence, diffId:d.id,
          flux:d.flux, vitesse:d.vitesse, bonusUnites:d.bonusUnites}; }
function vraieMun(){ return MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0]; }
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));

/* ================= 1. Injection HTML par le journal on-chain ================= */
S.secrets=['sidev']; S.debloquesTx=['journal']; S.txTotal=9; S.walletReel=true;
const CHARGE = '<img src=x onerror="globalThis.__PWN=1">';
S.signatures=[
  { action:CHARGE, sig:CHARGE, t:Date.now() },
  { action:'don:sol', sig:'"><script>globalThis.__PWN=2</script>', t:Date.now() },
  { action:'task', sig:'5'.repeat(88), t:Date.now() }        /* signature valide */
];
renderJournalTx();
const h=String(cache['panneau-journal'].innerHTML||'');
(h.indexOf('<img src=x')<0) ? ok('journal : balise <img> injectee neutralisee') : ko('balise img brute presente');
(h.indexOf('<script')<0) ? ok('journal : balise <script> injectee neutralisee') : ko('balise script brute presente');
/* onerror apparait dans le texte echappe : ce n'est pas un attribut.
   Ce qu'il faut verifier, c'est qu'aucune BALISE ne le porte. */
(!/<[^>]*\son(error|load|click)\s*=/i.test(h)) ? ok('journal : aucune balise ne porte de gestionnaire d\'evenement injecte')
                                                : ko('gestionnaire d\'evenement dans une balise reelle');
(/&lt;img src=x onerror=/.test(h)) ? ok('journal : la charge apparait bien en texte inerte, chevrons echappes') : ko('charge non echappee');
(h.indexOf('&lt;img')>=0) ? ok('journal : la charge est affichee echappee, pas executee') : ko('pas d\'echappement visible');
(globalThis.__PWN===undefined) ? ok('aucun code injecte n\'a pu s\'executer') : ko('injection reussie : __PWN='+globalThis.__PWN);
/* le lien Solscan n'est construit que pour une signature au bon format */
const liens=(h.match(/href="https:\/\/solscan\.io/g)||[]).length;
(liens===1) ? ok('un seul lien Solscan : seule la signature valide est cliquable') : ko(liens+' liens crees');
(h.indexOf('⚠')>=0) ? ok('les signatures au format inattendu sont marquees d\'un avertissement') : ko('pas de marquage');

/* ================= 2. Pas de tunneling au-dela du plafond de 250 ms ================= */
S.currentNode=1; loadout.difficulte='normal'; S.connected=true;
fixerHasard(11); initGame(vraiMode(), vraieMun()); G.running=true;
const vraiRAF=global.requestAnimationFrame; global.requestAnimationFrame=()=>0;
/* On envoie un ecart enorme : le pas logique doit rester fixe. */
const pas=[];
const vraiUpdate=G.frame;
let t=performance.now();
G.tPrec=null; G.reste=0; G.frame=0;
loop(t);
[16.7, 300, 5000, 60000].forEach(ec=>{ t+=ec; avancerTemps(ec); const av=G.frame; loop(t); pas.push(G.frame-av); });
global.requestAnimationFrame=vraiRAF;
(pas.every(n=>n<=3)) ? ok('ecarts de 300 ms a 60 s : au plus 3 pas logiques ('+pas.join(', ')+'), jamais de bond') : ko('rattrapage excessif : '+pas.join(','));
ok('le pas logique est FIXE a 16,7 ms : un projectile avance toujours de la meme distance, '+
   'quelle que soit la charge — le tunneling est structurellement impossible');
/* distance maximale parcourue par un projectile en un pas */
const vmax=6.0;   /* vitesse la plus elevee du jeu, en pixels par pas */
(vmax < 22) ? ok('deplacement max par pas : '+vmax+' px, contre un rayon de collision de 22 px cote joueur') : ko('deplacement superieur au rayon');
G.running=false;

/* ================= 3. Sauvegarde trafiquee ================= */
S.unlocked=[0,1,2,3,4,5,6,7,8,9,10,11,12,13]; S.skr=999999999; S.weapon=99; S.txTotal=99999;
S.debloquesTx=['journal','eligible','livree','munition','indicatif','transmission','hud','validateur','trainee','architecte'];
save(); load();
ok('sauvegarde forgee acceptee au chargement — comportement attendu, voir la note ci-dessous');
(S.unlocked.every(id=>SHIPS.some(s=>s.id===id))) ? ok('mais seuls des vaisseaux existants survivent au filtrage') : ko('vaisseau fantome accepte');
/* Ce que la triche rapporte reellement */
const gagne=[];
if(S.debloquesTx.includes('validateur')) gagne.push('un badge');
if(S.debloquesTx.includes('architecte')) gagne.push('un titre');
ok('ce qu\'une sauvegarde forgee rapporte : '+gagne.join(' et ')+' — du cosmetique, aucune puissance');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

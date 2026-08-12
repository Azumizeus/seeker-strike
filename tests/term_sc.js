const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Le harnais fournit un classList inerte : on installe des elements qui
   memorisent vraiment leurs classes, sinon on ne teste rien. */
const cache={};
function elTracke(id){
  const c=new Set();
  return { id, cls:c, style:{}, innerHTML:'', textContent:'',
    classList:{ add:x=>c.add(x), remove:x=>c.delete(x), contains:x=>c.has(x),
                toggle:(x,v)=>{ const on=(v===undefined)?!c.has(x):!!v; on?c.add(x):c.delete(x); return on; } },
    querySelector:()=>({ style:{} }), querySelectorAll:()=>[], appendChild(){}, removeChild(){}, remove(){},
    insertBefore(){}, setAttribute(){}, getAttribute(){return null;}, addEventListener(){},
    getContext:()=>null, dataset:{}, children:[], value:'', src:'', disabled:false,
    getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}), parentNode:{insertBefore(){}} };
}
document.getElementById=(id)=> (cache[id] = cache[id] || elTracke(id));
function neuf(){ S.secrets=[]; S.terminal=false; S.blueprint=false; S.termOuvert=false;
                 S.completedNodes=[0]; S.nodeStars={}; S.currentNode=1; S.walletReel=true; S.txTotal=42; }
function html(){ majTerminalCarte(); return String(cache['term-int'].innerHTML||''); }

/* --- 1. Verrouille tant que l'easter egg n'est pas trouve --- */
neuf(); majTerminalCarte();
(cache['terminal-carte'].cls && cache['terminal-carte'].cls.has('hidden'))
  ? ok('sans l\'easter egg : terminal masque') : ko('terminal visible sans le secret');
/* --- 2. Debloque par DEVNET --- */
for(let i=0;i<5;i++) tapDevnet();
(secretTrouve('sidev')) ? ok('easter egg DEVNET trouve') : ko('secret non debloque');
majTerminalCarte();
(!cache['terminal-carte'].cls.has('hidden')) ? ok('terminal de carte devenu visible') : ko('toujours masque');
(!cache['terminal-carte'].cls.has('ouvert')) ? ok('replie par defaut : ne masque pas la carte') : ko('ouvert d\'office');
/* --- 3. Deploiement --- */
basculerTerminalCarte();
(cache['terminal-carte'].cls.has('ouvert') && S.termOuvert===true) ? ok('appui : le terminal se deploie') : ko('deploiement casse');
basculerTerminalCarte();
(!cache['terminal-carte'].cls.has('ouvert') && S.termOuvert===false) ? ok('deuxieme appui : il se referme') : ko('fermeture cassee');
S.termOuvert=true;

/* --- 4. Bloc chaine toujours present --- */
let h=html();
(/devnet/.test(h)) ? ok('affiche le cluster devnet') : ko('cluster absent');
(/42/.test(h)) ? ok('affiche le compteur de transactions') : ko('compteur absent');

/* --- 5. GARDE-FOU : aucun renseignement tactique sur un secteur jamais joue --- */
S.currentNode=4;                       /* secteur a boss, jamais parcouru */
S.completedNodes=[0];
h=html();
const nomBoss=(BOSS_DEFS[4]||{}).nom||'VORTEX';
(h.indexOf(nomBoss)<0) ? ok('secteur non joue : le nom du boss n\'est PAS divulgue') : ko('boss divulgue : '+nomBoss);
(/non recueilli|not collected/.test(h)) ? ok('lignes tactiques marquees « non recueilli »') : ko('pas de marquage');
(/jamais parcouru|never entered/.test(h)) ? ok('message explicite sur l\'absence de donnees') : ko('message absent');
(h.indexOf(T(NODES.find(x=>x.id===4).title))>=0) ? ok('le nom du secteur reste affiche (deja visible sur la carte)') : ko('nom du secteur absent');

/* --- 6. Une fois joue, les donnees s'ouvrent --- */
S.completedNodes=[0,4]; S.nodeStars={4:2};
h=html();
(h.indexOf(nomBoss)>=0) ? ok('secteur securise : le boss apparait ('+nomBoss+')') : ko('boss absent apres avoir joue');
(/★★/.test(h)) ? ok('etoiles obtenues affichees') : ko('etoiles absentes');
(!/non recueilli|not collected/.test(h)) ? ok('plus aucune ligne muette') : ko('lignes encore muettes');

/* --- 7. Aucun avantage de puissance --- */
const av=[S.weapon,S.maxLives,S.fireRate,S.skr];
majTerminalCarte(); basculerTerminalCarte(); basculerTerminalCarte();
(S.weapon===av[0]&&S.maxLives===av[1]&&S.fireRate===av[2]&&S.skr===av[3])
  ? ok('consulter le terminal ne change rien au jeu') : ko('le terminal modifie l\'etat');

/* --- 8. Traduction --- */
LANGUE='en'; S.completedNodes=[0]; S.currentNode=4;
h=html();
(/not collected/.test(h) && !/non recueilli/.test(h)) ? ok('terminal traduit en anglais') : ko('francais residuel en EN');
(/SECTOR/.test(h)) ? ok('entete de secteur traduite') : ko('entete non traduite');
LANGUE='fr';

/* --- 9. Terminal en jeu : remonte hors des boutons de boost --- */
neuf(); for(let i=0;i<5;i++) tapDevnet();
let rects=[];
const g={ ctx:{ save(){},restore(){},fillText(){},strokeRect(x,y,w,h){rects.push(['s',y]);},
                fillRect(x,y,w,h){rects.push(['f',y]);},
                set font(v){}, set textAlign(v){}, set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){} },
          h:800, enemies:[], eBullets:[], bullets:[], wave:3 };
dessinerTerminal(g);
const yTerm=rects.length?rects[0][1]:null;
(yTerm!==null && yTerm < 800*0.5) ? ok('terminal en jeu dans la moitie haute (y='+yTerm+'), plus derriere les boutons de boost')
                                  : ko('terminal encore en bas : y='+yTerm);

/* --- 10. Deux temps sur la carte, uniquement terminal ouvert --- */
/* Temoin d'ouverture : openPrep ecrit le titre du secteur. On ne peut pas
   remplacer la fonction, elle est appelee localement dans le script. */
S.connected=true; S.walletReel=true;
function titrePrep(){ return String(cache['prep-title'] ? cache['prep-title'].textContent||'' : ''); }
function prepPour(id){ const n=NODES.find(x=>x.id===id); return n?T(n.title):'??'; }
let vu='';
neuf(); S.connected=true; S.walletReel=true; for(let i=0;i<5;i++) tapDevnet();
S.completedNodes=[0,1,2,3,4,5,6,7];
/* terminal replie : un seul appui suffit */
S.termOuvert=false; majTerminalCarte();
if(cache['prep-title']) cache['prep-title'].textContent=''; toucherNoeud(3);
(titrePrep()===prepPour(3)) ? ok('terminal replie : un appui ouvre directement la preparation') : ko('parcours rallonge sans terminal : "'+titrePrep()+'"');
/* terminal deploye : premier appui = consultation */
S.termOuvert=true; majTerminalCarte();
if(cache['prep-title']) cache['prep-title'].textContent=''; toucherNoeud(5);
(titrePrep()==='') ? ok('terminal deploye : le premier appui consulte, sans lancer') : ko('mission lancee au premier appui');
(S.currentNode===5) ? ok('le terminal bascule sur le secteur touche') : ko('secteur : '+S.currentNode);
(/seconde fois|once more/.test(html())) ? ok('consigne du second appui affichee') : ko('consigne absente');
/* deuxieme appui sur le MEME noeud = lancement */
toucherNoeud(5);
(titrePrep()===prepPour(5)) ? ok('second appui sur le meme noeud : mission lancee') : ko('non lancee : "'+titrePrep()+'"');
/* changer de noeud reamorce la consultation */
if(cache['prep-title']) cache['prep-title'].textContent=''; toucherNoeud(7);
(titrePrep()==='' && S.currentNode===7) ? ok('changer de noeud : on reconsulte au lieu de lancer') : ko('lancement premature');
if(cache['prep-title']) cache['prep-title'].textContent=''; toucherNoeud(3);
(titrePrep()==='') ? ok('encore un autre noeud : toujours consultation') : ko('lancement premature');
toucherNoeud(3);
(titrePrep()===prepPour(3)) ? ok('puis second appui : lancement') : ko('non lancee : "'+titrePrep()+'"');

/* --- 11. Le conteneur interne garde une largeur fixe --- */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(/#term-int\{width:214px;box-sizing:border-box/.test(src))
  ? ok('boite interne a largeur fixe : plus de remise en page pendant l\'ouverture') : ko('largeur interne non figee');
(/#term-corps\{[^}]*transition:width/.test(src))
  ? ok('seule la largeur exterieure s\'anime') : ko('transition mal ciblee');
(/#term-int[^}]*rgba\(153,69,255/.test(src)) ? ok('habillage violet Solana sur le panneau') : ko('couleurs Solana absentes');
(/linear-gradient\(90deg,#9945FF,#14F195\)/.test(src)) ? ok('degrade violet vers vert sur le titre') : ko('degrade absent');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

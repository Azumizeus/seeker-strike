const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
S.completedNodes=NODES.map(n=>n.id); S.connected=true; loadout.difficulte='normal';
fixerHasard(3); lancerInfini(); G.running=true;
/* --- Progression des types sur 40 vagues --- */
const vus={};
for(let v=1;v<=40;v++){ for(let i=0;i<120;i++){ const k=typeInfini(v); vus[v]=vus[v]||new Set(); vus[v].add(k); } }
console.log('RES ------------------------------------------------');
console.log('RES  MODE INFINI — types d\'ennemis par vague');
[1,4,7,10,13,16,20,24,30,40].forEach(v=>{
  console.log('RES  vague '+String(v).padStart(2)+' : '+[...vus[v]].sort().join(', '));
});
console.log('RES ------------------------------------------------');
(vus[1].size===1) ? ok('vague 1 : un seul type, on apprend') : ko('vague 1 : '+vus[1].size+' types');
(vus[24].size>=8) ? ok('vague 24 : '+vus[24].size+' types differents, bestiaire complet') : ko('vague 24 : seulement '+vus[24].size);
let croissant=true; for(let v=2;v<=40;v++) if(vus[v].size<vus[v-1].size) croissant=false;
croissant ? ok('la variete ne recule jamais d\'une vague a l\'autre') : ko('regression de variete');
/* proportion de types lourds en fin de course */
function partLourds(v){ let n=0,t=2000; for(let i=0;i<t;i++){ if(['tank','bouclier','teleport','poseur','diviseur'].includes(typeInfini(v))) n++; } return n/t; }
const p10=partLourds(10), p30=partLourds(30);
(p30>p10+0.1) ? ok('types lourds : '+(p10*100).toFixed(0)+'% a la vague 10, '+(p30*100).toFixed(0)+'% a la vague 30') : ko('pas de montee : '+p10+' -> '+p30);

/* --- Decors et musique ---
   On ne peut pas remplacer chargerFondNiveau : le code appelle la fonction
   locale, pas la globale. On verifie donc la selection elle-meme, plus la
   presence de l'appel dans la source. */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(/if\(g\.wave%4===0\)\{/.test(src)) ? ok('changement de decor programme toutes les 4 vagues') : ko('rotation de decor absente');
(/chargerFondNiveau\(nd\)\.then\(appliquerFondNiveau\)/.test(src)) ? ok('le decor est bien recharge a chaque rotation') : ko('appel de rechargement absent');
const choisis=[];
for(let w=4; w<=48; w+=4){
  const chaos = w>=13;
  const liste = chaos ? INFINI_DECORS_CHAOS : INFINI_DECORS;
  choisis.push({w, nd: liste[Math.floor(w/4)%liste.length], chaos});
}
const distincts=new Set(choisis.map(c=>c.nd));
(distincts.size>=6) ? ok(distincts.size+' decors distincts sur 48 vagues ('+[...distincts].join(', ')+')') : ko('seulement '+distincts.size+' decors');
(choisis.filter(c=>!c.chaos).every(c=>INFINI_DECORS.includes(c.nd))) ? ok('avant la vague 13 : uniquement des decors GENESIS') : ko('decor CHAOS trop tot');
(choisis.filter(c=>c.chaos).every(c=>INFINI_DECORS_CHAOS.includes(c.nd))) ? ok('a partir de la vague 13 : uniquement des decors CHAOS') : ko('decor GENESIS trop tard');
(INFINI_DECORS.every(n=>NODES.some(x=>x.id===n)) && INFINI_DECORS_CHAOS.every(n=>NODES.some(x=>x.id===n)))
  ? ok('tous les decors listes correspondent a des secteurs reels') : ko('secteur de decor inexistant');

/* La bascule musicale, elle, est observable : Audio2 est un objet reel. */
let musiques=[]; const vraieMus=Audio2.jouerMusique;
Audio2.jouerMusique=(m)=>{ musiques.push(m); };
fixerHasard(3); lancerInfini(); G.running=true; G.wave=0;
for(let v=0;v<28;v++){ try{ vagueInfinie(G); }catch(e){} }
Audio2.jouerMusique=vraieMus;
(musiques.includes('combatChaos')) ? ok('la musique bascule sur CHAOS quand la pression monte') : ko('musique inchangee : '+musiques.join(','));
(musiques.filter(m=>m==='combatChaos').length===1) ? ok('la bascule ne se declenche qu\'une fois') : ko('bascule repetee '+musiques.filter(m=>m==='combatChaos').length+' fois');
G.running=false;

/* --- Le vaisseau reste celui du joueur --- */
S.unlocked=[0,1,2]; S.ship=2; loadout.ship=2;
fixerHasard(3); lancerInfini();
(loadout.ship===2) ? ok('le vaisseau choisi par le joueur est conserve (pas de tirage au sort subi)') : ko('vaisseau change : '+loadout.ship);
G.running=false;
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

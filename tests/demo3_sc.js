const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));
/* Le depot GitHub est a plat alors que l'arbo locale range la source dans
   game/ : on essaie les trois dispositions plutot que de planter en ENOENT. */
const _p=require('path'), _f=require('fs');
const _cand=[_p.join(__dirname,'../game/index_v37.html'),
             _p.join(__dirname,'../index_v37.html'),
             _p.join(__dirname,'index_v37.html')];
const src=_f.readFileSync(_cand.find(p=>_f.existsSync(p))||_cand[0],'utf8');

/* --- 1. Sortie de demo : on revient a l'accueil, pas au splash --- */
(/el\.classList\.add\('parti'\); el\.style\.display='none';/.test(src))
  ? ok('sortie de demo : le splash est masque, pas rappele') : ko('le splash revient par-dessus tout');
/* UI-6 : la sortie de demo repasse par le flux normal — choix de langue au
   premier lancement, puis tutoriel, sinon accueil. Ce qui compte n'est pas la
   ligne exacte (le test verifiait la forme du code) mais qu'on aboutisse bien
   a l'accueil sans rappeler le splash. */
(/_splashParti=true;[\s\S]{0,500}?show\('home'\)/.test(src))
  ? ok('sortie de demo : retour a l\'accueil') : ko('pas de retour a l\'accueil');
(/_splashParti=true;[\s\S]{0,500}?langueDejaChoisie\(\)/.test(src))
  ? ok('sortie de demo : le choix de langue et le tutoriel sont preserves')
  : ko('la demo saute encore le choix de langue');

/* --- 2. Tout geste arrete la demo --- */
['touchstart','mousedown','keydown','wheel','pointerdown'].forEach(ev=>{
  (src.indexOf("'"+ev+"'")>=0) ? ok('geste pris en compte pour arreter la demo : '+ev) : ko('geste ignore : '+ev);
});

/* --- 3. Aucun son ni vibration avant le premier geste --- */
(typeof _gesteFait!=='undefined') ? ok('marqueur de premier geste present') : ko('marqueur absent');
_gesteFait=false;
S.prefs=S.prefs||{}; S.prefs.son=true; S.prefs.musique=true;
Audio2.pisteEnAttente=null;
Audio2.jouerMusique('combat');
(Audio2.pisteEnAttente==='combat') ? ok('musique demandee avant tout geste : mise en attente, pas jouee') : ko('attente : '+Audio2.pisteEnAttente);
let vibrations=0;
const vv=navigator.vibrate; navigator.vibrate=()=>{ vibrations++; return true; };
haptique('bouton');
(vibrations===0) ? ok('vibration avant tout geste : ignoree, plus d\'avertissement navigateur') : ko('vibration tentee');
_gesteFait=true;
haptique('bouton');
(vibrations===1) ? ok('apres le premier geste : la vibration fonctionne') : ko('vibration cassee apres geste');
navigator.vibrate=vv;

/* --- 4. La demo ne persiste toujours rien --- */
localStorage.removeItem('ss_v35');
S.unlocked=[0,1]; S.skr=0; save();
_demoActive=true; S.unlocked.push(4); S.skr=5000; save();
const disque=JSON.parse(localStorage.getItem('ss_v35'));
(disque.unlocked.length===2 && disque.skr===0) ? ok('demo : toujours aucune ecriture sur le disque') : ko('fuite : '+JSON.stringify(disque.unlocked));
_demoActive=false;

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

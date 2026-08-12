const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);

/* On compte les requetes reseau : tout `src` pose sur un element Audio. */
let requetes=[];
const AudioOrigine = global.Audio;
global.Audio = function(){
  const o = AudioOrigine ? new AudioOrigine() : {};
  o.addEventListener = o.addEventListener || function(){};
  o.cloneNode = ()=>o; o.play = ()=>({catch:()=>{}});
  Object.defineProperty(o,'src',{ set(v){ requetes.push(v); }, get(){ return ''; }, configurable:true });
  return o;
};

S.prefs = S.prefs || {}; S.prefs.son=true; S.prefs.musique=true;
_gesteFait = true;

/* --- 1. Piste embarquee : zero requete reseau --- */
let joueeEnMemoire=null;
Audio2.jouerEmbarquee = (nom)=>{ joueeEnMemoire=nom; return true; };
Audio2.cache={}; Audio2.dispo={}; requetes=[];
MUSIQUES_INLINE['menu_theme']='data:audio/mpeg;base64,AAAA';
Audio2.jouerMusique('menu');
(joueeEnMemoire==='menu_theme') ? ok('piste embarquee : lue directement en memoire') : ko('lecture memoire : '+joueeEnMemoire);
(requetes.length===0) ? ok('aucune requete reseau : plus de 404 dans la console (etait 1 par piste)') : ko('requetes : '+JSON.stringify(requetes));

/* charger() non plus ne doit rien demander */
Audio2.cache={}; requetes=[];
Audio2.charger('menu_theme');
(requetes.length===0) ? ok('charger() sur une piste embarquee : aucun telechargement') : ko('requete : '+requetes[0]);
(Audio2.dispo['menu_theme']===true) ? ok('la piste est marquee disponible sans reseau') : ko('dispo : '+Audio2.dispo['menu_theme']);

/* --- 2. Piste NON embarquee : le fichier est bien demande --- */
delete MUSIQUES_INLINE['menu_theme'];
Audio2.cache={}; Audio2.dispo={}; requetes=[]; joueeEnMemoire=null;
Audio2.charger('menu_theme');
(requetes.length===1) ? ok('piste non embarquee : le fichier est demande') : ko('requetes : '+requetes.length);
(/menu_theme\.mp3/.test(requetes[0]||'')) ? ok('chemin demande : '+requetes[0]) : ko('chemin : '+requetes[0]);
(/\?v=/.test(requetes[0]||'')) ? ok('marqueur de version present (anti-cache)') : ko('pas de marqueur de version');

/* --- 3. Repli memoire toujours en place si le fichier manque --- */
MUSIQUES_INLINE['menu_theme']='data:audio/mpeg;base64,AAAA';
Audio2.cache={}; Audio2.dispo={'menu_theme':false}; joueeEnMemoire=null; requetes=[];
Audio2.jouerMusique('menu');
(joueeEnMemoire==='menu_theme') ? ok('fichier absent : le repli memoire fonctionne toujours') : ko('repli casse');
delete MUSIQUES_INLINE['menu_theme'];

R.forEach(l=>console.log(l));
const bad=R.filter(l=>l.startsWith('RES KO')).length;
console.log(bad?'RES '+bad+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(bad?1:0);

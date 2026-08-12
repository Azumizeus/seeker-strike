const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);

/* --- 1. La demo montre des vaisseaux ET des munitions differents --- */
const ships = DEMO_SEQ.map(s=>s.ship);
(new Set(ships).size===DEMO_SEQ.length) ? ok(DEMO_SEQ.length+' sequences, '+new Set(ships).size+' vaisseaux distincts') : ko('vaisseaux repetes : '+ships);
const muns = DEMO_SEQ.map(s=>s.mun);
(muns.every(m=>MUNITIONS.some(x=>x.id===m))) ? ok('toutes les munitions de demo existent') : ko('munition inconnue : '+muns);
(new Set(muns).size>=3) ? ok(new Set(muns).size+' munitions differentes montrees (etait 1 seule)') : ko('munitions : '+[...new Set(muns)]);

/* --- 2. Chaque vaisseau a bien sa propre signature de tir --- */
const formes = DEMO_SEQ.map(s=>(TIRS[s.ship]||TIRS[0]).forme);
const couleurs = DEMO_SEQ.map(s=>(TIRS[s.ship]||TIRS[0]).c);
(new Set(couleurs).size===DEMO_SEQ.length) ? ok('une couleur de tir par sequence : '+[...new Set(couleurs)].length) : ko('couleurs dupliquees : '+couleurs);
(new Set(formes).size>=5) ? ok(new Set(formes).size+' formes de tir distinctes dans le trailer') : ko('formes : '+[...new Set(formes)]);

/* --- 3. La munition signature ne doit pas ecraser la demo --- */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(/const enDemo = !!\(g && g\.demo\);/.test(src)) ? ok('le rendu connait le mode demo') : ko('mode demo non detecte au rendu');
(/debloque\('munition'\) && !enDemo/.test(src)) ? ok('munition signature neutralisee pendant la demo') : ko('la signature ecrase encore les 14 tirs');

/* --- 4. Orientation et proportions du projectile --- */
(/ctx\.rotate\(-Math\.PI\/2\)/.test(src)) ? ok('le sprite est redresse d\'un quart de tour (pointe vers le haut)') : ko('sprite toujours couche');
(/const LONG=30, LARG=13;/.test(src)) ? ok('proportions respectees 30x13 (etait un carre 22x22 ecrase)') : ko('toujours dessine dans un carre');
(/drawImage\(sprite, -LONG\/2, -LARG\/2, LONG, LARG\)/.test(src)) ? ok('sprite centre sur la balle apres rotation') : ko('centrage incorrect');

/* --- 5. Teinte par vaisseau, mise en cache --- */
(typeof munTeintee==='function') ? ok('fonction de teinte presente') : ko('munTeintee absente');
let creations=0;
const vraiCreate=document.createElement;
document.createElement=(t)=>{ if(t==='canvas') creations++; return vraiCreate.call(document,t); };
const faux={ width:128, height:128 };
const a1=munTeintee(faux,'#14F195');
const a2=munTeintee(faux,'#14F195');
const a3=munTeintee(faux,'#fbbf24');
(a1===a2) ? ok('meme couleur : resultat repris du cache, pas repeint a chaque image') : ko('cache inoperant');
(creations<=2) ? ok('une seule peinture par couleur ('+creations+' canvas crees pour 3 appels)') : ko('canvas crees : '+creations);
document.createElement=vraiCreate;

/* Repli si le canvas n'est pas disponible : on rend l'image d'origine */
const secours=munTeintee({width:0,height:0,pasUnImage:true},'#fff');
(secours!==undefined && secours!==null) ? ok('repli sur l\'image d\'origine si la teinte echoue') : ko('teinte cassante');

/* --- 6. Aucune regression sur l'equilibrage --- */
const std=MUNITIONS.find(m=>m.id==='std'), spr=MUNITIONS.find(m=>m.id==='spread');
(spr.dmg===0.92 && spr.rate===0.88) ? ok('Spread garde son equilibrage corrige') : ko('spread : '+spr.dmg+'/'+spr.rate);
(std.dmg===1 && std.rate===1) ? ok('Standard reste la reference') : ko('std modifie');

R.forEach(l=>console.log(l));
const bad=R.filter(l=>l.startsWith('RES KO')).length;
console.log(bad?'RES '+bad+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(bad?1:0);

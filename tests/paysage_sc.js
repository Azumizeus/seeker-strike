const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Le voile « tourne ton telephone » ne doit apparaitre que lorsqu'il manque
   vraiment de la hauteur. Se fier au seul rapport largeur/hauteur bloquait
   les portables a ecran tactile et l'emulateur console fermee. */
const l0=window.innerWidth, h0=window.innerHeight;
function tester(w,h){ window.innerWidth=w; window.innerHeight=h; return estPaysage(); }
console.log('RES ------------------------------------------------------------');
console.log('RES  QUAND LE VOILE DE ROTATION SE DECLENCHE-T-IL ?');
console.log('RES  appareil                   taille        voile');
const CAS=[
  ['iPhone 14 Pro Max couche',  932, 430, true ],
  ['iPhone SE couche',          667, 375, true ],
  ['Pixel couche',              915, 412, true ],
  ['fenetre basse',             800, 480, true ],
  ['iPad couche',              1024, 768, false],
  ['portable tactile 15"',     1512, 945, false],
  ['portable tactile 16:9',    1920,1080, false],
  ['bureau, console fermee',   1600, 900, false],
  ['telephone debout',          430, 932, false],
  ['tablette debout',           768,1024, false],
];
let ech=0;
CAS.forEach(([nom,w,h,attendu])=>{
  const r=tester(w,h);
  console.log('RES  '+nom.padEnd(26)+(w+'x'+h).padStart(10)+(r?'  voile':'  jouable').padStart(10)+(r===attendu?'':'   <-- ATTENDU '+(attendu?'voile':'jouable')));
  if(r!==attendu) ech++;
});
console.log('RES ------------------------------------------------------------');
(ech===0) ? ok('les 10 configurations se comportent comme prevu') : ko(ech+' configuration(s) incorrecte(s)');
(HAUTEUR_JOUABLE>=500 && HAUTEUR_JOUABLE<=650) ? ok('seuil de hauteur jouable : '+HAUTEUR_JOUABLE+' px') : ko('seuil : '+HAUTEUR_JOUABLE);
/* le portrait n'est jamais bloque, quelle que soit la taille */
const portraits=[[320,568],[430,932],[768,1024],[1080,1920]];
(portraits.every(([w,h])=>!tester(w,h))) ? ok('aucun format portrait n\'est jamais bloque') : ko('un portrait declenche le voile');
/* un ecran carre n'est pas du paysage */
(!tester(800,780)) ? ok('ecran quasi carre : tolere') : ko('carre bloque');
window.innerWidth=l0; window.innerHeight=h0;
R.forEach(x=>console.log(x));
const n=R.filter(x=>x.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

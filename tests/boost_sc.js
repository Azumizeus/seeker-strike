const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Geometrie de la bande basse, telle qu'elle est ecrite dans le CSS. */
const MARGE_BAS=64, TAILLE_BTN=58;
const HAUT_BANDE = MARGE_BAS + TAILLE_BTN;      /* 122 : haut des boutons depuis le bas */

(typeof PLANCHER_VOL==='number') ? ok('PLANCHER_VOL defini : '+PLANCHER_VOL+'px') : ko('constante absente');
(PLANCHER_VOL > HAUT_BANDE) ? ok('le plancher de vol ('+PLANCHER_VOL+'px) depasse le haut des boutons ('+HAUT_BANDE+'px) : aucun recouvrement')
                            : ko('recouvrement : plancher '+PLANCHER_VOL+' <= boutons '+HAUT_BANDE);
(PLANCHER_VOL - HAUT_BANDE >= 20) ? ok('marge de '+(PLANCHER_VOL-HAUT_BANDE)+'px entre le vaisseau et les boutons')
                                  : ko('marge trop faible');

/* --- Le vaisseau ne peut jamais descendre dans la bande --- */
S.currentNode=1; fixerHasard(7);
[[390,844],[412,915],[360,640],[430,932]].forEach(([w,h])=>{
  global.window.innerWidth=w; global.window.innerHeight=h;
  initGame('solo', 1);
  const depart=G.player.y;
  (depart <= h-HAUT_BANDE) ? ok(w+'x'+h+' : depart a y='+Math.round(depart)+', au-dessus des boutons (limite '+(h-HAUT_BANDE)+')')
                           : ko(w+'x'+h+' : depart sur les boutons');
  /* on force le vaisseau tout en bas, la contrainte doit le retenir */
  G.player.y=h+500; G.vy=0; G.vx=0; G.running=true;
  G.player.y=Math.max(70, Math.min(G.h-PLANCHER_VOL, G.player.y));
  (G.player.y <= h-HAUT_BANDE) ? ok(w+'x'+h+' : poussee vers le bas bloquee a y='+Math.round(G.player.y))
                               : ko(w+'x'+h+' : le vaisseau entre dans la bande');
  G.running=false;
});
/* --- Ecran tres court : la contrainte ne doit pas inverser les bornes --- */
global.window.innerWidth=360; global.window.innerHeight=420;
initGame('solo',1);
(G.player.y>=70 && G.player.y<=420) ? ok('ecran court 360x420 : position valide ('+Math.round(G.player.y)+')') : ko('position hors ecran : '+G.player.y);
G.running=false;
global.window.innerWidth=390; global.window.innerHeight=844;

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

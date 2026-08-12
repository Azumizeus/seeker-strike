const fs=require('fs'), {JSDOM}=require('jsdom');
const R=[]; const ok=m=>R.push('RES ok  '+m); const ko=m=>R.push('RES KO  '+m);
const F={ source:require('path').join(__dirname,'../game/index_v37.html'),
          autonome:require('path').join(__dirname,'../game/seeker-strike-MOBILE.html'),
          noah:require('path').join(__dirname,'../noah-build/index.html') };
for(const [nom,f] of Object.entries(F)){
  if(!fs.existsSync(f)){ ko(nom+' absent'); continue; }
  const html=fs.readFileSync(f,'utf8');
  const d=new JSDOM(html,{runScripts:'outside-only'}).window.document;
  const t=d.getElementById('terminal-carte');
  (t) ? ok(nom+' : terminal present') : ko(nom+' : absent');
  if(!t) continue;
  /* Il ne doit PAS etre dans le conteneur qui defile */
  const dansScroll = !!(t.closest && t.closest('#map-scroll'));
  (!dansScroll) ? ok(nom+' : hors de #map-scroll, il ne defile plus avec la carte')
                : ko(nom+' : encore dans le conteneur qui defile');
  /* mais bien dans l'ecran carte */
  const dansCarte = !!(t.closest && t.closest('#s-map'));
  (dansCarte) ? ok(nom+' : toujours rattache a l\'ecran carte') : ko(nom+' : sorti de l\'ecran carte');
  /* position fixe, centre vertical */
  const m=html.match(/#terminal-carte\{([^}]*)\}/);
  const css=m?m[1]:'';
  (/position:fixed/.test(css)) ? ok(nom+' : position fixed — ancre a la fenetre') : ko(nom+' : position '+(css.match(/position:\w+/)||['?'])[0]);
  (/top:50%/.test(css) && /translateY\(-50%\)/.test(css)) ? ok(nom+' : centre verticalement (top 50% + translateY -50%)') : ko(nom+' : pas centre');
  (/left:0/.test(css)) ? ok(nom+' : toujours colle au bord gauche') : ko(nom+' : emplacement horizontal change');
  /* l'onglet reste cliquable, le conteneur laisse passer les clics */
  (/pointer-events:none/.test(css)) ? ok(nom+' : le conteneur ne bloque pas la carte') : ko(nom+' : conteneur bloquant');
  const o=html.match(/#term-onglet\{([^}]*)\}/);
  (/pointer-events:auto/.test(o?o[1]:'')) ? ok(nom+' : l\'onglet reste cliquable') : ko(nom+' : onglet non cliquable');
  /* un seul exemplaire */
  (d.querySelectorAll('#terminal-carte').length===1) ? ok(nom+' : un seul terminal dans la page') : ko(nom+' : doublon');
}
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

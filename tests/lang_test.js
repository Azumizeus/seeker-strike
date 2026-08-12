const fs=require('fs'), {JSDOM}=require('jsdom');
const R=[]; const ok=m=>R.push('RES ok  '+m); const ko=m=>R.push('RES KO  '+m);
const F={ source:require('path').join(__dirname,'../game/index_v37.html'),
          autonome:require('path').join(__dirname,'../game/seeker-strike-MOBILE.html'),
          noah:require('path').join(__dirname,'../noah-build/index.html') };
for(const [nom,f] of Object.entries(F)){
  if(!fs.existsSync(f)){ ko(nom+' absent'); continue; }
  const html=fs.readFileSync(f,'utf8');
  const d=new JSDOM(html,{runScripts:'outside-only'}).window.document;
  const el=d.getElementById('choix-langue');
  (el) ? ok(nom+' : ecran de choix present') : ko(nom+' : ecran absent');
  (el && !el.classList.contains('on')) ? ok(nom+' : masque au repos') : ko(nom+' : affiche a tort');
  const btns=el?[...el.querySelectorAll('button')]:[];
  (btns.length===2) ? ok(nom+' : deux boutons de langue') : ko(nom+' : '+btns.length+' boutons');
  const h=btns.map(b=>b.getAttribute('onclick')).join(' ');
  (/choisirLangueDepart\('fr'\)/.test(h) && /choisirLangueDepart\('en'\)/.test(h))
    ? ok(nom+' : les deux boutons appellent la bonne fonction') : ko(nom+' : handlers incorrects');
  /* le texte doit etre bilingue : le joueur ne comprend pas encore la langue affichee */
  const t=el?el.textContent:'';
  (/CHOISIS TA LANGUE/.test(t) && /CHOOSE YOUR LANGUAGE/.test(t))
    ? ok(nom+' : titre bilingue, comprehensible dans les deux cas') : ko(nom+' : titre non bilingue');
  (/Fran/.test(t) && /English/.test(t)) ? ok(nom+' : les deux langues nommees') : ko(nom+' : langues manquantes');
  /* z-index : au-dessus du splash (500), sous le voile de rotation (9999) */
  const mz=html.match(/#choix-langue\{[^}]*z-index:(\d+)/);
  const z=mz?+mz[1]:0;
  (z>500 && z<9999) ? ok(nom+' : z-index '+z+' — au-dessus du splash, sous le voile de rotation')
                    : ko(nom+' : z-index '+z+' mal place');
  /* l'ecran doit precede le tuto */
  (/if\(!langueDejaChoisie\(\)\) ouvrirChoixLangue\(\);/.test(html))
    ? ok(nom+' : le choix de langue precede bien le tutoriel') : ko(nom+' : enchainement absent');
  (/localStorage\.removeItem\('ss_langue_choisie'\)/.test(html))
    ? ok(nom+' : le reset usine redemande la langue') : ko(nom+' : reset ne reinitialise pas la langue');
}
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

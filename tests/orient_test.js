const fs=require('fs'), {JSDOM}=require('jsdom');
const R=[]; const ok=m=>R.push('RES ok  '+m); const ko=m=>R.push('RES KO  '+m);
const FICHIERS={
  source:require('path').join(__dirname,'../game/index_v37.html'),
  autonome:require('path').join(__dirname,'../game/seeker-strike-MOBILE.html'),
  noah:require('path').join(__dirname,'../noah-build/index.html')
};

for(const [nom,f] of Object.entries(FICHIERS)){
  if(!fs.existsSync(f)){ ko(nom+' : fichier absent'); continue; }
  const html=fs.readFileSync(f,'utf8');
  const dom=new JSDOM(html,{runScripts:'outside-only'});
  const d=dom.window.document;

  const mb=html.match(/manifest\+json;base64,([A-Za-z0-9+/=]+)/);
  if(mb){
    const man=JSON.parse(Buffer.from(mb[1],'base64').toString('utf8'));
    man.orientation==='portrait' ? ok(nom+' : manifeste orientation="portrait"')
                                 : ko(nom+' : manifeste orientation="'+man.orientation+'"');
  } else ko(nom+' : manifeste introuvable');

  const m1=d.querySelector('meta[name="screen-orientation"]');
  const m2=d.querySelector('meta[name="x5-orientation"]');
  (m1&&m1.getAttribute('content')==='portrait'&&m2&&m2.getAttribute('content')==='portrait')
    ? ok(nom+' : metas screen-orientation + x5-orientation en portrait')
    : ko(nom+' : metas d\'orientation Android manquantes');

  const v=d.getElementById('voile-rotation');
  (v && !v.classList.contains('on')) ? ok(nom+' : voile de rotation present, masque au repos')
                                     : ko(nom+' : voile absent ou affiche a tort');
  /#voile-rotation\.on\{display:flex\}/.test(html)
    ? ok(nom+' : regle CSS #voile-rotation.on -> display:flex')
    : ko(nom+' : regle CSS d\'affichage du voile absente');

  const mz=html.match(/#voile-rotation\{[^}]*z-index:(\d+)/);
  const zVoile=mz?+mz[1]:0;
  const zMax=Math.max(...[...html.matchAll(/z-index:(\d{2,4})/g)].map(x=>+x[1]));
  (zVoile>=zMax) ? ok(nom+' : voile au premier plan (z-index '+zVoile+', max page '+zMax+')')
                 : ko(nom+' : voile sous un autre element ('+zVoile+' < '+zMax+')');

  /veillerVerrou|tenterVerrouillageComplet/.test(html)
    ? ok(nom+' : verrouillage plein ecran declenche au premier appui')
    : ko(nom+' : tenterVerrouillageComplet absent');
}

/* ---- Comportement de majOrientation, isole ---- */
const src=fs.readFileSync(FICHIERS.source,'utf8');
const js=src.slice(src.lastIndexOf('<script>')+8, src.lastIndexOf('</script>'));
function extraire(nom){
  const i=js.indexOf('function '+nom+'(');
  if(i<0) throw new Error('fonction introuvable : '+nom);
  let p=0;
  for(let k=js.indexOf('{',i);k<js.length;k++){ if(js[k]==='{')p++; else if(js[k]==='}'){p--; if(!p) return js.slice(i,k+1);} }
}
/* estPaysage s'appuie desormais sur une constante declaree hors des
   fonctions : il faut l'embarquer, sinon le bloc extrait est incomplet. */
const mHaut=js.match(/const HAUTEUR_JOUABLE = \d+;/);
const bloc=(mHaut?mHaut[0]+'\n':'')+['estPaysage','appareilTactile','majOrientation'].map(extraire).join('\n');
const moteur=new Function('E', 'with(E){'+bloc+'\n majOrientation(); }');

function scenario(l,h,tactile,partieEnCours){
  const cls=new Set();
  const voile={ classList:{ toggle:(c,v)=>{ v?cls.add(c):cls.delete(c); } } };
  const E={
    window:{ innerWidth:l, innerHeight:h },
    navigator:{ maxTouchPoints: tactile?5:0 },
    document:{ getElementById:()=>voile },
    G: partieEnCours?{running:true,demo:false}:null,
    _enPause:false, _pausePaysage:false, pause:false,
    mettreEnPause(){ E.pause=true; }, reprendrePartie(){},
    verrouillerPortrait(){}
  };
  if(tactile) E.window.ontouchstart=null;   /* 'ontouchstart' in window */
  moteur(E);
  return { voile:cls.has('on'), pause:E.pause };
}
try{
  const a=scenario(915,412,true,false);
  a.voile ? ok('menu en paysage sur mobile : voile affiche (portrait impose partout)') : ko('menu en paysage : pas de voile');
  !a.pause ? ok('menu en paysage : aucune mise en pause parasite') : ko('menu : pause declenchee sans partie');
  const b=scenario(915,412,true,true);
  (b.voile&&b.pause) ? ok('partie en paysage : voile affiche ET partie mise en pause') : ko('partie paysage : voile='+b.voile+' pause='+b.pause);
  const c=scenario(412,915,true,true);
  !c.voile ? ok('portrait sur mobile : rien ne bloque') : ko('portrait : voile a tort');
  const e=scenario(1600,900,false,false);
  !e.voile ? ok('ecran d\'ordinateur (non tactile) : voile inactif, developpement possible') : ko('bureau : voile a tort');
  const g=scenario(800,760,true,false);
  !g.voile ? ok('ecran presque carre 800x760 : tolere, pas de voile') : ko('carre : voile a tort');
}catch(err){ ko('scenario : '+err.message); }

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

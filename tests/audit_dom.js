const fs=require('fs'), {JSDOM}=require('jsdom');
const R=[]; const ok=m=>R.push('RES ok  '+m); const ko=m=>R.push('RES KO  '+m); const wa=m=>R.push('RES !!  '+m);
const F=require('path').join(__dirname,'../game/index_v37.html');
const html=fs.readFileSync(F,'utf8');
const dom=new JSDOM(html,{runScripts:'outside-only'});
const d=dom.window.document;
const js=html.slice(html.lastIndexOf('<script>')+8, html.lastIndexOf('</script>'));

/* 1. Chaque getElementById du code vise-t-il un element existant ? */
const vises=[...new Set([...js.matchAll(/getElementById\(['"]([\w-]+)['"]\)/g)].map(m=>m[1]))];
const absents=vises.filter(id=>!d.getElementById(id));
/* Certains sont crees dynamiquement : on les tolere s'ils sont aussi crees dans le code */
const creesDyn=absents.filter(id=>new RegExp("id\\s*=\\s*['\"]"+id+"['\"]").test(js) || new RegExp("\\.id\\s*=\\s*['\"]"+id+"['\"]").test(js));
const vraimentAbsents=absents.filter(id=>!creesDyn.includes(id));
(vraimentAbsents.length===0) ? ok(vises.length+' identifiants vises par le code, tous presents (dont '+creesDyn.length+' crees a la volee)')
                             : ko('identifiants introuvables : '+vraimentAbsents.join(', '));

/* 2. Chaque onclick du HTML pointe-t-il vers une fonction definie ? */
const appels=[...new Set([...html.matchAll(/on(?:click|change|input)\s*=\s*"([a-zA-Z_$][\w$]*)\(/g)].map(m=>m[1]))];
const definies=new Set([...js.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const orphelins=appels.filter(f=>!definies.has(f));
(orphelins.length===0) ? ok(appels.length+' gestionnaires onclick, tous relies a une fonction existante')
                       : ko('gestionnaires morts : '+orphelins.join(', '));

/* 3. Doublons d'identifiants dans le HTML */
const tous=[...d.querySelectorAll('[id]')].map(e=>e.id);
const dbl=tous.filter((x,i)=>tous.indexOf(x)!==i);
(dbl.length===0) ? ok(tous.length+' elements identifies, aucun doublon') : ko('doublons : '+[...new Set(dbl)].join(', '));

/* 4. Ecrans et navigation */
const ecrans=[...d.querySelectorAll('.screen')].map(e=>e.id);
const cibles=[...new Set([...html.matchAll(/show\(['"]([\w-]+)['"]\)/g)].map(m=>m[1]))];
const inconnues=cibles.filter(c=>!ecrans.includes('s-'+c));
(inconnues.length===0) ? ok(ecrans.length+' ecrans, toutes les navigations pointent vers un ecran reel') : ko('navigation vers un ecran inexistant : '+inconnues);

/* 5. Bas de page : chaque ecran doit avoir sa marge sous la barre d'onglets */
(/\.screen:not\(\.game\) > div\{\s*padding-bottom/.test(html)) ? ok('bas de page : marge appliquee sous la barre d\'onglets') : ko('marge de bas de page absente');

/* 6. Ressources externes */
const cdn=[...new Set([...html.matchAll(/https?:\/\/([\w.-]+)/g)].map(m=>m[1]))];
ok('domaines externes appeles : '+cdn.join(', '));

/* 7. Poids */
const ko_=(fs.statSync(F).size/1048576).toFixed(2);
ok('source : '+ko_+' Mo, '+html.split('\n').length.toLocaleString()+' lignes');

/* 8. Metadonnees mobiles */
[['viewport','width=device-width'],['screen-orientation','portrait'],['theme-color','#05050a']].forEach(([n,v])=>{
  const m=d.querySelector('meta[name="'+n+'"]');
  (m && String(m.getAttribute('content')).indexOf(v)>=0) ? ok('meta '+n+' : '+m.getAttribute('content')) : ko('meta '+n+' absente ou incorrecte');
});
const ic=d.querySelector('link[rel="icon"]'), at=d.querySelector('link[rel="apple-touch-icon"]');
(ic&&at) ? ok('favicon et icone d\'ecran d\'accueil declarees') : ko('icones manquantes');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

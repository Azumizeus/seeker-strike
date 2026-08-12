const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Balayage exhaustif : toute chaine affichee au joueur doit avoir une
   traduction anglaise. Les noms propres, identiques dans les deux langues,
   sont declares ici — pas ignores en silence. */
const NOMS_PROPRES = new Set([
  ...SHIPS.map(s=>s.name),                 /* Seeker One, Phantom, Comet... */
  'APOCRYPHA','CHAOS PROTOCOL','GENESIS','NEXUS','NEXUS PRIME','SEEKER','SKR','SOL','GC'
]);
/* Les lignes de LORE_INTRO ne sont jamais affichees seules : seul le bloc
   assemble l'est. On verifie donc le bloc, pas ses lignes. */
const manque=[];
function v(t, src){
  if(typeof t!=='string') return;
  const s=t.trim();
  if(s.length<3 || !/[a-zA-ZÀ-ÿ]/.test(s)) return;
  if(NOMS_PROPRES.has(s)) return;
  if(!EN[s]) manque.push(src+' :: '+s.replace(/\n/g,' | ').slice(0,70));
}
v(LORE_INTRO.join('\n'), 'intro du lore (bloc affiche)');
v('ARCHIVES GENESIS','emetteur de l\'intro');
Object.keys(TRANSMISSIONS).forEach(k=>{ v(TRANSMISSIONS[k].txt,'transmission N'+k); v(TRANSMISSIONS[k].de,'emetteur N'+k); });
NODES.forEach(n=>{ v(n.title,'secteur N'+n.id); v(n.brief,'briefing N'+n.id); });
SHIPS.forEach(s=>v(s.condTxt,'condition de vaisseau'));
Object.keys(FICHES_VAISSEAU).forEach(k=>{ v(FICHES_VAISSEAU[k].tir,'fiche hangar (tir)'); v(FICHES_VAISSEAU[k].d,'fiche hangar (desc)'); });
MUNITIONS.forEach(m=>{ v(m.name,'munition'); v(m.desc,'munition (desc)'); });
MODES.forEach(m=>v(m.name,'mode'));
BONUSES.forEach(b=>{ v(b.name,'bonus'); v(b.desc,'bonus (desc)'); });
Object.keys(BOSS_DEFS).forEach(k=>v(BOSS_DEFS[k].nom,'boss N'+k));
Object.keys(DROPS).forEach(k=>v(DROPS[k].nom,'butin '+k));
SECRETS.forEach(s=>{ v(s.nom,'secret'); v(s.indice,'secret (indice)'); v(s.d,'secret (desc)'); });
PALIERS_TX.forEach(p=>{ v(p.n,'palier'); v(p.d,'palier (desc)'); v(p.recompense,'palier (recompense)'); });
TRAINEES.forEach(t=>v(t.nom,'trainee'));
v(TRANSMISSION_ARCHIVE.titre,'archive (titre)'); v(TRANSMISSION_ARCHIVE.texte,'archive (texte)');
listeQuetes().forEach(q=>{ v(q.n,'quete'); v(q.d,'quete (desc)'); });
try{ BESTIAIRE.forEach(b=>{ v(b.nom,'bestiaire'); v(b.d,'bestiaire (desc)'); }); }catch(e){}
try{ OBJETS.forEach(o=>{ v(o.titre,'objet'); v(o.effet,'objet (effet)'); v(o.d,'objet (desc)'); }); }catch(e){}
try{ Object.keys(BOUCLES).forEach(k=>v(BOUCLES[k].nom,'boucle '+k)); }catch(e){}
try{ Object.keys(CLES).forEach(k=>{ v(CLES[k].nom,'cle'); v(CLES[k].desc,'cle (desc)'); }); }catch(e){}

(manque.length===0)
  ? ok('toutes les chaines affichees au joueur ont une traduction anglaise')
  : ko(manque.length+' sans traduction :\n         '+manque.slice(0,14).join('\n         '));

/* L'intro doit reellement basculer */
LANGUE='en';
const intro=T(LORE_INTRO.join('\n'));
(/Year 2140/.test(intro)) ? ok('intro du lore : bascule en anglais verifiee') : ko('intro non traduite : '+intro.slice(0,60));
(intro.split('\n').length===LORE_INTRO.length) ? ok('intro : les '+LORE_INTRO.length+' lignes sont preservees') : ko('mise en page de l\'intro alteree');
(T('ARCHIVES GENESIS')==='GENESIS ARCHIVES') ? ok('emetteur de l\'intro traduit') : ko('emetteur : '+T('ARCHIVES GENESIS'));
LANGUE='fr';
(T(LORE_INTRO.join('\n'))===LORE_INTRO.join('\n')) ? ok('retour au francais correct') : ko('retour FR casse');
ok(Object.keys(EN).length+' entrees dans le dictionnaire anglais');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

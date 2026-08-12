const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Verifie que TOUT texte francais visible expose au joueur a une traduction. */
const manquantes=[];
function verifier(txt, source){
  if(!txt) return;
  const t=String(txt).trim();
  if(!t || t.length<3) return;
  if(!/[a-zA-ZÀ-ÿ]/.test(t)) return;
  if(!EN[t]) manquantes.push(source+' : "'+t.slice(0,60)+'"');
}
/* 1. Paliers on-chain */
PALIERS_TX.forEach(p=>{ verifier(p.n,'palier.nom'); verifier(p.d,'palier.desc'); verifier(p.recompense,'palier.recompense'); });
/* 2. Secrets */
SECRETS.forEach(s=>{ verifier(s.nom,'secret.nom'); verifier(s.indice,'secret.indice'); verifier(s.d,'secret.desc'); });
/* 3. Indicatifs et trainees */
INDICATIFS.concat(INDICATIF_PRESTIGE,'STAGIAIRE').forEach(v=>verifier(v,'indicatif'));
TRAINEES.forEach(t=>verifier(t.nom,'trainee'));
/* 4. Vaisseaux a condition */
SHIPS.filter(s=>s.condTxt).forEach(s=>verifier(s.condTxt,'vaisseau.condition'));
/* 5. Quetes */
listeQuetes().forEach(q=>{ verifier(q.n,'quete.nom'); verifier(q.d,'quete.desc'); });
/* 6. Bestiaire */
try{ (typeof BESTIAIRE!=='undefined'?BESTIAIRE:[]).forEach(e=>{ verifier(e.nom,'bestiaire.nom'); verifier(e.d,'bestiaire.desc'); }); }catch(e){}
/* 7. Transmission de l'archive */
verifier(TRANSMISSION_ARCHIVE.titre,'archive.titre');

(manquantes.length===0)
  ? ok('toutes les chaines exposees au joueur ont une traduction anglaise')
  : ko(manquantes.length+' traductions manquantes :\n         '+manquantes.slice(0,14).join('\n         '));

/* 8. Aucune traduction vide ou identique par erreur */
const vides=Object.keys(EN).filter(k=>!EN[k] || !String(EN[k]).trim());
(vides.length===0) ? ok('aucune traduction vide') : ko(vides.length+' traductions vides');
const nb=Object.keys(EN).length;
(nb>500) ? ok(nb+' entrees dans le dictionnaire anglais') : ko('dictionnaire trop court : '+nb);
/* 9. Le francais ne doit pas fuir dans l'anglais sur les nouvelles cles */
const suspectes=['ARMURIER','ARCHIVISTE','PROPULSION LIBRE','SI J’ÉTAIS DEV','Don en SOL','Don en SKR']
  .filter(k=>EN[k] && EN[k]===k);
(suspectes.length===0) ? ok('les nouvelles cles sont bien traduites, pas recopiees') : ko('non traduites : '+suspectes);
/* 10. T() bascule reellement */
LANGUE='en';
(T('ARMURIER')==='ARMORER') ? ok('T() renvoie bien l\'anglais : ARMURIER -> ARMORER') : ko('T() : '+T('ARMURIER'));
(T('Don en SOL')==='Donate SOL') ? ok('T() : "Don en SOL" -> "Donate SOL"') : ko('T() : '+T('Don en SOL'));
LANGUE='fr';
(T('ARMURIER')==='ARMURIER') ? ok('retour au francais correct') : ko('T() fr casse');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

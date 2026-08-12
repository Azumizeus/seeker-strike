const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
const cles=Object.keys(TRANSMISSIONS);
const sansTxt=cles.filter(k=>!EN[TRANSMISSIONS[k].txt]);
(sansTxt.length===0) ? ok('les '+cles.length+' transmissions ont une traduction anglaise')
                     : ko(sansTxt.length+' sans traduction : secteurs '+sansTxt.join(', '));
const emetteurs=[...new Set(cles.map(k=>TRANSMISSIONS[k].de))];
const sansDe=emetteurs.filter(d=>!EN[d]);
(sansDe.length===0) ? ok('les '+emetteurs.length+' emetteurs sont traduits ('+emetteurs.join(', ')+')')
                    : ko('emetteurs sans traduction : '+sansDe.join(', '));
['TRANSMISSION','APPUYER POUR CONTINUER'].forEach(k=>{
  EN[k] ? ok('libelle traduit : « '+k+' »') : ko('libelle manquant : '+k);
});
/* Le contenu anglais doit vraiment differer du francais */
const identiques=cles.filter(k=>EN[TRANSMISSIONS[k].txt]===TRANSMISSIONS[k].txt);
(identiques.length===0) ? ok('aucune traduction recopiee telle quelle') : ko('recopiees : '+identiques.join(', '));
/* Les sauts de ligne doivent survivre : le texte s'affiche en pre-line */
const sautsFR=cles.reduce((t,k)=>t+(TRANSMISSIONS[k].txt.split('\n').length-1),0);
const sautsEN=cles.reduce((t,k)=>t+((EN[TRANSMISSIONS[k].txt]||'').split('\n').length-1),0);
(sautsFR===sautsEN) ? ok('mise en page preservee : '+sautsFR+' sauts de ligne des deux cotes')
                    : ko('sauts de ligne : '+sautsFR+' en FR contre '+sautsEN+' en EN');
/* T() renvoie bien l'anglais */
LANGUE='en';
const t1=T(TRANSMISSIONS[1].txt);
(t1!==TRANSMISSIONS[1].txt && /Signal picked up/.test(t1)) ? ok('T() traduit la premiere transmission') : ko('T() : '+t1.slice(0,50));
(T('QG SEEKER')==='SEEKER HQ') ? ok('T() traduit l\'emetteur : QG SEEKER -> SEEKER HQ') : ko('emetteur : '+T('QG SEEKER'));
LANGUE='fr';
(T(TRANSMISSIONS[1].txt)===TRANSMISSIONS[1].txt) ? ok('retour au francais correct') : ko('retour FR casse');
/* Le code appelle bien T() */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(/afficherTransmission\(T\(tr\.de\), T\(tr\.txt\)/.test(src)) ? ok('le code passe bien le lore par T()') : ko('appel sans T()');

/* --- Defilement : le conteneur ne doit jamais depasser la fenetre --- */
const m=src.match(/\.screen\{display:none;([^}]*)\}/);
const regle=m?m[1].replace(/\s+/g,''):'';
(!/min-height:100vh/.test(regle)) ? ok('.screen : plus de min-height:100vh qui bloquait le defilement') : ko('min-height:100vh encore la');
(/max-height:100dvh/.test(regle)) ? ok('.screen : hauteur plafonnee a la fenetre visible') : ko('max-height absent');
(/overflow-y:auto/.test(regle)) ? ok('.screen : defilement vertical actif') : ko('overflow-y absent');
(/height:100vh;height:100dvh/.test(regle)) ? ok('.screen : repli 100vh pour les navigateurs sans dvh') : ko('repli absent');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));
/* --- Premiere ouverture --- */
localStorage.removeItem('ss_langue_choisie');
(!langueDejaChoisie()) ? ok('premiere ouverture : la langue n\'est pas encore choisie') : ko('deja choisie');
let tutoOuvert=false, accueil=false;
const vraiTuto=global.ouvrirTuto, vraiShow=global.show;
ouvrirChoixLangue();
(cache['choix-langue'] && [...cache['choix-langue'].cls||[]].length>=0) ? ok('ecran de choix ouvert sans erreur') : ko('ouverture cassee');
/* --- Choix EN --- */
LANGUE='fr'; S.prefs=S.prefs||{};
choisirLangueDepart('en');
(LANGUE==='en') ? ok('choix « English » : LANGUE passe a en') : ko('LANGUE : '+LANGUE);
(S.prefs.langue==='en') ? ok('preference enregistree dans la sauvegarde') : ko('pref : '+S.prefs.langue);
(langueDejaChoisie()) ? ok('le choix est memorise : plus jamais redemande') : ko('choix non memorise');
/* --- Choix FR --- */
localStorage.removeItem('ss_langue_choisie');
choisirLangueDepart('fr');
(LANGUE==='fr' && S.prefs.langue==='fr') ? ok('choix « Français » : LANGUE et preference a fr') : ko('fr casse');
/* --- Valeur inattendue --- */
localStorage.removeItem('ss_langue_choisie');
choisirLangueDepart('zz');
(LANGUE==='fr') ? ok('langue inconnue : repli sur le francais') : ko('repli casse : '+LANGUE);
/* --- Deuxieme lancement : on ne redemande pas --- */
(langueDejaChoisie()) ? ok('deuxieme lancement : l\'ecran ne reapparait pas') : ko('redemande a chaque fois');
/* --- La traduction s'applique vraiment --- */
localStorage.removeItem('ss_langue_choisie');
choisirLangueDepart('en');
(T('Don en SOL')==='Donate SOL') ? ok('apres le choix, T() renvoie l\'anglais') : ko('T() : '+T('Don en SOL'));
choisirLangueDepart('fr');
(T('Don en SOL')==='Don en SOL') ? ok('retour au francais operationnel') : ko('T() fr : '+T('Don en SOL'));
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

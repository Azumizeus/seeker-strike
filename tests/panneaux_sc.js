const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
/* Rend chaque panneau des reglages en anglais et verifie qu'il ne reste
   aucun mot francais. On memorise les elements : le harnais en recree un
   a chaque getElementById. */
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));

S.walletReel=true; S.connected=true; S.txTotal=0; S.debloquesTx=[];
S.signatures=[]; S.donsSol=0; S.donsSkr=0; S.dev=true; S.indicatif=''; S.trainee='';
creditTX(150);                       /* tout debloque : tous les blocs se rendent */
S.donsSol=0.05; S.donsSkr=2500;

/* Mots francais qui ne doivent JAMAIS rester quand la langue est EN. */
const FR = /\b(Chaque|palier|donne|récompense|vaisseau|plus fort|Ton indicatif|Traînée|réacteur|Progression|transactions confirmées|dernières conservées|Se débloque|Aucune signature|enregistrée|Entièrement|facultatif|Aucun don|débloque|quoi que ce soit|ni bonus|avantage|identique|donnes jamais|Don en|COPIER|Merci|tu as donné|Raccourcis|démonstration|crédits|progression locale|TOUT DÉBLOQUER|REMETTRE|Quitter le mode|développeur|Émeraude|Braise|jamais été conçu|registre|preuve)\b/;

function rendreTout(){
  renderPanneauPaliers(); renderJournalTx(); renderPanneauDons(); renderPanneauDev();
  return { paliers:cache['panneau-paliers'].innerHTML||'',
           journal:cache['panneau-journal'].innerHTML||'',
           dons:cache['panneau-dons'].innerHTML||'',
           dev:cache['panneau-dev'].innerHTML||'' };
}
LANGUE='en';
let h=rendreTout();
for(const [nom,html] of Object.entries(h)){
  const m=String(html).match(FR);
  (!m) ? ok('panneau '+nom+' : entierement en anglais ('+html.length+' caracteres)')
       : ko('panneau '+nom+' : francais residuel « '+m[0]+' »');
}
/* Quelques traductions doivent apparaitre noir sur blanc */
[['paliers','ON-CHAIN TIERS'],['paliers','Your callsign'],['paliers','Engine trail'],
 ['paliers','Progress:'],['journal','ON-CHAIN LOG'],['journal','confirmed transactions'],
 ['dons','SUPPORT THE GAME'],['dons','Donate SOL'],['dons','Donate SKR'],['dons','COPY'],
 ['dons','Thank you'],['dev','DEVELOPER MODE'],['dev','UNLOCK EVERYTHING']].forEach(([p,t])=>{
  (String(h[p]).indexOf(t)>=0) ? ok('« '+t+' » present dans '+p) : ko('« '+t+' » absent de '+p);
});
/* Journal verrouille : le message doit aussi etre traduit */
S.debloquesTx=[]; S.txTotal=2; renderJournalTx();
(String(cache['panneau-journal'].innerHTML).indexOf('Unlocks at 5')>=0)
  ? ok('journal verrouille : message traduit') : ko('message verrouille en francais');

/* Retour au francais : tout redevient francais */
LANGUE='fr'; S.txTotal=0; S.debloquesTx=[]; creditTX(150);
h=rendreTout();
(String(h.paliers).indexOf('Ton indicatif')>=0 && String(h.dons).indexOf('Don en SOL')>=0)
  ? ok('retour en francais : les panneaux repassent en FR') : ko('le francais ne revient pas');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

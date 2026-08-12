const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{

/* ---- Faux web3 + faux provider, le vrai chemin d'envoi est exerce ---- */
function FauxPK(v){ this.v=String(v&&v.v||v); }
FauxPK.prototype.toBase58=function(){ return this.v; };
FauxPK.prototype.toString=function(){ return this.v; };
function FauxTx(o){ this.o=o; this.instr=[];
  this.add=(i)=>{ this.instr.push(i); return this; };
  this.serialize=()=>new Uint8Array([1,2,3]); }
function FauxInstr(o){ Object.assign(this,o); }
const fauxW3={ PublicKey:FauxPK, Transaction:FauxTx, TransactionInstruction:FauxInstr };
CHAINE.mod=fauxW3;
globalThis.chargerWeb3 = async()=>fauxW3;
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'BH'}), sendRawTransaction:async()=>'5'.repeat(64) };

S.connected=true; S.walletReel=true; S.walletType='ext'; S.walletId='phantom';
S.addressComplete='AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH';
window.phantom=undefined;

/* ---- 1. LE test qui manquait : un wallet qui ne repond JAMAIS ---- */
(typeof DELAI_SIGNATURE==='number' && DELAI_SIGNATURE>0) ? ok('borne de temps declaree : '+(DELAI_SIGNATURE/1000)+' s') : ko('DELAI_SIGNATURE absent');
(typeof avecDelai==='function') ? ok('enveloppe avecDelai presente') : ko('avecDelai absent');

/* On raccourcit la borne le temps du test plutot que d'attendre 90 s. */
const vraiSetTimeout = setTimeout;
globalThis.setTimeout = (fn,ms,...a)=> vraiSetTimeout(fn, ms>=30000 ? 60 : ms, ...a);

window.solana = { publicKey:new FauxPK(S.addressComplete),
  connect: async()=>window.solana,
  signTransaction: ()=>new Promise(()=>{})      /* ne resout ni ne rejette, jamais */
};
CHAINE.enCours=false; CHAINE.derniereErreur=null; CHAINE.bhCache='BH'; CHAINE.bhTemps=Date.now();
const t0=Date.now();
const r = await envoyerTxSeeker('test');
const dt=Date.now()-t0;
(r===null) ? ok('wallet muet : la fonction rend null au lieu de rester suspendue') : ko('retour : '+r);
(CHAINE.enCours===false) ? ok('VERROU RELACHE apres un wallet qui ne repond jamais (etait bloque a vie)') : ko('VERROU COINCE — spinner infini');
(dt<5000) ? ok('rend la main en '+dt+' ms, sans attendre indefiniment') : ko('trop long : '+dt+' ms');
(/répondu/.test(String(CHAINE.derniereErreur))) ? ok('message : "'+CHAINE.derniereErreur+'"') : ko('message : '+CHAINE.derniereErreur);

/* Un second envoi reste possible : le verrou n'a pas ete perdu */
window.solana.signTransaction = async(tx)=>tx;
CHAINE.enCours=false;
const r2 = await envoyerTxSeeker('test');
(r2 && r2.length>=64) ? ok('apres le blocage, un nouvel envoi passe normalement') : ko('envoi suivant casse : '+r2);
globalThis.setTimeout = vraiSetTimeout;

/* ---- 2. Memo unique : deux fois la meme action ne donne pas la meme TX ---- */
let vues=[];
CHAINE.mod.Transaction=function(o){ this.o=o; this.instr=[];
  this.add=(i)=>{ this.instr.push(i); if(i.data) vues.push(String(i.data)); return this; };
  this.serialize=()=>new Uint8Array([1]); };
CHAINE.enCours=false; vues=[];
await envoyerTxSeeker('quete:test');
CHAINE.enCours=false;
await envoyerTxSeeker('quete:test');
(vues.length===2) ? ok('deux memos construits') : ko('memos : '+vues.length);
(vues[0]!==vues[1]) ? ok('meme action deux fois : memos differents, plus de « already processed »') : ko('MEMOS IDENTIQUES : la 2e TX sera rejetee');
/* Cent marqueurs d'affilee : l'horloge seule les rendait identiques quand
   deux appels tombaient dans la meme milliseconde. */
const cent=[]; for(let i=0;i<100;i++) cent.push(marqueurUnique());
(new Set(cent).size===100) ? ok('100 marqueurs consecutifs, 100 valeurs distinctes (meme milliseconde comprise)') : ko('collisions : '+(100-new Set(cent).size));
(vues.every(v=>/seeker-strike:quete:test/.test(v))) ? ok('l\'action reste lisible dans le memo') : ko('memo illisible : '+vues[0]);

/* ---- 3. Plus de substitution silencieuse de wallet ---- */
window.solflare = { publicKey:new FauxPK('SolflareAdresse111111111111111111'), signTransaction:async t=>t };
window.solana   = { publicKey:new FauxPK('PhantomAdresse1111111111111111111'), signTransaction:async t=>t };
S.walletId='solflare'; _providerExt=null;
const choisi = getProvider(S.walletId);
(choisi===window.solflare) ? ok('wallet choisi = Solflare : c\'est bien lui qui est servi') : ko('mauvais provider');
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(/S\.walletId \? getProvider\(S\.walletId\)/.test(src))
  ? ok('aucun repli vers un autre wallet quand le joueur en a choisi un') : ko('repli silencieux encore possible');
(/getProvider\('phantom'\) \|\| getProvider\('solflare'\) \|\| window\.solana/.test(src))
  ? ok('chaine de repli complete quand aucun wallet n\'est choisi') : ko('chaine de repli incomplete');

/* ---- 4. Messages d'erreur : les trous signales ---- */
const cas=[
  ['timeout:signature',                'répondu',   'wallet muet'],
  ['Transaction rejected',             'refus',     'refus Solflare'],
  ['{"code":4001,"message":""}',       'refus',     'code 4001 Backpack'],
  ['already been processed',           'déjà',      'transaction dupliquee'],
  ['User rejected the request',        'refus',     'refus Phantom']
];
cas.forEach(([brut,mot,quoi])=>{
  (causeLisible(new Error(brut)).indexOf(mot)>=0)
    ? ok('message clair pour '+quoi+' : "'+causeLisible(new Error(brut))+'"')
    : ko(quoi+' -> '+causeLisible(new Error(brut)));
});
const vide=causeLisible({});
(/refusé sans préciser/.test(vide)) ? ok('rejet en objet vide : "'+vide+'"') : ko('rejet muet -> '+vide);
(!/object Object/.test(vide)) ? ok('plus de « [object Object] » sous les yeux du joueur') : ko('jargon affiche : '+vide);
(causeLisible({code:4001}).indexOf('refus')>=0) ? ok('rejet en objet avec code 4001 reconnu') : ko('4001 en objet -> '+causeLisible({code:4001}));

/* ---- 5. Le bouton dit ce qui se passe ---- */
(/SIGNATURE EN COURS/.test(src)) ? ok('le bouton affiche « signature en cours » pendant l\'envoi') : ko('aucun retour visuel pendant l\'envoi');
LANGUE='en';
["SIGNATURE EN COURS…","le wallet n'a pas répondu, réessaie","transaction déjà envoyée, patiente un instant"]
  .forEach(k=>{ (T(k)!==k) ? ok('traduit : '+k.slice(0,34)) : ko('NON TRADUIT : '+k); });
LANGUE='fr';

/* ---- 6. Budget de temps : signature + cache < duree de vie du blockhash ---- */
(DELAI_SIGNATURE<=45000) ? ok('borne de signature : '+(DELAI_SIGNATURE/1000)+' s') : ko('borne trop longue : '+(DELAI_SIGNATURE/1000)+' s');
(typeof BH_VIE==='number') ? ok('duree de vie du blockhash declaree : '+(BH_VIE/1000)+' s') : ko('BH_VIE absente');
/* Ce qui compte n'est pas BH_FENETRE seule, mais la fenetre REELLEMENT
   utilisable une fois la signature deduite : blockhashFrais(marge) refuse de
   servir un blockhash qui n'y survivrait pas. */
const fenetreUtile = Math.min(BH_FENETRE, BH_VIE - DELAI_SIGNATURE);
(fenetreUtile > 0)
  ? ok('fenetre de cache utile avant signature : '+(fenetreUtile/1000)+' s (le cache sert encore aux envois rapproches)')
  : ko('BUDGET NUL : signature '+(DELAI_SIGNATURE/1000)+' s >= vie du blockhash '+(BH_VIE/1000)+' s, plus aucun cache possible');
(fenetreUtile >= 10000)
  ? ok('assez large pour absorber un double appui et une rafale') : ko('fenetre trop courte : '+(fenetreUtile/1000)+' s');

/* Un blockhash trop vieux pour survivre a la signature doit etre renouvele */
let demandes=0;
_impl_bh = async()=>{ demandes++; return {blockhash:'BH'+demandes}; };
CHAINE.connexion={ getLatestBlockhash:(...a)=>_impl_bh(...a), sendRawTransaction:async()=>'5'.repeat(64) };
CHAINE.bhCache='VIEUX'; CHAINE.bhTemps=Date.now()-30000;   /* 30 s d'age */
const bhCourt = await blockhashFrais(0);
(bhCourt==='VIEUX') ? ok('sans attente prevue : le cache de 30 s est reutilise') : ko('cache ignore a tort');
CHAINE.bhCache='VIEUX'; CHAINE.bhTemps=Date.now()-30000;
const bhLong = await blockhashFrais(DELAI_SIGNATURE);
(bhLong!=='VIEUX') ? ok('avec 45 s de signature devant : blockhash renouvele au lieu d\'expirer') : ko('BLOCKHASH PERIME SERVI : la TX sera rejetee');

/* ---- 7. Timeout : le message depend de qui diffuse ---- */
CHAINE.canalAuto=false;
(/réessaie/.test(causeLisible(new Error('timeout:signature')))) ? ok('diffusion locale : "'+causeLisible(new Error('timeout:signature'))+'"') : ko('message : '+causeLisible(new Error('timeout:signature')));
CHAINE.canalAuto=true;
(/journal/.test(causeLisible(new Error('timeout:signature')))) ? ok('diffusion par le wallet : "'+causeLisible(new Error('timeout:signature'))+'"') : ko('message : '+causeLisible(new Error('timeout:signature')));
LANGUE='en';
(T("le wallet n'a pas répondu · vérifie le journal avant de relancer")!=="le wallet n'a pas répondu · vérifie le journal avant de relancer") ? ok('message adapte traduit') : ko('non traduit');
LANGUE='fr'; CHAINE.canalAuto=false;

R.forEach(l=>console.log(l));
const bad=R.filter(l=>l.startsWith('RES KO')).length;
console.log(bad?'RES '+bad+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(bad?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+String(e.stack).split('\n')[1]); process.exit(1); }})();

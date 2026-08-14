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
const fenetreUtile = Math.min(BH_FENETRE, BH_VIE - DELAI_SIGNATURE - DELAI_DIFFUSION - BH_COUSSIN);
/* Ce qui doit etre vrai : un blockhash TOUT FRAIS doit survivre a la
   signature et a la diffusion. Sinon aucune transaction ne peut aboutir,
   quel que soit le cache. */
(DELAI_SIGNATURE + DELAI_DIFFUSION < BH_VIE)
  ? ok('un blockhash frais survit au parcours complet ('+((DELAI_SIGNATURE+DELAI_DIFFUSION)/1000)+' s < '+(BH_VIE/1000)+' s)')
  : ko('IMPOSSIBLE : '+((DELAI_SIGNATURE+DELAI_DIFFUSION)/1000)+' s >= '+(BH_VIE/1000)+' s, aucune TX ne peut aboutir');
(DELAI_SIGNATURE<=42000)
  ? ok('on abandonne avant que la signature ne devienne inutile ('+(DELAI_SIGNATURE/1000)+' s)')
  : ko('on attend une signature deja condamnee : '+(DELAI_SIGNATURE/1000)+' s');
/* Fenetre nulle sur le chemin signature, et c'est correct : entre economiser
   des appels RPC et laisser le joueur signer tranquillement, on choisit le
   joueur. Le double appui n'est pas protege par le cache mais par le verrou
   CHAINE.enCours, pose avant tout `await` — c'est teste plus haut. */
(fenetreUtile <= 3000)
  ? ok('fenetre de cache reelle : '+(fenetreUtile/1000)+' s (coussin deduit) — chaque envoi signe repart quasi toujours d\'un blockhash frais')
  : ko('fenetre annoncee trop large : '+(fenetreUtile/1000)+' s');
/* Le libelle du code doit dire la meme chose que le calcul. */
const srcF=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(srcF.indexOf('BH_VIE - DELAI_SIGNATURE - DELAI_DIFFUSION - BH_COUSSIN')>=0)
  ? ok('le commentaire du code inclut bien BH_COUSSIN dans la formule') : ko('formule du commentaire incomplete');
(srcF.indexOf('52-40-7-3 = 2 s')>=0)
  ? ok('le chiffre annonce dans le code correspond au calcul reel') : ko('chiffre du commentaire decale');
(typeof DELAI_DIFFUSION==='number' && DELAI_DIFFUSION>=5000)
  ? ok('budget de diffusion pris en compte : '+(DELAI_DIFFUSION/1000)+' s (reprises 429 + reseau)') : ko('DELAI_DIFFUSION absent ou trop court');
(BH_VIE<=52000)
  ? ok('duree de vie prudente : '+(BH_VIE/1000)+' s (blockhash deja vieux a l\'arrivee)') : ko('BH_VIE optimiste : '+(BH_VIE/1000)+' s');
/* Le pire cas doit non seulement tenir, mais garder du jeu : a l'egalite
   exacte, une diffusion 0,5 s plus lente que prevu faisait basculer. */
const pire = Math.max(0,fenetreUtile) + DELAI_SIGNATURE + DELAI_DIFFUSION;
const coussin = BH_VIE - pire;
(coussin >= BH_COUSSIN)
  ? ok('pire cas '+(pire/1000)+' s sur '+(BH_VIE/1000)+' s : '+(coussin/1000)+' s de coussin')
  : ko('MARGE INSUFFISANTE : '+(coussin/1000)+' s, une diffusion lente fait basculer');

/* Un blockhash trop vieux pour survivre a la signature doit etre renouvele */
let demandes=0;
_impl_bh = async()=>{ demandes++; return {blockhash:'BH'+demandes}; };
CHAINE.connexion={ getLatestBlockhash:(...a)=>_impl_bh(...a), sendRawTransaction:async()=>'5'.repeat(64) };
CHAINE.bhCache='VIEUX'; CHAINE.bhTemps=Date.now()-30000;   /* 30 s d'age */
const bhCourt = await blockhashFrais(0);
(bhCourt==='VIEUX') ? ok('sans attente prevue : le cache de 30 s est reutilise') : ko('cache ignore a tort');
CHAINE.bhCache='VIEUX'; CHAINE.bhTemps=Date.now()-30000;
const bhLong = await blockhashFrais(DELAI_SIGNATURE + DELAI_DIFFUSION);
(bhLong!=='VIEUX') ? ok('avec 45 s de signature devant : blockhash renouvele au lieu d\'expirer') : ko('BLOCKHASH PERIME SERVI : la TX sera rejetee');

/* Le canal est recalcule a chaque envoi : un timeout sur Seed Vault ne doit
   pas contaminer le message d'un envoi suivant par extension. */
const srcCanal=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
const iFn = srcCanal.indexOf('async function signerEtEnvoyer');
const iRaz = srcCanal.indexOf('CHAINE.canalAuto = false;', iFn);
const iVrai = srcCanal.indexOf('CHAINE.canalAuto = true;', iFn);
(iRaz>iFn && iRaz<iVrai) ? ok('canalAuto remis a false en tete de signerEtEnvoyer, avant toute affectation') : ko('canalAuto pas reinitialise : message trompeur possible');

/* ---- 6bis. La reconnexion est HORS du budget du blockhash ---- */
const srcB=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(typeof amorcerWallet==='function') ? ok('amorcerWallet() present') : ko('amorcerWallet absent');
/* Dans chaque fonction d'envoi, l'amorcage doit preceder la prise du blockhash */
['async function envoyerTxSeeker','async function payerEnSKR','async function donnerSOL'].forEach(fn=>{
  const i=srcB.indexOf(fn);
  const fin=srcB.indexOf('\n}', srcB.indexOf('finally{ CHAINE.enCours=false; }', i));
  const bloc=srcB.slice(i, fin>i?fin:i+9000);
  const a=bloc.indexOf('amorcerWallet()');
  const b=bloc.indexOf('blockhashFrais(');
  (a>=0 && b>=0 && a<b)
    ? ok(fn.replace('async function','').trim()+' : wallet amorce AVANT la prise du blockhash')
    : ko(fn+' : amorcage '+a+' / blockhash '+b+' — les 30 s de reconnexion rentrent dans le budget');
});
(DELAI_RECONNEXION + DELAI_SIGNATURE + DELAI_DIFFUSION > BH_VIE)
  ? ok('sans amorcage le budget explosait ('+((DELAI_RECONNEXION+DELAI_SIGNATURE+DELAI_DIFFUSION)/1000)+' s > '+(BH_VIE/1000)+' s) — d\'ou amorcerWallet()')
  : ok('reconnexion assez courte pour tenir dans le budget de toute facon');
(DELAI_SIGNATURE + DELAI_DIFFUSION + BH_COUSSIN <= BH_VIE)
  ? ok('budget complet hors reconnexion : '+((DELAI_SIGNATURE+DELAI_DIFFUSION+BH_COUSSIN)/1000)+' s <= '+(BH_VIE/1000)+' s')
  : ko('BUDGET DEPASSE');

/* Un timeout de notre horloge ne doit pas condamner un RPC sain */
(estRpcCasse(new Error('timeout:signature'))===false)
  ? ok('timeout du wallet : le RPC n\'est pas ecarte a tort') : ko('un joueur lent ferait ecarter Helius pour la session');
(estRpcCasse(new Error('gateway timeout'))===true)
  ? ok('vrai timeout reseau : toujours reconnu comme panne RPC') : ko('timeout reseau ignore');

/* ---- 6ter. Un seul appel au wallet, meme si deux le demandent ---- */
let connexions=0;
window.solana = { publicKey:new FauxPK(S.addressComplete),
  connect: async()=>{ connexions++; await pause(30); return window.solana; },
  signTransaction: async t=>t };
_providerExt=null; _providerEnCours=null; S.walletId='phantom'; S.walletType='ext';
delete window.solana.publicKey;                 /* force le passage par connect() */
window.solana.publicKey=undefined;
const [pa,pb] = await Promise.all([retrouverProvider(), retrouverProvider()]);
(connexions<=1) ? ok('deux demandes simultanees : une seule connexion au wallet ouverte ('+connexions+')')
                : ko('DOUBLE CONNEXION : '+connexions+' appels a connect()');
(pa===pb) ? ok('les deux appelants recoivent la meme promesse') : ko('promesses distinctes');
(_providerEnCours===null) ? ok('le memo est relache une fois l\'appel termine') : ko('memo bloque, plus aucune reconnexion possible');
window.solana.publicKey=new FauxPK(S.addressComplete);

/* ---- 6quater. La diffusion s'arrete a l'echeance ---- */
let tentatives=0;
const envoiSature = async()=>{ tentatives++; throw new Error('429 Too Many Requests'); };
S.rpcPerso=''; reconstruirePool();
/* rpcSuivant() reconstruit la connexion : le stub doit survivre a la rotation */
CHAINE.mod={ Connection:function(u){ this.url=u;
  this.getLatestBlockhash=async()=>({blockhash:'BH'});
  this.sendRawTransaction=(...a)=>envoiSature(...a); } };
CHAINE.connexion=new CHAINE.mod.Connection('test');
const t0d=Date.now();
try{ await diffuser(new Uint8Array([1]), Date.now()-1); ko('aucune erreur alors que l\'echeance est depassee'); }
catch(e){ ok('echeance depassee : la diffusion abandonne au lieu d\'epuiser les essais'); }
(tentatives<=1) ? ok('une seule tentative apres l\'echeance, pas six ('+tentatives+')') : ko('tentatives inutiles : '+tentatives);
/* Un reseau mobile lent ne doit pas condamner l'endpoint : l'echeance se juge
   avant marquerRpcMort, sinon un `failed to fetch` tardif tuait Helius. */
(!RPC_MORTS[CHAINE.rpc]) ? ok('echeance depassee : l\'endpoint n\'est pas ecarte a tort') : ko('RPC CONDAMNE par un reseau lent : la session finit sur le RPC officiel');
(Date.now()-t0d < 1500) ? ok('abandon immediat ('+(Date.now()-t0d)+' ms), le joueur est prevenu tout de suite') : ko('trop lent');
(/expir/.test(causeLisible(new Error('blockhash not found : echeance depassee'))))
  ? ok('message : "'+causeLisible(new Error('blockhash not found : echeance depassee'))+'"') : ko('message obscur');

/* Sans echeance, le comportement d'origine est preserve */
tentatives=0;
try{ await diffuser(new Uint8Array([1])); }catch(e){}
(tentatives>=2) ? ok('sans echeance : les reprises 429 fonctionnent toujours ('+tentatives+' tentatives)') : ko('reprises cassees : '+tentatives);

/* Le garde d'abandon doit suivre la convention du fichier, pas une valeur
   litterale : walletType recoit res.type du connecteur ('phantom', etc.). */
const srcW=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(srcW.indexOf("!(await amorcerWallet()) && S.walletType==='ext'")<0)
  ? ok('garde d\'abandon : plus de test sur la valeur litterale ext') : ko('garde muet si walletType vaut autre chose que ext');
/* Compter les points d'envoi en dur cassait ce test a chaque ajout : SOL-5
   en a introduit un 4e (payerEnSOL). Ce qui compte n'est pas leur nombre,
   c'est qu'ils suivent TOUS la convention. On verifie donc la proportion. */
const gardesTotal = (srcW.match(/await amorcerWallet\(\)/g)||[]).length;
const gardesOk    = (srcW.match(/!\(await amorcerWallet\(\)\) && S\.walletType!=='mwa'/g)||[]).length;
(gardesTotal>=3 && gardesOk===gardesTotal)
  ? ok('les '+gardesOk+' points d\'envoi utilisent la convention !== mwa')
  : ko('convention incoherente entre les points d\'envoi : '+gardesOk+'/'+gardesTotal);

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

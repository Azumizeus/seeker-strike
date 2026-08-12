const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);

/* --- 1. Pool de RPC --- */
(Array.isArray(RPC_DEVNET)&&RPC_DEVNET.length>=2) ? ok('pool de '+RPC_DEVNET.length+' RPC devnet') : ko('pool absent');
/* Le RPC officiel n'est plus le principal : il est sature en permanence.
   L'ordre exact et l'endpoint personnel sont couverts par rpc2_sc. */
(RPC_DEVNET.indexOf('https://api.devnet.solana.com')>0)
  ? ok('le RPC officiel sature n\'est plus le point d\'entree principal') : ko('ordre du pool : '+RPC_DEVNET);

/* --- 2. Detection de saturation --- */
const cas=[['Error: 429 : {"jsonrpc":"2.0"',true],['429 Too Many Requests',true],
           ['rate limit exceeded',true],['blockhash not found',false],['User rejected',false]];
cas.forEach(([m,att])=>{ (estSature(new Error(m))===att)
  ? ok('saturation '+(att?'detectee':'ignoree')+' : '+m.slice(0,28))
  : ko('mauvaise detection : '+m.slice(0,28)); });

/* --- 3. Bascule de RPC --- */
/* Le stub de Connection reproduit le vrai comportement : chaque bascule de RPC
   reconstruit un client, qui doit garder les memes methodes. */
let _impl={ getLatestBlockhash: async()=>({blockhash:'BH'}), sendRawTransaction: async()=>'SIG' };
CHAINE.mod={ Connection:function(u){ this.url=u;
  this.getLatestBlockhash=(...a)=>_impl.getLatestBlockhash(...a);
  this.sendRawTransaction=(...a)=>_impl.sendRawTransaction(...a); } };
const dep=CHAINE.rpc; rpcSuivant();
(CHAINE.rpc!==dep && RPC_DEVNET.indexOf(CHAINE.rpc)>=0) ? ok('bascule vers un RPC de secours : '+CHAINE.rpc) : ko('pas de bascule');
for(let i=0;i<RPC_DEVNET.length;i++) rpcSuivant();
(RPC_DEVNET.indexOf(CHAINE.rpc)>=0) ? ok('la rotation boucle sans sortir du pool') : ko('rotation hors pool');

/* --- 4. Blockhash mis en cache : un seul appel reseau pour 5 demandes --- */
let appels=0;
_impl.getLatestBlockhash = async()=>{ appels++; return {blockhash:'BH'+appels}; };
CHAINE.connexion=new CHAINE.mod.Connection('test');
CHAINE.bhCache=null; CHAINE.bhTemps=0;
(async()=>{
  const v=[]; for(let i=0;i<5;i++) v.push(await blockhashFrais());
  (appels===1) ? ok('5 envois d\'affilee = 1 seul appel RPC (etait 5)') : ko('appels RPC : '+appels);
  (v.every(x=>x==='BH1')) ? ok('meme blockhash reutilise dans la fenetre de 40 s') : ko('blockhash incoherent');

  /* Passe le cache : nouvel appel */
  CHAINE.bhTemps = Date.now() - (BH_FENETRE + 1000);
  await blockhashFrais();
  (appels===2) ? ok('au-dela de la fenetre ('+(BH_FENETRE/1000)+' s) : blockhash frais redemande') : ko('cache jamais rafraichi');
  (typeof BH_FENETRE==='number' && BH_FENETRE>0) ? ok('la fenetre de cache est une constante nommee, pas un nombre en dur') : ko('BH_FENETRE absente');

  /* --- 5. Reprise sur 429 --- */
  let n=0;
  _impl.getLatestBlockhash = async()=>{ n++; if(n<3) throw new Error('429 Too Many Requests'); return {blockhash:'OK'}; };
  CHAINE.connexion=new CHAINE.mod.Connection('test');
  CHAINE.bhCache=null; CHAINE.bhTemps=0;
  const bh=await blockhashFrais();
  (bh==='OK'&&n===3) ? ok('429 : reessaie et finit par passer ('+n+' tentatives)') : ko('reprise KO : '+bh+'/'+n);

  /* Une erreur qui n'est pas une saturation ne doit pas etre reessayee */
  let m=0;
  _impl.getLatestBlockhash = async()=>{ m++; throw new Error('bad request'); };
  CHAINE.connexion=new CHAINE.mod.Connection('test');
  CHAINE.bhCache=null; CHAINE.bhTemps=0;
  try{ await blockhashFrais(); ko('erreur non-429 avalee'); }
  catch(e){ (m===1) ? ok('erreur non liee au debit : remontee immediatement') : ko('reessais inutiles : '+m); }

  /* --- 6. Messages lisibles --- */
  const att=[['Error: 429 : {"jsonrpc"','saturé'],['Blockhash not found','expirée'],
             ['User rejected the request','refusée'],['insufficient lamports','insuffisant']];
  att.forEach(([brut,mot])=>{ (causeLisible(new Error(brut)).indexOf(mot)>=0)
    ? ok('message clair pour « '+brut.slice(0,22)+' »')
    : ko('message obscur : '+causeLisible(new Error(brut))); });
  (causeLisible(new Error('429')).indexOf('jsonrpc')<0) ? ok('le dump JSON brut n\'est plus affiche au joueur') : ko('dump JSON encore visible');

  /* --- 7. Delai entre deux lots --- */
  (typeof DELAI_LOT==='number'&&DELAI_LOT>=10000) ? ok('delai entre lots : '+(DELAI_LOT/1000)+' s') : ko('delai absent');
  _dernierLot=Date.now();
  (attenteLot()>0) ? ok('juste apres un lot : envoi bloque ('+attenteLot()+' s)') : ko('spam possible');
  _dernierLot=Date.now()-DELAI_LOT-1;
  (attenteLot()===0) ? ok('delai ecoule : envoi de nouveau autorise') : ko('bouton bloque a tort');

  /* --- 8. Traductions --- */
  LANGUE='en';
  ['reseau devnet saturé, patiente quelques secondes','TX échouée','PATIENTE','ENVOYER LES 15 TX','RELANCER LES 15 TX']
    .forEach(k=>{ (T(k)!==k) ? ok('traduit en anglais : '+k.slice(0,32)) : ko('non traduit : '+k); });
  LANGUE='fr';

  /* --- 9 a 11 : la VRAIE boucle d'envoi, de bout en bout ---
     On bouchonne web3.js et le provider d'extension, puis on fait passer
     envoyerTxSeeker() par son chemin reel : construction de la transaction,
     signature, diffusion. C'est la seule facon de verifier le verrou. */
  function FauxPK(v){ this.v=String(v&&v.v||v); }
  FauxPK.prototype.toBase58=function(){ return this.v; };
  FauxPK.prototype.toString=function(){ return this.v; };
  function FauxTx(o){ this.o=o; this.instr=[];
    this.add=(i)=>{ this.instr.push(i); return this; };
    this.serialize=()=>new Uint8Array([1,2,3]); }
  function FauxInstr(o){ Object.assign(this,o); }
  const fauxW3={ PublicKey:FauxPK, Transaction:FauxTx, TransactionInstruction:FauxInstr };
  CHAINE.mod=fauxW3; CHAINE.web3=null;
  globalThis.chargerWeb3 = async()=>fauxW3;

  let signatures=0, comportement='succes';
  S.connected=true; S.walletReel=true; S.walletType='ext';
  S.addressComplete='AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH';
  /* retrouverProvider() lit window.solana : c'est par la qu'on injecte, une
     reassignation de la variable locale _providerExt serait sans effet. */
  S.walletId='phantom';
  window.phantom=undefined;
  window.solana = {
    publicKey:new FauxPK(S.addressComplete),
    signTransaction: async(tx)=>{
      signatures++;
      if(comportement==='rejet') throw new Error('User rejected the request');
      if(comportement==='lent') await pause(120);
      return tx;
    },
    connect: async()=>window.solana
  };
  _impl.sendRawTransaction = async()=>{
    if(comportement==='perime') throw new Error('Blockhash not found');
    return '5'.repeat(64);
  };
  CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'BHOK'}),
                     sendRawTransaction:(...a)=>_impl.sendRawTransaction(...a) };

  /* 9. Le verrou est TOUJOURS relache */
  CHAINE.enCours=false; CHAINE.bhCache='BHOK'; CHAINE.bhTemps=Date.now();
  const r1 = await envoyerTxSeeker('test');
  (signatures===1) ? ok('la boucle d\'envoi est reellement exercee (1 signature)') : ko('boucle non exercee : '+signatures);
  (r1 && r1.length>=64) ? ok('envoi reussi : signature rendue') : ko('pas de signature : '+r1);
  (CHAINE.enCours===false) ? ok('apres un envoi reussi : verrou relache') : ko('verrou coince apres succes');

  comportement='rejet'; signatures=0;
  const r2 = await envoyerTxSeeker('test');
  (r2===null) ? ok('signature refusee : la fonction rend null') : ko('retour inattendu : '+r2);
  (CHAINE.enCours===false) ? ok('apres un ECHEC : verrou relache (pas de blocage permanent)') : ko('VERROU COINCE APRES ECHEC');
  (String(CHAINE.derniereErreur).indexOf('refus')>=0) ? ok('cause enregistree : '+CHAINE.derniereErreur) : ko('cause perdue : '+CHAINE.derniereErreur);

  /* 10. Double appui pendant l'envoi : une seule transaction part */
  comportement='lent'; signatures=0; CHAINE.enCours=false;
  const [a1,a2] = await Promise.all([ envoyerTxSeeker('test'), envoyerTxSeeker('test') ]);
  (signatures===1) ? ok('double appui pendant l\'envoi : une seule signature demandee') : ko('DOUBLE TRANSACTION : '+signatures+' signatures');
  ((a1===null)!==(a2===null)) ? ok('un appel aboutit, l\'autre est repousse') : ko('les deux appels ont le meme sort');
  (CHAINE.enCours===false) ? ok('verrou relache apres le double appui') : ko('verrou coince');

  /* 11. Blockhash perime : le cache est purge, pas conserve toute la fenetre */
  comportement='perime'; CHAINE.enCours=false;
  CHAINE.bhCache='BHMORT'; CHAINE.bhTemps=Date.now();
  await envoyerTxSeeker('test');
  (CHAINE.bhCache===null) ? ok('blockhash refuse : cache purge, la relance repart d\'un blockhash frais')
                          : ko('CACHE MORT CONSERVE : toutes les relances echoueraient pendant '+(BH_FENETRE/1000)+' s');
  (String(CHAINE.derniereErreur).indexOf('expir')>=0) ? ok('message clair : '+CHAINE.derniereErreur) : ko('message : '+CHAINE.derniereErreur);

  /* --- 12. save() ecrit-il vraiment de facon synchrone ? --- */
  localStorage.removeItem('ss_v35');
  S.skr=4242; save();
  const relu=JSON.parse(localStorage.getItem('ss_v35')||'{}');
  (relu.skr===4242) ? ok('save() ecrit de facon synchrone : la relecture immediate est fiable')
                    : ko('save() differe l\'ecriture, les tests de la demo ne prouvent rien');

  R.forEach(l=>console.log(l));
  const bad=R.filter(l=>l.startsWith('RES KO')).length;
  console.log(bad?'RES '+bad+' ECHECS':'RES TOUS LES TESTS PASSENT');
  process.exit(bad?1:0);
})();

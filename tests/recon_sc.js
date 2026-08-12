const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(o){let n=0n;for(const x of o)n=n*256n+BigInt(x);let s='';while(n>0n){s=AL[Number(n%58n)]+s;n/=58n;}return s||'1';}
function PK(v){ this.toBase58=()=>typeof v==='string'?v:b58(Array.from(v)); this.toString=this.toBase58; }
const ADR='11111111111111111111111111111111';
CHAINE.mod={ PublicKey:PK, TransactionInstruction:function(o){this.o=o;},
  SystemProgram:{transfer:()=>({})},
  Transaction:function(){ this.add=function(){return this;}; this.serialize=()=>Buffer.from('x'); } };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'b'}), sendRawTransaction:async()=>'SIG_OK' };

/* --- Le scenario du bug : connecte via Phantom, puis la page recharge --- */
S.walletReel=true; S.connected=true; S.addressComplete=ADR;
S.walletType='ext'; S.walletId='phantom';
_providerExt=null;                       /* <- ce que fait un rechargement */
let demandeSilencieuse=false, signatures=0;
global.window.phantom={ solana:{
  isPhantom:true, publicKey:null,
  connect:async(o)=>{ if(o&&o.onlyIfTrusted) demandeSilencieuse=true;
                      global.window.phantom.solana.publicKey=new PK(ADR); return {publicKey:new PK(ADR)}; },
  signTransaction:async t=>{ signatures++; return t; } } };

CHAINE.enCours=false; CHAINE.derniereErreur=null;
const sig=await envoyerTxSeeker('test');
(sig==='SIG_OK') ? ok('apres rechargement : la transaction repart normalement') : ko('echec : '+sig+' / '+CHAINE.derniereErreur);
demandeSilencieuse ? ok('reconnexion tentee en silence (onlyIfTrusted), sans redemander au joueur') : ko('pas de reconnexion silencieuse');
(signatures===1) ? ok('le wallet a bien signe') : ko(signatures+' signatures');
(_providerExt!==null) ? ok('provider retrouve et memorise pour la suite') : ko('provider toujours perdu');

/* --- Le mauvais message ne doit plus apparaitre --- */
_providerExt=null; global.window.phantom=null; global.window.solana=null;
Object.defineProperty(navigator,'userAgent',
  {value:'Mozilla/5.0 (Linux; Android 14; wv) Phantom/24 Mobile Safari/537.36',configurable:true});
CHAINE.enCours=false; CHAINE.derniereErreur=null;
await envoyerTxSeeker('test');
(/session wallet perdue/.test(CHAINE.derniereErreur||''))
  ? ok('extension injoignable : « '+CHAINE.derniereErreur+' »') : ko('message : '+CHAINE.derniereErreur);
(!/Chrome/.test(CHAINE.derniereErreur||''))
  ? ok('plus de message « ouvre dans Chrome » pour un utilisateur d\'extension') : ko('message Chrome incoherent');

/* --- Le message Seed Vault reste juste pour le canal MWA --- */
S.walletType='mwa'; _providerExt=null; CHAINE.enCours=false; CHAINE.derniereErreur=null;
await envoyerTxSeeker('test');
(/Chrome/.test(CHAINE.derniereErreur||''))
  ? ok('canal Seed Vault : le message Chrome reste pertinent') : ko('message MWA : '+CHAINE.derniereErreur);
S.walletType='ext';

/* --- Changement de compte dans le wallet --- */
const ADR2='So11111111111111111111111111111111111111112';
_providerExt=null;
global.window.phantom={ solana:{ isPhantom:true, publicKey:new PK(ADR2),
  connect:async()=>({publicKey:new PK(ADR2)}), signTransaction:async t=>t } };
CHAINE.enCours=false;
await retrouverProvider();
(S.addressComplete===ADR2) ? ok('compte change dans le wallet : le jeu suit le compte actif') : ko('adresse : '+S.addressComplete);

/* --- Sans connexion prealable, on ne tente rien --- */
S.walletReel=false; _providerExt=null;
const p=await retrouverProvider();
(p===null) ? ok('jamais connecte : aucune reconnexion tentee') : ko('reconnexion parasite');

/* --- Icones redessinees --- */
const src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
['icoRepair','icoShield','icoCoque','icoHealth'].forEach(n=>{
  const fichier = src.indexOf("['"+n+"','assets/inline/"+n+".webp']")>=0;
  const dataUri = src.indexOf("['"+n+"','data:image")>=0;
  (fichier && !dataUri) ? ok(n+' : fichier redessine, plus de data URI') : ko(n+' : encore en data URI');
});
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

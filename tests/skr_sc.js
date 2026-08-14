const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
/* ---- 1. Configuration ---- */
(SKR.mint==='SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3') ? ok('mint SKR officiel de Solana Mobile') : ko('mint : '+SKR.mint);
/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(SKR.mint) ? ok('mint au format base58 valide') : ko('mint invalide');
(mintSKR()===SKR.mint) ? ok('devnet sans mint de test : on retombe sur le mint officiel') : ko('mintSKR() : '+mintSKR());
SKR.mintTest='TestMint1111111111111111111111111111111111';
(mintSKR()===SKR.mintTest) ? ok('mintTest renseigne : c\'est lui qui est utilise sur devnet') : ko('mintTest ignore');
SKR.mintTest='';

/* ---- 2. Prix ---- */
const payants=SHIPS.filter(s=>s.sol>0);
(payants.length===6) ? ok('6 vaisseaux payants') : ko(payants.length+' payants');
payants.every(s=>s.skr>0) ? ok('chacun a un prix en SOL ET en SKR') : ko('prix SKR manquant : '+payants.filter(s=>!s.skr).map(s=>s.name));
payants.every(s=>!s.gc) ? ok('plus aucun prix en GC sur les vaisseaux') : ko('prix GC residuel');
const taux=payants.map(s=>s.skr/s.sol);
const ecart=Math.max(...taux)-Math.min(...taux);
(ecart < 6000) ? ok('taux coherent entre vaisseaux : '+Math.round(Math.min(...taux))+' a '+Math.round(Math.max(...taux))+' SKR par SOL')
               : ko('taux incoherents : '+taux.map(Math.round));
SHIPS.filter(s=>s.cond).every(s=>!s.sol && !s.skr) ? ok('les vaisseaux a condition restent gratuits') : ko('un vaisseau a condition est payant');

/* ---- 3. Transfert SPL ---- */
let tx=null, ataCreee=false;
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(o){let n=0n;for(const x of o)n=n*256n+BigInt(x);let s='';while(n>0n){s=AL[Number(n%58n)]+s;n/=58n;}return s||'1';}
function PK(v){ this.toBase58=()=>typeof v==='string'?v:b58(Array.from(v)); this.toString=this.toBase58; }
CHAINE.mod={ PublicKey:PK,
  TransactionInstruction:function(o){ this.type='memo'; this.data=o.data; },
  SystemProgram:{ transfer:()=>({type:'transfer'}) },
  Transaction:function(){ this.instr=[]; tx=this; this.add=function(i){this.instr.push(i);return this;}; this.serialize=()=>Buffer.from('x'); } };
SKR.mod={
  getAssociatedTokenAddressSync:(mint,prop)=>new PK('ATA:'+prop.toBase58().slice(0,6)),
  createAssociatedTokenAccountInstruction:()=>{ ataCreee=true; return {type:'creerATA'}; },
  createTransferCheckedInstruction:(src,mint,dst,auth,montant,dec)=>({type:'transfertSPL',
      vers:dst.toBase58(), montant:montant.toString(), decimales:dec, mint:mint.toBase58()})
};
let comptePresent=null;
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'b'}),
  sendRawTransaction:async()=>'SIG_SKR',
  getAccountInfo:async()=>comptePresent,
  getParsedAccountInfo:async()=>({value:{data:{parsed:{info:{decimals:6}}}}}),
  getParsedTokenAccountsByOwner:async()=>({value:[{account:{data:{parsed:{info:{tokenAmount:{uiAmount:9000}}}}}}]}) };
const JOUEUR='11111111111111111111111111111111';
S.walletReel=true; S.connected=true; S.addressComplete=JOUEUR; S.unlocked=[0];
_providerExt={ signTransaction:async t=>t };

/* Le solde n'est lu que si le chemin SKR est ouvert : sur devnet sans mint
   de test, lireSoldeSKR() rend 0 par conception (couvert par skrmain_sc). */
SKR.mintTest='TestMint1111111111111111111111111111111111';
const solde=await lireSoldeSKR();
SKR.mintTest='';
(solde===9000) ? ok('solde SKR lu sur la chaine : 9 000') : ko('solde : '+solde);
(SKR.decimales===6) ? ok('decimales relues depuis le mint (6), jamais devinees') : ko('decimales : '+SKR.decimales);

/* achat du Warden : 3 000 SKR, la tresorerie n'a pas encore de compte token.
   Sur devnet sans mint de test, le chemin SKR est volontairement ferme
   (comportement couvert par skrmain_sc) : on l'ouvre pour tester l'achat. */
SKR.mintTest='TestMint1111111111111111111111111111111111';
comptePresent=null; CHAINE.enCours=false;
await unlockShip(6,'skr');
ataCreee ? ok('compte token de la tresorerie cree automatiquement s\'il manque') : ko('ATA non creee');
const t=tx.instr.find(i=>i.type==='transfertSPL');
(t) ? ok('instruction de transfert SPL presente') : ko('pas de transfert SPL');
(t && t.montant==='3000000000') ? ok('montant brut correct : 3 000 SKR x 10^6') : ko('montant : '+(t||{}).montant);
(t && t.mint===mintSKR()) ? ok('transfert sur le bon mint') : ko('mint : '+(t||{}).mint);
(tx.instr.some(i=>i.type==='memo')) ? ok('memo de tracabilite joint a l\'achat') : ko('memo absent');
(S.unlocked.includes(6)) ? ok('Warden debloque apres paiement') : ko('vaisseau non debloque');

/* deuxieme achat : la tresorerie a deja son compte, on ne le recree pas */
ataCreee=false; comptePresent={lamports:1}; CHAINE.enCours=false;
await unlockShip(7,'skr');
!ataCreee ? ok('compte token deja existant : pas de creation inutile') : ko('ATA recreee pour rien');

/* solde insuffisant : rien ne part */
CHAINE.connexion.getParsedTokenAccountsByOwner=async()=>({value:[{account:{data:{parsed:{info:{tokenAmount:{uiAmount:10}}}}}}]});
tx=null; CHAINE.enCours=false;
await unlockShip(10,'skr');
(!S.unlocked.includes(10)) ? ok('solde insuffisant : achat refuse, aucune signature demandee') : ko('achat passe sans solde');

/* mode simulation : aucun transfert de token */
S.walletReel=false; tx=null; CHAINE.enCours=false;
await unlockShip(3,'skr');
(!S.unlocked.includes(3) && !tx) ? ok('mode simulation : paiement SKR bloque proprement') : ko('simulation : transfert tente');
S.walletReel=true;

/* ---- SOL-5 : l'achat en SOL construit une VRAIE transaction ----
   L'ancienne version de ce test verifiait S.sol-0.85, c'est-a-dire le bug
   lui-meme : une soustraction locale sur un solde relu sur la chaine juste
   apres. On verifie maintenant ce qui compte : la transaction part, elle
   porte un memo, et le vaisseau n'est accorde qu'ensuite. */
S.sol=1; tx=null; CHAINE.enCours=false;
await unlockShip(2,'sol');
(tx && tx.instr.some(i=>i.type==='transfer')) ? ok('achat en SOL : transfert natif construit') : ko('aucun transfert SOL dans la transaction');
(tx && tx.instr.some(i=>i.type==='memo')) ? ok('memo de tracabilite joint a l\'achat SOL') : ko('memo absent de l\'achat SOL');
(S.unlocked.includes(2)) ? ok('Comet debloque apres paiement SOL') : ko('vaisseau non debloque apres signature');

/* sans wallet reel : rien ne part, rien n'est accorde */
S.walletReel=false; tx=null; CHAINE.enCours=false;
await unlockShip(4,'sol');
(!S.unlocked.includes(4) && !tx) ? ok('mode simulation : achat SOL bloque proprement') : ko('simulation : transfert SOL tente');
S.walletReel=true;

/* ---- 4. Le gameplay reste en GC ---- */
(typeof S.skr==='number' && S.skr>=0) ? ok('les GC restent une monnaie locale distincte du token SKR') : ko('GC casses');
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

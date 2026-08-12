const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
const ATTENDUE='AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH';
(TRESORERIE.adresse===ATTENDUE) ? ok('adresse de tresorerie en place') : ko('adresse : '+TRESORERIE.adresse);
/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(TRESORERIE.adresse) ? ok('format base58 valide') : ko('format invalide');
(TRESORERIE.actif===true) ? ok('prelevement actif') : ko('prelevement desactive');
(TRESORERIE.frais===0.001) ? ok('frais a 0.001 SOL') : ko('frais : '+TRESORERIE.frais);

/* La transaction doit vraiment viser cette adresse */
let tx=null;
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(o){let n=0n;for(const x of o)n=n*256n+BigInt(x);let s='';while(n>0n){s=AL[Number(n%58n)]+s;n/=58n;}return s||'1';}
function PK(v){ this.toBase58=()=>typeof v==='string'?v:b58(Array.from(v)); this.toString=this.toBase58; }
CHAINE.mod={ PublicKey:PK,
  TransactionInstruction:function(o){ this.type='memo'; this.data=o.data; },
  SystemProgram:{ transfer:(o)=>({type:'transfer', vers:o.toPubkey.toBase58(), depuis:o.fromPubkey.toBase58(), lamports:o.lamports}) },
  Transaction:function(){ this.instr=[]; tx=this; this.add=function(i){this.instr.push(i); return this;}; this.serialize=()=>Buffer.from('x'); } };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'b'}), sendRawTransaction:async()=>'SIG' };
const JOUEUR='11111111111111111111111111111111';
S.walletReel=true; S.connected=true; S.addressComplete=JOUEUR;
S.txOnChain=0; S.txSimu=0; S.lotsTask=0; S.taskRecompensee=false;
_providerExt={ signTransaction:async t=>t };
CHAINE.enCours=false;
await envoyerSeekerTask();

const v=tx.instr.filter(i=>i.type==='transfer');
(v.length===1) ? ok('un seul virement dans la transaction') : ko(v.length+' virements');
(v[0] && v[0].vers===ATTENDUE) ? ok('le virement part bien vers ta tresorerie') : ko('destinataire : '+(v[0]||{}).vers);
(v[0] && v[0].depuis===JOUEUR) ? ok('preleve sur le wallet du joueur, pas ailleurs') : ko('source : '+(v[0]||{}).depuis);
(v[0] && v[0].lamports===1000000) ? ok('montant : 1 000 000 lamports = 0.001 SOL') : ko('lamports : '+(v[0]||{}).lamports);
(tx.instr[0].type==='transfer') ? ok('virement en tete : visible dans l\'ecran de signature') : ko('virement pas en tete');
(tx.instr.filter(i=>i.type==='memo').length===15) ? ok('les 15 memos accompagnent le virement') : ko('memos manquants');

/* Un achat classique ne doit RIEN prelever */
CHAINE.enCours=false;
await envoyerTxSeeker('shop:test');
(tx.instr.filter(i=>i.type==='transfer').length===0) ? ok('aucun prelevement sur les autres actions du jeu') : ko('prelevement parasite');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message); process.exit(1); }})();

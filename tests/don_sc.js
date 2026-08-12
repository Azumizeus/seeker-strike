const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
/* ---- 1. Paliers etendus ---- */
const seuils=PALIERS_TX.map(p=>p.seuil);
(JSON.stringify(seuils)==='[5,15,30,45,60,75,90,100,120,150]') ? ok('10 paliers : '+seuils.join(', ')) : ko('paliers : '+seuils);
(new Set(PALIERS_TX.map(p=>p.cle)).size===10) ? ok('chaque palier a une cle unique') : ko('cles dupliquees');
let croissant=true; for(let i=1;i<seuils.length;i++) if(seuils[i]<=seuils[i-1]) croissant=false;
croissant ? ok('seuils strictement croissants') : ko('seuils desordonnes');
(!INDICATIFS.includes('ARCHITECTE')) ? ok('ARCHITECTE hors liste commune : reserve au palier 150') : ko('ARCHITECTE accessible d\'office');

/* ---- 2. Deblocages ---- */
function neuf(){ S.txTotal=0; S.debloquesTx=[]; S.indicatif=''; S.trainee=''; S.walletReel=true; S.connected=true;
                 S.skr=0; S.quetesReclamees=[]; S.donsSol=0; S.donsSkr=0; S.signatures=[]; }
neuf(); creditTX(45);
(debloque('munition')) ? ok('45 TX : munition signature') : ko('munition non debloquee');
creditTX(30);
(debloque('transmission')) ? ok('75 TX : transmission classifiee') : ko('transmission non debloquee');
creditTX(45);
(debloque('trainee') && S.trainee==='violet') ? ok('120 TX : trainee debloquee, violet par defaut') : ko('trainee : '+S.trainee);
creditTX(30);
(debloque('architecte')) ? ok('150 TX : rang ARCHITECTE') : ko('architecte non debloque');
(indicatifsDisponibles().includes('ARCHITECTE')) ? ok('ARCHITECTE devient choisissable a 150 TX') : ko('ARCHITECTE toujours verrouille');
(S.debloquesTx.length===10) ? ok('les 10 deblocages enregistres') : ko(S.debloquesTx.length+' deblocages');

/* aucune puissance gagnee */
neuf(); const a=[S.weapon,S.maxLives,S.fireRate,S.bonusVies||0];
creditTX(150);
(S.weapon===a[0]&&S.maxLives===a[1]&&S.fireRate===a[2]&&(S.bonusVies||0)===a[3])
  ? ok('150 TX : arme, vies, cadence et bonus inchanges') : ko('un palier donne de la puissance');

/* choix de trainee verrouille */
neuf(); choisirTrainee('or');
(S.trainee!=='or') ? ok('trainee verrouillee avant 120 TX') : ko('trainee accessible trop tot');
creditTX(120); choisirTrainee('or');
(S.trainee==='or') ? ok('choix de trainee : or') : ko('trainee : '+S.trainee);
choisirTrainee('inexistant');
(S.trainee==='or') ? ok('couleur inconnue refusee') : ko('couleur invalide acceptee');
neuf(); creditTX(60); choisirIndicatif('ARCHITECTE');
(S.indicatif!=='ARCHITECTE') ? ok('ARCHITECTE refuse sans le palier 150') : ko('ARCHITECTE vole a 60 TX');

/* ---- 3. Dons ---- */
/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(DONS.adresse) ? ok('adresse de dons au format base58') : ko('adresse invalide');
(DONS.sol.length===3 && DONS.skr.length===3) ? ok('trois montants proposes par monnaie') : ko('montants manquants');

let tx=null;
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(o){let n=0n;for(const x of o)n=n*256n+BigInt(x);let s='';while(n>0n){s=AL[Number(n%58n)]+s;n/=58n;}return s||'1';}
function PK(v){ this.toBase58=()=>typeof v==='string'?v:b58(Array.from(v)); this.toString=this.toBase58; }
CHAINE.mod={ PublicKey:PK,
  TransactionInstruction:function(o){ this.type='memo'; this.data=o.data; },
  SystemProgram:{ transfer:(o)=>({type:'transfert', vers:o.toPubkey.toBase58(), lamports:o.lamports}) },
  Transaction:function(){ this.instr=[]; tx=this; this.add=function(i){this.instr.push(i);return this;}; this.serialize=()=>Buffer.from('x'); } };
SKR.mod={ getAssociatedTokenAddressSync:(m,p)=>new PK('ATA'+p.toBase58().slice(0,4)),
  createAssociatedTokenAccountInstruction:()=>({type:'creerATA'}),
  createTransferCheckedInstruction:(s,m,d,a,mt,dc)=>({type:'transfertSPL', vers:d.toBase58(), montant:mt.toString()}) };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'b'}), sendRawTransaction:async()=>'SIG_DON',
  getAccountInfo:async()=>({lamports:1}), getParsedAccountInfo:async()=>({value:{data:{parsed:{info:{decimals:6}}}}}),
  getParsedTokenAccountsByOwner:async()=>({value:[{account:{data:{parsed:{info:{tokenAmount:{uiAmount:50000}}}}}}]}) };
neuf(); S.addressComplete='11111111111111111111111111111111'; S.sol=1;
_providerExt={ signTransaction:async t=>t };

CHAINE.enCours=false;
await donnerSOL(0.05);
const v=tx.instr.find(i=>i.type==='transfert');
(v && v.vers===DONS.adresse) ? ok('don SOL : virement vers l\'adresse de dons') : ko('destinataire : '+(v||{}).vers);
(v && v.lamports===50000000) ? ok('don SOL : 0.05 SOL = 50 000 000 lamports') : ko('lamports : '+(v||{}).lamports);
(tx.instr.some(i=>i.type==='memo')) ? ok('don SOL : memo de tracabilite joint') : ko('memo absent');
(S.donsSol===0.05) ? ok('cumul des dons SOL mis a jour') : ko('cumul : '+S.donsSol);
(S.txTotal===1) ? ok('le don compte comme 1 TX dans les paliers') : ko('txTotal : '+S.txTotal);
(S.signatures.length===1 && S.signatures[0].action==='don:sol') ? ok('don SOL inscrit au journal on-chain') : ko('journal : '+JSON.stringify(S.signatures));

CHAINE.enCours=false;
/* Sur devnet sans mint de test, le chemin SKR est volontairement ferme
   (couvert par skrmain_sc). Ici on veut tester le don lui-meme : on ouvre
   le chemin le temps de l'appel. */
SKR.mintTest='TestMint1111111111111111111111111111111111';
(!skrIndisponible()) ? ok('mint de test renseigne : le chemin SKR est ouvert') : ko('SKR reste ferme');
await donnerSKR(2500);
SKR.mintTest='';
const t2=tx.instr.find(i=>i.type==='transfertSPL');
(t2 && t2.montant==='2500000000') ? ok('don SKR : 2 500 x 10^6 unites brutes') : ko('montant : '+(t2||{}).montant);
(S.donsSkr===2500) ? ok('cumul des dons SKR mis a jour') : ko('cumul SKR : '+S.donsSkr);
(S.txTotal===2) ? ok('deux dons = 2 TX cumulees') : ko('txTotal : '+S.txTotal);

/* refus propres */
neuf(); S.connected=false; tx=null; CHAINE.enCours=false;
await donnerSOL(0.05);
(!tx && S.donsSol===0) ? ok('sans wallet connecte : don refuse proprement') : ko('don passe sans wallet');
neuf(); S.walletReel=false; tx=null; CHAINE.enCours=false;
await donnerSOL(0.05);
(!tx && S.donsSol===0) ? ok('mode simulation : don refuse') : ko('don en simulation');
neuf(); S.addressComplete='11111111111111111111111111111111';
CHAINE.connexion.getParsedTokenAccountsByOwner=async()=>({value:[{account:{data:{parsed:{info:{tokenAmount:{uiAmount:10}}}}}}]});
CHAINE.enCours=false;
await donnerSKR(10000);
(S.donsSkr===0) ? ok('solde SKR insuffisant : don refuse avant signature') : ko('don sans solde');

/* le don ne debloque rien en jeu */
neuf(); S.addressComplete='11111111111111111111111111111111'; S.sol=1;
const av=[S.unlocked.length, S.weapon, S.skr];
CHAINE.enCours=false; await donnerSOL(0.25);
(S.unlocked.length===av[0] && S.weapon===av[1] && S.skr===av[2])
  ? ok('un don ne debloque aucun vaisseau, aucune arme, aucun GC') : ko('le don donne un avantage');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

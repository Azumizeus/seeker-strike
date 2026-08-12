const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
/* --- Faux web3 qui enregistre ce qu'on lui donne --- */
let derniereTx=null;
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(o){let n=0n;for(const x of o)n=n*256n+BigInt(x);let s='';while(n>0n){s=AL[Number(n%58n)]+s;n/=58n;}return s||'1';}
function PK(v){ this.v=v; this.toBase58=()=>typeof v==='string'?v:b58(Array.from(v)); this.toString=this.toBase58; }
CHAINE.mod={
  PublicKey:PK,
  TransactionInstruction:function(o){ this.type='memo'; this.data=o.data; this.programId=o.programId; },
  SystemProgram:{ transfer:(o)=>({ type:'transfer', lamports:o.lamports, to:o.toPubkey.toBase58() }) },
  Transaction:function(o){ this.instr=[]; derniereTx=this;
    this.add=function(i){ this.instr.push(i); return this; };
    this.serialize=()=>Buffer.from('x'); }
};
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'abc'}), sendRawTransaction:async()=>'SIG1' };
const ADR='11111111111111111111111111111111';
S.walletReel=true; S.connected=true; S.addressComplete=ADR; S.skr=0;
S.txOnChain=0; S.txSimu=0; S.lotsTask=0; S.taskRecompensee=false;
_providerExt={ signTransaction:async t=>t };

/* --- 1. Une seule signature pour 15 memos --- */
let signatures=0;
_providerExt={ signTransaction:async t=>{ signatures++; return t; } };
CHAINE.enCours=false;
await envoyerSeekerTask();
(signatures===1) ? ok('15 TX envoyees avec '+signatures+' signature') : ko(signatures+' signatures au lieu de 1');
const memos=derniereTx.instr.filter(i=>i.type==='memo');
(memos.length===15) ? ok('la transaction contient bien 15 memos') : ko(memos.length+' memos');
const virements=derniereTx.instr.filter(i=>i.type==='transfer');
(virements.length===1) ? ok('un seul virement de tresorerie dans la transaction') : ko(virements.length+' virements');
(virements[0] && virements[0].lamports===1000000) ? ok('pourboire = 0.001 SOL (1 000 000 lamports)') : ko('lamports : '+(virements[0]||{}).lamports);
(derniereTx.instr[0].type==='transfer') ? ok('le pourboire est en tete : visible dans l\'ecran de signature') : ko('pourboire pas en tete');
const txts=memos.map(m=>m.data.toString());
(new Set(txts).size===15) ? ok('les 15 memos sont distincts (1/15 ... 15/15)') : ko('memos dupliques');
/^seeker-strike:task:[a-z0-9]+:1\/15$/.test(txts[0]) ? ok('format du memo : '+txts[0]) : ko('format inattendu : '+txts[0]);

/* taille : la limite Solana est de 1232 octets */
const poids = txts.reduce((a,t)=>a+t.length+3,0) + 64 + 32*3 + 100;
(poids<1232) ? ok('poids estime '+poids+' octets, sous la limite Solana de 1232') : ko('transaction trop lourde : '+poids);

/* --- 2. Etat apres envoi --- */
(taskFaites()===15) ? ok('compteur a 15/15') : ko('compteur : '+taskFaites());
(S.skr===600) ? ok('bonus de 600 GC verse') : ko('GC : '+S.skr);
(S.lotsTask===1) ? ok('lot n1 enregistre') : ko('lots : '+S.lotsTask);

/* --- 3. Relance : autorisee, mais le bonus ne retombe pas ---
   Le delai anti-saturation de 20 s est teste a part (rpc_sc §7) : ici on le
   neutralise pour verifier la relance elle-meme. */
signatures=0; CHAINE.enCours=false; _dernierLot=0;
await envoyerSeekerTask();
(signatures===1) ? ok('relance acceptee alors que la task est deja complete') : ko('relance bloquee');
(S.skr===600) ? ok('bonus non redonne a la relance (toujours 600 GC)') : ko('bonus redonne : '+S.skr);
(S.lotsTask===2) ? ok('lot n2 enregistre') : ko('lots : '+S.lotsTask);
const memos2=derniereTx.instr.filter(i=>i.type==='memo');
(memos2.length===15) ? ok('la relance renvoie bien 15 memos') : ko(memos2.length+' memos a la relance');

/* --- 4. Le bouton reste actif une fois complete --- */
/* Le harnais recree un element a chaque appel : on memorise les elements
   pour observer ce que majSeekerTask ecrit vraiment dedans. */
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));
_dernierLot=0;            /* hors periode d'attente : on observe le libelle normal */
majSeekerTask();
const b=cache['btn-task'];
(b && b.disabled===false) ? ok('bouton toujours actif apres completion') : ko('bouton desactive');
/* Le libelle passe par T() : il suit la langue active, d'ou les deux formes. */
(b && /RELANCER|RESEND/.test(b.textContent)) ? ok('libelle du bouton : "'+b.textContent+'"') : ko('libelle : '+(b&&b.textContent));

/* --- 5. Verrou : pas deux envois simultanes --- */
CHAINE.enCours=true; signatures=0;
await envoyerSeekerTask();
(signatures===0) ? ok('un envoi deja en cours bloque le suivant') : ko('double envoi possible');
CHAINE.enCours=false;

/* --- 6. Sans wallet : rien ne se passe, ni on-chain ni en local --- */
S.walletReel=false; signatures=0; CHAINE.enCours=false; _dernierLot=0;
const txAvant=S.txOnChain, lotsAvant=S.lotsTask;
await envoyerSeekerTask();
(signatures===0 && S.txOnChain===txAvant && S.lotsTask===lotsAvant)
  ? ok('sans wallet : aucune signature, aucun compteur touche (plus de mode simulation)')
  : ko('etat modifie sans wallet : sig='+signatures+' tx='+S.txOnChain);
S.walletReel=true;

/* --- 7. Tresorerie desactivable --- */
TRESORERIE.actif=false; CHAINE.enCours=false; _dernierLot=0;
await envoyerSeekerTask();
(derniereTx.instr.filter(i=>i.type==='transfer').length===0) ? ok('pourboire desactivable via TRESORERIE.actif') : ko('pourboire preleve malgre TRESORERIE.actif=false');
TRESORERIE.actif=true;

/* --- 8. Un memo simple reste un memo simple --- */
CHAINE.enCours=false; _dernierLot=0;
await envoyerTxSeeker('shop:test');
(derniereTx.instr.length===1 && derniereTx.instr[0].type==='memo') ? ok('une action hors task reste 1 seul memo, sans pourboire') : ko('action simple : '+derniereTx.instr.length+' instructions');

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

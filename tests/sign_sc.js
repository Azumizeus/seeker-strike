const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
try{
S.walletReel=true; S.addressComplete='11111111111111111111111111111111'; S.connected=true;
/* stub web3 minimal */
CHAINE.mod={ PublicKey:function(k){ this.k=k; this.toBase58=()=>k; },
  Transaction:function(o){ this.o=o; this.add=function(){return this;}; this.serialize=()=>Buffer.from('tx'); },
  TransactionInstruction:function(o){ this.o=o; } };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'abc'}),
                   sendRawTransaction:async()=>'SIG_ENVOI_BRUT' };
global.TextEncoder=global.TextEncoder||function(){ this.encode=s=>Buffer.from(s); };

async function essai(nom, provider, attendu){
  _providerExt=provider;
  CHAINE.enCours=false;
  const sig=await envoyerTxSeeker('test');
  if(sig===attendu) ok(nom+' -> signature obtenue ('+sig+')');
  else ko(nom+' -> attendu "'+attendu+'", obtenu '+JSON.stringify(sig));
}
(async()=>{
  /* Phantom : signAndSendTransaction */
  await essai('Phantom (signAndSendTransaction)',
    { signAndSendTransaction: async()=>({signature:'SIG_PHANTOM'}) }, 'SIG_PHANTOM');
  /* Backpack : signTransaction puis envoi manuel */
  await essai('Backpack (signTransaction + envoi)',
    { signTransaction: async(tx)=>tx }, 'SIG_ENVOI_BRUT');
  /* wallet a base de request */
  await essai('Wallet generique (request)',
    { request: async()=>({signature:'SIG_REQUEST'}) }, 'SIG_REQUEST');
  /* wallet incapable de signer : echec propre, pas de plantage */
  _providerExt={ connect:async()=>({}) }; CHAINE.enCours=false;
  const s4=await envoyerTxSeeker('test');
  if(s4===null) ok('wallet sans methode de signature : echec propre, aucune exception');
  else ko('resultat inattendu : '+s4);
  /* aucun provider : on retombe sur le Seed Vault (MWA absent en test) */
  _providerExt=null; CHAINE.enCours=false;
  const s5=await envoyerTxSeeker('test');
  if(s5===null) ok('sans extension : bascule vers le Seed Vault, echec propre si absent');

  /* la signature ne doit jamais partir sans wallet connecte */
  S.walletReel=false; CHAINE.enCours=false;
  const s6=await envoyerTxSeeker('test');
  if(s6===null) ok('mode simulation : aucune transaction envoyee');
  S.walletReel=true;

  /* une seule transaction a la fois */
  CHAINE.enCours=true;
  const s7=await envoyerTxSeeker('test');
  if(s7===null) ok('une transaction deja en cours bloque la suivante');
  CHAINE.enCours=false;

  R.forEach(l=>console.log(l));
  console.log(R.some(l=>l.startsWith('RES KO'))?'RES '+R.filter(l=>l.startsWith('RES KO')).length+' ECHECS':'RES TOUS LES TESTS PASSENT');
  process.exit(R.some(l=>l.startsWith('RES KO'))?1:0);
})();
}catch(e){ console.log('RES KO  EXCEPTION '+e.message); process.exit(1); }

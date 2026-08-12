const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
/* ---- 1. Cadence : l'ecran 120 Hz ne doit plus doubler la vitesse ---- */
/* On mesure sur une vraie partie : g.frame compte les mises a jour logiques. */
function mesurer(hz, secondes){
  fixerHasard(4242);
  S.currentNode=1; initGame('solo', S.mun||1);   /* partie reelle */
  G.running=true; G.tPrec=null; G.reste=0; G.frame=0;
  const pas=1000/hz; let t=performance.now();
  const vraiRAF=global.requestAnimationFrame; global.requestAnimationFrame=()=>0;
  for(let i=0;i<hz*secondes;i++){ t+=pas; avancerTemps(pas); loop(t); }
  global.requestAnimationFrame=vraiRAF;
  const r=G.frame/secondes; G.running=false; return r;
}
const h60=mesurer(60,4), h120=mesurer(120,4), h144=mesurer(144,4), h30=mesurer(30,4);
const proche=(v,c)=>Math.abs(v-c)<=1.5;
proche(h60,60)  ? ok('ecran 60 Hz  -> '+h60.toFixed(1)+' maj/s')  : ko('60 Hz -> '+h60);
proche(h120,60) ? ok('ecran 120 Hz -> '+h120.toFixed(1)+' maj/s (Seeker : vitesse plus doublee)') : ko('120 Hz -> '+h120+' au lieu de 60');
proche(h144,60) ? ok('ecran 144 Hz -> '+h144.toFixed(1)+' maj/s') : ko('144 Hz -> '+h144);
(h30>=29 && h30<=61) ? ok('ecran 30 Hz  -> '+h30.toFixed(1)+' maj/s (rattrapage, pas de ralenti)') : ko('30 Hz -> '+h30);

/* pas de spirale de la mort apres une longue pause */
fixerHasard(4242); S.currentNode=1; initGame('solo', S.mun||1);
G.running=true; G.tPrec=null; G.reste=0; G.frame=0;
const rafV=global.requestAnimationFrame; global.requestAnimationFrame=()=>0;
let tt=performance.now(); loop(tt); avancerTemps(10000); tt+=10000; loop(tt);
global.requestAnimationFrame=rafV;
(G.frame<=4) ? ok('pause de 10 s : '+G.frame+' maj rattrapees (pas de gel)') : ko('spirale : '+G.frame+' maj');
G.running=false;

/* ---- 2. Canaux de signature ---- */
S.walletReel=true; S.addressComplete='11111111111111111111111111111111'; S.connected=true;
CHAINE.mod={ PublicKey:function(k){ this.k=k; this.toBase58=()=>k; },
  Transaction:function(o){ this.o=o; this.add=function(){return this;}; this.serialize=()=>Buffer.from('tx'); },
  TransactionInstruction:function(o){ this.o=o; } };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'abc'}), sendRawTransaction:async()=>'SIG_DEVNET' };

async function essai(nom, p, attendu){
  _providerExt=p; CHAINE.enCours=false;
  const sig=await envoyerTxSeeker('t');
  (sig===attendu) ? ok(nom+' -> '+sig) : ko(nom+' : attendu '+attendu+', obtenu '+JSON.stringify(sig));
}
/* Phantom expose les deux : on doit choisir signTransaction pour diffuser sur devnet */
let aUtiliseSAS=false;
await essai('Phantom (les 2 methodes) : diffusion devnet forcee',
  { signTransaction:async t=>t, signAndSendTransaction:async()=>{aUtiliseSAS=true;return{signature:'SIG_MAINNET'}} }, 'SIG_DEVNET');
aUtiliseSAS ? ko('signAndSendTransaction utilise : la TX partirait sur mainnet') : ok('signAndSendTransaction evite (evite le blockhash devnet inconnu du mainnet)');
await essai('wallet sans signTransaction -> repli signAndSend',
  { signAndSendTransaction:async()=>({signature:'SIG_SAS'}) }, 'SIG_SAS');
await essai('wallet a base de request', { request:async()=>({signature:'SIG_REQ'}) }, 'SIG_REQ');

/* ---- 3. La cause de l'echec doit etre memorisee ---- */
CHAINE.derniereErreur=null; _providerExt={ signTransaction:async()=>{ throw new Error('User rejected'); } };
CHAINE.enCours=false; await envoyerTxSeeker('t');
/* La cause n'est plus le message brut du wallet : causeLisible() le traduit
   en une phrase que le joueur comprend (et qui est traduite en anglais). */
(/refus/i.test(String(CHAINE.derniereErreur))) ? ok('cause de l\'echec memorisee, en clair : "'+CHAINE.derniereErreur+'"') : ko('cause perdue : '+CHAINE.derniereErreur);

/* ---- 4. Detection du navigateur integre a un wallet ---- */
const ua0=navigator.userAgent;
function setUA(v){ Object.defineProperty(navigator,'userAgent',{value:v,configurable:true}); }
setUA('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36');
!navigateurIntegre() ? ok('Chrome Android : Seed Vault autorise') : ko('Chrome detecte a tort comme wallet');
setUA('Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Version/4.0 Phantom/24 Mobile Safari/537.36');
navigateurIntegre() ? ok('navigateur Phantom detecte : Seed Vault annonce comme impossible') : ko('navigateur Phantom non detecte');
setUA('Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Backpack Mobile');
navigateurIntegre() ? ok('navigateur Backpack detecte') : ko('Backpack non detecte');
setUA(ua0);

/* ---- 5. IDENTITE : icon relatif (exigence du Seed Vault) ---- */
(typeof IDENTITE==='object' && IDENTITE.icon && !/^https?:/i.test(IDENTITE.icon))
  ? ok('IDENTITE definie, icon relatif ("'+IDENTITE.icon+'") comme l\'exige MWA')
  : ko('IDENTITE invalide : '+JSON.stringify(typeof IDENTITE!=='undefined'?IDENTITE:null));

R.forEach(l=>console.log(l));
const ech=R.filter(l=>l.startsWith('RES KO')).length;
console.log(ech?'RES '+ech+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(ech?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+(e.stack||'').split('\n')[1]); process.exit(1); }})();

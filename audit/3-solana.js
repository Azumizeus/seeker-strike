/* ============================================================
   SEEKER STRIKE v4.2 - 3-solana.js
   Integration Solana
   Lignes 2040 a 3029 du script d'origine (game/index_v37.html)
   Images base64 retirees : elles ne concernent pas l'audit.
   ============================================================ */

   SEEKER TASK — vraies transactions on-chain (devnet)
   Chaque action de jeu marquante envoie une transaction signee
   par le joueur : c'est ce qui construit son activite Solana.
   ============================================================ */
/* Tresorerie du jeu. Un pourboire volontaire, preleve UNE fois sur la Seeker
   Task, jamais sur le gameplay : la boutique, les consommables et les
   munitions restent integralement en GC gagnes en jouant. */
/* SKR : le token officiel de Solana Mobile (SPL). Deuxieme moyen de paiement
   des vaisseaux, a cote du SOL. Le gameplay, lui, ne coute jamais de token :
   boutique, consommables et munitions restent en GC gagnes en jouant. */
const SKR = {
  /* Mint officiel sur mainnet. Sur devnet ce mint n'existe pas : renseigne
     mintTest avec un mint de test dont tu controles l'emission. */
  mint:     'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
  mintTest: '',                 /* mint devnet, vide = on retombe sur mint */
  decimales: 6,                 /* relu depuis la chaine au premier chargement */
  module:   'https://esm.sh/@solana/spl-token@0.4',
  mod: null, actif: true
};
function mintSKR(){ return (CHAINE.rpc.indexOf('devnet')>=0 && SKR.mintTest) ? SKR.mintTest : SKR.mint; }

/* Dons : totalement facultatifs, jamais reclames par le jeu. L'adresse est
   affichee en clair et copiable pour qu'on puisse aussi donner depuis
   n'importe quel wallet, sans passer par le jeu. */
const DONS = {
  adresse: 'AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH',
  sol: [0.01, 0.05, 0.25],
  skr: [500, 2500, 10000],
  actif: true
};

const TRESORERIE = {
  adresse: 'AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH',  /* tresorerie du jeu, devnet */
  frais:   0.001,        /* SOL preleves une fois pour les 15 memos */
  actif:   true
};
const CHAINE = {
  rpc:'https://api.devnet.solana.com',
  web3:'https://esm.sh/@solana/web3.js@1',
  memoProgram:'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  mod:null, connexion:null, enCours:false
};
async function chargerWeb3(){
  if(CHAINE.mod) return CHAINE.mod;
  try{
    CHAINE.mod = await import(/* @vite-ignore */ CHAINE.web3);
    CHAINE.connexion = new CHAINE.mod.Connection(CHAINE.rpc, 'confirmed');
    LOG.log('[SEEKER] web3.js charge');
    return CHAINE.mod;
  }catch(e){ LOG.warn('[SEEKER] web3.js indisponible : '+(e&&e.message)); return null; }
}

/* Retrouve le provider d'extension apres un rechargement de page.
   Phantom et Backpack acceptent une reconnexion sans interaction quand le
   site a deja ete autorise (onlyIfTrusted). */
async function retrouverProvider(){
  if(_providerExt) return _providerExt;
  if(!S.walletReel || S.walletType==='mwa') return null;
  const p = getProvider(S.walletId) || getProvider('phantom') || window.solana;
  if(!p) return null;
  try{
    if(!p.publicKey && typeof p.connect==='function'){
      try{ await p.connect({ onlyIfTrusted:true }); }
      catch(e){ dbg('reconnexion silencieuse refusee, on redemande'); await p.connect(); }
    }
    const pk=p.publicKey;
    if(!pk) return null;
    const w3=await chargerWeb3();
    const adr=normaliserAdresse(pk, w3&&w3.PublicKey);
    if(!adr) return null;
    /* Le wallet a pu changer de compte entre-temps : on suit le compte actif. */
    if(adr!==S.addressComplete){
      S.addressComplete=adr;
      S.address=adr.slice(0,4)+'\u2026'+adr.slice(-4);
      save(); ui();
      dbg('compte actif different, adresse mise a jour');
    }
    _providerExt=p;
    dbg('provider retrouve : '+(S.walletId||'solana'));
    return p;
  }catch(e){ dbg('reconnexion impossible : '+e.message); return null; }
}

/* Signe une transaction et la diffuse sur le devnet.
   Trois canaux possibles selon la facon dont le joueur s'est connecte :
   sans ce choix, la demande de signature partait dans le vide. */
async function signerEtEnvoyer(tx){
  let sig=null;
  /* Une extension connectee avant un rechargement doit etre retrouvee,
     sinon on basculait a tort vers le Seed Vault. */
  await retrouverProvider();
  if(_providerExt){
    const p=_providerExt;
    /* On demande la SIGNATURE, puis on diffuse nous-memes sur le devnet.
       signAndSendTransaction diffuserait sur le reseau selectionne dans le
       wallet (mainnet par defaut) : notre blockhash devnet y est inconnu. */
    if(typeof p.signTransaction==='function'){
      const signee = await p.signTransaction(tx);
      sig = await CHAINE.connexion.sendRawTransaction(signee.serialize());
      LOG.log('[SEEKER] signature via wallet puis diffusion devnet');
    } else if(typeof p.signAndSendTransaction==='function'){
      const r = await p.signAndSendTransaction(tx);
      sig = (r && (r.signature || r)) || null;
      LOG.log('[SEEKER] signature via wallet (signAndSendTransaction)');
    } else if(typeof p.request==='function'){
      const r = await p.request({ method:'signAndSendTransaction', params:{ message: tx } });
      sig = (r && (r.signature || r)) || null;
      LOG.log('[SEEKER] signature via extension (request)');
    } else {
      CHAINE.derniereErreur='ce wallet ne sait pas signer de transaction';
      LOG.warn('[SEEKER] '+CHAINE.derniereErreur);
    }
  } else {
    /* Le message « ouvre dans Chrome » ne vaut que pour le Seed Vault.
       Si le joueur s'etait connecte par extension, la vraie cause est que
       la session a ete perdue : on le dit clairement. */
    if(S.walletType==='ext'){
      CHAINE.derniereErreur='session wallet perdue, reconnecte-toi';
      LOG.warn('[SEEKER] '+CHAINE.derniereErreur); return null;
    }
    if(navigateurIntegre()){
      CHAINE.derniereErreur='navigateur du wallet : Seed Vault inaccessible, ouvre le jeu dans Chrome';
      LOG.warn('[SEEKER] '+CHAINE.derniereErreur); return null;
    }
    const mwa = await initMWA();
    if(!mwa || !mwa.transact){ CHAINE.derniereErreur='module Seed Vault non charge'; return null; }
    const sigs = await mwa.transact(async (wallet)=>{
      const jeton = localStorage.getItem('ss_mwa_token');
      if(jeton){ try{ await wallet.reauthorize({ auth_token:jeton, identity:IDENTITE }); }catch(e){} }
      return await wallet.signAndSendTransactions({ transactions:[tx] });
    });
    sig = sigs && sigs[0];
    LOG.log('[SEEKER] signature via Seed Vault');
  }
  if(sig && typeof sig!=='string' && sig.toString) sig=sig.toString();
  return sig||null;
}

/* Charge la bibliotheque SPL, necessaire pour manipuler un token. */
async function chargerSPL(){
  if(SKR.mod) return SKR.mod;
  try{
    SKR.mod = await import(/* @vite-ignore */ SKR.module);
    LOG.log('[SEEKER] spl-token charge');
  }catch(e){ LOG.warn('[SEEKER] spl-token indisponible : '+(e&&e.message)); SKR.mod=null; }
  return SKR.mod;
}

/* Lit le solde SKR du joueur directement sur la chaine.
   Retourne un nombre de tokens (pas des unites brutes). */
async function lireSoldeSKR(){
  if(!S.walletReel || !S.addressComplete) return 0;
  const w3=await chargerWeb3(); if(!w3) return 0;
  try{
    const { PublicKey } = w3;
    const proprio = new PublicKey(normaliserAdresse(S.addressComplete, PublicKey));
    const mint = new PublicKey(mintSKR());
    /* Les decimales viennent du mint : les deviner serait une source d'erreur. */
    try{
      const info = await CHAINE.connexion.getParsedAccountInfo(mint);
      const d = info && info.value && info.value.data && info.value.data.parsed
              && info.value.data.parsed.info && info.value.data.parsed.info.decimals;
      if(typeof d==='number') SKR.decimales=d;
    }catch(e){}
    const r = await CHAINE.connexion.getParsedTokenAccountsByOwner(proprio, { mint });
    let total=0;
    (r && r.value || []).forEach(c=>{
      const m=c.account.data.parsed.info.tokenAmount;
      total += Number(m.uiAmount||0);
    });
    S.soldeSkr = total;
    return total;
  }catch(e){ LOG.warn('[SEEKER] solde SKR illisible : '+(e&&e.message)); return S.soldeSkr||0; }
}

/* Construit la transaction de la Seeker Task : les 15 memos et le pourboire
   de tresorerie tiennent dans UNE seule transaction, donc UNE seule signature.
   Retourne la liste des instructions. */
function instructionsSeekerTask(w3, joueur){
  const { PublicKey, TransactionInstruction, SystemProgram } = w3;
  const memo = new PublicKey(CHAINE.memoProgram);
  const enc = (txt)=> (typeof Buffer!=='undefined' && Buffer.from)
        ? Buffer.from(txt,'utf8') : new TextEncoder().encode(txt);
  const instr=[];
  /* Le pourboire d'abord : il apparait en tete de la transaction, donc
     visible immediatement dans l'ecran de signature du wallet. */
  if(TRESORERIE.actif && TRESORERIE.frais>0 && SystemProgram){
    try{
      instr.push(SystemProgram.transfer({
        fromPubkey: joueur,
        toPubkey: new PublicKey(TRESORERIE.adresse),
        lamports: Math.round(TRESORERIE.frais*1e9)
      }));
    }catch(e){ LOG.warn('[SEEKER] pourboire ignore : '+(e&&e.message)); }
  }
  const lot = Date.now().toString(36);
  for(let i=1;i<=15;i++){
    instr.push(new TransactionInstruction({
      keys: [{ pubkey: joueur, isSigner:true, isWritable:false }],
      programId: memo,
      data: enc('seeker-strike:task:'+lot+':'+i+'/15')
    }));
  }
  return instr;
}

/* Envoie une transaction memo signee par le wallet du joueur.
   Retourne la signature, ou null si l'envoi n'a pas abouti.
   Si `action` vaut 'seeker-task', on envoie les 15 memos d'un coup. */
async function envoyerTxSeeker(action){
  if(!S.walletReel || !S.addressComplete) return null;    /* pas de wallet : rien on-chain */
  if(CHAINE.enCours) return null;                          /* une transaction a la fois */
  const w3 = await chargerWeb3();
  if(!w3){ CHAINE.derniereErreur='web3.js indisponible (reseau ?)'; return null; }
  CHAINE.enCours=true;
  try{
    const { PublicKey, Transaction, TransactionInstruction } = w3;
    /* Une sauvegarde ancienne peut contenir une adresse base64 : on la repare
       au lieu de laisser la transaction echouer. */
    const adresse = normaliserAdresse(S.addressComplete, PublicKey);
    if(!adresse){ CHAINE.derniereErreur='adresse du wallet illisible, reconnecte-toi'; return null; }
    if(adresse!==S.addressComplete){
      S.addressComplete=adresse;
      S.address=adresse.slice(0,4)+'\u2026'+adresse.slice(-4);
      save(); ui();
      LOG.log('[SEEKER] adresse convertie en base58');
    }
    const joueur = new PublicKey(adresse);
    const { blockhash } = await CHAINE.connexion.getLatestBlockhash();
    const tx = new Transaction({ feePayer: joueur, recentBlockhash: blockhash });
    if(action==='seeker-task'){
      /* Les 15 memos + le pourboire : une transaction, une signature. */
      instructionsSeekerTask(w3, joueur).forEach(i=>tx.add(i));
    } else {
      tx.add(new TransactionInstruction({
        keys: [{ pubkey: joueur, isSigner: true, isWritable: false }],
        programId: new PublicKey(CHAINE.memoProgram),
        /* web3.js attend un Buffer ; un Uint8Array nu casse serialize()
           sur certaines versions du polyfill. */
        data: (typeof Buffer!=='undefined' && Buffer.from)
                ? Buffer.from('seeker-strike:'+action, 'utf8')
                : new TextEncoder().encode('seeker-strike:'+action)
      }));
    }

    const sig = await signerEtEnvoyer(tx);
    if(sig){
      LOG.log('[SEEKER] TX '+action+' : '+sig);
      if(!S.signatures) S.signatures=[];
      S.signatures.unshift({ action, sig, t:Date.now() });
      S.signatures=S.signatures.slice(0,20);
    }
    return sig||null;
  }catch(e){
    CHAINE.derniereErreur = (e && (e.message||e.toString())) || 'erreur inconnue';
    LOG.warn('[SEEKER] transaction refusee ou echouee : '+CHAINE.derniereErreur);
    return null;
  }finally{ CHAINE.enCours=false; }
}

/* ============================================================
   CONNEXION WALLET — Multi-wallet : Seed Vault (MWA) + extensions
   ============================================================ */
const MWA_MODULE = 'https://esm.sh/@solana-mobile/mobile-wallet-adapter-protocol-web3js@2';
/* Identite de l'app presentee au wallet. Le champ icon DOIT etre un chemin
   relatif a uri : une URL absolue fait rejeter l'autorisation par le Seed Vault. */
const IDENTITE = { name:'Seeker Strike', uri:(location.origin||'https://seeker-strike'), icon:'favicon.ico' };
const MWA_CLUSTER = 'devnet';
let _mwaMod=null, _mwaTried=false, _providerExt=null;
function dbg(msg){ LOG.log('[SEEKER]', msg); }

/* Android : le Seed Vault passe par MWA. Ailleurs : extensions navigateur. */
function estAndroid(){ return /android/i.test(navigator.userAgent||''); }
function contexteSecurise(){ return window.isSecureContext===true || location.protocol==='https:'; }
/* Un navigateur integre a un wallet (Phantom, Backpack, Solflare) ne peut pas
   ouvrir le Seed Vault : l'intent solana-wallet:// n'y sort jamais de l'app.
   Il faut Chrome. On le detecte pour pouvoir le dire au joueur. */
function navigateurIntegre(){
  const ua = navigator.userAgent||'';
  if(/Phantom|Backpack|Solflare/i.test(ua)) return true;
  /* WebView Android (pas Chrome) + provider injecte = navigateur d'un wallet */
  const wv = /; wv\)/i.test(ua) || (/Android/i.test(ua) && !/Chrome\/\d/i.test(ua));
  return wv && !!(window.solana||window.phantom||window.backpack);
}

function detectWallets(){
  const w=[];
  const ext=[
    ['phantom','Phantom','👻', ()=> (window.phantom&&window.phantom.solana&&window.phantom.solana.isPhantom)||(window.solana&&window.solana.isPhantom)],
    ['backpack','Backpack','🎒', ()=> (window.backpack&&window.backpack.isBackpack)||(window.xnft&&window.xnft.solana)],
    ['solflare','Solflare','🔥', ()=> window.solflare&&window.solflare.isSolflare],
    ['glow','Glow','✨',            ()=> !!window.glowSolana]
  ];
  const trouves=ext.filter(([,,,test])=>{ try{ return !!test(); }catch(e){ return false; } })
                   .map(([id,name,icon])=>({id,name,icon,type:'ext'}));
  /* Correctif : Seed Vault en tete sur Android, en dernier ailleurs (il n'y marchera pas) */
  const seedvault={ id:'seedvault', name:'Seed Vault', icon:'🔮', type:'mwa' };
  return estAndroid() ? [seedvault, ...trouves] : [...trouves, seedvault];
}
function getProvider(id){
  if(id==='phantom')  return (window.phantom&&window.phantom.solana)||window.solana;
  if(id==='backpack') return window.backpack||(window.xnft&&window.xnft.solana);
  if(id==='solflare') return window.solflare;
  if(id==='glow')     return window.glowSolana;
  return null;
}

/* Le Seed Vault renvoie l'adresse en base64 (encodage du protocole MWA),
   alors que Solana manipule des cles en base58. Sans conversion, PublicKey
   refusait l'adresse : "Non-base58 character". On accepte donc les trois
   formes possibles selon le wallet et la version du protocole. */
const RE_BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
function normaliserAdresse(brut, PublicKey){
  if(!brut) return null;
  /* 1. deja un objet PublicKey de web3.js */
  if(typeof brut.toBase58==='function') return brut.toBase58();
  /* 2. octets bruts */
  if((typeof Uint8Array!=='undefined' && brut instanceof Uint8Array) || Array.isArray(brut)){
    try{ return new PublicKey(Uint8Array.from(brut)).toBase58(); }catch(e){ return null; }
  }
  if(typeof brut!=='string') return null;
  /* 3. deja en base58 : rien a faire */
  if(RE_BASE58.test(brut)) return brut;
  /* 4. base64 ou base64url : on decode les 32 octets, on re-encode en base58 */
  try{
    const propre = brut.replace(/-/g,'+').replace(/_/g,'/');
    const bin = atob(propre);
    const octets = Uint8Array.from(bin, c=>c.charCodeAt(0));
    if(octets.length===32) return new PublicKey(octets).toBase58();
  }catch(e){}
  return null;
}
/* Extrait l'adresse d'un compte MWA, quelle que soit la forme employee. */
function adresseDuCompte(c, PublicKey){
  if(!c) return null;
  return normaliserAdresse(c.publicKey, PublicKey) || normaliserAdresse(c.address, PublicKey);
}

/* ---------- Seed Vault via MWA ---------- */
async function initMWA(){
  if(_mwaTried) return _mwaMod;
  _mwaTried=true;
  if(!contexteSecurise()){ dbg('HTTPS requis pour MWA'); return null; }
  try{ dbg('import module MWA...'); _mwaMod=await import(/* @vite-ignore */ MWA_MODULE); dbg('module MWA charge'); }
  catch(e){ dbg('echec import MWA : '+e.message); _mwaMod=null; }
  return _mwaMod;
}
async function connectMWA(){
  const mod=await initMWA();
  if(!mod||!mod.transact){ dbg('transact indisponible'); return null; }
  /* web3.js sert a convertir l'adresse base64 du Seed Vault en base58 */
  const w3=await chargerWeb3();
  const PublicKey = w3 && w3.PublicKey;
  if(!PublicKey){ dbg('web3.js requis pour lire l\'adresse'); return null; }
  const identity = IDENTITE;
  try{
    dbg('lancement transact...');
    let address=null, jetonNeuf=null;
    await mod.transact(async (wallet)=>{
      /* Correctif : on retente d'abord avec le jeton memorise (pas de re-autorisation) */
      const jeton=localStorage.getItem('ss_mwa_token');
      let auth=null;
      if(jeton){
        try{ auth=await wallet.reauthorize({ auth_token:jeton, identity }); dbg('reauthorize OK'); }
        catch(e){ dbg('reauthorize refuse, nouvelle autorisation'); localStorage.removeItem('ss_mwa_token'); }
      }
      if(!auth){
        /* Correctif : on passe cluster ET chain, les deux existent selon la version */
        auth=await wallet.authorize({ cluster:MWA_CLUSTER, chain:'solana:'+MWA_CLUSTER, identity });
      }
      dbg('auth OK, comptes='+((auth.accounts&&auth.accounts.length)||0));
      if(auth.auth_token) jetonNeuf=auth.auth_token;
      const c=auth.accounts&&auth.accounts[0];
      if(c){
        address=adresseDuCompte(c, PublicKey);
        if(!address) dbg('adresse illisible : '+String(c.address||c.publicKey).slice(0,60));
        else dbg('adresse normalisee : '+address.slice(0,6)+'...'+address.slice(-4));
      }
    });
    if(jetonNeuf) localStorage.setItem('ss_mwa_token', jetonNeuf);
    return address ? {success:true, address, type:'mwa'} : null;
  }catch(e){ dbg('erreur MWA : '+e.message); return null; }
}

/* ---------- Extensions navigateur ---------- */
async function connectExtension(id){
  const provider=getProvider(id);
  if(!provider){ dbg('provider '+id+' introuvable'); return null; }
  try{
    dbg('connexion '+id+'...');
    let resp;
    if(provider.connect) resp=await provider.connect();
    else if(provider.request) resp=await provider.request({method:'connect'});
    else { dbg('aucune methode connect sur '+id); return null; }
    const pk=provider.publicKey||(resp&&resp.publicKey);
    if(!pk){ dbg('pas de publicKey pour '+id); return null; }
    const w3=await chargerWeb3();
    const address = normaliserAdresse(pk, w3&&w3.PublicKey)
                 || ((typeof pk.toBase58==='function')?pk.toBase58():String(pk));
    if(!RE_BASE58.test(address)){ dbg('adresse invalide pour '+id+' : '+String(address).slice(0,20)); return null; }
    _providerExt=provider;
    return {success:true, address, type:'ext', provider};
  }catch(e){ dbg('erreur '+id+' : '+e.message); return null; }
}

async function disconnectWallet(){
  if(_providerExt){ try{ if(_providerExt.disconnect) await _providerExt.disconnect(); }catch(e){} _providerExt=null; }
  localStorage.removeItem('ss_mwa_token');          /* Correctif : le jeton doit partir aussi */
  S.connected=false; S.address=''; S.walletReel=false; S.addressComplete=''; S.soldeSkr=0;
  S.walletType=''; S.walletId='';
  toast('Déconnecté'); save(); ui();
}

/* ---------- Selecteur ---------- */
function showWalletSelector(wallets, onSelect){
  const old=document.getElementById('wallet-selector-overlay'); if(old) old.remove();
  const overlay=document.createElement('div');
  overlay.id='wallet-selector-overlay';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:999;display:flex;align-items:center;justify-content:center;padding:16px;';
  const box=document.createElement('div');
  box.style.cssText='background:#0e0e1a;border:1px solid rgba(153,69,255,.4);border-radius:16px;padding:20px;width:100%;max-width:320px;';
  const title=document.createElement('div');
  title.textContent='Choisir un wallet';
  title.style.cssText='font-family:Orbitron,sans-serif;font-size:1.1rem;font-weight:700;text-align:center;margin-bottom:16px;background:linear-gradient(90deg,#9945FF,#14F195);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;';
  box.appendChild(title);
  /* Bandeau d'etat : explique tout de suite si le contexte empeche le Seed Vault */
  const etat=document.createElement('div');
  const okAndroid=estAndroid(), okHttps=contexteSecurise(), dansWallet=navigateurIntegre();
  if(!okAndroid || !okHttps || dansWallet){
    etat.style.cssText='font-size:10px;line-height:1.5;color:#fca5a5;background:rgba(239,68,68,.12);'+
      'border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:8px 10px;margin-bottom:12px;';
    etat.innerHTML='Seed Vault indisponible ici :<br>'+
      (okAndroid?'':'\u2022 Android requis<br>')+
      (okHttps?'':'\u2022 HTTPS requis (page ouverte en '+location.protocol+')<br>')+
      (dansWallet?'\u2022 tu es dans le navigateur d\'un wallet \u2014 ouvre le jeu dans <b>Chrome</b>':'');
    box.appendChild(etat);
  }
  wallets.forEach(w=>{
    const btn=document.createElement('button');
    btn.style.cssText='width:100%;padding:14px 16px;margin-bottom:10px;border-radius:12px;border:1px solid rgba(153,69,255,.3);background:rgba(255,255,255,.06);color:#fff;font-size:.95rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:12px;';
    const inutilisable = (w.type==='mwa') && (!estAndroid() || !contexteSecurise() || navigateurIntegre());
    btn.innerHTML='<span style="font-size:1.3rem">'+w.icon+'</span><span>'+w.name+'</span>'+
      (inutilisable?'<span style="margin-left:auto;font-size:10px;color:#777">indisponible</span>':'');
    if(inutilisable){ btn.style.opacity='.45'; }
    btn.onclick=()=>{ overlay.remove(); onSelect(w); };
    box.appendChild(btn);
  });
  /* Plus de mode simulation : un wallet non connecte reste non connecte.
     Un faux etat « connecte » induisait en erreur sur ce qui part on-chain. */
  const fermer=document.createElement('button');
  fermer.style.cssText='width:100%;padding:11px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#8b8b9e;font-size:.85rem;cursor:pointer;margin-top:4px;';
  fermer.textContent=T('Annuler');
  fermer.onclick=()=>{ overlay.remove(); };
  box.appendChild(fermer);
  overlay.onclick=(e)=>{ if(e.target===overlay) overlay.remove(); };
  overlay.appendChild(box); document.body.appendChild(overlay);
}

/* ---------- Bouton principal ---------- */
async function toggleWallet(){
  if(S.connected){ await disconnectWallet(); return; }
  const wallets=detectWallets();
  dbg('wallets detectes : '+wallets.map(w=>w.name).join(', '));

  const tryConnect=async (wallet)=>{
    toast('Connexion…');
    let res=null;
    if(wallet && wallet.type==='mwa')      res=await connectMWA();
    else if(wallet && wallet.type==='ext') res=await connectExtension(wallet.id);

    if(res && res.address){
      S.connected=true; S.walletReel=true;
      /* On retient le canal : _providerExt est une variable de page, elle
         disparait au moindre rechargement alors que la sauvegarde, elle,
         dit toujours « connecte ». Sans ca on repartait vers le Seed Vault
         et on affichait un message de navigateur incoherent. */
      S.walletType = res.type || (wallet && wallet.type) || 'ext';
      S.walletId   = (wallet && wallet.id) || '';
      S.address=res.address.slice(0,4)+'…'+res.address.slice(-4);
      S.addressComplete=res.address;
      toast('✅ '+wallet.name+' connecté • '+S.address, 3000);
      /* Le solde SKR se lit sur la chaine, jamais devine. */
      lireSoldeSKR().then(()=>{ save(); ui(); if(typeof renderShips==='function') renderShips(); });
      if(!localStorage.getItem('ss35_first')){
        S.skr+=600; localStorage.setItem('ss35_first','1');
        setTimeout(()=>toast('\ud83c\udf81 '+T('Bonus de bienvenue')+' \u2022 +600 GC'), 1200);
      }
      save(); ui();
    } else {
      /* Echec : on reste franchement deconnecte. Le detail de la cause
         a deja ete journalise par le canal de connexion. */
      S.connected=false; S.walletReel=false; S.address=''; S.addressComplete=''; S.soldeSkr=0;
      const cause = CHAINE.derniereErreur ? ' \u2022 '+String(CHAINE.derniereErreur).slice(0,60) : '';
      CHAINE.derniereErreur=null;
      toast('\u274c '+T('Connexion échouée')+(wallet?' \u2014 '+wallet.name:'')+cause, 4200);
      save(); ui();
    }
  };

  showWalletSelector(wallets, tryConnect);
}

function checkStreak(){ const today=new Date().toDateString(); if(S.lastClaim && S.lastClaim!==today){ const y=new Date(); y.setDate(y.getDate()-1); if(S.lastClaim!==y.toDateString()) S.streak=0; } }
function claimDaily(){ if(!S.connected) return toast('Connecte le Seed Vault'); const today=new Date().toDateString(); if(S.lastClaim===today) return toast('Déjà claim'); const y=new Date(); y.setDate(y.getDate()-1); S.streak = S.lastClaim===y.toDateString() ? S.streak+1 : 1; S.lastClaim=today; const gc=Math.round(90+S.streak*35); S.skr+=gc; toast(`🔥 Streak ${S.streak} • +${gc} GC`); save(); ui(); }
/* Badge : distingue une vraie connexion Seed Vault d'une simulation */
function majRecordInfini(){
  const l=document.getElementById('ligne-infini'), v=document.getElementById('infini-record');
  if(!l||!v) return;
  if(S.infiniRecord>0){
    l.style.display='flex';
    v.textContent='vague '+S.infiniVague+'  \u2022  '+S.infiniRecord.toLocaleString();
  } else l.style.display='none';
}
function majBadgeWallet(){
  const el=document.getElementById('w-status'); if(!el) return;
  if(!S.connected){ el.textContent='\ud83d\udd17 Connecter'; return; }
  el.textContent = '\ud83d\udfe2 ' + (S.address||T('Connecté'));
  el.title = T('Wallet connecté • devnet');
}

/* Compteur d'activite INTERNE. Ne signe rien, ne touche pas la blockchain.
   Sert uniquement aux stats du joueur (achats, claims, missions). */
function addTx(action){
  S.txCount=(S.txCount||0)+1;
  save(); ui();
}

/* ---------- SEEKER TASK : 15 transactions on-chain, declenchees a la main ----------
   Une seule porte d'entree : le joueur appuie sur le bouton, une TX memo part,
   il signe dans son wallet. Rien d'automatique, rien de cache. */
function taskFaites(){ return S.txOnChain||0; }   /* uniquement des TX reelles */

/* Seeker Task : les 15 transactions memo partent groupees, le joueur ne signe
   qu'une fois. Relançable autant de fois qu'on veut, meme deja complete :
   c'est ce qui alimente l'activite Solana du compte. Le bonus, lui, ne tombe
   qu'a la premiere completion. */
async function envoyerSeekerTask(){
  if(!S.connected) return toast('Connecte ton wallet d\'abord');
  if(CHAINE.enCours) return toast('Transaction en cours\u2026');
  const rejoue = taskFaites()>=15;

  if(!S.walletReel) return toast(T('Connecte un wallet pour envoyer des transactions'), 3000);

  const cout = (TRESORERIE.actif && TRESORERIE.frais>0)
    ? ' \u2022 '+TRESORERIE.frais+' SOL de soutien' : '';
  toast('\u270d\ufe0f 15 TX en une signature'+cout+'\u2026', 3200);
  const sig = await envoyerTxSeeker('seeker-task');
  if(!sig){
    /* On affiche la vraie cause : sans elle le joueur ne peut rien corriger. */
    const cause = CHAINE.derniereErreur ? ' \u2022 '+String(CHAINE.derniereErreur).slice(0,70) : '';
    CHAINE.derniereErreur=null;
    return toast('\u274c TX echouee'+cause, 5000);
  }
  S.txOnChain=15;
  S.lotsTask=(S.lotsTask||0)+1;
  creditTX(15);                     /* 15 memos confirmes = 15 TX on-chain */
  Audio2.jouerSfx('button_click');
  toast(rejoue ? '\u26d3\ufe0f 15 TX renvoyees \u2022 lot n\u00b0'+S.lotsTask
               : '\u26d3\ufe0f 15 TX confirmees on-chain \u2022 une seule signature', 3000);
  finTaskSiComplete(); save(); ui(); majSeekerTask();
}

function finTaskSiComplete(){
  if(taskFaites()!==15) return;
  if(S.taskRecompensee) return;      /* le bonus ne tombe qu'une fois */
  S.taskRecompensee=true;
  S.skr+=600;
  toast('\ud83c\udf89 SEEKER TASK COMPLETE • +600 GC',3800);
  Audio2.jouerSfx('levelup'); haptique('victoire');
}

/* Met a jour la carte Seeker Task de l'accueil */
function majSeekerTask(){
  const f=taskFaites();
  const c=document.getElementById('tx'); if(c) c.textContent=f;
  const bar=document.getElementById('tx-bar'); if(bar) bar.style.width=Math.min(f/15*100,100)+'%';
  const bd=document.getElementById('air-badge'); if(bd) bd.classList.toggle('hidden', f<15);
  const b=document.getElementById('btn-task');
  if(b){
    /* Relançable meme complete : renvoyer un lot entretient l'activite du compte. */
    b.disabled=false; b.style.opacity=1;
    b.textContent = (f>=15) ? 'RELANCER LES 15 TX' : 'ENVOYER LES 15 TX';
  }
  const e=document.getElementById('task-etat');
  if(e) e.textContent = S.walletReel ? T('Wallet connecté • devnet') : T('Wallet non connecté');
}

/* Applique la variante de carte choisie par le joueur */
/* Bascule entre la campagne principale et CHAOS PROTOCOL */
function basculerCampagne(){
  if(!boucleDebloquee(4)) return toast('Terrasse le NEXUS pour ouvrir CHAOS PROTOCOL',2600);
  S.carteActive = (S.carteActive===2) ? 1 : 2;
  save(); appliquerCarte(); renderMap(); majBoutonCampagne();
  Audio2.jouerSfx('button_click'); haptique('bouton');
  toast(S.carteActive===2 ? '\u26a0\ufe0f CHAOS PROTOCOL' : 'GENESIS \u2014 campagne principale', 2200);
}
function majBoutonCampagne(){
  const b=document.getElementById('btn-campagne'); if(!b) return;
  const ouvert=boucleDebloquee(4);
  b.style.display = ouvert ? 'block' : 'none';
  b.innerHTML = (S.carteActive===2) ? 'GENESIS \u25c0' : 'CHAOS \u25b6';
  b.style.borderColor = (S.carteActive===2) ? 'rgba(20,241,149,.5)' : 'rgba(244,114,182,.5)';
  b.style.color = (S.carteActive===2) ? '#14F195' : '#f9a8d4';
}
/* Le fond de carte decoule de la campagne ouverte, il ne se choisit plus. */
function appliquerCarte(){
  const c=CARTES[S.carteActive===2?2:1]; if(!c) return;
  const img=document.getElementById('map-bg');
  if(img) img.src=c.img;
}

function renderMap(){
  const carte = S.carteActive||1;
  /* Positions de la campagne 2 : remontee plus resserree */
  /* Cale sur le chemin de la carte CHAOS : six noeuds tombent pile sur les
     anneaux lumineux du serpentin, le dernier au coeur de l'anomalie.
     Coordonnees exprimees dans le cadrage visible (l'image est en cover). */
  const POS2 = [
    { top:'93%', left:'52%' },  // 13 Breche  - depart, entre les deux quais
    { top:'82%', left:'74%' },  // 14 Comptoir - anneau violet
    { top:'69%', left:'50%' },  // 15 Meute d'Elite - anneau vert
    { top:'56%', left:'50%' },  // 16 FRACTURE - anneau violet
    { top:'44%', left:'49%' },  // 17 Havre - anneau vert
    { top:'34%', left:'48%' },  // 18 Signal Inconnu - anneau violet
    { top:'24%', left:'48%' },  // 19 Coffre Genesis - dernier anneau
    { top:'16%', left:'34%' },  // 20 Portail - seuil de l'anomalie
    { top:'6%',  left:'50%' }   // 21 NEXUS PRIME - dans l'anomalie
  ];
  /* Chemin serpentant : 13 noeuds du QG (bas) au Nexus (haut) */
  const positions = [
    { top:'95%', left:'50%' },  // 0  QG Seeker
    { top:'88%', left:'34%' },  // 1  Eveil
    { top:'81%', left:'62%' },  // 2  Asteroides
    { top:'74%', left:'38%' },  // 3  Perils
    { top:'66%', left:'58%' },  // 4  VORTEX
    { top:'58%', left:'32%' },  // 5  Nebuleuse
    { top:'50%', left:'60%' },  // 6  Station Sigma
    { top:'42%', left:'36%' },  // 7  CORRUPTION
    { top:'34%', left:'56%' },  // 8  QG Terre
    { top:'26%', left:'26%' },  // 9  Debris
    { top:'25%', left:'66%' },  // 10 Redressement
    { top:'16%', left:'46%' },  // 11 Point de rupture
    { top:'7%',  left:'50%' }   // 12 NEXUS
  ];
  const box = document.getElementById('map-nodes-visual');
  if(!box) return;
  box.innerHTML = '';
  majTerminalCarte();

  const liste = NODES.filter(x => (x.carte||1)===carte);
  liste.forEach((n, idx) => {
    const done = S.completedNodes.includes(n.id);
    const available = noeudAccessible(n);
    const locked = !available && !done;
    const pos = (carte===2 ? POS2[idx] : positions[idx]) || { top:'50%', left:'50%' };
    const size = (n.id===12||n.id===21) ? 104 : (BOSS_DEFS[n.id] ? 90 : (n.type==='hub'||n.carte===2) ? 84 : 76);

    const nodeEl = document.createElement('div');
    nodeEl.style.cssText = `
      position:absolute; top:${pos.top}; left:${pos.left};
      width:${size}px; height:${size}px; transform:translate(-50%,-50%);
      z-index:${30 - idx}; opacity:${locked ? 0.4 : 1};
      filter:${locked ? 'grayscale(0.8)' : 'none'};
      cursor:${(available || done) ? 'pointer' : 'default'};
      transition:all .25s ease;`;

    /* Vignettes de scene pour les noeuds 1 a 8, reutilisees au-dela */
    const SLOT_NOEUD = {
      1:'node1', 2:'node2', 3:'node3', 4:'node4', 5:'node5',
      6:'node6', 7:'node7', 8:'node8', 9:'node2', 10:'node3', 11:'node6', 12:'node7',
      13:'cxNdcombat', 14:'cxNdshop',  15:'cxNdelite', 16:'cxNdboss',  17:'cxNdrepos',
      18:'cxNdmystere',19:'cxNdtresor',20:'cxNdportail',21:'cxNdboss'
    };
    const slotImg = SLOT_NOEUD[n.id] ? ASSETS[SLOT_NOEUD[n.id]] : null;
    const imgSrc = slotImg ? slotImg.src : (NODE_IMGS[Math.min(n.id + 1, 8)] || NODE_IMGS[1]);
    const statusIcon = done ? ico('nodeDone','\u2705',20)
                     : available ? ico('nodePlay','\u25b6\ufe0f',20)
                     : ico('nodeLock','\ud83d\udd12',20);
    const glow = done
      ? 'drop-shadow(0 0 10px #14F195)'
      : available
        ? 'drop-shadow(0 0 14px #9945FF) drop-shadow(0 0 4px #14F195)'
        : 'none';

    nodeEl.innerHTML = `
      <div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(circle,rgba(153,69,255,0.25) 0%,transparent 70%);pointer-events:none;"></div>
        <img src="${imgSrc}" alt="${n.title}"
          style="width:100%;height:100%;object-fit:contain;filter:${glow};${available && !done ? 'animation:pulse 2s infinite;' : ''}"/>
        <div style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);
          font-size:9px;font-weight:700;white-space:nowrap;padding:2px 6px;border-radius:8px;
          background:rgba(0,0,0,0.75);color:#fff;border:1px solid rgba(153,69,255,0.4);">
          ${statusIcon} ${n.title.split(' ')[0]}
        </div>
      </div>`;

    /* Un noeud complete reste rejouable */
    const verrou = noeudVerrouille(n.id);
    if (verrou && !done){
      /* Secteur sous cle : il reste cliquable pour expliquer ce qui manque */
      nodeEl.style.cursor='pointer';
      nodeEl.style.opacity='0.55';
      nodeEl.onclick = () => {
        const cid=Object.keys(CLES).find(k=>CLES[k]===verrou);
        toast('\ud83d\udd12 '+verrou.nom+' requise \u2022 '+fragments(cid)+'/3 fragments',3600);
        Audio2.jouerSfx('button_click'); haptique('bouton');
      };
      const cad=document.createElement('div');
      cad.textContent='\ud83d\udd12';
      cad.style.cssText='position:absolute;top:-10px;right:-6px;font-size:15px;z-index:6;'+
        'filter:drop-shadow(0 0 5px #000)';
      nodeEl.appendChild(cad);
    }
    else if (available || done) nodeEl.onclick = () => toucherNoeud(n.id);

    /* Etoiles : meilleure difficulte reussie */
    const et=(S.nodeStars&&S.nodeStars[n.id])||0;
    if(et>0){
      const badge=document.createElement('div');
      badge.style.cssText='position:absolute;top:-12px;left:50%;transform:translateX(-50%);'+
        'font-size:10px;letter-spacing:1px;white-space:nowrap;text-shadow:0 0 6px #000;z-index:5;'+
        'color:'+(et>=3?'#f87171':et===2?'#fbbf24':'#86efac');
      badge.textContent='\u2605'.repeat(et);
      /* Un noeud sans enfant ferait planter tout le rendu de la carte */
      const hote=nodeEl.firstElementChild||nodeEl;
      hote.appendChild(badge);
    }
    box.appendChild(nodeEl);
  });
}
/* ============================================================
   NOEUDS SPECIAUX DE CHAOS PROTOCOL
   Marchand, repos, mystere, tresor, portail : chacun a un effet reel.
   ============================================================ */
const EVENEMENTS_MYSTERE = [
  {nom:'Cache d\u2019armes',    txt:"Un d\u00e9p\u00f4t oubli\u00e9. Deux charges r\u00e9cup\u00e9r\u00e9es.",
   effet:()=>{ S.charges.mitra=(S.charges.mitra||0)+1; S.charges.nuke=(S.charges.nuke||0)+1; }, bon:true},
  {nom:'\u00c9pave marchande', txt:"Les soutes sont intactes. +300 GC.",
   effet:()=>{ S.skr+=300; }, bon:true},
  {nom:'Relique Genesis', txt:"Un artefact ancien. Ta coque s\u2019en trouve renforc\u00e9e d\u00e9finitivement.",
   effet:()=>{ S.bonusVies=Math.min(3,(S.bonusVies||0)+1); }, bon:true},
  {nom:'Signal parasite', txt:"Tes syst\u00e8mes sont br\u00fdit\u00e9s. D\u00e9g\u00e2ts r\u00e9duits sur le prochain secteur.",
   effet:()=>{ S.consommables={...(S.consommables||{}), degats:0.75}; }, bon:false},
  {nom:'Embuscade',       txt:"C\u2019\u00e9tait un pi\u00e8ge. Le prochain secteur sera plus dense.",
   effet:()=>{ S.consommables={...(S.consommables||{}), embuscade:true}; }, bon:false},
  {nom:'Silence radio',   txt:"Rien. Le signal s\u2019est \u00e9teint avant que tu n\u2019arrives.",
   effet:()=>{}, bon:true}
];

/* Boutique de secteur : 3 articles tir\u00e9s au sort, 40 % moins chers */
function ouvrirComptoir(nodeId){
  const tous=articlesShop().reduce((t,r)=>t.concat(r.items),[])
    .filter(i=>!(i.unique && S.unlockedMun.includes(i.unique)));
  const lot=[]; const copie=[...tous];
  for(let i=0;i<3 && copie.length;i++) lot.push(copie.splice(Math.floor(Math.random()*copie.length),1)[0]);
  ouvrirPanneauNoeud('cxNdshop','COMPTOIR', '#c4b5fd',
    "Un marchand a surv\u00e9cu ici. Trois articles, 40 % de r\u00e9duction.",
    lot.map(i=>{
      const prix=Math.round(i.skr*0.6);
      return '<button onclick="acheterComptoir(\''+i.id+'\','+prix+')" class="glass rounded-xl w-full flex justify-between items-center" style="padding:12px 14px;margin-bottom:9px">'+
        '<span class="text-[12px] font-semibold">'+i.name+'</span>'+
        '<span class="text-[11px] font-bold" style="color:'+(S.skr>=prix?'#14F195':'#6b7280')+'">'+prix+' GC</span></button>';
    }).join(''),
    'CONTINUER', ()=>{ validerNoeudSpecial(nodeId); });
}
function acheterComptoir(id,prix){
  if(S.skr<prix) return toast('Cr\u00e9dits insuffisants');
  S.skr-=prix;
  const it=articlesShop().reduce((t,r)=>t.concat(r.items),[]).find(x=>x.id===id);
  const sauve=it.skr; it.skr=0;
  buy(id);                       /* applique l'effet sans redebiter */
  it.skr=sauve; S.skr+=0;
  save(); ui();
}

/* Havre : soin complet et recharge */
function ouvrirHavre(nodeId){
  ouvrirPanneauNoeud('cxNdrepos','HAVRE', '#86efac',
    "Une poche de calme dans le chaos. Tes syst\u00e8mes se r\u00e9tablissent.",
    '<div class="text-[12px] leading-relaxed" style="color:#c9c6d6">'+
    '\u2022 <b>+3 vies</b> sur ton prochain secteur<br>'+
    '\u2022 Charges de bonus <b>enti\u00e8rement recharg\u00e9es</b><br>'+
    '\u2022 <b>+150 GC</b> de ravitaillement</div>',
    'SE REPOSER', ()=>{
      S.consommables={...(S.consommables||{}), vies:3};
      S.charges={mitra:2, nuke:1, ghost:1};
      S.skr+=150; save(); ui();
      Audio2.jouerSfx('levelup'); haptique('victoire');
      toast('\ud83d\udee0\ufe0f Syst\u00e8mes r\u00e9tablis',2200);
      validerNoeudSpecial(nodeId);
    });
}

/* Signal inconnu : un tirage parmi six */
function ouvrirMystere(nodeId){
  const e=EVENEMENTS_MYSTERE[Math.floor(Math.random()*EVENEMENTS_MYSTERE.length)];
  ouvrirPanneauNoeud('cxNdmystere','SIGNAL INCONNU', '#a78bfa',
    "Une \u00e9mission non r\u00e9pertori\u00e9e. Impossible de savoir ce qu\u2019elle cache.",
    '<div class="text-[12px] text-gray-500">R\u00e9sultat r\u00e9v\u00e9l\u00e9 apr\u00e8s ouverture.</div>',
    'OUVRIR LE SIGNAL', ()=>{
      e.effet(); save(); ui();
      Audio2.jouerSfx(e.bon?'levelup':'hit'); haptique(e.bon?'victoire':'degat');
      afficherTransmission(e.bon?'GENESIS':'ALERTE', e.nom+'\n\n'+e.txt,
        ()=>validerNoeudSpecial(nodeId), e.bon?'#14F195':'#f87171');
    });
}

/* Panneau generique pour les noeuds sans combat */
function ouvrirPanneauNoeud(slot, titre, couleur, intro, corps, libelle, action){
  const anc=document.getElementById('panneau-noeud'); if(anc) anc.remove();
  const img=ASSETS[slot];
  const ov=document.createElement('div');
  ov.id='panneau-noeud';
  ov.style.cssText='position:fixed;inset:0;z-index:470;background:rgba(3,3,10,.94);display:flex;'+
    'align-items:center;justify-content:center;padding:22px';
  ov.innerHTML='<div class="glass rounded-3xl" style="max-width:340px;width:100%;padding:22px 20px;border-color:'+couleur+'55">'+
    (img?'<div style="display:flex;justify-content:center;margin-bottom:14px"><img src="'+img.src+'" style="width:74px;height:74px;object-fit:contain"/></div>':'')+
    '<div class="font-o font-bold text-center" style="color:'+couleur+';letter-spacing:2px;font-size:13px">'+titre+'</div>'+
    '<div class="text-[11.5px] text-center mt-2 mb-4" style="color:#9ca3af;line-height:1.6">'+intro+'</div>'+
    corps+
    '<button id="pn-ok" class="btn w-full py-3 rounded-xl font-bold text-sm mt-3">'+libelle+'</button></div>';
  document.body.appendChild(ov);
  document.getElementById('pn-ok').onclick=()=>{ ov.remove(); if(action) action(); };
}

/* Un noeud sans combat est valide directement */
function validerNoeudSpecial(nodeId){
  if(!S.completedNodes.includes(nodeId)){ S.completedNodes.push(nodeId); }
  save(); show('map'); renderMap();
  toast('Secteur travers\u00e9',1600);
}

function openPrep(nodeId){
  if(!S.connected) return toast('Connecte le Seed Vault');
  const nd=NODES.find(x=>x.id===nodeId);
  /* Les secteurs sans combat ouvrent leur propre panneau */
  if(nd && nd.type==='marchand'){ S.currentNode=nodeId; return ouvrirComptoir(nodeId); }
  if(nd && nd.type==='repos'){    S.currentNode=nodeId; return ouvrirHavre(nodeId); }
  if(nd && nd.type==='mystere'){  S.currentNode=nodeId; return ouvrirMystere(nodeId); }
  S.currentNode=nodeId; loadout.difficulte=loadout.difficulte||'normal'; const node=NODES.find(n=>n.id===nodeId); document.getElementById('prep-title').textContent=T(node.title); document.getElementById('prep-brief').textContent=T(node.brief);
  afficherContrat(nodeId);
  afficherPortraitBoss(nodeId);
  afficherChoixDifficulte(nodeId);
  chargerFondNiveau(nodeId);            /* precharge pendant que le joueur choisit son loadout */ loadout.mode='pilote'; loadout.ship=S.ship; loadout.munition='std'; loadout.bonus=null; renderPrep(); show('prep'); }
/* --- Selecteur de difficulte sur l'ecran de preparation --- */
function afficherChoixDifficulte(nodeId){
  const zone=document.getElementById('prep-brief'); if(!zone) return;
  const anc=document.getElementById('choix-diff'); if(anc) anc.remove();
  const best=(S.nodeStars&&S.nodeStars[nodeId])||0;
  const el=document.createElement('div');
  el.id='choix-diff'; el.className='mb-3';
  el.innerHTML='<div class="text-[10px] text-gray-500 mb-1.5 font-semibold">DIFFICULT\u00c9'+
    (best?' \u2022 record : '+'\u2605'.repeat(best):'')+'</div><div class="seg-diff grid grid-cols-3 gap-2"></div>';
  const g=el.querySelector('.seg-diff');
  Object.values(DIFFICULTES).forEach(d=>{
    const b=document.createElement('button');
    b.className='glass rounded-xl p-2 text-center'+(loadout.difficulte===d.id?' ring-2 ring-green-400':'');
    b.onclick=()=>{ loadout.difficulte=d.id;
      afficherChoixDifficulte(nodeId);
      afficherContrat(nodeId);   /* l'objectif et la prime suivent le cran choisi */
    };
    b.innerHTML='<div class="text-[11px] font-bold" style="color:'+d.couleur+'">'+'\u2605'.repeat(d.etoiles)+'</div>'+
                '<div class="text-[10px]">'+d.nom+'</div>'+
                '<div class="text-[9px] text-gray-500">x'+d.reward+'</div>';
    g.appendChild(b);
  });
  zone.parentNode.insertBefore(el, zone.nextSibling);
}

/* Carte du contrat, posee en tete du briefing */
function afficherContrat(nodeId){
  const zone=document.getElementById('prep-brief'); if(!zone) return;
  const anc=document.getElementById('carte-contrat'); if(anc) anc.remove();
  const c=contratDuNoeud(nodeId); if(!c) return;
  /* chaque difficulte a sa propre recompense : on affiche l'etat du cran choisi */
  const dejaFait=(S.contratsRemplis||[]).includes(nodeId+':'+(loadout.difficulte||'normal'));
  const el=document.createElement('div');
  el.id='carte-contrat';
  el.className='rounded-2xl mb-3';
  el.style.cssText='padding:13px 15px;border:1px solid '+(dejaFait?'rgba(20,241,149,.42)':'rgba(251,191,36,.38)')+
    ';background:linear-gradient(180deg,'+(dejaFait?'rgba(6,40,28,.5)':'rgba(44,33,7,.5)')+',rgba(14,11,24,.35))';
  el.innerHTML=
    '<div style="display:flex;align-items:center;gap:9px">'+
      '<span style="font-size:14px">'+(dejaFait?'✓':'◎')+'</span>'+
      '<span style="font-family:Orbitron,sans-serif;font-size:9.5px;letter-spacing:2px;color:'+
        (dejaFait?'#14F195':'#fbbf24')+'">CONTRAT • '+c.def.nom+'</span>'+
      '<span style="margin-left:auto;font-size:10.5px;font-weight:700;color:'+
        (dejaFait?'#6b7280':'#fbbf24')+'">+'+c.gc+' GC</span>'+
    '</div>'+
    '<div style="font-size:11.5px;color:#c9c6d6;margin-top:6px;line-height:1.5">'+
      c.def.texte(c.valeur)+'</div>'+
    (dejaFait?'<div style="font-size:9.5px;color:#6b7280;margin-top:4px">D&eacute;j&agrave; rempli — la r&eacute;compense reste acquise une seule fois.</div>':'');
  zone.parentNode.insertBefore(el, zone);
}

/* Portrait statique du boss sur l'ecran de preparation (pas de rotation) */
function afficherPortraitBoss(nodeId){
  const zone=document.getElementById('prep-brief'); if(!zone) return;
  const anc=document.getElementById('boss-portrait'); if(anc) anc.remove();
  const def=BOSS_DEFS[nodeId]; if(!def) return;
  const FICH={vortex:'boss_vortex_face', sentinelle:'boss_sentinelle', dragon:'boss_dragon'};
  const el=document.createElement('div');
  el.id='boss-portrait';
  el.className='glass rounded-2xl p-3 mb-3 flex items-center gap-3';
  el.style.borderColor=def.couleur+'66';
  el.innerHTML=`
    <img src="${(ASSETS[def.sprite]&&ASSETS[def.sprite].src)||''}" alt="${def.nom}"
         onerror="this.style.display='none'"
         style="width:74px;height:74px;object-fit:contain;filter:drop-shadow(0 0 12px ${def.couleur})"/>
    <div>
      <div class="text-[9px] text-red-400 font-bold tracking-wider">\u26a0 BOSS D\u00c9TECT\u00c9</div>
      <div class="font-o font-bold text-sm" style="color:${def.couleur}">${def.nom}</div>
      <div class="text-[10px] text-gray-400">PV \u00d7${def.hpMult}${def.phase2?' \u2022 2 phases':''}${def.invoque?' \u2022 invocations':''}</div>
    </div>`;
  zone.parentNode.insertBefore(el, zone);
}

function renderPrep(){
  document.getElementById('mode-grid').innerHTML=MODES.map(m=>`<button onclick="setMode('${m.id}')" class="glass rounded-xl p-2.5 text-left ${loadout.mode===m.id?'ring-2 ring-green-400':''}"><div class="font-semibold text-xs" style="color:${m.color}">${m.name}</div><div class="text-[9px] text-gray-500 flex items-center gap-1"><img class="ico-stat" src="${ICO.health}"/>${m.lives} <img class="ico-stat" src="${ICO.damage}"/>x${m.reward.toFixed(1)}</div></button>`).join('');
  document.getElementById('prep-ships').innerHTML=S.unlocked.map(id=>{ const sh=SHIPS[id]; return `<button onclick="setShip(${id})" class="glass rounded-xl p-2.5 min-w-[72px] text-center ${loadout.ship===id?'ring-2 ring-green-400':''}"><div>${ico('ship'+id, sh.emoji, 34)}</div><div class="text-[9px] mt-0.5">${sh.name}</div></button>`; }).join('');
  document.getElementById('prep-munitions').innerHTML=MUNITIONS.map(m=>{ const unlocked=S.unlockedMun.includes(m.id);
    const stats=`<span class="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5"><img class="ico-stat" src="${ICO.damage}"/>x${m.dmg} <img class="ico-stat" src="${ICO.speed}"/>x${m.rate}</span>`; return `<button onclick="${unlocked?`setMun('${m.id}')`:'toast(\'Munition verrouillée\')'}" class="glass rounded-xl p-2.5 text-left ${loadout.munition===m.id?'ring-2 ring-green-400':''} ${!unlocked?'opacity-40':''}"><div class="font-semibold text-xs">${m.name}</div>${stats}</button>`; }).join('');
  /* Icones dessinees plutot qu'emojis : meme langage visuel que le reste du jeu. */
  /* On annonce le plafond avant de partir : le decouvrir en plein combat
     serait une mauvaise surprise. */
  const capBox=document.getElementById('prep-cap-boosts');
  if(capBox){
    const nd=S.currentNode||0;
    const base=(BOOSTS_BASE.find(p=>nd<=p.jusqu)||BOOSTS_BASE[BOOSTS_BASE.length-1]).max;
    const f=BOOSTS_DIFFICULTE[loadout.difficulte] ?? 1;
    const cap=Math.max(1, Math.round(base*f));
    capBox.textContent=T('Boosts : {0} max', cap)+
      (f<1 ? ' \u00b7 '+T(loadout.difficulte==='extreme'?'Extrême':'Difficile') : '');
  }
  document.getElementById('prep-bonuses').innerHTML=BONUSES.map(b=>{
    const charges=S.charges[b.chargesKey]||0;
    const selected=loadout.bonus===b.id;
    return `<button onclick="setBonus('${b.id}')" class="glass rounded-xl p-3 w-full text-left flex justify-between items-center gap-3 ${selected?'ring-2 ring-green-400':''} ${charges<=0?'opacity-40':''}">`+
      `<span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center">${ico(b.slot,b.emoji,28)}</span>`+
      `<div style="flex:1;min-width:0"><div class="font-semibold text-xs">${T(b.name)}</div>`+
      `<div class="text-[9px] text-gray-500">${T(b.desc)}</div></div>`+
      `<div class="text-xs font-bold">${charges}</div></button>`;
  }).join('');
}
function setMode(id){ loadout.mode=id; renderPrep(); }
function setShip(id){ loadout.ship=id; S.ship=id; renderPrep(); }
function setMun(id){ loadout.munition=id; renderPrep(); }
function setBonus(id){ if((S.charges[BONUSES.find(b=>b.id===id).chargesKey]||0)<=0) return toast('Plus de charges'); loadout.bonus = loadout.bonus===id ? null : id; renderPrep(); }

function launchMission(){
  const base=MODES.find(m=>m.id===loadout.mode);
  const diff=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  /* La difficulte multiplie PV ennemis, cadence de tir et recompenses */
  const mode={...base, hp:base.hp*diff.hp, reward:base.reward*diff.reward, cadence:diff.cadence, diffId:diff.id,
              flux:diff.flux, vitesse:diff.vitesse, bonusUnites:diff.bonusUnites};
  const nd=NODES.find(x=>x.id===S.currentNode);
  if(nd && nd.type==='tresor')  mode.multDropsNoeud=2.6;   /* Coffre : butin garanti */
  if(nd && nd.type==='portail'){
    /* Un portail garde par un boss ne cumule pas les deux surcouts :
       le boss fournit deja toute la pression. */
    if(!BOSS_DEFS[nd.id]) mode.hp*=1.35;
    mode.spawn*=0.7; mode.reward*=1.8;
  }
  if(S.consommables && S.consommables.embuscade){ mode.spawn*=0.6; delete S.consommables.embuscade; save(); }
  const mun=MUNITIONS.find(m=>m.id===loadout.munition); show('solo'); document.getElementById('hud-title').textContent=NODES.find(n=>n.id===S.currentNode).title; document.getElementById('hud-mode').textContent=mode.name;
  chargerFondNiveau(S.currentNode).then(appliquerFondNiveau);   /* decor du noeud, avec fondu */
  const tr=TRANSMISSIONS[S.currentNode];
  const lancer=()=>initGame(mode, mun);
  if(tr && !(S.trVues||[]).includes(S.currentNode)){
    S.trVues=(S.trVues||[]).concat(S.currentNode); save();
    afficherTransmission(tr.de, tr.txt, lancer, tr.de==='ALERTE'?'#f87171':tr.de==='NEXUS'?'#e879f9':'#14F195');
  } else lancer(); }
function abortMission(){ if(G&&G.running){ G.running=false; cancelAnimationFrame(G.raf); stopMusic(); } show('map'); }

/* Carton de chapitre a l'entree d'un secteur */
function afficherTitreSecteur(){
  const nd=NODES.find(x=>x.id===S.currentNode);
  const ecran=document.getElementById('s-solo'); if(!ecran) return;
  const anc=document.getElementById('titre-secteur'); if(anc) anc.remove();
  const el=document.createElement('div');
  el.id='titre-secteur';
  const num = S.currentNode>=0 ? ('SECTEUR '+String(S.currentNode).padStart(2,'0')) : 'MODE INFINI';
  const nom = nd ? nd.title : 'ZONE INCONNUE';
  const b = nd && BOUCLES[nd.boucle] ? BOUCLES[nd.boucle] : null;
  el.innerHTML='<div class="num" style="color:'+(b?b.couleur:'#14F195')+'">'+num+(b?' \u2022 '+b.nom:'')+'</div>'+
               '<div class="nom">'+nom.toUpperCase()+'</div><div class="trait"></div>';
  ecran.appendChild(el);
  setTimeout(()=>{ el.classList.add('sortie'); setTimeout(()=>el.remove(),700); }, 2100);
}


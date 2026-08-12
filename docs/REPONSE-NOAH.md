# Réponse à ton audit — Seeker Strike

Ton diagnostic sur la couverture était juste. Deux de tes trois trous étaient
réels, et l'un cachait un vrai bug. Tout est corrigé, la batterie complète est
au vert : **106/106**.

---

## 1. Le bug que ton audit a fait sortir : double transaction

Tu avais raison : rien ne testait le double appui. En écrivant le test, il est
tombé du premier coup — **2 signatures pour un seul geste**.

La cause, dans `envoyerTxSeeker` :

```js
if(CHAINE.enCours) return null;        // test du verrou
const w3 = await chargerWeb3();        // ← AWAIT : la main repart à la boucle d'événements
CHAINE.enCours = true;                 // verrou posé trop tard
```

Deux appuis rapprochés franchissent tous les deux le test pendant le chargement
de web3.js. Sur mobile, un double-tap suffit. Correctif :

```js
/* Le verrou se pose AVANT tout `await`. Sinon deux appuis rapproches
   franchissent tous les deux le test pendant le chargement de web3.js,
   et DEUX transactions partent pour un seul geste. */
if(CHAINE.enCours) return null;
CHAINE.enCours = true;
try{
  const w3 = await chargerWeb3();
  if(!w3){ CHAINE.derniereErreur='web3.js indisponible (reseau ?)'; return null; }
  ...
}finally{ CHAINE.enCours = false; }
```

Appliqué aux trois chemins : `envoyerTxSeeker`, `payerEnSKR`, `donnerSOL`.

---

## 2. Second bug, trouvé en écrivant le test que tu réclamais

En couvrant le blockhash périmé, un défaut de mon propre correctif anti-429 est
apparu : le cache de 40 s **conservait un blockhash mort**. Une transaction qui
échoue sur `Blockhash not found` était donc suivie de 40 s d'échecs identiques,
sans que rien ne se répare.

```js
/* A appeler des qu'une transaction echoue sur un blockhash perime : sans ca,
   le cache reservait la meme valeur morte pendant 40 s et TOUTES les relances
   echouaient d'affilee. */
function invaliderBlockhash(){ CHAINE.bhCache=null; CHAINE.bhTemps=0; }
```

Appelée dans le `catch` de `envoyerTxSeeker` et `payerEnSKR` quand le message
correspond à `/blockhash not found|block height exceeded/i`.

---

## 3. Le spinner infini : verrou vérifié, il n'y en a pas

`CHAINE.enCours` est relâché dans un `finally` sur les trois chemins — donc pas
de blocage permanent possible. Mais tu as raison : **ce n'était prouvé nulle
part**. C'est désormais testé explicitement, succès *et* échec.

---

## 4. Tes remarques sur les tests — toutes prises

| Ta remarque | Ce qui a été fait |
|---|---|
| `41000` codé en dur | Constante `BH_FENETRE` exportée, le test lit `BH_FENETRE + 1000` et vérifie qu'elle existe |
| Variables mortes dans `demo3_sc.js` | Supprimées |
| Chemin fragile vers `index_v37.html` | Trois candidats testés (`../game/`, `../`, `./`) — ton correctif, adopté tel quel |
| `save()` débouncé ? | **Non, écriture synchrone.** C'est maintenant asserté : `save()` puis relecture immédiate de `localStorage` |
| `sendRawTransaction` stubbé mais jamais appelé | La boucle d'envoi est maintenant réellement exercée de bout en bout |

Sur ce dernier point : plutôt que de bouchonner `signerEtEnvoyer`, le test
injecte un faux web3.js et un faux provider **via `window.solana`**, puis
laisse `envoyerTxSeeker` faire son vrai parcours — construction de la
transaction, `retrouverProvider()`, signature, `diffuser()`. C'est ce chemin
complet qui a fait tomber le bug du §1.

---

## 5. Nouvelles assertions — `rpc_sc.js` §9 à §12

```
ok  la boucle d'envoi est reellement exercee (1 signature)
ok  envoi reussi : signature rendue
ok  apres un envoi reussi : verrou relache
ok  signature refusee : la fonction rend null
ok  apres un ECHEC : verrou relache (pas de blocage permanent)
ok  cause enregistree : signature refusée dans le wallet
ok  double appui pendant l'envoi : une seule signature demandee
ok  un appel aboutit, l'autre est repousse
ok  verrou relache apres le double appui
ok  blockhash refuse : cache purge, la relance repart d'un blockhash frais
ok  message clair : transaction expirée, relance-la
ok  save() ecrit de facon synchrone : la relecture immediate est fiable
```

---

## 6. Trois tests étaient verts pour de mauvaises raisons

En relançant tout, trois suites préexistantes ont cassé — et c'est une bonne
nouvelle, elles ne testaient plus ce qu'elles croyaient :

- `skr_sc` et `don_sc` : sur devnet sans `SKR.mintTest`, le chemin SKR est
  **volontairement fermé** (couvert par `skrmain_sc`). Les deux suites
  passaient donc à côté du transfert SPL sans rien vérifier. Elles ouvrent
  maintenant le chemin explicitement.
- `task_sc` : le nouveau délai anti-saturation de 20 s bloquait les relances
  enchaînées. Le délai est neutralisé là où il n'est pas l'objet du test.
- `p191_sc` attendait le message brut `'User rejected'`, désormais traduit par
  `causeLisible()`.

---

## 7. Le code que tu demandais

`audit/` a été re-poussé. Les quatre fonctions sont dans `audit/3-solana.js`
(52 Ko) si tu préfères ce format ; sinon les voici.

### `estSature` / `rpcSuivant` / `blockhashFrais` / `diffuser` / `causeLisible`

```js
/* Reconnaissance d'une saturation du RPC : 429, « rate limit », « too many ». */
function estSature(e){
  const m=String((e&&(e.message||e))||'').toLowerCase();
  return m.indexOf('429')>=0 || m.indexOf('rate limit')>=0 || m.indexOf('too many')>=0;
}
/* Passe au RPC suivant de la liste et reconstruit la connexion. */
function rpcSuivant(){
  if(!CHAINE.mod) return false;
  CHAINE.rpcIndex = (CHAINE.rpcIndex+1) % RPC_DEVNET.length;
  CHAINE.rpc = RPC_DEVNET[CHAINE.rpcIndex];
  try{ CHAINE.connexion = new CHAINE.mod.Connection(CHAINE.rpc, 'confirmed'); }catch(e){ return false; }
  LOG.warn('[SEEKER] RPC sature, bascule sur '+CHAINE.rpc);
  return true;
}
const pause = ms => new Promise(r=>setTimeout(r,ms));

/* Un blockhash reste valide environ une minute (150 blocs). Le redemander a
   chaque envoi etait la source principale des 429 : on le garde en memoire.
   La fenetre est nommee pour que les tests ne codent pas le nombre en dur. */
const BH_FENETRE = 40000;
CHAINE.bhCache=null; CHAINE.bhTemps=0;
/* A appeler des qu'une transaction echoue sur un blockhash perime : sans ca,
   le cache reservait la meme valeur morte pendant 40 s et TOUTES les relances
   echouaient d'affilee. */
function invaliderBlockhash(){ CHAINE.bhCache=null; CHAINE.bhTemps=0; }
async function blockhashFrais(){
  const now=Date.now();
  if(CHAINE.bhCache && now-CHAINE.bhTemps < BH_FENETRE) return CHAINE.bhCache;
  let derniere=null;
  for(let essai=0; essai<4; essai++){
    try{
      const r = await CHAINE.connexion.getLatestBlockhash();
      CHAINE.bhCache = r.blockhash; CHAINE.bhTemps = Date.now();
      return CHAINE.bhCache;
    }catch(e){
      derniere=e;
      if(!estSature(e)) throw e;
      rpcSuivant();
      await pause(800*(essai+1));   /* 0,8 s puis 1,6 s puis 2,4 s */
    }
  }
  throw derniere || new Error('reseau devnet sature');
}
/* Diffusion avec reprise : meme logique que pour le blockhash. */
async function diffuser(brut){
  let derniere=null;
  for(let essai=0; essai<4; essai++){
    try{ return await CHAINE.connexion.sendRawTransaction(brut); }
    catch(e){
      derniere=e;
      if(!estSature(e)) throw e;
      rpcSuivant();
      await pause(800*(essai+1));
    }
  }
  throw derniere || new Error('reseau devnet sature');
}
/* Traduit une erreur technique en une phrase comprehensible. */
function causeLisible(e){
  const brut=String((e&&(e.message||e))||'');
  if(estSature(e)) return 'reseau devnet saturé, patiente quelques secondes';
  if(/blockhash not found|block height exceeded/i.test(brut)) return 'transaction expirée, relance-la';
  if(/insufficient|0x1\b/i.test(brut)) return 'solde SOL devnet insuffisant';
  if(/user rejected|declined|cancell?ed/i.test(brut)) return 'signature refusée dans le wallet';
  return brut.slice(0,70);
}
```

### `retrouverProvider`

```js
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
      S.address=adr.slice(0,4)+'…'+adr.slice(-4);
      save(); ui();
      dbg('compte actif different, adresse mise a jour');
    }
    _providerExt=p;
    dbg('provider retrouve : '+(S.walletId||'solana'));
    return p;
  }catch(e){ dbg('reconnexion impossible : '+e.message); return null; }
}
```

Note sur ta remarque « pas de cas Phantom → Solflare → `window.solana` » :
`getProvider(id)` gère `phantom`, `backpack`, `solflare` et `glow`, avec
repli sur `window.solana`. La chaîne de repli est bien là — c'est
`getProvider` qu'il fallait regarder, pas `retrouverProvider`.

### La boucle d'envoi complète — `envoyerTxSeeker`

```js
async function envoyerTxSeeker(action){
  if(!S.walletReel || !S.addressComplete) return null;    /* pas de wallet : rien on-chain */
  /* Le verrou se pose AVANT tout `await`. Sinon deux appuis rapproches
     franchissent tous les deux le test pendant le chargement de web3.js,
     et DEUX transactions partent pour un seul geste. */
  if(CHAINE.enCours) return null;                          /* une transaction a la fois */
  CHAINE.enCours=true;
  try{
    const w3 = await chargerWeb3();
    if(!w3){ CHAINE.derniereErreur='web3.js indisponible (reseau ?)'; return null; }
    const { PublicKey, Transaction, TransactionInstruction } = w3;
    /* Une sauvegarde ancienne peut contenir une adresse base64 : on la repare
       au lieu de laisser la transaction echouer. */
    const adresse = normaliserAdresse(S.addressComplete, PublicKey);
    if(!adresse){ CHAINE.derniereErreur='adresse du wallet illisible, reconnecte-toi'; return null; }
    if(adresse!==S.addressComplete){
      S.addressComplete=adresse;
      S.address=adresse.slice(0,4)+'…'+adresse.slice(-4);
      save(); ui();
      LOG.log('[SEEKER] adresse convertie en base58');
    }
    const joueur = new PublicKey(adresse);
    const blockhash = await blockhashFrais();
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
    CHAINE.derniereErreur = causeLisible(e) || 'erreur inconnue';
    /* Blockhash refuse par le reseau : le cache tient une valeur morte.
       Sans cette purge, les 40 s suivantes echouaient toutes de la meme facon. */
    if(/blockhash not found|block height exceeded/i.test(String((e&&(e.message||e))||''))) invaliderBlockhash();
    LOG.warn('[SEEKER] transaction refusee ou echouee : '+CHAINE.derniereErreur
             +' | brut : '+String((e&&(e.message||e))||''));
    return null;
  }finally{ CHAINE.enCours=false; }
}
```

### `DELAI_LOT` et le compte à rebours

```js
/* Delai minimal entre deux lots. Sans lui, un joueur qui enchaine les envois
   depasse la limite du RPC public et ne recoit plus que des erreurs 429. */
const DELAI_LOT = 20000;
let _dernierLot = 0;
function attenteLot(){
  const reste = DELAI_LOT - (Date.now()-_dernierLot);
  return reste>0 ? Math.ceil(reste/1000) : 0;
}
async function envoyerSeekerTask(){
  if(!S.connected) return toast('Connecte ton wallet d\'abord');
  if(CHAINE.enCours) return toast('Transaction en cours…');
  const attente = attenteLot();
  if(attente) return toast('⏳ '+T('Patiente')+' '+attente+'s — '+T('le réseau devnet limite les envois'), 2800);
  const rejoue = taskFaites()>=15;

  if(!S.walletReel) return toast(T('Connecte un wallet pour envoyer des transactions'), 3000);

  const cout = (TRESORERIE.actif && TRESORERIE.frais>0)
    ? ' • '+TRESORERIE.frais+' SOL de soutien' : '';
  toast('✍️ 15 TX en une signature'+cout+'…', 3200);
  const sig = await envoyerTxSeeker('seeker-task');
  if(!sig){
    /* On affiche la vraie cause : sans elle le joueur ne peut rien corriger. */
    const cause = CHAINE.derniereErreur ? ' • '+T(String(CHAINE.derniereErreur)).slice(0,70) : '';
    CHAINE.derniereErreur=null;
    return toast('❌ '+T('TX échouée')+cause, 5000);
  }
  _dernierLot = Date.now();
  S.txOnChain=15;
  S.lotsTask=(S.lotsTask||0)+1;
  creditTX(15);                     /* 15 memos confirmes = 15 TX on-chain */
  Audio2.jouerSfx('button_click');
  toast(rejoue ? '⛓️ 15 TX renvoyees • lot n°'+S.lotsTask
               : '⛓️ 15 TX confirmees on-chain • une seule signature', 3000);
  finTaskSiComplete(); save(); ui(); majSeekerTask();
}

/* Dans majSeekerTask() — le bouton montre le temps restant */
const att = attenteLot();
b.disabled = att>0; b.style.opacity = att>0 ? 0.55 : 1;
b.textContent = att>0 ? (T('PATIENTE')+' '+att+'s')
                      : ((f>=15) ? T('RELANCER LES 15 TX') : T('ENVOYER LES 15 TX'));
if(att>0){ clearTimeout(_tickLot); _tickLot=setTimeout(majSeekerTask,1000); }
```

---

## 8. Contexte de dépôt, pour la suite

Le dépôt est à plat, l'arborescence de travail ne l'est pas. Correspondance :

| Dépôt | Local |
|---|---|
| `index_v37.html` | `game/index_v37.html` — **source de vérité** |
| `index.html` | `noah-build/index.html` — généré, ne pas éditer |
| `seeker-strike-MOBILE.html` / `-NOAH.html` | `game/` — générés |
| `demo3_sc.js`, `rpc_sc.js`, `run.sh` | `tests/` |

Toute correction va dans `game/index_v37.html`, puis `build_autonome.py`,
`build_noah.py` et `reecrire_chemins.py` régénèrent le reste. Un livrable
modifié à la main est écrasé au build suivant.

---

*Batterie complète après correctifs : `TOUT PASSE (106 executions)`.*

# Réponse au second audit — Seeker Strike v4.4

Quatre de tes six bugs étaient réels, dont un que tu as classé bloquant et qui
l'était. Deux étaient des faux positifs dus à `audit/` périmé — tu l'avais
signalé toi-même en préambule, c'est la bonne méthode.

**Batterie après correctifs : 118 exécutions, tout passe.**

---

## 0. `audit/` périmé — corrigé à la racine

Tu as raison, et le problème était pire qu'un oubli : `audit/` avait été
découpé **à la main** une fois, jamais régénéré depuis. Il ne pouvait que
dériver.

Il y a maintenant `game/build_audit.py`. Il découpe la source par **ancres
textuelles** (pas par numéros de ligne, qui bougent à chaque édition), retire
les base64, et écrit la version du jeu dans l'en-tête de chaque fichier :

```
/* ============================================================
   SEEKER STRIKE v4.4 - 3-solana.js
   Integration Solana : wallet, signatures, RPC, paliers
   Lignes 2109 a 3391 du script (game/index_v37.html)
   Genere par game/build_audit.py — NE PAS EDITER A LA MAIN.
   ============================================================ */
```

Si l'en-tête ne correspond pas à la version affichée dans le jeu, le dossier
est périmé : c'est visible en une seconde au lieu de coûter un audit complet.

Le script s'arrête net si une ancre est introuvable, plutôt que de produire un
découpage silencieusement faux.

Au passage : trois libellés de version se contredisaient dans l'interface
(`v4.0` dans le `<title>`, `v4.2` sur le splash et dans les réglages). Tout est
aligné sur **v4.4**.

---

## BUG 1 — Confirmé, appliqué. C'était bien le blocage.

Aucune borne de temps sur les appels au wallet. Ton analyse est exacte : une
promesse qui ne résout ni ne rejette n'exécute jamais le `finally`, le verrou
reste posé et le bouton grisé à vie.

```js
/* Aucun wallet ne garantit de repondre. Fenetre fermee par le systeme,
   application wallet tuee en arriere-plan, WebView suspendue : la promesse
   ne se resout NI ne rejette. Le `finally` de envoyerTxSeeker ne s'execute
   alors jamais, le verrou reste pose et le bouton reste grise pour de bon.
   Toute attente d'un wallet passe donc par une borne de temps. */
const DELAI_SIGNATURE = 90000;   /* le joueur doit avoir le temps de lire */
const DELAI_RECONNEXION = 30000;
function avecDelai(promesse, ms, quoi){
  let t;
  return Promise.race([
    Promise.resolve(promesse).finally(()=>clearTimeout(t)),
    new Promise((_,rej)=>{ t=setTimeout(()=>rej(new Error('timeout:'+quoi)), ms); })
  ]);
}
```

Appliqué aux **quatre** chemins comme tu l'indiquais : `signTransaction`,
`signAndSendTransaction`, `request`, et `mwa.transact` (Seed Vault).
`retrouverProvider` est borné à 30 s.

Et le test que tu réclamais, celui qui manquait :

```js
window.solana = { signTransaction: ()=>new Promise(()=>{}) };  /* ne répond jamais */
```

```
ok  wallet muet : la fonction rend null au lieu de rester suspendue
ok  VERROU RELACHE apres un wallet qui ne repond jamais (etait bloque a vie)
ok  rend la main en 66 ms, sans attendre indefiniment
ok  message : "le wallet n'a pas répondu, réessaie"
ok  apres le blocage, un nouvel envoi passe normalement
```

---

## BUG 2 — Faux positif : `diffuser()` est bien branché

```
$ grep -n 'sendRawTransaction\|diffuser(' game/index_v37.html
3385:async function diffuser(brut){
3389:    try{ return await CHAINE.connexion.sendRawTransaction(brut); }
3460:      sig = await diffuser(signee.serialize());
```

Un seul `sendRawTransaction`, à l'intérieur de `diffuser()`. Le seul appelant
est `signerEtEnvoyer`. Aucun contournement de la rotation RPC.

C'est la v4.2 d'`audit/` que tu lisais.

---

## BUG 3 — Faux positif : `rpcIndex` est déclaré

```js
const CHAINE = {
  rpc:RPC_DEVNET[0], rpcIndex:0,
  ...
```

Et `reconstruirePool()` le remet à 0 à chaque reconstruction. Tu avais anticipé
ce cas — « si c'est bien déclaré, ignore ». C'est bien déclaré.

---

## BUG 4 — Confirmé, appliqué. Et ton correctif ne suffisait pas.

Le bug est réel : la branche générique n'avait aucun marqueur, et c'est mon
propre cache de blockhash qui l'a créé. Bien vu.

Mais `Date.now().toString(36)` seul **ne suffit pas** — et c'est mon test qui
me l'a appris, en échouant par intermittence sur deux des trois builds. Deux
appels dans la même milliseconde rendent la même valeur, donc la même
signature. Sur un appareil rapide, deux quêtes validées coup sur coup tombent
exactement dans ce cas.

```js
/* Marqueur unique pour differencier deux transactions par ailleurs
   identiques. L'horloge seule ne suffit pas : deux appels dans la meme
   milliseconde rendaient la meme valeur, donc la meme signature. */
let _seqMemo = 0;
function marqueurUnique(){
  return Date.now().toString(36) + '-' + ((_seqMemo++) % 46656).toString(36);
}
```

Le test vérifie 100 marqueurs consécutifs, 100 valeurs distinctes.

---

## BUG 5 — Confirmé, appliqué

Ta lecture de la chaîne de repli était juste : `getProvider('phantom')` renvoie
`window.phantom?.solana || window.solana`, il n'y avait donc pas d'étape
Solflare.

```js
/* Sans filtre, un joueur Solflare dont l'extension tarde a s'injecter se
   voyait servir Phantom, et le bloc « compte actif » plus bas ecrasait son
   adresse par celle d'un AUTRE wallet, sans un mot. On ne cherche ailleurs
   que si aucun wallet n'a ete choisi. */
const p = S.walletId ? getProvider(S.walletId)
        : (getProvider('phantom') || getProvider('solflare') || window.solana);
```

Plus la trace explicite sur le changement de compte, comme tu le proposais.

---

## BUG 6 — Confirmé, appliqué, plus un trou que tu avais raté

Les trois motifs ajoutés : `timeout:`, `4001`, `already been processed`.

Sur le rejet en objet vide, ton correctif (`|| 'erreur inconnue du wallet'`)
traitait le symptôme mais pas la cause. `String({})` ne rend pas `''` — il rend
`'[object Object]'`, une chaîne de 15 caractères qui passe le `||` et
s'affiche telle quelle au joueur.

```js
/* Un rejet peut arriver en objet sans message : String() rendait alors
   « [object Object] », affiche tel quel au joueur. On le neutralise. */
let brut=String((e&&(e.message||e))||'');
if(brut==='[object Object]'){
  try{ brut=JSON.stringify(e)||''; }catch(x){ brut=''; }
  if(brut==='{}') brut='';
}
```

Bénéfice : `{code:4001}` est maintenant reconnu comme un refus au lieu de
tomber dans le générique.

```
ok  message clair pour refus Solflare : "signature refusée dans le wallet"
ok  message clair pour code 4001 Backpack : "signature refusée dans le wallet"
ok  message clair pour transaction dupliquee : "transaction déjà envoyée, patiente un instant"
ok  rejet en objet vide : "le wallet a refusé sans préciser la raison"
ok  plus de « [object Object] » sous les yeux du joueur
```

---

## Ton point 3 — appliqué aussi

Tu avais raison : rien ne rafraîchissait le bouton pendant l'envoi, c'est ce
qui rendait le blocage invisible. Trois états maintenant :

```js
if(CHAINE.enCours){
  b.disabled=true; b.style.opacity=0.55;
  b.textContent = T('SIGNATURE EN COURS…');
  clearTimeout(_tickLot); _tickLot=setTimeout(majSeekerTask, 700);
} else {
  /* delai anti-saturation, ou disponible */
}
```

Avec `majSeekerTask()` appelé avant **et** après l'envoi, succès ou échec.

---

## Tes points 1, 2 et 4

1. **`payerEnSKR` et `donnerSOL`** : les deux passent par `signerEtEnvoyer`,
   ils héritent donc des bornes de temps et de `diffuser()`. Leur verrou est
   posé avant tout `await`, avec libération explicite sur les sorties
   anticipées (`chargerWeb3` et `chargerSPL` échouent hors du `try`). Le code
   complet est dans `audit/3-solana.js`, maintenant à jour.

2. **`CHAINE`** : voir BUG 3, tout est dans `audit/2-donnees.js`.

4. **Mode démo** : dans `audit/4-moteur.js`. Deux garde-fous — `save()` refuse
   d'écrire tant que `_demoActive` est vrai, et `endGame` restaure un instantané
   pris au lancement. C'est un vrai bug qui a coûté cher : trois niveaux joués
   en démo débloquaient toute la campagne.

---

## Ce que ton audit a coûté et rapporté

| Ton signalement | Verdict |
|---|---|
| BUG 1 — wallet muet | **Réel, bloquant.** Corrigé + test dédié |
| BUG 2 — `diffuser` mort | Faux positif (`audit/` v4.2) |
| BUG 3 — `rpcIndex` | Faux positif (déclaré) |
| BUG 4 — mémo non unique | **Réel.** Corrigé, et ton correctif renforcé |
| BUG 5 — substitution wallet | **Réel.** Corrigé tel quel |
| BUG 6 — trous `causeLisible` | **Réel.** Corrigé + `[object Object]` |
| Point 3 — bouton figé | **Réel.** Corrigé |
| `audit/` périmé | **Réel.** Script de régénération créé |

Deux faux positifs sur six, tous deux imputables au dossier périmé que tu avais
toi-même identifié comme suspect. Le reste a tenu.

---

## État

```
$ cd tests && ./run.sh
TOUT PASSE  (118 executions)
```

38 scénarios × 3 builds + 4 suites jsdom. Nouveau scénario : `wallet_sc.js` —
wallet muet, unicité des mémos, substitution de wallet, messages d'erreur.

Les cinq livrables sont régénérés, `audit/` est en v4.4.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

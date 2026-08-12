# Journal des modifications — à reporter sur GitHub

*Arrêté au 12 août 2026, 21 h 30 (Europe/Paris).*

---

## Ton dépôt GitHub n'est pas cassé — il est en retard

Le dossier de travail n'est pas un dépôt Git : les fichiers ont été déposés à la
main sur GitHub. Rien n'est corrompu, il manque simplement les modifications
faites depuis. **Remplace les fichiers listés ci-dessous, c'est tout.**

### Fichiers à remplacer sur GitHub

| Fichier | Pourquoi |
|---|---|
| `game/index_v37.html` | source de vérité — toutes les corrections sont dedans |
| `game/seeker-strike-MOBILE.html` | build autonome régénéré |
| `game/seeker-strike-NOAH.html` | build Noah régénéré |
| `noah-build/index.html` | build de déploiement régénéré |
| `noah-build/reecrire_chemins.py` | **nouveau** — automatise la réécriture des chemins |
| `tests/run.sh` | intègre les 2 nouveaux scénarios |
| `tests/demo3_sc.js` | **nouveau** — isolation de la démo, premier geste |
| `tests/rpc_sc.js` | **nouveau** — saturation RPC, cache, reprise |
| `docs/BRIEF-NOAH.md` | mis à jour v4.3 |
| `docs/BRIEF-KIMI-K3.md` | **nouveau** |
| `docs/JOURNAL-MODIFS.md` | **nouveau** — ce fichier |

Le dossier `public/assets/` de `noah-build` n'a pas changé : inutile de le
re-téléverser (104 images + 8 MP3, c'est le plus lourd).

### Si tu veux passer en vrai Git

```bash
cd "HACKATHON-NOAHAI-NITRO-01"
git init
printf '_backup/\noutputs/\n.DS_Store\nnode_modules/\n*.zip\n' > .gitignore
git add -A && git commit -m "Seeker Strike v4.3 — état hackathon"
git remote add origin <URL-de-ton-repo>
git push -u origin main --force
```

`--force` écrase l'historique du dépôt distant par ton état local. C'est ce que
tu veux ici : l'état local fait autorité.

**Attention à la taille.** GitHub refuse les fichiers de plus de 100 Mo et
prévient au-delà de 50 Mo. `seeker-strike-MOBILE.html` fait 10,6 Mo : ça passe,
mais chaque nouvelle version alourdit l'historique. Le `.gitignore` ci-dessus
exclut déjà `_backup/` et les zips.

---

## Ce qui a changé depuis le dernier push

### Bloc 1 — Munitions et équilibrage

Les munitions Spread faisaient **3,29× le DPS** des autres : le jeu n'avait plus
d'intérêt. Les projectiles latéraux passent de 0,9 / 0,75 à **0,22 / 0,14** de
dégâts, dégâts de base 0,85 → 0,92, cadence 0,9 → 0,88.

Résultat : Spread devient le meilleur choix en nuée (1,39 DPS) et le pire en
cible unique (0,81). Un vrai arbitrage au lieu d'un choix évident.

### Bloc 2 — Traductions

Les 12 clés de lore anglaises avaient été écrites avec des apostrophes
typographiques (`’`) alors que la source utilise des apostrophes droites (`'`) :
elles ne correspondaient à rien, le lore inter-niveaux restait en français même
en anglais. Les clés sont maintenant **générées depuis les chaînes réelles**.

Un balayage exhaustif vérifie 666 entrées : plus aucun texte français résiduel
en mode anglais.

### Bloc 3 — Défilement mort partout (critique)

```css
/* AVANT — cassé */
.screen { height:100dvh; min-height:100vh; overflow-y:auto }
/* APRÈS */
.screen { height:100vh; height:100dvh; max-height:100dvh;
          overflow-y:auto; -webkit-overflow-scrolling:touch }
```

Sur mobile `100vh` est **plus grand** que `100dvh` (la barre d'URL est comptée).
L'élément devenait plus haut que la fenêtre, `overflow` ne se déclenchait donc
jamais : plus aucun défilement, sur aucun écran.

### Bloc 4 — Faux positif de mode paysage

Fermer la console DevTools déclenchait le voile « joue en portrait », impossible
à faire disparaître. La détection devient :

```js
const HAUTEUR_JOUABLE = 560;
function estPaysage(){
  const l=window.innerWidth||0, h=window.innerHeight||0;
  return l > h * 1.15 && h <= HAUTEUR_JOUABLE;
}
```

L'ancienne version testait « large ET tactile », ce qui aurait bloqué
définitivement tout portable à écran tactile.

### Bloc 5 — Sortie de démo, son et vibration

Trois défauts liés, visibles dans la console Netlify :

1. `arreterDemo()` **remettait le splash par-dessus tout** (`z-index:500`) :
   l'écran paraissait figé et non défilable. Il masque désormais le splash et
   rend la main sur l'accueil.
2. La démo ne s'arrêtait que sur certains gestes. Elle écoute maintenant
   `touchstart`, `mousedown`, `keydown`, `wheel` et `pointerdown`.
3. Musique et vibration étaient déclenchées **avant tout geste utilisateur** :
   le navigateur les bloque et journalise un avertissement à chaque appel. Un
   verrou `_gesteFait` met la musique en attente et rend `haptique()` silencieux
   jusqu'au premier contact. La console est propre.

La démo continue de n'écrire **aucune** donnée sur le disque — c'est ce qui avait
provoqué le bug bloquant où trois niveaux joués débloquaient toute la campagne.

### Bloc 6 — Saturation du RPC devnet (erreur 429)

Symptôme observé sur Seeker après 150 TX :
`TX échouée • failed to get recent blockhash: Error: 429 : {"jsonrpc":"2.0"…}`

Le RPC public `api.devnet.solana.com` limite chaque IP à ~100 appels / 10 s.

| Correctif | Détail |
|---|---|
| `blockhashFrais()` | blockhash mis en cache 40 s — 5 envois = **1 appel RPC au lieu de 5** |
| `RPC_DEVNET` | pool de 2 points d'entrée, bascule automatique sur Ankr |
| Reprise | 4 tentatives, attente 0,8 s → 1,6 s → 2,4 s ; une erreur non-429 remonte tout de suite |
| `diffuser()` | même reprise à l'envoi de la transaction |
| `DELAI_LOT = 20 s` | délai entre deux lots, bouton en compte à rebours `PATIENTE 14s` |
| `causeLisible()` | plus jamais de dump JSON : « réseau devnet saturé, patiente quelques secondes », traduit en anglais |

Quatre messages d'erreur sont désormais lisibles et traduits : réseau saturé,
transaction expirée, solde insuffisant, signature refusée.

### Bloc 7 — Deux bugs sortis par l'audit Noah

**Double transaction (critique).** Dans les trois chemins d'envoi, le verrou
`CHAINE.enCours` était posé *après* `await chargerWeb3()`. Deux appuis
rapprochés — un double-tap sur mobile — franchissaient tous les deux le test
avant que le verrou ne tombe : deux transactions pour un seul geste. Le verrou
se pose maintenant avant tout `await`, dans `envoyerTxSeeker`, `payerEnSKR` et
`donnerSOL`.

**Blockhash mort conservé.** Défaut de mon propre correctif anti-429 : après un
échec sur `Blockhash not found`, le cache de 40 s gardait la valeur périmée et
toutes les relances échouaient à l'identique. `invaliderBlockhash()` purge
désormais le cache sur cette erreur.

Trois suites préexistantes ont cassé au passage — elles étaient vertes pour de
mauvaises raisons : `skr_sc` et `don_sc` n'exerçaient jamais le transfert SPL
(chemin SKR fermé sur devnet sans `mintTest`), `p191_sc` attendait un message
brut désormais traduit. Corrigées.

Détail complet et code : `docs/REPONSE-NOAH.md`.

### Bloc 8 — Pool RPC refait (v4.4)

Le RPC public renvoyait un 429 **dès le premier appel** depuis une IP mobile :
le quota est partagé entre tous les abonnés de l'opérateur. Et Ankr, le
secours, renvoyait `Expected the value to satisfy a union of type|type` — son
API est passée payante, la réponse n'est plus lisible par web3.js.

Nouveau pool : **Helius** (clé du projet) en principal, puis
`api.devnet.solana.com`, Alchemy demo, OnFinality. Ankr retiré.

`estRpcCasse()` remplace `estSature()` dans les boucles de reprise. La
distinction compte : un RPC **saturé** est temporaire, on y revient ; un RPC
**cassé** (401, 403, 5xx, réponse illisible) est écarté pour la session.
Sans ça, la rotation revenait indéfiniment sur un endpoint mort.

Quand plus rien ne répond : `réseau devnet indisponible, réessaie dans
1 minute`, abandon en 300 ms, pas de boucle.

**Panneau « Serveur Solana » dans les réglages** : endpoint configurable,
bouton de test qui mesure la latence réelle, persisté dans la save. Permet de
changer de RPC pendant une démo sans redéployer.

### Bloc 9 — Deux correctifs de rendu

**404 audio.** Le build autonome embarque les 8 musiques mais tentait d'abord
le fichier externe, absent sur Netlify : un 404 et un aller-retour réseau par
piste. Une piste en mémoire est maintenant jouée directement.

**Projectile signature.** Le sprite est dessiné couché, pointe vers la droite,
dans un carré de 128 px. Il était affiché tel quel dans un carré de 22 px :
projectile à l'horizontale et écrasé. Redressé d'un quart de tour, proportions
respectées (30×13).

Surtout, ce sprite **écrasait la signature de tir des 14 vaisseaux** dès le
palier 45 débloqué : tout le monde tirait la même chose. Il est maintenant
teinté à la couleur du vaisseau (mis en cache), et neutralisé pendant la démo —
qui est justement la vitrine du hangar. Chaque séquence du trailer montre en
plus une munition différente.

### Bloc 10 — Second audit Noah (v4.4)

Quatre bugs réels sur six signalés. Les deux faux positifs venaient d'`audit/`
resté en v4.2 — il avait été découpé à la main une fois, jamais régénéré.

**Wallet muet (bloquant).** Aucune borne de temps sur les appels au wallet.
Fenêtre fermée par le système, application tuée en arrière-plan, WebView
suspendue : la promesse ne se résout ni ne rejette, le `finally` ne s'exécute
jamais, le verrou reste posé et le bouton grisé à vie. `avecDelai()` borne
maintenant les quatre canaux de signature (90 s) et la reconnexion (30 s).

**Mémo non unique.** La branche générique (quêtes) n'avait aucun marqueur :
avec le blockhash en cache 40 s, deux fois la même action produisaient une
transaction identique, donc la même signature, rejetée en « already processed ».
Le correctif à l'horloge seule ne suffisait pas — deux appels dans la même
milliseconde donnaient la même valeur. `marqueurUnique()` combine l'heure et un
compteur. Détecté par le test, en échec intermittent sur deux builds.

**Substitution de wallet.** Un joueur Solflare dont l'extension tarde à
s'injecter se voyait servir Phantom, et son adresse écrasée sans un mot. On ne
cherche plus ailleurs quand un wallet a été explicitement choisi.

**Messages d'erreur.** Ajout de `timeout:`, du code `4001` (Backpack) et
d'`already been processed`. Et `String({})` ne rend pas une chaîne vide mais
`[object Object]`, qui s'affichait tel quel au joueur.

**Bouton figé.** Rien ne rafraîchissait le bouton pendant l'envoi : c'est ce
qui rendait le blocage invisible. Trois états désormais.

**`game/build_audit.py`.** Régénère `audit/` par ancres textuelles, retire les
base64, inscrit la version dans chaque en-tête. Trois libellés de version se
contredisaient dans l'interface (4.0 / 4.2 / 4.2), tous alignés sur v4.4.

Détail complet : `docs/REPONSE-NOAH-2.md`.

### Bloc 11 — Budget de temps du blockhash (troisième audit Noah)

`DELAI_SIGNATURE` était à 90 s, alors qu'un blockhash Solana vit 60 à 80 s. Le
cache de 40 s aggravait le cas : 40 + 50 s de signature = transaction diffusée
avec un blockhash de 90 s, rejetée en « block height exceeded » alors que le
joueur avait signé correctement.

Deux mesures complémentaires. `DELAI_SIGNATURE` passe à **45 s**. Et surtout,
`blockhashFrais(marge)` prend un argument : le cache ne sert un blockhash que
s'il survivra à l'attente de signature. Fenêtre réellement utilisable quand une
signature est attendue : 15 s au lieu de 40 — assez pour absorber un double
appui, jamais assez pour livrer un blockhash condamné.

**Transaction fantôme.** Sur `signAndSendTransaction`, `request` et le Seed
Vault, c'est le wallet qui diffuse : un délai dépassé n'annule pas sa demande.
S'il répond après coup, la transaction part quand même et une relance en crée
une seconde. Vérifier l'historique on-chain avant relance serait trop lourd
à J-1 ; le message renvoie donc vers le journal plutôt que d'inviter à
relancer à l'aveugle. Le drapeau `CHAINE.canalAuto` distingue les deux cas.

Détail : `docs/REPONSE-NOAH-3.md`.

---

## État des tests

`tests/run.sh` : **118 exécutions** — 34 scénarios × 3 builds + 4 suites jsdom.

Vérifié ce soir, tout au vert :

| Suite | Objet |
|---|---|
| `rpc_sc` | 27 vérifications : pool, détection 429, bascule, cache, reprise, délai, messages |
| `demo3_sc` | isolation de la démo, sortie propre, premier geste |
| `demo2_sc` | la démo n'écrit rien sur le disque |
| `muni_sc` | équilibrage des munitions |
| `paysage_sc` | détection d'orientation |
| `lore_sc`, `balayage_sc`, `i18n_full` | couverture FR/EN |
| `audit_sc` | audit statique (1 avertissement connu, non bloquant) |
| `audit_dom`, `orient_test`, `lang_test`, `term_pos` | suites jsdom, vrai DOM |

Les six livrables portent bien tous les correctifs (vérification par comptage de
marqueurs : `RPC_DEVNET`, `blockhashFrais`, `DELAI_LOT`, `causeLisible`,
`_gesteFait`, `max-height:100dvh`).

---

## Reste à faire avant la deadline

1. **Plan de test physique** sur le Seeker — 13 août au matin.
   Checklist dans `docs/BRIEF-NOAH.md`.
2. Pousser cet état sur GitHub.
3. Optionnel : RPC dédié en tête de `RPC_DEVNET` pour la démo devant jury.

---

*Seeker Strike v4.3 · AzumiZeus · NoahAI Nitro 01*

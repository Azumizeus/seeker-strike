# Passation complète — Seeker Strike v4.3

*Document destiné à un assistant qui reprend le code (Kimi K3 ou autre).*
*État arrêté au 12 août 2026, 21 h 30 (Europe/Paris). Deadline : 13 août, 18 h.*

Lis ce document en entier avant de proposer quoi que ce soit. Il contient les
raisons derrière des choix qui paraissent bizarres de l'extérieur, et la liste
des erreurs déjà commises — dont plusieurs ont coûté des heures.

---

## 1. Le projet en cinq lignes

**Seeker Strike — Genesis Protocol** : shoot'em up vertical HTML5, pensé pour le
téléphone Solana Seeker, présenté au hackathon **NoahAI Nitro 01**.
Auteur : **AzumiZeus**, francophone, développeur débutant. Il décide, tu
exécutes et tu expliques.

Le jeu se joue **entièrement sans wallet**. La couche Solana est une progression
parallèle — jamais une condition d'accès, jamais un péage. C'est un choix
structurant : ne propose rien qui le remette en cause.

---

## 2. Architecture — et pourquoi elle est comme ça

**Un seul fichier : `game/index_v37.html`, ~8 200 lignes, 2,86 Mo.**
HTML + CSS + JavaScript inline. Canvas 2D. Tailwind par CDN. Police Orbitron.

- Aucun build, aucun npm, aucun bundler, aucun framework.
- Ouvrir le fichier dans un navigateur = le jeu tourne.
- Zéro dépendance installée = zéro surface d'attaque de chaîne npm.

Ce n'est pas de la naïveté de débutant, c'est un choix assumé et défendu.
**Ne propose pas de découper en modules, ni React, ni Vite, ni TypeScript.**
Cette suggestion a déjà été faite plusieurs fois par d'autres assistants ; elle
est hors scope et fait perdre du temps.

### Les deux objets d'état

| Objet | Portée | Persistance |
|---|---|---|
| `S` | profil du joueur : progression, monnaie, vaisseaux, préférences, signatures | `localStorage`, clé **`ss_v35`** |
| `G` | partie en cours : ennemis, projectiles, score, boosts | **jamais** persisté |

Un flag annexe `ss35_first` marque le bonus de première connexion wallet.
La clé `ss_v2` traîne encore dans le code — **la clé active est `ss_v35`**.

`S.prefs` est fusionné au `load()` pour rester compatible avec les anciennes
sauvegardes. Toute nouvelle préférence doit passer par cette fusion.

### Constantes structurantes

```js
const PAS_LOGIQUE = 1000/60;      // cadence verrouillée : l'écran Seeker est en 120 Hz
const PLANCHER_VOL = 152;         // bande basse réservée aux boutons de boost
const HAUTEUR_JOUABLE = 560;      // seuil du voile de rotation
const RARETE_DIFFICULTE = { normal:1.00, difficile:0.80, extreme:0.65 };
const BOOSTS_REGLAGE = {          // 9 / 6 / 3 activations maximum
  normal:    { base:1, recharges:2, seuil:40 },
  difficile: { base:1, recharges:1, seuil:55 },
  extreme:   { base:1, recharges:0, seuil:0  }
};
const RPC_DEVNET = ['https://api.devnet.solana.com','https://rpc.ankr.com/solana_devnet'];
const DELAI_LOT = 20000;          // délai minimal entre deux lots de 15 TX
const TRESORERIE = { adresse:'AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH', frais:0.001 };
const PALIERS_TX = [ /* 10 paliers : 5,15,30,45,60,75,90,100,120,150 */ ];
```

Sans `PAS_LOGIQUE`, le jeu tournait littéralement deux fois trop vite sur
Seeker. Ne touche pas à cette régulation.

---

## 3. Les cinq livrables

| Fichier | Taille | Usage |
|---|---|---|
| `game/index_v37.html` | 2,86 Mo | **source de vérité — toute modification se fait ici** |
| `game/seeker-strike-MOBILE.html` | 10,6 Mo | autonome : images ET audio embarqués, marche hors ligne |
| `game/seeker-strike-NOAH.html` | 7,3 Mo | images embarquées, audio externe |
| `noah-build/index.html` + `public/assets/` | 2,86 Mo + assets | déploiement statique |
| `outputs/netlify-drop/` | — | ce qui part sur Netlify |

Générés par `game/build_autonome.py` et `game/build_noah.py`, puis
`noah-build/reecrire_chemins.py` (102 réécritures, 0 restant — **vérifie le
compteur**, une interruption a déjà laissé 101 images cassées sans qu'un test
le voie).

**Ne modifie jamais un livrable à la main.** Corrige la source, régénère.

---

## 4. Méthode de modification — à suivre à la lettre

Le fichier fait 2,86 Mo : impossible à réécrire en entier de façon fiable.
La méthode qui marche :

```python
# -*- coding: utf-8 -*-
import io, sys
F = 'game/index_v37.html'
s = io.open(F, encoding='utf-8').read()

def rep(a, b, label):
    global s
    n = s.count(a)
    if n != 1:                       # exactement une occurrence, sinon on s'arrête
        sys.exit('ECHEC %s : %d occurrences' % (label, n))
    s = s.replace(a, b)
    io.open(F, 'w', encoding='utf-8').write(s)   # écriture APRÈS CHAQUE remplacement
    print('  ok  ' + label)
```

Deux règles, chacune payée par un incident :

1. **Assertion d'unicité.** Un `replace` silencieux sur 3 occurrences a déjà
   corrompu des zones sans rapport.
2. **Écriture après chaque remplacement.** Deux scripts ont planté au milieu et
   perdu des correctifs déjà appliqués — sans trace.

Puis, systématiquement :

```bash
python3 -c "
import io
s=io.open('game/index_v37.html',encoding='utf-8').read()
io.open('/tmp/g.js','w',encoding='utf-8').write(s[s.rfind('<script>')+8:s.rfind('</script>')])"
node --check /tmp/g.js
```

### Conventions de code

- **Commentaires en français**, et ils expliquent le *pourquoi*, pas le *quoi*.
  Ne les « nettoie » pas : c'est la documentation du projet.
- Noms de fonctions et variables en français (`blockhashFrais`, `causeLisible`,
  `arreterDemo`, `estPaysage`). Reste cohérent.
- Tout texte affiché passe par `T('…')`. `T` renvoie la chaîne d'origine si
  aucune traduction n'existe — donc un oubli est invisible à l'exécution et ne
  se voit qu'en jouant en anglais. **Ajoute la clé EN dans le même patch.**

---

## 5. Les tests — 106 exécutions

```bash
cd tests && ./run.sh          # ~25 min, sortie attendue : TOUT PASSE
```

34 scénarios rejoués sur 3 harnais headless (`harness_base`, `harness_auto`,
`harness_noah` — un par build), plus 4 suites jsdom qui testent le vrai DOM
(`audit_dom`, `orient_test`, `lang_test`, `term_pos`).

Les harnais bouchonnent DOM, Canvas, Audio et `localStorage`, avec une
**horloge simulée** (`avancerTemps`) et un **générateur pseudo-aléatoire à
graine** (`fixerHasard`) : les parties simulées sont reproductibles.

Écrire un scénario : un fichier `xxx_sc.js` dans `tests/`, lancé via
`SCENARIO="$PWD/xxx_sc.js" node harness_base.js`. Il sort des lignes
`RES ok …` / `RES KO …` et termine par `RES TOUS LES TESTS PASSENT`.
Ajoute-le à la liste `SCENARIOS` de `run.sh`.

**Les suites jsdom sont lentes** (2 à 4 min chacune : jsdom parse 2,86 Mo).
Lance-les avec `setsid nohup` si ton environnement coupe les processus longs.

### Ce que les tests ont réellement rattrapé

- la démo qui écrivait dans la progression et débloquait toute la campagne ;
- une injection HTML dans le journal on-chain (`x.action` / `x.sig` en innerHTML) ;
- 7 icônes déclarées avec un chemin de fichier, donc absentes du build autonome ;
- des munitions à 3,29× le DPS des autres ;
- 12 clés de lore anglaises écrites avec des apostrophes typographiques : elles
  ne correspondaient à aucune chaîne source, le jeu restait en français.

**Méfie-toi de tes propres assertions.** Plusieurs tests passaient au vert en
vérifiant la mauvaise chose : un test créditait tous les ennemis d'un tir dès
qu'un projectile apparaissait à l'écran ; en isolation stricte, un seul type
tirait réellement. Isole avant de conclure.

---

## 6. Couche Solana — ce qui est réel, ce qui ne l'est pas

**Tout est réel** : vraies transactions devnet, vraies signatures, vérifiables
sur Solscan. Rien n'est simulé. (Le `CLAUDE.md` du dépôt dit encore que le
wallet est mock — cette mention est **périmée**, elle date de v3.5.)

| Élément | Détail |
|---|---|
| Canaux de signature | Mobile Wallet Adapter (Seed Vault), Phantom, Backpack |
| Programme | Memo `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` |
| Seeker Task | 15 mémos + pourboire trésorerie de 0,001 SOL, **une seule transaction de 791 octets, une seule signature**, relançable |
| Achats de vaisseaux | transferts SOL natifs, ou SPL pour le SKR |
| Paliers | 10 paliers de 5 à 150 TX — récompenses **cosmétiques uniquement**, aucune puissance |

### Le motif « signer sans envoyer »

On demande `signTransaction` au wallet, **puis on diffuse soi-même** sur le RPC
devnet. `signAndSendTransaction` diffuse sur le réseau sélectionné dans le
wallet — mainnet par défaut — où notre blockhash devnet est inconnu : échec
muet, impossible à diagnostiquer côté joueur. Ne reviens pas en arrière.

### Normalisation base58

MWA renvoie l'adresse en **base64**. Passée telle quelle à `PublicKey`, elle
produit `Non-base58 character`. `normaliserAdresse()` gère six formes d'entrée
et répare au passage les sauvegardes anciennes.

```js
const RE_SIGNATURE = /^[1-9A-HJ-NP-Za-km-z]{64,96}$/;
const RE_BASE58    = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
```

Un lien Solscan n'est construit que si la signature passe `RE_SIGNATURE`.

### Résistance à la saturation (v4.3)

Le RPC public limite à ~100 appels / 10 s par IP. En spammant les envois, le
joueur recevait `Error: 429 : {"jsonrpc":"2.0"…}` brut.

- `blockhashFrais()` : blockhash mis en cache 40 s → 5 envois = 1 appel RPC.
- Reprise sur 429 : attente 0,8 s → 1,6 s → 2,4 s, bascule sur le RPC de
  secours, 4 tentatives. Une erreur qui n'est **pas** un 429 remonte
  immédiatement, sans réessai inutile.
- `DELAI_LOT = 20 s` entre deux lots, avec compte à rebours sur le bouton.
- `causeLisible()` traduit l'erreur technique en phrase claire, FR et EN.

### Le seul point ouvert

`SKR.mintTest` est vide. Le mint SKR officiel n'existe pas sur devnet.
**Décision d'AzumiZeus : on démontre en SOL**, l'interface annonce que le
chemin SKR attend le mainnet. C'est câblé, ne le remets pas en cause.

---

## 7. Économie

**GC (Genesis Credits)** : monnaie de jeu, gagnée en jouant uniquement. Ne
s'achète pas, n'existe pas on-chain. 900 GC au premier lancement. Paie la
boutique, les munitions, les consommables — **tout le gameplay**.

**SOL / SKR** : les tokens du joueur. Servent uniquement à acheter des
vaisseaux. 6 vaisseaux payants, 5 gagnés en jeu. Environ 1 SOL = 25 000 SKR.

| Vaisseau | SOL | SKR |
|---|---|---|
| Warden | 0,12 | 3 000 |
| Comet | 0,15 | 3 800 |
| Raptor | 0,22 | 5 500 |
| Nebula | 0,30 | 7 500 |
| King | 0,55 | 14 000 |
| Sovereign | 0,85 | 21 000 |

Principe défendu par l'auteur : **le gameplay reste 100 % GC**. Si la boutique
devenait payante, les joueurs penseraient que le projet n'existe que pour
prendre de l'argent. Ne propose pas de monétiser le gameplay.

---

## 8. Pièges connus — ne les redécouvre pas

| Piège | Ce qui se passait |
|---|---|
| `.screen { height:100dvh; min-height:100vh }` | sur mobile `100vh > 100dvh` : l'élément dépassait la fenêtre, `overflow` ne se déclenchait jamais, **plus aucun défilement nulle part** |
| `estPaysage()` défini comme « large ET tactile » | bloquait définitivement les portables à écran tactile |
| Fermeture de la console DevTools | faux positif de paysage — d'où le seuil `HAUTEUR_JOUABLE` |
| Sortie de démo forçant le splash | le splash couvrait tout en `z-index:500`, l'écran semblait figé |
| `navigator.vibrate` / `AudioContext` avant tout geste | bloqués et journalisés par le navigateur à chaque appel — verrou `_gesteFait` |
| `requestFullscreen` retenté à chaque toucher | boucle de refus infinie dans la console |
| `aria-hidden` sur des conteneurs interactifs | terminal, choix de langue et voile de rotation inaccessibles |
| `initGame('mode')` au lieu d'un objet mode | `mode.reward` indéfini, crédits à `NaN`, audit dynamique tournant à vide |
| Voile de rotation en `z-index:400` | passait sous le sélecteur de wallet à 999 |

---

## 9. Comment travailler avec AzumiZeus

- **Réponds en français**, tutoiement, ton direct. Pas de « Bien sûr, voici ».
- **Concis.** Si ça tient en trois phrases, ne fais pas trois paragraphes.
  Liste les changements en 3 lignes maximum.
- **Il est débutant** : explique le pourquoi sans condescendance, et ne masque
  jamais un échec derrière du jargon.
- **Zéro régression.** Casser un système existant est bloquant, point.
- Quand il demande ton avis, donne-le franchement et tranche.
- Quand tu ne sais pas, **lis le code** — ne devine pas. Une supposition sur
  l'échec du Seed Vault (« c'est attendu hors contexte Seeker natif ») était
  fausse : il testait sur un vrai Seeker. Il y avait trois vrais bugs derrière.

---

## 10. Ce qui reste à faire

1. **Plan de test physique** sur un vrai Seeker — prévu le 13 août au matin.
   Liste complète dans `docs/BRIEF-NOAH.md`, section finale.
2. Pousser l'état courant sur GitHub (voir `docs/JOURNAL-MODIFS.md`).
3. Décider si un RPC dédié (Helius / QuickNode, offre gratuite) est renseigné
   en tête de `RPC_DEVNET` pour la démo devant jury.

---

## 11. Où lire quoi

| Fichier | Contenu |
|---|---|
| `docs/DOSSIER-TECHNIQUE.md` | architecture, Solana, économie, rapport d'audit complet |
| `docs/BRIEF-NOAH.md` | brief de déploiement, CSP, régénération des builds |
| `docs/JOURNAL-MODIFS.md` | tout ce qui a changé depuis le dernier push GitHub |
| `docs/PLAN-TEST-FINAL.md` | scénarios de test manuel |
| `tests/LISEZ-MOI.md` | couverture de chaque suite |
| `audit/` | copie découpée, 548 Ko — `audit/3-solana.js` pour un audit sécurité |

---

*Seeker Strike v4.3 · AzumiZeus · NoahAI Nitro 01 · 12 août 2026*

# SUIVI — tout ce qui ne va pas

Registre unique de Seeker Strike. **Rien ne se corrige de mémoire : tout passe par ici.**

*Mis à jour : 13 août 2026, soir · Source de vérité : `game/index_v37.html`*

## Comment s'en servir

Chaque entrée a un **ID** (`TXT-1`, `RND-3`…). On peut s'y référer directement :
« fais SON-2 », « FEEL-1 est fini ». Les ID ne sont jamais réutilisés, même après
correction — on garde la trace.

**Gravité** — 🔴 bloquant ou trompe le joueur · 🟠 dégrade l'expérience ·
🟡 confort · ⚪ interne, invisible pour le joueur

**Statut** — `à faire` · `en cours` · `fait` · `à vérifier` · `abandonné`

> ⚠️ **Après chaque correction, dans CET ordre :**
> `cd game && python3 build_autonome.py` → `cd tests && bash run.sh` → `bash publier.sh "message"`.
> Construire **avant** de tester : la suite valide les 3 builds, et sans reconstruction
> deux d'entre eux sont encore les anciennes copies. `publier.sh` refuse de publier
> si le build est plus vieux que la source — c'est voulu.
> Sans le build, tu corriges la source et tu publies l'ancienne version.
> Depuis le 13/08, `publier.sh` met à jour **GitHub Pages ET Netlify** d'un coup.

---

# ✅ FAIT LE 13 AOÛT

| ID | Quoi | Commit |
|---|---|---|
| `TXT-1` | Briefing OBJECTIF : « 13 secteurs, 3 boucles, 4 boss » → « 22 secteurs, 2 campagnes » + progression Vortex → Corruption → Nexus → CHAOS PROTOCOL | `a859227` |
| `TXT-2` | Commentaire périmé `13 noeuds` → `22 noeuds` (ligne 4257) | `a859227` |
| `TXT-4` | **10 boss, pas 7.** Le FR mentait, l'EN avait raison. Accueil (644) + clé i18n (6841) | `69ba85b` |
| `TXT-5` | **Toutes les promesses d'airdrop retirées.** Fiche SEEKER TASK (FR + EN), tuto, toast de quête. `grep -ci airdrop` = 0 | `69ba85b` |
| `TXT-6` | Badge « ÉLIGIBLE » → **« Badge SEEKER »** + traduction EN réalignée | `3daf028` |
| `PUB-2` | **Netlify connecté au dépôt GitHub** (branche `main`, build vide, publish `.`). Il se met à jour tout seul maintenant | — |
| `PRJ-3a` | `.gitignore` complété : `*.avant-*`, `.DS_Store`, `revue-assets test.csv` | `29f2e00` |
| `TXT-7` | **10 boss** dans `SOUMISSION.md` (×3), `KIT-COMM-X.md` (×2), `TESTER-SUR-SEEKER.md`. Les 12 tweets revérifiés < 280 car. | `ac50fac` |
| `TXT-8` | Badge `air-badge` : « ✅ ÉLIGIBLE » → **« ✅ VÉRIFIÉ »** + i18n `"✅ VERIFIED"`. Dernier reste visible du discours airdrop. | `ac50fac` |
| `PRJ-5` | **`publier.sh` ne fait plus `git add -A`** → `git add index.html` + `git add -u`. Plus de fichier de travail embarqué par accident. | `ac50fac` |
| `RND-2` | **Une seule teinte de danger** : les 3 tirs ennemis `#fb923c` → `#fb7185`, déjà la couleur par défaut des tirs ennemis. | à pousser |
| `SOL-1` | **`lireSoldeSOL()` ajoutée** (l. 3690) + branchée à la connexion wallet (l. 4039). `getBalance` n'existait nulle part. | à pousser |
| `TXT-9` | Toast du mode dev : « 12 vaisseaux » → **14** (`SHIPS` en contient 14). | à pousser |
| `SEC-1` | **Mode développeur retiré du build public.** Sentinelles `DEV-DEBUT`/`DEV-FIN` dans la source, `build_autonome.py` remplace le bloc par des fonctions vides et supprime le `onclick`. Vérifié : `S.dev=true`, `_devTaps>=5` et le `onclick` = **0 occurrence** dans le build. | à pousser |
| `SOL-4` | **Rafraîchissement des soldes** : `rafraichirSoldes()` + bouton « ↻ ACTUALISER LES SOLDES » (visible seulement wallet connecté) + relecture auto après chaque tx et après le lot Seeker Task. Anti-rebond 3 s. | à pousser |

**Vérification faite à chaque fois :** extraction du bloc script inline + `node --check`
→ syntaxe OK. La suite de 118 tests n'a pas pu tourner jusqu'au bout via le pont
(trop lente sur le dossier monté) — **à relancer en local**.

---

# A · CONTENU ET TEXTES

### `TXT-3` 🟡 Incohérence 5 jours / 6 jours — **à faire**

`docs/SOUMISSION.md` écrit *« Built solo in 6 days »*. Tu dis 5 partout ailleurs.
Choisis-en un et aligne tout : soumission, README, posts X, bio.

*(`TXT-7` fermé — voir le tableau du haut.)*

---

## ❌ FAUSSES PISTES — vérifié, à NE PAS toucher

| Où | Contenu | Pourquoi c'est juste |
|---|---|---|
| ligne **8466** | `{id:'camp12', d:'12 secteurs sécurisés', m:12}` | GENESIS = secteurs 1 à 12. Confirmé par `currentNode>=13`. **Corriger en 22 casserait le succès.** |
| ligne **7415** | `"12 secteurs sécurisés": "12 sectors secured"` | Traduction du succès ci-dessus. |
| — | `{id:'camp5', m:5}` | Palier intermédiaire. |
| ligne **7088** | `"✅ ÉLIGIBLE": "✅ ELIGIBLE"` | Entrée i18n **morte** — aucune source ne la produit. Inoffensive. |

**12 (GENESIS) + 10 (CHAOS) = 22.**

---

# B · RENDU VISUEL
*Détail complet dans `RENDU-VISUEL.md`*

| ID | Gravité | Quoi | Où | Statut |
|---|---|---|---|---|
| `RND-1` | 🟠 | **Fusion additive jamais utilisée.** `'lighter'` = 0 occurrence. Le plus gros écart de rendu. | 5942, 5911, 5825 | à faire |
| `RND-2` | 🔴 | ~~Tirs ennemis `#fb923c`~~ — **fait**. Bonus découvert : l'orange était aussi la couleur de tir du vaisseau **Comet** (l. 1655). Tes tirs et ceux qui te tuent partageaient une teinte. | 5498, 5508, 5511 | **fait** |
| `RND-3` | 🟠 | **`shadowBlur` dans les boucles** par projectile et par particule. Réglé en même temps que `RND-1`. | 5911, 5937, 5944 | à faire |
| `RND-4` | 🟠 | **Audit complet de la palette** — 22 couleurs vers 9 rampes. Devenu prioritaire : `RND-7` en dépend. Ancrer sur `#14f195` / `#9945ff`. | partout | **suivant** |
| `RND-7` | 🔴 | **L'ambre `#fbbf24` veut dire 5 choses sur le terrain** : ennemi poseur (5134), ennemis à prime (4961, 5176), 2 boss (1509, 1515), ramassable mitra (5213) et les tirs du vaisseau King (1657). « Fonce dessus » et « ça te tue » partagent une teinte. **Décision reportée à l'audit palette `RND-4`.** | plusieurs | bloqué par `RND-4` |
| `RND-5` | 🟡 | Profondeur du fond : plus loin = plus sombre et désaturé. | 5810 | à faire |
| `RND-6` | ⚪ | Bloom via canvas réduit + `ctx.filter`. **En dernier**, derrière une préférence. | — | à faire |

---

# C · GAME FEEL
*Détail complet dans `GAME-FEEL-PRIORITES.md`*

| ID | Gravité | Quoi | Où | Statut |
|---|---|---|---|---|
| `FEEL-1` | 🟠 | **Hitstop inexistant.** ⚠️ Jamais sur un simple coup — seulement sur la mort. | `loop()` 4862 | à faire |
| `FEEL-2` | 🟠 | **Le shake ne se déclenche jamais sur tes kills.** Ton arme ne pèse rien. | `kill()` 5769 | à faire |
| `FEEL-3` | 🟡 | **Décroissance du shake linéaire.** `g.shake*g.shake*0.02`. **Une ligne, meilleur ratio du projet.** | 5803 | à faire |
| `FEEL-4` | 🟡 | Impact = 2 particules, isotropes. → 5, directionnelles. | 4984 | à faire |
| `FEEL-5` | 🟡 | `kill()` n'appelle jamais `parts()` → explosion sans débris. | 5769 | à faire |
| `FEEL-6` | 🟡 | Pas de préférence `S.prefs.secousses` (accessibilité). | 1865, 5803 | à faire |

---

# D · SON

| ID | Gravité | Quoi | Où | Statut |
|---|---|---|---|---|
| `SON-1` | 🟠 | **`synth('hit')` à hauteur fixe** alors que `'shot'` varie déjà. Fatigue auditive en 20 s. | 1977 | à faire |
| `SON-2` | 🟠 | **Aucune limite de débit sur `sfx('hit')`.** 5 tirs = 5 ondes identiques → clic dur. | 1972, 4984 | à faire |

---

# E · SOLANA / WEB3

| ID | Gravité | Quoi | Statut |
|---|---|---|---|
| `SOL-1` | 🔴 | ~~Solde SOL devnet non affiché~~ — **cause** : `getBalance` n'était appelé **nulle part**. `S.sol` partait de 0 et n'était que décrémenté par les achats, jamais lu sur la chaîne. Corrigé. | **fait** |
| `SOL-5` | 🔴 | **L'achat de vaisseau en SOL ne faisait aucune transaction.** `unlockShip()` branche `sol` : `S.sol -= prix` puis déblocage. Or depuis `SOL-1`, `S.sol` est le solde réel du wallet, que `rafraichirSoldes()` relit dans la seconde — la soustraction était effacée et **les vaisseaux étaient gratuits**. Corrigé le 14/08 : `payerEnSOL()` (transfert natif vers la trésorerie + mémo), rien n'est accordé sans signature. Le shop n'était pas touché (tout en SKR). `skr_sc.js` vérifiait `S.sol-0.85`, c'est-à-dire le bug lui-même — réécrit pour vérifier la transaction. 118/118 verts. | **fait** · reste le test manuel sur devnet |
| `SOL-2` | 🟡 | Wrapper APK (WebView / Capacitor) pour le dApp Store. KYC, ~0,2 SOL, review 3-5 jours ouvrés. | à faire |
| `SOL-3` | ⚪ | Passage mainnet — voir `docs/PASSER-EN-MAINNET.md`. | plus tard |

## ✅ Vérifié — rien à faire

- **Mint SKR** `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3` : Owner Program = Token Program
  classique, Token Extensions = FALSE, decimals = 6. Ton `getAssociatedTokenAddress` et ton
  `createTransferCheckedInstruction` sont corrects. **`@solana/token-helpers` ne sert à rien ici.**
- **`ss_v2`** n'est plus dans le code. La note du `CLAUDE.md` est périmée (→ `PRJ-4`).

---

# F · PUBLICATION ET COMMUNICATION

| ID | Gravité | Quoi | Statut |
|---|---|---|---|
| `PUB-1` | 🟠 | Description GitHub : « Web3 **extraction shooter** » — faux, c'est un shoot'em up vertical. Réglage *About* sur github.com, pas un fichier. | **à vérifier** |
| `PUB-3` | 🟡 | `docs/SOUMISSION.md` : champs **Twitter** / **Telegram** encore *(à compléter)* → `@incDifuse`. | à faire |
| `PUB-4` | 🟡 | Les 2 threads X (EN + FR) — `KIT-COMM-X.md`. Vérifier le handle NoahAI + corriger « 7 bosses » (voir `TXT-7`). | à faire |
| `PUB-5` | 🟡 | Réserver le handle X du jeu (sans l'alimenter tout de suite). | à faire |
| `PUB-6` | 🟠 | **Déploiement Netlify du hackathon en accès privé** — message envoyé au support pour savoir si le jury y accède via NoahAI ou s'il faut le rendre public. | **en attente de réponse** |

## Adresses — les trois à jour depuis le 13/08 au soir

- Jeu : **https://azumizeus.github.io/seeker-strike/**
- Secours : **https://seeker-strike.netlify.app** (connecté au dépôt, auto-déploiement)
- Code : **https://github.com/Azumizeus/seeker-strike**
- *Le déploiement hackathon reste **figé volontairement** : c'est la photo de ta soumission.*

---

# G · HYGIÈNE DU PROJET

| ID | Gravité | Quoi | Statut |
|---|---|---|---|
| `PRJ-1` | 🟠 | **Le dossier finit par une espace** (`...NITRO-01 `). Casse git et les outils via le pont. Renommer, puis reconnecter le dossier. | à faire |
| `PRJ-2` | 🟡 | Trier les assets et sprites non utilisés (`_backup/`, `sources/`). Les classer, pas les jeter. | à faire |
| `PRJ-3b` | ⚪ | Restent `docs/_test.tmp` et `docs/_test.txt`. Doublon `.DS_Store` dans le `.gitignore`. | à faire |
| `PRJ-4` | 🟡 | **`CLAUDE.md` périmé** : disait « v3.5 », wallet mock, tâche du 13 août, note `ss_v2` fausse. Réécrit le 14/08/2026, chiffres relus dans le code. Ancienne version dans `docs/historique/CLAUDE-v3.5-perime.md`. | **fait** |
| `PRJ-5` | 🟡 | ~~`publier.sh` fait `git add -A`~~ | **fait** |

---

# H · À DIAGNOSTIQUER

- ~~`SOL-1`~~ — fermé le 13/08 au soir
- Les **118 tests n'ont pas tourné** depuis les corrections du 13/08 → `cd tests && bash run.sh` en local

---

# NOUVELLES ENTRÉES

*Colle ici tout ce que tu remarques, même mal formulé, même sans savoir où c'est.
On le rangera ensemble. Le pire ennemi de ce fichier, c'est le truc noté nulle part.*

- [ ]
- [ ]
- [ ]

---

## Ordre conseillé pour la suite

1. **`cd tests && bash run.sh`** — rien d'autre avant d'avoir le filet
2. **`TXT-7`** — 10 boss dans la soumission et le kit comm, avant de publier les threads
3. **`RND-2`** — 30 min, lisibilité et jouabilité
4. **`SOL-1`** — diagnostiquer avant de planifier
5. **`FEEL-3` + `FEEL-1`** — la plus grosse marche de sensation
6. **`RND-1` + `RND-3`** — le rendu et la perf d'un coup
7. `SON-1` + `SON-2`, puis le reste

---

*Seeker Strike v4.4 · AzumiZeus / @incDifuse · registre unique des corrections*

# SUIVI — tout ce qui ne va pas

Registre unique de Seeker Strike. **Rien ne se corrige de mémoire : tout passe par ici.**

*Dernière mise à jour : 13 août 2026 · Source de vérité : `game/index_v37.html`*

## Comment s'en servir

Chaque entrée a un **ID** (`TXT-1`, `RND-3`…). On peut s'y référer directement :
« fais SON-2 », « FEEL-1 est fini ». Les ID ne sont jamais réutilisés, même après
correction — on garde la trace.

**Gravité** — 🔴 bloquant ou trompe le joueur · 🟠 dégrade l'expérience ·
🟡 confort · ⚪ interne, invisible pour le joueur

**Statut** — `à faire` · `en cours` · `fait` · `à vérifier` · `abandonné`

> ⚠️ **Après chaque correction : `cd tests && ./run.sh`.** Puis regénérer les builds
> (`cd game && python3 build_autonome.py`) — sinon tu corriges la source et tu publies
> l'ancienne version.

---

# A · CONTENU ET TEXTES

### `TXT-1` 🔴 Le briefing OBJECTIF annonce de faux chiffres — **à faire**

**Où :** `game/index_v37.html` ligne **2616**

```js
{p:'🎯', t:'OBJECTIF', d:"13 secteurs, 3 boucles, 4 boss. Bats le Vortex pour ouvrir
 la boucle 2, la Corruption pour la boucle 3, puis affronte le ..."}
```

**Trois chiffres faux dans la même phrase.** La réalité, d'après ta propre soumission :

| Annoncé | Réel |
|---|---|
| 13 secteurs | **22 secteurs** |
| 3 boucles | **2 campagnes** (GENESIS + CHAOS PROTOCOL) |
| 4 boss | **7 boss** |

C'est le texte que lit un joueur au tout début. Il sous-vend ton jeu de moitié, et
un jury qui compare ce briefing à ta soumission voit une contradiction.

⚠️ **Vérifie aussi la fin de la phrase** — elle décrit un enchaînement Vortex → boucle 2
→ Corruption → boucle 3 qui ne correspond probablement plus à la structure actuelle.

⚠️ **Le texte anglais** doit être corrigé en même temps (bloc i18n, vers la ligne 7415).

---

### `TXT-2` ⚪ Commentaire de code périmé — **à faire**

**Où :** ligne **4257**

```js
/* Chemin serpentant : 13 noeuds du QG (bas) au Nexus (haut) */
```

Invisible pour le joueur. Mais c'est toi dans trois mois qui le liras et qui y croiras.

---

### `TXT-3` 🟡 Incohérence 5 jours / 6 jours — **à faire**

`docs/SOUMISSION.md` écrit *« Built solo in 6 days »* / *« en 6 jours »*.
Tu dis 5 partout ailleurs. **Choisis-en un et aligne tout** : soumission, README,
posts X, bio. Un jury qui compare deux chiffres se pose une question inutile.

---

## ❌ FAUSSES PISTES — vérifié, à NE PAS toucher

Ces occurrences ressemblent au bug `TXT-1`. Elles sont **correctes**.

| Où | Contenu | Pourquoi c'est juste |
|---|---|---|
| ligne **8466** | `{id:'camp12', n:'Genesis Complete', d:'12 secteurs sécurisés', m:12}` | GENESIS = les secteurs 1 à 12. Confirmé par `currentNode>=13` qui bascule sur CHAOS. **Corriger en 22 casserait le succès.** |
| ligne **7415** | `"12 secteurs sécurisés": "12 sectors secured"` | Traduction du succès ci-dessus. Juste. |
| — | `{id:'camp5', d:'5 secteurs sécurisés', m:5}` | Palier intermédiaire. Juste. |

**12 (GENESIS) + 10 (CHAOS) = 22.** Tout est cohérent.

---

# B · RENDU VISUEL
*Détail complet dans `RENDU-VISUEL.md`*

| ID | Gravité | Quoi | Où | Statut |
|---|---|---|---|---|
| `RND-1` | 🟠 | **Fusion additive jamais utilisée.** `'lighter'` = 0 occurrence sur 8 610 lignes. Le plus gros écart de rendu. | projectiles 5942, particules 5911, orbes 5825, explosions | à faire |
| `RND-2` | 🔴 | **Tirs ennemis `#fb923c` vs ambre `#fbbf24` (27 usages HUD/ramassables).** Deux oranges voisins dont un veut dire « ça te tue ». Problème de **jouabilité**, pas de style. | 5498, 5508, 5511 | à faire |
| `RND-3` | 🟠 | **`shadowBlur` appelé dans les boucles** par projectile et par particule. Op la plus lourde de Canvas 2D, sur mobile. Réglé en même temps que `RND-1`. | 5911, 5937, 5944 | à faire |
| `RND-4` | 🟡 | **Palette : doublons.** 4 gris, 4 verts, 4 violets, 3 roses, 3 rouges. Consolider en rampes de 3, ancrées sur `#14f195` / `#9945ff` (couleurs Solana). | tout le fichier | à faire |
| `RND-5` | 🟡 | Profondeur du fond : plus c'est loin, plus c'est sombre et désaturé. | 5810 | à faire |
| `RND-6` | ⚪ | Bloom via canvas réduit + `ctx.filter`. **À faire en dernier**, derrière une préférence. | — | à faire |

---

# C · GAME FEEL
*Détail complet dans `GAME-FEEL-PRIORITES.md`*

| ID | Gravité | Quoi | Où | Statut |
|---|---|---|---|---|
| `FEEL-1` | 🟠 | **Hitstop inexistant.** 0 occurrence. Le plus gros manque de sensation. ⚠️ Jamais sur un simple coup — seulement sur la mort. | `loop()` 4862 | à faire |
| `FEEL-2` | 🟠 | **Le shake ne se déclenche jamais sur les kills du joueur.** Les 13 déclenchements sont « joueur subit » ou « boss ». Ton arme ne pèse rien. | `kill()` 5769 | à faire |
| `FEEL-3` | 🟡 | **Décroissance du shake linéaire** → vibration molle. Amplitude quadratique : `g.shake*g.shake*0.02`. **Une ligne, meilleur ratio de tout le projet.** | 5803 | à faire |
| `FEEL-4` | 🟡 | Impact = 2 particules, isotropes. Monter à 5 et les rendre directionnelles. | 4984 | à faire |
| `FEEL-5` | 🟡 | `kill()` n'appelle jamais `parts()` → explosion sans débris. | 5769 | à faire |
| `FEEL-6` | 🟡 | Pas de préférence `S.prefs.secousses` (accessibilité / mal des transports). Modèle : `PART_MULT` ligne 1865. | 1865, 5803 | à faire |

---

# D · SON

| ID | Gravité | Quoi | Où | Statut |
|---|---|---|---|---|
| `SON-1` | 🟠 | **`synth('hit')` à hauteur fixe** — `beep(180,...)` — alors que `'shot'` varie déjà. Fatigue auditive en 20 s. | 1977 | à faire |
| `SON-2` | 🟠 | **Aucune limite de débit sur `sfx('hit')`.** Éventail de 5 tirs = 5 ondes identiques dans la même image → empilement de phase, clic dur, pic de volume. | 1972, 4984 | à faire |

---

# E · SOLANA / WEB3

| ID | Gravité | Quoi | Statut |
|---|---|---|---|
| `SOL-1` | 🔴 | **Le solde SOL devnet ne s'affiche pas dans le wallet côté jeu.** Pas encore diagnostiqué. | **à diagnostiquer** |
| `SOL-2` | 🟡 | Wrapper APK (WebView / Capacitor) pour le dApp Store. Prérequis : KYC au Publisher Portal, ~0,2 SOL, review 3-5 jours ouvrés. | à faire |
| `SOL-3` | ⚪ | Passage mainnet — voir `docs/PASSER-EN-MAINNET.md`. Pas avant que le reste soit propre. | plus tard |

## ✅ Vérifié — rien à faire

- **Mint SKR** `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3` : Owner Program = **Token Program**
  classique, Token Extensions = FALSE, decimals = 6. Ton `getAssociatedTokenAddress` et
  ton `createTransferCheckedInstruction` sont corrects. **`@solana/token-helpers` ne te
  servirait à rien** (il ne résout que Token-2022 / Token-ACL).
- **`ss_v2`** : ton `CLAUDE.md` dit que la clé traîne encore. **Elle n'est plus dans le
  code**, j'ai vérifié. La note est périmée → voir `PRJ-4`.

---

# F · PUBLICATION ET COMMUNICATION

| ID | Gravité | Quoi | Statut |
|---|---|---|---|
| `PUB-1` | 🟠 | **Description GitHub fausse** : « Web3 **extraction shooter** on Solana ». Ce n'est pas ton jeu. Remplacer par la tagline de `SOUMISSION.md`. | à faire |
| `PUB-2` | 🟠 | **Vérifier si Netlify est connecté au dépôt.** `publier.sh` ne pousse que vers GitHub — si Netlify a été déposé à la main, il se figera et tu enverras un jour un lien de secours périmé. | **à vérifier** |
| `PUB-3` | 🟡 | `docs/SOUMISSION.md` : champs **Twitter** et **Telegram** encore *(à compléter)* → `@incDifuse`. | à faire |
| `PUB-4` | 🟡 | Les 2 threads X (EN + FR) — voir `KIT-COMM-X.md`. Vérifier le handle exact de NoahAI avant d'envoyer. | à faire |
| `PUB-5` | 🟡 | Réserver le handle X du jeu (sans l'alimenter tout de suite). | à faire |

## Adresses vérifiées le 13/08/2026 — les trois répondent, toutes en v4.4

- Jeu : **https://azumizeus.github.io/seeker-strike/**
- Secours : **https://seeker-strike.netlify.app**
- Code : **https://github.com/Azumizeus/seeker-strike** (public, 21 commits, Pages actif)

---

# G · HYGIÈNE DU PROJET

| ID | Gravité | Quoi | Statut |
|---|---|---|---|
| `PRJ-1` | 🟠 | **Le dossier du projet finit par une espace** (`...NITRO-01 `). Ça casse les outils qui écrivent sur ton disque. Renommer sans l'espace, puis reconnecter le dossier. | à faire |
| `PRJ-2` | 🟡 | Trier les assets et sprites non utilisés (`_backup/`, `sources/`). Beaucoup serviront pour la suite — les classer, pas les jeter. | à faire |
| `PRJ-3` | ⚪ | Fichiers parasites : `docs/_test.tmp`, `docs/_test.txt`, et 4 `.DS_Store` (racine, `game/`, `noah-build/`, `sources/`). Ajouter `.DS_Store` au `.gitignore`. | à faire |
| `PRJ-4` | 🟡 | **`CLAUDE.md` est périmé** : titre « v3.5 » alors que le jeu est en **v4.4** · « PROCHAINE TÂCHE : plan de test du 13 août » (passé) · la note `ss_v2` est fausse (voir E). | à faire |

---

# H · À DIAGNOSTIQUER

Ce qui n'est pas encore compris. **On ne planifie pas un correctif tant que la cause
n'est pas trouvée.**

- `SOL-1` — solde SOL devnet non affiché
- `PUB-2` — état de la connexion Netlify

---

# NOUVELLES ENTRÉES

*Colle ici tout ce que tu remarques, même mal formulé, même sans savoir où c'est.
On le rangera ensemble. Le pire ennemi de ce fichier, c'est le truc noté nulle part.*

- [ ]
- [ ]
- [ ]

---

## Ordre conseillé

1. **`TXT-1`** — 15 min, c'est le seul qui trompe activement un joueur ou un jury
2. **`RND-2`** — 30 min, lisibilité et jouabilité
3. **`SOL-1`** — diagnostiquer avant de planifier
4. **`FEEL-3` + `FEEL-1`** — la plus grosse marche de sensation
5. **`RND-1` + `RND-3`** — le rendu et la perf d'un coup
6. **`SON-1` + `SON-2`**
7. Le reste, dans l'ordre que tu veux

---

*Seeker Strike v4.4 · AzumiZeus / @incDifuse · registre unique des corrections*

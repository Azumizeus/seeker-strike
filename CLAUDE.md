# CLAUDE.md — SEEKER STRIKE v4.4

> Lu automatiquement au démarrage de chaque session. Réalité terrain uniquement.
> Dernière vérification du contenu : 14 août 2026 (chiffres relus dans le code).

---

## IDENTITÉ

**Jeu** : Seeker Strike — Genesis Protocol v4.4. Shoot'em up vertical, canvas HTML5,
pour Solana Seeker.
**Source de vérité** : `game/index_v37.html` — 8 678 lignes, 3,1 Mo, vanilla JS +
Tailwind CDN, police Orbitron. **Tout le reste est généré.**
**Save** : `localStorage`, clé **`ss_v35`** (+ clés annexes `ss_theme`, `ss_langue_choisie`,
`ss_tuto_vu`, `ss_mwa_token`, `ss_chaos`, `ss_die`, `ss_dragon`, `ss_sentinelle`,
`ss_vortex_face`).
**Assets** : `game/assets/inline/` (104 webp) et `game/assets/audio/` (10 mp3) —
chemins relatifs en dur, **ne jamais déplacer**.

**Contenu** : 22 secteurs (GENESIS 1-12, CHAOS 13-22), 2 campagnes, 7 boss,
12 vaisseaux, FR/EN.

**Hackathon** : NoahAI Nitro 01 — **terminé, candidature déposée le 13 août 2026.**
**Founder / décision finale** : AzumiZeus — francophone, réponds toujours en français,
tutoiement, ton direct.

---

## LE DOCUMENT À OUVRIR EN PREMIER

**`SUIVI-CORRECTIONS.md`** à la racine — le registre unique de tout ce qui ne va pas.
Chaque défaut a un identifiant (`RND-1`, `FEEL-2`, `SON-1`…), une gravité, un emplacement
dans le code et un statut.

**Rien ne se corrige de mémoire — tout passe par lui.** Il dit « fais SON-2 », on répond
à cette référence directement.

Familles : `TXT-*` textes · `RND-*` rendu · `FEEL-*` ressenti de jeu · `SON-*` audio ·
`SOL-*` Solana/web3 · `PUB-*` publication · `PRJ-*` hygiène projet.

Ensuite : `docs/INDEX.md` → `docs/BRIEF-KIMI-K3.md` → `docs/JOURNAL-MODIFS.md`.

---

## STACK RÉELLE

- **Aucun build pour jouer.** Ouvrir `index.html` dans un navigateur = ça marche.
- Pas de npm, pas de Vite, pas de React. (Un `package.json` et un `vite.config.js`
  traînent à la racine : vestiges de la preview Noah, **pas la chaîne de build du jeu**.)
- HTML + CSS + JS inline dans un seul fichier. Canvas 2D pour le rendu.
- Audio : WebAudio maison (`beep` / `sfx` / `synth` / `startMusic`).
  Haptique : `navigator.vibrate`.
- Les builds dérivés sont produits par des scripts Python : `game/build_autonome.py`,
  `game/build_noah.py`, `game/build_audit.py`.

---

## RÈGLES IMPÉRATIVES

1. **Modifier uniquement `game/index_v37.html`.** Les autres HTML sont générés.
2. **Patch par script Python**, avec assertion d'unicité du motif et écriture après
   chaque remplacement — deux scripts ont déjà planté au milieu et perdu des correctifs.
3. **Fichier complet** si on renvoie du contenu — jamais de diff partiel,
   jamais de « … reste inchangé ».
4. **Zéro régression.** Casser un système existant est bloquant.
5. **Commentaires en français**, expliquant le *pourquoi*, pas le *quoi*.
6. **`S.prefs` fusionné au `load()`** pour rester compatible avec les anciennes saves.
7. **Réponses concises** : liste des changements, 3 lignes max.
8. **Quand tu ne sais pas, lis le code.** Ne conclus jamais d'un nom de fichier ou
   d'une vignette.

---

## VÉRIFIER APRÈS CHAQUE MODIF — DANS CET ORDRE

```bash
cd game && python3 build_autonome.py    # 1. reconstruire d'abord
cd ../tests && ./run.sh                 # 2. 118 exécutions (38 scénarios × 3 builds + 4 jsdom)
cd .. && bash publier.sh "message"      # 3. commit + push + GitHub Pages + Netlify
bash verifier.sh                        # 4. l'URL en ligne sert bien la dernière version
```

**Construire avant de tester** : la suite valide les 3 builds ; sans reconstruction, deux
d'entre eux sont d'anciennes copies. Plus `node --check` sur le script extrait.
Contrôle rapide (2 min) : `cd tests && bash lot.sh 1 12`.

---

## STRUCTURE DOSSIER

```
SUIVI-CORRECTIONS.md   ← le registre, à lire en premier
index.html             le jeu servi par GitHub Pages (copie du build autonome)
game/           34 Mo  ← index_v37.html = LA SOURCE, + assets + scripts de build
tests/          27 Mo  118 exécutions, ./run.sh
noah-build/     24 Mo  déploiement à assets externes
docs/                  10 documents actifs + chantiers/ comm/ historique/
audit/                 copie découpée du code, pour relecture
medias/         67 Mo  vidéo, captures, branding (hors Git)
sources/       246 Mo  bibliothèque créative (hors Git) — REVUE-ASSETS.html = l'outil de tri
```

**En ligne** : jouable https://azumizeus.github.io/seeker-strike/ ·
code https://github.com/Azumizeus/seeker-strike · miroir https://seeker-strike.netlify.app

---

## PIÈGES CONNUS

- ✅ **Wallet et transactions sont réels** : vraies signatures MWA / Phantom / Backpack,
  vrais mémos Solana **devnet**, vérifiables sur Solscan. 15 mémos en une signature,
  10 paliers on-chain à récompenses **cosmétiques uniquement**.
- ⚠️ **Le dossier finit par une espace** (`…NITRO-01 `) — casse git et certains outils.
  Toujours mettre le chemin entre guillemets. (`PRJ-1`, pas encore renommé.)
- ⚠️ **Clé Helius en clair** dans le HTML, plan gratuit sans restriction de domaine.
  Le hackathon est fini : **à révoquer.**
- ⚠️ **Le succès `camp12` dit « 12 secteurs » et c'est CORRECT** (GENESIS = 1-12).
  Ne pas le « corriger » en 22 — ça casse le succès. Le vrai bug de lore est ailleurs
  (`TXT-1`, ligne ~2616 : « 13 secteurs, 3 boucles, 4 boss »).
- ❌ Ne **PAS** chercher `CHANGELOG.md` ni `ROADMAP_5J.html` (n'existent pas).
- ❌ Ne **PAS** proposer Vite / React / TypeScript — hors scope, et le jeu n'en a pas.
- ❌ Ne **PAS** déplacer `game/assets/` — chemins relatifs, tout casse.
- ✅ La clé `ss_v2` **n'est plus dans le code** (vérifié). L'ancienne note était fausse.
- 🍎 `timeout` est une commande GNU absente de macOS — `run.sh` gère déjà le repli
  sur `gtimeout`.

---

## PROCHAINES TÂCHES

1. **`SUIVI-CORRECTIONS.md`** — les plus rentables : `FEEL-3` (une ligne),
   `FEEL-2` (le shake ne se déclenche jamais sur tes kills), `SON-2` (aucune limite de
   débit sur les sons d'impact), `RND-1` (fusion additive jamais utilisée).
2. **Revue des assets** — dérouler `sources/REVUE-ASSETS.html`, exporter le CSV,
   puis préparer les substitutions dans le jeu.
3. **Révoquer la clé Helius.**
4. **Mainnet** : lire `docs/PASSER-EN-MAINNET.md` avant d'y penser. Les prix des vaisseaux
   (0,12 à 0,85 SOL) sont irréalistes en l'état.

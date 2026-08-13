# v3.7 — BOSS & VARIÉTÉ D'ENNEMIS

Base : version Grok (assets base64 inline). Modifications chirurgicales, aucune réécriture.
Fichier : `game/index_v37.html` — `game/index.html` (v3.5) reste intact.

## 4 types d'ennemis

| Type | Comportement | Sprite | Fallback |
|---|---|---|---|
| `chasseur` | rapide, poursuite latérale du joueur | `enemy_chasseur.png` | triangle |
| `tireur` | se poste en haut, rafales de 3 | `enemy_tireur.png` | carré |
| `kamikaze` | charge vers le joueur, explose au contact | `enemy_kamikaze.png` | cercle |
| `tank` | lent, gros PV, gros rayon | `enemy_tank.png` | hexagone |

Répartition du spawn : 34 % chasseur, 26 % tireur, 22 % kamikaze, 18 % tank.

## 3 boss (par nœud de campagne)

| Nœud | Boss | PV | Pattern | Spécial |
|---|---|---|---|---|
| 4 | VORTEX | ×5 | spirale continue | rotation lente du sprite |
| 6 | SENTINELLE | ×8 | croix rotative | invocations (2 ennemis / 5 s) |
| 7 | DRAGON | ×12 | éventail visé | **phase 2 à 50 % PV** + invocations |

Séquence : ~7 s de jeu → warning clignotant 1,8 s → entrée animée par le haut → combat.
Sprite affiché à ×3. Barre de vie dédiée en haut avec nom et indicateur de phase.

## Ajouts structurels
- **Projectiles ennemis** (`G.eBullets`) : n'existaient pas. Déplacement, collision joueur, rendu.
- `majEnnemi(e,g)` : comportement par type, appelé chaque frame.
- `majBoss(g)` : patterns, phases, invocations.
- `formeFallback()` : rendu géométrique si le PNG manque — aucun crash possible.

## Slots de fonds d'onglets
Variables CSS par écran : `--bg-home`, `--bg-map`, `--bg-ships`, `--bg-shop`, `--bg-arena`, `--bg-quests`, `--bg-prep`.
`--bg-ships` est branché sur `assets/bg_hangar.png`. Les autres sont à `none`, prêts à remplir.

## Tests
Simulation headless (stub DOM + canvas), 6 scénarios : 4 types produits, 1500 frames sans erreur,
les 3 boss apparaissent/tirent/passent en phase 2, game over propre. **Tous passent.**

## Reste à faire
- Écran Settings + resets 3 niveaux (MODIF #1, jamais terminée)
- Fonds des 6 autres onglets
- Version transparente de `boss_vortex_face` (le fond blanc a été détouré automatiquement)

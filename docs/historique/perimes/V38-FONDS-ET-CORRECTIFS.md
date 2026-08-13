# v3.8 — Mouvement 360, nœuds rejouables, réglages, fonds

## 1. Mouvement 360°
- **Tactile / souris** : suivi libre en X **et** Y (avant : X seulement)
- **Clavier** : ZQSD, WASD et flèches — 8 directions, diagonales normalisées (vitesse identique)
- Zone jouable verticale : `y` entre 70 px et `h-40` px
- Listeners installés une seule fois (`installerClavier`), reset des touches sur perte de focus

## 2. Nœuds rejouables + difficultés

| Difficulté | Étoiles | PV ennemis | Cadence de tir | Récompenses |
|---|---|---|---|---|
| Normal | ★ | ×1.0 | ×1.0 | ×1.0 |
| Difficile | ★★ | ×1.7 | ×1.35 | ×1.9 |
| Extrême | ★★★ | ×2.6 | ×1.8 | ×3.2 |

- Un nœud complété **reste cliquable** (farm / amélioration du record)
- Sélecteur de difficulté sur l'écran de préparation
- `S.nodeStars[nodeId]` garde la **meilleure** difficulté réussie
- Étoiles affichées au-dessus du nœud sur la carte (vert ★, orange ★★, rouge ★★★)
- La cadence s'applique aux tireurs **et** aux 3 boss

## 3. Écran Paramètres
Il n'avait jamais existé dans la version Grok (`0` occurrence de `s-settings` dans le fichier source).
Construit intégralement : 6e onglet dans la barre de navigation + bouton ⚙️ sur l'écran d'accueil.

- Toggles Son / Musique / Vibrations, sélecteur Particules (Faible ÷3, Normal, Élevé ×1.5)
- Gating réel : `beep`, `sfx`, `startMusic`, `vibrate` et `parts` respectent les préférences
- `S.prefs` fusionné au `load()` → compatible avec les saves `ss_v35` existantes
- Zone danger 3 niveaux avec `showConfirm(titre, message, classeBouton, onConfirm)` :
  - **Reset Run** (orange) : `txCount`, `streak`, `lastClaim` — achats conservés
  - **Reset Usine** (rouge) : **double confirmation**, remet tout à l'état initial, garde les préférences
  - **Reset Cache** (rouge foncé) : `localStorage.clear()` + `location.reload()`

## 4. État des fonds d'écran

| Écran | Variable CSS | Fond actuel |
|---|---|---|
| Ships (Hangar) | `--bg-ships` | ✅ `assets/bg_hangar.png` |
| Carte | — | ✅ fond dédié déjà présent (base64, `#map-bg`) |
| Accueil | `--bg-home` | ❌ vide |
| Préparation | `--bg-prep` | ❌ vide |
| Arena | `--bg-arena` | ❌ vide |
| Shop | `--bg-shop` | ❌ vide |
| Quêtes | `--bg-quests` | ❌ vide |
| Réglages | `--bg-settings` | ❌ vide |
| Mission (canvas) | — | rendu canvas, pas d'image de fond |

Pour brancher un fond : déposer le PNG dans `assets/` puis remplir la variable dans le bloc `:root`.

```css
--bg-home: linear-gradient(rgba(5,5,10,.55), rgba(5,5,10,.80)), url('assets/bg_home.png');
```

Le voile sombre du hangar est passé de `.82/.94` à `.55/.80` : à 82-94 % d'opacité l'image était
quasiment invisible, c'était la cause du « fond manquant ».

## Tests headless — 11 scénarios, tous verts
prefs fusionnées · les 8 écrans s'ouvrent · toggles et particules · son coupé sans crash ·
resets 3 niveaux · **8 directions + diagonale** · suivi tactile vertical · **nœud complété rejouable** ·
3 difficultés croissantes · étoiles enregistrées · les 3 boss tournent toujours.

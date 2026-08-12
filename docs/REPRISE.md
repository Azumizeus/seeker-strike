# REPRISE SEEKER STRIKE — SESSION NOAH

## Contexte
- Jeu : **Seeker Strike v3.5** (single-file HTML, vanilla JS, Tailwind CDN, Orbitron)
- Fichier : `game/index.html` (809 lignes) + `game/assets/` (31 PNG)
- Save key localStorage : `ss_v35`
- Noah a le v3.5 en mémoire (session précédente)
- Repo Noah = scaffold Vite/React à **IGNORER**

## Décision confirmée
**OPTION : remplacer complètement `index.html` par le jeu vanilla.**
Le scaffold React/Vite/src devient inutilisé.

## Modifs en attente (dans l'ordre)
1. **MODIF #1** : Écran SETTINGS + RESET 3 NIVEAUX (prompt complet dans `PROMPTS.md`)
2. [à définir ensuite selon priorités hackathon]

## Règles impératives pour Noah
- Fichier **complet** renvoyé à chaque modif (jamais de diff partiel)
- **Zéro régression**
- Commentaires en **français**
- `S.prefs` fusionné au `load()` pour compat anciennes saves `ss_v35`
- Réponse concise (économie tokens) : liste changements **3 lignes max**

## Attention chemins
Les assets sont référencés en relatif (`assets/ship.png`) depuis `game/index.html`.
Ne jamais séparer `index.html` de son dossier `assets/` — sinon toutes les images cassent.

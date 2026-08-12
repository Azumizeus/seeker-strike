# Copie d'audit — Seeker Strike v4.4

Copie **générée** de `game/index_v37.html`, découpée en six fichiers lisibles.
Les images et sons en base64 sont remplacés par `<retiré>`.

| Fichier | Lignes | Poids |
|---|---|---|
| `1-interface.html` | 1102 | 67 Ko |
| `2-donnees.js` | 2109 | 111 Ko |
| `3-solana.js` | 1331 | 70 Ko |
| `4-moteur.js` | 2200 | 102 Ko |
| `5-traductions.js` | 725 | 53 Ko |
| `6-outils.js` | 1050 | 58 Ko |

## À lire selon le sujet

| Sujet | Fichier |
|---|---|
| Signatures, clés, transferts, RPC | `3-solana.js` — **suffit pour un audit sécurité** |
| Équilibrage, ennemis, boss | `4-moteur.js` |
| Économie, prix, paliers | `2-donnees.js` |
| Couverture FR/EN | `5-traductions.js` |
| Réglages, easter eggs | `6-outils.js` |
| Structure de page, CSS | `1-interface.html` |

## Deux règles

1. **Ces fichiers ne s'exécutent pas.** Ce sont des extraits pour la lecture.
2. **Ne jamais les éditer.** La source unique est `game/index_v37.html` ;
   toute correction s'y fait, puis `cd game && python3 build_audit.py`.

Si la version en tête de fichier ne correspond pas à celle du jeu, ce dossier
est périmé : régénérez-le avant d'auditer quoi que ce soit.

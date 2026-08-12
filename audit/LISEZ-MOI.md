# Seeker Strike v4.2 — dossier d'audit

Copie **découpée et allégée** du jeu, destinée à la relecture.
Ce n'est pas une version exécutable : le jeu tourne depuis `game/index_v37.html`.

## Pourquoi ce dossier

Le fichier de production fait 2,84 Mo pour 7 874 lignes. **86 % du poids est
du base64** — 94 images encodées en clair dans le fichier. Le code réel ne
pèse que 415 Ko.

Ici les images sont remplacées par `/*[IMAGE 12 Ko retirée pour l'audit]*/`.
Le code est intégralement conservé, découpé en six fichiers thématiques.

## Contenu

| Fichier | Lignes | Poids | Contenu |
|---|---|---|---|
| `1-interface.html` | 1 102 | 67 Ko | HTML + CSS, tous les écrans |
| `2-donnees.js` | 2 049 | 109 Ko | tables de données, état `S`, sauvegarde, audio, rendu d'interface |
| `3-solana.js` | 1 001 | 52 Ko | **RPC, signature, Seeker Task, trésorerie, SKR, dons, paliers** |
| `4-moteur.js` | 2 082 | 95 Ko | boucle 60 Hz, ennemis, boss, collisions, rendu canvas |
| `5-traductions.js` | 656 | 43 Ko | dictionnaire FR → EN, 638 entrées |
| `6-outils.js` | 1 039 | 57 Ko | bestiaire, quêtes, secrets, terminal, orientation, démarrage |

**Total : 440 Ko** au lieu de 2,84 Mo.

## Fidélité

Le découpage est fait aux frontières de fonctions, sur les numéros de ligne du
script d'origine. Vérifié : **les 6 778 lignes du script se reconstituent à
l'identique**, aucune ligne perdue ni modifiée. Chaque fichier indique en
en-tête la plage de lignes qu'il couvre dans `game/index_v37.html`.

## Par où commencer

Pour un audit **sécurité / blockchain** : `3-solana.js` seul suffit. Tout ce
qui touche à une signature, une clé ou un transfert y est.

Pour un audit **équilibrage** : `2-donnees.js` (tables) puis `4-moteur.js`
(application).

Pour un audit **complet** : le dossier technique `docs/DOSSIER-TECHNIQUE.md`
donne l'architecture et le rapport d'audit interne, y compris la liste des
défauts trouvés dans les tests eux-mêmes (section 6.3).

## Rejouer les tests

```bash
cd ../tests && ./run.sh
```

87 exécutions sur les 3 builds. Sortie attendue : `TOUT PASSE`.

## Régénérer ce dossier

Il est produit par découpage automatique depuis `game/index_v37.html`. Toute
modification doit être faite dans la source, jamais ici.

# Seeker Strike — Genesis Protocol · build Noah

## Contenu

```
noah-build/
├── index.html              le jeu (2,8 Mo)
└── public/assets/
    ├── inline/  78 images  (sprites, boss, vaisseaux, 2 cartes)
    └── audio/    8 musiques
```

Le HTML ne fait que 2,8 Mo : images et musiques se chargent en parallèle,
sans bloquer l'affichage.

## À supprimer avant de déployer

Trois fichiers d'une version précédente traînent encore et ne sont plus
référencés par `index.html`. Ils pèsent 6,6 Mo pour rien :

- `game.js` (0,4 Mo)
- `sprites.js` (5,9 Mo)
- `sprites-inline.js` (94 octets)

Je n'ai pas les droits pour les effacer, supprime-les à la main.

## Servir le jeu

**HTTPS obligatoire.** Le Mobile Wallet Adapter refuse toute connexion en
HTTP, et les navigateurs Android bloquent la lecture des fichiers voisins
en `file://`.

```bash
npx serve noah-build
```

Racine du site = le dossier `noah-build/`. Aucun build, aucune dépendance,
aucune compilation : les fichiers sont servis tels quels.

## Points d'attention

- **`public/assets/` est obligatoire.** Sans ce dossier le jeu démarre,
  mais tombe sur ses formes géométriques de secours et reste muet.
- **Devnet uniquement.** Les transactions Seeker Task partent sur
  `api.devnet.solana.com` via le programme Memo. Rien en mainnet.
- **Le jeu ne distribue aucun SOL ni SKR.** Uniquement des crédits de jeu
  (GC), internes, sans valeur on-chain.
- **Mode développeur** : cinq appuis sur le numéro de version en bas des
  Réglages. Ouvre tout le contenu pour une démonstration.

## Version autonome

`game/seeker-strike-MOBILE.html` (9 Mo) contient tout dans un seul fichier.
À utiliser pour un test local sur téléphone quand on ne peut pas servir le
dossier en HTTPS.

## Recette

Le plan de test à dérouler avant intégration est dans
`docs/PLAN-TEST-FINAL.md`.

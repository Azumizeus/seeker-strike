# Seeker Strike — Genesis Protocol

Shoot'em up vertical pour **Solana Seeker**. NoahAI Nitro 01.

## ▶ Le jeu tourne ici

**https://azumizeus.github.io/seeker-strike/**

## Pour servir ce dépôt

`index.html`, à la racine, est **le jeu entier** : 135 images et 8 musiques
embarquées dans le fichier. Aucun asset externe, aucun import, aucun chemin à
résoudre.

**Servir la racine en statique. C'est tout.**

```bash
npm run dev      # serveur statique, port 3000
```

- Pas de `npm install` : aucune dépendance
- Pas de build : rien à construire
- Pas de framework : Canvas 2D en JavaScript vanilla

Un `vite.config.js` est fourni si l'environnement impose Vite.

## Ne pas faire

- Découper `index.html` — l'architecture mono-fichier est délibérée
- Convertir en React ou TypeScript — hors sujet
- Passer par un bundler — il n'y a rien à bundler, et parser 2,4 Mo de script
  inline est au mieux très lent

## Si la page reste vide

Deux domaines seulement sont sollicités, et **aucun ne peut vider la page** :

| Domaine | Quand | Si bloqué |
|---|---|---|
| `fonts.googleapis.com` | chargement | police système, le jeu s'affiche |
| `esm.sh` | clic sur « Connecter le wallet » | couche Solana off, jeu jouable |

Au chargement, la console doit afficher :

```
[SEEKER] assets : 135 charges, 0 echecs
```

## Structure

```
index.html       le jeu, autonome (11 Mo)  ← c'est lui qu'on sert
game/            source de vérité + scripts de build
tests/           118 exécutions, ./run.sh
docs/            documentation complète
noah-build/      variante à assets externes (chemins en public/, pour serveur statique nu)
audit/           copie découpée pour relecture
```

**Source de vérité : `game/index_v37.html`.** Tout le reste est généré.

---

*v4.4 · AzumiZeus · NoahAI Nitro 01*

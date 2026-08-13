# Seeker Strike — paquet Noah

## Un seul fichier. Rien à construire.

```
index.html        11 Mo — le jeu entier, 135 images et 8 musiques embarquees
package.json      au cas ou l'environnement veut un projet npm
vite.config.js    au cas ou l'environnement impose Vite
```

`index.html` est **autonome** : aucun asset externe, aucun import a resoudre,
aucun chemin a reecrire. Il s'ouvre meme en double-clic depuis un disque.

## Ce qu'il faut faire

**Servir `index.html` en statique. C'est tout.**

- Pas de `npm install` (aucune dependance)
- Pas de build, pas de transpilation, pas de bundler
- Pas de framework : c'est du Canvas 2D en JavaScript vanilla

Si l'environnement exige une commande : `npm run dev` lance un serveur
statique sur le port 3000.

## Ce qu'il ne faut surtout pas faire

- **Ne pas decouper le fichier.** L'architecture mono-fichier est deliberee.
- **Ne pas convertir en React, TypeScript ou modules.** Hors sujet.
- **Ne pas passer par un bundler.** Il n'y a rien a bundler, et un bundler
  qui essaie de parser 2,4 Mo de script inline echouera ou prendra 10 minutes.

## Si la preview reste vide

Trois causes, dans l'ordre de probabilite :

1. **L'outil attend un projet a construire.** Il n'y en a pas. Servir le
   fichier tel quel.
2. **Le poids.** 11 Mo dans un editeur en ligne peut depasser une limite.
   Solution : utiliser la version a assets externes (`noah-build/`, 2,89 Mo
   d'HTML), mais **attention aux chemins** — ils sont en `public/assets/...`,
   ce qui ne convient pas a Vite, qui sert `public/` a la racine. Avec Vite,
   c'est cette version-ci, autonome, qu'il faut prendre.
3. **Le reseau sortant est bloque.** Deux domaines sont sollicites :
   - `fonts.googleapis.com` — polices. Bloque, le jeu s'affiche avec une
     police systeme. Il ne devient pas blanc.
   - `esm.sh` — web3.js, charge **a la demande** au clic sur « Connecter le
     wallet ». Bloque, la couche Solana est indisponible, le jeu reste
     entierement jouable.

   Aucun des deux ne peut produire une page vide. Si l'ecran est noir, l'erreur
   est ailleurs : ouvrir la console du navigateur, la premiere erreur suffit
   generalement a trancher.

## Verifier que ca tourne

Au chargement, la console affiche :

```
[SEEKER] assets : 135 charges, 0 echecs
[SEEKER] musique : menu
```

Et l'ecran montre un splash « SEEKER STRIKE — APPUYER POUR COMMENCER ».

## Le jeu tourne deja ici

https://azumizeus.github.io/seeker-strike/

Meme fichier, servi par GitHub Pages. Si la preview locale echoue mais que
cette URL fonctionne, le probleme est dans l'environnement, pas dans le jeu.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

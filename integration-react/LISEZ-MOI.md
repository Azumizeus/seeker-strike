# Intégrer Seeker Strike dans un projet React / Vite

## Le principe

Le jeu est un **Canvas 2D en fichier unique**, déjà déployé et servi en HTTPS :

**https://azumizeus.github.io/seeker-strike/**

On ne le porte pas en React. On l'affiche dans une iframe plein écran.
C'est cinq lignes, et ça évite de faire avaler 2,4 Mo de script inline à un
bundler qui n'a rien à y gagner.

## Ce qu'il faut faire

Remplacer le contenu de `src/App.jsx` par `App.jsx` de ce dossier.

C'est tout. Aucune dépendance à installer, aucun asset à copier, aucune
configuration à toucher.

## Ce que ça donne

Le jeu complet, jouable, dans la preview : 22 secteurs, 7 boss, deux
campagnes, la boutique, le bestiaire, FR/EN.

## Limite connue : le wallet

Dans une iframe **cross-origin**, la connexion wallet peut être restreinte
selon la politique du navigateur — le Mobile Wallet Adapter ouvre une
application externe, ce qu'une iframe ne peut pas toujours déclencher.

Le jeu reste **entièrement jouable** : la couche Solana est une progression
parallèle, jamais une condition d'accès. Rien n'est bloqué.

Pour démontrer les transactions, ouvrir l'URL directement dans un onglet :

```
https://azumizeus.github.io/seeker-strike/
```

Là, wallet et signatures fonctionnent normalement — testé sur Seeker avec le
Seed Vault.

## Si la preview doit être autonome, sans URL externe

Alternative : récupérer le fichier dans `public/` du projet React, puis
pointer l'iframe dessus.

```bash
curl -L -o public/seeker-strike.html \
  https://raw.githubusercontent.com/Azumizeus/seeker-strike/main/index.html
```

```jsx
src="/seeker-strike.html"
```

11 Mo, servis en statique par Vite depuis `public/`, sans passer par le
bundler. Même origine, donc plus de restriction d'iframe.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

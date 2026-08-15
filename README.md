# Seeker Strike — Genesis Protocol

Shoot'em up vertical pour **Solana Seeker**, jouable dans n'importe quel navigateur.
Un seul fichier HTML, aucune installation, aucune dépendance.

## ▶ Jouer

**https://azumizeus.github.io/seeker-strike/**


---

## Le jeu

An 2140. Le réseau Genesis relie tous les mondes habités — jusqu'à ce que les **Chaos Nodes**
commencent à le dévorer, secteur par secteur. Les flottes ont échoué, les IA ont capitulé.
Il reste toi.

| | |
|---|---|
| **22 secteurs** | répartis sur 2 cartes : GENESIS et CHAOS PROTOCOL |
| **10 boss** | du Vortex jusqu'à NEXUS PRIME et ses cinq mutations |
| **14 vaisseaux** | 2 offerts, 6 à acheter, 6 à mériter |
| **4 modes** | de Facile à Chasseur, plus Infini, Arena et coopératif |
| **5 secrets** | dont deux secteurs cachés, ouverts par des clés reconstituées |
| **2 langues** | français et anglais, tout le contenu compris |

Le tir est automatique. **Tout se joue au placement.**

---

## Solana

Les transactions sont **réelles et vérifiables** sur devnet, pas simulées.

- **Wallet** — Mobile Wallet Adapter (Seed Vault du Seeker), Phantom, Backpack
- **Seeker Task** — 15 transactions mémo envoyées en **une seule signature**
- **10 paliers on-chain** qui débloquent des récompenses **strictement cosmétiques**
- **Journal on-chain** dans le jeu, chaque signature cliquable vers Solscan

Le jeu est entièrement jouable et finissable **sans connecter de wallet et sans dépenser
un centime**. Rien de ce qui s'achète n'est nécessaire pour terminer le jeu.

Ce n'est pas un hasard : c'est le sujet même du récit. Dans l'univers du jeu, le Nexus
n'a jamais été conçu pour garder quoi que ce soit — il a été conçu pour **signer**.

---

## Technique

**Un seul fichier.** `index.html` à la racine contient le jeu entier : 135 images et
8 musiques embarquées. Aucun asset externe, aucun import, aucun chemin à résoudre.

- Canvas 2D, JavaScript vanilla, **zéro dépendance**
- Aucun build nécessaire pour jouer : ouvre le fichier, ça marche
- Boucle de jeu à pas de temps fixe — le rythme ne dépend pas de la fréquence de l'écran

```bash
npm run dev      # serveur statique, port 3000
```

Pas de `npm install`, pas de bundler, pas de framework. Un `vite.config.js` est fourni
si l'environnement l'impose.

### Développement

**Source de vérité : `game/index_v37.html`.** Tout le reste est généré.

```bash
cd game && python3 build_autonome.py     # régénère le build autonome
cd tests && ./run.sh                     # 118 exécutions sur les 3 builds
bash publier.sh "message"                # build racine, commit, push
```

La suite de tests rejoue 38 scénarios sur trois builds différents, plus quatre suites
jsdom : traductions manquantes, cohérence des prix, construction des transactions,
intégrité des sauvegardes, orientation, chargement des assets.

### Structure

```
index.html       le jeu, autonome (11 Mo)  ← c'est lui qu'on sert
game/            source de vérité + scripts de build + assets
tests/           118 exécutions, ./run.sh
docs/            lore, dossier technique, économie
noah-build/      variante à assets externes, pour serveur statique nu
audit/           copie découpée du code, pour relecture
```

### Si la page reste vide

Deux domaines seulement sont sollicités, et **aucun ne peut vider la page** :

| Domaine | Quand | Si bloqué |
|---|---|---|
| `fonts.googleapis.com` | au chargement | police système, le jeu s'affiche |
| `esm.sh` | clic sur « Connecter le wallet » | couche Solana absente, jeu jouable |

Au chargement, la console doit afficher :

```
[SEEKER] assets : 135 charges, 0 echecs
```

### Ce qu'il ne faut pas faire

- Découper `index.html` — l'architecture mono-fichier est délibérée
- Convertir en React ou TypeScript — hors sujet
- Passer par un bundler — il n'y a rien à bundler, et analyser 3 Mo de script inline
  est au mieux très lent

---

## Documentation

[`docs/INDEX.md`](docs/INDEX.md) — lore, dossier technique, économie, seconde carte.

---

*v4.4 · AzumiZeus · présenté à NoahAI Nitro 01*

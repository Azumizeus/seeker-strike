# Économie — Seeker Strike

## Trois choses distinctes, à ne pas confondre

| | Qu'est-ce que c'est | Qui en donne | À quoi ça sert |
|---|---|---|---|
| **GC** (Genesis Credits) | monnaie **interne** du jeu | le jeu, en jouant | tout le contenu de jeu |
| **SOL** | la crypto du joueur | **personne** — c'est le sien | achats premium (vaisseaux) |
| **SKR** | token de **Solana Mobile** | Solana Mobile, pas nous | rien dans le jeu |

## GC — comment ça marche

**Ça ne s'achète pas.** Ni en SOL, ni en SKR, ni en euros. C'est un score, pas un actif.

Sources : récompense de mission, claim quotidien, quêtes, défis Arena, butin ramassé en jeu.
Usages : armes, coque, aimant, charges de bonus, munitions, consommables.

**Aucun token à créer.** GC n'existe pas sur la blockchain — c'est une valeur dans la sauvegarde
locale. Pas de mint, pas de rent, pas de trésorerie, aucun risque réglementaire.

## SOL — le jeu n'en distribue jamais

Vérifié par test automatique : après une mission, une quête et un claim quotidien,
le solde SOL est **strictement inchangé**.

Le SOL affiché est celui du wallet du joueur. Il sert uniquement aux vaisseaux
(0,35 à 1,2 SOL). Rien n'oblige à en dépenser : tout le reste s'obtient en GC.

C'est ce qui rend le modèle tenable — **il n'y a aucune sortie de trésorerie**.

## SKR — ce n'est pas notre token

SKR appartient à Solana Mobile. Le jeu n'en distribue pas et n'en promet pas.

La **Seeker Task** (15 transactions on-chain) sert à maximiser l'activité Solana du joueur,
en vue de l'airdrop officiel de Solana Mobile. C'est un service rendu au joueur,
pas une distribution. Le texte des règles le dit explicitement dans le jeu.

## Ce qu'il faudrait pour aller plus loin

- **Vraies transactions** : aujourd'hui `addTx()` est un compteur local. Sans `sendTransaction`,
  la Seeker Task ne compte pas réellement.
- **Backend** : le `localStorage` est modifiable par le joueur. Indispensable si les GC
  devaient un jour valoir quelque chose.
- **Monétisation** : le modèle le plus sain reste le cosmétique en SOL — tu encaisses,
  tu ne reverses rien, aucune réserve nécessaire.

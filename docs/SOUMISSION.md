# Textes de soumission — NoahAI Nitro 01

*Prêt à copier-coller. Version anglaise d'abord (le hackathon est en anglais),
version française ensuite.*

---

## VERSION COURTE — si le champ est limité

> **Seeker Strike — Genesis Protocol**
>
> A vertical shoot'em up built for the Solana Seeker. 22 sectors, 7 bosses,
> 2 campaigns, 14 ships — playable in portrait, one hand, no wallet required.
>
> The Solana layer is a parallel progression, never a paywall: real devnet
> memo transactions, 15 of them bundled into a **single signature**, and
> 10 on-chain milestones unlocking **cosmetic rewards only**. No pay-to-win.
> Wallet support via Mobile Wallet Adapter (Seed Vault), Phantom and Backpack.
>
> Single HTML file, Canvas 2D, zero dependencies, zero build step.
> 118 automated tests. Tested on a physical Seeker.
>
> ▶ Play: https://azumizeus.github.io/seeker-strike/
> ⌨ Code: https://github.com/Azumizeus/seeker-strike

---

## VERSION COMPLÈTE — anglais

> ## Seeker Strike — Genesis Protocol
>
> **A mobile-first vertical shoot'em up built for the Solana Seeker.**
>
> ### The game
>
> 22 sectors across 2 campaigns (GENESIS and CHAOS PROTOCOL), 7 bosses with
> multi-phase transformations, 14 ships each with its own firing signature,
> 4 ammo types, 3 combat boosts, an infinite mode and a daily arena.
>
> Played in portrait, one hand, one thumb. Movement is a finger drag anywhere
> on screen — firing is automatic, so everything comes down to positioning.
> Full FR/EN localisation, a bestiary, a lore campaign, and 4 hidden secrets.
>
> ### The Solana layer
>
> **Real transactions on devnet — signed, broadcast, verifiable on Solscan.**
> Nothing simulated.
>
> - **15 memo transactions bundled into a single 791-byte transaction.** The
>   player signs once, not fifteen times. Replayable at will.
> - **10 on-chain milestones** from 5 to 150 transactions, unlocking
>   **cosmetic rewards only** — callsigns, ship trails, HUD ranks, a bordered
>   on-chain journal. Never power. A player who never connects a wallet is
>   never at a disadvantage.
> - **Wallet support**: Mobile Wallet Adapter (Seed Vault), Phantom, Backpack.
>   Sign-then-broadcast pattern, so the transaction always lands on devnet
>   regardless of the wallet's selected network.
> - **Ships purchasable in SOL or SKR** — the only paid content. All gameplay
>   (shop, ammo, consumables) runs on GC, earned by playing. It cannot be
>   bought.
> - A **0.001 SOL tip** to the project treasury is included in the milestone
>   batch, and clearly labelled as such.
>
> ### The engineering
>
> **One HTML file. Canvas 2D. Vanilla JavaScript. No framework, no npm, no
> build step.** Open the file, the game runs.
>
> That constraint is deliberate: no supply chain, no bundler, no version drift.
> The trade-off is a 8,200-line file — kept readable by French comments that
> explain the *why* of every non-obvious decision.
>
> - **118 automated tests** across 3 builds, run on headless harnesses with a
>   simulated clock and a seeded PRNG.
> - RPC resilience: 4-endpoint pool, automatic rotation, dead-endpoint
>   eviction, and a time budget guaranteeing a transaction never reaches the
>   network with an expired blockhash.
> - Every wallet call is time-bounded — a wallet that never answers can no
>   longer freeze the game.
> - **Tested on a physical Seeker** with Seed Vault: real signatures, real
>   confirmations.
>
> ### Links
>
> - ▶ **Play now**: https://azumizeus.github.io/seeker-strike/
> - ⌨ **Source code**: https://github.com/Azumizeus/seeker-strike
> - 📄 **Technical documentation**: `docs/` in the repository
>
> Built solo in 6 days for NoahAI Nitro 01.

---

## VERSION COMPLÈTE — français

> ## Seeker Strike — Genesis Protocol
>
> **Un shoot'em up vertical pensé pour le Solana Seeker.**
>
> ### Le jeu
>
> 22 secteurs répartis sur 2 campagnes (GENESIS et CHAOS PROTOCOL), 7 boss à
> transformations multiples, 14 vaisseaux ayant chacun sa signature de tir,
> 4 types de munitions, 3 boosts de combat, un mode infini et une arène
> quotidienne.
>
> Se joue en portrait, d'une main, d'un pouce. On déplace le vaisseau en
> glissant le doigt n'importe où sur l'écran — le tir est automatique, tout se
> joue au placement. Localisation FR/EN complète, bestiaire, campagne narrative
> et 4 secrets cachés.
>
> ### La couche Solana
>
> **Vraies transactions sur devnet — signées, diffusées, vérifiables sur
> Solscan.** Rien de simulé.
>
> - **15 transactions mémo groupées en une seule transaction de 791 octets.**
>   Le joueur signe une fois, pas quinze. Relançable à volonté.
> - **10 paliers on-chain** de 5 à 150 transactions, débloquant des
>   **récompenses purement cosmétiques** — indicatifs, traînées de vaisseau,
>   rangs au HUD, journal on-chain. Jamais de puissance. Un joueur qui ne
>   connecte jamais de wallet n'est jamais désavantagé.
> - **Wallets** : Mobile Wallet Adapter (Seed Vault), Phantom, Backpack.
>   Signature puis diffusion par nos soins, pour que la transaction atterrisse
>   toujours sur devnet quel que soit le réseau choisi dans le wallet.
> - **Vaisseaux achetables en SOL ou en SKR** — le seul contenu payant. Tout le
>   gameplay (boutique, munitions, consommables) tourne en GC, gagnés en
>   jouant. Ils ne s'achètent pas.
> - Un **pourboire de 0,001 SOL** à la trésorerie du projet est inclus dans le
>   lot de paliers, et clairement annoncé.
>
> ### La technique
>
> **Un seul fichier HTML. Canvas 2D. JavaScript vanilla. Aucun framework,
> aucun npm, aucun build.** On ouvre le fichier, le jeu tourne.
>
> C'est un choix : pas de chaîne de dépendances, pas de bundler, pas de
> dérive de versions. Le prix à payer est un fichier de 8 200 lignes — rendu
> lisible par des commentaires qui expliquent le *pourquoi* de chaque décision
> non évidente.
>
> - **118 tests automatisés** sur 3 builds, exécutés sur des harnais headless
>   avec horloge simulée et générateur pseudo-aléatoire à graine.
> - Résistance RPC : pool de 4 endpoints, rotation automatique, éviction des
>   endpoints morts, et un budget de temps garantissant qu'une transaction
>   n'atteint jamais le réseau avec un blockhash expiré.
> - Chaque appel au wallet est borné dans le temps — un wallet qui ne répond
>   jamais ne peut plus figer le jeu.
> - **Testé sur un Seeker physique** avec le Seed Vault : vraies signatures,
>   vraies confirmations.
>
> ### Liens
>
> - ▶ **Jouer** : https://azumizeus.github.io/seeker-strike/
> - ⌨ **Code source** : https://github.com/Azumizeus/seeker-strike
> - 📄 **Documentation technique** : dossier `docs/` du dépôt
>
> Développé en solo en 6 jours pour NoahAI Nitro 01.

---

## Tagline — si un champ court est demandé

> **EN** — Vertical shoot'em up for Solana Seeker. Real on-chain progression,
> zero pay-to-win, one HTML file.

> **FR** — Shoot'em up vertical pour Solana Seeker. Progression on-chain
> réelle, zéro pay-to-win, un seul fichier HTML.

---

## Adresses à fournir

| Champ | Valeur |
|---|---|
| Jeu jouable | `https://azumizeus.github.io/seeker-strike/` |
| Code source | `https://github.com/Azumizeus/seeker-strike` |
| Démo Netlify (secours) | `https://seeker-strike.netlify.app` |
| Trésorerie devnet | `AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH` |
| Twitter | *(à compléter)* |
| Telegram | *(à compléter)* |

---

## Points forts à mettre en avant si on te pose des questions

1. **Zéro pay-to-win.** Les 10 paliers on-chain ne donnent que du cosmétique.
   C'est un choix rare dans le gaming crypto, et défendable.
2. **15 transactions, une signature.** Un vrai problème d'expérience
   utilisateur résolu — signer 15 fois sur mobile est inacceptable.
3. **Un seul fichier, zéro dépendance.** Aucune surface d'attaque npm, le jeu
   tourne même hors ligne.
4. **118 tests automatisés** sur un projet de hackathon, avec horloge simulée
   et aléatoire reproductible.
5. **Testé sur du vrai matériel Seeker**, pas seulement en émulateur.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

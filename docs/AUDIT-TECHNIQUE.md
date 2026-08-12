# SEEKER STRIKE — Genesis Protocol
## Dossier d'audit technique

**Version** v4.2 · **Date** 11 août 2026 · **Hackathon** NoahAI Nitro 01 (Solana Gaming × Solana Mobile)
**Cible** Solana Seeker (Android) · navigateurs mobiles et desktop
**Auteur** AzumiZeus

---

## 1. Résumé exécutif

Seeker Strike est un shoot'em up vertical jouable dans le navigateur, conçu mobile-first pour le
Solana Seeker. Le jeu est distribué en **fichier HTML unique et autonome** (6,2 Mo) ou en build
séparé pour hébergement (`index.html` + `game.js` + `sprites.js` + `public/assets/`).

**Ce qui est réel et vérifiable :** l'intégralité du gameplay, la connexion multi-wallet
(Mobile Wallet Adapter et extensions navigateur), et l'émission de transactions on-chain sur devnet.

**Ce qui est simulé et assumé :** le classement (local), la sauvegarde (localStorage),
et l'absence de tout backend.

Ce document expose l'architecture, les fonctionnalités, les choix de conception, et
**la totalité des limites connues** — y compris celles qu'un auditeur pourrait considérer
comme bloquantes pour une mise en production.

---

## 2. Chiffres clés

| Métrique | Valeur |
|---|---|
| Poids du fichier autonome | 6,2 Mo |
| Poids du code (hors assets) | 198 Ko |
| Lignes de JavaScript | 3 090 |
| Fonctions | 137 |
| Images embarquées en base64 | 169 |
| Pistes audio embarquées | 3 |
| Fichiers d'assets sur disque | 187 (9,6 Mo) |
| Secteurs de campagne | 13 (id 0 à 12) |
| Boss | 4 |
| Types d'ennemis | 8 comportements + 5 variantes |
| Quêtes | 13 |
| Articles de boutique | 14 |
| Écrans | 10 |

---

## 3. Architecture technique

### 3.1 Stack

- **Aucun build, aucun bundler, aucune dépendance npm.** HTML, CSS et JavaScript vanilla.
- Rendu : **Canvas 2D**, boucle `requestAnimationFrame`.
- Styles : Tailwind via CDN + CSS custom. Police Orbitron (Google Fonts).
- Audio : `Audio()` pour les musiques, **WebAudio synthétisé** pour les 11 effets.
- Pas de framework, pas de virtual DOM, pas de gestionnaire d'état.

**Justification :** contrainte du hackathon (déploiement immédiat, aucun toolchain)
et compatibilité maximale avec les WebViews mobiles.

### 3.2 Dépendances externes

| URL | Rôle | Criticité |
|---|---|---|
| `esm.sh/@solana-mobile/mobile-wallet-adapter-protocol-web3js@2` | connexion Seed Vault | dégradation gracieuse |
| `esm.sh/@solana/web3.js@1` | construction des transactions | dégradation gracieuse |
| `api.devnet.solana.com` | RPC Solana | dégradation gracieuse |
| `cdn.tailwindcss.com` | styles | **bloquant visuellement** |
| `fonts.googleapis.com` | police Orbitron | dégradation gracieuse |

**Point d'audit :** les versions sont figées en majeur (`@2`, `@1`) et non en version exacte.
Un correctif amont peut modifier le comportement sans intervention. Tailwind par CDN est
la seule dépendance dont l'indisponibilité dégrade fortement l'affichage.

### 3.3 État applicatif

Deux objets globaux :

- **`S`** — état persistant, sérialisé en JSON dans `localStorage` sous la clé `ss_v35`.
  Contient soldes, progression, préférences, records, quêtes réclamées, signatures de transactions.
- **`G`** — état de la partie en cours, recréé à chaque mission, jamais persisté.

Clés `localStorage` : `ss_v35`, `ss_mwa_token`, `ss35_first`, `ss_tuto_vu`.

**Compatibilité ascendante :** `load()` fusionne les valeurs par défaut avec la sauvegarde
existante (`{...DEFAULT, ...sauvegarde}`), ce qui permet d'ajouter des champs sans casser
les sauvegardes antérieures. Comportement testé.

### 3.4 Stratégie de chargement des assets

Trois niveaux, dans cet ordre :

1. **Embarqué en base64** — sprites critiques, décors, musiques. Aucun accès réseau.
2. **Fichier externe** — `assets/` pour le décor optionnel.
3. **Repli géométrique** — formes dessinées en canvas (losange, triangle, carré, cercle, hexagone).

**Conséquence :** le jeu reste fonctionnel même si aucun fichier externe n'est servi.
Le fichier autonome ne contient plus aucune référence à un fichier obligatoire.

Diagnostic affiché en console 2,5 s après le chargement :
`[SEEKER] assets : N charges, M echecs`, avec la liste nominative des échecs.

---

## 4. Contenu et systèmes de jeu

### 4.1 Campagne — 13 secteurs, 3 boucles

| Boucle | Secteurs | Thème | Déblocage |
|---|---|---|---|
| GENESIS | 0 à 4 | découverte | ouverte |
| APOCRYPHA | 5 à 8 | maîtrise | victoire sur le nœud 4 |
| TRANSCENDANCE | 9 à 12 | expert | victoire sur le nœud 7 |

Le verrouillage est effectif : `noeudAccessible()` refuse l'accès à un nœud dont la boucle
n'est pas débloquée. Vérifié par test.

**Mécaniques spécifiques :**

| Nœud | Mécanique | Implémentation |
|---|---|---|
| 5 | visibilité réduite | halo radial, opacité 0,93 hors du rayon |
| 7 | contrôles inversés | inversion du vecteur clavier **et** du suivi tactile |
| 8 | hub | réapprovisionnement complet des charges |
| 9 | gravité zéro | inertie accumulée, amortissement 0,975, déplacement ×1,5 |
| 11 | marathon | cadence de spawn ×1,6 |

### 4.2 Boss

| Nœud | Nom | PV | Pattern | Phases |
|---|---|---|---|---|
| 4 | VORTEX | ×5 | spirale, rotation continue | 2 |
| 6 | SENTINELLE | ×8 | croix rotative + invocations | 2 |
| 7 | CORRUPTION | ×10 | croix + inversion des contrôles | 2 |
| 12 | NEXUS | ×16 | fusion (alterne 3 patterns) | **3** |

Chaque boss dispose d'au moins deux apparences, changées au passage de phase.
Séquence complète : avertissement clignotant, entrée animée, barre de vie dédiée,
mutation visuelle, séquence de mort.

Sur les secteurs sans boss dédié, un **mini-boss** apparaît dès la vague 4
(45 % des PV, pas de phase 2, récurrent).

### 4.3 Ennemis — 8 comportements distincts

| Type | Comportement | Apparition |
|---|---|---|
| chasseur | poursuite latérale | N1 |
| tireur | se poste, rafales de 3 | N1 |
| kamikaze | charge et explose au contact | N1 |
| tank | lent, résistant, occupe l'espace | N1 |
| diviseur | se scinde en 2 fragments à la mort | N3 |
| bouclier | **renvoie les tirs frontaux**, doit être contourné | N5 |
| téléporteur | disparaît, réapparaît près du joueur | N7 |
| poseur | sème des mines persistantes | N9 |

Cinq **variantes** renforcées se substituent progressivement : drone avancé, sniper élite,
tank corrompu, mine chercheuse, chasseur zéro-G.

**Formations d'arrivée :** solo, V, ligne, arc, essaim, arrivée latérale.
**Événements de vague** toutes les 3 à 4 vagues : météores, blackout, invasion latérale,
essaim, chasse à prime.

### 4.4 Modes de jeu

- **Campagne** — 13 secteurs, 3 difficultés, étoiles persistantes, nœuds rejouables.
- **Infini** — vagues procédurales, cadence ×0,95 par vague, mini-boss tous les 5 tours,
  boss majeur tous les 15. Score = `vague × 1000 + vies × 100 + points`.
- **Arena** — défi quotidien déterminé par la date (identique pour tous les joueurs
  un jour donné), 5 variantes, chronomètre, bonus de 50 % si le temps est tenu.
- **Arena Coop** — wingman IA autonome : suit en retrait, tire sur la cible la plus proche,
  esquive par changement de flanc, encaisse les projectiles, respawn après 5 s.
  Kills comptés séparément, verdict à la fin.

### 4.5 Progression et récompenses

- **Drops en jeu** — 9 types (vie, bouclier, cadence, dégâts, charges de bonus, crédits),
  taux de 30 % à 55 % selon le type d'ennemi, attraction dans un rayon de 120 px
  (192 px avec l'aimant acheté).
- **Quêtes** — 13, réclamables une seule fois, protection contre la double réclamation testée.
- **Boutique** — 14 articles en 4 rayons.
- **Étoiles** — meilleure difficulté réussie conservée par nœud.

---

## 5. Intégration Solana

### 5.1 Connexion wallet

Détection automatique, dans cet ordre :

1. **Seed Vault via Mobile Wallet Adapter** — prioritaire sur Android, en dernier ailleurs.
2. **Extensions navigateur** — Phantom, Backpack, Solflare, Glow.
3. **Mode simulation** — repli explicite, signalé par un badge jaune.

**Prérequis MWA :** Android **et** contexte sécurisé (HTTPS). Le sélecteur affiche un
bandeau explicite quand ces conditions ne sont pas réunies et grise l'option concernée.

**Gestion du jeton :** `auth_token` persisté, `reauthorize()` tenté avant `authorize()`,
suppression du jeton à la déconnexion.

**Distinction visuelle :** badge vert (Seed Vault réel) contre badge jaune (simulation),
présente dans l'interface et pas seulement dans le code.

### 5.2 Transactions on-chain

Chaque action marquante (claim quotidien, achat, déblocage de vaisseau) construit une
transaction **Memo Program** signée par le wallet du joueur :

- Programme : `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`
- Contenu : `seeker-strike:<action>` (ex. `seeker-strike:shop:wpn`)
- Réseau : **devnet**
- Envoi : `signAndSendTransactions()` via MWA
- Signatures conservées : les 20 dernières, avec action et horodatage

**Garde-fous :**

- Aucune transaction n'est émise en mode simulation.
- Une seule transaction à la fois (verrou `CHAINE.enCours`).
- Le compteur affiche **deux valeurs distinctes** : les 15 actions du jeu, et le nombre
  de transactions réellement confirmées.

**Point d'audit majeur :** voir §7.2 — cette implémentation ne constitue pas une preuve
d'activité fiable en l'état.

### 5.3 Économie

Trois entités strictement séparées :

| | Nature | Émetteur | Usage |
|---|---|---|---|
| **GC** (Genesis Credits) | monnaie interne, **non blockchain** | le jeu | tout le contenu de jeu |
| **SOL** | crypto du joueur | **personne** | achats premium uniquement |
| **SKR** | token de **Solana Mobile** | Solana Mobile | aucun usage dans le jeu |

**Le jeu ne distribue aucun SOL.** Vérifié par test automatique : après une mission,
une quête et un claim quotidien, le solde SOL est strictement inchangé.

**Aucune conversion entre monnaies.** Vérifié par test : aucun article de boutique ne
convertit une monnaie en une autre.

**Aucun token à créer, aucune trésorerie nécessaire.** GC n'existe pas on-chain.

**Positionnement SKR :** le texte des règles indique explicitement dans le jeu que SKR
appartient à Solana Mobile et que Seeker Strike n'en distribue pas. La « Seeker Task »
est présentée comme une aide à la construction d'activité on-chain, pas comme une
distribution de tokens.

---

## 6. Qualité et tests

### 6.1 Méthode

Tests d'intégration en **simulation headless** : le JavaScript est extrait du HTML et
exécuté sous Node avec un stub DOM, Canvas, Audio, localStorage et navigator.
Le stub reproduit volontairement les contraintes du WebView Seeker,
notamment l'absence de `console.info`.

### 6.2 Couverture

Démarrage et navigation entre les 10 écrans · production des 8 types d'ennemis ·
formations · comportements individuels (division, bouclier frontal, pose de mines) ·
apparition et phases des 4 boss · mode infini · Arena · Coop et wingman · drops et effets ·
bonus et charges · pause et coupure du son · quêtes et double réclamation ·
boutique et soldes insuffisants · économie (aucun SOL distribué) · orientation des sprites ·
décors par difficulté · transactions en mode simulation · musiques embarquées.

### 6.3 Bugs détectés par les tests avant livraison

Sélection représentative :

- `window.VARIANTES` ne fonctionnait que dans un navigateur — invisible en revue de code.
- Le bouclier frontal bloquait du mauvais côté (erreur d'angle de 180°).
- Le mode infini plantait sur `S.currentNode = -1`.
- Le visuel de mort du Nexus dépendait du chargement de son image.
- `renderMap` supprimée par un remplacement trop large.

### 6.4 Limites de la méthode

- **Aucun test visuel.** Le rendu n'est pas comparé à une référence.
- **Aucun test automatisé sur appareil réel.** Les validations Seeker sont manuelles.
- **Aucun test de performance.** Les 60 fps sur mobile ne sont pas mesurés.
- **Aucun test de la couche MWA réelle** — impossible hors Android + HTTPS.

---

## 7. Limites connues et risques

Cette section est volontairement exhaustive.

### 7.1 Sécurité — sauvegarde côté client

**Sévérité : élevée si les GC devaient avoir une valeur.**

L'intégralité de la progression est dans `localStorage`, en JSON non signé.
Un joueur peut ouvrir la console et écrire `S.skr = 999999`, `S.txCount = 15`,
`S.completedNodes = [0,1,…,12]`, puis `save()`.

Aucune validation serveur n'existe. **Tout classement, toute récompense et toute
éligibilité calculés à partir de cet état sont, par construction, non fiables.**

*Atténuation actuelle :* les GC n'ont aucune valeur hors du jeu, ce qui limite l'intérêt
de la triche. Le risque devient bloquant dès qu'une récompense réelle y est adossée.

### 7.2 Preuve d'activité on-chain

**Sévérité : élevée pour l'objectif annoncé.**

Les transactions sont réelles, mais :

- rien ne lie une transaction à une action de jeu **vérifiée** — le client décide seul
  quand émettre ;
- un script peut appeler `envoyerTxSeeker()` en boucle et générer de l'activité sans jouer ;
- le compteur `txCount` s'incrémente même en mode simulation, où aucune transaction n'est
  émise. Un second compteur `txOnChain` distingue les deux, mais la progression du jeu
  utilise `txCount`.

*Recommandation :* faire signer les actions côté serveur, ou lier la transaction à une
preuve de partie (score signé, seed vérifiable).

### 7.3 Classement

**Sévérité : moyenne.**

Le classement est purement local et n'affiche que les records du joueur.
Ce choix est assumé : une version antérieure affichait des noms fictifs
(`CryptoAce`, `SolWhale`), ce qui pouvait être perçu comme un faux multijoueur.
Il n'existe **aucune comparaison entre joueurs**.

### 7.4 Multijoueur

**Sévérité : informative.**

Il n'y a **aucun multijoueur réseau**. L'Arena Coop utilise une IA locale, annoncée comme
telle dans l'interface. Aucune connexion pair-à-pair ni serveur de jeu.

### 7.5 Dépendances CDN

**Sévérité : moyenne.**

Cinq dépendances externes (§3.2). Les versions majeures ne sont pas verrouillées en
version exacte. En cas d'indisponibilité de `cdn.tailwindcss.com`, la mise en page est
fortement dégradée.

*Recommandation :* auto-héberger Tailwind (build purgé) et figer les versions exactes
des paquets Solana.

### 7.6 Poids et performance

**Sévérité : moyenne sur mobile.**

Le fichier autonome pèse 6,2 Mo, dont environ 6 Mo d'assets base64 :

- premier chargement long en 4G ;
- le base64 n'est pas mis en cache séparément — toute modification du code invalide
  l'intégralité du fichier ;
- consommation mémoire élevée à l'initialisation (169 images décodées).

*Atténuation :* le build `noah-build` sépare le code (173 Ko) des assets.

### 7.7 Absence de backend

**Sévérité : structurelle.**

Aucun serveur : pas d'authentification, pas de persistance distante, pas de télémétrie,
pas d'anti-triche, pas de classement partagé, aucune récupération de compte.

### 7.8 Accessibilité

**Sévérité : faible à moyenne.**

- Aucun attribut ARIA sur les composants interactifs personnalisés (toggles, cartes).
- Navigation clavier partielle (jeu oui, menus non).
- Contrastes non audités formellement (WCAG).
- Aucune alternative textuelle sur les icônes décoratives.

### 7.9 Conformité et données

- **Aucune donnée personnelle collectée.** Pas de compte, pas d'email, pas d'analytique.
- Seule donnée sensible manipulée : l'**adresse publique** du wallet, stockée localement
  et affichée tronquée.
- Aucune clé privée n'est manipulée : la signature reste dans le wallet.
- Aucun cookie, aucun traceur tiers hors CDN de ressources statiques.

---

## 8. Recommandations priorisées

| Priorité | Action | Effort | Impact |
|---|---|---|---|
| 1 | Backend minimal : validation des scores et de la progression | élevé | débloque tout le reste |
| 2 | Lier chaque transaction à une preuve de partie vérifiable | moyen | crédibilise la Seeker Task |
| 3 | Figer les versions exactes des dépendances Solana | faible | supprime un risque de rupture |
| 4 | Auto-héberger Tailwind (build purgé) | faible | supprime la dépendance bloquante |
| 5 | Mesurer les FPS sur appareil réel, profiler le rendu | moyen | confirme la cible 60 fps |
| 6 | Audit d'accessibilité et ajout des attributs ARIA | moyen | conformité |
| 7 | Tests de rendu par capture de référence | moyen | détecte les régressions visuelles |

---

## 9. Ce que l'auditeur peut vérifier lui-même

**Sans appareil Android :**

- Ouvrir `game/seeker-strike-MOBILE.html` — le jeu est complet et jouable.
- Console : `[SEEKER] assets : N charges, 0 echecs` et `[SEEKER] musique : menu (embarquee)`.
- Le wallet affichera « HTTPS requis » et basculera en simulation — comportement attendu.
- Vérifier qu'aucune quête ni mission ne crédite de SOL.

**Avec un Seeker et une URL HTTPS :**

- Le bandeau « HTTPS requis » doit disparaître du sélecteur de wallet.
- La connexion doit ouvrir le Seed Vault.
- Un achat doit produire une ligne `[SEEKER] TX shop:<id> : <signature>`.
- La signature doit être vérifiable sur un explorateur en réseau devnet.

**Dans le code :**

- `S` et `G` — séparation entre état persistant et état de partie.
- `envoyerTxSeeker()` — construction et envoi de la transaction.
- `articlesShop()` et `listeQuetes()` — vérifier qu'aucun champ `sol` n'est positif.
- `ORIENT`, `BOSS_DEFS`, `DIFFICULTES` — tables d'équilibrage, modifiables sans risque.

---

## 10. Conclusion

Le projet livre un jeu complet et cohérent, avec une intégration Solana fonctionnelle sur
devnet et une économie volontairement conçue pour **n'engager aucune trésorerie**.

Les partis pris assumés — pas de backend, pas de multijoueur réseau, classement local —
sont explicites dans l'interface et dans ce document.

La principale réserve pour une mise en production concerne la **confiance accordée au
client** : tant que l'état de jeu réside uniquement dans le navigateur, aucune récompense
de valeur ne peut y être adossée sans risque. C'est le premier chantier à traiter si le
projet dépasse le cadre du hackathon.

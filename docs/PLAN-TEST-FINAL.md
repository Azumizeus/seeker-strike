# Plan de test final — Seeker Strike v4.2

**À dérouler sur le Seeker avant intégration Noah.**
Deadline : 13 août 18h00 (Europe/Paris).

Fichier à tester : `game/seeker-strike-MOBILE.html` (10,5 Mo, autonome, aucun
dossier requis). Transfère-le seul sur le téléphone et ouvre-le.

Compte le temps : la recette complète tient en **45 minutes**.

---

## Comment noter

Pour chaque ligne : ✅ conforme · ⚠️ gênant mais jouable · ❌ bloquant.

Un ❌ sur une ligne marquée **[BLOQUANT]** interdit le déploiement tant
qu'il n'est pas corrigé.

---

## 1 · Démarrage et affichage (5 min)

| # | À vérifier | Attendu |
|---|---|---|
| 1.1 | Ouverture du fichier | Splash en moins de 5 s **[BLOQUANT]** |
| 1.2 | Attendre 15 s sans toucher | Le trailer démarre |
| 1.3 | Regarder le trailer 2 min 20 | 7 tableaux, 4 boss, 7 vaisseaux différents, aucun losange ni carré violet **[BLOQUANT]** |
| 1.4 | Toucher l'écran | Retour au splash immédiat |
| 1.5 | Entrer dans le jeu | Accueil complet, icônes affichées (pas d'emojis de secours) |

## 2 · Le bas de page (3 min) — le point le plus repris

Fais défiler **jusqu'en bas** sur chacun de ces écrans. Le dernier élément
doit être **entièrement visible**, jamais recouvert par la barre d'onglets.

| # | Écran | Dernier élément attendu |
|---|---|---|
| 2.1 | Accueil | Le bloc TRANSMISSION vert **[BLOQUANT]** |
| 2.2 | Armory | Le dernier consommable, bouton compris **[BLOQUANT]** |
| 2.3 | Réglages | La ligne de version « v4.2 • devnet » **[BLOQUANT]** |
| 2.4 | Hangar | Le 14e vaisseau et son bouton |
| 2.5 | Bestiaire | La dernière fiche (NEXUS PRIME) |
| 2.6 | Quêtes | Le dernier secret + la phrase d'explication |

## 3 · Orientation (2 min)

| # | Action | Attendu |
|---|---|---|
| 3.1 | Tourner en paysage dans les menus | Rien ne se bloque, tout reste lisible |
| 3.2 | Lancer une mission, tourner en paysage | Voile « TOURNE TON TÉLÉPHONE » + partie en pause **[BLOQUANT]** |
| 3.3 | Revenir en portrait | Le voile disparaît, la partie reprend seule |
| 3.4 | Tourner deux fois de suite en pleine action | Le vaisseau reste dans l'écran, pas de décalage |

## 4 · Combat et lisibilité (10 min)

| # | À vérifier | Attendu |
|---|---|---|
| 4.1 | Nœud 1 en Normal | Les ennemis arrivent posément, on a le temps de comprendre |
| 4.2 | Boutons de boost | Atteignables au pouce sans se contorsionner **[BLOQUANT]** |
| 4.3 | Les 3 bonus | Mitraillette, bombe et fantôme s'activent et se voient |
| 4.4 | Butin ramassé | Affiche « NOYAU / ÉCLAT DE DONNÉES ». **Jamais +SOL ni +SKR** **[BLOQUANT]** |
| 4.5 | Contrat en haut du HUD | Le compteur avance en direct |
| 4.6 | Atteindre 2 500 points | Bandeau « PALIER 2 500 • +1 VIE » |
| 4.7 | Nœud 9 (Débris Oubliés) | Le drone harceleur reste sur les flancs et tire en diagonale |
| 4.8 | Nœud 7 (Corruption) | Commandes inversées **jouables** : le vaisseau va au miroir du doigt **[BLOQUANT]** |
| 4.9 | Nœud 20 (Portail) | Mêmes commandes inversées, boss LE GARDIEN présent |
| 4.10 | Un secteur avec poseur de mines | Les mines s'éteignent d'elles-mêmes, le terrain ne se fige pas |


## 4 bis · Nouveaux systèmes (5 min)

| # | À vérifier | Attendu |
|---|---|---|
| 4.11 | Bestiaire → onglet **BUTIN** | 9 objets expliqués + section ⚠ À NE PAS TOUCHER |
| 4.12 | Mines du Poseur en jeu | **Rouges, croix, pointes** — jamais confondues avec du butin **[BLOQUANT]** |
| 4.13 | Ramasser chaque type de butin | Le nom affiché correspond à la fiche du bestiaire |
| 4.14 | Hangar | Les 14 skins sont **tous différents** **[BLOQUANT]** |
| 4.15 | Comet et Raptor côte à côte | Deux sprites distincts (bug corrigé) |
| 4.16 | Drone harceleur, mine chercheuse | Orientés vers le joueur, pas de travers |

## 4 ter · Fin de mission et contrats (6 min)

C'est la nouveauté la plus importante de la version : jusqu'ici un secteur
ne pouvait pas se gagner.

| # | À vérifier | Attendu |
|---|---|---|
| 4.17 | Terminer un secteur de combat (N1) | HUD affiche `VAGUE 3/6`, puis **✅ SECTEUR SÉCURISÉ** vers 1 min 30 **[BLOQUANT]** |
| 4.18 | Terminer un secteur à boss (N4) | Le boss tombe → **☠️ SECTEUR NEUTRALISÉ** **[BLOQUANT]** |
| 4.19 | Juste après la victoire | Plus aucun ennemi n'apparaît, 2,4 s puis écran de résultat |
| 4.20 | Mode Infini | Ne se termine **jamais** tout seul |
| 4.21 | Écran de préparation, changer de difficulté | L'objectif **et** la prime du contrat changent en direct |
| 4.22 | N1 en Normal puis en Extrême | 45 unités / +150 GC, puis 79 unités / +450 GC |
| 4.23 | Refaire N1 en Extrême après l'avoir fait en Normal | La prime est **de nouveau versée** (récompense par difficulté) |
| 4.24 | Secteur avec Poseur (N11) | Les mines **descendent** vers toi, elles ne restent plus en haut |
| 4.25 | Bestiaire → onglet HANGAR | 14 vaisseaux, dégâts, type de tir, voie d'accès |

## 5 bis · Modes annexes (4 min)

| # | Mode | Attendu |
|---|---|---|
| 5.6 | Arena — défi du jour | Chrono, objectif, bonus de 50 % si tenu |
| 5.7 | Arena Coop | Wingman IA présent, il tire, il respawne, ses kills sont comptés |
| 5.8 | Nœud Comptoir (C14) | Marchand, prix réduits |
| 5.9 | Nœud Havre (C17) | Soin et recharge |
| 5.10 | Nœud Signal Inconnu (C18) | Événement mystère aléatoire |
| 5.11 | Nœud Coffre (C19) | Butin multiplié |
| 5.12 | Laisser le jeu 60 s sans y toucher | Retour accueil puis trailer automatique |
| 5.13 | Easter eggs | Logo ×7 → Ghost · 4 coins horaire → Code Orbital |

## 5 · Difficulté (5 min)

Même nœud, trois fois de suite.

| # | Difficulté | Attendu |
|---|---|---|
| 5.1 | Normal | Accessible, on termine sans forcer |
| 5.2 | Difficile | Nettement plus dense, ennemis plus résistants |
| 5.3 | Extrême | Étouffant mais pas absurde. **~44 % plus dense que Normal** |
| 5.4 | Infini, 3 premières vagues | Ouverture calme (≈3 s entre deux ennemis) |
| 5.5 | Infini, vague 12 | Premier mini-boss |

## 6 · Progression et économie (8 min)

| # | À vérifier | Attendu |
|---|---|---|
| 6.1 | Terminer un secteur | « ✓ CONTRAT REMPLI » + GC crédités |
| 6.2 | Le refaire | Le contrat ne repaie pas |
| 6.3 | Battre le Vortex plusieurs fois | Environ 1 fois sur 3 : fragment de CLÉ GENESIS |
| 6.4 | Nœud 9 sur la carte | Cadenas tant que la clé n'est pas complète |
| 6.5 | Clé complète | Le nœud s'ouvre |
| 6.6 | Hangar | 6 vaisseaux en SOL, 8 sans SOL, conditions affichées en clair |
| 6.7 | Acheter sans wallet | Refus explicite |
| 6.8 | Armory | 14 articles, **14 icônes différentes** **[BLOQUANT]** |
| 6.9 | Quêtes | 22 quêtes + 2 clés + 4 secrets, compteurs cohérents |

## 7 · Langue (3 min)

| # | Action | Attendu |
|---|---|---|
| 7.1 | Réglages → EN | Tout bascule sans recharger **[BLOQUANT]** |
| 7.2 | Parcourir tous les écrans en EN | Aucun texte français oublié |
| 7.3 | Lancer une mission en EN | Briefing, contrat et HUD en anglais |
| 7.4 | Bestiaire en EN | 31 fiches + onglet BUTIN traduits |
| 7.5 | Fermer et rouvrir | La langue est conservée |
| 7.6 | Repasser en FR | Retour complet |

## 8 · Audio (3 min)

| # | Écran | Piste attendue |
|---|---|---|
| 8.1 | Accueil | menu_theme |
| 8.2 | Carte | map_theme |
| 8.3 | Secteur Genesis | combat_theme |
| 8.4 | Secteur Chaos | combat_chaos (différente) |
| 8.5 | Boss Genesis / Chaos | boss_theme / boss_chaos |
| 8.6 | Fin de mission | Jingle de victoire ou game over |
| 8.7 | Couper la musique dans les Réglages | Silence immédiat et durable |

## 9 · Sauvegarde (3 min)

| # | Action | Attendu |
|---|---|---|
| 9.1 | Fermer et rouvrir | Progression, GC, vaisseaux, langue intacts **[BLOQUANT]** |
| 9.2 | Réglages → Reset Run | Seeker Task et streak remis à zéro, campagne conservée |
| 9.3 | Mode dev (5 appuis sur la version) | Panneau ambré |
| 9.4 | TOUT DÉBLOQUER | 14 vaisseaux, 22 secteurs, 4 secrets, 2 clés, +50 000 GC |
| 9.5 | Reset Usine | Retour à l'état d'origine |

## 10 · Wallet (5 min) — nécessite HTTPS

À faire sur le build `noah-build/` servi en HTTPS, **pas** sur le fichier
autonome.

| # | Action | Attendu |
|---|---|---|
| 10.1 | Connecter le wallet | Seed Vault s'ouvre, adresse affichée **[BLOQUANT]** |
| 10.2 | Première connexion | « Bonus de bienvenue • +600 GC ». **Aucune mention de SOL** **[BLOQUANT]** |
| 10.3 | ENVOYER 1 TX | Demande de signature dans le wallet |
| 10.4 | Signer | Compteur 1/15, toast « TX confirmée on-chain » |
| 10.5 | Refuser une signature | Message d'échec, compteur inchangé |
| 10.6 | Vérifier sur l'explorateur devnet | La transaction Memo existe |

---

## Priorités si le temps manque

Dans l'ordre, ne saute rien avant d'avoir fait :

1. **§2** bas de page — le défaut le plus repris
2. **§10.1 et 10.2** wallet — c'est l'angle Solana du hackathon
3. **§4.8** commandes inversées — mécanique récemment réparée
4. **§1.3** trailer — ce que verra le jury en premier
5. **§7.1** bascule de langue

## Ce qui reste connu et assumé

- Le fichier autonome pèse 10,5 Mo : quelques secondes de chargement la
  première fois, puis mis en cache.
- Le jackpot hebdomadaire n'est pas codé — à présenter en roadmap, pas
  comme une fonctionnalité livrée.
- Le Mobile Wallet Adapter n'a jamais tourné sur un vrai appareil : c'est
  l'inconnue principale de cette recette.

---

## Après la recette

1. Corriger les bloquants
2. Relancer les 14 suites de tests automatiques
3. Régénérer le build autonome : `python3 game/build_autonome.py`
4. Copier `game/index_v37.html` + `game/assets/` vers `noah-build/`
5. Supprimer `noah-build/game.js`, `sprites.js`, `sprites-inline.js` (6,6 Mo inutiles)
6. Déployer en HTTPS et refaire uniquement le §10

# v4.0 — Campagne étendue et mode infini

## Ce qui est fait : [1] et [3]

### [1] Campagne : 8 → 13 nœuds, 3 boucles

| # | Nom | Boucle | Type | Mécanique |
|---|---|---|---|---|
| 0 | QG Seeker | 1 | départ | — |
| 1 | Éveil | 1 | combat | — |
| 2 | Champ d'astéroïdes | 1 | combat | — |
| 3 | Périls | 1 | combat | — |
| 4 | **Vortex** | 1 | **boss** | spirale |
| 5 | Nébuleuse | 2 | combat | **visibilité réduite** |
| 6 | Station Sigma | 2 | élite | — |
| 7 | **Corruption** | 2 | **boss** | **contrôles inversés** |
| 8 | QG Terre | 2 | **hub** | réapprovisionnement complet |
| 9 | Débris Oubliés | 3 | secret | **gravité zéro** |
| 10 | Redressement | 3 | combat | — |
| 11 | Point de rupture | 3 | combat | **marathon** (spawn ×1,6) |
| 12 | **NEXUS** | 3 | **boss final** | **fusion, 3 phases** |

Les 13 nœuds sont atteignables, vérifié par parcours du graphe.

### Mécaniques implémentées
- **Brouillard** (N5) : halo radial autour du vaisseau, le reste de l'écran s'assombrit
- **Inversion** (N7) : clavier ET tactile inversés — le vaisseau fuit le doigt
- **Gravité zéro** (N9) : accumulation d'inertie (`vx/vy`), amortissement 0,975, déplacement ×1,5
- **Marathon** (N11) : cadence de spawn ×1,6, aucun répit
- **Hub** (N8) : recharge les 3 bonus à la fin du nœud

### Boss NEXUS
PV ×16, rayon 96, **3 phases** (50 % puis 22 % des PV), vitesse 1,7 → 2,9 → 3,8.
Pattern `fusion` : alterne spirale, croix rotative et éventail visé toutes les 4 s,
intensité croissante par phase. Phases 1/2/3 atteintes en test.

### [3] Mode infini
Bouton **♾️ INFINI** sur l'accueil.

- Vagues sans fin, cadence de spawn **×0,95 par vague**
- Types débloqués progressivement : chasseur → tireur (v3) → tank (v6) → kamikaze (v9)
- **Mini-boss toutes les 5 vagues**, boss majeur toutes les 15 (PV +4 %/vague)
- Score = `vague × 1000 + vies × 100 + points`
- Record persistant affiché sur l'accueil
- N'affecte ni la campagne ni les étoiles — vérifié par test

Mesuré en simulation : vague 14 atteinte, cadence ×0,51, les 4 types actifs.

## Assets intégrés
- **8 décors de combat** (N1–N8) → `assets/levels/`, 539 Ko au total, mappés sur les 13 nœuds
- **8 vignettes de nœuds** embarquées en base64, affichées sur la carte
- **nav_map** et **stat_health** corrigés (les 2 icônes que tu voulais refaire)

## Reste à faire — v4.2
[2] déblocage par boucle · [4] speedrun + ghost · [5] daily seed

## Tests : 31 scénarios, tous verts

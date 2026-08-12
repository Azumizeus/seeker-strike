# CHAOS PROTOCOL — seconde campagne

## Accès
Débloquée après la victoire sur le **NEXUS (nœud 12)**.
Un bouton **CHAOS ▶** apparaît alors en haut à gauche de la carte et bascule entre les deux campagnes.
Avant cela, il est masqué — le joueur découvre d'abord Genesis, qui est la campagne la plus aboutie.

## Les 6 secteurs

| # | Nom | Type | Mécanique |
|---|---|---|---|
| 13 | Brèche | combat | — |
| 14 | Essaim Noir | combat | flux continu (marathon) |
| 15 | **FRACTURE** | **boss** | PV ×13, 2 phases, invocations |
| 16 | Champ Aveugle | combat | gravité zéro |
| 17 | Signal Inversé | combat | commandes inversées |
| 18 | **NEXUS PRIME** | **boss final** | PV ×22, **3 phases**, pattern fusion |

## Différences avec la campagne principale

- **Les 8 types d'ennemis sont disponibles dès le nœud 13** — aucune montée progressive.
- **Toutes les variantes d'élite sont actives d'entrée** : chasseur zéro-G, sniper élite,
  drone lourd, mine chercheuse. Statistiques renforcées par rapport à Genesis.
- Les mécaniques spéciales arrivent enchaînées, sans secteur de repos.

## Les sprites

Les deux jeux de boss fusion sont maintenant utilisés :

- **`sprite sesion 2`** (pixel art) → NEXUS, nœud 12
- **racine de `new asset sprite`** (flat graphique) → NEXUS PRIME et FRACTURE, carte 2

Deux boss finaux visuellement distincts, aucun asset inutilisé.

## Narration

Six transmissions inédites, deux épilogues. L'arc : le Nexus n'était pas l'origine,
il imitait quelque chose. NEXUS PRIME est la forme originelle.

Le générique de fin se déclenche désormais après le **nœud 18** si Chaos est débloqué,
sinon après le nœud 12 — un joueur qui n'ouvre pas la carte 2 voit quand même une fin.

## Tests
7 scénarios : structure, verrouillage avant le Nexus, bascule entre campagnes,
combat contre FRACTURE, les 3 phases de NEXUS PRIME, variantes d'élite dès le nœud 13,
et non-régression de la campagne principale.

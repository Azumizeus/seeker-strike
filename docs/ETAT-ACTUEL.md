# ÉTAT ACTUEL — SEEKER STRIKE v3.5

> Généré par lecture directe de `game/index.html` (809 lignes, monolithe HTML+CSS+JS).
> Stack : HTML5 Canvas + vanilla JS + Tailwind CDN + police Orbitron. Aucun build.

## Save
- Clé localStorage : `ss_v35` (ancienne clé `ss_v2` présente dans le code)
- Flag séparé : `ss35_first` (bonus première connexion wallet)

## State global `S`
```js
{
  connected:false, address:'',
  sol:11, skr:2600,
  weapon:1, fireRate:1.0, maxLives:3,
  ship:0, unlocked:[0,1],
  unlockedMun:['std','spread'],
  charges:{ mitra:2, nuke:1, ghost:1 },
  streak:0, lastClaim:null, txCount:0,
  totalKills:0, highScore:0, raceWins:0,
  completedNodes:[0], currentNode:1,
  ghostUnlocked:false, logoTaps:0, secretBossKilled:false
}
```
`loadout = { mode:'pilote', ship:0, munition:'std', bonus:null }`
`G` = état de la partie en cours (null hors mission).

## SHIPS (6)
| id | nom | bonus | prix SOL |
|---|---|---|---|
| 0 | 🚀 Seeker One | x1.00 | 0 (départ) |
| 1 | 🛸 Phantom | x1.12 | 0 (départ) |
| 2 | ☄️ Comet | x1.25 | 1.8 |
| 3 | 🌌 Nebula | x1.38 | 2.8 |
| 4 | 👑 King | x1.55 | 4.0 |
| 5 | 👻 Ghost | x1.70 | secret (`ghostUnlocked`) |

## MUNITIONS (4)
| id | nom | dmg | cadence | spread |
|---|---|---|---|---|
| std | Standard | 1 | 1 | 0 |
| perf | Perforantes | 1.55 | 0.7 | 0 |
| spread | Spread | 0.85 | 0.9 | 2 |
| hyper | Hyper Rapid | 0.65 | 1.7 | 0 |

## MODES (4)
| id | nom | vies | spawn | hp | speed | reward |
|---|---|---|---|---|---|---|
| facile | Facile | 5 | 1.35 | 0.75 | 0.85 | x0.85 |
| explo | Explorateur | 4 | 1.1 | 0.9 | 0.95 | x1.0 |
| pilote | Pilote | 3 | 1.0 | 1.0 | 1.0 | x1.2 |
| chasseur | Chasseur | 2 | 0.72 | 1.35 | 1.25 | x1.7 |

## BONUS consommables (3)
- 🔫 `mitra` — Mitrailleuse, cadence extrême 18 s
- ☢️ `nuke` — Bombe nucléaire, détruit tout à l'écran
- 👻 `ghost` — Vaisseau allié 22 s

## NODES — carte campagne (8)
0 QG Seeker (start) → 1 Transmission Alpha → {2 Couloir Est, 3 Anomalie Ouest} → 4 Carrefour → 5 Secteur Élite (elite) → 6 Approche Guardian (boss) → 7 Genesis Gate (final)

## ASSETS — 31 PNG dans `game/assets/`
- **Ships (7)** : ship, ship2, ship_king, ship_ghost, ship_orange, ship_v2, ghost_v2
- **Ennemis (7)** : enemy_bot, enemy_red, enemy_heavy, enemy_elite, heavy_v2, boss, boss_v2
- **Projectiles & VFX (6)** : bullet, bullet_green, explosion, explosion2, explosion_v3, trail
- **Collectibles (3)** : orb_sol, orb_skr, orb_sol_white
- **Icônes (8)** : icon_mitra, icon_nuke, icon_shield, icon_chasseur, icon_facile, icon_story, icon_mitra_white, icon_nuke_white

Chargement : `loadAssets()` en `new Image()` avec `onerror → console.warn` (le jeu ne crashe pas si un asset manque).

## Écrans (`show(id)`)
`s-home` · `s-map` · `s-prep` · `s-solo` (canvas) · `s-multi` · `s-shop` · `s-ships` · `s-quests`

## Systèmes en place
- **Combat canvas** : `initGame` → `loop` → `update`/`draw`, spawn par vagues, boss, particules, explosions, orbes SOL/SKR
- **Audio** : WebAudio maison — `beep()`, `sfx()`, `startMusic()`/`stopMusic()` (boucle 280 ms)
- **Haptique** : `vibrate(ms)` via `navigator.vibrate`
- **Wallet** : `toggleWallet()` — ⚠️ **MOCK** (adresse aléatoire `Seek…skr`), bonus first-connect +3 SOL +600 SKR
- **Daily streak** : `claimDaily()` — récompense croissante `0.4+streak*0.15` SOL / `80+streak*30` SKR
- **Seeker Task** : `addTx()` — au 15e TX → airdrop éligible + 500 SKR
- **Multi** : `startRace()` course 40 s contre IA locale — ⚠️ **MOCK**
- **Leaderboard** : `renderLB()` — 5 noms en dur + "You" — ⚠️ **MOCK**
- **Shop** : `buy(id)`, déblocage vaisseaux `unlockShip(id)`
- **Secret** : `logoTaps` → `ghostUnlocked` → vaisseau Ghost + `secretBossKilled`

## Dette technique
| # | Problème | Gravité |
|---|---|---|
| 1 | Wallet 100 % mock, aucune connexion Solana réelle | 🔴 |
| 2 | Aucune transaction on-chain — "TX" = compteur local | 🔴 |
| 3 | Multi = IA locale, pas de backend | 🟠 |
| 4 | Leaderboard statique non partagé | 🟠 |
| 5 | Monolithe 809 lignes non maintenable | 🟠 |
| 6 | Zéro test | 🟡 |
| 7 | Zéro accessibilité (ARIA, focus, contrastes) | 🟡 |
| 8 | Pas d'i18n (FR hardcodé) | 🟡 |
| 9 | Pas de PWA (manifest / service worker) | 🟡 |
| 10 | Pas d'écran Settings / reset (→ MODIF #1) | 🟡 |

---
⚠️ **À compléter** : si le récap détaillé de Noah contient des infos non visibles dans le code (intentions design, roadmap interne), colle-le sous cette ligne.

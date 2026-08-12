# Batterie de tests — Seeker Strike v4.2

Rejoue l'intégralité de l'audit sur les **trois builds** du jeu.

## Lancer

```bash
cd tests
npm install jsdom      # une seule fois (déjà présent dans node_modules/)
./run.sh
```

Sortie attendue : `TOUT PASSE (87 exécutions)`.
Seules les lignes en échec s'affichent — pas de bruit.

## Ce qui est testé

| Suite | Portée |
|---|---|
| `audit_sc` | cohérence des données : vaisseaux, nœuds, boss, économie, sauvegarde |
| `audit_dyn2` | **66 parties complètes** — 22 nœuds × 3 difficultés, 7 s de combat chacune |
| `audit_dom` | 100 identifiants, 54 gestionnaires, doublons, navigation |
| `boss_sc` | les 10 boss attaquent, 20 s de combat chacun |
| `enn2_sc` | tir par type d'ennemi, en isolation stricte |
| `prog_sc` | chaînage de campagne, non-contamination par le mode démo |
| `cap_sc` | plafonds de boosts par secteur et difficulté |
| `calib_sc` | calibrage du butin, 200 000 tirages par difficulté |
| `inf_sc` | mode infini : progression des types, décors, musique |
| `sign_sc` `recon_sc` `b58_sc` | canaux de signature, reconnexion wallet, base58 |
| `task_sc` `tres_sc` `skr_sc` `don_sc` | Seeker Task, trésorerie, transfert SPL, dons |
| `pal_sc` `egg_sc` `term_sc` | paliers on-chain, easter egg DEVNET, terminal |
| `i18n_full` `panneaux_sc` `lang_sc` | traduction exhaustive, panneaux, choix initial |
| `orient_test` `term_pos` `boost_sc` | portrait imposé, position du terminal, ergonomie |
| `sim_sc` `logo_sc` `p191_sc` | retrait du mode simulation, logo, cadence 60 Hz |

## Comment ça marche

`harness_base.js` / `harness_auto.js` / `harness_noah.js` extraient le script
du build correspondant et l'exécutent sous Node avec un DOM, un canvas, un
`localStorage` et un contexte audio simulés.

Deux mécanismes rendent le combat reproductible :

- **horloge simulée** (`avancerTemps`) — le tir dépend du temps réel, sans
  cela 3 000 images s'exécutent en quelques millisecondes et personne ne tire ;
- **générateur pseudo-aléatoire à graine fixe** (`fixerHasard`) — deux
  exécutions donnent exactement la même partie.

Les suites `orient_test`, `lang_test`, `term_pos` et `audit_dom` utilisent
jsdom et vérifient les trois builds en interne.

## Convention de sortie

- `RES ok` — vérification passée
- `RES !!` — avertissement, à lire mais non bloquant
- `RES KO` — échec
- dernière ligne : `RES TOUS LES TESTS PASSENT` ou `RES n ECHECS`

## Limite connue

Ces tests ne remplacent pas une manette dans les mains. Ils vérifient la
logique, les données, la chaîne Solana et le DOM — pas le ressenti de jeu ni
le rendu visuel réel. La recette manuelle est en section 7.3 du dossier
technique.

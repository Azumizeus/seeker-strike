# v3.10 — Immersion et polish

## 1. Écran de démarrage
- Splash plein écran, logo « SEEKER STRIKE » en dégradé violet→vert avec glow, apparition en fade
- Fond `bg_home` avec **Ken Burns** : zoom lent 1 → 1,16 sur 22 s, aller-retour
- « APPUYER POUR COMMENCER » en bas, pulsation 2,1 s
- Au tap : fondu 0,5 s → thème menu → accueil
- **Première visite** : tuto 3 slides (se déplacer / tirer / objectif), mémorisé dans `ss_tuto_vu`

## 2. Infrastructure audio — `Audio2`
Deux canaux séparés, chargement paresseux, **aucun fichier obligatoire**.

- `Audio2.jouerMusique('menu'|'combat'|'boss')` — une piste à la fois, boucle, fondu d'entrée 14 pas
- `Audio2.jouerSfx(cle)` — instance clonée à chaque appel, sons superposables
- Volumes : musique 0,45 · SFX 0,65
- Respect strict de `S.prefs.son` et `S.prefs.musique`, `majPreferences()` appelé à chaque toggle
- **Repli automatique** : si un fichier manque ou échoue, on retombe sur la synthèse WebAudio d'origine.
  Le jeu sonne comme avant, il ne casse jamais.

Fichiers attendus dans `assets/audio/` — voir `assets/audio/LISEZ-MOI.txt` pour la liste exacte.
Le thème boss se déclenche automatiquement sur les nœuds 4, 6 et 7.

## 3. Polish visuel
- **Transitions** : fade + slide 12 px sur 0,3 s à chaque changement d'écran ; léger zoom pour l'entrée en mission
- **Poussière d'étoiles** sur l'accueil : 10 / 20 / 32 particules selon le réglage Particules, animation CSS pure (GPU)
- **Haptique différenciée** — 7 motifs distincts :

| Événement | Motif (ms) |
|---|---|
| tir | `[7]` |
| dégât | `[28,36,28]` |
| explosion / kamikaze | `[55,28,85]` |
| mort de boss | `[90,50,90,50,140]` |
| victoire | `[40,55,40,55,120]` |
| défaite | `[130,70,130]` |
| bouton | `[10]` |

- **Screen shake** renforcé : tir reçu 14 → 18, mort de boss 26 → 34

## 4. Mode démo attract
Sans interaction pendant **15 s** sur l'écran titre, une partie se lance toute seule :
nœud 4 (boss Vortex) en difficulté Difficile, badge « DÉMO » discret en haut.

Le pilote automatique fuit la menace la plus proche (champ de répulsion sur projectiles et ennemis),
va chercher les orbes quand la voie est libre, reste dans la moitié basse et se recentre horizontalement.
N'importe quelle interaction rend la main et ramène au splash.

## Tests headless — 18 scénarios, tous verts
Les 13 précédents, plus : audio 2 canaux sans fichiers, 7 motifs haptiques distincts,
tuto 3 étapes mémorisé, pilote auto actif et stable, splash et poussière sans crash.

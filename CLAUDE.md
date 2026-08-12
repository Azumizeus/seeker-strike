# CLAUDE.md — SEEKER STRIKE v3.5

> Contexte auto-lu au démarrage de chaque session. Réalité terrain uniquement.

---

## IDENTITÉ

**Jeu** : Seeker Strike v3.5 — shoot'em up canvas HTML5
**Fichier unique** : `game/index_v37.html` (~8 200 lignes, vanilla JS + Tailwind CDN, police Orbitron)
**Save** : `localStorage` clé **`ss_v35`** (flag annexe `ss35_first` = bonus première connexion wallet)
**Assets** : `game/assets/` (31 PNG, chemins relatifs `assets/`)

**Hackathon** : NoahAI Nitro 01 — Solana Gaming × Solana Mobile
**Deadline** : 13 août 2026, 18h00 (Europe/Paris)
**Founder / décision finale** : AzumiZeus — francophone, réponds toujours en français.

---

## STACK RÉELLE

- **Aucun build.** Ouvrir `game/index.html` dans un navigateur = ça marche.
- Pas de npm, pas de Vite, pas de React.
- HTML + CSS + JS inline dans un seul fichier. Canvas 2D pour le rendu.
- Audio : WebAudio maison (`beep`/`sfx`/`startMusic`). Haptique : `navigator.vibrate`.
- **Tests : jouer manuellement.**

---

## RÈGLES IMPÉRATIVES

1. **Fichier complet** renvoyé à chaque modif (jamais de diff partiel, jamais de « … reste inchangé »)
2. **Zéro régression** — si un système existant casse, c'est bloquant
3. **Commentaires en français** dans le code
4. **`S.prefs` fusionné au `load()`** pour compatibilité anciennes saves
5. **Réponses concises** : liste changements 3 lignes max

---

## STRUCTURE DOSSIER

```
game/index.html      ← le jeu
game/assets/         ← 31 PNG (jamais déplacer)
docs/REPRISE.md      ← plan de reprise session Noah
docs/ETAT-ACTUEL.md  ← état technique complet
docs/PROMPTS.md      ← prompts prêts à l'emploi
assets/              ← médias hackathon (vide)
_backup/             ← zip source original
```

**Ordre de lecture en reprise de session** : `docs/REPRISE.md` → `docs/ETAT-ACTUEL.md` → `docs/PROMPTS.md`

---

## PROCHAINE TÂCHE

**Plan de test physique sur Seeker** le 13 août au matin — checklist en fin de `docs/BRIEF-NOAH.md`.
Documents de passation : `docs/BRIEF-KIMI-K3.md`, `docs/JOURNAL-MODIFS.md`.

---

## PIÈGES CONNUS

- ❌ Ne **PAS** chercher `CHANGELOG.md` ni `ROADMAP_5J.html` (n'existent pas)
- ❌ Ne **PAS** proposer Vite / React / TypeScript (hors scope hackathon)
- ❌ Ne **PAS** déplacer `game/assets/` (chemins relatifs — tout casse)
- ✅ Wallet et transactions sont **réels** depuis la v4.0 : vraies signatures
  MWA / Phantom / Backpack, vrais mémos Solana devnet, vérifiables sur Solscan.
  (L'ancienne mention « mock » datait de la v3.5 — périmée.)
- ⚠️ La clé `ss_v2` traîne encore dans le code — la clé active est `ss_v35`.

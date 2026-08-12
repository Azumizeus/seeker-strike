# Passer en vrai Git — 5 minutes

*13 août 2026. Deadline : aujourd'hui 18 h.*

---

## Ton dossier n'est pas en pagaille

C'est le point important. Voilà ce qu'il contient réellement :

```
HACKATHON-NOAHAI-NITRO-01/
├── game/          le jeu, les builds, les scripts de build
├── tests/         la batterie (115 exécutions)
├── docs/          toute la documentation
├── noah-build/    le dossier de déploiement
├── audit/         la copie allégée pour relecture
├── assets/        médias hackathon
├── logo , icone , banniere ecosysteme Seeke Nexus/   sources graphiques
├── _backup/       sources originales (330 Mo, local seulement)
├── CLAUDE.md      contexte du projet
├── ziBRgzZL       ← un zip mal téléchargé, 22 Mo
└── seeker-strike-noah.zip   ← vide, 0 octet
```

Six dossiers structurés, un fichier de contexte, et **deux fichiers parasites**.
Ce n'est pas du désordre, c'est un projet normal.

**Et surtout : Git ne demande aucun rangement.** Il prend le dossier tel quel.
Le `.gitignore` fait le tri automatiquement — je l'ai déjà créé pour toi.

---

## Ce que le .gitignore écarte

| Écarté | Pourquoi |
|---|---|
| `_backup/` | 330 Mo de sources originales, inutiles à distance |
| `tests/node_modules/` | 26 Mo réinstallables par `npm install` |
| `*.zip`, `ziBRgzZL` | archives régénérables |
| `game/index.html`, `index_backup_v36.html`, `assets_opt/` | vestiges d'anciennes versions |
| `.DS_Store` | bruit macOS |

**Reste versionné : environ 92 Mo.** GitHub accepte jusqu'à 100 Mo *par fichier*
— ton plus gros fait 12 Mo. Aucun problème. Compte quelques minutes de push.

---

## Les commandes, dans l'ordre

Ouvre le Terminal et colle ligne par ligne :

```bash
cd ~/Desktop/"HACKATHON-NOAHAI-NITRO-01 "
```

*(attention à l'espace final dans le nom du dossier — les guillemets le gèrent)*

```bash
# 1. Jeter les deux fichiers parasites
rm -f ziBRgzZL seeker-strike-noah.zip

# 2. Initialiser
git init
git add -A
git commit -m "Seeker Strike v4.4 — arborescence complète"

# 3. Brancher sur ton dépôt existant
git remote add origin https://github.com/Azumizeus/seeker-strike.git
git branch -M main

# 4. Remplacer le contenu à plat par la vraie arborescence
git push -u origin main --force
```

`--force` écrase le dépôt distant par ton état local. C'est voulu : ton local
fait autorité, et le contenu à plat actuel est incomplet de toute façon.

---

## Ensuite, chaque livraison tient en trois lignes

```bash
git add -A
git commit -m "ce que j'ai changé"
git push
```

Fini le glisser-déposer fichier par fichier sur l'interface GitHub.

---

## Faut-il le faire maintenant ?

**Oui, et vite.** Noah s'est déjà trompé deux fois à cause du dépôt à plat :
il a cherché `audit/` qui n'existait pas, et il a pris `demo3_sc.js` (un
scénario de test) pour l'implémentation. Chaque aller-retour de ce genre coûte
plus cher que les 5 minutes ci-dessus.

Si ça coince pour une raison quelconque : **arrête et garde le dépôt à plat**.
Il fonctionne. On ne prend aucun risque structurel à 17 h de la deadline.

---

## Message à donner à Noah

> Le dépôt est passé en arborescence complète. Ce que tu cherchais est là :
>
> ```
> game/index_v37.html      ← LA SOURCE DE VÉRITÉ, toute correction va ici
> game/build_autonome.py   ← régénère seeker-strike-MOBILE.html
> game/build_noah.py       ← régénère seeker-strike-NOAH.html
> noah-build/              ← le dossier à déployer (index.html + public/assets/)
> noah-build/reecrire_chemins.py
> tests/                   ← 37 scénarios + 3 harnais + 4 suites jsdom
> tests/run.sh             ← 115 exécutions, attendu : TOUT PASSE
> tests/lot.sh             ← même chose par tranches : bash lot.sh 1 12
> docs/REPONSE-NOAH.md     ← réponse point par point à ton audit
> docs/BRIEF-NOAH.md       ← déploiement, CSP, règles à ne pas enfreindre
> docs/JOURNAL-MODIFS.md   ← tout ce qui a changé, bloc par bloc
> audit/                   ← ce que tu réclamais : 6 fichiers, 548 Ko
> audit/3-solana.js        ← 52 Ko : tout ce qui touche signature, clé, transfert
> ```
>
> Les `.html` autres que `index_v37.html` sont **générés**. Les modifier à la
> main est écrasé au build suivant.
>
> `_backup/` et `tests/node_modules/` sont volontairement hors dépôt. Pour
> lancer les tests : `cd tests && npm install && ./run.sh`.
>
> Le point d'entrée pour comprendre le projet en 10 minutes :
> `docs/BRIEF-KIMI-K3.md`. Il contient l'architecture, la méthode de patch,
> les pièges déjà rencontrés et les règles du projet.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

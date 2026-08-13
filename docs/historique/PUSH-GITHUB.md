# Mise à jour GitHub + consignes Noah — v4.4

*13 août 2026, 00 h 30. Deadline : aujourd'hui 18 h.*

---

## 1. Ce que Noah attend de toi

Son dernier message demandait deux choses :

1. **Les 4 `grep`** — déjà fournis dans `docs/historique/REPONSE-NOAH.md`, avec la boucle
   d'envoi complète et les deux bugs que son audit a fait sortir.
2. **`audit/` sur `main`** — le dossier n'était pas dans le dépôt. Il y est
   maintenant si tu suis la procédure ci-dessous.

Depuis, quatre correctifs de plus. Tout est dans le journal.

---

## 2. Fichiers à mettre sur GitHub

Le dépôt est à plat, l'arborescence locale ne l'est pas. Remplace ces fichiers :

### Modifiés

| Dépôt (à plat) | Local |
|---|---|
| `index_v37.html` | `game/index_v37.html` |
| `index.html` | `noah-build/index.html` |
| `seeker-strike-MOBILE.html` | `game/seeker-strike-MOBILE.html` |
| `seeker-strike-NOAH.html` | `game/seeker-strike-NOAH.html` |
| `run.sh` | `tests/run.sh` |
| `rpc_sc.js` | `tests/rpc_sc.js` |
| `demo3_sc.js` | `tests/demo3_sc.js` |
| `reecrire_chemins.py` | `noah-build/reecrire_chemins.py` |
| `BRIEF-NOAH.md` | `docs/BRIEF-NOAH.md` |
| `JOURNAL-MODIFS.md` | `docs/JOURNAL-MODIFS.md` |

### Nouveaux

| Fichier | Rôle |
|---|---|
| `rpc2_sc.js` | pool RPC, rotation, endpoint mort, pool épuisé |
| `audio2_sc.js` | plus de 404 audio dans le build autonome |
| `mun2_sc.js` | orientation du projectile, signature par vaisseau |
| `lot.sh` | rejoue la batterie par tranches |
| `REPONSE-NOAH.md` | réponse point par point à son audit |
| `PUSH-GITHUB.md` | ce fichier |
| `audit/` (6 fichiers) | **c'est ce qu'il réclamait** — copie allégée, 548 Ko |

### Inchangé

`public/assets/` — 104 images + 8 MP3. Ne pas re-téléverser, c'est le plus lourd.

---

## 3. Passer en vrai Git (recommandé)

Le dépôt à plat te fait perdre du temps à chaque livraison. Cinq minutes une
fois pour toutes :

```bash
cd "HACKATHON-NOAHAI-NITRO-01"
git init
printf '_backup/\noutputs/\n.DS_Store\nnode_modules/\n*.zip\n' > .gitignore
git add -A
git commit -m "Seeker Strike v4.4 — pool RPC Helius, correctifs démo et audio"
git remote add origin <URL-de-ton-repo>
git branch -M main
git push -u origin main --force
```

`--force` écrase le distant par ton état local. C'est ce que tu veux : le local
fait autorité.

Ensuite, Noah retrouve la vraie arborescence (`game/`, `tests/`, `docs/`,
`audit/`) et ses chemins cessent de casser.

**Attention** : `seeker-strike-MOBILE.html` pèse 10,6 Mo. GitHub accepte
jusqu'à 100 Mo par fichier mais l'historique s'alourdit à chaque version. Si tu
veux rester léger, ajoute les deux gros builds au `.gitignore` — ils se
régénèrent en une commande depuis `index_v37.html`.

---

## 4. Message à donner à Noah

> Le dépôt est à jour, `audit/` inclus. Réponse à ton audit dans
> `docs/historique/REPONSE-NOAH.md` : tu avais raison sur la couverture, ça a fait sortir
> deux bugs réels (double transaction sur double-tap, cache de blockhash mort).
> Corrigés, testés.
>
> Depuis, quatre changements :
>
> 1. **Pool RPC refait.** Ankr retiré (API passée payante, réponses
>    incompatibles web3.js). Helius en principal avec clé projet, puis
>    `api.devnet.solana.com`, Alchemy demo, OnFinality. Testé sur Seeker :
>    650 ms.
> 2. **`estRpcCasse()`** — nouvelle fonction, plus large que `estSature()`.
>    Un RPC saturé est temporaire (on y revient), un RPC cassé est écarté de la
>    session. Sans cette distinction, la rotation revenait en boucle sur un
>    endpoint mort.
> 3. **Panneau « Serveur Solana » dans les réglages** — endpoint configurable,
>    bouton de test avec latence réelle, persisté dans la save. Permet de
>    changer de RPC en démo sans redéployer.
> 4. **Correctifs de rendu** — le projectile signature était dessiné couché
>    (sprite horizontal affiché sans rotation dans un carré) et écrasait la
>    signature de tir des 14 vaisseaux.
>
> Batterie : **115 exécutions, tout passe.** `cd tests && ./run.sh`, ou
> `bash lot.sh 1 12` par tranches si ton environnement coupe les processus
> longs.
>
> Rappel des règles : la source de vérité est `index_v37.html`. Les autres
> HTML sont générés — les modifier à la main est écrasé au build suivant.
> Pas de découpage en modules, pas de bundler, pas de React.

---

## 5. Où en est le projet

| Élément | État |
|---|---|
| TX Seeker Task, Seed Vault devnet | ✅ testé sur Seeker, une seule signature |
| Anti-spam, anti-double-TX | ✅ testé desktop + mobile |
| Pool RPC Helius | ✅ 650 ms depuis Seeker |
| Défilement, orientation, langues | ✅ |
| Démo / trailer | ✅ 7 vaisseaux, 4 munitions, 7 signatures de tir |
| Batterie de tests | ✅ 115/115 |
| Plan de test physique | ⏳ ce matin — checklist en fin de `BRIEF-NOAH.md` |
| Clé Helius | ⚠️ plan gratuit : restriction par domaine impossible. Clé assemblée à l'exécution (anti-robots de scan), bascule automatique si quota épuisé. Surveillance manuelle du dashboard. |

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

# Brief — faire tourner Seeker Strike dans la preview Noah

**Pour : Kimi K3, ou tout agent qui reprend le dossier.**
**Écrit le 13 août 2026, 04 h 10. Deadline : aujourd'hui 18 h 00 (Europe/Paris).**

---

## 1. La situation en cinq lignes

Le jeu **est fini**. Il tourne, il est testé (118 exécutions au vert), déployé,
et ses transactions Solana sont réelles et vérifiables sur Solscan.

**Le seul problème** : il ne s'affiche pas dans la preview de la plateforme
Noah. Écran noir, aucun message. Or la candidature se fait en soumettant le
projet Noah lui-même — les organisateurs ouvrent le workspace. **Si la preview
est noire, il n'y a pas de candidature.**

Ce n'est pas un problème de jeu. C'est un problème d'intégration.

---

## 2. Le hackathon

**NoahAI Nitro 01 — Solana Gaming.** 7 au 13 août 2026.
Prix : 1 000 USDC (500 / 300 / 200).

Soumission : « Choose your project, describe it, and enter the hackathon » —
on choisit un projet Noah, on le décrit, on valide. **Un seul projet par
participant.** Fournis aussi : description, Twitter, Telegram.

---

## 3. Le jeu

**Seeker Strike — Genesis Protocol.** Shoot'em up vertical pour Solana Seeker.
**Canvas 2D en JavaScript vanilla, fichier unique.** Aucun framework, aucune
dépendance npm, aucun build.

| Ressource | Adresse |
|---|---|
| Jouable, en ligne | https://azumizeus.github.io/seeker-strike/ |
| Dépôt | https://github.com/Azumizeus/seeker-strike |
| Source de vérité | `game/index_v37.html` — 2,88 Mo |
| Build autonome | `index.html` à la racine — 11 Mo, tout embarqué |

22 secteurs, 7 boss, 2 campagnes, 14 vaisseaux, FR/EN, wallet Solana
(Seed Vault / Phantom / Backpack), 15 transactions mémo en une signature,
10 paliers on-chain.

**Vérification immédiate** : ouvrir la première URL. Le jeu se lance.

---

## 4. L'environnement Noah — ce qu'on sait

- Il fait tourner **son propre projet React + Vite + TypeScript**
- L'agent **lit, écrit et modifie** les fichiers texte du projet
  (`src/App.tsx`, `vite.config.ts` — confirmé)
- Il **ne peut pas** écrire un fichier de plusieurs Mo
- Il **ne peut pas** lancer `curl`
- Il lit le dépôt distant par HTTP
- **Quota : 30 millions de tokens.** Contrainte majeure : toute solution
  coûteuse en texte risque de l'épuiser avant d'aboutir.

### Ce qui a été tenté, et a échoué

| Tentative | Résultat |
|---|---|
| `<iframe src="https://azumizeus.github.io/seeker-strike/">` | écran noir |
| Proxy Vite `/jeu` vers GitHub Pages | écran noir |
| `curl` du fichier dans `public/` | impossible pour l'agent |
| `fetch` + Blob (même origine) | à confirmer |

**Personne n'a encore diagnostiqué la cause de l'écran noir.** Toutes les
tentatives ont visé des causes supposées.

---

## 5. LA question à trancher en premier

Dix secondes, et elle décide de toute la suite. Faire remplacer
`src/App.tsx` par exactement ceci :

```tsx
export default function App() {
  return <iframe src="https://example.com"
    style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0}} />;
}
```

| Résultat | Diagnostic | Aller à |
|---|---|---|
| example.com s'affiche | iframes et réseau OK | **Solution A** |
| écran noir | iframes bloquées dans la preview | **Solution B** |

**Ne pas sauter cette étape.** Six heures ont été perdues faute de l'avoir
faite.

---

## 6. Solution A — plugin Vite (à essayer en premier)

**Coût : deux petits fichiers. Quelques centaines de tokens.**

Le téléchargement se fait **côté serveur Node**, au démarrage de Vite. Donc ni
CORS, ni restriction d'iframe, ni réseau navigateur.

Dans `vite.config.ts` :

```ts
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

function seekerStrike() {
  return {
    name: 'seeker-strike',
    async configureServer() {
      if (existsSync('public/seeker-strike.html')) return;
      mkdirSync('public', { recursive: true });
      const r = await fetch('https://azumizeus.github.io/seeker-strike/');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      writeFileSync('public/seeker-strike.html', await r.text());
      console.log('[seeker] jeu telecharge');
    },
  };
}
```

Puis l'ajouter aux plugins : `plugins: [react(), seekerStrike()]`

Et `src/App.tsx` :

```tsx
export default function App() {
  return <iframe src="/seeker-strike.html"
    style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0}} />;
}
```

**Pourquoi c'est la meilleure option** : le fichier atterrit dans `public/`,
Vite le sert en statique, l'iframe est en **même origine** — donc le wallet
fonctionne aussi dans la preview. Et si le `fetch` Node échoue, l'erreur
apparaît dans les logs du serveur, pas dans un écran noir muet.

---

## 7. Solution B — le jeu écrit morceau par morceau

**Coût : environ 3 Mo de texte, soit ~1 million de tokens minimum.**
**À n'utiliser que si A échoue.** Risque réel d'épuiser le quota Noah.

Le jeu est découpé en **17 morceaux de 175 Ko**, dans le dépôt :

```
pour-kimi/partie-01.txt … partie-17.txt
pour-kimi/reassembler.py
```

Accessibles en lecture directe, ce qui évite tout copier-coller :

```
https://raw.githubusercontent.com/Azumizeus/seeker-strike/main/pour-kimi/partie-01.txt
```

### Marche à suivre

1. Lire chaque morceau depuis l'URL brute, l'écrire dans `public/jeu/`
2. Concaténer **dans l'ordre numérique** en `public/seeker-strike.html`
3. Pointer l'iframe sur `/seeker-strike.html`

### Attention aux assets

`index_v37.html` référence des fichiers externes en chemins **relatifs** :
`assets/inline/*.webp` (104 images), `assets/audio/*.mp3` (8 pistes).

Remplacer dans le HTML reconstitué :

```
assets/   vers   https://azumizeus.github.io/seeker-strike/assets/
```

Si le réseau navigateur est bloqué, ces assets ne chargeront pas : le jeu se
lance mais les sprites manquent — inacceptable pour une candidature. Dans ce
cas, découper le build autonome de 11 Mo (63 morceaux), qui n'a besoin
d'aucun asset externe.

---

## 8. Ce qu'il ne faut pas faire

- **Ne pas convertir le jeu en React ou TypeScript.** 8 200 lignes de Canvas
  2D, architecture mono-fichier délibérée. Hors sujet et hors délai.
- **Ne pas le faire passer par un bundler.** 2,4 Mo de script inline : au
  mieux très lent, au pire un échec.
- **Ne pas modifier le code du jeu.** 118 tests au vert. Le problème est
  l'environnement.
- **Ne pas relancer d'audit de code.** Cinq audits déjà faits, tous les
  défauts corrigés. Ce qui reste n'est pas noté.

---

## 9. Vérifier que ça marche

Console du navigateur, au chargement :

```
[SEEKER] assets : 135 charges, 0 echecs
[SEEKER] musique : menu
```

À l'écran : splash noir, « SEEKER STRIKE », « APPUYER POUR COMMENCER ».
En bas des réglages : `Genesis Protocol v4.4`.

---

## 10. Si rien ne fonctionne avant 18 h

**Soumettre quand même.** Le projet Noah existe, la description peut pointer
vers l'URL jouable et le dépôt. Un projet soumis avec une preview imparfaite
vaut infiniment mieux qu'aucune soumission.

Le jeu est réel : 5 jours de travail, 118 tests, des transactions Solana
signées et vérifiables sur Solscan depuis un Seeker.

---

## 11. Outils du dépôt

| Commande | Effet |
|---|---|
| `bash publier.sh "message"` | régénère, commit, push, met à jour GitHub Pages |
| `bash verifier.sh` | vérifie que l'URL en ligne sert la dernière version |
| `cd tests && ./run.sh` | 118 exécutions, attendu : `TOUT PASSE` |
| `cd game && python3 build_autonome.py` | régénère le build 11 Mo |

Documentation : `docs/BRIEF-NOAH.md` (déploiement),
`docs/BRIEF-KIMI-K3.md` (architecture du jeu),
`docs/JOURNAL-MODIFS.md` (historique des correctifs).

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

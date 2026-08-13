# Faire tourner Seeker Strike dans la preview Noah

**Situation** : la candidature au hackathon NoahAI Nitro 01 se fait en
soumettant le projet Noah lui-même. Les organisateurs ouvrent le workspace.
**La preview doit donc afficher le jeu.** Ce n'est pas un confort, c'est le
livrable.

**État** : le jeu est fini, testé (118 exécutions), déployé et fonctionnel.
Seul l'affichage dans la preview Noah échoue — écran noir, sans message.

**Deadline** : 13 août 2026, 18 h 00 (Europe/Paris).

---

## Le jeu

Shoot'em up vertical, **Canvas 2D en JavaScript vanilla, fichier unique**.
Aucun framework, aucune dépendance npm, aucun build.

| Ressource | Adresse |
|---|---|
| Jouable | https://azumizeus.github.io/seeker-strike/ |
| Code | https://github.com/Azumizeus/seeker-strike |
| Source de vérité | `game/index_v37.html` — 2,88 Mo |
| Build autonome | `index.html` racine — 11 Mo, tout embarqué |

**Le jeu fonctionne.** Vérifiable en ouvrant la première URL. Le problème est
uniquement son intégration dans l'environnement Noah.

---

## L'environnement Noah, ce qu'on en sait

- Il fait tourner **son propre projet React + Vite + TypeScript**
- L'agent peut **lire, écrire, modifier** des fichiers texte du projet
  (`src/App.tsx`, `vite.config.ts` — testé, ça marche)
- Il **ne peut pas** écrire un fichier de 11 Mo, ni télécharger par `curl`
- Il dit ne pouvoir écrire dans le dépôt « que des images »
- Il **n'exécute pas** le projet lui-même : il lit le dépôt distant par HTTP

### Ce qui a été tenté, et a échoué

| Tentative | Résultat |
|---|---|
| `<iframe src="https://azumizeus.github.io/seeker-strike/">` | écran noir |
| Proxy Vite `/jeu` → GitHub Pages | écran noir |
| `curl` du fichier dans `public/` | impossible pour l'agent |
| `fetch` + Blob même origine | non testé au moment d'écrire |

---

## LA question à trancher en premier

**Aucune solution ne peut être choisie sans cette réponse.** Faire mettre ceci
dans `src/App.tsx` :

```tsx
export default function App() {
  return <iframe src="https://example.com"
    style={{position:'fixed',inset:0,width:'100%',height:'100%',border:0}} />;
}
```

| Résultat | Diagnostic | Solution |
|---|---|---|
| example.com s'affiche | les iframes marchent, le réseau sort | **Solution A** |
| écran noir | iframes ou réseau bloqués dans la preview | **Solution B** |

Ne pas sauter cette étape. Trois heures ont été perdues à corriger des causes
supposées.

---

## Solution A — le jeu chargé, servi en même origine

Si les iframes fonctionnent. Fichier prêt dans le dépôt :
`integration-react/App.tsx`.

Principe : `fetch` du jeu depuis GitHub Pages (qui envoie
`access-control-allow-origin: *`), puis affichage depuis un **Blob**. L'iframe
est alors en **même origine** que la preview, ce qui lève la restriction sur
l'ouverture du wallet.

Le composant **affiche l'erreur exacte** en cas d'échec au lieu de rester noir,
et retombe sur l'iframe directe en mode dégradé.

---

## Solution B — le jeu écrit dans le projet, sans réseau

Si les iframes ou le réseau sont bloqués. C'est le contenu de ce dossier.

`game/index_v37.html` est découpé en **17 morceaux de 175 Ko**, chacun
écrivable par l'agent :

```
partie-01.txt … partie-17.txt     les morceaux, dans l'ordre
reassembler.py                    les recolle en index.html
```

### Marche à suivre

1. L'agent écrit les 17 fichiers dans `public/jeu/` du projet React.
   Le contenu de chacun est dans ce dépôt, à `pour-kimi/partie-NN.txt`.
2. Concaténer, **dans l'ordre numérique**, en `public/seeker-strike.html`.
   Soit avec `reassembler.py`, soit directement en TypeScript.
3. Pointer l'iframe sur `/seeker-strike.html` (même origine, servi par Vite
   depuis `public/` sans passer par le bundler).

### Attention : les assets

`index_v37.html` référence des fichiers externes en chemins **relatifs** :

```
assets/inline/*.webp     104 images
assets/audio/*.mp3       8 pistes
```

Deux façons de les fournir :

**B1 — assets en absolu** (léger, demande le réseau)
Remplacer dans le HTML reconstitué :
```
assets/   →   https://azumizeus.github.io/seeker-strike/assets/
```
Une ligne de `replace`. Suppose que le réseau sortant fonctionne.

**B2 — sans assets** (aucun réseau, dégradé)
Le jeu tourne sans : le chargeur est tolérant (`0 echecs` attendus mais les
absences ne bloquent pas). Les sprites manquent, le rendu vectoriel de secours
prend le relais pour les projectiles. **À vérifier visuellement avant de
retenir cette voie.**

**B3 — assets embarqués** (le plus sûr, le plus lourd)
Utiliser le build autonome de 11 Mo au lieu de la source : tout est en base64,
aucun asset externe. 63 morceaux de 175 Ko au lieu de 17. Le fichier est
`index.html` à la racine du dépôt. À découper avec le même script.

---

## Ordre recommandé

1. **Test `example.com`** — dix secondes, décide de tout.
2. Si iframes OK → **Solution A**, cinq minutes.
3. Sinon → **Solution B1**, puis B3 si le réseau est aussi bloqué.

---

## Ce qu'il ne faut pas faire

- Découper le jeu en modules JavaScript, le convertir en React ou TypeScript.
  C'est un Canvas 2D de 8 200 lignes, l'architecture mono-fichier est
  délibérée, et il ne reste pas le temps.
- Le faire passer par un bundler. 2,4 Mo de script inline : au mieux très
  lent, au pire un échec.
- Modifier le code du jeu. Il est testé, 118 exécutions au vert. Le problème
  est l'environnement, pas le jeu.

---

## Vérifier que ça marche

Console du navigateur, au chargement :

```
[SEEKER] assets : 135 charges, 0 echecs
[SEEKER] musique : menu
```

À l'écran : splash noir, « SEEKER STRIKE », « APPUYER POUR COMMENCER ».
En bas des réglages : `Genesis Protocol v4.4`.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

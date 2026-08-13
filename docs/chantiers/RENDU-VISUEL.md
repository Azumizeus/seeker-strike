# Rendu visuel — audit et techniques, sans changer de stack

Audit de **`game/index_v37.html`**. Tout ce qui suit tient en Canvas 2D, sans WebGL,
sans build, sans dépendance. **Je n'ai rien modifié.**

## La réponse courte à ta question

**Non, ce ne sont pas tes sprites.** La preuve est dans ton propre projet : tu as un
dossier plein d'assets et de sprites **non utilisés**. Si le volume ou la qualité des
assets était le goulot, tu serais déjà arrivé.

Le rendu d'un jeu 2D se joue sur trois niveaux. Tu es bloqué sur le premier et tu
cherches la solution dans le troisième :

| Niveau | Ce que c'est | Ton état |
|---|---|---|
| **1. Composition** | comment les pixels se combinent entre eux | ❌ le gros manque |
| **2. Palette & cohérence** | quelles couleurs, combien, où | ⚠️ dispersée |
| **3. Qualité de l'asset** | la finesse du sprite lui-même | ✅ déjà suffisant |

---

# 🥇 #1 — Tu n'utilises jamais la fusion additive

Résultat de la recherche sur 8 610 lignes :

```
globalCompositeOperation  →  1 occurrence  (et c'est 'source-atop', ligne 5791)
'lighter'                 →  0 occurrence
```

**Zéro.** C'est *le* truc qui fait qu'un shoot'em up spatial a l'air cher, et tu ne
l'utilises pas une seule fois.

## La différence, concrètement

Tu fais tout ton halo avec `shadowBlur` — lignes 5825 (orbes), 5911 (particules),
5937 et 5944 (projectiles), 6077, 1565, 1574, 1592.

- `shadowBlur` produit une **ombre portée floue teintée**. C'est du flou, pas de la
  lumière. Deux projectiles brillants qui se croisent ne deviennent **pas** plus
  lumineux — chacun pose son flou par-dessus l'autre.
- `globalCompositeOperation='lighter'` **additionne les valeurs de pixel**. Deux
  projectiles qui se croisent créent un point plus clair. Une nappe de particules
  devient un cœur blanc incandescent. **C'est ça, le néon.** La lumière s'accumule.

C'est toute la différence entre « il y a un flou autour » et « ça émet de la lumière ».

## Où l'appliquer — ligne 5942 et 5933

```js
  g.bullets.forEach((b,i)=>{
    ctx.save();
    /* Fusion additive : la lumiere s'additionne au lieu de se superposer.
       Deux tirs qui se croisent font un point plus clair — c'est ce qui
       donne le neon. shadowBlur ne sait pas faire ca, il ne fait que flouter. */
    ctx.globalCompositeOperation='lighter';
    ctx.fillStyle=tir.c;
    /* ... ton dessin existant, SANS shadowColor/shadowBlur ... */
    ctx.restore();   /* restore() remet aussi le mode de fusion */
  });
```

Même traitement pour :

- **les particules** — ligne 5911 (c'est là que l'effet est le plus spectaculaire :
  une gerbe de particules additives forme un cœur lumineux)
- **les orbes** — ligne 5825
- **les explosions** — dans le rendu de `g.explosions`
- **les traînées de vaisseau**

## ⚠️ Ce qu'il ne faut PAS passer en additif

Uniquement ce qui **émet** de la lumière. Jamais :

- les vaisseaux et les ennemis (ils deviendraient translucides et délavés)
- le fond
- le HUD et le texte (illisible immédiatement)

Et **toujours** dans un `save()` / `restore()`. Un `globalCompositeOperation` qui fuit
dans le reste de la frame te délave tout l'écran — c'est le bug classique, et il est
déroutant à diagnostiquer parce que le symptôme apparaît loin de la cause.

---

# 🥈 #2 — Ton `shadowBlur` est aussi une bombe à retardement de performance

Regarde où il est appelé :

```js
// ligne 5942 — DANS la boucle sur chaque projectile
g.bullets.forEach((b,i)=>{ ctx.shadowColor=tir.c; ctx.shadowBlur=tir.glow; ... });

// ligne 5911 — DANS la boucle sur chaque particule
ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=12; ctx.fill();
```

`shadowBlur` est l'une des opérations les plus lourdes de Canvas 2D, et
particulièrement sur mobile. Tu la déclenches **par projectile et par particule, à
chaque image**. Avec un éventail de 5 tirs et une gerbe de particules, tu es à
plusieurs dizaines de flous gaussiens par frame sur un téléphone.

**La bonne nouvelle : le correctif #1 est aussi le correctif de perf.** La fusion
additive est quasi gratuite (c'est une opération de blending GPU), et elle rend mieux.
Tu remplaces le lent et laid par le rapide et beau.

## Tu peux le mesurer toi-même

Tu as déjà un compteur d'images par seconde, ligne 7782 :

```js
const ips=g._tImg.length;   /* fenetre glissante d'une seconde */
```

**Protocole :** ouvre ton HUD debug, va dans un secteur chargé avec un vaisseau à
éventail, note l'`ips`. Applique #1. Re-note. Tu auras un chiffre, pas une impression.

---

# 🥉 #3 — Ta palette a des doublons, pas trop de couleurs

J'ai compté tes couleurs hex. Le problème n'est pas leur nombre, c'est que **plusieurs
sont quasi identiques**, chacune choisie au coup par coup dans la palette Tailwind :

| Famille | Ce que tu as | Occurrences |
|---|---|---|
| **Verts** | `#14f195` · `#4ade80` · `#86efac` · `#34d399` | 74 · 7 · 5 · 4 |
| **Violets** | `#9945ff` · `#c4b5fd` · `#a78bfa` · `#c084fc` | 19 · 27 · 6 · 5 |
| **Gris** | `#6b7280` · `#9ca3af` · `#8b8b9e` · `#7c7a8c` | 20 · 19 · 17 · 8 |
| **Roses** | `#f0abfc` · `#fb7185` · `#f472b6` | 5 · 7 · 3 |
| **Rouges** | `#f87171` · `#dc2626` · `#fca5a5` | 13 · 5 · 4 |
| **Oranges** | `#fbbf24` · `#fb923c` | 27 · 4 |

**Quatre gris.** Personne ne distingue `#8b8b9e` de `#7c7a8c` en jouant — mais
l'ensemble donne une impression de flottement, de « pas décidé ». C'est exactement ce
qui sépare un rendu amateur d'un rendu tenu, et c'est *ton* métier.

## Tu as déjà un ancrage, sers-t'en

`#14f195` et `#9945ff` sont **les couleurs officielles de la marque Solana**, et ce sont
tes deux plus utilisées. C'est un cadeau : tu as une identité légitime et cohérente avec
ton sujet. Construis la palette **autour** d'elles, au lieu d'ajouter des Tailwind à côté.

**La règle :** une rampe par famille, trois valeurs maximum — clair / base / sombre.
Passe de 22 couleurs à 9. Déclare-les en constantes en haut du fichier et n'écris plus
jamais un hex en dur ailleurs.

## Et un vrai problème fonctionnel caché là-dedans

Tes tirs ennemis sont en **`#fb923c`** (orange, lignes 5498/5508/5511). Ton `#fbbf24`
(ambre) est utilisé **27 fois** ailleurs — HUD, ramassables, score.

**Deux oranges voisins, dont un signifie « ça te tue ».** Sur un écran chargé, à
vitesse de jeu, un ramassable ambre et un projectile ennemi orange se lisent pareil.
Ce n'est pas un problème de style, c'est un problème de **jouabilité** : ton joueur
meurt en se sentant volé, et on a vu hier que c'est ce qui fait arrêter un jeu.

**Règle de shoot'em up :** les projectiles ennemis ont une teinte utilisée **nulle part
ailleurs**, la plus contrastée de l'écran, avec un contour sombre pour tenir sur
n'importe quel fond. C'est de la lisibilité fonctionnelle, pas de la décoration.

---

# #4 — Le fond doit être plus calme que le premier plan

Bonne nouvelle : tu as déjà le bon réflexe, ligne 5807.

```js
ctx.fillStyle='rgba(3,3,8,0.42)';   /* voile leger = projectiles lisibles */
```

Et ton commentaire dit exactement la bonne chose. Deux ajouts peu coûteux :

**Profondeur par le contraste, pas par la vitesse.** Tu as déjà deux vitesses d'étoiles
(ligne 5810). Ajoute que **plus c'est loin, plus c'est sombre, désaturé et petit**.
L'œil lit la profondeur par le contraste avant de la lire par le mouvement — c'est
gratuit et ça marche immédiatement.

**Ne mets jamais la teinte du danger dans le fond.** Si le fond contient de l'orange et
que tes tirs ennemis sont orange, tu détruis la lisibilité que tu viens de construire.

---

# #5 — Un vrai bloom en Canvas 2D, sans WebGL

Tu utilises déjà `ctx.filter` (lignes 6071-6073), donc tu sais que ça marche. C'est la
clé d'un bloom pas cher :

```js
/* BLOOM : on dessine les elements lumineux dans un canvas reduit, on le floute,
   on le recompose en additif par-dessus. Le canvas reduit fait deux choses :
   il accelere le flou (4x moins de pixels) et il l'elargit gratuitement. */
function bloom(ctx, dessinerLumineux, w, h){
  const c=G._cBloom || (G._cBloom=document.createElement('canvas'));
  const k=0.25;                          /* quart de resolution */
  c.width=Math.max(1,w*k); c.height=Math.max(1,h*k);
  const x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  x.save(); x.scale(k,k); dessinerLumineux(x); x.restore();

  ctx.save();
  ctx.filter='blur(6px)';
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=0.75;
  ctx.drawImage(c, 0, 0, w, h);          /* re-etire : le flou s'elargit */
  ctx.restore();
}
```

**Mets-le derrière une préférence**, sur le modèle exact de ton `PART_MULT` (ligne 1865) :

```js
const BLOOM_MULT={ aucun:0, normal:0.75, eleve:1 };
```

Un `filter='blur()'` plein écran reste le poste le plus lourd de la liste. Sur un
téléphone d'entrée de gamme il faut pouvoir le couper — et ton compteur `ips` te dira
où est la limite.

**Fais-le en dernier.** Le #1 seul te donne déjà 80 % de l'effet « ça brille ».

---

# Alors, la qualité des sprites, ça compte quand ?

Oui, mais pas comme tu crois. Ce qui se voit n'est **jamais** la résolution :

**La densité de pixels constante.** Si un sprite fait 512 px réduit à 40 et son voisin
32 px étiré à 40, l'un est net et l'autre flou. Cet écart de netteté est lu comme « pas
fini », alors que les deux assets sont bons. Vise une densité homogène : à peu près
2× la taille d'affichage, pour tout.

**La direction de lumière commune.** Si un vaisseau est éclairé d'en haut et un ennemi
d'en bas à droite, la scène ne tient pas — même avec deux sprites excellents. Une seule
direction de lumière pour tout le jeu.

**Le traitement de contour identique.** Contour sombre partout, ou nulle part. Pas un
sprite sur deux. C'est le détail qui fait le plus « set cohérent ».

**Rien de tout ça n'est un problème d'outil ou de moteur.** Ce sont trois décisions,
et elles sont dans ton domaine de compétence.

---

# L'ordre

| | Chantier | Effort | Effet |
|---|---|---|---|
| 1 | **Fusion additive** (#1) — projectiles, particules, explosions | 2-3 h | 🔥 le plus gros écart de la liste |
| 2 | **Séparer la teinte des tirs ennemis** (#3, fin) | 30 min | lisibilité + jouabilité |
| 3 | **Consolider la palette** (#3) — 22 couleurs → 9 | 2-3 h | c'est ce qui fait « tenu » |
| 4 | **Profondeur du fond** (#4) | 1 h | |
| 5 | **Bloom** (#5) | 2 h | seulement si tu en veux encore |

Après chaque étape : `cd tests && ./run.sh`, et note ton `ips` dans un secteur chargé.

**Et rappelle-toi l'ordre général :** le game feel d'abord. Un jeu qui brille mais qui
ne pèse rien reste un jeu qui ne pèse rien.

---

*Audit de `game/index_v37.html` · Seeker Strike v4.4 · AzumiZeus / @incDifuse*

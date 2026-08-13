# Game feel — chantier priorisé sur ton code

Basé sur une lecture de **`game/index_v37.html`** (8 610 lignes), ta source de vérité.
**Je n'ai rien modifié.** Les numéros de ligne sont ceux du fichier actuel.

Rangé par rapport **effet ressenti / effort**. Fais-les dans l'ordre.
Les 3 premiers valent à eux seuls plus que tout le reste de la liste.

---

## Ce que tu as déjà — et c'est mieux que je pensais

- Boucle à **pas de temps fixe** (`PAS_LOGIQUE = 1000/60`, ligne 4850) avec accumulateur
  et plafond de rattrapage à 3 tours. C'est la bonne architecture, et c'est justement
  ce qui rend le hitstop trivial à brancher. Beaucoup de jeux amateurs ne peuvent pas
  faire de hitstop propre parce qu'ils n'ont pas ça.
- `g.shake` fonctionnel (ligne 5803), `parts()` et `spawnExplosion()` (5774-5775).
- `PART_MULT` (ligne 1865) : les particules respectent une préférence joueur
  `faible / normal / eleve`. Bon réflexe, on va s'en servir.
- `synth('shot')` varie déjà sa hauteur : `beep(820+Math.random()*80, ...)`.
  Tu connais donc déjà la technique — tu ne l'as juste pas appliquée ailleurs.

---

# 🥇 #1 — Le hitstop n'existe pas du tout

C'est **le** manque. Zéro occurrence de hitstop / freeze / gel dans les 8 610 lignes.

Le hitstop, c'est geler tout le jeu pendant 2 à 6 images au moment de l'impact. C'est
ce qui fait qu'un coup *pèse*. Sans lui, tout traverse l'écran sans résistance — c'est
exactement la sensation « ça manque de quelque chose » que tu n'arrives pas à nommer.

### 1. Déclarer le compteur — ligne 4647

```js
    touchX:null, shake:0, gelImpact:0,
```

*(`gelImpact` est libre : aucun `gel` en mot entier dans ton fichier, j'ai vérifié.)*

### 2. Le brancher dans la boucle — lignes 4862-4863

Remplace :

```js
  while(G.reste>=PAS_LOGIQUE && tours<3){ update(); G.reste-=PAS_LOGIQUE; tours++; }
  if(tours===0 && G.reste>PAS_LOGIQUE*0.98){ update(); G.reste=0; }
```

par :

```js
  /* HITSTOP : on consomme le temps sans faire avancer la logique.
     Consommer l'accumulateur est essentiel — si on ne le vidait pas, le gel
     s'accumulerait et le jeu partirait en rattrapage saccade a la reprise. */
  while(G.reste>=PAS_LOGIQUE && tours<3){
    if(G.gelImpact>0) G.gelImpact--;
    else update();
    G.reste-=PAS_LOGIQUE; tours++;
  }
  if(tours===0 && G.reste>PAS_LOGIQUE*0.98 && G.gelImpact<=0){ update(); G.reste=0; }
```

`draw()` continue de tourner, donc l'écran reste vivant pendant le gel. C'est
volontaire : le joueur voit la frame de l'impact, il ne voit pas un freeze du jeu.

### 3. Le déclencher — durées en images (à 60 fps)

| Événement | Ligne | À ajouter | Durée |
|---|---|---|---|
| Mort d'un ennemi | `kill()`, ~5769 | `g.gelImpact=Math.max(g.gelImpact, e.type==='heavy'?3:2)` | 2-3 img |
| Le joueur prend un coup | 4956 | `g.gelImpact=Math.max(g.gelImpact,3)` | 3 img |
| Changement de phase de boss | 5654 / 5661 / 5665 | `g.gelImpact=Math.max(g.gelImpact,4)` | 4 img |
| Mort d'un boss | `tuerBoss()`, 5737 | `g.gelImpact=Math.max(g.gelImpact,6)` | 6 img |

Toujours `Math.max` : deux morts simultanées ne doivent pas additionner leurs gels.

### ⚠️ Le piège qui va te tenter

**Ne mets JAMAIS de hitstop sur un simple coup encaissé par un ennemi** (ligne 4984).
Tes vaisseaux tirent en éventail jusqu'à 5 projectiles. Un gel par impact = le jeu
bégaie en permanence et devient injouable. Hitstop = **la mort**, pas le coup.

---

# 🥈 #2 — Le shake ne se déclenche jamais quand *le joueur* frappe

J'ai listé les 13 déclenchements de `g.shake`. Ils sont tous du même côté :

- le joueur **subit** : 4956 (18), 5010 (16 ou 24)
- un boss **change de phase ou meurt** : 5654 (26), 5661 (30), 5665 (24), 5737 (34)
- début de vague : 5155 (12) · nuke : 4806 (28) · autres : 6820 (10), 7653 (16)

**Aucun quand le joueur tue quelque chose.** Ligne 4984, un ennemi touché produit :
`e.flash=3`, deux particules, un `sfx('hit')`. L'écran, lui, ne bouge pas d'un pixel.

Résultat : ton arme ne pèse rien. Le jeu réagit quand tu te fais mal, jamais quand tu
fais mal. C'est inversé.

### Le correctif — dans `kill()`, ~ligne 5769

À côté du `spawnExplosion(e.x,e.y)` existant :

```js
  /* L'ecran accuse le coup que le JOUEUR porte, pas seulement ceux qu'il subit.
     Valeurs faibles a dessein : ca doit se sentir, pas se voir. */
  const secousseMort = e.type==='boss'?0 : e.type==='heavy'?9 : e.prime?12 : 5;
  g.shake=Math.max(g.shake, secousseMort);
```

`e.type==='boss'` à 0 parce que `tuerBoss()` gère déjà son propre 34 — sinon tu
doublerais.

**5, c'est volontairement petit.** Le shake sur ses propres coups doit être en dessous
du seuil de conscience : le joueur ne doit pas le voir, il doit le sentir. Si tu le
remarques en jouant, c'est trop.

---

# 🥉 #3 — La décroissance du shake est linéaire : ça vibre, ça ne frappe pas

Ligne 5036 : `if(g.shake>0) g.shake--;`
Ligne 5803 : `ctx.translate((Math.random()-0.5)*g.shake, (Math.random()-0.5)*g.shake);`

Deux défauts, un seul correctif :

1. **L'amplitude est la valeur brute.** Un shake de 34 secoue à ±17 px pendant
   plusieurs images. C'est énorme et illisible.
2. **La décroissance est linéaire.** Un impact réel, c'est un pic net puis une
   retombée rapide. Linéaire = molle, et ça traîne 34 images (plus d'une demi-seconde
   de tremblement).

### Le correctif — ligne 5803, une ligne

```js
  if(g.shake>0){
    /* Amplitude quadratique : pic net, retombee rapide.
       Un decompte lineaire donne une vibration molle qui dure trop longtemps. */
    const a = g.shake*g.shake*0.02;
    ctx.translate((Math.random()-0.5)*a, (Math.random()-0.5)*a);
  }
```

La courbe que ça donne, sans toucher à aucune de tes valeurs existantes :

| `g.shake` | avant | après |
|---|---|---|
| 34 (mort de boss) | ±17 px | ±11,6 px |
| 18 (joueur touché) | ±9 px | ±3,2 px |
| 10 | ±5 px | ±1 px |
| 5 (mort d'ennemi, #2) | ±2,5 px | ±0,25 px — invisible, parfait |
| 4 et moins | ±2 px | ~0 — la queue molle disparaît |

C'est le meilleur rapport effort/effet de toute la liste : **une ligne**.

### Raffinement optionnel

Un `Math.random()` par image, c'est du **jitter** — à 60 fps l'œil lit ça comme une
vibration, pas comme un choc. Le vrai shake d'impact a une *direction* : un décalage
dans un sens, qui revient. Garde ça pour plus tard, le gain quadratique ci-dessus est
déjà l'essentiel.

---

# #4 — Le son de coup est identique à chaque fois, et sans limite de débit

Ligne 1972-1977, `synth()` :

```js
if(n==='shot') beep(820+Math.random()*80, 0.035,'square',0.035);   // ✅ varié
if(n==='hit')  beep(180,                   0.05,'sawtooth',0.06);  // ❌ figé
```

Tu as varié `shot` et pas `hit`. Or `hit` part à **chaque projectile qui touche** (4984).
Avec un éventail de 5 tirs, c'est 5 sons rigoureusement identiques dans la même image :

- **fatigue auditive en 20 secondes** — et un joueur qui coupe le son est à moitié parti
- **empilement de phase** : 5 ondes identiques simultanées = un clic dur et un pic de
  volume, pas 5 impacts

### Deux correctifs

**Varier la hauteur** — ligne 1977 :

```js
if(n==='hit') beep(165+Math.random()*45, 0.05,'sawtooth',0.06);
```

**Limiter le débit** — un même son ne part pas deux fois dans la même image. Près de
`sfx()`, ligne 1972 :

```js
/* Deux impacts dans la meme image, c'est un seul son. Sinon les ondes
   identiques s'empilent : clic dur et pic de volume au lieu de 5 impacts. */
const _dernierSfx={};
function sfxLimite(n, minMs){
  const t=performance.now();
  if(_dernierSfx[n] && t-_dernierSfx[n] < (minMs||35)) return;
  _dernierSfx[n]=t; sfx(n);
}
```

Puis ligne 4984, `sfx('hit')` → `sfxLimite('hit',30)`.

Ne l'applique **qu'à** `hit` et `shot`. Pas à `kill`, `nuke` ou `hurt` : ce sont des
événements rares, les étouffer serait une perte d'information.

---

# #5 — Deux particules par impact, et aucune direction

Ligne 4984 : `parts(e.x,e.y,e.color,2)` → **2 particules**. En dessous du seuil de
lecture ; à 60 fps personne ne les voit.

Et dans `parts()` (5774), la vitesse est `(Math.random()-0.5)*6` sur les deux axes :
un petit nuage isotrope. Un impact, physiquement, **repart dans l'axe du projectile**.
C'est cette direction qui fait lire « ça a tapé » plutôt que « il y a des points ».

### Correctif

Ligne 4984, monte à 5 (le `PART_MULT` du joueur s'applique par-dessus, donc un joueur
en `faible` reste à ~2 — sa préférence est respectée) :

```js
parts(e.x, e.y, e.color, 5);
```

Puis une variante directionnelle à côté de `parts()`, ligne 5775 :

```js
/* Gerbe d'impact : les eclats repartent vers le tireur, pas en nuage.
   C'est la direction qui fait lire l'impact, pas le nombre de particules. */
function partsImpact(x, y, col, n, dirY){
  const m=PART_MULT[(S.prefs&&S.prefs.particules)||'normal']||1;
  n=Math.max(1,Math.round(n*m));
  for(let i=0;i<n;i++){
    const a=(Math.random()-0.5)*1.5;             /* cone etroit */
    const v=2.5+Math.random()*4;
    G.particles.push({ x, y, vx:Math.sin(a)*v, vy:(dirY||1)*Math.cos(a)*v,
                       life:9+Math.random()*10, color:col });
  }
}
```

Ligne 4984, les balles du joueur montent, donc les éclats redescendent :
`partsImpact(e.x, e.y, e.color, 5, 1)`.

---

# #6 — La mort d'un ennemi n'a pas de débris

`kill()` appelle `spawnExplosion(e.x,e.y)` (~5769) et **jamais `parts()`**. Tu as donc
un sprite d'explosion sans un seul éclat. L'explosion apparaît et disparaît, rien n'est
projeté — c'est ce qui la fait lire comme un décalque plutôt que comme une destruction.

Ajoute, à côté :

```js
  parts(e.x, e.y, e.color, e.type==='heavy'?14:8);
```

---

# #7 — Ajoute une préférence « secousses »

Tu as déjà `S.prefs.particules` (ligne 1865) et `S.prefs.son`. Le shake et le hitstop
ont besoin du même traitement : une partie des joueurs a le mal des transports avec
un écran qui tremble, et sur un shoot'em up mobile tenu à 30 cm du visage, c'est pire.

Sur le même modèle que `PART_MULT` :

```js
const SHAKE_MULT={ aucune:0, faible:0.5, normale:1 };
```

Et ligne 5803 :

```js
  const ms = SHAKE_MULT[(S.prefs&&S.prefs.secousses)||'normale'];
  if(g.shake>0 && ms>0){
    const a = g.shake*g.shake*0.02*ms;
    ctx.translate((Math.random()-0.5)*a, (Math.random()-0.5)*a);
  }
```

Pense à fusionner la nouvelle clé dans `load()` — ta règle n°4 dans `CLAUDE.md` : les
anciennes sauvegardes n'auront pas `secousses`, il faut que le `||'normale'` couvre ça
(c'est le cas ci-dessus).

---

# L'ordre dans lequel les faire

| Séance | Quoi | Durée | Ce que tu dois ressentir |
|---|---|---|---|
| **1** | #3 (une ligne) puis #1 (hitstop) | ~1 h | Le plus gros écart de toute la liste. Joue avant / après, tu ne pourras pas revenir. |
| **2** | #2 (shake sur tes propres kills) | ~20 min | Ton arme se met à peser. |
| **3** | #4 (son) | ~30 min | Tu peux enfin jouer 10 min sans couper le son. |
| **4** | #5 + #6 (particules) | ~45 min | Les impacts et les morts deviennent lisibles. |
| **5** | #7 (préférence) | ~20 min | Pour les joueurs, et parce que ça se voit dans un jury. |

**Après chaque séance : `cd tests && ./run.sh`.** Tes 118 tests sont ton filet — c'est
ce qui te permet de toucher à la boucle de rendu sans peur. Le hitstop touche
`loop()`, donc c'est exactement le genre de modif où le filet sert.

---

## Une seule règle de méthode

**Change une chose, joue 2 minutes, garde ou jette.** Le game feel ne se raisonne pas,
il se ressent. Si tu empiles les 7 items puis que tu testes, tu ne sauras plus lequel
a fait quoi — et tu garderas des réglages qui dégradent le jeu sans savoir lesquels.

Et note tes valeurs au fur et à mesure. Le jour où tu changes une durée de hitstop de
2 à 3 images et que tout paraît meilleur sans que tu comprennes pourquoi, tu voudras
pouvoir revenir en arrière.

---

*Seeker Strike v4.4 · lecture de `game/index_v37.html` · AzumiZeus / @incDifuse*

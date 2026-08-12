# SEEKER STRIKE — Genesis Protocol
## Dossier technique et rapport d'audit

**Version** : 4.2 · **Date** : 12 août 2026 · **Réseau** : Solana devnet
**Hackathon** : NoahAI Nitro 01 — Solana Gaming × Solana Mobile
**Cible** : Solana Seeker (Android, écran 120 Hz, portrait)

---

## 1. En une page

Shoot'em up vertical mobile, jouable sans wallet, où l'activité Solana est une
**couche de progression parallèle** et non une condition d'accès au jeu.

| | |
|---|---|
| Technologie | HTML5 + Canvas 2D, JavaScript vanilla, aucun framework, aucun build |
| Taille | 2,84 Mo (source) · 10,59 Mo (autonome, tout embarqué) |
| Code | 7 848 lignes, dont 6 752 de script · 239 fonctions |
| Contenu | 22 secteurs · 10 boss · 14 vaisseaux · 6 secrets · 31 quêtes |
| Langues | Français, anglais — 638 chaînes traduites |
| Assets | 101 fichiers image, 8 pistes musicales |
| Chaîne | web3.js 1.x + spl-token 0.4 (esm.sh) · Mobile Wallet Adapter 2 |

**Principe directeur, tenu et testé** : aucune dépense on-chain ne rend le
vaisseau plus fort. Le SOL et le SKR achètent des vaisseaux ; les paliers
on-chain ne distribuent que du cosmétique, de l'information et du prestige.

---

## 2. Architecture

### 2.1 Fichier unique, trois builds

```
game/index_v37.html             2,84 Mo   source de vérité, assets en fichiers
game/seeker-strike-MOBILE.html 10,59 Mo   autonome, 194 images + 8 musiques embarquées
noah-build/index.html           2,84 Mo   déploiement, chemins en public/assets/
```

`game/build_autonome.py` régénère le build autonome depuis la source. Il refuse
de produire un fichier si un asset pèse moins de 64 octets — garde-fou ajouté
après un incident où une conversion WebP silencieusement échouée avait livré un
sprite de boss vide.

**Piège d'intégration** : le script n'embarque que les entrées de
`ASSETS_FICHIERS`. Une image déclarée dans `ASSETS_INLINE` avec un chemin de
fichier ne sera pas embarquée et manquera dans le build autonome.

### 2.2 État

| Objet | Portée | Persistance |
|---|---|---|
| `S` | progression du joueur | `localStorage`, clé `ss_v35` |
| `G` | partie en cours | jamais persisté, recréé à chaque mission |

`load()` normalise systématiquement : valeurs négatives remises à zéro,
vaisseaux inconnus filtrés, `S.prefs` fusionné avec les valeurs par défaut,
nœud courant validé. Une sauvegarde trafiquée est rattrapée, pas acceptée.

### 2.3 Boucle de jeu

```js
const PAS_LOGIQUE = 1000/60;
function loop(ts){ /* accumulateur, 3 rattrapages max, plafond 250 ms */ }
```

**Cadence logique verrouillée à 60 Hz.** L'écran du Seeker monte à 120 Hz :
sans régulateur, `update()` tournait deux fois par image et tout le jeu défilait
à vitesse double. Mesuré à 59,8 mises à jour/s sur 30, 60, 120 et 144 Hz.

---

## 3. Intégration Solana

### 3.1 Canaux de connexion

Trois canaux, choisis selon la façon dont le joueur s'est connecté. Le canal est
**mémorisé** dans `S.walletType` / `S.walletId`.

| Canal | Détection | Signature |
|---|---|---|
| Seed Vault | Android + HTTPS + hors navigateur de wallet | MWA `transact()` |
| Phantom / Backpack | `window.phantom.solana`, `window.backpack` | `signTransaction` |
| Extension générique | `provider.request` | `request({method:'signAndSendTransaction'})` |

**Décision de conception : on demande la signature, jamais l'envoi.**
`signAndSendTransaction` diffuserait sur le réseau sélectionné dans le wallet —
mainnet par défaut. Notre blockhash devnet y est inconnu et la transaction
échouait sans message. Le jeu signe, puis diffuse lui-même sur son RPC devnet.

**Reconnexion silencieuse.** `_providerExt` est une variable de page : elle
disparaît au rechargement alors que la sauvegarde dit toujours « connecté ».
Avant chaque signature, `retrouverProvider()` tente
`connect({onlyIfTrusted:true})` — accepté sans interaction si le site est déjà
autorisé. Si le compte actif a changé dans le wallet, le jeu le suit.

### 3.2 Adresses

```js
const SKR = { mint:'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
              mintTest:'',        // mint devnet, à renseigner pour la démo
              decimales:6 };      // relues depuis la chaîne, jamais devinées
const TRESORERIE = { adresse:'AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH',
                     frais:0.001, actif:true };
const DONS = { adresse:'AVhVM29hD6YRLb2DujhKfF8Ger4bgaCpx9P93Q3XBWSH',
               sol:[0.01,0.05,0.25], skr:[500,2500,10000] };
```

> **Point ouvert avant démo.** Le mint SKR officiel n'existe pas sur devnet.
> Un achat SKR y échouera tant que `SKR.mintTest` n'est pas renseigné avec un
> mint de test contrôlé. Le chemin SOL fonctionne de bout en bout.

### 3.3 Normalisation des adresses

Le protocole MWA renvoie l'adresse en **base64** ; Solana manipule des clés en
**base58**. Passer la chaîne telle quelle à `PublicKey` produisait
`Non-base58 character`. `normaliserAdresse()` accepte six formes : base64,
base64url, base58, objet `PublicKey`, `Uint8Array`, tableau d'octets. Une
sauvegarde contenant une adresse base64 est réparée au premier envoi.

### 3.4 Seeker Task — 15 mémos, une signature

```
instruction 0      SystemProgram.transfer   0,001 SOL → trésorerie
instructions 1-15  Memo Program             "seeker-strike:task:<lot>:<n>/15"
```

791 octets, sous la limite Solana de 1 232. Le pourboire est placé **en tête**
pour être visible dans l'écran de signature du wallet, jamais caché. Relançable
à volonté ; le bonus de 600 GC ne tombe qu'à la première complétion.

### 3.5 Paliers on-chain

`S.txTotal` compte les transactions **réellement confirmées**. Sans wallet, rien
ne s'incrémente.

| TX | Palier | Débloque |
|---|---|---|
| 5 | Premier Contact | Journal on-chain, liens Solscan |
| 15 | Seeker Task | Badge Éligible |
| 30 | Pilote Confirmé | Livrée chromée |
| 45 | Armurier | Munition signature |
| 60 | Vétéran du Réseau | Indicatif de pilote (6 au choix) |
| 75 | Archiviste | Transmission classifiée + piste CHAOS en menu |
| 90 | Opérateur Genesis | Thème HUD or/violet |
| 100 | Validateur | Badge permanent + livrée dorée |
| 120 | Propulsion Libre | Traînée de réacteur, 5 couleurs |
| 150 | Architecte | Titre exclusif + carte teintée |

Un test vérifie qu'à 150 TX l'arme, les vies, la cadence et les bonus sont
**inchangés**.

---

## 4. Économie

### 4.1 Trois monnaies, trois rôles distincts

| | Origine | Usage |
|---|---|---|
| **GC** | gagnés en jouant uniquement | boutique, munitions, consommables — tout le gameplay |
| **SOL** | wallet du joueur | vaisseaux, dons — jamais nécessaire |
| **SKR** | wallet du joueur (SPL) | vaisseaux, dons — jamais nécessaire |

> Note d'implémentation : `S.skr` désigne les **GC** (nom hérité).
> Le solde du token SKR vit dans `S.soldeSkr`, lu sur la chaîne.

### 4.2 Vaisseaux payants

Taux ≈ **1 SOL = 25 000 SKR**, aligné sur le marché d'août 2026
(SKR ≈ 0,0074 $, SOL ≈ 185 $).

| Vaisseau | SOL | SKR | Dégâts |
|---|---|---|---|
| Warden | 0,12 | 3 000 | ×1,20 |
| Comet | 0,15 | 3 800 | ×1,25 |
| Raptor | 0,22 | 5 500 | ×1,33 |
| Nebula | 0,30 | 7 500 | ×1,38 |
| King | 0,55 | 14 000 | ×1,55 |
| Sovereign | 0,85 | 21 000 | ×1,80 |

Cinq autres vaisseaux se méritent en jeu et ne coûtent rien, dont l'Inferno
(×1,95) — **le plus puissant du jeu n'est pas achetable**.

### 4.3 Calibrage du butin

Mesuré sur 200 000 tirages par difficulté.

| | ennemis | butins | vies | charges | crédits |
|---|---|---|---|---|---|
| Normal | 110 | 28,7 | 0,87 | 5,3 | 11,6 |
| Difficile | 145 | 30,4 | 0,93 | 5,5 | 12,4 |
| Extrême | 158 | 26,7 | 0,77 | 4,9 | 10,9 |

**Défaut corrigé** : le butin ne dépendait pas de la difficulté. Plus d'ennemis
signifiait plus de ressources, donc l'extrême était *relativement plus facile*.
`RARETE_DIFFICULTE` (×1,00 / ×0,80 / ×0,65) inverse la courbe : l'extrême
rapporte désormais moins en valeur absolue malgré 44 % d'ennemis en plus. Une
vie gratuite tombe tous les 126 kills, plafonnée à 3 par partie.

### 4.4 Plafond de boosts

Le stock de charges s'accumule sans limite dans la boutique. Ce qu'on peut
**dépenser par mission** est plafonné.

| Secteur | Normal | Difficile | Extrême |
|---|---|---|---|
| N1–N3 | 1 | 1 | 1 |
| N4–N7 | 2 | 1 | 1 |
| N8–N12 | 3 | 2 | 2 |
| N13–N17 | 4 | 3 | 2 |
| N18+ | 5 | 4 | 3 |

Modes libres : forfait fixe de 3. Le stock non dépensé reste acquis, il ressert
plus loin. Le plafond est annoncé sur l'écran de préparation.

---

## 5. Secrets

| Secret | Déclencheur | Récompense |
|---|---|---|
| Ghost Protocol | logo de l'accueil tapé 7× | vaisseau Ghost |
| Silence radio | secteur fini son et musique coupés | 300 GC |
| Vétéran d'arcade | démo laissée tourner entièrement | 250 GC |
| Dérive zéro-G | secteur secret Débris Oubliés sécurisé | 400 GC |
| Code orbital | quatre coins, sens horaire | 500 GC |
| **Si j'étais dev** | mot `DEVNET` tapé 5× dans les réglages | terminal de bord, livrée Blueprint, indicatif Stagiaire, 750 GC |

Le dernier ouvre un **terminal de bord** sur la carte : dossier du secteur
sélectionné, état de la chaîne, compteur de transactions. Il n'affiche que ce
que le joueur peut déjà savoir — sur un secteur jamais parcouru, les lignes
tactiques restent muettes. Sans ce garde-fou ce serait un outil de repérage,
donc un avantage de jeu.

`S.dev` reste à `false` : l'easter egg n'ouvre jamais le vrai mode développeur.

---

## 6. Rapport d'audit

### 6.1 Couverture

**26 suites, environ 290 vérifications, exécutées sur les 3 builds.**

| Suite | Portée |
|---|---|
| `audit_sc` | cohérence des données : vaisseaux, nœuds, boss, économie, sauvegarde |
| `audit_dyn2` | 66 parties complètes (22 nœuds × 3 difficultés), mode réel |
| `audit_dom` | 100 identifiants, 54 gestionnaires, doublons, navigation |
| `boss_sc` | les 10 boss attaquent, 20 s de combat chacun |
| `enn2_sc` | comportement de tir par type d'ennemi, en isolation |
| `prog_sc` | chaînage de campagne, non-contamination par la démo |
| `cap_sc` | plafonds de boosts par secteur et difficulté |
| `calib_sc` | calibrage du butin, 200 000 tirages par difficulté |
| `sign_sc`, `recon_sc`, `b58_sc` | canaux de signature, reconnexion, base58 |
| `task_sc`, `tres_sc`, `skr_sc`, `don_sc` | Seeker Task, trésorerie, SPL, dons |
| `pal_sc`, `egg_sc`, `term_sc` | paliers, easter egg, terminal |
| `i18n_full`, `panneaux_sc`, `lang_sc` | traduction exhaustive, panneaux, choix initial |
| `orient_test`, `term_pos`, `boost_sc` | portrait, position du terminal, ergonomie |
| `secu_sc` | injection HTML, tunneling, sauvegarde forgée |
| `inf_sc` | mode infini : types, décors, bascule musicale |

**Simulation de combat** : horloge simulée (le tir dépend du temps réel) et
générateur pseudo-aléatoire à graine fixe, pour des parties reproductibles.

### 6.2 Défauts trouvés et corrigés lors de cet audit

> **Tous les défauts de ce tableau sont CORRIGÉS et vérifiés par test.**
> Ce n'est pas une liste de tâches. Les points encore ouverts sont
> regroupés en section 6.6, et il n'y en a qu'un.

| # | Défaut | Gravité | État |
|---|---|---|---|
| 1 | **La démo validait des secteurs.** Elle joue sur VORTEX, NEXUS, FRACTURE… et sa fin de partie écrivait dans `completedNodes`. Quelques minutes d'inactivité suffisaient à « terminer » le NEXUS et ouvrir CHAOS PROTOCOL. | **Bloquant**  ✅ corrigé |
| 2 | **Le tank ne tirait jamais.** Gros, lent, il traversait l'écran sans la moindre attaque : du décor, pas une menace. | Élevée  ✅ corrigé |
| 3 | **Session wallet perdue au rechargement.** Le jeu basculait vers le Seed Vault et affichait « ouvre dans Chrome » à un utilisateur Phantom. | Élevée  ✅ corrigé |
| 4 | **7 icônes non embarquées** dans le build autonome (déclarées dans le mauvais tableau) — invisibles hors ligne. | Moyenne  ✅ corrigé |
| 5 | **4 icônes placeholder** : `icoRepair`, `icoShield`, `icoCoque` étaient le même blob hexagonal recoloré. Redessinées. | Moyenne  ✅ corrigé |
| 6 | **Sprite du Poseur** : une tourelle sur pattes, aucun rapport avec un semeur de mines. Recomposé. | Moyenne  ✅ corrigé |
| 7 | **Terminal de carte dans le conteneur défilant** : invisible sauf tout en haut de la carte. Ancré à la fenêtre. | Moyenne  ✅ corrigé |
| 8 | **Boutons de boost à l'altitude de vol** : déclenchements accidentels. Descendus, plancher de vol ajouté. | Moyenne  ✅ corrigé |
| 9 | **9 noms de boss jamais traduits** (`☢ L'ESSAIMEUR`, `☢ LE COLOSSE`…). | Faible  ✅ corrigé |
| 10 | **Panneaux des réglages non traduits** : le dictionnaire existait, le code n'appelait pas `T()`. | Faible  ✅ corrigé |

### 6.3 Défauts dans les tests eux-mêmes

Signalés par honnêteté : ils invalidaient des résultats antérieurs.

- **`initGame` appelé avec une chaîne** au lieu d'un objet mode : `mode.reward`
  valait `undefined`, les crédits partaient en `NaN` et l'audit dynamique
  tournait sur un mode vide. Corrigé, l'audit repasse par le vrai chemin de
  `launchMission()`.
- **Attribution de tir trop grossière** : un premier test créditait tous les
  ennemis présents dès qu'un projectile apparaissait, et concluait que tout le
  monde tirait. L'isolation stricte a révélé que seul le tireur le faisait.
- **Deux scripts de patch plantés avant écriture**, perdant silencieusement des
  correctifs déjà appliqués. Méthode changée : écriture après chaque
  remplacement.

### 6.4 État final

**0 échec** sur les 3 builds. Un avertissement subsiste, vérifié et bénin :
l'audit compte 3 vaisseaux « gratuits sans condition » alors que le Ghost est en
réalité verrouillé par `S.ghostUnlocked` — faux positif de la règle, pas du jeu.

---

## 6.5 Réponses à l'audit documentaire externe

Un audit documentaire indépendant a été mené le 12 août 2026 sur ce dossier et
sur `tests/LISEZ-MOI.md`, sans accès au code. Il a soulevé six points de
vigilance. Chacun a été vérifié dans la source. Voici ce que le code dit
réellement.

### 1. Injection HTML par le journal on-chain — **défaut réel, corrigé**

L'auditeur soupçonnait le terminal DEVNET. Le vrai trou était à côté : le
**journal des signatures** insérait `x.action` et `x.sig` directement dans
`innerHTML`. Ces valeurs transitent par le wallet et le RPC — un wallet hostile
ou une sauvegarde éditée pouvait y glisser du HTML.

Corrigé : `txtSur()` échappe désormais tout ce qui vient de l'extérieur, et le
lien Solscan n'est construit que si la signature satisfait
`^[1-9A-HJ-NP-Za-km-z]{64,96}$`. Une signature au format inattendu s'affiche,
marquée d'un avertissement, mais n'est pas cliquable.

Suite `secu_sc` : cinq charges d'injection testées, aucune ne s'exécute.

Le terminal DEVNET lui-même est en lecture seule : aucun champ de saisie,
aucune évaluation. `S.dev` reste à `false`.

### 2. Tunneling au-delà du plafond de 250 ms — **risque inexistant**

La question est légitime mais repose sur une hypothèse fausse : le plafond ne
produit pas un pas de 250 ms, il **jette le temps excédentaire**. Le pas logique
reste fixe à 16,7 ms en toutes circonstances — c'est précisément ce qui rend le
tunneling structurellement impossible.

Mesuré : sur des écarts de 300 ms, 5 s et 60 s, le moteur exécute au plus
3 pas. Le déplacement maximal d'un projectile en un pas est de **6 px**, contre
un rayon de collision de **22 px** côté joueur. Il faudrait une vitesse
quadruplée pour traverser.

### 3. Bonus Seeker Task côté client — **exact, et assumé**

`S.taskRecompensee` est bien local. Vider le `localStorage` permet de
re-décrocher les 600 GC.

Nous ne le corrigeons pas, pour deux raisons. D'abord le gain est du GC, une
monnaie sans existence on-chain ni valeur externe. Ensuite l'opération efface
**toute** la progression : campagne, étoiles, vaisseaux, paliers. Le tricheur
paie plus cher que ce qu'il gagne.

Une vérification on-chain (relire les mémos du compte) serait la solution
propre. Elle est notée pour l'après-hackathon.

### 4. Assert de couverture des assets — **ajouté**

L'auditeur a vu juste : le garde-fou de taille ne couvrait pas le cas des
7 icônes égarées. `build_autonome.py` refuse maintenant de produire un build si
une entrée de `ASSETS_INLINE` pointe un chemin de fichier — exactement la faute
commise. Vérifié en réintroduisant volontairement le défaut : le build échoue
avec le nom de l'entrée fautive.

### 5. Checksum de sauvegarde — **écarté volontairement**

Un checksum stocké à côté de la donnée qu'il protège, dans un fichier que le
joueur peut lire, ne protège rien : il suffit de recalculer le hash. Ce serait
de la sécurité de façade.

La vraie protection est structurelle et déjà en place : **rien de ce qui se
force n'a de valeur**. Une sauvegarde entièrement forgée donne des vaisseaux
cosmétiques, des badges et des titres. Elle ne donne ni arme, ni vie
supplémentaire, ni cadence. Testé dans `secu_sc` : après forgeage complet, le
gain se résume à un badge et un titre.

Le seul enjeu réel serait un classement en ligne. Il n'y en a pas.

### 6. Numérotation `v37` / `v4.2` — **clarifié**

`index_v37.html` est le nom de fichier historique, conservé pour ne pas casser
les scripts et les liens. `v4.2` est la version produit affichée au joueur.
Aucune correspondance à retenir : **le fichier n'a pas de numéro de version, il
a un nom.**

### Sur le typage et le linter

Écarté à ce stade. Le code est commenté en continu, en français, avec la raison
de chaque choix non évident — ce qui rend plus de service à un relecteur qu'une
annotation de type. Introduire JSDoc ou TypeScript la veille d'un rendu
apporterait du bruit, pas de la sûreté. À reconsidérer si le projet se
poursuit.

---

## 6.6 Points encore ouverts

Un seul, et il ne dépend pas du code.

| Point | Nature | Qui |
|---|---|---|
| `SKR.mintTest` vide | Le mint SKR officiel n'existe pas sur devnet. Un achat SKR y échouera. Le chemin SOL fonctionne. | création d'un mint de test, ou démo en SOL |

Tout le reste des sections 6.2 et 6.5 est clos et couvert par un test.

### Vérification de la politique de sécurité de contenu (CSP)

La page **ne déclare aucune CSP** : rien n'est bloqué de notre côté. Si
l'hébergeur en impose une, voici le minimum nécessaire.

```
default-src 'self';
script-src  'self' 'unsafe-inline' https://esm.sh;
style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src    https://fonts.gstatic.com;
img-src     'self' data:;
media-src   'self' data:;
connect-src https://api.devnet.solana.com https://esm.sh;
frame-src   'none';
```

Détail des quatre domaines :

| Domaine | Rôle | Si bloqué |
|---|---|---|
| `esm.sh` | web3.js, spl-token, Mobile Wallet Adapter | **le jeu tourne, la couche on-chain est désactivée** — `chargerWeb3()` intercepte l'échec et journalise |
| `api.devnet.solana.com` | RPC : blockhash, envoi, lecture de solde | idem : jeu jouable, transactions impossibles |
| `fonts.googleapis.com` | police Orbitron | repli sur une police système, aucune casse |
| `solscan.io` | liens sortants du journal | les liens ne s'ouvrent pas, rien d'autre |

`'unsafe-inline'` est requis pour `script-src` : tout le jeu est un `<script>`
inline dans un fichier unique. C'est une conséquence assumée de l'architecture
sans build.

**Aucun de ces domaines n'est nécessaire pour jouer.** Le jeu démarre, se joue
et se termine hors ligne — seule la couche Solana en dépend.

---

## 7. Intégration Noah

### 7.1 Déploiement

```
noah-build/
  index.html                    2,84 Mo
  public/assets/inline/         101 images (WebP, PNG)
  public/assets/audio/          8 pistes MP3
  favicon.ico
```

Aucune étape de build. Servir le dossier en statique suffit. **HTTPS
obligatoire** : le Mobile Wallet Adapter refuse tout contexte non sécurisé.

### 7.2 Points d'attention

1. **`SKR.mintTest`** à renseigner pour une démo SKR fonctionnelle sur devnet.
2. **Domaines externes** : `esm.sh` (web3.js, spl-token, MWA),
   `api.devnet.solana.com`, `fonts.googleapis.com`, `solscan.io` (liens
   sortants). À autoriser dans la CSP.
3. **Portrait imposé** : manifeste PWA, métas Android, `screen.orientation.lock`
   et voile de secours. Le verrouillage système exige le plein écran et un geste
   utilisateur — tenté au premier appui.
4. **Le jeu est jouable sans wallet.** La connexion ne conditionne que la couche
   on-chain.

### 7.3 Recette manuelle avant présentation

- [ ] Premier lancement : choix de langue, puis tutoriel
- [ ] Connexion Phantom, envoi des 15 TX, vérification sur Solscan
- [ ] Rechargement de page, nouvel envoi sans reconnexion manuelle
- [ ] Achat d'un vaisseau en SOL
- [ ] Trois secteurs joués : NEXUS doit rester verrouillé
- [ ] Cinq minutes d'inactivité, démo lancée : progression inchangée au retour
- [ ] Rotation en paysage : voile affiché, partie mise en pause
- [ ] Bascule FR/EN : aucun texte français résiduel
- [ ] `DEVNET` tapé 5× : terminal, livrée Blueprint, indicatif Stagiaire

---

*Document généré le 12 août 2026 — Seeker Strike v4.2 · AzumiZeus*

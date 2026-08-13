# Brief d'intégration Noah — Seeker Strike v4.4

*À donner tel quel à l'assistant qui aide au déploiement.*
*Dernière mise à jour : 13 août 2026, 02 h 20 (Europe/Paris).*

---

## Ce que c'est

Shoot'em up vertical HTML5 pour Solana Seeker. **Fichier unique, aucun build,
aucun framework, aucune dépendance npm.** Canvas 2D + JavaScript vanilla.

Le jeu se joue **sans wallet**. La couche Solana est une progression parallèle,
jamais une condition d'accès.

---

## Ce qu'il faut déployer

```
noah-build/
  index.html              2,86 Mo
  public/assets/inline/   104 images
  public/assets/audio/    8 pistes MP3
  favicon.ico
```

**Servir ce dossier en statique. C'est tout.** Pas de `npm install`, pas de
transpilation, pas de bundler.

**HTTPS obligatoire** : le Mobile Wallet Adapter refuse tout contexte non
sécurisé. Sans HTTPS, le Seed Vault ne répond pas.

---

## Règles à ne pas enfreindre

Ces contraintes ne sont pas des préférences de style. Les enfreindre casse le
jeu ou invalide les tests.

1. **Ne pas découper `index.html` en modules.** L'architecture mono-fichier est
   délibérée : elle supprime toute la surface d'attaque d'une chaîne npm et
   garantit que le jeu tourne en ouvrant le fichier.
2. **Ne pas ajouter React, Vite, TypeScript, ni aucun bundler.** Hors scope.
3. **Ne pas déplacer `public/assets/`.** Les chemins sont relatifs, tout casse.
4. **Ne pas modifier `noah-build/index.html` à la main.** Il est *généré*
   depuis `game/index_v37.html`. Toute correction se fait dans la source, puis
   on régénère (voir plus bas).
5. **Ne pas toucher au dossier `audit/`.** C'est une copie de lecture,
   régénérée, non exécutable.
6. **Ne pas « nettoyer » les commentaires français.** Ils portent la raison de
   chaque choix non évident. C'est la documentation du code.

---

## Régénérer les builds après une correction

```bash
cd game
python3 build_autonome.py          # produit seeker-strike-MOBILE.html
python3 build_noah.py              # produit seeker-strike-NOAH.html
cp index_v37.html ../noah-build/index.html
cd ../noah-build
python3 reecrire_chemins.py        # 102 réécritures attendues, 0 restant
```

Le script de réécriture doit afficher **102 réécrits, 0 restants**. Une fois,
cette étape a été interrompue par un délai d'exécution : 101 chemins d'images
sont restés cassés sans qu'aucun test ne le voie. Vérifiez le compteur.

`build_autonome.py` refuse de produire un fichier si un asset pèse moins de
64 octets, ou si une image est déclarée dans le mauvais tableau. Écoutez-le.

---

## Vérifier que rien n'est cassé

```bash
cd tests && ./run.sh
```

**118 exécutions sur les 3 builds** (38 scénarios × 3 harnais + 4 suites jsdom).
Sortie attendue : `TOUT PASSE`. Seules les lignes en échec s'affichent.
Compter environ 25 minutes.

À lancer après **toute** modification de la source. Ce n'est pas optionnel :
c'est ce qui a rattrapé un bug bloquant (la démo qui débloquait la campagne) et
une faille d'injection HTML.

---

## Politique de sécurité de contenu

La page ne déclare aucune CSP. Si l'hébergeur en impose une :

```
default-src 'self';
script-src  'self' 'unsafe-inline' https://esm.sh;
style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src    https://fonts.gstatic.com;
img-src     'self' data:;
media-src   'self' data:;
connect-src https://devnet.helius-rpc.com
            https://api.devnet.solana.com
            https://solana-devnet.g.alchemy.com
            https://solana-devnet.api.onfinality.io
            https://esm.sh;
frame-src   'none';
```

`'unsafe-inline'` sur `script-src` est **requis** : le jeu est un `<script>`
inline. C'est la contrepartie assumée de l'architecture sans build.

**Les quatre domaines RPC doivent y être.** Ils correspondent un pour un au
tableau `RPC_DEVNET_DEFAUT` de la source. En omettre un ne provoque pas une
erreur lisible : le navigateur refuse la requête, `causeLisible()` ne sait pas
traduire un blocage CSP, et le joueur voit un message générique. Le repli
automatique sauvera la démo, mais sur un RPC plus lent — c'est-à-dire en
perdant précisément ce pour quoi Helius a été pris.

`rpc.ankr.com` a été **retiré** du pool : son API est passée payante et ses
réponses ne sont plus lisibles par web3.js. S'il traîne encore dans une CSP,
il est sans effet.

Aucun de ces domaines n'est nécessaire pour jouer. Bloquer `esm.sh` désactive
la couche on-chain, le jeu reste jouable de bout en bout.

---

## Résistance à la saturation du RPC

Le RPC public `api.devnet.solana.com` limite chaque IP à environ 100 appels par
tranche de 10 secondes. En enchaînant les envois, un joueur recevait
`Error: 429 : {"jsonrpc":"2.0"...}` en pleine figure. Trois mesures :

| Mesure | Effet |
|---|---|
| Blockhash mis en cache, fenêtre adaptative (`blockhashFrais(marge)`) | Le cache n'est servi que si le blockhash survivra à l'attente de signature. **Sur le chemin d'envoi la fenêtre utile tombe à 2 s : en pratique chaque envoi signé repart d'un blockhash frais.** C'est assumé — voir plus bas. |
| Reprise avec attente croissante + bascule de RPC | Sur un 429 : attente 0,8 s → 1,6 s → 2,4 s, bascule sur l'endpoint suivant du pool, `max(4, nb_endpoints+2)` tentatives avant abandon (6 avec le pool actuel) |
| Délai de 20 s entre deux lots (`DELAI_LOT`) | Le bouton affiche `PATIENTE 14s` en compte à rebours au lieu de partir dans le mur |

`causeLisible()` traduit désormais toute erreur technique en une phrase
compréhensible, traduite FR/EN. Le joueur ne voit plus jamais de dump JSON.

### Budget de temps d'une transaction

Une transaction doit naître, être signée et atteindre le réseau avant que son
blockhash n'expire. Le budget est vérifié par les tests, et chaque valeur a une
raison :

| Constante | Valeur | Pourquoi |
|---|---|---|
| `BH_VIE` | 52 s | 150 blocs ≈ 60 s, moins 1 à 3 s car le blockhash arrive déjà vieux, moins une marge d'incertitude |
| `DELAI_SIGNATURE` | 40 s | **Borné par la physique** : au-delà de `BH_VIE − DELAI_DIFFUSION`, la signature serait rejetée de toute façon. Attendre plus ne rend pas service, ça fait signer pour rien |
| `DELAI_DIFFUSION` | 7 s | Reprises de `diffuser()` (0,8 + 1,6 + 2,4 s) et allers-retours réseau. **C'était une estimation** ; `diffuser(brut, échéance)` en fait désormais une borne : passé l'échéance, réessayer est garanti perdant, on rend la main |
| `BH_COUSSIN` | 3 s | Réserve. Sans elle le pire cas tombait à l'égalité exacte : une diffusion à 7,5 s au lieu de 7 faisait expirer la transaction |
| `DELAI_RECONNEXION` | 30 s | **Hors budget** : `amorcerWallet()` retrouve le wallet *avant* de prendre le blockhash. Compté après, ces 30 s portaient le pire cas à 77 s |

Pire cas : 2 + 40 + 7 = 49 s sur 52 disponibles. **3 s de coussin garanties.**

Le 2 s est la fenêtre de cache réellement utilisable une fois tout déduit
(`BH_VIE − DELAI_SIGNATURE − DELAI_DIFFUSION − BH_COUSSIN`). En pratique
chaque envoi signé repart d'un blockhash frais — c'est assumé. Le double appui
est bloqué par `CHAINE.enCours`, posé avant tout `await`, pas par ce cache.

Ne touchez à aucune de ces valeurs isolément : elles forment un budget, et
`tests/wallet_sc.js` échoue si la somme ne tient plus.

### Sur quoi repose réellement la résistance à la saturation

Le cache de blockhash n'y participe plus. Une signature peut prendre 40 s, une
diffusion 7 s de plus, et un blockhash ne vaut que 52 s : presque aucun
blockhash mis en cache ne survit à ce budget. En pratique, chaque envoi signé
en redemande un frais.

C'est un arbitrage délibéré : une transaction rejetée pour blockhash périmé
coûte bien plus cher qu'un appel RPC. Ce qui protège désormais de la
saturation, dans l'ordre :

1. **Helius en tête du pool** — quota confortable, pas de limite par IP partagée
2. **`DELAI_LOT = 20 s`** entre deux lots — c'est lui qui borne le débit
3. **`diffuser()`** — reprise et bascule de RPC sur 429

**Point de vigilance pour la démo** : si Helius tombe et qu'on retombe sur
`api.devnet.solana.com` (~100 appels / 10 s par IP, partagée en mobile), on est
à un `getLatestBlockhash` par envoi. Ça passe grâce au délai de 20 s, mais la
marge est mince. En cas de doute pendant la démo : Réglages → Serveur Solana →
coller un autre endpoint, effet immédiat, sans redéploiement.

**Pour une démo devant jury**, si le débit devient un souci : renseigner un RPC
dédié (Helius, QuickNode, Alchemy — l'offre gratuite suffit largement) en tête
du tableau `RPC_DEVNET` dans `game/index_v37.html`. Aucune autre modification
n'est nécessaire.

---

## Le seul point ouvert

`SKR.mintTest` est vide dans `game/index_v37.html` (constante `SKR`).

Le mint SKR officiel `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3` n'existe pas
sur devnet : un achat en SKR y échouera. **Décision prise : on démontre en SOL**
et l'interface annonce explicitement que le chemin SKR attend le mainnet.
C'est déjà câblé — libellés « mainnet » et message clair au clic.

Si vous voulez malgré tout un SKR fonctionnel sur devnet :

```bash
solana config set --url devnet && solana airdrop 2
spl-token create-token --decimals 6
spl-token create-account <MINT> && spl-token mint <MINT> 1000000
```

puis renseigner `SKR.mintTest = '<MINT>'` et régénérer les builds.

---

## Pièges connus, déjà rencontrés

| Piège | Conséquence |
|---|---|
| Image déclarée dans `ASSETS_INLINE` avec un chemin de fichier | non embarquée dans le build autonome, invisible hors ligne — le build le refuse désormais |
| `signAndSendTransaction` | diffuse sur le réseau du wallet (mainnet par défaut), blockhash devnet inconnu, échec muet. On signe et on diffuse soi-même. |
| Adresse MWA passée telle quelle à `PublicKey` | `Non-base58 character` : le protocole renvoie du base64 |
| `_providerExt` après un rechargement | variable de page perdue, session wallet cassée — `retrouverProvider()` la retrouve en silence |
| Fin de partie en mode démo | écrivait dans la progression du joueur, débloquait la campagne |
| `getLatestBlockhash` à chaque envoi | saturait le RPC public en quelques secondes (429) |
| `.screen { height:100dvh; min-height:100vh }` | sur mobile `100vh > 100dvh` : l'élément dépassait la fenêtre, `overflow` ne se déclenchait jamais, plus aucun défilement nulle part |
| Sortie de démo forçant le retour au splash | le splash couvrait tout en `z-index:500`, l'écran paraissait figé |
| `navigator.vibrate` / `AudioContext` avant tout geste | le navigateur bloque et journalise un avertissement à chaque appel — verrou `_gesteFait` |

---

## Documents de référence

| Fichier | Contenu |
|---|---|
| `docs/DOSSIER-TECHNIQUE.md` | architecture, Solana, économie, rapport d'audit complet |
| `docs/BRIEF-KIMI-K3.md` | passation complète pour un assistant qui reprend le code |
| `docs/JOURNAL-MODIFS.md` | tout ce qui a changé depuis le dernier push GitHub |
| `tests/LISEZ-MOI.md` | ce que couvre chaque suite, comment la relancer |
| `audit/` | copie découpée et allégée pour relecture, 548 Ko au lieu de 2,86 Mo |

Pour un audit sécurité, `audit/3-solana.js` suffit : 52 Ko, tout ce qui touche
à une signature, une clé ou un transfert.

---

## À tester physiquement avant de présenter

Un test sur un vrai appareil Android reste indispensable. Les tests
automatisés vérifient la logique, pas le ressenti ni le rendu.

- [ ] Premier lancement : choix de langue, puis tutoriel
- [ ] Connexion Phantom, envoi des 15 TX, vérification sur Solscan
- [ ] **Envoi lancé, puis attendre 30 s avant de signer** : la transaction doit
      passer, pas expirer. Personne ne teste ça spontanément — on signe toujours
      vite quand on teste soi-même — et c'est le seul moyen de vérifier sur un
      vrai appareil que le budget de temps du blockhash tient.
      **30 s, pas 40** : à 40 s la borne `DELAI_SIGNATURE` a déjà rendu la main,
      le test échouerait par construction et ferait conclure à un faux bug.
- [ ] Envoi lancé, puis **ne pas signer du tout** : au bout de 40 s le jeu doit
      rendre la main avec un message lisible, pas rester bloqué sur
      « SIGNATURE EN COURS »
- [ ] Deux envois d'affilée : le second attend bien 20 s, compte à rebours visible
- [ ] Rechargement de page, nouvel envoi sans reconnexion manuelle
- [ ] Achat d'un vaisseau en SOL
- [ ] Trois secteurs joués : le NEXUS doit rester verrouillé
- [ ] Cinq minutes d'inactivité, démo lancée : progression inchangée au retour,
      et un simple toucher rend la main sur l'accueil
- [ ] Défilement vérifié sur chaque écran (accueil, carte, boutique, réglages)
- [ ] Rotation en paysage : voile affiché, partie mise en pause
- [ ] Bascule FR/EN : aucun texte français résiduel, lore inter-niveaux compris
- [ ] `DEVNET` tapé 5× dans les réglages : terminal de bord débloqué

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

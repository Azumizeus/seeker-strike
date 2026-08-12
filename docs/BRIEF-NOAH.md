# Brief d'intégration Noah — Seeker Strike v4.3

*À donner tel quel à l'assistant qui aide au déploiement.*
*Dernière mise à jour : 12 août 2026, 21 h 30 (Europe/Paris).*

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

**106 exécutions sur les 3 builds** (34 scénarios × 3 harnais + 4 suites jsdom).
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
connect-src https://api.devnet.solana.com https://rpc.ankr.com https://esm.sh;
frame-src   'none';
```

`'unsafe-inline'` sur `script-src` est **requis** : le jeu est un `<script>`
inline. C'est la contrepartie assumée de l'architecture sans build.

`rpc.ankr.com` est le RPC devnet de secours (voir « Résistance à la saturation »
plus bas). L'omettre ne casse rien : le jeu retombe sur le RPC officiel.

Aucun de ces domaines n'est nécessaire pour jouer. Bloquer `esm.sh` désactive
la couche on-chain, le jeu reste jouable de bout en bout.

---

## Résistance à la saturation du RPC — nouveau en v4.3

Le RPC public `api.devnet.solana.com` limite chaque IP à environ 100 appels par
tranche de 10 secondes. En enchaînant les envois, un joueur recevait
`Error: 429 : {"jsonrpc":"2.0"...}` en pleine figure. Trois mesures :

| Mesure | Effet |
|---|---|
| Blockhash mis en cache 40 s (`blockhashFrais()`) | 5 envois consécutifs = 1 appel RPC au lieu de 5. C'était la source principale des 429. |
| Reprise avec attente croissante + bascule de RPC | Sur un 429 : attente 0,8 s → 1,6 s → 2,4 s, bascule sur Ankr, 4 tentatives avant abandon |
| Délai de 20 s entre deux lots (`DELAI_LOT`) | Le bouton affiche `PATIENTE 14s` en compte à rebours au lieu de partir dans le mur |

`causeLisible()` traduit désormais toute erreur technique en une phrase
compréhensible, traduite FR/EN. Le joueur ne voit plus jamais de dump JSON.

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

*Seeker Strike v4.3 · AzumiZeus · NoahAI Nitro 01*

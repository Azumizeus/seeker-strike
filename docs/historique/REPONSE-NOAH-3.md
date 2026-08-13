# Réponse au troisième audit — Seeker Strike v4.4

Ton risque 1 était réel, et mon cache l'aggravait. Corrigé, mais autrement que
tes deux options — je t'explique pourquoi. Risque 2 : documenté, plus un
garde-fou de trois lignes.

**Batterie : 118 exécutions, tout passe.**

---

## 0. `audit/` — c'était bien le cache CDN

En local, le fichier est en v4.4 depuis la régénération :

```
$ head -4 audit/3-solana.js
/* ============================================================
   SEEKER STRIKE v4.4 - 3-solana.js
   Integration Solana : wallet, signatures, RPC, paliers
   Lignes 2109 a 3400 du script (game/index_v37.html)
```

Et `grep -c "avecDelai|marqueurUnique|DELAI_SIGNATURE"` → 10 occurrences. Le
commit est passé (`14e4b2e`), `raw.githubusercontent.com` servait encore
l'ancienne copie. Il est à jour maintenant, et régénéré une fois de plus avec
les correctifs ci-dessous.

Ton en-tête versionné a fait exactement ce pour quoi il existe. C'est toi qui
l'avais demandé.

---

## Risque 1 — Réel. Corrigé, mais pas comme tu le proposais.

Ton calcul est juste : 40 s de cache + 50 s de signature = un blockhash de 90 s
diffusé alors qu'il en vaut 60 à 80. Le joueur signe correctement et se fait
refuser.

Tes deux options ne me satisfaisaient ni l'une ni l'autre :

- **Réduire à 45 s seul** ne suffit pas. 40 + 45 = 85 s, toujours au-dessus de
  la borne basse. Ça réduit la probabilité, ça ne supprime pas le cas.
- **Reconstruire la transaction** touche `signerEtEnvoyer`, et je suis d'accord
  avec toi : pas à J-1.

Troisième voie, qui ne touche ni `signerEtEnvoyer` ni la couche wallet — c'est
le **cache** qui doit savoir ce qui l'attend :

```js
/* Duree de vie prudente d'un blockhash : 150 blocs, soit 60 a 80 s selon la
   charge. On retient la borne basse.
   Budget : BH_FENETRE (40 s) couvre les appels sans attente ; des qu'une
   signature est attendue (45 s), la fenetre reellement utilisable tombe a
   BH_VIE - DELAI_SIGNATURE = 15 s. C'est voulu et suffisant : le cache existe
   pour absorber un double appui et les envois rapproches, pas pour durer. */
const BH_VIE = 60000;

async function blockhashFrais(marge){
  const m = (typeof marge==='number') ? marge : 0;
  const age = Date.now() - CHAINE.bhTemps;
  if(CHAINE.bhCache && age < BH_FENETRE && age + m < BH_VIE) return CHAINE.bhCache;
  /* ... sinon on en redemande un frais */
}
```

Les trois points d'envoi passent la marge :

```js
const blockhash = await blockhashFrais(DELAI_SIGNATURE);
```

Et `DELAI_SIGNATURE` passe bien à **45 s**, comme tu le recommandais — les deux
mesures se complètent : la borne empêche d'attendre trop longtemps, la marge
empêche de partir avec un blockhash déjà condamné.

**Effet net** : un blockhash n'est réutilisé que s'il a moins de 15 s quand une
signature est attendue. Au-delà, on en reprend un frais. La transaction ne peut
plus arriver périmée, quel que soit le temps que met le joueur.

Le test a d'ailleurs failli me piéger : ma première assertion vérifiait
`BH_FENETRE + DELAI_SIGNATURE <= BH_VIE`, qui échoue (85 > 60) alors que le
comportement est correct. Elle mesurait le mauvais indicateur. Elle vérifie
maintenant la fenêtre réellement utilisable :

```
ok  fenetre de cache utile avant signature : 15 s (le cache sert encore aux envois rapproches)
ok  avec 45 s de signature devant : blockhash renouvele au lieu d'expirer
ok  sans attente prevue : le cache de 30 s est reutilise
```

---

## Risque 2 — Documenté, plus un garde-fou

Tu as raison sur le fond et sur la priorité : vérifier l'historique on-chain
avant relance est trop lourd pour ce soir.

Mais une nuance sur ta conclusion. Tu écris que le chemin à risque n'est
emprunté en pratique que par le Seed Vault — or **le Seed Vault est justement
le chemin de démo**, c'est avec lui que les tests sur Seeker ont été faits. Le
risque n'est donc pas théorique pour nous.

Trois lignes, aucune logique touchée : on retient qui diffuse, et le message
change en conséquence.

```js
/* Deux familles de canaux, et un delai depasse n'a pas le meme sens :
   - signTransaction : NOUS diffusons. Un timeout survient avant l'envoi,
     rien n'existe on-chain, la relance est sans danger.
   - signAndSendTransaction / request / Seed Vault : LE WALLET diffuse. Un
     timeout n'annule pas sa demande ; s'il repond apres coup, la
     transaction part quand meme. Relancer a l'aveugle en cree deux. */
CHAINE.canalAuto = false;
```

```js
if(/^timeout:/.test(brut)){
  return CHAINE.canalAuto
    ? 'le wallet n\'a pas répondu · vérifie le journal avant de relancer'
    : 'le wallet n\'a pas répondu, réessaie';
}
```

Le joueur est renvoyé vers le journal on-chain, qui liste les 20 dernières
signatures avec lien Solscan. Ça ne supprime pas le risque, ça évite la relance
aveugle qui le concrétise.

```
ok  diffusion locale : "le wallet n'a pas répondu, réessaie"
ok  diffusion par le wallet : "le wallet n'a pas répondu · vérifie le journal avant de relancer"
```

---

## Clé Helius

Noté, et déjà traité comme tu le suggères : elle est assemblée à l'exécution
plutôt qu'écrite en clair — pas pour la protéger d'un humain, c'est impossible
dans un front, mais pour échapper aux robots qui scannent les dépôts publics à
la recherche du motif d'un UUID. Le plan gratuit ne permet pas de restreindre
par domaine.

Elle sera révoquée après le jury. Elle ne sera jamais réutilisée en mainnet.

Et si elle saute pendant la démo, le pool bascule tout seul sur les publics :
le jeu ne s'arrête pas.

---

## Bilan des trois audits

| Audit | Signalé | Réel | Faux positif |
|---|---|---|---|
| 1 | Couverture de tests | 2 bugs sortis | — |
| 2 | 6 bugs | 4 | 2 (`audit/` v4.2) |
| 3 | 2 risques | 2 | — |

Sur les trois passages, tes faux positifs viennent tous du même dossier
périmé, que tu avais toi-même signalé comme suspect avant de commencer.

Deux fois tu as trouvé ce que mes tests ne couvraient pas — le wallet muet et
le budget de temps du blockhash. C'est exactement ce qu'on attend d'une
relecture extérieure.

---

## Suite de l'échange — tes trois points résiduels

### Point 1 — Faux positif, `canalAuto` est bien réinitialisé

```
$ grep -n 'canalAuto' game/index_v37.html
3441:    return CHAINE.canalAuto
3524:  CHAINE.canalAuto = false;          ← en tete de signerEtEnvoyer
3534:      CHAINE.canalAuto = false;      ← signTransaction
3539:      CHAINE.canalAuto = true;       ← signAndSendTransaction
3544:      CHAINE.canalAuto = true;       ← request
3568:    CHAINE.canalAuto = true;         ← Seed Vault
```

Ligne 3524, avant toute affectation. Le scénario que tu décris — Seed Vault
puis extension, message trompeur — ne peut pas se produire. C'est maintenant
asserté dans les tests, en vérifiant l'ordre des positions dans la source :

```
ok  canalAuto remis a false en tete de signerEtEnvoyer, avant toute affectation
```

### Point 2 — Réel. Appliqué.

Tu as raison, et c'est le genre d'oubli qui ne se voit qu'en additionnant les
budgets à la main. La marge couvrait la signature mais pas ce qui suit.

```js
/* Ce qui s'ecoule APRES la signature, avant que la transaction n'atteigne le
   reseau : reprises de diffusion (0,8 + 1,6 + 2,4 s) et allers-retours. Sans
   cette part, le budget etait juste... sauf quand le RPC sature, c'est-a-dire
   exactement le cas pour lequel `diffuser()` existe. */
const DELAI_DIFFUSION = 7000;
```

```js
const blockhash = await blockhashFrais(DELAI_SIGNATURE + DELAI_DIFFUSION);
```

### Point 3 — Pris aussi, c'était gratuit

`BH_VIE` passe de 60 à **55 s**. Les 150 blocs courent depuis la création du
blockhash, pas depuis notre `fetch`.

### Conséquence : la fenêtre tombe à 3 s, et c'est assumé

Avec `BH_VIE=55`, `DELAI_SIGNATURE=45` et `DELAI_DIFFUSION=7`, la fenêtre
utilisable est de 3 s, pas les 8 s que tu annonçais.

J'ai envisagé de descendre `DELAI_SIGNATURE` à 40 s pour récupérer ces 8 s.
J'ai tranché contre : entre économiser des appels RPC et laisser un juge qui
découvre l'interface prendre son temps, le joueur passe d'abord. Couper à 40 s
une signature qui serait arrivée à 42 s serait un échec bien pire qu'un appel
RPC supplémentaire — d'autant qu'avec Helius le quota n'est plus un sujet.

Le cache n'a donc plus qu'un rôle : absorber un double appui, qui dure moins
d'une seconde. Il le fait. C'est écrit dans le code pour que personne ne
« corrige » cette valeur en croyant bien faire.

```
ok  duree de vie prudente : 55 s (le blockhash arrive deja vieux de 1 a 3 s)
ok  budget de diffusion pris en compte : 7 s (reprises 429 + reseau)
ok  fenetre de cache utile avant signature : 3 s
ok  assez large pour absorber un double appui (< 1 s)
ok  pire cas : 55 s <= 55 s, la TX ne peut pas arriver perimee
```

### Ton item de checklist

Ajouté à `docs/BRIEF-NOAH.md`, avec la raison — sinon personne ne comprendra
pourquoi on demande d'attendre :

> - [ ] **Envoi lancé, puis attendre 40 s avant de signer** : la transaction
>       doit passer, pas expirer. Personne ne teste ça spontanément — on signe
>       toujours vite quand on teste soi-même — et c'est le seul moyen de
>       vérifier sur un vrai appareil que le budget de temps tient.
> - [ ] Envoi lancé, puis fermer le wallet sans signer : au bout de 45 s le jeu
>       doit rendre la main avec un message, pas rester bloqué.

Le second couvre le wallet muet du même coup.

---

## État

```
$ cd tests && ./run.sh
TOUT PASSE  (118 executions)
```

Cinq livrables régénérés, `audit/` en v4.4 avec les correctifs de ce message.

Reste au programme : le test physique sur Seeker ce matin. Checklist en fin de
`docs/BRIEF-NOAH.md`.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

# Passer en mainnet — ce que ça implique vraiment

*À lire APRÈS le hackathon. Rien de ce document ne doit être fait aujourd'hui.*

---

## D'abord : le devnet n'est pas un défaut pour le hackathon

Les transactions sont **déjà réelles** — vraies signatures, vrais mémos
on-chain, vérifiables sur Solscan. Ce qui change en mainnet, ce n'est pas la
technique, c'est que **l'argent devient réel**.

Aucun jury de hackathon n'attend du mainnet. Demander à des juges de dépenser
de vrais SOL pour tester un jeu serait au mieux maladroit. Le devnet est le
standard, et « c'est du devnet » n'est pas une excuse à formuler : c'est le
cadre normal.

**Présente-le comme un choix, pas comme une limite.**

---

## Le passage n'est pas un changement de mot

Il y a **71 mentions de `devnet`** dans le code, dont 12 dans les textes
affichés au joueur. Mais les remplacer serait le plus petit des problèmes — et
le faire sans le reste serait dangereux.

### Ce qui change vraiment

| Domaine | Devnet aujourd'hui | Mainnet |
|---|---|---|
| SOL dépensé | gratuit, sans valeur | **argent réel du joueur** |
| Une erreur de code | on recommence | de l'argent perdu, chez quelqu'un d'autre |
| Ta trésorerie | adresse de test | tu **encaisses** de l'argent, avec ce que ça implique |
| Clé Helius | publique, sans risque | quota payant, à protéger |
| Responsabilité | aucune | tu vends un produit numérique |

---

## Le point qui doit être réglé en premier : tes prix

C'est le sujet le plus urgent, et il n'a rien de technique.

Au cours du 13 août 2026, **1 SOL ≈ 76 $**. Tes prix actuels deviennent :

| Vaisseau | Prix | En mainnet |
|---|---|---|
| Warden | 0,12 SOL | **≈ 9 $** |
| Comet | 0,15 SOL | ≈ 11 $ |
| Raptor | 0,22 SOL | ≈ 17 $ |
| Nebula | 0,30 SOL | ≈ 23 $ |
| King | 0,55 SOL | ≈ 42 $ |
| Sovereign | 0,85 SOL | **≈ 65 $** |

**65 $ pour un vaisseau dans un jeu mobile.** À titre de comparaison, un jeu
premium complet sur mobile se vend 5 à 10 $, et les contenus payants des
free-to-play tournent autour de 1 à 20 $.

Ces prix ont été calibrés en devnet, où le SOL ne vaut rien. Ils ne
correspondent à aucune réalité commerciale. Si tu passes en mainnet sans les
revoir, tu ne vendras rien — et c'est tant mieux, parce qu'un joueur qui
paierait 65 $ puis rencontrerait un bug serait un vrai problème.

Le cours du SOL bouge en permanence, ce qui pose un second problème : un prix
fixé en SOL varie de ±30 % en quelques semaines. Il faudra soit indexer sur un
prix en dollars, soit assumer la variation.

---

## Ce qu'il faudrait faire, dans l'ordre

### 1. Décider si tu veux vraiment vendre

Ce n'est pas une évidence. Tu peux très bien garder le jeu gratuit, avec la
couche on-chain en mainnet **uniquement pour les mémos et les paliers** — de
l'activité on-chain réelle, sans transaction financière. Frais de réseau :
quelques centimes par transaction.

C'est de loin l'option la plus simple et la plus sûre. Elle garde tout
l'intérêt Solana Mobile sans aucune des complications ci-dessous.

### 2. Si tu vends : t'informer sur tes obligations

Vendre un produit numérique implique des obligations qui varient selon ton
pays et ton statut : déclaration des revenus, TVA sur les biens numériques,
statut d'entreprise. Les revenus en crypto ont en général un traitement fiscal
spécifique.

**Je ne suis pas juriste ni conseiller fiscal.** Renseigne-toi auprès de
quelqu'un dont c'est le métier avant d'encaisser le premier paiement. C'est le
genre de chose qui coûte cher à régulariser après coup.

### 3. Faire auditer la couche Solana

En devnet, un bug coûte du temps. En mainnet, il coûte l'argent de tes joueurs.
`audit/3-solana.js` fait 52 Ko et contient tout ce qui touche à une signature,
une clé ou un transfert — c'est le périmètre à faire relire par quelqu'un dont
c'est le métier.

Les cinq audits de Noah ont sorti six défauts réels en deux jours, sur du code
que je croyais solide. En mainnet, chacun aurait pu coûter de l'argent.

### 4. Technique : centraliser le réseau

Aujourd'hui, `devnet` est écrit en dur à 71 endroits. La bonne approche n'est
pas de chercher-remplacer, c'est d'introduire **une seule constante** dont tout
découle :

```js
const RESEAU = 'devnet';        // ou 'mainnet-beta'
const EST_DEVNET = RESEAU === 'devnet';
```

Puis de la faire piloter :

- le pool RPC (endpoints mainnet, clé Helius distincte)
- le mint SKR (le vrai existe en mainnet, `SKR.mintTest` devient inutile)
- les liens Solscan (`?cluster=devnet` disparaît en mainnet)
- les textes affichés, générés au lieu d'être écrits en dur
- le bandeau `DEVNET` du splash et des réglages

Compter une demi-journée, tests compris. **À ne pas faire dans l'urgence** :
c'est exactement le genre de refactor où une mention oubliée envoie une vraie
transaction sur le mauvais réseau.

### 5. Prévoir un mode de test

Une fois en mainnet, tu ne pourras plus tester librement : chaque essai coûtera
de l'argent. Il faut garder la possibilité de basculer sur devnet — d'où la
constante unique, qui rend ça immédiat.

---

## Ce que je te conseille

1. **Aujourd'hui** : devnet, sans état d'âme. C'est le bon choix pour un
   hackathon et personne ne te le reprochera.
2. **Après le hackathon** : décide d'abord si tu veux vendre. Si non, le
   passage mainnet devient simple et sans risque.
3. **Si tu vends** : revois les prix (÷ 5 au minimum), informe-toi sur tes
   obligations, fais auditer la couche Solana. Dans cet ordre.

Le passage en mainnet est un projet en soi, pas une case à cocher. Rien ne
presse : le jeu a toute sa valeur en devnet.

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

Sources du cours SOL :
[Coinbase](https://www.coinbase.com/price/solana) ·
[CoinGecko](https://www.coingecko.com/en/coins/solana)

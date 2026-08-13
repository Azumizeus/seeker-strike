# Tester sur le Seeker sans consommer Netlify

*13 août 2026. Deux cas à ne pas confondre.*

---

## La règle qui décide de tout

**Le Seed Vault refuse de fonctionner hors HTTPS.** Ce n'est pas un réglage,
c'est le protocole Mobile Wallet Adapter qui l'impose : sans contexte
sécurisé, il ne répond pas du tout.

Donc :

| Ce que tu veux tester | Comment |
|---|---|
| Gameplay, menus, démo, langues, boutique, défilement | **fichier local**, hors ligne, gratuit |
| Wallet, signatures, les 15 TX, achats | **HTTPS obligatoire** |

---

## Cas 1 — Gameplay : le fichier autonome

```
game/seeker-strike-MOBILE.html      10,6 Mo
```

Tout est dedans : 135 images, 8 musiques. Aucun serveur, aucun réseau.

**Pour le mettre sur le Seeker** — au choix :

- câble USB, glisser le fichier dans `Téléchargements`, puis l'ouvrir depuis
  l'app Fichiers ;
- l'envoyer par mail à toi-même et ouvrir la pièce jointe ;
- Google Drive, Telegram, AirDroid — n'importe quel canal.

Ouvre-le dans Chrome. L'URL sera `file:///...` et le jeu tourne entièrement.

**Ce qui marchera** : tout le jeu. Les 22 secteurs, les 10 boss, la démo, les
deux campagnes, les réglages, FR/EN, les easter eggs.

**Ce qui ne marchera pas** : la connexion wallet. C'est normal et prévu — le
jeu détecte le contexte non sécurisé et te le dit clairement au lieu
d'échouer en silence.

C'est parfait pour vérifier le rendu, la fluidité, les boutons de boost, la
rotation, le défilement — tout ce qui ne touche pas à Solana.

---

## Cas 2 — Wallet et transactions : GitHub Pages

Ton dépôt est déjà en ligne. GitHub Pages te donne du HTTPS **gratuit et
illimité**, et te laisse tes crédits Netlify pour la démo devant le jury.

### Mise en place, une fois

J'ai déjà copié le build autonome à la racine du dépôt sous le nom
`index.html` — c'est ce que GitHub Pages sert par défaut.

```bash
cd ~/Desktop/"HACKATHON-NOAHAI-NITRO-01 "
git add index.html
git commit -m "index.html a la racine pour GitHub Pages"
git push
```

Puis, sur github.com :

1. Ton dépôt → **Settings** → **Pages** (menu de gauche)
2. Source : **Deploy from a branch**
3. Branch : **main**, dossier : **/ (root)**
4. **Save**

Compte 1 à 2 minutes. Ton URL :

```
https://azumizeus.github.io/seeker-strike/
```

Elle est en HTTPS, donc **le Seed Vault fonctionne**.

### Ensuite, à chaque nouvelle version

```bash
cp game/seeker-strike-MOBILE.html index.html
git add -A && git commit -m "maj" && git push
```

Deux minutes plus tard c'est en ligne. Zéro crédit consommé.

---

## Ce que je te conseille pour ce matin

1. **GitHub Pages pour tout le test physique.** Wallet compris, gratuit,
   illimité. C'est là que tu passes la checklist de `docs/BRIEF-NOAH.md`.
2. **Netlify réservé à la démo devant le jury.** Tu y redéploies une seule
   fois, à la fin, quand plus rien ne bouge. L'URL `seeker-strike.netlify.app`
   est plus présentable que `azumizeus.github.io`.

Tes 180 crédits Netlify suffisent largement pour un déploiement final et la
démo — c'est le fait d'avoir redéployé une dizaine de fois pendant la mise au
point qui les a entamés.

---

## Les deux tests que personne ne fait spontanément

Ils sont dans la checklist et ils vérifient les correctifs d'hier soir. On
signe toujours vite quand on teste soi-même, donc ces cas passent inaperçus.

**Le blockhash qui vieillit** : lance l'envoi des 15 TX, puis **attends
40 secondes** en regardant l'écran du Seed Vault avant de valider. La
transaction doit passer. Si elle échoue en « transaction expirée », le budget
de temps est trop court et il faut m'appeler.

**Le wallet qui ne répond pas** : lance l'envoi, puis ferme le Seed Vault sans
signer. Au bout de 45 secondes le jeu doit reprendre la main avec un message
lisible. Il ne doit **pas** rester bloqué sur « SIGNATURE EN COURS ».

---

*Seeker Strike v4.4 · AzumiZeus · NoahAI Nitro 01*

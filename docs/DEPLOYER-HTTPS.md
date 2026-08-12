# Servir le jeu en HTTPS pour tester le wallet sur Seeker

Le Seed Vault refuse de s'associer à une page ouverte en `file://`.
Il faut une URL `https://`. Trois options, de la plus rapide à la plus durable.

## Option 1 — Netlify Drop (2 minutes, aucun compte requis au départ)

1. Sur ton ordinateur, prépare un dossier contenant **uniquement** `seeker-strike-MOBILE.html`,
   renommé en **`index.html`**.
2. Va sur **app.netlify.com/drop**
3. Glisse le dossier dans la page.
4. Tu obtiens une URL du type `https://nom-aleatoire.netlify.app` — utilisable immédiatement.
5. Ouvre cette URL dans **Chrome sur ton Seeker**.

C'est le chemin le plus court pour tester le Seed Vault aujourd'hui.

## Option 2 — GitHub Pages (permanent, gratuit)

1. Crée un dépôt public.
2. Dépose `index.html` à la racine.
3. Settings → Pages → Source : branche `main`, dossier `/root`.
4. Après une minute : `https://<utilisateur>.github.io/<depot>/`

Avantage : l'URL ne change plus, pratique pour la soumission du hackathon.

## Option 3 — Noah publish

Tu as déjà une URL Noah en HTTPS. Dépose `noah-build/` et utilise-la.
C'est celle avec laquelle tu candidates, donc c'est le test qui compte le plus.

## Vérifier que ça fonctionne

Sur le Seeker, ouvre l'URL dans **Chrome** (pas un navigateur intégré à une autre app).

Dans le sélecteur de wallet, le bandeau rouge doit avoir **disparu** — s'il affiche encore
« HTTPS requis », c'est que la page n'est pas servie en HTTPS.

Pour lire la console depuis ton PC : branche le Seeker en USB, active le débogage USB,
puis ouvre `chrome://inspect` sur ton ordinateur. Tu verras les lignes `[SEEKER]` :

```
[SEEKER] wallets detectes : Seed Vault
[SEEKER] import module MWA...
[SEEKER] module MWA charge
[SEEKER] lancement transact...
[SEEKER] auth OK, comptes=1
[SEEKER] TX daily-claim : 5x8Kp...
```

Si ça s'arrête à « import module MWA », c'est le réseau ou le CDN.
Si ça s'arrête à « lancement transact », c'est le Seed Vault qui n'a pas répondu.

## Rappel

Le fichier fait 5,4 Mo. Sur un hébergeur statique c'est instantané,
mais prévois un premier chargement de quelques secondes en 4G.

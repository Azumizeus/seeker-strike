# Servir le jeu en HTTPS pour tester le wallet

Le Mobile Wallet Adapter **refuse le HTTP**. Sans HTTPS, la connexion au
Seed Vault échoue et le §10 du plan de test est intestable.

⚠️ **Ton dossier projet a un espace à la fin de son nom.** Toutes les
commandes `cd` doivent être entre guillemets, sinon le terminal ne trouvera
rien.

---

## Option A — Cloudflare Tunnel (recommandé)

Deux terminaux, rien à installer de permanent.

**Terminal 1 — servir le build :**

```bash
cd "$HOME/Desktop/HACKATHON-NOAHAI-NITRO-01 /noah-build"
npx --yes serve -l 3000
```

Tu dois voir `Accepting connections at http://localhost:3000`.

**Terminal 2 — ouvrir le tunnel :**

```bash
npx --yes cloudflared tunnel --url http://localhost:3000
```

Cloudflare affiche une URL du type :

```
https://quelque-chose-aleatoire.trycloudflare.com
```

C'est cette URL que tu ouvres **dans le navigateur du Seeker**.

**Pourquoi celle-ci plutôt que localtunnel :** pas de page
d'avertissement à franchir, pas de mot de passe, et le certificat est
reconnu — trois conditions nécessaires pour que le wallet accepte de
s'ouvrir.

---

## Option B — localtunnel

```bash
# Terminal 1
cd "$HOME/Desktop/HACKATHON-NOAHAI-NITRO-01 /noah-build"
npx --yes serve -l 3000

# Terminal 2
npx --yes localtunnel --port 3000
```

localtunnel affiche une **page d'avertissement** au premier accès et
réclame ton IP publique, à récupérer sur https://loca.lt/mytunnelpassword.
Franchis-la avant de lancer le jeu, sinon le wallet s'ouvrira sur une page
blanche.

---

## Vérifications avant de tester sur le Seeker

Depuis ton Mac, avec le serveur lancé :

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/public/assets/inline/bossVortexCore.webp
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/public/assets/audio/menu_theme.mp3
```

Les trois doivent répondre **200**. Si le premier répond 200 et les autres
404, c'est que `public/assets/` n'a pas été copié.

---

## Sur le Seeker

1. Ouvre l'URL HTTPS dans le navigateur
2. Le jeu doit démarrer **avec ses sprites et sa musique** — s'il affiche
   des formes géométriques, les assets ne sont pas servis
3. Accueil → **Connecter le wallet** → le Seed Vault doit s'ouvrir
4. Déroule le **§10 du plan de test**

## Si le wallet ne s'ouvre pas

| Symptôme | Cause probable |
|---|---|
| Rien ne se passe au clic | URL en HTTP, ou page d'avertissement du tunnel non franchie |
| « Wallet non détecté » | Navigateur sans support MWA — utiliser Chrome |
| Le Seed Vault s'ouvre puis se ferme | Signature refusée, ou timeout : réessayer |
| Erreur de réseau à la signature | Le RPC devnet ne répond pas — vérifier la connexion |

## Après le test

Ferme les deux terminaux avec `Ctrl+C`. Le tunnel disparaît, l'URL n'est
plus valide. Relance-les pour une nouvelle session : l'URL sera différente.

# Plan d'action — synthèse des deux audits

**11 août, 04h30 · Deadline 13 août 18h00 · Temps restant ≈ 62 h**

---

## Ce que les deux audits disent, une fois croisé

**Z.ai** avait mon dossier technique : il confirme et structure mes propres constats
(backend, base64, Tailwind CDN, ARIA). Ses apports originaux : la *signature fatigue*,
la progression basée sur `txOnChain`, l'externalisation des tables d'équilibrage.

**Kimi K3** n'avait que le fichier. Il n'a analysé que le HTML et le CSS
(il écrit lui-même « JS non visible dans l'extrait »), donc **son audit ne couvre ni le
gameplay, ni l'intégration Solana, ni l'économie**. En revanche, sur son périmètre,
il a trouvé quelque chose que mon dossier avait manqué.

### Le point le plus important des deux audits

`touch-action:none` était appliqué à `body`, alors que les écrans longs
(bestiaire, boutique, règles) défilent en `overflow-y:auto`. **Risque réel de contenu
inaccessible sur mobile.** Corrigé : `pan-y` sur les écrans, `none` uniquement sur le canvas.

---

## ✅ FAIT cette nuit (7 correctifs, tests verts)

| Correctif | Origine | Effet |
|---|---|---|
| `touch-action` ciblé | Kimi | **débloque le défilement** sur mobile |
| `user-scalable=no` retiré | Kimi | zoom autorisé, conformité |
| `:focus-visible` ajouté | Kimi + Z.ai | navigation clavier visible |
| Contraste nav `#666` → `#9ca3af` | Kimi | lisibilité |
| `prefers-reduced-motion` | Z.ai + Kimi | confort, accessibilité |
| Métadonnées + Open Graph | Kimi | partage social |
| Manifest PWA embarqué | Kimi | **installable sur l'écran d'accueil** |
| Seeker Task sur `txOnChain` | Z.ai | cohérence de la promesse on-chain |

---

## 🔴 À FAIRE avant la soumission (estimé 3 à 4 h)

| # | Action | Effort | Pourquoi maintenant |
|---|---|---|---|
| 1 | **Tester sur Seeker via URL HTTPS** | 30 min | seul point jamais validé en conditions réelles |
| 2 | **Auto-héberger Tailwind** (build purgé) | 1 h | seule dépendance dont la panne casse l'affichage |
| 3 | **Figer les versions Solana** (`@1.91.0` au lieu de `@1`) | 15 min | supprime un risque de rupture le jour du jury |
| 4 | **Limiter les signatures** — une seule action on-chain par session, pas à chaque achat | 1 h | *signature fatigue* : le testeur abandonnera sinon |
| 5 | **Vérifier le défilement** sur les 10 écrans après le correctif | 20 min | valider le fix le plus important |
| 6 | **`aria-label` sur les contrôles personnalisés** (toggles, cartes) | 45 min | gain d'accessibilité réel, effort faible |

---

## 🟠 À DOCUMENTER, pas à coder (0 h de code)

Ces points sont justes mais **hors de portée en 62 h**. Les écrire dans la roadmap
vaut mieux que les bâcler.

| Point | Audit | Pourquoi on ne le fait pas maintenant |
|---|---|---|
| Backend de validation | Z.ai | plusieurs jours ; c'est un projet en soi |
| Proof of Play (hash serveur) | Z.ai | dépend du backend |
| Sortir le base64 en fichiers | les deux | `noah-build` le fait **déjà** ; le monofichier reste pour la démo hors-ligne |
| Modularisation / bundler | Kimi | refonte complète, aucun gain pour le jury |
| Classement on-chain | Z.ai | dépend du backend |
| Service Worker complet | Kimi | le manifest suffit pour l'installabilité |

---

## ⚪ ÉCARTÉ — hors sujet pour ce projet

| Point | Audit | Raison |
|---|---|---|
| **SEO et indexation** | Kimi | c'est un jeu en canvas, pas un site de contenu. Aucun moteur n'indexera une boucle de rendu. Le référencement se fait via le dApp Store, pas Google |
| **Framework réactif (Svelte/Vue)** | Kimi | à 2 jours de la deadline, réécrire 3 090 lignes serait suicidaire |
| **Internationalisation** | Kimi | hors périmètre hackathon |
| **`!important` « très nombreux »** | Kimi | il y en a 18 sur 3 000 lignes, dont la moitié dans le bloc de respiration typographique. Pas un problème réel |
| **Externaliser les tables en `config.json`** | Z.ai | ajouterait une requête réseau et un point de panne, pour un gain nul en démo |

---

## Ordre d'exécution recommandé

1. **Tu testes** le jeu maintenant, tu notes tout — surtout le défilement des écrans longs.
2. Je corrige tes retours de test en priorité absolue.
3. Puis les points 2 à 6 de la liste rouge, dans cet ordre.
4. Migration Noah en dernier, une fois le fichier stable.

La liste rouge et les retours de ton test tiennent en une demi-journée.
Le reste part dans la roadmap du dossier de soumission — ce qui, pour un jury,
vaut mieux qu'un backend à moitié fait.

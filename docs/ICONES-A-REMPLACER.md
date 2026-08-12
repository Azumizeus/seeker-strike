# Inventaire des icônes — à remplacer par du SVG custom

Style cible : traits fins cyan/violet, fond transparent, glow léger.

## 1. Barre d'onglets — 6 SVG inline (priorité haute, toujours visibles)

Actuellement des chemins Material Design génériques, `viewBox="0 0 24 24"`, `fill="currentColor"`,
rendus en 20×20 px. La couleur vient du CSS (`.nav-i` gris, `.nav-i.active` vert `#14F195`).

| Onglet | `data-s` | Icône actuelle | Suggestion |
|---|---|---|---|
| Home | `home` | maison | vaisseau vu de face / base |
| Carte | `map` | épingle de carte | réseau de nœuds reliés |
| Arena | `multi` | deux personnages | épées croisées / duel |
| Shop | `shop` | caddie | caisse d'armurerie |
| Quêtes | `quests` | document | liste avec coches |
| Réglages | `settings` | engrenage | engrenage anguleux |

**Format attendu :** un `<path d="…">` par icône, dans un `viewBox="0 0 24 24"`, en `fill="currentColor"`
pour que l'état actif reste géré par le CSS. Si tu passes en `stroke`, préviens-moi : il faudra ajuster
`.nav-i svg` (`fill:none;stroke:currentColor;stroke-width:1.5`).

## 2. Emojis à remplacer, par ordre de visibilité

| Emoji | Occurrences | Où | Rôle |
|---|---|---|---|
| 👻 | 7 | vaisseau Ghost, bonus Fantôme | bonus + vaisseau |
| 🔫 | 5 | bonus Mitrailleuse | bonus |
| 🚀 ☄️ 🌌 👑 🛸 | 1 chacun | liste des vaisseaux | 6 icônes de vaisseaux |
| ☢️ | 3 | bonus Nuke | bonus |
| 🔥 | 3 | Daily Streak | stat |
| 💥 🏆 | 3 chacun | écran de résultat | victoire / défaite |
| ⚔️ 🛒 📋 📜 🗺️ | 1 chacun | boutons de l'accueil | navigation |
| ❤️ | 1 | HUD vies | stat |
| ⚡ | 2 | annonce de vague | événement |
| 🔗 🟢 🟡 | — | badge wallet | état de connexion |
| 🔊 🎵 📳 ✨ | 1 chacun | écran Réglages | préférences |
| ✅ ▶️ 🔒 | 1 chacun | états des nœuds | carte |
| ⭐ | dynamique | étoiles de difficulté | 3 niveaux |

## 3. Icônes de stats (n'existent pas encore, à créer)

Pour l'écran de préparation et le shop : dégâts, cadence de tir, vitesse, PV, portée, chance.

## 4. Déjà couvert par tes PNG

Icônes de nœuds sur la carte : `node_crystal_1/2/3`, `boss_vortex_face`, `boss_sentinelle`, `boss_fortress`.

---

**Comment me les envoyer :** un fichier avec un bloc par icône, nommé (`icone_home`, `icone_map`…).
Je les injecte en SVG inline, aucun fichier externe, donc aucun risque de chemin cassé.

# PROMPTS — SEEKER STRIKE

Historique des prompts envoyés à Noah. Un prompt = une modif numérotée.

---

## MODIF #1 — ÉCRAN SETTINGS + SYSTÈME DE RESET À 3 NIVEAUX

**Statut : ⏳ en attente**

Base : le fichier `index.html` que tu as confirmé (v3.5). Édition en place uniquement, garde TOUT ce qui existe.

### 1. NOUVEL ÉCRAN "settings"

Ajoute un écran settings accessible via :
- Un bouton ⚙️ (icône engrenage) en haut à droite de l'écran home
- Le bouton utilise la classe `.glass` existante, style cohérent avec le design system

L'écran settings contient 2 sections :

#### SECTION A — PARAMÈTRES
Persistés dans `S` via `save()`, nouvel objet `S.prefs` :
- 🔊 **Son** : toggle on/off (coupe `sfx`/`beep` ET musique)
- 🎵 **Musique** : toggle on/off (coupe seulement `startMusic`)
- 📳 **Vibrations** : toggle on/off (coupe `navigator.vibrate`)
- ✨ **Particules** : 3 choix (Faible / Normal / Élevé) — Faible divise par 3 le spawn de particules, Élevé multiplie par 1.5

Valeurs par défaut : tout ON, particules Normal.

**IMPORTANT** : vérifie partout dans le code où `sfx`/`beep`/`startMusic`/`vibrate` sont appelés et gate avec `S.prefs` (si `prefs.son === false` → pas de son, etc.)

#### SECTION B — ZONE DANGER
3 resets, chacun avec modal de confirmation.

**🔶 RESET RUN (niveau 1 — doux)**
- Remet à zéro : `txCount` (compteur 15 TX), `streak`, `lastDaily`
- GARDE : `sol`, `skr`, ships débloqués, munitions, `completedNodes`, `charges`, `ghostUnlocked`
- Confirmation : « Réinitialiser ta progression du jour ? Tes achats et vaisseaux sont conservés. »
- Bouton orange

**🔴 RESET USINE (niveau 2 — complet)**
- Remet TOUT `S` aux valeurs initiales (comme première install) : wallet déconnecté, 0 SOL/SKR, ships verrouillés sauf le premier, `completedNodes` vide, charges à zéro
- Confirmation DOUBLE : modal 1 « Tout sera effacé : SOL, SKR, vaisseaux, progression. Continuer ? » → modal 2 « Dernière chance. Cette action est irréversible. »
- Bouton rouge
- Après reset : `save()` + retour écran home

**⚫ RESET CACHE (niveau 3 — technique)**
- `localStorage.clear()` complet + `location.reload()`
- Confirmation : « Efface TOUTES les données locales, y compris les préférences. La page va recharger. »
- Bouton rouge foncé avec bordure

### 2. MODAL DE CONFIRMATION GÉNÉRIQUE
Crée une fonction `showConfirm(titre, message, couleurBouton, onConfirm)` réutilisable par les 3 resets, style `.glass` cohérent, boutons « Annuler » / « Confirmer ».

### 3. RÈGLES
- Fichier complet renvoyé
- Aucune régression : le jeu doit fonctionner exactement pareil avec les toggles ON
- `S.prefs` doit être fusionné au `load()` avec les valeurs par défaut si absent (compatibilité avec les anciennes saves `ss_v35`)
- Commentaires en français

Quand c'est fait, liste-moi ce qui a changé (5 lignes max).

---

## MODIF #2 — [à définir]

**Statut : —**

#!/usr/bin/env bash
# Publie la version courante du jeu sur GitHub Pages.
#
#   bash publier.sh                  -> message de commit automatique
#   bash publier.sh "ce que j'ai change"
#
# Ce que fait le script :
#   1. copie le build autonome a la racine sous index.html (ce que Pages sert)
#   2. commit + push
# GitHub Pages met environ 2 minutes a rafraichir ensuite.

cd "$(dirname "$0")" || exit 1

SRC="game/seeker-strike-MOBILE.html"
if [ ! -f "$SRC" ]; then
  echo "ERREUR : $SRC introuvable."
  echo "Regenere-le d'abord :  cd game && python3 build_autonome.py"
  exit 1
fi

# Le build doit etre plus recent que la source, sinon on publie une vieille version.
if [ "game/index_v37.html" -nt "$SRC" ]; then
  echo "ATTENTION : index_v37.html est plus recent que le build."
  echo "Lance d'abord :  cd game && python3 build_autonome.py"
  exit 1
fi

cp "$SRC" index.html
echo "index.html mis a jour ($(du -h index.html | cut -f1))"

MSG="${1:-maj du jeu $(date '+%d/%m %Hh%M')}"
# On ajoute le build et les fichiers deja suivis, rien de plus.
# Un "git add -A" balayait tout le dossier et embarquait des fichiers
# de travail par accident. Pour publier un NOUVEAU fichier, fais un
# "git add <fichier>" avant de lancer ce script.
git add index.html
git add -u
if git diff --cached --quiet; then
  echo "Rien de nouveau a publier."
  exit 0
fi
git commit -m "$MSG" || exit 1
git push || exit 1

echo
echo "Publie. Compte 2 minutes, puis recharge :"
echo "   https://azumizeus.github.io/seeker-strike/"
echo
echo "Sur le Seeker, pense a forcer le rechargement (onglet ferme puis rouvert)"
echo "si tu vois encore l'ancienne version."

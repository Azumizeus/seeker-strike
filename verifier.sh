#!/usr/bin/env bash
# Verifie que ce qui est EN LIGNE correspond bien au code local.
#
#   bash verifier.sh
#
# A lancer avant de donner une URL a qui que ce soit. La racine du depot est
# une COPIE du build : elle diverge si un correctif part dans game/ sans que
# publier.sh soit relance. Le depot contient alors le bon code, l'URL sert
# l'ancien, et rien ne le signale.

cd "$(dirname "$0")" || exit 1
URL="https://azumizeus.github.io/seeker-strike/"
SRC="game/index_v37.html"

echo "=== 1. Local : la copie racine est-elle a jour ? ==="
if [ ! -f index.html ]; then
  echo "  index.html absent a la racine — lance : bash publier.sh"
  exit 1
fi
if [ "game/seeker-strike-MOBILE.html" -nt index.html ]; then
  echo "  PERIMEE : le build est plus recent que la copie racine."
  echo "  Lance :  bash publier.sh"
  exit 1
fi
if [ "$SRC" -nt "game/seeker-strike-MOBILE.html" ]; then
  echo "  PERIMEE : la source est plus recente que le build."
  echo "  Lance :  cd game && python3 build_autonome.py && cd .. && bash publier.sh"
  exit 1
fi
echo "  ok  copie racine a jour"

echo
echo "=== 2. En ligne : les correctifs sont-ils bien servis ? ==="
PAGE=$(curl -s --max-time 30 "$URL")
if [ -z "$PAGE" ]; then
  echo "  page vide ou injoignable — verifie l'URL et la connexion"
  exit 1
fi

# Marqueurs des correctifs de la nuit du 12 au 13 aout.
manque=0
for m in amorcerWallet marqueurUnique BH_COUSSIN DELAI_DIFFUSION _providerEnCours "v4.4"; do
  if echo "$PAGE" | grep -q "$m"; then
    printf "  ok  %s\n" "$m"
  else
    printf "  MANQUE  %s\n" "$m"
    manque=$((manque+1))
  fi
done

echo
if [ "$manque" -eq 0 ]; then
  echo "TOUT EST EN LIGNE — l'URL peut etre donnee au jury."
else
  echo "$manque MARQUEUR(S) MANQUANT(S) : l'URL sert une ancienne version."
  echo "Lance :  bash publier.sh   puis attends 2 minutes et relance ce script."
  exit 1
fi

#!/usr/bin/env bash
# Rejoue une tranche de la batterie. Le bac a sable coupe les processus au
# bout de ~3 min : on decoupe plutot que de lancer run.sh d'un bloc.
cd "$(dirname "$0")"

# `timeout` est une commande GNU : elle n'existe pas sur macOS. Sans ce garde,
# chaque test « plante » alors que le jeu va tres bien. On utilise gtimeout
# (coreutils) s'il est la, sinon on se passe de limite de temps.
if command -v timeout >/dev/null 2>&1; then TO="timeout"
elif command -v gtimeout >/dev/null 2>&1; then TO="gtimeout"
else TO=""; fi
lance(){ # lance <secondes> <commande...>
  if [ -n "$TO" ]; then "$TO" "$@"; else shift; "$@"; fi
}

TOUS="audit_sc audit_dyn2 boss_sc enn2_sc prog_sc calib_sc inf_sc sign_sc recon_sc b58_sc task_sc tres_sc skr_sc don_sc pal_sc egg_sc term_sc boost_sc sim_sc secu_sc cap2_sc skrmain_sc demo2_sc demo3_sc muni_sc paysage_sc lore_sc balayage_sc i18n_full panneaux_sc lang_sc logo_sc p191_sc rpc_sc rpc2_sc audio2_sc mun2_sc wallet_sc"
DEB=${1:-1}; FIN=${2:-99}
i=0; ech=0; tot=0
for sc in $TOUS; do
  i=$((i+1)); [ $i -lt $DEB ] && continue; [ $i -gt $FIN ] && break
  [ -f "$sc.js" ] || continue
  for h in base auto noah; do
    tot=$((tot+1))
    r=$(SCENARIO="$PWD/$sc.js" lance 100 node "harness_$h.js" 2>&1 | grep -E "^RES (TOUS|[0-9]+ ECHEC)")
    case "$r" in *TOUS*) ;; *) printf "  %-5s %-12s %s\n" "$h" "$sc" "${r:-PLANTAGE}"; ech=$((ech+1));; esac
  done
done
[ "$ech" -eq 0 ] && echo "LOT $DEB-$FIN : TOUT PASSE ($tot executions)" || echo "LOT $DEB-$FIN : $ech ECHEC(S) sur $tot"
exit $ech

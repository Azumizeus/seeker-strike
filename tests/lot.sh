#!/usr/bin/env bash
# Rejoue une tranche de la batterie. Le bac a sable coupe les processus au
# bout de ~3 min : on decoupe plutot que de lancer run.sh d'un bloc.
cd "$(dirname "$0")"
TOUS="audit_sc audit_dyn2 boss_sc enn2_sc prog_sc calib_sc inf_sc sign_sc recon_sc b58_sc task_sc tres_sc skr_sc don_sc pal_sc egg_sc term_sc boost_sc sim_sc secu_sc cap2_sc skrmain_sc demo2_sc demo3_sc muni_sc paysage_sc lore_sc balayage_sc i18n_full panneaux_sc lang_sc logo_sc p191_sc rpc_sc rpc2_sc audio2_sc mun2_sc"
DEB=${1:-1}; FIN=${2:-99}
i=0; ech=0; tot=0
for sc in $TOUS; do
  i=$((i+1)); [ $i -lt $DEB ] && continue; [ $i -gt $FIN ] && break
  [ -f "$sc.js" ] || continue
  for h in base auto noah; do
    tot=$((tot+1))
    r=$(SCENARIO="$PWD/$sc.js" timeout 100 node "harness_$h.js" 2>&1 | grep -E "^RES (TOUS|[0-9]+ ECHEC)")
    case "$r" in *TOUS*) ;; *) printf "  %-5s %-12s %s\n" "$h" "$sc" "${r:-PLANTAGE}"; ech=$((ech+1));; esac
  done
done
[ "$ech" -eq 0 ] && echo "LOT $DEB-$FIN : TOUT PASSE ($tot executions)" || echo "LOT $DEB-$FIN : $ech ECHEC(S) sur $tot"
exit $ech

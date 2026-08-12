#!/usr/bin/env bash
# Batterie de tests Seeker Strike — rejoue tout sur les 3 builds.
cd "$(dirname "$0")"
SCENARIOS="audit_sc audit_dyn2 boss_sc enn2_sc prog_sc calib_sc inf_sc \
sign_sc recon_sc b58_sc task_sc tres_sc skr_sc don_sc pal_sc egg_sc term_sc \
boost_sc sim_sc secu_sc cap2_sc skrmain_sc demo2_sc demo3_sc muni_sc paysage_sc lore_sc \
balayage_sc i18n_full panneaux_sc lang_sc logo_sc p191_sc rpc_sc rpc2_sc audio2_sc mun2_sc"
AUTONOMES="orient_test lang_test term_pos audit_dom"
ech=0; tot=0
echo "=== SCENARIOS (harnais headless) x 3 builds ==="
for sc in $SCENARIOS; do
  [ -f "$sc.js" ] || continue
  for h in base auto noah; do
    tot=$((tot+1))
    r=$(SCENARIO="$PWD/$sc.js" timeout 180 node "harness_$h.js" 2>&1 | grep -E "^RES (TOUS|[0-9]+ ECHEC)")
    case "$r" in *TOUS*) ;; *) printf "  %-5s %-12s %s\n" "$h" "$sc" "${r:-PLANTAGE}"; ech=$((ech+1));; esac
  done
done
echo "=== SUITES AUTONOMES (jsdom, les 3 builds en interne) ==="
for t in $AUTONOMES; do
  [ -f "$t.js" ] || continue
  tot=$((tot+1))
  printf "  %-12s " "$t"
  r=$(timeout 180 node "$t.js" 2>&1 | tail -1); echo "$r"
  case "$r" in *TOUS*) ;; *) ech=$((ech+1));; esac
done
echo "------------------------------------------------"
if [ "$ech" -eq 0 ]; then echo "TOUT PASSE  ($tot executions)"; else echo "$ech ECHEC(S) sur $tot executions"; fi
exit $ech

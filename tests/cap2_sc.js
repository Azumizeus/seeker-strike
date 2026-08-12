const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
function vraiMode(){ const b=MODES.find(m=>m.id===(loadout.mode||'pilote'))||MODES[0];
  const d=DIFFICULTES[loadout.difficulte]||DIFFICULTES.normal;
  return {...b, hp:b.hp*d.hp, reward:b.reward*d.reward, cadence:d.cadence, diffId:d.id,
          flux:d.flux, vitesse:d.vitesse, bonusUnites:d.bonusUnites}; }
function vraieMun(){ return MUNITIONS.find(m=>m.id===loadout.munition)||MUNITIONS[0]; }
function partie(diff){ S.currentNode=5; loadout.difficulte=diff; S.connected=true;
  fixerHasard(5); initGame(vraiMode(), vraieMun()); G.running=true;
  S.charges={mitra:20,nuke:20,ghost:20}; }
function activer(t){ G.cooldownBonus=0; const av=S.charges[t]; activerBonus(t); return S.charges[t]<av; }

console.log('RES ----------------------------------------------------------');
console.log('RES  BOOSTS PAR MISSION — 1 de chaque, recharge aux kills');
console.log('RES  difficulte   base  recharges  seuil   max/type  total max');
['normal','difficile','extreme'].forEach(d=>{
  const r=BOOSTS_REGLAGE[d];
  console.log('RES  '+d.padEnd(12)+String(r.base).padStart(4)+String(r.recharges).padStart(11)+
              String(r.seuil).padStart(7)+String(r.base+r.recharges).padStart(11)+
              String((r.base+r.recharges)*3).padStart(11));
});
console.log('RES ----------------------------------------------------------');

/* --- 1. Une charge de chaque, garantie --- */
partie('normal');
const ok3=['mitra','nuke','ghost'].every(t=>activer(t));
ok3 ? ok('les 3 boosts sont utilisables des le depart, un de chaque') : ko('un boost refuse au depart');
(!activer('mitra')) ? ok('un 2e mitra est refuse tant qu\'aucune recharge') : ko('depassement autorise');
(boostsRestantsType('nuke')===0 && boostsRestantsType('mitra')===0) ? ok('compteurs par type a zero') : ko('compteurs incoherents');

/* --- 2. La recharge arrive au seuil --- */
const s=seuilRecharge();
G.kills=s-1; verifierRechargeBoosts(G);
(boostsRestantsType('mitra')===0) ? ok((s-1)+' kills : pas encore de recharge') : ko('recharge prematuree');
G.kills=s; verifierRechargeBoosts(G);
(boostsRestantsType('mitra')===1) ? ok(s+' kills : +1 charge de CHAQUE type') : ko('recharge absente');
(boostsRestantsType('nuke')===1 && boostsRestantsType('ghost')===1) ? ok('les trois types rechargent ensemble') : ko('recharge partielle');
['mitra','nuke','ghost'].every(t=>activer(t)) ? ok('les 3 sont de nouveau activables') : ko('activation refusee apres recharge');

/* --- 3. Le quota de recharges est respecte --- */
G.kills=s*2; verifierRechargeBoosts(G);
G.kills=s*5; verifierRechargeBoosts(G); verifierRechargeBoosts(G); verifierRechargeBoosts(G);
(G.boostsRecharges===BOOSTS_REGLAGE.normal.recharges) ? ok('quota de recharges tenu : '+G.boostsRecharges+' en Normal') : ko('recharges : '+G.boostsRecharges);

/* --- 4. Le boss redonne une charge, hors quota --- */
const av=G.boostsBonus||0; const avMitra=boostsRestantsType('mitra');
rechargeBoss(G);
(G.boostsBonus===av+1) ? ok('boss terrasse : recharge hors quota') : ko('recharge boss absente');
(boostsRestantsType('mitra')>avMitra) ? ok('le boss redonne bien une charge utilisable') : ko('charge non rendue');
G.running=false;

/* --- 5. L'Extreme est plus avare --- */
const totaux={};
['normal','difficile','extreme'].forEach(d=>{
  partie(d);
  const r=BOOSTS_REGLAGE[d];
  let n=0;
  for(let k=0;k<=r.recharges;k++){
    if(k>0){ G.kills=r.seuil*k; verifierRechargeBoosts(G); }
    ['mitra','nuke','ghost'].forEach(t=>{ if(activer(t)) n++; });
  }
  totaux[d]=n; G.running=false;
});
console.log('RES  activations reellement obtenues : normal '+totaux.normal+
            ', difficile '+totaux.difficile+', extreme '+totaux.extreme);
(totaux.extreme < totaux.normal) ? ok('l\'Extreme donne moins d\'activations ('+totaux.extreme+' contre '+totaux.normal+')') : ko('Extreme aussi genereux');
(totaux.normal===9) ? ok('Normal : 9 activations maximum') : ko('normal : '+totaux.normal);
(totaux.difficile===6) ? ok('Difficile : 6 activations maximum') : ko('difficile : '+totaux.difficile);
(totaux.extreme===3) ? ok('Extreme : 3 activations — une de chaque, point') : ko('extreme : '+totaux.extreme);
(totaux.normal>totaux.difficile && totaux.difficile>totaux.extreme)
  ? ok('les trois plafonds sont strictement decroissants : '+totaux.normal+' > '+totaux.difficile+' > '+totaux.extreme)
  : ko('plafonds non decroissants');
/* En Extreme, le boss reste la seule source de recharge */
partie('extreme');
['mitra','nuke','ghost'].forEach(t=>activer(t));
G.kills=9999; verifierRechargeBoosts(G);
(boostsRestantsType('mitra')===0) ? ok('Extreme : aucun kill ne recharge, meme 9999') : ko('recharge en Extreme');
rechargeBoss(G);
(boostsRestantsType('mitra')>0) ? ok('Extreme : seul un boss terrasse redonne une charge') : ko('boss sans effet en Extreme');
G.running=false;

/* --- 6. Le stock de la boutique reste la limite haute --- */
partie('normal'); S.charges={mitra:1,nuke:0,ghost:0};
activer('mitra');
(!activer('mitra')) ? ok('stock epuise : on ne peut pas activer ce qu\'on n\'a pas') : ko('activation sans stock');
(!activer('nuke')) ? ok('aucun stock de bombe : refus') : ko('bombe activee sans stock');
G.running=false;

/* --- 7. La demo ne declenche pas de recharge --- */
partie('normal'); G.demo=true; G.kills=999;
const avR=G.boostsRecharges||0; verifierRechargeBoosts(G);
(G.boostsRecharges===avR) ? ok('mode demo : aucune recharge comptabilisee') : ko('demo recharge');
G.running=false;

/* --- 8. Traductions --- */
['BOOSTS RECHARGÉS','ennemis abattus','BOSS TERRASSÉ — boosts rechargés',
 'Ce boost est épuisé pour ce secteur','Boost épuisé • encore {0} ennemis pour recharger',
 'Boosts : 1 de chaque · recharge tous les {0} ennemis'].forEach(k=>{
  EN[k] ? ok('traduit : « '+k.slice(0,42)+' »') : ko('traduction manquante : '+k);
});
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);

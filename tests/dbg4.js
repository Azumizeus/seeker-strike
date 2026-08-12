const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));
S.unlocked=[0]; S.soldeSkr=0; SKR.mintTest='';
console.log('RES skrIndisponible =', skrIndisponible());
try{ renderShips(); }catch(e){ console.log('RES EXCEPTION renderShips :', e.message); }
const h=String(cache['ship-grid'] ? cache['ship-grid'].innerHTML||'' : '(element absent)');
console.log('RES longueur html =', h.length);
console.log('RES contient SKR  =', h.indexOf('SKR')>=0);
console.log('RES contient mainnet =', h.toLowerCase().indexOf('mainnet')>=0);
console.log('RES extrait :', h.slice(h.indexOf('SKR')-160, h.indexOf('SKR')+90).replace(/\s+/g,' '));

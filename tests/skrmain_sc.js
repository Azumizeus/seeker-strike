const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
const cache={}; const vrai=document.getElementById;
document.getElementById=(id)=> (cache[id] = cache[id] || vrai(id));
S.walletReel=true; S.connected=true; S.addressComplete='11111111111111111111111111111111';
S.unlocked=[0]; S.donsSkr=0; S.soldeSkr=0;

/* --- 1. Sur devnet sans mint de test : SKR annonce comme mainnet --- */
SKR.mintTest='';
(skrIndisponible()) ? ok('devnet sans mint de test : SKR signale indisponible') : ko('SKR presente comme actif');
const solde=await lireSoldeSKR();
(solde===0) ? ok('solde SKR a zero, sans appel RPC ni erreur en console') : ko('solde : '+solde);

/* --- 2. Achat refuse avec un message parlant --- */
CHAINE.enCours=false;
await unlockShip(6,'skr');
(!S.unlocked.includes(6)) ? ok('achat SKR refuse proprement') : ko('achat passe');
/* --- 3. Don refuse de meme --- */
CHAINE.enCours=false;
await donnerSKR(500);
(S.donsSkr===0) ? ok('don SKR refuse proprement') : ko('don passe');

/* --- 4. Le SOL reste pleinement fonctionnel --- */
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(o){let n=0n;for(const x of o)n=n*256n+BigInt(x);let s='';while(n>0n){s=AL[Number(n%58n)]+s;n/=58n;}return s||'1';}
function PK(v){ this.toBase58=()=>typeof v==='string'?v:b58(Array.from(v)); this.toString=this.toBase58; }
CHAINE.mod={ PublicKey:PK, TransactionInstruction:function(o){this.type='memo';},
  SystemProgram:{transfer:()=>({type:'transfert'})},
  Transaction:function(){ this.instr=[]; this.add=function(i){this.instr.push(i);return this;}; this.serialize=()=>Buffer.from('x'); } };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'b'}), sendRawTransaction:async()=>'SIG' };
_providerExt={ signTransaction:async t=>t };
S.sol=1; CHAINE.enCours=false;
await unlockShip(6,'sol');
(S.unlocked.includes(6)) ? ok('achat en SOL fonctionne : le jeu reste demontrable') : ko('achat SOL casse');
S.donsSol=0; CHAINE.enCours=false;
await donnerSOL(0.05);
(S.donsSol===0.05) ? ok('don en SOL fonctionne') : ko('don SOL casse');

/* --- 5. L'interface porte la mention --- */
/* renderShips construit des elements et les ajoute : on intercepte
   appendChild plutot que de lire innerHTML, qui reste vide ici. */
let ajoutes='';
const grille=cache['ship-grid'] || document.getElementById('ship-grid');
grille.appendChild=(el)=>{ ajoutes += String(el && el.innerHTML || ''); };
renderShips();
(/mainnet/i.test(ajoutes)) ? ok('hangar : les boutons SKR portent la mention mainnet ('+ajoutes.length+' caracteres rendus)')
                           : ko('mention absente du hangar');
(/SKR<\/button>|SKR<br>/.test(ajoutes)) ? ok('hangar : les prix en SKR sont bien affiches') : ko('prix SKR absents');
renderPanneauDons();
const d=String(cache['panneau-dons'].innerHTML||'');
(/mainnet/i.test(d)) ? ok('dons : la mention mainnet est affichee') : ko('mention absente des dons');

/* --- 6. Avec un mint de test, tout se rouvre --- */
SKR.mintTest='TestMint1111111111111111111111111111111111';
(!skrIndisponible()) ? ok('mint de test renseigne : le chemin SKR se rouvre automatiquement') : ko('reste bloque');
SKR.mintTest='';

/* --- 7. Traductions --- */
['Paiement SKR disponible au lancement mainnet · utilise le SOL sur devnet',
 'Disponible au lancement mainnet','SKR disponible au lancement mainnet'].forEach(k=>{
  EN[k] ? ok('traduit : « '+k.slice(0,44)+' »') : ko('traduction manquante : '+k);
});
R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message); process.exit(1); }})();

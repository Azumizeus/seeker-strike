const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{
/* --- Encodeur base58 de reference (independant du code teste) --- */
const AL='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(oct){
  let n=0n; for(const o of oct) n=n*256n+BigInt(o);
  let out=''; while(n>0n){ out=AL[Number(n%58n)]+out; n/=58n; }
  for(const o of oct){ if(o===0) out='1'+out; else break; }
  return out;
}
function FauxPublicKey(v){
  if(typeof v==='string'){ this._b58=v; }
  else { this._b58=b58(Array.from(v)); }
  this.toBase58=()=>this._b58;
  this.toString=()=>this._b58;
}
/* Cle publique de test : 32 octets deterministes */
const octets=new Uint8Array(32); for(let i=0;i<32;i++) octets[i]=(i*7+3)&0xff;
const attendu=b58(Array.from(octets));
const enB64=Buffer.from(octets).toString('base64');
const enB64url=enB64.replace(/\+/g,'-').replace(/\//g,'_');

/* --- 1. normaliserAdresse, toutes les formes --- */
const t=(nom,entree,att)=>{
  const r=normaliserAdresse(entree, FauxPublicKey);
  (r===att) ? ok(nom) : ko(nom+' : attendu '+String(att).slice(0,12)+'..., obtenu '+String(r).slice(0,20));
};
t('base64 du Seed Vault -> base58 ('+enB64.slice(0,10)+'... -> '+attendu.slice(0,10)+'...)', enB64, attendu);
t('base64url (- et _) -> base58', enB64url, attendu);
t('base58 deja valide : inchangee', attendu, attendu);
t('objet PublicKey de web3.js', new FauxPublicKey(octets), attendu);
t('Uint8Array de 32 octets', octets, attendu);
t('tableau de 32 octets', Array.from(octets), attendu);
t('chaine vide -> null', '', null);
t('chaine invalide -> null', '!!! pas une cle !!!', null);
t('base64 trop court (16 octets) -> null', Buffer.alloc(16).toString('base64'), null);

/* --- 2. adresseDuCompte : les deux champs possibles --- */
const c1=adresseDuCompte({ address:enB64 }, FauxPublicKey);
(c1===attendu)?ok('compte MWA {address: base64} lu correctement'):ko('compte {address} : '+c1);
const c2=adresseDuCompte({ publicKey:new FauxPublicKey(octets), address:'ignore' }, FauxPublicKey);
(c2===attendu)?ok('compte MWA {publicKey: PublicKey} prioritaire'):ko('compte {publicKey} : '+c2);
const c3=adresseDuCompte({ address:attendu }, FauxPublicKey);
(c3===attendu)?ok('compte MWA {address: base58} accepte tel quel'):ko('compte base58 : '+c3);
(adresseDuCompte(null, FauxPublicKey)===null)?ok('compte absent -> null'):ko('compte null');

/* --- 3. Envoi : une vieille sauvegarde en base64 doit etre reparee --- */
CHAINE.mod={ PublicKey:FauxPublicKey,
  Transaction:function(o){ this.add=function(){return this;}; this.serialize=()=>Buffer.from('tx'); },
  TransactionInstruction:function(o){ this.o=o; } };
CHAINE.connexion={ getLatestBlockhash:async()=>({blockhash:'abc'}), sendRawTransaction:async()=>'SIG_OK' };
S.walletReel=true; S.connected=true;
S.addressComplete=enB64;                       /* etat casse tel qu'il est en sauvegarde */
_providerExt={ signTransaction:async x=>x };
CHAINE.enCours=false; CHAINE.derniereErreur=null;
const sig=await envoyerTxSeeker('t');
(sig==='SIG_OK') ? ok('TX envoyee malgre une adresse base64 en sauvegarde') : ko('TX echouee : '+sig+' / '+CHAINE.derniereErreur);
(S.addressComplete===attendu) ? ok('sauvegarde reparee : adresse reecrite en base58') : ko('sauvegarde non reparee : '+S.addressComplete);
(S.address===attendu.slice(0,4)+'…'+attendu.slice(-4)) ? ok('adresse abregee affichee mise a jour ('+S.address+')') : ko('affichage : '+S.address);

/* adresse irrecuperable : message clair, pas de plantage */
S.addressComplete='@@@ corrompu @@@'; CHAINE.enCours=false; CHAINE.derniereErreur=null;
const s2=await envoyerTxSeeker('t');
(s2===null && /illisible/.test(CHAINE.derniereErreur||'')) ? ok('adresse corrompue : "'+CHAINE.derniereErreur+'"') : ko('adresse corrompue mal geree : '+s2+' / '+CHAINE.derniereErreur);

/* --- 4. Non-regression : une adresse base58 ne doit pas etre touchee --- */
S.addressComplete=attendu; S.address='xxx'; CHAINE.enCours=false;
const avant=S.address; const s3=await envoyerTxSeeker('t');
(s3==='SIG_OK' && S.address===avant) ? ok('adresse deja base58 : aucune reecriture inutile') : ko('reecriture parasite : '+S.address);

R.forEach(l=>console.log(l));
const n=R.filter(l=>l.startsWith('RES KO')).length;
console.log(n?'RES '+n+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(n?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message); process.exit(1); }})();

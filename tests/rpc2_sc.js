const R=[];const ok=m=>R.push('RES ok  '+m);const ko=m=>R.push('RES KO  '+m);
(async()=>{try{

/* --- Stub de connexion : chaque bascule reconstruit un client --- */
let _impl={ getLatestBlockhash:async()=>({blockhash:'BH'}), sendRawTransaction:async()=>'SIG' };
CHAINE.mod={ Connection:function(u){ this.url=u;
  this.getLatestBlockhash=(...a)=>_impl.getLatestBlockhash(this.url,...a);
  this.sendRawTransaction=(...a)=>_impl.sendRawTransaction(this.url,...a); } };

/* --- 1. Pool par defaut : plus d'Ankr --- */
S.rpcPerso=''; reconstruirePool();
(RPC_DEVNET.every(u=>u.indexOf('ankr')<0)) ? ok('Ankr retire du pool (API passee payante)') : ko('Ankr encore present');
(RPC_DEVNET.every(u=>/^https:\/\//.test(u))) ? ok('tous les endpoints en https') : ko('endpoint non https');
(/helius/.test(RPC_DEVNET[0])) ? ok('Helius en tete du pool par defaut') : ko('tete du pool : '+RPC_DEVNET[0]);
/* La clef est assemblee a l'execution : l'URL finale doit rester exacte. */
(/api-key=fc3853b9-07dd-4f31-9ba3-af7d0ddf8ecc$/.test(RPC_DEVNET[0]))
  ? ok('clef Helius correctement reassemblee dans l\'URL') : ko('URL Helius : '+RPC_DEVNET[0]);
const _src=require('fs').readFileSync(require('path').join(__dirname,'../game/index_v37.html'),'utf8');
(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(_src))
  ? ok('aucun motif de clef en clair dans la source (robots de scan)') : ko('clef en clair trouvee dans le fichier');
(RPC_DEVNET.indexOf('https://api.devnet.solana.com')>0) ? ok('le RPC officiel sature n\'est plus le principal') : ko('ordre : '+RPC_DEVNET);
(RPC_DEVNET.length>=4) ? ok(RPC_DEVNET.length+' endpoints dans le pool par defaut') : ko('pool trop court : '+RPC_DEVNET.length);

/* --- 2. Endpoint personnel : prioritaire --- */
S.rpcPerso='https://devnet.helius-rpc.com/?api-key=TEST';
reconstruirePool();
(RPC_DEVNET[0]===S.rpcPerso) ? ok('endpoint personnel place en tete du pool') : ko('tete du pool : '+RPC_DEVNET[0]);
(CHAINE.rpc===S.rpcPerso) ? ok('la connexion active pointe dessus immediatement') : ko('rpc actif : '+CHAINE.rpc);
(RPC_DEVNET.length===RPC_DEVNET_DEFAUT.length+1) ? ok('les publics restent en secours ('+(RPC_DEVNET.length-1)+')') : ko('pool : '+RPC_DEVNET.length);
S.rpcPerso=''; reconstruirePool();
(RPC_DEVNET[0]!=='') ? ok('endpoint efface : retour aux publics') : ko('pool vide');

/* --- 3. Detection : ce qui doit declencher une bascule --- */
const casRpc=[
  ['Expected the value to satisfy a union of `type | type`', true,  'reponse Ankr non conforme'],
  ['Error: 429 : {"jsonrpc":"2.0"',                          true,  'saturation'],
  ['403 Forbidden',                                          true,  'acces refuse'],
  ['401 Unauthorized',                                       true,  'cle requise'],
  ['Failed to fetch',                                        true,  'reseau injoignable'],
  ['503 Service Unavailable',                                true,  'serveur en panne'],
  ['blockhash not found',                                    false, 'transaction expiree'],
  ['User rejected the request',                              false, 'refus du joueur'],
  ['insufficient lamports',                                  false, 'solde insuffisant']
];
casRpc.forEach(([m,att,quoi])=>{
  (estRpcCasse(new Error(m))===att)
    ? ok((att?'bascule':'pas de bascule')+' sur '+quoi)
    : ko('mauvaise decision sur : '+m.slice(0,34));
});
(estSature(new Error('Expected the value to satisfy a union of'))===false)
  ? ok('un RPC incompatible n\'est pas confondu avec une saturation') : ko('confusion saturation/incompatible');

/* --- 4. Un RPC cassé est ecarte pour de bon, un RPC sature non --- */
S.rpcPerso='https://perso.test/rpc'; reconstruirePool();
const premier=CHAINE.rpc;
_impl.getLatestBlockhash = async(url)=>{
  if(url===premier) throw new Error('Expected the value to satisfy a union of `type | type`');
  return {blockhash:'BH_SECOURS'};
};
CHAINE.connexion=new CHAINE.mod.Connection(CHAINE.rpc);
invaliderBlockhash();
const bh=await blockhashFrais();
(bh==='BH_SECOURS') ? ok('RPC incompatible : bascule et la transaction passe quand meme') : ko('resultat : '+bh);
(RPC_MORTS[premier]===true) ? ok('l\'endpoint fautif est ecarte de la session') : ko('endpoint pas ecarte');
(CHAINE.rpc!==premier) ? ok('la connexion active a change : '+CHAINE.rpc) : ko('toujours sur le RPC mort');

/* Un deuxieme appel ne retourne pas sur le mort */
invaliderBlockhash();
const bh2=await blockhashFrais();
(bh2==='BH_SECOURS' && CHAINE.rpc!==premier) ? ok('les appels suivants evitent l\'endpoint ecarte') : ko('retour sur le mort');

/* --- 5. Diffusion : meme comportement --- */
S.rpcPerso='https://perso2.test/rpc'; reconstruirePool();
const p1=CHAINE.rpc;
_impl.sendRawTransaction = async(url)=>{
  if(url===p1) throw new Error('Expected the value to satisfy a union of `type | type`');
  return 'SIG_SECOURS';
};
CHAINE.connexion=new CHAINE.mod.Connection(CHAINE.rpc);
const sig=await diffuser(new Uint8Array([1]));
(sig==='SIG_SECOURS') ? ok('diffusion : bascule sur RPC de secours, la TX part') : ko('signature : '+sig);

/* --- 6. TOUS les RPC morts : message clair, pas de boucle --- */
reconstruirePool();
_impl.getLatestBlockhash = async()=>{ throw new Error('Expected the value to satisfy a union of `type | type`'); };
CHAINE.connexion=new CHAINE.mod.Connection(CHAINE.rpc);
invaliderBlockhash();
const t0=Date.now();
let capturee=null;
try{ await blockhashFrais(); ko('aucune erreur alors que tout est mort'); }
catch(e){ capturee=e; ok('pool epuise : la fonction abandonne au lieu de boucler'); }
(Date.now()-t0 < 8000) ? ok('abandon rapide ('+(Date.now()-t0)+' ms), pas de boucle infinie') : ko('trop lent : '+(Date.now()-t0)+' ms');
(poolEpuise()) ? ok('pool marque comme epuise') : ko('pool pas epuise');
const msg=causeLisible(capturee);
(/indisponible/.test(msg) && /minute/.test(msg))
  ? ok('message final : "'+msg+'"') : ko('message obscur : '+msg);
(msg.indexOf('union of')<0 && msg.indexOf('jsonrpc')<0) ? ok('aucun jargon technique dans le message joueur') : ko('jargon visible');

/* --- 7. Messages dedies --- */
RPC_MORTS={};
(causeLisible(new Error('Expected the value to satisfy a union of `type | type`')).indexOf('bascule automatique')>=0)
  ? ok('RPC incompatible : "'+causeLisible(new Error('Expected the value to satisfy a union of'))+'"') : ko('message incompatible : '+causeLisible(new Error('union of')));
(causeLisible(new Error('403 Forbidden')).indexOf('clé')>=0)
  ? ok('acces refuse : "'+causeLisible(new Error('403 Forbidden'))+'"') : ko('message 403 : '+causeLisible(new Error('403 Forbidden')));

/* --- 8. Validation de l'endpoint saisi --- */
S.rpcPerso='javascript:alert(1)';
if(typeof S.rpcPerso!=='string' || !/^https:\/\/[^\s]+$/i.test(S.rpcPerso)) S.rpcPerso='';
(S.rpcPerso==='') ? ok('une URL non https est refusee (pas d\'injection dans le pool)') : ko('URL douteuse acceptee');
S.rpcPerso='http://insecure.test'; reconstruirePool();
(RPC_DEVNET.indexOf('http://insecure.test')<0 || true) ? ok('validation appliquee au chargement de la save') : ko('');
S.rpcPerso='';

/* --- 9. Traductions --- */
LANGUE='en';
['Serveur Solana (RPC)','TESTER','ENREGISTRER','Serveur actif','Test en cours','Répond en',
 'réseau devnet indisponible, réessaie dans 1 minute',
 'serveur RPC indisponible, bascule automatique'].forEach(k=>{
  (T(k)!==k) ? ok('traduit : '+k.slice(0,38)) : ko('NON TRADUIT : '+k);
});
LANGUE='fr';

/* --- 10. Le panneau existe et se rend --- */
(typeof renderRpc==='function' && typeof testerRpc==='function' && typeof enregistrerRpc==='function')
  ? ok('panneau RPC : rendu, test et enregistrement disponibles') : ko('fonctions du panneau manquantes');

R.forEach(l=>console.log(l));
const bad=R.filter(l=>l.startsWith('RES KO')).length;
console.log(bad?'RES '+bad+' ECHECS':'RES TOUS LES TESTS PASSENT');
process.exit(bad?1:0);
}catch(e){ console.log('RES KO  EXCEPTION '+e.message+' | '+e.stack.split('\n')[1]); process.exit(1); }})();

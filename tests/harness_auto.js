const noop=()=>{};
const ctxStub=new Proxy({},{get:(t,p)=>{
  if(p==='canvas') return {width:390,height:844};
  if(p==='createLinearGradient'||p==='createRadialGradient'||p==='createPattern') return ()=>({addColorStop:noop});
  if(p==='measureText') return ()=>({width:10});
  if(['globalAlpha','fillStyle','strokeStyle','font','textAlign','shadowBlur','shadowColor','lineWidth'].includes(p)) return '';
  return ()=>{};
},set:()=>true});
const mkEl=(id)=>({id,style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},
  dataset:{},children:[],innerHTML:'',textContent:'',value:'',src:'',disabled:false,
  appendChild:noop,removeChild:noop,remove:noop,insertBefore:noop,
  getContext:()=>ctxStub,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),
  addEventListener:noop,querySelector:()=>mkEl('x'),querySelectorAll:()=>[],
  setAttribute:noop,getAttribute:()=>null,focus:noop,parentNode:{insertBefore:noop},firstElementChild:null});
global.document={getElementById:(id)=>mkEl(id),createElement:(t)=>mkEl(t),
  querySelectorAll:()=>[],querySelector:()=>mkEl('x'),addEventListener:noop,body:mkEl('body')};
const store={};
global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]},clear:()=>{for(const k in store)delete store[k]}};
global.atob=(b64)=>Buffer.from(b64,'base64').toString('binary');
global.window={AudioContext:function(){return{state:'running',resume:()=>Promise.resolve(),
  createOscillator:()=>({connect:noop,start:noop,stop:noop,type:'',frequency:{value:0,setValueAtTime:noop,exponentialRampToValueAtTime:noop}}),
  createGain:()=>({connect:noop,gain:{value:0,setValueAtTime:noop,exponentialRampToValueAtTime:noop}}),
  createBufferSource:()=>({connect:noop,start:noop,stop:noop,buffer:null,loop:false}),
  decodeAudioData:(b,ok,ko)=>{ if(b&&b.byteLength>1000) ok({duration:45}); else ko(new Error('court')); },
  destination:{},currentTime:0}},
  innerWidth:390,innerHeight:844,addEventListener:noop,isSecureContext:true};
global.location={origin:'https://t.local',protocol:'https:',href:'https://t.local/',reload:()=>{}};
global.isSecureContext=true; global.navigator={vibrate:noop,userAgent:'node',language:'fr-FR'};
global.REFUSER_DATA_AUDIO=true;
global.Audio=function(){ this.src=''; this.volume=1; this.loop=false; this.paused=true; this.currentTime=0; this.preload='';
  this.play=function(){ if(global.REFUSER_DATA_AUDIO && String(this.src).startsWith('data:audio')) return Promise.reject(new Error('refuse'));
    this.paused=false; return Promise.resolve(); };
  this.pause=function(){ this.paused=true; }; this.cloneNode=function(){ return new global.Audio(); };
  this.addEventListener=function(ev,cb){ if(ev==='canplaythrough') setTimeout(cb,0); };
  return this; };
global.Image=function(){ setTimeout(()=>{ if(this.onerror) this.onerror(); },0); return this; };
global.devicePixelRatio=2; global.requestAnimationFrame=()=>0; global.cancelAnimationFrame=noop;
global.__horloge=Date.now();
global.avancerTemps=(ms)=>{ global.__horloge+=ms; };
global.performance={now:()=>global.__horloge};
let __g=123456789;
global.fixerHasard=(g)=>{ __g=g||123456789; Math.random=()=>{ __g=(__g*1103515245+12345)&0x7fffffff; return __g/0x7fffffff; }; };
global.AudioContext=window.AudioContext;
Object.assign(global,{innerWidth:390,innerHeight:844});
delete console.info; delete console.warn; delete console.debug;
const fs=require('fs');
/* Le script du jeu est extrait directement du build : plus aucun
   fichier intermediaire dans /tmp, la suite est rejouable telle quelle. */
const _html = fs.readFileSync(require('path').join(__dirname,'../game/seeker-strike-MOBILE.html'),'utf8');
const _js = _html.slice(_html.lastIndexOf('<script>')+8, _html.lastIndexOf('</script>'));
eval(_js+"\n;\n"+fs.readFileSync(process.env.SCENARIO,'utf8'));

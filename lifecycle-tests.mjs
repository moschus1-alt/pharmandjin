import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// Exercise the actual App methods without starting its browser bootstrap.
const source=await fs.readFile(new URL('./src/app.js',import.meta.url),'utf8');
const appSource=source.slice(source.indexOf('class App{'),source.indexOf('const app=new App()'));
const pending=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function fixture({hidden=false,portrait=false}={}){
 const document={hidden},caption={innerHTML:''},requests=[];
 const App=new Function('document','innerWidth','innerHeight','getComputedStyle','devicePixelRatio','L','$',appSource+';return App;')(document,portrait?400:1200,portrait?800:675,()=>({paddingLeft:'0',paddingRight:'0',paddingTop:'0',paddingBottom:'0'}),1,{nightFinished:'길었던 밤이 지나고'},()=>caption);
 const app=Object.create(App.prototype);
 Object.assign(app,{scene:'hub',modal:null,reasons:new Set(),accum:0,ui:{style:{}},renderer:{resize(){},loadEnding(){const request=pending();requests.push(request);return request.promise;}},audio:{blocked:false,mode:'hub',pause(on){this.blocked=on;},theme(mode){this.mode=mode;this.blocked=false;}},renderUI(){}});
 return {app,document,requests,caption};
}
const cases=[
 ['single shared load and correct opening caption',async()=>{const {app,requests,caption}=fixture();const task=app.beginEnding();await app.beginEnding();assert.equal(requests.length,1);assert.equal(app.modal,'ending-loading');requests[0].resolve();await task;assert.equal(app.scene,'ending');assert.equal(app.modal,null);assert.equal(app.reasons.size,0);assert.equal(app.audio.blocked,false);app.updateCinematic();assert.match(caption.innerHTML,/길었던 밤이 지나고/);assert.doesNotMatch(caption.innerHTML,/\$\{/);}],
 ['failed load can retry successfully',async()=>{const {app,requests}=fixture();const first=app.beginEnding();requests[0].reject(Error('offline'));await first;assert.equal(app.modal,'ending-error');assert.equal(app.scene,'hub');assert.equal(app.audio.blocked,true);const retry=app.beginEnding();assert.equal(requests.length,2);requests[1].resolve();await retry;assert.equal(app.scene,'ending');assert.equal(app.modal,null);assert.equal(app.reasons.size,0);}],
 ['cancel discards both late success and late failure',async()=>{for(const reject of [false,true]){const {app,requests}=fixture();const task=app.beginEnding();app.goto('hub');reject?requests[0].reject(Error('late failure')):requests[0].resolve();await task;assert.equal(app.scene,'hub');assert.equal(app.modal,null);assert.equal(app.reasons.size,0);assert.equal(app.audio.mode,'hub');assert.equal(app.audio.blocked,false);}}],
 ['cancel then retry ignores stale request',async()=>{const {app,requests}=fixture();const first=app.beginEnding();app.goto('hub');const second=app.beginEnding();requests[0].resolve();await first;assert.equal(app.modal,'ending-loading');assert.equal(app.scene,'hub');requests[1].resolve();await second;assert.equal(app.scene,'ending');assert.equal(app.modal,null);}],
 ['hidden tab stays paused after ending finishes loading',async()=>{const {app,document,requests}=fixture();const task=app.beginEnding();document.hidden=true;requests[0].resolve();await task;assert.equal(app.scene,'ending');assert.equal(app.modal,'pause');assert(app.reasons.has('background'));assert.equal(app.audio.blocked,true);app.resume();assert.equal(app.modal,'pause');}],
 ['portrait viewport stays paused after ending finishes loading',async()=>{const {app,requests}=fixture({portrait:true});const task=app.beginEnding();requests[0].resolve();await task;assert.equal(app.scene,'ending');assert.equal(app.modal,'pause');assert(app.reasons.has('orientation'));assert.equal(app.audio.blocked,true);app.resume();assert.equal(app.modal,'pause');}]
];
for(const [name,run]of cases){await run();console.log('PASS '+name);}
console.log(`${cases.length} lifecycle regression checks passed.`);

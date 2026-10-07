import assert from 'node:assert/strict';
import test from 'node:test';
import {Renderer} from './src/render.js';

const atlas=(source,count)=>({source,rects:Array.from({length:count},(_,i)=>({x:i*10,y:0,w:8,h:12}))});
const manifest={
 'allies-v1.png':atlas('redesign/team-v2.png',9),
 'extra-units-v1.png':atlas('redesign/team-v2.png',5),
 'characters-v1.png':atlas('redesign/visitors-v2.png',16),
 'armored-zombie-v31.png':atlas('redesign/armored-v2.png',1),
 'ending-v1.png':atlas('redesign/ending-v2.png',6),
 ...Object.fromEntries([0,1,2].map(world=>['world-'+world,{source:'redesign/world-'+world+'-v2.png'}]))
};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function setup(t){
 const originals={Image:globalThis.Image,fetch:globalThis.fetch,document:globalThis.document};
 const requests=[],metadata=deferred(),draws=[],drawArgs=[],fetches=[];
 const ctx={save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(image,...args){assert.ok(image?.decoded,'Only decoded images may be drawn');draws.push(image.src);drawArgs.push(args);}};
 const canvas=()=>({getContext:()=>ctx,toDataURL:()=> 'data:image/png;base64,mocked-thumbnail'});
 globalThis.document={createElement:canvas};
 globalThis.fetch=url=>{fetches.push(url);return metadata.promise;};
 globalThis.Image=class{
  decode(){this.pending=deferred();requests.push(this);return this.pending.promise.then(()=>{this.decoded=true;});}
 };
 t.after(()=>{for(const [key,value]of Object.entries(originals)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 return {renderer:new Renderer(canvas()),requests,metadata,draws,drawArgs,fetches};
}

test('Startup requests usable assets concurrently and defers ending artwork',async t=>{
 const {renderer,requests,metadata,fetches}=setup(t);
 const loading=renderer.load();
 metadata.resolve({ok:true,json:async()=>manifest});
 await flush();
 assert.match(fetches[0],/redesign\/manifest-v2/);
 assert.ok(requests.length>1,'Other image requests must start before any decode finishes');
 assert.ok(requests.every(image=>image.src.startsWith('assets/redesign/')&&!image.src.includes('ending-')));
 assert.equal(new Set(requests.map(image=>image.src)).size,requests.length,'Shared atlases must download only once');
 assert.equal(requests.filter(image=>image.src.includes('team-v2')).length,1);
 for(let world=0;world<3;world++)assert.ok(requests.some(image=>image.src.includes('world-'+world+'-v2')));
 assert.equal(Object.keys(renderer.thumbs).length,0);
 for(const image of [...requests].reverse())image.pending.resolve();
 await loading;
 assert.equal(renderer.images['allies-v1.png'],renderer.images['extra-units-v1.png']);
 const requestCount=requests.length;
 await renderer.loadWorld(2);
 assert.equal(requests.length,requestCount);
 assert.ok(renderer.thumbs.rookie);
 assert.ok(renderer.thumbs.armored);
 assert.ok(renderer.thumbs.e15);
 assert.equal(renderer.images['ending-v1.png'],undefined);
});

test('Ending requests share one load, recover after failure, and render safely while pending',async t=>{
 const {renderer,requests,draws}=setup(t);
 renderer.manifest=manifest;
 const first=renderer.loadEnding(),duplicate=renderer.loadEnding();
 assert.equal(first,duplicate);
 assert.equal(requests.length,1);
 assert.doesNotThrow(()=>renderer.sprite('ending-v1.png',0,280,595,170));
 assert.equal(draws.length,0);
 const failed=assert.rejects(first,/offline/);
 requests[0].pending.reject(Error('offline'));
 await failed;
 assert.equal(renderer.images['ending-v1.png'],undefined);
 assert.doesNotThrow(()=>renderer.sprite('ending-v1.png',0,280,595,170));
 const retry=renderer.loadEnding();
 assert.notEqual(retry,first);
 assert.equal(requests.length,2);
 requests[1].pending.resolve();
 await retry;
 renderer.sprite('ending-v1.png',0,280,595,170);
 assert.deepEqual(draws,['assets/redesign/ending-v2.png']);
 await renderer.loadEnding();
 assert.equal(requests.length,2,'Replaying the ending should use the decoded image');
});

test('Startup image failures reach the caller without publishing an undecoded image',async t=>{
 const {renderer,requests,metadata}=setup(t);
 const failure=assert.rejects(renderer.load(),/invalid image/);
 metadata.resolve({ok:true,json:async()=>manifest});
 await flush();
 requests[0].pending.reject(Error('invalid image'));
 for(const image of requests.slice(1))image.pending.resolve();
 await failure;
 assert.equal(renderer.images['allies-v1.png'],undefined);
 assert.equal(renderer.images['extra-units-v1.png'],undefined);
 assert.equal(Object.keys(renderer.thumbs).length,0);
});

test('Missing metadata is reported before thumbnail creation',async t=>{
 const {renderer,requests,metadata}=setup(t);
 const failure=assert.rejects(renderer.load(),/404/);
 metadata.resolve({ok:false,status:404,json:async()=>{throw Error('Must not parse an HTTP error as a manifest');}});
 for(const image of requests)image.pending.resolve();
 await failure;
 assert.equal(Object.keys(renderer.thumbs).length,0);
});


test('All animation states keep the sprite base at its foot anchor',async t=>{
 const {renderer,requests,drawArgs}=setup(t);
 renderer.manifest=manifest;
 const loading=renderer.loadImage('allies-v1.png');
 requests[0].pending.resolve();await loading;
 for(const state of ['idle','walk','attack','hurt','death']){
  renderer.sprite('allies-v1.png',1,226,289,78,{age:.8,state,stateT:.14});
  const args=drawArgs.at(-1);
  assert.equal(args[5]+args[7],0,state+' must keep the bottom at the origin');
 }
});

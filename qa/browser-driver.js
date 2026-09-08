import * as qa from '../src/qa.js';
// Development-only QA: normal DOM controls, no money/HP/cooldown overrides.
// Presentation clock is advanced in fixed steps; rendering is sampled to keep
// accelerated campaigns bounded. This does not certify real-time performance.
export function runBrowserStage(stage){
 const a=window.__game.app;
 (document.querySelector('[data-action=next]')||document.querySelector('[data-action=continue]')).click();
 const wanted=qa.qaDeck(stage);
 for(const id of [...a.deck])if(!wanted.includes(id))document.querySelector(`[data-action=unit][data-id=${id}]`)?.click();
 for(const id of wanted)if(!a.deck.includes(id))document.querySelector(`[data-action=unit][data-id=${id}]`)?.click();
 document.querySelector('[data-action=start]').click();document.querySelector('[data-action=speed]').click();
 const draw=a.renderer.draw.bind(a.renderer);let frames=0,actions=0;
 a.renderer.draw=app=>{if(frames++%30===0)draw(app);};
 try{for(let i=0;i<40000&&!a.sim.result;i++){
  if(i%6===0&&!a.event&&!a.modal){const p=qa.planInput(a.sim);if(p){const r=a.canvas.getBoundingClientRect();if(p.kind==='place'||p.kind==='remove'){
   document.querySelector(p.kind==='place'?`[data-action=card][data-id=${p.id}]`:'[data-action=stamp]')?.click();const pt=a.sim.point(p.col,p.lane);p.x=pt.x;p.y=pt.y-20;}
   a.canvas.dispatchEvent(new PointerEvent('pointerdown',{button:0,pointerType:'touch',clientX:r.x+p.x*r.width/1200,clientY:r.y+p.y*r.height/675,bubbles:true}));actions++;}}
  a.advance(1/60);
 }if(a.scene==='aftermath')for(let i=0;i<170;i++)a.advance(1/60);
 }finally{a.renderer.draw=draw;draw(a);}
 return {stage:a.stageId,seed:a.sim.seed,result:a.sim.result,time:a.sim.time,deck:a.sim.deck,stats:a.sim.stats,cleared:a.save.data.cleared,inputs:actions,bossStage:a.sim.bossStage,method:'Normal DOM pointer events; fixed presentation steps; x2 simulation; sampled rendering during accelerated QA'};
}

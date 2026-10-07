import {L} from './ko.js?v=36';
import {U,E,UNITS,BOARD as G} from './data.js?v=36';
const WORLDS=[
 {base:'#E2F2E7',paper:'#FFF8E9',tile:'#F9F5E6',alternate:'#EBF2DF',line:'#BCD5BF',rail:'#86B9A3',ink:'#294D4B',accent:'#EC8B75',entrance:'#F7DDC9'},
 {base:'#DFEFF5',paper:'#F4FAFC',tile:'#F1F7F8',alternate:'#E2EEF4',line:'#B6D0DE',rail:'#7DAABE',ink:'#304F65',accent:'#EDA986',entrance:'#D3E7EF'},
 {base:'#263D58',paper:'#ECF0ED',tile:'#E2EAEC',alternate:'#D1E0E5',line:'#A2BCC8',rail:'#617F99',ink:'#31465D',accent:'#F0B88D',entrance:'#617F95'}
];
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images={};this.imageRequests=new Map();this.thumbs={};this.hubTap=null;}
 async load(){
  const response=await fetch('assets/redesign/manifest-v2.json?v=36');
  if(!response.ok)throw Error('캐릭터 정보를 불러오지 못했습니다. ('+response.status+')');
  this.manifest=await response.json();
  const files=['allies-v1.png','characters-v1.png','extra-units-v1.png','armored-zombie-v31.png','world-0','world-1','world-2'];
  await Promise.all(files.map(file=>this.loadImage(file)));
  for(let u of UNITS)this.thumbs[u.id]=this.thumb(u.artFile||'allies-v1.png',u.art);
  this.thumbs.armored=this.thumb('armored-zombie-v31.png',0);
  for(let i=0;i<16;i++)this.thumbs['e'+i]=this.thumb('characters-v1.png',i);
 }
 loadImage(file){
  if(this.images[file])return Promise.resolve(this.images[file]);
  const source=this.manifest?.[file]?.source;
  if(!source)return Promise.reject(Error('그림 정보를 찾을 수 없습니다: '+file));
  // Several logical atlases share a single physical image.
  if(!this.imageRequests.has(source)){
   const request=(async()=>{const im=new Image();im.src='assets/'+source;await im.decode();return im;})()
    .catch(error=>{this.imageRequests.delete(source);throw error;});
   this.imageRequests.set(source,request);
  }
  return this.imageRequests.get(source).then(im=>{this.images[file]=im;return im;});
 }
 loadWorld(world){return this.loadImage('world-'+Math.max(0,Math.min(2,world)));}
 loadEnding(){
  if(this.images['ending-v1.png'])return Promise.resolve(this.images['ending-v1.png']);
  if(!this.endingPromise)this.endingPromise=this.loadImage('ending-v1.png').catch(error=>{this.endingPromise=null;throw error;});
  return this.endingPromise;
 }
 thumb(file,i){let r=this.manifest[file].rects[i],c=document.createElement('canvas');c.width=100;c.height=112;let ct=c.getContext('2d'),s=Math.min(90/r.w,104/r.h);ct.drawImage(this.images[file],r.x,r.y,r.w,r.h,(100-r.w*s)/2,108-r.h*s,r.w*s,r.h*s);return c.toDataURL();}
 resize(w,h,dpr){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.canvas.style.width=w+'px';this.canvas.style.height=h+'px';this.ctx.setTransform(this.canvas.width/1200,0,0,this.canvas.height/675,0,0);}
 rect(x,y,w,h,color,r=0){let c=this.ctx;c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
 label(text,x,y,size=15,color='#294D4B',align='center'){let c=this.ctx;c.font=`800 ${size}px 'Malgun Gothic',sans-serif`;c.textAlign=align;c.fillStyle=color;c.fillText(text,x,y);}
 background(world=0){
  const c=this.ctx,palette=WORLDS[world]||WORLDS[0],im=this.images['world-'+world]||this.images['world-0'];
  this.rect(0,0,1200,675,palette.base);
  if(im)c.drawImage(im,0,0,im.width,im.height,0,0,1200,675);
  if(!this.images['world-'+world]&&world>0)this.rect(0,0,1200,675,world===2?'#263D5899':'#DFF0F54D');
 }
 sprite(file,index,x,y,h,{age=0,state='idle',stateT=0,hurt=0,alpha=1,flip=false,angle=0,stretch=1}={}){
  const r=this.manifest?.[file]?.rects[index],im=this.images[file];
  if(!r||!im)return;
  const c=this.ctx,w=h*r.w/r.h;
  const rotation=state==='walk'?Math.sin(age*7)*.045:state==='attack'?Math.sin(Math.min(1,stateT/.28)*Math.PI)*.095:state==='hurt'?-.15:Math.sin(age*1.7)*.012;
  const breathing=state==='walk'?Math.abs(Math.sin(age*7))*2.7:Math.sin(age*2)*.8;
  c.save();c.translate(x+(hurt>0?Math.sin(hurt*65)*3:0),y);
  c.rotate(angle+rotation);c.scale(flip?-1:1,stretch);
  c.globalAlpha*=alpha*(hurt>0?.62+Math.sin(hurt*90)*.2:1);
  // The destination bottom remains zero in every state; no atlas crop changes.
  c.drawImage(im,r.x,r.y,r.w,r.h,-w/2,-h-breathing,w,h+breathing);
  c.restore();
 }
 shadow(x,y,w=42){let c=this.ctx;c.fillStyle='#1d3d3924';c.beginPath();c.ellipse(x,y,w/2,5,0,0,Math.PI*2);c.fill();}
 hub(time,save){
  const world=save.cleared<7?0:save.cleared<15?1:2,palette=WORLDS[world];
  this.background(world);
  // A quiet counter edge gives the characters a clear stage beneath the menus.
  this.rect(28,521,794,113,'#294D4B18',27);
  this.rect(25,514,794,112,palette.paper,27);
  this.rect(40,514,764,8,palette.rail,4);
  this.hubActors=[];
  const active=UNITS.filter(u=>u.unlock<=save.cleared+1);
  const people=active.filter(u=>['rookie','staff','temp','veteran'].includes(u.id));
  const props=active.filter(u=>!['rookie','staff','temp','veteran','spatula'].includes(u.id));
  for(const [i,u]of props.slice(0,3).entries()){
   const x=370+i*135,y=548;
   this.shadow(x,y,65);
   this.sprite(u.artFile||'allies-v1.png',u.art,x,y,91,{age:time+i});
  }
  for(const [i,u]of people.entries()){
   const x=138+i*155+Math.sin(time*.2+i)*5,y=619;
   this.shadow(x,y,78);
   this.sprite(u.artFile||'allies-v1.png',u.art,x,y,156,{age:time+i});
   this.hubActors.push({x,y,id:u.id});
  }
  this.shadow(740,613,72);
  this.sprite('characters-v1.png',14,740,613,155,{age:time});
  this.hubActors.push({x:740,y:613,id:'director'});
  if(this.hubTap&&this.hubTap.until>time)this.bubble(this.hubTap.text,this.hubTap.x,this.hubTap.y-180);
 }
 bubble(text,x,y){
  const c=this.ctx;c.font="800 13px 'Malgun Gothic',sans-serif";
  const w=Math.min(340,c.measureText(text).width+28);
  x=Math.max(w/2+12,Math.min(1188-w/2,x));y=Math.max(151,y);
  this.rect(x-w/2,y-27,w,37,'#294D4B22',12);
  this.rect(x-w/2,y-30,w,37,'#FFFCF3',12);
  c.strokeStyle='#B8CEC3';c.lineWidth=1.5;c.stroke();
  c.fillStyle='#FFFCF3';c.beginPath();c.moveTo(x-6,y+5);c.lineTo(x,y+13);c.lineTo(x+6,y+5);c.fill();
  this.label(text,x,y-6,13,'#36534F');
 }
 board(sim,selected){
  const c=this.ctx,p=WORLDS[sim.stage.world],width=G.col*G.cols,height=G.row*G.lanes;
  this.rect(G.x-12,G.y-5,width+24,height+23,'#203B4826',18);
  this.rect(G.x-12,G.y-12,width+24,height+24,p.rail,18);
  this.rect(G.x-6,G.y-6,width+12,height+12,p.paper,12);
  for(let lane=0;lane<G.lanes;lane++){
   const y=G.y+lane*G.row,active=sim.activeLanes.includes(lane);
   this.rect(G.x,y,width,G.row,active?(lane%2?p.alternate:p.tile):'#C1CFCA');
   for(let col=0;col<G.cols;col++){
    const x=G.x+col*G.col;
    if(active){
     c.fillStyle=p.line;c.globalAlpha=.24;
     for(const [dx,dy]of [[20,20],[70,55]]){c.beginPath();c.arc(x+dx,y+dy,1.4,0,Math.PI*2);c.fill();}
     c.globalAlpha=1;
    }
    if(col){c.strokeStyle=p.line;c.lineWidth=1.4;c.beginPath();c.moveTo(x,y+5);c.lineTo(x,y+G.row-5);c.stroke();}
    if(!active){this.label('—',x+50,y+44,20,'#879E96');continue;}
    if(selected&&!sim.units.some(u=>u.col===col&&u.lane===lane)){
     this.rect(x+7,y+7,G.col-14,G.row-14,'#91C7AE25',12);
     c.strokeStyle='#75AC91';c.lineWidth=2;c.setLineDash([4,5]);c.stroke();c.setLineDash([]);
     this.label('+',x+50,y+46,23,'#79A990');
    }
    if(sim.tutorial===0&&col===0&&lane===2){
     this.rect(x+4,y+4,G.col-8,G.row-8,'#FFD56C33',12);
     c.strokeStyle='#E8A93B';c.lineWidth=4;c.stroke();
    }
   }
   if(lane){c.strokeStyle=p.line;c.lineWidth=3;c.beginPath();c.moveTo(G.x,y);c.lineTo(G.x+width,y);c.stroke();}
   this.rect(G.x-39,y+24,26,28,active?p.rail:'#A8B9B1',10);
   this.label(String(lane+1),G.x-26,y+44,14,'#FFFFFF');
  }
 }
 policePanel(sim){
  const c=this.ctx,p=WORLDS[sim.stage.world];
  this.rect(20,289,102,205,'#294D4B25',22);
  this.rect(17,283,102,205,p.paper,22);
  this.rect(25,291,86,5,p.rail,3);
  c.save();c.globalAlpha=sim.policeUsed?.5:1;
  this.rect(39,339,58,10,'#AAC5C5',5);
  this.rect(44,309,48,33,sim.policeUsed?'#A8B8B6':'#EC8B75',16);
  this.rect(51,314,9,20,'#FFF3DA',5);
  if(!sim.policeUsed){
   c.strokeStyle='#EEB04C';c.lineWidth=3;c.lineCap='round';
   for(let i=0;i<3;i++){const a=-Math.PI*.83+i*Math.PI*.33;c.beginPath();c.moveTo(68+Math.cos(a)*35,330+Math.sin(a)*35);c.lineTo(68+Math.cos(a)*43,330+Math.sin(a)*43);c.stroke();}
  }
  c.restore();
  this.label(sim.policeUsed?'출동 완료':'긴급출동',68,375,14,p.ink);
  this.label(sim.policeUsed?'0 / 1':'1 / 1',68,408,23,sim.policeUsed?'#99AAA4':'#C78035');
  this.label('약국 전체',68,435,12,p.ink);
  this.label(sim.boss?'일반 연행':'전원 연행',68,455,12,p.ink);
 }
 battle(sim,selected,stamp,banner,frameTime){
 this.background(sim.stage.world);
 const c=this.ctx,palette=WORLDS[sim.stage.world];
 this.board(sim,selected);
 this.policePanel(sim);
 for(let lane of sim.dangerLanes){let y=G.y+lane*G.row;c.save();c.strokeStyle='#b8543d';c.lineWidth=3;c.strokeRect(G.x+3,y+3,126,G.row-6);this.rect(G.x+5,y+5,110,23,'#a34d39',5);this.label('! '+L.danger,G.x+60,y+21,13,'#fff5d8');c.restore();}
 this.rect(1001,218,182,390,palette.rail,18);
 this.rect(1007,224,170,378,palette.entrance,13);
 this.rect(1031,191,126,30,palette.paper,12);
 this.label('손님 입구',1094,211,13,palette.ink);
 for(let lane=0;lane<5;lane++){
  const y=G.y+lane*G.row;
  if(lane){c.strokeStyle=palette.rail;c.lineWidth=2;c.beginPath();c.moveTo(1016,y);c.lineTo(1168,y);c.stroke();}
  c.strokeStyle=sim.stage.world===2?'#DBDBCF70':'#A9886966';c.lineWidth=3;c.lineCap='round';
  for(let i=0;i<2;i++){const x=1061+i*30;c.beginPath();c.moveTo(x+7,y+27);c.lineTo(x,y+34);c.lineTo(x+7,y+41);c.stroke();}
 }
 if(sim.waves.some(w=>w.at<=sim.time&&sim.time-w.at<1.8&&w.group>0)){c.save();c.globalAlpha=.12+.08*Math.sin(sim.time*10);this.rect(1035,250,150,355,'#f0a24c',12);c.restore();}
 const incoming=[...sim.waves.slice(sim.cursor),...sim.scheduled].filter(w=>w.at>sim.time&&w.at-sim.time<=4&&sim.activeLanes.includes(w.lane));for(let lane=0;lane<5;lane++){let next=incoming.filter(w=>w.lane===lane).sort((a,b)=>a.at-b.at)[0];if(!next)continue;let y=G.y+lane*G.row+34;this.rect(1020,y-19,145,38,'#FFF4D8',12);c.strokeStyle='#DFAC6A';c.lineWidth=2;c.stroke();this.label('◀ '+L.incoming+' '+Math.ceil(next.at-sim.time),1092,y+5,16,'#956239');}
 const actors=[...sim.units.map(u=>({...u,ally:true})),...sim.enemies,...sim.corpses.map(a=>({...a,corpse:true}))].sort((a,b)=>a.y-b.y||a.x-b.x);
 for(const actor of actors)this.actor(actor,sim.time,stamp);
 for(const shot of sim.shots)this.projectile(shot,sim.time);
 for(const effect of sim.effects)this.effect(effect);
 for(const coin of sim.coins)if(!coin.collected)this.coin(coin,sim.time);
 if(sim.arrest){if(sim.arrest.boss&&sim.boss)this.bubble('잠깐, 뒤로 물러나세요!',sim.boss.x,sim.boss.y-175);let p=Math.min(1,sim.arrest.elapsed/sim.arrest.duration);for(let z of sim.arrest.people){let h=z.type==='boss'?140:78,x=z.x+(1240-z.x)*p;this.sprite(z.type==='armored'?'armored-zombie-v31.png':'characters-v1.png',z.type==='armored'?0:z.type==='boss'?10:E[z.type].art,x,z.y,h,{age:sim.arrest.elapsed,state:'walk',flip:true});this.rect(x-17,z.y-h*.47,34,9,'#bec8ce',4);this.label('연행',x,z.y-h-6,12,'#ffe5ab');}for(let lane of sim.activeLanes){let y=G.y+lane*G.row+64;this.sprite('characters-v1.png',11,140+p*1060,y,84,{age:sim.arrest.elapsed,state:'walk'});}}
 if(sim.boss){this.rect(376,195,452,22,'#FFF8E9',10);this.rect(380,199,444,14,'#E1D7D0',7);this.rect(380,199,444*Math.max(0,sim.boss.hp/sim.boss.maxHp),14,'#E68F79',7);this.label('왕진상 좀비',365,211,13,palette.ink,'right');}
 if(banner&&banner.until>frameTime){let alpha=Math.min(1,(banner.until-frameTime)*2);c.globalAlpha=alpha;this.rect(24,630,680,35,'#FFF8E9',12);c.strokeStyle='#95BBA9';c.lineWidth=2;c.stroke();this.label(banner.text,364,653,13,'#35534F');c.globalAlpha=1;}
 if(['비','폭우'].includes(sim.stage.weather)){c.save();c.strokeStyle='#d7eff13f';c.lineWidth=1;for(let i=0;i<35;i++){let x=1005+(i*41)%180,y=(sim.time*150+i*37)%160;c.beginPath();c.moveTo(x,y);c.lineTo(x-6,y+17);c.stroke();}c.restore();}}
 actor(actor,time,stamp){
  const c=this.ctx,a=actor,ally=!!a.ally,boss=a.type==='boss';
  const index=ally?U[a.type].art:boss?10:a.type==='armored'?0:E[a.type].art;
  const file=ally?(U[a.type].artFile||'allies-v1.png'):a.type==='armored'?'armored-zombie-v31.png':'characters-v1.png';
  const h=boss?156:a.type==='bulky'?91:ally&&['roller','dispenser','counter'].includes(a.type)?70:78;
  const life=a.corpse?a.life/a.total:1;
  this.shadow(a.x,a.y,boss?110:46);
  if(!a.corpse&&a.state==='attack'&&a.stateT<.26){
   c.save();c.globalAlpha=(1-a.stateT/.26)*.6;c.strokeStyle=ally?'#78AD95':'#DF9C83';c.lineWidth=3;
   c.beginPath();c.ellipse(a.x,a.y,27+a.stateT*24,7,0,0,Math.PI*2);c.stroke();c.restore();
  }
  this.sprite(file,index,a.x,a.y,h,{
   age:a.age,state:a.corpse?'death':a.jam?'hurt':a.state,stateT:a.stateT,hurt:a.hurt,alpha:life,
   angle:a.corpse?(1-life)*(ally?-.9:1.25):0,
   stretch:a.type==='staff'&&a.state==='attack'?1+Math.sin(time*18)*.015:1
  });
  if(a.corpse)return;
  const barWidth=boss?112:46;
  if(a.hp<a.maxHp||ally){
   this.rect(a.x-barWidth/2-1,a.y+3,barWidth+2,7,'#FFF9EC',4);
   this.rect(a.x-barWidth/2,a.y+4,barWidth,5,'#CCD9CE',3);
   this.rect(a.x-barWidth/2,a.y+4,barWidth*Math.max(0,a.hp/a.maxHp),5,ally?'#79B297':'#DD917A',3);
  }
  if(a.shield){this.rect(a.x-23,a.y+11,46,4,'#E3EAF0',2);this.rect(a.x-23,a.y+11,46*(a.shield/(a.type==='armored'?60:150)),4,'#7BA5C0',2);}
  if(a.type==='armored'&&!a.shield)this.label('포장 풀림',a.x,a.y-h-4,10,'#467B65');
  if(a.jam){this.rect(a.x-16,a.y-h-24,32,23,'#FFF1CE',9);this.label('?!',a.x,a.y-h-6,15,'#AF7951');}
  if(a.cloud)this.fxCloud(a.x,a.y-35,30,.25);
  if(a.freeze>0){
   this.rect(a.x-28,a.y-h,56,h,'#B9E8F45C',12);c.strokeStyle='#8DBED3';c.lineWidth=2;c.stroke();
   this.label('❄',a.x,a.y-h-4,19,'#579ABA');
  }
  if(a.slow){c.strokeStyle='#76B4CD';c.lineWidth=3;c.beginPath();c.ellipse(a.x,a.y-2,27,6,0,0,Math.PI*2);c.stroke();}
  if(a.type==='temp')this.label(a.ready?'준비 완료':`${Math.max(0,a.timer).toFixed(1)}`,a.x,a.y-h-3,11,a.ready?'#467D64':'#A97846');
  if(a.speech>0)this.bubble(a.quote,a.x,a.y-h-13);
  if(stamp&&ally){this.rect(a.x-23,a.y-h-25,46,23,'#FFF2DF',9);this.label('퇴근',a.x,a.y-h-9,12,'#B66E5D');}
 }
 // All combat feedback stays in board coordinates and follows simulation time.
 projectile(shot,time){
  const c=this.ctx,x=shot.x,y=shot.y;
  c.save();c.strokeStyle='#FFFCF1';c.lineWidth=5;c.lineCap='round';
  c.beginPath();c.moveTo(x-27,y);c.lineTo(x-12,y);c.stroke();
  c.translate(x,y);c.rotate(shot.type==='roller'?0:time*4);
  if(shot.type==='roller'){
   this.rect(-34,-9,66,18,'#FFF9E9',5);c.strokeStyle='#788E88';c.lineWidth=2;c.stroke();
   for(let i=0;i<3;i++){this.rect(-27+i*21,-4,12,8,'#EC947E',4);if(i<2){c.strokeStyle='#B6C4BA';c.beginPath();c.moveTo(-15+i*21,-8);c.lineTo(-15+i*21,8);c.stroke();}}
  }else if(shot.type==='bag'){
   this.rect(-14,-13,28,27,'#FFF3D4',5);c.strokeStyle='#A98960';c.lineWidth=2;c.stroke();
   this.rect(-3,-7,6,15,'#80B69B',2);this.rect(-7,-3,14,6,'#80B69B',2);
  }else if(shot.type==='mortar'){
   this.rect(-10,-10,20,20,'#ECB879',10);c.strokeStyle='#9B704A';c.lineWidth=2;c.stroke();this.rect(-5,-6,5,4,'#FFE4B8',2);
  }else{
   const color=shot.type==='syrup'?'#88BDCB':shot.type==='dispenser'?'#9EC6A4':'#ED947F';
   this.rect(-13,-7,26,14,'#FFF9E9',7);c.strokeStyle='#718D87';c.lineWidth=2;c.stroke();
   c.save();c.beginPath();c.rect(0,-8,15,16);c.clip();this.rect(-13,-7,26,14,color,7);c.restore();
   this.rect(-7,-4,7,2,'#FFFFFF',1);
  }
  c.restore();
 }
 coin(coin,time){
  const c=this.ctx,y=coin.y+Math.sin(time*3+coin.id)*3;
  c.save();c.globalAlpha=coin.life<3?.55+.45*Math.abs(Math.sin(time*6)):1;
  this.shadow(coin.x,y+22,40);
  c.fillStyle='#FFF2B15C';c.beginPath();c.arc(coin.x,y,28+Math.sin(time*4+coin.id)*2,0,Math.PI*2);c.fill();
  c.fillStyle='#F4BD4B';c.strokeStyle='#B77B32';c.lineWidth=2.5;c.beginPath();c.arc(coin.x,y,21,0,Math.PI*2);c.fill();c.stroke();
  c.strokeStyle='#FFE6A0';c.lineWidth=2;c.beginPath();c.arc(coin.x,y,16,0,Math.PI*2);c.stroke();
  this.label('₩',coin.x,y+7,23,'#8B592C');
  c.strokeStyle='#FFFAE1';c.lineWidth=2.5;c.lineCap='round';c.beginPath();c.arc(coin.x,y,18,3.7,4.5);c.stroke();
  c.restore();
 }
 burst(x,y,size,color){
  const c=this.ctx;c.fillStyle=color;c.beginPath();
  for(let i=0;i<16;i++){const angle=i*Math.PI/8,r=i%2?size*.48:size;const px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r;if(i)c.lineTo(px,py);else c.moveTo(px,py);}
  c.closePath();c.fill();c.strokeStyle='#FFF8E9';c.lineWidth=2;c.stroke();
 }
 effect(f){
  const c=this.ctx,a=Math.max(0,f.life/f.max),p=1-a;
  c.save();c.globalAlpha=a;
  if(f.kind==='impact'||f.kind==='defeat'){
   const colors={syrup:'#71B2CA',roller:'#E7B04F',mortar:'#E89859',spray:'#72B898',icepack:'#78C4DF',capsule:'#EB947D',bag:'#D9B46E',spatula:'#9ABDAC'};
   const color=colors[f.source]||'#EDB34E',size=f.kind==='defeat'?30:15+(f.power||0)*5;
   if(p<.5)this.burst(f.x,f.y,size*(.7+p),color);
   c.strokeStyle=color;c.lineWidth=3*a;c.beginPath();c.arc(f.x,f.y,7+p*size,0,Math.PI*2);c.stroke();
   for(let i=0;i<6;i++){const angle=i*Math.PI/3,distance=8+p*(size+10);this.rect(f.x+Math.cos(angle)*distance-3,f.y+Math.sin(angle)*distance+p*p*9-3,6*a+1,6*a+1,color,3);}
  }else if(f.kind==='spray'){
   this.fxCloud(f.x+85,f.y,85,.35*a);c.strokeStyle='#83BDA8';c.lineWidth=2;c.setLineDash([5,8]);c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x+190,f.y-65);c.moveTo(f.x,f.y);c.lineTo(f.x+190,f.y+65);c.stroke();
  }else if(f.kind==='freeze'){
   c.strokeStyle='#78BFD9';c.lineWidth=6;c.beginPath();c.ellipse(f.x,f.y,145*p+15,80*p+10,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<6;i++){const angle=i*Math.PI/3;this.label('✦',f.x+Math.cos(angle)*100*p,f.y+Math.sin(angle)*65*p,20,'#DDF9FF');}
  }else if(f.kind==='invalid'){
   c.strokeStyle='#DC8977';c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,27+p*8,0,Math.PI*2);c.stroke();this.label('×',f.x,f.y+8,29,'#BF695A');
  }else if(f.kind==='muzzle'){
   this.burst(f.x,f.y,8+p*10,'#F2C15F');
  }else if(f.kind==='cloud'){
   this.fxCloud(f.x,f.y,70,.38*a);
  }else if(f.kind==='blast'){
   if(p<.3)this.burst(f.x,f.y-15,55+p*80,'#F2B46C');
   c.strokeStyle='#E9A15E';c.lineWidth=7;c.beginPath();c.ellipse(f.x,f.y-20,160*p+15,90*p+10,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<10;i++){const angle=i*Math.PI/5;this.rect(f.x+Math.cos(angle)*p*155,f.y-30+Math.sin(angle)*p*80,10,7,'#FFF0C5',3);}
  }else if(f.kind==='money'){
   const y=f.y-p*40;this.rect(f.x-25,y-19,50,26,'#FFF5D4',11);this.label(f.text,f.x,y,18,'#A67028');
  }else if(f.kind==='slash'){
   c.strokeStyle='#86AF9A';c.lineWidth=9;c.beginPath();c.arc(f.x,f.y,33,Math.PI*.65,Math.PI*1.6);c.stroke();c.strokeStyle='#FFF9DC';c.lineWidth=5;c.stroke();
  }else{
   for(let i=0;i<5;i++){const angle=i*1.25;this.rect(f.x+Math.cos(angle)*p*30,f.y-25+Math.sin(angle)*p*25,6,6,f.kind==='hit'?'#E8A967':'#FFF4D7',3);}
  }
  c.restore();
 }
 fxCloud(x,y,size,alpha){let c=this.ctx;c.save();c.globalAlpha=alpha;c.fillStyle='#A5CBB4';for(let i=0;i<5;i++){c.beginPath();c.ellipse(x+(i-2)*size*.3,y+Math.sin(i*3)*8,size*.4,size*.3,0,0,Math.PI*2);c.fill();}c.restore();}
 ending(t,ko=false){this.background(2);let c=this.ctx;if(ko){this.rect(0,0,1200,675,'#153b3350');let angle=t<2?0:Math.min(1,(t-2)/2)*1.1;this.sprite('characters-v1.png',10,600+(t<2?-t*10:0),550,290,{angle});if(t<3){c.save();c.translate(581,552);c.rotate(.15);this.rect(-25,-9,50,25,'#f9e8c5',4);c.restore();}if(t>3){c.save();c.translate(600-65*Math.cos(angle)+190*Math.sin(angle),550-65*Math.sin(angle)-190*Math.cos(angle));c.rotate(angle+.15);this.rect(-70,-65,140,150,'#f9e8c5',5);this.rect(-19,-11,38,30,'#609583',3);c.restore();}return;}
 let dawn=Math.min(.4,t/30);this.rect(0,0,1200,675,`rgba(255,218,148,${dawn})`);for(let i=0;i<18;i++){c.save();c.translate(170+i*43,565+Math.sin(i*5)*50);c.rotate(i);this.rect(-12,-7,25,18,'#e8e1cb',2);c.restore();}for(let i=0;i<3;i++)this.sprite('ending-v1.png',i+(t>=17?3:0),280+i*210,595,i===1?145:170,{age:t});this.sprite('allies-v1.png',7,865,565,124,{age:t,state:'attack',stateT:t%1});if(t>12){this.sprite('characters-v1.png',15,1140-Math.min(150,(t-12)*30),588,155,{age:t,state:t<17?'walk':'idle'});}if(t>22)this.rect(0,0,1200,675,`rgba(11,30,29,${Math.min(1,(t-22)/2)})`);}
 draw(app){let c=this.ctx;c.clearRect(0,0,1200,675);if(!this.images['allies-v1.png'])return;if(['battle','defeat','aftermath'].includes(app.scene)){if(app.scene==='aftermath'){c.save();c.translate(Math.sin(app.cineTime*45)*2,0);}this.battle(app.sim,app.selected,app.stamp,app.banner,app.uiTime);if(app.scene==='aftermath'){c.restore();this.label('쿵.     쿵.     쿵.',600,190,24,'#ffe3b1');}if(app.scene==='defeat'){for(let i=0;i<5;i++)this.sprite('characters-v1.png',i,120+Math.sin(i)*50+Math.min(80,app.cineTime*30),300+i*58,88,{age:app.cineTime+i,state:'walk'});for(let i=0;i<12;i++){c.save();c.translate(100+(i*57+app.cineTime*110)%600,250+(i*43+app.cineTime*70)%350);c.rotate(app.cineTime*3+i);this.rect(-12,-9,24,18,'#fff1ca',2);c.restore();}this.rect(0,0,1200,675,'#20363035');this.label('영업 종료',600,198,26,'#ffedc4');}}else if(app.scene==='ending'||app.scene==='ko')this.ending(app.cineTime,app.scene==='ko');else this.hub(app.uiTime,app.save.data);}
}

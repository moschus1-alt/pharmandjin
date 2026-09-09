// 16-bar original chamber-cartoon arrangements, 128 eighth-note steps.
export const THEMES={
 hub:{bpm:94,root:60,minor:false,lead:'celesta',air:.3,form:[0,3,1,2],motif:[0,null,1,2,3,null,2,1,0,null,2,3,4,2,1,null]},
 world0:{bpm:112,root:60,minor:true,lead:'marimba',air:.65,form:[0,1,2,3],motif:[0,2,1,null,3,2,1,null,0,null,1,2,4,3,2,null]},
 world1:{bpm:124,root:62,minor:true,lead:'pizz',air:.85,form:[0,2,1,3],motif:[0,1,2,3,null,2,1,2,0,2,3,null,4,3,1,null]},
 world2:{bpm:96,root:57,minor:true,lead:'celesta',air:.3,form:[0,2,1,3],motif:[0,null,2,null,1,null,3,2,null,1,null,0,2,null,1,null]},
 boss:{bpm:132,root:50,minor:true,lead:'reed',air:1,form:[0,1,2,3],motif:[0,0,2,null,1,0,3,2,0,1,2,3,4,3,2,null]},
 ending:{bpm:90,root:60,minor:false,lead:'celesta',air:.2,form:[0,2,1,3],motif:[2,null,1,null,0,1,null,null,1,null,2,3,2,null,0,null]}
};
export const midi=n=>440*2**((n-69)/12);
export function score(mode,index,intensity=0){let q=THEMES[mode]||THEMES.hub,i=index%128,beat=30/q.bpm,bar=Math.floor(i/8),section=Math.floor(bar/4),harmony=q.minor?[[0,3,7],[5,8,12],[8,12,15],[7,11,14]]:[[0,4,7],[5,9,12],[9,12,16],[7,11,14]],ch=harmony[q.form[Math.floor(bar/2)%4]],scale=[ch[0],ch[1],ch[2],ch[0]+12,ch[2]+12],notes=[];let n=q.motif[i%16];const add=(instrument,pitch,duration,volume,pan,delay=0)=>notes.push({instrument,frequency:midi(pitch),duration:duration*beat,volume,pan,delay});let variation=section===2,mutedIntro=section===0&&bar<2;
 if(n!==null&&!(i>=124&&i%2)){let note=scale[variation?Math.max(0,4-n):n];add(q.lead,q.root+note,mode==='world2'||mode==='ending'?1.35:.66,.18+(i%4===0?.025:0),.12,i%2?beat*.035:0);}
 if(i%2===0){let bass=ch[i%8===4?2:0];add('bass',q.root-24+bass,1.35,.25,0);}
 if(i%4===2&&!mutedIntro){add('pizz',q.root-12+ch[1],.5,.09,-.45);add('pizz',q.root-12+ch[2],.5,.065,.45,beat*.025);}
 if(i%16===0)for(let k=0;k<3;k++)add('pad',q.root-12+ch[k],6,.028,[-.45,0,.45][k]);
 if(section===2&&i%8===6)add('celesta',q.root+12+ch[2],1.6,.065,.5);
 let energy=q.air*(mutedIntro?.5:1);if(i%4===0)add('kick',36,.2,.16*energy,0);if(i%8===4)add('brush',48,.18,.055*energy,.25);if(i%2===1&&!mutedIntro)add('hat',72,.07,.025*energy,-.28);
 if(intensity>.02){if(i%4===2)add('kick',36,.15,.12*intensity,0);if(i%2===0)add('hat',72,.09,.065*intensity,.3);if(i>=120&&i%2)add('brush',48,.12,.06*intensity,.1);}
 return{beat,notes};}

// Original instrumental themes. Notes are semitone offsets, null is a rest.
export const THEMES={
 hub:{bpm:88,root:60,wave:'sine',chords:[0,5,9,7],minor:false,motif:[0,null,4,7,9,null,7,4,2,null,5,9,7,null,4,2],bass:[0,null,7,null],length:.65},
 world0:{bpm:112,root:60,wave:'triangle',chords:[0,5,0,7],minor:true,motif:[0,7,3,null,5,3,2,null,0,12,10,7,5,null,2,null],bass:[0,null,7,12],length:.48},
 world1:{bpm:124,root:62,wave:'triangle',chords:[0,3,5,7],minor:true,motif:[0,3,7,10,null,7,5,3,2,5,9,null,7,5,3,null],bass:[0,7,12,7],length:.42},
 world2:{bpm:96,root:57,wave:'sine',chords:[0,8,5,7],minor:true,motif:[0,null,7,null,3,null,2,0,null,10,null,7,5,null,3,null],bass:[0,null,null,7],length:1.15},
 boss:{bpm:136,root:50,wave:'triangle',chords:[0,1,5,7],minor:true,motif:[0,0,7,null,1,0,10,7,0,3,5,7,10,7,3,null],bass:[0,0,7,0],length:.6},
 ending:{bpm:88,root:60,wave:'sine',chords:[0,9,5,7],minor:false,motif:[7,null,4,null,2,0,null,null,4,null,7,9,7,null,0,null],bass:[0,null,7,null],length:1.3}
};
export const midi=n=>440*2**((n-69)/12);
export function score(mode,i,intensity=0){const q=THEMES[mode]||THEMES.hub,beat=30/q.bpm,chord=q.chords[Math.floor(i/32)%4],notes=[],n=q.motif[i%16];if(n!==null)notes.push({frequency:midi(q.root+n+(Math.floor(i/16)%2?0:12)),duration:beat*q.length,volume:.23,wave:q.wave});if(i%2===0){const b=q.bass[Math.floor(i/2)%4];if(b!==null)notes.push({frequency:midi(q.root-24+chord+b),duration:beat*1.3,volume:.38,wave:'triangle'});}if(i%8===0)for(const offset of [0,q.minor?3:4,7])notes.push({frequency:midi(q.root-12+chord+offset),duration:beat*6,volume:.045,wave:'sine'});if(intensity>.02&&i%2===0)notes.push({frequency:i%4===0?105:260,to:45,duration:.065,volume:.24*intensity,wave:'triangle'});return {beat,notes};}

export const MAX_DECK=9;
export const UNITS=[
 {id:'counter',name:'일반약 판매대',short:'판매대',role:'경제',desc:'12초마다 돈 25 · 직접 수집',cost:50,hp:300,cd:7.5,period:12,damage:0,unlock:1,art:0},
 {id:'rookie',name:'초보약사',short:'초보약사',role:'기본 공격',desc:'같은 레인 20 · 1.4초마다',cost:100,hp:300,cd:7.5,period:1.4,damage:20,unlock:1,art:1},
 {id:'staff',name:'직원',short:'직원',role:'방어',desc:'HP 1200 · 붙잡고 실랑이',cost:75,hp:1200,cd:15,period:1,damage:0,unlock:2,art:2},
 {id:'temp',name:'알바약사',short:'알바약사',role:'1회용 범위',desc:'2.5초 준비 · 범위 피해 450',cost:100,hp:300,cd:35,period:2.5,damage:450,unlock:3,art:3},
 {id:'syrup',name:'시럽병',short:'시럽병',role:'감속',desc:'10 피해 · 3초간 40% 감속',cost:100,hp:300,cd:10,period:1.8,damage:10,unlock:4,art:4},
 {id:'veteran',name:'베테랑약사',short:'베테랑',role:'2연사',desc:'20 × 2연사 · 단일 레인 화력',cost:175,hp:300,cd:10,period:1.4,damage:20,unlock:7,art:5},
 {id:'roller',name:'돌돌이포장기',short:'돌돌이',role:'관통',desc:'같은 레인 여러 적에게 30',cost:150,hp:400,cd:12,period:2,damage:30,unlock:9,art:6},
 {id:'dispenser',name:'자동조제기',short:'자동조제',role:'3레인',desc:'위·현재·아래 각각 12',cost:200,hp:500,cd:15,period:1.8,damage:12,unlock:13,art:7},
 {id:'spatula',name:'연고칼',short:'연고칼',role:'근접 화력',desc:'전방 1칸 · 0.8초마다 45',cost:125,hp:500,cd:10,period:.8,damage:45,unlock:17,art:8},
 {id:'mortar',name:'절구',short:'절구',role:'곡사 고화력',desc:'고HP 적 우선 · 곡사 90 / 3.2초',cost:175,hp:400,cd:12,period:3.2,damage:90,unlock:3,art:0,artFile:'extra-units-v1.png'},
 {id:'spray',name:'분무기',short:'분무기',role:'근거리 부채꼴',desc:'앞쪽 2칸 · 이웃 레인까지 18',cost:125,hp:450,cd:12,period:1.2,damage:18,unlock:5,art:1,artFile:'extra-units-v1.png'},
 {id:'icepack',name:'냉찜질팩',short:'냉찜질팩',role:'1회용 빙결',desc:'2초 준비 · 주변 60 피해 + 2.5초 정지',cost:100,hp:300,cd:25,period:2,damage:60,unlock:8,art:2,artFile:'extra-units-v1.png'},
 {id:'capsule',name:'캡슐연사기',short:'캡슐연사',role:'고속 연사',desc:'한 레인 7 피해 · 0.25초 주기',cost:175,hp:350,cd:15,period:.25,damage:7,unlock:11,art:3,artFile:'extra-units-v1.png'},
 {id:'bag',name:'약봉투발사기',short:'약봉투발사',role:'착탄 범위',desc:'착탄 지점 주변 60 · 3초 주기',cost:225,hp:400,cd:15,period:3,damage:60,unlock:14,art:4,artFile:'extra-units-v1.png'}
];
export const ENEMIES=[
 {id:'normal',name:'일반 좀비',hp:200,speed:1,art:0,first:1,desc:'기본 전진형'},
 {id:'cold',name:'감기 좀비',hp:220,speed:1,art:1,first:4,desc:'감기구름 · 공격속도 방해'},
 {id:'office',name:'직장인 좀비',hp:170,speed:1.25,art:2,first:5,desc:'점심시간 집단 러시'},
 {id:'bandage',name:'붕대 좀비',hp:450,speed:.75,art:3,first:6,desc:'두꺼운 붕대 · 고내구'},
 {id:'delivery',name:'배달기사 좀비',hp:150,speed:2.2,art:4,first:8,desc:'매우 빠른 돌파'},
 {id:'basket',name:'할머니 좀비',hp:200,shield:150,speed:.9,art:5,first:11,desc:'무거운 장바구니 보호막 150'},
 {id:'drunk',name:'취객 좀비',hp:250,speed:1,art:6,first:14,desc:'불규칙한 보행 속도'},
 {id:'complaint',name:'진상 좀비',hp:400,speed:1,art:7,first:15,desc:'말풍선 · 주변 유닛 잠깐 방해'},
 {id:'phone',name:'스마트폰 좀비',hp:190,speed:.9,art:8,first:16,desc:'고개를 든 뒤 가속'},
 {id:'bulky',name:'덩치 좀비',hp:800,speed:.55,art:9,first:18,desc:'높은 HP · 강한 근접 공격'}
];
export const U=Object.fromEntries(UNITS.map(x=>[x.id,x]));export const E=Object.fromEntries(ENEMIES.map(x=>[x.id,x]));
export const WORLDS=[{name:'동네약국',sub:'01—07 · 익숙한 골목, 낯선 손님',color:'#e9ddbd'},{name:'병원 앞 약국',sub:'08—15 · 숨 돌릴 틈 없는 오후',color:'#dbe6d8'},{name:'심야약국',sub:'16—20 · 마지막 불이 켜진 곳',color:'#c9d7da'}];
const recipes=[
 ['첫 근무','낮',['normal'],'돈을 모으고 약사를 배치해요.'],
 ['직원이 필요해','낮',['normal'],'직원은 앞에, 약사는 뒤에.'],
 ['짧고 굵게','오후',['normal'],'알바약사는 미리 준비해야 해요.'],
 ['콜록콜록','오후',['normal','cold'],'감기구름과 시럽의 차이를 알아봐요.'],
 ['점심시간','점심',['office','normal','cold'],'여러 레인의 직장인 러시!'],
 ['비 오는 근무','비',['bandage','normal','office'],'튼튼한 적에게 집중 사격.'],
 ['동네의 마지막 손님','저녁',['bandage','office','cold','normal'],'2연사와 다섯 레인의 종합전.'],
 ['빠른 배송','낮',['delivery','normal','bandage'],'빠른 적은 직원과 시럽으로.'],
 ['돌돌 말아드립니다','낮',['office','normal','delivery','bandage'],'한 줄로 오는 적을 관통해요.'],
 ['뜻밖의 연락','점심',['bandage','office','cold','delivery'],'바쁜 와중, 영업사원이 찾아옵니다.'],
 ['장바구니는 단단해','오후',['basket','normal','delivery','bandage'],'장바구니부터 무너뜨리세요.'],
 ['하원시간','하원',['office','cold','delivery','basket','normal'],'여러 종류가 짧은 시간 몰려와요.'],
 ['세 줄로 조제합니다','비',['normal','office','basket','bandage'],'자동조제기로 이웃 레인까지.'],
 ['비틀비틀','저녁',['drunk','office','delivery','cold'],'발걸음의 박자가 달라요.'],
 ['마감은 아직','마감 전',['complaint','bandage','delivery','basket'],'소란을 피우는 적을 주시하세요.'],
 ['휴대폰을 내려놓으면','밤',['phone','normal','cold','delivery'],'고개를 들면 빨라집니다.'],
 ['가까이 오세요','밤',['phone','basket','bandage','drunk'],'연고칼은 가까이서 강해요.'],
 ['폭우 속의 발소리','폭우',['bulky','delivery','cold','bandage'],'튼튼함과 속도가 함께 옵니다.'],
 ['잠깐 이야기 좀','마감 직전',['complaint','bulky','delivery','cold','office'],'평범하지 않은 방문, 마지막 전조.'],
 ['FINAL NIGHT','새벽',['normal','office','cold','bandage','delivery'],'왕진상 좀비 · 최종 근무']
];
export const EARLY_PACING={1:{duration:85,first:8,count:9},2:{duration:90,first:5,count:12},3:{duration:105,first:6,count:14},4:{duration:125,first:7,count:17},5:{duration:165,first:8,count:26},6:{duration:235,first:16,count:30},7:{duration:250,first:16,count:32}};
export const TUTORIAL_PACING={sideFirst:6,sideSecond:13,openFive:19,finalDelay:4,finalCount:5,finalGap:5};
export const STAGES=recipes.map((r,i)=>({id:i+1,title:r[0],weather:r[1],types:r[2],hint:r[3],world:i<7?0:i<15?1:2,duration:EARLY_PACING[i+1]?.duration??(i<9?300:i<15?370:480),initialMoney:0,event:i===9?'sales':i===18?'landlord':null,unlock:UNITS.filter(u=>u.unlock===i+2).map(u=>u.id)}));
export const SKY_MONEY={first:1,openingGap:2,openingUntil:2,minGap:10,maxGap:14,value:25,fallSpeed:38};
export const BALANCE={move:12.5,enemyDamage:25,enemyAttack:1,bulkyDamage:70,bulkyAttack:1.5,projectileSpeed:410,slowDuration:3,slowFactor:.6,bossHP:5000,bossDamage:60,bossAttack:1.8,bossPoliceDamage:.2,coinLife:15};
export const BOARD={x:176,y:225,col:100,row:76,cols:8,lanes:5,end:137,spawn:1130};
export const TEXT={pause:'일시정지',win:'영업 방어 성공!',lose:'오늘 영업은 여기까지…',lunch:'점심시간입니다! 직장인들이 몰려옵니다!',children:'어린이집 하원시간입니다!',sales:'원장님이 혈압약 바꾸신대요!',landlord:'우리 약대생 아들이 이번에 졸업을 하니 약국 빼주세요.',rush:'정신없는 사이 좀비들이 몰려옵니다!',boss2:'여기 책임자 누구예요?',boss3:'인터넷에는 그렇게 안 나오던데요?',ko:'…그럼 다른 약국 갈게요.',customer:'저기요, 약 좀 물어보려고 하는데요.',end:'…오늘도 영업합니다.',police:'112 출동! 전원 함께 가시죠!',complaints:['저번에는 해줬는데요?','약이 왜 이렇게 비싸요?','인터넷에서는 그렇게 안 나오던데요?'],tutorial:['하늘에서 내려오는 돈을 눌러 50을 모은 뒤 판매대를 놓으세요.','판매대에서 나온 돈을 직접 터치해요!','돈을 100까지 모아 초보약사를 같은 줄에 배치해요.','잘했어요! 돈을 모으며 가운데 세 줄을 지켜요.','이제 다섯 줄! 각 레인에 약사를 준비하세요.']};
export function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function makeWaves(stage,seed){const rand=rng(seed),list=[];if(stage.id===1)return list;const groups=stage.id<5?3:stage.id<10?4:stage.id<16?5:6;const count=EARLY_PACING[stage.id]?.count??(stage.id<10?22+stage.id*2:30+stage.id*2);const first=EARLY_PACING[stage.id]?.first??30;
 for(let n=0;n<count;n++){let p=n/(count-1),g=Math.floor(p*(groups-.01)),at=first+p*(stage.duration-25-first),lane=Math.floor(rand()*5),type=stage.types[n===0?0:Math.floor(rand()*stage.types.length)];if(stage.id===2&&n<2)lane=2;if(stage.id===9&&n%4<3)lane=2;if(stage.id===5&&p>.65)type='office';if(stage.id===13&&n<12){type=n%2?'office':'normal';lane=1+n%3;}if(n===0&&['bandage','delivery','basket','drunk','complaint','phone','bulky'].includes(stage.types[0]))type=stage.types[0];list.push({at,type,lane,group:g});}
 if(stage.id===3)for(let i=list.length-6;i<list.length;i++){list[i].at=stage.duration-55+(i-list.length+6)*2.2;list[i].lane=2;}
 if(stage.id===5)for(let i=list.length-12;i<list.length;i++){list[i].at=stage.duration-44+(i-list.length+12)*1.3;list[i].type='office';list[i].lane=i%5;}
 if(stage.id===12)for(let i=list.length-20;i<list.length;i++){list[i].at=stage.duration-48+(i-list.length+20)*1.1;list[i].type=stage.types[i%stage.types.length];list[i].lane=i%5;}
 if([7,12,18,19].includes(stage.id))for(let l=0;l<5;l++)list.push({at:stage.duration-28+l*.2,type:stage.types[l%stage.types.length],lane:l,group:groups});
 return list.sort((a,b)=>a.at-b.at);
}

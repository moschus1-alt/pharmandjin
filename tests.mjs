import {runRules,runCampaign} from './src/qa.js';
const rules=runRules(),campaign=runCampaign();console.table(rules);console.table(campaign.map(s=>({stage:s.stage,result:s.result,time:Math.round(s.time),police:s.police})));if(rules.some(r=>r.status!=='pass')||campaign.some(r=>r.result!=='win'))process.exitCode=1;

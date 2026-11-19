const {chromium}=require('playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+path.resolve('capville-proposal.html'));
await p.pdf({path:'Capville-Schools-ExamBox-Proposal.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});
await b.close();
})();

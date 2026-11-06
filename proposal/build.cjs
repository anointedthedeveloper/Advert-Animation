const {chromium}=require('playwright');
const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+path.resolve('goshen-proposal.html'));
await p.pdf({path:'Goshen-High-School-ExamBox-Proposal.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});
await b.close();
})();

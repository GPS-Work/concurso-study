export function nextReview(current,correct,questionId){
 const now=new Date(); let streak=current?.streak||0, ease=current?.ease||2.3, interval=current?.intervalDays||0;
 if(correct){streak++;ease=Math.min(3,ease+.08);interval=streak===1?1:streak===2?3:Math.max(4,Math.round(Math.max(1,interval)*ease));}
 else{streak=0;ease=Math.max(1.4,ease-.2);interval=1;}
 const due=new Date(now);due.setDate(due.getDate()+interval);
 return {questionId,dueAt:due.toISOString(),intervalDays:interval,ease,streak,lastResult:correct?'correct':'wrong'};
}
export function buildSession(questions,reviews,region='Madeira',limit=12,lawFilter=null){
 const m=new Map(reviews.map(r=>[r.questionId,r])); const now=new Date();
 let pool=questions.filter(q=>q.region==='Nacional'||q.region===region);
 if(lawFilter?.length) pool=pool.filter(q=>lawFilter.includes(q.law));
 const due=pool.filter(q=>m.has(q.id)&&new Date(m.get(q.id).dueAt)<=now).sort((a,b)=>new Date(m.get(a.id).dueAt)-new Date(m.get(b.id).dueAt));
 const unseen=pool.filter(q=>!m.has(q.id)); return [...due,...unseen].slice(0,limit);
}
export function daysUntil(date){return Math.max(0,Math.ceil((new Date(date)-new Date())/86400000));}

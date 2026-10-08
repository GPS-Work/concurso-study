export function localDay(now=new Date()){
 const pad=n=>String(n).padStart(2,'0');
 return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
}
export function chooseEssayQuestion(session,day=localDay()){
 if(!session.length)return null;
 const scenarios=session.filter(q=>q.questionType==='caso-pratico-ap'||q.questionType==='caso-aplicacao'||q.type==='caso');
 const pool=scenarios.length?scenarios:session;
 const ordered=[...pool].sort((a,b)=>b.difficulty-a.difficulty||a.id.localeCompare(b.id));
 const seed=Number(day.replaceAll('-',''));
 return ordered[seed%Math.min(ordered.length,4)];
}

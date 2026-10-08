import {metrics} from './analytics.js';
import {currentLawIds} from './data/programmes.js';
export function nextReview(current,correct,questionId,now=Date.now()){let streak=correct?(current?.streak||0)+1:0;const ease=Math.max(1.4,Math.min(3,(current?.ease||2.3)+(correct?.08:-.2)));const intervalDays=correct?(streak===1?1:streak===2?3:Math.max(4,Math.round((current?.intervalDays||1)*ease))):.25;return {questionId,streak,ease,intervalDays,lastAnsweredAt:new Date(now).toISOString(),lastResult:correct?'correct':'wrong',dueAt:new Date(now+intervalDays*86400000).toISOString()}}
export function administrationScope(profile){return profile.administrationScope||(profile.region==='Madeira'?'regional-ram':'central')}
const legalCalendar=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'});
export function questionCurrent(q,now=Date.now()){
 if(q.suspended)return false;
 if(!q.legalValidFrom&&!q.legalValidUntil)return true;
 const date=legalCalendar.format(new Date(now)),bounds=[q.legalValidFrom,q.legalValidUntil].filter(Boolean);
 if(bounds.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d))return false;
 return (!q.legalValidFrom||date>=q.legalValidFrom)&&(!q.legalValidUntil||date<=q.legalValidUntil);
}
export function eligible(questions,region,lawFilter,area,scope=null,programme=null,now=Date.now()){const current=currentLawIds(lawFilter);return questions.filter(q=>questionCurrent(q,now)&&(q.region==='Nacional'||q.region===region)&&(!current?.length||current.includes(q.law))&&(!area||q.professionalArea==='Geral'||q.professionalArea===area)&&(!scope||!q.administrationScopes||q.administrationScopes.includes(scope))&&(!q.programmeOnly||q.programmeOnly.includes(programme)))}
export function examEligible(questions,region,lawFilter,area,scope=null,programme=null,now=Date.now()){return eligible(questions,region,lawFilter,area,scope,programme,now).filter(q=>q.questionType!=='norma-lacuna'&&!String(q.prompt||'').includes('[ … ]'))}
export function topicStages(pool,answers){
 const groups=new Map(),latest=new Map();for(const a of answers)if(typeof a.correct==='boolean'&&a.assisted!==true)latest.set(a.questionId,a);
 for(const q of pool){const key=q.law+'|'+q.topic;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(q)}
 const result=new Map();for(const [key,items] of groups){const levels=[...new Set(items.map(q=>q.difficulty))].sort((a,b)=>a-b);let stage=levels[0];for(const level of levels.slice(0,-1)){
  const atLevel=items.filter(q=>q.difficulty===level),answered=atLevel.map(q=>latest.get(q.id)).filter(Boolean),correct=answered.filter(a=>a.correct).length,required=Math.min(3,atLevel.length);
  if(correct>=required&&answered.length&&correct/answered.length>=.8)stage=levels[levels.indexOf(level)+1];else break;
 }result.set(key,{law:items[0].law,topic:items[0].topic,stage,max:levels.at(-1),total:items.length})}
 return result;
}
export function buildSession(questions,reviews,region='Madeira',limit=12,lawFilter=null,answers=[],weights={},area=null,now=Date.now(),scope=null,programme=null){
 weights=Object.fromEntries(Object.entries(weights).map(([id,value])=>[currentLawIds([id])[0],value]));
 const examPool=examEligible(questions,region,lawFilter,area,scope,programme,now),stages=topicStages(examPool,answers),pool=examPool.filter(q=>q.difficulty<=stages.get(q.law+'|'+q.topic).stage),r=new Map(reviews.map(x=>[x.questionId,x])),last=new Map();for(const a of answers)last.set(a.questionId,Math.max(last.get(a.questionId)||0,new Date(a.answeredAt).getTime()||0));for(const x of reviews)if(x.lastAnsweredAt)last.set(x.questionId,Math.max(last.get(x.questionId)||0,new Date(x.lastAnsweredAt).getTime()||0));
 const family=q=>q.familyId||q.id,lastFamily=new Map();for(const q of examPool)lastFamily.set(family(q),Math.max(lastFamily.get(family(q))||0,last.get(q.id)||0));
 const available=pool.filter(q=>now-(lastFamily.get(family(q))||0)>=6*3600000);const topic=new Map(metrics(pool,answers,'topic',now).map(g=>[g.key,g.mastery??50]));const priority=q=>(100-(topic.get(q.topic)??50))*(Number(weights[q.law])||1);
 const due=available.filter(q=>r.has(q.id)&&new Date(r.get(q.id).dueAt).getTime()<=now).sort((a,b)=>new Date(r.get(a.id).dueAt)-new Date(r.get(b.id).dueAt)||priority(b)-priority(a));
 const weak=available.filter(q=>last.has(q.id)||r.has(q.id)).sort((a,b)=>priority(b)-priority(a)||(last.get(a.id)||0)-(last.get(b.id)||0));
 const day=Math.floor(now/86400000),hash=id=>{let h=day;for(const c of id)h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h};
 const fresh=available.filter(q=>!last.has(q.id)&&!r.has(q.id)).sort((a,b)=>(Number(weights[b.law])||1)-(Number(weights[a.law])||1)||hash(a.id)-hash(b.id));
 // Spread new exam-style questions across eligible laws.
 const queues=new Map();for(const q of fresh){if(!queues.has(q.law))queues.set(q.law,[]);queues.get(q.law).push(q)}
 const balanced=[],served=new Map();while(balanced.length<fresh.length){const choices=[...queues.entries()].filter(([,items])=>items.length);choices.sort(([a],[b])=>(Number(weights[b])||1)-(Number(weights[a])||1)||(served.get(a)||0)-(served.get(b)||0)||hash(a)-hash(b));const [law,items]=choices[0];balanced.push(items.shift());served.set(law,(served.get(law)||0)+1)}
 const chosen=[],ids=new Set(),families=new Set(),dueFamilies=new Set(due.map(family));const take=(list,n)=>{for(const q of list){if(n<=0||chosen.length>=limit)break;if(!ids.has(q.id)&&!families.has(family(q))){chosen.push(q);ids.add(q.id);families.add(family(q));n--}}};take(due,Math.round(limit*.5));take(weak.filter(q=>!dueFamilies.has(family(q))),Math.round(limit*.3));take(balanced,limit-chosen.length);take(due,limit);take(weak,limit);take(balanced,limit);return chosen;
}
export function daysUntil(date,now=new Date()){if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return null;const [y,m,d]=date.split('-').map(Number);const target=Date.UTC(y,m-1,d);if(new Date(target).toISOString().slice(0,10)!==date)return null;return Math.round((target-Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))/86400000)}
export function competitionPlan(c,questions,answers,region,now=new Date()){const pool=examEligible(questions,c.region||region,c.legislationIds,c.area,c.administrationScope||((c.region||region)==='Madeira'?'regional-ram':'central'),c.programme,now.getTime()),g=metrics(pool,answers,'law',now.getTime()),days=daysUntil(c.examDate,now);const unseen=g.reduce((s,x)=>s+x.total-x.seen,0);return {groups:g,days,total:pool.length,daily:days!==null&&days>=0?Math.min(40,Math.max(10,Math.ceil(unseen/Math.max(1,days)))):0};}


import {curriculum} from './data/curriculum.js';
import {eligible,administrationScope,buildSession,questionCurrent} from './engine.js';
export const difficultyNames={1:'Fundamentos',2:'Distinções',3:'Aplicação',4:'Casos complexos',5:'Desafio'};
export function learningState(questions,answers,profile,lawFilter=null,now=Date.now()){
 const pool=eligible(questions,profile.region,lawFilter,profile.area,administrationScope(profile),profile.programme,now),index=new Map(pool.map(q=>[q.id,q]));
 const ordered=answers.filter(a=>typeof a.correct==='boolean'&&Number.isFinite(Date.parse(a.answeredAt))).map((a,i)=>({...a,order:i})).sort((a,b)=>Date.parse(a.answeredAt)-Date.parse(b.answeredAt)||a.order-b.order);
 const latest=new Map(),firstCorrect=new Map();for(const a of ordered){latest.set(a.questionId,a);if(a.correct&&a.assisted!==true&&!firstCorrect.has(a.questionId))firstCorrect.set(a.questionId,a)}
 const units=curriculum.map(u=>{
  const items=u.questionIds.map(id=>index.get(id)).filter(Boolean);if(!items.length)return null;
  const ids=new Set(items.map(q=>q.id)),key=q=>u.familyLesson?(q.familyId||q.id):q.id,total=new Set(items.map(key)).size,seen=new Map();let passedAt=null;
  for(const a of ordered){if(!ids.has(a.questionId))continue;const familyKey=key(index.get(a.questionId));if(a.assisted!==true||!seen.has(familyKey))seen.set(familyKey,a.assisted!==true&&a.correct);if(!passedAt&&seen.size===total&&[...seen.values()].filter(Boolean).length>=Math.ceil(total*.8))passedAt=a.answeredAt}
  const correct=[...seen.values()].filter(Boolean).length;
  return {...u,questions:items,familyIndex:index,total,variantCount:items.length,seen:seen.size,correct,required:Math.ceil(total*.8),passed:Boolean(passedAt),passedAt,mastery:Math.round(100*correct/total)};
 }).filter(Boolean);
 let examNumber=0;for(const unit of units)if(unit.track==='exame')unit.displayTitle='Lição '+(++examNumber)+' · '+difficultyNames[unit.difficulty];
 const previous=new Map();for(const u of units){const key=u.track==='exame'?'exame':u.law+'|'+(u.track||'base');u.unlocked=u.passed||!previous.has(key)||previous.get(key).passed;previous.set(key,u)}
 const xp=pool.reduce((sum,q)=>sum+(firstCorrect.has(q.id)?10+2*q.difficulty:0),0),level=Math.floor(xp/200)+1;
 return {units,xp,level,nextLevelXP:200-(xp%200),completed:units.filter(u=>u.passed).length,total:units.length,latest,firstCorrect};
}
export function lessonSession(unit,answers,now=Date.now()){
 if(!unit?.unlocked)return [];
 const last=new Map(),lastFamily=new Map(),family=q=>q.familyId||q.id;
 for(const a of answers){const time=Date.parse(a.answeredAt);if(!Number.isFinite(time))continue;if(!last.has(a.questionId)||time>Date.parse(last.get(a.questionId).answeredAt))last.set(a.questionId,a);const q=unit.familyIndex?.get(a.questionId);if(q)lastFamily.set(family(q),Math.max(lastFamily.get(family(q))||0,time))}
 const available=unit.questions.filter(q=>questionCurrent(q,now)&&now-(unit.familyLesson?(lastFamily.get(family(q))||0):(last.has(q.id)?Date.parse(last.get(q.id).answeredAt):0))>=6*3600000);
 const day=Math.floor(now/86400000),hash=id=>{let h=day;for(const c of id)h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return h};
 const score=q=>!last.has(q.id)?0:last.get(q.id).correct?2:1;
 const sorted=available.sort((a,b)=>score(a)-score(b)||hash(a.id)-hash(b.id));
 if(!unit.familyLesson)return sorted;
 const used=new Set();return sorted.filter(q=>{const key=family(q);if(used.has(key))return false;used.add(key);return true});
}
export function dailyPathLesson(questions,answers,reviews,profile,lawFilter=null,now=Date.now(),limit=12){
 const units=learningState(questions,answers,profile,lawFilter,now).units.filter(u=>u.track==='exame'),unit=units.find(u=>u.unlocked&&!u.passed);
 if(!unit)return {unit:null,revision:true,questions:buildSession(questions,reviews,profile.region,limit,lawFilter,answers,{},profile.area,now,administrationScope(profile),profile.programme)};
 const chosen=lessonSession(unit,answers,now).slice(0,limit),families=new Set(chosen.map(q=>q.familyId||q.id)),index=new Map(questions.map(q=>[q.id,q]));
 const dueFamilies=new Set(reviews.filter(r=>Date.parse(r.dueAt)<=now).map(r=>{const q=index.get(r.questionId);return q?.familyId||r.questionId}));
 for(const prior of units.filter(u=>u.passed))for(const q of lessonSession(prior,answers,now)){
  if(chosen.length>=limit)break;const key=q.familyId||q.id;
  if(!families.has(key)&&dueFamilies.has(key)){chosen.push(q);families.add(key)}
 }
 return {unit,questions:chosen};
}
export function achievements(progress){return [{name:'Primeira unidade',earned:progress.completed>=1},{name:'Cinco unidades',earned:progress.completed>=5},{name:'Dez unidades',earned:progress.completed>=10},{name:'Desafio concluído',earned:progress.units.some(u=>u.difficulty===5&&u.passed)}]}

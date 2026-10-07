import {curriculum} from './data/curriculum.js';
import {eligible,administrationScope} from './engine.js';
export const difficultyNames={1:'Fundamentos',2:'Distinções',3:'Aplicação',4:'Casos complexos',5:'Desafio'};
export function learningState(questions,answers,profile,lawFilter=null){
 const pool=eligible(questions,profile.region,lawFilter,profile.area,administrationScope(profile),profile.programme),index=new Map(pool.map(q=>[q.id,q]));
 const ordered=answers.filter(a=>typeof a.correct==='boolean'&&Number.isFinite(Date.parse(a.answeredAt))).map((a,i)=>({...a,order:i})).sort((a,b)=>Date.parse(a.answeredAt)-Date.parse(b.answeredAt)||a.order-b.order);
 const latest=new Map(),firstCorrect=new Map();for(const a of ordered){latest.set(a.questionId,a);if(a.correct&&!firstCorrect.has(a.questionId))firstCorrect.set(a.questionId,a)}
 const units=curriculum.map(u=>{const items=u.questionIds.map(id=>index.get(id)).filter(Boolean);if(!items.length)return null;const ids=new Set(items.map(q=>q.id)),seen=new Map();let passedAt=null;for(const a of ordered){if(!ids.has(a.questionId))continue;seen.set(a.questionId,a.correct);if(!passedAt&&seen.size===items.length&&[...seen.values()].filter(Boolean).length>=Math.ceil(items.length*.8))passedAt=a.answeredAt}
 const correct=items.filter(q=>latest.get(q.id)?.correct).length;return {...u,questions:items,total:items.length,seen:items.filter(q=>latest.has(q.id)).length,correct,required:Math.ceil(items.length*.8),passed:Boolean(passedAt),passedAt,mastery:Math.round(100*correct/items.length)};
 }).filter(Boolean);
 const previous=new Map();for(const u of units){const key=u.law+'|'+(u.track||'base');u.unlocked=u.passed||!previous.has(key)||previous.get(key).passed;previous.set(key,u)}
 // XP is scoped to the visible curriculum and cannot be farmed by repetition.
 const xp=pool.reduce((s,q)=>s+(firstCorrect.has(q.id)?10+2*q.difficulty:0),0),level=Math.floor(xp/200)+1;
 return {units,xp,level,nextLevelXP:200-(xp%200),completed:units.filter(u=>u.passed).length,total:units.length,latest,firstCorrect};
}
export function lessonSession(unit,answers,now=Date.now()){
 if(!unit?.unlocked)return [];
 const last=new Map();for(const a of answers){const t=Date.parse(a.answeredAt);if(Number.isFinite(t)&&(!last.has(a.questionId)||t>Date.parse(last.get(a.questionId).answeredAt)))last.set(a.questionId,a)}
 return unit.questions.filter(q=>now-(last.has(q.id)?Date.parse(last.get(q.id).answeredAt):0)>=6*3600000)
 .sort((a,b)=>Number(last.get(a.id)?.correct===true)-Number(last.get(b.id)?.correct===true));
}
export function achievements(progress){return [{name:'Primeira unidade',earned:progress.completed>=1},{name:'Cinco unidades',earned:progress.completed>=5},{name:'Dez unidades',earned:progress.completed>=10},{name:'Desafio concluído',earned:progress.units.some(u=>u.difficulty===5&&u.passed)}]}

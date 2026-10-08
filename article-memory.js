import {examEligible,administrationScope} from './engine.js';

export function articleNumber(q){
 if(q.articleMemoryEligible===false||['point','annex'].includes(q.referenceKind))return '';
 const raw=String(q.articleNumber||q.article||'');
 return (raw.match(/\b(\d+(?:-[A-Z])?)\b/i)?.[1]||'').toUpperCase();
}
export function articleKey(q){const number=articleNumber(q);return number?`${q.law}:${number}`:null}
export function articleCards(questions,answers,profile,laws=null){
 const pool=examEligible(questions,profile.region,laws,profile.area,administrationScope(profile),profile.programme);
 const byId=new Map(pool.map(q=>[q.id,q])),cards=new Map();
 for(const a of answers){const q=byId.get(a.questionId),key=q&&articleKey(q);if(!key)continue;
  cards.set(key,{key,law:q.law,number:articleNumber(q),article:q.article,question:q,answeredAt:a.answeredAt});
 }
 return [...cards.values()];
}
export function dueArticleCards(cards,memory={},now=Date.now()){
 return cards.filter(c=>!memory[c.key]?.dueAt||Date.parse(memory[c.key].dueAt)<=now)
  .sort((a,b)=>(memory[a.key]?.streak||0)-(memory[b.key]?.streak||0)||Date.parse(a.answeredAt)-Date.parse(b.answeredAt));
}
export function checkArticle(input,card){
 const cleaned=String(input).trim().toUpperCase().replace(/^ART(?:IGO)?\.?\s*/,'').replace(/\.?(?:º|°)\.?$/,'').replace(/\s+/g,'');
 return cleaned===card.number;
}
export function nextArticleMemory(previous,correct,now=Date.now()){
 const streak=correct?(previous?.streak||0)+1:0;
 const days=correct?(streak===1?1:streak===2?3:Math.min(60,Math.round(3*Math.pow(2,streak-2)))):0.25;
 return {streak,attempts:(previous?.attempts||0)+1,lastResult:correct?'correct':'wrong',lastAnsweredAt:new Date(now).toISOString(),dueAt:new Date(now+days*86400000).toISOString()};
}
export function articlePrompt(q){
 return q.prompt.replace(/\b(?:art\.?|artigo)\s*\d+(?:-[A-Z])?(?:\s*\.?(?:º|°))?(?:,?\s*n\.?\s*º?\s*\d+)?/gi,'a norma');
}
